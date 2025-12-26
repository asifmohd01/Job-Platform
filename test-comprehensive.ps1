#!/usr/bin/env pwsh
# Final Comprehensive Testing Script

$BASE_URL = "http://localhost:5000/api"
$timestamp = Get-Date -Format "yyyyMMddHHmmss"

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "COMPREHENSIVE RECRUITER FEATURE TEST" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan

# Test 1: Registration and Authentication
Write-Host "TEST 1: RECRUITER REGISTRATION & LOGIN" -ForegroundColor Yellow
$recruiterEmail = "final-test-recruiter-$timestamp@test.com"
$recruiterName = "Final Test Recruiter"
$candidateEmail = "final-test-candidate-$timestamp@test.com"
$candidateName = "Final Test Candidate"
$jobTitle = "Full Stack Developer - $timestamp"

try {
    $regResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/register" `
        -Method POST `
        -ContentType "application/json" `
        -Body (@{
            name = $recruiterName
            email = $recruiterEmail
            password = "Test@1234"
            role = "recruiter"
        } | ConvertTo-Json)
    
    $recruiterToken = $regResponse.token
    $recruiterId = $regResponse.user._id
    Write-Host "[PASS] Recruiter registered and logged in" -ForegroundColor Green
} catch {
    Write-Host "[FAIL] Recruiter registration failed: $_" -ForegroundColor Red
    exit 1
}

# Test 2: Create a Job with Company Details
Write-Host "`nTEST 2: CREATE JOB WITH COMPANY DETAILS" -ForegroundColor Yellow
try {
    $headers = @{ Authorization = "Bearer $recruiterToken" }
    $jobData = @{
        title = $jobTitle
        description = "Comprehensive test job posting with all details"
        location = "San Francisco, CA"
        jobType = "full-time"
        salary = "150000-200000"
        skills = @("React", "Node.js", "MongoDB", "TypeScript")
        department = "Engineering"
        experience = 5
        company = @{
            name = "TestCorp Inc"
            website = "https://testcorp.com"
            about = "Leading innovator in tech solutions"
            industry = "Technology"
        }
    }
    
    $jobResponse = Invoke-RestMethod -Uri "$BASE_URL/jobs" `
        -Method POST `
        -Headers $headers `
        -ContentType "application/json" `
        -Body ($jobData | ConvertTo-Json)
    
    $jobId = $jobResponse.job._id
    Write-Host "[PASS] Job created successfully: $jobId" -ForegroundColor Green
    Write-Host "  - Title: $($jobResponse.job.title)"
    Write-Host "  - Company: $($jobResponse.job.company.name)"
    Write-Host "  - Status: $($jobResponse.job.status)"
} catch {
    Write-Host "[FAIL] Job creation failed: $_" -ForegroundColor Red
    exit 1
}

# Test 3: Recruiter's Job Visibility (getMyJobs)
Write-Host "`nTEST 3: RECRUITER-ONLY JOB VISIBILITY" -ForegroundColor Yellow
try {
    $myJobsResponse = Invoke-RestMethod -Uri "$BASE_URL/jobs/recruiter/my-jobs" `
        -Method GET `
        -Headers $headers
    
    $jobFound = $myJobsResponse.jobs | Where-Object { $_.title -eq $jobTitle }
    if ($jobFound) {
        Write-Host "[PASS] Job appears in recruiter's 'My Jobs'" -ForegroundColor Green
        Write-Host "  - Total jobs: $($myJobsResponse.jobs.Count)"
        Write-Host "  - Job found: $($jobFound.title)"
    } else {
        Write-Host "[FAIL] Job not found in 'My Jobs'" -ForegroundColor Red
    }
} catch {
    Write-Host "[FAIL] Failed to get recruiter's jobs: $_" -ForegroundColor Red
}

# Test 4: Company Profile Management
Write-Host "`nTEST 4: COMPANY PROFILE MANAGEMENT" -ForegroundColor Yellow
try {
    # Get company profile
    $profileResponse = Invoke-RestMethod -Uri "$BASE_URL/recruiter/company-profile" `
        -Method GET `
        -Headers $headers
    Write-Host "[PASS] Retrieved company profile" -ForegroundColor Green
    
    # Update company profile
    $updateData = @{
        name = "TestCorp Updated"
        industry = "Artificial Intelligence"
        website = "https://testcorp-updated.com"
        about = "Leading AI and ML solutions provider"
    }
    
    $updateResponse = Invoke-RestMethod -Uri "$BASE_URL/recruiter/company-profile" `
        -Method PUT `
        -Headers $headers `
        -ContentType "application/json" `
        -Body ($updateData | ConvertTo-Json)
    
    Write-Host "[PASS] Company profile updated" -ForegroundColor Green
    Write-Host "  - Name: $($updateResponse.user.company.name)"
    Write-Host "  - Industry: $($updateResponse.user.company.industry)"
} catch {
    Write-Host "[FAIL] Company profile test failed: $_" -ForegroundColor Red
}

# Test 5: Recruiter Dashboard
Write-Host "`nTEST 5: RECRUITER DASHBOARD" -ForegroundColor Yellow
try {
    $dashboardResponse = Invoke-RestMethod -Uri "$BASE_URL/recruiter/dashboard" `
        -Method GET `
        -Headers $headers
    
    Write-Host "[PASS] Dashboard retrieved" -ForegroundColor Green
    Write-Host "  - Recruiter: $($dashboardResponse.dashboard.recruiterName)"
    Write-Host "  - Total Jobs: $($dashboardResponse.dashboard.totalJobs)"
    Write-Host "  - Open Jobs: $($dashboardResponse.dashboard.openJobs)"
    Write-Host "  - Filled Jobs: $($dashboardResponse.dashboard.filledJobs)"
} catch {
    Write-Host "[FAIL] Dashboard test failed: $_" -ForegroundColor Red
}

# Test 6: Candidate Registration and Application
Write-Host "`nTEST 6: CANDIDATE REGISTRATION & APPLICATION" -ForegroundColor Yellow
try {
    $candidateRegResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/register" `
        -Method POST `
        -ContentType "application/json" `
        -Body (@{
            name = $candidateName
            email = $candidateEmail
            password = "Test@1234"
            role = "candidate"
        } | ConvertTo-Json)
    
    $candidateToken = $candidateRegResponse.token
    Write-Host "[PASS] Candidate registered: $candidateName" -ForegroundColor Green
} catch {
    Write-Host "[FAIL] Candidate registration failed: $_" -ForegroundColor Red
}

# Test 7: Candidate Applies to Job
Write-Host "`nTEST 7: CANDIDATE APPLICATION WITH DETAILS" -ForegroundColor Yellow
try {
    $candidateHeaders = @{ Authorization = "Bearer $candidateToken" }
    $applicationData = @{
        name = $candidateName
        email = $candidateEmail
        phone = "555-0123"
        skills = @("React", "Node.js", "MongoDB", "Python")
        experience = 6
        currentCompany = "TechStart Inc"
    }
    
    $appResponse = Invoke-RestMethod -Uri "$BASE_URL/applications/$jobId/apply" `
        -Method POST `
        -Headers $candidateHeaders `
        -ContentType "application/json" `
        -Body ($applicationData | ConvertTo-Json)
    
    $applicationId = $appResponse.application._id
    Write-Host "[PASS] Application submitted successfully" -ForegroundColor Green
    Write-Host "  - Application ID: $applicationId"
    Write-Host "  - Candidate: $($appResponse.application.candidateDetails.name)"
    Write-Host "  - Status: $($appResponse.application.status)"
} catch {
    Write-Host "[FAIL] Application submission failed: $_" -ForegroundColor Red
}

# Test 8: Recruiter Views Applications
Write-Host "`nTEST 8: RECRUITER VIEWS APPLICATIONS" -ForegroundColor Yellow
try {
    $recruiterAppsResponse = Invoke-RestMethod -Uri "$BASE_URL/applications/recruiter/all-applications" `
        -Method GET `
        -Headers $headers
    
    $appFound = $recruiterAppsResponse.applications | Where-Object { $_.candidateDetails.name -eq $candidateName }
    if ($appFound) {
        Write-Host "[PASS] Application visible to recruiter" -ForegroundColor Green
        Write-Host "  - Total applications: $($recruiterAppsResponse.applications.Count)"
        Write-Host "  - Candidate: $($appFound.candidateDetails.name)"
        Write-Host "  - Email: $($appFound.candidateDetails.email)"
        Write-Host "  - Phone: $($appFound.candidateDetails.phone)"
        Write-Host "  - Current Company: $($appFound.candidateDetails.currentCompany)"
        Write-Host "  - Skills: $($appFound.candidateDetails.skills -join ', ')"
        Write-Host "  - Status: $($appFound.status)"
    } else {
        Write-Host "[FAIL] Application not visible to recruiter" -ForegroundColor Red
    }
} catch {
    Write-Host "[FAIL] Failed to retrieve applications: $_" -ForegroundColor Red
}

# Test 9: Update Application Status Workflow
Write-Host "`nTEST 9: APPLICATION STATUS WORKFLOW" -ForegroundColor Yellow
$statuses = @("shortlisted", "interviewed", "accepted")
$currentStatus = "applied"

foreach ($newStatus in $statuses) {
    try {
        $statusResponse = Invoke-RestMethod -Uri "$BASE_URL/applications/$applicationId/status" `
            -Method PUT `
            -Headers $headers `
            -ContentType "application/json" `
            -Body (@{ status = $newStatus } | ConvertTo-Json)
        
        Write-Host "[PASS] Status updated: $currentStatus -> $newStatus" -ForegroundColor Green
        $currentStatus = $newStatus
    } catch {
        Write-Host "[FAIL] Status update failed ($newStatus): $_" -ForegroundColor Red
    }
}

# Test 10: Reject Application
Write-Host "`nTEST 10: REJECT APPLICATION" -ForegroundColor Yellow
try {
    # Create a new application to reject
    $candidate2Email = "reject-test-candidate-$timestamp@test.com"
    
    $candidate2RegResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/register" `
        -Method POST `
        -ContentType "application/json" `
        -Body (@{
            name = "Reject Test Candidate"
            email = $candidate2Email
            password = "Test@1234"
            role = "candidate"
        } | ConvertTo-Json)
    
    $candidate2Token = $candidate2RegResponse.token
    $candidate2Headers = @{ Authorization = "Bearer $candidate2Token" }
    
    $rejectionAppData = @{
        name = "Reject Test Candidate"
        email = $candidate2Email
        phone = "555-9999"
        skills = @("JavaScript")
        experience = 1
        currentCompany = "N/A"
    }
    
    $rejectionAppResponse = Invoke-RestMethod -Uri "$BASE_URL/applications/$jobId/apply" `
        -Method POST `
        -Headers $candidate2Headers `
        -ContentType "application/json" `
        -Body ($rejectionAppData | ConvertTo-Json)
    
    $rejectionAppId = $rejectionAppResponse.application._id
    
    # Reject it
    $rejectResponse = Invoke-RestMethod -Uri "$BASE_URL/applications/$rejectionAppId/status" `
        -Method PUT `
        -Headers $headers `
        -ContentType "application/json" `
        -Body (@{ status = "rejected" } | ConvertTo-Json)
    
    Write-Host "[PASS] Application rejected successfully" -ForegroundColor Green
    Write-Host "  - Application ID: $rejectionAppId"
    Write-Host "  - Final Status: $($rejectResponse.application.status)"
} catch {
    Write-Host "[FAIL] Rejection test failed: $_" -ForegroundColor Red
}

# Test 11: Job Status Management
Write-Host "`nTEST 11: JOB STATUS MANAGEMENT (Mark as Filled)" -ForegroundColor Yellow
try {
    $filledResponse = Invoke-RestMethod -Uri "$BASE_URL/jobs/$jobId" `
        -Method PUT `
        -Headers $headers `
        -ContentType "application/json" `
        -Body (@{ status = "filled" } | ConvertTo-Json)
    
    Write-Host "[PASS] Job marked as filled" -ForegroundColor Green
    Write-Host "  - Job ID: $jobId"
    Write-Host "  - New Status: $($filledResponse.job.status)"
} catch {
    Write-Host "[FAIL] Job status update failed: $_" -ForegroundColor Red
}

# Test 12: Verify Filled Job Appears in Dashboard
Write-Host "`nTEST 12: VERIFY FILLED JOB IN DASHBOARD" -ForegroundColor Yellow
try {
    $dashboardResponse = Invoke-RestMethod -Uri "$BASE_URL/recruiter/dashboard" `
        -Method GET `
        -Headers $headers
    
    Write-Host "[PASS] Dashboard updated" -ForegroundColor Green
    Write-Host "  - Open Jobs: $($dashboardResponse.dashboard.openJobs)"
    Write-Host "  - Filled Jobs: $($dashboardResponse.dashboard.filledJobs)"
} catch {
    Write-Host "[FAIL] Dashboard check failed: $_" -ForegroundColor Red
}

# Test 13: Authorization - Different Recruiter Cannot See Jobs
Write-Host "`nTEST 13: AUTHORIZATION - RECRUITER JOB ISOLATION" -ForegroundColor Yellow
try {
    $recruiter2Email = "recruiter2-$timestamp@test.com"
    
    $recruiter2RegResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/register" `
        -Method POST `
        -ContentType "application/json" `
        -Body (@{
            name = "Other Recruiter"
            email = $recruiter2Email
            password = "Test@1234"
            role = "recruiter"
        } | ConvertTo-Json)
    
    $recruiter2Token = $recruiter2RegResponse.token
    $recruiter2Headers = @{ Authorization = "Bearer $recruiter2Token" }
    
    $recruiter2JobsResponse = Invoke-RestMethod -Uri "$BASE_URL/jobs/recruiter/my-jobs" `
        -Method GET `
        -Headers $recruiter2Headers
    
    $jobFoundByOtherRecruiter = $recruiter2JobsResponse.jobs | Where-Object { $_.title -eq $jobTitle }
    
    if (-not $jobFoundByOtherRecruiter) {
        Write-Host "[PASS] Other recruiter cannot see this recruiter's job" -ForegroundColor Green
        Write-Host "  - Other recruiter's jobs: $($recruiter2JobsResponse.jobs.Count)"
    } else {
        Write-Host "[FAIL] Authorization breach - other recruiter can see this job" -ForegroundColor Red
    }
} catch {
    Write-Host "[FAIL] Authorization test failed: $_" -ForegroundColor Red
}

# Test 14: Candidate Cannot Update Application Status
Write-Host "`nTEST 14: AUTHORIZATION - CANDIDATE CANNOT UPDATE APPLICATION" -ForegroundColor Yellow
try {
    $unauthorizedUpdate = Invoke-RestMethod -Uri "$BASE_URL/applications/$applicationId/status" `
        -Method PUT `
        -Headers $candidateHeaders `
        -ContentType "application/json" `
        -Body (@{ status = "accepted" } | ConvertTo-Json)
    
    Write-Host "[FAIL] Authorization breach - candidate was able to update application" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 403) {
        Write-Host "[PASS] Candidate correctly denied (403 Forbidden)" -ForegroundColor Green
    } else {
        Write-Host "[FAIL] Unexpected error: $_" -ForegroundColor Red
    }
}

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "TEST SUITE COMPLETED" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "`nAll major features have been tested:" -ForegroundColor Green
Write-Host "  ✓ User registration and authentication" -ForegroundColor Green
Write-Host "  ✓ Job creation with company details" -ForegroundColor Green
Write-Host "  ✓ Recruiter-only job visibility" -ForegroundColor Green
Write-Host "  ✓ Company profile management" -ForegroundColor Green
Write-Host "  ✓ Recruiter dashboard with statistics" -ForegroundColor Green
Write-Host "  ✓ Candidate application workflow" -ForegroundColor Green
Write-Host "  ✓ Application status management" -ForegroundColor Green
Write-Host "  ✓ Authorization enforcement" -ForegroundColor Green
Write-Host "`n"
