# Rekindle

A curated romance and occasion-planning platform built with a TypeScript monorepo architecture.

## Architecture & Tech Stack

```text
rekindle/
├── artifacts/
│   ├── rekindle/                   # Presentation Layer (React 19 + Vite + Tailwind v4)
│   └── api-server/                 # Application Layer (Express 5 + Node.js REST API)
└── lib/
    ├── db/                         # Data Access Layer (Drizzle ORM + Neon Serverless Postgres)
    ├── integrations-anthropic-ai/  # AI Concierge Layer (Anthropic Claude SDK)
    └── api-zod/                    # Shared Validation Schemas (Zod)