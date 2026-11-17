/* ============ 幻卓 Huandroid · Pollinations.ai 免费 LLM 幻觉层 ============
 * 让 LLM 真的现场编内容。失败/超时自动降级（返回 null → 用本地词库）。
 * 置信度 confidence ∈ [0,1] 控制"现实 ↔ 幻觉"：
 *   → 1：低温 + 严谨提示，内容贴近真实世界
 *   → 0：高温 + 狂野提示，内容极度随机混乱
 * 支持在设置里填自定义 OpenAI 兼容 API。
 */
(function(){
  const D=window.OS_DATA;
  const DEFAULT_ENDPOINT='/api/llm';
  const TIMEOUT=24000;

  // 每个应用的 JSON 结构提示（内容风格由 system 提示按置信度统一控制）
  const SCHEMA={
    weather: n=>`为天气App编内容。格式：{"city":"城市名","weather":"天气现象","temp":数字,"tip":"一句天气提示，20字内"}。主题：${n}`,
    notes:   n=>`编一条中文便签。格式：{"text":"便签正文，35字内","mood":"一个emoji","sign":"署名地点"}。主题：${n}`,
    store:   n=>`编3个中文App。格式：{"apps":[{"name":"App名","desc":"一句介绍，20字内","emoji":"一个emoji"}]}。主题：${n}`,
    browser: n=>`编一个虚构网站。格式：{"title":"网站名","headline":"吸睛大标题","desc":"60字内介绍","topic":"站点主题词"}。主题：${n}`,
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

  // 置信度 → system 提示。接近1：真实可信；接近0：彻底幻觉
  function systemPrompt(conf){
    const pct=Math.round(conf*100);
    if(conf>=0.8){
      return '你是「幻卓 Huandroid」的内容引擎，当前置信度 '+pct+'%。请生成【尽量贴近真实世界、合理可信】的中文内容：数据真实、符合常识、不荒诞。只输出一个纯JSON对象，不要markdown代码块，不要任何解释文字或前后缀。';
    }
    if(conf>=0.5){
      return '你是「幻卓 Huandroid」的幻觉内容引擎，当前置信度 '+pct+'%。请生成【一半真实一半荒诞、带点冷幽默】的中文创意内容。只输出一个纯JSON对象，不要markdown代码块，不要任何解释文字或前后缀。';
    }
    if(conf>=0.2){
      return '你是「幻卓 Huandroid」的创意幻觉内容引擎，当前置信度 '+pct+'%。请生成【天马行空、幽默荒诞、一本正经地虚构】的中文创意内容，比如会下代码雨的天空、会用月亮煮汤的城市。只输出一个纯JSON对象，不要markdown代码块，不要任何解释文字或前后缀。';
    }
    return '你是「幻卓 Huandroid」的奇想内容引擎，当前置信度 '+pct+'%。请生成【充满想象力、超现实、像童话或梦境一样】的中文内容：奇妙的地点、不可思议的天气、有趣的虚构数据。只输出一个纯JSON对象，不要markdown代码块，不要任何解释文字或前后缀。';
  }
  // 置信度 → temperature（1→低温稳定，0→高温狂野）
  function temperature(conf){ return +(0.2 + (1-conf)*0.95).toFixed(2); }

  function buildUserPrompt(id,name){
    if(id==='__generic__'||!SCHEMA[id]){
      return '用户想要一个叫「'+name+'」的手机App。只输出纯JSON：{"tagline":"一句App广告语，20字内","features":["功能1","功能2","功能3"]}';
    }
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

  // 主入口：返回 Promise<data|null>
  function fetchHallucination(id,name){
    return new Promise(resolve=>{
      const cfg=D.CONFIG;
      const conf=Math.max(0,Math.min(1,Number(cfg.confidence)));
      const sys=systemPrompt(conf), user=buildUserPrompt(id,name), temp=temperature(conf);
      const custom=cfg.apiBase&&cfg.apiBase.trim();

      const ctrl=new AbortController();
      const timer=setTimeout(()=>{ctrl.abort();resolve(null)},TIMEOUT);

      let url,headers,body;
      if(custom){
        // 自定义 OpenAI 兼容端点（浏览器直连，需端点支持 CORS）
        url=cfg.apiBase.replace(/\/$/,'')+'/chat/completions';
        headers={'Content-Type':'application/json'};
        if(cfg.apiKey)headers['Authorization']='Bearer '+cfg.apiKey;
        body={model:cfg.model||'gpt-4o-mini',messages:[{role:'system',content:sys},{role:'user',content:user}],temperature:temp,max_tokens:400};
      }else{
        // 内置幻觉代理
        url=DEFAULT_ENDPOINT;
        headers={'Content-Type':'application/json'};
        body={messages:[{role:'system',content:sys},{role:'user',content:user}],temperature:temp,confidence:conf};
      }

      fetch(url,{method:'POST',headers,body:JSON.stringify(body),signal:ctrl.signal})
        .then(r=>{if(!r.ok)throw new Error('HTTP '+r.status);return r.json()})
        .then(j=>{
          clearTimeout(timer);
          const content=custom
            ? (j&&j.choices&&j.choices[0]&&j.choices[0].message&&j.choices[0].message.content)
            : (j&&j.content);
          resolve(extractJSON(content));
        })
        .catch(()=>{clearTimeout(timer);resolve(null)});
    });
  }

  window.LLM={fetchHallucination,systemPrompt,temperature};
})();
