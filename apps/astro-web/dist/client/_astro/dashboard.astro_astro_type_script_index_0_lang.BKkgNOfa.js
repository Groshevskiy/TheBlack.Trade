var e=`${window.location.protocol}//${window.location.hostname}:4000/api`,t=document.getElementById(`notice`);function n(e=``){if(!e){t.hidden=!0,t.textContent=``;return}t.hidden=!1,t.textContent=e}async function r(t){let n=await fetch(`${e}${t}`),r=await n.json().catch(()=>null);if(!n.ok)throw Error(r?.message||`HTTP ${n.status}`);return r}function i(e){return e.statusCode||e.status_code||`draft`}function a(e,t){return`<span class="status-pill ${t}">${e}</span>`}function o(e=[]){let t=e.filter(e=>[`draft`,`awaiting_payment`,`payment_confirmed`,`processing`].includes(i(e))),n=e.filter(e=>[`draft`,`awaiting_payment`].includes(i(e)));return document.getElementById(`ordersOpen`).textContent=String(t.length),document.getElementById(`needsAction`).textContent=String(n.length),document.getElementById(`ordersList`).innerHTML=t.length?t.slice(0,5).map(e=>`
        <article class="feed-item">
          <div class="feed-meta">
            <h4>${e.publicId||e.public_id||`—`}</h4>
            ${a(i(e),i(e))}
          </div>
          <p>${e.directionCode||e.direction_code||`—`} · ${e.assetCode||e.asset_code||`—`}</p>
          <p>Updated ${new Date(e.updatedAt).toLocaleString(`ru-RU`,{dateStyle:`short`,timeStyle:`short`})}</p>
          <a class="text-link" href="/orders/${e.publicId||e.public_id}">Open detail</a>
        </article>
      `).join(``):`<p class="empty">No active orders found.</p>`,{activeItems:t,needsAction:n}}function s(e=[]){let t=e.filter(e=>e.isRead===!1||e.is_read===!1);return document.getElementById(`notificationsUnread`).textContent=String(t.length),document.getElementById(`notificationsList`).innerHTML=e.length?e.slice(0,4).map(e=>`
        <article class="feed-item">
          <div class="feed-meta">
            <h4>${e.title||e.templateCode||e.template_code||`Notification`}</h4>
            <span>${new Date(e.createdAt).toLocaleString(`ru-RU`,{dateStyle:`short`,timeStyle:`short`})}</span>
          </div>
          <p>${e.body||`No message body`}</p>
        </article>
      `).join(``):`<p class="empty">No recent notifications found.</p>`,t}function c(e=[]){document.getElementById(`walletsTotal`).textContent=String(e.length),document.getElementById(`walletsList`).innerHTML=e.length?e.slice(0,4).map(e=>`
        <article class="feed-item">
          <div class="feed-meta">
            <h4>${e.label||e.assetCode||e.asset_code||`Wallet`}</h4>
            <span>${e.networkCode||e.network_code||`—`}</span>
          </div>
          <p class="mono">${e.address||`—`}</p>
        </article>
      `).join(``):`<p class="empty">No wallets saved yet.</p>`}function l(e=[]){document.getElementById(`payoutsList`).innerHTML=e.length?e.slice(0,4).map(e=>`
        <article class="feed-item">
          <div class="feed-meta">
            <h4>${e.bankName||e.providerName||`Payout method`}</h4>
            <span>${e.fiatCurrencyCode||e.fiat_currency_code||`—`}</span>
          </div>
          <p>${e.recipientName||e.accountHolder||`Recipient not specified`}</p>
        </article>
      `).join(``):`<p class="empty">No payout requisites saved yet.</p>`}function u(e,t){let{activeItems:n,needsAction:r}=e,i=document.querySelector(`#focusMeta`)?.previousElementSibling?.querySelector(`h3`)||document.querySelector(`.insight-card h3`),a=document.getElementById(`focusCopy`),o=document.getElementById(`focusMeta`);if(r.length){i.textContent=`Customer action is the main blocker`,a.textContent=`At least one order still depends on payment or early customer follow-up before it can move deeper into execution.`,o.textContent=`${r.length} action items`;return}if(t.length){i.textContent=`Unread updates need review`,a.textContent=`There are no urgent payment blockers, but customer-facing updates still need visibility review to keep the lifecycle smooth.`,o.textContent=`${t.length} unread`;return}if(n.length){i.textContent=`Active lifecycle looks stable`,a.textContent=`Orders, saved destinations and customer updates look aligned well enough for routine execution.`,o.textContent=`${n.length} active orders`;return}i.textContent=`No active pressure points`,a.textContent=`There are currently no active orders in motion, so the cabinet is ready for the next customer request.`,o.textContent=`Ready`}async function d(){let e=document.getElementById(`refresh`);e.disabled=!0,n(``);try{let[e,t,n,i]=await Promise.all([r(`/auth/me/orders-summary`),r(`/notifications`),r(`/wallets`),r(`/payout-requisites`)]),a=Array.isArray(e?.items)?e.items:[],d=Array.isArray(t?.items)?t.items:[],f=Array.isArray(n?.items)?n.items:[],p=Array.isArray(i?.items)?i.items:[],m=o(a),h=s(d);c(f),l(p),u(m,h)}catch(e){n(e.message||`Failed to load dashboard data.`)}finally{e.disabled=!1}}document.getElementById(`refresh`).addEventListener(`click`,d),d();