# Complete cleanup and fix script
# Run this from your repository root: B:\GIT\wordingone.github.io

Write-Host "🧹 Cleaning up duplicate folders and fixing website..." -ForegroundColor Green

# 1. Remove duplicate Website-Core folder
if (Test-Path "Website-Core") {
    Write-Host "Removing duplicate Website-Core folder..." -ForegroundColor Yellow
    Remove-Item "Website-Core" -Recurse -Force
    Write-Host "✅ Duplicate folder removed" -ForegroundColor Green
}

# 2. Copy missing LiDAR image to correct location
$lidarSource = "Website Core\src\assets\lidar\original image\lidar_00.png"
$lidarDest = "Website Core\Skeleton\lidar_00.png"

if (Test-Path $lidarSource) {
    Write-Host "Copying LiDAR image to Skeleton folder..." -ForegroundColor Yellow
    Copy-Item $lidarSource $lidarDest
    Write-Host "✅ LiDAR image copied" -ForegroundColor Green
} else {
    Write-Host "⚠️ LiDAR image not found at $lidarSource" -ForegroundColor Red
}

# 3. Check if GitHub CLI is installed
if (!(Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Host "❌ GitHub CLI not installed. Installing..." -ForegroundColor Red
    winget install GitHub.cli
    Write-Host "✅ GitHub CLI installed. Please restart PowerShell and run this script again." -ForegroundColor Green
    exit
}

# 4. Login to GitHub (if not already logged in)
$authStatus = gh auth status 2>&1
if ($authStatus -like "*not logged*") {
    Write-Host "Please login to GitHub CLI..." -ForegroundColor Yellow
    gh auth login
}

# 5. Create release and upload models
Write-Host "Creating GitHub release and uploading models..." -ForegroundColor Yellow

# Navigate to models directory
$modelsPath = "Website Core\Skeleton\src\assets\models"
if (Test-Path $modelsPath) {
    Push-Location $modelsPath
    
    # Create release
    gh release create "v1.0" --title "Website Models" --notes "3D models for the interactive website" 2>$null
    
    # Upload all .glb files
    $glbFiles = Get-ChildItem "*.glb"
    foreach ($file in $glbFiles) {
        Write-Host "Uploading $($file.Name)..." -ForegroundColor Cyan
        gh release upload "v1.0" $file.Name --clobber
    }
    
    Pop-Location
    Write-Host "✅ All models uploaded to release" -ForegroundColor Green
} else {
    Write-Host "❌ Models directory not found: $modelsPath" -ForegroundColor Red
}

# 6. Commit changes
Write-Host "Committing changes..." -ForegroundColor Yellow
git add -A
git commit -m "Clean up folders, add LiDAR image, prepare for release-based model loading"
git push origin main

Write-Host "🎉 Cleanup complete! Next steps:" -ForegroundColor Green
Write-Host "1. Update your script.js to use release URLs" -ForegroundColor White
Write-Host "2. Test the website" -ForegroundColor White

# Display release URLs for reference
Write-Host "`n📦 Your model release URLs:" -ForegroundColor Cyan
gh release view "v1.0" --json assets --jq '.assets[].browser_download_url'
