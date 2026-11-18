/* ============ Hallucindriod · 幻卓 · 现编引擎 ============
 * openApp(): 打印代码瀑布 → 沙箱 iframe 现场渲染应用
 * 永不缓存：每次调用重新生成 HTML。
 */
(function(){
  const D=window.OS_DATA;
  const {pick,randInt,APPS}=D;
  const genLayer=document.getElementById('genLayer');
  const terminal=document.getElementById('genTerminal');
  const genName=document.getElementById('genAppName');
  const bar=document.getElementById('genProgressBar');
  const stat=document.getElementById('genStat');
  const sourceEl=document.getElementById('genSource');
  const appLayer=document.getElementById('appLayer');
  const frame=document.getElementById('appFrame');
  let currentId=null,currentName=null,busy=false;

  // ---------- 数据缓存 / 预热 / 视图快照 ----------
  // dataCache: app id -> LLM 数据（命中即秒开，不重复请求）
  // pending:   app id -> 正在进行的请求（并发去重）
  // viewCache: app id -> 上次渲染的完整文档（退出再进直接恢复）
  const dataCache={}, pending={}, viewCache={};
  // 浏览器上次访问的页面（退出再进恢复，不重新生成）
  let webState=null;

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
    const list=APPS.filter(a=>a.id!=='terminal'&&a.id!=='browser');
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

  function escHTML(s){return s}

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

  async function openApp(id,name,opts){
    if(busy)return;
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
    const cached=hasCache(id)||id==='terminal'||id==='browser';
    const llmPromise = (id==='terminal'||id==='browser')
      ? Promise.resolve(null)
      : preload(id,name);
    await printCode(name,id,cached);
    let llmData = null;
    try{ llmData = await llmPromise; }catch(e){ llmData=null; }
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
    const cfgPayload=JSON.stringify(D.CONFIG).replace(/</g,'\\u003c');
    html=html.replace('</head>','<script>window.__CFG='+cfgPayload+';<\/script></head>');
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
    // 应用已经显示出来 → 并行预取「接下来可能打开」的应用，用户切过去就能秒开
    if(id!=='terminal'&&id!=='browser'){
      setTimeout(()=>{ try{ prefetchRelated(id); }catch(e){} },520);
    }
  }

  function closeApp(){
    // 保存当前视图快照：再次进入直接恢复，不重新初始化（浏览器由 webState 单独管理）
    if(currentId && currentId!=='browser' && frame.srcdoc && frame.srcdoc.length>200){
      viewCache[currentId]=frame.srcdoc;
    }
    currentId=null;currentName=null;
    appLayer.hidden=true;
    frame.srcdoc='<html><body style="background:#0d0e14"></body></html>';
  }

  function regen(){
    if(!currentId&&currentName===null)return;
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
        : {type:'webdata',data:data,topic:topic,nonce:nonce};
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
      case 'message': openApp('messages','短信',{}); break;
      case 'browse': openApp('browser',t||'浏览器',{}); break;
      case 'searchApp': openApp('store','应用商店',{}); break;
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
  async function socialAddFriend(rawName){
    const name=String(rawName||'').trim().slice(0,12);
    if(!name)return;
    const social=window.__SOCIAL||(window.__SOCIAL={profile:null,friends:[]});
    if(!Array.isArray(social.friends))social.friends=[];
    const exist=social.friends.find(f=>f.name===name);
    if(exist){ socialPush({type:'social:friend',friend:exist,exists:true}); return; }
    // 1) 先尝试找真人（WebRTC P2P）
    let friend=null;
    if(window.P2P&&window.P2P.findUser){
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
    } else {
      friend.isAI=false;
      if(!Array.isArray(friend.msgs))friend.msgs=[];
    }
    social.friends.unshift(friend);
    persistSocial();
    socialPush({type:'social:friend',friend:friend,exists:false});
  }
  async function socialReply(friendName,text){
    // 真人好友：直接走 P2P 发出（对方在线才发得出去）
    const social=window.__SOCIAL||{friends:[]};
    const f=(social.friends||[]).find(x=>x.name===friendName);
    if(f && !f.isAI && f.peerId && window.P2P && window.P2P.send(f.peerId,{t:'msg',text:text,ts:Date.now()})){
      return;
    }
    let reply='';
    if(window.LLM){
      const ctx=JSON.stringify({me:(social.profile&&social.profile.name)||'我',other:friendName,say:text});
      try{
        const d=await window.LLM.fetchHallucination('chatreply',ctx);
        if(d&&d.reply)reply=String(d.reply);
      }catch(e){}
    }
    if(!reply)reply=pick(['在的','哈哈哈哈','确实','让我想想','你说得对','嗯嗯，然后呢','这个我也有同感','稍等，我看一下']);
    socialPush({type:'social:reply',friend:friendName,text:reply});
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

  // 打开外部 Web 应用：直接加载站点，不经过大模型、不缓存生成内容
  function openExternal(url,name){
    if(busy)return;
    noteUserActivity();
    currentId='__external__';currentName=name||'外部应用';
    if(window.HOS&&window.HOS.closePanels)window.HOS.closePanels();
    const title=String(name||'外部应用');
    const safeUrl=String(url||'').replace(/"/g,'%22');
    const html=`<!DOCTYPE html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<style>
html,body{margin:0;height:100%;background:#0b0d12;overflow:hidden}
iframe{width:100%;height:100%;border:0;display:block}
.bar{position:fixed;left:0;right:0;top:0;height:38px;display:flex;align-items:center;gap:8px;
background:rgba(12,14,20,.86);backdrop-filter:blur(10px);z-index:9;padding:0 8px}
.xb{width:28px;height:28px;border-radius:50%;border:none;background:rgba(255,255,255,.14);color:#fff;font-size:17px;line-height:1;cursor:pointer}
.tt{color:#e6e7ee;font-size:12.5px;font-weight:600}
.wrap{position:absolute;inset:38px 0 0 0}
</style></head><body>
<div class="bar"><button class="xb" onclick="parent.postMessage({type:'close'},'*')">‹</button><span class="tt">${title}</span></div>
<div class="wrap"><iframe src="${safeUrl}" allow="fullscreen; clipboard-write"></iframe></div>
</body></html>`;
    frame.srcdoc=html;
    genLayer.hidden=true;
    appLayer.hidden=false;
  }

  // 应用关联图：打开 A 时，预判接下来最可能打开哪些
  const AFFINITY={
    delivery:['video','messages','music'],
    video:['delivery','music','messages'],
    messages:['phone','video','delivery'],
    music:['video','messages'],
    album:['camera','delivery'],
    camera:['album'],
    browser:['store','video'],
    store:['browser','video'],
    weather:['map','delivery'],
    map:['weather','delivery'],
    phone:['messages'],
    calculator:['terminal'],
    settings:[],
    terminal:['delivery','video','messages']
  };
  // 关联预取队列：两两并发推进，去重且不重复请求
  const prefetchQueue=[];
  let draining=false;
  function prefetchRelated(id){
    (AFFINITY[id]||[]).forEach(a=>{
      if(a==='terminal'||a==='browser')return;
      if(a in dataCache||pending[a])return;
      if(prefetchQueue.indexOf(a)>=0)return;
      prefetchQueue.push(a);
    });
    drainPrefetch();
  }
  async function drainPrefetch(){
    if(draining||!prefetchQueue.length)return;
    draining=true;
    while(prefetchQueue.length){
      const batch=prefetchQueue.splice(0,2);
      await Promise.all(batch.map(a=>{
        const app=APPS.find(x=>x.id===a);
        return app?preload(a,app.name).catch(()=>null):Promise.resolve(null);
      }));
    }
    draining=false;
  }

  // 接收 iframe 内部消息
  window.addEventListener('message',function(e){
    if(!e.data||typeof e.data!=='object')return;
    if(e.data.type==='close')closeApp();
    else if(e.data.type==='regen')regen();
    else if(e.data.type==='webgen')llmGen('browser',e.data.topic||'幻卓空间',e.data.nonce);
    else if(e.data.type==='storegen')llmGen('store',e.data.topic||'应用',e.data.nonce);
    else if(e.data.type==='termgen')termGen(String(e.data.text||''),e.data.nonce);
    else if(e.data.type==='webstate'){ webState={topic:e.data.topic||'',data:e.data.data||null}; }
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
    else if(e.data.type==='social:addfriend')socialAddFriend(e.data.name);
    else if(e.data.type==='social:reply')socialReply(String(e.data.friend||''),String(e.data.text||''));
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
      if(!rid||rid==='browser')webState=null;
      refreshData(rid);
      if(window.HOS&&window.HOS.toast)window.HOS.toast(rid?('已刷新「'+((APPS.find(a=>a.id===rid)||{}).name||rid)+'」数据'):'已刷新全部应用数据');
    }
    else if(e.data.type==='openapp'){ appLayer.hidden=true; openApp(e.data.id||'__generic__',e.data.name||'应用',{}); }
    else if(e.data.type==='config'&&e.data.cfg){
      // 置信度/API 配置：原地更新全局 CONFIG 并持久化
      Object.assign(D.CONFIG,e.data.cfg);
      if(D.saveConfig)D.saveConfig(D.CONFIG);
      if(window.HOS&&window.HOS.toast&&e.data.cfg.apiBase!==undefined)window.HOS.toast('✓ 系统配置已保存');
    }
  });

  window.ENGINE={openApp,closeApp,regen,warmup,refreshData,preload,hasCache,openExternal,
    cacheStatus(){ return {cached:Object.keys(dataCache),pending:Object.keys(pending),queue:prefetchQueue.slice()}; }};
  bindP2PInbox();
  // 已注册用户：启动时自动上线
  if(window.P2P && window.__SOCIAL && window.__SOCIAL.profile && window.__SOCIAL.profile.name){
    window.P2P.init(window.__SOCIAL.profile.name).catch(()=>{});
  }
})();
