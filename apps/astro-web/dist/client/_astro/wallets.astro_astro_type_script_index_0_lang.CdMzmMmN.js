var e=`${window.location.protocol}//${window.location.hostname}:4000/api`,t=document.getElementById(`walletLabel`),n=document.getElementById(`payoutLabel`),r=document.getElementById(`walletsList`),i=document.getElementById(`payoutsList`),a=document.getElementById(`ordersList`),o=document.getElementById(`notice`),s=document.getElementById(`refresh`),c=document.getElementById(`insightTitle`),l=document.getElementById(`insightCopy`),u=e=>e?`${String(e).slice(0,11)}…${String(e).slice(-6)}`:`—`,d=e=>e?new Date(e).toLocaleString(`ru-RU`,{dateStyle:`short`,timeStyle:`short`}):`—`,f=(e,t)=>`<span class="status-pill ${t}">${e}</span>`;function p(e=``){o.hidden=!e,o.textContent=e}function m(e){return e.statusCode||e.status_code||`draft`}function h(e=[],n={}){let i=n.metrics||{};document.getElementById(`walletCount`).textContent=String(i.total??e.length),document.getElementById(`verifiedCount`).textContent=String(i.verified??e.filter(e=>e.isVerified||e.is_verified).length),t.textContent=`${e.length} saved · ${i.networks??0} networks`,r.innerHTML=e.length?e.map(e=>`
        <article class="feed-item">
          <div class="feed-meta">
            <h4>${e.label||e.assetCode||e.asset_code||`Wallet`}</h4>
            ${f(e.isVerified||e.is_verified?`verified`:`unverified`,e.isVerified||e.is_verified?`good`:`warn`)}
          </div>
          <p>${e.assetCode||e.asset_code||`—`} · ${e.networkCode||e.network_code||`—`}</p>
          <p class="mono">${u(e.address)}</p>
          <p>Added ${d(e.createdAt)}</p>
        </article>
      `).join(``):`<p class="empty">No saved wallets yet.</p>`}function g(e=[]){document.getElementById(`payoutCount`).textContent=String(e.length),n.textContent=`${e.length} saved methods`,i.innerHTML=e.length?e.map(e=>`
        <article class="feed-item">
          <div class="feed-meta">
            <h4>${e.bankName||e.providerName||`Payout method`}</h4>
            ${f(e.fiatCurrencyCode||e.fiat_currency_code||`—`,`neutral`)}
          </div>
          <p>${e.recipientName||e.accountHolder||`Recipient not specified`}</p>
          <p class="mono">${e.maskedAccountNumber||e.masked_details||e.phoneNumber||`—`}</p>
          <p>Updated ${d(e.updatedAt||e.createdAt)}</p>
        </article>
      `).join(``):`<p class="empty">No payout requisites saved.</p>`}function _(e=[]){let t=e.filter(e=>[`draft`,`awaiting_payment`,`payment_confirmed`,`processing`].includes(m(e)));document.getElementById(`ordersCount`).textContent=String(t.length),a.innerHTML=t.length?t.slice(0,4).map(e=>`
        <article class="feed-item">
          <div class="feed-meta">
            <h4>${e.publicId||e.public_id||`—`}</h4>
            ${f(m(e),`neutral`)}
          </div>
          <p>${e.directionCode||e.direction_code||`—`} · ${e.assetCode||e.asset_code||`—`}</p>
          <p>Updated ${d(e.updatedAt)}</p>
          <a class="text-link" href="/orders/${e.publicId||e.public_id}">Open detail</a>
        </article>
      `).join(``):`<p class="empty">No active orders currently rely on saved settlement details.</p>`}function v(e=[],t=[],n=[]){if(n.filter(e=>[`draft`,`awaiting_payment`,`payment_confirmed`,`processing`].includes(m(e))).length&&(!e.length||!t.length)){c.textContent=`Settlement setup looks incomplete`,l.textContent=`There are active orders, but one of the settlement destination groups is sparse. Review wallets and payout methods before execution reaches the final stage.`;return}if(e.length&&t.length){c.textContent=`Settlement profile is ready`,l.textContent=`The customer already has both crypto wallets and fiat payout details saved, which reduces friction for future lifecycle steps.`;return}if(e.length||t.length){c.textContent=`Partial settlement data available`,l.textContent=`Only one side of the settlement profile is populated. Use this screen to understand which destination type still needs attention.`;return}c.textContent=`No settlement details saved yet`,l.textContent=`The customer has not saved wallets or payout methods yet. Future onboarding work should start here before heavy order activity begins.`}async function y(t){let n=await fetch(`${e}${t}`),r=await n.json().catch(()=>null);if(!n.ok)throw Error(r?.message||`HTTP ${n.status}`);return r}async function b(){s.disabled=!0,p(``);try{let[e,t,n,r]=await Promise.all([y(`/wallets/summary`),y(`/wallets`),y(`/payout-requisites`),y(`/auth/me/orders-summary`)]),i=Array.isArray(t?.items)?t.items:[],a=Array.isArray(n?.items)?n.items:[],o=Array.isArray(r?.items)?r.items:[];h(i,e||{}),g(a),_(o),v(i,a,o)}catch(e){r.innerHTML=`<p class="empty">Unable to load wallets.</p>`,i.innerHTML=`<p class="empty">Unable to load payout methods.</p>`,a.innerHTML=`<p class="empty">Unable to load lifecycle context.</p>`,p(e.message||`Failed to load settlement destinations.`)}finally{s.disabled=!1}}s.addEventListener(`click`,b),b();