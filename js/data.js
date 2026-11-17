/* ============ 幻卓 Huandroid · 数据 ============
 * 词库 + 应用注册表。幻觉内容的核心素材。
 * 每次生成都从这里随机取样，保证「永不重样」。
 */

// 内置应用（图标 / 名称 / 渐变 / 搜索关键词）
const APPS = [
  { id:'calculator', name:'计算器',   icon:'🧮', grad:['#f59e0b','#ea580c'], kw:'计算 算数 数学 加减乘除' },
  { id:'weather',    name:'天气',     icon:'⛅', grad:['#0ea5e9','#2563eb'], kw:'天气 气温 预报 下雨' },
  { id:'album',      name:'相册',     icon:'🖼️', grad:['#ec4899','#8b5cf6'], kw:'相册 照片 图片 图库' },
  { id:'notes',      name:'便签',     icon:'📝', grad:['#eab308','#f97316'], kw:'便签 笔记 备忘 日记 记录' },
  { id:'clock',      name:'时钟',     icon:'🕐', grad:['#334155','#0f172a'], kw:'时钟 闹钟 秒表 计时' },
  { id:'music',      name:'音乐',     icon:'🎵', grad:['#8b5cf6','#d946ef'], kw:'音乐 歌曲 播放器 听歌' },
  { id:'map',        name:'地图',     icon:'🗺️', grad:['#10b981','#059669'], kw:'地图 导航 定位 路线' },
  { id:'store',      name:'应用商店', icon:'🛍️', grad:['#3b82f6','#6366f1'], kw:'商店 市场 下载 安装' },
  { id:'browser',    name:'浏览器',   icon:'🌐', grad:['#06b6d4','#3b82f6'], kw:'浏览器 上网 网页 搜索' },
  { id:'camera',     name:'相机',     icon:'📷', grad:['#64748b','#334155'], kw:'相机 拍照 摄影 照片' },
  { id:'messages',   name:'短信',     icon:'💬', grad:['#22c55e','#16a34a'], kw:'短信 消息 聊天 微信 对话' },
  { id:'fish',       name:'摸鱼检测', icon:'🐟', grad:['#14b8a6','#0d9488'], kw:'摸鱼 检测 划水 检测 游戏' },
  { id:'game',       name:'小游戏',   icon:'🎮', grad:['#f43f5e','#be123c'], kw:'游戏 俄罗斯方块 贪吃蛇 玩' },
  { id:'phone',      name:'电话',     icon:'📞', grad:['#22c55e','#15803d'], kw:'电话 拨号 通话 打电话' },
  { id:'health',     name:'健康',     icon:'❤️', grad:['#ef4444','#dc2626'], kw:'健康 步数 运动 心率 睡眠' },
  { id:'settings',   name:'设置',     icon:'⚙️', grad:['#6b7280','#374151'], kw:'设置 系统 关于 配置' },
];

const DOCK_IDS = ['phone','browser','camera','store'];

// ---------- 幻觉词库 ----------
const WORDS = {
  cities:['北京','上海','广州','深圳','杭州','成都','武汉','西安','南京','重庆','长沙','厦门','青岛','大连','苏州','天津',
          '二维数组市','递归镇','量子路','缓存区','未定义县','赛博浦东','褶皱空间站','π区','404谷','熵增街','神经元市'],
  weather:['晴','多云','阴','小雨','中雨','雷阵雨','局部有代码雨','雾霾','彩虹','冰雹','流星雨','重力异常','晴间多云','随机',
           '/data/ 丢失','系统过载','太阳耀斑','薛定谔的晴'],
  weatherEmoji:['☀️','⛅','☁️','🌧️','⛈️','🌦️','🌈','🌫️','❄️','🌠','🔥','🌀','🛰️','🤯'],
  adjectives:['量子','赛博','递归','混沌','温柔','硬核','薛定谔','沉浸式','断裂','平行','失重','超频','复古','野生','工业','玄学'],
  nouns:['猫','咖啡','晚风','信号','代码','黄昏','宇宙','地铁','雨天','空调','泡泡','信封','星星','键盘','月亮','柠檬'],
  songs:['《编译通过之恋》','《凌晨三点的段错误》','《递归的尽头是你》','《缓存清理之后》','《404 Not Found》','《异步的心动》',
         '《内存泄漏的夏天》','《葛优躺进行曲》','《老板键之歌》','《最后一根线程》','《在 bug 里遇见你》','《量子纠缠双人舞》'],
  artists:['幻觉乐团','AI 生成乐队','Unexpected Result','اسطة','凌晨四点','无名歌手','神经网络合唱团','本地循环'],
  photoCaptions:['周末的量子猫','窗外的第二次日落','一张不敢相信的照片','此刻 vs 三秒后','模糊但自信','重力失效的清晨',
                 '疑似外星建筑的阳台','梦里的海','像素级黄昏','不知道在哪但很美'],
  landmarks:['符号学广场','未定义街区','递归环路','缓存塔','薛定谔公园','404 号公路','熵增湖','量子立交桥','虚构新区','对象体育馆'],
  contacts:['妈妈','老板','外卖小哥','10086','未知号码','前任','房东','快递柜','Siri','另一个我','客服小王','时间管理大师'],
  messages:['在吗？','记得吃药','你的快递到了','下班了吗','这个 bug 你看看','中午吃什么','别摸鱼了','我梦到你了','已读不回是吧',
            '工资到账了（幻觉）','今晚有空吗','你中奖了，点链接领取','月亮很好看','账户余额：-1','系统需要重启'],
  noteOpeners:['今天我决定','凌晨两点，我突然想到','写给孩子的话：','待办清单：','一个大胆的想法：','如果可以重来，我想',
               '刚刚 AI 悄悄告诉我','今天也是元气满满的一天，除了','我怀疑','给未来的自己：'],
  noteEndings:['—— 但我可能在做梦。','（已幻觉处理）','愿模型保佑。','反正明天再说。','这条便签由 AI 代写，本人不负责。','以上均由幻觉生成。'],
  appIdeas:['电子木鱼','摸鱼检测器 Pro','反内联战争','赛博算命','AI 哄睡','今日发疯生成器','电子 pets','加班模拟器','量子记账',
            '发呆计时器','老板来了','朋友圈人设生成器','AI 吵架教练','电子转锦鲤','睡前故事机','反向闹钟'],
  storeDesc:['采用了最先进的幻觉技术','上线三天，评分 4.9（编的）','无需联网，纯靠想象','唯一一款会自我怀疑的应用','下载量已突破一个亿（大概）',
             '获得了 2026 年度虚构奖','体积 0KB，功能无限','内置 AI，偶尔认真'],
  systemVer:['1.0.0-beta-从未测试','3.7.9-幻觉版','0.0.1+seed','4.2.0-nightly','∞.0','2026.11.17-临时编译'],
  toastTips:['应用是现编的，别太认真','本次生成未消耗真实算力','已在沙箱中运行，请放心胡闹','幻觉引擎状态：过度自信',
             '提示：再点一次会编出另一个版本','数据仅存在于本次幻觉中'],
};

// 随机工具
const rnd = n => Math.floor(Math.random()*n);
const pick = arr => arr[rnd(arr.length)];
const pickN = (arr,n) => arr.slice().sort(()=>Math.random()-.5).slice(0,n);
const chance = p => Math.random() < p;
const randInt = (a,b) => a + Math.floor(Math.random()*(b-a+1));

// 生成一个奇怪但可用的配色
function neonPalette(){
  const hues = [265,200,320,160,25,340,230,90];
  const h = pick(hues);
  return { a:`hsl(${h} 85% 62%)`, b:`hsl(${(h+40)%360} 85% 55%)`, bg:`hsl(${h} 45% 10%)` };
}

// ---------- 系统配置：API + 置信度 ----------
// 置信度 confidence ∈ [0,1]：
//   → 1  LLM temperature 低、提示词要求"贴近真实世界" → 内容更正常
//   → 0  LLM temperature 高、提示词要求"极度荒诞混乱" → 内容更离谱
// 配置存 localStorage，跨会话保留。
const DEFAULT_CONFIG = {
  apiBase: '',      // 自定义 OpenAI 兼容端点，留空用内置幻觉代理
  apiKey: '',       // 自定义端点密钥（留空则匿名）
  model: 'openai-fast',
  confidence: 0.35  // 默认偏"幻觉"一点，符合主题
};
function loadConfig(){
  let saved={};
  try{ saved=JSON.parse(localStorage.getItem('huanji_config')||'{}')||{}; }catch(e){}
  return Object.assign({},DEFAULT_CONFIG,saved);
}
function saveConfig(cfg){
  try{ localStorage.setItem('huanji_config',JSON.stringify(cfg)); }catch(e){}
}
const CONFIG = loadConfig();

window.OS_DATA = { APPS, DOCK_IDS, WORDS, rnd, pick, pickN, chance, randInt, neonPalette, CONFIG, loadConfig, saveConfig, DEFAULT_CONFIG };
