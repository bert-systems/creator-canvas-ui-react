# Tech Stack - Creative Canvas Studio

**Last Updated:** December 17, 2025

## Frontend Framework

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.2.0 | UI framework |
| **TypeScript** | ~5.9.3 | Type safety |
| **Vite** | 7.2.4 | Build tool, dev server |

## UI Libraries

| Library | Version | Purpose |
|---------|---------|---------|
| **@xyflow/react** | 12.10.0 | React Flow - node-based canvas |
| **@mui/material** | 7.3.6 | Material UI components |
| **@mui/icons-material** | 7.3.6 | Material icons |
| **@emotion/react** | 11.14.0 | CSS-in-JS styling |
| **@emotion/styled** | 11.14.1 | Styled components |

## State Management

| Library | Version | Purpose |
|---------|---------|---------|
| **Zustand** | 5.0.9 | Global state management |

Features used:
- `devtools` middleware for debugging
- `persist` middleware for localStorage sync

## Routing & HTTP

| Library | Version | Purpose |
|---------|---------|---------|
| **react-router-dom** | 7.10.1 | Client-side routing |
| **Axios** | 1.13.2 | HTTP client |

## Development Tools

| Tool | Version | Purpose |
|------|---------|---------|
| **ESLint** | 9.39.1 | Linting |
| **typescript-eslint** | 8.46.4 | TypeScript ESLint |
| **eslint-plugin-react-hooks** | 7.0.1 | React hooks rules |
| **eslint-plugin-react-refresh** | 0.4.24 | Fast refresh support |
| **@vitejs/plugin-react** | 5.1.1 | Vite React plugin |

## Type Definitions

| Package | Version |
|---------|---------|
| **@types/node** | 24.10.3 |
| **@types/react** | 19.2.5 |
| **@types/react-dom** | 19.2.3 |

## Backend Integration

| Component | Technology | Notes |
|-----------|------------|-------|
| **API Project** | creator-canvas-api | Standalone ASP.NET Core API |
| **API Server** | ASP.NET Core | HTTPS: `https://localhost:7003`, HTTP: `http://localhost:5003` |
| **API Prefix** | `/api/*` | Creative Canvas endpoints |
| **Auth** | JWT Bearer | PostgreSQL identity provider |
| **Storage** | Google Cloud Storage | Asset storage |
| **Queue** | Memory/File-based | Job processing |

## AI Model Integration (via fal.ai Backend)

### Image Generation
| Model | API Endpoint | Use Case |
|-------|--------------|----------|
| **FLUX.2 Pro** | `fal-ai/flux-pro/v1.1` | High-fidelity production images |
| **FLUX.2 Dev** | `fal-ai/flux/dev` | Experimental with LoRA |
| **Nano Banana Pro** | `fal-ai/nano-banana-pro` | Multi-reference (14 refs, 5 faces) |
| **FLUX Kontext** | `fal-ai/flux-kontext/pro` | Context-aware editing |

### Video Generation (Planned)
| Model | API Endpoint | Use Case |
|-------|--------------|----------|
| **Kling 2.6 T2V** | `fal-ai/kling-video/v2.6/pro/text-to-video` | Text-to-video with audio |
| **Kling 2.6 I2V** | `fal-ai/kling-video/v2.6/pro/image-to-video` | Image animation |
| **Kling O1 Ref2V** | `fal-ai/kling-video/v1.6/pro/elements` | Character consistency |
| **VEO 3.1** | `fal-ai/veo3` | Cinematic video |
| **Kling Avatar** | `fal-ai/kling-video/v2/avatar` | Talking head |

### 3D Generation (Planned)
| Model | API Endpoint | Use Case |
|-------|--------------|----------|
| **Meshy 6** | `fal-ai/meshy` | Image-to-3D with PBR |
| **Tripo v2.5** | `fal-ai/tripo` | Fast 3D generation |

## Build Configuration

### Vite Config (`vite.config.ts`)
```typescript
{
  server: { port: 3001 },
  resolve: { alias: { '@': '/src' } },
  proxy: { '/api': 'https://localhost:7003' }
}
```

### TypeScript Config
- Strict mode enabled
- Path aliases: `@/*` -> `src/*`
- ES2020+ target

## Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `VITE_API_BASE_URL` | `https://localhost:7003` | Backend API URL |

## Package Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (port 3001) |
| `npm run build` | TypeScript check + Vite build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES2020+ features required
- No IE11 support

## Key Dependencies Graph

```
React 19
├── @xyflow/react (React Flow)
│   └── Infinite canvas, node management
├── @mui/material
│   └── @emotion/react, @emotion/styled
├── Zustand
│   └── State persistence
├── Axios
│   └── API communication
└── react-router-dom
    └── SPA routing
```

## Future Additions (Roadmap)

| Technology | Purpose | Phase |
|------------|---------|-------|
| **SignalR** | Real-time updates | Phase 6 |
| **Three.js** | 3D model preview | Phase 5 |
| **Web Workers** | Background processing | Phase 7 |
| **IndexedDB** | Local asset cache | Phase 7 |
| **ElevenLabs SDK** | Voice synthesis | Phase 4 |

## Known Constraints

1. **CORS**: Backend must allow `localhost:3001` origin
2. **SSL**: Backend uses HTTPS, requires cert trust
3. **File Size**: Large video/3D uploads need chunking
4. **Memory**: Canvas with 100+ nodes may need virtualization
