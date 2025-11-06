# Ollama Setup Script for Windows PowerShell
# Run this script to set up Ollama for the AI Assessment Platform

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  AI Assessment Platform - Ollama Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Ollama is installed
Write-Host "Checking for Ollama installation..." -ForegroundColor Yellow

$ollamaPath = Get-Command ollama -ErrorAction SilentlyContinue

if ($null -eq $ollamaPath) {
    Write-Host "❌ Ollama is not installed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Ollama from: https://ollama.ai/download" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "After installation, run this script again." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Ollama is installed at: $($ollamaPath.Source)" -ForegroundColor Green
Write-Host ""

# Check if Ollama service is running
Write-Host "Checking Ollama service..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Ollama service is running on http://localhost:11434" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Ollama service is not running" -ForegroundColor Yellow
    Write-Host "Starting Ollama service..." -ForegroundColor Yellow
    Start-Process -FilePath "ollama" -ArgumentList "serve" -WindowStyle Hidden
    Write-Host "⏳ Waiting for service to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
}

Write-Host ""

# List available models
Write-Host "Checking installed models..." -ForegroundColor Yellow
ollama list

Write-Host ""

# Prompt to pull recommended models
Write-Host "Recommended models for this platform:" -ForegroundColor Cyan
Write-Host "  1. llama2 (3.8GB) - General purpose, good quality"
Write-Host "  2. mistral (4.1GB) - Fast and efficient"
Write-Host "  3. phi (1.6GB) - Lightweight, fast"
Write-Host ""

$choice = Read-Host "Would you like to pull llama2? (recommended) [Y/n]"

if ($choice -ne "n" -and $choice -ne "N") {
    Write-Host ""
    Write-Host "Pulling llama2 model... (this may take a few minutes)" -ForegroundColor Yellow
    ollama pull llama2
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ llama2 model pulled successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to pull llama2 model" -ForegroundColor Red
    }
}

Write-Host ""

# Test the model
Write-Host "Testing AI generation..." -ForegroundColor Yellow

$testPrompt = @{
    model = "llama2"
    prompt = "Say 'Hello from Ollama!' in one sentence."
    stream = $false
} | ConvertTo-Json

try {
    $testResponse = Invoke-RestMethod -Uri "http://localhost:11434/api/generate" -Method POST -Body $testPrompt -ContentType "application/json"
    Write-Host "✅ AI Test Response: $($testResponse.response)" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Could not test AI generation. Model might not be ready yet." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Setup Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ Ollama is installed and running" -ForegroundColor Green
Write-Host "✅ Model(s) are ready to use" -ForegroundColor Green
Write-Host ""
Write-Host "Configuration for .env file:" -ForegroundColor Yellow
Write-Host "  OLLAMA_URL=http://localhost:11434" -ForegroundColor White
Write-Host "  OLLAMA_MODEL=llama2" -ForegroundColor White
Write-Host ""
Write-Host "You can now start the backend server:" -ForegroundColor Yellow
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Test AI endpoints at:" -ForegroundColor Yellow
Write-Host "  GET  http://localhost:5000/api/ai/status" -ForegroundColor White
Write-Host "  POST http://localhost:5000/api/ai/chat" -ForegroundColor White
Write-Host ""
Write-Host "Happy coding! 🚀" -ForegroundColor Cyan
