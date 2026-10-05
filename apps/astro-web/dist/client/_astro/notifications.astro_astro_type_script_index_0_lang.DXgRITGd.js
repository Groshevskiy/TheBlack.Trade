var e=`${window.location.protocol}//${window.location.hostname}:4000/api`,t=document.getElementById(`notice`),n=document.getElementById(`summary`),r=document.getElementById(`visibleCount`),i=document.getElementById(`notificationsList`),a=document.getElementById(`unreadQueue`),o=document.getElementById(`visibilityFilter`),s=document.getElementById(`searchFilter`),c=document.getElementById(`sortFilter`),l=document.getElementById(`insightTitle`),u=document.getElementById(`insightCopy`),d=[];function f(e=``){t.hidden=!e,t.textContent=e}var p=e=>e?new Date(e).toLocaleString(`ru-RU`,{dateStyle:`short`,timeStyle:`short`}):`—`,m=(e,t)=>`<span class="status-pill ${t}">${e}</span>`;async function h(t){let n=await fetch(`${e}${t}`),r=await n.json().catch(()=>null);if(!n.ok)throw Error(r?.message||`HTTP ${n.status}`);return r}function g(){let e=o.value,t=s.value.trim().toLowerCase(),n=c.value,r=[...d];return e===`unread`&&(r=r.filter(e=>e.isRead===!1||e.is_read===!1)),e===`read`&&(r=r.filter(e=>e.isRead===!0||e.is_read===!0)),t&&(r=r.filter(e=>[e.title,e.body,e.relatedEntityPublicId,e.related_entity_public_id,e.templateCode,e.template_code].filter(Boolean).join(` `).toLowerCase().includes(t))),r.sort((e,t)=>{let r=new Date(e.createdAt||0).getTime(),i=new Date(t.createdAt||0).getTime();return n===`recent_asc`?r-i:i-r}),r}function _(e){let t=e.filter(e=>e.isRead===!1||e.is_read===!1),n=e.filter(e=>e.relatedEntityPublicId||e.related_entity_public_id),r=Date.now()-864e5,i=e.filter(e=>new Date(e.createdAt||0).getTime()>=r);return document.getElementById(`statUnread`).textContent=String(t.length),document.getElementById(`statVisible`).textContent=String(g().length),document.getElementById(`statOrderLinked`).textContent=String(n.length),document.getElementById(`statRecent`).textContent=String(i.length),{unread:t,linked:n,recent:i}}function v(e,t){if(e.length>0){l.textContent=`Unread notifications should be reviewed first`,u.textContent=`The main priority is to process customer-facing updates that have not yet been read, especially those linked to active order flow.`;return}if(t.length>0){l.textContent=`Notification feed is up to date`,u.textContent=`The feed still contains historical updates, but there are no urgent unread items at the moment.`;return}l.textContent=`No notifications match the current view`,u.textContent=`Adjust the filters or wait for new events from customer lifecycle activity.`}function y(e){r.textContent=`${e.length} shown`,n.textContent=`${e.length} notifications in the current view`,i.innerHTML=e.length?e.map(e=>{let t=e.relatedEntityPublicId||e.related_entity_public_id,n=e.isRead===!1||e.is_read===!1;return`
          <article class="notification-card">
            <div class="notification-head">
              <div class="notification-title">
                <h4>${e.title||e.templateCode||e.template_code||`Notification`}</h4>
                <p>${p(e.createdAt)}</p>
              </div>
              ${m(n?`unread`:`read`,n?`unread`:`read`)}
            </div>
            <p>${e.body||`No message body.`}</p>
            ${t?`<a class="text-link" href="/orders/${t}">Open linked order</a>`:``}
          </article>
        `}).join(``):`<p class="empty">No notifications found for this filter.</p>`}function b(e){a.innerHTML=e.length?e.slice(0,5).map(e=>{let t=e.relatedEntityPublicId||e.related_entity_public_id;return`
          <article class="queue-item">
            <div class="queue-copy">
              <h4>${e.title||e.templateCode||e.template_code||`Notification`}</h4>
              <p>${e.body||`No message body.`}</p>
            </div>
            <div class="queue-meta">
              <span>${p(e.createdAt)}</span>
              ${t?`<a class="text-link" href="/orders/${t}">Order detail</a>`:``}
            </div>
          </article>
        `}).join(``):`<p class="empty">No unread notifications right now.</p>`}function x(){let e=g(),{unread:t}=_(d);y(e),b(t),v(t,e)}async function S(){let e=document.getElementById(`refresh`);e.disabled=!0,f(``);try{let e=await h(`/notifications`);d=Array.isArray(e?.items)?e.items:[],x()}catch(e){i.innerHTML=`<p class="empty">Unable to load notifications.</p>`,a.innerHTML=`<p class="empty">Unable to load unread queue.</p>`,f(e.message||`Failed to load notifications.`)}finally{e.disabled=!1}}[o,s,c].forEach(e=>{e.addEventListener(`input`,x),e.addEventListener(`change`,x)}),document.getElementById(`refresh`).addEventListener(`click`,S),S();