#!/usr/bin/env pwsh
# Simple test to register and test recruiter features

$BASE_URL = "http://localhost:5000/api"
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$recruiterEmail = "test-recruiter-$timestamp@test.com"
$candidateEmail = "test-candidate-$timestamp@test.com"

# Register a recruiter
Write-Host "[INFO] Registering test recruiter..." -ForegroundColor Yellow
try {
    $registerResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/register" `
        -Method POST `
        -ContentType "application/json" `
        -Body (@{
            name = "Test Recruiter"
            email = $recruiterEmail
            password = "Test@1234"
            role = "recruiter"
        } | ConvertTo-Json)
    
    Write-Host "[SUCCESS] Recruiter registered" -ForegroundColor Green
    $recruiterToken = $registerResponse.token
    $recruiterId = $registerResponse.user._id
} catch {
    Write-Host "[ERROR] Failed to register: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Login to get fresh token
Write-Host "[INFO] Logging in..." -ForegroundColor Yellow
try {
    $loginResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body (@{
            email = $recruiterEmail
            password = "Test@1234"
        } | ConvertTo-Json)
    
    $recruiterToken = $loginResponse.token
    Write-Host "[SUCCESS] Logged in successfully" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Failed to login: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test getMyJobs endpoint
Write-Host "[INFO] Testing GET /jobs/recruiter/my-jobs..." -ForegroundColor Yellow
try {
    $headers = @{ Authorization = "Bearer $recruiterToken" }
    $myJobs = Invoke-RestMethod -Uri "$BASE_URL/jobs/recruiter/my-jobs" `
        -Method GET `
        -Headers $headers
    
    Write-Host "[SUCCESS] Got recruiter's jobs: $($myJobs.jobs.Count) jobs" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Create a job
Write-Host "[INFO] Creating a test job..." -ForegroundColor Yellow
try {
    $jobData = @{
        title = "React Developer"
        description = "Looking for React developer"
        location = "New York"
        jobType = "full-time"
        salary = "100000-120000"
        skills = @("React", "JavaScript")
        department = "Engineering"
        experience = 3
        company = @{
            name = "Test Company"
            website = "https://test.com"
            about = "Test company"
            industry = "Technology"
        }
    }
    
    $headers = @{ Authorization = "Bearer $recruiterToken" }
    $createdJob = Invoke-RestMethod -Uri "$BASE_URL/jobs" `
        -Method POST `
        -Headers $headers `
        -ContentType "application/json" `
        -Body ($jobData | ConvertTo-Json)
    
    $jobId = $createdJob.job._id
    Write-Host "[SUCCESS] Job created: $jobId" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Failed to create job: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test getMyJobs again - should show the job
Write-Host "[INFO] Verifying job appears in my jobs..." -ForegroundColor Yellow
try {
    $headers = @{ Authorization = "Bearer $recruiterToken" }
    $myJobs = Invoke-RestMethod -Uri "$BASE_URL/jobs/recruiter/my-jobs" `
        -Method GET `
        -Headers $headers
    
    if ($myJobs.jobs.Count -gt 0 -and $myJobs.jobs[0]._id -eq $jobId) {
        Write-Host "[SUCCESS] Job correctly appears in recruiter's jobs" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Job does not appear in recruiter's jobs" -ForegroundColor Red
    }
} catch {
    Write-Host "[ERROR] Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test company profile
Write-Host "[INFO] Testing company profile endpoints..." -ForegroundColor Yellow
try {
    $headers = @{ Authorization = "Bearer $recruiterToken" }
    $profile = Invoke-RestMethod -Uri "$BASE_URL/recruiter/company-profile" `
        -Method GET `
        -Headers $headers
    
    Write-Host "[SUCCESS] Company profile retrieved" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Update company profile
Write-Host "[INFO] Updating company profile..." -ForegroundColor Yellow
try {
    $headers = @{ Authorization = "Bearer $recruiterToken" }
    $companyData = @{
        name = "Updated Test Company"
        industry = "AI/ML"
        website = "https://updated-test.com"
        about = "Updated company info"
    }
    
    $updated = Invoke-RestMethod -Uri "$BASE_URL/recruiter/company-profile" `
        -Method PUT `
        -Headers $headers `
        -ContentType "application/json" `
        -Body ($companyData | ConvertTo-Json)
    
    Write-Host "[SUCCESS] Company profile updated" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Get recruiter dashboard
Write-Host "[INFO] Testing recruiter dashboard..." -ForegroundColor Yellow
try {
    $headers = @{ Authorization = "Bearer $recruiterToken" }
    $dashboard = Invoke-RestMethod -Uri "$BASE_URL/recruiter/dashboard" `
        -Method GET `
        -Headers $headers
    
    Write-Host "[SUCCESS] Dashboard retrieved" -ForegroundColor Green
    Write-Host "  - Total Jobs: $($dashboard.dashboard.totalJobs)"
    Write-Host "  - Open Jobs: $($dashboard.dashboard.openJobs)"
} catch {
    Write-Host "[ERROR] Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Register a candidate
Write-Host "[INFO] Registering test candidate..." -ForegroundColor Yellow
try {
    $candidateResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/register" `
        -Method POST `
        -ContentType "application/json" `
        -Body (@{
            name = "Test Candidate"
            email = $candidateEmail
            password = "Test@1234"
            role = "candidate"
        } | ConvertTo-Json)
    
    $candidateToken = $candidateResponse.token
    Write-Host "[SUCCESS] Candidate registered" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Failed to register candidate: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Candidate applies to job
Write-Host "[INFO] Candidate applying to job..." -ForegroundColor Yellow
try {
    $headers = @{ Authorization = "Bearer $candidateToken" }
    $applicationData = @{
        name = "Test Candidate"
        email = $candidateEmail
        phone = "555-1234"
        skills = @("React", "JavaScript", "Node.js")
        experience = 4
        currentCompany = "Tech Corp"
    }
    
    $application = Invoke-RestMethod -Uri "$BASE_URL/applications/$jobId/apply" `
        -Method POST `
        -Headers $headers `
        -ContentType "application/json" `
        -Body ($applicationData | ConvertTo-Json)
    
    $applicationId = $application.application._id
    Write-Host "[SUCCESS] Application created: $applicationId" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Failed to apply: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Get recruiter's applications
Write-Host "[INFO] Getting recruiter's applications..." -ForegroundColor Yellow
try {
    $headers = @{ Authorization = "Bearer $recruiterToken" }
    $applications = Invoke-RestMethod -Uri "$BASE_URL/applications/recruiter/all-applications" `
        -Method GET `
        -Headers $headers
    
    if ($applications.applications.Count -gt 0) {
        Write-Host "[SUCCESS] Got applications: $($applications.applications.Count)" -ForegroundColor Green
        $app = $applications.applications[0]
        Write-Host "  - Candidate: $($app.candidateDetails.name)"
        Write-Host "  - Status: $($app.status)"
    } else {
        Write-Host "[WARNING] No applications found" -ForegroundColor Yellow
    }
} catch {
    Write-Host "[ERROR] Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Update application status
Write-Host "[INFO] Updating application status..." -ForegroundColor Yellow
try {
    $headers = @{ Authorization = "Bearer $recruiterToken" }
    $updated = Invoke-RestMethod -Uri "$BASE_URL/applications/$applicationId/status" `
        -Method PUT `
        -Headers $headers `
        -ContentType "application/json" `
        -Body (@{ status = "shortlisted" } | ConvertTo-Json)
    
    Write-Host "[SUCCESS] Application status updated to shortlisted" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n========== ALL TESTS COMPLETED ==========" -ForegroundColor Cyan
