# Update Website Script - Switch to GitHub Release URLs
# Run this AFTER you've uploaded the models to GitHub release v1.0

Write-Host "🔧 Updating website to use GitHub Release URLs..." -ForegroundColor Green

# Check if fixed script exists
if (-not (Test-Path "script_fixed.js")) {
    Write-Host "❌ Fixed script not found" -ForegroundColor Red
    exit 1
}

# Backup original script
if (Test-Path "script.js") {
    Copy-Item "script.js" "script_original_backup.js"
    Write-Host "✅ Backed up original script.js" -ForegroundColor Green
}

# Replace script.js with the fixed version
Copy-Item "script_fixed.js" "script.js" -Force
Write-Host "✅ Updated script.js to use GitHub release URLs" -ForegroundColor Green

# Commit and push changes
Write-Host "`n📤 Committing changes to GitHub..." -ForegroundColor Yellow

try {
    # Add all changes
    git add .
    
    # Commit with descriptive message
    git commit -m "Fix Git LFS issue: Use GitHub release URLs for models

- Updated script.js to load models from GitHub release v1.0
- Bypasses Git LFS pointer files 
- Models now served as actual binary GLB files
- Fixes: SyntaxError: Unexpected token 'v', version ht..."
    
    # Push to GitHub
    git push origin main
    
    Write-Host "✅ Changes pushed to GitHub successfully!" -ForegroundColor Green
    Write-Host "`n🕐 GitHub Pages will rebuild in 2-3 minutes" -ForegroundColor Cyan
    Write-Host "🌐 Your website will be available at: https://wordingone.github.io" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Git commands failed. Please commit manually:" -ForegroundColor Red
    Write-Host "   git add ." -ForegroundColor Yellow
    Write-Host "   git commit -m 'Fix Git LFS: Use release URLs for models'" -ForegroundColor Yellow
    Write-Host "   git push origin main" -ForegroundColor Yellow
}

Write-Host "`n🎉 Website update complete!" -ForegroundColor Green
Write-Host "The models should now load properly on GitHub Pages" -ForegroundColor White

# Display what was fixed
Write-Host "`n📋 What was fixed:" -ForegroundColor Cyan
Write-Host "✅ Models now load from: https://github.com/wordingone/wordingone.github.io/releases/download/v1.0/" -ForegroundColor White
Write-Host "✅ Bypasses Git LFS pointer files" -ForegroundColor White  
Write-Host "✅ Serves actual binary GLB files" -ForegroundColor White
Write-Host "✅ Eliminates JSON parse errors" -ForegroundColor White

Write-Host "`n🔍 Test your website:" -ForegroundColor Yellow
Write-Host "1. Wait 2-3 minutes for GitHub Pages rebuild" -ForegroundColor White
Write-Host "2. Visit: https://wordingone.github.io" -ForegroundColor White
Write-Host "3. Check browser console - should see 'loaded successfully from release!'" -ForegroundColor White
