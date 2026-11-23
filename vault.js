const OPENROUTER_KEY_FILE = new URL('./openrouter-key.enc.json', window.location.href);

async function unlockOpenRouterKey(password, localFile, fromShareLink = false) {
  if (typeof password !== 'string' || password.length === 0) {
    throw new Error('Enter the vault passphrase.');
  }

  let vault;
  if (localFile) {
    try {
      vault = JSON.parse(await localFile.text());
    } catch {
      throw new Error('Choose a valid openrouter-key.enc.json file.');
    }
  } else {
    let response;
    try {
      response = await fetch(OPENROUTER_KEY_FILE);
    } catch {
      throw new Error('Could not fetch the encrypted key. Choose openrouter-key.enc.json below.');
    }
    if (!response.ok) throw new Error('Encrypted key file unavailable. Choose openrouter-key.enc.json below.');
    try {
      vault = await response.json();
    } catch {
      throw new Error('The downloaded key file is invalid. Choose openrouter-key.enc.json below.');
    }
  }
  if (fromShareLink) vault = vault?.share;
  if (vault?.version !== 1 || !vault.salt || !vault.iv || !vault.ciphertext) {
    throw new Error('The encrypted key file has an unsupported format.');
  }

  try {
    const decode = (value) => Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
    const salt = decode(vault.salt);
    const iv = decode(vault.iv);
    const encrypted = decode(vault.ciphertext);
    const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
    const key = await crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations: 600_000, hash: 'SHA-256' },
      material,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt'],
    );
    const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv, tagLength: 128 }, key, encrypted);
    return new TextDecoder().decode(plaintext);
  } catch {
    throw new Error('The passphrase is incorrect or the encrypted key file is damaged.');
  }
}
