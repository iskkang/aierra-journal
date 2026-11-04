# Aierra’s Journal

Global Property Intelligence — UK-first editorial website starter.

## Development

```bash
npm install
npm run dev
```

## Deployment

Connect this repository to Vercel as a Next.js project (root directory `/`). Pushes to `main` will deploy after the Git integration is enabled.

## Editorial integrity

This is a design and navigation MVP. It intentionally does not show invented market prices, transaction statistics or published news. The chart is clearly labeled illustrative. Before enabling indexing and publishing, implement source-backed datasets, provenance, editorial review, and country-specific methodology. Remove `robots.index=false` in `app/layout.tsx` only after launch readiness.

## Roadmap

1. Official UK Land Registry Price Paid Data ingestion and normalization.
2. City detail pages, comparable time periods and verified charts.
3. News ingestion with source attribution and publication controls.
4. Country adapters for international expansion.
