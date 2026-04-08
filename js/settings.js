/**
 * Passwords — Settings Storage Module
 */

'use strict';

const SettingsStore = (() => {

  const KEY = 'passwords-settings';

  const DEFAULTS = {
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    length: 15
  };

  function isDefault(settings) {
    return (
      settings.uppercase === DEFAULTS.uppercase &&
      settings.lowercase === DEFAULTS.lowercase &&
      settings.numbers   === DEFAULTS.numbers   &&
      settings.symbols   === DEFAULTS.symbols   &&
      settings.length    === DEFAULTS.length
    );
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return { ...DEFAULTS };
      const parsed = JSON.parse(raw);
      return {
        uppercase: typeof parsed.uppercase === 'boolean' ? parsed.uppercase : DEFAULTS.uppercase,
        lowercase: typeof parsed.lowercase === 'boolean' ? parsed.lowercase : DEFAULTS.lowercase,
        numbers:   typeof parsed.numbers   === 'boolean' ? parsed.numbers   : DEFAULTS.numbers,
        symbols:   typeof parsed.symbols   === 'boolean' ? parsed.symbols   : DEFAULTS.symbols,
        length:    typeof parsed.length    === 'number'  ? Math.min(150, Math.max(4, parsed.length)) : DEFAULTS.length,
      };
    } catch {
      return { ...DEFAULTS };
    }
  }

  function save(settings) {
    if (isDefault(settings)) {
      localStorage.removeItem(KEY);
    } else {
      localStorage.setItem(KEY, JSON.stringify(settings));
    }
  }

  function reset() {
    localStorage.removeItem(KEY);
    return { ...DEFAULTS };
  }

  function getDefaults() {
    return { ...DEFAULTS };
  }

  return { load, save, reset, getDefaults, isDefault };
})();
