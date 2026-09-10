# API Contract — OrphanCare AI

## Base Endpoint Pattern
`GET/POST/PUT/DELETE /api/{module}`

## Standard Endpoints Blueprint

### Authentication & Users
- `POST /api/auth/register` — Create user account
- `POST /api/auth/login` — Authenticate and issue JWT
- `GET /api/users/profile` — Fetch authenticated user details

### Children Management
- `GET /api/children` — List children (role restricted & anonymized)
- `POST /api/children` — Register a child profile
- `GET /api/children/:id` — Detailed child profile

### Opportunities
- `GET /api/opportunities` — List open opportunities/scholarships
- `POST /api/opportunities` — Create new support opportunity

### AI Endpoint Group (`/api/ai`)
- `POST /api/ai/analyze-needs` — Trigger child needs analysis agent
- `POST /api/ai/match` — Run matching algorithm between child & opportunities
- `POST /api/ai/development-plan` — Generate personalized growth plan
