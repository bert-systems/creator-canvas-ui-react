# Stock Images Node Strategy - Creative Canvas Studio

**Version:** 1.0
**Date:** December 15, 2025
**Status:** Strategic Planning

---

## Executive Summary

This document defines a comprehensive node-based workflow system for **Stock Image & Video Production** within Creative Canvas Studio. The system enables stock photographers, content creators, agencies, and businesses to generate high-volume, market-ready stock content through AI-powered production pipelines.

### Key Innovations

1. **Content Context System** - Every node understands market categories, keywords, and licensing
2. **Diversity-First Architecture** - Built-in representation across demographics, abilities, and cultures
3. **Dual Execution Pipeline** - Concept agents for ideation + Image/Video generators for production
4. **SEO Intelligence** - Automatic keyword generation and metadata optimization
5. **Batch Production Workflow** - High-volume, consistent content generation at scale

---

## Part 1: Stock Content Context Architecture

### 1.1 The StockContext Object

Every stock content node receives and propagates a **StockContext** object that accumulates market and production knowledge:

```typescript
interface StockContext {
  // === CONCEPT DATA ===
  concept: {
    id: string;
    title: string;
    description: string;
    category: StockCategory;
    subcategory: string;
    theme: string;
    mood: StockMood;
    style: StockStyle;
    targetMarket: TargetMarket[];
    useCase: UseCaseType[];
  };

  // === SUBJECT DATA ===
  subject: {
    type: 'people' | 'objects' | 'nature' | 'abstract' | 'places' | 'food' |
          'technology' | 'business' | 'lifestyle' | 'animals' | 'mixed';

    // For people subjects
    people?: {
      count: number;
      demographics: DemographicProfile[];
      relationship?: 'individual' | 'couple' | 'family' | 'friends' |
                     'coworkers' | 'strangers' | 'crowd';
      activity: string;
      emotion: string;
      interaction?: string;
    };

    // For objects/products
    objects?: ObjectData[];

    // For nature/landscapes
    environment?: EnvironmentData;
  };

  // === DIVERSITY & INCLUSION ===
  diversity: {
    enabled: boolean;
    ethnicities: EthnicityMix[];
    ageGroups: AgeGroup[];
    bodyTypes: BodyType[];
    abilities: AbilityRepresentation[];
    genderBalance: GenderDistribution;
    culturalElements: CulturalElement[];
  };

  // === PRODUCTION SETTINGS ===
  production: {
    aspectRatios: AspectRatio[];
    orientation: 'landscape' | 'portrait' | 'square' | 'all';
    resolution: 'web' | 'print' | 'both';

    lighting: LightingSetup;
    background: BackgroundType;
    composition: CompositionRule[];

    copySpace: CopySpaceRequirement;
    colorProfile: ColorProfile;

    shotType: ShotType;
    cameraAngle: CameraAngle;
    depthOfField: 'shallow' | 'medium' | 'deep' | 'variable';
  };

  // === SEO & METADATA ===
  seo: {
    primaryKeywords: string[];
    secondaryKeywords: string[];
    tags: string[];
    title: string;
    description: string;

    categories: StockCategory[];
    editorialCaption?: string;
    modelRelease: 'not-required' | 'ai-generated' | 'required';
    propertyRelease: 'not-required' | 'required';
  };

  // === LICENSING ===
  licensing: {
    type: 'royalty-free' | 'rights-managed' | 'editorial';
    exclusivity: 'non-exclusive' | 'exclusive';
    restrictions?: string[];
  };

  // === SEASONAL & TREND DATA ===
  timing: {
    season?: 'spring' | 'summer' | 'fall' | 'winter' | 'year-round';
    holiday?: HolidayType;
    trend?: TrendData;
    evergreen: boolean;
  };

  // === BATCH PRODUCTION ===
  batch: {
    variationCount: number;
    variationType: VariationType[];
    consistencyLevel: 'strict' | 'moderate' | 'loose';
  };

  // === GENERATED ASSETS ===
  assets: {
    images: GeneratedImage[];
    videos: GeneratedVideo[];
    collections: Collection[];
  };

  // === METADATA ===
  generationHistory: GenerationRecord[];
}

// Supporting Types
type StockCategory =
  | 'business' | 'lifestyle' | 'technology' | 'healthcare' | 'education'
  | 'food-drink' | 'travel' | 'nature' | 'sports-fitness' | 'family'
  | 'home-garden' | 'fashion-beauty' | 'animals' | 'transportation'
  | 'industry' | 'abstract' | 'backgrounds' | 'holidays' | 'religion'
  | 'science' | 'arts-entertainment' | 'editorial' | 'vintage-retro';

type StockMood =
  | 'happy' | 'professional' | 'calm' | 'energetic' | 'inspirational'
  | 'serious' | 'playful' | 'romantic' | 'dramatic' | 'peaceful'
  | 'exciting' | 'cozy' | 'minimal' | 'vibrant' | 'moody';

type StockStyle =
  | 'authentic' | 'lifestyle' | 'editorial' | 'commercial' | 'candid'
  | 'posed' | 'conceptual' | 'documentary' | 'artistic' | 'minimalist'
  | 'maximalist' | 'vintage' | 'modern' | 'corporate';

interface DemographicProfile {
  id: string;
  ethnicity: string;
  age: AgeGroup;
  gender: 'male' | 'female' | 'non-binary';
  bodyType?: BodyType;
  ability?: AbilityRepresentation;
  profession?: string;
  style?: string;
}

type AgeGroup = 'infant' | 'toddler' | 'child' | 'teen' | 'young-adult' |
                'adult' | 'middle-aged' | 'senior' | 'elderly';

type BodyType = 'slim' | 'average' | 'athletic' | 'curvy' | 'plus-size' | 'varied';

interface AbilityRepresentation {
  type: 'visible-disability' | 'mobility-aid' | 'hearing-aid' | 'visual-aid' |
        'prosthetic' | 'wheelchair' | 'neurodivergent-coding' | 'none';
  visible: boolean;
  naturalIntegration: boolean;
}

interface CopySpaceRequirement {
  required: boolean;
  position: 'left' | 'right' | 'top' | 'bottom' | 'center' | 'any';
  percentage: number;  // % of image that should be copy space
  clean: boolean;      // No elements in copy space
}

type AspectRatio = '1:1' | '4:3' | '3:2' | '16:9' | '9:16' | '4:5' | '2:3' | '21:9';

type VariationType = 'model-swap' | 'color-grade' | 'crop' | 'lighting' |
                     'background' | 'expression' | 'composition' | 'seasonal';

interface GeneratedImage {
  id: string;
  url: string;
  thumbnailUrl: string;
  aspectRatio: AspectRatio;
  resolution: { width: number; height: number };
  metadata: ImageMetadata;
  variations?: string[];  // URLs of variations
}

interface ImageMetadata {
  title: string;
  description: string;
  keywords: string[];
  categories: StockCategory[];
  editorialCaption?: string;
  technicalData: {
    generationModel: string;
    promptUsed: string;
    seed?: number;
  };
}
```

### 1.2 Context Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           STOCK CONTENT CONTEXT FLOW                                  │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                       │
│  ┌──────────────────┐                                                                │
│  │ ConceptGenerator │──┬── concept data ────────────────────────────────────────▶   │
│  │                  │  │                                                              │
│  │  IN: idea/brief  │  ├── subject data ──────▶ SubjectComposer ────────────────▶   │
│  │  IN: category    │  │                                                              │
│  │                  │  ├── seo data ──────────▶ KeywordOptimizer ───────────────▶   │
│  │ OUT: StockContext│  │                                                              │
│  └──────────────────┘  └── context ───────────▶ [ALL DOWNSTREAM NODES]              │
│                                                                                       │
│  ┌──────────────────┐                                                                │
│  │ DiversityCaster  │──┬── demographic mix ─────────────────────────────────────▶   │
│  │                  │  │                                                              │
│  │  IN: requirements│  ├── model profiles ───▶ BatchProducer ───────────────────▶   │
│  │  IN: balance     │  │                                                              │
│  │                  │  └── cultural elements ─▶ LifestyleVariator ──────────────▶   │
│  │ OUT: DiversityCtx│                                                                │
│  └──────────────────┘                                                                │
│                                                                                       │
│  PRODUCTION PIPELINE:                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │ Concept → Keywords → Subject → Diversity → Generation → Variations → Export │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                       │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Part 2: Dual Execution Architecture

### 2.1 Node Execution Pipeline

Each stock content node executes a multi-phase pipeline:

```typescript
interface StockNodeExecution {
  // Phase 1: Concept Analysis & Market Research (LLM)
  conceptAgents: ConceptAgentCall[];

  // Phase 2: SEO & Keyword Optimization (LLM)
  seoAgents?: SEOAgentCall[];

  // Phase 3: Subject & Composition Planning (LLM)
  compositionPlanning?: CompositionPlanCall[];

  // Phase 4: Image Generation (Batch)
  imageGeneration?: ImageGenCall[];

  // Phase 5: Video Generation (Optional)
  videoGeneration?: VideoGenCall[];

  // Phase 6: Variation Generation
  variationGeneration?: VariationCall[];

  // Phase 7: Metadata & Export
  metadataGeneration: MetadataCall;

  // Phase 8: Context Update
  contextMutation: ContextUpdate;
}

interface ConceptAgentCall {
  agentType: 'trend-analyst' | 'market-researcher' | 'concept-developer' |
             'diversity-consultant' | 'seo-specialist' | 'composition-expert';
  endpoint: string;
  payload: Record<string, unknown>;
  outputMapping: OutputMapping;
}

interface ImageGenCall {
  model: 'flux-2-pro' | 'flux-kontext';
  batchSize: number;
  variations: VariationType[];
  style: {
    photorealism: number;
    stockPhotoStyle: number;
    commercialAppeal: number;
  };
  copySpaceAware: boolean;
  outputTarget: string;
}

interface VariationCall {
  type: VariationType;
  sourceImage: string;
  count: number;
  parameters: Record<string, unknown>;
}
```

### 2.2 Execution Example: LifestyleSceneGenerator Pipeline

```typescript
const lifestyleSceneGeneratorPipeline: StockNodeExecution = {
  // 1. Analyze concept and generate scene description
  conceptAgents: [
    {
      agentType: 'concept-developer',
      endpoint: '/api/agent/stock/develop-concept',
      payload: {
        scenario: '${parameters.scenario}',
        category: '${parameters.category}',
        targetMarket: '${parameters.targetMarket}',
        mood: '${parameters.mood}',
        season: '${parameters.season}',
      },
      outputMapping: {
        'response.sceneDescription' -> 'internal.sceneDescription',
        'response.subjectDetails' -> 'internal.subjects',
        'response.compositionGuide' -> 'internal.composition',
      }
    }
  ],

  // 2. Generate optimized keywords
  seoAgents: [
    {
      agentType: 'seo-specialist',
      endpoint: '/api/agent/stock/generate-keywords',
      payload: {
        concept: '${internal.sceneDescription}',
        category: '${parameters.category}',
        competitorAnalysis: '${parameters.analyzeCompetitors}',
      },
      outputMapping: {
        'response.primaryKeywords' -> 'outputs.primaryKeywords',
        'response.secondaryKeywords' -> 'outputs.secondaryKeywords',
        'response.tags' -> 'outputs.tags',
      }
    }
  ],

  // 3. Generate diverse variations
  imageGeneration: [
    {
      model: 'flux-2-pro',
      batchSize: '${parameters.batchSize}',
      style: {
        photorealism: 0.95,
        stockPhotoStyle: 0.9,
        commercialAppeal: 0.85,
      },
      copySpaceAware: '${parameters.includeCopySpace}',
      variations: ['model-swap', 'lighting'],
      outputTarget: 'outputs.generatedImages',
    }
  ],

  // 4. Generate aspect ratio variations
  variationGeneration: [
    {
      type: 'crop',
      sourceImage: '${outputs.generatedImages[0]}',
      count: 3,
      parameters: {
        aspectRatios: ['16:9', '1:1', '9:16'],
        smartCrop: true,
      }
    }
  ],

  // 5. Generate metadata
  metadataGeneration: {
    endpoint: '/api/agent/stock/generate-metadata',
    payload: {
      images: '${outputs.generatedImages}',
      keywords: '${outputs.primaryKeywords}',
      concept: '${internal.sceneDescription}',
    }
  },

  // 6. Update context
  contextMutation: {
    set: {
      'context.concept': '${internal.sceneDescription}',
      'context.seo.primaryKeywords': '${outputs.primaryKeywords}',
      'context.seo.tags': '${outputs.tags}',
    },
    append: {
      'context.assets.images': '${outputs.generatedImages}',
    }
  }
};
```

---

## Part 3: Complete Port Type Ecosystem

### 3.1 Stock Content Port Types

```typescript
export type StockPortType =
  // === CONTEXT PORTS ===
  | 'stockContext'       // Full accumulated StockContext
  | 'concept'            // Concept data
  | 'subject'            // Subject configuration
  | 'diversity'          // Diversity settings

  // === CONTENT PORTS ===
  | 'stockImage'         // Generated stock image
  | 'stockVideo'         // Generated stock video
  | 'collection'         // Image collection
  | 'batch'              // Batch of images

  // === SUBJECT PORTS ===
  | 'person'             // Person/model data
  | 'peopleGroup'        // Group configuration
  | 'object'             // Product/object data
  | 'environment'        // Location/setting
  | 'activity'           // Action/activity

  // === SEO PORTS ===
  | 'keywords'           // Keyword set
  | 'metadata'           // Full metadata
  | 'tags'               // Tag list
  | 'title'              // Title text
  | 'description'        // Description text

  // === PRODUCTION PORTS ===
  | 'composition'        // Composition rules
  | 'lighting'           // Lighting setup
  | 'background'         // Background type
  | 'copySpace'          // Copy space config
  | 'colorProfile'       // Color grading

  // === VARIATION PORTS ===
  | 'aspectVariations'   // Aspect ratio set
  | 'demographicSet'     // Demographic variations
  | 'seasonalSet'        // Seasonal variations
  | 'colorVariations'    // Color grade variations

  // === TREND PORTS ===
  | 'trendData'          // Trend analysis
  | 'competitorData'     // Competitor analysis
  | 'gapAnalysis'        // Market gap data

  // === EXPORT PORTS ===
  | 'exportPackage'      // Ready-to-submit package
  | 'csvMetadata'        // CSV metadata file
  | 'submissionReady'    // Platform-ready assets

  // === PRIMITIVE PORTS ===
  | 'image'              // Generic image
  | 'video'              // Generic video
  | 'text'               // Text content
  | 'prompt'             // Generation prompt
  | 'any';               // Universal connector
```

### 3.2 Port Compatibility Matrix

```
FROM ↓ / TO →        │concept│ image │keywords│ batch │ export │diversity│
─────────────────────┼───────┼───────┼────────┼───────┼────────┼─────────┤
stockContext         │   ✓   │   ✓   │   ✓    │   ✓   │   ✓    │    ✓    │
concept              │   ✓   │   ✓   │   ✓    │   ✓   │   -    │    -    │
subject              │   -   │   ✓   │   ✓    │   ✓   │   -    │    ✓    │
diversity            │   -   │   ✓   │   -    │   ✓   │   -    │    ✓    │
keywords             │   ✓   │   -   │   ✓    │   -   │   ✓    │    -    │
stockImage           │   -   │   ✓   │   -    │   ✓   │   ✓    │    -    │
trendData            │   ✓   │   ✓   │   ✓    │   ✓   │   -    │    -    │
composition          │   -   │   ✓   │   -    │   ✓   │   -    │    -    │
```

---

## Part 4: Complete Node Definitions

### 4.1 CONCEPT & IDEATION NODES

#### ConceptGenerator Node

```typescript
{
  type: 'conceptGenerator',
  category: 'stock',
  label: 'Concept Generator',
  displayName: 'Generate Stock Concepts',
  description: 'Generate market-ready stock photography concepts with SEO optimization',

  inputs: [
    { id: 'brief', name: 'Creative Brief', type: 'text' },
    { id: 'referenceImages', name: 'Reference Images', type: 'image', multiple: true },
    { id: 'trendData', name: 'Trend Data', type: 'trendData' },
    { id: 'existingConcept', name: 'Expand Concept', type: 'concept' },
  ],

  outputs: [
    { id: 'context', name: 'Stock Context', type: 'stockContext' },
    { id: 'concept', name: 'Concept Data', type: 'concept' },
    { id: 'keywords', name: 'Keywords', type: 'keywords' },
    { id: 'conceptVisual', name: 'Concept Visual', type: 'image' },
    { id: 'variations', name: 'Concept Variations', type: 'concept', multiple: true },
    { id: 'marketAnalysis', name: 'Market Analysis', type: 'text' },
  ],

  execution: {
    conceptAgents: [
      {
        agentType: 'concept-developer',
        endpoint: '/api/agent/stock/generate-concept',
        payload: {
          brief: '${inputs.brief}',
          category: '${parameters.category}',
          targetMarket: '${parameters.targetMarket}',
          mood: '${parameters.mood}',
          style: '${parameters.style}',
        }
      }
    ],
    seoAgents: [
      {
        agentType: 'seo-specialist',
        endpoint: '/api/agent/stock/keyword-research',
        payload: {
          concept: '${internal.concept}',
          category: '${parameters.category}',
        }
      }
    ],
    imageGeneration: [
      {
        condition: '${parameters.generatePreview}',
        model: 'flux-2-pro',
        type: 'concept-preview',
        outputTarget: 'conceptVisual',
      }
    ]
  },

  parameters: [
    { id: 'category', name: 'Category', type: 'select', default: 'lifestyle',
      options: [
        { label: 'Business & Finance', value: 'business' },
        { label: 'Lifestyle', value: 'lifestyle' },
        { label: 'Technology', value: 'technology' },
        { label: 'Healthcare & Wellness', value: 'healthcare' },
        { label: 'Education', value: 'education' },
        { label: 'Food & Drink', value: 'food-drink' },
        { label: 'Travel & Tourism', value: 'travel' },
        { label: 'Nature & Environment', value: 'nature' },
        { label: 'Sports & Fitness', value: 'sports-fitness' },
        { label: 'Family & Relationships', value: 'family' },
        { label: 'Home & Garden', value: 'home-garden' },
        { label: 'Fashion & Beauty', value: 'fashion-beauty' },
        { label: 'Animals & Pets', value: 'animals' },
        { label: 'Abstract & Backgrounds', value: 'abstract' },
        { label: 'Holidays & Celebrations', value: 'holidays' },
        { label: 'Science & Research', value: 'science' },
      ]
    },
    { id: 'targetMarket', name: 'Target Market', type: 'select', default: 'commercial',
      options: [
        { label: 'Commercial/Advertising', value: 'commercial' },
        { label: 'Editorial/News', value: 'editorial' },
        { label: 'Social Media', value: 'social' },
        { label: 'Corporate/Business', value: 'corporate' },
        { label: 'E-commerce', value: 'ecommerce' },
        { label: 'Healthcare/Medical', value: 'medical' },
        { label: 'Education', value: 'education' },
      ]
    },
    { id: 'mood', name: 'Mood', type: 'select', default: 'professional' },
    { id: 'style', name: 'Style', type: 'select', default: 'authentic' },
    { id: 'generateVariations', name: 'Concept Variations', type: 'number', default: 5 },
    { id: 'generatePreview', name: 'Generate Preview', type: 'boolean', default: true },
  ],
}
```

#### TrendSpotter Node

```typescript
{
  type: 'trendSpotter',
  category: 'stock',
  label: 'Trend Spotter',
  displayName: 'Analyze Stock Trends',

  inputs: [
    { id: 'category', name: 'Category Focus', type: 'text' },
    { id: 'existingPortfolio', name: 'Your Portfolio', type: 'stockImage', multiple: true },
  ],

  outputs: [
    { id: 'trendData', name: 'Trend Analysis', type: 'trendData' },
    { id: 'risingTrends', name: 'Rising Trends', type: 'text' },
    { id: 'decayingTrends', name: 'Declining Trends', type: 'text' },
    { id: 'gapOpportunities', name: 'Market Gaps', type: 'text' },
    { id: 'seasonalOpportunities', name: 'Seasonal Opportunities', type: 'text' },
    { id: 'suggestedConcepts', name: 'Concept Suggestions', type: 'concept', multiple: true },
  ],

  parameters: [
    { id: 'timeframe', name: 'Analysis Timeframe', type: 'select', default: '3-months',
      options: [
        { label: 'Last Month', value: '1-month' },
        { label: 'Last 3 Months', value: '3-months' },
        { label: 'Last 6 Months', value: '6-months' },
        { label: 'Last Year', value: '12-months' },
      ]
    },
    { id: 'platforms', name: 'Stock Platforms', type: 'select', default: 'all',
      options: [
        { label: 'All Major Platforms', value: 'all' },
        { label: 'Shutterstock', value: 'shutterstock' },
        { label: 'Adobe Stock', value: 'adobe' },
        { label: 'Getty/iStock', value: 'getty' },
        { label: 'Unsplash/Pexels', value: 'free' },
      ]
    },
    { id: 'includeSeasonal', name: 'Include Seasonal Analysis', type: 'boolean', default: true },
    { id: 'includeGapAnalysis', name: 'Include Gap Analysis', type: 'boolean', default: true },
  ],
}
```

#### KeywordOptimizer Node

```typescript
{
  type: 'keywordOptimizer',
  category: 'stock',
  label: 'Keyword Optimizer',
  displayName: 'Optimize SEO Keywords',

  inputs: [
    { id: 'context', name: 'Stock Context', type: 'stockContext' },
    { id: 'concept', name: 'Concept', type: 'concept' },
    { id: 'image', name: 'Generated Image', type: 'stockImage' },
    { id: 'existingKeywords', name: 'Existing Keywords', type: 'keywords' },
  ],

  outputs: [
    { id: 'keywords', name: 'Optimized Keywords', type: 'keywords' },
    { id: 'title', name: 'SEO Title', type: 'title' },
    { id: 'description', name: 'SEO Description', type: 'description' },
    { id: 'tags', name: 'Tags', type: 'tags' },
    { id: 'categories', name: 'Categories', type: 'text' },
    { id: 'alternativeTitles', name: 'Alternative Titles', type: 'text', multiple: true },
  ],

  execution: {
    seoAgents: [
      {
        agentType: 'seo-specialist',
        endpoint: '/api/agent/stock/optimize-keywords',
        payload: {
          concept: '${inputs.concept}',
          image: '${inputs.image}',
          platform: '${parameters.platform}',
          maxKeywords: '${parameters.keywordCount}',
        }
      }
    ]
  },

  parameters: [
    { id: 'platform', name: 'Target Platform', type: 'select', default: 'universal',
      options: [
        { label: 'Universal (All Platforms)', value: 'universal' },
        { label: 'Shutterstock Optimized', value: 'shutterstock' },
        { label: 'Adobe Stock Optimized', value: 'adobe' },
        { label: 'Getty/iStock Optimized', value: 'getty' },
      ]
    },
    { id: 'keywordCount', name: 'Max Keywords', type: 'select', default: '50',
      options: [
        { label: '25 Keywords', value: '25' },
        { label: '50 Keywords (Recommended)', value: '50' },
        { label: '75 Keywords', value: '75' },
      ]
    },
    { id: 'includeVariations', name: 'Include Keyword Variations', type: 'boolean', default: true },
    { id: 'analyzeCompetitors', name: 'Analyze Top Performers', type: 'boolean', default: true },
  ],
}
```

### 4.2 DIVERSITY & REPRESENTATION NODES

#### DiversityCaster Node

```typescript
{
  type: 'diversityCaster',
  category: 'stock',
  label: 'Diversity Caster',
  displayName: 'Cast Diverse Models',

  inputs: [
    { id: 'context', name: 'Stock Context', type: 'stockContext' },
    { id: 'concept', name: 'Concept', type: 'concept' },
    { id: 'peopleCount', name: 'Number of People', type: 'text' },
  ],

  outputs: [
    { id: 'diversity', name: 'Diversity Config', type: 'diversity' },
    { id: 'demographicMix', name: 'Demographic Mix', type: 'demographicSet' },
    { id: 'castSheet', name: 'Cast Sheet Visual', type: 'image' },
    { id: 'profiles', name: 'Individual Profiles', type: 'person', multiple: true },
  ],

  execution: {
    conceptAgents: [
      {
        agentType: 'diversity-consultant',
        endpoint: '/api/agent/stock/plan-diversity',
        payload: {
          concept: '${inputs.concept}',
          peopleCount: '${inputs.peopleCount}',
          diversityGoals: '${parameters.diversityLevel}',
          abilityInclusion: '${parameters.includeAbilities}',
        }
      }
    ],
    imageGeneration: [
      {
        model: 'flux-2-pro',
        type: 'cast-sheet',
        outputTarget: 'castSheet',
      }
    ]
  },

  parameters: [
    { id: 'diversityLevel', name: 'Diversity Level', type: 'select', default: 'balanced',
      options: [
        { label: 'Minimal (Some variety)', value: 'minimal' },
        { label: 'Balanced (Recommended)', value: 'balanced' },
        { label: 'High (Maximum representation)', value: 'high' },
        { label: 'Custom', value: 'custom' },
      ]
    },
    { id: 'ethnicities', name: 'Ethnic Representation', type: 'select', default: 'global',
      options: [
        { label: 'Global Mix', value: 'global' },
        { label: 'North American', value: 'north-american' },
        { label: 'European', value: 'european' },
        { label: 'Asian', value: 'asian' },
        { label: 'African', value: 'african' },
        { label: 'Latin American', value: 'latin' },
        { label: 'Middle Eastern', value: 'middle-eastern' },
        { label: 'Custom Mix', value: 'custom' },
      ]
    },
    { id: 'ageGroups', name: 'Age Groups', type: 'select', default: 'adult-range',
      options: [
        { label: 'Young Adults (18-35)', value: 'young-adult' },
        { label: 'Adult Range (25-55)', value: 'adult-range' },
        { label: 'Multi-Generational', value: 'multi-gen' },
        { label: 'Senior Focus (55+)', value: 'senior' },
        { label: 'Family Mix', value: 'family' },
      ]
    },
    { id: 'bodyTypes', name: 'Body Type Diversity', type: 'select', default: 'varied',
      options: [
        { label: 'Varied (All types)', value: 'varied' },
        { label: 'Athletic Focus', value: 'athletic' },
        { label: 'Plus-Size Inclusive', value: 'plus-inclusive' },
      ]
    },
    { id: 'includeAbilities', name: 'Include Disability Representation', type: 'boolean', default: true },
    { id: 'genderBalance', name: 'Gender Balance', type: 'select', default: 'balanced' },
  ],
}
```

#### LifestyleVariator Node

```typescript
{
  type: 'lifestyleVariator',
  category: 'stock',
  label: 'Lifestyle Variator',
  displayName: 'Create Lifestyle Variations',

  inputs: [
    { id: 'context', name: 'Stock Context', type: 'stockContext' },
    { id: 'baseImage', name: 'Base Image', type: 'stockImage', required: true },
    { id: 'diversity', name: 'Diversity Config', type: 'diversity' },
  ],

  outputs: [
    { id: 'variations', name: 'Lifestyle Variations', type: 'stockImage', multiple: true },
    { id: 'demographicSet', name: 'Demographic Set', type: 'batch' },
    { id: 'ageVariations', name: 'Age Variations', type: 'batch' },
    { id: 'settingVariations', name: 'Setting Variations', type: 'batch' },
  ],

  parameters: [
    { id: 'variationType', name: 'Variation Types', type: 'select', default: 'comprehensive',
      options: [
        { label: 'Demographic Only', value: 'demographic' },
        { label: 'Setting Only', value: 'setting' },
        { label: 'Comprehensive', value: 'comprehensive' },
      ]
    },
    { id: 'demographicVariations', name: 'Demographic Variations', type: 'number', default: 5 },
    { id: 'settingVariations', name: 'Setting Variations', type: 'number', default: 3 },
    { id: 'maintainComposition', name: 'Maintain Composition', type: 'boolean', default: true },
  ],
}
```

### 4.3 SCENE & SUBJECT NODES

#### BusinessSceneCreator Node

```typescript
{
  type: 'businessSceneCreator',
  category: 'stock',
  label: 'Business Scene Creator',
  displayName: 'Create Business Imagery',

  inputs: [
    { id: 'context', name: 'Stock Context', type: 'stockContext' },
    { id: 'concept', name: 'Business Concept', type: 'concept' },
    { id: 'diversity', name: 'Diversity Config', type: 'diversity' },
  ],

  outputs: [
    { id: 'images', name: 'Business Images', type: 'stockImage', multiple: true },
    { id: 'keywords', name: 'Keywords', type: 'keywords' },
    { id: 'variations', name: 'Scene Variations', type: 'batch' },
  ],

  parameters: [
    { id: 'scenario', name: 'Business Scenario', type: 'select', default: 'meeting',
      options: [
        { label: 'Meeting/Conference', value: 'meeting' },
        { label: 'Office Work', value: 'office' },
        { label: 'Remote Work', value: 'remote' },
        { label: 'Team Collaboration', value: 'collaboration' },
        { label: 'Presentation', value: 'presentation' },
        { label: 'Interview/Hiring', value: 'interview' },
        { label: 'Startup/Entrepreneurship', value: 'startup' },
        { label: 'Success/Achievement', value: 'success' },
        { label: 'Leadership', value: 'leadership' },
        { label: 'Customer Service', value: 'customer-service' },
      ]
    },
    { id: 'setting', name: 'Setting', type: 'select', default: 'modern-office',
      options: [
        { label: 'Modern Office', value: 'modern-office' },
        { label: 'Creative Space', value: 'creative' },
        { label: 'Corporate Boardroom', value: 'boardroom' },
        { label: 'Co-Working Space', value: 'coworking' },
        { label: 'Home Office', value: 'home' },
        { label: 'Outdoor/Rooftop', value: 'outdoor' },
        { label: 'Coffee Shop', value: 'cafe' },
      ]
    },
    { id: 'peopleCount', name: 'Number of People', type: 'select', default: '2-3',
      options: [
        { label: 'Individual', value: '1' },
        { label: 'Pair', value: '2' },
        { label: 'Small Group (2-3)', value: '2-3' },
        { label: 'Team (4-6)', value: '4-6' },
        { label: 'Large Group (7+)', value: '7+' },
      ]
    },
    { id: 'includeTechnology', name: 'Include Technology', type: 'boolean', default: true },
    { id: 'copySpace', name: 'Include Copy Space', type: 'boolean', default: true },
    { id: 'batchSize', name: 'Images to Generate', type: 'number', default: 6 },
  ],
}
```

#### AbstractConceptualizer Node

```typescript
{
  type: 'abstractConceptualizer',
  category: 'stock',
  label: 'Abstract Conceptualizer',
  displayName: 'Create Conceptual Images',

  inputs: [
    { id: 'context', name: 'Stock Context', type: 'stockContext' },
    { id: 'concept', name: 'Abstract Concept', type: 'text', required: true },
    { id: 'colorScheme', name: 'Color Scheme', type: 'colorProfile' },
  ],

  outputs: [
    { id: 'images', name: 'Abstract Images', type: 'stockImage', multiple: true },
    { id: 'backgrounds', name: 'Background Variations', type: 'batch' },
    { id: 'seamless', name: 'Seamless Patterns', type: 'image', multiple: true },
    { id: 'keywords', name: 'Keywords', type: 'keywords' },
  ],

  parameters: [
    { id: 'conceptType', name: 'Concept Type', type: 'select', default: 'metaphor',
      options: [
        { label: 'Metaphor/Symbol', value: 'metaphor' },
        { label: 'Geometric', value: 'geometric' },
        { label: 'Organic/Natural', value: 'organic' },
        { label: 'Technology/Digital', value: 'technology' },
        { label: 'Motion/Energy', value: 'motion' },
        { label: 'Texture/Pattern', value: 'texture' },
        { label: 'Light/Gradient', value: 'light' },
        { label: 'Data Visualization', value: 'data' },
      ]
    },
    { id: 'colorStyle', name: 'Color Style', type: 'select', default: 'vibrant',
      options: [
        { label: 'Vibrant', value: 'vibrant' },
        { label: 'Muted/Pastel', value: 'muted' },
        { label: 'Monochromatic', value: 'mono' },
        { label: 'Gradient', value: 'gradient' },
        { label: 'Dark/Moody', value: 'dark' },
        { label: 'Light/Airy', value: 'light' },
      ]
    },
    { id: 'copySpaceFriendly', name: 'Text Overlay Friendly', type: 'boolean', default: true },
    { id: 'generateSeamless', name: 'Generate Seamless Versions', type: 'boolean', default: true },
    { id: 'batchSize', name: 'Images to Generate', type: 'number', default: 8 },
  ],
}
```

#### FoodDrinkCreator Node

```typescript
{
  type: 'foodDrinkCreator',
  category: 'stock',
  label: 'Food & Drink Creator',
  displayName: 'Create Food Photography',

  inputs: [
    { id: 'context', name: 'Stock Context', type: 'stockContext' },
    { id: 'concept', name: 'Food Concept', type: 'concept' },
    { id: 'styling', name: 'Food Styling Reference', type: 'image' },
  ],

  outputs: [
    { id: 'images', name: 'Food Images', type: 'stockImage', multiple: true },
    { id: 'overheadShot', name: 'Overhead Shot', type: 'image' },
    { id: 'angleShots', name: 'Angle Variations', type: 'batch' },
    { id: 'lifestyleShots', name: 'Lifestyle Shots', type: 'batch' },
    { id: 'keywords', name: 'Keywords', type: 'keywords' },
  ],

  parameters: [
    { id: 'foodType', name: 'Food Type', type: 'select', default: 'prepared-meal',
      options: [
        { label: 'Prepared Meal', value: 'prepared-meal' },
        { label: 'Ingredients', value: 'ingredients' },
        { label: 'Desserts/Sweets', value: 'desserts' },
        { label: 'Beverages', value: 'beverages' },
        { label: 'Breakfast', value: 'breakfast' },
        { label: 'Healthy/Diet', value: 'healthy' },
        { label: 'Fast Food', value: 'fast-food' },
        { label: 'Cocktails/Alcohol', value: 'cocktails' },
        { label: 'Coffee/Tea', value: 'coffee' },
      ]
    },
    { id: 'style', name: 'Photography Style', type: 'select', default: 'editorial',
      options: [
        { label: 'Editorial/Magazine', value: 'editorial' },
        { label: 'Commercial/Product', value: 'commercial' },
        { label: 'Rustic/Authentic', value: 'rustic' },
        { label: 'Modern/Minimal', value: 'modern' },
        { label: 'Lifestyle/Restaurant', value: 'lifestyle' },
        { label: 'Dark/Moody', value: 'dark' },
      ]
    },
    { id: 'shot', name: 'Shot Type', type: 'select', default: 'overhead',
      options: [
        { label: 'Overhead/Flat Lay', value: 'overhead' },
        { label: '45-Degree Angle', value: '45-degree' },
        { label: 'Side/Eye Level', value: 'side' },
        { label: 'Close-Up/Detail', value: 'close-up' },
        { label: 'All Angles', value: 'all' },
      ]
    },
    { id: 'includeHands', name: 'Include Hands/Action', type: 'boolean', default: false },
    { id: 'batchSize', name: 'Images to Generate', type: 'number', default: 6 },
  ],
}
```

### 4.4 PRODUCTION & BATCH NODES

#### BatchProducer Node

```typescript
{
  type: 'batchProducer',
  category: 'stock',
  label: 'Batch Producer',
  displayName: 'Batch Generate Images',

  inputs: [
    { id: 'context', name: 'Stock Context', type: 'stockContext' },
    { id: 'concepts', name: 'Concepts', type: 'concept', multiple: true },
    { id: 'diversity', name: 'Diversity Config', type: 'diversity' },
    { id: 'composition', name: 'Composition Rules', type: 'composition' },
  ],

  outputs: [
    { id: 'batch', name: 'Generated Batch', type: 'batch' },
    { id: 'images', name: 'Individual Images', type: 'stockImage', multiple: true },
    { id: 'metadata', name: 'Batch Metadata', type: 'metadata' },
    { id: 'report', name: 'Production Report', type: 'text' },
  ],

  execution: {
    imageGeneration: [
      {
        model: 'flux-2-pro',
        batchMode: true,
        batchSize: '${parameters.batchSize}',
        parallelExecution: true,
        style: {
          photorealism: 0.95,
          stockPhotoStyle: 0.9,
          commercialAppeal: 0.85,
        },
        copySpaceAware: '${parameters.copySpace}',
      }
    ]
  },

  parameters: [
    { id: 'batchSize', name: 'Batch Size', type: 'select', default: '10',
      options: [
        { label: '5 Images', value: '5' },
        { label: '10 Images', value: '10' },
        { label: '25 Images', value: '25' },
        { label: '50 Images', value: '50' },
        { label: '100 Images', value: '100' },
      ]
    },
    { id: 'consistency', name: 'Batch Consistency', type: 'select', default: 'moderate',
      options: [
        { label: 'Strict (Same style)', value: 'strict' },
        { label: 'Moderate (Similar)', value: 'moderate' },
        { label: 'Loose (Varied)', value: 'loose' },
      ]
    },
    { id: 'copySpace', name: 'Include Copy Space', type: 'boolean', default: true },
    { id: 'autoVariations', name: 'Auto-Generate Variations', type: 'boolean', default: true },
  ],
}
```

#### AspectAdapter Node

```typescript
{
  type: 'aspectAdapter',
  category: 'stock',
  label: 'Aspect Adapter',
  displayName: 'Create Aspect Ratio Variations',

  inputs: [
    { id: 'sourceImage', name: 'Source Image', type: 'stockImage', required: true },
    { id: 'metadata', name: 'Original Metadata', type: 'metadata' },
  ],

  outputs: [
    { id: 'variations', name: 'Aspect Variations', type: 'aspectVariations' },
    { id: 'landscape', name: 'Landscape (16:9)', type: 'image' },
    { id: 'square', name: 'Square (1:1)', type: 'image' },
    { id: 'portrait', name: 'Portrait (9:16)', type: 'image' },
    { id: 'social', name: 'Social Media Set', type: 'batch' },
    { id: 'print', name: 'Print Sizes', type: 'batch' },
  ],

  parameters: [
    { id: 'aspectRatios', name: 'Aspect Ratios', type: 'select', default: 'all-common',
      options: [
        { label: 'All Common Ratios', value: 'all-common' },
        { label: 'Social Media Set', value: 'social' },
        { label: 'Print Set', value: 'print' },
        { label: 'Web/Digital Set', value: 'web' },
        { label: 'Custom', value: 'custom' },
      ]
    },
    { id: 'cropMode', name: 'Crop Mode', type: 'select', default: 'smart',
      options: [
        { label: 'Smart Crop (AI)', value: 'smart' },
        { label: 'Center Crop', value: 'center' },
        { label: 'Rule of Thirds', value: 'thirds' },
        { label: 'Face-Aware', value: 'face-aware' },
      ]
    },
    { id: 'expandIfNeeded', name: 'Expand Canvas if Needed', type: 'boolean', default: true },
    { id: 'maintainCopySpace', name: 'Maintain Copy Space', type: 'boolean', default: true },
  ],
}
```

#### SeasonalGenerator Node

```typescript
{
  type: 'seasonalGenerator',
  category: 'stock',
  label: 'Seasonal Generator',
  displayName: 'Create Seasonal Content',

  inputs: [
    { id: 'context', name: 'Stock Context', type: 'stockContext' },
    { id: 'baseConcept', name: 'Base Concept', type: 'concept' },
    { id: 'baseImage', name: 'Base Image to Adapt', type: 'stockImage' },
  ],

  outputs: [
    { id: 'seasonalSet', name: 'Seasonal Set', type: 'seasonalSet' },
    { id: 'spring', name: 'Spring Version', type: 'stockImage' },
    { id: 'summer', name: 'Summer Version', type: 'stockImage' },
    { id: 'fall', name: 'Fall Version', type: 'stockImage' },
    { id: 'winter', name: 'Winter Version', type: 'stockImage' },
    { id: 'holidayVariations', name: 'Holiday Variations', type: 'batch' },
  ],

  parameters: [
    { id: 'seasons', name: 'Seasons to Generate', type: 'select', default: 'all',
      options: [
        { label: 'All Seasons', value: 'all' },
        { label: 'Spring/Summer', value: 'spring-summer' },
        { label: 'Fall/Winter', value: 'fall-winter' },
        { label: 'Custom Selection', value: 'custom' },
      ]
    },
    { id: 'includeHolidays', name: 'Include Holiday Variations', type: 'boolean', default: true },
    { id: 'holidays', name: 'Holidays', type: 'select', default: 'major',
      options: [
        { label: 'Major Holidays Only', value: 'major' },
        { label: 'All US Holidays', value: 'us-all' },
        { label: 'International Mix', value: 'international' },
        { label: 'Custom', value: 'custom' },
      ]
    },
    { id: 'adaptLighting', name: 'Adapt Lighting', type: 'boolean', default: true },
    { id: 'adaptColors', name: 'Adapt Color Palette', type: 'boolean', default: true },
  ],
}
```

### 4.5 QUALITY & COMPOSITION NODES

#### CompositionDirector Node

```typescript
{
  type: 'compositionDirector',
  category: 'stock',
  label: 'Composition Director',
  displayName: 'Direct Composition',

  inputs: [
    { id: 'context', name: 'Stock Context', type: 'stockContext' },
    { id: 'concept', name: 'Concept', type: 'concept' },
    { id: 'subject', name: 'Subject', type: 'subject' },
  ],

  outputs: [
    { id: 'composition', name: 'Composition Rules', type: 'composition' },
    { id: 'compositionGuide', name: 'Composition Guide', type: 'image' },
    { id: 'copySpaceOptions', name: 'Copy Space Options', type: 'image', multiple: true },
  ],

  parameters: [
    { id: 'rule', name: 'Primary Composition Rule', type: 'select', default: 'rule-of-thirds',
      options: [
        { label: 'Rule of Thirds', value: 'rule-of-thirds' },
        { label: 'Center Focus', value: 'center' },
        { label: 'Leading Lines', value: 'leading-lines' },
        { label: 'Symmetry', value: 'symmetry' },
        { label: 'Golden Ratio', value: 'golden-ratio' },
        { label: 'Negative Space', value: 'negative-space' },
        { label: 'Frame Within Frame', value: 'frame' },
      ]
    },
    { id: 'copySpace', name: 'Copy Space', type: 'select', default: 'optional',
      options: [
        { label: 'Not Required', value: 'none' },
        { label: 'Optional', value: 'optional' },
        { label: 'Required - Left', value: 'left' },
        { label: 'Required - Right', value: 'right' },
        { label: 'Required - Top', value: 'top' },
        { label: 'Required - Bottom', value: 'bottom' },
      ]
    },
    { id: 'copySpacePercent', name: 'Copy Space %', type: 'slider', default: 30, min: 0, max: 70 },
    { id: 'depthOfField', name: 'Depth of Field', type: 'select', default: 'medium' },
  ],
}
```

#### LightingMaster Node

```typescript
{
  type: 'lightingMaster',
  category: 'stock',
  label: 'Lighting Master',
  displayName: 'Set Professional Lighting',

  inputs: [
    { id: 'context', name: 'Stock Context', type: 'stockContext' },
    { id: 'subject', name: 'Subject Type', type: 'subject' },
    { id: 'mood', name: 'Target Mood', type: 'text' },
  ],

  outputs: [
    { id: 'lighting', name: 'Lighting Setup', type: 'lighting' },
    { id: 'lightingGuide', name: 'Lighting Guide', type: 'image' },
    { id: 'lightingVariations', name: 'Lighting Variations', type: 'batch' },
  ],

  parameters: [
    { id: 'style', name: 'Lighting Style', type: 'select', default: 'soft-natural',
      options: [
        { label: 'Soft Natural', value: 'soft-natural' },
        { label: 'Bright/High Key', value: 'high-key' },
        { label: 'Low Key/Dramatic', value: 'low-key' },
        { label: 'Rim Light', value: 'rim' },
        { label: 'Flat/Even', value: 'flat' },
        { label: 'Golden Hour', value: 'golden-hour' },
        { label: 'Blue Hour', value: 'blue-hour' },
        { label: 'Studio Strobe', value: 'studio' },
        { label: 'Window Light', value: 'window' },
      ]
    },
    { id: 'direction', name: 'Light Direction', type: 'select', default: 'front-45',
      options: [
        { label: 'Front (45°)', value: 'front-45' },
        { label: 'Side', value: 'side' },
        { label: 'Backlit', value: 'backlit' },
        { label: 'Top/Overhead', value: 'top' },
        { label: 'Multi-Point', value: 'multi' },
      ]
    },
    { id: 'warmth', name: 'Color Temperature', type: 'slider', default: 0.5, min: 0, max: 1 },
    { id: 'generateVariations', name: 'Generate Variations', type: 'boolean', default: true },
  ],
}
```

#### QualityChecker Node

```typescript
{
  type: 'qualityChecker',
  category: 'stock',
  label: 'Quality Checker',
  displayName: 'Check Image Quality',

  inputs: [
    { id: 'images', name: 'Images to Check', type: 'stockImage', multiple: true, required: true },
    { id: 'metadata', name: 'Metadata', type: 'metadata' },
  ],

  outputs: [
    { id: 'qualityReport', name: 'Quality Report', type: 'text' },
    { id: 'passedImages', name: 'Passed Images', type: 'batch' },
    { id: 'failedImages', name: 'Failed Images', type: 'batch' },
    { id: 'suggestions', name: 'Improvement Suggestions', type: 'text' },
  ],

  parameters: [
    { id: 'standards', name: 'Quality Standards', type: 'select', default: 'premium',
      options: [
        { label: 'Basic (Web Only)', value: 'basic' },
        { label: 'Standard', value: 'standard' },
        { label: 'Premium (Recommended)', value: 'premium' },
        { label: 'Microstock Specific', value: 'microstock' },
        { label: 'Editorial', value: 'editorial' },
      ]
    },
    { id: 'checkArtifacts', name: 'Check for AI Artifacts', type: 'boolean', default: true },
    { id: 'checkComposition', name: 'Check Composition', type: 'boolean', default: true },
    { id: 'checkSharpness', name: 'Check Sharpness', type: 'boolean', default: true },
    { id: 'checkNoise', name: 'Check Noise', type: 'boolean', default: true },
  ],
}
```

### 4.6 EXPORT & SUBMISSION NODES

#### MetadataGenerator Node

```typescript
{
  type: 'metadataGenerator',
  category: 'stock',
  label: 'Metadata Generator',
  displayName: 'Generate Metadata',

  inputs: [
    { id: 'context', name: 'Stock Context', type: 'stockContext' },
    { id: 'images', name: 'Images', type: 'stockImage', multiple: true, required: true },
    { id: 'keywords', name: 'Keywords', type: 'keywords' },
  ],

  outputs: [
    { id: 'metadata', name: 'Complete Metadata', type: 'metadata' },
    { id: 'csvFile', name: 'CSV Export', type: 'csvMetadata' },
    { id: 'jsonFile', name: 'JSON Export', type: 'text' },
    { id: 'editorialCaptions', name: 'Editorial Captions', type: 'text', multiple: true },
  ],

  parameters: [
    { id: 'platform', name: 'Target Platform', type: 'select', default: 'universal',
      options: [
        { label: 'Universal', value: 'universal' },
        { label: 'Shutterstock', value: 'shutterstock' },
        { label: 'Adobe Stock', value: 'adobe' },
        { label: 'Getty/iStock', value: 'getty' },
        { label: 'Alamy', value: 'alamy' },
      ]
    },
    { id: 'generateCaptions', name: 'Generate Editorial Captions', type: 'boolean', default: true },
    { id: 'language', name: 'Metadata Language', type: 'select', default: 'en',
      options: [
        { label: 'English', value: 'en' },
        { label: 'Multi-Language', value: 'multi' },
      ]
    },
  ],
}
```

#### SubmissionPreparer Node

```typescript
{
  type: 'submissionPreparer',
  category: 'stock',
  label: 'Submission Preparer',
  displayName: 'Prepare for Submission',

  inputs: [
    { id: 'images', name: 'Images', type: 'stockImage', multiple: true, required: true },
    { id: 'metadata', name: 'Metadata', type: 'metadata', required: true },
    { id: 'qualityReport', name: 'Quality Report', type: 'text' },
  ],

  outputs: [
    { id: 'exportPackage', name: 'Export Package', type: 'exportPackage' },
    { id: 'submissionReady', name: 'Submission-Ready Files', type: 'submissionReady' },
    { id: 'checklist', name: 'Submission Checklist', type: 'text' },
    { id: 'warnings', name: 'Potential Issues', type: 'text' },
  ],

  parameters: [
    { id: 'platform', name: 'Target Platform', type: 'select', default: 'shutterstock',
      options: [
        { label: 'Shutterstock', value: 'shutterstock' },
        { label: 'Adobe Stock', value: 'adobe' },
        { label: 'Getty Images', value: 'getty' },
        { label: 'iStock', value: 'istock' },
        { label: 'Alamy', value: 'alamy' },
        { label: 'Pond5 (Video)', value: 'pond5' },
        { label: 'Multiple Platforms', value: 'multi' },
      ]
    },
    { id: 'fileFormat', name: 'File Format', type: 'select', default: 'jpeg',
      options: [
        { label: 'JPEG (Standard)', value: 'jpeg' },
        { label: 'TIFF (Uncompressed)', value: 'tiff' },
        { label: 'Both', value: 'both' },
      ]
    },
    { id: 'resolution', name: 'Resolution', type: 'select', default: 'max',
      options: [
        { label: 'Maximum Available', value: 'max' },
        { label: '4K (4096px)', value: '4k' },
        { label: '8K+ (8192px)', value: '8k' },
      ]
    },
    { id: 'colorSpace', name: 'Color Space', type: 'select', default: 'srgb',
      options: [
        { label: 'sRGB (Web)', value: 'srgb' },
        { label: 'Adobe RGB', value: 'adobe-rgb' },
        { label: 'ProPhoto RGB', value: 'prophoto' },
      ]
    },
    { id: 'embedMetadata', name: 'Embed Metadata in Files', type: 'boolean', default: true },
  ],
}
```

#### CollectionCurator Node

```typescript
{
  type: 'collectionCurator',
  category: 'stock',
  label: 'Collection Curator',
  displayName: 'Create Image Collection',

  inputs: [
    { id: 'context', name: 'Stock Context', type: 'stockContext' },
    { id: 'images', name: 'Images', type: 'stockImage', multiple: true, required: true },
    { id: 'theme', name: 'Collection Theme', type: 'text' },
  ],

  outputs: [
    { id: 'collection', name: 'Curated Collection', type: 'collection' },
    { id: 'collectionPreview', name: 'Collection Preview', type: 'image' },
    { id: 'collectionMetadata', name: 'Collection Metadata', type: 'metadata' },
  ],

  parameters: [
    { id: 'collectionSize', name: 'Target Size', type: 'select', default: '10-20',
      options: [
        { label: 'Small (5-10)', value: '5-10' },
        { label: 'Medium (10-20)', value: '10-20' },
        { label: 'Large (20-50)', value: '20-50' },
        { label: 'Unlimited', value: 'unlimited' },
      ]
    },
    { id: 'coherence', name: 'Visual Coherence', type: 'select', default: 'high',
      options: [
        { label: 'High (Very Consistent)', value: 'high' },
        { label: 'Medium (Some Variety)', value: 'medium' },
        { label: 'Low (Diverse)', value: 'low' },
      ]
    },
    { id: 'includeVariations', name: 'Include Variations of Same Shot', type: 'boolean', default: true },
    { id: 'generatePreview', name: 'Generate Collection Preview', type: 'boolean', default: true },
  ],
}
```

### 4.7 VIDEO CONTENT NODES

#### StockVideoCreator Node

```typescript
{
  type: 'stockVideoCreator',
  category: 'stock',
  label: 'Stock Video Creator',
  displayName: 'Create Stock Video',

  inputs: [
    { id: 'context', name: 'Stock Context', type: 'stockContext' },
    { id: 'concept', name: 'Video Concept', type: 'concept', required: true },
    { id: 'referenceImage', name: 'Reference Image', type: 'stockImage' },
  ],

  outputs: [
    { id: 'video', name: 'Stock Video', type: 'stockVideo' },
    { id: 'thumbnail', name: 'Video Thumbnail', type: 'image' },
    { id: 'keywords', name: 'Video Keywords', type: 'keywords' },
    { id: 'metadata', name: 'Video Metadata', type: 'metadata' },
  ],

  parameters: [
    { id: 'duration', name: 'Duration', type: 'select', default: '10s',
      options: [
        { label: '5 seconds', value: '5s' },
        { label: '10 seconds', value: '10s' },
        { label: '15 seconds', value: '15s' },
        { label: '30 seconds', value: '30s' },
      ]
    },
    { id: 'motion', name: 'Motion Type', type: 'select', default: 'subtle',
      options: [
        { label: 'Subtle/Cinemagraph', value: 'subtle' },
        { label: 'Slow Motion', value: 'slow-mo' },
        { label: 'Normal Speed', value: 'normal' },
        { label: 'Time-Lapse', value: 'timelapse' },
        { label: 'Hyperlapse', value: 'hyperlapse' },
      ]
    },
    { id: 'camera', name: 'Camera Movement', type: 'select', default: 'static',
      options: [
        { label: 'Static', value: 'static' },
        { label: 'Slow Pan', value: 'pan' },
        { label: 'Slow Zoom', value: 'zoom' },
        { label: 'Dolly/Track', value: 'dolly' },
        { label: 'Orbit', value: 'orbit' },
      ]
    },
    { id: 'loop', name: 'Seamless Loop', type: 'boolean', default: true },
    { id: 'resolution', name: 'Resolution', type: 'select', default: '4k',
      options: [
        { label: 'HD (1080p)', value: 'hd' },
        { label: '4K (2160p)', value: '4k' },
      ]
    },
  ],
}
```

---

## Part 5: Complete Workflow Patterns

### 5.1 HIGH-VOLUME PRODUCTION WORKFLOW

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                        HIGH-VOLUME STOCK PRODUCTION WORKFLOW                         │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                       │
│  ┌─────────────┐    ┌───────────────────┐    ┌─────────────────┐                    │
│  │ Trend Data  │───▶│ ConceptGenerator  │───▶│  StockContext   │                    │
│  │ Brief/Idea  │    │ (Multiple Ideas)  │    │                 │                    │
│  └─────────────┘    └───────────────────┘    └────────┬────────┘                    │
│                                                        │                             │
│  ┌────────────────────────────────────────────────────┼────────────────────────┐   │
│  │                     PARALLEL PREPARATION                                    │   │
│  │                                                                             │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐            │   │
│  │  │KeywordOptimizer │  │ DiversityCaster │  │CompositionDir   │            │   │
│  │  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘            │   │
│  │           │                    │                    │                      │   │
│  └───────────┼────────────────────┼────────────────────┼──────────────────────┘   │
│              │                    │                    │                          │
│              ▼                    ▼                    ▼                          │
│       ┌─────────────────────────────────────────────────────────────┐            │
│       │                    BatchProducer                            │            │
│       │   Generate 25-100 images in parallel with variations        │            │
│       └───────────────────────────┬─────────────────────────────────┘            │
│                                   │                                               │
│  ┌────────────────────────────────┼────────────────────────────────┐             │
│  │                    VARIATION GENERATION                         │             │
│  │                                                                 │             │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐│             │
│  │  │ AspectAdapter   │  │LifestyleVariator│  │SeasonalGenerator ││             │
│  │  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘│             │
│  │           └───────────┬────────┴───────────┬────────┘         │             │
│  └───────────────────────┼────────────────────┼──────────────────┘             │
│                          │                    │                                 │
│                          ▼                    ▼                                 │
│                   ┌──────────────┐    ┌──────────────┐                         │
│                   │QualityChecker│───▶│MetadataGen   │                         │
│                   └──────────────┘    └──────┬───────┘                         │
│                                              │                                  │
│                                              ▼                                  │
│                                    ┌──────────────────┐                        │
│                                    │SubmissionPreparer│──▶ Platform-Ready      │
│                                    └──────────────────┘                        │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 DIVERSITY-FIRST PEOPLE PHOTOGRAPHY WORKFLOW

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                        DIVERSITY-FIRST PEOPLE WORKFLOW                               │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                       │
│  ┌──────────────────┐                                                                │
│  │Business/Lifestyle│──▶ ConceptGenerator ──▶ People-Based Concept                  │
│  │    Concept       │                                                                │
│  └────────┬─────────┘                                                                │
│           │                                                                          │
│           ▼                                                                          │
│  ┌──────────────────┐    Define Representation Goals                                │
│  │ DiversityCaster  │──────────────────────────────────────────────────────────────▶│
│  └────────┬─────────┘                                                                │
│           │                                                                          │
│           ├────────────────────────────────────────────────────────┐                │
│           ▼                                                        ▼                │
│  ┌──────────────────┐                                   ┌──────────────────┐       │
│  │ Ethnicity Mix    │                                   │  Age/Body Mix    │       │
│  │ • Asian (25%)    │                                   │  • Young Adult   │       │
│  │ • Black (25%)    │                                   │  • Middle Age    │       │
│  │ • Hispanic (20%) │                                   │  • Senior        │       │
│  │ • White (20%)    │                                   │  • Varied Body   │       │
│  │ • Other (10%)    │                                   │  • Disability    │       │
│  └────────┬─────────┘                                   └────────┬─────────┘       │
│           │                                                      │                  │
│           └──────────────────────┬───────────────────────────────┘                  │
│                                  │                                                   │
│                                  ▼                                                   │
│                          ┌──────────────────┐                                       │
│                          │BusinessSceneCreator│                                     │
│                          │  or other scene   │                                     │
│                          │    generator      │                                     │
│                          └────────┬─────────┘                                       │
│                                   │                                                  │
│                                   ▼                                                  │
│                          ┌──────────────────┐                                       │
│                          │LifestyleVariator │──▶ Same scene, different             │
│                          │                  │    demographic combinations          │
│                          └────────┬─────────┘                                       │
│                                   │                                                  │
│                                   ▼                                                  │
│                          [Quality Check → Metadata → Export]                        │
│                                                                                       │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

### 5.3 SEASONAL CONTENT PRODUCTION WORKFLOW

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                        SEASONAL CONTENT WORKFLOW                                     │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                       │
│  ┌──────────────────┐                                                                │
│  │ Year-Round Base  │──▶ Generate evergreen base images                            │
│  │    Concepts      │                                                                │
│  └────────┬─────────┘                                                                │
│           │                                                                          │
│           ▼                                                                          │
│  ┌──────────────────┐                                                                │
│  │ BatchProducer    │──▶ Base image set                                             │
│  └────────┬─────────┘                                                                │
│           │                                                                          │
│           ▼                                                                          │
│  ┌──────────────────┐                                                                │
│  │SeasonalGenerator │                                                                │
│  └────────┬─────────┘                                                                │
│           │                                                                          │
│           ├───────────────┬───────────────┬───────────────┬───────────────┐        │
│           ▼               ▼               ▼               ▼               ▼        │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────┐│
│  │   Spring     │ │   Summer     │ │    Fall      │ │   Winter     │ │ Holidays ││
│  │  Variations  │ │  Variations  │ │  Variations  │ │  Variations  │ │  Set     ││
│  └──────┬───────┘ └──────┬───────┘ └──────┬───────┘ └──────┬───────┘ └────┬─────┘│
│         │                │                │                │              │        │
│         │                │                │                │              │        │
│         │                │                │                │              ▼        │
│         │                │                │                │     ┌─────────────┐  │
│         │                │                │                │     │  Christmas  │  │
│         │                │                │                │     │  Valentine  │  │
│         │                │                │                │     │  Halloween  │  │
│         │                │                │                │     │  Easter     │  │
│         │                │                │                │     │  etc...     │  │
│         │                │                │                │     └─────────────┘  │
│         └────────────────┴────────────────┴────────────────┴─────────────┘        │
│                                           │                                        │
│                                           ▼                                        │
│                             [Batch Metadata → Platform Export]                     │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Part 6: API Integration

### 6.1 Backend Endpoints Required

```typescript
// Concept & Ideation
POST /api/agent/stock/generate-concept
POST /api/agent/stock/analyze-trends
POST /api/agent/stock/find-market-gaps

// SEO & Keywords
POST /api/agent/stock/keyword-research
POST /api/agent/stock/optimize-keywords
POST /api/agent/stock/generate-metadata

// Diversity Planning
POST /api/agent/stock/plan-diversity
POST /api/agent/stock/demographic-variations

// Scene Generation
POST /api/agent/stock/business-scene
POST /api/agent/stock/lifestyle-scene
POST /api/agent/stock/abstract-concept
POST /api/agent/stock/food-scene

// Production
POST /api/agent/stock/batch-generate
POST /api/agent/stock/create-variations
POST /api/agent/stock/aspect-adapt
POST /api/agent/stock/seasonal-adapt

// Quality & Export
POST /api/agent/stock/quality-check
POST /api/agent/stock/prepare-submission
POST /api/agent/stock/curate-collection

// Video
POST /api/fal/stock-video
POST /api/agent/stock/video-metadata
```

### 6.2 Image/Video Generation Models

| Use Case | Primary Model | Fallback |
|----------|---------------|----------|
| Stock Photos | FLUX 2 Pro | FLUX Kontext |
| People/Lifestyle | FLUX 2 Pro | - |
| Abstract/Backgrounds | FLUX 2 Pro | FLUX 2 Dev |
| Food Photography | FLUX 2 Pro | - |
| Aspect Variations | FLUX Kontext | FLUX 2 Pro |
| Stock Video | Kling 2.6 | VEO 3.1 |
| Cinemagraphs | Kling 2.6 | - |
| Time-lapse | VEO 3.1 | - |

---

## Part 7: Implementation Checklist

### Phase 1: Core Infrastructure
- [ ] Add StockPortType to canvas.ts
- [ ] Create StockContext interface
- [ ] Add stock node category

### Phase 2: Concept & Ideation Nodes
- [ ] ConceptGenerator
- [ ] TrendSpotter
- [ ] KeywordOptimizer

### Phase 3: Diversity & Representation Nodes
- [ ] DiversityCaster
- [ ] LifestyleVariator

### Phase 4: Scene Generator Nodes
- [ ] BusinessSceneCreator
- [ ] AbstractConceptualizer
- [ ] FoodDrinkCreator
- [ ] NatureSceneCreator
- [ ] TechnologySceneCreator

### Phase 5: Production & Batch Nodes
- [ ] BatchProducer
- [ ] AspectAdapter
- [ ] SeasonalGenerator
- [ ] ColorVariator

### Phase 6: Quality & Composition Nodes
- [ ] CompositionDirector
- [ ] LightingMaster
- [ ] QualityChecker
- [ ] CopySpaceOptimizer

### Phase 7: Export Nodes
- [ ] MetadataGenerator
- [ ] SubmissionPreparer
- [ ] CollectionCurator

### Phase 8: Video Nodes
- [ ] StockVideoCreator
- [ ] CinemagraphCreator

### Phase 9: Palette & UI Integration
- [ ] Add Stock Images category to palette
- [ ] Register all nodes
- [ ] Add search capabilities

---

## Appendix: Node Summary

| Node | Category | Primary Output | Image Gen | Video Gen |
|------|----------|----------------|-----------|-----------|
| ConceptGenerator | Ideation | Concept + Keywords | Yes | - |
| TrendSpotter | Ideation | Trend Analysis | - | - |
| KeywordOptimizer | SEO | Optimized Keywords | - | - |
| DiversityCaster | Diversity | Demographic Mix | Yes | - |
| LifestyleVariator | Diversity | Model Variations | Yes | - |
| BusinessSceneCreator | Scene | Business Images | Yes | - |
| AbstractConceptualizer | Scene | Abstract Images | Yes | - |
| FoodDrinkCreator | Scene | Food Images | Yes | - |
| BatchProducer | Production | Image Batch | Yes | - |
| AspectAdapter | Production | Aspect Variations | Yes | - |
| SeasonalGenerator | Production | Seasonal Versions | Yes | - |
| CompositionDirector | Quality | Composition Guide | Yes | - |
| LightingMaster | Quality | Lighting Setup | Yes | - |
| QualityChecker | Quality | Quality Report | - | - |
| MetadataGenerator | Export | Metadata Files | - | - |
| SubmissionPreparer | Export | Export Package | - | - |
| CollectionCurator | Export | Collection | Yes | - |
| StockVideoCreator | Video | Stock Video | - | Yes |

**Total: 18 Stock Content Nodes**
