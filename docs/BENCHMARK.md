Benchmarking Guide

Quick local benchmark (uses `autocannon` via npx):

1. Ensure the app is running on http://localhost:3000 (see `npm run build` + `npm start` or `docker-compose up`).
2. Run the bench script:

```powershell
npm run bench
```

This will run `npx autocannon -c 50 -d 10 http://localhost:3000` by default.

To save results to a file (PowerShell):

```powershell
npx autocannon -c 50 -d 10 http://localhost:3000 | Out-File docs/BENCHMARK_RESULT.txt -Encoding utf8
```

Interpretation:
- `Requests/sec` gives overall throughput.
- `Latency (ms)` p95/p99 lines show tail latency.
- Use these numbers as baselines and rerun after scaling workers or enabling Redis caching.
