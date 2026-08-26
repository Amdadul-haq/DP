================================================================================
                    DIGITAL PRESCRIPTION - DOCKER SETUP GUIDE
================================================================================

Complete guide to run the Digital Prescription application using Docker on any 
machine.

================================================================================
PREREQUISITES
================================================================================

- Docker Desktop (Windows/Mac) or Docker Engine (Linux)
- Docker Compose (included with Docker Desktop)
- Minimum 4GB RAM (8GB recommended)
- 10GB free disk space

Install Docker:
- Windows/Mac: Download from https://www.docker.com/products/docker-desktop/
- Linux (Ubuntu/Debian): sudo apt update && sudo apt install docker.io docker-compose -y

================================================================================
WHAT'S INCLUDED
================================================================================

2 Docker containers:

+------------------+----------------------------------+----------+
| Container        | Purpose                          | Port     |
+------------------+----------------------------------+----------+
| PostgreSQL 17    | Database                         | 5432     |
| Next.js App      | Digital Prescription Application | 3028     |
+------------------+----------------------------------+----------+

================================================================================
QUICK START (3 STEPS)
================================================================================

STEP 1: Download Required Files

Create a folder and get these 3 files:

mkdir digital-prescription
cd digital-prescription

Required Files:
1. docker-compose.yml - Container configuration
2. .env.docker - Environment variables
3. full_backup.dump - Database backup

STEP 2: Pull Docker Images

docker pull amdadulhaq/digital-prescription-app:latest
docker pull postgres:17-alpine

STEP 3: Start & Restore

docker compose up -d

cat full_backup.dump | docker exec -i digital-prescription-postgres pg_restore --clean --if-exists -U postgres -d digital_prescription

docker exec digital-prescription-postgres psql -U postgres -d digital_prescription -c "SELECT COUNT(*) FROM medicines;"

Expected Output:
 count
-------
 17268
(1 row)

================================================================================
ACCESS APPLICATION
================================================================================

Open browser: http://localhost:3028

================================================================================
DOCKER COMMANDS REFERENCE
================================================================================

CONTAINER MANAGEMENT:

docker compose up -d          # Start containers (background)
docker compose down           # Stop and remove containers
docker compose down -v        # Stop, remove containers AND delete data
docker compose ps             # Show container status
docker compose restart        # Restart all containers
docker compose logs -f        # View live logs

INDIVIDUAL CONTAINER CONTROL:

docker stop digital-prescription-postgres    # Stop database
docker start digital-prescription-postgres   # Start database
docker stop digital-prescription-app         # Stop app
docker start digital-prescription-app        # Start app

DATABASE COMMANDS:

# Enter PostgreSQL CLI
docker exec -it digital-prescription-postgres psql -U postgres -d digital_prescription

# Create backup
docker exec digital-prescription-postgres pg_dump -Fc -U postgres digital_prescription > backup.dump

# Restore from backup
cat backup.dump | docker exec -i digital-prescription-postgres pg_restore --clean --if-exists -U postgres -d digital_prescription

# Check data
docker exec digital-prescription-postgres psql -U postgres -d digital_prescription -c "SELECT COUNT(*) FROM medicines;"

LOGS & DEBUGGING:

docker compose logs -f app           # App logs only
docker compose logs -f postgres      # Database logs only
docker compose logs --tail=100       # Last 100 lines

================================================================================
CONFIGURATION FILE (.env.docker)
================================================================================

# Database Connection
DATABASE_URL=postgresql://postgres:milon@postgres:5432/digital_prescription
DB_SSL=false

# JWT Secret
JWT_SECRET=c8aead536744c8378ef44287754daa03e8df0812

# App URL
NEXTAUTH_URL=http://localhost:3028

# Email Settings (Brevo SMTP)
EMAIL_HOST=smtp-relay.brevo.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=9c6ea6001@smtp-brevo.com
EMAIL_PASSWORD=GmJ57z32OEsvYKdP
EMAIL_FROM=Digital Prescription<milon.s2k21@gmail.com>

# Telegram Bot (Optional)
TELEGRAM_ENABLED=true
TELEGRAM_BOT_TOKEN=8546425561:AAGNDAecv2N4LHnyApxx_Id-XbqWRZAQSkM
TELEGRAM_ADMIN_CHAT_ID=5537486293

# Admin Email
ADMIN_EMAIL=milon.s2k21@gmail.com

# App Runtime
PORT=3000
HOSTNAME=0.0.0.0
NEXT_TELEMETRY_DISABLED=1

# Puppeteer (PDF Generation)
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
CHROME_BIN=/usr/bin/chromium

================================================================================
TESTING CHECKLIST
================================================================================

+----------------------+------------------------------------------+-------------------+
| Test                 | Command/URL                              | Expected          |
+----------------------+------------------------------------------+-------------------+
| Containers Running   | docker compose ps                        | Both "Up"         |
| Medicines Count      | SELECT COUNT(*) FROM medicines;          | 17268             |
| Users Count          | SELECT COUNT(*) FROM users;              | 4                 |
| App Access           | http://localhost:3028                    | Loads             |
| Login                | Admin credentials                        | Success           |
+----------------------+------------------------------------------+-------------------+

================================================================================
TROUBLESHOOTING
================================================================================

ERROR: Connection refused

docker ps | grep postgres
docker restart digital-prescription-postgres
docker restart digital-prescription-app

ERROR: pg_restore role does not exist

IGNORE these errors. They are Supabase-specific and don't affect your data.

ERROR: Port 3028 already in use

netstat -ano | findstr :3028
taskkill /PID <PID> /F

OR change port in docker-compose.yml:
ports:
  - "3028:3000"  # Change 3028 to any free port

ERROR: Image not found

docker pull amdadulhaq/digital-prescription-app:latest

OR build locally:
docker build -t amdadulhaq/digital-prescription-app:latest .

ERROR: Database connection failed

docker logs digital-prescription-postgres
docker compose down
docker compose up -d
sleep 15
docker restart digital-prescription-app

================================================================================
DATA BACKUP & RESTORE
================================================================================

CREATE BACKUP:

docker exec digital-prescription-postgres pg_dump -Fc -U postgres digital_prescription > backup_$(date +%Y%m%d).dump

RESTORE BACKUP:

cat backup_20260127.dump | docker exec -i digital-prescription-postgres pg_restore --clean --if-exists -U postgres -d digital_prescription

SCHEDULED BACKUP (Daily at 2 AM):

Create script backup.sh:
#!/bin/bash
docker exec digital-prescription-postgres pg_dump -Fc -U postgres digital_prescription > /path/to/backups/backup_$(date +%Y%m%d_%H%M%S).dump
find /path/to/backups -name "*.dump" -mtime +7 -delete

Add to crontab:
0 2 * * * /path/to/backup.sh

================================================================================
PRODUCTION DEPLOYMENT
================================================================================

WITH SSL (Let's Encrypt):

1. Install Certbot
2. Configure Nginx reverse proxy
3. Update NEXTAUTH_URL=https://yourdomain.com
4. Enable SSL in database: DB_SSL=true

DOCKER SWARM:

docker stack deploy -c docker-compose.yml digital-prescription

KUBERNETES (using kompose):

kompose convert -f docker-compose.yml
kubectl apply -f .

================================================================================
IMPORTANT SECURITY NOTES
================================================================================

- NEVER commit .env.docker to Git
- Change default passwords in production
- Use different JWT_SECRET in production
- Enable SSL/TLS in production
- Regularly backup your database

================================================================================
DATA PERSISTENCE
================================================================================

- Database data stored in volume: postgres_data
- Volume persists after containers removed
- docker compose down -v deletes data (CAUTION!)

================================================================================
QUICK REFERENCE COMMANDS
================================================================================

# Quick Start
docker compose up -d

# Quick Stop
docker compose down

# View Logs
docker compose logs -f

# Check Data
docker exec digital-prescription-postgres psql -U postgres -d digital_prescription -c "SELECT COUNT(*) FROM medicines;"

# Create Backup
docker exec digital-prescription-postgres pg_dump -Fc -U postgres digital_prescription > backup.dump

# Restore Backup
cat backup.dump | docker exec -i digital-prescription-postgres pg_restore --clean --if-exists -U postgres -d digital_prescription

# Enter Database
docker exec -it digital-prescription-postgres psql -U postgres -d digital_prescription

# Full Cleanup (Deletes data!)
docker compose down -v

================================================================================
SUCCESS INDICATORS
================================================================================

Setup is successful when:
- Both containers running
- Medicines: 17268 records
- Users: 4 records
- App accessible at http://localhost:3028
- Login working
- All features functional

================================================================================
RESOURCES
================================================================================

Docker: https://docs.docker.com/
PostgreSQL: https://www.postgresql.org/docs/
Next.js: https://nextjs.org/docs
Docker Hub: https://hub.docker.com/r/amdadulhaq/digital-prescription-app

================================================================================
Happy Prescribing!
Last Updated: August 2026
================================================================================