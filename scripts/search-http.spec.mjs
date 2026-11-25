import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createServer } from 'node:http';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { test } from 'vitest';
import { PLATFORMS_GAL, PLATFORMS_PATCH } from '../src/core.ts';
import worker from '../src/index.ts';
import vercelGal from '../api/gal.ts';
import vercelPatch from '../api/patch.ts';
import * as netlifyGal from '../netlify/functions/gal.ts';
import * as netlifyPatch from '../netlify/functions/patch.ts';

const origin = 'https://example.invalid';
const fixtureUrl = 'https://fixture.invalid';

function source(name, search) {
  return { name, color: 'white', tags: [], magic: false, search };
}

async function withPlatforms(platforms, fixtures, run) {
  const original = platforms.splice(0, platforms.length, ...fixtures);
  try {
    await run();
  } finally {
    platforms.splice(0, platforms.length, ...original);
  }
}

async function withHttpServer(handler, run) {
  const server = createServer(async (incoming, outgoing) => {
    try {
      const response = await handler(new Request(origin + incoming.url, {
        method: incoming.method,
        headers: incoming.headers,
        body: Readable.toWeb(incoming),
        duplex: 'half',
      }));
      outgoing.writeHead(response.status, Object.fromEntries(response.headers));
      await pipeline(Readable.fromWeb(response.body), outgoing);
    } catch (error) {
      outgoing.destroy(error);
    }
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  try {
    await run('http://127.0.0.1:' + server.address().port);
  } finally {
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  }
}

async function* frames(body) {
  let buffer = '';
  for await (const chunk of body.pipeThrough(new TextDecoderStream())) {
    buffer += chunk;
    const lines = buffer.split('\n');
    buffer = lines.pop();
    for (const line of lines) yield JSON.parse(line);
  }
  assert.equal(buffer, '', 'the final frame must end in a newline');
}

for (const [path, handler, platforms] of [
  ['/gal', netlifyGal.default, PLATFORMS_GAL],
  ['/patch', netlifyPatch.default, PLATFORMS_PATCH],
]) {
  test('Netlify ' + path + ' delivers the fast result while the slow source is pending', async () => {
    assert.equal(typeof handler, 'function', 'Netlify must expose a Request → Response function');
    const slow = Promise.withResolvers();
    const fixtures = [
      source('slow', () => slow.promise),
      source('fast', async game => ({ count: 1, items: [{ name: game, url: fixtureUrl }] })),
    ];
    const otherPlatforms = platforms === PLATFORMS_GAL ? PLATFORMS_PATCH : PLATFORMS_GAL;
    await withPlatforms(otherPlatforms, [], () => withPlatforms(platforms, fixtures, () => withHttpServer(handler, async url => {
      const body = new FormData();
      body.set('game', ' 千恋万花 ');
      const response = await fetch(url + path, { method: 'POST', body, signal: AbortSignal.timeout(5000) });
      assert.equal(response.status, 200);
      assert.equal(response.headers.get('content-type'), 'text/event-stream; charset=utf-8');
      assert.equal(response.headers.get('access-control-allow-origin'), '*');
      assert.equal(response.headers.get('cache-control'), 'no-cache');

      const events = frames(response.body);
      try {
        assert.deepEqual((await events.next()).value, { total: 2 });
        assert.deepEqual((await events.next()).value, {
          progress: { completed: 1, total: 2 },
          result: { name: 'fast', color: 'white', tags: [], items: [{ name: '千恋万花', url: fixtureUrl }] },
        });
        slow.reject(new Error('upstream timed out'));
        assert.deepEqual((await events.next()).value, {
          progress: { completed: 2, total: 2 },
          result: { name: 'slow', color: 'red', tags: [], items: [], error: 'upstream timed out' },
        });
        assert.deepEqual(await events.next(), { value: { done: true }, done: false });
        assert.equal((await events.next()).done, true);
      } finally {
        slow.resolve({ count: 0, items: [] });
        await events.return();
      }
    })));
  });
}

test('all six search endpoints preserve preflight, URL-encoded form and the no-results stream', async () => {
  const tasks = [];
  const workerFetch = request => worker.fetch(request, {
    CHARLOTTE_BASE_URL: fixtureUrl,
  }, { waitUntil: task => tasks.push(task) });
  let workerBinding;
  const noHits = source('no hits', async (game, env) => {
    if (game === 'worker') workerBinding = env.CHARLOTTE_BASE_URL;
    return { count: 0, items: [] };
  });
  const entries = [
    [workerFetch, '/gal'], [workerFetch, '/patch'],
    [vercelGal, '/gal'], [vercelPatch, '/patch'],
    [netlifyGal.default, '/gal'], [netlifyPatch.default, '/patch'],
  ];
  await withPlatforms(PLATFORMS_GAL, [noHits], () => withPlatforms(PLATFORMS_PATCH, [noHits], async () => {
    for (const [handler, path] of entries) {
      const preflight = await handler(new Request(origin + path, { method: 'OPTIONS' }));
      assert.equal(preflight.status, 200);
      assert.equal(preflight.headers.get('access-control-allow-methods'), 'POST, OPTIONS');

      const game = handler === workerFetch ? ' worker ' : ' test ';
      const response = await handler(new Request(origin + path, {
        method: 'POST',
        body: new URLSearchParams({ game }),
      }));
      assert.equal(response.status, 200);
      assert.equal(await response.text(), '{"total":1}\n{"progress":{"completed":1,"total":1}}\n{"done":true}\n');
    }
  }));
  assert.equal(workerBinding, fixtureUrl);
  assert.equal(tasks.length, 2);
  await Promise.all(tasks);
});

test('Netlify accepts JSON and returns CORS JSON errors for invalid input', async () => {
  const handler = netlifyGal.default;
  const post = body => new Request(origin + '/gal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body,
  });
  const fixture = source('JSON source', async game => ({ count: 1, items: [{ name: game, url: fixtureUrl }] }));
  await withPlatforms(PLATFORMS_GAL, [fixture], async () => {
    const valid = await handler(post('{"game":" test "}'));
    assert.match(await valid.text(), /"items":\[\{"name":"test"/);
    for (const body of ['{}', '{"game":42}', '{"game":" "}', 'null', '{']) {
      const invalid = await handler(post(body));
      assert.equal(invalid.status, 400);
      assert.equal(invalid.headers.get('access-control-allow-origin'), '*');
      assert.deepEqual(await invalid.json(), { error: 'Game name is required' });
    }
  });
  assert.equal((await handler(new Request(origin + '/gal'))).status, 405);
});

test('Worker releases its waitUntil task after a client cancels the stream', async () => {
  const pending = Promise.withResolvers();
  const tasks = [];
  const request = new Request(origin + '/gal', {
    method: 'POST',
    body: new URLSearchParams({ game: 'cancel' }),
  });
  await withPlatforms(PLATFORMS_GAL, [source('pending', () => pending.promise)], async () => {
    let reader;
    try {
      const response = await worker.fetch(request, {}, { waitUntil: task => tasks.push(task) });
      reader = response.body.getReader();
      const first = await reader.read();
      assert.equal(new TextDecoder().decode(first.value), '{"total":1}\n');
      await reader.cancel();
    } finally {
      pending.resolve({ count: 0, items: [] });
    }
    assert.equal(tasks.length, 1);
    await Promise.all(tasks);
  });
});

test('Worker keeps root redirects and rejects unsupported search routes and methods', async () => {
  const ctx = { waitUntil: () => assert.fail('a rejected route must not start a search') };
  const redirects = await worker.fetch(new Request('https://test.workers.dev/'), {}, ctx);
  assert.equal(redirects.status, 302);
  const location = new URL(redirects.headers.get('location'));
  assert.equal(location.origin, 'https://www.searchgal.top');
  assert.equal(location.searchParams.get('api'), 'https://test.workers.dev');
  assert.equal((await worker.fetch(new Request(origin + '/gal'), {}, ctx)).status, 404);
  assert.equal((await worker.fetch(new Request(origin + '/missing', { method: 'OPTIONS' }), {}, ctx)).status, 200);
  assert.equal((await worker.fetch(new Request(origin + '/missing', { method: 'POST' }), {}, ctx)).status, 404);
});
