/* ============ Hallucindriod · 幻卓 · 现编引擎 ============
 * openApp(): 打印代码瀑布 → 沙箱 iframe 现场渲染应用
 *
 * 缓存策略（三步）：
 *   1. dataCache —— 大模型返回的数据，按应用 id 缓存，命中即秒开
 *   2. viewCache —— 上次渲染的完整文档，退出再进直接恢复，不重新初始化
 *   3. webState  —— 浏览器上次访问的网页
 *   主动再生：regen() / 设置里的「刷新数据」会清掉对应缓存并重新请求。
 *   后台预热：warmup() 串行预取；prefetchRelated() 在打开应用后并行预取关联应用。
 */
(function(){
  const D=window.OS_DATA;
  const {pick,randInt,APPS,escHTML,safeText}=D;
  const genLayer=document.getElementById('genLayer');
  const terminal=document.getElementById('genTerminal');
  const genName=document.getElementById('genAppName');
  const bar=document.getElementById('genProgressBar');
  const stat=document.getElementById('genStat');
  const sourceEl=document.getElementById('genSource');
  const appLayer=document.getElementById('appLayer');
  const frame=document.getElementById('appFrame');
  let currentId=null,currentName=null,busy=false;
  let currentDNA=null;   // 当前应用的分享快照

  // ---------- 数据缓存 / 预热 / 视图快照 ----------
  // dataCache: app id -> LLM 数据（命中即秒开，不重复请求）
  // pending:   app id -> 正在进行的请求（并发去重）
  // viewCache: app id -> 上次渲染的完整文档（退出再进直接恢复）
  const dataCache={}, pending={}, viewCache={};
  // 浏览器上次访问的页面（持久化到本地，刷新页面也能恢复）
  const WEBSTATE_KEY='hallucindriod_webstate_v1';
  let webState=null;
  try{
    const raw=localStorage.getItem(WEBSTATE_KEY);
    if(raw){ const o=JSON.parse(raw); if(o&&o.data)webState=o; }
  }catch(e){}
  function setWebState(v){
    webState=v;
    try{
      if(v&&v.data)localStorage.setItem(WEBSTATE_KEY,JSON.stringify(v));
      else localStorage.removeItem(WEBSTATE_KEY);
    }catch(e){}
  }

  function preload(id,name){
    if(id==='terminal')return Promise.resolve(null);
    if(id in dataCache)return Promise.resolve(dataCache[id]);
    if(pending[id])return pending[id];
    if(!window.LLM)return Promise.resolve(null);
    const p=window.LLM.fetchHallucination(id,name)
      .then(d=>{ dataCache[id]=d||null; delete pending[id]; return dataCache[id]; })
      .catch(()=>{ dataCache[id]=null; delete pending[id]; return null; });
    pending[id]=p;
    return p;
  }

  // 后台预热：串行匀速，用户一有操作就立刻让路，避免抢占带宽把用户请求拖超时
  let warming=false, warmCursor=0, warmPauseUntil=0;
  function noteUserActivity(){ warmPauseUntil=Date.now()+20000; }
  async function warmup(force){
    if(force){ warmCursor=0; warmPauseUntil=0; }
    if(warming)return;
    warming=true;
    // 只预热 Dock 里的常用应用（原来预热全部 12 个，对免费端点压力过大且易触发限流）
    const dockIds=new Set(D.DOCK_IDS||[]);
    const list=APPS.filter(a=>a.id!=='terminal'&&a.id!=='browser'&&dockIds.has(a.id));
    while(warmCursor<list.length){
      if(Date.now()<warmPauseUntil)break;          // 用户在操作，先让路
      const a=list[warmCursor];
      if(!(a.id in dataCache)){ await preload(a.id,a.name); }
      warmCursor++;
      await new Promise(r=>setTimeout(r,900));
    }
    warming=false;
    // 没跑完就稍后继续（用户空闲时）
    if(warmCursor<list.length)setTimeout(()=>{ try{ if(Date.now()>=warmPauseUntil)warmup(false); }catch(e){} },24000);
  }

  // 刷新数据：id 为空=全部。清缓存后后台重新预热
  function refreshData(id){
    if(id){
      delete dataCache[id]; delete viewCache[id];
    }else{
      Object.keys(dataCache).forEach(k=>delete dataCache[k]);
      Object.keys(viewCache).forEach(k=>delete viewCache[k]);
    }
    warmup(true);
    return true;
  }
  function hasCache(id){ return id in dataCache; }

  // 伪造的「现场编写代码」——不同应用略有差异
  function codeLines(name,id){
    // 应用名来自商店/消息，属于不可信输入：限长 + 转义后再拼进父页面 DOM
    name=safeText(name,20);
    const comp=pick(['App','View','Screen','Panel','Widget']);
    const varN=pick(['state','model','vm','ctx','core']);
    const col=pick(['#a78bfa','#7dd3fc','#5eead4','#f472b6']);
    return [
      '<span class="cm">// 幻卓应用市场 · 正在构建「'+name+'」</span>',
      '<span class="kw">import</span> { createApp, render } <span class="kw">from</span> <span class="str">"@hallucindriod/core"</span>',
      '',
      '<span class="kw">const</span> '+varN+' = <span class="fn">createApp</span>({',
      '  name: <span class="str">"'+name+'"</span>,',
      '  theme: <span class="str">"'+pick(['light','dark','auto'])+'"</span>,',
      '  version: <span class="str">"'+randInt(1,9)+'.'+randInt(0,9)+'.'+randInt(0,9)+'"</span>,',
      '  color: <span class="str">"'+col+'"</span>',
      '})',
      '',
      '<span class="kw">function</span> <span class="fn">'+comp+'</span>() {',
      '  <span class="kw">const</span> data = '+varN+'.<span class="fn">load</span>()',
      '  <span class="kw">return</span> <span class="str">&lt;Layout theme={data.theme}&gt;</span>',
      '    <span class="str">&lt;Header title={data.title} /&gt;</span>',
      '    <span class="str">&lt;Body {...data.content} /&gt;</span>',
      '    <span class="str">&lt;/Layout&gt;</span>',
      '}',
      '',
      '<span class="fn">render</span>(<'+comp+' />)',
      '<span class="cm">// ✓ 编译通过 · 正在安装到设备</span>'
    ];
  }

  // 逐行打印代码瀑布，完成后 resolve；fast=true 时命中缓存，动画大幅缩短
  function printCode(name,id,fast){
    return new Promise(resolve=>{
      const lines=codeLines(name,id);
      terminal.innerHTML='';
      bar.style.width='0%';
      let i=0;
      const total=lines.length;
      const gap=fast?12:randInt(55,110);
      const tick=()=>{
        if(i>=total){setTimeout(resolve,fast?40:180);return}
        const d=document.createElement('div');
        d.className='ln';
        d.innerHTML=lines[i]||'&nbsp;';
        terminal.appendChild(d);
        // 保持可视区域在底部
        terminal.scrollTop=terminal.scrollHeight;
        i++;
        bar.style.width=Math.round(i/total*100)+'%';
        stat.textContent='正在编译 '+Math.round(i/total*100)+'%';
        if(sourceEl)sourceEl.textContent='正在准备应用数据…';
        setTimeout(tick,gap);
      };
      tick();
    });
  }

  let openQueued=null;
  async function openApp(id,name,opts){
    if(busy){ openQueued=[id,name,opts]; return; }   // 排队，别静默丢掉
    // 预言命中：刚从 A 走进来时预取过的应用，用户确实点开了
    if(prophecy && prophecy.from!==id && prophecy.to.indexOf(id)>=0 && !(opts&&opts.dna)){
      const n=bumpProphecy();
      prophecy=null;
      setTimeout(()=>showProphecy(n),900);
    }
    noteUserActivity();
    const app=(APPS.find(a=>a.id===id));
    name=name||(app&&app.name)||'应用';

    // 退出再进入：有视图快照就直接恢复，不重新初始化
    if(!(opts&&opts.force) && viewCache[id]){
      currentId=id;currentName=name;
      if(window.HOS&&window.HOS.closePanels)window.HOS.closePanels();
      genLayer.hidden=true;
      appLayer.hidden=false;
      frame.srcdoc=viewCache[id];
      return;
    }

    currentId=id;currentName=name;busy=true;

    // 先关抽屉/控制中心
    if(window.HOS&&window.HOS.closePanels)window.HOS.closePanels();

    genName.textContent=name;
    genLayer.hidden=false;
    appLayer.hidden=true;

    // 并行：动画 + 在线生成内容（命中缓存则极快）
    if(sourceEl)sourceEl.textContent='正在连接网络…';
    const inRegistry=APPS.some(a=>a.id===id);
    const forced=(opts&&opts.data!==undefined)?opts.data:undefined;
    const cached=hasCache(id)||id==='terminal'||id==='browser'||!inRegistry||forced!==undefined;
    const llmPromise = (forced!==undefined)
      ? Promise.resolve(forced)
      : ((id==='terminal'||id==='browser') ? Promise.resolve(null) : preload(id,name));
    await printCode(name,id,cached);
    // 等待上限：内置应用 3.5s；商店自装的通用应用只需 0.9s（本地模板已足够）
    // 超时就用本地内容先把应用打开，LLM 结果留在缓存里供下次使用
    const waitMs = inRegistry ? 3500 : 900;
    let llmData = null;
    if(forced!==undefined){
      llmData = forced;          // DNA 分享：直接用冻结的数据，不等待、不请求
    }else{
      try{
        llmData = await Promise.race([
          llmPromise,
          new Promise(r=>setTimeout(()=>r(null),waitMs))
        ]);
      }catch(e){ llmData=null; }
    }
    // 追加内容来源状态行
    const d=document.createElement('div');
    d.className='ln';
    const usedSrc=window.__LLM_SOURCE||'';
    d.innerHTML = llmData
      ? '<span class="str">// ✓ 内容来源：'+usedSrc+'</span>'
      : '<span class="cm">// 网络暂不可用，已载入本地内容</span>';
    terminal.appendChild(d);
    terminal.scrollTop=terminal.scrollHeight;
    bar.style.width='100%';
    stat.textContent='安装准备就绪';
    if(sourceEl)sourceEl.textContent=llmData?('已连接 · '+usedSrc):'离线模式';
    await new Promise(r=>setTimeout(r,220));

    // 现场生成 HTML（永不缓存）
    // builders 在父窗口执行，临时挂上 LLM 数据和当前配置供其读取
    if(llmData) window.__LLM=llmData; else delete window.__LLM;
    window.__CFG=D.CONFIG;
    let html;
    try{
      html=(window.APP_BUILDERS[id]||window.improviseGeneric)(name);
    }catch(e){
      html=window.improviseGeneric(name);
    }
    delete window.__LLM;
    delete window.__CFG;
    // 把 LLM 数据 + 当前配置注入到沙箱文档最前面
    if(llmData){
      const payload=JSON.stringify(llmData).replace(/</g,'\\u003c');
      html=html.replace('</head>','<script>window.__LLM='+payload+';<\/script></head>');
    }
    // 只下发非敏感配置：apiKey 绝不进 iframe（任何应用被注入脚本都读不到 Key）
    const safeCfg={confidence:D.CONFIG.confidence,model:D.CONFIG.model,apiBase:D.CONFIG.apiBase,hasKey:!!D.CONFIG.apiKey};
    const cfgPayload=JSON.stringify(safeCfg).replace(/</g,'\\u003c');
    // 系统身份一并下发（应用里显示"你是谁"用）
    let identPayload='null';
    try{
      const idn=D.loadIdentity?D.loadIdentity():null;
      if(idn&&idn.name)identPayload=JSON.stringify({name:idn.name,avatar:idn.avatar,bio:idn.bio}).replace(/</g,'\\u003c');
    }catch(e){}
    html=html.replace('</head>','<script>window.__CFG='+cfgPayload+';window.__IDENTITY='+identPayload+';<\/script></head>');
    // 浏览器：恢复上次访问的页面
    if(id==='browser'&&webState&&webState.data){
      const ws=JSON.stringify(webState).replace(/</g,'\\u003c');
      html=html.replace('</head>','<script>window.__WEB_RESTORE='+ws+';<\/script></head>');
    }
    // 先切到可见状态，再写入 srcdoc —— 避免 iframe 在 display:none 下加载后不重新布局
    genLayer.hidden=true;
    appLayer.hidden=false;
    frame.srcdoc=html;
    busy=false;
    if(opts&&opts.toast)window.HOS.toast(opts.toast);

    // 记录本次生成的"DNA"（可分享快照）
    if(id==='__external__'||id==='terminal'){
      currentDNA=null;
    }else{
      currentDNA={v:DNA_VER,i:id,n:name,d:llmData||null,t:Date.now()};
      // 若是超时降级渲染（数据还没回来），后台继续等，拿到后补进快照
      if(!llmData && forced===undefined && id!=='browser'){
        const dnaRef=currentDNA;
        llmPromise.then(d=>{ if(d&&dnaRef) dnaRef.d=d; }).catch(()=>{});
      }
    }
    const sb=document.getElementById('dnaShare');
    if(sb){
      sb.hidden=!currentDNA;
      // 有标题栏的应用放右上角；无标题栏（bare）的应用下移，避免压住它自己的头部
      sb.style.top=html.indexOf('class="abar"')>=0?'10px':'48px';
      sb.onclick=function(e){ e.stopPropagation(); shareCurrent(); };
    }
    if(!(opts&&opts.dna)){
      const bn=document.getElementById('dnaBanner');
      if(bn)bn.hidden=true;
    }

    // 应用已经显示出来 → 并行预取「接下来可能打开」的应用，用户切过去就能秒开
    if(id!=='terminal'&&id!=='browser'){
      setTimeout(()=>{ try{ prefetchRelated(id); }catch(e){} },520);
    }
    // 有排队的打开请求（例如终端一次执行多个动作）→ 接着打开
    if(openQueued){
      const q=openQueued; openQueued=null;
      setTimeout(()=>{ try{ openApp(q[0],q[1],q[2]); }catch(e){} },80);
    }
  }

  function closeApp(){
    // 保存当前视图快照：再次进入直接恢复，不重新初始化（浏览器由 webState 单独管理）
    if(currentId && currentId!=='browser' && currentId!=='__external__' && frame.srcdoc && frame.srcdoc.length>200){
      viewCache[currentId]=frame.srcdoc;
    }
    // 外部应用：卸载站点、恢复默认沙箱
    if(currentId==='__external__'){
      try{ frame.removeAttribute('src'); }catch(e){}
      frame.setAttribute('sandbox',FRAME_SANDBOX);
      const back=document.getElementById('extBack');
      if(back)back.hidden=true;
    }
    currentId=null;currentName=null;currentDNA=null;
    appLayer.hidden=true;
    const sb=document.getElementById('dnaShare'); if(sb)sb.hidden=true;
    const bn=document.getElementById('dnaBanner'); if(bn)bn.hidden=true;
    frame.srcdoc='<html><body style="background:#0d0e14"></body></html>';
  }

  function regen(){
    if(currentId===null)return;
    const id=currentId,name=currentName;
    delete viewCache[id]; delete dataCache[id];
    appLayer.hidden=true;
    openApp(id,name,{force:true});
  }

  // 通用：iframe 请求父窗口用 LLM 现场生成内容（browser / store）
  async function llmGen(kind,topic,nonce){
    noteUserActivity();
    let data=null;
    if(window.LLM){
      try{ data=await window.LLM.fetchHallucination(kind,topic); }catch(e){ data=null; }
    }
    if(frame&&frame.contentWindow){
      const msg=kind==='store'
        ? {type:'storedata',data:data,keyword:topic,nonce:nonce}
        : {type:'webdata',data:data,topic:topic,nonce:nonce,kind:kind};
      try{ frame.contentWindow.postMessage(msg,'*'); }catch(e){}
    }
  }

  // ---------- 智能终端：自然语言 → 意图 → 系统动作 ----------
  // 离线兜底：LLM 不可用时用关键词规则解析，保证终端始终可用
  function localIntent(text){
    const t=String(text||'');
    const has=w=>t.indexOf(w)>=0;
    const acts=[];
    const off=has('关闭')||has('关掉')||has('断开')||has('关一下');
    // 安装/下载应用
    const mInstall=t.match(/(?:下载|安装|装上|装个|装一个)\s*[「"]?([^」"，,。\s]{1,12})/);
    if(mInstall&&!has('打开')){
      acts.push({type:'installApp',target:mInstall[1],label:'安装 '+mInstall[1]});
      return {reply:'正在安装「'+mInstall[1]+'」',actions:acts};
    }
    // 给某人发消息
    const mMsg=t.match(/(?:给|跟|和)\s*([^\s，,]{1,10})\s*(?:发|说|告诉|讲)\s*(?:个|一条|下)?\s*(?:消息|短信)?[：:，,]?\s*(.+)/);
    if(mMsg){
      acts.push({type:'message',target:mMsg[1],text:mMsg[2].slice(0,40),label:'发给 '+mMsg[1]});
      return {reply:'已发给'+mMsg[1],actions:acts};
    }
    // 改名字
    const mName=t.match(/(?:叫我|我叫|改名|名字改成|以后叫)\s*[「"]?([^」"，,。\s]{1,12})/);
    if(mName){
      acts.push({type:'setIdentity',target:mName[1],label:'改名'});
      return {reply:'好，以后就叫'+mName[1],actions:acts};
    }
    // 换语气
    const mTone=t.match(/(?:换成|切换|用)\s*(毒舌|温柔|中二|翻译腔|默认)\s*(?:人格|语气|口吻)?/);
    if(mTone){
      acts.push({type:'setPersona',target:mTone[1],label:'切语气'});
      return {reply:'换成'+mTone[1]+'语气',actions:acts};
    }
    // 推进世界 / 分享
    if(/推进.*(一天|世界)|世界.*(推进|演化)/.test(t)){ acts.push({type:'evolveWorld',target:'',label:'推进世界'}); return {reply:'世界正在向前',actions:acts} }
    if(/分享.*(这个|当前|页面)|生成.*链接/.test(t)){ acts.push({type:'shareApp',target:'',label:'分享'}); return {reply:'正在生成链接',actions:acts} }
    // 系统开关
    const toggles=[['手电','手电筒'],['飞行','飞行模式'],['蓝牙','蓝牙'],['勿扰','勿扰模式'],['旋转','自动旋转'],['wifi','移动数据'],['WIFI','移动数据'],['无线','移动数据'],['移动数据','移动数据'],['数据网络','移动数据']];
    toggles.forEach(([kw,label])=>{
      if(has(kw)&&!acts.some(a=>a.type==='toggle'&&a.target===label)){
        acts.push({type:'toggle',target:label,label:(off?'关闭':'开启')+label,value:!off});
      }
    });
    // 应用
    const appMap=[['相机','相机'],['拍照','相机'],['天气','天气'],['气温','天气'],['计算','计算器'],['相册','相册'],['照片','相册'],
      ['音乐','音乐'],['听歌','音乐'],['地图','地图'],['导航','地图'],['商店','应用商店'],['下载','应用商店'],['安装','应用商店'],
      ['浏览器','浏览器'],['上网','浏览器'],['网页','浏览器'],['短信','短信'],['消息','短信'],['电话','电话'],['拨号','电话'],
      ['设置','设置'],['终端','智能终端']];
    appMap.forEach(([kw,name])=>{
      if(has(kw)&&!acts.some(a=>a.type==='openApp'&&a.target===name)){
        acts.push({type:'openApp',target:name,label:'打开'+name});
      }
    });
    if(off&&!acts.length)return {reply:'好的，已为你关闭',actions:[{type:'closeApp',target:'',label:'关闭当前应用'}]};
    if(acts.length)return {reply:'好的，正在为你执行',actions:acts.slice(0,3)};
    return {reply:'我可以帮你打开应用、开关系统功能、搜索应用。试试「打开相机」或「开启手电筒」',actions:[]};
  }

  // 执行单个动作
  function runAction(a){
    if(!a)return;
    const t=String(a.target||'').trim();
    switch(a.type){
      case 'openApp':{
        const app=APPS.find(x=>x.name===t)||APPS.find(x=>x.id===t)||APPS.find(x=>x.kw.indexOf(t)>=0);
        if(app){ openApp(app.id,app.name,{}); }
        else if(window.HOS)window.HOS.toast('未找到应用「'+t+'」');
        break;
      }
      case 'closeApp': closeApp(); break;
      case 'toast': if(window.HOS)window.HOS.toast(t||a.label||'完成'); break;
      case 'toggle': if(window.HOS&&window.HOS.setToggle)window.HOS.setToggle(t||a.label,a.value); break;
      case 'call': openApp('phone','电话',{toast:t?('正在拨打 '+t):''}); break;
      case 'message':{
        // 给好友发消息：真实写入会话并触发 AI 回复
        const social=window.__SOCIAL||(window.__SOCIAL={profile:null,friends:[]});
        if(!Array.isArray(social.friends))social.friends=[];
        const body=String(a.text||a.label||'').replace(/^.*?[:：]\s*/,'').trim();
        if(!body){ openApp('messages','云讯',{}); break }
        let f=social.friends.find(x=>x.name===t)||social.friends[0];
        if(!f){
          // 还没有好友 → 自动建一个，然后把消息发过去
          f={name:t||'新朋友',avatar:pick(['🐱','🌙','🦊','🎧']),isAI:true,msgs:[],unread:0,ts:Date.now()};
          social.friends.unshift(f);
        }
        f.msgs=f.msgs||[];
        f.msgs.push({me:true,text:body,ts:Date.now()});
        f.ts=Date.now();
        if(window.HOS&&window.HOS.saveSocial)window.HOS.saveSocial(social);
        openApp('messages','云讯',{});
        setTimeout(()=>socialReply(f.name,body),900);
        if(window.HOS&&window.HOS.toast)window.HOS.toast('已发送给 '+f.name);
        break;
      }
      case 'browse':{
        // 打开网页：带着目标网址/主题进浏览器
        llmGen('browser',t||'幻卓空间',0);
        openApp('browser','浏览器',{});
        setTimeout(()=>{
          try{ frame.contentWindow.postMessage({type:'webnav',topic:t||'幻卓空间'},'*') }catch(e){}
        },1200);
        break;
      }
      case 'searchApp':{
        openApp('store','应用商店',{});
        if(t)setTimeout(()=>{ try{ frame.contentWindow.postMessage({type:'storenav',q:t},'*') }catch(e){} },1200);
        break;
      }
      case 'installApp':{
        // 下载并安装到桌面
        const nm=String(t||a.label||'新应用').replace(/[<>"']/g,'').slice(0,16);
        if(!nm){ if(window.HOS)window.HOS.toast('没听清要装什么'); break }
        const list=window.__INSTALLED||(window.__INSTALLED=[]);
        if(list.some(x=>x.name===nm)){
          if(window.HOS)window.HOS.toast('「'+nm+'」已经在桌面上了');
          break;
        }
        let hh=0;for(let i=0;i<nm.length;i++)hh=(hh*31+nm.charCodeAt(i))>>>0;
        list.push({id:'custom_'+hh.toString(36),name:nm,emoji:pick(['🧩','🛠️','🎲','🪄','📦','🌀']),desc:'终端下载的应用',installedAt:Date.now()});
        if(window.HOS&&window.HOS.saveInstalled)window.HOS.saveInstalled(list);
        if(window.HOS&&window.HOS.refreshIcons)window.HOS.refreshIcons();
        if(window.HOS&&window.HOS.toast)window.HOS.toast('「'+nm+'」已安装到桌面');
        break;
      }
      case 'setIdentity':{
        const Dd=window.OS_DATA;
        if(!Dd||!Dd.setIdentity){ if(window.HOS)window.HOS.toast('身份模块不可用'); break }
        const id=Dd.setIdentity(t||a.label,'', '');
        if(!id||!id.name){ if(window.HOS)window.HOS.toast('名字不太合适'); break }
        const social=window.__SOCIAL||(window.__SOCIAL={profile:null,friends:[]});
        social.profile={name:id.name,avatar:id.avatar||'🙂',bio:id.bio||'',confidence:5};
        if(window.HOS&&window.HOS.saveSocial)window.HOS.saveSocial(social);
        Object.keys(dataCache).forEach(k=>{ if(k==='chatreply'||k==='friend')delete dataCache[k] });
        if(window.HOS&&window.HOS.toast)window.HOS.toast('以后叫我 '+id.name+' 吧');
        break;
      }
      case 'setPersona':{
        const Dd=window.OS_DATA;
        const keyMap={'毒舌':'snark','温柔':'gentle','中二':'chuuni','翻译腔':'trans','默认':'none'};
        const k=keyMap[t]||'none';
        D.CONFIG.persona=k;
        if(D.saveConfig)D.saveConfig(D.CONFIG);
        Object.keys(dataCache).forEach(x=>delete dataCache[x]);
        if(window.HOS&&window.HOS.toast)window.HOS.toast('语气已切换 · '+t);
        break;
      }
      case 'evolveWorld':
        evolveWorld().then(w=>{ if(window.HOS)window.HOS.toast(w?('世界推进了 · '+(w.hotEvents[0]||'')):'推进失败') });
        break;
      case 'shareApp':
        if(window.HOS&&window.HOS.toast)window.HOS.toast('正在生成分享链接…');
        shareCurrent();
        break;
      case 'screenshot':{
        try{ document.body.classList.add('shot-flash'); setTimeout(()=>document.body.classList.remove('shot-flash'),300) }catch(e){}
        if(window.HOS&&window.HOS.toast)window.HOS.toast('已保存到相册（大概）');
        break;
      }
      default: break;
    }
  }

  // 依次执行动作（留间隔，避免 busy 锁吞掉连续调用）
  function executeActions(actions){
    (actions||[]).slice(0,4).forEach((a,i)=>{ setTimeout(()=>{ try{ runAction(a); }catch(e){} }, i*650); });
  }

  // 终端请求：本地规则优先（秒回），复杂指令再交给 LLM 理解
  async function termGen(text,nonce){
    noteUserActivity();
    const post=data=>{
      if(frame&&frame.contentWindow){
        try{ frame.contentWindow.postMessage({type:'termdata',data:data,nonce:nonce},'*'); }catch(e){}
      }
    };
    const norm=actions=>(actions||[]).slice(0,4).map(a=>({
      type:String(a.type),
      target:a.target==null?'':String(a.target),
      label:a.label||a.target||a.type,
      value:(typeof a.value==='boolean')?a.value:undefined
    }));

    // 1) 本地规则能解析出动作 → 立即响应，不等待网络
    const fb=localIntent(text);
    if(fb.actions&&fb.actions.length){
      const actions=norm(fb.actions);
      // 提前预取终端要打开的应用，动作执行时通常已就绪
      actions.filter(a=>a.type==='openApp').forEach(a=>{
        const app=APPS.find(x=>x.name===a.target||x.id===a.target||x.kw.indexOf(a.target)>=0);
        if(app)preload(app.id,app.name).catch(()=>{});
      });
      post({reply:fb.reply,actions:actions});
      setTimeout(()=>executeActions(actions),420);
      return;
    }

    // 2) 本地无法解析 → 让 LLM 理解自然语言（短窗口，避免久等）
    let data=null;
    if(window.LLM){
      try{ data=await window.LLM.fetchHallucination('terminal',text); }catch(e){ data=null; }
    }
    let reply=(data&&data.reply)||fb.reply;
    let actions=norm((data&&Array.isArray(data.actions))?data.actions.filter(a=>a&&a.type):[]);
    post({reply:reply||'好的',actions:actions});
    if(actions.length)setTimeout(()=>executeActions(actions),420);
  }

  // ---------- 社交：注册 / 加好友 / 聊天回复 ----------
  function socialPush(msg){
    if(frame&&frame.contentWindow){ try{ frame.contentWindow.postMessage(msg,'*'); }catch(e){} }
  }
  function persistSocial(){
    if(window.HOS&&window.HOS.saveSocial)window.HOS.saveSocial(window.__SOCIAL);
  }
  let pendingProbe=null;
  // 搜索用户：只探测资料，不写入好友列表
  async function socialProbe(rawName){
    const name=String(rawName||'').trim().slice(0,12);
    if(!name)return;
    const social=window.__SOCIAL||(window.__SOCIAL={profile:null,friends:[]});
    const exist=(social.friends||[]).find(f=>f.name===name);
    if(exist){ socialPush({type:'social:probed',exists:true,profile:exist}); return; }
    let friend=null;
    if(window.P2P&&window.P2P.findUser){
      try{ friend=await window.P2P.findUser(name); }catch(e){ friend=null; }
    }
    if(!friend){
      let d=null;
      if(window.LLM){ try{ d=await window.LLM.fetchHallucination('friend',name); }catch(e){ d=null; } }
      friend={
        name:name,
        avatar:(d&&d.avatar)||pick(['🐱','🌙','🐷','🦊','🎧','🌟','🍀']),
        level:(d&&d.level)||('Lv'+randInt(1,9)),
        bio:(d&&d.bio)||'这个人很神秘，什么都没留下',
        isAI:true,
        msgs:[{me:false,text:(d&&d.greeting)||('你好，我是'+name),ts:Date.now()}]
      };
    }else{
      friend.isAI=false;
      if(!friend.bio)friend.bio='真人好友 · 当前在线';
      if(!Array.isArray(friend.msgs))friend.msgs=[];
    }
    pendingProbe=friend;
    socialPush({type:'social:probed',exists:false,profile:friend});
  }

  async function socialAddFriend(rawName){
    const name=String(rawName||'').trim().slice(0,12);
    if(!name)return;
    const social=window.__SOCIAL||(window.__SOCIAL={profile:null,friends:[]});
    if(!Array.isArray(social.friends))social.friends=[];
    const exist=social.friends.find(f=>f.name===name);
    if(exist){ socialPush({type:'social:friend',friend:exist,exists:true}); return; }
    // 搜索时已经探测过 → 直接复用，避免二次请求
    let friend=null;
    if(pendingProbe && pendingProbe.name===name){
      friend=pendingProbe; pendingProbe=null;
    }
    // 1) 没有预览结果时才找真人（WebRTC P2P）
    if(!friend && window.P2P && window.P2P.findUser){
      try{ friend=await window.P2P.findUser(name); }catch(e){ friend=null; }
    }
    // 2) 真人不存在 → LLM 生成一个人设账户（保证一定搜得到）
    if(!friend){
      let d=null;
      if(window.LLM){ try{ d=await window.LLM.fetchHallucination('friend',name); }catch(e){ d=null; } }
      friend={
        name:name,
        avatar:(d&&d.avatar)||pick(['🐱','🌙','🐷','🦊','🎧','🌟','🍀']),
        level:(d&&d.level)||('Lv'+randInt(1,9)),
        bio:(d&&d.bio)||'这个人很神秘，什么都没留下',
        isAI:true,
        msgs:[{me:false,text:(d&&d.greeting)||('你好，我是'+name),ts:Date.now()}]
      };
    }
    // 真人好友补齐字段（isAI 由 findUser 返回，不要在这里改成 false）
    if(!Array.isArray(friend.msgs))friend.msgs=[];
    social.friends.unshift(friend);
    persistSocial();
    socialPush({type:'social:friend',friend:friend,exists:false});
  }
  async function socialReply(friendName,text){
    const social=window.__SOCIAL||{friends:[]};
    const f=(social.friends||[]).find(x=>x.name===friendName);
    if(!f)return;
    // 真人好友：直接走 P2P 发出（对方在线才发得出去）
    if(!f.isAI && !f.isGroup && f.peerId && window.P2P && window.P2P.send(f.peerId,{t:'msg',text:text,ts:Date.now()})){
      return;
    }
    // 群聊：随机挑一位成员来回答
    let speaker=friendName, persona=f.bio||'';
    if(f.isGroup && Array.isArray(f.members) && f.members.length){
      speaker=pick(f.members);
      persona='群成员';
    }
    let reply='';
    if(window.LLM){
      const ctx=JSON.stringify({
        me:(social.profile&&social.profile.name)||'我',
        other:speaker,
        persona:persona,
        group:f.isGroup?friendName:'',
        say:text
      });
      try{
        const d=await window.LLM.fetchHallucination('chatreply',ctx);
        if(d&&d.reply)reply=String(d.reply);
      }catch(e){}
    }
    if(!reply){
      // LLM 不可用时的兜底：按对方说话的类型给不同回应，避免每次都回同一句
      const t=String(text||'');
      if(/[?？]|吗|呢|怎么|为什么|哪/.test(t)) reply=pick(['我想想怎么说','这个还真得琢磨一下','让我回忆一下','嗯……有点复杂','你猜猜看']);
      else if(/^(hi|hello|你好|在吗|在不在|嗨)/i.test(t)) reply=pick(['在的，怎么啦','嗨，好久不见','嗯我在','刚看到消息']);
      else if(/谢|thanks|thank/i.test(t)) reply=pick(['客气啦','小事','不用谢','应该的']);
      else if(/哈哈|笑死|hhh/i.test(t)) reply=pick(['哈哈哈哈','笑死我了','你也太逗了','真的假的哈哈']);
      else reply=pick(['确实','说得对','有道理','嗯嗯','我懂','原来如此','那挺好的','然后呢']);
    }
    socialPush({type:'social:reply',friend:friendName,text:(f.isGroup?speaker+'：':'')+reply});
  }

  // 收到真人消息 → 写进好友会话并推给界面
  function bindP2PInbox(){
    if(!window.P2P)return;
    window.P2P.onMessage=function(peerId,msg){
      const social=window.__SOCIAL||(window.__SOCIAL={profile:null,friends:[]});
      const f=(social.friends||[]).find(x=>x.peerId===peerId);
      if(!f)return;
      if(!Array.isArray(f.msgs))f.msgs=[];
      f.msgs.push({me:false,text:msg.text,ts:msg.ts});
      f.ts=msg.ts; f.unread=(Number(f.unread)||0)+1;
      persistSocial();
      socialPush({type:'social:reply',friend:f.name,text:msg.text});
      if(window.HOS&&window.HOS.toast)window.HOS.toast('新消息：'+f.name);
    };
  }

  // 打开外部 Web 应用：直接 src 加载站点。
  // 关键：去掉 iframe 的 sandbox —— 否则 opaque origin 会让站点的 localStorage 抛异常，
  // 页面脚本中断后所有按钮都会失效（borderops 就是这样挂掉的）。
  const FRAME_SANDBOX='allow-scripts allow-forms allow-modals allow-popups';
  function openExternal(url,name){
    if(busy)return;
    noteUserActivity();
    currentId='__external__';currentName=name||'外部应用';
    if(window.HOS&&window.HOS.closePanels)window.HOS.closePanels();
    genLayer.hidden=true;
    appLayer.hidden=false;
    // 放宽沙箱，保证站点能正常读写本地存储、运行完整脚本
    frame.setAttribute('sandbox','allow-scripts allow-same-origin allow-forms allow-modals allow-popups allow-downloads allow-popups-to-escape-sandbox');
    frame.removeAttribute('srcdoc');
    frame.src=url;
    const back=document.getElementById('extBack');
    if(back){
      back.hidden=false;
      back.onclick=closeApp;
    }
  }

  // ---------- 应用 DNA：一次生成结果的快照，可编码进 URL 分享 ----------
  const DNA_VER=1;

  function bytesToB64(bytes){
    let s='';
    for(let i=0;i<bytes.length;i++)s+=String.fromCharCode(bytes[i]);
    return btoa(s);
  }
  function b64ToBytes(b64){
    const s=atob(b64);
    const out=new Uint8Array(s.length);
    for(let i=0;i<s.length;i++)out[i]=s.charCodeAt(i);
    return out;
  }

  async function encodeDNA(dna){
    const json=JSON.stringify(dna);
    const raw=new TextEncoder().encode(json);
    // 优先压缩（Chrome 80+ / Safari 16.4+），失败则裸 base64
    try{
      if(typeof CompressionStream!=='undefined'){
        const stream=new Blob([raw]).stream().pipeThrough(new CompressionStream('deflate-raw'));
        const buf=await new Response(stream).arrayBuffer();
        return 'z'+bytesToB64(new Uint8Array(buf));
      }
    }catch(e){}
    return 'r'+bytesToB64(raw);
  }

  async function decodeDNA(code){
    if(!code)return null;
    const tag=code[0], body=code.slice(1);
    let bytes;
    if(tag==='z'){
      if(typeof DecompressionStream==='undefined')return null;
      const stream=new Blob([b64ToBytes(body)]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
      const buf=await new Response(stream).arrayBuffer();
      bytes=new Uint8Array(buf);
    }else if(tag==='r'){
      bytes=b64ToBytes(body);
    }else{
      return null;
    }
    const json=new TextDecoder().decode(bytes);
    const o=JSON.parse(json);
    if(!o||typeof o!=='object'||!o.i)return null;
    // 只接受已知应用 id（或通用兜底），防止 __proto__ / constructor 这类键
    const id=String(o.i);
    const known=Object.prototype.hasOwnProperty.call(window.APP_BUILDERS||{},id);
    if(!known && id!=='__generic__')return null;
    return {v:Number(o.v)||1, i:id, n:String(o.n||'').slice(0,16), d:o.d||null, t:Number(o.t)||Date.now()};
  }

  // 生成分享链接（当前应用有 DNA 才可用）
  async function buildShareLink(){
    if(!currentDNA)return null;
    const snap=currentDNA;
    let data=snap.d;
    // 快照不完整（首次渲染超时降级）：现场再取一次，保证对方看到同一份内容
    if(data===null && snap.i!=='browser'){
      if(window.HOS&&window.HOS.toast)window.HOS.toast('正在冻结当前页面…');
      try{ data=await preload(snap.i,snap.n); }catch(e){ data=null }
      if(data)snap.d=data;
    }
    const code=await encodeDNA({v:DNA_VER,i:snap.i,n:snap.n,d:data,t:snap.t});
    return location.origin+location.pathname+'#dna='+encodeURIComponent(code);
  }

  async function copyText(t){
    try{
      if(navigator.clipboard&&navigator.clipboard.writeText){ await navigator.clipboard.writeText(t); return true }
    }catch(e){}
    try{
      const ta=document.createElement('textarea');
      ta.value=t;ta.style.cssText='position:fixed;left:-9999px;top:0;opacity:0';
      document.body.appendChild(ta);ta.select();
      const ok=document.execCommand('copy');ta.remove();
      return ok;
    }catch(e){ return false }
  }

  async function shareCurrent(){
    const link=await buildShareLink();
    if(!link){ if(window.HOS&&window.HOS.toast)window.HOS.toast('这个页面还没有可分享的快照'); return }
    if(link.length>16000){ if(window.HOS&&window.HOS.toast)window.HOS.toast('内容太大，链接过长'); return }
    if(currentDNA && currentDNA.d===null && currentDNA.i!=='browser'){
      if(window.HOS&&window.HOS.toast)window.HOS.toast('当前无网络，冻结失败；请稍后重试');
      return;
    }

    const sheet=document.getElementById('dnaSheet');
    const input=document.getElementById('dsLink');
    const desc=document.getElementById('dsDesc');
    if(!sheet||!input){ // 兜底：直接复制
      const ok=await copyText(link);
      if(window.HOS&&window.HOS.toast)window.HOS.toast(ok?'✓ 链接已复制':'复制失败，请手动复制');
      return;
    }
    input.value=link;
    if(desc)desc.textContent='对方打开会看到完全一样的「'+(currentDNA&&currentDNA.n?String(currentDNA.n).replace(/[<>&"']/g,''):'应用')+'」';
    sheet.hidden=false;

    const close=()=>{ sheet.hidden=true };
    document.getElementById('dsClose').onclick=close;
    sheet.onclick=e=>{ if(e.target===sheet)close() };
    const copyBtn=document.getElementById('dsCopy');
    copyBtn.onclick=async function(){
      const ok=await copyText(link);
      this.textContent=ok?'✓ 已复制':'请长按选中复制';
      setTimeout(()=>{ this.textContent='复制链接' },1600);
    };
    // 打开面板时顺手尝试复制一次（多数浏览器允许在点击手势内复制）
    copyText(link).then(ok=>{ if(ok)copyBtn.textContent='✓ 已复制';
      setTimeout(()=>{ copyBtn.textContent='复制链接' },2000); });
  }

  // 解析 URL 里的 DNA 并打开（返回是否成功）
  async function openFromDNA(){
    const m=(location.hash||'').match(/[#&]dna=([^&]+)/);
    if(!m)return false;
    let dna=null;
    try{ dna=await decodeDNA(decodeURIComponent(m[1])) }catch(e){ dna=null }
    if(!dna)return false;
    const name=String(dna.n||'').slice(0,16)||'分享的应用';
    const id=String(dna.i||'__generic__').slice(0,32);
    // 用 DNA 里冻结的数据渲染，不重新请求模型
    await openApp(id,name,{data:dna.d||null,dna:true});
    const banner=document.getElementById('dnaBanner');
    if(banner){
      banner.hidden=false;
      banner.innerHTML='<span>这是别人分享的「'+name.replace(/[<>&"']/g,'')+'」快照</span><button id="dnaRegen">生成我的版本</button>';
      const rb=document.getElementById('dnaRegen');
      if(rb)rb.onclick=function(){
        banner.hidden=true;
        history.replaceState(null,'',location.pathname+location.search);
        openApp(id,name,{force:true});
      };
    }
    return true;
  }

  // 拉取公共池（有后端才生效）
  async function fetchPool(){
    const remote=(D.CONFIG&&D.CONFIG.poolUrl)||'';
    if(!remote)return [];
    try{
      const r=await fetch(remote+'?t='+Date.now(),{cache:'no-store'});
      if(!r.ok)return [];
      const j=await r.json();
      return Array.isArray(j&&j.videos)?j.videos.slice(0,20):[];
    }catch(e){ return [] }
  }

  // ---------- 世界演化：让城市有"过去"（playbook ⑪） ----------
  async function evolveWorld(){
    const D=window.OS_DATA;
    if(!D||!D.ensureWorld||!window.LLM)return null;
    const w=D.ensureWorld();
    const ctx=JSON.stringify({
      city:w.city,
      today:w.hotEvents||[],
      yesterday:(w.history&&w.history[0])?w.history[0].events:[],
      lore:(w.lore||[]).slice(-4)
    });
    let d=null;
    try{ d=await window.LLM.fetchHallucination('evolve',ctx) }catch(e){ d=null }
    // 模型不可用 → 本地续写（把今天的事"发酵"成明天的新闻），保证推进总能成功
    if(!d||!Array.isArray(d.events)||!d.events.length){
      const old=(w.hotEvents||[])[0]||'城里的怪事';
      const seeds=[
        '「'+old.slice(0,14)+'」的事到今天还没人解释清楚',
        pick(['有人开始在广场收集这些传闻','市政厅贴出一张看不懂的公告','一场雨把昨天的痕迹冲淡了一半','有家店把这件事做成了招牌']),
        pick(['夜里的路灯比平时亮了三分','有几个陌生人一直在拍照','广播里反复念同一句话','码头的钟慢了十一分钟'])
      ];
      d={events:seeds,echo:['昨天的事，今天变成了新的传闻']};
    }

    w.history=Array.isArray(w.history)?w.history:[];
    w.history.unshift({day:w.day||'',events:(w.hotEvents||[]).slice(0,3)});
    w.history=w.history.slice(0,10);            // 留最近 10 天
    w.hotEvents=d.events.slice(0,3).map(x=>String(x).slice(0,40));
    if(Array.isArray(d.echo)&&d.echo.length){
      w.lore=((w.lore||[]).concat(d.echo.map(x=>String(x).slice(0,40)))).slice(-20);
    }
    w.day=new Date().toISOString().slice(0,10);
    // 顺延命运（新的一天换身份）
    if(D.ensurePersona){
      w.persona=null;
      try{ D.saveWorld(w); const w2=D.ensurePersona(); w.hotEvents=w2.hotEvents; w.persona=w2.persona; w.day=w2.day }catch(e){}
    }
    if(D.saveWorld)D.saveWorld(w);
    // 世界变了 → 旧内容失效
    Object.keys(dataCache).forEach(k=>delete dataCache[k]);
    Object.keys(viewCache).forEach(k=>delete viewCache[k]);
    return w;
  }

  // ---------- 关联预取：打开 A 后并行预取"下一步最可能打开"的应用 ----------
  const RELATED={
    video:['messages','music'],
    music:['video','messages'],
    messages:['phone','video'],
    music:['video','messages'],
    album:['camera','music'],
    camera:['album'],
    browser:['store','video'],
    store:['browser','video'],
    weather:['map','music'],
    map:['weather','music'],
    phone:['messages'],
    calculator:['terminal'],
    settings:[],
    terminal:['video','messages','music']
  };
  const prefetchQueue=[];
  let prefetching=false;
  // 预言：打开 A 时预取 B/C，用户真的点开 B 就算"预言成真"（playbook ⑦）
  let prophecy=null;
  const PROPHECY_KEY='hallucindriod_prophecy_hits';
  function prophecyHits(){ try{ return Number(localStorage.getItem(PROPHECY_KEY)||0)||0 }catch(e){ return 0 } }
  function bumpProphecy(){ const n=prophecyHits()+1; try{ localStorage.setItem(PROPHECY_KEY,String(n)) }catch(e){} return n }
  function showProphecy(n){
    let el=document.getElementById('prophecyFx');
    if(!el){
      el=document.createElement('div');
      el.id='prophecyFx';
      el.className='prophecy-fx';
      document.body.appendChild(el);
    }
    el.innerHTML='<div class="pf-orb">🔮</div><div class="pf-t">预言成真</div><div class="pf-n">第 '+n+' 次</div>';
    el.classList.remove('on'); void el.offsetWidth; el.classList.add('on');
    setTimeout(()=>el.classList.remove('on'),2600);
  }

  function prefetchRelated(id){
    const rel=(RELATED[id]||[]).slice(0,2);
    if(rel.length)prophecy={from:id,to:rel};
    (RELATED[id]||[]).forEach(rid=>{
      if(rid===id)return;
      if(rid in dataCache||pending[rid])return;
      if(prefetchQueue.indexOf(rid)>=0)return;
      prefetchQueue.push(rid);
    });
    drainPrefetch();
  }
  async function drainPrefetch(){
    if(prefetching||!prefetchQueue.length)return;
    prefetching=true;
    while(prefetchQueue.length){
      const batch=prefetchQueue.splice(0,2);   // 两两并发，避免打爆免费源
      await Promise.all(batch.map(rid=>{
        const app=APPS.find(a=>a.id===rid);
        return app?preload(rid,app.name).catch(()=>null):Promise.resolve(null);
      }));
    }
    prefetching=false;
  }

  // 接收 iframe 内部消息
  // 外部站点只允许请求关闭
  const EXTERNAL_ALLOW=['close'];
  // 特权指令 → 唯一允许发送它的应用（最小权限：别的应用即使被注入脚本也改不了系统状态）
  const PRIV_OWNER={
    config:'settings', refresh:'settings', restoreApps:'settings',
    'world:reset':'settings', 'persona:set':'settings', 'world:evolve':'settings',
    'identity:set':'settings', 'identity:random':'settings',
    openSettings:'__any__',
    install:'store', storegen:'store', openapp:'store',
    regen:'__self__',
    webgen:'browser', websearch:'browser', webstate:'browser',
    termgen:'terminal',
    musicsearch:'music', tone:'music',
    videogen:'video', publishVideo:'video',
    'social:register':'messages', 'social:save':'messages', 'social:probe':'messages',
    'social:addfriend':'messages', 'social:reply':'messages'
  };
  window.addEventListener('message',function(e){
    if(!e.data||typeof e.data!=='object')return;
    // ① 只信任当前应用 iframe 发来的消息，其它窗口/页面一律忽略
    if(!frame||e.source!==frame.contentWindow)return;
    // ② 加载第三方站点时，只允许它请求关闭
    if(currentId==='__external__'&&EXTERNAL_ALLOW.indexOf(e.data.type)<0)return;
    // ③ 特权指令必须由对应的应用发出
    const owner=PRIV_OWNER[e.data.type];
    if(owner==='__self__'){ if(!currentId)return; }        // 只能对当前应用自身操作
    else if(owner!=='__any__'&&owner&&currentId!==owner)return;
    if(e.data.type==='close')closeApp();
    else if(e.data.type==='regen')regen();
    else if(e.data.type==='webgen')llmGen('browser',e.data.topic||'幻卓空间',e.data.nonce);
    else if(e.data.type==='websearch')llmGen('websearch',e.data.q||'',e.data.nonce);
    else if(e.data.type==='storegen')llmGen('store',e.data.topic||'应用',e.data.nonce);
    else if(e.data.type==='termgen')termGen(String(e.data.text||''),e.data.nonce);
    else if(e.data.type==='webstate'){ setWebState({topic:e.data.topic||'',data:e.data.data||null}); }
    else if(e.data.type==='social:register'){
      const nm=String(e.data.name||'').trim().slice(0,12);
      if(!nm)return;
      const social=window.__SOCIAL||(window.__SOCIAL={profile:null,friends:[]});
      social.profile={name:nm,avatar:'🙂',createdAt:Date.now()};
      if(!Array.isArray(social.friends))social.friends=[];
      persistSocial();
      // 上线 P2P，让别人能通过用户名找到我（失败不影响本地体验）
      if(window.P2P){ window.P2P.init(nm).catch(()=>{}); }
      socialPush({type:'social:profile',profile:social.profile,friends:social.friends,p2p:window.P2P?window.P2P.status():null});
    }
    else if(e.data.type==='social:probe')socialProbe(e.data.name);
    else if(e.data.type==='social:addfriend')socialAddFriend(e.data.name);
    else if(e.data.type==='social:reply')socialReply(String(e.data.friend||''),String(e.data.text||''));
    else if(e.data.type==='tone'){
      if(window.AUDIO)window.AUDIO.tone(Number(e.data.freq)||0,Number(e.data.dur)||0.25,Number(e.data.vol)||0.1,String(e.data.wave||'sine'));
    }
    else if(e.data.type==='restoreApps'){
      if(window.HOS&&window.HOS.restoreAllApps){ window.HOS.restoreAllApps(); if(window.HOS.toast)window.HOS.toast('已恢复全部应用到桌面'); }
    }
    else if(e.data.type==='install'){
      const a=e.data.app||{};
      const clean=v=>String(v==null?'':v).replace(/[\u0000-\u001f\u007f]/g,'').trim();
      const nm=clean(a.name).slice(0,16);
      if(!nm)return;
      const list=window.__INSTALLED||(window.__INSTALLED=[]);
      if(list.some(x=>x.name===nm)){
        if(window.HOS&&window.HOS.toast)window.HOS.toast('「'+nm+'」已在桌面');
        return;
      }
      let hh=0;for(let i=0;i<nm.length;i++)hh=(hh*31+nm.charCodeAt(i))>>>0;
      // emoji 只保留 4 个字符、desc 限 40 字，避免超长/恶意内容进入桌面渲染
      list.push({id:'custom_'+hh.toString(36),name:nm,emoji:clean(a.emoji).slice(0,4)||'✦',desc:clean(a.desc).slice(0,40),installedAt:Date.now()});
      if(window.HOS&&window.HOS.saveInstalled)window.HOS.saveInstalled(list);
      if(window.HOS&&window.HOS.refreshIcons)window.HOS.refreshIcons();
      if(window.HOS&&window.HOS.toast)window.HOS.toast('「'+nm+'」已添加到桌面');
    }
    else if(e.data.type==='musicsearch'){
      const q=String(e.data.q||'').trim(), nonce=e.data.nonce;
      noteUserActivity();
      (async()=>{
        let d=null;
        if(window.LLM){ try{ d=await window.LLM.fetchHallucination('music',q); }catch(err){ d=null; } }
        if(frame&&frame.contentWindow){ try{ frame.contentWindow.postMessage({type:'musicdata',data:d,q:q,nonce:nonce},'*'); }catch(err){} }
      })();
    }
    else if(e.data.type==='social:save'){
      const social=window.__SOCIAL||(window.__SOCIAL={profile:null,friends:[]});
      if(Array.isArray(e.data.friends))social.friends=e.data.friends;
      persistSocial();
    }
    else if(e.data.type==='refresh'){
      const rid=e.data.id||'';
      if(!rid||rid==='browser')setWebState(null);
      refreshData(rid);
      if(window.HOS&&window.HOS.toast)window.HOS.toast(rid?('已刷新「'+((APPS.find(a=>a.id===rid)||{}).name||rid)+'」数据'):'已刷新全部应用数据');
    }
    else if(e.data.type==='openapp'){ appLayer.hidden=true; openApp(e.data.id||'__generic__',e.data.name||'应用',{}); }
    else if(e.data.type==='config'&&e.data.cfg){
      // 置信度/API 配置：原地更新全局 CONFIG 并持久化
      Object.assign(D.CONFIG,e.data.cfg);
      if(D.saveConfig)D.saveConfig(D.CONFIG);
      if(window.HOS&&window.HOS.toast&&e.data.cfg.apiBase!==undefined)window.HOS.toast('✓ 系统配置已保存');
      try{ window.dispatchEvent(new CustomEvent('hallucindriod:config')) }catch(err){}
    }
    else if(e.data.type==='world:reset'){
      // 换一座城：世界变了，所有基于旧世界的生成结果都要失效
      let w=null;
      try{ w=D.resetWorld() }catch(e){}
      if(!w){ if(window.HOS&&window.HOS.toast)window.HOS.toast('换城失败，请重试'); return }
      Object.keys(dataCache).forEach(k=>delete dataCache[k]);
      Object.keys(viewCache).forEach(k=>delete viewCache[k]);
      setWebState(null);
      if(window.HOS&&window.HOS.toast)window.HOS.toast('已换到 · '+w.city);
      // 重新打开设置页，让新的城市/身份/事件立刻显示出来
      setTimeout(()=>{
        try{
          closeApp();
          delete viewCache['settings'];            // closeApp 会存快照，这里再清一次
          setTimeout(()=>{
            try{ openApp('settings','设置',{force:true}) }catch(err){}   // force：跳过旧视图恢复
          },240);
        }catch(err){}
      },320);
    }
    else if(e.data.type==='videogen'){
      // 短视频无限流：按需再生成一批（带上已出现过的标题避免重复）
      const seen=Array.isArray(e.data.seen)?e.data.seen.slice(-12):[];
      const req=e.data.req;
      const theme=String(e.data.theme||'短视频')+(seen.length?('（不要和这些重复：'+seen.join('、')+'）'):'');
      Promise.resolve()
        .then(()=>window.LLM?window.LLM.fetchHallucination('video',theme):null)
        .catch(()=>null)
        .then(d=>{
          try{ frame&&frame.contentWindow&&frame.contentWindow.postMessage({type:'videodata',data:d,req:req},'*') }catch(err){}
        });
    }
    else if(e.data.type==='publishVideo'){
      // 用户发布的视频进本地池，并尝试广播给在线好友
      const v=e.data.video||{};
      let pool=[];
      try{ pool=JSON.parse(localStorage.getItem('hallucindriod_pool_v1')||'[]') }catch(err){}
      if(!Array.isArray(pool))pool=[];
      const item={
        id:'u_'+Date.now().toString(36),
        title:String(v.title||'无题').slice(0,30),
        up:'@'+((window.OS_DATA&&window.OS_DATA.loadIdentity&&window.OS_DATA.loadIdentity().name)||'我'),
        desc:String(v.desc||'').slice(0,60),
        style:String(v.style||'night'),music:'原声',
        likes:0,shares:0,
        mine:true,ts:Date.now(),
        comments:Array.isArray(v.comments)?v.comments.slice(0,3):[]
      };
      pool.unshift(item);
      pool=pool.slice(0,60);
      try{ localStorage.setItem('hallucindriod_pool_v1',JSON.stringify(pool)) }catch(err){}
      if(window.HOS&&window.HOS.toast)window.HOS.toast('已发布 · 别人可能刷到');
      // 配置了公共池后端 → 同步上去，别人也能刷到
      const remote=(D.CONFIG&&D.CONFIG.poolUrl)||'';
      if(remote){
        fetch(remote,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'publish',video:item})})
          .then(r=>r.ok?r.json():null)
          .then(res=>{ if(res&&res.ok&&window.HOS&&window.HOS.toast)window.HOS.toast('已同步到公共池') })
          .catch(()=>{ if(window.HOS&&window.HOS.toast)window.HOS.toast('同步失败，已存本地') });
      }
      if(window.P2P&&window.P2P.broadcast){ try{ window.P2P.broadcast({t:'pool',video:item}) }catch(err){} }
      try{ frame.contentWindow.postMessage({type:'published',video:item},'*') }catch(err){}
    }
    else if(e.data.type==='openSettings'){
      closeApp();
      setTimeout(()=>{ try{ openApp('settings','设置') }catch(err){} },120);
    }
    else if(e.data.type==='identity:set'||e.data.type==='identity:random'){
      const Dd=window.OS_DATA;
      if(!Dd||!Dd.setIdentity)return;
      let id=null;
      if(e.data.type==='identity:random'){
        id=Dd.saveIdentity(Dd.randomIdentity());
      }else{
        id=Dd.setIdentity(e.data.name,e.data.avatar,e.data.bio);
      }
      if(!id)return;
      // 同步到社交资料（消息应用的头像/昵称）
      const social=window.__SOCIAL||(window.__SOCIAL={profile:null,friends:[]});
      social.profile={name:id.name,avatar:id.avatar,bio:id.bio,confidence:(social.profile&&social.profile.confidence)||5};
      if(window.HOS&&window.HOS.saveSocial)window.HOS.saveSocial(social);
      // 称呼变了，聊天/生成内容缓存失效
      delete dataCache.chatreply;
      delete dataCache.friend;
      Object.keys(dataCache).forEach(k=>{ if(k==='chatreply'||k==='friend')delete dataCache[k] });
      if(window.HOS&&window.HOS.toast)window.HOS.toast('身份已更新 · '+(id.avatar||'')+' '+id.name);
      // 回传给设置页刷新显示
      try{ frame.contentWindow.postMessage({type:'identity:saved',identity:id},'*') }catch(err){}
    }
    else if(e.data.type==='world:evolve'){
      if(window.HOS&&window.HOS.toast)window.HOS.toast('世界正在向前推进…');
      evolveWorld().then(w=>{
        if(!w){ if(window.HOS&&window.HOS.toast)window.HOS.toast('推进失败，稍后再试'); return }
        socialPush({type:'world:evolved',world:w});
        if(window.HOS&&window.HOS.toast)window.HOS.toast('世界已推进 · '+(w.hotEvents[0]||''));
      });
    }
    else if(e.data.type==='persona:set'){
      D.CONFIG.persona=String(e.data.key||'none');
      if(D.saveConfig)D.saveConfig(D.CONFIG);
      // 语气变了，缓存内容也该更新
      Object.keys(dataCache).forEach(k=>delete dataCache[k]);
      const P=D.PERSONAS&&D.PERSONAS[D.CONFIG.persona];
      if(window.HOS&&window.HOS.toast)window.HOS.toast('语气已切换 · '+(P?P.name:'默认'));
    }
  });

  window.ENGINE={openApp,closeApp,regen,warmup,refreshData,preload,hasCache,openExternal,openFromDNA,shareCurrent,buildShareLink,evolveWorld,fetchPool,
    cacheStatus(){ return {cached:Object.keys(dataCache),pending:Object.keys(pending),queue:prefetchQueue.slice()}; }};
  bindP2PInbox();
  // 已注册用户：启动时自动上线
  if(window.P2P && window.__SOCIAL && window.__SOCIAL.profile && window.__SOCIAL.profile.name){
    window.P2P.init(window.__SOCIAL.profile.name).catch(()=>{});
  }
})();
