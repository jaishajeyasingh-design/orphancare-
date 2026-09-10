# Project Structure — OrphanCare AI

```text
OrphanCare/
├── client/                      # Frontend Application (React + Vite)
│   ├── src/
│   │   ├── assets/              # Static media, icons, images
│   │   ├── components/          # Reusable UI components (cards, forms, layout, modals, ui, common)
│   │   ├── config/              # Constants, app settings
│   │   ├── context/             # Auth & Global state contexts
│   │   ├── hooks/               # Custom React hooks
│   │   ├── layouts/             # MainLayout, AuthLayout
│   │   ├── pages/               # Module pages (admin, donor, volunteer, child, matching, etc.)
│   │   ├── routes/              # App route configuration
│   │   ├── services/            # API, Auth, AI client abstractions
│   │   ├── types/               # Prop types & TypeScript declarations
│   │   └── utils/               # Helper utilities & formatters
│   └── package.json
│
├── server/                      # Backend Application (Express + Node)
│   ├── src/
│   │   ├── config/              # Database & app configs
│   │   ├── controllers/         # Request handlers
│   │   ├── middleware/          # Auth & Role verification middlewares
│   │   ├── models/              # Mongoose data models
│   │   ├── repositories/        # Data access layer
│   │   ├── routes/              # Express API routers
│   │   ├── schemas/             # Input validation schemas
│   │   ├── services/            # Business & AI integration logic
│   │   └── utils/               # Backend helper functions
│   └── package.json
│
├── ai/                          # AI Service Layer
│   ├── agents/                  # Autonomous specialized AI agents
│   │   ├── child_profile_agent/
│   │   ├── needs_analysis_agent/
│   │   ├── opportunity_agent/
│   │   ├── matching_agent/
│   │   ├── development_plan_agent/
│   │   └── impact_agent/
│   ├── config/                  # AI LLM settings & environment setup
│   ├── evaluators/              # AI quality & feedback metrics
│   ├── models/                  # Pydantic / Data schemas for AI
│   ├── pipelines/               # Agent execution chains
│   ├── prompts/                 # System prompts & prompt templates
│   ├── services/                # Core LLM invocation clients
│   └── utils/                   # Sanitizers & parsers
│
└── docs/                        # Project Architecture Documentation
```
