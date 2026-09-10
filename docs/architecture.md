# OrphanCare AI — High-Level Architecture

## Overview
OrphanCare AI is a social-impact platform designed to connect vulnerable children lacking parental care with personalized opportunities, supporters, educational programs, and progress tracking.

```text
                    ORPHANCARE AI
                          │
             ┌────────────┴────────────┐
             │                         │
          FRONTEND                  BACKEND
             │                         │
       User Interface             REST APIs
             │                         │
             └────────────┬────────────┘
                          │
                       DATABASE
                          │
                          │
                    AI SERVICE LAYER
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
   Child Analysis     Matching         Development
      Agents           Agents             Agents
```

## Core Architecture Layers

1. **Frontend**: React + Vite SPA. Communicates strictly with backend REST endpoints.
2. **Backend**: Express API Gateway. Handles Auth, Database operations, middleware validation, and dispatches asynchronous or synchronous jobs to the AI service.
3. **Database**: MongoDB (Mongoose models) preserving privacy and data isolation.
4. **AI Layer**: Microservice holding specialized agents (`child_profile_agent`, `needs_analysis_agent`, `matching_agent`, `development_plan_agent`, `impact_agent`).

## Communication Flow
```text
Frontend -> Backend API -> AI Service -> Specialized Agent -> AI Recommendation -> Backend DB -> Admin Verification -> Frontend
```
