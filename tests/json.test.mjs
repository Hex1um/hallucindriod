/**
 * tests/json.test.mjs —— repairJSON / extractJSON 单元测试
 *
 * 运行：node tests/json.test.mjs
 * 说明：这两个函数在 js/llm.js 的闭包里，测试时把源码切片后装进 vm 执行。
 */
import fs from 'node:fs';
import vm from 'node:vm';

const src = fs.readFileSync(new URL('../js/llm.js', import.meta.url), 'utf8');
const a = src.indexOf('function repairJSON');
const b = src.indexOf('// ---------- 各数据源实现');
if (a < 0 || b < 0) {
  console.error('无法从 js/llm.js 定位 repairJSON');
  process.exit(1);
}
const extractJSON = new Function(src.slice(a, b) + '; return extractJSON;')();

let pass = 0, fail = 0;
function check(name, input, expect) {
  const got = extractJSON(input);
  const ok = JSON.stringify(got) === JSON.stringify(expect);
  if (ok) { pass++; }
  else { fail++; console.log('✗', name, '\n  期望:', JSON.stringify(expect), '\n  实际:', JSON.stringify(got)); }
  if (ok) console.log('✓', name);
}

check('完整 JSON', '{"a":1}', { a: 1 });
check('尾随逗号', '{"a":1,}', { a: 1 });
check('缺右括号', '{"a":1', { a: 1 });
check('深层截断', '{"apps":[{"name":"A","desc":"x"},{"name":"B"', { apps: [{ name: 'A', desc: 'x' }] });
check('字符串未闭合', '{"a":"ok","b":"断在这里', { a: 'ok' });
check('数组截断', '{"v":[{"t":1},{"t":2},{"t"', { v: [{ t: 1 }, { t: 2 }] });
check('markdown 包裹', '```json\n{"a":1}\n```', { a: 1 });
check('前后赘述', '结果如下：{"a":1} 完', { a: 1 });
check('非 JSON', '抱歉我做不到', null);
check('嵌套数组', '[{"a":1}]'.replace(/^\[/, '{"list":[').replace(/\]$/, ']}'), { list: [{ a: 1 }] });

console.log(`\n${pass} 通过 / ${fail} 失败`);
process.exit(fail ? 1 : 0);
