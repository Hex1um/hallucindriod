/* ============ 幻卓 Huandroid · 幻觉应用生成器（二）============ */
(function(){
  const D=window.OS_DATA;
  const {pick,pickN,chance,randInt,neonPalette,WORDS}=D;
  const B=window.APP_BUILDERS;

  // 复用外壳（与 apps.js 中的 shell 相同）
  function shell(cfg){
    const accent=cfg.accent||'#a78bfa';
    return '<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8">'
    +'<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"><style>'
    +':root{--ac:'+accent+'}'
    +'*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}'
    +'html,body{margin:0;height:100%;font-family:-apple-system,"PingFang SC","Microsoft YaHei",sans-serif;background:#101119;color:#f2f2f7;overflow:hidden}'
    +'.abar{height:52px;padding:0 8px;display:flex;align-items:center;justify-content:space-between;background:rgba(20,21,32,.9);border-bottom:1px solid rgba(255,255,255,.07);position:relative;z-index:2}'
    +'.ab-btn{border:none;background:none;color:var(--ac);font-size:14px;padding:8px 10px;cursor:pointer;min-width:52px}'
    +'.ab-btn:active{opacity:.5}.ab-title{font-size:14px;font-weight:700;display:flex;align-items:center;gap:6px}'
    +'.ab-badge{font-size:9.5px;color:#7c8096;text-align:center;padding:6px;background:rgba(167,139,250,.06);border-bottom:1px solid rgba(255,255,255,.05)}'
    +'.ab-body{height:calc(100% - 82px);overflow-y:auto;scrollbar-width:none}.ab-body::-webkit-scrollbar{display:none}'
    +'.card{background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.07);border-radius:16px}'
    +'.muted{color:#8b90a5}'
    +(cfg.css||'')+'</style></head><body>'
    +'<div class="abar"><button class="ab-btn" onclick="parent.postMessage({type:\'close\'},\'*\')">‹ 返回</button>'
    +'<div class="ab-title">'+(cfg.icon||'✦')+' '+(cfg.title||'应用')+'</div>'
    +'<button class="ab-btn" style="text-align:right" onclick="parent.postMessage({type:\'regen\'},\'*\')">⟳ 刷新</button></div>'
    +'<div class="ab-badge">数据更新于刚刚 · 版本 1.0</div>'
    +'<div class="ab-body">'+(cfg.html||'')+'</div><script>'+(cfg.js||'')+'</script></body></html>';
  }

  // 生成一个"幻觉网页"的内容片段（浏览器套娃用）
  function fakeSite(topic){
    const pal=neonPalette(), adj=pick(WORDS.adjectives), noun=pick(WORDS.nouns);
    const title=pick([topic+'官网',topic+' · 全球领先',pick(WORDS.adjectives)+topic+'网','关于'+topic+'的一切']);
    const paras=[
      '欢迎来到'+title+'。我们是一家专注于'+adj+noun+'的科技企业，致力于为您带来'+pick(WORDS.adjectives)+'的体验。',
      '我们的使命是让每一个'+noun+'都能拥有自己的'+pick(WORDS.nouns)+'。成立以来，我们已服务超过 '+randInt(1,999)+' 万用户（数据由 AI 估算）。',
      '成立于 '+randInt(2019,2026)+' 年，总部位于'+pick(WORDS.cities)+'，在'+pick(WORDS.landmarks)+'设有分部。'
    ];
    const links=pickN(['首页','产品','关于我们','新闻','招聘','联系我们','投资者关系','突变日志'],4)
      .map(x=>'<span class="fl">'+x+'</span>').join('');
    return {title:title,pal:pal,
      html:'<div class="site"><div class="snav"><b>'+title+'</b><div>'+links+'</div></div>'
        +'<div class="shero" style="background:linear-gradient(135deg,'+pal.a+','+pal.b+')"><div class="shero-e">'+pick(['🛸','🌙','🪐','💎','🌈','🧊','🔮'])+'</div>'
        +'<h1>'+adj+topic+'</h1><p>在'+pick(WORDS.adjectives)+'的世界里，拥有一个'+noun+'</p><button class="scta">立即体验 →</button></div>'
        +'<div class="sbody"><h2>关于我们</h2>'+paras.map(p=>'<p>'+p+'</p>').join('')
        +'<div class="scards">'+pickN(WORDS.appIdeas,3).map(x=>'<div class="sc"><b>'+x+'</b><span>'+pick(WORDS.storeDesc)+'</span></div>').join('')+'</div>'
        +'<p class="muted" style="font-size:10px;text-align:center;margin-top:24px">© '+randInt(2020,2026)+' '+title+' · 本页面为演示内容，仅供参考</p></div></div>'
    };
  }

  /* ---------- 浏览器：浏览器现编，网页也现编（套娃） ---------- */
  // 精致官网渲染器：此函数会被 toString() 注入沙箱 iframe 内执行，禁止引用任何外部闭包变量
  function renderSiteHTML(d){
    d=d||{};
    var name=d.siteName||'幻卓空间';
    var tag=d.tagline||'让想象成为日常';
    var hero=d.heroTitle||('欢迎来到 '+name);
    var sub=d.heroSub||'在这里，每一次探索都有新的发现。我们用心打造，让美好自然发生。';
    var cta=d.cta||'立即探索';
    var aboutT=d.aboutTitle||'关于我们';
    var about=(d.about&&d.about.length)?d.about:['我们是一支热爱创造的团队，相信技术可以让生活更有趣。','从想法到现实，我们一步步把不可能变成可能。'];
    var feats=(d.features&&d.features.length)?d.features:[
      {icon:'✨',title:'匠心设计',desc:'每一处细节都经过精心打磨'},
      {icon:'🚀',title:'快速可靠',desc:'稳定服务，随时为你在线'},
      {icon:'🌱',title:'持续进化',desc:'不断创新，带来更多惊喜'}];
    var stats=(d.stats&&d.stats.length)?d.stats:[
      {num:'120万',label:'用户信赖'},{num:'4.9分',label:'用户评分'},{num:'98%',label:'好评率'}];
    var palettes=[['#667eea','#764ba2'],['#4facfe','#00f2fe'],['#f093fb','#f5576c'],['#11998e','#38ef7d'],['#fa709a','#fee140'],['#30cfd0','#330867'],['#7f00ff','#e100ff']];
    var h=0;for(var i=0;i<name.length;i++){h=(h*31+name.charCodeAt(i))>>>0}
    var pal=palettes[h%palettes.length];
    var nav=['首页','产品','关于','新闻','联系'];
    var navHTML=nav.map(function(x){return '<a class="wl">'+x+'</a>'}).join('');
    var aboutHTML=about.map(function(p){return '<p>'+p+'</p>'}).join('');
    var featHTML=feats.map(function(f){return '<div class="wf"><div class="wfi">'+(f.icon||'✦')+'</div><b>'+(f.title||'特色')+'</b><span>'+(f.desc||'')+'</span></div>'}).join('');
    var statHTML=stats.map(function(s){return '<div class="ws"><b>'+(s.num||'—')+'</b><span>'+(s.label||'')+'</span></div>'}).join('');
    return '<div class="site">'
      +'<div class="wnav"><div class="wbrand">✦ '+name+'</div><div class="wlinks">'+navHTML+'</div></div>'
      +'<div class="whero" style="background:linear-gradient(135deg,'+pal[0]+','+pal[1]+')">'
        +'<div class="wtag">'+tag+'</div><h1>'+hero+'</h1><p>'+sub+'</p>'
        +'<button class="wcta">'+cta+' →</button><div class="worb o1"></div><div class="worb o2"></div>'
      +'</div>'
      +'<div class="wstats">'+statHTML+'</div>'
      +'<div class="wabout"><div class="wsec-t">'+aboutT+'</div>'+aboutHTML+'</div>'
      +'<div class="wfeat"><div class="wsec-t">为什么选择我们</div><div class="wfg">'+featHTML+'</div></div>'
      +'<div class="wfoot">© 2026 '+name+' · '+tag+'</div>'
    +'</div>';
  }

  /* ---------- 浏览器：网页内容由 LLM 现场生成，精致官网渲染 ---------- */
  B.browser = function(){
    // 打开应用时父窗口已请求过一次 LLM，若拿到新结构直接作为首屏
    var init=(typeof window.__LLM!=='undefined'&&window.__LLM&&window.__LLM.siteName)?window.__LLM:null;
    var initData=init?JSON.stringify(init):'null';
    var initTopic=init?(init.siteName||'幻卓空间'):'幻卓空间';
    var renderSrc=renderSiteHTML.toString();
    var siteCSS='.site{font-family:-apple-system,"PingFang SC",sans-serif;background:#fff;color:#1a1a24}'
      +'.wnav{display:flex;justify-content:space-between;align-items:center;padding:15px 18px;background:#fff;border-bottom:1px solid #eee}'
      +'.wbrand{font-weight:800;font-size:15px;color:#222}'
      +'.wlinks{display:flex;gap:12px;flex-wrap:wrap}.wl{font-size:11px;color:#777}'
      +'.whero{position:relative;overflow:hidden;padding:52px 24px 46px;color:#fff;text-align:center}'
      +'.wtag{display:inline-block;font-size:11px;letter-spacing:2px;opacity:.95;border:1px solid rgba(255,255,255,.55);border-radius:999px;padding:4px 12px;margin-bottom:16px}'
      +'.whero h1{font-size:29px;line-height:1.3;margin:0 0 12px;font-weight:800;position:relative;z-index:1}'
      +'.whero p{font-size:13px;line-height:1.7;opacity:.92;max-width:320px;margin:0 auto 20px;position:relative;z-index:1}'
      +'.wcta{border:none;background:#fff;color:#222;border-radius:999px;padding:11px 24px;font-size:13px;font-weight:700;cursor:pointer;position:relative;z-index:1;box-shadow:0 6px 20px rgba(0,0,0,.15)}'
      +'.worb{position:absolute;border-radius:50%;background:rgba(255,255,255,.12)}'
      +'.worb.o1{width:180px;height:180px;top:-60px;left:-50px}.worb.o2{width:130px;height:130px;bottom:-50px;right:-30px}'
      +'.wstats{display:flex;background:#fafaff;padding:22px 10px;border-bottom:1px solid #f0f0f5}'
      +'.ws{flex:1;text-align:center;border-right:1px solid #e8e8f0}.ws:last-child{border-right:none}'
      +'.ws b{display:block;font-size:20px;color:#4f46e5}.ws span{font-size:10px;color:#999}'
      +'.wabout,.wfeat{padding:26px 20px}'
      +'.wsec-t{font-size:18px;font-weight:800;margin:0 0 16px;color:#1a1a24;position:relative;padding-left:12px}'
      +'.wsec-t:before{content:"";position:absolute;left:0;top:3px;bottom:3px;width:4px;background:#6366f1;border-radius:2px}'
      +'.wabout p{font-size:12.5px;line-height:1.9;color:#555;margin:0 0 10px}'
      +'.wfg{display:grid;grid-template-columns:repeat(3,1fr);gap:9px}'
      +'.wf{background:#f7f7fb;border-radius:14px;padding:14px 10px;text-align:center}'
      +'.wfi{font-size:26px;margin-bottom:8px}.wf b{display:block;font-size:11.5px;color:#222;margin-bottom:5px}'
      +'.wf span{font-size:9.5px;color:#8a8a99;line-height:1.5;display:block}'
      +'.wfoot{text-align:center;font-size:10px;color:#aaa;padding:20px;background:#fafaff}'
      +'.wload{padding:70px 20px;text-align:center;color:#666;font-size:13px}'
      +'.wload .sp{font-size:34px;animation:spin 1.2s linear infinite;display:inline-block}'
      +'@keyframes spin{to{transform:rotate(360deg)}}';
    return shell({
      title:'浏览器', icon:'🌐', accent:'#38bdf8',
      css:'#appFrameHost{height:100%;display:flex;flex-direction:column}'
        +'.bbar{display:flex;gap:6px;align-items:center;padding:10px 12px;background:#171824;border-bottom:1px solid rgba(255,255,255,.06)}'
        +'.bbar button{border:none;background:rgba(255,255,255,.08);color:#fff;width:30px;height:30px;border-radius:9px;cursor:pointer;flex-shrink:0;font-size:15px}'
        +'.url{flex:1;display:flex;align-items:center;gap:6px;background:rgba(255,255,255,.09);border-radius:10px;padding:7px 10px;font-size:11px;color:#9aa0b5;min-width:0}'
        +'.url input{flex:1;background:none;border:none;outline:none;color:#fff;font-size:11px;min-width:0;width:100%}'
        +'.web{flex:1;overflow-y:auto;background:#fff;scrollbar-width:none}.web::-webkit-scrollbar{display:none}'
        +siteCSS,
      html:'<div id="appFrameHost"><div class="bbar">'
        +'<button id="back" title="后退">‹</button><button id="fwd" title="前进">›</button><button id="home" title="主页">⌂</button>'
        +'<div class="url">🔒 <input id="urlIn" value="https://www.'+initTopic+'.com" placeholder="输入网址或搜索关键词"></div>'
        +'<button id="go" title="刷新">↻</button></div><div class="web" id="web">'+(init?renderSiteHTML(init):'<div class="wload"><div class="sp">✦</div><div>正在生成网页…</div></div>')+'</div></div>',
      js:'var renderSiteHTML='+renderSrc+';'
        +'var initData='+initData+';var curTopic='+JSON.stringify(initTopic)+';'
        +'var urlIn=document.getElementById("urlIn"),web=document.getElementById("web");'
        +'var hist=['+JSON.stringify(initTopic)+'],hi=0,nonce=0,lastNonce=0;'
        +'function setUrl(t){urlIn.value="https://www."+(t||"site")+".com"}'
        +'function showLoad(){web.innerHTML="<div class=wload><div class=sp>✦</div><div>正在生成网页…</div></div>";web.scrollTop=0}'
        +'function nav(topic,push){'
        +'  topic=String(topic||"").trim();if(!topic)topic=curTopic;'
        +'  curTopic=topic;setUrl(topic);showLoad();'
        +'  if(push){hist=hist.slice(0,hi+1);hist.push(topic);hi=hist.length-1}'
        +'  lastNonce=++nonce;'
        +'  parent.postMessage({type:"webgen",topic:topic,nonce:lastNonce},"*");'
        +'}'
        +'window.addEventListener("message",function(e){'
        +'  if(!e.data||e.data.type!=="webdata")return;'
        +'  if(e.data.nonce&&e.data.nonce!==lastNonce)return;'
        +'  var d=e.data.data;'
        +'  if(d&&d.siteName){curTopic=d.siteName;web.innerHTML=renderSiteHTML(d)}'
        +'  else{web.innerHTML=renderSiteHTML(null)}'
        +'  web.scrollTop=0;'
        +'});'
        +'document.getElementById("go").onclick=function(){nav(urlIn.value.replace(/^https?:\\/\\//,"").replace(/^www\\./,"").replace(/\\.com$/, ""),false)};'
        +'urlIn.onkeydown=function(e){if(e.key==="Enter"){document.getElementById("go").click();urlIn.blur()}};'
        +'document.getElementById("home").onclick=function(){nav("幻卓空间",true)};'
        +'document.getElementById("back").onclick=function(){if(hi>0){hi--;nav(hist[hi],false)}};'
        +'document.getElementById("fwd").onclick=function(){if(hi<hist.length-1){hi++;nav(hist[hi],false)}};'
        +'if(initData===null||initData==="null"){nav(curTopic,false)}'
    });
  };


  /* ---------- 相机：拍出幻觉照片 ---------- */
  B.camera = function(){
    const scene=pick(WORDS.photoCaptions);
    return shell({
      title:'相机', icon:'📷', accent:'#94a3b8',
      css:'.cm{height:100%;display:flex;flex-direction:column;background:#000}'
        +'.view{flex:1;position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center}'
        +'.view .scene{font-size:96px;filter:drop-shadow(0 10px 30px rgba(0,0,0,.5));transition:.3s}'
        +'.view .grid{position:absolute;inset:0;background:linear-gradient(rgba(255,255,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px);background-size:33% 33%}'
        +'.view .stamp{position:absolute;top:14px;left:14px;font-size:10px;color:#fff;background:rgba(0,0,0,.4);padding:5px 8px;border-radius:8px}'
        +'.view .flash{position:absolute;inset:0;background:#fff;opacity:0;pointer-events:none}'
        +'.view .flash.on{animation:fl .25s}@keyframes fl{0%{opacity:1}100%{opacity:0}}'
        +'.ctrls{height:96px;display:flex;align-items:center;justify-content:center;gap:40px;background:#0a0a0f}'
        +'.ctrls button{border:none;background:none;color:#fff;font-size:26px;cursor:pointer}'
        +'.shutter{width:64px;height:64px;border-radius:50%;background:#fff;border:5px solid #555;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:26px}'
        +'.shutter:active{transform:scale(.92)}'
        +'.thumb{width:46px;height:46px;border-radius:10px;background:#222;display:flex;align-items:center;justify-content:center;font-size:22px}',
      html:'<div class="cm"><div class="view" id="view"><div class="grid"></div>'
        +'<div class="stamp">相机 · 自动对焦中…</div><div class="scene" id="scene">'+pick(['🌇','🌊','🐈','🌌','🛸','🌸'])+'</div>'
        +'<div class="flash" id="flash"></div></div>'
        +'<div class="ctrls"><button id="flip">🔄</button><div class="shutter" id="shutter">📸</div><div class="thumb" id="thumb">🖼️</div></div></div>',
      js:'var scene=document.getElementById("scene"),flash=document.getElementById("flash"),thumb=document.getElementById("thumb");'
        +'var emos='+JSON.stringify(WORDS.photoCaptions.map(()=>pick(['🌇','🌊','🐈','🌌','🛸','🌸','🌵','🍋','🌙','🪐'])))+';var ei=0;'
        +'document.getElementById("shutter").onclick=function(){flash.classList.remove("on");void flash.offsetWidth;flash.classList.add("on");'
        +'setInterval(function(){ei=(ei+1)%emos.length;scene.textContent=emos[ei]},500);'
        +'var t=setTimeout(function(){clearInterval(t);thumb.textContent=emos[ei];scene.textContent=emos[ei]},1600)};'
        +'document.getElementById("flip").onclick=function(){scene.style.transform=scene.style.transform==="scaleX(-1)"?"none":"scaleX(-1)"};'
    });
  };

  /* ---------- 短信：AI 代聊 ---------- */
  B.messages = function(){
    const L=(typeof window.__LLM!=='undefined'&&window.__LLM)?window.__LLM:null;
    const llms=L&&Array.isArray(L.msgs)?L.msgs:null;
    const contact=(L&&L.contact)||pick(WORDS.contacts), msgs=llms?llms.map(x=>x.text):pickN(WORDS.messages,randInt(3,5));
    let bubbles='<div class="tsys">今天 · 消息已加密</div>';
    msgs.forEach((m,i)=>{
      const mine=llms?(llms[i].me===true):chance(.5);
      bubbles+='<div class="bub '+(mine?'me':'them')+'">'+m+'<span>'+pick(['9:41','9:42','10:08','昨天','刚刚'])+'</span></div>';
    });
    const replies=WORDS.messages;
    return shell({
      title:contact, icon:'💬', accent:'#4ade80',
      css:'.msg{height:100%;display:flex;flex-direction:column;background:#0b1410}'
        +'.tsys{text-align:center;font-size:10px;color:#5f7a6a;padding:12px}'
        +'.bubs{flex:1;overflow-y:auto;padding:6px 14px;scrollbar-width:none}.bubs::-webkit-scrollbar{display:none}'
        +'.bub{max-width:78%;padding:9px 13px;border-radius:16px;font-size:13px;margin:8px 0;position:relative;line-height:1.5;clear:both}'
        +'.bub span{display:block;font-size:9px;opacity:.5;margin-top:3px}'
        +'.bub.them{background:rgba(255,255,255,.08);float:left;border-bottom-left-radius:4px}'
        +'.bub.me{background:#1e7a4f;float:right;border-bottom-right-radius:4px}'
        +'.inputbar{display:flex;gap:8px;padding:10px 12px;background:#101a15;border-top:1px solid rgba(255,255,255,.05)}'
        +'.inputbar input{flex:1;background:rgba(255,255,255,.08);border:none;border-radius:999px;padding:10px 14px;color:#fff;outline:none;font-size:13px}'
        +'.inputbar button{border:none;border-radius:50%;width:38px;height:38px;background:#22c55e;color:#062a17;font-size:17px;cursor:pointer}',
      html:'<div class="msg"><div class="bubs" id="bubs">'+bubbles+'</div>'
        +'<div class="inputbar"><input id="in" placeholder="输入消息…"><button id="send">➤</button></div></div>',
      js:'var bubs=document.getElementById("bubs"),inp=document.getElementById("in"),replies='+JSON.stringify(replies)+';'
        +'function add(txt,me){var d=document.createElement("div");d.className="bub "+(me?"me":"them");d.textContent=txt;'
        +'var s=document.createElement("span");s.textContent="刚刚";d.appendChild(s);bubs.appendChild(d);bubs.scrollTop=bubs.scrollHeight}'
        +'function send(){var v=inp.value.trim();if(!v)return;add(v,true);inp.value="";'
        +'setTimeout(function(){add("（对方正在输入…）",false)},300);'
        +'setTimeout(function(){var last=bubs.querySelector(".bub.them:last-child");if(last)last.remove();'
        +'add(replies[Math.floor(Math.random()*replies.length)],false)},1400)}'
        +'document.getElementById("send").onclick=send;inp.onkeydown=function(e){if(e.key==="Enter")send()}'
    });
  };

  /* ---------- 摸鱼检测器 ---------- */
  B.fish = function(){
    const L=(typeof window.__LLM!=='undefined'&&window.__LLM)?window.__LLM:null;
    const score=randInt(3,99);
    const llmVerdict=L&&L.verdict?L.verdict:null, llmAdvice=L&&L.advice?L.advice:null;
    const verdict=pick([
      score>70?'摸鱼王者，建议给自己颁奖':'资深摸鱼，稳','摸鱼指数爆表，老板已在路上','再摸一条就上岸',
      score<30?'你今天居然在认真工作？':'刚刚还在刷手机吧？我看见了'
    ]);
    return shell({
      title:'摸鱼检测', icon:'🐟', accent:'#2dd4bf',
      css:'.fs{text-align:center;padding:26px 22px}'
        +'.fishbig{font-size:96px;animation:swim 2.2s ease-in-out infinite}@keyframes swim{0%,100%{transform:translateX(-8px) rotate(-6deg)}50%{transform:translateX(8px) rotate(6deg)}}'
        +'.fs h2{font-size:20px;margin:12px 0 4px}.fs .sub{font-size:12px;color:#8b90a5}'
        +'.meter{height:16px;background:rgba(255,255,255,.08);border-radius:999px;margin:26px 0 8px;overflow:hidden}'
        +'.meter i{display:block;height:100%;width:0;background:linear-gradient(90deg,#2dd4bf,#fbbf24,#f87171);border-radius:999px;transition:width 1.4s ease}'
        +'.pct{font-size:34px;font-weight:200;color:#5eead4}'
        +'.verdict{margin:18px 0;padding:16px;font-size:14px;line-height:1.6}'
        +'.again{border:none;border-radius:999px;padding:11px 24px;background:#2dd4bf;color:#062b28;font-weight:700;cursor:pointer;font-size:13px}',
      html:'<div class="fs"><div class="fishbig">🐟</div><h2>摸鱼检测仪 PRO</h2>'
        +'<div class="sub">基于 '+randInt(3,99)+' 个传感器实时监测</div>'
        +'<div class="meter"><i id="meter"></i></div><div class="pct"><span id="pct">0</span>%</div>'
        +'<div class="verdict card" id="verdict">检测中… 请勿直视摄像头</div>'
        +'<button class="again" id="again">🎲 再测一次</button></div>',
      js:'var score='+score+',verdicts='+JSON.stringify(WORDS.messages)+',lv='+JSON.stringify(llmVerdict)+',la='+JSON.stringify(llmAdvice)+';'
        +'function run(){var m=document.getElementById("meter"),p=document.getElementById("pct"),v=document.getElementById("verdict");'
        +'p.textContent="0";v.textContent="检测中… 请勿直视摄像头";m.style.width="0";'
        +'var s=Math.floor(Math.random()*99)+1;setTimeout(function(){m.style.width=s+"%";'
        +'var c=0,t=setInterval(function(){p.textContent=Math.min(s,c+=Math.ceil(s/20));if(c>=s){clearInterval(t);'
        +'v.innerHTML="🐟 <b>"+(lv||("摸鱼指数 "+s+"%"))+"</b><br>建议："+(la||(s>60?"继续摸，别被抓到":"装作在写代码"))}},40)},300)}'
        +'run();document.getElementById("again").onclick=run;'
    });
  };

  /* ---------- 小游戏：现编的一个贪吃/接物游戏 ---------- */
  B.game = function(){
    const kind=pick(['catch','snake']);
    if(kind==='catch'){
      const e=pick(['🍎','⭐','💎','🐟','🍋','🌙']);
      return shell({
        title:'接星星', icon:'🎮', accent:'#fb7185',
        css:'.gm{height:100%;display:flex;flex-direction:column;background:linear-gradient(#160c1a,#0c0d16)}'
          +'.score{padding:12px 16px;font-size:13px;display:flex;justify-content:space-between}'
          +'.score b{color:#fda4af}'
          +'.arena{flex:1;position:relative;overflow:hidden;margin:0 12px 16px;border-radius:16px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06)}'
          +'.item{position:absolute;font-size:26px;cursor:pointer;user-select:none}'
          +'.hint{text-align:center;font-size:11px;color:#7c8096;padding-bottom:14px}',
        html:'<div class="gm"><div class="score"><span>得分 <b id="sc">0</b></span><span>失误 <b id="ms">0</b>/5</span></div>'
          +'<div class="arena" id="arena"></div><div class="hint">点掉的'+e+'越多越好 · 别让它们落到底部</div></div>',
        js:'var arena=document.getElementById("arena"),sc=document.getElementById("sc"),ms=document.getElementById("ms"),'
          +'emoji='+JSON.stringify(e)+',score=0,miss=0,over=false;'
          +'function spawn(){if(over)return;var d=document.createElement("div");d.className="item";d.textContent=emoji;'
          +'d.style.left=(8+Math.random()*80)+"%";d.style.top="-30px";arena.appendChild(d);'
          +'var y=-30,sp=0.6+Math.random()*1.1;'
          +'d.onclick=function(){score++;sc.textContent=score;d.remove()};'
          +'var t=setInterval(function(){y+=sp;d.style.top=y+"px";if(y>arena.clientHeight){clearInterval(t);d.remove();miss++;ms.textContent=miss;if(miss>=5){over=true;arena.innerHTML="<div style=\\"padding:60px 20px;text-align:center\\">🫠<br><b>游戏结束 · 得分 "+score+"</b><br><small>点击重编再来一局</small></div>"}}},30)}'
          +'setInterval(spawn,700);'
      });
    }
    // 简易贪吃蛇
    return shell({
      title:'贪吃蛇', icon:'🎮', accent:'#34d399',
      css:'.gm{padding:12px;text-align:center}'
        +'.gs{font-size:13px;margin-bottom:10px}.gs b{color:#6ee7b7}'
        +'canvas{background:#0a1410;border-radius:12px;border:1px solid rgba(255,255,255,.08);touch-action:none}'
        +'.dp{display:grid;grid-template-columns:repeat(3,54px);gap:8px;justify-content:center;margin-top:16px}'
        +'.dp button{border:none;border-radius:12px;background:rgba(255,255,255,.08);color:#fff;font-size:20px;height:48px;cursor:pointer}'
        +'.hint{font-size:11px;color:#7c8096;margin-top:12px}',
      html:'<div class="gm"><div class="gs">得分 <b id="sc">0</b> · 方向键或下方按钮</div>'
        +'<canvas id="cv" width="280" height="280"></canvas>'
        +'<div class="dp"><span></span><button data-d="up">↑</button><span></span>'
        +'<button data-d="left">←</button><button data-d="down">↓</button><button data-d="right">→</button></div>'
        +'<div class="hint">撞墙或撞自己就结束 · 按方向键控制</div></div>',
      js:'var cv=document.getElementById("cv"),ctx=cv.getContext("2d"),S=20,N=cv.width/S,'
        +'snake=[{x:8,y:8},{x:7,y:8},{x:6,y:8}],dir={x:1,y:0},food={x:14,y:8},score=0,over=false,sc=document.getElementById("sc");'
        +'function draw(){ctx.fillStyle="#0a1410";ctx.fillRect(0,0,cv.width,cv.height);'
        +'ctx.fillStyle="#f87171";ctx.fillRect(food.x*S+3,food.y*S+3,S-6,S-6);'
        +'snake.forEach(function(s,i){ctx.fillStyle=i===0?"#6ee7b7":"#34d399";ctx.fillRect(s.x*S+1,s.y*S+1,S-2,S-2)});}'
        +'function step(){if(over)return;var h={x:snake[0].x+dir.x,y:snake[0].y+dir.y};'
        +'if(h.x<0||h.y<0||h.x>=N||h.y>=N||snake.some(function(s){return s.x===h.x&&s.y===h.y})){over=true;return}'
        +'snake.unshift(h);if(h.x===food.x&&h.y===food.y){score+=10;sc.textContent=score;do{food={x:Math.floor(Math.random()*N),y:Math.floor(Math.random()*N)}}while(snake.some(function(s){return s.x===food.x&&s.y===food.y}))}'
        +'else snake.pop();draw()}'
        +'function turn(d){if(d==="up"&&dir.y!==1)dir={x:0,y:-1};if(d==="down"&&dir.y!==-1)dir={x:0,y:1};'
        +'if(d==="left"&&dir.x!==1)dir={x:-1,y:0};if(d==="right"&&dir.x!==-1)dir={x:1,y:0}}'
        +'document.querySelectorAll(".dp button").forEach(function(b){b.onclick=function(){turn(b.dataset.d)}});'
        +'document.addEventListener("keydown",function(e){var m={ArrowUp:"up",ArrowDown:"down",ArrowLeft:"left",ArrowRight:"right"};if(m[e.key]){turn(m[e.key]);e.preventDefault()}});'
        +'draw();setInterval(step,150);'
    });
  };

  /* ---------- 电话：拨号 + 幻觉通话 ---------- */
  B.phone = function(){
    const nums=['1','2','3','4','5','6','7','8','9','*','0','#'];
    return shell({
      title:'电话', icon:'📞', accent:'#4ade80',
      css:'.ph{height:100%;display:flex;flex-direction:column;padding:16px 22px}'
        +'.num{flex:0 0 auto;text-align:center;font-size:34px;font-weight:200;min-height:52px;letter-spacing:2px;color:#e8f5ec}'
        +'.sub{text-align:center;font-size:11px;color:#5f8a6f;margin-bottom:8px}'
        +'.pad{flex:1;display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(4,1fr);gap:10px;max-height:360px}'
        +'.pad button{border:none;border-radius:50%;background:rgba(255,255,255,.07);color:#fff;font-size:24px;cursor:pointer}'
        +'.pad button:active{background:rgba(74,222,128,.25)}'
        +'.call{border:none;border-radius:50%;width:62px;height:62px;background:#22c55e;color:#fff;font-size:26px;margin:16px auto 0;cursor:pointer}'
        +'.screen-call{display:none;position:absolute;inset:0;background:linear-gradient(#0a2a18,#0d1119);z-index:5;text-align:center;padding-top:90px}'
        +'.screen-call.on{display:block}'
        +'.screen-call .av{font-size:80px}.screen-call .nm{font-size:24px;margin:10px 0}.screen-call .st{font-size:12px;color:#8b90a5}'
        +'.hang{border:none;border-radius:50%;width:66px;height:66px;background:#ef4444;color:#fff;font-size:26px;margin-top:60px;cursor:pointer}'
        +'.del{border:none;background:none;color:#8b90a5;font-size:14px}',
      html:'<div class="ph"><div class="sub">拨号盘 · 输入号码</div><div class="num" id="num">_</div>'
        +'<div class="pad">'+nums.map(n=>'<button data-n="'+n+'">'+n+'</button>').join('')+'</div>'
        +'<button class="call" id="call">📞</button></div>'
        +'<div class="screen-call" id="sc"><div class="av">'+pick(['🤖','👽','🐈','🧑‍🚀','📞'])+'</div>'
        +'<div class="nm" id="cn">未知号码</div><div class="st" id="cs">正在接通…</div>'
        +'<button class="hang" id="hang">📵</button></div>',
      js:'var num="",numEl=document.getElementById("num");'
        +'document.querySelectorAll(".pad button").forEach(function(b){b.onclick=function(){'
        +'if(b.dataset.n==="*"){num=num.slice(0,-1)}else{num+=b.dataset.n}numEl.textContent=num||"_"}});'
        +'var sc=document.getElementById("sc");'
        +'document.getElementById("call").onclick=function(){if(!num)num="10086";sc.classList.add("on");'
        +'document.getElementById("cn").textContent=num;'
        +'setTimeout(function(){document.getElementById("cs").textContent="通话中 0:0"+Math.floor(Math.random()*9)},1200);'
        +'setTimeout(function(){document.getElementById("cs").textContent="对方："+'+JSON.stringify(pick(WORDS.messages))+'},3200)};'
        +'document.getElementById("hang").onclick=function(){sc.classList.remove("on");num="";numEl.textContent="_"}'
    });
  };

  /* ---------- 健康：一眼假但很励志 ---------- */
  B.health = function(){
    const L=(typeof window.__LLM!=='undefined'&&window.__LLM)?window.__LLM:null;
    const days=['一','二','三','四','五','六','日'].map(d=>({d,v:randInt(2000,16000)}));
    const max=Math.max(...days.map(x=>x.v),1);
    const bars=days.map(x=>'<div class="barwrap"><div class="bar" style="height:'+Math.round(x.v/max*100)+'%"></div><span>'+x.d+'</span></div>').join('');
    const steps=randInt(3000,19999), hr=randInt(55,110), sleep=(Math.random()*4+5).toFixed(1);
    return shell({
      title:'健康', icon:'❤️', accent:'#fb7185',
      css:'.hl{padding:20px}.hl h3{margin:2px 0 14px;font-size:15px}'
        +'.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px}'
        +'.stat{padding:14px 8px;text-align:center}.stat b{font-size:20px;display:block}.stat b.red{color:#fb7185}.stat b.blu{color:#60a5fa}.stat b.yel{color:#fbbf24}'
        +'.stat span{font-size:10px;color:#8b90a5}'
        +'.chart{height:150px;padding:16px}.ct{font-size:12px;margin-bottom:12px}'
        +'.bars{display:flex;align-items:flex-end;gap:8px;height:100px}'
        +'.barwrap{flex:1;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:5px}'
        +'.bar{width:60%;background:linear-gradient(#fb7185,#be123c);border-radius:6px 6px 0 0;min-height:4px}'
        +'.barwrap span{font-size:9px;color:#8b90a5}'
        +'.tip{margin-top:16px;text-align:center;font-size:11px;color:#7c8096}',
      html:'<div class="hl"><h3>今日健康 · 已同步手环数据</h3>'
        +'<div class="stats"><div class="stat card"><b class="red">'+steps.toLocaleString()+'</b><span>步数</span></div>'
        +'<div class="stat card"><b class="blu">'+hr+'</b><span>心率 bpm</span></div>'
        +'<div class="stat card"><b class="yel">'+sleep+'</b><span>睡眠 小时</span></div></div>'
        +'<div class="chart card"><div class="ct">本周步数</div><div class="bars">'+bars+'</div></div>'
        +(L&&L.comment?'<div class="tip" style="color:#c4b5fd">💬 '+L.comment+'</div>':'')
        +'<div class="tip">⚠ 数据来源：'+(L?'在线健康服务 · ':'健康手环 X1 · ')+'仅供参考，请勿用于就医</div></div>'
    });
  };

  /* ---------- 设置：一本正经的幻觉系统信息 ---------- */
  B.settings = function(){
    const ver=pick(WORDS.systemVer), city=pick(WORDS.cities);
    const cfg=(typeof window.__CFG!=='undefined'&&window.__CFG)?window.__CFG:{confidence:0.35,apiBase:'',apiKey:'',model:'openai-fast'};
    const conf=Number(cfg.confidence);
    const rows=[
      ['📱','设备名称','幻卓 Huandroid · '+pick(['Pro','Ultra','SE','falshi 1'])],
      ['⚙️','系统版本',ver],
      ['💾','存储空间',randInt(32,512)+' GB / ∞ 已用'],
      ['📍','当前位置',city],
      ['🌐','网络','5G 网络 · 信号良好']
    ].map(r=>'<div class="row"><span class="ri">'+r[0]+'</span><span>'+r[1]+'</span><span class="rv">'+r[2]+'</span></div>').join('');
    return shell({
      title:'设置', icon:'⚙️', accent:'#9ca3af',
      css:'.se{padding:16px}.se h3{margin:2px 2px 12px;font-size:15px}'
        +'.grp{margin-bottom:16px}.gl{font-size:10px;color:#8b90a5;margin:0 4px 8px;letter-spacing:.5px;font-weight:600}'
        +'.row{display:flex;align-items:center;gap:12px;padding:12px 14px;font-size:13px;border-bottom:1px solid rgba(255,255,255,.05)}'
        +'.row:last-child{border:none}.ri{font-size:17px;width:22px}.rv{margin-left:auto;color:#8b90a5;font-size:11px;text-align:right;max-width:58%}'
        +'.conf{padding:18px 16px}'
        +'.conf-top{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px}'
        +'.conf-val{font-size:28px;font-weight:200;color:#a78bfa;font-variant-numeric:tabular-nums}'
        +'.conf-mode{font-size:12px;font-weight:700;padding:3px 10px;border-radius:999px}'
        +'.conf input[type=range]{width:100%;margin:12px 0 4px;accent-color:#a78bfa}'
        +'.conf-ends{display:flex;justify-content:space-between;font-size:10px;color:#6a6e82}'
        +'.conf-desc{font-size:11px;color:#8b90a5;line-height:1.6;margin-top:10px;min-height:34px}'
        +'.api input{width:100%;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:10px;'
        +'padding:10px 12px;color:#fff;font-size:12px;outline:none;margin-bottom:8px}'
        +'.api input:focus{border-color:#a78bfa}'
        +'.api input::placeholder{color:#5f6377}'
        +'.api .lbl{font-size:10px;color:#8b90a5;margin:6px 2px 4px;display:block}'
        +'.save{width:100%;border:none;border-radius:12px;padding:11px;background:linear-gradient(120deg,#7c3aed,#2563eb);color:#fff;font-weight:700;font-size:13px;cursor:pointer;margin-top:4px}'
        +'.about{text-align:center;padding:20px;color:#6a6e82;font-size:11px;line-height:1.8}'
        +'.about .lg{font-size:36px}.about b{display:block;font-size:15px;color:#c9cad6;margin:6px 0}',
      html:'<div class="se"><h3>系统设置</h3>'
        +'<div class="grp card conf"><div class="gl">🎚️ 现实置信度 · 内容风格</div>'
        +'<div class="conf-top"><span class="conf-val" id="cv">'+conf.toFixed(2)+'</span><span class="conf-mode" id="cm"></span></div>'
        +'<input type="range" id="cr" min="0" max="1" step="0.01" value="'+conf+'">'
        +'<div class="conf-ends"><span>0 · 天马行空</span><span>1 · 真实世界</span></div>'
        +'<div class="conf-desc" id="cd"></div></div>'
        +'<div class="grp card api"><div class="gl">🔌 大模型 API（留空使用内置服务）</div>'
        +'<label class="lbl">API 地址（OpenAI 兼容，需支持跨域）</label>'
        +'<input id="apiBase" placeholder="https://your-api.com/v1" value="'+(cfg.apiBase||'')+'">'
        +'<label class="lbl">API Key（可选）</label>'
        +'<input id="apiKey" type="password" placeholder="sk-..." value="'+(cfg.apiKey||'')+'">'
        +'<label class="lbl">模型名</label>'
        +'<input id="model" placeholder="openai-fast" value="'+(cfg.model||'')+'">'
        +'<button class="save" id="saveCfg">保存设置</button></div>'
        +'<div class="grp card"><div class="gl">关于本机</div>'+rows+'</div>'
        +'<div class="about card"><div class="lg">✦</div><b>幻卓 Huandroid</b>'
        +'一台会自己生成应用的安卓手机<br>应用由 AI 实时生成<br>version '+ver+'</div></div>',
      js:'var cr=document.getElementById("cr"),cv=document.getElementById("cv"),cm=document.getElementById("cm"),cd=document.getElementById("cd");'
        +'function mode(v){if(v>=0.8)return ["🌍 真实模式","#4ade80","内容贴近真实世界，数据合理可信，AI 保持克制。"];'
        +'if(v>=0.5)return ["⚖️ 平衡模式","#fbbf24","真实与创意各半，带点冷幽默。"];'
        +'if(v>=0.2)return ["✨ 创意模式","#a78bfa","天马行空、一本正经地虚构，适合找乐子。"];'
        +'return ["🌈 幻想模式","#f87171","充满想象力，像童话或梦境一样。"]}'
        +'function upd(){var v=+cr.value,m=mode(v);cv.textContent=v.toFixed(2);cv.style.color=m[1];cm.textContent=m[0];'
        +'cm.style.background=m[1]+"22";cm.style.color=m[1];cd.textContent=m[2];'
        +'parent.postMessage({type:"config",cfg:{confidence:v}}, "*")}'
        +'cr.addEventListener("input",upd);upd();'
        +'document.getElementById("saveCfg").onclick=function(){'
        +'var c={confidence:+cr.value,apiBase:document.getElementById("apiBase").value.trim(),'
        +'apiKey:document.getElementById("apiKey").value.trim(),model:document.getElementById("model").value.trim()||"openai-fast"};'
        +'parent.postMessage({type:"config",cfg:c},"*");this.textContent="✓ 已保存";var s=this;setTimeout(function(){s.textContent="保存设置"},1500)};'
    });
  };

  /* ---------- 任意词现编：Spotlight 搜到不存在的应用时 ---------- */
  window.improviseGeneric = function(topic){
    topic=(topic||'神秘应用').slice(0,12);
    const L=(typeof window.__LLM!=='undefined'&&window.__LLM)?window.__LLM:null;
    const pal=neonPalette(), adj=pick(WORDS.adjectives), noun=pick(WORDS.nouns);
    const features=(L&&Array.isArray(L.features)&&L.features.length)?L.features:pickN(['语音吐槽','AI 算命','自动摸鱼','量子记账','情绪识别','赛博祈福','智能找借口','梦境回放','反向打卡','电子木鱼'],3);
    const tagline=(L&&L.tagline)?L.tagline:(adj+noun+' · 由 AI 生成，独一无二');
    const fl=features.map(f=>'<div class="gf"><span>✦</span><div><b>'+f+'</b><small>由'+(L?'在线服务':'本地引擎')+'实时驱动</small></div></div>').join('');
    return shell({
      title:topic, icon:'✦', accent:pal.a,
      css:'.gn{padding:22px;text-align:center}'
        +'.gb{width:120px;height:120px;border-radius:30px;margin:8px auto 18px;background:linear-gradient(135deg,'+pal.a+','+pal.b+');'
        +'display:flex;align-items:center;justify-content:center;font-size:56px;box-shadow:0 16px 36px rgba(0,0,0,.4)}'
        +'.gn h2{font-size:22px;margin:0 0 4px}.gn .sub{font-size:12px;color:#8b90a5;margin-bottom:22px}'
        +'.gf{display:flex;gap:12px;align-items:center;text-align:left;padding:13px 15px;margin-bottom:10px;border-radius:14px}'
        +'.gf span{font-size:20px;color:var(--ac)}.gf b{font-size:13px;display:block}.gf small{font-size:10px;color:#8b90a5}'
        +'.open{margin-top:12px;border:none;border-radius:999px;padding:12px 30px;background:var(--ac);color:#0b0b12;font-weight:700;cursor:pointer;font-size:14px}',
      html:'<div class="gn"><div class="gb">'+pick(['🪄','🔮','🤖','🫧','🧊','🌈'])+'</div>'
        +'<h2>'+topic+'</h2><div class="sub">'+tagline+'</div>'
        +fl+'<button class="open" id="op">立即体验</button></div>',
      js:'document.getElementById("op").onclick=function(){this.textContent="✦ 正在运行…";'
        +'var s=this;setTimeout(function(){s.textContent="功能正在生成，请稍候…"},1600)}'
    });
  };

})();
