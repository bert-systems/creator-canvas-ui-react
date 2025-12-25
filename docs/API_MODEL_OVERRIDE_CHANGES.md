# API Model Override Changes - UI Integration Guide

**Date**: December 24, 2024
**Version**: 1.0
**Affected APIs**: Moodboard, Social Media

---

## Overview

The Moodboard and Social Media APIs now support **optional model override parameters** that allow the UI to specify which AI models to use for image generation and LLM (text) operations. This enables advanced users to select different models based on quality, speed, or cost preferences.

---

## New Request Fields

### Image Generation Override

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `imageModel` | `string?` | `"nano-banana-pro"` | Override the default image generation model |

### LLM (Text) Override

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `llmModel` | `string?` | `"gemini-2.5-flash"` | Override the default LLM model for text generation |

### Video Override

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `videoModel` | `string?` | Provider default | Override the video generation model |

---

## Affected Endpoints

### Moodboard API (`/api/moodboard/*`)

| Endpoint | New Fields | Notes |
|----------|------------|-------|
| `POST /moodboard/generate` | `imageModel`, `llmModel` | Main moodboard generation |
| `POST /moodboard/colors/extract` | `llmModel` | Color palette extraction (LLM only) |
| `POST /moodboard/brand-kit/generate` | `imageModel`, `llmModel` | Brand kit with moodboard image |
| `POST /moodboard/typography/suggest` | `llmModel` | Font suggestions (LLM only) |
| `POST /moodboard/aesthetic/analyze` | `llmModel` | Aesthetic analysis (LLM only) |
| `POST /moodboard/texture/generate` | `imageModel` | Texture generation (image only) |
| `POST /moodboard/theme/generate` | `imageModel`, `llmModel` | Visual theme generation |
| `POST /moodboard/inspiration/curate` | `imageModel` | Inspiration images (image only) |
| `POST /moodboard/layout/arrange` | `imageModel` | Layout arrangement (image only) |

### Social Media API (`/api/social/*`)

| Endpoint | New Fields | Notes |
|----------|------------|-------|
| `POST /social/post/generate` | `imageModel`, `llmModel` | Social post with image + caption |
| `POST /social/carousel/generate` | `imageModel`, `llmModel` | Multi-slide carousel |
| `POST /social/caption/generate` | `llmModel` | Caption generation (LLM only) |
| `POST /social/content/schedule` | `llmModel` | Content scheduling (LLM only) |
| `POST /social/story/create` | `videoModel` | Story/Reel video |
| `POST /social/template/customize` | `imageModel` | Template customization |
| `POST /social/thumbnail/generate` | `imageModel` | Thumbnail generation |
| `POST /social/hook/generate` | `llmModel` | Hook text generation |
| `POST /social/hashtag/optimize` | `llmModel` | Hashtag optimization |
| `POST /social/content/repurpose` | `llmModel` | Content repurposing |
| `POST /social/reel/generate` | `videoModel` | Reel video generation |
| `POST /social/trends/analyze` | `llmModel` | Trend analysis |

---

## Example Usage

### Without Override (Uses Defaults)

```json
POST /api/social/caption/generate
{
  "context": "New coffee shop opening",
  "platform": "Instagram",
  "tone": "Friendly",
  "hashtagCount": 10
}
```

### With LLM Model Override

```json
POST /api/social/caption/generate
{
  "context": "New coffee shop opening",
  "platform": "Instagram",
  "tone": "Friendly",
  "hashtagCount": 10,
  "llmModel": "gemini-2.0-flash"
}
```

### With Image Model Override

```json
POST /api/social/post/generate
{
  "topic": "Summer Fashion Collection",
  "platform": "Instagram",
  "contentType": "Promotional",
  "imageModel": "flux-pro",
  "llmModel": "gemini-2.0-flash"
}
```

### Moodboard with Both Overrides

```json
POST /api/moodboard/generate
{
  "concept": "Minimalist interior design",
  "style": "Modern",
  "colorScheme": "Neutral",
  "imageCount": 4,
  "imageModel": "flux-pro",
  "llmModel": "gemini-2.5-pro"
}
```

---

## Available Models

### Image Generation Models

| Model ID | Provider | Quality | Speed | Cost |
|----------|----------|---------|-------|------|
| `nano-banana-pro` | fal.ai | High | Fast | $ |
| `flux-pro` | fal.ai | Very High | Medium | $$ |
| `flux-dev` | fal.ai | High | Fast | $ |
| `flux-schnell` | fal.ai | Medium | Very Fast | $ |

### LLM Models

| Model ID | Provider | Quality | Speed | Cost |
|----------|----------|---------|-------|------|
| `gemini-2.5-flash` | Google | High | Fast | $ |
| `gemini-2.0-flash` | Google | High | Very Fast | $ |
| `gemini-2.5-pro` | Google | Very High | Medium | $$ |
| `gpt-4o` | OpenAI | Very High | Medium | $$$ |
| `gpt-4o-mini` | OpenAI | High | Fast | $ |
| `claude-3-5-sonnet` | Anthropic | Very High | Medium | $$$ |

---

## UI Implementation Recommendations

### 1. Simple Mode (Default)
- Don't expose model selection
- Use default models for all requests
- Best for most users

### 2. Advanced Mode (Optional)
- Add a "Model Settings" or "Advanced" section
- Dropdown/select for image model and LLM model
- Show estimated quality/speed/cost indicators

### 3. Preset Modes
Consider offering preset combinations:

| Preset | Image Model | LLM Model | Use Case |
|--------|-------------|-----------|----------|
| **Fast** | `nano-banana-pro` | `gemini-2.0-flash` | Quick iterations |
| **Balanced** | `nano-banana-pro` | `gemini-2.5-flash` | Default experience |
| **Quality** | `flux-pro` | `gemini-2.5-pro` | Final productions |

---

## Error Handling

If an unsupported model is specified, the API will:
1. Log a warning
2. Fall back to a compatible provider
3. Return an error if no fallback is available

**Example error response:**
```json
{
  "success": false,
  "errors": ["Model not supported: invalid-model-name"]
}
```

---

## Backward Compatibility

- **All new fields are optional** - existing integrations continue to work
- **Defaults are sensible** - `nano-banana-pro` for images, `gemini-2.5-flash` for LLM
- **No breaking changes** - response format unchanged

---

## Testing Checklist

- [ ] Test endpoints without model overrides (should use defaults)
- [ ] Test endpoints with valid `imageModel` override
- [ ] Test endpoints with valid `llmModel` override
- [ ] Test endpoints with both overrides
- [ ] Test with invalid model name (should error gracefully)
- [ ] Verify tracking shows correct model in logs/database

---

## Questions?

Contact the API team for:
- Adding new model support
- Custom model configurations
- Performance benchmarks
