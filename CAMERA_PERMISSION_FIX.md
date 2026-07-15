# Camera/Microphone Permission Fix Guide

## Error: "Camera/microphone permission denied"

This error occurs when the browser blocks access to your camera and microphone. Here's how to fix it:

---

## ✅ Quick Fix (Most Common)

### Step 1: Check Your URL
Make sure you're accessing the app via **HTTPS**:
- ✅ **Correct**: `https://localhost:4400`
- ❌ **Wrong**: `http://localhost:4400`

### Step 2: Grant Permissions

**When joining a video call:**
1. Browser will show a permission prompt at the top
2. Click **"Allow"** for both camera and microphone
3. Check "Remember this decision" (optional)

**If you accidentally clicked "Block":**

#### Chrome/Edge:
1. Click the **🔒 padlock** or **🎥 camera icon** in the address bar
2. Find "Camera" and "Microphone"
3. Change both from "Block" to **"Allow"**
4. Refresh the page (F5)
5. Try joining the video call again

#### Firefox:
1. Click the **🔒 padlock** icon in the address bar
2. Click the **"X"** next to "Blocked Temporarily"
3. Or click **"Clear Permission"**
4. Refresh the page (F5)
5. Click **"Allow"** when prompted again

---

## 🔍 Advanced Troubleshooting

### Issue 1: No Permission Prompt Appears

**Cause**: Permissions were previously blocked

**Fix**:
1. **Chrome/Edge**:
   - Click `⋮` (menu) → Settings
   - Search for "Site settings"
   - Click "Camera" and "Microphone"
   - Find your site in the "Blocked" list
   - Move it to "Allowed" or delete it

2. **Firefox**:
   - Click `☰` (menu) → Settings
   - Privacy & Security → Permissions
   - Click "Settings..." next to Camera and Microphone
   - Find your site and change to "Allow"

### Issue 2: Using HTTP Instead of HTTPS

**Symptoms**:
- Permission prompt never appears
- Console shows "getUserMedia is not supported"
- Error message shows `http://` in URL

**Fix**:
1. Make sure SSL certificates are generated:
   ```powershell
   cd C:\Users\Avinash\Desktop\Flutters\flutter_projects\nectar-plus-web-fe
   .\generate-ssl-cert.ps1
   ```

2. Start the server:
   ```cmd
   npm start
   ```

3. Access via: **https://localhost:4400** (note the 's' in https)

### Issue 3: Camera Already in Use

**Symptoms**: Error says "Camera or microphone is already in use"

**Fix**: Close these apps/tabs:
- Zoom, Microsoft Teams, Skype, Google Meet
- Other browser tabs with video calls
- Windows Camera app
- Any video recording software

**Windows Task Manager Method**:
1. Press `Ctrl + Shift + Esc`
2. Look for apps using camera (they'll have a camera icon)
3. Right-click → End Task

### Issue 4: No Camera/Microphone Found

**Symptoms**: Error says "No camera or microphone found"

**Fix**:
1. **Check connections**: Ensure camera/microphone is plugged in
2. **Test in Windows Settings**:
   - Open Settings → Privacy & Security → Camera
   - Test your camera in the preview
   - Do the same for Microphone
3. **Update drivers**:
   - Open Device Manager
   - Find "Cameras" and "Audio inputs and outputs"
   - Right-click your device → Update driver

### Issue 5: Windows Privacy Settings

**Symptoms**: Permission prompt doesn't appear, camera won't activate

**Fix**:
1. Open **Windows Settings** (Win + I)
2. Go to **Privacy & Security** → **Camera**
3. Turn ON:
   - "Camera access"
   - "Let apps access your camera"
   - "Let desktop apps access your camera"
4. Repeat for **Microphone** settings
5. Restart your browser

---

## 🧪 Testing Permissions

### Browser Console Test

1. Open Developer Tools (F12)
2. Go to **Console** tab
3. Paste this code:
```javascript
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  .then(stream => {
    console.log('✅ Permissions granted!', stream);
    stream.getTracks().forEach(track => track.stop());
  })
  .catch(error => {
    console.error('❌ Permission denied:', error.name, error.message);
  });
```
4. Press Enter
5. Allow permissions if prompted
6. Check the result

### Expected Results:
- ✅ "Permissions granted!" = Everything works
- ❌ "NotAllowedError" = You blocked permissions
- ❌ "NotFoundError" = No camera/microphone detected
- ❌ "NotReadableError" = Camera in use by another app
- ❌ "NotSupportedError" = Using HTTP instead of HTTPS

---

## 🌐 Browser-Specific Instructions

### Google Chrome / Microsoft Edge

**Grant Permissions**:
1. Click 🎥 camera icon in address bar
2. Set Camera and Microphone to "Allow"
3. Refresh page

**Reset Permissions**:
1. chrome://settings/content/camera (paste in address bar)
2. Remove your site from "Blocked" or "Allowed"
3. Revisit the site and grant permissions again

### Mozilla Firefox

**Grant Permissions**:
1. Click 🔒 padlock in address bar
2. Click ">" next to "Permissions"
3. Set Camera and Microphone to "Allow"
4. Refresh page

**Reset Permissions**:
1. about:preferences#privacy (paste in address bar)
2. Scroll to "Permissions"
3. Click "Settings..." next to Camera and Microphone
4. Remove your site from the list
5. Revisit the site and grant permissions again

### Safari (macOS)

**Grant Permissions**:
1. Safari → Settings → Websites
2. Click "Camera" and "Microphone"
3. Find your site and set to "Allow"

**System Permissions**:
1. System Preferences → Security & Privacy
2. Camera and Microphone tabs
3. Check the box next to Safari

---

## 📋 Checklist Before Video Call

- [ ] Using **HTTPS** (https://localhost:4400)
- [ ] SSL certificates generated (`.ssl/` folder exists)
- [ ] Camera/microphone physically connected
- [ ] No other apps using camera/microphone
- [ ] Windows privacy settings allow camera/microphone
- [ ] Browser permissions set to "Allow"
- [ ] Page refreshed after changing permissions

---

## 🚨 Still Not Working?

### Try a Different Browser
Test in another browser to isolate the issue:
- Chrome
- Edge
- Firefox

### Check Browser Version
Make sure you're using a modern browser:
- Chrome/Edge: Version 80+
- Firefox: Version 70+

### Incognito/Private Mode Test
Sometimes extensions block permissions:
1. Open an incognito/private window
2. Navigate to https://localhost:4400
3. Try joining the video call
4. If it works, disable extensions in normal mode

### Developer Console Errors
1. Open Developer Tools (F12)
2. Go to Console tab
3. Look for red errors when joining video call
4. Share error messages for further help

---

## 💡 Understanding the Error

**Why does this happen?**

Modern browsers require:
1. **HTTPS connection** (or localhost)
2. **User permission** (must click "Allow")
3. **System permissions** (Windows/OS settings)
4. **Available device** (camera not in use)

All four must be satisfied for video calls to work.

**Security Model**:
- `getUserMedia` API requires explicit user consent
- Protects users from malicious sites accessing camera/microphone
- Permissions can be revoked at any time

---

## 🔐 Production Considerations

**Development (localhost)**:
- Uses self-signed SSL certificate
- Browser shows security warning (safe to ignore)
- Permissions must be granted per session

**Production (deployed)**:
- Uses real SSL certificate from hosting provider
- No browser security warnings
- Permissions can be remembered permanently

---

## 📞 Support Resources

- **Twilio Video Docs**: https://www.twilio.com/docs/video/javascript
- **Browser Compatibility**: https://www.twilio.com/docs/video/javascript#browser-support
- **MDN getUserMedia**: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia

---

**Last Updated**: January 2025
**Status**: Comprehensive troubleshooting guide
