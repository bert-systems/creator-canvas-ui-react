# AI Generation Tracking & Asset Indexing System Design

## Overview

This document defines the architecture for a unified AI generation tracking and asset indexing system that:
1. Tracks ALL AI generations (image, video, audio, LLM) in a single table
2. Stores ALL generated assets in GCP with consistent folder hierarchy
3. Indexes assets for discovery, collections, and inspiration galleries
4. Enables cost tracking, usage analytics, and billing

---

## 1. Database Schema

### 1.1 Core Tables

#### `ai_generations` - Central Generation Tracking

```sql
CREATE TABLE ai_generations (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- =========================================
    -- CONTEXT: Who and Where
    -- =========================================
    tenant_id VARCHAR(100) NOT NULL DEFAULT 'default',
    user_id VARCHAR(100) NOT NULL,

    -- Source classification (which feature/studio initiated this)
    source VARCHAR(100) NOT NULL,
    -- Examples: 'studio-fashion', 'canvas-fashion', 'studio-moodboard',
    --           'canvas-moodboard', 'studio-interior', 'canvas-interior',
    --           'studio-social', 'canvas-social', 'canvas-core',
    --           'canvas-audio', 'canvas-multiframe', 'api-direct', 'batch-processing'

    -- Source action (what use case/operation)
    source_action VARCHAR(100) NOT NULL,
    -- Examples: 'virtual-try-on', 'clothes-swap', 'outfit-generation',
    --           'image-generation', 'image-edit', 'background-removal',
    --           'video-generation', 'image-to-video', 'lip-sync',
    --           'text-to-speech', 'music-generation', 'sfx-generation',
    --           'prompt-enhancement', 'image-analysis', 'text-generation'

    -- =========================================
    -- PROVIDER & MODEL
    -- =========================================
    provider VARCHAR(50) NOT NULL,
    -- Examples: 'falai', 'openai', 'anthropic', 'google', 'elevenlabs',
    --           'replicate', 'stability', 'runway', 'pika'

    model VARCHAR(100) NOT NULL,
    -- Examples: 'flux-2-pro', 'flux-2-pro-edit', 'gpt-4o', 'claude-3-opus',
    --           'gemini-2.0-flash', 'eleven_multilingual_v2', 'kling-1.6'

    generation_type VARCHAR(20) NOT NULL,
    -- Values: 'image', 'video', 'audio', 'llm', 'multimodal'

    -- =========================================
    -- INPUT
    -- =========================================
    prompt TEXT,
    negative_prompt TEXT,
    system_prompt TEXT,  -- For LLM generations

    -- All input parameters as JSONB for flexibility
    input_parameters JSONB NOT NULL DEFAULT '{}',
    -- Contains: size, seed, strength, guidance_scale, steps, voice_id, etc.

    -- Reference to input assets (for image-to-image, video-from-image, etc.)
    input_asset_ids UUID[] DEFAULT '{}',

    -- =========================================
    -- OUTPUT
    -- =========================================
    output_asset_id UUID,  -- FK to unified_assets (null until complete)

    -- For LLM responses (text output, not stored as asset)
    output_text TEXT,

    -- Model-specific output metadata
    output_metadata JSONB DEFAULT '{}',
    -- Contains: finish_reason, safety_ratings, model_version, etc.

    -- =========================================
    -- USAGE & COST TRACKING
    -- =========================================
    -- Token usage (for LLM)
    input_tokens INTEGER,
    output_tokens INTEGER,
    total_tokens INTEGER,

    -- Resource usage (for media)
    input_pixels BIGINT,      -- Width * Height for images
    output_pixels BIGINT,
    duration_seconds NUMERIC(10, 3),  -- For audio/video

    -- Timing
    queue_time_ms INTEGER,     -- Time waiting in queue
    processing_time_ms INTEGER, -- Actual generation time
    total_time_ms INTEGER,      -- End-to-end time

    -- Cost tracking
    estimated_cost_usd NUMERIC(12, 8),
    actual_cost_usd NUMERIC(12, 8),  -- If provider reports actual cost

    -- Snapshot of pricing at generation time
    pricing_snapshot JSONB,
    -- Contains: { "input_per_1m": 2.50, "output_per_1m": 10.00, "per_image": 0.04 }

    -- =========================================
    -- STATUS & LIFECYCLE
    -- =========================================
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    -- Values: 'pending', 'queued', 'processing', 'completed', 'failed', 'cancelled'

    error_message TEXT,
    error_code VARCHAR(100),
    error_details JSONB,

    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,

    -- =========================================
    -- TIMESTAMPS
    -- =========================================
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    queued_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,

    -- =========================================
    -- TRACING & DEBUGGING
    -- =========================================
    request_id VARCHAR(100),      -- Correlation ID for distributed tracing
    session_id VARCHAR(100),      -- User session
    workflow_job_id UUID,         -- Link to canvas_workflow_jobs if applicable
    parent_generation_id UUID,    -- For chained generations

    -- Raw request/response for debugging (optional, can be disabled)
    raw_request JSONB,
    raw_response JSONB,

    -- =========================================
    -- CONSTRAINTS
    -- =========================================
    CONSTRAINT fk_output_asset FOREIGN KEY (output_asset_id)
        REFERENCES unified_assets(id) ON DELETE SET NULL,
    CONSTRAINT fk_parent_generation FOREIGN KEY (parent_generation_id)
        REFERENCES ai_generations(id) ON DELETE SET NULL,
    CONSTRAINT fk_workflow_job FOREIGN KEY (workflow_job_id)
        REFERENCES canvas_workflow_jobs(id) ON DELETE SET NULL
);

-- Indexes for common queries
CREATE INDEX idx_ai_gen_tenant_user ON ai_generations(tenant_id, user_id);
CREATE INDEX idx_ai_gen_source ON ai_generations(source);
CREATE INDEX idx_ai_gen_source_action ON ai_generations(source, source_action);
CREATE INDEX idx_ai_gen_provider_model ON ai_generations(provider, model);
CREATE INDEX idx_ai_gen_type ON ai_generations(generation_type);
CREATE INDEX idx_ai_gen_status ON ai_generations(status);
CREATE INDEX idx_ai_gen_created_at ON ai_generations(created_at DESC);
CREATE INDEX idx_ai_gen_user_created ON ai_generations(user_id, created_at DESC);

-- Composite index for usage analytics
CREATE INDEX idx_ai_gen_analytics ON ai_generations(
    tenant_id, source, source_action, provider, model, created_at
);
```

#### `unified_assets` - Universal Asset Registry

```sql
CREATE TABLE unified_assets (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- =========================================
    -- OWNERSHIP & CONTEXT
    -- =========================================
    tenant_id VARCHAR(100) NOT NULL DEFAULT 'default',
    user_id VARCHAR(100) NOT NULL,

    -- =========================================
    -- ASSET TYPE & FORMAT
    -- =========================================
    asset_type VARCHAR(20) NOT NULL,
    -- Values: 'image', 'video', 'audio', 'document'

    mime_type VARCHAR(100) NOT NULL,
    file_extension VARCHAR(20) NOT NULL,

    -- =========================================
    -- STORAGE LOCATION
    -- =========================================
    storage_provider VARCHAR(20) NOT NULL DEFAULT 'gcs',
    -- Values: 'gcs', 'local', 's3'

    storage_bucket VARCHAR(100),
    storage_path VARCHAR(500) NOT NULL,  -- Full path: tenant/user/type/date/id.ext

    -- URLs
    public_url TEXT NOT NULL,
    thumbnail_url TEXT,

    -- Signed URL caching (for private assets)
    signed_url TEXT,
    signed_url_expires_at TIMESTAMPTZ,

    -- =========================================
    -- FILE METADATA
    -- =========================================
    file_size_bytes BIGINT NOT NULL,
    content_hash VARCHAR(64),  -- SHA-256 for deduplication

    -- Dimensions (for images/video)
    width INTEGER,
    height INTEGER,
    aspect_ratio VARCHAR(20),  -- '16:9', '1:1', '9:16'

    -- Duration (for audio/video)
    duration_seconds NUMERIC(10, 3),

    -- Quality metrics
    quality_score NUMERIC(5, 2),  -- AI-assessed quality 0-100

    -- =========================================
    -- GENERATION LINK
    -- =========================================
    generation_id UUID,  -- FK to ai_generations (null for uploads)
    is_generated BOOLEAN NOT NULL DEFAULT false,

    -- Source tracking (denormalized for query performance)
    source VARCHAR(100),        -- Copied from generation
    source_action VARCHAR(100), -- Copied from generation

    -- =========================================
    -- CONTENT ANALYSIS (AI-Powered)
    -- =========================================
    ai_title VARCHAR(255),           -- AI-generated title
    ai_description TEXT,             -- AI-generated description for search
    ai_alt_text TEXT,                -- Accessibility alt text

    detected_labels JSONB,           -- Vision API labels with confidence
    detected_objects JSONB,          -- Object detection results
    detected_faces JSONB,            -- Face detection (count, emotions)
    detected_text TEXT,              -- OCR extracted text

    color_palette JSONB,             -- Dominant colors for visual search
    style_attributes JSONB,          -- Artistic style analysis

    -- Embeddings for similarity search
    content_embedding vector(1536),  -- CLIP or similar embedding

    -- Safety/moderation
    safety_scores JSONB,             -- Content moderation scores
    is_nsfw BOOLEAN DEFAULT false,
    moderation_status VARCHAR(20) DEFAULT 'pending',
    -- Values: 'pending', 'approved', 'flagged', 'rejected'

    -- =========================================
    -- DISCOVERY & ORGANIZATION
    -- =========================================
    title VARCHAR(255),
    description TEXT,

    -- Tagging
    tags TEXT[] DEFAULT '{}',
    auto_tags TEXT[] DEFAULT '{}',   -- AI-generated tags
    categories TEXT[] DEFAULT '{}',  -- Hierarchical categories

    -- Prompt (for generated assets)
    prompt TEXT,

    -- =========================================
    -- VISIBILITY & PERMISSIONS
    -- =========================================
    visibility VARCHAR(20) NOT NULL DEFAULT 'private',
    -- Values: 'private', 'unlisted', 'public', 'team'

    is_featured BOOLEAN DEFAULT false,
    featured_at TIMESTAMPTZ,
    featured_order INTEGER,

    -- Licensing
    license_type VARCHAR(50) DEFAULT 'personal',
    -- Values: 'personal', 'commercial', 'editorial', 'creative-commons'

    -- =========================================
    -- USAGE METRICS
    -- =========================================
    view_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    remix_count INTEGER DEFAULT 0,  -- Times used as reference

    -- =========================================
    -- LIFECYCLE
    -- =========================================
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    -- Values: 'processing', 'active', 'archived', 'deleted'

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    archived_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,

    -- Retention policy
    retention_days INTEGER,  -- null = forever
    expires_at TIMESTAMPTZ,

    -- =========================================
    -- CONSTRAINTS
    -- =========================================
    CONSTRAINT fk_generation FOREIGN KEY (generation_id)
        REFERENCES ai_generations(id) ON DELETE SET NULL
);

-- Core indexes
CREATE INDEX idx_assets_tenant_user ON unified_assets(tenant_id, user_id);
CREATE INDEX idx_assets_type ON unified_assets(asset_type);
CREATE INDEX idx_assets_visibility ON unified_assets(visibility);
CREATE INDEX idx_assets_status ON unified_assets(status);
CREATE INDEX idx_assets_created_at ON unified_assets(created_at DESC);
CREATE INDEX idx_assets_source ON unified_assets(source, source_action);

-- Discovery indexes
CREATE INDEX idx_assets_tags ON unified_assets USING GIN(tags);
CREATE INDEX idx_assets_auto_tags ON unified_assets USING GIN(auto_tags);
CREATE INDEX idx_assets_categories ON unified_assets USING GIN(categories);
CREATE INDEX idx_assets_featured ON unified_assets(is_featured, featured_order)
    WHERE is_featured = true;

-- Full-text search
CREATE INDEX idx_assets_fts ON unified_assets USING GIN(
    to_tsvector('english',
        COALESCE(title, '') || ' ' ||
        COALESCE(description, '') || ' ' ||
        COALESCE(ai_description, '') || ' ' ||
        COALESCE(prompt, '')
    )
);

-- Vector similarity search (for visual search)
CREATE INDEX idx_assets_embedding ON unified_assets
    USING hnsw(content_embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);

-- Content hash for deduplication
CREATE INDEX idx_assets_hash ON unified_assets(content_hash)
    WHERE content_hash IS NOT NULL;
```

#### `asset_collections` - User Collections

```sql
CREATE TABLE asset_collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    tenant_id VARCHAR(100) NOT NULL DEFAULT 'default',
    user_id VARCHAR(100) NOT NULL,

    -- Collection info
    name VARCHAR(255) NOT NULL,
    description TEXT,
    cover_asset_id UUID,

    -- Type
    collection_type VARCHAR(50) NOT NULL DEFAULT 'user',
    -- Values: 'user', 'favorites', 'inspiration', 'project',
    --         'curated', 'smart', 'system'

    -- Smart collection filter (auto-populates based on rules)
    smart_filter JSONB,
    -- Example: { "source": "studio-fashion", "tags": ["summer"], "date_range": "30d" }

    -- Visibility
    visibility VARCHAR(20) NOT NULL DEFAULT 'private',
    is_featured BOOLEAN DEFAULT false,

    -- Metrics
    item_count INTEGER DEFAULT 0,
    total_views INTEGER DEFAULT 0,
    follower_count INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_cover_asset FOREIGN KEY (cover_asset_id)
        REFERENCES unified_assets(id) ON DELETE SET NULL
);

CREATE TABLE collection_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_id UUID NOT NULL,
    asset_id UUID NOT NULL,

    sort_order INTEGER DEFAULT 0,
    notes TEXT,  -- User notes on why this is in collection

    added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    added_by VARCHAR(100),

    CONSTRAINT fk_collection FOREIGN KEY (collection_id)
        REFERENCES asset_collections(id) ON DELETE CASCADE,
    CONSTRAINT fk_asset FOREIGN KEY (asset_id)
        REFERENCES unified_assets(id) ON DELETE CASCADE,

    UNIQUE(collection_id, asset_id)
);

CREATE INDEX idx_collection_items_collection ON collection_items(collection_id, sort_order);
CREATE INDEX idx_collection_items_asset ON collection_items(asset_id);
```

---

## 2. Storage Path Convention

### 2.1 GCS Bucket Structure

```
gs://smartai-ssgp-v2-assets/
├── {tenant_id}/
│   └── {user_id}/
│       ├── images/
│       │   └── {YYYY}/{MM}/{DD}/
│       │       └── {generation_id}/
│       │           ├── {asset_id}.png
│       │           └── {asset_id}_thumb.webp
│       ├── videos/
│       │   └── {YYYY}/{MM}/{DD}/
│       │       └── {generation_id}/
│       │           ├── {asset_id}.mp4
│       │           └── {asset_id}_thumb.webp
│       ├── audio/
│       │   └── {YYYY}/{MM}/{DD}/
│       │       └── {generation_id}/
│       │           └── {asset_id}.mp3
│       └── uploads/
│           └── {YYYY}/{MM}/{DD}/
│               └── {asset_id}.{ext}
```

### 2.2 Path Examples

```
# Generated fashion image
default/user-123/images/2025/12/22/gen-abc123/asset-def456.png
default/user-123/images/2025/12/22/gen-abc123/asset-def456_thumb.webp

# Generated video
default/user-123/videos/2025/12/22/gen-xyz789/asset-uvw012.mp4

# Generated audio
default/user-123/audio/2025/12/22/gen-lmn345/asset-opq678.mp3

# User upload (no generation_id)
default/user-123/uploads/2025/12/22/asset-rst901.jpg
```

---

## 3. Source & Source Action Taxonomy

### 3.1 Sources (Feature/Studio Origin)

| Source | Description |
|--------|-------------|
| `studio-fashion` | Fashion studio standalone features |
| `canvas-fashion` | Fashion nodes in canvas workflows |
| `studio-moodboard` | Moodboard studio features |
| `canvas-moodboard` | Moodboard nodes in canvas |
| `studio-interior` | Interior design studio |
| `canvas-interior` | Interior design canvas nodes |
| `studio-social` | Social media content studio |
| `canvas-social` | Social media canvas nodes |
| `canvas-core` | Core canvas image/video generation |
| `canvas-audio` | Audio generation in canvas |
| `canvas-multiframe` | Stack/queue/grid generation |
| `canvas-llm` | LLM/text generation nodes |
| `api-direct` | Direct API calls |
| `batch-processing` | Background batch jobs |
| `system` | System-initiated generations |

### 3.2 Source Actions (Use Cases)

#### Image Actions
| Action | Description |
|--------|-------------|
| `image-generation` | Text-to-image generation |
| `image-edit` | Image editing/inpainting |
| `image-variation` | Generate variations |
| `image-upscale` | Resolution upscaling |
| `background-removal` | Remove background |
| `background-replace` | Replace background |
| `face-swap` | Face swapping |
| `style-transfer` | Apply artistic style |
| `image-composite` | Multi-image composition |

#### Fashion Actions
| Action | Description |
|--------|-------------|
| `virtual-try-on` | Try garment on model |
| `clothes-swap` | Swap garments |
| `outfit-generation` | Generate outfit |
| `fashion-edit` | Edit fashion elements |
| `garment-generation` | Generate clothing item |

#### Video Actions
| Action | Description |
|--------|-------------|
| `video-generation` | Text-to-video |
| `image-to-video` | Animate image |
| `video-extension` | Extend video |
| `lip-sync` | Lip sync audio to video |
| `video-edit` | Edit video |

#### Audio Actions
| Action | Description |
|--------|-------------|
| `text-to-speech` | Generate speech |
| `voice-clone` | Clone voice |
| `music-generation` | Generate music |
| `sfx-generation` | Generate sound effects |
| `dialogue-generation` | Generate dialogue |
| `audio-enhancement` | Enhance audio quality |

#### LLM Actions
| Action | Description |
|--------|-------------|
| `text-generation` | General text generation |
| `prompt-enhancement` | Enhance prompts |
| `image-analysis` | Analyze image content |
| `content-moderation` | Moderate content |
| `translation` | Translate text |
| `summarization` | Summarize content |

#### Moodboard Actions
| Action | Description |
|--------|-------------|
| `mood-generation` | Generate moodboard |
| `palette-extraction` | Extract color palette |
| `style-analysis` | Analyze visual style |

#### Interior Design Actions
| Action | Description |
|--------|-------------|
| `room-redesign` | Redesign room |
| `furniture-placement` | Place furniture |
| `material-swap` | Change materials |

---

## 4. Service Layer Design

### 4.1 Interfaces

```csharp
/// <summary>
/// Central service for tracking AI generations
/// </summary>
public interface IGenerationTrackingService
{
    /// <summary>
    /// Start tracking a new generation (creates pending record)
    /// </summary>
    Task<Guid> StartGenerationAsync(GenerationStartRequest request);

    /// <summary>
    /// Update generation status
    /// </summary>
    Task UpdateStatusAsync(Guid generationId, GenerationStatus status);

    /// <summary>
    /// Complete a generation with output
    /// </summary>
    Task<GenerationRecord> CompleteGenerationAsync(
        Guid generationId,
        GenerationResult result);

    /// <summary>
    /// Mark generation as failed
    /// </summary>
    Task FailGenerationAsync(
        Guid generationId,
        string errorMessage,
        string? errorCode = null,
        object? errorDetails = null);

    /// <summary>
    /// Get generation by ID
    /// </summary>
    Task<GenerationRecord?> GetGenerationAsync(Guid generationId);

    /// <summary>
    /// Query generations with filters
    /// </summary>
    Task<PagedResult<GenerationRecord>> QueryGenerationsAsync(
        GenerationQuery query);

    /// <summary>
    /// Get usage statistics
    /// </summary>
    Task<UsageStatistics> GetUsageStatisticsAsync(
        string userId,
        UsageStatisticsQuery query);
}

/// <summary>
/// Unified asset management service
/// </summary>
public interface IUnifiedAssetService
{
    /// <summary>
    /// Create asset from generation output URL
    /// </summary>
    Task<UnifiedAsset> CreateFromUrlAsync(
        string url,
        AssetCreationContext context);

    /// <summary>
    /// Create asset from binary data
    /// </summary>
    Task<UnifiedAsset> CreateFromBytesAsync(
        byte[] data,
        AssetCreationContext context);

    /// <summary>
    /// Create asset from user upload
    /// </summary>
    Task<UnifiedAsset> CreateFromUploadAsync(
        Stream stream,
        UploadContext context);

    /// <summary>
    /// Get asset by ID
    /// </summary>
    Task<UnifiedAsset?> GetAssetAsync(Guid assetId);

    /// <summary>
    /// Search assets
    /// </summary>
    Task<PagedResult<UnifiedAsset>> SearchAssetsAsync(AssetSearchQuery query);

    /// <summary>
    /// Find similar assets (visual search)
    /// </summary>
    Task<List<UnifiedAsset>> FindSimilarAsync(
        Guid assetId,
        int limit = 20);

    /// <summary>
    /// Update asset metadata
    /// </summary>
    Task UpdateMetadataAsync(Guid assetId, AssetMetadataUpdate update);

    /// <summary>
    /// Trigger AI analysis of asset
    /// </summary>
    Task<AssetAnalysis> AnalyzeAssetAsync(Guid assetId);

    /// <summary>
    /// Generate thumbnail
    /// </summary>
    Task<string> GenerateThumbnailAsync(Guid assetId);

    /// <summary>
    /// Archive asset
    /// </summary>
    Task ArchiveAssetAsync(Guid assetId);

    /// <summary>
    /// Delete asset (soft delete)
    /// </summary>
    Task DeleteAssetAsync(Guid assetId);
}

/// <summary>
/// Collection management service
/// </summary>
public interface ICollectionService
{
    Task<AssetCollection> CreateCollectionAsync(CreateCollectionRequest request);
    Task<AssetCollection?> GetCollectionAsync(Guid collectionId);
    Task<PagedResult<AssetCollection>> GetUserCollectionsAsync(string userId);
    Task<PagedResult<AssetCollection>> GetPublicCollectionsAsync(CollectionQuery query);

    Task AddToCollectionAsync(Guid collectionId, Guid assetId, string? notes = null);
    Task RemoveFromCollectionAsync(Guid collectionId, Guid assetId);
    Task ReorderCollectionAsync(Guid collectionId, List<Guid> assetOrder);

    Task<PagedResult<UnifiedAsset>> GetCollectionAssetsAsync(
        Guid collectionId,
        PaginationParams pagination);

    Task DeleteCollectionAsync(Guid collectionId);
}
```

### 4.2 Request/Response Models

```csharp
public class GenerationStartRequest
{
    public string TenantId { get; set; } = "default";
    public required string UserId { get; set; }

    public required string Source { get; set; }
    public required string SourceAction { get; set; }

    public required string Provider { get; set; }
    public required string Model { get; set; }
    public required string GenerationType { get; set; }

    public string? Prompt { get; set; }
    public string? NegativePrompt { get; set; }
    public string? SystemPrompt { get; set; }

    public Dictionary<string, object>? InputParameters { get; set; }
    public List<Guid>? InputAssetIds { get; set; }

    public string? RequestId { get; set; }
    public string? SessionId { get; set; }
    public Guid? WorkflowJobId { get; set; }
    public Guid? ParentGenerationId { get; set; }
}

public class GenerationResult
{
    // For media outputs
    public string? OutputUrl { get; set; }
    public byte[]? OutputBytes { get; set; }

    // For LLM outputs
    public string? OutputText { get; set; }

    // Token usage
    public int? InputTokens { get; set; }
    public int? OutputTokens { get; set; }
    public int? TotalTokens { get; set; }

    // Timing
    public int? ProcessingTimeMs { get; set; }

    // Output metadata
    public Dictionary<string, object>? OutputMetadata { get; set; }

    // Raw response (for debugging)
    public object? RawResponse { get; set; }
}

public class AssetCreationContext
{
    public string TenantId { get; set; } = "default";
    public required string UserId { get; set; }

    public required string AssetType { get; set; }
    public required string MimeType { get; set; }

    public Guid? GenerationId { get; set; }
    public string? Source { get; set; }
    public string? SourceAction { get; set; }

    public string? Title { get; set; }
    public string? Description { get; set; }
    public string? Prompt { get; set; }
    public List<string>? Tags { get; set; }

    public string Visibility { get; set; } = "private";

    public bool GenerateThumbnail { get; set; } = true;
    public bool AnalyzeContent { get; set; } = false;
}
```

---

## 5. Integration Points

### 5.1 Provider Integration Pattern

Every AI provider call should follow this pattern:

```csharp
public async Task<ImageGenerationResponse> GenerateImageAsync(
    ImageGenerationRequest request)
{
    // 1. Start tracking
    var generationId = await _trackingService.StartGenerationAsync(new()
    {
        UserId = request.UserId,
        Source = request.Source ?? "canvas-core",
        SourceAction = request.SourceAction ?? "image-generation",
        Provider = "falai",
        Model = request.Model,
        GenerationType = "image",
        Prompt = request.Prompt,
        InputParameters = new Dictionary<string, object>
        {
            ["size"] = request.Size,
            ["seed"] = request.Seed,
            ["guidance_scale"] = request.GuidanceScale
        },
        InputAssetIds = request.ReferenceAssetIds
    });

    try
    {
        // 2. Update status to processing
        await _trackingService.UpdateStatusAsync(
            generationId,
            GenerationStatus.Processing);

        var stopwatch = Stopwatch.StartNew();

        // 3. Call provider
        var result = await CallFalAIAsync(request);

        stopwatch.Stop();

        // 4. Create asset from output
        var asset = await _assetService.CreateFromUrlAsync(
            result.ImageUrl,
            new AssetCreationContext
            {
                UserId = request.UserId,
                AssetType = "image",
                MimeType = "image/png",
                GenerationId = generationId,
                Source = request.Source,
                SourceAction = request.SourceAction,
                Prompt = request.Prompt
            });

        // 5. Complete tracking
        await _trackingService.CompleteGenerationAsync(generationId, new()
        {
            OutputUrl = asset.PublicUrl,
            ProcessingTimeMs = (int)stopwatch.ElapsedMilliseconds,
            OutputMetadata = new Dictionary<string, object>
            {
                ["seed"] = result.Seed,
                ["model_version"] = result.ModelVersion
            }
        });

        return new ImageGenerationResponse
        {
            Success = true,
            GenerationId = generationId,
            AssetId = asset.Id,
            ImageUrl = asset.PublicUrl
        };
    }
    catch (Exception ex)
    {
        // 6. Track failure
        await _trackingService.FailGenerationAsync(
            generationId,
            ex.Message,
            ex is ProviderException pe ? pe.ErrorCode : "UNKNOWN");

        throw;
    }
}
```

### 5.2 Cost Calculation

```csharp
public class CostCalculator
{
    private static readonly Dictionary<string, ModelPricing> Pricing = new()
    {
        // Image models (per image)
        ["flux-2-pro"] = new() { PerImage = 0.05m },
        ["flux-2-pro-edit"] = new() { PerImage = 0.05m },
        ["flux-2-max"] = new() { PerImage = 0.10m },

        // LLM models (per 1M tokens)
        ["gpt-4o"] = new() { InputPer1M = 2.50m, OutputPer1M = 10.00m },
        ["claude-3-opus"] = new() { InputPer1M = 15.00m, OutputPer1M = 75.00m },
        ["gemini-2.0-flash"] = new() { InputPer1M = 0.075m, OutputPer1M = 0.30m },

        // Audio models (per 1000 chars)
        ["eleven_multilingual_v2"] = new() { Per1KChars = 0.30m },

        // Video models (per second)
        ["kling-1.6"] = new() { PerSecond = 0.15m }
    };

    public decimal CalculateCost(GenerationRecord generation)
    {
        if (!Pricing.TryGetValue(generation.Model, out var pricing))
            return 0;

        return generation.GenerationType switch
        {
            "image" => pricing.PerImage ?? 0,
            "llm" => CalculateLlmCost(generation, pricing),
            "audio" => CalculateAudioCost(generation, pricing),
            "video" => CalculateVideoCost(generation, pricing),
            _ => 0
        };
    }
}
```

---

## 6. Analytics & Reporting

### 6.1 Usage Dashboard Queries

```sql
-- Daily generation counts by source
SELECT
    DATE(created_at) as date,
    source,
    source_action,
    COUNT(*) as generation_count,
    SUM(estimated_cost_usd) as total_cost,
    AVG(processing_time_ms) as avg_processing_ms
FROM ai_generations
WHERE tenant_id = $1
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at), source, source_action
ORDER BY date DESC, generation_count DESC;

-- User generation summary
SELECT
    user_id,
    COUNT(*) as total_generations,
    COUNT(DISTINCT source) as sources_used,
    SUM(estimated_cost_usd) as total_cost,
    SUM(total_tokens) as total_tokens,
    COUNT(*) FILTER (WHERE status = 'completed') as successful,
    COUNT(*) FILTER (WHERE status = 'failed') as failed
FROM ai_generations
WHERE tenant_id = $1
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY user_id
ORDER BY total_generations DESC;

-- Model usage breakdown
SELECT
    provider,
    model,
    generation_type,
    COUNT(*) as usage_count,
    SUM(estimated_cost_usd) as total_cost,
    AVG(processing_time_ms) as avg_latency,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY processing_time_ms) as p95_latency
FROM ai_generations
WHERE tenant_id = $1
  AND created_at >= NOW() - INTERVAL '7 days'
GROUP BY provider, model, generation_type
ORDER BY usage_count DESC;
```

### 6.2 Materialized Views for Analytics

```sql
-- Daily aggregates (refresh hourly)
CREATE MATERIALIZED VIEW generation_daily_stats AS
SELECT
    DATE(created_at) as date,
    tenant_id,
    source,
    source_action,
    provider,
    model,
    generation_type,
    COUNT(*) as generation_count,
    COUNT(*) FILTER (WHERE status = 'completed') as success_count,
    COUNT(*) FILTER (WHERE status = 'failed') as failure_count,
    SUM(estimated_cost_usd) as total_cost,
    SUM(total_tokens) as total_tokens,
    AVG(processing_time_ms) as avg_processing_ms,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY processing_time_ms) as p95_ms
FROM ai_generations
GROUP BY DATE(created_at), tenant_id, source, source_action,
         provider, model, generation_type;

CREATE UNIQUE INDEX idx_daily_stats_unique ON generation_daily_stats(
    date, tenant_id, source, source_action, provider, model, generation_type
);
```

---

## 7. Migration Strategy

### 7.1 Phase 1: Create New Tables
- Create `ai_generations` table
- Create `unified_assets` table
- Create `asset_collections` and `collection_items` tables
- Add indexes

### 7.2 Phase 2: Dual-Write
- Modify providers to write to both old and new tables
- Migrate existing `canvas_assets` to `unified_assets`
- Validate data consistency

### 7.3 Phase 3: Read Migration
- Update read queries to use new tables
- Keep old tables as fallback

### 7.4 Phase 4: Cleanup
- Remove writes to old tables
- Archive old tables
- Remove fallback code

---

## 8. Future Enhancements

1. **Billing Integration**: Connect generation costs to billing system
2. **Rate Limiting**: Per-user/tenant generation limits based on tracking
3. **Smart Collections**: Auto-curated collections based on style/content
4. **Visual Search**: Similar image search using embeddings
5. **Content Moderation**: Automated NSFW/policy detection
6. **Asset Versioning**: Track edits and variations
7. **Collaborative Collections**: Shared team collections
8. **Export/Import**: Bulk asset management
