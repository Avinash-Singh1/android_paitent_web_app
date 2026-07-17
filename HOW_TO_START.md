# How to Start the Development Server

## ✅ BUILD SUCCESSFUL!

The compilation was successful. The SSL certificate error is just a configuration issue.

---

## Option 1: Start WITHOUT SSL (Recommended for Local Development)

```bash
ng serve --port 4400 --host localhost --ssl=false
```

This will start the server at: **http://localhost:4400** (HTTP, not HTTPS)

**Note**: Video calls and screen sharing require HTTPS. However, for local development:
- Chrome allows camera/microphone access on `localhost` even with HTTP
- Firefox allows it too
- So this will work fine for testing!

---

## Option 2: Start WITH Placeholder SSL (Current Setup)

```bash
npm start
```

This tries to use HTTPS but the dummy certificates won't work properly. The server might still start but browsers will show security warnings.

---

## Option 3: Generate Real SSL Certificates (Best)

### Using OpenSSL (if installed):

```bash
# In PowerShell
cd .ssl
openssl genrsa -out key.pem 2048
openssl req -new -x509 -key key.pem -out cert.pem -days 365 -subj "/C=US/ST=State/L=City/O=Dev/CN=localhost"
cd ..
npm start
```

### Using mkcert (Recommended - Creates Trusted Certs):

1. Install mkcert:
   ```bash
   choco install mkcert
   ```

2. Create local CA:
   ```bash
   mkcert -install
   ```

3. Generate certificates:
   ```bash
   mkcert -key-file .ssl/key.pem -cert-file .ssl/cert.pem localhost 127.0.0.1
   ```

4. Start server:
   ```bash
   npm start
   ```

---

## Quick Fix: Update package.json (Disable SSL)

Edit `package.json` and change:
```json
"start": "ng serve --port 4400 --host localhost --ssl=false"
```

Then just run:
```bash
npm start
```

---

## ⚡ QUICKEST WAY TO TEST NOW:

```bash
ng serve --port 4400 --host localhost --ssl=false
```

Then open: **http://localhost:4400**

Camera and microphone will work on localhost even without HTTPS!

---

## Why Localhost Works Without HTTPS

Browsers treat `localhost` and `127.0.0.1` as "secure contexts" even over HTTP for development purposes. This means:
- ✅ Camera access works
- ✅ Microphone access works  
- ✅ Screen sharing works (in most browsers)
- ✅ Service Workers work
- ✅ Geolocation works

So HTTP on localhost is **perfect for development**!

---

**Status**: Ready to start! Use the command above 👆
