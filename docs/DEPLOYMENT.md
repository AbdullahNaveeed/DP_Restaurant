**Production Deployment Guide**

- **Prerequisites**: Docker Engine (or Node 20+), a MongoDB instance, and Redis.
- Copy `.env.example` to `.env.local` and set real values.

Local (docker-compose)

1. Build and run services:

```bash
docker-compose up --build
```

2. Open http://localhost:3000

Notes:
- `web` runs the Next.js production server.
- `worker` processes queued orders from Redis and persists them to MongoDB (or fallback file).

Cloud/Platform recommendations

- Use a managed MongoDB (Atlas) and managed Redis (Elasticache / Redis Cloud) in production.
- Put the app behind a load balancer (Nginx/ALB/Cloudflare) and use a CDN for static assets.
- Scale horizontally: run multiple `web` replicas; ensure `worker` services scale based on queue backlog.

Security & best-practices

- Set a secure `JWT_SECRET` and do not commit credentials.
- Use HTTPS and configure secure cookies in production.
- Enable monitoring and alerting (Prometheus, Datadog, Sentry for errors).
