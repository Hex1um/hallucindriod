/* ============ 幻卓 Huandroid · 幻觉应用生成器（一）============
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
    return '<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8">'
    + '<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">'
    + '<style>'
    + ':root{--ac:'+accent+'}'
    + '*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}'
    + 'html,body{margin:0;height:100%;font-family:-apple-system,"PingFang SC","Microsoft YaHei",sans-serif;'
    + 'background:#101119;color:#f2f2f7;overflow:hidden}'
    + '.abar{height:52px;padding:0 8px;display:flex;align-items:center;justify-content:space-between;'
    + 'background:rgba(20,21,32,.9);border-bottom:1px solid rgba(255,255,255,.07);position:relative;z-index:2}'
    + '.ab-btn{border:none;background:none;color:var(--ac);font-size:14px;padding:8px 10px;cursor:pointer;min-width:52px}'
    + '.ab-btn:active{opacity:.5}'
    + '.ab-title{font-size:14px;font-weight:700;display:flex;align-items:center;gap:6px}'
    + '.ab-badge{font-size:9.5px;color:#7c8096;text-align:center;padding:6px;letter-spacing:.2px;'
    + 'background:rgba(167,139,250,.06);border-bottom:1px solid rgba(255,255,255,.05)}'
    + '.ab-body{height:calc(100% - 82px);overflow-y:auto;scrollbar-width:none}'
    + '.ab-body::-webkit-scrollbar{display:none}'
    + '.card{background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.07);border-radius:16px}'
    + '.muted{color:#8b90a5}'
    + (cfg.css||'')
    + '</style></head><body>'
    + '<div class="abar">'
    + '<button class="ab-btn" onclick="parent.postMessage({type:\'close\'},\'*\')">‹ 返回</button>'
    + '<div class="ab-title">'+(cfg.icon||'✦')+' '+(cfg.title||'应用')+'</div>'
    + '<button class="ab-btn" style="text-align:right" onclick="parent.postMessage({type:\'regen\'},\'*\')">⟳ 刷新</button>'
    + '</div>'
    + '<div class="ab-badge">数据更新于刚刚 · 版本 1.0</div>'
    + '<div class="ab-body">'+(cfg.html||'')+'</div>'
    + '<script>'+(cfg.js||'')+'</script>'
    + '</body></html>';
  }

  const B = window.APP_BUILDERS = window.APP_BUILDERS || {};

  /* ---------- 计算器：能算，但自信地偶尔算错 ---------- */
  B.calculator = function(){
    const pal = neonPalette();
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
        +'.scr #disp{font-size:44px;font-weight:200;font-variant-numeric:tabular-nums;word-break:break-all;line-height:1.15}'
        +'.warn{color:#fbbf24;font-size:11px;display:none;text-align:right;margin-top:4px}'
        +'.keys{flex:1;display:grid;grid-template-columns:repeat(4,1fr);grid-auto-rows:1fr;gap:11px;max-height:460px}'
        +'.k{border:none;border-radius:16px;background:rgba(255,255,255,.07);color:#fff;font-size:22px;font-weight:500;cursor:pointer}'
        +'.k:active{transform:scale(.93);background:rgba(255,255,255,.15)}'
        +'.k.fun{background:rgba(167,139,250,.2);color:#c4b5fd}'
        +'.k.eq{background:var(--ac);color:#0b0b12;font-weight:700}',
      html:'<div class="calc"><div class="scr"><div id="disp">0</div><div class="warn" id="warn">⚠ 结果由 AI 确信，可能略有偏差</div></div><div class="keys">'+keys+'</div></div>',
      js:js
    });
  };

  /* ---------- 天气：城市、天气、温度全现编 ---------- */
  B.weather = function(){
    const L=(typeof window.__LLM!=='undefined'&&window.__LLM)?window.__LLM:null;
    const city = (L&&L.city)||pick(WORDS.cities), w = (L&&L.weather)||pick(WORDS.weather), emo = pick(WORDS.weatherEmoji);
    const t = (L&&typeof L.temp==='number')?L.temp:randInt(-5,41), feel = t+randInt(-4,4);
    const aqi = randInt(20,260), aqiTxt = aqi<50?'优':aqi<100?'良':aqi<150?'轻度污染':'重污染';
    const days = Array.from({length:5},(_,i)=>{
      const d=['今天','明天','后天','大后天','大大后天'][i];
      const we=pick(WORDS.weather), e=pick(WORDS.weatherEmoji), hi=t+randInt(-3,5), lo=hi-randInt(6,12);
      return '<div class="fc"><span>'+d+'</span><span>'+e+'</span><span class="muted">'+we+'</span><span>'+lo+'° ~ '+hi+'°</span></div>';
    }).join('');
    return shell({
      title:'天气', icon:'⛅', accent:'#38bdf8',
      css:'.wx{padding:22px 20px;background:linear-gradient(170deg,#0c2a4a,#0a1526 70%);height:100%}'
        +'.city{font-size:26px;font-weight:600}.now{font-size:13px;color:#9fb6d0;margin-top:2px}'
        +'.big{display:flex;align-items:center;justify-content:space-between;margin:18px 0}'
        +'.big .e{font-size:74px}.big .t{font-size:64px;font-weight:200;line-height:1}'
        +'.big .d{text-align:right;font-size:13px;color:#9fb6d0}'
        +'.aqi{display:flex;justify-content:space-between;padding:13px 16px;margin-bottom:16px}'
        +'.fcs{padding:8px 16px}'
        +'.fc{display:grid;grid-template-columns:56px 28px 1fr auto;align-items:center;gap:8px;padding:12px 2px;font-size:13px;border-bottom:1px solid rgba(255,255,255,.05)}'
        +'.fc:last-child{border:none}.fc .muted{font-size:11px;text-align:right}'
        +'.tip{margin-top:14px;font-size:11px;color:#7f93ab;text-align:center}',
      html:'<div class="wx"><div class="city">'+city+'</div><div class="now">'+pick(WORDS.adjectives)+'天气 · 卫星实时观测</div>'
        +'<div class="big"><div class="e">'+emo+'</div><div class="t">'+t+'°</div><div class="d">体感 '+feel+'°<br>'+w+'</div></div>'
        +'<div class="aqi card"><span>空气质量 AQI <b>'+aqi+'</b></span><span>'+aqiTxt+'</span></div>'
        +'<div class="fcs card">'+days+'</div>'
        +(L&&L.tip?'<div class="tip" style="color:#c4b5fd">💡 '+L.tip+'</div>':'')
        +'<div class="tip">数据来源：'+(L?'在线气象服务 · ':'本地气象数据 · ')+'更新于 '+randInt(1,9)+' 分钟前</div></div>'
    });
  };

  /* ---------- 相册：CSS 现编的"照片" ---------- */
  B.album = function(){
    const L=(typeof window.__LLM!=='undefined'&&window.__LLM)?window.__LLM:null;
    const llms=L&&Array.isArray(L.photos)?L.photos:null;
    const n = llms?Math.max(llms.length,4):randInt(4,7);
    let tiles='';
    for(let i=0;i<n;i++){
      const p=neonPalette(), cap=llms&&llms[i]?llms[i].title:pick(WORDS.photoCaptions), e=llms&&llms[i]?llms[i].emoji:pick(['🌌','🐈','🌊','🌇','🛸','🌸','🪐','🌵','🍋','🌙']);
      tiles+='<div class="ph" style="background:linear-gradient(135deg,'+p.a+'33,'+p.b+'55)">'
        +'<div class="phemo">'+e+'</div><div class="phcap">'+cap+'</div>'
        +'<div class="phmeta">'+randInt(2020,2026)+'.'+String(randInt(1,12)).padStart(2,'0')+'.'+String(randInt(1,28)).padStart(2,'0')+'</div></div>';
    }
    return shell({
      title:'相册', icon:'🖼️', accent:'#f472b6',
      css:'.al{padding:16px}.al h3{margin:4px 2px 14px;font-size:15px}'
        +'.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:11px}'
        +'.ph{aspect-ratio:1;border-radius:16px;position:relative;overflow:hidden;border:1px solid rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center}'
        +'.phemo{font-size:52px;filter:drop-shadow(0 6px 12px rgba(0,0,0,.4))}'
        +'.phcap{position:absolute;left:10px;right:10px;bottom:24px;font-size:11px;font-weight:600;text-shadow:0 1px 4px #000}'
        +'.phmeta{position:absolute;left:10px;bottom:8px;font-size:9px;color:#ddd;opacity:.7}'
        +'.hint{text-align:center;font-size:11px;color:#7c8096;margin-top:16px}',
      html:'<div class="al"><h3>📚 全部照片 · '+n+' 张</h3><div class="grid">'+tiles+'</div>'
        +'<div class="hint">以上照片均由相机现拍，画质取决于模型心情</div></div>'
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
    const sign=L&&L.sign?L.sign:pick(WORDS.cities);
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
        +'.ntfoot{text-align:center;color:#7c8096;font-size:11px;margin-top:22px}',
      html:'<div class="nt"><div class="paper"><h2>'+mood+' 一条便签</h2><p>'+noteText+'</p>'
        +'<div class="sig">— 写于 '+sign+'</div></div>'
        +'<div class="ntfoot">编辑于 '+new Date().toLocaleDateString('zh-CN')+' · 已保存到本机</div></div>'
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
    let list='';
    songs.forEach((s,i)=>{list+='<div class="song'+(i===0?' act':'')+'" data-i="'+i+'"><span class="sn">'+(i+1)+'</span>'
      +'<span class="st">'+s+'<small> '+arts[i]+'</small></span><span class="sd">3:'+String(randInt(10,59)).padStart(2,'0')+'</span></div>'});
    return shell({
      title:'音乐', icon:'🎵', accent:pal.a,
      css:'.mu{padding:18px 20px;height:100%}'
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
      html:'<div class="mu"><div class="cover" id="cover">🎧</div>'
        +'<div class="now" id="now">'+songs[0]+'</div><div class="artist" id="artist">'+arts[0]+' · 正在播放</div>'
        +'<div class="prog"><i id="prog"></i></div><div class="times"><span id="t1">0:00</span><span id="t2">3:42</span></div>'
        +'<div class="ctrls"><button id="prev">⏮</button><button class="play" id="play">▶</button><button id="next">⏭</button></div>'
        +'<div class="songs card" style="padding:6px 14px">'+list+'</div></div>',
      js:'var songs='+JSON.stringify(songs)+',arts='+JSON.stringify(arts)+',idx=0,playing=false,pr=0;'
        +'var now=document.getElementById("now"),artist=document.getElementById("artist"),play=document.getElementById("play"),'
        +'prog=document.getElementById("prog"),t1=document.getElementById("t1"),cover=document.getElementById("cover");'
        +'var emos=["🎧","🎹","🎸","🎤","🥁","🎷"];'
        +'function fmt(s){return Math.floor(s/60)+":"+String(Math.floor(s%60)).padStart(2,"0")}'
        +'function load(i){idx=(i+songs.length)%songs.length;now.textContent=songs[idx];'
        +'artist.textContent=arts[idx]+" · 正在播放";cover.textContent=emos[idx%emos.length];pr=0;'
        +'document.querySelectorAll(".song").forEach(function(e,j){e.classList.toggle("act",j===idx)});'
        +'prog.style.width="0%";t1.textContent="0:00"}'
        +'function loop(){if(playing){pr+=0.5;if(pr>=222)load(idx+1);prog.style.width=(pr/222*100)+"%";t1.textContent=fmt(pr)}}'
        +'setInterval(loop,500);'
        +'play.onclick=function(){playing=!playing;play.textContent=playing?"⏸":"▶";cover.style.transform=playing?"scale(1.03)":"none"};'
        +'document.getElementById("next").onclick=function(){load(idx+1)};'
        +'document.getElementById("prev").onclick=function(){load(idx-1)};'
        +'document.querySelectorAll(".song").forEach(function(e){e.onclick=function(){load(+e.dataset.i);playing=true;play.textContent="⏸"}});'
    });
  };

  /* ---------- 地图：现编的城市与地标 ---------- */
  B.map = function(){
    const L=(typeof window.__LLM!=='undefined'&&window.__LLM)?window.__LLM:null;
    const city=(L&&L.city)||pick(WORDS.cities), marks=(L&&Array.isArray(L.marks)&&L.marks.length>=4)?L.marks:pickN(WORDS.landmarks,4);
    const p=neonPalette();
    let roads='';
    for(let i=0;i<7;i++){const x=randInt(5,90),y=randInt(5,90),w=randInt(20,60);roads+='<div class="road" style="left:'+x+'%;top:'+y+'%;width:'+w+'%;transform:rotate('+randInt(0,180)+'deg)"></div>'}
    const pins=marks.map((m,i)=>'<div class="pin" style="left:'+[22,68,38,78][i]+'%;top:'+[28,22,64,70][i]+'%">📍<span>'+m+'</span></div>').join('');
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
        +'.go{display:block;width:100%;margin-top:12px;border:none;border-radius:12px;padding:11px;background:#34d399;color:#062a20;font-weight:700;cursor:pointer}',
      html:'<div class="mp"><div class="msearch">🔍 搜索「'+city+'」· 或直接开始导航</div>'
        +'<div class="mcanvas"><div class="river"></div>'+roads+pins+'</div>'
        +'<div class="route card">🛰️ 已定位到 <b>'+city+'</b> · 途经 '+marks[0]+' → '+marks[1]
        +'<br><span class="muted">全程 '+randInt(2,88)+' 公里，预计 '+randInt(5,120)+' 分钟（路况纯属虚构）</span>'
        +'<button class="go" id="go">开始导航</button></div></div>',
      js:'document.getElementById("go").onclick=function(){this.textContent="导航中… 前方左转进入"+'+JSON.stringify(pick(WORDS.landmarks))+';'
        +'var self=this;setTimeout(function(){self.textContent="已到达（大概）"},2200)};'
    });
  };

  /* ---------- 应用商店：真实搜索 + LLM 现场生成，搜什么都能搜到 ---------- */
  B.store = function(){
    const L=(typeof window.__LLM!=='undefined'&&window.__LLM)?window.__LLM:null;
    const llms=L&&Array.isArray(L.apps)?L.apps:null;
    const n=llms?llms.length:randInt(5,7), ideas=llms?llms.map(x=>x.name):pickN(WORDS.appIdeas,n);
    const emos=['🧘','🐟','⚔️','🔮','😴','📈','🐟','💼','🎏','🪞','🤖','🦋','🪙','🌙','🗣️','🎐'];
    let cards='';
    ideas.forEach((name,i)=>{
      const p=neonPalette();
      const desc=llms&&llms[i]&&llms[i].desc?llms[i].desc:pick(WORDS.storeDesc);
      const emo=llms&&llms[i]&&llms[i].emoji?llms[i].emoji:emos[(i+randInt(0,5))%emos.length];
      cards+='<div class="sc" data-name="'+name+'" data-desc="'+desc+'" data-emoji="'+emo+'"><div class="si" style="background:linear-gradient(135deg,'+p.a+','+p.b+')">'+emo+'</div>'
        +'<div class="sinfo"><b>'+name+'</b><span>'+desc+'</span>'
        +'<small>★ '+(4+Math.random()).toFixed(1)+' · '+randInt(1,99)+' 万下载</small></div>'
        +'<button class="inst">获取</button></div>';
    });
    // 内联卡片生成逻辑（沙箱内无法访问外部函数）
    const cardJS=
      'var emos='+JSON.stringify(emos)+',descs='+JSON.stringify(WORDS.storeDesc)+',ideas='+JSON.stringify(WORDS.appIdeas)+';'
      +'function pal(){var hs=[265,200,320,160,25,340,230,90],h=hs[Math.floor(Math.random()*hs.length)];return {a:"hsl("+h+" 85% 62%)",b:"hsl("+((h+40)%360)+" 85% 55%)"}}'
      +'function P(a){return a[Math.floor(Math.random()*a.length)]}'
      +'function cardHTML(name,desc,emo){var p=pal();return "<div class=sc data-name=\\""+name+"\\" data-desc=\\""+desc+"\\" data-emoji=\\""+emo+"\\"><div class=si style=\\"background:linear-gradient(135deg,"+p.a+","+p.b+")\\">"+emo+"</div>"'
      +'+"<div class=sinfo><b>"+name+"</b><span>"+desc+"</span><small>★ "+(4+Math.random()).toFixed(1)+" · "+(1+Math.floor(Math.random()*99))+" 万下载</small></div><button class=inst>获取</button></div>"}'
      +'function bindInstall(){document.querySelectorAll(".sc .inst").forEach(function(b){b.onclick=function(){if(this.textContent==="✓已装")return;this.textContent="✓已装";var nm=this.parentNode.parentNode.getAttribute("data-name");parent.postMessage({type:"openapp",id:"__generic__",name:nm},"*")}})}';
    return shell({
      title:'应用商店', icon:'🛍️', accent:'#818cf8',
      css:'.st{padding:16px}.st h3{margin:2px 2px 12px;font-size:15px}'
        +'.srch{display:flex;gap:8px;margin-bottom:14px}'
        +'.srch input{flex:1;min-width:0;padding:11px 14px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.1);border-radius:14px;font-size:12px;color:#fff;outline:none}'
        +'.srch input::placeholder{color:#8b90a5}'
        +'.srch button{border:none;border-radius:14px;padding:0 16px;background:rgba(129,140,248,.28);color:#c7d2fe;font-size:12px;cursor:pointer}'
        +'.stlabel{font-size:11px;color:#8b90a5;margin:0 2px 8px}'
        +'.sc{display:flex;align-items:center;gap:12px;padding:12px 4px;border-bottom:1px solid rgba(255,255,255,.05)}'
        +'.si{width:48px;height:48px;border-radius:13px;display:flex;align-items:center;justify-content:center;font-size:25px;flex-shrink:0}'
        +'.sinfo{flex:1;min-width:0}.sinfo b{font-size:13px}.sinfo span{display:block;font-size:10px;color:#8b90a5;margin:2px 0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'
        +'.sinfo small{font-size:10px;color:#fbbf24}'
        +'.inst{border:none;border-radius:999px;padding:7px 15px;font-size:12px;background:rgba(129,140,248,.2);color:#c7d2fe;cursor:pointer}'
        +'.foot{text-align:center;color:#6a6e82;font-size:11px;margin-top:18px}'
        +'.sload{text-align:center;color:#8b90a5;font-size:12px;padding:30px 0}.sload .sp{font-size:26px;animation:spn 1.2s linear infinite;display:inline-block}'
        +'@keyframes spn{to{transform:rotate(360deg)}}',
      html:'<div class="st"><h3>应用商店</h3>'
        +'<div class="srch"><input id="storeQ" placeholder="搜索或创建一个应用" autocomplete="off"><button id="storeGo">搜索</button></div>'
        +'<div class="stlabel" id="stLabel">今日推荐</div>'
        +'<div id="stList">'+cards+'</div>'
        +'<div class="foot">应用均由官方上架 · 安全检测通过</div></div>',
      js:cardJS
        +'var q=document.getElementById("storeQ"),list=document.getElementById("stList"),lbl=document.getElementById("stLabel"),nonce=0,lastNonce=0;'
        +'bindInstall();'
        +'function doSearch(){'
        +'  var kw=q.value.trim();if(!kw)return;'
        +'  lbl.textContent="搜索「"+kw+"」";'
        +'  list.innerHTML="<div class=sload><div class=sp>✦</div><div>正在寻找 / 生成应用…</div></div>";'
        +'  lastNonce=++nonce;'
        +'  parent.postMessage({type:"storegen",topic:kw,nonce:lastNonce},"*");'
        +'}'
        +'document.getElementById("storeGo").onclick=doSearch;'
        +'q.onkeydown=function(e){if(e.key==="Enter"){doSearch();q.blur()}};'
        +'window.addEventListener("message",function(e){'
        +'  if(!e.data||e.data.type!=="storedata")return;'
        +'  if(e.data.nonce&&e.data.nonce!==lastNonce)return;'
        +'  var kw=e.data.keyword||"应用",apps=e.data.data&&e.data.data.apps;'
        +'  var html="";'
        +'  if(apps&&apps.length){apps.forEach(function(a){html+=cardHTML(String(a.name||kw),String(a.desc||"一款新奇的应用"),String(a.emoji||P(emos)))})}'
        +'  html=cardHTML(kw,"为你现场生成的应用 · 点击获取即可打开","✦")+html;'
        +'  list.innerHTML=html;bindInstall();'
        +'});'
    });
  };


})();
