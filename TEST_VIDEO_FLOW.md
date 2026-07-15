# 🧪 Video Call Testing Guide

## Quick Test - Happy Path (5 minutes)

### Step 1: Start the App
```bash
cd C:\Users\Avinash\Desktop\Flutters\flutter_projects\nectar-plus-web-fe
npm start
```
Access: **https://localhost:4400**

### Step 2: Navigate to Video Call
1. Login as patient
2. Go to appointments
3. Find appointment with video link
4. Click **"Join Video Call"** button

### Step 3: Verify Permission Screen
✅ **You should see:**
- Modal opens with dark blue background
- Message: "Requesting camera and microphone access..."
- Spinner animation

### Step 4: Grant Permissions
✅ **Browser prompt appears:**
- Chrome/Edge: "Allow nectar-plus-web-fe to use your camera and microphone?"
- Firefox: Similar prompt

**Click "Allow"**

### Step 5: Verify Preview Screen
✅ **You should see:**
- Your camera feed in a rounded rectangle
- Green checkmark icon with text: "Camera and microphone ready"
- Heading: "Ready to join?"
- Large blue button: "Join Call"

### Step 6: Join the Call
**Click "Join Call" button**

✅ **You should see:**
- Message: "Joining video call..."
- Then switches to active call view
- Your video appears in top-right corner (small)
- Main area shows "Waiting for the other participant to join..."
- Bottom controls: Mute, Camera, Leave (red)

### Step 7: Test Controls
✅ **Click Mute button** → Icon changes to slashed microphone
✅ **Click Camera button** → Your video turns off
✅ **Click Leave button** → Modal closes

---

## 🚨 Test Error Handling

### Test 1: Permission Denied

**Setup:**
1. Open https://localhost:4400
2. Click "Join Video Call"

**Action:**
When browser prompts for permissions, **click "Block" or "Deny"**

**Expected Result:**
```
✅ Error screen appears:
   - Red circle with exclamation icon
   - Heading: "Camera/Microphone Access Required"
   - Error message explaining what happened
   - Blue box with numbered instructions:
     1. Look for camera icon 🎥
     2. Click it and select "Allow"
     3. Click "Try Again" button
   - Blue "Try Again" button
   - Gray "Open Meet Fallback" button (if available)
```

**Recovery Test:**
1. Click camera icon 🎥 in browser address bar
2. Change Camera and Microphone to "Allow"
3. Click "Try Again" button in modal
4. Should show preview screen (fixed!)

### Test 2: No Camera Found

**Setup:**
1. Disconnect/disable your camera
2. Open https://localhost:4400
3. Click "Join Video Call"

**Expected Result:**
```
✅ Error screen shows:
   "No camera or microphone found. 
    Please connect a device and try again."
```

**Recovery Test:**
1. Reconnect camera
2. Click "Try Again"
3. Should show preview screen

### Test 3: Camera In Use

**Setup:**
1. Open Zoom/Teams/another video app
2. Start video in that app (camera is now in use)
3. Keep it running
4. Open https://localhost:4400
5. Click "Join Video Call"

**Expected Result:**
```
✅ Error screen shows:
   "Camera or microphone is already in use. 
    Please close other applications (Zoom, Teams, etc.) 
    and try again."
```

**Recovery Test:**
1. Close Zoom/Teams
2. Click "Try Again"
3. Should show preview screen

---

## 🔍 Browser-Specific Tests

### Chrome/Edge
- [ ] Permission prompt shows at top of page
- [ ] Can click "Allow" or "Block"
- [ ] Camera icon appears in address bar
- [ ] Can change permissions via icon
- [ ] Preview shows mirrored video (correct)

### Firefox
- [ ] Permission prompt shows as popup
- [ ] Can click "Allow" or "Block"
- [ ] Lock icon shows permissions
- [ ] Can change via lock icon → Permissions
- [ ] Preview shows mirrored video (correct)

---

## 📱 Mobile Testing (Optional)

### iOS Safari
1. Open https://your-domain.com (must be production HTTPS)
2. Click "Join Video Call"
3. iOS shows permission dialog
4. Allow camera/microphone
5. Preview appears
6. Join call works

### Android Chrome
1. Open https://your-domain.com
2. Click "Join Video Call"
3. Android shows permission dialog
4. Allow permissions
5. Preview appears
6. Join call works

---

## ✅ Complete Test Checklist

### Pre-Call Permission Screen
- [ ] Modal opens on "Join Video Call" click
- [ ] Shows "Requesting access..." with spinner
- [ ] Browser permission prompt appears
- [ ] Clicking "Allow" shows preview screen
- [ ] Clicking "Block" shows error screen

### Preview Screen
- [ ] Camera feed visible
- [ ] Video is mirrored (scaleX(-1))
- [ ] Green checkmark shows
- [ ] Text says "Camera and microphone ready"
- [ ] "Join Call" button is large and blue
- [ ] Button has camera icon

### Joining Call
- [ ] Clicking "Join Call" shows "Joining..." message
- [ ] Connects to Twilio room
- [ ] Preview stops, call tracks start
- [ ] Self-view moves to top-right corner
- [ ] Self-view is smaller (160x220px)
- [ ] Main area shows remote participant (or waiting message)

### Active Call
- [ ] Controls visible at bottom
- [ ] Mute button works (toggles icon)
- [ ] Camera button works (video on/off)
- [ ] Leave button works (closes modal)
- [ ] Participant count shows "2 in room" when both joined
- [ ] Remote video appears when other person joins

### Error Handling
- [ ] Permission denied → Clear error + instructions
- [ ] No camera → Specific error message
- [ ] Camera in use → Specific error message
- [ ] "Try Again" button visible
- [ ] "Try Again" button works
- [ ] Fallback button shows (if Meet URL exists)
- [ ] Fallback button opens Google Meet

### Cleanup
- [ ] Closing modal stops all tracks
- [ ] No console errors after closing
- [ ] Can reopen modal and join again
- [ ] Preview stream cleaned up properly

---

## 🎯 Quick Validation Script

Open **Developer Console** (F12) and paste:

```javascript
// Quick validation
console.log('🧪 Testing Video Call Implementation');

// Check getUserMedia support
const hasGetUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
console.log(`getUserMedia supported: ${hasGetUserMedia ? '✅' : '❌'}`);

// Check protocol
const isSecure = window.location.protocol === 'https:' || ['localhost', '127.0.0.1'].includes(window.location.hostname);
console.log(`Secure context: ${isSecure ? '✅' : '❌'} (${window.location.protocol})`);

// Check devices
navigator.mediaDevices.enumerateDevices().then(devices => {
  const cameras = devices.filter(d => d.kind === 'videoinput').length;
  const mics = devices.filter(d => d.kind === 'audioinput').length;
  console.log(`Cameras: ${cameras > 0 ? '✅' : '❌'} (${cameras} found)`);
  console.log(`Microphones: ${mics > 0 ? '✅' : '❌'} (${mics} found)`);
  
  if (hasGetUserMedia && isSecure && cameras > 0 && mics > 0) {
    console.log('✅ All checks passed! Video calls should work.');
  } else {
    console.log('❌ Some checks failed. Review above for issues.');
  }
});
```

---

## 🐛 Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Black screen in preview | Permissions not granted | Check browser address bar for camera icon |
| No permission prompt | Already blocked before | Click camera icon, change to Allow |
| "getUserMedia not supported" | Using HTTP | Use https://localhost:4400 |
| Camera icon doesn't show | Wrong URL | Verify HTTPS URL |
| Preview works, join fails | Token expired | Check backend token generation |
| No remote video | Other person didn't join | Wait or check network |

---

## 📊 Performance Metrics

**Expected Load Times:**
- Modal open: < 100ms
- Permission request: < 500ms
- Preview display: < 1 second
- Twilio SDK load: 1-2 seconds (code-split)
- Call connection: 2-5 seconds

**Resource Usage:**
- Initial bundle: ~150KB (Twilio SDK is lazy-loaded)
- Memory: ~50-100MB during active call
- CPU: 10-30% during active call

---

## 🎬 Demo Script (Show to Stakeholders)

```
1. "Let me show you our video consultation feature"
   → Click "Join Video Call"

2. "First, we ask for camera permission - industry standard"
   → Browser prompts, click Allow

3. "User sees themselves before joining - builds confidence"
   → Preview screen shows

4. "When ready, they click Join Call"
   → Click button, connects

5. "Clean, simple interface during the call"
   → Show mute, camera, leave controls

6. "If permission is denied, we give clear instructions"
   → Demonstrate error screen

7. "Users can retry without refreshing the page"
   → Show Try Again button
```

---

**Testing Complete?** Check off all items above, then deploy to production! 🚀
