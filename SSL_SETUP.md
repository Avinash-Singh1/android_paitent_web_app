# SSL Setup for Local Development

## Why HTTPS is Required

Modern browsers **require HTTPS** to access camera and microphone via `getUserMedia` API (used by Twilio Video). Without HTTPS, you'll get the error:
```
getUserMedia is not supported
```

## Quick Setup

### Option 1: Using mkcert (Recommended - No Browser Warnings)

1. **Install mkcert**:
   ```cmd
   choco install mkcert
   ```
   Or download from: https://github.com/FiloSottile/mkcert/releases

2. **Generate certificates**:
   ```powershell
   .\generate-ssl-cert.ps1
   ```

3. **Start the server**:
   ```cmd
   npm start
   ```

4. **Access the app**:
   - Open https://localhost:4400
   - No browser warnings! 🎉

### Option 2: Using OpenSSL

1. **Install OpenSSL**:
   ```cmd
   choco install openssl
   ```
   Or download from: https://slproweb.com/products/Win32OpenSSL.html

2. **Generate certificates**:
   ```powershell
   .\generate-ssl-cert.ps1
   ```

3. **Start the server**:
   ```cmd
   npm start
   ```

4. **Trust the certificate**:
   - Open https://localhost:4400
   - Click "Advanced" → "Proceed to localhost (unsafe)"
   - Or import `.ssl/cert.pem` to Windows Trusted Root Certification Authorities

### Option 3: Manual Certificate Generation (If scripts don't work)

Using mkcert:
```cmd
mkcert -install
mkcert -key-file .ssl/key.pem -cert-file .ssl/cert.pem localhost 127.0.0.1 ::1
```

Using OpenSSL:
```cmd
mkdir .ssl
openssl req -x509 -newkey rsa:4096 -keyout .ssl/key.pem -out .ssl/cert.pem -days 365 -nodes -subj "/CN=localhost"
```

## Troubleshooting

### "getUserMedia is not supported"
- ✅ Make sure you're accessing via `https://localhost:4400` (not `http://`)
- ✅ Allow camera/microphone permissions when prompted
- ✅ Check that certificate files exist in `.ssl/` folder

### Browser Security Warning
- **Chrome/Edge**: Click "Advanced" → "Proceed to localhost"
- **Firefox**: Click "Advanced" → "Accept the Risk and Continue"
- **Best solution**: Use mkcert to avoid warnings entirely

### Certificate Already Exists Error
- Delete the `.ssl/` folder and regenerate:
  ```cmd
  rmdir /s /q .ssl
  .\generate-ssl-cert.ps1
  ```

### Camera/Microphone Not Working
1. Check browser permissions (camera icon in address bar)
2. Ensure no other app is using the camera
3. Try a different browser
4. Check Windows Privacy Settings → Camera/Microphone permissions

## Production Deployment

In production, your hosting provider (AWS, Azure, etc.) will provide proper SSL certificates. This setup is only for **local development**.

## Files Created

- `.ssl/cert.pem` - SSL certificate
- `.ssl/key.pem` - Private key
- Both files are **gitignored** and should never be committed

## Security Note

The self-signed certificates are only for local development. They provide encryption but are not verified by a Certificate Authority. This is perfectly fine for localhost development.
