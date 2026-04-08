/**
 * Passwords — Deterministic Password Generator
 * Crypto Engine: PBKDF2-SHA256 based deterministic generation
 */

'use strict';

const CryptoEngine = (() => {

  /**
   * Normalize inputs consistently for determinism
   */
  function normalizeInputs(website, username, masterPassword, phrase) {
    const site = website.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const user = username ? username.trim().toLowerCase().replace(/[^a-z0-9.\-_@]/g, '') : '';
    const phraseWords = phrase.trim().toLowerCase().split(/\s+/).filter(w => w.length > 0).join('');
    // masterPassword is case-sensitive and kept as-is
    return { site, user, phraseWords, masterPassword: masterPassword.trim() };
  }

  /**
   * Derive a deterministic key material using PBKDF2
   * Returns a Uint8Array of 64 bytes
   */
  async function deriveKeyMaterial(site, user, masterPassword, phraseWords) {
    const encoder = new TextEncoder();

    // The "password" input to PBKDF2: masterPassword + phrase
    const passwordInput = masterPassword + ':' + phraseWords;
    // The "salt" input to PBKDF2: site + user (deterministic, site-specific)
    const saltInput = 'passwords-v1:' + site + ':' + user;

    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(passwordInput),
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );

    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: encoder.encode(saltInput),
        iterations: 200000,
        hash: 'SHA-256'
      },
      keyMaterial,
      512 // 64 bytes
    );

    return new Uint8Array(derivedBits);
  }

  /**
   * Build character set from settings
   */
  function buildCharset(settings) {
    const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
    const NUMBERS   = '0123456789';
    const SYMBOLS   = '!@#$%^&*()-_=+[]{}|;:,.<>?';

    let charset = '';
    const required = [];

    if (settings.uppercase) { charset += UPPERCASE; required.push(UPPERCASE); }
    if (settings.lowercase) { charset += LOWERCASE; required.push(LOWERCASE); }
    if (settings.numbers)   { charset += NUMBERS;   required.push(NUMBERS); }
    if (settings.symbols)   { charset += SYMBOLS;   required.push(SYMBOLS); }

    return { charset, required };
  }

  /**
   * Convert derived bytes into a password of desired length and charset
   * Uses a rejection-sampling approach on the byte stream to avoid modulo bias.
   * Extra deterministic bytes are generated via SHA-256 chaining if needed.
   */
  async function bytesToPassword(keyBytes, charset, requiredSets, length) {
    const encoder = new TextEncoder();
    const charLen = charset.length;

    // How many bytes we need — use rejection sampling threshold
    const threshold = 256 - (256 % charLen);
    let passwordChars = [];
    let byteBuffer = Array.from(keyBytes);
    let chainInput = keyBytes;
    let chainCounter = 0;

    while (passwordChars.length < length) {
      if (byteBuffer.length === 0) {
        // Extend: hash previous output + counter
        chainCounter++;
        const counterBytes = encoder.encode(String(chainCounter));
        const combined = new Uint8Array(chainInput.length + counterBytes.length);
        combined.set(chainInput);
        combined.set(counterBytes, chainInput.length);
        const hashBuffer = await crypto.subtle.digest('SHA-256', combined);
        chainInput = new Uint8Array(hashBuffer);
        byteBuffer = Array.from(chainInput);
      }

      const byte = byteBuffer.shift();
      if (byte < threshold) {
        passwordChars.push(charset[byte % charLen]);
      }
      // else: reject this byte (bias elimination)
    }

    // Now enforce required character classes by deterministic substitution
    // We use a separate derivation to determine substitution positions
    const positionHash = await crypto.subtle.digest(
      'SHA-256',
      new Uint8Array([...keyBytes, 0x50, 0x4F, 0x53]) // "POS" suffix for position derivation
    );
    const posBytes = new Uint8Array(positionHash);

    for (let i = 0; i < requiredSets.length; i++) {
      const reqSet = requiredSets[i];
      // Check if already satisfied
      const satisfied = passwordChars.some(c => reqSet.includes(c));
      if (!satisfied) {
        // Pick a deterministic position and character
        const pos = posBytes[i * 2] % length;
        const charIdx = posBytes[i * 2 + 1] % reqSet.length;
        passwordChars[pos] = reqSet[charIdx];
      }
    }

    return passwordChars.join('');
  }

  /**
   * Main entry point
   */
  async function generate(website, username, masterPassword, phrase, settings) {
    const { site, user, phraseWords, masterPassword: mp } = normalizeInputs(
      website, username, masterPassword, phrase
    );

    const keyBytes = await deriveKeyMaterial(site, user, mp, phraseWords);
    const { charset, required } = buildCharset(settings);

    if (!charset) throw new Error('At least one character type must be selected.');

    const password = await bytesToPassword(keyBytes, charset, required, settings.length);
    return password;
  }

  return { generate };
})();
