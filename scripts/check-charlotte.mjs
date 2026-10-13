import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { parseArgs, parseEnv } from 'node:util';

const { values } = parseArgs({
  options: {
    keyword: { type: 'string' },
    'searchgal-url': { type: 'string', default: 'http://127.0.0.1:8787' },
  },
});
const localEnv = existsSync('.dev.vars') ? parseEnv(readFileSync('.dev.vars', 'utf8')) : {};
const baseUrl = process.env.CHARLOTTE_BASE_URL || localEnv.CHARLOTTE_BASE_URL;
const apiKey = process.env.CHARLOTTE_API_KEY || localEnv.CHARLOTTE_API_KEY;
const keyword = values.keyword?.trim();

async function request(url, options = {}) {
  return fetch(url, { ...options, redirect: 'manual', signal: AbortSignal.timeout(30000) });
}

async function check() {
  assert.ok(baseUrl && apiKey, '请在 .dev.vars 或环境变量中配置 CHARLOTTE_BASE_URL 和 CHARLOTTE_API_KEY');
  assert.ok(keyword, '请用 --keyword 指定 Charlotte 中已知有资源的游戏名称');
  const endpoint = new URL('/api/integration/search', baseUrl);
  endpoint.search = new URLSearchParams({ q: keyword, limit: '12' });
  const headers = { 'X-API-Key': apiKey, Accept: 'application/json' };

  const started = Date.now();
  const direct = await request(endpoint, { headers });
  assert.equal(direct.status, 200, `Charlotte 直连接口 HTTP ${direct.status}；检查启动状态、专用密钥和服务端日志`);
  assert.match(direct.headers.get('cache-control') || '', /no-store/);
  const data = await direct.json();
  assert.ok(Array.isArray(data.items), 'Charlotte 响应缺少 items 数组');
  assert.ok(data.items.length > 0, '直连成功但没有结果，不能证明游戏搜索链路可用；请换一个有合格资源的游戏名，并检查 NSFW 配置');
  const expected = data.items.map(item => {
    assert.ok(Number.isSafeInteger(item.id) && item.id > 0);
    assert.equal(item.path, `/games/${item.id}`);
    assert.equal(typeof item.title, 'string');
    assert.equal(typeof item.isNsfw, 'boolean');
    assert.deepEqual(Object.keys(item).sort(), ['id', 'isNsfw', 'path', 'title']);
    return { name: item.title.trim(), url: new URL(item.path, baseUrl).href };
  });
  console.log(`PASS Charlotte 直连：${data.items.length} 条结果，${Date.now() - started} ms`);

  assert.equal((await request(endpoint)).status, 401, '缺少密钥应返回 401');
  assert.equal((await request(endpoint, { headers: { ...headers, 'X-API-Key': 'invalid-connectivity-test-key' } })).status, 401, '错误密钥应返回 401');
  const invalid = new URL(endpoint);
  invalid.searchParams.set('q', ' ');
  assert.equal((await request(invalid, { headers })).status, 400, '空关键词应返回 400');
  console.log('PASS 缺少密钥/错误密钥返回 401，空关键词返回 400');

  const searchStarted = Date.now();
  const aggregate = await request(new URL('/gal', values['searchgal-url']), {
    method: 'POST', body: new URLSearchParams({ game: keyword }),
  });
  assert.equal(aggregate.status, 200, `SearchGal HTTP ${aggregate.status}`);
  const body = await aggregate.text();
  assert.ok(!body.includes(apiKey), 'SearchGal 响应意外包含密钥');
  const events = body.split(/\r?\n/).filter(Boolean).map(line => JSON.parse(line));
  assert.equal(events.at(-1)?.done, true, 'SearchGal 流未正常完成');
  const source = events.find(event => event.result?.name === 'Charlotte')?.result;
  assert.ok(source, 'SearchGal 没有 Charlotte 结果；检查是否运行新代码、.dev.vars 是否加载、是否与直连使用相同配置');
  assert.ok(!source.error, source.error || 'Charlotte 搜索源错误');
  assert.deepEqual(source.tags, ['Login']);
  assert.deepEqual(source.items, expected, '聚合结果与 Charlotte 直连结果不一致');
  console.log(`PASS SearchGal → Charlotte → PostgreSQL → 流式结果：${Date.now() - searchStarted} ms`);
  console.log(JSON.stringify({ keyword, result: source }, null, 2));
  const otherFailures = events.filter(event => event.result?.error && event.result.name !== 'Charlotte').length;
  if (otherFailures) console.log(`提示：另有 ${otherFailures} 个外部搜索源报错，不属于 Charlotte 接口。`);
}

check().catch(error => {
  const message = String(error.message || error);
  console.error(`FAIL ${apiKey ? message.split(apiKey).join('[REDACTED]') : message}`);
  process.exitCode = 1;
});
