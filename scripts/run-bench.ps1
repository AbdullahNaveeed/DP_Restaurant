# Run autocannon benchmark and save results to docs/BENCHMARK_RESULT.txt
if (-not (Test-Path -Path docs)) { New-Item -ItemType Directory -Path docs | Out-Null }

npx autocannon -c 50 -d 10 http://localhost:3000 | Out-File docs/BENCHMARK_RESULT.txt -Encoding utf8
Write-Host "Benchmark complete — results saved to docs/BENCHMARK_RESULT.txt"
