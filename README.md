# 🔐 Passwords — Deterministic Password Generator

A **secure, deterministic password generator** that creates the same password every time from the same inputs — no storage, no syncing, no risk of leaks.

> Your passwords never leave your device. Ever.

---

### 👨‍💻 Developer

[**Pritam**](https://github.com/TwilightEntity)

---

## ✨ Features

* 🔁 **Deterministic generation**
  Same inputs → same password, every time

* 🔒 **Strong cryptography**
  Built using **PBKDF2 + SHA-256** with 200,000 iterations

* 🧠 **Zero storage**
  No passwords are saved, stored, or transmitted

* 🎛️ **Customizable output**

  * Uppercase / lowercase / numbers / symbols
  * Password length (4–150)

* 📊 **Password strength indicator**
  Real-time entropy-based feedback

* 🧼 **Strict input validation**
  Prevents weak or malformed inputs

* 💾 **Local settings persistence**
  Preferences saved in your browser

---

## 🚀 How It Works

This generator is like a **password forge** 🔥 where your inputs are melted and reshaped into a consistent, unbreakable key.

### Inputs

* **Website / App Name**
* **Username / Email (optional)**
* **Master Password**
* **Secret Phrase**

### Process

1. Inputs are **normalized** (cleaned and standardized)
2. A deterministic key is derived using:

   * `PBKDF2-SHA256`
   * 200,000 iterations
3. The key is converted into a password using:

   * Bias-free character selection
   * Deterministic fallback hashing (SHA-256 chaining)
4. Required character types are enforced deterministically

### Result

➡️ A strong, reproducible password unique to each site.

---

## 🔐 Security Philosophy

* ❌ No cloud sync
* ❌ No database
* ❌ No password storage
* ✅ Everything happens **locally in your browser**

Even if someone gets your generated password, they **cannot reverse it** to find your master password or inputs.

---

## 🧪 Example

| Input           | Value                |
| --------------- | -------------------- |
| Website         | `google`             |
| Username        | `user@example.com`   |
| Master Password | `MyStrong@123`       |
| Secret Phrase   | `red fox jumps high` |

➡️ Output (always same):

```
(BBR#HKlB=$kS64
```

---

## ⚙️ Configuration

You can customize:

* Character types:

  * A–Z Uppercase
  * a–z Lowercase
  * 0–9 Numbers
  * Symbols (`!@#$%^&*...`)
* Password length:

  * Minimum: 4
  * Maximum: 150

Settings are saved locally in `localStorage`.

---

## 📁 Project Structure

```
.
├── index.html        # UI structure
├── css/
│   └── styles.css   # Styling
├── js/
│   ├── app.js       # Main controller (UI + logic glue)
│   ├── crypto.js    # Core deterministic engine
│   ├── validator.js # Input validation
│   └── settings.js  # Local storage handling
```

---

## 🛡️ Validation Rules

* **Website**: Alphanumeric only, max 150 chars
* **Username**:

  * Email (RFC-style) OR
  * Alphanumeric + `._-`
* **Master Password**:

  * Min 10 chars
  * Must include uppercase, lowercase, number, symbol
* **Phrase**:

  * 3–50 words
  * Letters, numbers, spaces only

---

## 🧠 Why Deterministic Passwords?

Traditional password managers store secrets. This one doesn’t.

Instead:

* You **recreate** passwords when needed
* You only remember:

  * One master password
  * One secret phrase

It’s like carrying a **key-making machine in your pocket**, instead of a heavy keychain 🗝️

---

## ⚠️ Important Notes

* 🔴 If you forget your **master password** or **phrase**, your passwords are unrecoverable
* 🔴 Changing any input will generate a completely different password
* 🔴 Always use a strong master password

---

## 🧑‍💻 Running Locally

Just open the project in your browser:

```bash
git clone https://github.com/TwilightEntity/pritam.git
cd passwords
open index.html
```

No build step. No dependencies. Pure frontend.

---

## 📜 License

MIT License — feel free to use, modify, and build upon it.

---

## 💡 Future Ideas

* Browser extension 🧩
* Mobile version 📱
* Export/import settings
* Passphrase generator

---

## 📜 License

This project is licensed under the **MIT License**
👉 [https://github.com/TwilightEntity/passwords/blob/main/LICENSE](https://github.com/TwilightEntity/passwords/blob/main/LICENSE)

---

## ❤️ Philosophy

> “Don’t store secrets. Recreate them.”

A small tool with a quiet ambition:
to make security feel simple, personal, and entirely under your control.
