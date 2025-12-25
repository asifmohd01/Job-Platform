# Test API Endpoints Script

$baseURL = "http://localhost:5000/api"
$ErrorActionPreference = "SilentlyContinue"

Write-Host "🧪 Testing Job Portal API..." -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "Test 1: Health Check" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000" -Method Get -TimeoutSec 5
    Write-Host "✅ Server is running" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Server is not responding" -ForegroundColor Red
}

Write-Host ""

# Test 2: Register a new user
Write-Host "Test 2: User Registration" -ForegroundColor Yellow
$registerPayload = @{
    name = "Test User"
    email = "testuser@test.com"
    password = "TestPass123"
    role = "candidate"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$baseURL/auth/register" `
        -Method Post `
        -ContentType "application/json" `
        -Body $registerPayload `
        -TimeoutSec 5
    
    $result = $response.Content | ConvertFrom-Json
    if ($result.token) {
        Write-Host "✅ User registered successfully" -ForegroundColor Green
        Write-Host "User: $($result.user.name) - Role: $($result.user.role)" -ForegroundColor Gray
        $global:token = $result.token
    } else {
        Write-Host "❌ Registration failed" -ForegroundColor Red
    }
} catch {
    Write-Host "⚠️  Registration error: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""

# Test 3: Login
Write-Host "Test 3: User Login" -ForegroundColor Yellow
$loginPayload = @{
    email = "testuser@test.com"
    password = "TestPass123"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$baseURL/auth/login" `
        -Method Post `
        -ContentType "application/json" `
        -Body $loginPayload `
        -TimeoutSec 5
    
    $result = $response.Content | ConvertFrom-Json
    if ($result.token) {
        Write-Host "✅ User logged in successfully" -ForegroundColor Green
        Write-Host "User: $($result.user.name) - Role: $($result.user.role)" -ForegroundColor Gray
        $global:token = $result.token
    } else {
        Write-Host "❌ Login failed" -ForegroundColor Red
    }
} catch {
    Write-Host "⚠️  Login error: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""

# Test 4: Get all jobs
Write-Host "Test 4: Fetch All Jobs" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseURL/jobs" `
        -Method Get `
        -TimeoutSec 5 `
        -Headers @{ "Authorization" = "Bearer $global:token" }
    
    $result = $response.Content | ConvertFrom-Json
    Write-Host "✅ Fetched jobs successfully" -ForegroundColor Green
    Write-Host "Number of jobs: $(($result | Measure-Object).Count)" -ForegroundColor Gray
} catch {
    Write-Host "⚠️  Error fetching jobs: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎯 All basic tests completed!" -ForegroundColor Cyan
