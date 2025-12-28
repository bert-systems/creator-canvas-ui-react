# Storyteller Studio - API Requirements Addendum

**Version:** 1.0
**Date:** December 26, 2025
**Related:** `STORYTELLING_API_REQUIREMENTS.md` (v1.1), Swagger v17

---

## Purpose

This document supplements the existing `STORYTELLING_API_REQUIREMENTS.md` with:
1. Service layer corrections needed for existing endpoints
2. New endpoints required for Storyteller Studio features
3. Interior Design Studio status (no new requirements)

---

## 1. Service Layer Corrections Required

### 1.1 URL Mismatches in `storyGenerationService.ts`

The service layer is calling incorrect endpoint URLs. These need to be updated to match swagger v17:

| Service Method | Current URL (Wrong) | Swagger URL (Correct) | Status |
|----------------|---------------------|----------------------|--------|
| `generateStoryStructure()` | `/api/agent/story/generate-structure` | `/api/storytelling/structure` | **Needs Update** |
| `generateScene()` | `/api/agent/scene/generate` | `/api/storytelling/generate-scene` | **Needs Update** |
| `generatePlotTwist()` | `/api/agent/story/generate-twist` | `/api/storytelling/generate-twist` | **Needs Update** |
| `enhanceStory()` | `/api/agent/story/enhance` | `/api/storytelling/enhance` | **Needs Update** |
| `generateCharacter()` | `/api/agent/character/generate` | `/api/character-library/generate` | **Needs Update** |

### 1.2 Endpoints Confirmed Working

| Endpoint | Service Method | Status |
|----------|---------------|--------|
| `POST /api/storytelling/start` | `startStory()` | Working |
| `POST /api/storytelling/dialogue/generate` | `generateDialogue()` | Working |
| `POST /api/storytelling/world/environment` | `generateLocation()` | Working |
| `GET /api/storytelling/health` | N/A | Working |
| `GET /api/character-library/health` | N/A | Working |

### 1.3 Action Required

**Frontend Team:**
1. Update service URLs to match swagger definitions
2. Test each endpoint after URL correction
3. Implement error handling for potential 404s

**Backend Team:**
1. Verify all swagger-defined endpoints are implemented
2. Confirm request/response schemas match swagger
3. Report any endpoints that return 404 despite swagger definition

---

## 2. New Endpoints Required for Storyteller Studio

These endpoints are **NOT currently in swagger** and are needed for full studio functionality.

### 2.1 Character Development Endpoints

#### `POST /api/storytelling/character/voice`
**Purpose:** Generate character voice profile with speech patterns and sample dialogue

**Request:**
```json
{
  "characterProfile": {
    "name": "string",
    "personality": "string",
    "background": "string",
    "education": "string",
    "age": "number",
    "region": "string"
  },
  "storyContext": "string",
  "options": {
    "includeQuirks": "boolean",
    "sampleCount": "number (1-5)"
  }
}
```

**Response:**
```json
{
  "voiceProfile": {
    "speechPattern": "string",
    "vocabulary": "string[]",
    "quirks": "string[]",
    "emotionalRange": "string"
  },
  "sampleDialogue": [
    {
      "situation": "string",
      "dialogue": "string"
    }
  ]
}
```

**Priority:** P1 - Required for Character Flow

---

#### `POST /api/storytelling/character/relationship`
**Purpose:** Analyze and generate relationship dynamics between characters

**Request:**
```json
{
  "characterA": {
    "name": "string",
    "profile": "string"
  },
  "characterB": {
    "name": "string",
    "profile": "string"
  },
  "storyContext": "string",
  "relationshipType": "string (optional)"
}
```

**Response:**
```json
{
  "relationshipProfile": {
    "type": "string",
    "dynamic": "string",
    "tension": "string",
    "sharedHistory": "string"
  },
  "conflicts": "string[]",
  "bondingMoments": "string[]"
}
```

**Priority:** P2 - Character connections panel

---

### 2.2 World Building Endpoints

#### `POST /api/storytelling/world/lore`
**Purpose:** Generate world lore, history, and factions

**Request:**
```json
{
  "worldConcept": "string",
  "genre": "string",
  "storyContext": "string",
  "options": {
    "includeHistory": "boolean",
    "includeFactions": "boolean",
    "includeMagicSystem": "boolean",
    "detailLevel": "brief | standard | detailed"
  }
}
```

**Response:**
```json
{
  "worldLore": {
    "overview": "string",
    "history": "string",
    "cultures": ["string"],
    "factions": [
      {
        "name": "string",
        "description": "string",
        "motivation": "string"
      }
    ],
    "magicSystem": "string | null"
  },
  "timeline": [
    {
      "era": "string",
      "events": "string[]"
    }
  ]
}
```

**Priority:** P2 - World lore panel in workspace

---

#### `POST /api/storytelling/world/timeline`
**Purpose:** Generate story event timeline for timeline mode

**Request:**
```json
{
  "story": "string",
  "lore": "string (optional)",
  "characters": [
    {
      "name": "string",
      "role": "string"
    }
  ]
}
```

**Response:**
```json
{
  "timeline": [
    {
      "id": "string",
      "event": "string",
      "description": "string",
      "timePosition": "string",
      "characters": "string[]",
      "importance": "major | minor | turning_point"
    }
  ],
  "arcs": [
    {
      "character": "string",
      "phases": ["string"]
    }
  ]
}
```

**Priority:** P2 - Timeline mode visualization

---

### 2.3 Branching Narrative Endpoints

#### `POST /api/storytelling/branch/choice`
**Purpose:** Generate choice point with multiple path options

**Request:**
```json
{
  "precedingScene": "string",
  "characters": [
    {
      "name": "string",
      "profile": "string"
    }
  ],
  "storyContext": "string",
  "options": {
    "pathCount": "number (2-4)",
    "consequencePreview": "boolean"
  }
}
```

**Response:**
```json
{
  "choicePoint": {
    "situation": "string",
    "dilemma": "string"
  },
  "paths": [
    {
      "id": "string",
      "label": "string",
      "description": "string",
      "immediateConsequence": "string",
      "longTermHint": "string"
    }
  ]
}
```

**Priority:** P3 - Branching story flow

---

#### `POST /api/storytelling/branch/consequence`
**Purpose:** Track accumulated consequences across choices

**Request:**
```json
{
  "previousChoices": [
    {
      "choiceId": "string",
      "pathTaken": "string"
    }
  ],
  "storyContext": "string",
  "characters": ["string"]
}
```

**Response:**
```json
{
  "accumulatedConsequences": {
    "worldState": "string[]",
    "characterChanges": [
      {
        "character": "string",
        "changes": "string[]"
      }
    ],
    "relationshipChanges": "string[]"
  },
  "narrativeMomentum": "string"
}
```

**Priority:** P3 - Branching story flow

---

#### `POST /api/storytelling/branch/merge`
**Purpose:** Merge divergent paths back into single narrative

**Request:**
```json
{
  "paths": [
    {
      "pathId": "string",
      "summary": "string",
      "keyEvents": "string[]"
    }
  ],
  "storyContext": "string",
  "mergePoint": "string (description of where paths converge)"
}
```

**Response:**
```json
{
  "mergedScene": "string",
  "pathVariations": [
    {
      "pathId": "string",
      "uniqueElements": "string[]"
    }
  ],
  "unifiedOutcome": "string"
}
```

**Priority:** P3 - Branching story flow

---

### 2.4 Export & Format Endpoints

#### `POST /api/storytelling/format/screenplay`
**Purpose:** Convert story content to screenplay format

**Request:**
```json
{
  "content": "string",
  "format": "fountain | fdx | pdf",
  "options": {
    "includeSceneNumbers": "boolean",
    "includePageBreaks": "boolean"
  }
}
```

**Response:**
```json
{
  "formattedContent": "string",
  "pageCount": "number",
  "downloadUrl": "string (for PDF)"
}
```

**Priority:** P2 - Export feature

---

#### `POST /api/storytelling/format/manuscript`
**Purpose:** Export story as manuscript document

**Request:**
```json
{
  "chapters": [
    {
      "title": "string",
      "content": "string"
    }
  ],
  "metadata": {
    "title": "string",
    "author": "string",
    "genre": "string"
  },
  "format": "pdf | docx | rtf"
}
```

**Response:**
```json
{
  "downloadUrl": "string",
  "wordCount": "number",
  "pageCount": "number"
}
```

**Priority:** P2 - Export feature (already in original requirements)

---

### 2.5 Visualization Endpoint

#### `POST /api/storytelling/visualize/scene`
**Purpose:** Generate visual representation of a scene

**Request:**
```json
{
  "scene": "string",
  "characters": [
    {
      "name": "string",
      "description": "string"
    }
  ],
  "location": "string",
  "style": "cinematic | illustrated | concept_art | storyboard",
  "aspectRatio": "16:9 | 1:1 | 9:16"
}
```

**Response:**
```json
{
  "imageUrl": "string",
  "prompt": "string (generated prompt)",
  "model": "string"
}
```

**Priority:** P3 - Scene visualizer in workspace

---

## 3. Interior Design Studio - API Status

### 3.1 Current Status: **Production Ready**

All required endpoints are implemented and working in swagger v17:

| Endpoint | Status | Notes |
|----------|--------|-------|
| `POST /api/interior/room-redesign` | Working | Primary flow |
| `POST /api/interior/virtual-staging` | Working | Staging flow |
| `POST /api/interior/floor-plan` | Working | Floor plan flow |
| `POST /api/interior/furniture/suggest` | Working | Suggestions panel |
| `POST /api/interior/materials/palette` | Working | Materials panel |
| `POST /api/interior/3d/visualize` | Working | 3D preview |
| `GET /api/interior/health` | Working | Health check |

### 3.2 No New API Requirements

Interior Design Studio can be fully implemented with existing endpoints.

---

## 4. Priority Summary

### High Priority (P1) - Required for MVP

| Endpoint | Studio Feature |
|----------|---------------|
| Service URL corrections | All flows |
| `/api/storytelling/character/voice` | Character creation flow |

### Medium Priority (P2) - Required for Workspace

| Endpoint | Studio Feature |
|----------|---------------|
| `/api/storytelling/character/relationship` | Character panel |
| `/api/storytelling/world/lore` | World lore panel |
| `/api/storytelling/world/timeline` | Timeline mode |
| `/api/storytelling/format/screenplay` | Export |
| `/api/storytelling/format/manuscript` | Export |

### Lower Priority (P3) - Advanced Features

| Endpoint | Studio Feature |
|----------|---------------|
| `/api/storytelling/branch/choice` | Branching flow |
| `/api/storytelling/branch/consequence` | Branching flow |
| `/api/storytelling/branch/merge` | Branching flow |
| `/api/storytelling/visualize/scene` | Scene visualizer |

---

## 5. Request Summary for Backend Team

### Immediate Actions Required

1. **Verify existing endpoints** - Confirm these swagger-defined endpoints are actually implemented:
   - `/api/storytelling/structure`
   - `/api/storytelling/generate-scene`
   - `/api/storytelling/generate-twist`
   - `/api/storytelling/enhance`
   - `/api/character-library/generate`

2. **Report status** - For each endpoint, confirm:
   - Returns expected response schema
   - Handles error cases properly
   - Is accessible (no 404)

### New Endpoint Implementation

Priority order for new endpoints:
1. Character voice profile (P1)
2. Export endpoints - manuscript, screenplay (P2)
3. World building endpoints (P2)
4. Branching narrative endpoints (P3)
5. Scene visualization (P3)

---

## Appendix: Enum Mappings Reference

The frontend has comprehensive enum mappings in `src/services/apiEnumMapper.ts`:

**Story Genres:** Fantasy, SciFi, Mystery, Romance, Horror, Thriller, Drama, Comedy, Action, Historical, Literary, YoungAdult, ChildrensStory
**Tones:** Light, Dark, Humorous, Serious, Suspenseful, Romantic, Mysterious, Epic, Intimate, Satirical
**POV:** FirstPerson, ThirdPersonLimited, ThirdPersonOmniscient, SecondPerson, MultipleFirstPerson
**Lengths:** FlashFiction, ShortStory, Novella, Novel, Epic
**Frameworks:** ThreeAct, HerosJourney, SevenPointStructure, SaveTheCat, Freytags, Kishōtenketsu, Fichtean, InMediasRes, Nonlinear, Circular
