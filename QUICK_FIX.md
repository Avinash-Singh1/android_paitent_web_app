# 🚀 Quick Fix: Camera Permission Denied

## 📍 Problem
Getting error: **"Camera/microphone permission denied. Please allow access and try again."**

---

## ⚡ 3-Step Quick Fix

### 1️⃣ Check Your URL
```
❌ WRONG:  http://localhost:4400
✅ CORRECT: https://localhost:4400
```
**Note the "s" in https!**

### 2️⃣ Click the Camera Icon
Look at your browser's address bar:

**Chrome/Edge**: Click the 🎥 or 🔒 icon
**Firefox**: Click the 🔒 icon

### 3️⃣ Set Permissions to "Allow"
- Camera: **Allow**
- Microphone: **Allow**
- Click "Refresh" or press F5

---

## 🎯 Most Common Issues

| Symptom | Cause | Fix |
|---------|-------|-----|
| No permission prompt | Previously blocked | Click 🎥 icon → Change to "Allow" |
| Using http:// | No SSL | Use https://localhost:4400 |
| Camera icon shows ⛔ | Blocked | Click icon → Change to "Allow" → Refresh |
| "Already in use" error | Other app using camera | Close Zoom/Teams/other tabs |

---

## 🔧 Windows Privacy Settings

If the above doesn't work:

1. Open **Windows Settings** (Win + I)
2. Go to **Privacy & Security**
3. Click **Camera** → Turn ON all toggles
4. Click **Microphone** → Turn ON all toggles
5. Restart browser

---

## ✅ Verification

**Test if permissions work:**

1. Open **Developer Console** (F12)
2. Paste this in Console tab:
```javascript
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  .then(() => console.log('✅ Works!'))
  .catch(err => console.error('❌ Failed:', err.name));
```
3. Press Enter
4. If you see "✅ Works!" - permissions are granted!

---

## 🌐 Browser-Specific Quick Fixes

### Chrome/Edge
```
1. Click 🎥 in address bar
2. Camera → Allow
3. Microphone → Allow
4. Refresh (F5)
```

### Firefox
```
1. Click 🔒 in address bar
2. Click ">" next to Permissions
3. Camera → Allow
4. Microphone → Allow
5. Refresh (F5)
```

---

## 📱 Still Stuck?

**Try these in order:**

1. ✅ **Restart Browser** - Close completely and reopen
2. ✅ **Different Browser** - Try Chrome if using Edge, or vice versa
3. ✅ **Incognito Mode** - Test without extensions (Ctrl+Shift+N)
4. ✅ **Check Camera** - Open Windows Camera app to verify device works
5. ✅ **Read Full Guide** - See `CAMERA_PERMISSION_FIX.md` for detailed troubleshooting

---

## 🎬 Expected Behavior

**When joining a video call:**

1. Browser shows permission prompt at top
2. You click "Allow"
3. Video call connects
4. You see yourself in the preview
5. Doctor/patient can see and hear you

---

## 💬 Common Error Messages Explained

| Error Message | What It Means | Quick Fix |
|---------------|---------------|-----------|
| Permission denied | You clicked "Block" | Click 🎥 icon → Allow |
| getUserMedia not supported | Using HTTP | Use https:// |
| Camera in use | Another app has camera | Close other apps |
| No camera found | Device not connected | Plug in camera |

---

## ⚙️ Developer Notes

**If you're a developer working on this:**

- Service file: `src/app/services/twilio-video.service.ts`
- Component: `src/app/shared/components/twilio-video-dialog/`
- Error handling: Now provides detailed user-friendly messages
- Permission check: New `checkPermissions()` method available

**Testing permissions programmatically:**
```typescript
const result = await this.twilioService.checkPermissions();
if (result.granted) {
  // Permissions OK
} else {
  console.error(result.error);
}
```

---

**Need more help?** See `CAMERA_PERMISSION_FIX.md` for comprehensive troubleshooting!
