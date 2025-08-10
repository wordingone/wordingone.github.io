# Script to upload GLB models to GitHub Release
# This bypasses the Git LFS limitation on GitHub Pages

Write-Host "GitHub Release Model Upload Script" -ForegroundColor Green
Write-Host "This script will help you upload your GLB models to a GitHub release" -ForegroundColor Yellow

$modelDir = "Website Core\Skeleton\src\assets\models"
$releaseTag = "models"
$releaseName = "3D Models for Website"

Write-Host "Checking for GLB files in: $modelDir" -ForegroundColor Cyan

if (Test-Path $modelDir) {
    $glbFiles = Get-ChildItem $modelDir -Filter "*.glb"
    
    Write-Host "Found $($glbFiles.Count) GLB files:" -ForegroundColor Green
    foreach ($file in $glbFiles) {
        Write-Host "  - $($file.Name) ($([math]::Round($file.Length / 1MB, 2)) MB)" -ForegroundColor White
    }
    
    Write-Host "`nTo upload these files to GitHub Release:" -ForegroundColor Yellow
    Write-Host "1. Go to: https://github.com/wordingone/wordingone.github.io/releases" -ForegroundColor White
    Write-Host "2. Click 'Create a new release'" -ForegroundColor White
    Write-Host "3. Set tag: '$releaseTag'" -ForegroundColor White
    Write-Host "4. Set title: '$releaseName'" -ForegroundColor White
    Write-Host "5. Drag and drop all GLB files from: $((Get-Location).Path)\$modelDir" -ForegroundColor White
    Write-Host "6. Click 'Publish release'" -ForegroundColor White
    
    Write-Host "`nAfter upload, your models will be available at:" -ForegroundColor Green
    Write-Host "https://github.com/wordingone/wordingone.github.io/releases/download/$releaseTag/[filename].glb" -ForegroundColor Cyan
    
    Write-Host "`nWould you like to open the releases page now? (y/n): " -NoNewline -ForegroundColor Yellow
    $response = Read-Host
    
    if ($response -eq 'y' -or $response -eq 'Y') {
        Start-Process "https://github.com/wordingone/wordingone.github.io/releases"
    }
} else {
    Write-Host "Model directory not found: $modelDir" -ForegroundColor Red
    Write-Host "Please run this script from the repository root directory." -ForegroundColor Yellow
}

Write-Host "`nPress any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
