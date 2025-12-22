# CLAUDE.md

This file provides guidance to Claude Code when working with the Creative Canvas Studio codebase.

## Project Overview

**Creative Canvas Studio** is a standalone React application for visual AI workflow orchestration. It provides an infinity-board, node-based interface for composing AI-powered creative workflows using cutting-edge generative AI models from fal.ai.

## Common Development Commands

```bash
# Install dependencies
npm install

# Start development server (runs on port 3001)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

## Architecture

### Tech Stack
- **React 19** with TypeScript
- **Vite** for build tooling
- **@xyflow/react** (React Flow) for node-based canvas
- **Zustand** for state management
- **MUI v7** for UI components
- **Axios** for API communication

### Directory Structure
```
src/
├── components/
│   ├── canvas/       # Main canvas components
│   ├── nodes/        # Custom React Flow node types
│   ├── panels/       # Side panels (palette, inspector)
│   └── common/       # Shared UI components
├── config/           # Node definitions, configuration
├── hooks/            # Custom React hooks
├── models/           # TypeScript interfaces
├── services/         # API services
├── stores/           # Zustand stores
└── utils/            # Utility functions
```

### Key Concepts

1. **Boards**: Workspaces categorized by domain (Fashion, Story, Interior, Stock)
2. **Nodes**: Visual blocks representing AI operations (image gen, video gen, 3D, etc.)
3. **Connections**: Data flow between nodes
4. **Moments of Delight**: Special connection actions that trigger domain-specific workflows

### Node Categories
- **Input**: Text, image, video, audio uploads
- **Image Gen**: FLUX.2 Pro/Dev, Nano Banana Pro, FLUX Kontext
- **Video Gen**: Kling 2.6/O1, VEO 3.1, Kling Avatar
- **3D Gen**: Meshy 6, Tripo v2.5
- **Character**: Character Lock, Face Memory, Element Library
- **Style**: Style DNA, Style Transfer, LoRA Training
- **Composite**: Virtual Try-On, Runway Animation, Storyboard Autopilot
- **Output**: Preview, Export

### Backend Integration
- API Project: `creator-canvas-api` (standalone ASP.NET Core API)
- API Base URL: `https://localhost:7003` (configurable via VITE_API_BASE_URL)
- HTTP alternative: `http://localhost:5003`
- Proxy configured in vite.config.ts
- All API calls go through `src/services/api.ts`

## Development Guidelines

1. **TypeScript**: Strict mode enabled - all code must be type-safe
2. **State Management**: Use Zustand store (`useCanvasStore`) for global state
3. **Node Types**: Define in `src/config/nodeDefinitions.ts`
4. **Models**: Define in `src/models/canvas.ts`

## ⚠️ CRITICAL: API Integration Rules

### NEVER Work Around Missing API Endpoints

When an API endpoint returns 404 or doesn't exist, **DO NOT**:
- Route calls through different/generic endpoints
- Mock responses or implement client-side alternatives
- Use fallback endpoints that weren't designed for the use case

**Instead:**
1. Document the missing endpoint in `docs/FASHION_API_REQUIREMENTS.md` or relevant requirements doc
2. Add to the tracker in `architectureDesign.md` under "Missing API Endpoints - Request Tracker"
3. Communicate with the API team (`creator-canvas-api` project)
4. Let the feature fail gracefully or show "Coming Soon" until the endpoint exists

**Why:** Workarounds create hidden technical debt, bypass designed architecture, cause inconsistent behavior, and make the codebase harder to maintain. This project has a dedicated API team - use proper channels.

### Currently Missing Endpoints (Request from API Team)

| Endpoint | Purpose | Status |
|----------|---------|--------|
| `POST /api/fashion/clothes-swap` | Swap garments between images | ⏳ Pending |
| `POST /api/fashion/runway-animation` | Generate fashion runway videos | ⏳ Pending |

See `architectureDesign.md` for full anti-pattern documentation and examples.

## Related Documentation

- See `docs/CREATIVE_CANVAS_STUDIO_ENHANCED_STRATEGY.md` for full implementation roadmap
- Strategy covers 7 phases over 19 weeks
- API requirements for backend integration included in strategy doc

## Parent Project

This is a standalone extraction from `ssgp-v2-agents-ui-react`. The parent project contains the original Creative Canvas implementation and other AI agent studios.
