# UI Integration Guidelines - Multi-Frame, Audio, Composite Studio & Prompts APIs

This document provides comprehensive integration guidelines for the UI team to integrate the newly implemented APIs.

## API Base URL
```
http://localhost:5003/api
```

---

## 1. Multi-Frame APIs (Stacks, Queues, Grids)

### Base Path: `/api/multiframe`

### 1.1 Stack Generation (Vertical Multi-Image Sequences)

**Endpoint:** `POST /api/multiframe/stacks/{stackType}`

Stack types available:
- `multiverse` - Parallel reality variations
- `time` - Temporal evolution
- `style` - Style variations
- `character` - Character variations
- `environment` - Environment variations
- `emotion` - Emotional range
- `perspective` - Viewpoint variations
- `transformation` - Metamorphosis sequences
- `dialogue` - Conversation sequences
- `concept` - Conceptual exploration

**Request Body:**
```json
{
  "prompt": "A cyberpunk street scene",
  "negativePrompt": "blurry, low quality",
  "frameCount": 4,
  "model": "fal-ai/flux-pro",
  "width": 1024,
  "height": 1024,
  "referenceImage": "https://...",
  "seed": 12345,
  "outputOptions": {
    "createComposite": true,
    "compositeLayout": "vertical",
    "gapWidth": 10
  }
}
```

**Response:**
```json
{
  "success": true,
  "stackType": "multiverse",
  "frames": [
    {
      "index": 0,
      "imageUrl": "https://storage.../frame_0.png",
      "definition": { "variation": "Reality A" }
    }
  ],
  "compositeUrl": "https://storage.../composite.png",
  "totalFrames": 4,
  "processingTime": 12.5
}
```

### 1.2 Queue Generation (Horizontal Multi-Image Sequences)

**Endpoint:** `POST /api/multiframe/queues/{queueType}`

Queue types available:
- `timeline` - Chronological progression
- `parallel` - Simultaneous events
- `comparison` - Side-by-side comparison
- `process` - Step-by-step process
- `storyboard` - Cinematic storyboard
- `progression` - Skill/growth progression
- `reaction` - Action-reaction sequences
- `transformation` - Before/during/after

**Request Body:** Same as stacks with `compositeLayout: "horizontal"`

### 1.3 Grid Generation (2D Multi-Image Layouts)

**Endpoint:** `POST /api/multiframe/grids/{gridType}`

Grid types available:
- `contact` - Contact sheet layout
- `turnaround` - Character turnaround views
- `lighting` - Lighting studies
- `expression` - Facial expressions
- `pose` - Pose sheet
- `color` - Color studies
- `material` - Material/texture studies
- `scale` - Scale comparison
- `moodboard` - Visual mood exploration
- `composition` - Compositional variations
- `technical` - Technical specifications
- `fashion` - Fashion lookbook
- `interior` - Interior design variations

**Request Body:**
```json
{
  "prompt": "Character design for fantasy warrior",
  "rows": 2,
  "columns": 4,
  "model": "fal-ai/flux-pro",
  "outputOptions": {
    "createComposite": true,
    "compositeLayout": "grid",
    "gapWidth": 5
  }
}
```

### 1.4 Frame Extraction

**Endpoint:** `POST /api/multiframe/extract`

Extract individual frames from a composite image:
```json
{
  "compositeImageUrl": "https://...",
  "orientation": "vertical",
  "frameCount": 4,
  "gapWidth": 10,
  "outputFormat": "png"
}
```

### 1.5 Type Discovery Endpoints

- `GET /api/multiframe/stacks/types` - List all stack types with descriptions
- `GET /api/multiframe/queues/types` - List all queue types with descriptions
- `GET /api/multiframe/grids/types` - List all grid types with descriptions

---

## 2. Audio APIs (Voiceover, Music, SFX)

### Base Path: `/api/audio`

### 2.1 Voiceover Generation

**Endpoint:** `POST /api/audio/voiceover`

```json
{
  "text": "Welcome to the world of AI-generated content.",
  "voice": "male-narrator",
  "model": "eleven_multilingual_v2",
  "language": "en",
  "stability": 0.5,
  "similarityBoost": 0.75,
  "style": 0.0,
  "format": "mp3_44100_128"
}
```

**Voice Categories:**
- `male-narrator` - Josh (deep male narrator)
- `female-narrator` - Sarah (warm female narrator)
- `male-character` - Adam (versatile male character)
- `female-character` - Rachel (expressive female character)
- `child` - Gigi (child voice)
- `elderly-male` - Callum (elderly male voice)
- `default` - George (default male voice)

**Response:**
```json
{
  "success": true,
  "audioUrl": "https://storage.../voiceover.mp3",
  "duration": 5.2,
  "format": "mp3",
  "voiceId": "TxGEqnHWrfWFTfGW9XjX",
  "model": "eleven_multilingual_v2",
  "characterCount": 47
}
```

### 2.2 Multi-Character Dialogue

**Endpoint:** `POST /api/audio/dialogue`

```json
{
  "lines": [
    {
      "character": "Alice",
      "text": "Hello, how are you?",
      "voice": "female-character",
      "emotion": "happy"
    },
    {
      "character": "Bob",
      "text": "I'm doing great, thanks!",
      "voice": "male-character",
      "emotion": "excited"
    }
  ],
  "model": "eleven_multilingual_v2",
  "language": "en"
}
```

**Supported Emotions:**
- `happy`, `joyful` (style: 0.8)
- `sad`, `melancholy` (style: 0.3)
- `angry`, `furious` (style: 0.9)
- `calm`, `peaceful` (style: 0.2)
- `excited`, `enthusiastic` (style: 0.85)
- `scared`, `fearful` (style: 0.7)
- `neutral` (style: 0.0)

### 2.3 Music Generation

**Endpoint:** `POST /api/audio/music`

```json
{
  "duration": 30,
  "genre": "ambient",
  "mood": "relaxing",
  "tempo": "slow",
  "instruments": "piano, strings",
  "description": "Background music for meditation",
  "instrumental": true,
  "format": "mp3_44100_128"
}
```

### 2.4 Sound Effects

**Endpoint:** `POST /api/audio/sfx`

```json
{
  "description": "Thunder rumbling in the distance",
  "duration": 5,
  "format": "mp3_44100_128"
}
```

### 2.5 Voice Catalog

**Endpoint:** `GET /api/audio/voices`

Returns available voices with their IDs, names, categories, and descriptions.

---

## 3. Composite Studio APIs (Multi-Reference Weighted Generation)

### Base Path: `/api/composite-studio`

### 3.1 Generate Composite

**Endpoint:** `POST /api/composite-studio/generate`

Generate from 2-10 weighted reference images:
```json
{
  "prompt": "A cyberpunk character design",
  "references": [
    { "url": "https://.../ref1.png", "weight": 50, "name": "Style reference" },
    { "url": "https://.../ref2.png", "weight": 30, "name": "Pose reference" },
    { "url": "https://.../ref3.png", "weight": 20, "name": "Color reference" }
  ],
  "blendMode": "balanced",
  "model": "fal-ai/flux-pro",
  "generationType": "image",
  "width": 1024,
  "height": 1024
}
```

**Blend Modes:**
- `strict` - High consistency, follows references closely (strength: 0.9, guidance: 7.5)
- `balanced` - Default mode, balances creativity and adherence (strength: 0.7, guidance: 5.0)
- `creative` - More creative freedom, less strict adherence (strength: 0.5, guidance: 3.5)
- `loose` - Maximum freedom, references as inspiration (strength: 0.3, guidance: 2.0)

**Weight Rules:**
- Minimum 2 references, maximum 10
- Weights must sum to 100%
- Each weight must be between 0-100%

### 3.2 Canvas Format Generation

**Endpoint:** `POST /api/composite-studio/generate-from-canvas`

Supports multiple input formats from canvas workflows:
```json
{
  "referenceImages": ["https://.../ref1.png", "https://.../ref2.png"],
  "weights": [60, 40],
  "prompt": "Merge these styles",
  "blendMode": "balanced"
}
```

Alternative inputs (all merged intelligently):
- `referenceImage`, `referenceImage2`, `referenceImage3`
- `imageUrl` (legacy)

### 3.3 Variation Generation

**Endpoint:** `POST /api/composite-studio/variation`

```json
{
  "prompt": "Original prompt",
  "references": [...],
  "variationType": "reweight",
  "newWeights": [70, 20, 10],
  "blendMode": "creative"
}
```

**Variation Types:**
- `reweight` - Apply new weights (requires `newWeights`)
- `balance` - Equal weights for all references
- `random` - Randomized weights
- `emphasize-first` - First reference gets 50%, rest distributed

### 3.4 Validate Weights

**Endpoint:** `POST /api/composite-studio/validate-weights`

```json
[
  { "url": "...", "weight": 50 },
  { "url": "...", "weight": 50 }
]
```

### 3.5 Cost Estimation

**Endpoint:** `GET /api/composite-studio/estimate-cost?referenceCount=3&generationType=image`

### 3.6 Blend Modes Info

**Endpoint:** `GET /api/composite-studio/blend-modes`

---

## 4. Prompts APIs (Composition, Polishing, Analysis)

### Base Path: `/api/prompts`

### 4.1 Compose Prompt

**Endpoint:** `POST /api/prompts/compose`

Build prompts from modular layer inputs:
```json
{
  "workflow": "character",
  "subject": {
    "description": "A fierce warrior princess"
  },
  "character": {
    "age": "young adult",
    "gender": "female",
    "expression": "determined",
    "hairStyle": "long braided",
    "hairColor": "silver",
    "build": "athletic",
    "pose": "battle stance",
    "clothing": "ornate armor",
    "accessories": ["sword", "crown"]
  },
  "environment": {
    "location": "ancient castle courtyard",
    "era": "medieval fantasy",
    "timeOfDay": "golden hour",
    "weather": "misty",
    "mood": "epic"
  },
  "style": {
    "medium": "digital painting",
    "genre": "fantasy art",
    "artMovement": "romanticism",
    "colorPalette": ["gold", "silver", "deep purple"],
    "detailLevel": "highly detailed",
    "qualityEnhancers": ["8k", "masterpiece", "trending on artstation"]
  },
  "camera": {
    "shotType": "medium",
    "angle": "low angle",
    "lens": "35mm",
    "depthOfField": "shallow"
  },
  "lighting": {
    "keyLight": "dramatic sunlight",
    "fillLight": "soft ambient",
    "rimLight": "golden backlight",
    "colorTemperature": "warm"
  },
  "usePolish": true,
  "polishLevel": "thorough",
  "generationType": "image"
}
```

**Workflows:**
- `character` - Character-focused prompts
- `environment` - Scene/background-focused
- `product` - Product photography style
- `animation` - Motion/video-focused
- `styletransfer` - Style transformation
- `freestyle` - General purpose

### 4.2 Analyze Subject Image

**Endpoint:** `POST /api/prompts/analyze-subject`

```json
{
  "imageUrl": "https://.../image.png",
  "analysisDepth": "detailed"
}
```

Returns structured attributes extracted from the image for prompt composition.

### 4.3 Generate Variations

**Endpoint:** `POST /api/prompts/variations`

```json
{
  "basePrompt": "A serene forest landscape",
  "variationType": "style",
  "count": 4,
  "intensity": "moderate"
}
```

**Variation Types:**
- `style` - Artistic style variations
- `mood` - Emotional atmosphere
- `lighting` - Lighting setup changes
- `composition` - Camera angle/framing
- `color` - Color palette variations
- `setting` - Environment/background

### 4.4 Polish Prompt

**Endpoint:** `POST /api/prompts/polish`

```json
{
  "prompt": "a cat sitting",
  "level": "thorough",
  "detailLevel": "detailed",
  "generationType": "image",
  "preserveSnippets": false
}
```

**Polish Levels:**
- `quick` - Essential improvements only (temp: 0.3)
- `standard` - Balanced improvements (temp: 0.5)
- `thorough` - Comprehensive enhancements (temp: 0.7)

**Detail Levels:**
- `concise` - Short output (up to 300 tokens)
- `medium` - Balanced output (300-600 tokens)
- `detailed` - Rich output (600+ tokens)

### 4.5 Quick/Thorough Polish Shortcuts

- `POST /api/prompts/polish/quick` - Fast polish
- `POST /api/prompts/polish/thorough` - Comprehensive polish

### 4.6 Info Endpoints

- `GET /api/prompts/workflows` - Available workflows
- `GET /api/prompts/variation-types` - Variation type options
- `GET /api/prompts/polish/options` - Polish configuration options

---

## 5. Integration Best Practices

### 5.1 Error Handling

All endpoints return consistent error format:
```json
{
  "success": false,
  "error": "Detailed error message"
}
```

HTTP Status Codes:
- `200` - Success
- `202` - Accepted (async processing)
- `400` - Bad Request (validation errors)
- `500` - Internal Server Error

### 5.2 Headers

Required headers for all requests:
```
Content-Type: application/json
X-User-Id: {userId}  // For user-specific operations
```

### 5.3 Rate Limiting Considerations

- Composite Studio: Max 10 references per request
- Audio: Character count limits apply for TTS
- Multi-Frame: Max 16 frames per request recommended

### 5.4 Asset Storage

All generated assets are stored in GCS with public URLs. URLs are permanent and can be cached.

### 5.5 Node Graph Integration

These APIs are designed to work with the canvas node graph system. Each endpoint can be mapped to a node type with the appropriate inputs/outputs.

**Example Node Configuration:**
```json
{
  "nodeType": "stackMultiverse",
  "category": "multiFrame",
  "inputs": {
    "prompt": { "type": "string", "required": true },
    "frameCount": { "type": "number", "default": 4 }
  },
  "outputs": {
    "frames": { "type": "array" },
    "compositeUrl": { "type": "string" }
  }
}
```

---

## 6. TypeScript Types (Reference)

```typescript
// Multi-Frame Types
interface StackRequest {
  prompt: string;
  negativePrompt?: string;
  frameCount?: number;
  model?: string;
  width?: number;
  height?: number;
  referenceImage?: string;
  seed?: number;
  outputOptions?: {
    createComposite?: boolean;
    compositeLayout?: 'vertical' | 'horizontal' | 'grid';
    gapWidth?: number;
  };
}

// Audio Types
interface VoiceoverRequest {
  text: string;
  voice?: string;
  model?: string;
  language?: string;
  stability?: number;
  similarityBoost?: number;
  style?: number;
  format?: string;
}

// Composite Studio Types
interface CompositeReference {
  url: string;
  weight: number;
  name?: string;
}

interface CompositeRequest {
  prompt?: string;
  references: CompositeReference[];
  blendMode?: 'strict' | 'balanced' | 'creative' | 'loose';
  model?: string;
  generationType?: 'image' | 'video';
  width?: number;
  height?: number;
}

// Prompt Types
interface ComposePromptRequest {
  workflow: 'character' | 'environment' | 'product' | 'animation' | 'styletransfer' | 'freestyle';
  subject?: { description: string };
  character?: CharacterLayer;
  environment?: EnvironmentLayer;
  style?: StyleLayer;
  camera?: CameraLayer;
  lighting?: LightingLayer;
  motion?: MotionLayer;
  usePolish?: boolean;
  polishLevel?: 'quick' | 'standard' | 'thorough';
  generationType?: 'image' | 'video' | 'audio';
}
```

---

## 7. Testing Endpoints

Use curl or Postman to test the endpoints:

```bash
# Test Stack Generation
curl -X POST http://localhost:5003/api/multiframe/stacks/multiverse \
  -H "Content-Type: application/json" \
  -H "X-User-Id: test-user" \
  -d '{"prompt": "A cyberpunk city", "frameCount": 4}'

# Test Voiceover
curl -X POST http://localhost:5003/api/audio/voiceover \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello world", "voice": "male-narrator"}'

# Test Prompt Polish
curl -X POST http://localhost:5003/api/prompts/polish/quick \
  -H "Content-Type: application/json" \
  -d '{"prompt": "a cat", "generationType": "image"}'
```

---

## 8. Changelog

- **2024-12-22**: Initial release with Multi-Frame, Audio, Composite Studio, and Prompts APIs
