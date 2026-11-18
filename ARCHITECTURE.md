# 架构说明

## 分层

```
index.html            外壳：状态栏 / 桌面 / 抽屉 / 控制中心 / 锁屏 / 应用层 iframe
css/style.css         外壳样式
js/data.js            应用注册表、SVG 图标、词库、CONFIG、escHTML / safeText
js/apps.js            应用生成器（一）
js/apps2.js           应用生成器（二）+ shell() 外壳模板
js/llm.js             LLM 层：多源竞速 → fallback → JSON 容错
js/p2p.js             P2P 联机：PeerJS 信令 + WebRTC DataChannel
js/engine.js          现编引擎：缓存 / 预热 / 预取 / 消息总线 / 终端 / 社交
js/main.js            桌面渲染 / 拖拽编辑 / 图标 / 音频桥 / 本地存储
vendor/peerjs.min.js  PeerJS 运行时（按需加载）
dev-proxy.mjs         本地开发用 LLM 反向代理
tests/json.test.mjs   repairJSON / extractJSON 单测
```

## 应用是怎么被"造"出来的

1. `openApp(id, name)`
2. 并行：打印代码瀑布动画 + `preload(id)` 请求 LLM（走缓存）
3. 等待上限：内置应用 3.5s / 商店自装应用 0.9s，超时先用本地内容渲染
4. `APP_BUILDERS[id]`（或 `improviseGeneric`）在**父窗口**生成完整 HTML 字符串
5. 注入 `window.__LLM`（LLM 数据）、`window.__CFG`（**非敏感**配置）
6. 写入 `frame.srcdoc`，沙箱 iframe 渲染

## 缓存策略

| 缓存 | 内容 | 生命周期 |
|---|---|---|
| `dataCache` | LLM 返回的数据（按应用 id） | 内存，`refresh` / `regen` 清除 |
| `viewCache` | 上次渲染的完整文档 | 内存，退出应用时保存 |
| `webState` | 浏览器上次访问的网页 | **localStorage 持久化** |
| `pending` | 正在进行的请求（去重） | 请求完成即删 |

- `warmup()`：页面空闲时串行预热 **Dock 应用**（不再预热全部，避免打爆免费端点）
- `prefetchRelated(id)`：打开 A 后并行预取关联应用（两两并发 + 去重）

## postMessage 协议

iframe → 父窗口。所有消息都会校验 `e.source === frame.contentWindow`，
并且**特权指令只允许对应应用发送**（`PRIV_OWNER` 白名单）。

| type | 发送方 | 特权 | 作用 |
|---|---|---|---|
| `close` | 任意应用 | 否 | 关闭当前应用 |
| `config` | settings | **是** | 改写配置（apiKey 缺省时保留原值） |
| `refresh` | settings | **是** | 刷新指定/全部应用数据 |
| `restoreApps` | settings | **是** | 恢复被移除的桌面应用 |
| `install` | store | **是** | 安装应用并持久化 |
| `storegen` | store | **是** | 请求生成商店搜索结果 |
| `webgen` / `websearch` / `webstate` | browser | **是** | 生成网页 / 搜索 / 保存网页状态 |
| `termgen` | terminal | **是** | 终端意图解析 |
| `musicsearch` | music | **是** | 搜索歌单 |
| `tone` | music | **是** | 请求父窗口发声 |
| `social:*` | messages | **是** | 注册 / 保存 / 探测 / 加好友 / 回复 |

外部站点（`__external__`）只允许 `close`。

父窗口 → iframe：`webdata` / `storedata` / `musicdata` / `social:profile` /
`social:probed` / `social:friend` / `social:reply`。

## 安全模型

- **LLM 输出视为不可信输入**：所有字段拼进 `innerHTML` 前必须过 `escHTML()`；
  `shell()` 会把 js 中的 `</script` 转义，防止提前闭合脚本标签。
- **apiKey 不下发**：iframe 里只有 `{confidence, model, apiBase, hasKey}`；
  设置页只显示"已配置/未配置"，保存时回传新值，不会回显旧 Key。
- **最小权限**：见上表 `PRIV_OWNER`，普通应用即使被注入脚本也改不了系统状态。
- **沙箱**：应用 iframe `allow-scripts allow-forms allow-modals allow-popups`
  （无 `allow-same-origin`）；外部站点单独放宽并只允许 `close`。

## 本地存储

| Key | 内容 |
|---|---|
| `hallucindriod_social_v1` | 个人资料 + 好友/群聊（每会话最多 50 条消息） |
| `hallucindriod_installed_v1` | 商店安装的应用 |
| `hallucindriod_layout_v1` | 桌面图标顺序 / 隐藏列表 |
| `hallucindriod_webstate_v1` | 浏览器上次访问的网页 |
| `huanji_config` | LLM 配置（含 apiKey，仅存本机） |
