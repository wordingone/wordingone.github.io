# Complete GitHub Release Upload Script
# This will guide you through creating a release and uploading all GLB models to bypass Git LFS

Write-Host "🚀 GitHub Release Upload Guide for Models..." -ForegroundColor Green

# Navigate to repository root
Set-Location "B:\GIT\wordingone.github.io"

# Check if models exist
if (-not (Test-Path "models")) {
    Write-Host "❌ Models directory not found" -ForegroundColor Red
    exit 1
}

# Get list of GLB files
$glbFiles = Get-ChildItem "models\*.glb"
Write-Host "📦 Found $($glbFiles.Count) GLB files to upload:" -ForegroundColor Cyan
$glbFiles | ForEach-Object { Write-Host "  - $($_.Name)" -ForegroundColor White }

Write-Host "`n⚠️  MANUAL STEPS REQUIRED:" -ForegroundColor Yellow
Write-Host "GitHub CLI is not available, so you need to manually upload the models:" -ForegroundColor White
Write-Host "`n1. Go to: https://github.com/wordingone/wordingone.github.io/releases" -ForegroundColor Cyan
Write-Host "2. Click 'Create a new release'" -ForegroundColor Cyan  
Write-Host "3. Set tag version: 'v1.0'" -ForegroundColor Cyan
Write-Host "4. Set title: 'Website Models v1.0'" -ForegroundColor Cyan
Write-Host "5. Drag and drop all GLB files from the models folder" -ForegroundColor Cyan
Write-Host "6. Click 'Publish release'" -ForegroundColor Cyan

Write-Host "`n📁 Files to upload:" -ForegroundColor Green
$glbFiles | ForEach-Object { Write-Host "   $($_.FullName)" -ForegroundColor Yellow }

Write-Host "`n🔄 After upload, run the next script to update your website" -ForegroundColor Green

# Offer to open the releases page
Write-Host "`nWould you like to open the GitHub releases page now? (y/n): " -NoNewline -ForegroundColor Yellow
$response = Read-Host

if ($response -eq 'y' -or $response -eq 'Y') {
    Start-Process "https://github.com/wordingone/wordingone.github.io/releases"
    Write-Host "✅ GitHub releases page opened in browser" -ForegroundColor Green
}

Write-Host "`n💡 Once you've uploaded the models, run: .\update_script_for_release.ps1" -ForegroundColor Cyan
