/* ============ Hallucindriod · 幻卓 · LLM 幻觉层（浏览器直连 · 多源竞速 + fallback） ============
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
    browser: n=>`用户想打开「${n}」。先判断它是什么网站（社交/视频/购物/资讯/工具/企业等），据此设计一个符合该定位的中文网页首页。只输出纯JSON，字段齐全：{"siteName":"品牌名2-6字","tagline":"标语8字内","heroTitle":"大标题14字内","heroSub":"副标题26字内","cta":"按钮4字内","aboutTitle":"板块标题","about":"一段介绍50字内","features":[{"icon":"emoji","title":"4-6字","desc":"18字内"}],"stats":[{"num":"120万","label":"用户"},{"num":"4.9分","label":"评分"},{"num":"98%","label":"好评"}]}`,
    messages:n=>`为一个手机社交App生成消息页。格式：{"me":"我的昵称","status":"在线状态","subs":[{"name":"订阅号名","avatar":"一个emoji"}],"chats":[{"name":"昵称","preview":"最新动态，24字内","time":"刚刚","unread":数字0-99,"muted":false,"avatar":"一个emoji","badge":"Lv8","fire":数字0-99}]}。生成4个订阅号、6条消息，主题：${n}`,
    album:   n=>`编4张照片标题。格式：{"photos":[{"title":"照片标题，8字内","emoji":"一个emoji"}]}。主题：${n}`,
    fish:    n=>`编一个摸鱼检测结果。格式：{"verdict":"一句摸鱼结论，20字内","advice":"一句建议，15字内"}。主题：${n}`,
    map:     n=>`编一个城市地图。格式：{"city":"城市名","marks":["地标1","地标2","地标3","地标4"]}。主题：${n}`,
    music:   n=>`编3首中文歌。格式：{"songs":[{"title":"歌名","artist":"歌手名"}]}。主题：${n}`,
    health:  n=>`编一段健康数据点评。格式：{"comment":"一句健康点评，25字内"}。主题：${n}`,
    settings:n=>`为一台手机生成系统状态。格式：{"device":"设备型号名，如 幻卓 Pro","comment":"一句系统状态说明，20字内"}。主题：${n}`,
    clock:   n=>`编一句时钟寄语。格式：{"comment":"一句话，20字内"}。主题：${n}`,
    camera:  n=>`为一次拍照生成内容。格式：{"scene":"一个emoji表示拍摄场景","caption":"照片标题，10字内","tip":"一句拍摄提示，16字内"}。主题：${n}`,
    game:    n=>`编一句游戏口号。格式：{"comment":"一句话，20字内"}。主题：${n}`,
    phone:   n=>`为一次通话生成内容。格式：{"contact":"通话对象称呼","line":"对方在电话里说的一句话，20字内"}。主题：${n}`,
    delivery:n=>`为一个本地生活App生成首页。格式：{"city":"城市","rank":{"title":"榜单名如 吃喝玩乐指南","item":"榜单项标题18字内","tag":"热评榜第4名","dist":"2.9km"},"free":"免费试活动文案16字内","feed":[{"title":"图文标题20字内","author":"用户昵称","level":"Lv数字","likes":数字,"emoji":"一个emoji"}]}。生成4条图文，主题：${n}`,
    video:   n=>`为一个视频App生成推荐列表。格式：{"videos":[{"title":"视频标题22字内","up":"UP主名","views":"播放量如 1.3万","danmaku":"弹幕数如 3","dur":"时长如 1:06","cover":"一个emoji","hot":true或false}]}。生成6条视频，主题：${n}`,
    terminal:n=>`你是手机智能助手。用户指令：「${n}」。把指令解析成可执行动作，只输出纯JSON：{"reply":"对用户的自然语言回应，16字内","actions":[{"type":"动作类型","target":"目标值","label":"动作简述，8字内"}]}。可用动作：openApp(打开应用,target填应用名如 计算器/天气/相机/音乐/地图/浏览器/短信/电话/设置/应用商店)、closeApp(关闭当前应用)、toast(显示提示,target填提示文字)、toggle(开关,target填 wifi/蓝牙/手电筒/飞行模式/勿扰)、call(拨号,target填号码或联系人)、message(发短信,target填联系人)、browse(打开网页,target填主题或网址)、searchApp(应用商店搜索,target填关键词)。最多3个动作。`,
    friend:  n=>`为一个网名叫「${n}」的聊天好友生成人设。格式：{"avatar":"一个emoji","level":"Lv数字","bio":"个性签名，16字内","greeting":"主动打招呼的一句话，20字内"}。只输出JSON。`,
    chatreply:n=>`你在扮演一个聊天对象。根据下面的上下文用一句自然口语回复（20字内，口语化）。上下文：${n}。只输出JSON：{"reply":"你的回复"}`,
    calculator:n=>`为AI计算器生成两句话。格式：{"sign":"AI助手签名，8字内","tip":"算错结果时的吐槽，18字内"}。主题：${n}`
  };

  function systemPrompt(conf,id){
    // 智能终端是动作规划器：要精确、听话，不受置信度的荒诞风格影响
    if(id==='terminal')return '你是「Hallucindriod」手机内置智能终端的动作规划引擎。你理解用户的中文指令，把它拆解成手机可执行的结构化动作。要求：1)严格只输出一个纯JSON对象，不要markdown代码块、不要任何解释文字或前后缀；2)reply 是对用户的简短自然回应；3)actions 是动作数组，只能使用给定的动作类型，target 用中文应用名或给定枚举值；4)不做无法执行的事情，不编造不存在的动作类型。';
    const pct=Math.round(conf*100);
    if(conf>=0.8) return '你是「Hallucindriod」的内容引擎，当前置信度 '+pct+'%。请生成【尽量贴近真实世界、合理可信】的中文内容：数据真实、符合常识、不荒诞。只输出一个纯JSON对象，不要markdown代码块，不要任何解释文字或前后缀。';
    if(conf>=0.5) return '你是「Hallucindriod」的幻觉内容引擎，当前置信度 '+pct+'%。请生成【一半真实一半荒诞、带点冷幽默】的中文创意内容。只输出一个纯JSON对象，不要markdown代码块，不要任何解释文字或前后缀。';
    if(conf>=0.2) return '你是「Hallucindriod」的创意幻觉内容引擎，当前置信度 '+pct+'%。请生成【天马行空、幽默荒诞、一本正经地虚构】的中文创意内容，比如会下代码雨的天空、会用月亮煮汤的城市。只输出一个纯JSON对象，不要markdown代码块，不要任何解释文字或前后缀。';
    return '你是「Hallucindriod」的奇想内容引擎，当前置信度 '+pct+'%。请生成【充满想象力、超现实、像童话或梦境一样】的中文内容：奇妙的地点、不可思议的天气、有趣的虚构数据。只输出一个纯JSON对象，不要markdown代码块，不要任何解释文字或前后缀。';
  }
  function temperature(conf,id){ return id==='terminal'?0.15:+(0.2+(1-conf)*0.95).toFixed(2); }
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
    const isTerminal=id==='terminal';
    // browser 生成完整官网 JSON 偏慢，但已精简字段；给 18s 窗口，超时再走备用源
    const heavy=isBrowser?600:((id==='delivery'||id==='video'||id==='messages')?650:400);
    const ctx={sys:systemPrompt(conf,id),user:buildUserPrompt(id,name),temp:temperature(conf,id),maxTokens:heavy};
    // browser 要生成完整官网 JSON（约 15s），给足竞速窗口；
    // terminal 只是短 JSON 意图解析，给短窗口保证快速响应；其他应用保持默认
    const isChat=(id==='friend'||id==='chatreply');
    const fastWin=isBrowser?16000:((isTerminal||isChat)?6500:RACE_FAST);
    const backupWin=isBrowser?20000:((isTerminal||isChat)?7000:RACE_BACKUP);
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
