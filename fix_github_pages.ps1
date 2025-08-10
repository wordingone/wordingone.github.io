# Fix GitHub Pages by copying Skeleton files to root directory
# This will make the website accessible at wordingone.github.io

Write-Host "🔧 Fixing GitHub Pages deployment..." -ForegroundColor Green

$sourceDir = "Website Core\Skeleton"
$rootDir = "."

# Check if source directory exists
if (-not (Test-Path $sourceDir)) {
    Write-Host "❌ Source directory not found: $sourceDir" -ForegroundColor Red
    exit 1
}

Write-Host "📂 Copying essential files from $sourceDir to root directory..." -ForegroundColor Yellow

# Copy main website files to root
$filesToCopy = @(
    "index.html",
    "script.js", 
    "style.css",
    "lidar_00.png"
)

foreach ($file in $filesToCopy) {
    $sourcePath = Join-Path $sourceDir $file
    $destPath = $file
    
    if (Test-Path $sourcePath) {
        Copy-Item $sourcePath $destPath -Force
        Write-Host "✅ Copied: $file" -ForegroundColor Green
    } else {
        Write-Host "⚠️  File not found: $sourcePath" -ForegroundColor Yellow
    }
}

# Copy models directory
$modelsSource = Join-Path $sourceDir "models"
$modelsDest = "models"

if (Test-Path $modelsSource) {
    if (Test-Path $modelsDest) {
        Remove-Item $modelsDest -Recurse -Force
    }
    Copy-Item $modelsSource $modelsDest -Recurse -Force
    Write-Host "✅ Copied: models directory with all GLB files" -ForegroundColor Green
} else {
    Write-Host "⚠️  Models directory not found: $modelsSource" -ForegroundColor Yellow
}

Write-Host "`n🎉 Files copied successfully!" -ForegroundColor Green
Write-Host "📁 Your website files are now in the root directory where GitHub Pages can find them." -ForegroundColor Cyan

# List what's now in the root directory
Write-Host "`n📋 Root directory contents:" -ForegroundColor Cyan
Get-ChildItem -Path . -Name | Where-Object { $_ -notlike ".*" -and $_ -ne "Website Core" } | ForEach-Object {
    Write-Host "  - $_" -ForegroundColor White
}

Write-Host "`n🔄 Next steps:" -ForegroundColor Yellow
Write-Host "1. Commit and push these changes to GitHub" -ForegroundColor White
Write-Host "2. Wait a few minutes for GitHub Pages to rebuild" -ForegroundColor White
Write-Host "3. Visit https://wordingone.github.io to see your website" -ForegroundColor White

Write-Host "`n💡 The website should now work properly on GitHub Pages!" -ForegroundColor Green
