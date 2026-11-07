const test = require("node:test");
const assert = require("node:assert");
const app = require("../server");

let server;
let base;

test.before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, "127.0.0.1", resolve);
  });
  base = "http://127.0.0.1:" + server.address().port;
});

test.after(() => server.close());

test("GET /health returns healthy", async () => {
  const res = await fetch(base + "/health");
  assert.strictEqual(res.status, 200);
  assert.strictEqual((await res.json()).status, "healthy");
});

test("GET / serves the HTML page", async () => {
  const res = await fetch(base + "/");
  assert.strictEqual(res.status, 200);
  assert.match(await res.text(), /Express Frontend/);
});

test("GET /status reports backend state as JSON", async () => {
  const res = await fetch(base + "/status");
  // 200 when Flask is up, 502 when it is not - both must be valid JSON with a 'reachable' flag
  assert.ok([200, 502].includes(res.status));
  assert.strictEqual(typeof (await res.json()).reachable, "boolean");
});
