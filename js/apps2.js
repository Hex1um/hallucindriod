/* ============ Hallucindriod · 幻卓 · 幻觉应用生成器（二）============ */
(function(){
  const D=window.OS_DATA;
  const {pick,pickN,chance,randInt,neonPalette,WORDS}=D;
  const B=window.APP_BUILDERS;

  // 复用外壳（与 apps.js 中的 shell 相同）
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
          + '<div class="ab-title">'+(cfg.icon||'✦')+' '+(cfg.title||'应用')+'</div>'
          + '<span class="ab-btn" style="text-align:right" aria-hidden="true"></span>'
          + '</div>')
    + '<div class="ab-body">'+(cfg.html||'')+'</div>'
    + '<script>'+(cfg.js||'')+'</script>'
    + '</body></html>';
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
  /* ---------- 网页渲染：按网站类型分模板 ---------- */
  function sitePalette(name){
    var palettes=[['#667eea','#764ba2'],['#4facfe','#00f2fe'],['#f093fb','#f5576c'],['#11998e','#38ef7d'],['#fa709a','#fee140'],['#30cfd0','#330867'],['#7f00ff','#e100ff']];
    var h=0;for(var i=0;i<name.length;i++){h=(h*31+name.charCodeAt(i))>>>0}
    return palettes[h%palettes.length];
  }

  function renderSiteHTML(d){
    d=d||{};
    var name=d.siteName||d.topic||'新页面';
    var tag=d.tagline||'值得信赖的选择';
    var hero=d.heroTitle||('欢迎来到 '+name);
    var sub=d.heroSub||'在这里，每一次探索都有新的发现。';
    var cta=d.cta||'立即探索';
    var aboutRaw=d.about;
    var about=Array.isArray(aboutRaw)?aboutRaw:(aboutRaw?[aboutRaw]:['我们是一支热爱创造的团队，相信技术可以让生活更有趣。','从想法到现实，我们一步步把不可能变成可能。']);
    var feats=(d.features&&d.features.length)?d.features:[
      {icon:'✨',title:'匠心设计',desc:'每一处细节都经过精心打磨'},
      {icon:'🚀',title:'快速可靠',desc:'稳定服务，随时为你在线'},
      {icon:'🌱',title:'持续进化',desc:'不断创新，带来更多惊喜'}];
    var stats=(d.stats&&d.stats.length)?d.stats:[
      {num:'120万',label:'用户信赖'},{num:'4.9分',label:'用户评分'},{num:'98%',label:'好评率'}];
    var news=d.news&&d.news.length?d.news:[
      name+'发布全新版本，体验全面升级',
      name+'与多家合作伙伴达成战略共识',
      name+'年度用户报告：满意度再创新高'];
    var type=String(d.type||'official');
    var pal=sitePalette(name);
    var grad='linear-gradient(135deg,'+pal[0]+','+pal[1]+')';

    // ---- 社交 ----
    if(type==='social'){
      var posts=[hero, about[0]||'', (feats[0]&&feats[0].desc)||'', (feats[1]&&feats[1].desc)||''];
      var users=['我关注的博主','热心网友','官方账号','路过的旅人'];
      var avs=['🐱','🌙','🎧','🍀'];
      var feed='';
      for(var i=0;i<posts.length;i++){
        if(!posts[i])continue;
        feed+='<div class="sp"><div class="sph"><div class="sav">'+avs[i%4]+'</div><div><b>'+users[i%4]+'</b><span>'+(i+1)+'小时前</span></div></div>'
          +'<p>'+posts[i]+'</p><div class="spa"><span>♡ '+(18+i*37)+'</span><span>💬 '+(3+i*5)+'</span><span>↗ 分享</span></div></div>';
      }
      return '<div class="site type-social">'
        +'<div class="tnav"><b>✦ '+name+'</b><div class="tnl"><span class="on">首页</span><span>发现</span><span>消息</span></div><div class="tav">我</div></div>'
        +'<div class="sfeed">'+feed+'</div>'
        +'<div class="sfoot">'+name+' · '+tag+'</div></div>';
    }

    // ---- 视频 ----
    if(type==='video'){
      var emos=['🎬','🎮','🍜','🐈','🛸','🎾','🎧','🌊'];
      var grid='';
      for(var j=0;j<6;j++){
        var f=feats[j%feats.length];
        grid+='<div class="vc"><div class="vth" style="background:'+['#1e3a5f','#4a1d2e','#1f3a2a','#3a2a1a','#2a1f3f','#1a2a3a'][j%6]+'">'+emos[j%8]+'</div>'
          +'<div class="vti">'+((f&&f.title)||hero)+(j>0?' · '+j:'')+'</div>'
          +'<div class="vme">UP '+(f&&f.desc?f.desc.slice(0,6):'创作者')+' · '+(1+j*3)+'.'+(j)+'万播放</div></div>';
      }
      return '<div class="site type-video">'
        +'<div class="tnav"><b>✦ '+name+'</b><div class="tnl"><span class="on">推荐</span><span>热门</span><span>影视</span></div><div class="tav">我</div></div>'
        +'<div class="vhead" style="background:'+grad+'"><h1>'+hero+'</h1><p>'+sub+'</p></div>'
        +'<div class="vgrid">'+grid+'</div></div>';
    }

    // ---- 购物 ----
    if(type==='shop'){
      var cats=['推荐','服饰','数码','家居','美妆','食品'];
      var goods=['👕','📱','🛋️','💄','🍪','🎧'];
      var g='';
      for(var k=0;k<6;k++){
        var f2=feats[k%feats.length];
        g+='<div class="gd"><div class="gim">'+goods[k]+'</div><div class="gti">'+((f2&&f2.title)||hero)+'</div>'
          +'<div class="gpr">¥'+(29+k*67)+'<span class="gol">¥'+(99+k*100)+'</span></div>'
          +'<div class="gsd">已售 '+(120+k*45)+' 件</div></div>';
      }
      return '<div class="site type-shop">'
        +'<div class="tnav"><b>✦ '+name+'</b><div class="tnl"><span class="on">商城</span><span>分类</span><span>购物车</span></div><div class="tav">我</div></div>'
        +'<div class="sbar" style="background:'+grad+'">'+tag+' · 限时优惠</div>'
        +'<div class="scats">'+cats.map(function(c,i){return '<span class="'+(i===0?'on':'')+'">'+c+'</span>'}).join('')+'</div>'
        +'<div class="sgrid">'+g+'</div></div>';
    }

    // ---- 资讯 ----
    if(type==='news'){
      var arts=[hero, about[0]||'', (feats[0]&&feats[0].title)||'', (feats[1]&&feats[1].title)||'', (feats[2]&&feats[2].title)||''];
      var list='';
      for(var m=0;m<arts.length;m++){
        if(!arts[m])continue;
        list+='<div class="na'+(m===0?' top':'')+'"><h3>'+arts[m]+'</h3>'
          +'<p>'+((m===0?sub:(feats[m%feats.length]&&feats[m%feats.length].desc))||'')+'</p>'
          +'<div class="nm">'+name+' · '+(m+1)+'小时前</div></div>';
      }
      return '<div class="site type-news">'
        +'<div class="tnav"><b>✦ '+name+'</b><div class="tnl"><span class="on">要闻</span><span>科技</span><span>生活</span></div><div class="tav">我</div></div>'
        +'<div class="nlist">'+list+'</div></div>';
    }

    // ---- 官网（默认） ----
    var navHTML=[['首页','hero'],['产品','feat'],['关于','about'],['新闻','news'],['联系','foot']]
      .map(function(x){return '<a class="wl" data-sec="'+x[1]+'">'+x[0]+'</a>'}).join('');
    var aboutHTML=about.map(function(p){return '<p>'+p+'</p>'}).join('');
    var featHTML=feats.map(function(f){return '<div class="wf"><div class="wfi">'+(f.icon||'✦')+'</div><b>'+(f.title||'特色')+'</b><span>'+(f.desc||'')+'</span></div>'}).join('');
    var statHTML=stats.map(function(s){return '<div class="ws"><b>'+(s.num||'—')+'</b><span>'+(s.label||'')+'</span></div>'}).join('');
    var newsHTML=news.slice(0,4).map(function(n,i){return '<div class="wn"><span class="wni">'+(i+1)+'</span><span class="wnt">'+n+'</span><span class="wna">›</span></div>'}).join('');
    return '<div class="site type-official">'
      +'<div class="wnav"><div class="wbrand">✦ '+name+'</div><div class="wlinks">'+navHTML+'</div></div>'
      +'<div class="whero" id="sec-hero" style="background:'+grad+'">'
        +'<div class="wtag">'+tag+'</div><h1>'+hero+'</h1><p>'+sub+'</p>'
        +'<button class="wcta" data-sec="feat">'+cta+' →</button><div class="worb o1"></div><div class="worb o2"></div></div>'
      +'<div class="wstats">'+statHTML+'</div>'
      +'<div class="wabout" id="sec-about"><div class="wsec-t">关于我们</div>'+aboutHTML+'</div>'
      +'<div class="wfeat" id="sec-feat"><div class="wsec-t">为什么选择我们</div><div class="wfg">'+featHTML+'</div></div>'
      +'<div class="wnews" id="sec-news"><div class="wsec-t">最新动态</div>'+newsHTML+'</div>'
      +'<div class="wfoot" id="sec-foot">© 2026 '+name+' · '+tag+'</div></div>';
  }

  function fallbackResults(q){
    var sites=[['知乎','zhihu.com'],['百度百科','baike.baidu.com'],['小红书','xiaohongshu.com'],['哔哩哔哩','bilibili.com'],['CSDN','blog.csdn.net']];
    var tpl=['{q} - 完整攻略与经验分享','{q} 怎么安排？看完这篇就够了','关于「{q}」的 10 个高赞回答','{q}｜最新整理与避坑指南','{q} 相关讨论汇总'];
    var out=[];
    for(var i=0;i<sites.length;i++){
      out.push({
        title:tpl[i].replace('{q}',q),
        site:sites[i][1],
        url:'https://'+sites[i][1]+'/search?q='+encodeURIComponent(q),
        snippet:'这里汇总了关于「'+q+'」的实用信息与用户真实经验，包含注意事项、推荐清单与常见问题解答。'
      });
    }
    return out;
  }

  function renderSearchResults(d){
    d=d||{};
    var q=String(d.query||'');
    var total=String(d.total||'约 1,240,000 条结果');
    var results=(d.results&&d.results.length)?d.results:fallbackResults(q);
    var rows=results.map(function(r){
      return '<div class="sr" data-url="'+String(r.url||'').replace(/"/g,'')+'">'
        +'<div class="srt">'+String(r.title||'')+'</div>'
        +'<div class="sru">'+String(r.site||r.url||'')+'</div>'
        +'<div class="srx">'+String(r.snippet||'')+'</div></div>';
    }).join('');
    if(!rows)rows='<div class="srempty">没有找到相关结果</div>';
    return '<div class="site type-search">'
      +'<div class="sehead"><div class="selogo">✦</div>'
      +'<div class="sebox"><span>'+q+'</span></div><button class="sego">搜索</button></div>'
      +'<div class="sestat">'+total+' · 用时 0.42 秒</div>'
      +'<div class="selist">'+rows+'</div></div>';
  }



  /* ---------- 浏览器：新标签搜索页 → 输入后由 LLM 生成网页 ---------- */
  B.browser = function(){
    var renderSrc=[renderSiteHTML,renderSearchResults,fallbackResults,sitePalette].map(function(f){return f.toString()}).join('\n');
    var siteCSS='.site{font-family:-apple-system,"PingFang SC",sans-serif;background:#fff;color:#1a1a24}'
      +'.wnav{display:flex;justify-content:space-between;align-items:center;padding:15px 18px;background:#fff;border-bottom:1px solid #eee;position:sticky;top:0;z-index:5}'
      +'.wbrand{font-weight:800;font-size:15px;color:#222}'
      +'.wlinks{display:flex;gap:12px;flex-wrap:wrap}.wl{font-size:11px;color:#777;cursor:pointer;padding:2px 0}'
      +'.wl:active{color:#4f46e5}'
      +'.whero{position:relative;overflow:hidden;padding:52px 24px 46px;color:#fff;text-align:center}'
      +'.wtag{display:inline-block;font-size:11px;letter-spacing:2px;opacity:.95;border:1px solid rgba(255,255,255,.55);border-radius:999px;padding:4px 12px;margin-bottom:16px}'
      +'.whero h1{font-size:29px;line-height:1.3;margin:0 0 12px;font-weight:800;position:relative;z-index:1}'
      +'.whero p{font-size:13px;line-height:1.7;opacity:.92;max-width:320px;margin:0 auto 20px;position:relative;z-index:1}'
      +'.wcta{border:none;background:#fff;color:#222;border-radius:999px;padding:11px 24px;font-size:13px;font-weight:700;cursor:pointer;position:relative;z-index:1;box-shadow:0 6px 20px rgba(0,0,0,.15)}'
      +'.wcta:active{transform:scale(.96)}'
      +'.worb{position:absolute;border-radius:50%;background:rgba(255,255,255,.12)}'
      +'.worb.o1{width:180px;height:180px;top:-60px;left:-50px}.worb.o2{width:130px;height:130px;bottom:-50px;right:-30px}'
      +'.wstats{display:flex;background:#fafaff;padding:22px 10px;border-bottom:1px solid #f0f0f5}'
      +'.ws{flex:1;text-align:center;border-right:1px solid #e8e8f0}.ws:last-child{border-right:none}'
      +'.ws b{display:block;font-size:20px;color:#4f46e5}.ws span{font-size:10px;color:#999}'
      +'.wabout,.wfeat,.wnews{padding:26px 20px}'
      +'.wnews{padding-top:8px}'
      +'.wsec-t{font-size:18px;font-weight:800;margin:0 0 16px;color:#1a1a24;position:relative;padding-left:12px}'
      +'.wsec-t:before{content:"";position:absolute;left:0;top:3px;bottom:3px;width:4px;background:#6366f1;border-radius:2px}'
      +'.wabout p{font-size:12.5px;line-height:1.9;color:#555;margin:0 0 10px}'
      +'.wfg{display:grid;grid-template-columns:repeat(3,1fr);gap:9px}'
      +'.wf{background:#f7f7fb;border-radius:14px;padding:14px 10px;text-align:center;cursor:pointer;transition:.15s}'
      +'.wf:active{transform:scale(.96);background:#eef1fd}'
      +'.wfi{font-size:26px;margin-bottom:8px}.wf b{display:block;font-size:11.5px;color:#222;margin-bottom:5px}'
      +'.wf span{font-size:9.5px;color:#8a8a99;line-height:1.5;display:block}'
      +'.wn{display:flex;align-items:center;gap:9px;padding:12px 0;border-bottom:1px solid #f1f2f7;font-size:12.5px;color:#333;cursor:pointer}'
      +'.wn:last-child{border:none}'
      +'.wni{width:18px;height:18px;border-radius:5px;background:#eef1fd;color:#4f46e5;font-size:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0}'
      +'.wnt{flex:1;line-height:1.45}.wna{color:#c3c8d4;font-size:14px}'
      +'.wn:active .wnt{color:#4f46e5}'
      +'.wfoot{text-align:center;font-size:10.5px;color:#aaa;padding:22px;background:#fafaff;line-height:1.8}'
      +'.wload{padding:70px 20px;text-align:center;color:#666;font-size:13px}'
      +'.wload .sp{font-size:34px;animation:spin 1.2s linear infinite;display:inline-block}'
      +'@keyframes spin{to{transform:rotate(360deg)}}'
      +'.tnav{display:flex;align-items:center;gap:10px;padding:12px 14px;background:#fff;border-bottom:1px solid #eee;position:sticky;top:0;z-index:5}'
      +'.tnav b{font-size:14px;color:#1a1a24}'
      +'.tnl{display:flex;gap:12px;font-size:11.5px;color:#888;margin-left:auto}'
      +'.tnl .on{color:#222;font-weight:700}'
      +'.tav{width:24px;height:24px;border-radius:50%;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;font-size:10px;display:flex;align-items:center;justify-content:center}'
      +'.sfoot{text-align:center;font-size:10px;color:#bbb;padding:22px}'
      /* 社交 */
      +'.sfeed{padding:6px 12px}'
      +'.sp{background:#fff;border-bottom:1px solid #f2f2f6;padding:12px 4px}'
      +'.sph{display:flex;align-items:center;gap:8px;margin-bottom:8px}'
      +'.sav{width:30px;height:30px;border-radius:50%;background:#f3f4f8;display:flex;align-items:center;justify-content:center;font-size:15px}'
      +'.sph b{font-size:12.5px;color:#222;display:block}'
      +'.sph span{font-size:10px;color:#aaa}'
      +'.sp p{margin:0 0 10px;font-size:12.5px;line-height:1.65;color:#333}'
      +'.spa{display:flex;gap:20px;font-size:11px;color:#999}'
      /* 视频 */
      +'.vhead{padding:22px 18px;color:#fff}'
      +'.vhead h1{margin:0 0 6px;font-size:19px;font-weight:800}'
      +'.vhead p{margin:0;font-size:11.5px;opacity:.92}'
      +'.vgrid{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:12px}'
      +'.vc .vth{height:92px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:34px}'
      +'.vc .vti{font-size:11.5px;line-height:1.4;margin-top:6px;color:#222;height:32px;overflow:hidden}'
      +'.vc .vme{font-size:9.5px;color:#999;margin-top:4px}'
      /* 购物 */
      +'.sbar{padding:14px 18px;color:#fff;font-size:12.5px;font-weight:600}'
      +'.scats{display:flex;gap:16px;padding:12px 16px 4px;font-size:12px;color:#888;overflow-x:auto}'
      +'.scats .on{color:#e11d48;font-weight:700}'
      +'.sgrid{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:12px}'
      +'.gd{background:#fafafc;border-radius:10px;overflow:hidden}'
      +'.gim{height:96px;display:flex;align-items:center;justify-content:center;font-size:38px;background:#f1f2f7}'
      +'.gti{font-size:11.5px;line-height:1.4;padding:7px 8px 2px;color:#222;height:32px;overflow:hidden}'
      +'.gpr{font-size:14px;color:#e11d48;font-weight:800;padding:2px 8px}'
      +'.gol{font-size:9.5px;color:#bbb;text-decoration:line-through;margin-left:4px;font-weight:400}'
      +'.gsd{font-size:9.5px;color:#aaa;padding:0 8px 8px}'
      /* 资讯 */
      +'.nlist{padding:6px 16px}'
      +'.na{padding:14px 0;border-bottom:1px solid #f2f2f6}'
      +'.na h3{margin:0 0 6px;font-size:14px;line-height:1.4;color:#1a1a24}'
      +'.na.top h3{font-size:18px}'
      +'.na p{margin:0 0 6px;font-size:11.5px;line-height:1.6;color:#777}'
      +'.na .nm{font-size:10px;color:#bbb}'
      /* 搜索结果 */
      +'.sehead{display:flex;align-items:center;gap:8px;padding:12px;border-bottom:1px solid #eee;position:sticky;top:0;background:#fff;z-index:5}'
      +'.selogo{font-size:18px;color:#4f46e5;font-weight:800}'
      +'.sebox{flex:1;border:1px solid #e3e7f6;border-radius:999px;padding:7px 13px;font-size:12px;color:#333;background:#fafbff;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'
      +'.sego{border:none;border-radius:9px;padding:7px 13px;background:#4f46e5;color:#fff;font-size:11.5px;font-weight:600}'
      +'.sestat{font-size:10.5px;color:#9aa0b5;padding:10px 14px 4px}'
      +'.selist{padding:0 14px 26px}'
      +'.sr{padding:12px 0;border-bottom:1px solid #f4f5fa;cursor:pointer}'
      +'.sr:active{opacity:.7}'
      +'.srt{font-size:14px;color:#1a0dab;line-height:1.4;margin-bottom:3px}'
      +'.sru{font-size:10.5px;color:#0b8043;margin-bottom:5px}'
      +'.srx{font-size:11.5px;color:#666;line-height:1.6}'
      +'.srempty{text-align:center;color:#9aa0b5;font-size:12px;padding:40px 0}'
      +'.pbar{position:absolute;left:0;top:38px;height:2px;background:#4f46e5;width:0;opacity:0;transition:width .25s ease,opacity .3s;z-index:9}'
      +'.pbar.on{opacity:1}'
      +'.errpage{padding:60px 26px;text-align:center;background:#fff;min-height:100%}'
      +'.errpage .ic{font-size:52px;margin-bottom:16px}'
      +'.errpage h2{margin:0 0 10px;font-size:17px;color:#333;font-weight:600}'
      +'.errpage p{margin:0 0 6px;font-size:12px;color:#8b90a5;line-height:1.7}'
      +'.errpage code{font-size:10.5px;color:#c3c8d4;background:#f7f8fc;padding:3px 8px;border-radius:5px;display:inline-block;margin:10px 0 18px}'
      +'.errpage button{border:none;border-radius:10px;padding:10px 22px;background:#4f46e5;color:#fff;font-size:12.5px;font-weight:600;cursor:pointer}';

    var ntCSS='.newtab{min-height:100%;background:linear-gradient(180deg,#f6f8ff 0%,#eef1fb 60%,#e9edfa 100%);padding-bottom:26px}'
      +'.nt-hero{padding:40px 24px 6px;text-align:center}'
      +'.nt-logo{font-size:21px;font-weight:800;color:#4f46e5;letter-spacing:-.4px}'
      +'.nt-logo span{color:#8b90a5;font-weight:500;font-size:13px;margin-left:5px}'
      +'.nt-search{margin:18px 18px 0;display:flex;align-items:center;gap:8px;background:#fff;border:1px solid #e3e7f6;border-radius:14px;padding:9px 10px 9px 13px;box-shadow:0 8px 26px rgba(80,90,160,.09)}'
      +'.nt-search .ic{font-size:14px;color:#98a0b5}'
      +'.nt-search input{flex:1;border:none;outline:none;font-size:13px;color:#333;background:none;min-width:0;padding:2px 0}'
      +'.nt-search button{border:none;border-radius:10px;padding:8px 15px;background:linear-gradient(135deg,#6366f1,#4f46e5);color:#fff;font-size:12px;font-weight:700;cursor:pointer}'
      +'.nt-quick{display:grid;grid-template-columns:repeat(4,1fr);gap:17px 6px;padding:26px 20px 4px}'
      +'.nt-site{text-align:center;font-size:10.5px;color:#4a4f63;cursor:pointer}'
      +'.nt-site .si{width:46px;height:46px;border-radius:15px;margin:0 auto 7px;display:flex;align-items:center;justify-content:center;font-size:22px;color:#fff;box-shadow:0 5px 14px rgba(80,90,160,.16)}'
      +'.nt-site:active .si{transform:scale(.94)}'
      +'.nt-hot{margin:22px 16px 0;background:#fff;border-radius:15px;padding:15px 16px;box-shadow:0 5px 20px rgba(80,90,160,.07)}'
      +'.nt-hot .hh{font-size:12px;font-weight:700;color:#333;margin-bottom:9px;display:flex;align-items:center;gap:5px}'
      +'.nt-hot .hi{display:flex;gap:9px;font-size:11.5px;color:#5a6075;padding:7px 0;border-bottom:1px solid #f3f5fc;line-height:1.4;cursor:pointer}'
      +'.nt-hot .hi:last-child{border:none}'
      +'.nt-hot .n{font-weight:800;color:#4f46e5;width:13px;flex-shrink:0}'
      +'.nt-tip{text-align:center;font-size:10px;color:#a6adc0;margin-top:18px}';

    var sites=[['短视频','🎬','linear-gradient(135deg,#fb7185,#e11d48)'],
               ['袋鼠外卖','🦘','linear-gradient(135deg,#fbbf24,#f59e0b)'],
               ['应用商店','🛍️','linear-gradient(135deg,#fb923c,#ea580c)'],
               ['天气','⛅','linear-gradient(135deg,#60a5fa,#2563eb)'],
               ['音乐','🎵','linear-gradient(135deg,#f472b6,#be185d)'],
               ['地图','🗺️','linear-gradient(135deg,#4ade80,#15803d)'],
               ['消息','💬','linear-gradient(135deg,#4ade80,#16a34a)'],
               ['设置','⚙️','linear-gradient(135deg,#94a3b8,#475569)']];
    var hot=['今年最值得去的十个地方','如何用一小时学会做一道菜','这个周末的天气有点反常','年轻人开始重新整理房间','一条视频看懂城市地铁规划'];
    var siteHTML=sites.map(function(s){return '<div class="nt-site" data-k="'+s[0]+'"><div class="si" style="background:'+s[2]+'">'+s[1]+'</div>'+s[0]+'</div>'}).join('');
    var hotHTML=hot.map(function(h,i){return '<div class="hi" data-k="'+h+'"><span class="n">'+(i+1)+'</span><span>'+h+'</span></div>'}).join('');
    var newTabHTML='<div class="newtab"><div class="nt-hero"><div class="nt-logo">✦ 幻卓<span>浏览器</span></div></div>'
      +'<div class="nt-search"><span class="ic">⌕</span><input id="ntInput" placeholder="搜索或输入网址" autocomplete="off"><button id="ntGo">搜索</button></div>'
      +'<div class="nt-quick">'+siteHTML+'</div>'
      +'<div class="nt-hot"><div class="hh">🔥 热门推荐</div>'+hotHTML+'</div>'
      +'<div class="nt-tip">输入任意内容，网页会即时生成</div></div>';

    return shell({bare:true,
      title:'浏览器', icon:'🌐', accent:'#38bdf8',
      css:'#appFrameHost{height:100%;display:flex;flex-direction:column}'
        +'.bbar{display:flex;gap:6px;align-items:center;padding:10px 12px;background:#171824;border-bottom:1px solid rgba(255,255,255,.06);flex-shrink:0}'
        +'.bbar button{border:none;background:rgba(255,255,255,.08);color:#fff;width:30px;height:30px;border-radius:9px;cursor:pointer;flex-shrink:0;font-size:15px}'
        +'.url{flex:1;display:flex;align-items:center;gap:6px;background:rgba(255,255,255,.09);border-radius:10px;padding:7px 10px;font-size:11px;color:#9aa0b5;min-width:0}'
        +'.url input{flex:1;background:none;border:none;outline:none;color:#fff;font-size:11px;min-width:0;width:100%}'
        +'.web{flex:1;overflow-y:auto;background:#fff;scrollbar-width:none}.web::-webkit-scrollbar{display:none}'
        +siteCSS+ntCSS,
      html:'<div id="appFrameHost"><div class="bbar">'
        +'<button id="back" title="后退">‹</button><button id="fwd" title="前进">›</button><button id="home" title="主页">⌂</button>'
        +'<div class="url">🔒 <input id="urlIn" value="" placeholder="搜索或输入网址"></div>'
        +'<button id="go" title="前往">↻</button></div><div class="pbar" id="pbar"></div><div class="web" id="web">'+newTabHTML+'</div></div>',
      js:'var renderSiteHTML='+renderSrc+';'
        +'var NEWTAB='+JSON.stringify(newTabHTML)+';'
        +'var urlIn=document.getElementById("urlIn"),web=document.getElementById("web"),pbar=document.getElementById("pbar");'
        +'function progStart(){pbar.classList.add("on");pbar.style.width="18%";setTimeout(function(){pbar.style.width="62%"},180)}'
        +'function progDone(){pbar.style.width="100%";setTimeout(function(){pbar.classList.remove("on");pbar.style.width="0"},320)}'
        +'function renderError(t){'
        +'  return `<div class="errpage"><div class="ic">🌐</div><h2>无法访问此网站</h2>`'
        +'   +`<p>${t}</p><code>ERR_EMPTY_RESPONSE</code><br><button id="retry">重新加载</button></div>`;'
        +'}'
        +'var hist=[],hi=-1,nonce=0,lastNonce=0,curTopic="",curKind="site";'
        +'function prettyUrl(t){if(/^https?:\\/\\//i.test(t))return t;if(/^[a-z0-9-]+(\\.[a-z0-9-]+)+$/i.test(t))return "https://"+t;return t}'
        +'function brandOf(t){var s=String(t||"").trim().replace(/^https?:\\/\\//i,"").replace(/^www\\./i,"");'
        +'  if(/^[a-z0-9.\\-]+$/i.test(s)){var f=(s.split(".")[0]||s);return f.replace(/[-_]/g," ").toUpperCase()}'
        +'  return s}'
        +'function bindSite(){'
        +'  web.querySelectorAll("[data-sec]").forEach(function(el){el.onclick=function(){'
        +'    var t=document.getElementById("sec-"+this.getAttribute("data-sec"));'
        +'    if(t)web.scrollTo({top:t.offsetTop-52,behavior:"smooth"})}});'
        +'  web.querySelectorAll(".wn").forEach(function(n){n.onclick=function(){'
        +'    var t=this.querySelector(".wnt");if(t){t.style.color=t.style.color?"":"#4f46e5"}}});'
        +'}'
        +'function bindNewTab(){'
        +'  var inp=document.getElementById("ntInput"),go=document.getElementById("ntGo");'
        +'  if(!inp||!go)return;'
        +'  go.onclick=function(){nav(inp.value,true)};'
        +'  inp.onkeydown=function(e){if(e.key==="Enter"){nav(inp.value,true);inp.blur()}};'
        +'  document.querySelectorAll(".nt-site,.nt-hot .hi").forEach(function(s){s.onclick=function(){nav(this.getAttribute("data-k"),true)}});'
        +'}'
        +'function showNewTab(){curTopic="";urlIn.value="";web.innerHTML=NEWTAB;bindNewTab();web.scrollTop=0}'
        +'function isUrl(t){return /^https?:\\/\\//i.test(t)||/^[a-z0-9-]+(\\.[a-z0-9-]+)+(\\/.*)?$/i.test(t)}'
        +'function nav(topic,push){'
        +'  topic=String(topic||"").trim();if(!topic)return;'
        +'  var asUrl=isUrl(topic);'
        +'  curTopic=topic;curKind=asUrl?"site":"search";urlIn.value=asUrl?prettyUrl(topic):topic;'
        +'  if(push){hist=hist.slice(0,hi+1);hist.push(topic);hi=hist.length-1}'
        +'  if(asUrl){'
        +'    web.innerHTML=renderSiteHTML({siteName:brandOf(topic),tagline:"正在载入…",heroTitle:brandOf(topic),heroSub:"页面内容正在生成，稍候将自动更新。",about:"内容正在生成中，请稍候片刻。"});'
        +'  }else{'
        +'    web.innerHTML=renderSearchResults({query:topic,total:"正在检索…",results:[]});'
        +'  }'
        +'  web.scrollTop=0;bindSite();progStart();'
        +'  lastNonce=++nonce;'
        +'  parent.postMessage({type:asUrl?"webgen":"websearch",[asUrl?"topic":"q"]:topic,nonce:lastNonce},"*");'
        +'}'
        +'window.addEventListener("message",function(e){'
        +'  if(!e.data||e.data.type!=="webdata")return;'
        +'  if(e.data.nonce&&e.data.nonce!==lastNonce)return;'
        +'  var d=e.data.data;'
        +'  progDone();'
        +'  if(e.data.kind==="websearch"){'
        +'    web.innerHTML=renderSearchResults(d||{query:curTopic,results:[]});'
        +'    web.querySelectorAll(".sr").forEach(function(r){r.onclick=function(){var u=this.getAttribute("data-url");if(u)nav(u,true)}});'
        +'    web.scrollTop=0;'
        +'    return;'
        +'  }'
        +'  if(d&&d.siteName){curTopic=d.siteName;web.innerHTML=renderSiteHTML(d);'
        +'    parent.postMessage({type:"webstate",topic:curTopic,data:d},"*")}'
        +'  else{'
        +'    web.innerHTML=renderError(prettyUrl(curTopic));'
        +'    var rb=document.getElementById("retry");if(rb)rb.onclick=function(){nav(curTopic,false)};'
        +'  }'
        +'  bindSite();web.scrollTop=0;'
        +'});'
        +'document.getElementById("go").onclick=function(){var v=urlIn.value.trim();if(!v){showNewTab();return}nav(v,true)};'
        +'urlIn.onkeydown=function(e){if(e.key==="Enter"){document.getElementById("go").click();urlIn.blur()}};'
        +'document.getElementById("home").onclick=function(){showNewTab()};'
        +'document.getElementById("back").onclick=function(){if(hi>0){hi--;nav(hist[hi],false)}else{showNewTab()}};'
        +'document.getElementById("fwd").onclick=function(){if(hi<hist.length-1){hi++;nav(hist[hi],false)}};'
        +'var RS=window.__WEB_RESTORE||null;'
        +'if(RS&&RS.data){curTopic=RS.topic||"";urlIn.value=prettyUrl(curTopic);hist=[curTopic];hi=0;web.innerHTML=renderSiteHTML(RS.data);bindSite();}'
        +'else{if(RS&&RS.topic){}}'
        +'if(!RS||!RS.data){bindNewTab();}'
    });
  };

  /* ---------- 相机：拍出幻觉照片 ---------- */
  B.camera = function(){
    const L=(typeof window.__LLM!=='undefined'&&window.__LLM)?window.__LLM:null;
    const sceneEmo=(L&&L.scene)||pick(['🌇','🌊','🐈','🌌','🛸','🌸']);
    const caption=(L&&L.caption)||pick(WORDS.photoCaptions);
    const tip=(L&&L.tip)||'自动对焦中…';
    return shell({
      title:'相机', icon:'📷', accent:'#94a3b8',
      css:'.cm{height:100%;display:flex;flex-direction:column;background:#000}'
        +'.view{flex:1;position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center}'
        +'.view .scene{font-size:96px;filter:drop-shadow(0 10px 30px rgba(0,0,0,.5));transition:.3s}'
        +'.view .grid{position:absolute;inset:0;background:linear-gradient(rgba(255,255,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px);background-size:33% 33%}'
        +'.view .stamp{position:absolute;top:14px;left:14px;font-size:10px;color:#fff;background:rgba(0,0,0,.4);padding:5px 8px;border-radius:8px}'
        +'.view .flash{position:absolute;inset:0;background:#fff;opacity:0;pointer-events:none}'
        +'.view .cap{position:absolute;left:0;right:0;bottom:18px;text-align:center;font-size:11.5px;color:#fff;opacity:0;transform:translateY(8px);transition:.3s;padding:0 20px}'
        +'.view .cap.on{opacity:1;transform:none}'
        +'.view .flash.on{animation:fl .25s}@keyframes fl{0%{opacity:1}100%{opacity:0}}'
        +'.ctrls{height:96px;display:flex;align-items:center;justify-content:center;gap:40px;background:#0a0a0f}'
        +'.ctrls button{border:none;background:none;color:#fff;font-size:26px;cursor:pointer}'
        +'.shutter{width:64px;height:64px;border-radius:50%;background:#fff;border:5px solid #555;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:26px}'
        +'.shutter:active{transform:scale(.92)}'
        +'.thumb{width:46px;height:46px;border-radius:10px;background:#222;display:flex;align-items:center;justify-content:center;font-size:22px}',
      html:'<div class="cm"><div class="view" id="view"><div class="grid"></div>'
        +'<div class="stamp">相机 · '+tip+'</div><div class="scene" id="scene">'+sceneEmo+'</div>'
        +'<div class="cap" id="cap"></div>'
        +'<div class="flash" id="flash"></div></div>'
        +'<div class="ctrls"><button id="flip">🔄</button><div class="shutter" id="shutter">📸</div><div class="thumb" id="thumb">'+sceneEmo+'</div></div></div>',
      js:'var scene=document.getElementById("scene"),flash=document.getElementById("flash"),thumb=document.getElementById("thumb"),cap=document.getElementById("cap");'
        +'var shots='+JSON.stringify([sceneEmo,caption,tip])+';'
        +'var emos='+JSON.stringify([sceneEmo,...WORDS.photoCaptions.slice(0,6).map(()=>pick(['🌇','🌊','🐈','🌌','🛸','🌸','🌵','🍋','🌙','🪐']))])+';var ei=0;'
        +'document.getElementById("shutter").onclick=function(){flash.classList.remove("on");void flash.offsetWidth;flash.classList.add("on");cap.classList.remove("on");'
        +'var iv=setInterval(function(){ei=(ei+1)%emos.length;scene.textContent=emos[ei]},420);'
        +'var t=setTimeout(function(){clearInterval(iv);thumb.textContent=emos[ei];scene.textContent=emos[ei];'
        +'cap.textContent="📷 '+caption+'";cap.classList.add("on")},1500)};'
        +'document.getElementById("flip").onclick=function(){scene.style.transform=scene.style.transform==="scaleX(-1)"?"none":"scaleX(-1)"};'
    });
  };

  /* ---------- 消息：QQ 风格（注册 → 空列表 → 加好友 → 聊天） ---------- */
  B.messages = function(){
    const social = (typeof window.__SOCIAL==='object'&&window.__SOCIAL) ? window.__SOCIAL : {profile:null,friends:[]};
    const init = JSON.stringify({profile:social.profile||null,friends:Array.isArray(social.friends)?social.friends:[]}).replace(/</g,'\\u003c');

    const css =
      '.qq{height:100%;display:flex;flex-direction:column;background:#0f1115;position:relative;overflow:hidden}'
      +'.qhead{display:flex;align-items:center;gap:11px;padding:14px 52px 4px 14px}'
      +'.qava{width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,#22c55e,#15803d);display:flex;align-items:center;justify-content:center;font-size:19px;font-weight:700;color:#fff;flex-shrink:0;position:relative}'
      +'.qava .on{position:absolute;right:-1px;bottom:-1px;width:12px;height:12px;border-radius:50%;background:#22c55e;border:2.5px solid #0f1115}'
      +'.qme{flex:1;min-width:0}.qme b{font-size:16px}'
      +'.qme span{display:block;font-size:10.5px;color:#8b90a5;margin-top:3px}'
      +'.qplus{width:30px;height:30px;border-radius:50%;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.06);color:#e6e7ee;font-size:19px;line-height:1;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0}'
      +'.qplus:active{background:rgba(255,255,255,.16)}'
      +'.qsearch{margin:12px 14px 4px;background:rgba(255,255,255,.07);border-radius:11px;padding:10px;font-size:12.5px;color:#6f7488;text-align:center;cursor:pointer}'
      +'.qwin{display:flex;align-items:center;gap:9px;padding:12px 15px;color:#8b90a5;font-size:12px;cursor:pointer}'
      +'.qwin .ar{margin-left:auto;color:#4b5060;font-size:14px}'
      +'.qlist{flex:1;min-height:0;overflow-y:auto;scrollbar-width:none}.qlist::-webkit-scrollbar{display:none}'
      +'.qrow{display:flex;align-items:center;gap:12px;padding:11px 15px;cursor:pointer}'
      +'.qrow:active{background:rgba(255,255,255,.05)}'
      +'.ra{width:50px;height:50px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0}'
      +'.rm{flex:1;min-width:0}'
      +'.rn{display:flex;align-items:center;gap:6px;font-size:14.5px;font-weight:600}'
      +'.rn .lv{font-size:9px;font-weight:400;color:#8b90a5;border:1px solid rgba(255,255,255,.14);border-radius:3px;padding:0 3px;flex-shrink:0}'
      +'.rp{font-size:11.5px;color:#7b8096;margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'
      +'.rr{display:flex;flex-direction:column;align-items:flex-end;gap:6px;flex-shrink:0}'
      +'.rt{font-size:9.5px;color:#6b7080}'
      +'.qbadge{min-width:17px;height:17px;border-radius:999px;background:#ef4444;color:#fff;font-size:9.5px;display:flex;align-items:center;justify-content:center;padding:0 4px;font-weight:600}'
      +'.qempty{padding:60px 30px;text-align:center;color:#6b7080}'
      +'.qempty .ic{font-size:44px;margin-bottom:14px;opacity:.5}'
      +'.qempty b{display:block;font-size:14px;color:#c9cad6;margin-bottom:8px}'
      +'.qempty span{font-size:11.5px;line-height:1.7}'
      +'.qempty button{margin-top:18px;border:none;border-radius:999px;padding:10px 24px;background:#3b82f6;color:#fff;font-size:12.5px;font-weight:600;cursor:pointer}'
      +'.qh{display:flex;align-items:center;gap:11px;padding:14px 16px 6px}'
      +'.qava{width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#4ade80,#16a34a);display:flex;align-items:center;justify-content:center;font-size:19px;font-weight:700;color:#fff;flex-shrink:0}'
      +'.qinfo{flex:1;min-width:0}'
      +'.qinfo b{display:block;font-size:16px;font-weight:700}'
      +'.qinfo span{display:block;font-size:10.5px;color:#8b90a5;margin-top:3px}'
      +'.qadd{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#e6e7ee;font-size:23px;font-weight:300;cursor:pointer;flex-shrink:0}'
      +'.qadd:active{background:rgba(255,255,255,.1)}'
      +'.qsearch2{margin:12px 16px 4px;background:rgba(255,255,255,.09);border-radius:11px;padding:11px;font-size:13px;color:#9aa0b5;text-align:center;cursor:pointer}'
      +'.qwin{display:flex;align-items:center;gap:9px;padding:13px 16px;color:#9aa0b5;font-size:12.5px;cursor:pointer}'
      +'.qwin .wi{font-size:15px}'
      +'.qwin .ar{margin-left:auto;color:#4b5060;font-size:15px}'
      +'.qtag{font-size:9px;color:#8b90a5;background:rgba(255,255,255,.08);border-radius:4px;padding:1px 5px;font-weight:400;flex-shrink:0}'
      +'.qdot{min-width:18px;height:18px;border-radius:999px;background:#f23030;color:#fff;font-size:10px;display:flex;align-items:center;justify-content:center;padding:0 5px;font-weight:600}'
      +'.qmute{font-size:11px;opacity:.55}'
      +'.qtab3{position:sticky;bottom:0;height:56px;display:flex;align-items:center;background:#12141a;border-top:1px solid rgba(255,255,255,.06);flex-shrink:0}'
      +'.qt3{flex:1;text-align:center;font-size:9.5px;color:#8b90a5;cursor:pointer;position:relative}'
      +'.qt3 .ti{display:block;font-size:20px;margin-bottom:1px;line-height:1.2}'
      +'.qt3.on{color:#3b82f6;font-weight:600}'
      +'.qt3 .n{position:absolute;top:-2px;left:calc(50% + 9px);background:#f23030;color:#fff;border-radius:999px;font-size:9px;padding:1px 4px;line-height:1.3}'
      +'.pcard{display:flex;gap:12px;align-items:center;background:rgba(255,255,255,.055);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:14px;margin-top:6px;text-align:left}'
      +'.pav{width:52px;height:52px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:25px;flex-shrink:0}'
      +'.pinfo{flex:1;min-width:0}'
      +'.pinfo b{display:block;font-size:14.5px}'
      +'.pinfo .pbio{font-size:11.5px;color:#9aa0b5;line-height:1.55;margin-top:4px}'
      +'.pinfo .ptag{display:inline-block;font-size:9.5px;color:#3b82f6;background:rgba(59,130,246,.14);border-radius:4px;padding:1px 6px;margin-top:6px}'
      +'.pbtns{display:flex;gap:9px;margin-top:14px}'
      +'.pbtns button{flex:1;border:none;border-radius:12px;padding:12px;font-size:13px;cursor:pointer;font-weight:600}'
      +'.pbtns .pno{background:rgba(255,255,255,.08);color:#c9cad6}'
      +'.pbtns .pyes{background:#3b82f6;color:#fff}'
      +'.pbtns button:disabled{opacity:.6}'
      +'.mmenu{position:absolute;right:14px;top:54px;background:#1b1e26;border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:6px;z-index:30;min-width:132px;box-shadow:0 12px 30px rgba(0,0,0,.5)}'
      +'.mmenu div{padding:11px 14px;font-size:13px;color:#e6e7ee;border-radius:8px;cursor:pointer}'
      +'.mmenu div:active{background:rgba(255,255,255,.08)}'
      +'.mmenu .danger{color:#f87171}'
      +'.gsel{display:flex;align-items:center;gap:10px;padding:11px 2px;border-bottom:1px solid rgba(255,255,255,.05)}'
      +'.gsel .ck{width:22px;height:22px;border-radius:50%;border:1.5px solid #4b5060;display:flex;align-items:center;justify-content:center;font-size:12px;flex-shrink:0}'
      +'.gsel.on .ck{background:#3b82f6;border-color:#3b82f6;color:#fff}'
      +'.gsel .gav{width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0}'
      +'.gsel .gn{flex:1;font-size:13px;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'
      +'.qtop{display:flex;align-items:center;gap:15px;padding:11px 14px 4px}'
      +'.qtop .ic{font-size:19px;color:#d5d7e0;line-height:1;cursor:pointer;flex-shrink:0}'
      +'.qtop .ic:active{opacity:.55}'
      +'.qtop .title{flex:1;text-align:center;font-size:16.5px;font-weight:700;letter-spacing:.5px}'
      +'.qsubs{display:flex;gap:14px;padding:12px 14px 14px;overflow-x:auto;scrollbar-width:none;border-bottom:1px solid rgba(255,255,255,.05)}'
      +'.qsubs::-webkit-scrollbar{display:none}'
      +'.qsub{flex:0 0 auto;width:52px;text-align:center;cursor:pointer}'
      +'.qsub .sa{width:46px;height:46px;border-radius:50%;margin:0 auto;display:flex;align-items:center;justify-content:center;font-size:21px;position:relative;border:2px solid rgba(255,255,255,.16)}'
      +'.qsub .plus{position:absolute;right:-3px;bottom:-3px;width:17px;height:17px;border-radius:50%;background:#22c55e;color:#fff;font-size:12px;line-height:15px;text-align:center;border:2px solid #0f1115;font-weight:700}'
      +'.qsub .sn{font-size:9px;color:#8b90a5;margin-top:5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'
      +'.pinkav{background:linear-gradient(135deg,#f472b6,#db2777);font-size:20px}'
      +'.qdbar{position:sticky;bottom:0;height:56px;display:flex;align-items:center;background:#12141a;border-top:1px solid rgba(255,255,255,.06);flex-shrink:0}'
      +'.qdb{flex:1;text-align:center;font-size:9.5px;color:#8b90a5;cursor:pointer;position:relative}'
      +'.qdb .ti{display:block;font-size:20px;margin-bottom:1px;line-height:1.2}'
      +'.qdb.on{color:#fff;font-weight:600}'
      +'.qdb.plus .ti{width:40px;height:27px;line-height:23px;border:2px solid #c9cad6;border-radius:8px;font-size:17px;margin:0 auto 2px}'
      +'.qdb .n{position:absolute;top:-3px;left:calc(50% + 6px);background:#ef4444;color:#fff;border-radius:999px;font-size:9px;padding:1px 4px;line-height:1.3}'
      +'.qtabs{position:sticky;bottom:0;height:56px;display:flex;align-items:center;background:#12141a;border-top:1px solid rgba(255,255,255,.06)}'
      +'.qt{flex:1;text-align:center;font-size:9.5px;color:#6b7080;cursor:pointer}'
      +'.qt .ti{display:block;font-size:19px;margin-bottom:1px}'
      +'.qt.on{color:#3b82f6}'
      +'.qt .n{display:inline-block;background:#ef4444;color:#fff;border-radius:999px;font-size:8px;padding:0 4px;margin-left:1px;transform:translateY(-2px)}'
      +'.reg{min-height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 30px;background:linear-gradient(170deg,#101827,#0f1115 60%)}'
      +'.reg .lg{width:76px;height:76px;border-radius:24px;background:linear-gradient(135deg,#3b82f6,#1d4ed8);display:flex;align-items:center;justify-content:center;font-size:36px;margin-bottom:20px;box-shadow:0 12px 34px rgba(59,130,246,.35)}'
      +'.reg h1{margin:0 0 8px;font-size:20px}'
      +'.reg p{margin:0 0 26px;font-size:12px;color:#8b90a5;text-align:center;line-height:1.7}'
      +'.reg input{width:100%;max-width:280px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);border-radius:13px;padding:13px 15px;color:#fff;font-size:14px;outline:none;text-align:center}'
      +'.reg input:focus{border-color:#3b82f6}'
      +'.reg button{width:100%;max-width:280px;margin-top:14px;border:none;border-radius:13px;padding:13px;background:linear-gradient(135deg,#3b82f6,#1d4ed8);color:#fff;font-size:14px;font-weight:700;cursor:pointer}'
      +'.reg button:active{opacity:.85}'
      +'.reg .tip{margin-top:18px;font-size:10.5px;color:#5f6478;text-align:center;line-height:1.7}'
      +'.ov{position:fixed;inset:0;background:#0f1115;z-index:70;display:flex;flex-direction:column;transform:translateX(100%);transition:transform .22s}'
      +'.ov.on{transform:none}'
      +'.ovh{height:50px;display:flex;align-items:center;gap:10px;padding:0 14px;border-bottom:1px solid rgba(255,255,255,.06);flex-shrink:0}'
      +'.ovh button{border:none;background:none;color:#3b82f6;font-size:24px;cursor:pointer;padding:0 4px}'
      +'.ovh b{font-size:14.5px}.ovh .st{font-size:10px;color:#6b7080;margin-left:4px}'
      +'.ovb{flex:1;overflow-y:auto;padding:14px;scrollbar-width:none}.ovb::-webkit-scrollbar{display:none}'
      +'.bb{max-width:76%;padding:10px 13px;border-radius:15px;font-size:13px;margin:9px 0;line-height:1.5;clear:both;word-break:break-word}'
      +'.bb.them{background:rgba(255,255,255,.09);float:left;border-bottom-left-radius:4px}'
      +'.bb.me{background:linear-gradient(135deg,#3b82f6,#2563eb);float:right;border-bottom-right-radius:4px}'
      +'.ovin{display:flex;gap:8px;padding:10px 12px 14px;border-top:1px solid rgba(255,255,255,.06);flex-shrink:0}'
      +'.ovin input{flex:1;background:rgba(255,255,255,.08);border:none;border-radius:999px;padding:11px 15px;color:#fff;outline:none;font-size:13px;min-width:0}'
      +'.ovin button{border:none;border-radius:999px;padding:0 18px;background:#3b82f6;color:#fff;font-weight:700;font-size:13px;cursor:pointer}'
      +'.addbox{padding:20px 16px;text-align:center}'
      +'.addbox h3{margin:0 0 6px;font-size:15px}'
      +'.addbox p{margin:0 0 20px;font-size:11.5px;color:#8b90a5;line-height:1.7}'
      +'.addbox input{width:100%;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:12px 14px;color:#fff;font-size:13px;outline:none;margin-bottom:11px}'
      +'.addbox button{width:100%;border:none;border-radius:12px;padding:12px;background:#3b82f6;color:#fff;font-size:13px;font-weight:700;cursor:pointer}'
      +'.addres{margin-top:14px;font-size:11.5px;color:#8b90a5;line-height:1.7;min-height:18px}'
      +'.toastin{position:fixed;left:50%;bottom:90px;transform:translateX(-50%);background:rgba(0,0,0,.82);color:#fff;font-size:12px;padding:9px 16px;border-radius:999px;z-index:90;opacity:0;transition:.2s;pointer-events:none}'
      +'.toastin.on{opacity:1}';

    const html = '<div class="qq" id="app"></div><div class="ov" id="ov"></div><div class="toastin" id="tst"></div>';

    const js = `var S=${init};
var app=document.getElementById('app'),ov=document.getElementById('ov'),tst=document.getElementById('tst');
var GRADS=['linear-gradient(135deg,#22c55e,#15803d)','linear-gradient(135deg,#3b82f6,#1d4ed8)','linear-gradient(135deg,#f59e0b,#b45309)','linear-gradient(135deg,#a855f7,#6d28d9)','linear-gradient(135deg,#ec4899,#9d174d)','linear-gradient(135deg,#06b6d4,#0e7490)','linear-gradient(135deg,#f87171,#b91c1c)'];
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]})}
function toast(m){tst.textContent=m;tst.classList.add('on');clearTimeout(window.__tt);window.__tt=setTimeout(function(){tst.classList.remove('on')},1800)}
function ago(ts){if(!ts)return '';var d=Date.now()-ts;if(d<60000)return '刚刚';if(d<3600000)return Math.floor(d/60000)+'分钟前';var h=new Date(ts);return ('0'+h.getHours()).slice(-2)+':'+('0'+h.getMinutes()).slice(-2)}
function lastOf(f){if(f.msgs&&f.msgs.length){var m=f.msgs[f.msgs.length-1];return m.text}return f.bio||'暂无消息'}
function renderRegister(){
  app.innerHTML='<div class="reg"><div class="lg">💬</div><h1>登录幻卓</h1>'
    +'<p>设置一个用户名，开始你的社交。<br>好友将能通过这个名字找到你。</p>'
    +'<input id="regName" placeholder="输入用户名（2-12字）" maxlength="12" autocomplete="off">'
    +'<button id="regGo">进入幻卓</button>'
    +'<div class="tip">用户名即你的好友 ID · 独一无二</div></div>';
  var inp=document.getElementById('regName'),go=document.getElementById('regGo');
  function submit(){
    var n=(inp.value||'').trim();
    if(n.length<2){toast('用户名至少 2 个字');return}
    go.textContent='正在创建…';go.disabled=true;
    parent.postMessage({type:'social:register',name:n},'*');
  }
  go.onclick=submit;
  inp.onkeydown=function(e){if(e.key==='Enter')submit()};
}
function renderMain(){
  var f=S.friends||[];
  var unreadAll=f.reduce(function(a,x){return a+(Number(x.unread)||0)},0);
  var myName=(S.profile&&S.profile.name)||'我';
  var rows='';
  if(!f.length){
    rows='<div class="qempty"><div class="ic">👥</div><b>还没有好友</b>'
      +'<span>点右上角 ＋ 搜索用户名添加<br>对方不存在时会为你生成一个聊天对象</span>'
      +'<button id="addFirst">添加好友</button></div>';
  }else{
    rows=f.map(function(x,i){
      var un=Number(x.unread)||0;
      var hasMsgs=(x.msgs&&x.msgs.length>1);
      var prefix=(un===0&&hasMsgs)?'已读 · ':'';
      var tag=(x.badge&&String(x.badge).trim())?('<span class="qtag">'+esc(String(x.badge).trim())+'</span>'):'';
      var mute=x.muted?'<span class="qmute">🔕</span>':'';
      var ava=esc(x.avatar||'👤');
      return '<div class="qrow" data-i="'+i+'">'
        +'<div class="ra" style="background:'+GRADS[i%GRADS.length]+'">'+ava+'</div>'
        +'<div class="rm"><div class="rn">'+esc(x.name||'好友')+tag+'</div>'
        +'<div class="rp">'+prefix+esc(lastOf(x))+'</div></div>'
        +'<div class="rr"><span class="rt">'+ago(x.ts||(x.msgs&&x.msgs.length?x.msgs[x.msgs.length-1].ts:0))+'</span>'
        +(un>0?'<span class="qdot">'+(un>99?'99+':un)+'</span>':'')+mute+'</div></div>';
    }).join('');
  }
  app.innerHTML='<div class="qq">'
    +'<div class="qh">'
      +'<div class="qava">'+esc(myName.slice(0,1))+'</div>'
      +'<div class="qinfo"><b>'+esc(myName)+'</b><span>● 在线 · WiFi · 睡觉中</span></div>'
      +'<div class="qadd" id="qplus">＋</div>'
    +'</div>'
    +'<div class="qsearch2" id="qsearch">⌕　搜索</div>'
    +'<div class="qwin"><span class="wi">💻</span><span>已登录 Windows</span><span class="ar">›</span></div>'
    +'<div class="qlist">'+rows+'</div>'
    +'<div class="qtab3">'
      +'<div class="qt3 on" data-t="msg"><span class="ti">💬</span>消息'+(unreadAll>0?'<span class="n">'+(unreadAll>99?'99+':unreadAll)+'</span>':'')+'</div>'
      +'<div class="qt3" data-t="contact"><span class="ti">👤</span>联系人</div>'
      +'<div class="qt3" data-t="feed"><span class="ti">🔄</span>动态</div>'
    +'</div></div>';
  document.getElementById('qplus').onclick=function(ev){
    ev.stopPropagation();
    var old=document.querySelector('.mmenu');
    if(old){old.parentNode.removeChild(old);return}
    var m=document.createElement('div');
    m.className='mmenu';
    m.innerHTML='<div data-a="add">加好友</div><div data-a="group">建群</div>';
    app.appendChild(m);
    m.querySelectorAll('div').forEach(function(x){
      x.onclick=function(ev2){
        ev2.stopPropagation();
        m.parentNode.removeChild(m);
        if(this.getAttribute('data-a')==='add')openAdd();else openGroup();
      };
    });
    setTimeout(function(){document.addEventListener('click',function h(){var q=document.querySelector('.mmenu');if(q)q.parentNode.removeChild(q);document.removeEventListener('click',h)})},10);
  };
  document.getElementById('qsearch').onclick=openAdd;
  var af=document.getElementById('addFirst'); if(af)af.onclick=openAdd;
  app.querySelectorAll('.qrow').forEach(function(r){r.onclick=function(){openChat(Number(this.getAttribute('data-i')))}});
  app.querySelectorAll('.qt3').forEach(function(t){t.onclick=function(){
    var k=this.getAttribute('data-t');
    app.querySelectorAll('.qt3').forEach(function(x){x.classList.remove('on')});this.classList.add('on');
    if(k==='msg')return;
    if(k==='contact')openSheet('联系人',f.length?f.map(function(x){return '· '+esc(x.name)+(x.badge?'  '+esc(String(x.badge)):'')}).join('<br>'):'还没有联系人，先到消息页添加好友');
    if(k==='feed')openSheet('动态','暂无好友动态<br><br>添加好友后，这里会显示他们的分享');
  }});
}
function openAdd(){
  ov.innerHTML='<div class="ovh"><button id="ovbk">‹</button><b>添加好友</b></div>'
    +'<div class="addbox"><h3>通过用户名查找</h3>'
    +'<p>先看看对方是谁，再决定要不要加。</p>'
    +'<input id="addName" placeholder="输入用户名" maxlength="12" autocomplete="off">'
    +'<button id="addGo">搜索</button>'
    +'<div class="addres" id="addRes"></div></div>';
  ov.classList.add('on');
  document.getElementById('ovbk').onclick=function(){ov.classList.remove('on')};
  document.getElementById('ovMore').onclick=function(ev){
    ev.stopPropagation();
    var old=document.querySelector('.mmenu'); if(old)old.parentNode.removeChild(old);
    var m=document.createElement('div'); m.className='mmenu'; m.style.top='52px';
    m.innerHTML='<div data-a="clear">清空聊天记录</div>'
      +(f.isGroup?'<div class="danger" data-a="quit">退出群聊</div>':'<div class="danger" data-a="del">删除好友</div>');
    ov.appendChild(m);
    m.querySelectorAll('div').forEach(function(x){
      x.onclick=function(e2){
        e2.stopPropagation();
        var a=this.getAttribute('data-a');
        m.parentNode.removeChild(m);
        if(a==='clear'){ f.msgs=[]; saveFriends(); openChat(S.friends.indexOf(f)); }
        else{ if(!confirm(a==='del'?'删除好友「'+f.name+'」？':'退出群聊「'+f.name+'」？'))return;
          S.friends=S.friends.filter(function(y){return y!==f}); saveFriends(); ov.classList.remove('on'); render(); }
      };
    });
  };
  var inp=document.getElementById('addName'),go=document.getElementById('addGo'),res=document.getElementById('addRes');
  window.__probeName=null;
  function submit(){
    var n=(inp.value||'').trim();
    if(n.length<1){toast('请输入用户名');return}
    window.__probeName=n;
    res.innerHTML='<div style="padding:14px 0;text-align:center;color:#8b90a5;font-size:12px">正在搜索「'+esc(n)+'」…</div>';
    go.disabled=true;
    parent.postMessage({type:'social:probe',name:n},'*');
  }
  go.onclick=submit;
  inp.onkeydown=function(e){if(e.key==='Enter')submit()};
}
function renderProbe(p,exists){
  var res=document.getElementById('addRes');
  if(!res)return;
  var av=esc(p.avatar||'👤');
  var bio=esc(p.bio||'这个人很神秘，什么都没留下');
  var tag=exists?'已在好友列表':(p.isAI?'AI 生成的聊天对象':'真人 · 当前在线');
  res.innerHTML='<div class="pcard"><div class="pav" style="background:'+GRADS[(p.name||'u').length%GRADS.length]+'">'+av+'</div>'
    +'<div class="pinfo"><b>'+esc(p.name||'')+'</b>'
    +'<div class="pbio">'+bio+'</div><span class="ptag">'+tag+'</span></div></div>'
    +'<div class="pbtns"><button class="pno" id="pCancel">取消</button>'
    +'<button class="pyes" id="pAdd">'+(exists?'发消息':'加好友')+'</button></div>';
  var go=document.getElementById('addGo'); if(go)go.disabled=false;
  document.getElementById('pCancel').onclick=function(){res.innerHTML=''};
  document.getElementById('pAdd').onclick=function(){
    var btn=this;btn.disabled=true;btn.textContent='添加中…';
    parent.postMessage({type:'social:addfriend',name:p.name,useProbe:true},'*');
  };
}
function openGroup(){
  var f=S.friends||[];
  if(f.length<2){ toast('至少需要 2 位好友才能建群'); return }
  var sel={};
  ov.innerHTML='<div class="ovh"><button id="ovbk">‹</button><b>发起群聊</b>'
    +'<button id="gCreate" style="margin-left:auto;font-size:13px;color:#3b82f6;font-weight:600">创建</button></div>'
    +'<div style="padding:14px 16px 6px"><input id="gName" placeholder="群名称（可留空）" maxlength="12" autocomplete="off" style="width:100%;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:12px 14px;color:#fff;font-size:13px;outline:none"></div>'
    +'<div style="padding:4px 16px 20px" id="gList"></div>';
  ov.classList.add('on');
  document.getElementById('ovbk').onclick=function(){ov.classList.remove('on')};
  var list=document.getElementById('gList');
  list.innerHTML=f.map(function(x,i){
    return '<div class="gsel" data-i="'+i+'"><div class="ck"></div>'
      +'<div class="gav" style="background:'+GRADS[i%GRADS.length]+'">'+esc(x.avatar||'👤')+'</div>'
      +'<div class="gn">'+esc(x.name)+'</div></div>';
  }).join('');
  list.querySelectorAll('.gsel').forEach(function(el){
    el.onclick=function(){
      var i=this.getAttribute('data-i');
      if(sel[i]){ delete sel[i]; this.classList.remove('on'); this.querySelector('.ck').textContent='' }
      else{ sel[i]=true; this.classList.add('on'); this.querySelector('.ck').textContent='✓' }
    };
  });
  document.getElementById('gCreate').onclick=function(){
    var ids=Object.keys(sel);
    if(ids.length<2){ toast('至少选择 2 位好友'); return }
    var members=ids.map(function(i){ return f[Number(i)] });
    var nm=(document.getElementById('gName').value||'').trim()||(members.map(function(m){return m.name}).slice(0,3).join('、')+'…');
    var group={
      name:nm,
      avatar:'👥',
      isGroup:true,
      members:members.map(function(m){return m.name}),
      level:'群聊',
      bio:members.length+' 位成员',
      msgs:[{me:false,text:'「'+nm+'」已创建，来打个招呼吧',ts:Date.now()}],
      ts:Date.now(),
      unread:0
    };
    S.friends=S.friends||[];
    S.friends.unshift(group);
    saveFriends();
    ov.classList.remove('on');
    render();
    toast('群聊已创建');
  };
}
function openSheet(title,inner){
  ov.innerHTML='<div class="ovh"><button id="ovbk">‹</button><b>'+esc(title)+'</b></div><div class="ovb"><div style="font-size:12.5px;color:#c9cad6;line-height:1.9">'+inner+'</div></div>';
  ov.classList.add('on');document.getElementById('ovbk').onclick=function(){ov.classList.remove('on')};
}
var curFriend=null;
function openChat(i){
  var f=(S.friends||[])[i]; if(!f)return;
  curFriend=f.name;
  var msgs=(f.msgs||[]).map(function(m){
    return '<div class="bb '+(m.me?'me':'them')+'">'+esc(m.text)+'</div>';
  }).join('');
  ov.innerHTML='<div class="ovh"><button id="ovbk">‹</button><b>'+esc(f.name)+'</b>'
    +'<span class="st">'+(f.isGroup?'群聊':(f.isAI?'在线':'好友'))+'</span>'
    +'<button id="ovMore" style="margin-left:auto;font-size:20px;color:#8b90a5">⋯</button></div>'
    +'<div class="ovb" id="ovb">'+(msgs||'<div style="text-align:center;color:#6b7080;font-size:11.5px;padding:30px">开始聊天吧</div>')+'</div>'
    +'<div class="ovin"><input id="ovi" placeholder="发消息…"><button id="ovs">发送</button></div>';
  ov.classList.add('on');
  var body=document.getElementById('ovb'),inp=document.getElementById('ovi');
  body.scrollTop=body.scrollHeight;
  document.getElementById('ovbk').onclick=function(){ov.classList.remove('on')};
  function send(){
    var v=(inp.value||'').trim(); if(!v)return;
    var d=document.createElement('div');d.className='bb me';d.textContent=v;body.appendChild(d);
    inp.value='';body.scrollTop=body.scrollHeight;
    f.msgs=f.msgs||[]; f.msgs.push({me:true,text:v,ts:Date.now()}); f.ts=Date.now();
    saveFriends();
    var typing=document.createElement('div');typing.className='bb them';typing.textContent='…';body.appendChild(typing);body.scrollTop=body.scrollHeight;
    parent.postMessage({type:'social:reply',friend:f.name,text:v},'*');
    window.__typingEl=typing;
  }
  document.getElementById('ovs').onclick=send;
  inp.onkeydown=function(e){if(e.key==='Enter')send()};
}
function saveFriends(){
  parent.postMessage({type:'social:save',friends:S.friends},'*');
}
window.addEventListener('message',function(e){
  var d=e.data; if(!d||!d.type)return;
  if(d.type==='social:profile'){ S.profile=d.profile; S.friends=d.friends||[]; render(); return }
  if(d.type==='social:probed'){
    renderProbe(d.profile||{}, !!d.exists);
    return;
  }
  if(d.type==='social:friend'){
    S.friends=S.friends||[];
    if(!S.friends.some(function(x){return x.name===d.friend.name})){ S.friends.unshift(d.friend); }
    var res=document.getElementById('addRes');
    if(res){ res.innerHTML=(d.exists?'该好友已在列表中':'已添加「'+esc(d.friend.name)+'」'+(d.friend.isAI?' · AI 聊天对象':' · 真人好友')); }
    toast(d.exists?'已在好友列表':'已添加 '+d.friend.name);
    saveFriends();
    setTimeout(function(){ ov.classList.remove('on'); render(); },800);
    return;
  }
  if(d.type==='social:reply'){
    var f=(S.friends||[]).find(function(x){return x.name===d.friend});
    if(!f)return;
    f.msgs=f.msgs||[]; f.msgs.push({me:false,text:d.text,ts:Date.now()}); f.ts=Date.now();
    if(window.__typingEl&&window.__typingEl.parentNode)window.__typingEl.parentNode.removeChild(window.__typingEl);
    window.__typingEl=null;
    var body=document.getElementById('ovb');
    if(body){
      var div=document.createElement('div');div.className='bb them';div.textContent=d.text;body.appendChild(div);body.scrollTop=body.scrollHeight;
    }
    saveFriends();
    return;
  }
});
function render(){ if(S.profile)renderMain(); else renderRegister(); }
render();`;

    return shell({bare:true, title:'消息', icon:'💬', accent:'#3b82f6', css:css, html:html, js:js});
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
    const L=(typeof window.__LLM!=='undefined'&&window.__LLM)?window.__LLM:null;
    const contact=(L&&L.contact)||pick(WORDS.contacts);
    const line=(L&&L.line)||pick(WORDS.messages);
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
        +'<div class="nm" id="cn">'+contact+'</div><div class="st" id="cs">正在接通…</div>'
        +'<button class="hang" id="hang">📵</button></div>',
      js:'var num="",numEl=document.getElementById("num");'
        +'document.querySelectorAll(".pad button").forEach(function(b){b.onclick=function(){'
        +'if(b.dataset.n==="*"){num=num.slice(0,-1)}else{num+=b.dataset.n}numEl.textContent=num||"_"}});'
        +'var sc=document.getElementById("sc"),line='+JSON.stringify(line)+',contact='+JSON.stringify(contact)+';'
        +'document.getElementById("call").onclick=function(){if(!num)num=contact;sc.classList.add("on");'
        +'document.getElementById("cn").textContent=num;'
        +'setTimeout(function(){document.getElementById("cs").textContent="通话中 0:0"+Math.floor(Math.random()*9)},1200);'
        +'setTimeout(function(){document.getElementById("cs").textContent="对方："+line},3200)};'
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
    const L=(typeof window.__LLM!=='undefined'&&window.__LLM)?window.__LLM:null;
    const ver=pick(WORDS.systemVer), city=pick(WORDS.cities);
    const device=(L&&L.device)||('Hallucindriod · '+pick(['Pro','Ultra','SE']));
    const comment=(L&&L.comment)||'系统运行流畅';
    const cfg=(typeof window.__CFG!=='undefined'&&window.__CFG)?window.__CFG:{confidence:0.35,apiBase:'',apiKey:'',model:'openai-fast'};
    const conf=Number(cfg.confidence);
    const rows=[
      ['📱','设备名称',device],
      ['⚙️','系统版本',ver],
      ['💾','存储空间',randInt(32,512)+' GB / ∞ 已用'],
      ['📍','当前位置',city],
      ['🌐','网络','5G 网络 · 信号良好'],
      ['✨','系统状态',comment]
    ].map(r=>'<div class="row"><span class="ri">'+r[0]+'</span><span>'+r[1]+'</span><span class="rv">'+r[2]+'</span></div>').join('');
    // 数据刷新：全部 / 指定应用
    const appList=(D.APPS||[]).filter(a=>a.id!=='settings');
    const refreshRows=appList.map(a=>'<div class="rrow" data-id="'+a.id+'"><span class="rname">'+a.name+'</span>'
      +'<button class="rbtn" data-refresh="'+a.id+'">刷新</button></div>').join('');
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
        +'.about .lg{font-size:36px}.about b{display:block;font-size:15px;color:#c9cad6;margin:6px 0}'
        +'.refresh-head{display:flex;align-items:center;padding:12px 14px;gap:10px}'
        +'.refresh-head span{font-size:13px;flex:1}'
        +'.rall{border:none;border-radius:999px;padding:7px 15px;font-size:12px;background:linear-gradient(120deg,#7c3aed,#2563eb);color:#fff;font-weight:600;cursor:pointer}'
        +'.rrow{display:flex;align-items:center;gap:10px;padding:9px 14px;font-size:12.5px;border-top:1px solid rgba(255,255,255,.04)}'
        +'.rname{flex:1;color:#c9cad6}'
        +'.rbtn{border:none;border-radius:999px;padding:5px 12px;font-size:11px;background:rgba(255,255,255,.08);color:#b9bccb;cursor:pointer}'
        +'.rbtn:active{background:rgba(124,58,237,.35);color:#fff}',
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
        +'<div class="grp card"><div class="gl">🖥️ 桌面</div>'
        +'<div class="refresh-head"><span>已从桌面移除的应用</span><button class="rall" id="restoreApps">全部恢复</button></div>'
        +'<div class="rrow"><span class="rname" style="color:#6f7488;font-size:11px">长按桌面图标可编辑：拖动排序、点左上角 × 移除</span></div></div>'
        +'<div class="grp card"><div class="gl">🔄 数据刷新</div>'
        +'<div class="refresh-head"><span>重新生成应用内容</span><button class="rall" id="refreshAll">刷新全部</button></div>'
        +refreshRows+'</div>'
        +'<div class="about card"><div class="lg">✦</div><b>Hallucindriod</b>'
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
        +'document.getElementById("restoreApps").onclick=function(){'
        +'parent.postMessage({type:"restoreApps"},"*");this.textContent="✓ 已恢复";var b=this;setTimeout(function(){b.textContent="全部恢复"},1500)};'
        +'document.getElementById("refreshAll").onclick=function(){'
        +'parent.postMessage({type:"refresh",id:""},"*");this.textContent="刷新中…";var b=this;setTimeout(function(){b.textContent="刷新全部"},1600)};'
        +'document.querySelectorAll(".rbtn").forEach(function(x){x.onclick=function(){'
        +'parent.postMessage({type:"refresh",id:this.getAttribute("data-refresh")},"*");'
        +'this.textContent="✓";var b=this;setTimeout(function(){b.textContent="刷新"},1200)}});'
    });
  };

  /* ---------- 任意词现编：Spotlight 搜到不存在的应用时 ---------- */
  window.improviseGeneric = function(topic){
    topic=(topic||'神秘应用').slice(0,12);
    const L=(typeof window.__LLM!=='undefined'&&window.__LLM)?window.__LLM:null;
    const pal=neonPalette(), adj=pick(WORDS.adjectives), noun=pick(WORDS.nouns);
    const PH=/^(功能|feature)\s*\d+$/i;
    const rawF=(L&&Array.isArray(L.features))?L.features:[];
    const cleanF=rawF.filter(f=>typeof f==='string'&&f.trim()&&!PH.test(f.trim()));
    const features=cleanF.length>=2?cleanF.slice(0,3):pickN(['语音吐槽','AI 算命','自动摸鱼','量子记账','情绪识别','赛博祈福','智能找借口','梦境回放','反向打卡','电子木鱼'],3);
    const badTag=/一句.*广告语|20字内/i;
    const tagline=(L&&L.tagline&&!badTag.test(L.tagline))?L.tagline:(adj+noun+' · 由 AI 生成，独一无二');
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


  // ---------- 智能终端：自然语言 → 手机动作 ----------
  B.terminal = function(){
    const css =
      '.term-wrap{display:flex;flex-direction:column;height:100%}'
      +'.term-chat{flex:1;overflow-y:auto;padding:4px 14px 8px;scrollbar-width:none}'
      +'.term-chat::-webkit-scrollbar{display:none}'
      +'.hero{text-align:center;padding:22px 10px 10px}'
      +'.hero .orb{width:64px;height:64px;border-radius:22px;margin:0 auto 14px;background:linear-gradient(135deg,#8b5cf6,#5b21b6);display:flex;align-items:center;justify-content:center;font-size:30px;box-shadow:0 10px 30px rgba(139,92,246,.4)}'
      +'.hero h2{margin:0 0 7px;font-size:17px;font-weight:700}'
      +'.hero p{margin:0;color:#8b90a5;font-size:12px;line-height:1.65}'
      +'.chips{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-top:18px}'
      +'.chip{border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.045);color:#c7c9d9;font-size:11.5px;padding:8px 13px;border-radius:999px;cursor:pointer}'
      +'.chip:active{background:rgba(139,92,246,.24);border-color:rgba(139,92,246,.4)}'
      +'.msg{display:flex;margin:14px 0;gap:9px;align-items:flex-start}'
      +'.msg.me{flex-direction:row-reverse}'
      +'.avatar{width:30px;height:30px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:12px}'
      +'.msg.ai .avatar{background:linear-gradient(135deg,#8b5cf6,#5b21b6);font-size:15px}'
      +'.msg.me .avatar{background:rgba(255,255,255,.12);font-size:11px;color:#c7c9d9}'
      +'.bubble{max-width:78%;padding:10px 13px;border-radius:16px;font-size:13.5px;line-height:1.6;word-break:break-word}'
      +'.msg.ai .bubble{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.06);border-top-left-radius:5px}'
      +'.msg.me .bubble{background:linear-gradient(135deg,#7c3aed,#6d28d9);border-top-right-radius:5px}'
      +'.acts{margin-top:9px;display:flex;flex-direction:column;gap:6px}'
      +'.act{display:flex;align-items:center;gap:7px;font-size:11.5px;color:#c4b5fd;background:rgba(139,92,246,.1);border:1px solid rgba(139,92,246,.16);padding:7px 10px;border-radius:10px}'
      +'.act .st{margin-left:auto;font-size:10px;color:#8b90a5;white-space:nowrap}'
      +'.dots{color:#8b90a5}'
      +'.dots:after{content:"";animation:dt 1.2s steps(4,end) infinite}'
      +'@keyframes dt{0%{content:""}25%{content:"."}50%{content:".."}75%{content:"..."}}'
      +'.term-input{padding:10px 12px 12px;border-top:1px solid rgba(255,255,255,.06);display:flex;gap:9px;background:rgba(16,17,25,.97);flex-shrink:0}'
      +'.term-input input{flex:1;min-width:0;padding:11px 14px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);border-radius:20px;font-size:13px;color:#fff;outline:none}'
      +'.term-input input::placeholder{color:#6f7488}'
      +'.term-input button{border:none;border-radius:20px;padding:0 17px;background:linear-gradient(135deg,#8b5cf6,#6d28d9);color:#fff;font-size:13px;font-weight:600;cursor:pointer;flex-shrink:0}'
      +'.term-input button:disabled{opacity:.45}';

    const html =
      '<div class="term-wrap">'
      +'<div class="term-chat" id="chat">'
      +  '<div class="hero" id="hero">'
      +    '<div class="orb">✦</div>'
      +    '<h2>智能终端</h2>'
      +    '<p>用一句话，让手机替你操作。<br>试试「打开相机」或「开启手电筒」</p>'
      +    '<div class="chips">'
      +      '<div class="chip">打开相机</div>'
      +      '<div class="chip">开启手电筒</div>'
      +      '<div class="chip">帮我查天气</div>'
      +      '<div class="chip">去应用商店搜游戏</div>'
      +      '<div class="chip">打开浏览器</div>'
      +    '</div>'
      +  '</div>'
      +'</div>'
      +'<div class="term-input">'
      +  '<input id="ti" placeholder="说出你想让手机做什么…" autocomplete="off">'
      +  '<button id="send">发送</button>'
      +'</div>'
      +'</div>';

    const js =
      'var chat=document.getElementById("chat"),ti=document.getElementById("ti"),sendBtn=document.getElementById("send");'
      +'var nonce=0,lastNonce=0,busy=false,hero=document.getElementById("hero");'
      +'function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return ({"&":"&amp;","<":"&lt;",">":"&gt;","\\"":"&quot;"})[c]})}'
      +'function down(){chat.scrollTop=chat.scrollHeight}'
      +'function hideHero(){if(hero&&hero.parentNode){hero.parentNode.removeChild(hero);hero=null}}'
      +'function addUser(t){hideHero();var d=document.createElement("div");d.className="msg me";'
      +  'd.innerHTML=\'<div class="avatar">你</div><div class="bubble">\'+esc(t)+"</div>";chat.appendChild(d);down()}'
      +'function addThinking(){hideHero();var d=document.createElement("div");d.className="msg ai";d.id="thinking";'
      +  'd.innerHTML=\'<div class="avatar">✦</div><div class="bubble"><span class="dots">正在理解指令</span></div>\';chat.appendChild(d);down()}'
      +'function addAI(reply,actions){'
      +  'var t=document.getElementById("thinking");if(t&&t.parentNode)t.parentNode.removeChild(t);'
      +  'var d=document.createElement("div");d.className="msg ai";'
      +  'var h=\'<div class="avatar">✦</div><div class="bubble">\'+esc(reply||"好的");'
      +  'if(actions&&actions.length){h+=\'<div class="acts">\';'
      +    'actions.forEach(function(a){h+=\'<div class="act"><span>▸</span><span>\'+esc(a.label||a.type)+"</span><span class=\'st\'>执行中</span></div>"});'
      +    'h+="</div>"}'
      +  'h+="</div>";d.innerHTML=h;chat.appendChild(d);down();'
      +  'var rows=d.querySelectorAll(".act .st");'
      +  'for(var i=0;i<rows.length;i++){(function(el,idx){setTimeout(function(){el.textContent="✓ 已完成";el.style.color="#4ade80"},420+idx*380)})(rows[i],i)}'
      +'}'
      +'function submit(){'
      +  'var t=(ti.value||"").trim();if(!t||busy)return;'
      +  'busy=true;sendBtn.disabled=true;addUser(t);ti.value="";'
      +  'lastNonce=++nonce;addThinking();'
      +  'parent.postMessage({type:"termgen",text:t,nonce:lastNonce},"*");'
      +'}'
      +'sendBtn.onclick=submit;'
      +'ti.onkeydown=function(e){if(e.key==="Enter"){submit();ti.blur()}};'
      +'var chips=document.querySelectorAll(".chip");'
      +'for(var k=0;k<chips.length;k++){(function(c){c.onclick=function(){ti.value=c.textContent;submit()}})(chips[k])}'
      +'window.addEventListener("message",function(e){'
      +  'if(!e.data||e.data.type!=="termdata")return;'
      +  'if(e.data.nonce&&e.data.nonce!==lastNonce)return;'
      +  'var dd=e.data.data||{};addAI(dd.reply,dd.actions);'
      +  'busy=false;sendBtn.disabled=false;'
      +'});';

    return shell({title:'智能终端', icon:'✦', accent:'#a78bfa', css:css, html:html, js:js});
  };


  /* ---------- 袋鼠外卖：本地生活首页（大众点评风格） ---------- */
  B.delivery = function(){
    const L=(typeof window.__LLM!=='undefined'&&window.__LLM)?window.__LLM:null;
    const city=(L&&L.city)||'武汉';
    const rank=(L&&L.rank)||{title:'吃喝玩乐指南',item:'这家店悄悄火了整条街',tag:'热评榜第4名',dist:'2.9km'};
    const free=(L&&L.free)||'限时免费体验活动在线';
    let feed=(L&&Array.isArray(L.feed)&&L.feed.length)?L.feed:null;
    if(!feed){
      feed=[0,1,2,3].map(()=>({
        title:pick(['一段时间没来，发现店里的'+pick(WORDS.nouns)+'都变了','藏在巷子深处的'+pick(WORDS.adjectives)+'小店','排队一小时，只为这一口','这家店的'+pick(WORDS.nouns)+'绝了']),
        author:pick(WORDS.contacts), level:'Lv'+randInt(1,9), likes:randInt(12,999),
        emoji:pick(['🍩','🍔','🍜','🥩','🍰','🍤','🧋','🍕'])
      }));
    }
    const cats=[['🍗','美食'],['🎡','休闲玩乐'],['🏨','酒店民宿'],['🏝️','景点游玩'],['🦘','袋鼠外卖'],
                ['💉','医学美容'],['🎫','特价团'],['💆','按摩足疗'],['💇','丽人美发'],['🎬','电影演出']];
    const feedHtml=feed.slice(0,6).map((f,i)=>{
      const emo=f.emoji||pick(['🍩','🍔','🍜','🥩','🍰','🍤']);
      const bg=['linear-gradient(150deg,#3f2a12,#7c4a12)','linear-gradient(150deg,#3a1e2a,#7a2d4a)','linear-gradient(150deg,#122f3a,#1e5a6e)','linear-gradient(150deg,#2a1c3f,#4c2d7a)'][i%4];
      return '<div class="dfcard" data-feed="'+i+'"><div class="dfimg" style="background:'+bg+'">'+emo+'</div>'
        +'<div class="dfbody"><div class="dftitle">'+String(f.title||'')+'</div>'
        +'<div class="dfmeta"><span class="av">'+(String(f.author||'用户').slice(0,1))+'</span>'
        +'<span>'+String(f.author||'用户')+'</span><span class="lv">'+String(f.level||'Lv1')+'</span>'
        +'<span class="lk">♡ '+String(f.likes==null?0:f.likes)+'</span></div></div></div>';
    }).join('');
    return shell({bare:true,
      title:'袋鼠外卖', icon:'🦘', accent:'#fb923c',
      css:'.dl{padding:0 0 6px}'
        +'.dtop{display:flex;align-items:flex-end;gap:13px;padding:10px 14px 2px;font-size:13px}'
        +'.dtop .t{color:#8b90a5}.dtop .t.on{color:#fff;font-weight:700;font-size:14.5px}'
        +'.dtop .loc{display:flex;align-items:center;gap:2px;color:#fff;font-weight:700;font-size:14.5px}'
        +'.dtop .coin{margin-left:auto;font-size:10px;color:#fbbf24}'
        +'.dsearch{display:flex;align-items:center;gap:8px;margin:9px 14px;border:1.6px solid rgba(251,146,60,.6);border-radius:999px;padding:6px 7px 6px 14px}'
        +'.dsearch .s{flex:1;font-size:12.5px;color:#7b8096}'
        +'.dsearch .cam{font-size:14px;opacity:.6}'
        +'.dsearch .go{border:none;border-radius:999px;padding:7px 16px;font-size:12px;font-weight:700;color:#fff;background:linear-gradient(135deg,#fb923c,#f97316)}'
        +'.dcats{display:grid;grid-template-columns:repeat(5,1fr);gap:13px 2px;padding:8px 8px 14px}'
        +'.dcat{text-align:center;font-size:9.5px;color:#b9bccb}'
        +'.dcat .ci{width:43px;height:43px;border-radius:14px;margin:0 auto 5px;display:flex;align-items:center;justify-content:center;font-size:22px;background:rgba(255,255,255,.055)}'
        +'.dduo{display:grid;grid-template-columns:1fr 1fr;gap:9px;padding:0 12px}'
        +'.dcard2{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.06);border-radius:12px;padding:10px}'
        +'.dcard2 .th{font-size:10px;color:#fbbf24;margin-bottom:7px;font-weight:600}'
        +'.dcard2 .it{font-size:12px;font-weight:600;line-height:1.4;height:34px;overflow:hidden}'
        +'.dcard2 .meta{font-size:9px;color:#8b90a5;margin-top:6px;display:flex;gap:6px;align-items:center}'
        +'.dfeed{display:grid;grid-template-columns:1fr 1fr;gap:9px;padding:10px 12px}'
        +'.dfcard{border-radius:12px;overflow:hidden;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.05)}'
        +'.dfimg{height:112px;display:flex;align-items:center;justify-content:center;font-size:46px}'
        +'.dfbody{padding:8px 9px 10px}'
        +'.dftitle{font-size:11.5px;line-height:1.45;height:33px;overflow:hidden;color:#e6e7ee}'
        +'.dfmeta{display:flex;align-items:center;gap:5px;margin-top:7px;font-size:9px;color:#8b90a5;min-width:0}'
        +'.dfmeta .av{width:15px;height:15px;border-radius:50%;background:rgba(251,146,60,.3);color:#fbbf24;display:flex;align-items:center;justify-content:center;font-size:8.5px;flex-shrink:0}'
        +'.dfmeta .lv{color:#6b7080;flex-shrink:0}'
        +'.dfmeta .lk{margin-left:auto;flex-shrink:0}'
        +'.dtabs{position:sticky;bottom:0;height:52px;display:flex;align-items:center;background:rgba(14,15,22,.97);border-top:1px solid rgba(255,255,255,.06);backdrop-filter:blur(8px)}'
        +'.dtab{flex:1;text-align:center;font-size:9.5px;color:#6b7080}'
        +'.dtab .ti{display:block;font-size:18px;margin-bottom:1px}'
        +'.dtab.on{color:#fb923c}'
        +'.dtab.ctr .ti{width:44px;height:34px;line-height:34px;border-radius:999px;background:linear-gradient(135deg,#fb923c,#f97316);color:#fff;font-size:14px;margin:0 auto 1px}'
        +'.dtab .bdg{display:inline-block;background:#ef4444;color:#fff;border-radius:999px;font-size:8px;padding:0 4px;margin-left:1px;transform:translateY(-2px)}'
        +'.dcat{cursor:pointer}.dcat:active .ci{background:rgba(251,191,36,.22)}'
        +'.dfcard:active{opacity:.8}.dcard2{cursor:pointer}.dcard2:active{opacity:.8}'
        +'.dov{position:fixed;inset:0;background:#0f1115;z-index:80;display:flex;flex-direction:column;transform:translateX(100%);transition:transform .22s}'
        +'.dov.on{transform:none}'
        +'.dovh{height:50px;display:flex;align-items:center;gap:10px;padding:0 14px;border-bottom:1px solid rgba(255,255,255,.06);flex-shrink:0}'
        +'.dovh button{border:none;background:none;color:#fb923c;font-size:24px;cursor:pointer;padding:0 4px}'
        +'.dovh b{font-size:14.5px}'
        +'.dovb{flex:1;overflow-y:auto;padding:16px;scrollbar-width:none}.dovb::-webkit-scrollbar{display:none}'
        +'.dshop{display:flex;gap:12px;padding:12px 0;border-bottom:1px solid rgba(255,255,255,.05)}'
        +'.dshop .lg{width:54px;height:54px;border-radius:14px;background:linear-gradient(135deg,#fbbf24,#f59e0b);display:flex;align-items:center;justify-content:center;font-size:26px;flex-shrink:0}'
        +'.dshop .in{flex:1;min-width:0}.dshop b{font-size:14px}'
        +'.dshop .mt{font-size:10.5px;color:#8b90a5;margin-top:4px}'
        +'.dnote img{width:100%;border-radius:14px;display:block;margin-bottom:12px}'
        +'.dnote h3{margin:0 0 8px;font-size:15px}.dnote p{margin:0 0 10px;font-size:12.5px;color:#b9bccb;line-height:1.85}',
      html:'<div class="dl">'
        +'<div class="dtop"><span class="t">关注</span><span class="loc">'+city+' <span style="font-size:9px">▾</span></span>'
        +'<span class="t on">附近</span><span class="t">热点</span><span class="coin">🪙 得金币</span></div>'
        +'<div class="dsearch"><span style="font-size:13px">⌕</span><span class="s">搜索店铺、美食、景点</span><span class="cam">📷</span><button class="go">搜索</button></div>'
        +'<div class="dcats">'+cats.map(c=>'<div class="dcat" data-cat="'+c[1]+'"><div class="ci">'+c[0]+'</div>'+c[1]+'</div>').join('')+'</div>'
        +'<div class="dduo"><div class="dcard2" id="rankCard"><div class="th">'+String(rank.title||'点评榜单')+' ›</div>'
        +'<div class="it">'+String(rank.item||'')+'</div><div class="meta"><span style="color:#fbbf24">'+String(rank.tag||'')+'</span><span>'+String(rank.dist||'')+'</span></div></div>'
        +'<div class="dcard2" id="freeCard"><div class="th">免费试 ›</div><div class="it">'+String(free)+'</div>'
        +'<div class="meta"><span>🎁 报名中</span><span style="margin-left:auto">›</span></div></div></div>'
        +'<div class="dfeed">'+feedHtml+'</div>'
        +'<div class="dtabs"><div class="dtab on"><span class="ti">🏠</span>首页</div>'
        +'<div class="dtab"><span class="ti">🗺️</span>地图</div>'
        +'<div class="dtab ctr"><span class="ti">✎ 打卡</span></div>'
        +'<div class="dtab"><span class="ti">💬</span>消息<span class="bdg">99+</span></div>'
        +'<div class="dtab"><span class="ti">👤</span>我的</div></div><div class="dov" id="dov"></div></div>',
      js:'var dov=document.getElementById("dov");'
        +'var RANKTITLE='+JSON.stringify(String(rank.title||"点评榜单"))+',FREETXT='+JSON.stringify(String(free))+';'
        +'var FEEDS='+JSON.stringify(feed.slice(0,6)).replace(/</g,'\\u003c')+';'
        +'function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return ({"&":"&amp;","<":"&lt;",">":"&gt;"})[c]})}'
        +'function closeDov(){dov.classList.remove("on")}'
        +'function openDov(title,inner){'
        +'  dov.innerHTML="<div class=\\"dovh\\"><button id=\\"dovbk\\">\\u2039</button><b>"+esc(title)+"</b></div><div class=\\"dovb\\">"+inner+"</div>";'
        +'  dov.classList.add("on");document.getElementById("dovbk").onclick=closeDov;'
        +'}'
        +'function shopRow(nm,food,rate,dist){'
        +'  return "<div class=\\"dshop\\"><div class=\\"lg\\">🍽️</div><div class=\\"in\\"><b>"+esc(nm)+"</b>"'
        +'    +"<div class=\\"mt\\">★ "+esc(rate)+" · "+esc(dist)+" · 起送 ¥20</div>"'
        +'    +"<div class=\\"mt\\">招牌："+esc(food)+"</div></div></div>";'
        +'}'
        +'document.querySelectorAll(".dcat").forEach(function(c){c.onclick=function(){'
        +'  var k=this.getAttribute("data-cat");'
        +'  var foods=["招牌套餐","人气单品","限时特惠","店长推荐"];'
        +'  var body="";for(var i=0;i<4;i++){body+=shopRow(k+"精选"+(i+1)+"号店",foods[i],(4+i*0.2).toFixed(1),(0.3+i*0.8).toFixed(1)+"km")}'
        +'  openDov(k,body+"<div style=\\"text-align:center;color:#6b7080;font-size:11px;padding:14px 0\\">以上为 "+esc(k)+" 分类下的推荐</div>");'
        +'}});'
        +'var rc=document.getElementById("rankCard");if(rc)rc.onclick=function(){'
        +'  var names=["隐世小馆","巷口面家","深夜食堂","老地方","转角咖啡"],mds=["🥇","🥈","🥉","🏅","🏅"];'
        +'  var b="";for(var i=0;i<5;i++){b+="<div class=\\"dshop\\"><div class=\\"lg\\">"+mds[i]+"</div><div class=\\"in\\"><b>第"+(i+1)+"名 · "+esc(names[i])+"</b><div class=\\"mt\\">★ "+(5-i*0.1).toFixed(1)+" · 好评榜</div></div></div>"}'
        +'  openDov(RANKTITLE,b);'
        +'};'
        +'var fc=document.getElementById("freeCard");if(fc)fc.onclick=function(){'
        +'  openDov("免费试","<div style=\\"font-size:12.5px;color:#c9cad6;line-height:2\\">🎁 "+esc(FREETXT)+"<br><br>参与方式：<br>· 报名后到店体验<br>· 写下真实体验评价<br>· 优质评价可获得下次免单</div>");'
        +'};'
        +'document.querySelectorAll(".dfcard").forEach(function(f){f.onclick=function(){'
        +'  var i=this.getAttribute("data-feed"),F=FEEDS[+i]||{};'
        +'  openDov("笔记详情","<div class=\\"dnote\\"><img src=\\"https://picsum.photos/seed/dlv"+i+"/520/400\\" onerror=\\"this.remove()\\">"'
        +'    +"<h3>"+esc(F.title||"")+"</h3><p>"+esc(F.author||"用户")+" · "+esc(F.level||"Lv1")+"</p>"'
        +'    +"<p>这家店是真的值得来。和朋友一起点了几道招牌，味道很稳，环境也舒服，服务态度很好。</p>"'
        +'    +"<p style=\\"color:#fb923c\\">♡ "+esc(String(F.likes||0))+" 人觉得有用</p></div>");'
        +'}});'
        +'document.querySelectorAll(".dtab").forEach(function(t){t.onclick=function(){'
        +'  document.querySelectorAll(".dtab").forEach(function(x){x.classList.remove("on")});this.classList.add("on");'
        +'  var k=this.textContent.trim();'
        +'  if(k.indexOf("首页")>=0){closeDov();return}'
        +'  if(k.indexOf("地图")>=0){openDov("附近地图","<div style=\\"height:230px;border-radius:14px;background:linear-gradient(135deg,#16324a,#0e1f30);display:flex;align-items:center;justify-content:center;font-size:52px\\">🗺️</div><div style=\\"text-align:center;color:#8b90a5;font-size:11.5px;margin-top:12px\\">正在定位附近商家…</div>");return}'
        +'  if(k.indexOf("打卡")>=0){openDov("打卡","<div style=\\"font-size:12.5px;color:#c9cad6;line-height:2\\">📍 今日打卡 0 次<br>· 到店签到可获积分<br>· 连续打卡 7 天送优惠券</div>");return}'
        +'  if(k.indexOf("消息")>=0){openDov("消息","<div style=\\"font-size:12.5px;color:#c9cad6;line-height:2\\">· 您有一条新的优惠券到账<br>· 关注的店铺上新了<br>· 订单已完成，去评价</div>");return}'
        +'  openDov("我的","<div style=\\"font-size:12.5px;color:#c9cad6;line-height:2.1\\">👤 幻卓用户<br>🧾 我的订单 3<br>🎟️ 优惠券 2<br>⭐ 我的收藏 8<br>⚙️ 设置</div>");'
        +'}});'
        +'var srchBox=document.querySelector(".dsearch");'
        +'if(srchBox)srchBox.onclick=function(){openDov("搜索","<div style=\\"font-size:12.5px;color:#c9cad6;line-height:2\\">热门搜索<br><br>· 附近好吃的<br>· 咖啡<br>· 火锅<br>· 甜点<br>· 夜宵</div>")};'
    });
  };

  /* ---------- 短视频：抖音风格全屏单列（上下滑切视频） ---------- */
  B.video = function(){
    const L=(typeof window.__LLM!=='undefined'&&window.__LLM)?window.__LLM:null;
    let vids=(L&&Array.isArray(L.videos)&&L.videos.length)?L.videos:null;
    if(!vids){
      vids=[0,1,2,3,4].map(()=>({
        title:pick(['最后一次。分别','这可能是今年最好看的'+pick(WORDS.nouns),'我用'+randInt(1,9)+'小时做了一件事','关于'+pick(WORDS.nouns)+'，你必须知道的','深夜补完，值了']),
        up:pick(WORDS.artists), views:randInt(1,99)+'.'+randInt(0,9)+'万', danmaku:String(randInt(1,999)),
        dur:randInt(0,9)+':'+String(randInt(10,59)), cover:pick(['🎾','🎮','🍜','📐','🐈','🛸','🍥','🎬']), hot:chance(.5)
      }));
    }
    const data=JSON.stringify({videos:vids.slice(0,6)}).replace(/</g,'\\u003c');

    const css =
      '.dt{height:100%;display:flex;flex-direction:column;background:#000;position:relative}'
      +'.dtop{position:absolute;left:0;right:0;top:0;z-index:6;display:flex;align-items:center;gap:16px;padding:12px 14px;'
      +'background:linear-gradient(180deg,rgba(0,0,0,.5),transparent);font-size:13.5px;color:rgba(255,255,255,.66)}'
      +'.dtop .t{cursor:pointer;flex:0 0 auto}'
      +'.dtop .t.on{color:#fff;font-weight:700}'
      +'.dtop .t.on:after{content:"";display:block;width:16px;height:2.5px;border-radius:2px;background:#fff;margin:4px auto 0}'
      +'.dtop .sr{margin-left:auto;font-size:17px;color:#fff}'
      +'.feed{flex:1;overflow-y:scroll;scroll-snap-type:y mandatory;scrollbar-width:none}'
      +'.feed::-webkit-scrollbar{display:none}'
      +'.item{height:100%;scroll-snap-align:start;position:relative;display:flex;align-items:center;justify-content:center;overflow:hidden}'
      +'.scene{font-size:110px;filter:drop-shadow(0 18px 48px rgba(0,0,0,.55));animation:vb 7s ease-in-out infinite alternate}'
      +'@keyframes vb{to{transform:scale(1.08) translateY(-8px)}}'
      +'.rail{position:absolute;right:10px;bottom:96px;display:flex;flex-direction:column;gap:18px;align-items:center;z-index:4}'
      +'.rav{width:46px;height:46px;border-radius:50%;background:linear-gradient(135deg,#fb7185,#e11d48);display:flex;align-items:center;justify-content:center;'
      +'font-size:21px;border:2px solid #fff;position:relative;cursor:pointer}'
      +'.rav .plus{position:absolute;left:50%;bottom:-9px;transform:translateX(-50%);width:19px;height:19px;border-radius:50%;background:#fb7185;'
      +'color:#fff;font-size:13px;line-height:19px;text-align:center;border:1.5px solid #000}'
      +'.act{text-align:center;color:#fff;font-size:9.5px;cursor:pointer}'
      +'.act i{display:block;font-style:normal;font-size:27px;line-height:1.1;text-shadow:0 2px 8px rgba(0,0,0,.4)}'
      +'.act b{font-weight:400;display:block;margin-top:2px;opacity:.95}'
      +'.act:active i{transform:scale(1.22)}'
      +'.meta{position:absolute;left:14px;right:78px;bottom:22px;z-index:4;color:#fff}'
      +'.mname{font-size:14.5px;font-weight:700;margin-bottom:8px}'
      +'.mcap{font-size:13px;line-height:1.55;margin-bottom:9px;text-shadow:0 1px 6px rgba(0,0,0,.5)}'
      +'.mtag{font-size:12px;color:#a5b4fc;margin-bottom:8px}'
      +'.mmusic{font-size:11.5px;opacity:.9;display:flex;align-items:center;gap:6px;white-space:nowrap;overflow:hidden}'
      +'.mmusic .disc{width:15px;height:15px;border-radius:50%;background:linear-gradient(135deg,#fff,#94a3b8);animation:spin 4s linear infinite}'
      +'@keyframes spin{to{transform:rotate(360deg)}}'
      +'.dbar{height:54px;display:flex;align-items:center;background:#000;border-top:1px solid rgba(255,255,255,.08);flex-shrink:0;z-index:5}'
      +'.db{flex:1;text-align:center;font-size:9.5px;color:rgba(255,255,255,.6);cursor:pointer}'
      +'.db .ti{display:block;font-size:19px;margin-bottom:1px}'
      +'.db.on{color:#fff}'
      +'.db.plus .ti{width:44px;height:29px;line-height:27px;border-radius:9px;background:#fff;color:#000;font-size:19px;'
      +'font-weight:700;margin:0 auto 1px}'
      +'.db .n{display:inline-block;background:#fb7185;color:#fff;border-radius:999px;font-size:8px;padding:0 4px;margin-left:1px;transform:translateY(-2px)}'
      +'.sh{position:fixed;inset:0;background:#0c0d12;z-index:80;display:flex;flex-direction:column;transform:translateY(100%);transition:transform .24s}'
      +'.sh.on{transform:none}'
      +'.shh{height:50px;display:flex;align-items:center;gap:10px;padding:0 14px;border-bottom:1px solid rgba(255,255,255,.07);flex-shrink:0}'
      +'.shh button{border:none;background:none;color:#fff;font-size:22px;cursor:pointer;padding:0 4px}'
      +'.shh b{font-size:14.5px}'
      +'.shb{flex:1;overflow-y:auto;padding:18px;font-size:12.5px;color:#c9cad6;line-height:2}'
      +'.cmt{display:flex;gap:9px;margin-bottom:14px}'
      +'.cmt .a{width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,.12);display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0}'
      +'.cmt .n{font-size:10.5px;color:#8b90a5}.cmt .x{font-size:12.5px;color:#e6e7ee;margin-top:3px;line-height:1.5}'
      +'.moretip{position:absolute;left:50%;bottom:80px;transform:translateX(-50%);background:rgba(0,0,0,.6);color:#fff;font-size:11px;padding:7px 14px;border-radius:999px;z-index:7;pointer-events:none}';

    const html = '<div class="dt">'
      +'<div class="dtop"><span class="t on" data-f="rec">推荐</span><span class="t" data-f="follow">关注</span>'
      +'<span class="t" data-f="live">直播</span><span class="t" data-f="city">同城</span>'
      +'<span class="sr" id="dsearch">⌕</span></div>'
      +'<div class="feed" id="feed"></div>'
      +'<div class="dbar"><div class="db on" data-t="home"><span class="ti">🏠</span>首页</div>'
      +'<div class="db" data-t="friends"><span class="ti">👥</span>朋友</div>'
      +'<div class="db plus" data-t="plus"><span class="ti">+</span></div>'
      +'<div class="db" data-t="msg"><span class="ti">💬</span>消息<span class="n">3</span></div>'
      +'<div class="db" data-t="me"><span class="ti">👤</span>我</div></div>'
      +'<div class="sh" id="sh"></div></div>';

    const js = `var D=${data};
var BGS=['linear-gradient(160deg,#4c1d95,#831843 55%,#b91c1c)','linear-gradient(160deg,#0c4a6e,#0e7490 55%,#0891b2)','linear-gradient(160deg,#1e1b4b,#4c1d95 55%,#7c3aed)','linear-gradient(160deg,#422006,#92400e 55%,#d97706)','linear-gradient(160deg,#052e16,#065f46 55%,#10b981)','linear-gradient(160deg,#3b0764,#6b21a8 55%,#c026d3)'];
var feed=document.getElementById('feed'),sh=document.getElementById('sh'),curFilter='rec';
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]})}
var TAGS=['#生活记录','#随手拍','#日常','#治愈系','#今日份快乐','#城市夜景'];
var TITLES=['凌晨三点的街道','这大概就是生活吧','用一年时间做了一件事','第一次尝试，翻车了','被这片海治愈了','花三天做了个东西','这个技巧真的太实用了','记录一下普通的一天','原来还能这样','突然就下雨了','终于把房间整理好了','路边摊的快乐','在城市的角落发呆','今天也要好好吃饭','一只猫的下午'];
var UPS=['@凌晨四点','@生活记录员','@手作日常','@城市观察','@一个人的旅行','@今天也在努力','@慢慢来比较快'];
var COVERS=['🌃','🍜','🎧','🌊','🛠️','🐈','☕','🚲','🌻','🎬','🏔️','🍥'];
var VIEWS=['1.2万','3.4万','8.7万','12.3万','4567','2.1万','7.8万','5.6万'];
var DURS=['0:21','1:06','0:48','2:13','0:35','1:47','0:59','3:02'];
var allVideos=[],loaded=0,PAGE=5,loadingMore=false,moreTip=null;
function makeVideo(i){
  if(i<D.videos.length)return D.videos[i];
  var k=i%D.videos.length;
  return {
    title:TITLES[i%TITLES.length],
    up:UPS[i%UPS.length],
    views:VIEWS[i%VIEWS.length],
    danmaku:String(50+((i*37)%900)),
    dur:DURS[i%DURS.length],
    cover:COVERS[i%COVERS.length],
    hot:(i%3===0)
  };
}
function itemHTML(x,i){
  var tag=TAGS[i%TAGS.length],tags2=TAGS[(i+3)%TAGS.length];
  return '<div class="item" style="background:'+BGS[i%BGS.length]+'">'
    +'<div class="scene">'+esc(x.cover||'🎬')+'</div>'
    +'<div class="rail">'
    +'<div class="rav">'+esc((x.up||'U').slice(1,2)||'U')+'<span class="plus">+</span></div>'
    +'<div class="act" data-a="like"><i>🤍</i><b>'+esc(x.views||'1.2万')+'</b></div>'
    +'<div class="act" data-a="cmt"><i>💬</i><b>'+esc(x.danmaku||'328')+'</b></div>'
    +'<div class="act" data-a="fav"><i>⭐</i><b>'+esc(String(100+((i*73)%900)))+'</b></div>'
    +'<div class="act" data-a="share"><i>↗️</i><b>分享</b></div>'
    +'</div>'
    +'<div class="meta"><div class="mname">@'+esc((x.up||'创作者').replace(/^@/,''))+'</div>'
    +'<div class="mcap">'+esc(x.title||'')+'</div>'
    +'<div class="mtag">'+tag+' '+tags2+'</div>'
    +'<div class="mmusic"><span class="disc"></span><span>'+esc((x.up||'原声').replace(/^@/,''))+' · 原声</span></div></div>'
    +'</div>';
}
function bindActs(scope){
  (scope||feed).querySelectorAll('.act').forEach(function(a){
    if(a.__b)return; a.__b=true;
    a.onclick=function(ev){
      ev.stopPropagation();
      var k=this.getAttribute('data-a'),ic=this.querySelector('i');
      if(k==='like'){var on=ic.textContent==='❤️';ic.textContent=on?'🤍':'❤️';ic.style.filter=on?'':'drop-shadow(0 0 8px #fb7185)'}
      else if(k==='fav'){var f=ic.textContent==='⭐';ic.textContent=f?'☆':'⭐'}
      else if(k==='cmt'){openComments(this)}
      else{sheet('分享','复制链接<br>分享给好友<br>保存到相册')}
    };
  });
  (scope||feed).querySelectorAll('.rav').forEach(function(r){
    if(r.__b)return; r.__b=true;
    r.onclick=function(ev){ev.stopPropagation();var p=this.querySelector('.plus');p.textContent=p.textContent==='+'?'✓':'+'}
  });
}
function appendPage(){
  var frag=document.createDocumentFragment();
  var tmp=document.createElement('div');
  var html='';
  for(var i=0;i<PAGE;i++){
    var v=makeVideo(loaded);
    allVideos.push(v);
    html+=itemHTML(v,loaded);
    loaded++;
  }
  tmp.innerHTML=html;
  while(tmp.firstChild){ frag.appendChild(tmp.firstChild) }
  feed.appendChild(frag);
  bindActs();
  if(loaded>60){
    // 控制 DOM 数量：移除最早的一屏（保持可视位置）
    var first=feed.querySelector('.item');
    var h=first?first.offsetHeight:0;
    if(first){first.parentNode.removeChild(first);feed.scrollTop=Math.max(0,feed.scrollTop-h)}
  }
}
function filteredBase(){
  var v=D.videos.slice();
  if(curFilter==='follow')v=v.slice(0,3);
  if(curFilter==='live')v=v.slice(0,2);
  if(curFilter==='city')v=v.slice(2,5);
  return v;
}
function render(){
  feed.innerHTML='';allVideos=[];loaded=0;
  var html='';
  filteredBase().forEach(function(x){allVideos.push(x);html+=itemHTML(x,loaded);loaded++});
  feed.innerHTML=html;
  bindActs();
  appendPage();
  feed.scrollTop=0;
  loadingMore=false;
}
function showMoreTip(){
  if(moreTip)return;
  moreTip=document.createElement('div');
  moreTip.className='moretip';
  moreTip.textContent='正在加载更多…';
  feed.appendChild(moreTip);
}
function hideMoreTip(){
  if(moreTip&&moreTip.parentNode)moreTip.parentNode.removeChild(moreTip);
  moreTip=null;
}
feed.addEventListener('scroll',function(){
  if(loadingMore)return;
  if(feed.scrollTop+feed.clientHeight*2.2>=feed.scrollHeight){
    loadingMore=true;
    showMoreTip();
    setTimeout(function(){appendPage();hideMoreTip();loadingMore=false;},420);
  }
},{passive:true});

function openComments(el){
  var body='';
  var cmts=['这个太真实了','已收藏','求bgm','前排','看哭了','好想去这里','这也太好看了吧'];
  cmts.forEach(function(t,i){
    body+='<div class="cmt"><div class="a">'+['🐱','🌙','🎧','🦊','🍀'][i%5]+'</div><div><div class="n">用户'+(i+1)+'号</div><div class="x">'+esc(t)+'</div></div></div>';
  });
  sheet('评论',body);
}
function sheet(title,inner){
  sh.innerHTML='<div class="shh"><button id="shbk">⌄</button><b>'+esc(title)+'</b></div><div class="shb">'+inner+'</div>';
  sh.classList.add('on');
  document.getElementById('shbk').onclick=function(){sh.classList.remove('on')};
}
document.querySelectorAll('.dtop .t').forEach(function(t){
  t.onclick=function(){
    document.querySelectorAll('.dtop .t').forEach(function(x){x.classList.remove('on')});
    this.classList.add('on');curFilter=this.getAttribute('data-f');render();
  };
});
document.getElementById('dsearch').onclick=function(){sheet('搜索','搜索你感兴趣的内容<br><br>· 今日热门<br>· 附近的人<br>· 音乐榜单')};
document.querySelectorAll('.db').forEach(function(b){
  b.onclick=function(){
    var k=this.getAttribute('data-t');
    if(k==='plus'){sheet('发布','拍摄短视频<br>上传本地视频<br>开直播');return}
    if(k==='home'){document.querySelectorAll('.db').forEach(function(x){x.classList.remove('on')});this.classList.add('on');render();return}
    if(k==='friends'){sheet('朋友','暂无好友动态<br><br>去消息页添加好友，就能看到他们的分享');return}
    if(k==='msg'){sheet('消息','互动消息 3<br>· 有人赞了你的视频<br>· 有人评论了你');return}
    if(k==='me'){sheet('我','👤 幻卓用户<br>作品 0 · 喜欢 12<br>关注 8 · 粉丝 3');return}
  };
});
render();`;

    return shell({bare:true, title:'短视频', icon:'▶️', accent:'#fb7185', css:css, html:html, js:js});
  };

})();
