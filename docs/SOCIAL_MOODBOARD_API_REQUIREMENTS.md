# Social Media & Moodboard API Requirements

**Created:** December 21, 2025
**Updated:** December 21, 2025
**Status:** ✅ Node Execution Support IMPLEMENTED (API Team)
**Priority:** Medium - Toolbar API still returns 500

---

## Backend Update Summary (Dec 21, 2025)

The API team has implemented node execution support for all Phase 2 nodes:

### Node Type → Template ID Mappings Added

**Social Media:**
| Node Type | Template ID |
|-----------|-------------|
| `thumbnailGenerator`, `socialThumbnail` | `social-thumbnail` |
| `hookGenerator`, `socialHook` | `social-hook` |
| `hashtagOptimizer`, `socialHashtag` | `social-hashtag` |
| `contentRepurposer`, `socialRepurpose` | `social-repurpose` |
| `reelGenerator`, `socialReel` | `social-reel` |
| `trendSpotter`, `socialTrends` | `social-trends` |

**Moodboard:**
| Node Type | Template ID |
|-----------|-------------|
| `moodboardLayout`, `layoutArranger` | `moodboard-layout` |
| `moodboardExport`, `exportMoodboard` | `moodboard-export` |
| `themeGenerator`, `moodboardTheme`, `visualTheme` | `moodboard-theme` |
| `inspirationCurator`, `moodboardInspiration`, `curateInspiration` | `moodboard-inspiration` |

### Breaking Change: AgentBinding Now Required

Nodes without `AgentBinding` will now **FAIL** with an error instead of silently passing through:
```
Error: Node 'X' (category: Y) has no agent binding. This node cannot execute...
```

**Impact:** Existing nodes created before this update need to be:
1. Recreated via the palette, OR
2. Have their `agent_binding` column updated directly in the database

### Debug Logging Added

The backend now logs detailed template resolution info:
- Template ID, nodeType, category → resolved ID
- Template lookup result with HasAgentBinding status
- Warnings for missing agent_binding_template

---

## Overview

This document specifies the missing API endpoints required for the Social Media and Moodboard board categories. The frontend has complete node definitions and UI components, but requires backend API support for full functionality.

---

## Critical Issue: Toolbar API 500 Errors

### Problem
The toolbar API returns 500 errors for new categories:
```
GET /api/creative-canvas/toolbars/moodboard → 500 Internal Server Error
GET /api/creative-canvas/toolbars/social → 500 Internal Server Error
```

### Required Fix
The `/api/creative-canvas/toolbars/{category}` endpoint needs to support these categories:
- `moodboard`
- `social`
- `interior` (verify working)

### Suggested Response Format
```json
{
  "success": true,
  "toolbar": {
    "category": "social",
    "actions": [
      {
        "id": "postGenerator",
        "icon": "📱",
        "label": "Post",
        "nodeType": "socialPostGenerator",
        "tooltip": "Generate Social Post"
      }
    ]
  }
}
```

**Note:** The frontend has client-side fallback toolbars, so this is not blocking basic functionality, but the 500 errors create console noise and prevent server-side toolbar customization.

---

## Social Media API Endpoints

### Existing Endpoints (Swagger v6)

| Endpoint | Method | Status |
|----------|--------|--------|
| `/api/social/post/generate` | POST | ✅ Exists |
| `/api/social/carousel/generate` | POST | ✅ Exists |
| `/api/social/caption/generate` | POST | ✅ Exists |
| `/api/social/story/create` | POST | ✅ Exists |
| `/api/social/template/customize` | POST | ✅ Exists |
| `/api/social/content/schedule` | POST | ✅ Exists |

### Missing Endpoints - NEW NODES

#### 1. Thumbnail Generator
```
POST /api/social/thumbnail/generate
```

**Request:**
```typescript
interface ThumbnailGenerateRequest {
  title: string;                    // Video title for text overlay
  keyFrameUrl?: string;             // Optional key frame image
  brandKitId?: string;              // Optional brand kit
  platform: 'youtube' | 'tiktok' | 'instagram' | 'vimeo';
  style: 'bold' | 'professional' | 'cinematic' | 'playful' | 'minimal';
  includeText: boolean;
  includeFace: boolean;
  numVariations: number;            // 1-6
}
```

**Response:**
```typescript
interface ThumbnailGenerateResponse {
  success: boolean;
  thumbnails: {
    url: string;
    width: number;
    height: number;
  }[];
  sessionId?: string;
}
```

**AI Model:** FLUX.2 Pro

---

#### 2. Hook Generator
```
POST /api/social/hook/generate
```

**Request:**
```typescript
interface HookGenerateRequest {
  topic: string;
  context?: string;
  platform: 'tiktok' | 'youtube' | 'twitter' | 'linkedin';
  hookType: 'curiosity' | 'controversial' | 'story' | 'question' | 'statistic' | 'problem';
  tone: 'energetic' | 'professional' | 'casual' | 'mysterious';
  numHooks: number;                 // 3-10
}
```

**Response:**
```typescript
interface HookGenerateResponse {
  success: boolean;
  hooks: string[];
  bestHook: string;
  reasoning?: string;
}
```

**AI Model:** Gemini 2.5 Flash

---

#### 3. Hashtag Optimizer
```
POST /api/social/hashtag/optimize
```

**Request:**
```typescript
interface HashtagOptimizeRequest {
  content: string;
  imageUrl?: string;                // For image analysis
  platform: 'instagram' | 'tiktok' | 'twitter' | 'linkedin';
  niche: 'fashion' | 'food' | 'fitness' | 'business' | 'tech' | 'art' | 'travel' | 'general';
  strategy: 'balanced' | 'highReach' | 'niche' | 'trending';
  hashtagCount: number;             // 5-30
}
```

**Response:**
```typescript
interface HashtagOptimizeResponse {
  success: boolean;
  hashtags: string[];               // Optimized mix
  trendingTags: string[];           // Currently trending
  nicheTags: string[];              // Niche-specific
  analytics?: {
    estimatedReach: string;
    competitionLevel: 'low' | 'medium' | 'high';
  };
}
```

**AI Model:** Gemini 2.5 Flash

---

#### 4. Content Repurposer
```
POST /api/social/content/repurpose
```

**Request:**
```typescript
interface ContentRepurposeRequest {
  originalContent: string;
  originalImageUrl?: string;
  brandKitId?: string;
  sourcePlatform: 'blog' | 'youtube' | 'podcast' | 'instagram' | 'article';
  targetPlatforms: 'all' | 'shortForm' | 'professional' | 'visual';
  adaptationStyle: 'optimized' | 'consistent' | 'experimental';
}
```

**Response:**
```typescript
interface ContentRepurposeResponse {
  success: boolean;
  adaptations: {
    platform: string;
    content: string;
    imageUrl?: string;
    characterCount: number;
    recommendedPostTime?: string;
  }[];
}
```

**AI Model:** Gemini 2.5 Flash

---

#### 5. Reel Generator
```
POST /api/social/reel/generate
```

**Request:**
```typescript
interface ReelGenerateRequest {
  concept: string;
  productImageUrls?: string[];
  voiceoverScript?: string;
  brandKitId?: string;
  duration: '7s' | '15s' | '30s' | '60s' | '90s';
  reelType: 'trending' | 'product' | 'tutorial' | 'beforeAfter' | 'dayInLife' | 'grwm' | 'storytime';
  pacing: 'fast' | 'medium' | 'slow';
  includeHook: boolean;
  includeCTA: boolean;
  trendingAudio: boolean;
}
```

**Response:**
```typescript
interface ReelGenerateResponse {
  success: boolean;
  jobId: string;                    // Async video generation
  estimatedDuration: number;        // Seconds
}

// Poll with GET /api/jobs/{jobId}
interface ReelJobResult {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  videoUrl?: string;
  storyboardFrames?: string[];
  script?: string;
  suggestedAudios?: string[];
}
```

**AI Model:** Kling 2.6 Pro

---

#### 6. Trend Spotter
```
POST /api/social/trends/analyze
```

**Request:**
```typescript
interface TrendAnalyzeRequest {
  niche: string;
  pastContent?: string;
  platform: 'tiktok' | 'instagram' | 'youtube' | 'twitter' | 'all';
  trendType: 'all' | 'audio' | 'format' | 'topic' | 'challenge';
  trendAge: 'emerging' | 'growing' | 'peak' | 'all';
}
```

**Response:**
```typescript
interface TrendAnalyzeResponse {
  success: boolean;
  trends: {
    name: string;
    type: 'audio' | 'format' | 'topic' | 'challenge';
    stage: 'emerging' | 'growing' | 'peak' | 'declining';
    relevanceScore: number;         // 0-100
    exampleUrls?: string[];
  }[];
  contentIdeas: string[];
  timingSuggestions: {
    bestDays: string[];
    bestTimes: string[];
    reasoning: string;
  };
}
```

**AI Model:** Gemini 2.5 Flash (with web search capability)

---

## Moodboard API Endpoints

### Existing Endpoints (Swagger v6)

| Endpoint | Method | Status |
|----------|--------|--------|
| `/api/moodboard/generate` | POST | ✅ Exists |
| `/api/moodboard/colors/extract` | POST | ✅ Exists |
| `/api/moodboard/brand-kit/generate` | POST | ✅ Exists |
| `/api/moodboard/typography/suggest` | POST | ✅ Exists |
| `/api/moodboard/aesthetic/analyze` | POST | ✅ Exists |
| `/api/moodboard/texture/generate` | POST | ✅ Exists |

### Missing Endpoints - NEW NODES

#### 1. Moodboard Layout
```
POST /api/moodboard/layout/arrange
```

**Request:**
```typescript
interface MoodboardLayoutRequest {
  imageUrls: string[];              // Images to arrange
  colorPaletteId?: string;          // Optional color palette
  title?: string;
  layoutStyle: 'grid' | 'collage' | 'polaroid' | 'magazine' | 'pinterest' | 'minimal';
  aspectRatio: '16:9' | '4:3' | '1:1' | '3:4' | 'a4';
  includeLabels: boolean;
  backgroundColor: 'white' | 'cream' | 'lightGray' | 'black' | 'fromPalette';
}
```

**Response:**
```typescript
interface MoodboardLayoutResponse {
  success: boolean;
  moodboardUrl: string;
  variations: string[];             // Layout variations
  dimensions: { width: number; height: number };
}
```

**AI Model:** FLUX.2 Pro

---

#### 2. Moodboard Export
```
POST /api/moodboard/export
```

**Request:**
```typescript
interface MoodboardExportRequest {
  moodboardUrl: string;             // Or moodboard data
  brandKitId?: string;
  title?: string;
  format: 'pdf' | 'png' | 'jpg' | 'pptx';
  quality: 'web' | 'high' | 'print';
  includeColorSwatches: boolean;
  includeCredits: boolean;
}
```

**Response:**
```typescript
interface MoodboardExportResponse {
  success: boolean;
  downloadUrl: string;
  format: string;
  fileSize: number;                 // Bytes
  expiresAt: string;                // ISO timestamp
}
```

**AI Model:** None (utility endpoint)

---

#### 3. Visual Theme Generator
```
POST /api/moodboard/theme/generate
```

**Request:**
```typescript
interface VisualThemeRequest {
  concept: string;
  referenceImageUrls?: string[];
  themeStyle: 'modern' | 'luxury' | 'bold' | 'organic' | 'vintage' | 'dark' | 'light';
  industry: 'fashion' | 'food' | 'tech' | 'wellness' | 'creative' | 'corporate' | 'general';
  colorMood: 'warm' | 'cool' | 'neutral' | 'balanced' | 'mono';
}
```

**Response:**
```typescript
interface VisualThemeResponse {
  success: boolean;
  moodboardUrl: string;
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
    neutral: string;
    background: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    accentFont?: string;
    sampleUrl: string;
  };
  styleGuide: string;               // Markdown guidelines
}
```

**AI Model:** FLUX.2 Pro + Gemini 2.5 Flash

---

#### 4. Inspiration Curator
```
POST /api/moodboard/inspiration/curate
```

**Request:**
```typescript
interface InspirationCurateRequest {
  keywords: string;
  avoidTerms?: string;
  category: 'general' | 'photography' | 'graphicDesign' | 'interior' | 'fashion' | 'architecture' | 'art' | 'typography';
  colorFilter: 'any' | 'warm' | 'cool' | 'neutral' | 'bw' | 'colorful';
  numImages: number;                // 6-24
}
```

**Response:**
```typescript
interface InspirationCurateResponse {
  success: boolean;
  images: {
    url: string;
    source?: string;
    tags: string[];
  }[];
  moodboardUrl: string;             // Auto-arranged
  relatedKeywords: string[];
}
```

**AI Model:** Gemini 2.5 Flash (with image search)

---

## Implementation Priority

### Phase 1 - Critical (Immediate)
1. **Fix Toolbar API** - Add moodboard/social category support
2. **Hook Generator** - High-value for content creators
3. **Hashtag Optimizer** - Essential for social media workflow

### Phase 2 - High Priority
4. **Thumbnail Generator** - YouTube creator need
5. **Trend Spotter** - Competitive advantage
6. **Content Repurposer** - Efficiency feature

### Phase 3 - Medium Priority
7. **Reel Generator** - Complex video generation
8. **Visual Theme Generator** - Brand development
9. **Moodboard Layout** - Design workflow
10. **Inspiration Curator** - Research feature
11. **Moodboard Export** - Utility feature

---

## AI Model Requirements

| Model | Use Case | Endpoints |
|-------|----------|-----------|
| **FLUX.2 Pro** | Image generation | thumbnail, moodboardLayout, visualTheme |
| **Gemini 2.5 Flash** | Text generation, analysis | hook, hashtag, repurpose, trend, inspiration |
| **Kling 2.6 Pro** | Video generation | reel |

---

## Notes for API Team

1. **Async Jobs** - Reel generation should use the existing job system (`GET /api/jobs/{jobId}`)
2. **Rate Limiting** - Trend Spotter should be rate-limited per user (expensive web search)
3. **Caching** - Trend data should be cached for 1 hour minimum
4. **Image Storage** - All generated images should be stored in GCS with 30-day retention
5. **Analytics** - Track usage per node type for billing/quotas

---

## Related Documents

- `docs/NEW_CATEGORIES_API_REQUIREMENTS.md` - Interior Design API
- `docs/FASHION_API_REQUIREMENTS.md` - Fashion API
- `docs/STORYTELLING_API_REQUIREMENTS.md` - Storytelling API
- `architectureDesign.md` - Architecture decisions
