/**
 * Passwords — Main App Controller
 */

'use strict';

const App = (() => {

  // ─── State ────────────────────────────────────────────────────────────────
  let settings = SettingsStore.load();
  let generateTimeout = null;

  // ─── DOM refs ─────────────────────────────────────────────────────────────
  const $ = id => document.getElementById(id);

  const els = {
    website:        () => $('input-website'),
    username:       () => $('input-username'),
    password:       () => $('input-password'),
    phrase:         () => $('input-phrase'),

    websiteErr:     () => $('err-website'),
    usernameErr:    () => $('err-username'),
    passwordErr:    () => $('err-password'),
    phraseErr:      () => $('err-phrase'),

    passwordToggle: () => $('toggle-password'),
    phraseToggle:   () => $('toggle-phrase'),

    settingsPanel:  () => $('settings-panel'),
    settingsToggle: () => $('settings-toggle'),

    chkUpper:       () => $('chk-uppercase'),
    chkLower:       () => $('chk-lowercase'),
    chkNumbers:     () => $('chk-numbers'),
    chkSymbols:     () => $('chk-symbols'),
    chkErr:         () => $('err-checkboxes'),

    lengthVal:      () => $('length-value'),
    btnLenMinus:    () => $('btn-len-minus'),
    btnLenPlus:     () => $('btn-len-plus'),

    btnReset:       () => $('btn-reset-settings'),

    outputSection:  () => $('output-section'),
    outputPassword: () => $('output-password'),
    outputLoading:  () => $('output-loading'),
    outputPlaceholder: () => $('output-placeholder'),
    btnCopy:        () => $('btn-copy'),
    copyFeedback:   () => $('copy-feedback'),

    strengthBar:    () => $('strength-bar'),
    strengthLabel:  () => $('strength-label'),
  };

  // ─── Validation state ─────────────────────────────────────────────────────
  const fieldState = {
    website:  { valid: false, touched: false },
    username: { valid: true,  touched: false },
    password: { valid: false, touched: false },
    phrase:   { valid: false, touched: false },
  };

  // ─── Error display ────────────────────────────────────────────────────────
  function showError(errEl, message) {
    errEl.textContent = message;
    errEl.classList.add('visible');
  }

  function clearError(errEl) {
    errEl.textContent = '';
    errEl.classList.remove('visible');
  }

  function setFieldState(input, valid) {
    input.classList.toggle('invalid', !valid);
    input.classList.toggle('valid', valid);
  }

  // ─── Field validators ─────────────────────────────────────────────────────
  function checkWebsite() {
    const result = Validator.validateWebsite(els.website().value);
    fieldState.website.valid = result.ok;
    if (fieldState.website.touched) {
      setFieldState(els.website(), result.ok);
      result.ok ? clearError(els.websiteErr()) : showError(els.websiteErr(), result.error);
    }
    return result.ok;
  }

  function checkUsername() {
    const result = Validator.validateUsernameOrEmail(els.username().value);
    fieldState.username.valid = result.ok;
    if (fieldState.username.touched) {
      setFieldState(els.username(), result.ok);
      result.ok ? clearError(els.usernameErr()) : showError(els.usernameErr(), result.error);
    }
    return result.ok;
  }

  function checkPassword() {
    const result = Validator.validateMasterPassword(els.password().value);
    fieldState.password.valid = result.ok;
    if (fieldState.password.touched) {
      setFieldState(els.password(), result.ok);
      result.ok ? clearError(els.passwordErr()) : showError(els.passwordErr(), result.error);
    }
    return result.ok;
  }

  function checkPhrase() {
    const result = Validator.validatePhrase(els.phrase().value);
    fieldState.phrase.valid = result.ok;
    if (fieldState.phrase.touched) {
      setFieldState(els.phrase(), result.ok);
      result.ok ? clearError(els.phraseErr()) : showError(els.phraseErr(), result.error);
    }
    return result.ok;
  }

  function allInputsValid() {
    return fieldState.website.valid && fieldState.username.valid &&
           fieldState.password.valid && fieldState.phrase.valid;
  }

  // ─── Settings UI sync ─────────────────────────────────────────────────────
  function applySettingsToUI() {
    els.chkUpper().checked   = settings.uppercase;
    els.chkLower().checked   = settings.lowercase;
    els.chkNumbers().checked = settings.numbers;
    els.chkSymbols().checked = settings.symbols;
    els.lengthVal().textContent = settings.length;
    els.btnLenMinus().disabled = settings.length <= 4;
    els.btnLenPlus().disabled  = settings.length >= 150;
  }

  function readSettingsFromUI() {
    return {
      uppercase: els.chkUpper().checked,
      lowercase: els.chkLower().checked,
      numbers:   els.chkNumbers().checked,
      symbols:   els.chkSymbols().checked,
      length:    parseInt(els.lengthVal().textContent, 10)
    };
  }

  function validateCheckboxes() {
    const s = readSettingsFromUI();
    const valid = s.uppercase || s.lowercase || s.numbers || s.symbols;
    if (!valid) {
      showError(els.chkErr(), 'At least one character type must be selected');
    } else {
      clearError(els.chkErr());
    }
    return valid;
  }

  // ─── Password strength ────────────────────────────────────────────────────
  function computeStrength(password) {
    let entropy = 0;
    if (/[a-z]/.test(password)) entropy += 26;
    if (/[A-Z]/.test(password)) entropy += 26;
    if (/[0-9]/.test(password)) entropy += 10;
    if (/[^a-zA-Z0-9]/.test(password)) entropy += 32;
    const bits = Math.log2(Math.pow(entropy || 1, password.length));

    if (bits < 40) return { level: 0, label: 'Weak',      color: 'var(--strength-weak)' };
    if (bits < 60) return { level: 1, label: 'Fair',      color: 'var(--strength-fair)' };
    if (bits < 80) return { level: 2, label: 'Good',      color: 'var(--strength-good)' };
    if (bits < 100) return { level: 3, label: 'Strong',   color: 'var(--strength-strong)' };
    return              { level: 4, label: 'Excellent',   color: 'var(--strength-excellent)' };
  }

  function updateStrengthUI(password) {
    const s = computeStrength(password);
    const bar = els.strengthBar();
    const pct = ((s.level + 1) / 5) * 100;
    bar.style.width = pct + '%';
    bar.style.background = s.color;
    els.strengthLabel().textContent = s.label;
    els.strengthLabel().style.color = s.color;
  }

  // ─── Password generation ──────────────────────────────────────────────────
  function scheduleGenerate() {
    if (generateTimeout) clearTimeout(generateTimeout);
    generateTimeout = setTimeout(triggerGenerate, 120);
  }

  async function triggerGenerate() {
    if (!allInputsValid()) {
      showOutputPlaceholder();
      return;
    }
    const settingsValid = Validator.validateSettings(settings);
    if (!settingsValid.ok) {
      showOutputPlaceholder();
      return;
    }

    showOutputLoading();

    try {
      const password = await CryptoEngine.generate(
        els.website().value,
        els.username().value,
        els.password().value,
        els.phrase().value,
        settings
      );
      showOutputPassword(password);
    } catch (e) {
      showOutputPlaceholder('Error generating password. Check your inputs.');
      console.error(e);
    }
  }

  function showOutputLoading() {
    els.outputPassword().classList.remove('visible');
    els.outputPlaceholder().classList.remove('visible');
    els.outputLoading().classList.add('visible');
    els.btnCopy().disabled = true;
  }

  function showOutputPassword(password) {
    els.outputLoading().classList.remove('visible');
    els.outputPlaceholder().classList.remove('visible');
    els.outputPassword().textContent = password;
    els.outputPassword().classList.add('visible');
    els.btnCopy().disabled = false;
    updateStrengthUI(password);
    els.outputSection().classList.add('has-result');
  }

  function showOutputPlaceholder(msg) {
    els.outputLoading().classList.remove('visible');
    els.outputPassword().classList.remove('visible');
    els.outputPlaceholder().textContent = msg || 'Fill in all required fields to generate your password';
    els.outputPlaceholder().classList.add('visible');
    els.btnCopy().disabled = true;
    els.outputSection().classList.remove('has-result');
    els.strengthBar().style.width = '0';
    els.strengthLabel().textContent = '';
  }

  // ─── Copy ─────────────────────────────────────────────────────────────────
  async function copyPassword() {
    const pwd = els.outputPassword().textContent;
    if (!pwd) return;
    try {
      await navigator.clipboard.writeText(pwd);
      const fb = els.copyFeedback();
      fb.classList.add('visible');
      setTimeout(() => fb.classList.remove('visible'), 2000);
    } catch {
      // Fallback
      const range = document.createRange();
      range.selectNode(els.outputPassword());
      window.getSelection().removeAllRanges();
      window.getSelection().addRange(range);
      document.execCommand('copy');
      window.getSelection().removeAllRanges();
    }
  }

  // ─── Settings panel ───────────────────────────────────────────────────────
  function toggleSettingsPanel() {
    const panel = els.settingsPanel();
    const isOpen = panel.classList.contains('open');
    panel.classList.toggle('open', !isOpen);
    els.settingsToggle().classList.toggle('active', !isOpen);
    els.settingsToggle().setAttribute('aria-expanded', String(!isOpen));
  }

  // ─── Event wiring ─────────────────────────────────────────────────────────
  function onSettingsChange() {
    if (!validateCheckboxes()) return;
    settings = readSettingsFromUI();
    SettingsStore.save(settings);
    applySettingsToUI();
    scheduleGenerate();
  }

  function init() {
    // Apply saved settings
    applySettingsToUI();

    // Input events — validate on input, mark touched on blur
    els.website().addEventListener('input',  () => { checkWebsite();  scheduleGenerate(); });
    els.website().addEventListener('blur',   () => { fieldState.website.touched  = true; checkWebsite();  });

    els.username().addEventListener('input', () => { checkUsername(); scheduleGenerate(); });
    els.username().addEventListener('blur',  () => { fieldState.username.touched = true; checkUsername(); });

    els.password().addEventListener('input', () => { checkPassword(); scheduleGenerate(); });
    els.password().addEventListener('blur',  () => { fieldState.password.touched = true; checkPassword(); });

    els.phrase().addEventListener('input',   () => { checkPhrase();   scheduleGenerate(); });
    els.phrase().addEventListener('blur',    () => { fieldState.phrase.touched   = true; checkPhrase();   });

    // Password visibility toggle
    els.passwordToggle().addEventListener('click', () => {
      const input = els.password();
      const isText = input.type === 'text';
      input.type = isText ? 'password' : 'text';
      els.passwordToggle().innerHTML = isText ? EyeIcon() : EyeOffIcon();
    });

    // Phrase visibility toggle
    els.phraseToggle().addEventListener('click', () => {
      const input = els.phrase();
      const isText = input.type === 'text';
      input.type = isText ? 'password' : 'text';
      els.phraseToggle().innerHTML = isText ? EyeIcon() : EyeOffIcon();
    });

    // Settings panel toggle
    els.settingsToggle().addEventListener('click', toggleSettingsPanel);

    // Checkboxes
    [els.chkUpper(), els.chkLower(), els.chkNumbers(), els.chkSymbols()].forEach(chk => {
      chk.addEventListener('change', onSettingsChange);
    });

    // Length buttons
    els.btnLenMinus().addEventListener('click', () => {
      const cur = parseInt(els.lengthVal().textContent, 10);
      if (cur > 4) {
        els.lengthVal().textContent = cur - 1;
        onSettingsChange();
      }
    });

    els.btnLenPlus().addEventListener('click', () => {
      const cur = parseInt(els.lengthVal().textContent, 10);
      if (cur < 150) {
        els.lengthVal().textContent = cur + 1;
        onSettingsChange();
      }
    });

    // Reset settings
    els.btnReset().addEventListener('click', () => {
      settings = SettingsStore.reset();
      applySettingsToUI();
      clearError(els.chkErr());
      scheduleGenerate();
    });

    // Copy button
    els.btnCopy().addEventListener('click', copyPassword);

    // Close settings panel when clicking outside
    document.addEventListener('click', (e) => {
      const panel = els.settingsPanel();
      const toggle = els.settingsToggle();
      if (panel.classList.contains('open') && !panel.contains(e.target) && !toggle.contains(e.target)) {
        panel.classList.remove('open');
        toggle.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });

    // Initial placeholder
    showOutputPlaceholder();
  }

  return { init };
})();

// SVG icons
function EyeIcon() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
}
function EyeOffIcon() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;
}

document.addEventListener('DOMContentLoaded', () => App.init());
