import { writeFileSync } from 'node:fs';
import { parseEnv } from 'node:util';

// JSON 字符串的转义规则与 dotenv 不同：反斜杠和双引号可能改变密钥。
// 选择能无损往返的 dotenv 表示；无法表示时停止启动，避免静默写入错误密钥。
function serialize(key, value) {
  const candidates = [`'${value}'`, `\`${value}\``, `"${value}"`, value];
  for (const encoded of candidates) {
    const line = `${key}=${encoded}\n`;
    const parsed = parseEnv(line);
    if (Object.keys(parsed).length === 1 && parsed[key] === value) return line;
  }
  throw new Error(`${key} 无法安全写入 dotenv，请使用不含引号的配置值或随机十六进制密钥`);
}

// Wrangler 本地模式从 .dev.vars 读取绑定。
const keys = ['TOUCHGAL_API_TOKEN', 'CHARLOTTE_BASE_URL', 'CHARLOTTE_API_KEY'];
const lines = keys
  .filter(key => process.env[key])
  .map(key => serialize(key, process.env[key]));

writeFileSync('.dev.vars', lines.join(''), { mode: 0o600 });
