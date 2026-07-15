# PowerShell script to apply the Permissions Policy fix

Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "  Permissions Policy Fix - Apply Changes" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

Write-Host "`n📝 Summary of Changes:" -ForegroundColor Yellow
Write-Host "  1. server.ts - Updated Permissions-Policy header" -ForegroundColor Gray
Write-Host "     Changed: camera=() → camera=(self)" -ForegroundColor Gray
Write-Host "     Changed: microphone=() → microphone=(self)" -ForegroundColor Gray
Write-Host "`n  2. src/index.html - Added Permissions-Policy meta tag" -ForegroundColor Gray

Write-Host "`n🔧 Applying fix..." -ForegroundColor Yellow

# Step 1: Rebuild the application
Write-Host "`nStep 1: Rebuilding application..." -ForegroundColor Cyan
Write-Host "(This compiles server.ts with the new changes)" -ForegroundColor Gray

npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Build failed! Please check for errors above." -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ Build successful!" -ForegroundColor Green

# Step 2: Instructions for testing
Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "  ✅ Fix Applied Successfully!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan

Write-Host "`n📋 Next Steps:" -ForegroundColor Yellow
Write-Host "`n  1. Start the server:" -ForegroundColor White
Write-Host "     npm start" -ForegroundColor Cyan

Write-Host "`n  2. Clear browser cache:" -ForegroundColor White
Write-Host "     Press Ctrl + Shift + Delete" -ForegroundColor Cyan
Write-Host "     OR do hard refresh: Ctrl + Shift + R" -ForegroundColor Cyan

Write-Host "`n  3. Open your browser:" -ForegroundColor White
Write-Host "     https://localhost:4400" -ForegroundColor Cyan

Write-Host "`n  4. Test video call:" -ForegroundColor White
Write-Host "     - Navigate to appointment" -ForegroundColor Cyan
Write-Host "     - Click 'Join Video Call'" -ForegroundColor Cyan
Write-Host "     - Permission prompt should appear!" -ForegroundColor Cyan
Write-Host "     - Click 'Allow'" -ForegroundColor Cyan
Write-Host "     - Camera preview should show ✅" -ForegroundColor Green

Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "  📚 Documentation:" -ForegroundColor Yellow
Write-Host "  - FIX_PERMISSIONS_POLICY.md (detailed guide)" -ForegroundColor Gray
Write-Host "  - IMPLEMENTATION_COMPLETE.md (full overview)" -ForegroundColor Gray
Write-Host "==================================================" -ForegroundColor Cyan

Write-Host "`n✨ Ready to test! Run: npm start" -ForegroundColor Green
Write-Host ""
