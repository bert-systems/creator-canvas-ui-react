# Story Library & Publishing Strategy

## Version: 1.0.0
## Last Updated: December 2025

---

## Executive Summary

This document outlines the strategy for implementing a comprehensive **Story Library** system for the Storyteller Studio. The system provides:

1. **Story Persistence** - Save and sync stories across devices
2. **Story Library** - Browsable library of all story artifacts (stories, characters, scenes, treatments)
3. **Publishing System** - Share stories publicly or with collaborators
4. **Full Story Generation** - Generate complete stories with AI-generated images for each act/chapter
5. **Enhanced UX** - Scrollable output views and improved content display

---

## Table of Contents

1. [Current State Analysis](#current-state-analysis)
2. [Story Persistence System](#story-persistence-system)
3. [Story Library Page](#story-library-page)
4. [Story Artifact Types](#story-artifact-types)
5. [Publishing System](#publishing-system)
6. [Full Story Generation with Images](#full-story-generation-with-images)
7. [UX Enhancements](#ux-enhancements)
8. [API Requirements](#api-requirements)
9. [Implementation Phases](#implementation-phases)
10. [Data Models](#data-models)

---

## 1. Current State Analysis

### Existing Services

| Service | Purpose | Status |
|---------|---------|--------|
| `storyLibraryService.ts` | Basic CRUD for stories | Implemented but not connected |
| `storyGenerationService.ts` | AI story generation | Fully implemented |
| `StorytellerStudio.tsx` | Main studio component | Uses local state only |

### Key Gaps

1. **No Persistence Integration** - StorytellerStudio uses local `useState` instead of backend service
2. **No Story Library Page** - No dedicated browsing interface for saved stories
3. **No Publishing Workflow** - No public sharing or collaboration features
4. **Limited Output Display** - Story output not scrollable, no image generation
5. **No Full Story Export** - Can't generate complete illustrated stories

---

## 2. Story Persistence System

### 2.1 Integration Strategy

Connect StorytellerStudio to `storyLibraryService` for persistent storage:

```typescript
// StorytellerStudio integration pattern
const { stories, loading, createStory, updateStory, deleteStory } = useStoryStore();

// Auto-save on story changes
useEffect(() => {
  if (currentStory && hasUnsavedChanges) {
    const debounced = debounce(() => updateStory(currentStory.id, currentStory), 2000);
    debounced();
  }
}, [currentStory, hasUnsavedChanges]);
```

### 2.2 Story Store (Zustand)

Create `src/stores/storyStore.ts`:

```typescript
interface StoryStore {
  // State
  stories: StoryResponse[];
  currentStory: StoryResponse | null;
  characters: CharacterProfile[];
  scenes: SceneData[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchStories: (params?: ListStoriesParams) => Promise<void>;
  fetchStory: (id: string) => Promise<void>;
  createStory: (request: CreateStoryRequest) => Promise<StoryResponse>;
  updateStory: (id: string, request: UpdateStoryRequest) => Promise<void>;
  deleteStory: (id: string) => Promise<void>;
  publishStory: (id: string, visibility: 'public' | 'private') => Promise<void>;
  shareStory: (id: string, userIds: string[]) => Promise<void>;

  // Character management
  addCharacter: (storyId: string, character: CharacterProfile) => Promise<void>;
  updateCharacter: (storyId: string, characterId: string, updates: Partial<CharacterProfile>) => Promise<void>;
  deleteCharacter: (storyId: string, characterId: string) => Promise<void>;

  // Scene management
  addScene: (storyId: string, scene: SceneData) => Promise<void>;
  updateScene: (storyId: string, sceneId: string, updates: Partial<SceneData>) => Promise<void>;
  reorderScenes: (storyId: string, sceneIds: string[]) => Promise<void>;
}
```

### 2.3 Auto-Save Features

- **Debounced saves** - Save 2 seconds after last change
- **Version history** - Track story versions for undo/redo
- **Conflict resolution** - Handle concurrent edits
- **Offline support** - Queue changes when offline

---

## 3. Story Library Page

### 3.1 Overview

Create `src/components/story-library/StoryLibraryPage.tsx` - a dedicated page for browsing all story artifacts, similar to `AssetLibraryPage`.

### 3.2 Tab Structure

| Tab | Content | Description |
|-----|---------|-------------|
| **All Stories** | Story cards | All user stories with metadata |
| **Characters** | Character cards | All created characters across stories |
| **Treatments** | Treatment documents | Pitches, synopses, loglines |
| **Scenes** | Scene cards | Written scenes from all stories |
| **Collections** | Story collections | Grouped stories (e.g., "Fantasy Series") |

### 3.3 Story Card Design

```
┌─────────────────────────────────────┐
│ ┌───────────┐                       │
│ │  Cover    │  [Story Title]        │
│ │  Image    │  Genre • Word Count   │
│ │           │  ────────────────     │
│ └───────────┘  [Premise excerpt...] │
│                                     │
│  Characters: 5  Scenes: 12          │
│  Last edited: 2 hours ago           │
│                                     │
│  [Draft] [Continue Writing] [Share] │
└─────────────────────────────────────┘
```

### 3.4 Features

- **Search** - Full-text search across title, premise, characters
- **Filters** - By status (Draft/Complete), genre, date
- **Sort** - Newest, oldest, recently edited, word count
- **Bulk actions** - Delete, archive, export multiple
- **Collection management** - Create story collections

---

## 4. Story Artifact Types

### 4.1 Primary Artifacts

| Artifact | Description | Persistence |
|----------|-------------|-------------|
| **Story** | Complete story concept with premise, themes, genre | Full CRUD |
| **Character** | Character profile with backstory, voice, arc | Linked to story |
| **Scene** | Written scene content | Linked to story + chapter |
| **Outline** | Story structure with beats | Linked to story |
| **Treatment** | Pitch document with synopsis | Linked to story |

### 4.2 Supporting Artifacts

| Artifact | Description | Persistence |
|----------|-------------|-------------|
| **Location** | World-building location data | Linked to story |
| **Lore** | World lore, history, rules | Linked to story |
| **Timeline** | Event chronology | Linked to story |
| **Relationship** | Character relationship dynamics | Linked to characters |

### 4.3 Media Artifacts

| Artifact | Description | Storage |
|----------|-------------|---------|
| **Cover Image** | AI-generated story cover | Asset library |
| **Character Portrait** | AI-generated character image | Asset library |
| **Scene Illustration** | AI-generated scene image | Asset library |
| **Chapter Art** | Illustrated chapter headers | Asset library |

---

## 5. Publishing System

### 5.1 Visibility Levels

| Level | Description | Access |
|-------|-------------|--------|
| **Private** | Only visible to creator | Default |
| **Shared** | Visible to specific users | Invite-based |
| **Public** | Visible in community gallery | Open access |

### 5.2 Publishing Workflow

```
┌─────────┐    ┌─────────────┐    ┌──────────┐    ┌─────────┐
│  Draft  │ -> │  In Review  │ -> │ Published│ -> │ Featured│
└─────────┘    └─────────────┘    └──────────┘    └─────────┘
     │               │                  │              │
     │               │                  │              │
   Local          Optional           Public        Curated
   Only           Preview           Gallery       Showcase
```

### 5.3 Story Showcase (Community Gallery)

Create `src/components/story-library/StoryShowcasePage.tsx` - similar to `InspirationGalleryPage`:

- **Featured Stories** - Curated by editors
- **Trending** - Most viewed/liked recently
- **New This Week** - Recent publications
- **By Genre** - Categorized browsing
- **Search & Discovery** - Find stories by keywords

### 5.4 Collaboration Features

- **Invite collaborators** - Read/Edit/Admin permissions
- **Comments** - Inline feedback on scenes
- **Suggestions** - Track changes for review
- **Activity feed** - See collaborator edits

---

## 6. Full Story Generation with Images

### 6.1 Enhanced Story Generation Flow

Add capability to generate complete illustrated stories:

```
Story Genesis → Structure → Chapters → Scenes → Images → Export
```

### 6.2 Chapter/Act Image Generation

For each act or chapter, generate:
1. **Chapter Header Image** - Represents chapter mood/theme
2. **Key Scene Illustrations** - Major moments visualized
3. **Character Appearances** - When characters first appear

### 6.3 Generation Parameters

```typescript
interface FullStoryGenerationRequest {
  storyId: string;
  generateChapterImages: boolean;
  imagesPerChapter: number;  // 1-3
  imageStyle: 'cinematic' | 'illustrated' | 'concept-art' | 'anime';
  generateCoverArt: boolean;
  includeCharacterPortraits: boolean;
}

interface FullStoryGenerationResponse {
  story: StoryData;
  chapters: Array<{
    chapterNumber: number;
    title: string;
    content: string;
    headerImageUrl: string;
    sceneImages: Array<{
      sceneId: string;
      imageUrl: string;
      caption: string;
    }>;
  }>;
  coverArtUrl: string;
  characterPortraits: Record<string, string>;
}
```

### 6.4 UI Integration

Add "Generate Full Story" action to Story Genesis flow:

```
[Generate Story Concept] → [Apply Structure] → [Generate Full Story ▼]
                                                  ├─ Quick (Text Only)
                                                  ├─ Standard (With Chapter Images)
                                                  └─ Illustrated (Full Images)
```

---

## 7. UX Enhancements

### 7.1 Scrollable Output

The current story output is not scrollable. Fix by adding proper overflow handling:

```typescript
// In CreateStoryFlow.tsx and CreateCharacterFlow.tsx
<Box
  sx={{
    flex: 1,
    overflowY: 'auto',  // Enable vertical scrolling
    overflowX: 'hidden',
    maxHeight: 'calc(100vh - 200px)',  // Leave room for header/footer
    p: 3,
    '&::-webkit-scrollbar': {
      width: 8,
    },
    '&::-webkit-scrollbar-thumb': {
      background: studioColors.surface3,
      borderRadius: 4,
    },
  }}
>
  {/* Story output content */}
</Box>
```

### 7.2 Output Display Improvements

- **Collapsible sections** - Expand/collapse story sections
- **Table of contents** - Quick navigation to sections
- **Reading mode** - Distraction-free viewing
- **Print/Export preview** - See how it will look exported

### 7.3 Progress Indicators

- **Generation progress** - Show what's being generated
- **Word count tracker** - Current vs target
- **Completion percentage** - Story completeness

---

## 8. API Requirements

### 8.1 Story Library Endpoints

#### Stories

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stories` | List user stories (paginated) |
| GET | `/api/stories/{id}` | Get story details |
| POST | `/api/stories` | Create new story |
| PUT | `/api/stories/{id}` | Update story |
| DELETE | `/api/stories/{id}` | Delete story |
| POST | `/api/stories/{id}/publish` | Publish story |
| POST | `/api/stories/{id}/share` | Share with users |

#### Characters

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stories/{storyId}/characters` | List story characters |
| GET | `/api/stories/{storyId}/characters/{id}` | Get character details |
| POST | `/api/stories/{storyId}/characters` | Create character |
| PUT | `/api/stories/{storyId}/characters/{id}` | Update character |
| DELETE | `/api/stories/{storyId}/characters/{id}` | Delete character |

#### Scenes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stories/{storyId}/scenes` | List story scenes |
| GET | `/api/stories/{storyId}/scenes/{id}` | Get scene details |
| POST | `/api/stories/{storyId}/scenes` | Create scene |
| PUT | `/api/stories/{storyId}/scenes/{id}` | Update scene |
| DELETE | `/api/stories/{storyId}/scenes/{id}` | Delete scene |
| POST | `/api/stories/{storyId}/scenes/reorder` | Reorder scenes |

#### Publishing

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stories/public` | List public stories |
| GET | `/api/stories/featured` | List featured stories |
| GET | `/api/stories/trending` | List trending stories |
| POST | `/api/stories/{id}/like` | Like a story |
| DELETE | `/api/stories/{id}/like` | Unlike a story |

### 8.2 Full Story Generation Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/storytelling/generate-full` | Generate complete story |
| POST | `/api/storytelling/generate-chapter-images` | Generate images for chapter |
| GET | `/api/storytelling/generate-full/{jobId}` | Get generation status |

### 8.3 Request/Response Examples

#### Create Story
```json
POST /api/stories
{
  "title": "The Last Guardian",
  "description": "A fantasy epic about...",
  "storyData": {
    "premise": "In a world where magic is dying...",
    "themes": ["sacrifice", "redemption"],
    "genre": "Fantasy",
    "tone": "Dark"
  },
  "genre": "Fantasy",
  "status": "Draft",
  "tags": ["fantasy", "epic", "magic"]
}
```

#### Publish Story
```json
POST /api/stories/{id}/publish
{
  "visibility": "public",
  "categories": ["fantasy", "adventure"],
  "mature": false,
  "allowComments": true
}
```

#### Generate Full Story
```json
POST /api/storytelling/generate-full
{
  "storyId": "story-123",
  "generateChapterImages": true,
  "imagesPerChapter": 2,
  "imageStyle": "cinematic",
  "generateCoverArt": true,
  "includeCharacterPortraits": true,
  "model": "gemini-2.5-flash"
}
```

---

## 9. Implementation Phases

### Phase 1: Persistence Integration (1-2 weeks)
- [ ] Create storyStore.ts with Zustand
- [ ] Connect StorytellerStudio to storyLibraryService
- [ ] Implement auto-save functionality
- [ ] Add loading/error states

### Phase 2: Story Library Page (1-2 weeks)
- [ ] Create StoryLibraryPage component
- [ ] Implement story card components
- [ ] Add search, filter, sort functionality
- [ ] Implement bulk actions

### Phase 3: UX Enhancements (1 week)
- [ ] Add scrollable output to CreateStoryFlow
- [ ] Add scrollable output to CreateCharacterFlow
- [ ] Implement collapsible sections
- [ ] Add progress indicators

### Phase 4: Publishing System (2 weeks)
- [ ] Add publish/unpublish functionality
- [ ] Create StoryShowcasePage (public gallery)
- [ ] Implement like/favorite system
- [ ] Add sharing and collaboration

### Phase 5: Full Story Generation (2 weeks)
- [ ] Implement generate-full API integration
- [ ] Add chapter image generation
- [ ] Create illustrated story export
- [ ] Add generation progress UI

---

## 10. Data Models

### 10.1 Story Entity

```typescript
interface Story {
  id: string;
  userId: string;
  title: string;
  description?: string;
  coverImageUrl?: string;

  // Story content
  storyData: StoryData;
  characters: CharacterProfile[];
  outline?: OutlineData;
  scenes: SceneData[];
  locations: LocationData[];

  // Metadata
  genre?: StoryGenre;
  tone?: StoryTone;
  targetLength?: string;
  targetAudience?: string;

  // Status & publishing
  status: 'Draft' | 'InProgress' | 'Complete' | 'Archived';
  visibility: 'private' | 'shared' | 'public';
  publishedAt?: string;

  // Engagement
  viewsCount: number;
  likesCount: number;
  commentsCount: number;

  // Tracking
  wordCount: number;
  version: number;
  createdAt: string;
  updatedAt: string;
  lastEditedAt?: string;

  // Collaboration
  sharedWith?: StoryShare[];

  // Tags & discovery
  tags: string[];
  categories?: string[];
  isFeatured: boolean;
}

interface StoryShare {
  userId: string;
  permission: 'read' | 'edit' | 'admin';
  sharedAt: string;
}
```

### 10.2 Scene Entity (Enhanced)

```typescript
interface SceneData {
  id: string;
  storyId: string;
  chapterId?: string;

  // Content
  title: string;
  slugline?: string;
  description: string;
  content: string;

  // Context
  characters: string[];
  location?: string;
  timeOfDay?: string;
  mood?: string;

  // Structure
  beats: string[];
  position: number;

  // Media
  headerImageUrl?: string;
  illustrations?: SceneIllustration[];

  // Stats
  wordCount: number;
  createdAt: string;
  updatedAt: string;
}

interface SceneIllustration {
  id: string;
  imageUrl: string;
  prompt: string;
  caption?: string;
  position: number;
}
```

---

## Summary

This strategy provides a comprehensive roadmap for transforming the Storyteller Studio into a full-featured story creation and publishing platform. Key deliverables:

1. **Story persistence** with auto-save and sync
2. **Story Library** for browsing and managing stories
3. **Publishing system** for sharing publicly or with collaborators
4. **Full story generation** with illustrated chapters
5. **UX improvements** including scrollable output

The implementation is divided into 5 phases over approximately 8-10 weeks, with API requirements defined for backend team coordination.

---

## Appendix: Missing API Endpoints Tracker

| Endpoint | Purpose | Priority | Status |
|----------|---------|----------|--------|
| `GET /api/stories/public` | List public stories | High | Pending |
| `GET /api/stories/featured` | List featured stories | High | Pending |
| `GET /api/stories/trending` | List trending stories | Medium | Pending |
| `POST /api/stories/{id}/publish` | Publish story | High | Pending |
| `POST /api/stories/{id}/like` | Like story | Medium | Pending |
| `POST /api/storytelling/generate-full` | Full story generation | High | Pending |
| `POST /api/storytelling/generate-chapter-images` | Chapter images | High | Pending |
| `GET /api/stories/{storyId}/scenes` | List scenes | High | Pending |
| `POST /api/stories/{storyId}/scenes/reorder` | Reorder scenes | Medium | Pending |
