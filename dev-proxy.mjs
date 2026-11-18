/**
 * dev-proxy.mjs —— 本地开发用的极简 LLM 反向代理
 *
 * 作用：Pollinations 对 localhost 来源会触发人机验证（Turnstile），
 *      导致本地调试时主源失效。用这个代理把请求转发过去，Origin 变成服务端请求。
 *
 * 用法：
 *   node dev-proxy.mjs          # 启动在 http://localhost:8787
 *   另开终端：python -m http.server 8080
 *   浏览器打开 http://localhost:8080/  （页面会自动把 /api 指向 8787）
 *
 * 说明：只在 location.hostname 是 localhost/127.0.0.1 时启用，线上不受影响。
 */
import http from 'node:http';

const PORT = Number(process.env.PORT || 8787);
const TARGET = 'https://text.pollinations.ai';

http.createServer(async (req, res) => {
  // 允许本地页面跨域调用
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const path = req.url.replace(/^\/api/, '');
  const url = TARGET + path;

  const chunks = [];
  for await (const c of req) chunks.push(c);
  const body = chunks.length ? Buffer.concat(chunks) : undefined;

  try {
    const upstream = await fetch(url, {
      method: req.method,
      headers: { 'Content-Type': 'application/json' },
      body: req.method === 'GET' ? undefined : body,
    });
    res.writeHead(upstream.status, {
      'Content-Type': upstream.headers.get('content-type') || 'application/json',
    });
    res.end(Buffer.from(await upstream.arrayBuffer()));
  } catch (e) {
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: String(e && e.message || e) }));
  }
}).listen(PORT, '127.0.0.1', () => {
  console.log('LLM 代理已启动 → http://localhost:' + PORT + '/api/openai');
  console.log('现在用 http://localhost 打开页面，LLM 会走这个代理。');
});
