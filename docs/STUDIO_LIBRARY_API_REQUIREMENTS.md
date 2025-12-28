# Studio Library API Requirements

**Date**: 2025-12-27
**Status**: Pending Backend Implementation
**Priority**: High - Required for Workspace tab functionality

## Overview

Currently, only the **Storyteller Studio** has dedicated persistence APIs for its content (stories, characters, scenes). The other studios (Social, Moodboards, Fashion, Interior) can **generate** content but cannot **persist or retrieve** it in a studio-specific manner.

This document specifies the required API endpoints to enable full Workspace functionality across all studios.

---

## Current Gap

| Studio | Generation APIs | Library/Persistence APIs | Workspace Impact |
|--------|----------------|--------------------------|------------------|
| Storyteller | ✅ Complete | ✅ Complete | Fully functional |
| Social Media | ✅ 14 endpoints | ❌ None | Cannot show saved posts |
| Moodboards | ✅ 13 endpoints | ❌ None | Cannot show saved moodboards |
| Fashion | ✅ 20+ endpoints | ❌ None | Cannot show saved lookbooks |
| Interior Design | ✅ 6 endpoints | ❌ None | Cannot show saved designs |

---

## Required Endpoints by Studio

### 1. Social Media Studio

#### Post Library Endpoints

```http
# List user's saved posts (paginated)
GET /api/social/posts
Query params:
  - page: number (default: 1)
  - pageSize: number (default: 20)
  - platform: string[] (instagram, tiktok, twitter, linkedin, youtube)
  - status: string (draft, scheduled, published)
  - sortBy: string (createdAt, updatedAt, scheduledFor)
  - sortOrder: string (asc, desc)

Response:
{
  "posts": [
    {
      "id": "uuid",
      "type": "single" | "carousel" | "story" | "reel",
      "platform": "instagram",
      "caption": "string",
      "hashtags": ["string"],
      "imageUrls": ["string"],
      "status": "draft" | "scheduled" | "published",
      "scheduledFor": "datetime?",
      "publishedAt": "datetime?",
      "engagement": { "likes": 0, "comments": 0, "shares": 0 },
      "createdAt": "datetime",
      "updatedAt": "datetime"
    }
  ],
  "totalCount": 100,
  "page": 1,
  "pageSize": 20,
  "totalPages": 5
}
```

```http
# Get single post by ID
GET /api/social/posts/{postId}

# Create/save post
POST /api/social/posts
Body:
{
  "type": "single" | "carousel" | "story" | "reel",
  "platform": "instagram",
  "caption": "string",
  "hashtags": ["string"],
  "imageUrls": ["string"],
  "status": "draft" | "scheduled",
  "scheduledFor": "datetime?",
  "metadata": { ... }
}

# Update post
PATCH /api/social/posts/{postId}
Body: (partial update allowed)

# Delete post
DELETE /api/social/posts/{postId}
```

#### Carousel Library Endpoints

```http
# List user's carousels
GET /api/social/carousels
Query params: (same as posts)

Response:
{
  "carousels": [
    {
      "id": "uuid",
      "title": "string",
      "platform": "instagram",
      "slides": [
        {
          "id": "uuid",
          "order": 1,
          "imageUrl": "string",
          "caption": "string"
        }
      ],
      "caption": "string",
      "hashtags": ["string"],
      "status": "draft" | "scheduled" | "published",
      "createdAt": "datetime",
      "updatedAt": "datetime"
    }
  ],
  "totalCount": 50,
  "page": 1,
  "pageSize": 20
}
```

```http
# CRUD for carousels
GET /api/social/carousels/{carouselId}
POST /api/social/carousels
PATCH /api/social/carousels/{carouselId}
DELETE /api/social/carousels/{carouselId}
```

---

### 2. Moodboards Studio

#### Moodboard Library Endpoints

```http
# List user's moodboards (paginated)
GET /api/moodboard/library
Query params:
  - page: number
  - pageSize: number
  - theme: string (aesthetic theme filter)
  - sortBy: string (createdAt, updatedAt, name)
  - sortOrder: string

Response:
{
  "moodboards": [
    {
      "id": "uuid",
      "name": "string",
      "description": "string",
      "thumbnailUrl": "string",
      "theme": "string",
      "colorPalette": ["#hex1", "#hex2"],
      "elements": [
        {
          "id": "uuid",
          "type": "image" | "color" | "texture" | "typography",
          "url": "string?",
          "value": "string?",
          "position": { "x": 0, "y": 0 }
        }
      ],
      "tags": ["string"],
      "createdAt": "datetime",
      "updatedAt": "datetime"
    }
  ],
  "totalCount": 25,
  "page": 1,
  "pageSize": 20
}
```

```http
# CRUD for moodboards
GET /api/moodboard/library/{moodboardId}
POST /api/moodboard/library
PATCH /api/moodboard/library/{moodboardId}
DELETE /api/moodboard/library/{moodboardId}
```

#### Brand Kit Library Endpoints

```http
# List user's brand kits
GET /api/moodboard/brand-kits
Query params:
  - page: number
  - pageSize: number
  - sortBy: string

Response:
{
  "brandKits": [
    {
      "id": "uuid",
      "name": "string",
      "companyName": "string?",
      "logoUrl": "string?",
      "primaryColors": ["#hex"],
      "secondaryColors": ["#hex"],
      "typography": {
        "headingFont": "string",
        "bodyFont": "string"
      },
      "style": "minimal" | "bold" | "elegant" | "playful",
      "createdAt": "datetime",
      "updatedAt": "datetime"
    }
  ],
  "totalCount": 10,
  "page": 1,
  "pageSize": 20
}
```

```http
# CRUD for brand kits
GET /api/moodboard/brand-kits/{brandKitId}
POST /api/moodboard/brand-kits
PATCH /api/moodboard/brand-kits/{brandKitId}
DELETE /api/moodboard/brand-kits/{brandKitId}
```

---

### 3. Fashion Studio

#### Lookbook Library Endpoints

```http
# List user's lookbooks (paginated)
GET /api/fashion/lookbooks
Query params:
  - page: number
  - pageSize: number
  - season: string (spring, summer, fall, winter)
  - collection: string
  - sortBy: string

Response:
{
  "lookbooks": [
    {
      "id": "uuid",
      "name": "string",
      "season": "string?",
      "collection": "string?",
      "description": "string",
      "coverImageUrl": "string",
      "looks": [
        {
          "id": "uuid",
          "order": 1,
          "imageUrl": "string",
          "garments": [
            {
              "type": "top" | "bottom" | "dress" | "accessory",
              "name": "string",
              "fabric": "string?",
              "color": "string"
            }
          ],
          "mood": "string?",
          "price": number?
        }
      ],
      "lookCount": 12,
      "tags": ["string"],
      "createdAt": "datetime",
      "updatedAt": "datetime"
    }
  ],
  "totalCount": 8,
  "page": 1,
  "pageSize": 20
}
```

```http
# CRUD for lookbooks
GET /api/fashion/lookbooks/{lookbookId}
POST /api/fashion/lookbooks
PATCH /api/fashion/lookbooks/{lookbookId}
DELETE /api/fashion/lookbooks/{lookbookId}

# Manage looks within lookbook
GET /api/fashion/lookbooks/{lookbookId}/looks
POST /api/fashion/lookbooks/{lookbookId}/looks
PATCH /api/fashion/lookbooks/{lookbookId}/looks/{lookId}
DELETE /api/fashion/lookbooks/{lookbookId}/looks/{lookId}
PUT /api/fashion/lookbooks/{lookbookId}/looks/reorder
```

#### Collection Library Endpoints

```http
# List user's fashion collections
GET /api/fashion/collections
Query params: (similar to lookbooks)

Response:
{
  "collections": [
    {
      "id": "uuid",
      "name": "string",
      "season": "string",
      "year": 2025,
      "lookbookIds": ["uuid"],
      "techPackIds": ["uuid"],
      "lineSheetUrl": "string?",
      "createdAt": "datetime"
    }
  ],
  "totalCount": 3
}
```

---

### 4. Interior Design Studio

#### Room Redesign Library Endpoints

```http
# List user's room redesigns (paginated)
GET /api/interior/redesigns
Query params:
  - page: number
  - pageSize: number
  - roomType: string (living-room, bedroom, kitchen, bathroom, office)
  - style: string (modern, minimalist, industrial, bohemian)
  - sortBy: string

Response:
{
  "redesigns": [
    {
      "id": "uuid",
      "name": "string",
      "roomType": "living-room",
      "style": "modern",
      "originalImageUrl": "string",
      "redesignedImageUrl": "string",
      "beforeAfterComparisonUrl": "string?",
      "description": "string?",
      "materials": [
        {
          "type": "flooring" | "wall" | "furniture",
          "name": "string",
          "color": "string"
        }
      ],
      "furnitureSuggestions": [
        {
          "item": "string",
          "brand": "string?",
          "price": number?,
          "url": "string?"
        }
      ],
      "tags": ["string"],
      "createdAt": "datetime",
      "updatedAt": "datetime"
    }
  ],
  "totalCount": 15,
  "page": 1,
  "pageSize": 20
}
```

```http
# CRUD for redesigns
GET /api/interior/redesigns/{redesignId}
POST /api/interior/redesigns
PATCH /api/interior/redesigns/{redesignId}
DELETE /api/interior/redesigns/{redesignId}
```

#### Virtual Staging Library Endpoints

```http
# List user's virtual stagings
GET /api/interior/stagings
Query params:
  - page: number
  - pageSize: number
  - roomType: string
  - stagingStyle: string
  - sortBy: string

Response:
{
  "stagings": [
    {
      "id": "uuid",
      "name": "string",
      "roomType": "string",
      "stagingStyle": "contemporary" | "traditional" | "minimal",
      "emptyRoomImageUrl": "string",
      "stagedImageUrl": "string",
      "squareFootage": number?,
      "inventoryItems": [
        {
          "item": "string",
          "category": "furniture" | "decor" | "lighting",
          "quantity": 1
        }
      ],
      "createdAt": "datetime",
      "updatedAt": "datetime"
    }
  ],
  "totalCount": 10,
  "page": 1,
  "pageSize": 20
}
```

```http
# CRUD for stagings
GET /api/interior/stagings/{stagingId}
POST /api/interior/stagings
PATCH /api/interior/stagings/{stagingId}
DELETE /api/interior/stagings/{stagingId}
```

---

## Database Schema Suggestions

### Social Media Tables

```sql
CREATE TABLE SocialPosts (
  Id UUID PRIMARY KEY,
  UserId UUID NOT NULL,
  Type VARCHAR(20) NOT NULL, -- single, carousel, story, reel
  Platform VARCHAR(20) NOT NULL,
  Caption TEXT,
  Hashtags TEXT[], -- Array of hashtags
  ImageUrls TEXT[], -- Array of image URLs
  Status VARCHAR(20) DEFAULT 'draft',
  ScheduledFor TIMESTAMP,
  PublishedAt TIMESTAMP,
  Engagement JSONB, -- {likes, comments, shares}
  Metadata JSONB,
  CreatedAt TIMESTAMP DEFAULT NOW(),
  UpdatedAt TIMESTAMP DEFAULT NOW()
);

CREATE TABLE SocialCarousels (
  Id UUID PRIMARY KEY,
  UserId UUID NOT NULL,
  Title VARCHAR(255),
  Platform VARCHAR(20) NOT NULL,
  Caption TEXT,
  Hashtags TEXT[],
  Status VARCHAR(20) DEFAULT 'draft',
  ScheduledFor TIMESTAMP,
  Metadata JSONB,
  CreatedAt TIMESTAMP DEFAULT NOW(),
  UpdatedAt TIMESTAMP DEFAULT NOW()
);

CREATE TABLE SocialCarouselSlides (
  Id UUID PRIMARY KEY,
  CarouselId UUID REFERENCES SocialCarousels(Id) ON DELETE CASCADE,
  SlideOrder INT NOT NULL,
  ImageUrl TEXT NOT NULL,
  Caption TEXT,
  CreatedAt TIMESTAMP DEFAULT NOW()
);
```

### Moodboard Tables

```sql
CREATE TABLE Moodboards (
  Id UUID PRIMARY KEY,
  UserId UUID NOT NULL,
  Name VARCHAR(255) NOT NULL,
  Description TEXT,
  ThumbnailUrl TEXT,
  Theme VARCHAR(100),
  ColorPalette TEXT[], -- Array of hex colors
  Tags TEXT[],
  CreatedAt TIMESTAMP DEFAULT NOW(),
  UpdatedAt TIMESTAMP DEFAULT NOW()
);

CREATE TABLE MoodboardElements (
  Id UUID PRIMARY KEY,
  MoodboardId UUID REFERENCES Moodboards(Id) ON DELETE CASCADE,
  ElementType VARCHAR(50) NOT NULL, -- image, color, texture, typography
  Url TEXT,
  Value TEXT, -- For colors/text
  PositionX FLOAT,
  PositionY FLOAT,
  Width FLOAT,
  Height FLOAT,
  CreatedAt TIMESTAMP DEFAULT NOW()
);

CREATE TABLE BrandKits (
  Id UUID PRIMARY KEY,
  UserId UUID NOT NULL,
  Name VARCHAR(255) NOT NULL,
  CompanyName VARCHAR(255),
  LogoUrl TEXT,
  PrimaryColors TEXT[],
  SecondaryColors TEXT[],
  Typography JSONB, -- {headingFont, bodyFont, sizes}
  Style VARCHAR(50),
  CreatedAt TIMESTAMP DEFAULT NOW(),
  UpdatedAt TIMESTAMP DEFAULT NOW()
);
```

### Fashion Tables

```sql
CREATE TABLE FashionLookbooks (
  Id UUID PRIMARY KEY,
  UserId UUID NOT NULL,
  Name VARCHAR(255) NOT NULL,
  Season VARCHAR(50),
  Collection VARCHAR(255),
  Description TEXT,
  CoverImageUrl TEXT,
  Tags TEXT[],
  CreatedAt TIMESTAMP DEFAULT NOW(),
  UpdatedAt TIMESTAMP DEFAULT NOW()
);

CREATE TABLE FashionLooks (
  Id UUID PRIMARY KEY,
  LookbookId UUID REFERENCES FashionLookbooks(Id) ON DELETE CASCADE,
  LookOrder INT NOT NULL,
  ImageUrl TEXT NOT NULL,
  Mood VARCHAR(100),
  Price DECIMAL(10,2),
  CreatedAt TIMESTAMP DEFAULT NOW()
);

CREATE TABLE FashionGarments (
  Id UUID PRIMARY KEY,
  LookId UUID REFERENCES FashionLooks(Id) ON DELETE CASCADE,
  GarmentType VARCHAR(50) NOT NULL,
  Name VARCHAR(255),
  Fabric VARCHAR(100),
  Color VARCHAR(50),
  CreatedAt TIMESTAMP DEFAULT NOW()
);
```

### Interior Design Tables

```sql
CREATE TABLE InteriorRedesigns (
  Id UUID PRIMARY KEY,
  UserId UUID NOT NULL,
  Name VARCHAR(255),
  RoomType VARCHAR(50) NOT NULL,
  Style VARCHAR(50),
  OriginalImageUrl TEXT NOT NULL,
  RedesignedImageUrl TEXT NOT NULL,
  ComparisonUrl TEXT,
  Description TEXT,
  Materials JSONB, -- Array of {type, name, color}
  FurnitureSuggestions JSONB, -- Array of {item, brand, price, url}
  Tags TEXT[],
  CreatedAt TIMESTAMP DEFAULT NOW(),
  UpdatedAt TIMESTAMP DEFAULT NOW()
);

CREATE TABLE InteriorStagings (
  Id UUID PRIMARY KEY,
  UserId UUID NOT NULL,
  Name VARCHAR(255),
  RoomType VARCHAR(50) NOT NULL,
  StagingStyle VARCHAR(50),
  EmptyRoomImageUrl TEXT NOT NULL,
  StagedImageUrl TEXT NOT NULL,
  SquareFootage FLOAT,
  InventoryItems JSONB, -- Array of {item, category, quantity}
  CreatedAt TIMESTAMP DEFAULT NOW(),
  UpdatedAt TIMESTAMP DEFAULT NOW()
);
```

---

## Migration File Reference

For Storyteller (already implemented): `DB/Migrations/013_Enhanced_Story_Library.sql`

Suggested new migration files:
- `DB/Migrations/014_Social_Media_Library.sql`
- `DB/Migrations/015_Moodboard_Library.sql`
- `DB/Migrations/016_Fashion_Library.sql`
- `DB/Migrations/017_Interior_Design_Library.sql`

---

## Frontend Integration Plan

Once these endpoints are available, the frontend will:

1. **Create Zustand Stores** for each studio:
   - `src/stores/socialStore.ts`
   - `src/stores/moodboardStore.ts`
   - `src/stores/fashionStore.ts`
   - `src/stores/interiorStore.ts`

2. **Update Services** to include library methods:
   - `socialMediaService.ts` → add `listPosts()`, `getPost()`, `savePost()`, etc.
   - `moodboardService.ts` → add `listMoodboards()`, `getMoodboard()`, `saveMoodboard()`, etc.
   - `fashionService.ts` → add `listLookbooks()`, `getLookbook()`, `saveLookbook()`, etc.
   - `interiorDesignService.ts` → add `listRedesigns()`, `getRedesign()`, `saveRedesign()`, etc.

3. **Update Studio Components** to fetch from stores:
   - Each studio's Workspace tab will display persisted content
   - Right inspector panel will show item details
   - Click handlers for selection and editing

---

## Summary

This document outlines **40+ new API endpoints** needed across 4 studios to enable full library/workspace functionality. The pattern follows the existing Storyteller implementation which successfully uses:
- `storyLibraryService.ts` for API calls
- `storyStore.ts` for Zustand state management
- Backend persistence via dedicated CRUD endpoints

Please prioritize these endpoints to unblock the frontend Workspace implementation.
