# Asset Management System - UI Integration Guide

## Overview

This guide documents the new Generation Tracking & Asset Indexing API endpoints, enabling frontend applications to build:
- **Asset Libraries** - Browse, search, and manage user-generated content
- **Collections** - Curated groups of assets (favorites, projects, mood boards)
- **Inspiration Galleries** - Discover featured/public content from the community
- **Usage Dashboards** - Track AI generation history, costs, and statistics
- **Marketplaces** - Foundation for asset sharing and commerce

---

## Authentication

All authenticated endpoints require the `X-User-Id` header:

```http
X-User-Id: user-abc-123
```

For JWT-authenticated requests, also include:
```http
Authorization: Bearer <jwt_token>
```

---

## API Endpoints Reference

### 1. Assets API (`/api/assets`)

#### Search Assets
```http
GET /api/assets/search
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `query` | string | Free-text search (title, description, tags) |
| `assetType` | string | Filter: `image`, `video`, `audio` |
| `source` | string | Filter by source: `studio-fashion`, `canvas-creative`, etc. |
| `sourceAction` | string | Filter by action: `virtual-try-on`, `image-generation`, etc. |
| `visibility` | string | `public`, `private`, `unlisted` |
| `isGenerated` | boolean | Filter AI-generated vs uploaded |
| `isFeatured` | boolean | Filter featured content |
| `tags` | string | Comma-separated tags |
| `page` | int | Page number (default: 1) |
| `pageSize` | int | Results per page (default: 20, max: 100) |
| `sortBy` | string | `created_at`, `likes_count`, `views_count`, `title` |
| `sortDescending` | boolean | Sort direction (default: true) |

**Response:**
```json
{
  "items": [
    {
      "id": "uuid",
      "assetType": "image",
      "title": "Fashion Model Shot",
      "description": "AI-generated fashion photography",
      "publicUrl": "https://storage.googleapis.com/...",
      "thumbnailUrl": "https://storage.googleapis.com/.../thumb_...",
      "width": 1024,
      "height": 1024,
      "fileSizeBytes": 245678,
      "mimeType": "image/png",
      "visibility": "public",
      "isGenerated": true,
      "source": "studio-fashion",
      "sourceAction": "image-generation",
      "provider": "fal-ai",
      "model": "flux-pro",
      "tags": ["fashion", "ai-generated", "portrait"],
      "likesCount": 42,
      "viewsCount": 156,
      "downloadsCount": 12,
      "isFeatured": true,
      "isLikedByUser": false,
      "userId": "user-123",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "totalCount": 150,
  "page": 1,
  "pageSize": 20,
  "totalPages": 8
}
```

---

#### Get Featured Assets (Inspiration Gallery)
```http
GET /api/assets/featured
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `assetType` | string | Filter by type |
| `page` | int | Page number |
| `pageSize` | int | Results per page |

**Use Case:** Build inspiration galleries and discovery feeds.

---

#### Get My Assets
```http
GET /api/assets/my
```

Returns all assets owned by the authenticated user.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `assetType` | string | Filter by type |
| `page` | int | Page number |
| `pageSize` | int | Results per page |

---

#### Get Single Asset
```http
GET /api/assets/{assetId}
```

**Response:** Full asset details including metadata, generation info, and whether the current user has liked it.

---

#### Find Similar Assets
```http
GET /api/assets/{assetId}/similar
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `limit` | int | Max results (default: 20) |

**Use Case:** "More like this" recommendations, visual similarity search.

---

#### Upload Asset
```http
POST /api/assets/upload
Content-Type: multipart/form-data
```

**Form Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | File | Yes | The file to upload |
| `title` | string | No | Asset title |
| `description` | string | No | Asset description |
| `tags` | string | No | Comma-separated tags |
| `visibility` | string | No | `private` (default), `public`, `unlisted` |

**Response:** Created asset object.

---

#### Update Asset Metadata
```http
PATCH /api/assets/{assetId}
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "New description",
  "tags": ["tag1", "tag2"],
  "visibility": "public"
}
```

---

#### Like/Unlike Asset
```http
POST /api/assets/{assetId}/like
DELETE /api/assets/{assetId}/like
```

**Response:**
```json
{ "liked": true }
```

---

#### Archive Asset
```http
POST /api/assets/{assetId}/archive
```

Soft-deletes the asset (can be restored).

---

#### Delete Asset
```http
DELETE /api/assets/{assetId}
```

Permanently deletes the asset.

---

### 2. Collections API (`/api/collections`)

#### Get Public Collections
```http
GET /api/collections
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `collectionType` | string | `general`, `project`, `moodboard`, `favorites`, `inspiration` |
| `featured` | boolean | Filter featured collections |
| `query` | string | Search collection names/descriptions |
| `page` | int | Page number |
| `pageSize` | int | Results per page |

**Response:**
```json
{
  "items": [
    {
      "id": "uuid",
      "name": "Summer Fashion 2024",
      "description": "Curated summer looks and inspiration",
      "collectionType": "moodboard",
      "visibility": "public",
      "assetCount": 24,
      "coverImageUrl": "https://...",
      "previewAssets": [
        { "id": "...", "thumbnailUrl": "..." },
        { "id": "...", "thumbnailUrl": "..." }
      ],
      "isFeatured": true,
      "viewsCount": 1234,
      "userId": "user-123",
      "createdAt": "2024-01-10T08:00:00Z",
      "updatedAt": "2024-01-15T14:30:00Z"
    }
  ],
  "totalCount": 50,
  "page": 1,
  "pageSize": 20,
  "totalPages": 3
}
```

---

#### Get My Collections
```http
GET /api/collections/my
```

Returns all collections owned by the authenticated user.

---

#### Get Favorites Collection
```http
GET /api/collections/favorites
```

Returns the user's auto-created favorites collection. Creates one if it doesn't exist.

---

#### Create Collection
```http
POST /api/collections
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "My New Collection",
  "description": "Optional description",
  "collectionType": "moodboard",
  "visibility": "private",
  "coverImageUrl": "https://...",
  "tags": ["fashion", "summer"]
}
```

**Collection Types:**
- `general` - Generic collection
- `project` - Project-based grouping
- `moodboard` - Visual inspiration board
- `favorites` - Auto-managed favorites (system-created)
- `inspiration` - Curated inspiration

---

#### Get Collection Details
```http
GET /api/collections/{collectionId}
```

---

#### Update Collection
```http
PATCH /api/collections/{collectionId}
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "visibility": "public",
  "coverImageUrl": "https://..."
}
```

---

#### Delete Collection
```http
DELETE /api/collections/{collectionId}
```

Note: Cannot delete the favorites collection.

---

#### Get Collection Assets
```http
GET /api/collections/{collectionId}/assets
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | int | Page number |
| `pageSize` | int | Results per page |

---

#### Add Assets to Collection
```http
POST /api/collections/{collectionId}/assets
Content-Type: application/json
```

**Request Body:**
```json
{
  "assetIds": ["uuid1", "uuid2", "uuid3"],
  "notes": "Optional notes about these assets"
}
```

**Response:**
```json
{ "added": 3 }
```

---

#### Remove Asset from Collection
```http
DELETE /api/collections/{collectionId}/assets/{assetId}
```

---

#### Reorder Collection Assets
```http
PUT /api/collections/{collectionId}/assets/order
Content-Type: application/json
```

**Request Body:**
```json
{
  "assetIds": ["uuid3", "uuid1", "uuid2"]
}
```

Assets will be ordered as specified.

---

#### Quick Add to Favorites
```http
POST /api/collections/favorites/add/{assetId}
```

**Response:**
```json
{ "added": true, "collectionId": "favorites-uuid" }
```

---

#### Quick Remove from Favorites
```http
DELETE /api/collections/favorites/remove/{assetId}
```

---

#### Get Collections Containing Asset
```http
GET /api/collections/containing/{assetId}
```

Returns all collections (user's own) that contain the specified asset.

---

### 3. Generations API (`/api/generations`)

#### Get Generation History
```http
GET /api/generations
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `source` | string | Filter by source |
| `sourceAction` | string | Filter by action |
| `provider` | string | Filter by provider (`fal-ai`, `gemini`, etc.) |
| `model` | string | Filter by model |
| `generationType` | string | `image`, `video`, `audio`, `text` |
| `status` | string | `pending`, `processing`, `completed`, `failed` |
| `fromDate` | datetime | Filter from date |
| `toDate` | datetime | Filter to date |
| `page` | int | Page number |
| `pageSize` | int | Results per page |
| `sortBy` | string | Sort field |
| `sortDescending` | boolean | Sort direction |

**Response:**
```json
{
  "items": [
    {
      "id": "uuid",
      "status": "completed",
      "source": "studio-fashion",
      "sourceAction": "virtual-try-on",
      "provider": "fal-ai",
      "model": "kling-virtual-tryon",
      "generationType": "image",
      "prompt": "Professional fashion photography...",
      "outputAssetId": "asset-uuid",
      "totalTokens": 0,
      "estimatedCostUsd": 0.05,
      "processingTimeMs": 12500,
      "createdAt": "2024-01-15T10:30:00Z",
      "completedAt": "2024-01-15T10:30:12Z"
    }
  ],
  "totalCount": 250,
  "page": 1,
  "pageSize": 20,
  "totalPages": 13
}
```

---

#### Get Single Generation
```http
GET /api/generations/{generationId}
```

---

#### Get Usage Statistics
```http
GET /api/generations/usage
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `period` | string | `day`, `week`, `month`, `year`, `all` |
| `fromDate` | datetime | Custom period start |
| `toDate` | datetime | Custom period end |

**Response:**
```json
{
  "period": "month",
  "fromDate": "2024-01-01T00:00:00Z",
  "toDate": "2024-01-31T23:59:59Z",
  "totalGenerations": 150,
  "successfulGenerations": 142,
  "failedGenerations": 8,
  "totalTokens": 125000,
  "totalCostUsd": 12.50,
  "byType": {
    "image": { "count": 100, "cost": 5.00 },
    "video": { "count": 25, "cost": 6.25 },
    "audio": { "count": 15, "cost": 0.75 },
    "text": { "count": 10, "cost": 0.50 }
  },
  "bySource": {
    "studio-fashion": { "count": 80, "cost": 8.00 },
    "canvas-creative": { "count": 70, "cost": 4.50 }
  },
  "byModel": {
    "flux-pro": { "count": 60, "cost": 3.00 },
    "kling-virtual-tryon": { "count": 40, "cost": 5.00 }
  }
}
```

---

#### Get Usage by Source
```http
GET /api/generations/usage/by-source
```

Returns breakdown by source (studio-fashion, canvas-creative, etc.)

---

#### Get Usage by Model
```http
GET /api/generations/usage/by-model
```

Returns breakdown by AI model.

---

#### Get Cost Summary
```http
GET /api/generations/usage/cost
```

Returns cost-focused summary for billing dashboards.

---

## UI Component Patterns

### 1. Asset Grid Component

```tsx
interface AssetGridProps {
  endpoint: 'search' | 'featured' | 'my';
  filters?: AssetFilters;
  onAssetClick?: (asset: Asset) => void;
  enableInfiniteScroll?: boolean;
}

// Example usage
<AssetGrid
  endpoint="featured"
  filters={{ assetType: 'image' }}
  onAssetClick={(asset) => openAssetModal(asset)}
  enableInfiniteScroll
/>
```

### 2. Collection Card Component

```tsx
interface CollectionCardProps {
  collection: Collection;
  showPreview?: boolean;  // Show thumbnail grid
  previewCount?: number;  // Number of preview thumbnails
}

// Display with 4 preview thumbnails
<CollectionCard
  collection={collection}
  showPreview={true}
  previewCount={4}
/>
```

### 3. Favorites Toggle Button

```tsx
const FavoriteButton: React.FC<{ assetId: string }> = ({ assetId }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  const toggle = async () => {
    if (isFavorite) {
      await api.delete(`/collections/favorites/remove/${assetId}`);
    } else {
      await api.post(`/collections/favorites/add/${assetId}`);
    }
    setIsFavorite(!isFavorite);
  };

  return (
    <button onClick={toggle}>
      {isFavorite ? <HeartFilled /> : <HeartOutline />}
    </button>
  );
};
```

### 4. Add to Collection Modal

```tsx
const AddToCollectionModal: React.FC<{ assetIds: string[] }> = ({ assetIds }) => {
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);

  useEffect(() => {
    // Fetch user's collections
    api.get('/collections/my').then(res => setCollections(res.data.items));
  }, []);

  const handleAdd = async () => {
    await api.post(`/collections/${selectedCollection}/assets`, {
      assetIds: assetIds
    });
    closeModal();
  };

  return (
    <Modal>
      <CollectionList
        collections={collections}
        onSelect={setSelectedCollection}
      />
      <Button onClick={handleAdd}>Add to Collection</Button>
    </Modal>
  );
};
```

### 5. Usage Dashboard

```tsx
const UsageDashboard: React.FC = () => {
  const [stats, setStats] = useState(null);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    api.get(`/generations/usage?period=${period}`)
      .then(res => setStats(res.data));
  }, [period]);

  return (
    <Dashboard>
      <PeriodSelector value={period} onChange={setPeriod} />
      <StatsCards>
        <StatCard title="Total Generations" value={stats?.totalGenerations} />
        <StatCard title="Total Cost" value={`$${stats?.totalCostUsd}`} />
        <StatCard title="Success Rate" value={`${successRate}%`} />
      </StatsCards>
      <Charts>
        <PieChart data={stats?.byType} title="By Type" />
        <BarChart data={stats?.bySource} title="By Source" />
      </Charts>
    </Dashboard>
  );
};
```

---

## Page Layouts

### 1. Asset Library Page

```
┌─────────────────────────────────────────────────────────────┐
│  MY ASSETS                               [Upload] [Filters] │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ │
│ │         │ │         │ │         │ │         │ │         │ │
│ │  Asset  │ │  Asset  │ │  Asset  │ │  Asset  │ │  Asset  │ │
│ │    1    │ │    2    │ │    3    │ │    4    │ │    5    │ │
│ │         │ │         │ │         │ │         │ │         │ │
│ │ [❤] [...│ │ [❤] [...│ │ [❤] [...│ │ [❤] [...│ │ [❤] [...│ │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘ │
│                                                             │
│ [Tabs: All | Images | Videos | Audio]      [Sort: Recent ▼] │
└─────────────────────────────────────────────────────────────┘
```

### 2. Collections Page

```
┌─────────────────────────────────────────────────────────────┐
│  MY COLLECTIONS                          [+ New Collection] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ⭐ FAVORITES (12)                                          │
│  ┌────┬────┬────┬────┐                                      │
│  │    │    │    │    │  Your favorited assets               │
│  └────┴────┴────┴────┘                                      │
│                                                             │
│  📁 Summer Campaign (24)                    [Edit] [Delete] │
│  ┌────┬────┬────┬────┐                                      │
│  │    │    │    │    │  Summer fashion lookbook             │
│  └────┴────┴────┴────┘                                      │
│                                                             │
│  🎨 Moodboard - Vintage (8)                 [Edit] [Delete] │
│  ┌────┬────┬────┬────┐                                      │
│  │    │    │    │    │  Vintage aesthetic inspiration       │
│  └────┴────┴────┴────┘                                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3. Inspiration Gallery Page

```
┌─────────────────────────────────────────────────────────────┐
│  INSPIRATION GALLERY                                        │
├─────────────────────────────────────────────────────────────┤
│ [All] [Fashion] [Interior] [Art] [Photography]   [Search 🔍]│
├─────────────────────────────────────────────────────────────┤
│  🔥 FEATURED                                                │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐│
│  │                 │ │                 │ │                 ││
│  │   Featured 1    │ │   Featured 2    │ │   Featured 3    ││
│  │                 │ │                 │ │                 ││
│  │ ❤ 234  👁 1.2k │ │ ❤ 189  👁 890  │ │ ❤ 156  👁 720  ││
│  └─────────────────┘ └─────────────────┘ └─────────────────┘│
│                                                             │
│  📚 FEATURED COLLECTIONS                                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                    │
│  │ Summer   │ │ Minimal  │ │ Street   │                    │
│  │ Vibes    │ │ Design   │ │ Style    │                    │
│  │ (45)     │ │ (32)     │ │ (28)     │                    │
│  └──────────┘ └──────────┘ └──────────┘                    │
│                                                             │
│  🆕 RECENT                                   [Load More...] │
│  [Masonry grid of public assets...]                         │
└─────────────────────────────────────────────────────────────┘
```

### 4. Generation History Page

```
┌─────────────────────────────────────────────────────────────┐
│  GENERATION HISTORY                      Period: [Month ▼]  │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │   142    │  │   $12.50 │  │   95%    │  │  125k    │    │
│  │ Success  │  │   Cost   │  │ Success  │  │  Tokens  │    │
│  │          │  │          │  │   Rate   │  │          │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
├─────────────────────────────────────────────────────────────┤
│ [Filter: Source ▼] [Provider ▼] [Type ▼] [Status ▼]        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────┐ Virtual Try-On           ✓ Completed    $0.05     │
│  │     │ fal-ai / kling-tryon     12.5s          2m ago    │
│  └─────┘ "Professional model..."                            │
│  ─────────────────────────────────────────────────────────  │
│  ┌─────┐ Image Generation         ✓ Completed    $0.03     │
│  │     │ fal-ai / flux-pro        8.2s           5m ago    │
│  └─────┘ "Summer fashion shoot..."                          │
│  ─────────────────────────────────────────────────────────  │
│  ┌─────┐ Video Generation         ✗ Failed       $0.00     │
│  │     │ fal-ai / kling-video     Error          10m ago   │
│  └─────┘ "Walking on runway..."                             │
└─────────────────────────────────────────────────────────────┘
```

---

## State Management Recommendations

### React Query / TanStack Query Patterns

```tsx
// Asset queries
const useAssets = (filters: AssetFilters) =>
  useInfiniteQuery({
    queryKey: ['assets', filters],
    queryFn: ({ pageParam = 1 }) =>
      api.get('/assets/search', { params: { ...filters, page: pageParam } }),
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined
  });

// Collection mutations
const useAddToCollection = () =>
  useMutation({
    mutationFn: ({ collectionId, assetIds }) =>
      api.post(`/collections/${collectionId}/assets`, { assetIds }),
    onSuccess: () => {
      queryClient.invalidateQueries(['collections']);
    }
  });

// Optimistic like updates
const useLikeAsset = () =>
  useMutation({
    mutationFn: (assetId) => api.post(`/assets/${assetId}/like`),
    onMutate: async (assetId) => {
      await queryClient.cancelQueries(['asset', assetId]);
      const previous = queryClient.getQueryData(['asset', assetId]);
      queryClient.setQueryData(['asset', assetId], (old) => ({
        ...old,
        isLikedByUser: true,
        likesCount: old.likesCount + 1
      }));
      return { previous };
    },
    onError: (err, assetId, context) => {
      queryClient.setQueryData(['asset', assetId], context.previous);
    }
  });
```

---

## Source/Action Taxonomy

When filtering or displaying generation sources, use these standard values:

### Sources
| Source | Description |
|--------|-------------|
| `studio-fashion` | Fashion Studio app |
| `studio-moodboard` | Moodboard Studio app |
| `studio-interior` | Interior Design Studio |
| `canvas-creative` | Creative Canvas |
| `canvas-fashion` | Fashion Canvas |
| `quick-gen` | Quick generation tools |
| `api-direct` | Direct API usage |

### Actions
| Action | Description |
|--------|-------------|
| `image-generation` | Text-to-image |
| `image-editing` | Inpainting/outpainting |
| `virtual-try-on` | Clothing try-on |
| `clothes-swap` | Garment replacement |
| `style-transfer` | Style application |
| `face-swap` | Face replacement |
| `upscale` | Image enhancement |
| `video-generation` | Text/image-to-video |
| `video-extend` | Video continuation |
| `audio-voiceover` | Voice synthesis |
| `audio-music` | Music generation |
| `audio-sfx` | Sound effects |
| `llm-prompt` | Text generation |

---

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message description"
}
```

**HTTP Status Codes:**
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing X-User-Id)
- `403` - Forbidden (not owner of resource)
- `404` - Not Found
- `500` - Internal Server Error

### Example Error Handling

```tsx
const handleApiError = (error: AxiosError) => {
  if (error.response?.status === 401) {
    showToast('Please log in to continue');
    redirectToLogin();
  } else if (error.response?.status === 403) {
    showToast('You don\'t have permission for this action');
  } else if (error.response?.status === 404) {
    showToast('Resource not found');
  } else {
    showToast(error.response?.data?.error || 'An error occurred');
  }
};
```

---

## Marketplace Foundation

The asset system provides the foundation for future marketplace features:

### Current Capabilities
- Public/private visibility control
- Featured asset curation
- View/like/download tracking
- User attribution on assets
- Collection sharing

### Future Extensions (Not Yet Implemented)
- Asset licensing metadata
- Purchase/download transactions
- Creator profiles and followers
- Revenue sharing calculations
- Asset bundles and packs

---

## Performance Recommendations

1. **Use Thumbnails**: Always display `thumbnailUrl` in grids, load full `publicUrl` only in detail views
2. **Infinite Scroll**: Use cursor-based pagination for large lists
3. **Optimistic Updates**: Update UI immediately for likes/favorites, rollback on error
4. **Cache Aggressively**: Asset metadata rarely changes, cache for 5+ minutes
5. **Lazy Load**: Only fetch collection assets when expanded
6. **Batch Operations**: Use bulk add to collection instead of individual calls

---

## Integration Checklist

- [ ] Add X-User-Id header to all authenticated requests
- [ ] Implement asset grid with infinite scroll
- [ ] Add favorites toggle to asset cards
- [ ] Create "Add to Collection" modal
- [ ] Build collections management page
- [ ] Implement inspiration gallery with filters
- [ ] Add usage dashboard for power users
- [ ] Handle all error states gracefully
- [ ] Implement optimistic updates for interactions

---

## Questions?

Refer to the API source code:
- Controllers: `Controllers/Assets/*.cs`
- Services: `Services/Tracking/*.cs`
- Models: `Models/Tracking/*.cs`
