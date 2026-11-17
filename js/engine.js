/* ============ 幻卓 Huandroid · 现编引擎 ============
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
  const appLayer=document.getElementById('appLayer');
  const frame=document.getElementById('appFrame');
  let currentId=null,currentName=null,busy=false;

  // 伪造的「现场编写代码」——不同应用略有差异
  function codeLines(name,id){
    const comp=pick(['App','View','Screen','Panel','Widget']);
    const varN=pick(['state','model','vm','ctx','core']);
    const col=pick(['#a78bfa','#7dd3fc','#5eead4','#f472b6']);
    return [
      '<span class="cm">// ✦ 幻觉引擎 v3.7 · 现场编写「'+name+'」</span>',
      '<span class="kw">import</span> { hallucinate, render } <span class="kw">from</span> <span class="str">"os://core"</span>',
      '',
      '<span class="kw">const</span> '+varN+' = <span class="fn">hallucinate</span>({',
      '  name: <span class="str">"'+name+'"</span>,',
      '  mood: <span class="str">"'+pick(['自信','过度自信','一本正经','灵光乍现','梦游'])+'"</span>,',
      '  seed: <span class="num">'+randInt(100000,999999)+'</span>,',
      '  style: <span class="str">"'+col+'"</span>',
      '})',
      '',
      '<span class="kw">function</span> <span class="fn">'+comp+'</span>() {',
      '  <span class="kw">const</span> data = '+varN+'.<span class="fn">generate</span>()',
      '  <span class="kw">return</span> <span class="str">&lt;Layout theme="dark"&gt;</span>',
      '    <span class="str">&lt;Header title={data.title} /&gt;</span>',
      '    <span class="str">&lt;Body {...data.content} /&gt;</span>',
      '    <span class="str">&lt;/Layout&gt;</span>',
      '}',
      '',
      '<span class="fn">render</span>(<'+comp+' />)',
      '<span class="cm">// ✓ 编译通过 · 已注入沙箱 iframe</span>',
      '<span class="cm">// ⚠ 本代码仅存在于此刻，关闭即蒸发</span>'
    ];
  }

  function escHTML(s){return s}

  // 逐行打印代码瀑布，完成后 resolve
  function printCode(name,id){
    return new Promise(resolve=>{
      const lines=codeLines(name,id);
      terminal.innerHTML='';
      bar.style.width='0%';
      let i=0;
      const total=lines.length;
      const tick=()=>{
        if(i>=total){setTimeout(resolve,180);return}
        const d=document.createElement('div');
        d.className='ln';
        d.innerHTML=lines[i]||'&nbsp;';
        terminal.appendChild(d);
        // 保持可视区域在底部
        terminal.scrollTop=terminal.scrollHeight;
        i++;
        bar.style.width=Math.round(i/total*100)+'%';
        stat.textContent=randInt(980,1480)+' tokens/s';
        setTimeout(tick,randInt(55,110));
      };
      tick();
    });
  }

  async function openApp(id,name,opts){
    if(busy)return;
    const app=(APPS.find(a=>a.id===id));
    name=name||(app&&app.name)||'应用';
    currentId=id;currentName=name;busy=true;

    // 先关抽屉/控制中心
    if(window.HOS&&window.HOS.closePanels)window.HOS.closePanels();

    genName.textContent=name;
    genLayer.hidden=false;
    appLayer.hidden=true;

    // 并行：动画 + LLM 现场编内容（失败自动降级为本地幻觉）
    const llmPromise = window.LLM ? window.LLM.fetchHallucination(id,name) : Promise.resolve(null);
    await printCode(name,id);
    let llmData = null;
    try{ llmData = await llmPromise; }catch(e){ llmData=null; }
    // 追加 LLM 状态行
    const d=document.createElement('div');
    d.className='ln';
    d.innerHTML = llmData
      ? '<span class="str">// ✓ Pollinations LLM 已现场编好内容并注入</span>'
      : '<span class="cm">// ↻ LLM 繁忙，已用本地幻觉词库兜底</span>';
    terminal.appendChild(d);
    terminal.scrollTop=terminal.scrollHeight;
    bar.style.width='100%';
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
    frame.srcdoc=html;
    genLayer.hidden=true;
    appLayer.hidden=false;
    busy=false;
    if(opts&&opts.toast)window.HOS.toast(opts.toast);
  }

  function closeApp(){
    currentId=null;currentName=null;
    appLayer.hidden=true;
    frame.srcdoc='<html><body style="background:#0d0e14"></body></html>';
    // 同步桌面图标外观（每次重编会随机，重新渲染一次以体现"变化"）
    window.HOS.refreshIcons&&window.HOS.refreshIcons();
  }

  function regen(){
    if(!currentId&&currentName===null)return;
    const id=currentId,name=currentName;
    const isGeneric=!window.APP_BUILDERS[id];
    appLayer.hidden=true;
    openApp(id,name,{});
    if(isGeneric)window.HOS.toast('✦ 已重新幻觉一个版本');
  }

  // 接收 iframe 内部消息
  window.addEventListener('message',function(e){
    if(!e.data||typeof e.data!=='object')return;
    if(e.data.type==='close')closeApp();
    else if(e.data.type==='regen')regen();
    else if(e.data.type==='config'&&e.data.cfg){
      // 置信度/API 配置：原地更新全局 CONFIG 并持久化
      Object.assign(D.CONFIG,e.data.cfg);
      if(D.saveConfig)D.saveConfig(D.CONFIG);
      if(window.HOS&&window.HOS.toast&&e.data.cfg.apiBase!==undefined)window.HOS.toast('✓ 系统配置已保存');
    }
  });

  window.ENGINE={openApp,closeApp,regen};
})();
