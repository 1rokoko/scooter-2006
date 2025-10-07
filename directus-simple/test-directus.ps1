# Test Directus server
Write-Host "Testing Directus server..." -ForegroundColor Green

# Test 1: Check main page availability
Write-Host "1. Checking main page..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8055" -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✓ Main page is accessible" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ Main page is not accessible: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Check API info
Write-Host "2. Checking API info..." -ForegroundColor Yellow
try {
    $info = Invoke-RestMethod -Uri "http://localhost:8055/server/info" -TimeoutSec 10
    if ($info.data.project.project_name -eq "Directus") {
        Write-Host "✓ API info works" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ API info is not accessible: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 3: Check authentication
Write-Host "3. Checking authentication..." -ForegroundColor Yellow
try {
    $loginData = @{
        email = "seocos@gmail.com"
        password = "directus2024!"
    } | ConvertTo-Json

    $authResponse = Invoke-RestMethod -Uri "http://localhost:8055/auth/login" -Method POST -ContentType "application/json" -Body $loginData -TimeoutSec 10

    if ($authResponse.data.access_token) {
        Write-Host "✓ Authentication works" -ForegroundColor Green
        Write-Host "✓ User seocos@gmail.com successfully created and can login" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ Authentication does not work: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`nAll tests passed successfully!" -ForegroundColor Green
Write-Host "Directus is available at: http://localhost:8055" -ForegroundColor Cyan
Write-Host "Email: seocos@gmail.com" -ForegroundColor Cyan
Write-Host "Password: directus2024!" -ForegroundColor Cyan
