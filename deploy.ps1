# XandLearning Deployment Script for Windows
# Usage: .\deploy.ps1 [dev|prod|stop|clean|logs|status]

param(
    [Parameter(Position=0)]
    [ValidateSet("dev", "prod", "stop", "clean", "logs", "status", "help")]
    [string]$Command = "help"
)

$ErrorActionPreference = "Stop"

# Colors
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Write-Header {
    Write-Host ""
    Write-Host "  ╔═══════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "  ║         XandLearning Deployment           ║" -ForegroundColor Cyan
    Write-Host "  ║      Algorithm Practice Platform          ║" -ForegroundColor Cyan
    Write-Host "  ╚═══════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
}

function Test-DockerRunning {
    try {
        docker info *> $null
        return $true
    } catch {
        Write-Host "❌ Docker is not running. Please start Docker Desktop." -ForegroundColor Red
        return $false
    }
}

function Initialize-Environment {
    if (-not (Test-Path ".env")) {
        if (Test-Path "env.sample") {
            Copy-Item "env.sample" ".env"
            Write-Host "✅ Created .env file from env.sample" -ForegroundColor Green
        } else {
            Write-Host "⚠️  No env.sample found, creating default .env" -ForegroundColor Yellow
            @"
FRONTEND_PORT=4173
BACKEND_PORT=4174
MONGODB_PORT=27117
NODE_ENV=development
"@ | Out-File -FilePath ".env" -Encoding UTF8
            Write-Host "✅ Created default .env file" -ForegroundColor Green
        }
    } else {
        Write-Host "ℹ️  Using existing .env file" -ForegroundColor Blue
    }
}

function Start-Development {
    Write-Header
    Write-Host "🚀 Starting Development Environment..." -ForegroundColor Yellow
    Write-Host ""

    if (-not (Test-DockerRunning)) { return }

    Initialize-Environment

    Write-Host "📦 Building containers..." -ForegroundColor Cyan
    docker-compose build

    Write-Host ""
    Write-Host "🐳 Starting services..." -ForegroundColor Cyan
    docker-compose up -d

    Write-Host ""
    Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5

    # Check health
    Show-Status

    Write-Host ""
    Write-Host "═══════════════════════════════════════════════" -ForegroundColor Green
    Write-Host "  ✅ Development environment is ready!" -ForegroundColor Green
    Write-Host ""
    Write-Host "  🌐 Frontend:  http://localhost:4173" -ForegroundColor Cyan
    Write-Host "  🔌 Backend:   http://localhost:4174" -ForegroundColor Cyan
    Write-Host "  🗄️  MongoDB:   localhost:27117" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  📝 Commands:" -ForegroundColor Yellow
    Write-Host "     .\deploy.ps1 logs    - View logs" -ForegroundColor White
    Write-Host "     .\deploy.ps1 stop    - Stop services" -ForegroundColor White
    Write-Host "     .\deploy.ps1 status  - Check status" -ForegroundColor White
    Write-Host "═══════════════════════════════════════════════" -ForegroundColor Green
}

function Start-Production {
    Write-Header
    Write-Host "🚀 Starting Production Environment..." -ForegroundColor Yellow
    Write-Host ""

    if (-not (Test-DockerRunning)) { return }

    # Set production environment
    $env:NODE_ENV = "production"

    Initialize-Environment

    # Update .env for production
    (Get-Content ".env") -replace 'NODE_ENV=development', 'NODE_ENV=production' | Set-Content ".env"

    Write-Host "📦 Building production containers..." -ForegroundColor Cyan
    docker-compose build --no-cache

    Write-Host ""
    Write-Host "🐳 Starting production services..." -ForegroundColor Cyan
    docker-compose up -d

    Write-Host ""
    Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10

    Show-Status

    Write-Host ""
    Write-Host "═══════════════════════════════════════════════" -ForegroundColor Green
    Write-Host "  ✅ Production environment is ready!" -ForegroundColor Green
    Write-Host "═══════════════════════════════════════════════" -ForegroundColor Green
}

function Stop-Services {
    Write-Header
    Write-Host "🛑 Stopping all services..." -ForegroundColor Yellow

    if (-not (Test-DockerRunning)) { return }

    docker-compose down

    Write-Host ""
    Write-Host "✅ All services stopped" -ForegroundColor Green
}

function Clean-Environment {
    Write-Header
    Write-Host "🧹 Cleaning up environment..." -ForegroundColor Yellow
    Write-Host ""

    if (-not (Test-DockerRunning)) { return }

    $confirm = Read-Host "⚠️  This will remove all containers, volumes, and data. Continue? (y/N)"
    
    if ($confirm -eq "y" -or $confirm -eq "Y") {
        Write-Host ""
        Write-Host "Stopping containers..." -ForegroundColor Cyan
        docker-compose down -v --remove-orphans

        Write-Host "Removing images..." -ForegroundColor Cyan
        docker-compose down --rmi local

        Write-Host "Pruning unused resources..." -ForegroundColor Cyan
        docker system prune -f

        Write-Host ""
        Write-Host "✅ Cleanup complete" -ForegroundColor Green
    } else {
        Write-Host "❌ Cleanup cancelled" -ForegroundColor Yellow
    }
}

function Show-Logs {
    Write-Header
    Write-Host "📋 Showing logs (Ctrl+C to exit)..." -ForegroundColor Yellow
    Write-Host ""

    if (-not (Test-DockerRunning)) { return }

    docker-compose logs -f --tail=100
}

function Show-Status {
    Write-Host ""
    Write-Host "📊 Service Status:" -ForegroundColor Cyan
    Write-Host ""

    if (-not (Test-DockerRunning)) { return }

    docker-compose ps

    Write-Host ""
    Write-Host "🔍 Health Checks:" -ForegroundColor Cyan
    
    # Check Backend
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:4174/api/health" -TimeoutSec 5 -UseBasicParsing
        Write-Host "  ✅ Backend API: Healthy" -ForegroundColor Green
    } catch {
        Write-Host "  ❌ Backend API: Not responding" -ForegroundColor Red
    }

    # Check Frontend
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:4173" -TimeoutSec 5 -UseBasicParsing
        Write-Host "  ✅ Frontend: Healthy" -ForegroundColor Green
    } catch {
        Write-Host "  ❌ Frontend: Not responding" -ForegroundColor Red
    }

    # Check MongoDB
    try {
        $result = docker exec xandlearning-mongodb mongosh --eval "db.runCommand('ping').ok" --quiet 2>$null
        if ($result -match "1") {
            Write-Host "  ✅ MongoDB: Healthy" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️  MongoDB: Unknown status" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "  ❌ MongoDB: Not responding" -ForegroundColor Red
    }
}

function Show-Help {
    Write-Header
    Write-Host "Usage: .\deploy.ps1 <command>" -ForegroundColor White
    Write-Host ""
    Write-Host "Commands:" -ForegroundColor Cyan
    Write-Host "  dev     Start development environment" -ForegroundColor White
    Write-Host "  prod    Start production environment" -ForegroundColor White
    Write-Host "  stop    Stop all services" -ForegroundColor White
    Write-Host "  clean   Remove all containers, volumes, and images" -ForegroundColor White
    Write-Host "  logs    Show and follow container logs" -ForegroundColor White
    Write-Host "  status  Show service status and health" -ForegroundColor White
    Write-Host "  help    Show this help message" -ForegroundColor White
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Cyan
    Write-Host "  .\deploy.ps1 dev     # Start development" -ForegroundColor Gray
    Write-Host "  .\deploy.ps1 logs    # View logs" -ForegroundColor Gray
    Write-Host "  .\deploy.ps1 stop    # Stop everything" -ForegroundColor Gray
    Write-Host ""
}

# Main
switch ($Command) {
    "dev"    { Start-Development }
    "prod"   { Start-Production }
    "stop"   { Stop-Services }
    "clean"  { Clean-Environment }
    "logs"   { Show-Logs }
    "status" { Show-Status }
    "help"   { Show-Help }
    default  { Show-Help }
}

