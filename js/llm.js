/* ============ 幻卓 Huandroid · LLM 幻觉层（浏览器直连 · 多源竞速 + fallback） ============
 * 关键点：
 *  - 纯静态站没有后端，直接 fetch 免费 LLM 公共端点（必须支持 CORS）。
 *  - 主源 Pollinations（text.pollinations.ai/openai，CORS:*，免 Key）：openai-fast / openai 竞速。
 *    ※ Pollinations 对已登记来源（如生产域名 hex1um.github.io）CORS 放行；
 *      对 localhost 等未知来源会要求 Turnstile token，此时会自动走下面的备用源。
 *  - 备用源（换服务/换路径）：Pollinations 文本端点、AI Horde（众包 GPU，免 key，CORS:*）。
 *  - 配置了自定义 OpenAI 兼容端点时优先走自定义，失败再回退内置源。
 *  - 只有所有源都失败才返回 null → 调用方用本地词库兜底。
 *  - 置信度 confidence ∈ [0,1] 控制「现实 ↔ 幻觉」。
 */
(function(){
  const D=window.OS_DATA;

  // 竞速窗口：谁先在窗口内返回有效 JSON 就用谁；超时即切换下一个源
  const RACE_FAST=9000;    // 阶段一（Pollinations 双模型）
  const RACE_BACKUP=18000; // 阶段二（文本端点 / AI Horde 轮询）
  const RACE_CUSTOM=12000; // 自定义端点

  // 每个应用的 JSON 结构提示
  const SCHEMA={
    weather: n=>`为天气App编内容。格式：{"city":"城市名","weather":"天气现象","temp":数字,"tip":"一句天气提示，20字内"}。主题：${n}`,
    notes:   n=>`编一条中文便签。格式：{"text":"便签正文，35字内","mood":"一个emoji","sign":"署名地点"}。主题：${n}`,
    store:   n=>`编3个中文App。格式：{"apps":[{"name":"App名","desc":"一句介绍，20字内","emoji":"一个emoji"}]}。主题：${n}`,
    browser: n=>`为「${n}」这个主题设计一个精致的中文品牌官网首页内容。只输出一个纯JSON对象（不要markdown、字段必须齐全）：{"siteName":"网站/品牌名，2-6字","tagline":"品牌标语，8字内","heroTitle":"吸睛大标题，14字内","heroSub":"副标题文案，26字内","cta":"按钮文字，4字内","aboutTitle":"关于板块标题，如 关于我们","about":["第一段介绍，40字内","第二段介绍，40字内"],"features":[{"icon":"一个相关emoji","title":"特色标题，4-6字","desc":"一句话介绍，18字内"},{"icon":"emoji","title":"标题","desc":"介绍"},{"icon":"emoji","title":"标题","desc":"介绍"}],"stats":[{"num":"如 120万","label":"如 用户"},{"num":"数字+单位","label":"标签"},{"num":"数字+单位","label":"标签"}]}`,
    messages:n=>`编一段4条往返聊天。格式：{"contact":"联系人称呼","msgs":[{"me":true,"text":"我发的"},{"me":false,"text":"对方回的"}]}。主题：${n}`,
    album:   n=>`编4张照片标题。格式：{"photos":[{"title":"照片标题，8字内","emoji":"一个emoji"}]}。主题：${n}`,
    fish:    n=>`编一个摸鱼检测结果。格式：{"verdict":"一句摸鱼结论，20字内","advice":"一句建议，15字内"}。主题：${n}`,
    map:     n=>`编一个城市地图。格式：{"city":"城市名","marks":["地标1","地标2","地标3","地标4"]}。主题：${n}`,
    music:   n=>`编3首中文歌。格式：{"songs":[{"title":"歌名","artist":"歌手名"}]}。主题：${n}`,
    health:  n=>`编一段健康数据点评。格式：{"comment":"一句健康点评，25字内"}。主题：${n}`,
    settings:n=>`编一句系统状态说明。格式：{"comment":"一句话，20字内"}。主题：${n}`,
    clock:   n=>`编一句时钟寄语。格式：{"comment":"一句话，20字内"}。主题：${n}`,
    camera:  n=>`编一句拍照提示。格式：{"comment":"一句话，20字内"}。主题：${n}`,
    game:    n=>`编一句游戏口号。格式：{"comment":"一句话，20字内"}。主题：${n}`,
    phone:   n=>`编一句通话彩蛋。格式：{"comment":"一句话，20字内"}。主题：${n}`,
    calculator:n=>`编一句计算器吐槽。格式：{"comment":"一句话，20字内"}。主题：${n}`
  };

  function systemPrompt(conf){
    const pct=Math.round(conf*100);
    if(conf>=0.8) return '你是「幻卓 Huandroid」的内容引擎，当前置信度 '+pct+'%。请生成【尽量贴近真实世界、合理可信】的中文内容：数据真实、符合常识、不荒诞。只输出一个纯JSON对象，不要markdown代码块，不要任何解释文字或前后缀。';
    if(conf>=0.5) return '你是「幻卓 Huandroid」的幻觉内容引擎，当前置信度 '+pct+'%。请生成【一半真实一半荒诞、带点冷幽默】的中文创意内容。只输出一个纯JSON对象，不要markdown代码块，不要任何解释文字或前后缀。';
    if(conf>=0.2) return '你是「幻卓 Huandroid」的创意幻觉内容引擎，当前置信度 '+pct+'%。请生成【天马行空、幽默荒诞、一本正经地虚构】的中文创意内容，比如会下代码雨的天空、会用月亮煮汤的城市。只输出一个纯JSON对象，不要markdown代码块，不要任何解释文字或前后缀。';
    return '你是「幻卓 Huandroid」的奇想内容引擎，当前置信度 '+pct+'%。请生成【充满想象力、超现实、像童话或梦境一样】的中文内容：奇妙的地点、不可思议的天气、有趣的虚构数据。只输出一个纯JSON对象，不要markdown代码块，不要任何解释文字或前后缀。';
  }
  function temperature(conf){ return +(0.2+(1-conf)*0.95).toFixed(2); }
  function buildUserPrompt(id,name){
    if(id==='__generic__'||!SCHEMA[id]) return '用户想要一个叫「'+name+'」的手机App。只输出纯JSON：{"tagline":"一句App广告语，20字内","features":["功能1","功能2","功能3"]}';
    return SCHEMA[id](name);
  }
  function extractJSON(text){
    if(!text)return null;
    let s=String(text).trim();
    const fence=s.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if(fence)s=fence[1].trim();
    const a=s.indexOf('{'),b=s.lastIndexOf('}');
    if(a<0||b<a)return null;
    s=s.slice(a,b+1);
    try{return JSON.parse(s)}catch(e){return null}
  }

  // ---------- 各数据源实现：统一签名 (ctx, signal) => Promise<data|null> ----------
  function messagesOf(ctx){ return [{role:'system',content:ctx.sys},{role:'user',content:ctx.user}]; }

  // Pollinations OpenAI 兼容端点（CORS:*，免 Key）
  async function plChat(model,ctx,signal){
    const r=await fetch('https://text.pollinations.ai/openai',{
      method:'POST',signal,headers:{'Content-Type':'application/json'},
      body:JSON.stringify({model,messages:messagesOf(ctx),temperature:ctx.temp,max_tokens:ctx.maxTokens||400})
    });
    if(!r.ok)return null;
    const j=await r.json();
    const c=j&&j.choices&&j.choices[0]&&j.choices[0].message&&j.choices[0].message.content;
    return extractJSON(c);
  }
  // Pollinations 纯文本端点（另一条路径，兜底）
  async function plText(ctx,signal){
    const prompt=ctx.sys+'\n\n'+ctx.user;
    const r=await fetch('https://text.pollinations.ai/'+encodeURIComponent(prompt)+'?model=openai-fast',{signal});
    if(!r.ok)return null;
    return extractJSON(await r.text());
  }
  // AI Horde：众包 GPU 网络，免 key（anonymous key）+ CORS:*，真正的独立备用源
  // 流程：提交异步任务 → 轮询状态直到出文本（最多约 16s）
  async function hordeChat(ctx,signal){
    const prompt=ctx.sys+'\n\n'+ctx.user+'\n\n只输出一个纯JSON对象。';
    const sub=await fetch('https://aihorde.net/api/v2/generate/text/async',{
      method:'POST',signal,
      headers:{'Content-Type':'application/json','apikey':'0000000000'},
      body:JSON.stringify({prompt,max_tokens:300})
    });
    if(!sub.ok)return null;
    const job=await sub.json();
    const id=job&&job.id;
    if(!id)return null;
    const deadline=Date.now()+16000;
    while(Date.now()<deadline){
      await new Promise(r=>setTimeout(r,1500));
      if(signal&&signal.aborted)return null;
      const s=await fetch('https://aihorde.net/api/v2/generate/text/status/'+id,{signal});
      if(!s.ok)return null;
      const st=await s.json();
      if(st.done&&st.generations&&st.generations.length){
        return extractJSON(st.generations[0].text);
      }
    }
    return null;
  }
  // 用户自定义 OpenAI 兼容端点
  async function customChat(ctx,signal){
    const cfg=D.CONFIG;
    const headers={'Content-Type':'application/json'};
    if(cfg.apiKey)headers['Authorization']='Bearer '+cfg.apiKey;
    const r=await fetch(cfg.apiBase.replace(/\/$/,'')+'/chat/completions',{
      method:'POST',signal,headers,
      body:JSON.stringify({model:cfg.model||'gpt-4o-mini',messages:messagesOf(ctx),temperature:ctx.temp,max_tokens:ctx.maxTokens||400})
    });
    if(!r.ok)return null;
    const j=await r.json();
    const c=j&&j.choices&&j.choices[0]&&j.choices[0].message&&j.choices[0].message.content;
    return extractJSON(c);
  }

  // 源清单（label 用于状态行展示真实使用的源）
  const SOURCES={
    plFast:  {label:'Pollinations · 极速', call:(ctx,s)=>plChat('openai-fast',ctx,s)},
    plStd:   {label:'Pollinations · 标准', call:(ctx,s)=>plChat('openai',ctx,s)},
    plText:  {label:'Pollinations · 文本', call:(ctx,s)=>plText(ctx,s)},
    horde:   {label:'AI Horde · 众包',    call:(ctx,s)=>hordeChat(ctx,s)}
  };

  // 竞速：窗口内第一个返回有效 JSON 者胜出；全部快速失败则提前结束
  function race(list,ctx,winMs){
    return new Promise(resolve=>{
      if(!list.length){resolve(null);return}
      let done=false,settled=0;
      const ctrls=[],timers=[];
      const finish=(res,winIdx)=>{
        if(done)return;done=true;
        timers.forEach(clearTimeout);
        ctrls.forEach((c,i)=>{if(i!==winIdx){try{c.abort()}catch(e){}}});
        resolve(res);
      };
      list.forEach((src,i)=>{
        const ctrl=new AbortController();ctrls[i]=ctrl;
        timers.push(setTimeout(()=>{try{ctrl.abort()}catch(e){}},winMs+4000)); // 单源硬超时
        Promise.resolve()
          .then(()=>src.call(ctx,ctrl.signal))
          .then(data=>{
            if(done)return;
            if(data)finish({data,source:src.label},i);
            else if(++settled===list.length)finish(null,-1);
          })
          .catch(()=>{if(!done&&++settled===list.length)finish(null,-1)});
      });
      timers.push(setTimeout(()=>finish(null,-1),winMs));
    });
  }

  // 主入口：Promise<data|null>，并把实际使用的源写到 window.__LLM_SOURCE
  async function fetchHallucination(id,name){
    const cfg=D.CONFIG;
    const conf=Math.max(0,Math.min(1,Number(cfg.confidence)));
    const isBrowser=id==='browser';
    const ctx={sys:systemPrompt(conf),user:buildUserPrompt(id,name),temp:temperature(conf),maxTokens:isBrowser?900:400};
    // browser 要生成完整官网 JSON（约 15s），给足竞速窗口；其他应用保持快速
    const fastWin=isBrowser?22000:RACE_FAST;
    const backupWin=isBrowser?26000:RACE_BACKUP;
    window.__LLM_SOURCE='';
    window.__LLM_DIAG=[];

    // 1) 自定义端点优先
    if(cfg.apiBase&&cfg.apiBase.trim()){
      const r=await race([{label:'自定义 API',call:customChat}],ctx,RACE_CUSTOM);
      if(r){window.__LLM_SOURCE=r.source;return r.data}
      window.__LLM_DIAG.push('自定义端点不可用');
    }

    // 2) 阶段一：Pollinations 双模型竞速（快的胜出，慢的被 abort）
    let r=await race([SOURCES.plFast,SOURCES.plStd],ctx,fastWin);
    if(r){window.__LLM_SOURCE=r.source;return r.data}
    window.__LLM_DIAG.push('Pollinations 超时/失败');

    // 3) 阶段二：换源——文本端点（换路径）+ AI Horde（换服务），给足轮询时间
    r=await race([SOURCES.plText,SOURCES.horde],ctx,backupWin);
    if(r){window.__LLM_SOURCE=r.source;return r.data}
    window.__LLM_DIAG.push('备用源均不可用');

    return null;
  }

  window.LLM={fetchHallucination,systemPrompt,temperature};
})();
