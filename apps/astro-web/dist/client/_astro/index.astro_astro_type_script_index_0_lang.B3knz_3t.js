var e=`${window.location.protocol}//${window.location.hostname}:4000/api`,t=document.getElementById(`ordersList`),n=document.getElementById(`priorityList`),r=document.getElementById(`statusFilter`),i=document.getElementById(`searchFilter`),a=document.getElementById(`sortFilter`),o=document.getElementById(`summary`),s=document.getElementById(`visibleCount`),c=document.getElementById(`notice`),l=document.getElementById(`insightTitle`),u=document.getElementById(`insightCopy`),d=document.getElementById(`refresh`),f=[],p=(e,t=2)=>Number(e??0).toLocaleString(`en-US`,{maximumFractionDigits:t}),m=e=>e?new Date(e).toLocaleString(`ru-RU`,{dateStyle:`short`,timeStyle:`short`}):`—`;function h(e=``){if(!e){c.hidden=!0,c.textContent=``;return}c.hidden=!1,c.textContent=e}function g(e){return e.statusCode||e.status_code||`draft`}function _(e){return e.publicId||e.public_id||`—`}function v(e){return e.some(e=>g(e)===`awaiting_payment`)?{title:`Customer payment is the top priority`,copy:`At least one visible order is waiting for fiat payment. Open it first and guide the customer to upload proof or finish the transfer.`}:e.some(e=>g(e)===`payment_confirmed`||g(e)===`processing`)?{title:`Processing is underway`,copy:`Use the detail flow to monitor execution and recent notifications for active orders already moving through operations.`}:e.some(e=>g(e)===`draft`)?{title:`Fresh drafts are available`,copy:`Draft orders were recently created. Review quote details and move into the next payment step from the detail page.`}:e.some(e=>g(e)===`completed`)?{title:`Completed orders dominate the list`,copy:`Most visible items are closed successfully. Use them as reference cases or a support audit trail.`}:{title:`No urgent customer action detected`,copy:`The current filter result does not show an immediately actionable lifecycle state.`}}function y(e){let t=e.length,n=e.filter(e=>g(e)===`completed`).length,r=e.filter(e=>[`draft`,`awaiting_payment`,`payment_confirmed`,`processing`].includes(g(e))).length,i=e.filter(e=>[`draft`,`awaiting_payment`].includes(g(e))).length;document.getElementById(`stat-total`).textContent=String(t),document.getElementById(`stat-open`).textContent=String(r),document.getElementById(`stat-completed`).textContent=String(n),document.getElementById(`stat-action`).textContent=String(i)}function b(){let e=r.value,t=i.value.trim().toLowerCase(),n=a.value,c=f.filter(n=>{let r=e===`all`||g(n)===e,i=[n.publicId,n.assetCode,n.asset_code,n.networkCode,n.network_code,n.directionCode,n.direction_code].filter(Boolean).join(` `).toLowerCase(),a=!t||i.includes(t);return r&&a});c=c.sort((e,t)=>n===`updated_asc`?new Date(e.updatedAt||0)-new Date(t.updatedAt||0):n===`fiat_desc`?Number(t.fiatAmount||t.fiat_amount||0)-Number(e.fiatAmount||e.fiat_amount||0):n===`fiat_asc`?Number(e.fiatAmount||e.fiat_amount||0)-Number(t.fiatAmount||t.fiat_amount||0):new Date(t.updatedAt||0)-new Date(e.updatedAt||0)),S(c),x(c),y(c),o.textContent=`${c.length} visible of ${f.length} total`,s.textContent=`${c.length} shown`;let d=v(c);l.textContent=d.title,u.textContent=d.copy}function x(e){let t=e.filter(e=>[`awaiting_payment`,`draft`,`payment_confirmed`,`processing`].includes(g(e))).slice(0,4);if(!t.length){n.innerHTML=`<p class="empty">No orders in the priority queue for the current filter.</p>`;return}n.innerHTML=t.map(e=>`
        <div class="priority-item">
          <div class="priority-copy">
            <strong>${_(e)}</strong>
            <p>${g(e)} · ${e.directionCode||e.direction_code||`—`}</p>
            <p>${p(e.fiatAmount||e.fiat_amount,2)} fiat · updated ${m(e.updatedAt)}</p>
          </div>
          <a href="/orders/${_(e)}">Open</a>
        </div>
      `).join(``)}function S(e){if(!e.length){t.innerHTML=`<p class="empty">No orders match the current filters.</p>`;return}t.innerHTML=e.map(e=>{let t=g(e),n=_(e),r=e.directionCode||e.direction_code||`—`,i=e.assetCode||e.asset_code||`—`,a=e.networkCode||e.network_code||`—`,o=p(e.fiatAmount||e.fiat_amount,2),s=p(e.cryptoAmount||e.crypto_amount,8),c=p(e.rate,6),l=t===`awaiting_payment`?`Customer should complete payment and submit proof.`:t===`draft`?`Recently created order waiting for first action.`:t===`processing`?`Execution is in progress.`:t===`completed`?`Lifecycle closed successfully.`:`Open detail page for full lifecycle context.`;return`
          <article class="order-card">
            <div class="order-head">
              <div class="order-copy">
                <h4 class="mono">${n}</h4>
                <p>${r} · ${i} via ${a}</p>
              </div>
              <span class="status ${t}">${t}</span>
            </div>
            <div class="amounts">
              <div><span>Fiat</span><strong>${o}</strong></div>
              <div><span>Crypto</span><strong>${s}</strong></div>
              <div><span>Rate</span><strong>${c}</strong></div>
            </div>
            <div class="order-meta">
              <div class="meta-line">
                <span>Updated: ${m(e.updatedAt)}</span>
                <span>Created: ${m(e.createdAt)}</span>
              </div>
              <span class="tiny">${l}</span>
            </div>
            <div class="cta-row">
              <span class="tiny">Open the detail view for timeline, actions, notifications and documents.</span>
              <a href="/orders/${n}">Open detail</a>
            </div>
          </article>
        `}).join(``)}async function C(){d.disabled=!0,o.textContent=`Loading orders…`,h(``);try{let t=await fetch(`${e}/auth/me/orders-summary`,{headers:{"Content-Type":`application/json`}}),n=await t.json().catch(()=>null);if(!t.ok)throw Error(n?.message||`HTTP ${t.status}`);f=Array.isArray(n?.items)?n.items:[],b()}catch(e){t.innerHTML=`<p class="empty">Unable to load customer orders.</p>`,n.innerHTML=`<p class="empty">Unable to load priority queue.</p>`,o.textContent=`Load failed`,h(e.message||`Failed to load orders.`)}finally{d.disabled=!1}}r.addEventListener(`change`,b),i.addEventListener(`input`,b),a.addEventListener(`change`,b),d.addEventListener(`click`,C),C();