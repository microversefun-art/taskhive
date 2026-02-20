# TaskHive

TaskHive is a monorepo containing the web platform, mobile app, and business docs.

## Structure
- `platform/` Web platform (Node.js/TypeScript)
- `mobile/` Mobile app (React Native/Expo)
- `docs/` Business and strategy documents

## Quick Start (Platform)
```bash
cd platform
pnpm install
cp .env.example .env
pnpm db:push
pnpm dev
```

## Quick Start (Mobile)
```bash
cd mobile
npm install
cp .env.example .env
npm start
```

## Docker (Platform)
```bash
cd platform
docker-compose up -d
```

## Notes
- See `platform/README_FINAL.md` for deeper platform docs.
- See `mobile/README.md` for mobile details.
