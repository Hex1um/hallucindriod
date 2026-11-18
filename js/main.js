/* ============ 幻卓 Huandroid · 主程序 ============ */
(function(){
  const D=window.OS_DATA;
  const {APPS,DOCK_IDS,FOLDERS,WORDS,randInt,pick}=D;
  const $=id=>document.getElementById(id);

  const appGrid=$('appGrid'),dock=$('dock'),drawerGrid=$('drawerGrid'),drawer=$('drawer');
  const drawerLabel=$('drawerLabel');
  const controlCenter=$('controlCenter');
  const lockscreen=$('lockscreen'),toastEl=$('toast');

  // ---------- 社交数据（父窗口持久化，iframe 通过 postMessage 读写） ----------
  const SOCIAL_KEY='huandroid_social_v1';
  function loadSocial(){
    try{
      const raw=localStorage.getItem(SOCIAL_KEY);
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
  }
  function renderDrawerGrid(list){
    drawerGrid.innerHTML='';
    list.forEach(app=>drawerGrid.appendChild(iconEl(app,'app-item',()=>window.ENGINE.openApp(app.id))));
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
