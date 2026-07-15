/**
 * Camera/Microphone Diagnostic Tool
 * 
 * Usage:
 * 1. Open Developer Console (F12)
 * 2. Paste this entire file content
 * 3. Press Enter
 * 4. Review the diagnostic output
 */

(async function diagnoseCameraIssues() {
  console.clear();
  console.log('%c🔍 Camera/Microphone Diagnostic Tool', 'font-size: 20px; font-weight: bold; color: #2196F3;');
  console.log('%c═══════════════════════════════════════', 'color: #2196F3;');
  console.log('');

  const results = {
    protocol: window.location.protocol,
    host: window.location.host,
    isSecureContext: window.isSecureContext,
    hasMediaDevices: !!navigator.mediaDevices,
    hasGetUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
    devices: [],
    permissionStatus: null,
    testStream: null,
    errors: []
  };

  // 1. Check Protocol
  console.log('%c📡 Protocol Check', 'font-size: 16px; font-weight: bold; color: #FF9800;');
  console.log(`   Protocol: ${results.protocol}`);
  console.log(`   Host: ${results.host}`);
  console.log(`   Secure Context: ${results.isSecureContext}`);
  
  if (results.protocol === 'http:' && !['localhost', '127.0.0.1'].includes(window.location.hostname)) {
    console.log('%c   ❌ ISSUE: Using HTTP on non-localhost', 'color: #f44336; font-weight: bold;');
    console.log('%c   FIX: Use https:// instead', 'color: #4CAF50; font-weight: bold;');
    results.errors.push('Using HTTP instead of HTTPS');
  } else {
    console.log('%c   ✅ Protocol OK', 'color: #4CAF50; font-weight: bold;');
  }
  console.log('');

  // 2. Check API Availability
  console.log('%c🌐 API Availability', 'font-size: 16px; font-weight: bold; color: #FF9800;');
  console.log(`   navigator.mediaDevices: ${results.hasMediaDevices ? '✅ Available' : '❌ Not available'}`);
  console.log(`   getUserMedia: ${results.hasGetUserMedia ? '✅ Available' : '❌ Not available'}`);
  
  if (!results.hasGetUserMedia) {
    console.log('%c   ❌ ISSUE: getUserMedia not available', 'color: #f44336; font-weight: bold;');
    console.log('%c   FIX: Use HTTPS or update your browser', 'color: #4CAF50; font-weight: bold;');
    results.errors.push('getUserMedia API not available');
  } else {
    console.log('%c   ✅ APIs OK', 'color: #4CAF50; font-weight: bold;');
  }
  console.log('');

  // 3. Enumerate Devices
  console.log('%c🎥 Device Detection', 'font-size: 16px; font-weight: bold; color: #FF9800;');
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    results.devices = devices;
    
    const cameras = devices.filter(d => d.kind === 'videoinput');
    const microphones = devices.filter(d => d.kind === 'audioinput');
    
    console.log(`   Cameras found: ${cameras.length}`);
    cameras.forEach((cam, i) => {
      console.log(`     ${i + 1}. ${cam.label || 'Unknown Camera'} (${cam.deviceId.slice(0, 8)}...)`);
    });
    
    console.log(`   Microphones found: ${microphones.length}`);
    microphones.forEach((mic, i) => {
      console.log(`     ${i + 1}. ${mic.label || 'Unknown Microphone'} (${mic.deviceId.slice(0, 8)}...)`);
    });
    
    if (cameras.length === 0) {
      console.log('%c   ⚠️  WARNING: No cameras detected', 'color: #FF9800; font-weight: bold;');
      console.log('%c   FIX: Connect a camera or check device drivers', 'color: #4CAF50; font-weight: bold;');
      results.errors.push('No camera devices found');
    }
    
    if (microphones.length === 0) {
      console.log('%c   ⚠️  WARNING: No microphones detected', 'color: #FF9800; font-weight: bold;');
      console.log('%c   FIX: Connect a microphone or check device drivers', 'color: #4CAF50; font-weight: bold;');
      results.errors.push('No microphone devices found');
    }
    
    if (cameras.length > 0 && microphones.length > 0) {
      console.log('%c   ✅ Devices OK', 'color: #4CAF50; font-weight: bold;');
    }
  } catch (err) {
    console.log('%c   ❌ Failed to enumerate devices:', 'color: #f44336; font-weight: bold;', err.message);
    results.errors.push('Device enumeration failed: ' + err.message);
  }
  console.log('');

  // 4. Check Permissions API
  console.log('%c🔐 Permission Status', 'font-size: 16px; font-weight: bold; color: #FF9800;');
  try {
    if (navigator.permissions && navigator.permissions.query) {
      const cameraPermission = await navigator.permissions.query({ name: 'camera' });
      const micPermission = await navigator.permissions.query({ name: 'microphone' });
      
      console.log(`   Camera permission: ${cameraPermission.state}`);
      console.log(`   Microphone permission: ${micPermission.state}`);
      
      results.permissionStatus = {
        camera: cameraPermission.state,
        microphone: micPermission.state
      };
      
      if (cameraPermission.state === 'denied' || micPermission.state === 'denied') {
        console.log('%c   ❌ ISSUE: Permissions denied', 'color: #f44336; font-weight: bold;');
        console.log('%c   FIX: Click camera icon in address bar → Change to "Allow" → Refresh page', 'color: #4CAF50; font-weight: bold;');
        results.errors.push('Permissions denied by user');
      } else if (cameraPermission.state === 'prompt' || micPermission.state === 'prompt') {
        console.log('%c   ℹ️  Permissions need to be requested', 'color: #2196F3; font-weight: bold;');
      } else {
        console.log('%c   ✅ Permissions OK', 'color: #4CAF50; font-weight: bold;');
      }
    } else {
      console.log('   ℹ️  Permissions API not available (this is OK)');
    }
  } catch (err) {
    console.log(`   ℹ️  Permission check skipped: ${err.message}`);
  }
  console.log('');

  // 5. Test Media Access
  console.log('%c🧪 Testing Media Access', 'font-size: 16px; font-weight: bold; color: #FF9800;');
  console.log('   Attempting to access camera and microphone...');
  
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });
    
    results.testStream = stream;
    
    const videoTracks = stream.getVideoTracks();
    const audioTracks = stream.getAudioTracks();
    
    console.log('%c   ✅ SUCCESS! Media access granted', 'color: #4CAF50; font-weight: bold; font-size: 14px;');
    console.log(`   Video tracks: ${videoTracks.length}`);
    videoTracks.forEach((track, i) => {
      console.log(`     ${i + 1}. ${track.label} (${track.kind}) - ${track.readyState}`);
    });
    console.log(`   Audio tracks: ${audioTracks.length}`);
    audioTracks.forEach((track, i) => {
      console.log(`     ${i + 1}. ${track.label} (${track.kind}) - ${track.readyState}`);
    });
    
    // Stop tracks
    stream.getTracks().forEach(track => track.stop());
    console.log('   ℹ️  Test stream stopped (cleaned up)');
    
  } catch (err) {
    console.log('%c   ❌ FAILED: Could not access media', 'color: #f44336; font-weight: bold;');
    console.log(`   Error name: ${err.name}`);
    console.log(`   Error message: ${err.message}`);
    results.errors.push(`Media access failed: ${err.name} - ${err.message}`);
    
    // Provide specific guidance based on error
    switch (err.name) {
      case 'NotAllowedError':
      case 'PermissionDeniedError':
        console.log('%c   FIX: Click camera icon in address bar → Allow → Refresh', 'color: #4CAF50; font-weight: bold;');
        break;
      case 'NotFoundError':
      case 'DevicesNotFoundError':
        console.log('%c   FIX: Connect camera/microphone and try again', 'color: #4CAF50; font-weight: bold;');
        break;
      case 'NotReadableError':
      case 'TrackStartError':
        console.log('%c   FIX: Close other apps using camera (Zoom, Teams, etc.)', 'color: #4CAF50; font-weight: bold;');
        break;
      case 'NotSupportedError':
        console.log('%c   FIX: Use HTTPS instead of HTTP', 'color: #4CAF50; font-weight: bold;');
        break;
      default:
        console.log('%c   FIX: Check browser console for more details', 'color: #4CAF50; font-weight: bold;');
    }
  }
  console.log('');

  // 6. Summary
  console.log('%c📋 SUMMARY', 'font-size: 18px; font-weight: bold; color: #2196F3;');
  console.log('%c═══════════════════════════════════════', 'color: #2196F3;');
  
  if (results.errors.length === 0) {
    console.log('%c✅ ALL CHECKS PASSED!', 'color: #4CAF50; font-weight: bold; font-size: 16px;');
    console.log('Your camera and microphone should work for video calls.');
  } else {
    console.log('%c❌ ISSUES FOUND:', 'color: #f44336; font-weight: bold; font-size: 16px;');
    results.errors.forEach((error, i) => {
      console.log(`   ${i + 1}. ${error}`);
    });
    console.log('');
    console.log('%c📖 NEXT STEPS:', 'color: #FF9800; font-weight: bold; font-size: 14px;');
    console.log('   1. Review the fixes suggested above');
    console.log('   2. See CAMERA_PERMISSION_FIX.md for detailed instructions');
    console.log('   3. See QUICK_FIX.md for common solutions');
  }
  
  console.log('');
  console.log('%c💾 Full diagnostic data:', 'color: #9E9E9E;');
  console.log(results);
  console.log('');
  console.log('%c═══════════════════════════════════════', 'color: #2196F3;');
  console.log('%cDiagnostics complete!', 'color: #2196F3; font-weight: bold;');
  
  return results;
})();
