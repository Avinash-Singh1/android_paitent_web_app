# Simple SSL certificate generator for development
Write-Host "Generating self-signed SSL certificates for localhost..." -ForegroundColor Green

# Create .ssl directory if it doesn't exist
if (-not (Test-Path ".ssl")) {
    New-Item -ItemType Directory -Path ".ssl" | Out-Null
}

# Use OpenSSL if available, otherwise create basic certs
$opensslPath = (Get-Command openssl -ErrorAction SilentlyContinue).Source

if ($opensslPath) {
    Write-Host "Found OpenSSL, generating certificates..." -ForegroundColor Yellow
    
    # Generate private key
    & openssl genrsa -out .ssl/key.pem 2048 2>$null
    
    # Generate certificate
    & openssl req -new -x509 -key .ssl/key.pem -out .ssl/cert.pem -days 365 `
        -subj "/C=US/ST=State/L=City/O=Organization/OU=IT/CN=localhost" 2>$null
    
    Write-Host "✓ SSL certificates created successfully!" -ForegroundColor Green
    Write-Host "  - Certificate: .ssl/cert.pem" -ForegroundColor Cyan
    Write-Host "  - Private Key: .ssl/key.pem" -ForegroundColor Cyan
} else {
    Write-Host "OpenSSL not found. Creating placeholder files..." -ForegroundColor Yellow
    Write-Host "NOTE: For development, you can run without SSL using:" -ForegroundColor Yellow
    Write-Host "  ng serve --port 4400 --host localhost --ssl=false" -ForegroundColor Cyan
    
    # Create placeholder files
    "" | Out-File -FilePath ".ssl/cert.pem" -Encoding ASCII
    "" | Out-File -FilePath ".ssl/key.pem" -Encoding ASCII
    
    Write-Host "`nAlternatively, install OpenSSL:" -ForegroundColor Yellow
    Write-Host "  choco install openssl" -ForegroundColor Cyan
    Write-Host "  Or download from: https://slproweb.com/products/Win32OpenSSL.html" -ForegroundColor Cyan
}

Write-Host "`nYou can now run: npm start" -ForegroundColor Green
