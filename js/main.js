/* ============ 幻卓 Huandroid · 主程序 ============ */
(function(){
  const D=window.OS_DATA;
  const {APPS,DOCK_IDS,WORDS,randInt}=D;
  const $=id=>document.getElementById(id);

  const appGrid=$('appGrid'),dock=$('dock'),drawerGrid=$('drawerGrid'),drawer=$('drawer');
  const searchInput=$('searchInput'),drawerEmpty=$('drawerEmpty'),drawerLabel=$('drawerLabel');
  const improviseName=$('improviseName'),controlCenter=$('controlCenter');
  const lockscreen=$('lockscreen'),toastEl=$('toast');

  let pendingWord=''; // 抽屉里待现编的词

  // ---------- 图标 ----------
  function iconEl(app,cls,onClick){
    const el=document.createElement('div');
    el.className=cls;
    el.innerHTML='<div class="'+(cls==='app-item'?'app-icon':'dock-item')+'" style="background:linear-gradient(135deg,'+app.grad[0]+','+app.grad[1]+')">'+app.icon+'</div>'
      +(cls==='app-item'?'<div class="app-name">'+app.name+'</div>':'');
    el.title=app.name+'（点开现编）';
    el.addEventListener('click',onClick);
    return el;
  }
  function renderIcons(){
    appGrid.innerHTML='';
    APPS.forEach((app,i)=>{
      appGrid.appendChild(iconEl(app,'app-item',()=>{
        // 桌面图标每次点开都重新现编，不缓存
        window.ENGINE.openApp(app.id);
      }));
    });
    dock.innerHTML='';
    DOCK_IDS.forEach(id=>{
      const app=APPS.find(a=>a.id===id);
      if(!app)return;
      dock.appendChild(iconEl(app,'dock-item',()=>window.ENGINE.openApp(app.id)));
    });
    drawerGrid.innerHTML='';
    APPS.forEach(app=>{
      drawerGrid.appendChild(iconEl(app,'app-item',()=>window.ENGINE.openApp(app.id)));
    });
  }

  // ---------- 抽屉搜索 ----------
  function openDrawer(){drawer.classList.add('open');closeControlCenter();setTimeout(()=>searchInput.focus(),250)}
  function closeDrawer(){drawer.classList.remove('open');searchInput.blur()}
  function doSearch(){
    const q=searchInput.value.trim();
    if(!q){drawerEmpty.hidden=true;drawerGrid.style.display='';drawerLabel.textContent='全部应用 · 点开即现编';return}
    const hit=APPS.filter(a=>(a.name+a.kw).toLowerCase().includes(q.toLowerCase()));
    if(hit.length){
      drawerEmpty.hidden=true;drawerGrid.style.display='';
      drawerLabel.textContent='找到 '+hit.length+' 个应用';
      drawerGrid.innerHTML='';
      hit.forEach(app=>drawerGrid.appendChild(iconEl(app,'app-item',()=>window.ENGINE.openApp(app.id))));
    }else{
      drawerGrid.style.display='none';
      drawerEmpty.hidden=false;
      pendingWord=q;
      improviseName.textContent=q;
    }
  }
  function improvise(){
    if(!pendingWord)return;
    // 用一个特殊 id 触发通用现编
    window.ENGINE.openApp('__generic__',pendingWord);
  }

  // ---------- 控制中心 ----------
  function openControlCenter(){controlCenter.classList.add('open');closeDrawer()}
  function closeControlCenter(){controlCenter.classList.remove('open')}

  // ---------- Toast ----------
  let toastTimer;
  function toast(msg){
    toastEl.textContent=msg;toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer=setTimeout(()=>toastEl.classList.remove('show'),2200);
  }

  // ---------- 时钟 ----------
  const WEEK=['星期日','星期一','星期二','星期三','星期四','星期五','星期六'];
  function tickClock(){
    const d=new Date();
    const hh=String(d.getHours()).padStart(2,'0'),mm=String(d.getMinutes()).padStart(2,'0');
    const hm=hh+':'+mm;
    $('sbTime').textContent=hm;
    $('widgetClock').textContent=hm;
    $('lsClock').textContent=hm;
    const md=(d.getMonth()+1)+'月'+d.getDate()+'日';
    $('widgetDate').textContent=WEEK[d.getDay()]+' · '+md;
    $('lsDate').textContent=md+' '+WEEK[d.getDay()];
  }
  setInterval(tickClock,1000);tickClock();

  // 随机换问候语
  const tips=WORDS.toastTips.concat(['保持呼吸，保持幻觉','今日宜：现编一个应用','系统提示：你正在使用的是幻觉设备']);
  $('widgetTip').textContent=pick(tips);

  // ---------- 锁屏交互 ----------
  function unlock(){
    lockscreen.classList.add('hidden');
    setTimeout(()=>{toast('✦ 已解锁 · 点任意应用开始现编')},350);
  }
  lockscreen.addEventListener('click',e=>{
    if(e.target.closest('.ls-flash')||e.target.closest('.ls-camera'))return;
    unlock();
  });
  // 上滑解锁
  let touchStartY=null;
  lockscreen.addEventListener('touchstart',e=>{touchStartY=e.touches[0].clientY},{passive:true});
  lockscreen.addEventListener('touchend',e=>{
    if(touchStartY===null)return;
    const dy=touchStartY-e.changedTouches[0].clientY;
    if(dy>50)unlock();
    touchStartY=null;
  },{passive:true});
  $('lsFlash').addEventListener('click',e=>{e.stopPropagation();e.currentTarget.classList.toggle('on');toast(e.currentTarget.classList.contains('on')?'🔦 手电筒已打开（幻觉光）':'🔦 已关闭')});
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
  document.querySelectorAll('.cc-tile').forEach(t=>t.addEventListener('click',()=>toast(t.querySelector('.cct').textContent+' 已切换')));

  // ---------- 桌面手势：上滑进抽屉，下滑关 ----------
  let hy=null;
  const home=$('homeScreen');
  home.addEventListener('touchstart',e=>{hy=e.touches[0].clientY},{passive:true});
  home.addEventListener('touchend',e=>{
    if(hy===null)return;
    const dy=hy-e.changedTouches[0].clientY;
    if(dy>60)openDrawer();
    hy=null;
  },{passive:true});

  // ---------- 搜索事件 ----------
  searchInput.addEventListener('input',doSearch);
  $('improviseBtn').addEventListener('click',improvise);

  // ---------- 手势条：在应用内点一下返回桌面 ----------
  $('gestureBar').style.pointerEvents='auto';
  $('gestureBar').style.cursor='pointer';
  $('gestureBar').addEventListener('click',()=>{
    if(!$('appLayer').hidden){window.ENGINE.closeApp();return}
    if(drawer.classList.contains('open')){closeDrawer();return}
    if(controlCenter.classList.contains('open'))closeControlCenter();
  });

  // ---------- 对外接口 ----------
  window.HOS={
    toast,
    closePanels(){closeDrawer();closeControlCenter()},
    refreshIcons(){renderIcons()},
    openDrawer,closeDrawer
  };

  // ---------- 启动 ----------
  renderIcons();
  // 首次进入也随机打个招呼
  setTimeout(()=>toast('✦ 点图标，AI 当场现编'),700);

})();
