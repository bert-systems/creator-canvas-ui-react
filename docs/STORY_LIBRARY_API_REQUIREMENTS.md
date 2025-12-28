# Story Library API Requirements

## Version: 1.0.0
## Last Updated: December 2025
## Status: Request for Implementation

---

## Overview

This document outlines the API endpoints required for the Story Library and Publishing system in the Storyteller Studio. These endpoints enable story persistence, artifact management, publishing, and community features.

**Related Strategy Document:** `STORY_LIBRARY_PUBLISHING_STRATEGY.md`

---

## Table of Contents

1. [Base Configuration](#base-configuration)
2. [Story CRUD Endpoints](#story-crud-endpoints)
3. [Character Management Endpoints](#character-management-endpoints)
4. [Scene Management Endpoints](#scene-management-endpoints)
5. [Publishing Endpoints](#publishing-endpoints)
6. [Discovery Endpoints](#discovery-endpoints)
7. [Full Story Generation Endpoints](#full-story-generation-endpoints)
8. [Data Models](#data-models)
9. [Error Responses](#error-responses)

---

## 1. Base Configuration

### API Base URL
```
Production: https://api.smartai.com/api
Development: https://localhost:7003/api
```

### Authentication
All endpoints require Bearer token authentication:
```http
Authorization: Bearer <jwt_token>
```

### Common Headers
```http
Content-Type: application/json
Accept: application/json
```

---

## 2. Story CRUD Endpoints

### 2.1 List Stories

```http
GET /api/stories
```

List stories belonging to the authenticated user.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | int | 1 | Page number |
| pageSize | int | 20 | Items per page (max 100) |
| status | string | - | Filter by status: Draft, InProgress, Complete, Archived |
| genre | string | - | Filter by genre |
| sortBy | string | updatedAt | Sort field: updatedAt, createdAt, title, wordCount |
| sortDir | string | desc | Sort direction: asc, desc |
| search | string | - | Search in title and description |

**Response:**
```json
{
  "items": [
    {
      "id": "story-123",
      "title": "The Last Guardian",
      "description": "A fantasy epic...",
      "coverImageUrl": "https://cdn.example.com/covers/story-123.jpg",
      "genre": "fantasy",
      "tone": "dark",
      "status": "Draft",
      "visibility": "private",
      "wordCount": 0,
      "characterCount": 5,
      "sceneCount": 12,
      "version": 3,
      "createdAt": "2025-12-27T10:00:00Z",
      "updatedAt": "2025-12-27T15:30:00Z"
    }
  ],
  "page": 1,
  "pageSize": 20,
  "totalItems": 45,
  "totalPages": 3
}
```

---

### 2.2 Get Story

```http
GET /api/stories/{id}
```

Retrieve a story with full details.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Story ID |

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| includeCharacters | bool | false | Include character data |
| includeScenes | bool | false | Include scene data |
| includeOutline | bool | false | Include outline data |

**Response:**
```json
{
  "id": "story-123",
  "userId": "user-456",
  "title": "The Last Guardian",
  "description": "A fantasy epic about the final protector of a dying world.",
  "coverImageUrl": "https://cdn.example.com/covers/story-123.jpg",
  "storyData": {
    "premise": "In a world where magic is fading...",
    "themes": ["sacrifice", "redemption", "hope"],
    "genre": "fantasy",
    "tone": "dark",
    "setting": {
      "world": "Aethoria, a realm of ancient magic",
      "timePeriod": "Medieval fantasy",
      "primaryLocation": "The Citadel of Dawn",
      "keyLocations": ["The Sunken Forest", "The Crystal Caves"]
    },
    "centralConflict": "The protagonist must choose between saving their loved ones or the world.",
    "stakes": "The extinction of all magic and the death of millions.",
    "hook": "When the last dragon falls, who will stand against the darkness?"
  },
  "characters": [
    {
      "id": "char-001",
      "name": "Elara Nightwhisper",
      "role": "protagonist",
      "archetype": "hero",
      "briefDescription": "A reluctant guardian...",
      "age": 28,
      "gender": "female"
    }
  ],
  "outline": {
    "framework": "three-act",
    "acts": [
      {
        "actNumber": 1,
        "title": "The Call",
        "summary": "Elara discovers her powers...",
        "chapters": [
          { "chapterId": "ch-001", "title": "The Awakening" }
        ]
      }
    ]
  },
  "scenes": [],
  "genre": "fantasy",
  "tone": "dark",
  "targetLength": "novel",
  "targetAudience": "adult",
  "status": "Draft",
  "visibility": "private",
  "wordCount": 0,
  "version": 3,
  "tags": ["fantasy", "epic", "magic"],
  "createdAt": "2025-12-27T10:00:00Z",
  "updatedAt": "2025-12-27T15:30:00Z"
}
```

---

### 2.3 Create Story

```http
POST /api/stories
```

Create a new story.

**Request Body:**
```json
{
  "title": "The Last Guardian",
  "description": "A fantasy epic about the final protector of a dying world.",
  "storyData": {
    "premise": "In a world where magic is fading...",
    "themes": ["sacrifice", "redemption"],
    "genre": "fantasy",
    "tone": "dark",
    "setting": {
      "world": "Aethoria",
      "timePeriod": "Medieval fantasy",
      "primaryLocation": "The Citadel of Dawn"
    },
    "centralConflict": "Save loved ones or the world",
    "stakes": "Extinction of magic",
    "hook": "When the last dragon falls..."
  },
  "genre": "fantasy",
  "tone": "dark",
  "targetLength": "novel",
  "targetAudience": "adult",
  "status": "Draft",
  "tags": ["fantasy", "epic"]
}
```

**Response:** `201 Created`
```json
{
  "id": "story-123",
  "title": "The Last Guardian",
  "createdAt": "2025-12-27T10:00:00Z",
  "...": "..."
}
```

---

### 2.4 Update Story

```http
PUT /api/stories/{id}
```

Update an existing story.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Story ID |

**Request Body:** Same as Create Story (partial update supported)

**Response:** `200 OK` with updated story

---

### 2.5 Delete Story

```http
DELETE /api/stories/{id}
```

Delete a story and all associated artifacts (characters, scenes, etc.).

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Story ID |

**Response:** `204 No Content`

---

## 3. Character Management Endpoints

### 3.1 List Story Characters

```http
GET /api/stories/{storyId}/characters
```

**Response:**
```json
{
  "items": [
    {
      "id": "char-001",
      "storyId": "story-123",
      "name": "Elara Nightwhisper",
      "role": "protagonist",
      "archetype": "hero",
      "briefDescription": "A reluctant guardian who must embrace her destiny.",
      "portraitUrl": "https://cdn.example.com/portraits/char-001.jpg",
      "age": 28,
      "gender": "female",
      "createdAt": "2025-12-27T10:00:00Z"
    }
  ],
  "totalCount": 5
}
```

---

### 3.2 Get Character

```http
GET /api/stories/{storyId}/characters/{characterId}
```

**Response:**
```json
{
  "id": "char-001",
  "storyId": "story-123",
  "name": "Elara Nightwhisper",
  "role": "protagonist",
  "archetype": "hero",
  "briefDescription": "A reluctant guardian...",
  "fullProfile": {
    "age": 28,
    "gender": "female",
    "physicalDescription": "Tall with silver hair...",
    "personality": {
      "traits": ["brave", "compassionate", "stubborn"],
      "fears": ["losing control", "abandonment"],
      "desires": ["to protect her family", "to understand her powers"]
    },
    "backstory": "Born during the last great eclipse...",
    "motivation": "To prevent the prophecy from coming true.",
    "arc": "From reluctant hero to accepting her role as guardian.",
    "relationships": [
      { "characterId": "char-002", "type": "mentor", "description": "Her trainer and guide" }
    ],
    "voice": {
      "speechPatterns": ["formal when nervous", "sarcastic with friends"],
      "catchphrases": ["By the ancient stars..."],
      "vocabulary": "Educated, occasional archaic terms"
    }
  },
  "portraitUrl": "https://cdn.example.com/portraits/char-001.jpg",
  "createdAt": "2025-12-27T10:00:00Z",
  "updatedAt": "2025-12-27T12:00:00Z"
}
```

---

### 3.3 Create Character

```http
POST /api/stories/{storyId}/characters
```

**Request Body:**
```json
{
  "name": "Elara Nightwhisper",
  "role": "protagonist",
  "archetype": "hero",
  "briefDescription": "A reluctant guardian...",
  "fullProfile": {
    "age": 28,
    "gender": "female",
    "personality": {
      "traits": ["brave", "compassionate"]
    },
    "backstory": "Born during the last great eclipse..."
  }
}
```

**Response:** `201 Created`

---

### 3.4 Update Character

```http
PUT /api/stories/{storyId}/characters/{characterId}
```

**Request Body:** Partial update of character fields

**Response:** `200 OK`

---

### 3.5 Delete Character

```http
DELETE /api/stories/{storyId}/characters/{characterId}
```

**Response:** `204 No Content`

---

## 4. Scene Management Endpoints

### 4.1 List Story Scenes

```http
GET /api/stories/{storyId}/scenes
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| chapterId | string | Filter by chapter |

**Response:**
```json
{
  "items": [
    {
      "id": "scene-001",
      "storyId": "story-123",
      "chapterId": "ch-001",
      "title": "The Awakening",
      "slugline": "INT. ELARA'S CHAMBER - DAWN",
      "description": "Elara wakes to find her powers have manifested.",
      "position": 1,
      "wordCount": 1250,
      "characters": ["char-001", "char-002"],
      "createdAt": "2025-12-27T10:00:00Z"
    }
  ],
  "totalCount": 12
}
```

---

### 4.2 Get Scene

```http
GET /api/stories/{storyId}/scenes/{sceneId}
```

**Response:**
```json
{
  "id": "scene-001",
  "storyId": "story-123",
  "chapterId": "ch-001",
  "title": "The Awakening",
  "slugline": "INT. ELARA'S CHAMBER - DAWN",
  "description": "Elara wakes to find her powers have manifested.",
  "content": "The first rays of sunlight filtered through...",
  "beats": [
    "Elara awakens confused",
    "Discovers glowing hands",
    "Mentor Kael arrives"
  ],
  "characters": ["char-001", "char-002"],
  "location": "Elara's private chambers in the Citadel",
  "timeOfDay": "dawn",
  "mood": "mysterious, awe",
  "position": 1,
  "wordCount": 1250,
  "headerImageUrl": "https://cdn.example.com/scenes/scene-001.jpg",
  "illustrations": [
    {
      "id": "illust-001",
      "imageUrl": "https://cdn.example.com/illustrations/illust-001.jpg",
      "prompt": "A young woman with glowing hands in a stone chamber at dawn",
      "caption": "Elara discovers her powers",
      "position": 1
    }
  ],
  "createdAt": "2025-12-27T10:00:00Z",
  "updatedAt": "2025-12-27T14:00:00Z"
}
```

---

### 4.3 Create Scene

```http
POST /api/stories/{storyId}/scenes
```

**Request Body:**
```json
{
  "chapterId": "ch-001",
  "title": "The Awakening",
  "slugline": "INT. ELARA'S CHAMBER - DAWN",
  "description": "Elara wakes to find her powers have manifested.",
  "content": "The first rays of sunlight filtered through...",
  "beats": ["Elara awakens confused", "Discovers glowing hands"],
  "characters": ["char-001", "char-002"],
  "location": "Elara's chambers",
  "timeOfDay": "dawn",
  "mood": "mysterious",
  "position": 1
}
```

**Response:** `201 Created`

---

### 4.4 Update Scene

```http
PUT /api/stories/{storyId}/scenes/{sceneId}
```

---

### 4.5 Delete Scene

```http
DELETE /api/stories/{storyId}/scenes/{sceneId}
```

---

### 4.6 Reorder Scenes

```http
POST /api/stories/{storyId}/scenes/reorder
```

**Request Body:**
```json
{
  "chapterId": "ch-001",
  "sceneIds": ["scene-003", "scene-001", "scene-002"]
}
```

**Response:** `200 OK`

---

## 5. Publishing Endpoints

### 5.1 Publish Story

```http
POST /api/stories/{id}/publish
```

**Request Body:**
```json
{
  "visibility": "public",
  "categories": ["fantasy", "adventure"],
  "mature": false,
  "allowComments": true,
  "allowLikes": true
}
```

**Response:**
```json
{
  "id": "story-123",
  "visibility": "public",
  "publishedAt": "2025-12-27T16:00:00Z",
  "publicUrl": "https://stories.smartai.com/story-123"
}
```

---

### 5.2 Unpublish Story

```http
POST /api/stories/{id}/unpublish
```

**Response:** `200 OK`

---

### 5.3 Share Story

```http
POST /api/stories/{id}/share
```

Share story with specific users.

**Request Body:**
```json
{
  "userIds": ["user-789", "user-012"],
  "permission": "read",
  "message": "Check out my new story!"
}
```

**Permission levels:** `read`, `edit`, `admin`

**Response:**
```json
{
  "shares": [
    { "userId": "user-789", "permission": "read", "sharedAt": "2025-12-27T16:00:00Z" }
  ]
}
```

---

### 5.4 Like Story

```http
POST /api/stories/{id}/like
```

**Response:** `200 OK`
```json
{
  "likesCount": 42
}
```

---

### 5.5 Unlike Story

```http
DELETE /api/stories/{id}/like
```

**Response:** `200 OK`

---

## 6. Discovery Endpoints

### 6.1 List Public Stories

```http
GET /api/stories/public
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | int | 1 | Page number |
| pageSize | int | 24 | Items per page |
| category | string | - | Filter by category |
| genre | string | - | Filter by genre |
| sortBy | string | trending | Sort: trending, newest, popular, featured |
| search | string | - | Full-text search |

**Response:**
```json
{
  "items": [
    {
      "id": "story-123",
      "title": "The Last Guardian",
      "description": "A fantasy epic...",
      "coverImageUrl": "https://cdn.example.com/covers/story-123.jpg",
      "genre": "fantasy",
      "author": {
        "id": "user-456",
        "displayName": "J. R. Author",
        "avatarUrl": "https://cdn.example.com/avatars/user-456.jpg"
      },
      "wordCount": 85000,
      "chapterCount": 20,
      "viewsCount": 1250,
      "likesCount": 89,
      "commentsCount": 12,
      "isFeatured": false,
      "publishedAt": "2025-12-20T10:00:00Z"
    }
  ],
  "page": 1,
  "pageSize": 24,
  "totalItems": 150
}
```

---

### 6.2 Get Featured Stories

```http
GET /api/stories/featured
```

**Response:** Same format as public stories list

---

### 6.3 Get Trending Stories

```http
GET /api/stories/trending
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| period | string | week | Time period: day, week, month, all |
| limit | int | 10 | Number of stories |

---

## 7. Full Story Generation Endpoints

### 7.1 Generate Full Story

```http
POST /api/storytelling/generate-full
```

Generate a complete story with optional chapter images.

**Request Body:**
```json
{
  "storyId": "story-123",
  "options": {
    "generateChapterImages": true,
    "imagesPerChapter": 2,
    "imageStyle": "cinematic",
    "generateCoverArt": true,
    "includeCharacterPortraits": true,
    "model": "gemini-2.5-flash"
  }
}
```

**Image style options:** `cinematic`, `illustrated`, `concept-art`, `anime`, `realistic`

**Response:**
```json
{
  "jobId": "job-789",
  "status": "pending",
  "estimatedDuration": 180,
  "createdAt": "2025-12-27T16:00:00Z"
}
```

---

### 7.2 Get Generation Status

```http
GET /api/storytelling/generate-full/{jobId}
```

**Response (in progress):**
```json
{
  "jobId": "job-789",
  "status": "processing",
  "progress": {
    "phase": "generating_chapter_images",
    "currentChapter": 3,
    "totalChapters": 10,
    "percentage": 35
  },
  "startedAt": "2025-12-27T16:00:00Z"
}
```

**Response (completed):**
```json
{
  "jobId": "job-789",
  "status": "completed",
  "result": {
    "storyId": "story-123",
    "coverArtUrl": "https://cdn.example.com/covers/story-123-generated.jpg",
    "chapters": [
      {
        "chapterNumber": 1,
        "title": "The Awakening",
        "content": "The first rays of sunlight...",
        "wordCount": 4500,
        "headerImageUrl": "https://cdn.example.com/chapters/ch-001-header.jpg",
        "sceneImages": [
          {
            "sceneId": "scene-001",
            "imageUrl": "https://cdn.example.com/scenes/scene-001.jpg",
            "prompt": "A young woman with glowing hands...",
            "caption": "Elara discovers her powers"
          }
        ]
      }
    ],
    "characterPortraits": {
      "char-001": "https://cdn.example.com/portraits/char-001.jpg",
      "char-002": "https://cdn.example.com/portraits/char-002.jpg"
    },
    "totalWordCount": 45000,
    "totalImages": 22
  },
  "completedAt": "2025-12-27T16:15:00Z"
}
```

---

### 7.3 Generate Chapter Images

```http
POST /api/storytelling/generate-chapter-images
```

Generate images for a specific chapter.

**Request Body:**
```json
{
  "storyId": "story-123",
  "chapterId": "ch-001",
  "imageCount": 2,
  "style": "cinematic",
  "scenes": ["scene-001", "scene-002"]
}
```

**Response:**
```json
{
  "jobId": "job-790",
  "status": "pending"
}
```

---

## 8. Data Models

### Story Status Enum
```
Draft      - Initial creation, not complete
InProgress - Actively being written
Complete   - Finished but not published
Archived   - Hidden from main view
```

### Visibility Enum
```
private    - Only visible to owner
shared     - Visible to specific users
public     - Visible to everyone
```

### Character Role Enum
```
protagonist, antagonist, deuteragonist, mentor, sidekick,
love-interest, foil, comic-relief, supporting
```

### Character Archetype Enum
```
hero, mentor, rebel, lover, creator, ruler, caregiver, sage,
innocent, explorer, everyman, jester, magician, outlaw, shadow, trickster
```

### Story Genre Enum
```
fantasy, scifi, thriller, mystery, romance, horror, drama,
comedy, adventure, literary, historical, contemporary
```

### Story Tone Enum
```
dark, lighthearted, serious, whimsical, gritty, hopeful,
melancholic, suspenseful
```

---

## 9. Error Responses

### Standard Error Format
```json
{
  "error": {
    "code": "STORY_NOT_FOUND",
    "message": "The requested story does not exist.",
    "details": {
      "storyId": "story-123"
    }
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| UNAUTHORIZED | 401 | Missing or invalid authentication |
| FORBIDDEN | 403 | User doesn't have access to resource |
| STORY_NOT_FOUND | 404 | Story ID doesn't exist |
| CHARACTER_NOT_FOUND | 404 | Character ID doesn't exist |
| SCENE_NOT_FOUND | 404 | Scene ID doesn't exist |
| VALIDATION_ERROR | 400 | Request body validation failed |
| PUBLISH_FAILED | 400 | Story cannot be published (incomplete) |
| GENERATION_FAILED | 500 | AI generation failed |
| RATE_LIMITED | 429 | Too many requests |

---

## Implementation Priority

### Phase 1 (High Priority)
1. Story CRUD endpoints
2. Character CRUD endpoints
3. Scene CRUD endpoints

### Phase 2 (Medium Priority)
1. Publishing endpoints (publish, unpublish, share)
2. Like/unlike endpoints

### Phase 3 (Lower Priority)
1. Discovery endpoints (public, featured, trending)
2. Full story generation endpoints

---

## Notes for API Team

1. **Pagination**: All list endpoints should support cursor-based pagination as an alternative to offset pagination for better performance with large datasets.

2. **Caching**: Public story endpoints should be cached with appropriate TTLs:
   - Featured stories: 5 minutes
   - Trending stories: 15 minutes
   - Public story list: 1 minute

3. **Rate Limiting**: Apply stricter limits to generation endpoints:
   - `generate-full`: 5 requests per hour per user
   - `generate-chapter-images`: 20 requests per hour per user

4. **Storage**: Story cover images and scene illustrations should be stored in blob storage with CDN distribution.

5. **Search**: Full-text search should index:
   - Story title and description
   - Character names
   - Scene titles and content (for user's own stories)
