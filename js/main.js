/* ============ Hallucindriod · 幻卓 · 主程序 ============ */
(function(){
  const D=window.OS_DATA;
  const {APPS,DOCK_IDS,FOLDERS,WORDS,randInt,pick}=D;
  const $=id=>document.getElementById(id);

  const appGrid=$('appGrid'),dock=$('dock'),drawerGrid=$('drawerGrid'),drawer=$('drawer');
  const drawerLabel=$('drawerLabel');
  const controlCenter=$('controlCenter');
  const lockscreen=$('lockscreen'),toastEl=$('toast');

  // ---------- 社交数据（父窗口持久化，iframe 通过 postMessage 读写） ----------
  const SOCIAL_KEY='hallucindriod_social_v1';
  const LEGACY_SOCIAL_KEY='huandroid_social_v1';
  function loadSocial(){
    try{
      let raw=localStorage.getItem(SOCIAL_KEY);
      // 兼容改名前的旧数据：读到旧 key 就迁移到新 key
      if(!raw){
        const legacy=localStorage.getItem(LEGACY_SOCIAL_KEY);
        if(legacy){
          raw=legacy;
          localStorage.setItem(SOCIAL_KEY,legacy);
          localStorage.removeItem(LEGACY_SOCIAL_KEY);
        }
      }
      const o=raw?JSON.parse(raw):null;
      if(o&&typeof o==='object')return {profile:o.profile||null,friends:Array.isArray(o.friends)?o.friends:[]};
    }catch(e){}
    return {profile:null,friends:[]};
  }
  function saveSocial(d){
    try{ localStorage.setItem(SOCIAL_KEY,JSON.stringify(d)); }catch(e){}
  }
  window.__SOCIAL = loadSocial();

  // ---------- 图标 ----------
  // 图标内容自动光学居中：按实际 bbox 平移，修正视觉重心偏移
  function centerIconSvg(svg){
    if(!svg)return;
    const g=svg.querySelector('g.ic');
    if(!g)return;
    try{
      const b=g.getBBox();
      if(!b.width||!b.height)return;
      const dx=32-(b.x+b.width/2), dy=32-(b.y+b.height/2);
      if(Math.abs(dx)>=1.2||Math.abs(dy)>=1.2){
        g.setAttribute('transform','translate('+dx.toFixed(2)+','+dy.toFixed(2)+')');
      }
    }catch(e){}
  }
  function centerAllIcons(){
    document.querySelectorAll('.app-icon svg,.dock-item svg,.mini svg,.folder-box svg').forEach(centerIconSvg);
  }
  function iconInner(app){
    const svg=app.svg||('<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:27px;background:linear-gradient(135deg,'+app.grad[0]+','+app.grad[1]+')">'+app.icon+'</div>');
    return svg;
  }
  function iconEl(app,cls,onClick){
    const el=document.createElement('div');
    el.className=cls;
    const isDock=cls==='dock-item';
    el.innerHTML='<div class="'+(isDock?'dock-item':'app-icon')+'" style="'+(app.svg?'':'background:linear-gradient(135deg,'+app.grad[0]+','+app.grad[1]+')')+'">'+iconInner(app)+'</div>'
      +(isDock?'':'<div class="app-name">'+app.name+'</div>');
    // dock-item 本身就是可点击元素，避免内层重复类名导致事件误判
    if(isDock){ el.classList.remove('dock-item'); }
    el.title=app.name;
    el.addEventListener('click',onClick);
    return el;
  }
  function folderEl(folder){
    const el=document.createElement('div');
    el.className='folder-item';
    const minis=folder.ids.slice(0,4).map((id,i)=>{
      const a=APPS.find(x=>x.id===id);
      return a?'<div class="mini m'+i+'">'+a.svg+'</div>':'';
    }).join('');
    el.innerHTML='<div class="folder-box">'+minis+'</div><div class="app-name">'+folder.name+'</div>';
    el.title=folder.name;
    el.addEventListener('click',()=>openDrawer());
    return el;
  }
  // 第二屏：外部 Web 应用（不经过 LLM，直接加载站点）
  const BORDER_ICON='<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">'
    +'<defs><linearGradient id="bopsBg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3f4a35"/><stop offset="1" stop-color="#0f1511"/></linearGradient></defs>'
    +'<rect x="0" y="0" width="64" height="64" rx="15" fill="url(#bopsBg)"/>'
    +'<g class="ic"><circle cx="32" cy="32" r="15.5" fill="none" stroke="#a3e635" stroke-width="2.6"/>'
    +'<circle cx="32" cy="32" r="3.2" fill="#a3e635"/>'
    +'<path d="M32 11v8.5M32 44.5V53M11 32h8.5M44.5 32H53" stroke="#a3e635" stroke-width="2.6" stroke-linecap="round"/></g></svg>';
  function renderPage2(){
    const grid2=$('appGrid2');
    if(!grid2)return;
    grid2.innerHTML='';
    const bops=document.createElement('div');
    bops.className='app-item';
    bops.title='BORDER OPS';
    bops.innerHTML='<div class="app-icon">'+BORDER_ICON+'</div><div class="app-name">BORDER OPS</div>';
    bops.addEventListener('click',()=>{
      if(window.ENGINE&&window.ENGINE.openExternal)window.ENGINE.openExternal('https://hex1um.github.io/borderops/','BORDER OPS');
    });
    grid2.appendChild(bops);
    centerAllIcons();
  }

  function renderIcons(){
    appGrid.innerHTML='';
    FOLDERS.forEach(f=>appGrid.appendChild(folderEl(f)));
    APPS.forEach(app=>{
      appGrid.appendChild(iconEl(app,'app-item',()=>window.ENGINE.openApp(app.id)));
    });
    dock.innerHTML='';
    DOCK_IDS.forEach(id=>{
      const app=APPS.find(a=>a.id===id);
      if(!app)return;
      dock.appendChild(iconEl(app,'dock-item',()=>window.ENGINE.openApp(app.id)));
    });
    renderDrawerGrid(APPS);
    renderPage2();
    centerAllIcons();
    // 图标字体/布局就绪后再校正一次
    setTimeout(centerAllIcons,60);
  }
  function renderDrawerGrid(list){
    drawerGrid.innerHTML='';
    list.forEach(app=>drawerGrid.appendChild(iconEl(app,'app-item',()=>window.ENGINE.openApp(app.id))));
  }

  // ---------- 桌面分页：左右滑动 ----------
  const homePages=$('homePages'),pageDots=$('pageDots');
  function syncDots(){
    if(!homePages||!pageDots)return;
    const idx=Math.round(homePages.scrollLeft/Math.max(1,homePages.clientWidth));
    [...pageDots.children].forEach((d,i)=>d.classList.toggle('active',i===idx));
  }
  if(homePages){
    homePages.addEventListener('scroll',syncDots,{passive:true});
    // 桌面也支持鼠标/触控拖拽换页（桌面浏览器没有横向滚动条时）
    let dragX=null,dragStartLeft=0;
    homePages.addEventListener('touchstart',e=>{dragX=e.touches[0].clientX;dragStartLeft=homePages.scrollLeft},{passive:true});
    homePages.addEventListener('touchend',e=>{
      if(dragX===null)return;
      const dx=dragX-e.changedTouches[0].clientX;
      if(Math.abs(dx)>50)homePages.scrollTo({left:dragStartLeft+(dx>0?homePages.clientWidth:-homePages.clientWidth),behavior:'smooth'});
      dragX=null;
    },{passive:true});
  }

  // ---------- 抽屉（无搜索栏，搜索统一在应用商店内） ----------
  function openDrawer(){drawer.classList.add('open');closeControlCenter();if(drawerLabel)drawerLabel.textContent='全部应用'}
  function closeDrawer(){drawer.classList.remove('open')}

  // ---------- 控制中心 ----------
  function openControlCenter(){controlCenter.classList.add('open');closeDrawer()}
  function closeControlCenter(){controlCenter.classList.remove('open')}

  // 供智能终端调用：按名称开关某个系统开关（可在后台生效，不必打开面板）
  function setToggle(name, value){
    const map={wifi:'移动数据',无线:'移动数据',无线网:'移动数据',数据:'移动数据',移动数据:'移动数据',数据网络:'移动数据',
      蓝牙:'蓝牙',飞行:'飞行模式',飞行模式:'飞行模式',手电:'手电筒',手电筒:'手电筒',
      勿扰:'勿扰模式',勿扰模式:'勿扰模式',旋转:'自动旋转',自动旋转:'自动旋转'};
    const raw=String(name||'').trim();
    const label=map[raw]||raw;
    let tile=null;
    document.querySelectorAll('.cc-tile').forEach(t=>{
      const c=t.querySelector('.cct');
      if(c&&c.textContent===label)tile=t;
    });
    if(!tile){ toast('未找到开关「'+label+'」'); return false; }
    const on=tile.classList.contains('on');
    const want=(typeof value==='boolean')?value:!on;
    tile.classList.toggle('on',want);
    toast(label+(want?'已开启':'已关闭'));
    return true;
  }
  // 供智能终端调用：锁屏 / 解锁
  function lockScreen(){lockscreen.classList.remove('hidden')}

  // ---------- Toast ----------
  let toastTimer;
  function toast(msg){
    toastEl.textContent=msg;toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer=setTimeout(()=>toastEl.classList.remove('show'),2000);
  }

  // ---------- 时钟 / 农历 / 电量 ----------
  const WEEK=['星期日','星期一','星期二','星期三','星期四','星期五','星期六'];
  function tickClock(){
    const d=new Date();
    const hh=String(d.getHours()).padStart(2,'0'),mm=String(d.getMinutes()).padStart(2,'0');
    const hm=hh+':'+mm;
    const md=(d.getMonth()+1)+'月'+d.getDate()+'日';
    const lunar=D.lunarDate(d);
    $('sbTime').textContent=hm;
    $('widgetClock').textContent=hm;
    $('lsClock').textContent=hm;
    $('widgetDate').textContent=WEEK[d.getDay()]+' · '+md;
    $('widgetLunar').textContent=lunar;
    $('lsDate').textContent=md+' '+WEEK[d.getDay()];
    $('lsLunar').textContent=lunar;
  }
  setInterval(tickClock,1000);tickClock();
  // 电量：尽量用浏览器电量 API，失败用固定值
  if(navigator.getBattery){
    navigator.getBattery().then(b=>{$('sbPct').textContent=Math.round(b.level*100)}).catch(()=>{});
  }

  // ---------- 锁屏交互 ----------
  function unlock(){
    lockscreen.classList.add('hidden');
    setTimeout(()=>toast(pick(WORDS.toastTips)),400);
  }
  lockscreen.addEventListener('click',e=>{
    if(e.target.closest('.ls-flash')||e.target.closest('.ls-camera'))return;
    unlock();
  });
  let touchStartY=null;
  lockscreen.addEventListener('touchstart',e=>{touchStartY=e.touches[0].clientY},{passive:true});
  lockscreen.addEventListener('touchend',e=>{
    if(touchStartY===null)return;
    const dy=touchStartY-e.changedTouches[0].clientY;
    if(dy>50)unlock();
    touchStartY=null;
  },{passive:true});
  $('lsFlash').addEventListener('click',e=>{e.stopPropagation();e.currentTarget.classList.toggle('on');toast(e.currentTarget.classList.contains('on')?'手电筒已开启':'手电筒已关闭')});
  $('lsCamera').addEventListener('click',e=>{e.stopPropagation();unlock();setTimeout(()=>window.ENGINE.openApp('camera'),400)});
  $('lsNotif').addEventListener('click',e=>{e.stopPropagation();unlock()});

  // ---------- 状态栏下拉控制中心 ----------
  $('statusbar').addEventListener('click',()=>{controlCenter.classList.contains('open')?closeControlCenter():openControlCenter()});
  controlCenter.addEventListener('click',e=>{
    if(e.target.closest('[data-toggle]')){
      const t=e.target.closest('[data-toggle]');t.classList.toggle('on');return;
    }
    if(!e.target.closest('.cc-slider'))closeControlCenter();
  });
  document.querySelectorAll('.cc-tile').forEach(t=>t.addEventListener('click',()=>{
    const label=t.querySelector('.cct').textContent;
    toast(label+(t.classList.contains('on')?'已开启':'已关闭'));
  }));

  // ---------- 桌面手势：上滑不再打开「全部应用」抽屉 ----------
  // 按用户要求：上拉时不展示全部应用列表。上滑手势不触发任何面板。
  let hy=null;
  const home=$('homeScreen');
  home.addEventListener('touchstart',e=>{hy=e.touches[0].clientY},{passive:true});
  home.addEventListener('touchend',e=>{hy=null},{passive:true});

  // ---------- 三键导航 ----------
  function goHome(){
    if(!$('appLayer').hidden){window.ENGINE.closeApp();return}
    if(drawer.classList.contains('open')){closeDrawer();return}
    if(controlCenter.classList.contains('open')){closeControlCenter();return}
    $('homeScreen').scrollTo({top:0,behavior:'smooth'});
  }
  $('navHome').addEventListener('click',goHome);
  $('navBack').addEventListener('click',()=>{
    if(!$('appLayer').hidden){window.ENGINE.closeApp();return}
    if(drawer.classList.contains('open')){closeDrawer();return}
    closeControlCenter();
  });
  $('navRecents').addEventListener('click',()=>toast('最近任务：暂无运行中的应用'));

  // ---------- 对外接口 ----------
  window.HOS={
    toast,
    closePanels(){closeDrawer();closeControlCenter()},
    refreshIcons(){renderIcons()},
    openDrawer,closeDrawer,
    openControlCenter,closeControlCenter,
    setToggle,lockScreen,
    get social(){ return window.__SOCIAL; },
    saveSocial,
    reloadSocial(){ window.__SOCIAL=loadSocial(); return window.__SOCIAL; }
  };

  // ---------- 启动 ----------
  renderIcons();

  // 空闲时后台预热所有应用数据：用户点开任意应用时通常已有缓存，无需久等
  function scheduleWarmup(){
    const run=()=>{ if(window.ENGINE&&window.ENGINE.warmup)window.ENGINE.warmup(false); };
    if(window.requestIdleCallback)requestIdleCallback(run,{timeout:2500});
    else setTimeout(run,1800);
  }
  setTimeout(scheduleWarmup,1500);

})();
