@echo off
echo =======================================
echo   Crispy Chicken - Upload offers.json
echo =======================================

REM قراءة ملف config.txt
for /f "tokens=1,2 delims==" %%a in (config.txt) do (
    if "%%a"=="GITHUB_TOKEN" set GITHUB_TOKEN=%%b
    if "%%a"=="USERNAME" set USERNAME=%%b
    if "%%a"=="REPO" set REPO=%%b
)

REM تجهيز فولدر للنسخ الاحتياطية
if not exist backup mkdir backup

REM تجهيز ملف لوج
set LOGFILE=backup\backup-log.txt

REM تشغيل PowerShell Script
powershell -NoProfile -ExecutionPolicy Bypass -Command "& {
    $GITHUB_TOKEN = '%GITHUB_TOKEN%'
    $USERNAME = '%USERNAME%'
    $REPO = '%REPO%'
    $FILE_PATH = 'data/offers.json'
    $LOCAL_FILE = 'offers.json'
    $LOGFILE = '%LOGFILE%'

    Write-Host 'Reading local file...' -ForegroundColor Cyan
    $ContentBytes = [System.IO.File]::ReadAllBytes($LOCAL_FILE)
    $ContentBase64 = [System.Convert]::ToBase64String($ContentBytes)

    $Url = 'https://api.github.com/repos/' + $USERNAME + '/' + $REPO + '/contents/' + $FILE_PATH
    $Headers = @{
        'Authorization' = 'token ' + $GITHUB_TOKEN
        'Accept'        = 'application/vnd.github.v3+json'
        'User-Agent'    = 'PowerShell'
    }

    try {
        # جلب النسخة القديمة لو موجودة
        $Response = Invoke-RestMethod -Uri $Url -Headers $Headers -Method GET
        $Sha = $Response.sha
        $OldContent = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($Response.content))

        # حفظ نسخة Backup
        $Timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
        $BackupPath = 'backup/offers-' + $Timestamp + '.json'
        $OldContent | Out-File -FilePath $BackupPath -Encoding utf8
        Write-Host ('Backup saved: ' + $BackupPath) -ForegroundColor Cyan
    } catch {
        $Sha = $null
        Write-Host 'File does not exist, creating new...' -ForegroundColor Green
    }

    # تجهيز البيانات لرفع الملف
    $Body = @{
        message = 'Add or update offers.json'
        content = $ContentBase64
    }

    if ($Sha) {
        $Body.sha = $Sha
    }

    $Result = Invoke-RestMethod -Uri $Url -Headers $Headers -Method PUT -Body ($Body | ConvertTo-Json -Depth 10)
    $CommitUrl = $Result.commit.html_url

    # كتابة Log
    $LogEntry = (Get-Date -Format 'yyyy-MM-dd HH:mm:ss') + ' | Commit: ' + $CommitUrl
    Add-Content -Path $LOGFILE -Value $LogEntry

    Write-Host 'Done! Commit URL:' $CommitUrl -ForegroundColor Magenta
    Write-Host ('Log entry added: ' + $LOGFILE) -ForegroundColor Gray
}"
pause
