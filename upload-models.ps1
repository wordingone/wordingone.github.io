# Upload models to GitHub release
param(
    [string]$ReleaseTag = "v1.0",
    [string]$RepoPath = "wordingone/Website%20Core"
)

Write-Host "🚀 Uploading models to GitHub release..." -ForegroundColor Green

# Check if GitHub CLI is available
try {
    $ghVersion = gh --version 2>$null
    if (-not $ghVersion) {
        throw "GitHub CLI not found"
    }
    Write-Host "✅ GitHub CLI found" -ForegroundColor Green
} catch {
    Write-Host "❌ GitHub CLI not installed. Please install it first:" -ForegroundColor Red
    Write-Host "   winget install GitHub.cli" -ForegroundColor Yellow
    Write-Host "   Then restart PowerShell and run this script again." -ForegroundColor Yellow
    exit 1
}

# Check authentication
try {
    $authCheck = gh auth status 2>&1
    if ($authCheck -like "*not logged*") {
        Write-Host "🔐 Please login to GitHub..." -ForegroundColor Yellow
        gh auth login
    }
} catch {
    Write-Host "🔐 Please login to GitHub..." -ForegroundColor Yellow
    gh auth login
}

# Navigate to models directory
$modelsPath = "Website Core\Skeleton\src\assets\models"
if (-not (Test-Path $modelsPath)) {
    Write-Host "❌ Models directory not found: $modelsPath" -ForegroundColor Red
    exit 1
}

Set-Location $modelsPath

# Get all .glb files
$glbFiles = Get-ChildItem "*.glb"
if ($glbFiles.Count -eq 0) {
    Write-Host "❌ No .glb files found in $modelsPath" -ForegroundColor Red
    exit 1
}

Write-Host "📦 Found $($glbFiles.Count) model files to upload" -ForegroundColor Cyan

# Create or update release
try {
    Write-Host "Creating release '$ReleaseTag'..." -ForegroundColor Yellow
    gh release create $ReleaseTag --title "Website Models" --notes "3D models for the interactive website" 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ℹ️ Release already exists, continuing with upload..." -ForegroundColor Blue
    }
} catch {
    Write-Host "ℹ️ Release may already exist, continuing..." -ForegroundColor Blue
}

# Upload each model file
foreach ($file in $glbFiles) {
    Write-Host "⬆️ Uploading $($file.Name)..." -ForegroundColor Cyan
    try {
        gh release upload $ReleaseTag $file.Name --clobber
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✅ $($file.Name) uploaded successfully" -ForegroundColor Green
        } else {
            Write-Host "   ❌ Failed to upload $($file.Name)" -ForegroundColor Red
        }
    } catch {
        Write-Host "   ❌ Error uploading $($file.Name): $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Return to repo root
Set-Location "..\..\..\.."

Write-Host "`n🎉 Upload complete!" -ForegroundColor Green
Write-Host "📋 Release URLs:" -ForegroundColor Cyan

try {
    gh release view $ReleaseTag --json assets --jq '.assets[].browser_download_url'
} catch {
    Write-Host "Run 'gh release view $ReleaseTag' to see the release details" -ForegroundColor Yellow
}
