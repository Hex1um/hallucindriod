# 幻卓 Huandroid

> 一台靠幻觉现编应用的安卓手机 —— 纯前端、零构建的交互演示。

搜一个不存在的应用，它会「现场现编」一个出来；每次打开都不一样，关掉即忘。

## 运行

纯静态站点，无需构建：

```bash
# 直接双击 index.html，或起一个静态服务器
python -m http.server 8080
```

打开 <http://localhost:8080> 即可。

## 结构

```
index.html        页面结构（桌面 / 抽屉 / 控制中心 / 锁屏 / 生成层）
css/style.css     样式
js/data.js        应用数据、Dock、词库
js/apps.js        幻觉应用生成器（一）
js/apps2.js       幻觉应用生成器（二）
js/llm.js         Pollinations.ai 免费 LLM 幻觉层
js/engine.js      现编引擎
js/main.js        主程序
```

## 说明

- 零依赖、零构建，全部为原生 HTML / CSS / JavaScript。
- AI 现编能力通过 `js/llm.js` 调用免费 LLM 接口；无网络时回退到内置幻觉引擎。
- 生成内容仅存于本次会话，不做持久化。

## 在线预览

<https://hex1um.github.io/huandroid/>
