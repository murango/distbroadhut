/* Broadhut desktop. Pages, titles and addresses come from window.__PAGES (built from src/data/pages.json). */
const PAGES=window.__PAGES||{};
const PATH2ID={};Object.keys(PAGES).forEach(k=>{PATH2ID[PAGES[k][0]]=k});
const HOME_TITLE=document.title.indexOf('|')>-1&&!PATH2ID[location.pathname]?document.title:'Broadhut Studio | Enterprise Engineering & Business Systems';
const WIN_LOADING={};
function loadWin(id){
  if(WIN_LOADING[id])return WIN_LOADING[id];
  const p=fetch('/w/'+id+'.html').then(r=>{if(!r.ok)throw new Error(r.status);return r.text()}).then(html=>{
    document.getElementById('windows').insertAdjacentHTML('beforeend',html);
    onWinLoaded(id);
  });
  p.catch(()=>{delete WIN_LOADING[id]});
  WIN_LOADING[id]=p;return p;
}
function onWinLoaded(id){
  if(typeof renderProject==='function')renderProject();
  if(id==='healthcheck')hcRender();
  if(id==='explorer')expRender(expH[expI]);
  if(tallyLoaded&&window.Tally&&Tally.loadEmbeds)Tally.loadEmbeds();
}
function setUrl(id,opts){
  const pg=PAGES[id];if(!pg)return;
  document.title=pg[1];
  if(opts&&opts.pop)return;
  if(location.pathname!==pg[0])history.pushState({win:id},'',pg[0]);
}

(function(){
  try{
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.innerWidth <= 640) return;
    if (document.body.getAttribute('data-open')) return;
  }catch(e){}

  function runCue(){
    const cursor=document.getElementById('cueCursor');
    const target=document.getElementById('cueTargetCRM');
    const startBtn=document.querySelector('.hero-cta[aria-label="Tell us about your business"]');
    if(!cursor||!target||!startBtn)return;
    const sRect=startBtn.getBoundingClientRect();
    const sx=sRect.left+sRect.width/2, sy=sRect.top+sRect.height/2;
    cursor.style.transition='none';
    cursor.style.left=sx+'px';cursor.style.top=sy+'px';
    void cursor.offsetWidth;
    cursor.style.transition='';
    cursor.classList.add('show');
    setTimeout(()=>{
      const tRect=target.getBoundingClientRect();
      cursor.style.left=(tRect.left+tRect.width/2)+'px';
      cursor.style.top=(tRect.top+tRect.height/2)+'px';
    },350);
    setTimeout(()=>{
      cursor.classList.add('pulse');
      target.classList.add('cue-target-hit');
      setTimeout(()=>{cursor.classList.remove('show');target.classList.remove('cue-target-hit');},550);
      setTimeout(()=>{cursor.classList.remove('pulse');},950);
    },1300);
  }
  if(document.readyState==='complete'){setTimeout(runCue,1400);}
  else{window.addEventListener('load',()=>setTimeout(runCue,1400));}
})();
/* The mouse on the desk: left-click and right-click each open a menu, like a real mouse */
(function(){
  var hit=document.getElementById('mouseHit');if(!hit)return;
  var menu=null;
  var LEFT=[['🩺','Business Health Check',function(){openWin('healthcheck')}],
    ['💬','Tell us about your business',function(){openWin('pricing')}],
    ['🧩','How our services connect',function(){openWin('orgchart')}],
    ['📄','Case studies',function(){openWin('casestudy')}],
    ['💡',"What you're getting",function(){openWin('whyus')}]];
  var RIGHT=[['🖱️','Take a quick tour',function(){window.runTour&&window.runTour()}],
    ['🔍','Search…',function(){openSpot()}],
    ['🔠','Text size…',function(){uzToggle()}],
    ['🌓','Switch light / dark',function(){toggleTheme()}],
    'sep',
    ['🗺️','Site map',function(){location.href='/site-map/'}],
    ['✉️','Contact us',function(){openWin('contact')}]];
  function close(){if(menu){menu.remove();menu=null}}
  function show(title,items,x,y){
    close();
    var m=document.createElement('div');m.className='ctx-menu';m.setAttribute('role','menu');m.setAttribute('aria-label',title);
    var t=document.createElement('div');t.className='ctx-title';t.textContent=title;m.appendChild(t);
    items.forEach(function(it){
      if(it==='sep'){var s=document.createElement('div');s.className='ctx-sep';m.appendChild(s);return}
      var b=document.createElement('button');b.type='button';b.className='ctx-item';b.setAttribute('role','menuitem');
      var i=document.createElement('span');i.className='ctx-ic';i.textContent=it[0];
      var l=document.createElement('span');l.textContent=it[1];
      b.append(i,l);b.addEventListener('click',function(){close();it[2]()});m.appendChild(b);
    });
    document.body.appendChild(m);
    var w=m.offsetWidth,h=m.offsetHeight,W=window.innerWidth,H=window.innerHeight;
    var px=x,py=y;
    if(px+w>W-8)px=x-w;             /* flip left when there is no room, like a real context menu */
    if(py+h>H-8)py=y-h;             /* flip up */
    m.style.left=Math.max(8,px)+'px';m.style.top=Math.max(34,py)+'px';
    menu=m;var f=m.querySelector('.ctx-item');if(f)f.focus();
  }
  function at(e){
    var r=hit.getBoundingClientRect();
    return (e&&(e.clientX||e.clientY))?[e.clientX,e.clientY]:[r.left+r.width/2,r.top+r.height/2];
  }
  hit.addEventListener('click',function(e){e.preventDefault();var p=at(e);show('Quick start',LEFT,p[0],p[1])});
  hit.addEventListener('contextmenu',function(e){e.preventDefault();var p=at(e);show('Options',RIGHT,p[0],p[1])});
  document.addEventListener('mousedown',function(e){if(menu&&!menu.contains(e.target))close()},true);
  document.addEventListener('keydown',function(e){
    if(!menu)return;
    if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();close();hit.focus();return}
    if(e.key==='ArrowDown'||e.key==='ArrowUp'){
      e.preventDefault();var it=[].slice.call(menu.querySelectorAll('.ctx-item')),i=it.indexOf(document.activeElement);
      it[(i+(e.key==='ArrowDown'?1:-1)+it.length)%it.length].focus();
    }
  },true);
  window.addEventListener('resize',close);window.addEventListener('blur',close);
})();
(function(){
  var REDUCED=!!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var running=false,timers=[];
  function wide(){return window.innerWidth>640}
  function stop(){
    timers.forEach(clearTimeout);timers=[];running=false;
    var c=document.getElementById('cueCursor');if(c){c.classList.remove('show');c.classList.remove('pulse')}
    document.querySelectorAll('.tour-open').forEach(function(x){x.classList.remove('tour-open')});
  }
  function placeMouseHit(){
    var svg=document.querySelector('.wallpaper svg'),hit=document.getElementById('mouseHit');
    if(!svg||!hit)return;
    var r=svg.getBoundingClientRect(),s=Math.max(r.width/1440,r.height/820);
    var ox=(r.width-1440*s)/2,oy=(r.height-820*s)/2;
    var w=84*s,h=110*s,cx=1302,cy=615;
    hit.style.width=w+'px';hit.style.height=h+'px';
    hit.style.left=(r.left+ox+cx*s-w/2)+'px';hit.style.top=(r.top+oy+cy*s-h/2)+'px';
  }
  window.runTour=function(){
    if(REDUCED||!wide()||running)return;
    var cursor=document.getElementById('cueCursor'),hit=document.getElementById('mouseHit');
    var pref=['Services','Our Work','Pricing','About Us','Help'];
    var all=Array.prototype.slice.call(document.querySelectorAll('.mb-menu > .mb-item.has-drop')).filter(function(i){return i.querySelector('.mb-drop')});
    var items=pref.map(function(n){return all.find(function(i){return i.textContent.trim().indexOf(n)===0})}).filter(Boolean);
    if(!cursor||!items.length)return;
    running=true;
    function at(x,y){cursor.style.left=x+'px';cursor.style.top=y+'px'}
    var hr=hit?hit.getBoundingClientRect():{left:window.innerWidth-120,top:window.innerHeight-220,width:0,height:0};
    cursor.style.transition='none';at(hr.left+hr.width/2,hr.top+hr.height/2);void cursor.offsetWidth;cursor.style.transition='';
    cursor.classList.add('show');
    var t=400;
    items.forEach(function(it){
      var r=it.getBoundingClientRect();
      timers.push(setTimeout(function(){at(r.left+r.width/2,r.top+r.height/2)},t));t+=1000;
      timers.push(setTimeout(function(){cursor.classList.remove('pulse');void cursor.offsetWidth;cursor.classList.add('pulse');it.classList.add('tour-open')},t));t+=2000;
      timers.push(setTimeout(function(){it.classList.remove('tour-open')},t));
    });
    timers.push(setTimeout(stop,t+300));
  };
  document.addEventListener('mousedown',function(e){if(running&&!(e.target.closest&&e.target.closest('#mouseHit')))stop()},true);
  document.addEventListener('keydown',function(){if(running)stop()},true);
  placeMouseHit();window.addEventListener('resize',placeMouseHit);window.addEventListener('load',placeMouseHit);
})();

;

(function(){
  const el=document.getElementById('heroRotator');
  if(!el)return;
  const words=['Orders','Sales','Stock','Production','Payroll','Reporting','Operations'];
  let i=0;
  setInterval(()=>{
    i=(i+1)%words.length;
    el.classList.remove('flip');
    void el.offsetWidth;
    el.classList.add('flip');
    setTimeout(()=>{el.textContent=words[i];},280);
  },2400);
})();

const clockEl=document.getElementById('clock'),dateEl=document.getElementById('dateline'),fyearEl=document.getElementById('fyear');
const DAYS=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
(function tick(){const n=new Date();clockEl.textContent=n.toLocaleTimeString('en-KE',{hour:'2-digit',minute:'2-digit'});dateEl.textContent=DAYS[n.getDay()]+' '+n.getDate()+' '+MONTHS[n.getMonth()];setTimeout(tick,1000-n.getMilliseconds())})();
fyearEl.textContent=new Date().getFullYear();

let dark = false;
function applyTheme() {
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  document.getElementById('themeIcon').textContent = dark ? '☀️' : '🌙';
}
function toggleTheme() {
  dark = !dark;
  applyTheme();
}
applyTheme();

const wifiPanel=document.getElementById('wifiPanel');let wifiOpen=false;
function toggleWifiPanel(e){e.stopPropagation();if(typeof uzClose==='function')uzClose();wifiOpen=!wifiOpen;wifiPanel.classList.toggle('open',wifiOpen)}
/* Social hotspots: add a network by adding an entry here (name, url, official logo path, two gradient colours). Entries with an empty url are skipped. */
const SOCIALS=[{"name": "LinkedIn", "url": "https://linkedin.com/company/broadhut", "path": "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z", "c1": "#4088cf", "c2": "#07498c"}, {"name": "Instagram", "url": "https://instagram.com/broadhut", "path": "M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077", "c1": "#d62976", "c2": "#b8004c", "bg": "linear-gradient(45deg,#feda75,#fa7e1e,#d62976,#962fbf,#4f5bd5)"}, {"name": "X", "url": "https://twitter.com/broadhut", "path": "M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z", "c1": "#4a4a4a", "c2": "#0d0d0d"}, {"name": "Behance", "url": "https://behance.net/broadhut", "path": "M16.969 16.927a2.561 2.561 0 0 0 1.901.677 2.501 2.501 0 0 0 1.531-.475c.362-.235.636-.584.779-.99h2.585a5.091 5.091 0 0 1-1.9 2.896 5.292 5.292 0 0 1-3.091.88 5.839 5.839 0 0 1-2.284-.433 4.871 4.871 0 0 1-1.723-1.211 5.657 5.657 0 0 1-1.08-1.874 7.057 7.057 0 0 1-.383-2.393c-.005-.8.129-1.595.396-2.349a5.313 5.313 0 0 1 5.088-3.604 4.87 4.87 0 0 1 2.376.563c.661.362 1.231.87 1.668 1.485a6.2 6.2 0 0 1 .943 2.133c.194.821.263 1.666.205 2.508h-7.699c-.063.79.184 1.574.688 2.187ZM6.947 4.084a8.065 8.065 0 0 1 1.928.198 4.29 4.29 0 0 1 1.49.638c.418.303.748.711.958 1.182.241.579.357 1.203.341 1.83a3.506 3.506 0 0 1-.506 1.961 3.726 3.726 0 0 1-1.503 1.287 3.588 3.588 0 0 1 2.027 1.437c.464.747.697 1.615.67 2.494a4.593 4.593 0 0 1-.423 2.032 3.945 3.945 0 0 1-1.163 1.413 5.114 5.114 0 0 1-1.683.807 7.135 7.135 0 0 1-1.928.259H0V4.084h6.947Zm-.235 12.9c.308.004.616-.029.916-.099a2.18 2.18 0 0 0 .766-.332c.228-.158.411-.371.534-.619.142-.317.208-.663.191-1.009a2.08 2.08 0 0 0-.642-1.715 2.618 2.618 0 0 0-1.696-.505h-3.54v4.279h3.471Zm13.635-5.967a2.13 2.13 0 0 0-1.654-.619 2.336 2.336 0 0 0-1.163.259 2.474 2.474 0 0 0-.738.62 2.359 2.359 0 0 0-.396.792c-.074.239-.12.485-.137.734h4.769a3.239 3.239 0 0 0-.679-1.785l-.002-.001Zm-13.813-.648a2.254 2.254 0 0 0 1.423-.433c.399-.355.607-.88.56-1.413a1.916 1.916 0 0 0-.178-.891 1.298 1.298 0 0 0-.495-.533 1.851 1.851 0 0 0-.711-.274 3.966 3.966 0 0 0-.835-.073H3.241v3.631h3.293v-.014ZM21.62 5.122h-5.976v1.527h5.976V5.122Z", "c1": "#4a8aff", "c2": "#114cb8"}, {"name": "Dribbble", "url": "https://dribbble.com/broadhut", "path": "M12 24C5.385 24 0 18.615 0 12S5.385 0 12 0s12 5.385 12 12-5.385 12-12 12zm10.12-10.358c-.35-.11-3.17-.953-6.384-.438 1.34 3.684 1.887 6.684 1.992 7.308 2.3-1.555 3.936-4.02 4.395-6.87zm-6.115 7.808c-.153-.9-.75-4.032-2.19-7.77l-.066.02c-5.79 2.015-7.86 6.025-8.04 6.4 1.73 1.358 3.92 2.166 6.29 2.166 1.42 0 2.77-.29 4-.814zm-11.62-2.58c.232-.4 3.045-5.055 8.332-6.765.135-.045.27-.084.405-.12-.26-.585-.54-1.167-.832-1.74C7.17 11.775 2.206 11.71 1.756 11.7l-.004.312c0 2.633.998 5.037 2.634 6.855zm-2.42-8.955c.46.008 4.683.026 9.477-1.248-1.698-3.018-3.53-5.558-3.8-5.928-2.868 1.35-5.01 3.99-5.676 7.17zM9.6 2.052c.282.38 2.145 2.914 3.822 6 3.645-1.365 5.19-3.44 5.373-3.702-1.81-1.61-4.19-2.586-6.795-2.586-.825 0-1.63.1-2.4.285zm10.335 3.483c-.218.29-1.935 2.493-5.724 4.04.24.49.47.985.68 1.486.08.18.15.36.22.53 3.41-.43 6.8.26 7.14.33-.02-2.42-.88-4.64-2.31-6.38z", "c1": "#ef73a3", "c2": "#a83763"}, {"name": "GitHub", "url": "https://github.com/broadhut", "path": "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12", "c1": "#4a4a4a", "c2": "#0d0d0d"}, {"name": "Reddit", "url": "https://reddit.com/user/broadhut", "path": "M12 0C5.373 0 0 5.373 0 12c0 3.314 1.343 6.314 3.515 8.485l-2.286 2.286C.775 23.225 1.097 24 1.738 24H12c6.627 0 12-5.373 12-12S18.627 0 12 0Zm4.388 3.199c1.104 0 1.999.895 1.999 1.999 0 1.105-.895 2-1.999 2-.946 0-1.739-.657-1.947-1.539v.002c-1.147.162-2.032 1.15-2.032 2.341v.007c1.776.067 3.4.567 4.686 1.363.473-.363 1.064-.58 1.707-.58 1.547 0 2.802 1.254 2.802 2.802 0 1.117-.655 2.081-1.601 2.531-.088 3.256-3.637 5.876-7.997 5.876-4.361 0-7.905-2.617-7.998-5.87-.954-.447-1.614-1.415-1.614-2.538 0-1.548 1.255-2.802 2.803-2.802.645 0 1.239.218 1.712.585 1.275-.79 2.881-1.291 4.64-1.365v-.01c0-1.663 1.263-3.034 2.88-3.207.188-.911.993-1.595 1.959-1.595Zm-8.085 8.376c-.784 0-1.459.78-1.506 1.797-.047 1.016.64 1.429 1.426 1.429.786 0 1.371-.369 1.418-1.385.047-1.017-.553-1.841-1.338-1.841Zm7.406 0c-.786 0-1.385.824-1.338 1.841.047 1.017.634 1.385 1.418 1.385.785 0 1.473-.413 1.426-1.429-.046-1.017-.721-1.797-1.506-1.797Zm-3.703 4.013c-.974 0-1.907.048-2.77.135-.147.015-.241.168-.183.305.483 1.154 1.622 1.964 2.953 1.964 1.33 0 2.47-.81 2.953-1.964.057-.137-.037-.29-.184-.305-.863-.087-1.795-.135-2.769-.135Z", "c1": "#ff6e38", "c2": "#b83200"}, {"name": "TikTok", "url": "https://tiktok.com/@broadhut", "path": "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z", "c1": "#4a4a4a", "c2": "#0d0d0d"}, {"name": "Medium", "url": "https://medium.com/@broadhut", "path": "M4.21 0A4.201 4.201 0 0 0 0 4.21v15.58A4.201 4.201 0 0 0 4.21 24h15.58A4.201 4.201 0 0 0 24 19.79v-1.093c-.137.013-.278.02-.422.02-2.577 0-4.027-2.146-4.09-4.832a7.592 7.592 0 0 1 .022-.708c.093-1.186.475-2.241 1.105-3.022a3.885 3.885 0 0 1 1.395-1.1c.468-.237 1.127-.367 1.664-.367h.023c.101 0 .202.004.303.01V4.211A4.201 4.201 0 0 0 19.79 0Zm.198 5.583h4.165l3.588 8.435 3.59-8.435h3.864v.146l-.019.004c-.705.16-1.063.397-1.063 1.254h-.003l.003 10.274c.06.676.424.885 1.063 1.03l.02.004v.145h-4.923v-.145l.019-.005c.639-.144.994-.353 1.054-1.03V7.267l-4.745 11.15h-.261L6.15 7.569v9.445c0 .857.358 1.094 1.063 1.253l.02.004v.147H4.405v-.147l.019-.004c.705-.16 1.065-.397 1.065-1.253V6.987c0-.857-.358-1.094-1.064-1.254l-.018-.004zm19.25 3.668c-1.086.023-1.733 1.323-1.813 3.124H24V9.298a1.378 1.378 0 0 0-.342-.047Zm-1.862 3.632c-.1 1.756.86 3.239 2.204 3.634v-3.634z", "c1": "#4a4a4a", "c2": "#0d0d0d"}, {"name": "Substack", "url": "https://broadhut.substack.com", "path": "M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z", "c1": "#ff884c", "c2": "#b84a12"}, {"name": "YouTube", "url": "https://youtube.com/@broadhut", "path": "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z", "c1": "#ff3838", "c2": "#b80000"}, {"name": "Facebook", "url": "https://facebook.com/broadhut", "path": "M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z", "c1": "#3e88ff", "c2": "#0649b8"}];
(function(){
  const box=document.getElementById('wifiSocials');if(!box)return;
  SOCIALS.filter(s=>s.url).forEach(s=>{
    const row=document.createElement('div');row.className='wifi-net';row.setAttribute('role','listitem');
    row.style.setProperty('--c',s.c1);
    const tile=document.createElement('span');tile.className='wifi-ic-tile';tile.style.background=s.bg||'linear-gradient(145deg,'+s.c1+','+s.c2+')';tile.setAttribute('aria-hidden','true');
    tile.innerHTML='<svg viewBox="0 0 24 24" fill="#fff"><path d="'+s.path+'"/></svg>';
    row.appendChild(tile);
    const nm=document.createElement('span');nm.className='wifi-net-name';nm.textContent=s.name;
    const a=document.createElement('a');a.className='wifi-join';a.href=s.url;a.target='_blank';a.rel='noopener noreferrer';a.textContent='Connect';
    a.setAttribute('aria-label','Connect to Broadhut on '+s.name);a.onclick=()=>wifiJoin(a);
    row.append(nm,a);box.appendChild(row);
  });
})();


/* ── Text size (zoom for reading content) ── */
const UZ_STEPS=[1,1.15,1.3,1.5,1.75,2];
let uz=1,uzOpen=false;
function uzApply(v,save){
  v=Math.min(2,Math.max(1,Number(v)||1));uz=v;
  const r=document.documentElement;
  r.style.setProperty('--uz',v);r.style.setProperty('--uzh',Math.min(v,1.3));
  if(v>1)document.body.setAttribute('data-uz',String(v));else document.body.removeAttribute('data-uz');
  document.body.classList.toggle('uz-big',v>=1.5);
  document.getElementById('uzVal').textContent=Math.round(v*100)+'%';
  document.getElementById('uzMinus').disabled=v<=1;document.getElementById('uzPlus').disabled=v>=2;
  document.querySelectorAll('#uzPresets .uz-pill').forEach(b=>{const on=Math.abs(parseFloat(b.dataset.v)-v)<.001;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on?'true':'false')});
  if(save){try{localStorage.setItem('bh_uz',String(v))}catch(e){}}
}
function uzStep(d){
  let i=UZ_STEPS.findIndex(s=>Math.abs(s-uz)<.001);
  if(i<0)i=UZ_STEPS.reduce((b,s,k)=>Math.abs(s-uz)<Math.abs(UZ_STEPS[b]-uz)?k:b,0);
  uzApply(UZ_STEPS[Math.min(UZ_STEPS.length-1,Math.max(0,i+d))],true);
}
function uzClose(){uzOpen=false;document.getElementById('uzPanel').classList.remove('open')}
function uzToggle(e){
  if(e)e.stopPropagation();
  const p=document.getElementById('uzPanel'),b=document.getElementById('uzBtn');
  if(uzOpen){uzClose();return}
  if(typeof wifiOpen!=='undefined'&&wifiOpen){wifiOpen=false;document.getElementById('wifiPanel').classList.remove('open')}
  uzOpen=true;p.classList.add('open');
  const r=b.getBoundingClientRect();
  p.style.left=Math.max(8,Math.min(r.right-p.offsetWidth,window.innerWidth-p.offsetWidth-8))+'px';
}
(function(){
  const box=document.getElementById('uzPresets');
  UZ_STEPS.forEach(v=>{const b=document.createElement('button');b.type='button';b.className='uz-pill';b.dataset.v=v;b.textContent=Math.round(v*100)+'%';b.onclick=()=>uzApply(v,true);box.appendChild(b)});
  if(window.CSS&&CSS.supports&&!CSS.supports('zoom','1.5')){document.getElementById('uzBtn').style.display='none';return}
  let v=1;try{v=parseFloat(localStorage.getItem('bh_uz'))||1}catch(e){}
  uzApply(v,false);
  document.addEventListener('click',e=>{if(uzOpen&&!document.getElementById('uzPanel').contains(e.target)&&!document.getElementById('uzBtn').contains(e.target))uzClose()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&uzOpen)uzClose()},true);
})();

/* ── Spotlight search ── */
let spotIndex=null,spotResults=[],spotActive=0;
const SPOT_CATS={
  'Services':['healthcheck','strategy','erp','processdesign','sysarch','integrations','techarch','growth','design','dev','brand','motion','seo'],
  'Business Systems':['bsys','crm','sales','payroll','inventory','production','custommodules','datamigration','training'],
  'Studio':['about','whyus','security','process','orgchart','blog','careers','tour','analytics','portfolio','casestudy','situation'],
  'Pricing & Contact':['howpricing','pricing','contact','feedback'],
  'Help & Legal':['faq','terms','privacy','cookies','accessibility','explorer'],
  'Glossary':['term']
};
function spotCatOf(id){const k=id.split('-')[0];for(const c in SPOT_CATS)if(SPOT_CATS[c].includes(k))return c;return 'Pages'}
async function buildSpotIndex(){
  let data=[];
  try{data=await (await fetch('/search-index.json')).json()}catch(e){}
  const out=[];
  data.forEach(e=>{
    if(e.t==='w')out.push({id:e.id,title:e.title,sub:e.sub,cat:e.cat,icon:e.icon,kw:e.kw,boost:3,run:()=>openWin(e.id)});
    else if(e.t==='faq')out.push({title:e.title,sub:e.sub,cat:'FAQ',icon:'❓',kw:e.kw,boost:5,run:()=>{
      const go=()=>{openWin('faq');setTimeout(()=>{const it=document.querySelectorAll('#win-faq .faq-item')[e.i];if(!it)return;document.querySelectorAll('#win-faq .faq-item').forEach(x=>x.classList.remove('open'));it.classList.add('open','spot-flash');it.scrollIntoView({block:'center',behavior:'smooth'});setTimeout(()=>it.classList.remove('spot-flash'),1800)},350)};
      getWin('faq')?go():loadWin('faq').then(go)}});
    else if(e.t==='blog')out.push({title:e.title,sub:e.sub,cat:'Journal · '+e.cat,icon:'📝',kw:e.kw,boost:5,run:()=>{
      const go=()=>{openWin('blog');setTimeout(()=>{const c=document.querySelectorAll('#win-blog .blog-card')[e.i];if(!c)return;c.classList.add('spot-flash');c.scrollIntoView({block:'center',behavior:'smooth'});setTimeout(()=>c.classList.remove('spot-flash'),1800)},350)};
      getWin('blog')?go():loadWin('blog').then(go)}});
  });
  (typeof SOCIALS!=='undefined'?SOCIALS:[]).filter(s=>s.url).forEach(s=>{
    out.push({title:s.name,sub:'Open Broadhut on '+s.name,cat:'Social',svg:s,kw:'social follow connect '+s.name.toLowerCase(),boost:0,run:()=>window.open(s.url,'_blank','noopener')});
  });
  [['Increase text size','Make reading text larger',()=>uzStep(1)],['Decrease text size','Make reading text smaller',()=>uzStep(-1)],['Reset text size','Back to 100%',()=>uzApply(1,true)]].forEach(a=>out.push({title:a[0],sub:a[1],cat:'Actions',icon:'🔠',kw:'zoom text size font bigger larger smaller accessibility read',boost:0,run:a[2]}));
  out.push({title:'Take a quick tour',sub:'Watch the menus open',cat:'Actions',icon:'🖱️',kw:'tour guide menus help show me around demo',boost:0,run:()=>{if(window.runTour)window.runTour()}});
  out.push({title:'Toggle light / dark mode',sub:'Switch the theme',cat:'Actions',icon:'🌓',kw:'theme dark light mode appearance',boost:0,run:()=>toggleTheme()});
  out.push({title:'Open my project',sub:'Review services you have added',cat:'Actions',icon:'🧺',kw:'project cart selected basket',boost:0,run:()=>{if(!proj.size){openWin('pricing');return}projOpen=true;renderProject()}});
  return out;
}
function spotScore(e,q){
  const t=e.title.toLowerCase();let s=0;
  for(const tok of q.split(/\s+/).filter(Boolean)){
    if(t===tok)s+=100;else if(t.startsWith(tok))s+=60;else if(t.includes(' '+tok))s+=45;else if(t.includes(tok))s+=35;
    else if(e.kw.includes(tok))s+=10;else return 0;
  }
  return s+e.boost;
}
function spotMark(el,text,q){
  const toks=q.split(/\s+/).filter(Boolean),low=text.toLowerCase();let i=0;
  const hits=[];toks.forEach(tk=>{let p=low.indexOf(tk);if(p>-1)hits.push([p,p+tk.length])});
  hits.sort((a,b)=>a[0]-b[0]);
  const merged=[];hits.forEach(r=>{const l=merged[merged.length-1];if(l&&r[0]<=l[1])l[1]=Math.max(l[1],r[1]);else merged.push(r)});
  merged.forEach(r=>{if(r[0]>i)el.append(text.slice(i,r[0]));const m=document.createElement('mark');m.textContent=text.slice(r[0],r[1]);el.appendChild(m);i=r[1]});
  if(i<text.length)el.append(text.slice(i));
}
function spotRender(q){
  const list=document.getElementById('spotList');list.textContent='';
  if(!spotIndex){const d=document.createElement('div');d.className='spot-empty';d.textContent='Loading…';list.appendChild(d);return}
  q=q.trim().toLowerCase();
  let items;
  if(!q){
    const pick=['healthcheck','pricing','erp','bsys','growth','faq','contact'];
    items=pick.map(id=>spotIndex.find(e=>e.id===id)).filter(Boolean);
    spotResults=items;
    const sec=document.createElement('div');sec.className='spot-sec';sec.textContent='Suggestions';list.appendChild(sec);
  }else{
    items=spotIndex.map((e,i)=>({e,s:spotScore(e,q),i})).filter(x=>x.s>0).sort((a,b)=>b.s-a.s||a.i-b.i).slice(0,8).map(x=>x.e);
    spotResults=items;
    if(!items.length){const d=document.createElement('div');d.className='spot-empty';d.textContent='No results for “'+q+'”. Try “payroll”, “CRM” or “pricing”.';list.appendChild(d);spotActive=-1;return}
  }
  spotActive=0;
  items.forEach((e,idx)=>{
    if(q&&idx===0){const s=document.createElement('div');s.className='spot-sec';s.textContent='Top hit';list.appendChild(s)}
    const row=document.createElement('div');row.className='spot-item'+(idx===0?' active':'');row.setAttribute('role','option');row.dataset.i=idx;
    const ic=document.createElement('span');ic.className='spot-ic';ic.setAttribute('aria-hidden','true');
    if(e.svg){ic.style.background=e.svg.bg||'linear-gradient(145deg,'+e.svg.c1+','+e.svg.c2+')';ic.style.borderColor='transparent';ic.innerHTML='<svg viewBox="0 0 24 24" fill="#fff"><path d="'+e.svg.path+'"/></svg>'}else ic.textContent=e.icon;
    const tx=document.createElement('span');tx.className='spot-tx';
    const tt=document.createElement('div');tt.className='spot-tt';q?spotMark(tt,e.title,q):tt.textContent=e.title;
    tx.appendChild(tt);
    if(e.sub){const sb=document.createElement('div');sb.className='spot-sub';sb.textContent=e.sub;tx.appendChild(sb)}
    const ct=document.createElement('span');ct.className='spot-cat';ct.textContent=e.cat;
    row.append(ic,tx,ct);
    row.onmouseenter=()=>spotSetActive(idx);
    row.onclick=()=>spotGo(idx);
    list.appendChild(row);
    if(q&&idx===0&&items.length>1){const s=document.createElement('div');s.className='spot-sec';s.textContent='More results';list.appendChild(s)}
  });
}
function spotSetActive(i){
  const rows=document.querySelectorAll('#spotList .spot-item');if(!rows.length)return;
  spotActive=(i+rows.length)%rows.length;
  rows.forEach((r,k)=>r.classList.toggle('active',k===spotActive));
  rows[spotActive].scrollIntoView({block:'nearest'});
}
function spotGo(i){const e=spotResults[i];if(!e)return;closeSpot();e.run()}
function openSpot(){
  const s=document.getElementById('spot'),inp=document.getElementById('spotInput');
  s.classList.add('open');s.setAttribute('aria-hidden','false');
  inp.value='';spotRender('');setTimeout(()=>inp.focus(),30);
  if(!spotIndex)buildSpotIndex().then(ix=>{spotIndex=ix;if(s.classList.contains('open'))spotRender(inp.value)});
}
function closeSpot(){const s=document.getElementById('spot');s.classList.remove('open');s.setAttribute('aria-hidden','true')}
(function(){
  const s=document.getElementById('spot'),inp=document.getElementById('spotInput');
  const mac=/Mac|iPhone|iPad/.test(navigator.platform||navigator.userAgent||'');
  const tip=document.getElementById('searchTip');if(tip)tip.textContent='Search  '+(mac?'⌘K':'Ctrl K');
  inp.addEventListener('input',()=>spotRender(inp.value));
  s.addEventListener('mousedown',e=>{if(e.target===s)closeSpot()});
  document.addEventListener('keydown',e=>{
    const open=s.classList.contains('open');
    if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();open?closeSpot():openSpot();return}
    if(!open){
      const t=e.target,typing=t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.isContentEditable);
      if(e.key==='/'&&!typing&&!e.metaKey&&!e.ctrlKey&&!e.altKey){e.preventDefault();openSpot()}
      return;
    }
    if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();closeSpot()}
    else if(e.key==='ArrowDown'){e.preventDefault();spotSetActive(spotActive+1)}
    else if(e.key==='ArrowUp'){e.preventDefault();spotSetActive(spotActive-1)}
    else if(e.key==='Enter'){e.preventDefault();spotGo(spotActive)}
  },true);
})();

let wifiScan=null;
function toggleWifi(el){
  const on=el.classList.toggle('on');el.setAttribute('aria-checked',on?'true':'false');
  const nets=document.querySelector('.wifi-networks'),msg=document.getElementById('wifiOffMsg'),btn=document.getElementById('wifiBtn');
  clearTimeout(wifiScan);
  btn.style.opacity=on?'':'.45';
  nets.style.display='none';msg.style.display='block';
  if(on){msg.textContent='Searching for networks\u2026';wifiScan=setTimeout(()=>{msg.style.display='none';nets.style.display=''},900)}
  else{msg.textContent='Wi-Fi is off. Turn it on to see nearby networks.'}
}
function wifiJoin(a){
  a.classList.add('joining');a.textContent='Connecting\u2026';
  setTimeout(()=>{a.classList.remove('joining');a.classList.add('joined');a.textContent='Connected \u2713'},1100);
  setTimeout(()=>{a.classList.remove('joined');a.textContent='Connect'},4000);
}
function closeWifiAndOpenContact(){wifiOpen=false;wifiPanel.classList.remove('open');openWin('contact')}
document.addEventListener('click',e=>{if(wifiOpen&&!wifiPanel.contains(e.target)&&!document.getElementById('wifiBtn').contains(e.target)){wifiOpen=false;wifiPanel.classList.remove('open')}});

let zTop=50;function bringFront(w){w.style.zIndex=++zTop}

const dockEl=document.getElementById('dock');
const dockArrowL=document.getElementById('dockArrowLeft');
const dockArrowR=document.getElementById('dockArrowRight');
function updateDockArrows(){
  if(!dockEl||!dockArrowL||!dockArrowR)return;
  const max=dockEl.scrollWidth-dockEl.clientWidth;
  const overflowing=max>4;
  dockArrowL.classList.toggle('visible',overflowing&&dockEl.scrollLeft>4);
  dockArrowR.classList.toggle('visible',overflowing&&dockEl.scrollLeft<max-4);
}
function scrollDock(dir){if(dockEl)dockEl.scrollBy({left:dir*130,behavior:'smooth'})}
if(dockEl){
  dockEl.addEventListener('scroll',updateDockArrows,{passive:true});
  window.addEventListener('resize',updateDockArrows);
  window.addEventListener('load',updateDockArrows);
  setTimeout(updateDockArrows,300);
}

function getWin(id){return document.getElementById('win-'+id)}
const DOCK_IDS=['about','design','dev','brand','motion','erp','bsys','growth','strategy','seo','process','blog','careers','explorer','orgchart','howpricing','pricing','feedback','contact'];
function getDI(id){return DOCK_IDS.includes(id)?document.getElementById('di-'+id):null}

function runAnim(win,cls,cb){
  win.classList.remove('is-open','is-closing','is-minimising','is-restoring');
  win.style.display='flex';void win.offsetWidth;
  if(cls==='is-open'){
    const bh=parseInt(getComputedStyle(document.documentElement).getPropertyValue('--bar-h'))||28;
    win.style.top=(bh+14)+'px';
    win.style.left=Math.max(8,(window.innerWidth-win.offsetWidth)/2)+'px';
  }
  win.classList.add(cls);
  win.addEventListener('animationend',()=>{win.classList.remove(cls);if(cb)cb()},{once:true});
}

let tallyLoaded=false;
function ensureTally(){
  if(tallyLoaded)return;tallyLoaded=true;
  const s=document.createElement('script');s.src='https://tally.so/widgets/embed.js';
  s.onload=()=>{if(window.Tally&&Tally.loadEmbeds)Tally.loadEmbeds()};
  s.onerror=()=>document.querySelectorAll('iframe[data-tally-src]').forEach(f=>{if(!f.getAttribute('src'))f.src=f.getAttribute('data-tally-src')});
  document.body.appendChild(s);
}
function openWin(id,opts){
  opts=opts||{};
  const w=getWin(id);
  if(!w){
    loadWin(id).then(()=>openWin(id,opts)).catch(()=>{if(PAGES[id])location.href=PAGES[id][0]});
    return;
  }
  setUrl(id,opts);
  if(id==='contact'||id==='pricing'||id==='feedback')ensureTally();
  if(id==='pricing')applyPricingParams();
  if(w._min){restoreWin(id);return}
  if(w.style.display==='flex'){bringFront(w);return}
  runAnim(w,'is-open');bringFront(w);
  const di=getDI(id);if(di)di.classList.add('open');
}

function toggleWin(id){
  const w=getWin(id);if(!w){openWin(id);return}
  if(w._min){restoreWin(id);return}
  if(w.style.display==='flex'){minimiseWin(id)}else{openWin(id)}
}

function closeAllWins(pop){
  document.querySelectorAll('.window').forEach(w=>{if(w.style.display==='flex')closeWin(w.id.replace('win-',''))});
  if(!pop&&location.pathname!=='/')history.pushState({},'','/');
  document.title=HOME_TITLE;
}

function deskOpen(id){
  document.querySelectorAll('.desk-icon').forEach(i=>i.classList.remove('selected'));
  const d=document.getElementById('dfi-'+id);if(d)d.classList.add('selected');
  openWin(id);
}

function closeWin(id){
  const w=getWin(id);if(!w)return;
  if(PAGES[id]&&location.pathname===PAGES[id][0]){history.replaceState({},'','/');document.title=HOME_TITLE}
  w._min=false;w.classList.remove('maximised');
  runAnim(w,'is-closing',()=>{w.style.display='none'});
  const di=getDI(id);if(di)di.classList.remove('open');
  const d=document.getElementById('dfi-'+id);if(d)d.classList.remove('selected');
}

function minimiseWin(id){
  const w=getWin(id);if(!w||w._min)return;
  w._min=true;
  const di=getDI(id);
  w.getAnimations().forEach(a=>a.cancel());
  if(di && w.style.display==='flex'){
    const wr=w.getBoundingClientRect();
    const ir=di.getBoundingClientRect();
    const dx=(ir.left+ir.width/2)-(wr.left+wr.width/2);
    const dy=(ir.top+ir.height/2)-(wr.top+wr.height/2);
    const anim=w.animate([
      {transform:'translate(0,0) scale(1)',opacity:1},
      {transform:`translate(${dx}px,${dy}px) scale(.04)`,opacity:0}
    ],{duration:360,easing:'cubic-bezier(.6,0,.98,.5)',fill:'forwards'});
    anim.onfinish=()=>{w.style.display='none';w.style.transform='';};
  }else{
    runAnim(w,'is-minimising',()=>{w.style.display='none'});
  }
  if(di)di.classList.remove('open');
}

function restoreWin(id){
  const w=getWin(id);if(!w)return;
  w._min=false;
  const di=getDI(id);
  if(di){
    w.getAnimations().forEach(a=>a.cancel());
    w.style.transform='';
    w.style.display='flex';
    bringFront(w);
    const wr=w.getBoundingClientRect();
    const ir=di.getBoundingClientRect();
    const dx=(ir.left+ir.width/2)-(wr.left+wr.width/2);
    const dy=(ir.top+ir.height/2)-(wr.top+wr.height/2);
    w.animate([
      {transform:`translate(${dx}px,${dy}px) scale(.04)`,opacity:0},
      {transform:'translate(0,0) scale(1)',opacity:1}
    ],{duration:320,easing:'cubic-bezier(.16,1,.3,1)'});
  }else{
    runAnim(w,'is-restoring');bringFront(w);
  }
  if(di)di.classList.add('open');
}

const savedGeo={};
function toggleMax(wId){
  const w=document.getElementById(wId);if(!w)return;
  if(w.classList.contains('maximised')){const g=savedGeo[wId]||{};Object.assign(w.style,g);w.classList.remove('maximised')}
  else{savedGeo[wId]={top:w.style.top,left:w.style.left,width:w.style.width,maxWidth:w.style.maxWidth,height:w.style.height,maxHeight:w.style.maxHeight};w.classList.add('maximised')}
  bringFront(w);
}

let drag=null;
function startDrag(e,wId){
  if(e.button!==0)return;const w=document.getElementById(wId);
  if(!w||w.classList.contains('maximised'))return;
  bringFront(w);const r=w.getBoundingClientRect();
  drag={w,ox:e.clientX-r.left,oy:e.clientY-r.top};e.preventDefault();
}
document.addEventListener('mousemove',e=>{
  if(!drag)return;
  const bh=parseInt(getComputedStyle(document.documentElement).getPropertyValue('--bar-h'))||28;
  const dh=parseInt(getComputedStyle(document.documentElement).getPropertyValue('--dock-h'))||88;
  const fh=parseInt(getComputedStyle(document.documentElement).getPropertyValue('--footer-h'))||28;
  let x=e.clientX-drag.ox,y=e.clientY-drag.oy;
  x=Math.max(0,Math.min(x,window.innerWidth-drag.w.offsetWidth));
  y=Math.max(bh,Math.min(y,window.innerHeight-dh-fh-drag.w.offsetHeight));
  drag.w.style.left=x+'px';drag.w.style.top=y+'px';
});
document.addEventListener('mouseup',()=>drag=null);

let tdrag=null;
function startDragT(e,wId){
  const w=document.getElementById(wId);if(!w||w.classList.contains('maximised'))return;
  bringFront(w);const t=e.touches[0],r=w.getBoundingClientRect();
  tdrag={w,ox:t.clientX-r.left,oy:t.clientY-r.top};
}
document.addEventListener('touchmove',e=>{
  if(!tdrag)return;const t=e.touches[0];
  let x=t.clientX-tdrag.ox,y=t.clientY-tdrag.oy;
  x=Math.max(0,Math.min(x,window.innerWidth-tdrag.w.offsetWidth));
  y=Math.max(28,Math.min(y,window.innerHeight-116-tdrag.w.offsetHeight));
  tdrag.w.style.left=x+'px';tdrag.w.style.top=y+'px';e.preventDefault();
},{passive:false});
document.addEventListener('touchend',()=>tdrag=null);

document.addEventListener('mousedown',e=>{const w=e.target.closest&&e.target.closest('.window');if(w)bringFront(w)});
/* Real links (a[data-win]) open windows in place; ctrl/cmd-click still opens the real page in a new tab */
document.addEventListener('click',e=>{
  if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
  const a=e.target.closest&&e.target.closest('a[data-win],a[data-home]');if(!a)return;
  e.preventDefault();
  if(a.hasAttribute('data-home')){closeAllWins();return}
  const id=a.getAttribute('data-win');
  a.getAttribute('data-act')==='toggle'?toggleWin(id):openWin(id);
},true);
window.addEventListener('popstate',()=>{const id=PATH2ID[location.pathname];if(id)openWin(id,{pop:true});else closeAllWins(true)});

document.querySelectorAll('.desk-icon').forEach(icon=>{
  let clicks=0,timer;
  icon.addEventListener('click',()=>{
    clicks++;clearTimeout(timer);
    if(clicks===1){document.querySelectorAll('.desk-icon').forEach(i=>i.classList.remove('selected'));icon.classList.add('selected');timer=setTimeout(()=>clicks=0,360)}
    else{clearTimeout(timer);clicks=0;deskOpen(icon.id.replace('dfi-',''))}
  });
});
document.getElementById('desktop').addEventListener('click',e=>{
  if(!e.target.closest('.desk-icon')&&!e.target.closest('.window'))
    document.querySelectorAll('.desk-icon').forEach(i=>i.classList.remove('selected'));
});

document.addEventListener('keydown',e=>{
  if(e.key!=='Escape')return;
  let top=null,topZ=-1;
  document.querySelectorAll('.window').forEach(w=>{const z=parseInt(w.style.zIndex||0);if(w.style.display==='flex'&&z>topZ){topZ=z;top=w}});
  if(top)closeWin(top.id.replace('win-',''));
});

function toggleFaq(btn){const item=btn.closest('.faq-item'),was=item.classList.contains('open');document.querySelectorAll('.faq-item').forEach(i=>i.classList.remove('open'));if(!was)item.classList.add('open')}

const HC_Q=[
  {icon:'📇',text:'Do leads or enquiries sometimes fall through the cracks?',
   flag:'Leads fall through the cracks',
   stat:'Vendors who respond to a new lead first win an estimated 35\u201350% of the sale, yet close to half of salespeople never make a single follow-up attempt.',
   source:'Sales follow-up research, InsideSales / industry benchmarks'},
  {icon:'🧾',text:'Does your sales process live in WhatsApp, spreadsheets, or someone\u2019s head?',
   flag:'Sales process isn\u2019t systemised',
   stat:'The average sales rep spends only around 30% of the working week selling. Most of the rest goes to admin, manual data entry, and chasing information across disconnected tools.',
   source:'Salesforce, State of Sales research'},
  {icon:'📦',text:'Does stock on the shelf not match what the system says?',
   flag:'Stock doesn\u2019t reconcile',
   stat:'Businesses on manual or fragmented stock tracking average roughly 65% inventory accuracy, against 95%+ for those on real-time systems, and shrinkage alone costs the average retailer 1\u20132% of annual revenue.',
   source:'Supply-chain industry benchmarks, CAPS Research / NRF'},
  {icon:'💵',text:'Is payroll, including tax and other statutory deductions, worked out by hand every month?',
   flag:'Payroll is manual',
   stat:'The American Payroll Association estimates human error in manual time-card preparation at 1\u20138%, and an Ernst & Young study of US businesses put the average cost of fixing a single payroll error at $291.',
   source:'American Payroll Association; Ernst & Young (US businesses), as cited by payroll vendors'},
  {icon:'📊',text:'Do reports take days to pull together instead of minutes?',
   flag:'Reports take too long',
   stat:'Illustration, not a benchmark: if pulling one weekly report together takes a skilled employee half a day, that is about two working days a month spent assembling numbers that a connected system could produce on demand.',
   source:'Broadhut illustration'},
  {icon:'🧩',text:'Do different departments work from different numbers?',
   flag:'Departments don\u2019t share information',
   stat:'The average employee spends about 9.3 hours a week, more than a full working day, just searching for information that already exists somewhere else in the business.',
   source:'McKinsey Global Institute'},
  {icon:'🌐',text:'Does your website bring traffic but not enquiries that turn into work?',
   flag:'Website isn\u2019t converting',
   stat:'The average website converts only 2\u20133% of visitors into an enquiry, meaning roughly 97 out of every 100 visitors leave without ever contacting you.',
   source:'Ruler Analytics, cross-industry conversion benchmarks'},
  {icon:'🔌',text:'Are you running two or more systems that don\u2019t talk to each other?',
   flag:'Two systems don\u2019t talk',
   stat:'Over 40% of workers in one survey spent at least a quarter of their working week on manual, repetitive tasks.',
   source:'Smartsheet, workplace automation research'},
  {icon:'🛠️',text:'Does nothing off-the-shelf quite fit how you work?',
   flag:'Nothing off-the-shelf fits',
   stat:'There\u2019s no single statistic for this one, but it\u2019s usually the clearest signal: once your approval chain, stock categories, or reporting needs stop matching the standard install, the software is working against you instead of for you.',
   source:'Broadhut\u2019s own view, not a statistic'},
  {icon:'💰',text:'Do client payments regularly come in late, leaving you to chase them?',
   flag:'Client payments come in late',
   stat:'A widely cited U.S. Bank study found that roughly 8 in 10 small businesses that failed pointed to cash flow problems as a factor. Money that is owed to you but not yet collected sits squarely in that gap.',
   source:'U.S. Bank small business failure study (Jessie Hagen)'},
  {icon:'📜',text:'If a tax authority or an auditor walked in tomorrow, would your records hold up?',
   flag:'Compliance records aren\u2019t audit-ready',
   stat:'Closest published benchmark: a Ponemon Institute study of 53 large, US-based multinationals found that non-compliance with data-protection rules cost about 2.7 times as much as compliance. It covers data protection rather than tax or ISO records, but it shows how much more it costs to fix a compliance gap after the fact.',
   source:'Ponemon Institute / Globalscape, The True Cost of Compliance with Data Protection Regulations (2017)'}
];
const HC_SVC=[['crm','CRM'],['sales','Sales'],['inventory','Inventory'],['payroll','Payroll'],['integrations','Integrations & Automation'],['sysarch','Systems Architecture'],['seo','SEO & Growth'],['integrations','Integrations & Automation'],['custommodules','Custom Modules & Workflows'],['sales','Sales'],['processdesign','Process & Workflow Design']];
HC_SVC.forEach((s,i)=>{HC_Q[i].svc=s[0];HC_Q[i].svcLabel=s[1]});
HC_Q.push(
 {icon:'\u{1F3ED}',text:'Is it hard to say where a customer\u2019s order is on the production floor?',flag:'Production isn\u2019t tracked',svc:'production',svcLabel:'Production',
  stat:'No reliable benchmark here. The signal is simple: if the answer to \u201cwhere is this order?\u201d is \u201clet me go and check\u201d, delays stay invisible until a customer asks.',source:'Broadhut\u2019s own view, not a statistic'},
 {icon:'\u{1F465}',text:'Are staff records, leave, and contracts kept in files or spreadsheets?',flag:'HR records are scattered',svc:'payroll',svcLabel:'Payroll',
  stat:'No reliable benchmark here. When people records are spread across files, every payroll run, leave request, or audit starts with a search for the right version.',source:'Broadhut\u2019s own view, not a statistic'},
 {icon:'\u{1F9E0}',text:'Does important information live in one person\u2019s head or one person\u2019s spreadsheet?',flag:'Key-person dependency',svc:'datamigration',svcLabel:'Data Migration',
  stat:'No reliable benchmark here. If that person is on leave or leaves, the business loses not just their time but the records and know-how only they hold.',source:'Broadhut\u2019s own view, not a statistic'},
 {icon:'\u{1F501}',text:'Have you tried a new system before, only for staff to drift back to the old way?',flag:'New systems don\u2019t stick',svc:'training',svcLabel:'Training & Handover',
  stat:'No reliable benchmark here. Systems usually fail at adoption rather than at software: if staff were not trained on their own data and workflows, they go back to what they know.',source:'Broadhut\u2019s own view, not a statistic'},
 {icon:'\u{1F3F7}\uFE0F',text:'Does your brand look or sound different depending on where customers meet it?',flag:'Brand is inconsistent',svc:'brand',svcLabel:'Branding',
  stat:'No reliable benchmark here. When the website, invoices, social posts, and sales pitches each look different, customers have less reason to trust that the business is consistent in other ways.',source:'Broadhut\u2019s own view, not a statistic'}
);


HC_Q.push(
 {icon:'\u{1F510}',text:'Does everyone in the business see everything in your systems?',flag:'Access isn\u2019t set by role',svc:'sysarch-rolesaccess',svcLabel:'Roles & Access (Systems Architecture)',
  stat:'No reliable benchmark here. When everyone can see and change everything, one mistake or one departing employee can expose or alter records the business depends on.',source:'Broadhut\u2019s own view, not a statistic'},
 {icon:'\u{1FAAA}',text:'Do former staff or contractors still have access to your systems?',flag:'Leavers keep access',svc:'techarch-securityaccess',svcLabel:'Security & Access (Technical Architecture)',
  stat:'No reliable benchmark here. Access that is not removed when someone leaves stays open until somebody notices.',source:'Broadhut\u2019s own view, not a statistic'},
 {icon:'\u{1F4BE}',text:'Has anyone tested restoring your data from a backup?',flag:'Backups are untested',svc:'techarch-infrastructurehosting',svcLabel:'Infrastructure & Hosting (Technical Architecture)',
  stat:'No reliable benchmark here. A backup that has never been restored is a hope rather than a plan.',source:'Broadhut\u2019s own view, not a statistic'}
);
let hcState={i:0,answers:[]};

function hcRender(){
  const stage=document.getElementById('hcStage');
  if(!stage)return;
  stage.setAttribute('aria-live','polite');
  const bar=document.getElementById('hcProgressFill'),pct=Math.round((hcState.i/HC_Q.length)*100);
  bar.style.width=pct+'%';
  const track=bar.parentElement;
  track.setAttribute('role','progressbar');track.setAttribute('aria-valuemin','0');track.setAttribute('aria-valuemax','100');track.setAttribute('aria-valuenow',String(pct));
  if(hcState.i>=HC_Q.length){hcRenderResult(stage);return}
  document.getElementById('hcCount').textContent='Question '+(hcState.i+1)+' of '+HC_Q.length;
  const q=HC_Q[hcState.i],prev=hcState.answers[hcState.i];
  const ring='box-shadow:0 0 0 2px var(--text)';
  stage.innerHTML=
    '<div class="hc-q">'+
      '<span class="hc-q-icon">'+q.icon+'</span>'+
      '<div class="hc-q-text">'+q.text+'</div>'+
      '<div class="hc-yn-row">'+
        '<button type="button" class="hc-yn-btn hc-yn-btn-yes" '+(prev===true?'style="'+ring+'" ':'')+'onclick="hcAnswer(true)"><span class="hc-yn-key">\u{1F62C}</span>Yes, that\u2019s us</button>'+
        '<button type="button" class="hc-yn-btn hc-yn-btn-no" '+(prev===false?'style="'+ring+'" ':'')+'onclick="hcAnswer(false)"><span class="hc-yn-key">\u{1F60C}</span>No, we\u2019re fine there</button>'+
      '</div>'+
    (hcState.i>0?'<button type="button" class="hc-tf-back" onclick="hcBack()">\u2190 Back</button>':'')+
    '</div>';
}

function hcAnswer(val){hcState.answers[hcState.i]=val;hcState.i++;hcRender()}
function hcBack(){if(hcState.i<=0)return;hcState.i--;hcRender()}

function hcRenderResult(stage){
  document.getElementById('hcCount').textContent='Results';
  document.getElementById('hcProgressFill').style.width='100%';
  const flagged=HC_Q.filter((q,idx)=>hcState.answers[idx]);
  const n=flagged.length,total=HC_Q.length;
  let t;
  if(n===0){t='Nothing flagged right now'}
  else if(n<=3){t='A few friction points'}
  else if(n<=8){t='Several friction points worth fixing'}
  else{t='Much of the business is running on workarounds'}

  if(n===0){
    hcState.summary=undefined;
    stage.innerHTML=
      '<div class="hc-q">'+
        '<span class="hc-q-icon">\u{1FA7A}</span>'+
        '<div class="hc-result-title">'+t+'</div>'+
        '<div class="hc-clean-note">None of these sound familiar, which is a good sign. Bookmark this and come back if that changes.</div>'+
        '<div class="cta-row"><button class="wh-cta wh-cta-secondary" onclick="hcRestart()">\u21BA Start over</button></div>'+
      '</div>';
    return;
  }

  let itemsHtml='';
  flagged.forEach(q=>{
    itemsHtml+=
      '<div class="faq-item hc-fold">'+
        '<div class="faq-q" role="button" tabindex="0" aria-expanded="false" onclick="hcFold(this)" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();hcFold(this)}"><span><span style="margin-right:8px">'+q.icon+'</span>'+q.flag+'</span><span class="faq-chevron">\u25BC</span></div>'+
        '<div class="faq-a"><div class="faq-a-inner">'+
          '<div>'+q.stat+'</div>'+
          '<div class="hc-result-item-source" style="margin-top:6px">'+q.source+'</div>'+
          '<button type="button" onclick="openWin(\''+q.svc+'\')" style="background:none;border:none;padding:8px 0 0;color:#2dd4bf;font-size:12px;font-weight:700;cursor:pointer;font-family:var(--sys)">How we help: '+q.svcLabel.replace(/&/g,'&amp;')+' \u2192</button>'+
        '</div></div>'+
      '</div>';
  });

  hcState.summary=flagged.map(q=>q.flag).join('; ');
  const svcCount=new Set(flagged.map(q=>q.svc)).size;

  stage.innerHTML=
    '<div class="hc-q">'+
      '<div class="hc-result-count">'+n+' of '+total+'</div>'+
      '<div class="hc-result-title">'+t+'</div>'+
      '<div class="hc-result-desc">Here\u2019s what each of these can cost, drawn from published research where it exists. Each item names its source, and where there isn\u2019t a reliable figure we say so.</div>'+
      '<div class="cta-row">'+
        '<button class="wh-cta" style="background:#2dd4bf;color:#0a2a26" onclick="hcGoToPricing()"><span style="font-family:\'Apple Color Emoji\',\'Segoe UI Emoji\',\'Noto Color Emoji\',sans-serif">\u{1F527}</span> Add the '+svcCount+' matching service'+(svcCount===1?'':'s')+' to my project and send</button>'+
        '<button class="wh-cta wh-cta-secondary" onclick="hcRestart()">\u21BA Start over</button>'+
      '</div>'+
      '<div style="text-align:right;margin:4px 0 8px"><button type="button" id="hcFoldAll" class="hc-tf-back" style="margin:0" onclick="hcFoldAll()">Expand all</button></div>'+
      '<div class="faq-list hc-result-list" style="max-height:none;overflow:visible">'+itemsHtml+'</div>'+
    '</div>';
}

function hcFold(q){const it=q.parentElement,o=!it.classList.contains('open');it.classList.toggle('open',o);q.setAttribute('aria-expanded',o?'true':'false');hcFoldLabel()}
function hcFoldLabel(){const all=[...document.querySelectorAll('.hc-fold')],btn=document.getElementById('hcFoldAll');if(btn)btn.textContent=all.every(x=>x.classList.contains('open'))?'Collapse all':'Expand all'}
function hcFoldAll(){const all=[...document.querySelectorAll('.hc-fold')],open=!all.every(x=>x.classList.contains('open'));all.forEach(x=>{x.classList.toggle('open',open);x.querySelector('.faq-q').setAttribute('aria-expanded',open?'true':'false')});hcFoldLabel()}
function hcGoToPricing(){
  const before=proj.size;
  HC_Q.forEach((q,i)=>{if(hcState.answers[i]&&q.svc)proj.set(q.svc,q.svcLabel)});
  renderProject();
  if(proj.size>before){setTimeout(()=>{projWiggle();projRing();projCue((proj.size-before)+' service'+(proj.size-before===1?'':'s')+' added. Your project list is here.')},350)}
  openWin('pricing');
}

function hcRestart(){hcState={i:0,answers:[]};hcRender()}
hcRender();

/* ── My project: modules a visitor selects are sent with the intake form ── */
const proj=new Map();
let projOpen=false;
const isSmallScreen=()=>window.matchMedia('(max-width:900px)').matches;
function projSend(){projOpen=false;renderProject();openWin('pricing')}
function placeProjPanel(){
  const tray=document.getElementById('projTray');
  const anchor=isSmallScreen()?document.getElementById('projFab'):document.getElementById('projMb');
  const f=anchor.getBoundingClientRect(),W=window.innerWidth,H=window.innerHeight;
  const w=tray.offsetWidth,hh=tray.offsetHeight;
  const bh=parseInt(getComputedStyle(document.documentElement).getPropertyValue('--bar-h'))||28;
  let x=Math.min(Math.max(12,f.right-w),W-w-12),y;
  if(isSmallScreen()){y=(f.top+f.height/2>H/2)?f.top-hh-8:f.bottom+8}else{y=bh+6}
  y=Math.min(Math.max(bh+4,y),H-hh-8);
  tray.style.left=x+'px';tray.style.top=y+'px';tray.style.right='auto';tray.style.bottom='auto';
}
function makeDraggable(el,handle,onTap,enabled){
  let sx,sy,ox,oy,moved=false,active=false;
  handle.addEventListener('pointerdown',e=>{
    if(enabled&&!enabled())return;
    if(e.target.closest('button')&&e.target.closest('button')!==el)return;
    const r=el.getBoundingClientRect();sx=e.clientX;sy=e.clientY;ox=r.left;oy=r.top;moved=false;active=true;
    try{handle.setPointerCapture(e.pointerId)}catch(_){}
  });
  handle.addEventListener('pointermove',e=>{
    if(!active)return;
    const dx=e.clientX-sx,dy=e.clientY-sy;
    if(!moved&&Math.hypot(dx,dy)<6)return;
    moved=true;
    const bh=parseInt(getComputedStyle(document.documentElement).getPropertyValue('--bar-h'))||28;
    const x=Math.min(Math.max(4,ox+dx),window.innerWidth-el.offsetWidth-4);
    const y=Math.min(Math.max(bh+4,oy+dy),window.innerHeight-el.offsetHeight-4);
    el.style.left=x+'px';el.style.top=y+'px';el.style.right='auto';el.style.bottom='auto';
    if(el.id==='projFab'&&projOpen)placeProjPanel();
  });
  const end=()=>{if(!active)return;active=false;if(!moved&&onTap)onTap()};
  handle.addEventListener('pointerup',end);
  handle.addEventListener('pointercancel',()=>{active=false});
}
(function(){
  const tray=document.getElementById('projTray'),fab=document.getElementById('projFab');
  makeDraggable(fab,fab,()=>{projOpen=!projOpen;renderProject()});
  const mbBtn=document.getElementById('projMb');
  mbBtn.addEventListener('click',()=>{projOpen=!projOpen;renderProject()});
  mbBtn.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();projOpen=!projOpen;renderProject()}});
  document.addEventListener('click',e=>{if(projOpen&&!tray.contains(e.target)&&!fab.contains(e.target)&&!mbBtn.contains(e.target)){projOpen=false;renderProject()}});
  window.addEventListener('resize',()=>{
    renderProject();
    [fab,tray].forEach(el=>{if(el.style.left){const r=el.getBoundingClientRect();if(r.right>window.innerWidth||r.bottom>window.innerHeight){el.style.left=Math.max(4,window.innerWidth-el.offsetWidth-4)+'px';el.style.top=Math.max(30,window.innerHeight-el.offsetHeight-4)+'px'}}});
  });
})();
let pricingBase=null;
function applyPricingParams(){
  const frame=document.getElementById('pricingTallyFrame');if(!frame)return;
  if(pricingBase===null)pricingBase=(frame.getAttribute('data-tally-src')||frame.getAttribute('src')||'').split('&health_check=')[0].split('&modules=')[0];
  let url=pricingBase;
  if(hcState&&hcState.summary)url+='&health_check='+encodeURIComponent(hcState.summary);
  if(proj.size)url+='&modules='+encodeURIComponent([...proj.values()].join(', '));
  if(url!==frame.getAttribute('data-tally-src')){frame.setAttribute('data-tally-src',url);frame.src=url}
}
function renderProject(){
  document.querySelectorAll('[data-proj]').forEach(b=>{
    const on=proj.has(b.dataset.proj);
    b.classList.toggle('added',on);
    b.textContent=on?'✓ Added to my project':b.dataset.label;
    b.setAttribute('aria-pressed',on?'true':'false');
  });
  const tray=document.getElementById('projTray'),chips=document.getElementById('projChips');
  chips.textContent='';
  proj.forEach((label,key)=>{
    const c=document.createElement('span');c.className='proj-chip';
    const t=document.createElement('span');t.textContent=label;
    const x=document.createElement('button');x.type='button';x.textContent='✕';x.setAttribute('aria-label','Remove '+label);
    x.onclick=()=>toggleProject(key,label);
    c.append(t,x);chips.appendChild(c);
  });
  document.getElementById('projCount').textContent='🧺 My project ('+proj.size+')';
  const fab=document.getElementById('projFab');
  const small=isSmallScreen(),mb=document.getElementById('projMb');
  if(!proj.size)projOpen=false;
  fab.classList.toggle('show',small&&proj.size>0);
  document.getElementById('projFabBadge').textContent=proj.size;
  mb.style.display=(!small&&proj.size>0)?'flex':'none';
  document.getElementById('projMbCount').textContent=proj.size;
  tray.classList.toggle('show',projOpen&&proj.size>0);
  if(projOpen&&proj.size>0){placeProjPanel();projOpenedOnce=true;const cu=document.getElementById('projCue');if(cu)cu.classList.remove('show')}
  const note=document.getElementById('projNote');
  if(note){
    if(proj.size){note.textContent='Your enquiry will include: '+[...proj.values()].join(', ')+'.';note.classList.add('show')}
    else{note.textContent='';note.classList.remove('show')}
  }
  applyPricingParams();
}

/* ── "Added to project" feedback: fly-in, wiggle, ring, and a callout pointing at the project icon ── */
const REDUCED=!!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);
let projOpenedOnce=false;
function projTarget(){
  const fab=document.getElementById('projFab'),mb=document.getElementById('projMb');
  if(isSmallScreen())return fab.classList.contains('show')?fab:null;
  return mb.style.display==='flex'?mb:null;
}
function projWiggle(){
  const t=projTarget();if(!t)return;
  t.classList.remove('wiggle');void t.offsetWidth;t.classList.add('wiggle');
  clearTimeout(t._w);t._w=setTimeout(()=>t.classList.remove('wiggle'),1100);
}
function projRing(){
  const t=projTarget();if(!t||REDUCED)return;
  const r=t.getBoundingClientRect(),s=Math.max(r.width,r.height)+6;
  const el=document.createElement('div');el.className='proj-ring';
  el.style.cssText='width:'+s+'px;height:'+s+'px;left:'+(r.left+r.width/2-s/2)+'px;top:'+(r.top+r.height/2-s/2)+'px';
  document.body.appendChild(el);setTimeout(()=>el.remove(),1000);
}
function projCue(text){
  const t=projTarget();if(!t)return;
  let c=document.getElementById('projCue');
  if(!c){c=document.createElement('div');c.id='projCue';c.setAttribute('role','status');
    c.onclick=e=>{e.stopPropagation();c.classList.remove('show');projOpen=true;renderProject()};
    document.body.appendChild(c)}
  c.className='proj-cue';c.textContent=text;
  c.style.maxWidth=Math.min(250,window.innerWidth-24)+'px';
  c.style.visibility='hidden';c.style.display='block';
  const cw=c.offsetWidth,ch=c.offsetHeight;
  c.style.display='';c.style.visibility='';
  const r=t.getBoundingClientRect(),W=window.innerWidth,H=window.innerHeight;
  const below=r.top<H/2;
  const x=Math.min(Math.max(12,r.left+r.width/2-cw/2),W-cw-12);
  c.style.left=x+'px';c.style.top=(below?r.bottom+12:r.top-ch-12)+'px';
  c.style.setProperty('--ax',(r.left+r.width/2-x)+'px');
  c.classList.add(below?'below':'above');void c.offsetWidth;c.classList.add('show');
  clearTimeout(c._t);c._t=setTimeout(()=>c.classList.remove('show'),4200);
}
function projFly(src,label,done){
  const t=projTarget();
  if(!src||!t||REDUCED){done&&done();return}
  const a=src.getBoundingClientRect(),b=t.getBoundingClientRect();
  const sx=a.left+a.width/2,sy=a.top+a.height/2,dx=b.left+b.width/2-sx,dy=b.top+b.height/2-sy;
  const f=document.createElement('div');f.className='proj-fly';f.textContent=label;document.body.appendChild(f);
  f.style.left=(sx-f.offsetWidth/2)+'px';f.style.top=(sy-f.offsetHeight/2)+'px';
  const lift=Math.min(110,Math.abs(dy)*.3+40);
  if(!f.animate){f.remove();done&&done();return}
  const an=f.animate([
    {transform:'translate(0,0) scale(1)',opacity:1},
    {transform:'translate('+(dx*.5)+'px,'+(dy*.5-lift)+'px) scale(.92)',opacity:1,offset:.5},
    {transform:'translate('+dx+'px,'+dy+'px) scale(.2)',opacity:.35}
  ],{duration:800,easing:'cubic-bezier(.45,.05,.25,1)'});
  an.onfinish=()=>{f.remove();done&&done()};
}
function projAddedFx(key,label){
  const src=document.querySelector('[data-proj="'+key+'"]');
  if(src){src.classList.remove('just-added');void src.offsetWidth;src.classList.add('just-added')}
  projFly(src,label,()=>{projWiggle();projRing();projCue('\u2713 '+label+' added. Your project list is here.')});
}
setInterval(()=>{if(proj.size&&!projOpenedOnce&&!projOpen)projWiggle()},7000);

function toggleProject(key,label){
  const l=(new DOMParser().parseFromString(label,'text/html')).documentElement.textContent;
  const adding=!proj.has(key);
  if(adding)proj.set(key,l);else proj.delete(key);
  renderProject();
  if(adding)projAddedFx(key,l);
}
function clearProject(){proj.clear();renderProject()}

const EXP={
  all:[
    {icon:'🩺',name:'Business Health Check',id:'healthcheck'},
    {icon:'🧑‍💼',name:'About Us',id:'about'},{icon:'🎨',name:'UI/UX Design',id:'design'},
    {icon:'⌨️',name:'Development',id:'dev'},{icon:'🏷️',name:'Branding',id:'brand'},
    {icon:'🎥',name:'Motion & Video',id:'motion'},{icon:'🧩',name:'Enterprise Engineering',id:'erp'},{icon:'🗄️',name:'Business Systems',id:'bsys'},{icon:'🚀',name:'Digital & Growth',id:'growth'},
    {icon:'🧭',name:'Strategy',id:'strategy'},
    {icon:'📈',name:'SEO & Growth',id:'seo'},{icon:'💡',name:'What You\'re Getting',id:'whyus'},{icon:'⚙️',name:'Our Process',id:'process'},
    {icon:'💬',name:'Tell Us About You',id:'pricing'},{icon:'💰',name:'How Pricing Works',id:'howpricing'},{icon:'🗂',name:'Portfolio',id:'portfolio'},
    {icon:'📄',name:'Case Studies',id:'casestudy'},
    {icon:'📝',name:'Journal',id:'blog'},{icon:'💼',name:'Careers',id:'careers'},
    {icon:'🏢',name:'Studio Tour',id:'tour'},{icon:'📊',name:'Studio Stats',id:'analytics'},
    {icon:'❓',name:'FAQ',id:'faq'},{icon:'✉️',name:'Contact',id:'contact'},{icon:'💌',name:'Feedback',id:'feedback'},
  ],
  services:[{icon:'🩺',name:'Business Health Check',id:'healthcheck'},{icon:'🧭',name:'Strategy',id:'strategy'},{icon:'🧩',name:'Enterprise Engineering',id:'erp'},{icon:'🗄️',name:'Business Systems',id:'bsys'},{icon:'🚀',name:'Digital & Growth',id:'growth'},{icon:'🔀',name:'Process & Workflow',id:'processdesign'},{icon:'🏛️',name:'Systems Architecture',id:'sysarch'},{icon:'🔗',name:'Integrations',id:'integrations'},{icon:'🧱',name:'Technical Architecture',id:'techarch'},{icon:'🎨',name:'UI/UX Design',id:'design'},{icon:'⌨️',name:'Development',id:'dev'},{icon:'🏷️',name:'Branding',id:'brand'},{icon:'🎥',name:'Motion',id:'motion'},{icon:'📈',name:'SEO',id:'seo'}],
  work:[{icon:'🗂',name:'Portfolio',id:'portfolio'},{icon:'📄',name:'Case Studies',id:'casestudy'},{icon:'📊',name:'Stats',id:'analytics'}],
  studio:[{icon:'🧑‍💼',name:'About Us',id:'about'},{icon:'🛡️',name:'Security & Trust',id:'security'},{icon:'💡',name:'What You\'re Getting',id:'whyus'},{icon:'⚙️',name:'Our Process',id:'process'},{icon:'🗺️',name:'How It All Connects',id:'orgchart'},{icon:'🏢',name:'Studio Tour',id:'tour'},{icon:'📝',name:'Journal',id:'blog'},{icon:'💼',name:'Careers',id:'careers'}],
  contact:[{icon:'✉️',name:'Contact',id:'contact'},{icon:'💌',name:'Feedback',id:'feedback'}],
  pricing:[{icon:'💰',name:'How Pricing Works',id:'howpricing'},{icon:'💬',name:'Tell Us About You',id:'pricing'}],
  about:[{icon:'🧑‍💼',name:'About Us',id:'about'}],
  legal:[{icon:'📋',name:'Terms',id:'terms'},{icon:'🔒',name:'Privacy',id:'privacy'},{icon:'🍪',name:'Cookies',id:'cookies'},{icon:'♿',name:'Accessibility',id:'accessibility'},{icon:'❓',name:'FAQ',id:'faq'}],
};
const EXP_PATH={all:'Broadhut / All Files',services:'Broadhut / Services',work:'Broadhut / Our Work',studio:'Broadhut / Studio',contact:'Broadhut / Contact',pricing:'Broadhut / Pricing',about:'Broadhut / About',legal:'Broadhut / Legal'};
let expH=['all'],expI=0;
function expRender(f){
  const files=EXP[f]||[];
  if(!document.getElementById('expGrid'))return;
  document.getElementById('expGrid').innerHTML=files.map(x=>`<div class="exp-file" onclick="openWin('${x.id}')" title="${x.name}"><span class="exp-file-icon">${x.icon}</span><span class="exp-file-name">${x.name}</span></div>`).join('');
  document.getElementById('expPath').textContent=EXP_PATH[f]||'Broadhut';
  document.getElementById('expStatus').textContent=files.length+' item'+(files.length!==1?'s':'');
  document.querySelectorAll('.exp-side-item').forEach(s=>s.classList.toggle('active',s.id==='expSide-'+f));
}
function expOpenFolder(f){expH=expH.slice(0,expI+1);expH.push(f);expI=expH.length-1;expRender(f)}
function expNav(d){expI=Math.max(0,Math.min(expH.length-1,expI+d));expRender(expH[expI])}
expRender('all');

const defer = window.requestIdleCallback || (fn => setTimeout(fn, 100));

if('serviceWorker' in navigator){
  defer(()=>{
    navigator.serviceWorker.register('/sw.js').catch(()=>{});
  });
}

defer(()=>{
  document.querySelectorAll('.wf-inp').forEach(inp=>{
    inp.setAttribute('autocomplete', inp.getAttribute('autocomplete')||'on');
  });
});


(function(){
  if(localStorage.getItem('uc_consent')) return;
  defer(()=>{
    const banner=document.createElement('div');
    banner.id='cookieBanner';
    banner.setAttribute('role','dialog');
    banner.setAttribute('aria-label','Cookie consent');
    banner.innerHTML=`
      <div style="position:fixed;bottom:calc(var(--footer-h) + 8px);left:50%;transform:translateX(-50%);z-index:9999;
        background:var(--bar-bg);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);
        border:1px solid var(--bar-border);border-radius:14px;padding:14px 18px;
        display:flex;align-items:center;gap:14px;max-width:min(680px,94vw);width:100%;
        font-size:12.5px;color:var(--text);">
        <span style="font-size:18px">🍪</span>
        <span style="flex:1;line-height:1.5;opacity:.85">We use essential and analytics cookies to improve your experience. <span style="text-decoration:underline;cursor:pointer;opacity:.7" onclick="openWin('cookies')">Cookie Policy</span></span>
        <button onclick="document.getElementById('cookieBanner').remove();localStorage.setItem('uc_consent','all')"
          style="background:#a8e063;color:#0a1a00;border:none;border-radius:8px;padding:8px 16px;font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap;font-family:var(--sys)">Accept All</button>
        <button onclick="document.getElementById('cookieBanner').remove();localStorage.setItem('uc_consent','essential')"
          style="background:var(--feat-bg);color:var(--text);border:1px solid var(--feat-border);border-radius:8px;padding:8px 14px;font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap;font-family:var(--sys)">Essential only</button>
      </div>`;
    document.body.appendChild(banner);
  });
})();

(function(){
  const skip=document.createElement('a');
  skip.href='#desktop';skip.textContent='Skip to main content';
  skip.style.cssText='position:fixed;top:-100px;left:16px;z-index:9999;background:var(--green);color:#000;padding:8px 16px;border-radius:0 0 8px 8px;font-weight:700;font-size:13px;transition:top .15s;text-decoration:none';
  skip.addEventListener('focus',()=>skip.style.top='0');
  skip.addEventListener('blur',()=>skip.style.top='-100px');
  document.body.prepend(skip);
})();

/* A page for a single window arrives with that window already in the HTML: place it on the desktop */
(function(){
  const id=document.body.getAttribute('data-open');if(!id)return;
  const w=getWin(id);if(!w)return;
  const bh=parseInt(getComputedStyle(document.documentElement).getPropertyValue('--bar-h'))||28;
  w.style.top=(bh+14)+'px';w.style.left=Math.max(8,(window.innerWidth-w.offsetWidth)/2)+'px';
  bringFront(w);
  const di=getDI(id);if(di)di.classList.add('open');
  if(id==='contact'||id==='pricing'||id==='feedback')ensureTally();
  if(id==='pricing')applyPricingParams();
  onWinLoaded(id);
  history.replaceState({win:id},'',location.pathname);
})();
