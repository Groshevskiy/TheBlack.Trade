import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { and, eq, isNull, or } from 'drizzle-orm';
import { createHash, pbkdf2Sync, randomBytes, timingSafeEqual } from 'node:crypto';
import { db } from '../../db/index.js';
import { tbUserSessions, tbUsers } from '../../db/schema.js';
import { LoginSchema, LogoutSchema, RegisterSchema, type LoginInput, type LogoutInput, type RegisterInput } from './auth.dto.js';
import type { AuthenticatedUser } from './auth.types.js';

const ACCESS_TOKEN_TTL_SECONDS = 60 * 60;
const REFRESH_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 30;

@Injectable()
export class AuthService {
  private readonly accessTokenSecret = process.env.AUTH_ACCESS_TOKEN_SECRET || 'dev-access-token-secret';

  private hashPassword(password: string) {
    const salt = randomBytes(16).toString('hex');
    const hash = pbkdf2Sync(password, salt, 310000, 32, 'sha256').toString('hex');
    return `pbkdf2$310000$${salt}$${hash}`;
  }

  private verifyPassword(password: string, storedHash: string) {
    const [algorithm, iterationsValue, salt, expectedHash] = storedHash.split('$');
    if (algorithm !== 'pbkdf2' || !iterationsValue || !salt || !expectedHash) {
      return false;
    }

    const calculated = pbkdf2Sync(password, salt, Number(iterationsValue), 32, 'sha256');
    const expected = Buffer.from(expectedHash, 'hex');
    if (calculated.length !== expected.length) {
      return false;
    }

    return timingSafeEqual(calculated, expected);
  }

  private toBase64Url(input: Buffer | string) {
    return Buffer.from(input).toString('base64url');
  }

  private createSignedToken(payload: Record<string, unknown>) {
    const header = this.toBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const body = this.toBase64Url(JSON.stringify(payload));
    const signature = createHash('sha256').update(`${header}.${body}.${this.accessTokenSecret}`).digest('base64url');
    return `${header}.${body}.${signature}`;
  }

  private parseSignedToken(token: string) {
    const [header, body, signature] = token.split('.');
    if (!header || !body || !signature) {
      throw new UnauthorizedException({ message: 'Invalid access token' });
    }

    const expectedSignature = createHash('sha256').update(`${header}.${body}.${this.accessTokenSecret}`).digest('base64url');
    const actual = Buffer.from(signature);
    const expected = Buffer.from(expectedSignature);

    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
      throw new UnauthorizedException({ message: 'Invalid access token signature' });
    }

    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as Record<string, unknown>;
    const exp = typeof payload.exp === 'number' ? payload.exp : 0;
    if (exp * 1000 <= Date.now()) {
      throw new UnauthorizedException({ message: 'Access token expired' });
    }

    return payload;
  }

  private tokenHash(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private issueRefreshToken() {
    return randomBytes(48).toString('base64url');
  }

  private async buildAuthPayload(userId: string, sessionId: string | null = null) {
    const [user] = await db.select().from(tbUsers).where(eq(tbUsers.id, userId)).limit(1);
    if (!user) {
      throw new UnauthorizedException({ message: 'User not found' });
    }

    const now = Math.floor(Date.now() / 1000);
    const accessToken = this.createSignedToken({ sub: user.id, role: user.role, email: user.email, sid: sessionId, exp: now + ACCESS_TOKEN_TTL_SECONDS });

    return {
      accessToken,
      user: this.toUserSummary(user),
    };
  }

  toUserSummary(user: typeof tbUsers.$inferSelect) {
    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      telegram: user.telegram,
      locale: user.locale,
      role: user.role,
      status: user.status,
      kyc_level: user.kycLevel,
      is_email_verified: user.isEmailVerified,
      last_login_at: user.lastLoginAt,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    };
  }

  async register(input: RegisterInput) {
    const data = RegisterSchema.parse(input);
    const existing = await db.select().from(tbUsers).where(eq(tbUsers.email, data.email)).limit(1);
    if (existing[0]) {
      throw new BadRequestException({ message: 'Email is already registered' });
    }

    const [createdUser] = await db.insert(tbUsers).values({
      email: data.email,
      passwordHash: this.hashPassword(data.password),
      locale: data.locale ?? 'ru',
      phone: data.phone ?? null,
      telegram: data.telegram ?? null,
      role: data.role ?? 'customer',
      status: 'active',
      kycLevel: 'not_started',
      isEmailVerified: false,
    }).returning();

    const refreshToken = this.issueRefreshToken();
    const refreshExpiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000);
    const [session] = await db.insert(tbUserSessions).values({
      userId: createdUser.id,
      tokenHash: this.tokenHash(refreshToken),
      expiresAt: refreshExpiresAt,
    }).returning();

    const payload = await this.buildAuthPayload(createdUser.id, session.id);

    return {
      item: {
        ...payload.user,
        access_token: payload.accessToken,
        refresh_token: refreshToken,
        token_type: 'Bearer',
        expires_in: ACCESS_TOKEN_TTL_SECONDS,
      },
    };
  }

  async login(input: LoginInput) {
    const data = LoginSchema.parse(input);
    const [user] = await db.select().from(tbUsers).where(eq(tbUsers.email, data.email)).limit(1);

    if (!user?.passwordHash || !this.verifyPassword(data.password, user.passwordHash)) {
      throw new UnauthorizedException({ message: 'Invalid email or password' });
    }

    await db.update(tbUsers).set({ lastLoginAt: new Date(), updatedAt: new Date() }).where(eq(tbUsers.id, user.id));

    const refreshToken = this.issueRefreshToken();
    const refreshExpiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000);
    const [session] = await db.insert(tbUserSessions).values({
      userId: user.id,
      tokenHash: this.tokenHash(refreshToken),
      expiresAt: refreshExpiresAt,
    }).returning();

    const payload = await this.buildAuthPayload(user.id, session.id);

    return {
      item: {
        ...payload.user,
        access_token: payload.accessToken,
        refresh_token: refreshToken,
        token_type: 'Bearer',
        expires_in: ACCESS_TOKEN_TTL_SECONDS,
      },
    };
  }

  async logout(input: LogoutInput) {
    const data = LogoutSchema.parse(input);
    const now = new Date();
    const [session] = await db.select().from(tbUserSessions).where(and(eq(tbUserSessions.tokenHash, this.tokenHash(data.refreshToken)), isNull(tbUserSessions.revokedAt))).limit(1);

    if (!session) {
      return { item: { success: true } };
    }

    await db.update(tbUserSessions).set({ revokedAt: now }).where(eq(tbUserSessions.id, session.id));
    return { item: { success: true } };
  }

  async verifyAccessToken(token: string): Promise<AuthenticatedUser> {
    const payload = this.parseSignedToken(token);
    const userId = typeof payload.sub === 'string' ? payload.sub : null;
    const sessionId = typeof payload.sid === 'string' ? payload.sid : null;

    if (!userId) {
      throw new UnauthorizedException({ message: 'Invalid access token subject' });
    }

    if (sessionId) {
      const [session] = await db.select().from(tbUserSessions).where(and(eq(tbUserSessions.id, sessionId), isNull(tbUserSessions.revokedAt))).limit(1);
      if (!session || session.expiresAt.getTime() <= Date.now()) {
        throw new UnauthorizedException({ message: 'Session is not active' });
      }
    }

    const [user] = await db.select().from(tbUsers).where(and(eq(tbUsers.id, userId), or(eq(tbUsers.status, 'active'), isNull(tbUsers.status)))).limit(1);
    if (!user) {
      throw new UnauthorizedException({ message: 'User is not active' });
    }

    return {
      id: user.id,
      email: user.email ?? null,
      role: user.role,
      sessionId,
    };
  }

  async getMe(userId: string) {
    const [user] = await db.select().from(tbUsers).where(eq(tbUsers.id, userId)).limit(1);
    if (!user) {
      throw new UnauthorizedException({ message: 'User not found' });
    }

    return { item: this.toUserSummary(user) };
  }
}
