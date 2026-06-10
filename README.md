# Fat Fitness Community

Personal fat fitness journey, blog, and community platform.

## Tech Stack

- Frontend: Next.js, React, TypeScript, Tailwind CSS
- Backend: Spring Boot, Java, Gradle
- Database: PostgreSQL
- Infrastructure: Docker Compose for local development

## Local Development

### Start database

```
cd infrastructure
docker compose up -d
```

### Start backend

```
cd backend/fatfitness-api
./gradlew bootRun
```

### start frontend

```
cd frontend/fatfitness-web
npm run dev
```

### Frontend:
http://localhost:3000

### backend:
http://localhost:8080
