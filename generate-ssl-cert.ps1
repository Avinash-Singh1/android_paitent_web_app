# PowerShell script to generate self-signed SSL certificate for local development
# This enables HTTPS on localhost which is required for getUserMedia (camera/microphone access)

$certDir = ".ssl"
$certFile = "$certDir\cert.pem"
$keyFile = "$certDir\key.pem"

# Create .ssl directory if it doesn't exist
if (-Not (Test-Path $certDir)) {
    New-Item -ItemType Directory -Path $certDir | Out-Null
    Write-Host "✓ Created .ssl directory" -ForegroundColor Green
}

# Check if certificates already exist
if ((Test-Path $certFile) -and (Test-Path $keyFile)) {
    Write-Host "⚠ SSL certificates already exist in .ssl/" -ForegroundColor Yellow
    $response = Read-Host "Do you want to regenerate them? (y/n)"
    if ($response -ne "y") {
        Write-Host "✓ Using existing certificates" -ForegroundColor Green
        exit 0
    }
}

Write-Host "`nGenerating self-signed SSL certificate for localhost..." -ForegroundColor Cyan

# Generate certificate using OpenSSL (if available) or mkcert (preferred)
$mkcertAvailable = Get-Command mkcert -ErrorAction SilentlyContinue
$opensslAvailable = Get-Command openssl -ErrorAction SilentlyContinue

if ($mkcertAvailable) {
    Write-Host "Using mkcert (recommended)..." -ForegroundColor Green
    
    # Install local CA if not already installed
    mkcert -install
    
    # Generate certificate
    mkcert -key-file $keyFile -cert-file $certFile localhost 127.0.0.1 ::1
    
    Write-Host "`n✓ SSL certificate generated successfully!" -ForegroundColor Green
    Write-Host "  - Certificate: $certFile" -ForegroundColor Gray
    Write-Host "  - Key: $keyFile" -ForegroundColor Gray
    
} elseif ($opensslAvailable) {
    Write-Host "Using OpenSSL..." -ForegroundColor Green
    
    # Generate private key and certificate
    openssl req -x509 -newkey rsa:4096 -keyout $keyFile -out $certFile -days 365 -nodes -subj "/CN=localhost"
    
    Write-Host "`n✓ SSL certificate generated successfully!" -ForegroundColor Green
    Write-Host "  - Certificate: $certFile" -ForegroundColor Gray
    Write-Host "  - Key: $keyFile" -ForegroundColor Gray
    Write-Host "`n⚠ Note: You'll need to manually trust this certificate in your browser" -ForegroundColor Yellow
    
} else {
    Write-Host "`n✗ Error: Neither mkcert nor OpenSSL found" -ForegroundColor Red
    Write-Host "`nPlease install one of the following:" -ForegroundColor Yellow
    Write-Host "  1. mkcert (recommended): choco install mkcert" -ForegroundColor Cyan
    Write-Host "     or download from: https://github.com/FiloSottile/mkcert" -ForegroundColor Cyan
    Write-Host "  2. OpenSSL: choco install openssl" -ForegroundColor Cyan
    Write-Host "     or download from: https://slproweb.com/products/Win32OpenSSL.html" -ForegroundColor Cyan
    exit 1
}

Write-Host "`n✓ Done! You can now run: npm start" -ForegroundColor Green
Write-Host "  The app will be available at: https://localhost:4400" -ForegroundColor Cyan
Write-Host "`nNote: Your browser may show a security warning for the first time." -ForegroundColor Gray
Write-Host "Click 'Advanced' and 'Proceed to localhost' to continue." -ForegroundColor Gray
