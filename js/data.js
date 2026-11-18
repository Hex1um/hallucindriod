/* ============ 幻卓 Huandroid · 数据 ============
 * 应用注册表（拟真图标）+ 词库。幻觉内容的核心素材。
 */

// ---------- 拟真 App 图标：品牌色圆角底 + 白色 SVG 符号 ----------
let _iconSeq=0;
function svgIcon(bg, path, extra){
  const gid='g'+(++_iconSeq); // 每个图标唯一渐变 id，避免 SVG 内联时相互覆盖
  return '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">'
    +'<defs><linearGradient id="'+gid+'" x1="0" y1="0" x2="1" y2="1">'
    +'<stop offset="0" stop-color="'+bg[0]+'"/><stop offset="1" stop-color="'+bg[1]+'"/>'
    +'</linearGradient></defs>'
    +'<rect x="0" y="0" width="64" height="64" rx="15" fill="url(#'+gid+')"/>'
    +(extra||'')+path+'</svg>';
}
const W='fill="#fff"';
const ICONS={
  calculator: svgIcon(['#ffb340','#ff7a18'],'<g '+W+'><rect x="16" y="10" width="32" height="44" rx="6"/><rect x="20" y="14" width="24" height="10" rx="2" fill="#ffe0b3"/><circle cx="23" cy="31" r="3.2" fill="#ff7a18"/><circle cx="32" cy="31" r="3.2" fill="#ff7a18"/><circle cx="41" cy="31" r="3.2" fill="#ff7a18"/><circle cx="23" cy="40" r="3.2" fill="#ff7a18"/><circle cx="32" cy="40" r="3.2" fill="#ff7a18"/><circle cx="41" cy="40" r="3.2" fill="#ff7a18"/></g>'),
  weather: svgIcon(['#5ec8ff','#1a73e8'],'<g '+W+'><circle cx="41" cy="23" r="9" fill="#ffe08a"/><path d="M20 42a9 9 0 0 1 9-9 11 11 0 0 1 20 4 7 7 0 0 1-2 13H22a7 7 0 0 1-2-8z"/></g>'),
  album: svgIcon(['#ff8fb1','#c44df0'],'<g '+W+'><ellipse cx="32" cy="25" rx="8" ry="15"/><ellipse cx="32" cy="25" rx="8" ry="15" transform="rotate(60 32 25)"/><ellipse cx="32" cy="25" rx="8" ry="15" transform="rotate(120 32 25)"/></g>'),
  notes: svgIcon(['#ffd76a','#ff9f1a'],'<g '+W+'><rect x="15" y="11" width="34" height="42" rx="5"/><rect x="21" y="21" width="22" height="2.6" rx="1.3" fill="#ff9f1a"/><rect x="21" y="29" width="22" height="2.6" rx="1.3" fill="#ff9f1a"/><rect x="21" y="37" width="16" height="2.6" rx="1.3" fill="#ff9f1a"/></g>'),
  clock: svgIcon(['#4b5563','#111827'],'<g '+W+'><circle cx="32" cy="32" r="21" fill="none" stroke="#fff" stroke-width="4"/><path d="M32 18v15l10 6" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/></g>'),
  music: svgIcon(['#ff6b6b','#c2185b'],'<g '+W+'><path d="M40 14v24a7 7 0 1 1-4-6V20l-14 3v20a7 7 0 1 1-4-6V19z"/></g>'),
  map: svgIcon(['#4ade80','#0f9d58'],'<g '+W+'><path d="M32 10a12 12 0 0 0-12 12c0 9 12 22 12 22s12-13 12-22A12 12 0 0 0 32 10zm0 17a5 5 0 1 1 0-10 5 5 0 0 1 0 10z"/></g>'),
  store: svgIcon(['#ff9a44','#f4511e'],'<g '+W+'><path d="M16 26h32l-3 24H19z"/><path d="M24 26v-4a8 8 0 0 1 16 0v4" fill="none" stroke="#fff" stroke-width="3.5"/><rect x="27" y="34" width="10" height="8" rx="2" fill="#f4511e"/></g>'),
  browser: svgIcon(['#48c6ef','#1a73e8'],'<g '+W+'><circle cx="32" cy="32" r="20" fill="none" stroke="#fff" stroke-width="3.5"/><ellipse cx="32" cy="32" rx="8" ry="20" fill="none" stroke="#fff" stroke-width="2.6"/><path d="M13 32h38" stroke="#fff" stroke-width="3"/></g>'),
  camera: svgIcon(['#9aa4b2','#3b4452'],'<g '+W+'><rect x="11" y="19" width="42" height="30" rx="6"/><path d="M22 19l4-6h12l4 6"/><circle cx="32" cy="34" r="10" fill="#3b4452"/><circle cx="32" cy="34" r="6.5" fill="#cdd4de"/></g>'),
  messages: svgIcon(['#5ce36b','#16a34a'],'<g '+W+'><path d="M32 13c-12 0-21 7-21 17 0 5 3 10 8 13l-2 8 9-5c2 .4 4 .6 6 .6 12 0 21-7 21-17S44 13 32 13z"/></g>'),
  fish: svgIcon(['#2dd4bf','#0d9488'],'<g '+W+'><path d="M14 32c8-11 22-13 32-4l6-6v20l-6-6C36 43 22 41 14 32z"/><circle cx="24" cy="30" r="2.4" fill="#0d9488"/></g>'),
  game: svgIcon(['#ff6b81','#c2185b'],'<g '+W+'><path d="M20 24h24a10 10 0 0 1 10 11 8 8 0 0 1-14 6l-2-3H26l-2 3a8 8 0 0 1-14-6 10 10 0 0 1 10-11z"/><rect x="18" y="32" width="10" height="3.4" rx="1.7" fill="#c2185b"/><rect x="21.5" y="28.5" width="3.4" height="10" rx="1.7" fill="#c2185b"/><circle cx="42" cy="31" r="2.6" fill="#c2185b"/><circle cx="46" cy="36" r="2.6" fill="#c2185b"/></g>'),
  phone: svgIcon(['#5ce36b','#128c3e'],'<g '+W+'><path d="M20 12l-6 3c-3 1.5-3 5-1 9 3 7 9 15 17 21 4 3 8 3 9 0l3-6-10-7-5 5c-5-3-9-7-12-12l5-5z"/></g>'),
  health: svgIcon(['#ff6b6b','#d32f2f'],'<g '+W+'><path d="M32 50S12 38 12 25a11 11 0 0 1 20-6 11 11 0 0 1 20 6c0 13-20 25-20 25z"/><path d="M18 32h8l3-7 4 14 3-7h10" fill="none" stroke="#d32f2f" stroke-width="2.6" stroke-linejoin="round"/></g>'),
  settings: svgIcon(['#9aa4b2','#4b5563'],'<g '+W+'><path d="M32 20a12 12 0 1 0 0 24 12 12 0 0 0 0-24zm0 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8z"/><path d="M29 8h6l1 6 4 2 5-3 4 4-3 5 2 4 6 1v6l-6 1-2 4 3 5-4 4-5-3-4 2-1 6h-6l-1-6-4-2-5 3-4-4 3-5-2-4-6-1v-6l6-1 2-4-3-5 4-4 5 3 4-2z" opacity=".55"/></g>'),
  terminal: svgIcon(['#8b5cf6','#5b21b6'],'<g '+W+'><path d="M18 16h28a7 7 0 0 1 7 7v13a7 7 0 0 1-7 7H32l-11 7v-7h-3a7 7 0 0 1-7-7V23a7 7 0 0 1 7-7z"/><path d="M32 23l2.4 6.6L41 32l-6.6 2.4L32 41l-2.4-6.6L23 32l6.6-2.4z" fill="#5b21b6"/></g>'),
  delivery: svgIcon(['#fbbf24','#f59e0b'],'<g '+W+'><path d="M16 24h32l-3 26a4 4 0 0 1-4 4H23a4 4 0 0 1-4-4z"/><path d="M24 25v-6a8 8 0 0 1 16 0v6" fill="none" stroke="#fff" stroke-width="3.6"/><circle cx="26" cy="35" r="2.6" fill="#f59e0b"/><circle cx="38" cy="35" r="2.6" fill="#f59e0b"/><path d="M26 43h12" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/></g>'),
  video: svgIcon(['#ff4d8d','#c026d3'],'<g '+W+'><rect x="11" y="12" width="42" height="40" rx="9"/><path d="M28 22l14 10-14 10z" fill="#c026d3"/></g>'),
};

// 内置应用（拟真图标 / 名称 / 品牌渐变 / 搜索关键词）
const APPS = [
  { id:'calculator', name:'计算器',   icon:'🧮', grad:['#ffb340','#ff7a18'], kw:'计算 算数 数学 加减乘除' },
  { id:'weather',    name:'天气',     icon:'⛅', grad:['#5ec8ff','#1a73e8'], kw:'天气 气温 预报 下雨' },
  { id:'album',      name:'相册',     icon:'🖼️', grad:['#ff8fb1','#c44df0'], kw:'相册 照片 图片 图库' },
  { id:'music',      name:'音乐',     icon:'🎵', grad:['#ff6b6b','#c2185b'], kw:'音乐 歌曲 播放器 听歌' },
  { id:'video',      name:'短视频',   icon:'▶️', grad:['#ff4d8d','#c026d3'], kw:'短视频 视频 刷视频 抖音 快手 直播' },
  { id:'map',        name:'地图',     icon:'🗺️', grad:['#4ade80','#0f9d58'], kw:'地图 导航 定位 路线' },
  { id:'delivery',   name:'袋鼠外卖', icon:'🦘', grad:['#fbbf24','#f59e0b'], kw:'外卖 点餐 送餐 美食 袋鼠 吃饭 饿了' },
  { id:'store',      name:'应用商店', icon:'🛍️', grad:['#ff9a44','#f4511e'], kw:'商店 市场 下载 安装' },
  { id:'browser',    name:'浏览器',   icon:'🌐', grad:['#48c6ef','#1a73e8'], kw:'浏览器 上网 网页 搜索' },
  { id:'camera',     name:'相机',     icon:'📷', grad:['#9aa4b2','#3b4452'], kw:'相机 拍照 摄影 照片' },
  { id:'messages',   name:'短信',     icon:'💬', grad:['#5ce36b','#16a34a'], kw:'短信 消息 聊天 对话' },
  { id:'phone',      name:'电话',     icon:'📞', grad:['#5ce36b','#128c3e'], kw:'电话 拨号 通话' },
  { id:'settings',   name:'设置',     icon:'⚙️', grad:['#9aa4b2','#4b5563'], kw:'设置 系统 关于 配置' },
  { id:'terminal',   name:'智能终端', icon:'✦', grad:['#8b5cf6','#5b21b6'], kw:'智能终端 AI 助手 语音 助理 自动 执行 豆包' },
];
APPS.forEach(a=>{ a.svg=ICONS[a.id]; });

const DOCK_IDS = ['phone','browser','camera','messages','store'];

// 桌面文件夹（默认不展示任何文件夹）
const FOLDERS = [];

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
  contacts:['妈妈','老板','外卖小哥','10086','未知号码','前任','房东','快递柜','语音助手','另一个我','客服小王','时间管理大师'],
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
  // 真实安卓风格的系统提示（不再自曝"现编/幻觉"）
  toastTips:['已同步最新数据','应用已更新到最新版本','网络连接正常','存储空间充足','正在后台优化应用','系统运行流畅']
};

// 随机工具
const rnd = n => Math.floor(Math.random()*n);
const pick = arr => arr[rnd(arr.length)];
const pickN = (arr,n) => arr.slice().sort(()=>Math.random()-.5).slice(0,n);
const chance = p => Math.random() < p;
const randInt = (a,b) => a + Math.floor(Math.random()*(b-a+1));

function neonPalette(){
  const hues = [265,200,320,160,25,340,230,90];
  const h = pick(hues);
  return { a:`hsl(${h} 85% 62%)`, b:`hsl(${(h+40)%360} 85% 55%)`, bg:`hsl(${h} 45% 10%)` };
}

// 中文农历（用系统 Intl，失败时留空）
function lunarDate(d){
  try{
    return new Intl.DateTimeFormat('zh-CN-u-ca-chinese',{month:'long',day:'numeric'}).format(d||new Date());
  }catch(e){ return ''; }
}

// ---------- 系统配置：API + 置信度 ----------
const DEFAULT_CONFIG = {
  apiBase: '',
  apiKey: '',
  model: 'openai-fast',
  confidence: 0.35
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

window.OS_DATA = { APPS, DOCK_IDS, FOLDERS, WORDS, rnd, pick, pickN, chance, randInt, neonPalette, lunarDate, CONFIG, loadConfig, saveConfig, DEFAULT_CONFIG };
