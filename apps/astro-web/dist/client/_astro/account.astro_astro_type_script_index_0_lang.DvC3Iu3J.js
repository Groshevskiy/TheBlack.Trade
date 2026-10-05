var e=`${window.location.protocol}//${window.location.hostname}:4000/api`,t=document.getElementById(`identityCard`),n=document.getElementById(`assetsCard`),r=document.getElementById(`ordersCard`),i=document.getElementById(`notificationsCard`),a=document.getElementById(`notice`),o=document.getElementById(`refresh`),s=document.getElementById(`insightTitle`),c=document.getElementById(`insightCopy`),l=e=>e?new Date(e).toLocaleString(`ru-RU`,{dateStyle:`short`,timeStyle:`short`}):`—`,u=e=>e?`${String(e).slice(0,10)}…`:`—`,d=(e,t)=>`<span class="status-pill ${t}">${e}</span>`;function f(e=``){a.hidden=!e,a.textContent=e}function p(e){return e.statusCode||e.status_code||`draft`}async function m(t){let n=await fetch(`${e}${t}`),r=await n.json().catch(()=>null);if(!n.ok)throw Error(r?.message||`HTTP ${n.status}`);return r}function h(e,n){document.getElementById(`kycValue`).textContent=e.kycLevel||e.kyc_level||`—`,document.getElementById(`statusValue`).textContent=e.status||`—`,document.getElementById(`ordersValue`).textContent=String(n.totalOrders??n.orders??0),document.getElementById(`notificationsValue`).textContent=String(n.unreadNotifications??0),t.innerHTML=`
        <article class="feed-item">
          <div class="feed-meta"><strong>User ID</strong><span class="mono">${e.id||`—`}</span></div>
          <p>Email: ${e.email||`—`}</p>
          <p>Phone: ${e.phone||`—`}</p>
          <p>Telegram: ${e.telegram||`—`}</p>
          <p>Locale: ${e.locale||`—`}</p>
          <p>Joined: ${l(e.createdAt)}</p>
        </article>`}function g(e=[],t=[]){n.innerHTML=`
        <article class="feed-item">
          <h4>Saved wallets</h4>
          <p>${e.length} destinations stored for crypto settlement.</p>
          <p>${e[0]?`${e[0].assetCode||e[0].asset_code||`Asset`} · ${u(e[0].address)}`:`No wallets saved yet.`}</p>
        </article>
        <article class="feed-item">
          <h4>Payout methods</h4>
          <p>${t.length} fiat requisites stored for payouts.</p>
          <p>${t[0]?`${t[0].bankName||t[0].providerName||`Method`} · ${t[0].fiatCurrencyCode||t[0].fiat_currency_code||`—`}`:`No payout methods saved yet.`}</p>
        </article>`}function _(e=[]){if(!e.length){r.innerHTML=`<p class="empty">No customer orders available.</p>`;return}r.innerHTML=e.slice(0,5).map(e=>`
        <article class="feed-item">
          <div class="feed-meta">
            <h4>${e.publicId||e.public_id||`—`}</h4>
            ${d(p(e),p(e))}
          </div>
          <p>${e.directionCode||e.direction_code||`—`} · ${e.assetCode||e.asset_code||`—`}</p>
          <p>Updated ${l(e.updatedAt)}</p>
          <a class="text-link" href="/orders/${e.publicId||e.public_id}">Open detail</a>
        </article>
      `).join(``)}function v(e=[]){let t=e.filter(e=>e.isRead===!1||e.is_read===!1).slice(0,5);if(!t.length){i.innerHTML=`<p class="empty">No unread customer updates.</p>`;return}i.innerHTML=t.map(e=>`
        <article class="feed-item">
          <div class="feed-meta">
            <h4>${e.title||e.templateCode||e.template_code||`Notification`}</h4>
            <span>${l(e.createdAt)}</span>
          </div>
          <p>${e.body||`No message body`}</p>
        </article>
      `).join(``)}function y(e,t=[],n=[],r=[],i=[]){let a=i.filter(e=>e.isRead===!1||e.is_read===!1).length,o=r.filter(e=>[`draft`,`awaiting_payment`,`payment_confirmed`,`processing`].includes(p(e))).length;if(e.status&&e.status!==`active`){s.textContent=`Account status needs attention`,c.textContent=`The customer profile is not fully active, so operations should confirm account readiness before deep lifecycle progression.`;return}if((t.length===0||n.length===0)&&o>0){s.textContent=`Settlement profile is incomplete`,c.textContent=`There are active orders, but part of the saved settlement data is missing. Review wallets and payout methods before later order stages.`;return}if(a>0){s.textContent=`Unread updates remain open`,c.textContent=`The account is otherwise healthy, but unread customer-facing notifications still need review to maintain good lifecycle visibility.`;return}s.textContent=`Customer profile is in good shape`,c.textContent=`Identity, settlement details and lifecycle activity look connected well enough for smooth customer operations.`}async function b(){o.disabled=!0,f(``);try{let[e,t,n,r,i]=await Promise.all([m(`/auth/me/summary`),m(`/auth/me/orders-summary`),m(`/wallets`),m(`/payout-requisites`),m(`/notifications`)]),a=e?.user||e?.item?.user||{},o=e?.metrics||e?.item?.metrics||{},s=Array.isArray(t?.items)?t.items:[],c=Array.isArray(n?.items)?n.items:[],l=Array.isArray(r?.items)?r.items:[],u=Array.isArray(i?.items)?i.items:[];h(a,o),g(c,l),_(s),v(u),y(a,c,l,s,u)}catch(e){t.innerHTML=`<p class="empty">Unable to load profile.</p>`,n.innerHTML=`<p class="empty">Unable to load saved destinations.</p>`,r.innerHTML=`<p class="empty">Unable to load order activity.</p>`,i.innerHTML=`<p class="empty">Unable to load notifications.</p>`,f(e.message||`Failed to load account overview.`)}finally{o.disabled=!1}}o.addEventListener(`click`,b),b();