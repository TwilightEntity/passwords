/**
 * Passwords — Input Validation Module
 */

'use strict';

const Validator = (() => {

  function validateWebsite(raw) {
    const value = raw.trim();
    if (!value) return { ok: false, error: 'Website or app name is required' };
    if (value.length > 150) return { ok: false, error: 'Max 150 characters allowed' };
    if (!/^[a-zA-Z0-9]+$/.test(value)) return { ok: false, error: 'Only letters and numbers allowed (no spaces or symbols)' };
    return { ok: true, value };
  }

  function isEmail(str) {
    // RFC 5321 / 5322 simplified but solid check
    return /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(str);
  }

  function isUsername(str) {
    return /^[a-zA-Z0-9._\-]+$/.test(str);
  }

  function validateUsernameOrEmail(raw) {
    if (!raw || raw.trim() === '') return { ok: true, value: '' }; // optional

    const value = raw.trim();

    if (value.includes('@')) {
      // Treat as email
      if (value.length > 254) return { ok: false, error: 'Email must be 254 characters or fewer' };
      if (!isEmail(value)) return { ok: false, error: 'Invalid email address format' };
      return { ok: true, value, type: 'email' };
    } else {
      // Treat as username
      if (value.length > 150) return { ok: false, error: 'Username must be 150 characters or fewer' };
      if (!isUsername(value)) return { ok: false, error: 'Username may only contain letters, numbers, dots, dashes, and underscores' };
      return { ok: true, value, type: 'username' };
    }
  }

  function validateMasterPassword(raw) {
    const value = raw.trim();
    if (!value) return { ok: false, error: 'Password is required' };
    if (value.length < 10) return { ok: false, error: 'Password must be at least 10 characters' };
    if (value.length > 150) return { ok: false, error: 'Password must be 150 characters or fewer' };
    if (!/[A-Z]/.test(value)) return { ok: false, error: 'Password must contain at least one uppercase letter' };
    if (!/[a-z]/.test(value)) return { ok: false, error: 'Password must contain at least one lowercase letter' };
    if (!/[0-9]/.test(value)) return { ok: false, error: 'Password must contain at least one number' };
    if (!/[^a-zA-Z0-9]/.test(value)) return { ok: false, error: 'Password must contain at least one symbol' };
    return { ok: true, value };
  }

  function validatePhrase(raw) {
    const value = raw.trim();
    if (!value) return { ok: false, error: 'Phrase is required' };

    // Check only alphanumeric + spaces
    if (!/^[a-zA-Z0-9\s]+$/.test(value)) return { ok: false, error: 'Phrase may only contain letters, numbers, and spaces' };

    const words = value.split(/\s+/).filter(w => w.length > 0);
    if (words.length < 3) return { ok: false, error: `Phrase needs at least 3 words (you have ${words.length})` };
    if (words.length > 50) return { ok: false, error: `Phrase may have at most 50 words (you have ${words.length})` };

    return { ok: true, value, wordCount: words.length };
  }

  function validateSettings(settings) {
    const atLeastOne = settings.uppercase || settings.lowercase || settings.numbers || settings.symbols;
    if (!atLeastOne) return { ok: false, error: 'At least one character type must be enabled' };
    if (settings.length < 4) return { ok: false, error: 'Password length must be at least 4' };
    if (settings.length > 150) return { ok: false, error: 'Password length must be 150 or fewer' };
    return { ok: true };
  }

  return {
    validateWebsite,
    validateUsernameOrEmail,
    validateMasterPassword,
    validatePhrase,
    validateSettings
  };
})();
