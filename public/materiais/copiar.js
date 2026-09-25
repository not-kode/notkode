function copiar(txt){
  const done=()=>{const t=document.querySelector('.toast');t.classList.add('on');setTimeout(()=>t.classList.remove('on'),1400)};
  if(navigator.clipboard){navigator.clipboard.writeText(txt).then(done).catch(()=>fallback(txt,done))}else fallback(txt,done);
}
function fallback(txt,done){const a=document.createElement('textarea');a.value=txt;document.body.appendChild(a);a.select();try{document.execCommand('copy');done()}catch(e){}a.remove()}
document.querySelectorAll('.win').forEach(w=>{const b=w.querySelector('button');if(b)b.onclick=()=>copiar(w.querySelector('pre').innerText)});
document.querySelectorAll('.cmd code').forEach(c=>c.onclick=()=>copiar(c.innerText));

// Visita e cópias entram no mesmo tracking do site (/api/track, tabela events),
// com as mesmas chaves de sessão do analytics.tsx. Aparelho marcado com
// ?nk=interno não conta. À prova de falhas: erro nunca afeta a página.
(function(){
  try{
    if(navigator.webdriver)return;
    const q=new URLSearchParams(location.search);
    if(q.get('nk')==='interno')localStorage.setItem('nk_internal','1');
    else if(q.get('nk')==='externo')localStorage.removeItem('nk_internal');
    if(localStorage.getItem('nk_internal')==='1')return;
    let sid=sessionStorage.getItem('nk_sid');
    if(!sid){sid=(crypto.randomUUID&&crypto.randomUUID())||Date.now()+'-'+String(Math.random()).slice(2,10);sessionStorage.setItem('nk_sid',sid)}
    const utm={};['utm_source','utm_medium','utm_campaign','utm_term','utm_content'].forEach(f=>{const v=q.get(f);if(v)utm[f]=v});
    let ref='';try{if(document.referrer&&new URL(document.referrer).host!==location.host)ref=document.referrer}catch(e){}
    const send=p=>{try{const body=JSON.stringify(Object.assign({},p,{page:location.pathname,session_id:sid,referrer:ref},utm));
      if(!(navigator.sendBeacon&&navigator.sendBeacon('/api/track',new Blob([body],{type:'application/json'}))))
        fetch('/api/track',{method:'POST',body,headers:{'Content-Type':'application/json'},keepalive:true}).catch(()=>{})}catch(e){}};
    send({type:'page_view'});
    document.addEventListener('click',e=>{
      const b=e.target.closest&&e.target.closest('.bar button');
      const c=e.target.closest&&e.target.closest('.cmd code');
      if(b)send({type:'cta_click',label:'copiar: '+b.parentNode.querySelector('span').innerText});
      else if(c)send({type:'cta_click',label:'copiar: '+c.innerText});
    },true);
  }catch(e){}
})();
