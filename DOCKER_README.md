# Docker Setup

This project uses a standalone Next.js 16 build plus a local PostgreSQL 15 service.
The database schema is initialized from [src/lib/schema.sql](src/lib/schema.sql) the first time the database volume is created.

## Files

- [Dockerfile](Dockerfile)
- [docker-compose.yml](docker-compose.yml)
- [.dockerignore](.dockerignore)
- [.env.docker.example](.env.docker.example)

## Prerequisites

1. Docker Desktop installed.
2. A local `.env.docker` file created from `.env.docker.example`.

## Local Run

1. Copy the example environment file:

```bash
cp .env.docker.example .env.docker
```

On Windows PowerShell, use:

```powershell
Copy-Item .env.docker.example .env.docker
```

2. Start the stack:

```bash
docker compose up --build
```

3. Open the app at `http://localhost:3000`.

## Database Notes

- PostgreSQL runs as a separate local container.
- Data is persisted in the `pgdata` volume.
- The schema is loaded automatically only on the first database initialization.
- If you need to re-run the schema from scratch, remove the volume with `docker compose down -v` and start again.

## PDF Generation

The app container installs Chromium and points Puppeteer at it through `PUPPETEER_EXECUTABLE_PATH`.
That keeps the PDF route working inside Docker without relying on cloud-specific binaries.

## Build and Push to Docker Hub

Replace `yourdockerhubuser` with your Docker Hub namespace.

```bash
docker login
docker buildx build --platform linux/amd64 -t yourdockerhubuser/digital-prescription:latest --push .
```

If you want an additional version tag:

```bash
docker buildx build --platform linux/amd64 \
  -t yourdockerhubuser/digital-prescription:latest \
  -t yourdockerhubuser/digital-prescription:1.0.0 \
  --push .
```

## Useful Commands

```bash
docker compose logs -f app
docker compose logs -f db
docker compose down
docker compose down -v
```