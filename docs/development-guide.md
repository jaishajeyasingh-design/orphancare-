# Development Guide — OrphanCare AI

## Team Workflow & Separation of Concerns

This repository is structured for seamless multi-developer collaboration:

- **Developer A (Backend & AI)**:
  - Focuses on `server/` and `ai/` directories.
  - Builds Express routes, Mongoose models, repositories, and AI agent connectors.
- **Developer B (Frontend & UX)**:
  - Focuses on `client/` directory.
  - Builds UI components, dashboards, page layouts, and React state logic.

## Launching the Project Locally

```bash
# Install root dependencies
npm install

# Start both Server & Client concurrently
npm run dev
```

- Server runs on `http://localhost:5000`
- Frontend runs on `http://localhost:5173`
