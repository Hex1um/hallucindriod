/* ============ Hallucindriod · 幻卓 · 主程序 ============ */
(function(){
  const D=window.OS_DATA;
  const {APPS,DOCK_IDS,FOLDERS,WORDS,randInt,pick}=D;
  const $=id=>document.getElementById(id);

  const appGrid=$('appGrid'),dock=$('dock'),drawerGrid=$('drawerGrid'),drawer=$('drawer');
  const drawerLabel=$('drawerLabel');
  const controlCenter=$('controlCenter');
  const lockscreen=$('lockscreen'),toastEl=$('toast');

  // ---------- 音频桥：iframe 是沙箱，拿不到用户手势，由父窗口统一发声 ----------
  const AUDIO={
    ac:null,
    ensure(){
      if(!this.ac){
        const AC=window.AudioContext||window.webkitAudioContext;
        if(!AC)return null;
        try{ this.ac=new AC(); }catch(e){ return null }
      }
      if(this.ac.state==='suspended'){ try{ this.ac.resume(); }catch(e){} }
      return this.ac;
    },
    tone(freq,dur,vol,type){
      const ac=this.ensure();
      if(!ac||!freq||!isFinite(freq))return false;
      try{
        const t=ac.currentTime+0.01;
        const o=ac.createOscillator(),g=ac.createGain();
        o.type=type||'sine';
        o.frequency.value=freq;
        g.gain.setValueAtTime(0.0001,t);
        g.gain.exponentialRampToValueAtTime(Math.max(0.002,vol||0.15),t+0.02);
        g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
        o.connect(g);g.connect(ac.destination);
        o.start(t);o.stop(t+dur+0.06);
        return true;
      }catch(e){ return false }
    }
  };
  window.AUDIO=AUDIO;
  // 首次任何交互就初始化音频上下文（浏览器要求手势），后续 iframe 里的声音才响得出来
  ['pointerdown','touchstart','keydown'].forEach(function(ev){
    document.addEventListener(ev,function(){ AUDIO.ensure(); },{once:true,capture:true});
  });

  // ---------- 桌面布局（拖拽顺序 / 隐藏） ----------
  const LAYOUT_KEY='hallucindriod_layout_v1';
  function loadLayout(){
    try{
      const o=JSON.parse(localStorage.getItem(LAYOUT_KEY)||'{}');
      return {order:Array.isArray(o.order)?o.order:[],hidden:Array.isArray(o.hidden)?o.hidden:[]};
    }catch(e){ return {order:[],hidden:[]} }
  }
  function saveLayout(l){
    try{ localStorage.setItem(LAYOUT_KEY,JSON.stringify(l)); }catch(e){}
  }
  let LAYOUT=loadLayout();

  // ---------- 已安装应用（应用商店下载到桌面） ----------
  const INSTALL_KEY='hallucindriod_installed_v1';
  function loadInstalled(){
    try{
      const a=JSON.parse(localStorage.getItem(INSTALL_KEY)||'[]');
      return Array.isArray(a)?a:[];
    }catch(e){ return [] }
  }
  function saveInstalled(list){
    try{ localStorage.setItem(INSTALL_KEY,JSON.stringify(list)); }catch(e){}
  }
  window.__INSTALLED=loadInstalled();

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
  const MSG_LIMIT=50;
  function saveSocial(d){
    // 每个会话只保留最近 50 条，避免长年累积顶爆 localStorage 配额
    try{
      (d&&Array.isArray(d.friends)?d.friends:[]).forEach(f=>{
        if(Array.isArray(f.msgs)&&f.msgs.length>MSG_LIMIT)f.msgs=f.msgs.slice(-MSG_LIMIT);
      });
      localStorage.setItem(SOCIAL_KEY,JSON.stringify(d));
    }catch(e){
      if(window.HOS&&window.HOS.toast)window.HOS.toast('本地存储空间不足，部分消息未保存');
    }
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
  const ESC=D.escHTML;
  function iconInner(app){
    // 应用名/图标可能来自 LLM 或 DNA 链接：一律转义后再进父页面 innerHTML
    const svg=app.svg||('<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:27px;background:linear-gradient(135deg,'+app.grad[0]+','+app.grad[1]+')">'+ESC(app.icon)+'</div>');
    return svg;
  }
  // 桌面可见应用 = 内置 + 已安装，按保存的顺序排，过滤已隐藏
  function desktopApps(){
    const seen={};
    const all=[];
    APPS.filter(a=>!a.hidden).forEach(a=>{ if(!seen[a.id]){seen[a.id]=1;all.push({...a,custom:false})} });
    (window.__INSTALLED||[]).forEach(a=>{
      if(seen[a.id])return;
      seen[a.id]=1;
      const hs=[[265,320],[200,265],[160,200],[25,320],[340,265],[230,160],[90,160]];
      let h=0;for(let i=0;i<a.name.length;i++)h=(h*31+a.name.charCodeAt(i))>>>0;
      const pr=hs[h%hs.length];
      all.push({id:a.id,name:a.name,icon:a.emoji||'✦',custom:true,
        grad:['hsl('+pr[0]+' 85% 64%)','hsl('+pr[1]+' 85% 56%)']});
    });
    const visible=all.filter(a=>LAYOUT.hidden.indexOf(a.id)<0);
    if(LAYOUT.order.length){
      const pos=id=>{const i=LAYOUT.order.indexOf(id);return i<0?9999:i};
      visible.sort((a,b)=>pos(a.id)-pos(b.id));
    }
    return visible;
  }
  function hideApp(id){
    if(LAYOUT.hidden.indexOf(id)<0)LAYOUT.hidden.push(id);
    LAYOUT.order=LAYOUT.order.filter(x=>x!==id);
    saveLayout(LAYOUT);
  }
  function restoreAllApps(){
    LAYOUT.hidden=[];
    saveLayout(LAYOUT);
    renderIcons();
  }
  function iconEl(app,cls,onClick){
    const el=document.createElement('div');
    el.className=cls;
    const isDock=cls==='dock-item';
    el.innerHTML='<div class="'+(isDock?'dock-item':'app-icon')+'" style="'+(app.svg?'':'background:linear-gradient(135deg,'+app.grad[0]+','+app.grad[1]+')')+'">'+iconInner(app)+'</div>'
      +(isDock?'':'<div class="app-del">×</div><div class="app-name">'+ESC(app.name)+'</div>');
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

  // ---------- 桌面：长按编辑 / 拖拽排序 / 删除 ----------
  let EDIT_MODE=false, lpTimer=null, drag=null;

  function setEditMode(on){
    EDIT_MODE=on;
    document.body.classList.toggle('desk-edit',on);
    if(!on){ if(drag)endDrag(null); }
  }
  const DRAG_START_PX=8;   // 超过这个位移才算"拖"，否则算"点"
  function bindDesktopIcon(el){
    let lpStart=null, pressDown=null;
    el.addEventListener('pointerdown',e=>{
      if(e.button!==undefined&&e.button!==0)return;
      pressDown={x:e.clientX,y:e.clientY};
      if(EDIT_MODE){
        // 编辑模式：先只记录起点，等真的移动了再开始拖（避免"点一下图标位置就变"）
        return;
      }
      clearTimeout(lpTimer);
      lpStart={x:e.clientX,y:e.clientY};
      lpTimer=setTimeout(()=>{ setEditMode(true); },520);
    });
    el.addEventListener('pointerup',()=>{ clearTimeout(lpTimer); lpStart=null; pressDown=null });
    el.addEventListener('pointercancel',()=>{ clearTimeout(lpTimer); lpStart=null; pressDown=null });
    el.addEventListener('pointermove',e=>{
      if(drag){ moveDrag(e); return }
      if(!pressDown)return;
      const dist=Math.hypot(e.clientX-pressDown.x,e.clientY-pressDown.y);
      if(EDIT_MODE){
        if(dist>DRAG_START_PX){ startDrag(e,el,pressDown); pressDown=null }
        return;
      }
      // 非编辑模式：明显位移判定为翻页手势，取消长按
      if(dist>DRAG_START_PX) clearTimeout(lpTimer);
    });
    el.addEventListener('contextmenu',e=>e.preventDefault());
  }

  function startDrag(e,el,origin){
    if(drag)return;
    const r=el.getBoundingClientRect();
    const sx=(origin||{}).x!==undefined?origin.x:e.clientX;
    const sy=(origin||{}).y!==undefined?origin.y:e.clientY;
    const ghost=el.cloneNode(true);
    ghost.classList.add('drag-ghost');
    ghost.style.cssText='position:fixed;z-index:999;pointer-events:none;left:'+r.left+'px;top:'+r.top+'px;width:'+r.width+'px;height:'+r.height+'px';
    document.body.appendChild(ghost);
    el.classList.add('drag-src');
    drag={el,ghost,ox:sx-r.left,oy:sy-r.top,sx:sx,sy:sy};
    try{ el.setPointerCapture&&el.setPointerCapture(e.pointerId) }catch(err){}
    document.addEventListener('pointermove',onDocMove);
    document.addEventListener('pointerup',onDocUp);
  }
  function moveDrag(e){
    if(!drag)return;
    drag.ghost.style.left=(e.clientX-drag.ox)+'px';
    drag.ghost.style.top=(e.clientY-drag.oy)+'px';
    // 实时高亮落点
    const target=hitTest(e.clientX,e.clientY);
    document.querySelectorAll('.app-item.drop-hi').forEach(x=>x.classList.remove('drop-hi'));
    if(target&&target!==drag.el)target.classList.add('drop-hi');
  }
  function hitTest(x,y){
    const items=[...appGrid.querySelectorAll('.app-item')].filter(el=>el!==(drag&&drag.el));
    let best=null,bd=1e9;
    items.forEach(el=>{
      const r=el.getBoundingClientRect();
      const cx=r.left+r.width/2, cy=r.top+r.height/2;
      const d=(cx-x)*(cx-x)+(cy-y)*(cy-y);
      if(d<bd){bd=d;best=el}
    });
    return best;
  }
  function onDocMove(e){ moveDrag(e) }
  function onDocUp(e){
    if(!drag){ endDrag(null); return }
    const moved=Math.hypot(e.clientX-drag.sx,e.clientY-drag.sy)>DRAG_START_PX;
    // 没移动 = 只是点了一下，不做任何交换
    endDrag(moved?hitTest(e.clientX,e.clientY):null);
  }
  function endDrag(target){
    document.removeEventListener('pointermove',onDocMove);
    document.removeEventListener('pointerup',onDocUp);
    if(!drag)return;
    const {el,ghost}=drag;
    ghost.remove();
    el.classList.remove('drag-src');
    document.querySelectorAll('.app-item.drop-hi').forEach(x=>x.classList.remove('drop-hi'));
    if(target&&target!==el){
      // 交换顺序并持久化
      const ids=desktopApps().map(a=>a.id);
      const from=ids.indexOf(el.dataset.id);
      const to=ids.indexOf(target.dataset.id);
      if(from>=0&&to>=0){
        ids.splice(from,1);
        ids.splice(to,0,el.dataset.id);
        LAYOUT.order=ids;
        saveLayout(LAYOUT);
      }
    }
    const swapped=!!(target&&target!==el);
    drag=null;
    if(swapped)renderIcons();
  }

  function removeApp(id,name){
    const isBuiltin=APPS.some(a=>a.id===id);
    if(isBuiltin){
      hideApp(id);
      toast('已从桌面移除「'+name+'」（设置里可恢复）');
    }else{
      window.__INSTALLED=(window.__INSTALLED||[]).filter(a=>a.id!==id);
      if(window.HOS&&window.HOS.saveInstalled)window.HOS.saveInstalled(window.__INSTALLED);
      toast('已删除「'+name+'」');
    }
    renderIcons();
  }

  // 图标上的删除按钮
  document.addEventListener('click',e=>{
    const del=e.target.closest&&e.target.closest('.app-del');
    if(del){
      e.stopPropagation();
      const item=del.closest('.app-item');
      if(item&&confirm('移除「'+(item.dataset.name||'应用')+'」？'))removeApp(item.dataset.id,item.dataset.name||'应用');
      return;
    }
    if(EDIT_MODE&&!e.target.closest('.app-item'))setEditMode(false);
  });

  function renderIcons(){
    appGrid.innerHTML='';
    FOLDERS.forEach(f=>appGrid.appendChild(folderEl(f)));
    desktopApps().forEach(app=>{
      const el=iconEl(app,'app-item',()=>{
        if(EDIT_MODE)return;                       // 编辑模式下不打开应用
        window.ENGINE.openApp(app.id,app.name);
      });
      el.dataset.id=app.id;
      el.dataset.name=app.name;
      appGrid.appendChild(el);
      bindDesktopIcon(el);
    });
    dock.innerHTML='';
    DOCK_IDS.forEach(id=>{
      const app=APPS.find(a=>a.id===id);
      if(!app)return;
      dock.appendChild(iconEl(app,'dock-item',()=>window.ENGINE.openApp(app.id)));
    });
    renderDrawerGrid(APPS.filter(a=>!a.hidden));
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
  // ---------- 今日命运卡（playbook ①）：每天第一次解锁时出现 ----------
  const FATE_KEY='hallucindriod_fate_seen';
  function showFateCard(){
    const Dd=window.OS_DATA;
    if(!Dd||!Dd.ensurePersona)return;
    let w=null;
    try{ w=Dd.ensurePersona() }catch(e){ return }
    if(!w||!w.persona)return;
    const today=new Date().toISOString().slice(0,10);
    let seen='';
    try{ seen=localStorage.getItem(FATE_KEY)||'' }catch(e){}
    if(seen===today)return;                       // 今天已经看过
    const card=$('fateCard');
    if(!card)return;
    $('fateRole').textContent=w.persona.role||'未知身份';
    $('fateTrait').textContent=w.persona.trait||'';
    $('fateLine').textContent=w.persona.line||'';
    $('fateCity').textContent='你在 '+w.city;
    card.hidden=false;
    const ok=$('fateOk');
    const dismiss=()=>{
      card.hidden=true;
      try{ localStorage.setItem(FATE_KEY,today) }catch(e){}
    };
    if(ok)ok.onclick=dismiss;
    card.onclick=e=>{ if(e.target===card)dismiss() };
  }
  // 故障模式：置信度很低时整机进入"做梦"状态（playbook ④）
  const DREAM_THRESHOLD=0.15;
  function syncDreamState(){
    const cfg=(window.OS_DATA&&window.OS_DATA.CONFIG)||{};
    const conf=typeof cfg.confidence==='number'?cfg.confidence:0.35;
    const on=conf<DREAM_THRESHOLD;
    document.body.classList.toggle('dreaming',on);
    const tag=document.getElementById('dreamTag');
    if(tag)tag.hidden=!on;
    return on;
  }
  window.addEventListener('hallucindriod:config',syncDreamState);
  setTimeout(syncDreamState,300);

  // 按系统人格取提示语
  function toneTip(){
    const Dd=window.OS_DATA||{};
    const key=(Dd.CONFIG&&Dd.CONFIG.persona)||'none';
    const P=Dd.PERSONAS&&Dd.PERSONAS[key];
    if(document.body.classList.contains('dreaming')){
      return pick(['系统正在做梦…','梦里出现了不存在的应用','别叫醒它','这个城市还在成形']);
    }
    if(P&&P.tip&&P.tip.length)return pick(P.tip);
    return pick(WORDS.toastTips);
  }

  let dnaOpened=false;
  function unlock(){
    lockscreen.classList.add('hidden');
    // 通过 #dna= 链接进来：解锁后直接打开分享的应用
    if(!dnaOpened && /[#&]dna=/.test(location.hash||'')){
      dnaOpened=true;
      setTimeout(()=>{
        if(window.ENGINE&&window.ENGINE.openFromDNA){
          window.ENGINE.openFromDNA().then(ok=>{
            if(!ok)toast('这个分享链接已损坏');
          });
        }
      },420);
      return;
    }
    setTimeout(()=>{ showFateCard(); toast(toneTip()) },400);
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
    saveInstalled,
    restoreAllApps,
    reloadInstalled(){ window.__INSTALLED=loadInstalled(); return window.__INSTALLED; },
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
