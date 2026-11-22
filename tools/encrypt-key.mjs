#!/usr/bin/env node
import { createCipheriv, pbkdf2Sync, randomBytes } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { createInterface } from 'node:readline/promises';
import { stdin, stderr } from 'node:process';
import { execFileSync } from 'node:child_process';

const ITERATIONS = 600_000;
const OUTPUT = new URL('../openrouter-key.enc.json', import.meta.url);

function usage() {
  stderr.write('Usage: node tools/encrypt-key.mjs [--input /absolute/path/to/credentials.json]\n');
  stderr.write('Input JSON format: {"apiKey":"...","passphrase":"..."}\n');
}

async function promptHidden(prompt) {
  if (!stdin.isTTY) throw new Error('Hidden prompts require a terminal; use --input with a JSON file.');
  stderr.write(prompt);
  execFileSync('stty', ['-echo'], { stdio: ['inherit', 'ignore', 'ignore'] });
  try {
    const rl = createInterface({ input: stdin, output: stderr, terminal: false });
    try { return await rl.question(''); } finally { rl.close(); }
  } finally {
    execFileSync('stty', ['echo'], { stdio: ['inherit', 'ignore', 'ignore'] });
    stderr.write('\n');
  }
}

async function getCredentials(args) {
  if (args.length === 2 && args[0] === '--input' && args[1].startsWith('/')) {
    const text = await readFile(args[1], 'utf8');
    let input;
    try {
      input = JSON.parse(text);
    } catch {
      throw new Error('The credential input file must contain valid JSON.');
    }
    return { apiKey: input?.apiKey, passphrase: input?.passphrase };
  }
  if (args.length) { usage(); process.exit(2); }
  return {
    apiKey: await promptHidden('OpenRouter API key: '),
    passphrase: await promptHidden('Encryption passphrase: '),
  };
}

try {
  const { apiKey, passphrase } = await getCredentials(process.argv.slice(2));
  if (typeof apiKey !== 'string' || !apiKey.trim() || typeof passphrase !== 'string' || !passphrase) {
    throw new Error('Both apiKey and passphrase must be non-empty strings.');
  }

  const salt = randomBytes(16);
  const iv = randomBytes(12);
  const key = pbkdf2Sync(passphrase, salt, ITERATIONS, 32, 'sha256');
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(apiKey, 'utf8'), cipher.final(), cipher.getAuthTag()]);
  const document = {
    version: 1,
    salt: salt.toString('base64'),
    iv: iv.toString('base64'),
    ciphertext: ciphertext.toString('base64'),
  };
  await writeFile(OUTPUT, `${JSON.stringify(document, null, 2)}\n`, { mode: 0o600 });
  stderr.write('Encrypted key written to openrouter-key.enc.json\n');
} catch (error) {
  stderr.write(`Encryption failed: ${error.message}\n`);
  process.exitCode = 1;
}
