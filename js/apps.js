/* ============ Hallucindriod · 幻卓 · 幻觉应用生成器（一）============
 * 每个 builder 现场拼出一份完整 HTML 文档，塞进沙箱 iframe。
 * 每次调用取样不同 → 「永不重样」。
 * 通过 parent.postMessage({type:'close'|'regen'}) 与系统通信。
 */
(function(){
  const D = window.OS_DATA;
  const { pick, pickN, chance, randInt, neonPalette, WORDS } = D;

  // 所有应用共用的外壳 + 基础样式
  function shell(cfg){
    const accent = cfg.accent || '#a78bfa';
    const bare = !!cfg.bare;
    return '<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8">'
    + '<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">'
    + '<style>'
    + ':root{--ac:'+accent+'}'
    + '*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}'
    + 'html{height:100%}'
    + 'body{margin:0;height:100vh;display:flex;flex-direction:column;font-family:-apple-system,"PingFang SC","Microsoft YaHei",sans-serif;'
    + 'background:#101119;color:#f2f2f7;overflow:hidden}'
    + '.abar{flex:0 0 52px;height:52px;padding:0 8px;display:flex;align-items:center;justify-content:space-between;'
    + 'background:rgba(20,21,32,.9);border-bottom:1px solid rgba(255,255,255,.07);position:relative;z-index:2}'
    + '.ab-btn{border:none;background:none;color:var(--ac);font-size:14px;padding:8px 10px;cursor:pointer;min-width:52px}'
    + '.ab-btn:active{opacity:.5}'
    + '.ab-title{font-size:14px;font-weight:700;display:flex;align-items:center;gap:6px}'
    + '.ab-body{flex:1;min-height:0;overflow-y:auto;scrollbar-width:none}'
    + '.ab-body::-webkit-scrollbar{display:none}'
    + '.fab-back{position:fixed;right:12px;bottom:74px;z-index:60;width:32px;height:32px;border:none;border-radius:50%;'
    + 'background:rgba(0,0,0,.38);color:#fff;font-size:17px;line-height:1;display:flex;align-items:center;justify-content:center;'
    + 'backdrop-filter:blur(6px);cursor:pointer}'
    + '.fab-back:active{background:rgba(0,0,0,.6)}'
    + '.card{background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.07);border-radius:16px}'
    + '.muted{color:#8b90a5}'
    + (cfg.css||'')
    + '</style></head><body>'
    + (bare
        ? '<button class="fab-back" onclick="parent.postMessage({type:\'close\'},\'*\')" aria-label="返回">‹</button>'
        : '<div class="abar">'
          + '<button class="ab-btn" onclick="parent.postMessage({type:\'close\'},\'*\')">‹ 返回</button>'
          + '<div class="ab-title">'+(cfg.icon||'✦')+' '+String(cfg.title||'应用').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))+'</div>'
          + '<span class="ab-btn" style="text-align:right" aria-hidden="true"></span>'
          + '</div>')
    + '<div class="ab-body">'+(cfg.html||'')+'</div>'
    + '<script>'+(cfg.js||'').replace(/<\/script/gi,'<\\/script')+'</script>'
    + '</body></html>';
  }

  const B = window.APP_BUILDERS = window.APP_BUILDERS || {};

  /* ---------- 计算器：能算，但自信地偶尔算错 ---------- */
  B.calculator = function(){
    const pal = neonPalette();
    const L=(typeof window.__LLM!=='undefined'&&window.__LLM)?window.__LLM:null;
    const sign = (L&&L.sign) || 'AI 计算引擎';
    const tip = (L&&L.tip) || '结果由 AI 确信，可能略有偏差';
    const wrong = chance(.5);
    const js = `
      var disp=document.getElementById('disp'),expr='',done=false;
      function shows(v){disp.textContent=v}
      document.querySelectorAll('.k').forEach(function(b){
        b.onclick=function(){
          var v=b.dataset.v;
          if(v==='C'){expr='';shows('0');done=false;return}
          if(v==='⌫'){expr=expr.slice(0,-1);shows(expr||'0');done=false;return}
          if(v==='='){
            if(!expr)return;
            try{
              var r=eval(expr);
              ${wrong ? "if(Math.random()<0.28){r=r+(Math.random()<0.5?-1:1)*(1+Math.floor(Math.random()*9));document.getElementById('warn').style.display='block'}" : ""}
              shows(String(+r.toFixed(8)));expr=String(+r.toFixed(8));done=true;
            }catch(e){shows('错误');expr=''}
            return;
          }
          if(done){expr='';done=false}
          expr+=v;shows(expr);
        };
      });`;
    const keys = ['C','⌫','%','÷','7','8','9','×','4','5','6','−','1','2','3','+','±','0','.','=']
      .map(v=>'<button class="k'+(v==='='?' eq':' fun')+'" data-v="'+({'÷':'/','×':'*','−':'-'}[v]||v)+'">'+v+'</button>').join('');
    return shell({
      title:'计算器', icon:'🧮', accent:pal.a,
      css:'.calc{height:100%;display:flex;flex-direction:column;padding:14px 18px 20px;gap:14px}'
        +'.scr{flex:0 0 auto;text-align:right;padding:16px 6px 10px}'
        +'.sign{font-size:10px;color:#8b90a5;text-align:left;margin-bottom:10px;display:flex;align-items:center;gap:5px}'
        +'.sign b{color:var(--ac);font-weight:600}'
        +'.scr #disp{font-size:44px;font-weight:200;font-variant-numeric:tabular-nums;word-break:break-all;line-height:1.15}'
        +'.warn{color:#fbbf24;font-size:11px;display:none;text-align:right;margin-top:4px}'
        +'.keys{flex:1;display:grid;grid-template-columns:repeat(4,1fr);grid-auto-rows:1fr;gap:11px;max-height:460px}'
        +'.k{border:none;border-radius:16px;background:rgba(255,255,255,.07);color:#fff;font-size:22px;font-weight:500;cursor:pointer}'
        +'.k:active{transform:scale(.93);background:rgba(255,255,255,.15)}'
        +'.k.fun{background:rgba(167,139,250,.2);color:#c4b5fd}'
        +'.k.eq{background:var(--ac);color:#0b0b12;font-weight:700}',
      html:'<div class="calc"><div class="scr"><div class="sign">✦ <b>'+sign+'</b></div><div id="disp">0</div><div class="warn" id="warn">⚠ '+tip+'</div></div><div class="keys">'+keys+'</div></div>',
      js:js
    });
  };

  /* ---------- 天气：城市、天气、温度全现编 ---------- */
  B.weather = function(){
    const L=(typeof window.__LLM!=='undefined'&&window.__LLM)?window.__LLM:null;
    const __W=(window.OS_DATA&&window.OS_DATA.ensureWorld)?window.OS_DATA.ensureWorld():null;
    const baseCity=(__W&&__W.city)||(L&&L.city)||pick(WORDS.cities);
    const baseW=(L&&L.weather)||pick(WORDS.weather);
    const t0=(L&&typeof L.temp==='number')?L.temp:randInt(-5,41);
    // 准备 4 个城市的数据，切换时不重新请求
    const others=pickN(WORDS.cities.filter(c=>c!==baseCity),3);
    const cities=[baseCity].concat(others).map((c,i)=>{
      const t=i===0?t0:randInt(-2,36);
      const days=Array.from({length:5},(_,k)=>{
        const d=['今天','明天','后天','周四','周五'][k];
        const we=pick(WORDS.weather), e=pick(WORDS.weatherEmoji);
        const hi=t+randInt(-2,6), lo=hi-randInt(6,11);
        return {d:d,e:e,we:we,hi:hi,lo:lo,hum:randInt(30,92),wind:randInt(1,7),sun:randInt(4,9)};
      });
      return {city:c,t:t,w:i===0?baseW:pick(WORDS.weather),emo:i===0?pick(WORDS.weatherEmoji):pick(WORDS.weatherEmoji),
        feel:t+randInt(-4,4),aqi:randInt(20,260),days:days,tip:i===0?((L&&L.tip)||''):''};
    });
    const dataJSON=JSON.stringify({cities:cities}).replace(/</g,'\\u003c');
    const js = `var D=${dataJSON},cur=0;
var box=document.getElementById('wxBox'),dtl=document.getElementById('wxDtl');
function escW(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]})}
function aqiTxt(a){return a<50?'优':a<100?'良':a<150?'轻度污染':'重污染'}
function render(){
  var c=D.cities[cur];
  box.innerHTML='<div class="wx"><div class="cityrow"><button class="nav" id="wxPrev">‹</button>'
    +'<div class="citywrap"><div class="city">'+escW(c.city)+'</div><div class="now">'+escW(c.w)+' · 卫星实时观测</div></div>'
    +'<button class="nav" id="wxNext">›</button></div>'
    +'<div class="big"><div class="e">'+escW(c.emo)+'</div><div class="t">'+c.t+'°</div>'
    +'<div class="d">体感 '+c.feel+'°<br>'+escW(c.w)+'</div></div>'
    +'<div class="aqi card"><span>空气质量 AQI <b>'+c.aqi+'</b></span><span>'+aqiTxt(c.aqi)+'</span></div>'
    +'<div class="fcs card">'+c.days.map(function(d,i){
        return '<div class="fc" data-d="'+i+'"><span>'+escW(d.d)+'</span><span>'+escW(d.e)+'</span>'
          +'<span class="muted">'+escW(d.we)+'</span><span>'+d.lo+'° ~ '+d.hi+'°</span></div>';
      }).join('')+'</div>'
    +(c.tip?'<div class="tip" style="color:#c4b5fd">💡 '+escW(c.tip)+'</div>':'')
    +'<div class="dotrow">'+D.cities.map(function(x,i){return '<i class="'+(i===cur?'on':'')+'"></i>'}).join('')+'</div>'
    +'<div class="tip">左右切换城市 · 点某一天看详情</div></div>';
  document.getElementById('wxPrev').onclick=function(){cur=(cur-1+D.cities.length)%D.cities.length;render()};
  document.getElementById('wxNext').onclick=function(){cur=(cur+1)%D.cities.length;render()};
  box.querySelectorAll('.fc').forEach(function(el){
    el.onclick=function(){
      var d=c.days[Number(this.getAttribute('data-d'))];
      dtl.innerHTML='<div class="dtlcard"><h3>'+c.city+' · '+d.d+'</h3>'
        +'<div class="drow"><span>天气</span><b>'+d.e+' '+d.we+'</b></div>'
        +'<div class="drow"><span>气温</span><b>'+d.lo+'° ~ '+d.hi+'°</b></div>'
        +'<div class="drow"><span>湿度</span><b>'+d.hum+'%</b></div>'
        +'<div class="drow"><span>风力</span><b>'+d.wind+' 级</b></div>'
        +'<div class="drow"><span>紫外线</span><b>'+['弱','中等','强','很强'][Math.min(3,Math.floor(d.sun/3))]+'</b></div>'
        +'<button class="dclose" id="dclose">关闭</button></div>';
      dtl.classList.add('on');
      document.getElementById('dclose').onclick=function(){dtl.classList.remove('on')};
    };
  });
}
render();`;

    return shell({
      title:'天气', icon:'⛅', accent:'#38bdf8',
      css:'.wx{padding:20px;background:linear-gradient(170deg,#0c2a4a,#0a1526 70%);min-height:100%}'
        +'.cityrow{display:flex;align-items:center;gap:6px}'
        +'.citywrap{flex:1;text-align:center}'
        +'.city{font-size:24px;font-weight:600}.now{font-size:12px;color:#9fb6d0;margin-top:2px}'
        +'.nav{width:32px;height:32px;border-radius:50%;border:none;background:rgba(255,255,255,.1);color:#cfe3f7;font-size:18px;cursor:pointer;flex-shrink:0}'
        +'.nav:active{background:rgba(255,255,255,.22)}'
        +'.big{display:flex;align-items:center;justify-content:space-between;margin:14px 0}'
        +'.big .e{font-size:70px}.big .t{font-size:62px;font-weight:200;line-height:1}'
        +'.big .d{text-align:right;font-size:12.5px;color:#9fb6d0}'
        +'.aqi{display:flex;justify-content:space-between;padding:13px 16px;margin-bottom:14px;font-size:12.5px}'
        +'.fcs{padding:6px 14px}'
        +'.fc{display:grid;grid-template-columns:52px 26px 1fr auto;align-items:center;gap:8px;padding:12px 2px;font-size:12.5px;border-bottom:1px solid rgba(255,255,255,.05);cursor:pointer}'
        +'.fc:last-child{border:none}.fc:active{background:rgba(255,255,255,.05)}'
        +'.fc .muted{font-size:11px;text-align:right;color:#8b90a5}'
        +'.tip{margin-top:12px;font-size:11px;color:#7f93ab;text-align:center}'
        +'.dotrow{display:flex;justify-content:center;gap:6px;margin-top:14px}'
        +'.dotrow i{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.28)}'
        +'.dotrow i.on{width:16px;background:#7dd3fc}'
        +'.dtl{position:fixed;inset:0;background:rgba(6,12,22,.92);display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;transition:.18s}'
        +'.dtl.on{opacity:1;pointer-events:auto}'
        +'.dtlcard{width:78%;background:#12233a;border:1px solid rgba(255,255,255,.12);border-radius:18px;padding:20px 18px}'
        +'.dtlcard h3{margin:0 0 14px;font-size:15px}'
        +'.drow{display:flex;justify-content:space-between;padding:9px 0;font-size:12.5px;color:#9fb6d0;border-bottom:1px solid rgba(255,255,255,.06)}'
        +'.drow b{color:#e6eef8}.drow:last-of-type{border:none}'
        +'.dclose{width:100%;margin-top:16px;border:none;border-radius:12px;padding:11px;background:rgba(255,255,255,.12);color:#fff;font-size:13px;cursor:pointer}',
      html:'<div id="wxBox"></div><div class="dtl" id="wxDtl"></div>',
      js:js
    });
  };

  /* ---------- 相册：CSS 现编的"照片" ---------- */
  B.album = function(){
    const L=(typeof window.__LLM!=='undefined'&&window.__LLM)?window.__LLM:null;
    const llms=L&&Array.isArray(L.photos)?L.photos:null;
    const n = llms?Math.max(llms.length,4):randInt(6,8);
    const emos=['🌌','🐈','🌊','🌇','🛸','🌸','🪐','🌵','🍋','🌙','🏔️','🍜'];
    let tiles='';
    for(let i=0;i<n;i++){
      const cap=llms&&llms[i]?llms[i].title:pick(WORDS.photoCaptions);
      const e=llms&&llms[i]?llms[i].emoji:emos[i%emos.length];
      const seed='hallucindriod'+i*7+randInt(1,999);
      const date=randInt(2020,2026)+'.'+String(randInt(1,12)).padStart(2,'0')+'.'+String(randInt(1,28)).padStart(2,'0');
      tiles+='<div class="ph" data-cap="'+cap+'" data-date="'+date+'">'
        +'<img src="https://picsum.photos/seed/'+seed+'/420/420" alt="'+cap+'" loading="lazy" '
        +'onerror="this.style.display=\'none\';this.parentNode.classList.add(\'noimg\');this.parentNode.setAttribute(\'data-emo\',\''+e+'\')">'
        +'<div class="phcap">'+cap+'</div><div class="phmeta">'+date+'</div></div>';
    }
    return shell({
      title:'相册', icon:'🖼️', accent:'#f472b6',
      css:'.al{padding:16px}.al h3{margin:4px 2px 14px;font-size:15px}'
        +'.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:11px}'
        +'.ph{aspect-ratio:1;border-radius:14px;position:relative;overflow:hidden;border:1px solid rgba(255,255,255,.1);'
        +'background:linear-gradient(135deg,#2a2f45,#1a1d2b);cursor:pointer}'
        +'.ph img{width:100%;height:100%;object-fit:cover;display:block}'
        +'.ph.noimg:after{content:attr(data-emo);position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:48px}'
        +'.phcap{position:absolute;left:0;right:0;bottom:0;padding:16px 10px 20px;font-size:11px;font-weight:600;color:#fff;'
        +'background:linear-gradient(180deg,transparent,rgba(0,0,0,.72));text-shadow:0 1px 4px rgba(0,0,0,.6)}'
        +'.phmeta{position:absolute;left:10px;bottom:8px;font-size:9px;color:rgba(255,255,255,.72)}'
        +'.hint{text-align:center;font-size:11px;color:#7c8096;margin-top:16px}'
        +'.viewer{position:fixed;inset:0;background:#000;z-index:80;display:none;flex-direction:column}'
        +'.viewer.on{display:flex}'
        +'.vtop{height:48px;display:flex;align-items:center;gap:10px;padding:0 12px;color:#fff}'
        +'.vtop button{border:none;background:none;color:#fff;font-size:24px;cursor:pointer}'
        +'.vtop b{font-size:13px;font-weight:500}'
        +'.vimg{flex:1;display:flex;align-items:center;justify-content:center;padding:10px}'
        +'.vimg img{max-width:100%;max-height:100%;border-radius:10px;object-fit:contain}'
        +'.vbot{padding:14px 18px 24px;color:#e6e7ee;font-size:13px}'
        +'.vbot small{display:block;color:#8b90a5;font-size:10.5px;margin-top:5px}',
      html:'<div class="al"><h3>📚 全部照片 · '+n+' 张</h3><div class="grid">'+tiles+'</div>'
        +'<div class="hint">点击查看大图</div></div>'
        +'<div class="viewer" id="vw"><div class="vtop"><button id="vwbk">‹</button><b>照片</b></div>'
        +'<div class="vimg" id="vwi"></div><div class="vbot" id="vwb"></div></div>',
      js:'var vw=document.getElementById("vw"),vwi=document.getElementById("vwi"),vwb=document.getElementById("vwb");'
        +'document.querySelectorAll(".ph").forEach(function(p){p.onclick=function(){'
        +'  var img=this.querySelector("img"),src=img?img.getAttribute("src"):"";'
        +'  var emo=this.getAttribute("data-emo")||"🌄";'
        +'  vwi.innerHTML="";'
        +'  if(img){var el=document.createElement("img");el.src=img.getAttribute("src");'
        +'    el.onerror=function(){vwi.innerHTML="";var d=document.createElement("div");d.style.fontSize="90px";d.textContent=emo;vwi.appendChild(d)};'
        +'    vwi.appendChild(el)}'
        +'  else{var d2=document.createElement("div");d2.style.fontSize="90px";d2.textContent=emo;vwi.appendChild(d2)}'
        +'  vwb.innerHTML=(this.getAttribute("data-cap")||"照片")+"<small>"+(this.getAttribute("data-date")||"")+"</small>";'
        +'  vw.classList.add("on");'
        +'}});'
        +'document.getElementById("vwbk").onclick=function(){vw.classList.remove("on")};'
    });
  };

  /* ---------- 便签：一段 AI 代写的碎碎念 ---------- */
  B.notes = function(){
    const L=(typeof window.__LLM!=='undefined'&&window.__LLM)?window.__LLM:null;
    const open=pick(WORDS.noteOpeners), end=pick(WORDS.noteEndings), adj=pick(WORDS.adjectives), noun=pick(WORDS.nouns);
    const body=pick([
      '把'+adj+noun+'放进抽屉，等一个有'+pick(WORDS.nouns)+'的下午。',
      '记得给'+pick(WORDS.contacts)+'回消息，虽然我怀疑那条消息也是编的。',
      '今天的核心目标：保持'+adj+'，避免'+pick(WORDS.nouns)+'。',
      '如果'+noun+'会说话，它大概会说：先别急， tudo bem。',
      '攒够 100 个'+noun+'就去看一次'+pick(WORDS.landmarks)+'。'
    ]);
    const noteText=L&&L.text?L.text:(open+'… '+body+' '+end);
    const mood=L&&L.mood?L.mood:'✎';
    const __W3=(window.OS_DATA&&window.OS_DATA.ensureWorld)?window.OS_DATA.ensureWorld():null;
    const sign=(L&&L.sign)||((__W3&&__W3.city)||pick(WORDS.cities));
    const color=pick(['#fde68a','#a7f3d0','#bfdbfe','#fbcfe8']);
    const dark=pick(['#3b2f12','#123a2a','#12283f','#3b1630']);
    return shell({
      title:'便签', icon:'📝', accent:'#fbbf24',
      css:'.nt{padding:20px;height:100%}'
        +'.paper{background:'+color+';color:'+dark+';border-radius:4px 4px 18px 18px;padding:26px 22px;min-height:70%;'
        +'box-shadow:0 14px 30px rgba(0,0,0,.35);position:relative;transform:rotate('+randInt(-2,2)+'deg)}'
        +'.paper::before{content:"";position:absolute;top:-9px;left:50%;transform:translateX(-50%);width:90px;height:20px;background:rgba(255,255,255,.5);border-radius:3px}'
        +'.paper h2{font-size:17px;margin:0 0 16px}.paper p{font-size:15px;line-height:2;margin:0 0 12px;font-family:"Kaiti SC","STKaiti",serif}'
        +'.sig{text-align:right;font-size:12px;opacity:.7;margin-top:24px}'
        +'.ntfoot{text-align:center;color:#7c8096;font-size:11px;margin-top:14px}'
        +'.ntools{display:flex;gap:10px;justify-content:center;margin-top:14px}'
        +'.ntools button{border:none;border-radius:12px;padding:10px 16px;font-size:12px;cursor:pointer;background:rgba(255,255,255,.1);color:#c9cad6}'
        +'.ntools button.primary{background:#fbbf24;color:#3b2f12;font-weight:700}'
        +'.ntools button:active{opacity:.8}'
        +'.paper .meta{font-size:10px;opacity:.55;margin-top:6px}',
      html:'<div class="nt"><div class="paper" id="paper"><h2 id="pTitle">'+mood+' 一条便签</h2>'
        +'<p id="pBody">'+noteText+'</p><div class="sig" id="pSig">—— '+sign+'</div>'
        +'<div class="meta" id="pMeta">1 / 1</div></div>'
        +'<div class="ntools"><button id="nPrev">‹ 上一条</button>'
        +'<button class="primary" id="nNew">＋ 新建</button>'
        +'<button id="nDel">删除</button></div>'
        +'<div class="ntfoot">便签内容由 AI 现编 · 点「新建」可以再写一张</div></div>',
      js:'var NOTES=[{t:'+JSON.stringify(mood)+',b:'+JSON.stringify(noteText)+',s:'+JSON.stringify(sign)+'}];'
        +'var cur=0;'
        +'var IDEAS=["把今天的小事写下来","今天不想努力，只想晒太阳","记得给朋友回条消息","攒钱去看一次远方","把房间收拾干净，心情会好一点"];'
        +'function esc3(s){return String(s==null?"":s).replace(/[&<>]/g,function(c){return ({"&":"&amp;","<":"&lt;",">":"&gt;"})[c]})}'
        +'function draw(){'
        +'  var n=NOTES[cur]||NOTES[0];'
        +'  document.getElementById("pTitle").textContent=n.t+" 第 "+(cur+1)+" 张";'
        +'  document.getElementById("pBody").textContent=n.b;'
        +'  document.getElementById("pSig").textContent="—— "+n.s;'
        +'  document.getElementById("pMeta").textContent=(cur+1)+" / "+NOTES.length;'
        +'}'
        +'document.getElementById("nPrev").onclick=function(){if(NOTES.length<2)return;cur=(cur-1+NOTES.length)%NOTES.length;draw()};'
        +'document.getElementById("nNew").onclick=function(){'
        +'  var idea=IDEAS[NOTES.length%IDEAS.length];'
        +'  NOTES.push({t:"✎",b:idea+"。",s:"我"});'
        +'  cur=NOTES.length-1;draw();'
        +'  var p=document.getElementById("paper");p.style.transform="rotate("+(Math.random()*4-2).toFixed(1)+"deg)";'
        +'};'
        +'document.getElementById("nDel").onclick=function(){'
        +'  if(NOTES.length<2){NOTES=[{t:"✎",b:"（空便签）",s:"我"}];cur=0;draw();return}'
        +'  NOTES.splice(cur,1);if(cur>=NOTES.length)cur=NOTES.length-1;draw();'
        +'};'
        +'draw();'
    });
  };

  /* ---------- 时钟：表盘 + 秒表 ---------- */
  B.clock = function(){
    const tz=pick(['北京时间','标准时间','UTC+8','本地时区','赛博时间']);
    return shell({
      title:'时钟', icon:'🕐', accent:'#94a3b8',
      css:'.ck{padding:24px 20px;text-align:center}'
        +'.face{width:190px;height:190px;margin:10px auto 24px;border-radius:50%;position:relative;'
        +'border:6px solid rgba(255,255,255,.1);background:radial-gradient(circle,#1a1c28,#0d0e15)}'
        +'.face .num{position:absolute;width:100%;top:14px;font-size:11px;color:#8b90a5}'
        +'.hand{position:absolute;left:50%;bottom:50%;transform-origin:50% 100%;border-radius:4px}'
        +'.hh{width:5px;height:52px;background:#fff;margin-left:-2.5px}'
        +'.mh{width:4px;height:72px;background:#c4b5fd;margin-left:-2px}'
        +'.sh{width:2px;height:82px;background:#f87171;margin-left:-1px}'
        +'.dot{position:absolute;left:50%;top:50%;width:10px;height:10px;border-radius:50%;background:#fff;transform:translate(-50%,-50%)}'
        +'.digi{font-size:38px;font-weight:200;font-variant-numeric:tabular-nums}'
        +'.zone{font-size:12px;color:#8b90a5;margin-top:4px}'
        +'.sw{margin-top:24px;padding:16px}.swt{font-size:30px;font-variant-numeric:tabular-nums;color:#5eead4}'
        +'.swb{display:flex;gap:10px;justify-content:center;margin-top:12px}'
        +'.swb button{border:none;border-radius:999px;padding:9px 20px;font-size:13px;cursor:pointer;background:rgba(255,255,255,.1);color:#fff}'
        +'.swb button.go{background:#5eead4;color:#062b28;font-weight:700}',
      html:'<div class="ck"><div class="face"><div class="num">12</div>'
        +'<div class="hand hh" id="hh"></div><div class="hand mh" id="mh"></div><div class="hand sh" id="sh"></div><div class="dot"></div></div>'
        +'<div class="digi" id="digi">00:00:00</div><div class="zone">'+tz+' · 原子钟校准</div>'
        +'<div class="sw card"><div class="swt" id="swt">00:00.00</div><div class="swb">'
        +'<button class="go" id="swbtn">开始</button><button id="swrst">归零</button></div></div></div>',
      js:'var hh=document.getElementById("hh"),mh=document.getElementById("mh"),sh=document.getElementById("sh"),'
        +'digi=document.getElementById("digi");'
        +'function tick(){var d=new Date(),s=d.getSeconds(),m=d.getMinutes(),h=d.getHours()%12;'
        +'sh.style.transform="rotate("+(s*6)+"deg)";mh.style.transform="rotate("+(m*6+s*.1)+"deg)";'
        +'hh.style.transform="rotate("+(h*30+m*.5)+"deg)";'
        +'function p(n){return String(n).padStart(2,"0")}digi.textContent=p(d.getHours())+":"+p(m)+":"+p(s)}'
        +'tick();setInterval(tick,1000);'
        +'var st=0,run=false,t0=0,acc=0,swt=document.getElementById("swt"),swbtn=document.getElementById("swbtn");'
        +'function upd(){if(run){var ms=acc+Date.now()-t0;swt.textContent=p2(Math.floor(ms/60000))+":"+p2(Math.floor(ms/1000)%60)+"."+String(Math.floor(ms/10)%100).padStart(2,"0")}}'
        +'function p2(n){return String(n).padStart(2,"0")}'
        +'setInterval(upd,37);'
        +'swbtn.onclick=function(){if(run){acc+=Date.now()-t0;run=false;swbtn.textContent="继续"}else{t0=Date.now();run=true;swbtn.textContent="暂停"}};'
        +'document.getElementById("swrst").onclick=function(){run=false;acc=0;swt.textContent="00:00.00";swbtn.textContent="开始"};'
    });
  };

  /* ---------- 音乐：荒诞歌单 + 会动的播放器 ---------- */
  B.music = function(){
    const L=(typeof window.__LLM!=='undefined'&&window.__LLM)?window.__LLM:null;
    const llms=L&&Array.isArray(L.songs)?L.songs:null;
    const n=llms?llms.length:randInt(4,6);
    const songs=llms?llms.map(x=>'《'+x.title+'》'):pickN(WORDS.songs,n);
    const arts=llms?llms.map(x=>x.artist||'幻觉歌手'):pickN(WORDS.artists,n);
    const pal=neonPalette();
    const emos0=pick(['🎧','🎹','🎸','🎤','🥁','🎷']);
    let list='';
    songs.forEach((s,i)=>{list+='<div class="song'+(i===0?' act':'')+'" data-i="'+i+'"><span class="sn">'+(i+1)+'</span>'
      +'<span class="st">'+s+'<small> '+arts[i]+'</small></span><span class="sd">3:'+String(randInt(10,59)).padStart(2,'0')+'</span></div>'});
    return shell({
      title:'音乐', icon:'🎵', accent:pal.a,
      css:'.mu{padding:16px 20px;height:100%;overflow-y:auto;scrollbar-width:none}.mu::-webkit-scrollbar{display:none}'
        +'.msrch{display:flex;align-items:center;gap:8px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:8px 8px 8px 12px;margin-bottom:16px}'
        +'.msrch .ic{font-size:14px;color:#8b90a5}'
        +'.msrch input{flex:1;min-width:0;background:none;border:none;outline:none;color:#fff;font-size:12.5px}'
        +'.msrch input::placeholder{color:#6f7488}'
        +'.msrch button{border:none;border-radius:9px;padding:7px 13px;background:var(--ac);color:#0b0b12;font-size:12px;font-weight:700;cursor:pointer}'
        +'.msload{padding:22px 0;text-align:center;color:#8b90a5;font-size:12px}'
        +'.cover{width:100%;aspect-ratio:1.5;border-radius:18px;background:linear-gradient(135deg,'+pal.a+','+pal.b+');'
        +'display:flex;align-items:center;justify-content:center;font-size:66px;box-shadow:0 14px 32px rgba(0,0,0,.4)}'
        +'.now{font-size:16px;font-weight:700;margin:16px 0 2px}.artist{font-size:12px;color:#8b90a5}'
        +'.prog{height:4px;background:rgba(255,255,255,.1);border-radius:4px;margin:16px 0 8px}'
        +'.prog i{display:block;height:100%;width:0;background:var(--ac);border-radius:4px}'
        +'.times{display:flex;justify-content:space-between;font-size:10px;color:#7c8096}'
        +'.ctrls{display:flex;justify-content:center;align-items:center;gap:26px;margin:18px 0}'
        +'.ctrls button{border:none;background:none;color:#fff;font-size:26px;cursor:pointer}.ctrls .play{font-size:40px;color:var(--ac)}'
        +'.songs{margin-top:8px}.song{display:flex;align-items:center;gap:12px;padding:10px 4px;font-size:12px;border-bottom:1px solid rgba(255,255,255,.05)}'
        +'.song .sn{color:#6a6e82;width:14px}.song .st{flex:1}.song .st small{display:block;color:#7c8096;font-size:10px;margin-top:2px}'
        +'.song .sd{color:#6a6e82}.song.act .st{color:#c4b5fd}'
        +'.eq{display:inline-block}.eq i{display:inline-block;width:3px;background:var(--ac);margin-left:2px;animation:eq .6s infinite alternate}'
        +'@keyframes eq{to{height:14px}}',
      html:'<div class="mu"><div class="msrch"><span class="ic">⌕</span><input id="sq" placeholder="搜索歌曲、歌手" autocomplete="off"><button id="sgo">搜索</button></div>'
        +'<div class="cover" id="cover">'+emos0+'</div>'
        +'<div class="now" id="now">'+songs[0]+'</div><div class="artist" id="artist">'+arts[0]+' · 正在播放</div>'
        +'<div class="prog"><i id="prog"></i></div><div class="times"><span id="t1">0:00</span><span id="t2">3:42</span></div>'
        +'<div class="ctrls"><button id="prev">⏮</button><button class="play" id="play">▶</button><button id="next">⏭</button></div>'
        +'<div class="songs card" id="songList" style="padding:6px 14px">'+list+'</div></div>',
      js:'var songs='+JSON.stringify(songs)+',arts='+JSON.stringify(arts)+',idx=0,playing=false,pr=0;'
        +'var now=document.getElementById("now"),artist=document.getElementById("artist"),play=document.getElementById("play"),'
        +'prog=document.getElementById("prog"),t1=document.getElementById("t1"),cover=document.getElementById("cover");'
        +'var emos=["🎧","🎹","🎸","🎤","🥁","🎷"];'
        +'var ac=null,seqTimer=null,step=0,vol=0.16;'
        +'var SCALE=[261.63,293.66,329.63,392.00,440.00,523.25,587.33,659.25,783.99];'
        +'function ensureAC(){'
        +'  var AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;'
        +'  if(!ac){try{ac=new AC()}catch(e){return null}}'
        +'  if(ac.state==="suspended")ac.resume();return ac;}'
        +'function tone(freq,dur,gainPeak,type,when){'
        +'  if(!ac)return;var o=ac.createOscillator(),g=ac.createGain();'
        +'  o.type=type||"sine";o.frequency.value=freq;'
        +'  g.gain.setValueAtTime(0.0001,when);'
        +'  g.gain.exponentialRampToValueAtTime(gainPeak||vol,when+0.03);'
        +'  g.gain.exponentialRampToValueAtTime(0.0001,when+dur);'
        +'  o.connect(g);g.connect(ac.destination);o.start(when);o.stop(when+dur+0.05);}'
        +'function playStep(){'
        +'  if(!playing)return;'
        +'  var i=step+idx*3;'
        +'  var f=SCALE[(i*3+idx*2)%SCALE.length];'
        +'  parent.postMessage({type:"tone",freq:f,dur:0.26,vol:vol,wave:"triangle"},"*");'
        +'  if(step%4===0)parent.postMessage({type:"tone",freq:f/2,dur:0.5,vol:vol*0.7,wave:"sine"},"*");'
        +'  if(step%8===3)parent.postMessage({type:"tone",freq:SCALE[(i*5+2)%SCALE.length],dur:0.18,vol:vol*0.55,wave:"sine"},"*");'
        +'  step++;}'
        +'var seqTimer2=null;'
        +'function startAudio(){if(seqTimer)clearInterval(seqTimer);seqTimer=setInterval(playStep,300);}'
        +'function stopAudio(){if(seqTimer){clearInterval(seqTimer);seqTimer=null}}'
        +'function fmt(s){return Math.floor(s/60)+":"+String(Math.floor(s%60)).padStart(2,"0")}'
        +'function load(i){idx=(i+songs.length)%songs.length;now.textContent=songs[idx];'
        +'artist.textContent=arts[idx]+" · 正在播放";cover.textContent=emos[idx%emos.length];pr=0;step=0;'
        +'document.querySelectorAll(".song").forEach(function(e,j){e.classList.toggle("act",j===idx)});'
        +'prog.style.width="0%";t1.textContent="0:00"}'
        +'function loop(){if(playing){pr+=0.5;if(pr>=222)load(idx+1);prog.style.width=(pr/222*100)+"%";t1.textContent=fmt(pr)}}'
        +'setInterval(loop,500);'
        +'play.onclick=function(){playing=!playing;play.textContent=playing?"⏸":"▶";'
        +'cover.style.transform=playing?"scale(1.03)":"none";'
        +'if(playing)startAudio();else stopAudio();};'
        +'document.getElementById("next").onclick=function(){load(idx+1)};'
        +'document.getElementById("prev").onclick=function(){load(idx-1)};'
        +'function bindSongs(){document.querySelectorAll(".song").forEach(function(e){e.onclick=function(){'
        +'load(+e.dataset.i);playing=true;play.textContent="⏸";cover.style.transform="scale(1.03)";startAudio()}})}'
        +'bindSongs();'
        +'window.__musicState=function(){return {playing:playing,step:step,timer:!!seqTimer}};'
        +'var sq=document.getElementById("sq"),sgo=document.getElementById("sgo"),songList=document.getElementById("songList"),lastQ=0;'
        +'function doSearch(){'
        +'  var q=(sq.value||"").trim();if(!q){return}'
        +'  songList.innerHTML="<div class=msload>正在搜索「"+q+"」…</div>";'
        +'  lastQ=Date.now();'
        +'  parent.postMessage({type:"musicsearch",q:q,nonce:lastQ},"*");'
        +'}'
        +'sgo.onclick=doSearch;sq.onkeydown=function(e){if(e.key==="Enter")doSearch()};'
        +'window.addEventListener("message",function(e){'
        +'  if(!e.data||e.data.type!=="musicdata")return;'
        +'  if(e.data.nonce&&e.data.nonce!==lastQ)return;'
        +'  var d=e.data.data;'
        +'  if(!d||!d.songs||!d.songs.length){songList.innerHTML="<div class=msload>没有找到相关歌曲</div>";return}'
        +'  songs=d.songs.map(function(x){return "《"+x.title+"》"});'
        +'  arts=d.songs.map(function(x){return x.artist||"未知歌手"});'
        +'  var h="";for(var i=0;i<songs.length;i++){h+="<div class=\\"song\\" data-i=\\"+i+\\"><span class=\\"sn\\">"+(i+1)+"</span><span class=\\"st\\">"+songs[i]+"<small> "+arts[i]+"</small></span><span class=\\"sd\\">3:"+(10+i*7)%60+"</span></div>"}'
        +'  songList.innerHTML=h;bindSongs();load(0);'
        +'});'
    });
  };

  /* ---------- 地图：现编的城市与地标 ---------- */
  B.map = function(){
    const L=(typeof window.__LLM!=='undefined'&&window.__LLM)?window.__LLM:null;
    const __W2=(window.OS_DATA&&window.OS_DATA.ensureWorld)?window.OS_DATA.ensureWorld():null;
    const city=(__W2&&__W2.city)||(L&&L.city)||pick(WORDS.cities), marks=(L&&Array.isArray(L.marks)&&L.marks.length>=4)?L.marks:pickN(WORDS.landmarks,4);
    const p=neonPalette();
    let roads='';
    for(let i=0;i<7;i++){const x=randInt(5,90),y=randInt(5,90),w=randInt(20,60);roads+='<div class="road" style="left:'+x+'%;top:'+y+'%;width:'+w+'%;transform:rotate('+randInt(0,180)+'deg)"></div>'}
    const pins=marks.map((m,i)=>'<div class="pin" data-i="'+i+'" style="left:'+[22,68,38,78][i]+'%;top:'+[28,22,64,70][i]+'%">📍<span>'+m+'</span></div>').join('');
    return shell({
      title:'地图', icon:'🗺️', accent:'#34d399',
      css:'.mp{height:100%;display:flex;flex-direction:column}'
        +'.msearch{margin:14px 16px 0;padding:11px 14px;background:rgba(255,255,255,.08);border-radius:14px;font-size:12px;color:#9aa0b5;display:flex;gap:8px;align-items:center}'
        +'.mcanvas{flex:1;margin:12px 16px;border-radius:18px;position:relative;overflow:hidden;'
        +'background:linear-gradient(135deg,'+p.bg||'#0e2a22'+','+p.a+'22)}'
        +'.road{position:absolute;height:5px;background:rgba(255,255,255,.14);border-radius:5px}'
        +'.river{position:absolute;left:-10%;top:45%;width:130%;height:22px;background:'+p.a+'44;transform:rotate(-18deg);border-radius:50%}'
        +'.pin{position:absolute;font-size:20px;transform:translate(-50%,-100%)}'
        +'.pin span{position:absolute;left:20px;top:-2px;white-space:nowrap;font-size:10px;background:rgba(0,0,0,.6);padding:3px 6px;border-radius:6px;color:#fff}'
        +'.route{margin:0 16px 16px;padding:14px 16px;font-size:12px}'
        +'.route b{color:#6ee7b7}'
        +'.go{display:block;width:100%;margin-top:12px;border:none;border-radius:12px;padding:11px;background:#34d399;color:#062a20;font-weight:700;cursor:pointer}'
        +'.pin{cursor:pointer}.pin:active{transform:translate(-50%,-100%) scale(1.18)}'
        +'.msearch{cursor:pointer}.msearch:active{background:rgba(255,255,255,.14)}'
        +'.msh{position:fixed;inset:0;background:rgba(6,14,12,.94);z-index:70;display:flex;flex-direction:column;transform:translateY(100%);transition:.22s}'
        +'.msh.on{transform:none}'
        +'.mshh{height:50px;display:flex;align-items:center;gap:10px;padding:0 14px;border-bottom:1px solid rgba(255,255,255,.07)}'
        +'.mshh button{border:none;background:none;color:#6ee7b7;font-size:23px;cursor:pointer}'
        +'.mshh b{font-size:14px}'
        +'.mshb{flex:1;overflow-y:auto;padding:16px}'
        +'.mrow{display:flex;justify-content:space-between;padding:14px 2px;border-bottom:1px solid rgba(255,255,255,.06);font-size:13px;cursor:pointer}'
        +'.mrow:active{background:rgba(255,255,255,.05)}'
        +'.mrow small{color:#7f93ab;font-size:11px}'
        +'.mshnote{color:#7f93ab;font-size:11px;margin-top:16px;text-align:center}',
      html:'<div class="mp"><div class="msearch" id="msearch">🔍 搜索「'+city+'」· 或直接开始导航</div>'
        +'<div class="mcanvas"><div class="river"></div>'+roads+pins+'</div>'
        +'<div class="route card" id="mroute">🛰️ 已定位到 <b>'+city+'</b> · 途经 '+marks[0]+' → '+marks[1]
        +'<br><span class="muted">全程 '+randInt(2,88)+' 公里，预计 '+randInt(5,120)+' 分钟（路况纯属虚构）</span>'
        +'<button class="go" id="go">开始导航</button></div></div>'
        +'<div class="msh" id="msh"></div>',
      js:'var MARKS='+JSON.stringify(marks)+',CITY='+JSON.stringify(city)+';'
        +'var msh=document.getElementById("msh"),route=document.getElementById("mroute");'
        +'function esc2(s){return String(s==null?"":s).replace(/[&<>]/g,function(c){return ({"&":"&amp;","<":"&lt;",">":"&gt;"})[c]})}'
        +'document.querySelectorAll(".pin").forEach(function(p){'
        +'  p.onclick=function(ev){ev.stopPropagation();'
        +'    var i=Number(this.getAttribute("data-i")),name=MARKS[i]||"地点";'
        +'    var dist=(1+i*1.7).toFixed(1),rate=(4.2+i*0.2).toFixed(1);'
        +'    route.innerHTML="📍 <b>"+esc2(name)+"</b><br><span class=muted>距你 "+dist+" 公里 · ★ "+rate+" · 人气第"+(i+1)+"</span>"'
        +'      +"<button class=go id=go>导航到这里</button>";'
        +'    bindGo();'
        +'  };'
        +'});'
        +'function bindGo(){'
        +'  var b=document.getElementById("go"); if(!b)return;'
        +'  b.onclick=function(){var t=this;t.textContent="导航中… 前方路口右转";setTimeout(function(){t.textContent="已到达（大概）"},2200)};'
        +'}'
        +'bindGo();'
        +'document.getElementById("msearch").onclick=function(){'
        +'  msh.innerHTML="<div class=mshh><button id=mshbk>\u2039</button><b>选择目的地</b></div>"'
        +'    +"<div class=mshb>"+MARKS.map(function(m,i){return "<div class=mrow data-i="+i+"><span>"+esc2(m)+"</span><small>"+(1+i*1.7).toFixed(1)+" km</small></div>"}).join("")'
        +'    +"<div class=mshnote>更多地点由地图服务实时生成</div></div>";'
        +'  msh.classList.add("on");'
        +'  document.getElementById("mshbk").onclick=function(){msh.classList.remove("on")};'
        +'  msh.querySelectorAll(".mrow").forEach(function(r){r.onclick=function(){'
        +'    var i=Number(this.getAttribute("data-i"));'
        +'    route.innerHTML="📍 <b>"+esc2(MARKS[i])+"</b><br><span class=muted>已在路线中 · 全程 "+(3+i*4)+" 公里</span><button class=go id=go>开始导航</button>";'
        +'    bindGo(); msh.classList.remove("on");'
        +'  }});'
        +'};'
    });
  };

  /* ---------- 应用商店：真实搜索 + LLM 现场生成，搜什么都能搜到 ---------- */
  B.store = function(){
    const L=(typeof window.__LLM!=='undefined'&&window.__LLM)?window.__LLM:null;
    const llms=L&&Array.isArray(L.apps)?L.apps:null;
    const n=llms?llms.length:randInt(5,7);
    const ideas=llms?llms.map(x=>x.name):pickN(WORDS.appIdeas,n);
    const emos=['🧘','🐟','⚔️','🔮','😴','📈','💼','🎏','🪞','🤖','🦋','🪙','🌙','🗣️','🎐'];
    const seed=[];
    ideas.forEach((name,i)=>{
      seed.push({
        name:String(name||'神秘应用'),
        desc:(llms&&llms[i]&&llms[i].desc)||pick(WORDS.storeDesc),
        emoji:(llms&&llms[i]&&llms[i].emoji)||emos[i%emos.length]
      });
    });
    const dataJSON=JSON.stringify({apps:seed}).replace(/</g,'\\u003c');
    const emoJSON=JSON.stringify(emos);
    const descJSON=JSON.stringify(WORDS.storeDesc);

    const js = `var D=${dataJSON},EMOS=${emoJSON},DESCS=${descJSON};
var q=document.getElementById('storeQ'),list=document.getElementById('stList'),lbl=document.getElementById('stLabel');
var dtl=document.getElementById('dtl'),nonce=0,lastNonce=0,curApp=null;
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]})}
function hash(s){var h=0;for(var i=0;i<s.length;i++){h=(h*31+s.charCodeAt(i))>>>0}return h}
function gradOf(name){var hs=[[265,320],[200,265],[160,200],[25,320],[340,265],[230,160],[90,160]];var p=hs[hash(name)%hs.length];return 'linear-gradient(135deg,hsl('+p[0]+' 85% 64%),hsl('+p[1]+' 85% 56%))'}
function featsOf(name){return [
  {i:'✦',t:'实时内容生成',d:'每次打开都能看到新的内容'},
  {i:'⚡',t:'打开即用',d:'无需下载安装包，点开就在线运行'},
  {i:'🎛️',t:'个性设置',d:'按你的偏好调整界面与推荐'}
]}
function cardHTML(a){
  return '<div class="sc" data-name="'+esc(a.name)+'">'
    +'<div class="si" style="background:'+gradOf(a.name)+'">'+esc(a.emoji||'✦')+'</div>'
    +'<div class="sinfo"><b>'+esc(a.name)+'</b><span>'+esc(a.desc)+'</span>'
    +'<small>★ '+(4+((hash(a.name)%10)/10)).toFixed(1)+' · '+(1+hash(a.name)%98)+' 万下载</small></div>'
    +'<button class="inst" data-name="'+esc(a.name)+'">获取</button></div>';
}
function renderList(apps){
  list.innerHTML=apps.map(cardHTML).join('');
  bind();
}
function bind(){
  list.querySelectorAll('.sc').forEach(function(c){
    c.onclick=function(ev){
      if(ev.target.closest('.inst'))return;
      openDetail(this.getAttribute('data-name'));
    };
  });
  list.querySelectorAll('.inst').forEach(function(b){
    b.onclick=function(ev){
      ev.stopPropagation();
      var nm=this.getAttribute('data-name');
      install(nm);
      this.textContent='✓ 已添加';
      this.disabled=true;
    };
  });
}
function findApp(name){
  var a=D.apps.filter(function(x){return x.name===name})[0];
  if(a)return a;
  return {name:name,desc:'为你现场生成的应用',emoji:EMOS[hash(name)%EMOS.length]};
}
function openDetail(name){
  var a=findApp(name);curApp=a;
  var fs=featsOf(a.name);
  dtl.innerHTML='<div class="dt">'
    +'<div class="dtop"><button class="dbk" id="dbk">‹</button><b>应用详情</b></div>'
    +'<div class="dbody">'
    +'<div class="dicon" style="background:'+gradOf(a.name)+'">'+esc(a.emoji||'✦')+'</div>'
    +'<h2>'+esc(a.name)+'</h2>'
    +'<p class="dtag">'+esc(a.desc)+'</p>'
    +'<div class="dmeta"><span>★ '+(4+((hash(a.name)%10)/10)).toFixed(1)+'</span><span>'+(1+hash(a.name)%98)+' 万下载</span><span>'+(20+hash(a.name)%80)+' MB</span></div>'
    +fs.map(function(f){return '<div class="dfeat"><span class="fi">'+f.i+'</span><div><b>'+f.t+'</b><span>'+f.d+'</span></div></div>'}).join('')
    +'<button class="dget" id="dget">下载到桌面</button>'
    +'<div class="dtip">由大模型现场生成 · 添加到桌面后即可随时打开</div>'
    +'</div></div>';
  dtl.classList.add('on');
  document.getElementById('dbk').onclick=function(){dtl.classList.remove('on')};
  document.getElementById('dget').onclick=function(){
    install(a.name);
    this.textContent='✓ 已添加到桌面';
    this.disabled=true;
    this.style.opacity=.7;
  };
}
function install(name){
  var a=findApp(name);
  parent.postMessage({type:'install',app:{name:a.name,emoji:a.emoji||'✦',desc:a.desc}},'*');
}
function doSearch(){
  var kw=(q.value||'').trim();if(!kw)return;
  lbl.textContent='搜索「'+kw+'」';
  list.innerHTML='<div class=sload><div class=sp>✦</div><div>正在寻找应用…</div></div>';
  lastNonce=++nonce;
  parent.postMessage({type:'storegen',topic:kw,nonce:lastNonce},'*');
}
document.getElementById('storeGo').onclick=doSearch;
q.onkeydown=function(e){if(e.key==='Enter'){doSearch();q.blur()}};
window.addEventListener('message',function(e){
  if(!e.data||e.data.type!=='storedata')return;
  if(e.data.nonce&&e.data.nonce!==lastNonce)return;
  var kw=e.data.keyword||'应用',apps=e.data.data&&e.data.data.apps;
  var out=[{name:kw,desc:'为你现场生成的应用 · 点击查看详情',emoji:EMOS[hash(kw)%EMOS.length]}];
  if(apps&&apps.length){
    apps.forEach(function(a){
      if(!a||!a.name)return;
      if(a.name===kw)return;
      out.push({name:String(a.name),desc:String(a.desc||DESCS[0]),emoji:String(a.emoji||EMOS[hash(String(a.name))%EMOS.length])});
    });
  }
  D.apps=out;
  renderList(out);
});
renderList(D.apps);
bind();`;

    return shell({
      title:'应用商店', icon:'🛍️', accent:'#818cf8',
      css:'.st{padding:16px;height:100%;overflow-y:auto;scrollbar-width:none}.st::-webkit-scrollbar{display:none}'
        +'.st h3{margin:2px 2px 12px;font-size:15px}'
        +'.srch{display:flex;gap:8px;margin-bottom:14px}'
        +'.srch input{flex:1;min-width:0;padding:11px 14px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.1);border-radius:14px;font-size:12px;color:#fff;outline:none}'
        +'.srch input::placeholder{color:#8b90a5}'
        +'.srch button{border:none;border-radius:14px;padding:0 16px;background:rgba(129,140,248,.28);color:#c7d2fe;font-size:12px;cursor:pointer}'
        +'.stlabel{font-size:11px;color:#8b90a5;margin:0 2px 8px}'
        +'.sc{display:flex;align-items:center;gap:12px;padding:12px 4px;border-bottom:1px solid rgba(255,255,255,.05);cursor:pointer}'
        +'.sc:active{background:rgba(255,255,255,.04)}'
        +'.si{width:50px;height:50px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:26px;flex-shrink:0}'
        +'.sinfo{flex:1;min-width:0}.sinfo b{font-size:13.5px}'
        +'.sinfo span{display:block;font-size:10.5px;color:#8b90a5;margin:3px 0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'
        +'.sinfo small{font-size:10px;color:#fbbf24}'
        +'.inst{border:none;border-radius:999px;padding:7px 15px;font-size:12px;background:rgba(129,140,248,.2);color:#c7d2fe;cursor:pointer;flex-shrink:0}'
        +'.inst:disabled{opacity:.6}'
        +'.foot{text-align:center;color:#6a6e82;font-size:11px;margin-top:18px;padding-bottom:10px}'
        +'.sload{text-align:center;color:#8b90a5;font-size:12px;padding:30px 0}.sload .sp{font-size:26px;animation:spn 1.2s linear infinite;display:inline-block}'
        +'@keyframes spn{to{transform:rotate(360deg)}}'
        +'.dtl{position:fixed;inset:0;background:#101119;z-index:70;display:flex;flex-direction:column;transform:translateX(100%);transition:transform .22s}'
        +'.dtl.on{transform:none}'
        +'.dtop{height:50px;display:flex;align-items:center;gap:10px;padding:0 12px;border-bottom:1px solid rgba(255,255,255,.06);flex-shrink:0}'
        +'.dtop button{border:none;background:none;color:#c7d2fe;font-size:24px;cursor:pointer;padding:0 4px}'
        +'.dtop b{font-size:14.5px}'
        +'.dbody{flex:1;overflow-y:auto;padding:26px 22px 30px;text-align:center;scrollbar-width:none}'
        +'.dbody::-webkit-scrollbar{display:none}'
        +'.dicon{width:96px;height:96px;border-radius:24px;margin:0 auto 18px;display:flex;align-items:center;justify-content:center;font-size:48px;box-shadow:0 14px 34px rgba(0,0,0,.4)}'
        +'.dbody h2{margin:0 0 8px;font-size:20px}'
        +'.dtag{margin:0 0 14px;font-size:12.5px;color:#8b90a5;line-height:1.6}'
        +'.dmeta{display:flex;justify-content:center;gap:18px;font-size:11px;color:#8b90a5;margin-bottom:24px}'
        +'.dmeta span:first-child{color:#fbbf24}'
        +'.dfeat{display:flex;gap:12px;text-align:left;padding:13px 0;border-bottom:1px solid rgba(255,255,255,.05)}'
        +'.dfeat .fi{width:34px;height:34px;border-radius:10px;background:rgba(129,140,248,.16);color:#c7d2fe;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0}'
        +'.dfeat b{display:block;font-size:12.5px;margin-bottom:3px}'
        +'.dfeat span{font-size:11px;color:#8b90a5}'
        +'.dget{width:100%;margin-top:26px;border:none;border-radius:999px;padding:14px;font-size:14px;font-weight:700;color:#0b0b12;background:linear-gradient(135deg,#a5b4fc,#818cf8);cursor:pointer}'
        +'.dget:active{opacity:.85}'
        +'.dtip{margin-top:12px;font-size:10.5px;color:#6a6e82}',
      html:'<div class="st"><h3>应用商店</h3>'
        +'<div class="srch"><input id="storeQ" placeholder="搜索或输入一个应用名" autocomplete="off"><button id="storeGo">搜索</button></div>'
        +'<div class="stlabel" id="stLabel">今日推荐</div>'
        +'<div id="stList"></div>'
        +'<div class="foot">应用均由官方上架 · 安全检测通过</div></div>'
        +'<div class="dtl" id="dtl"></div>',
      js:js
    });
  };

})();
