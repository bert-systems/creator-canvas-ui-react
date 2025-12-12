/**
 * Creative Canvas Studio - TypeScript Models
 * Infinity board with template cards for Fashion, Interior Design, Stock Images, and Stories
 */

// ===== Card Types =====
export type CardCategory = 'fashion' | 'interior' | 'stock' | 'story';

export type CardType =
  | 'fashion-concept'
  | 'fashion-design'
  | 'fashion-collection'
  | 'interior-room'
  | 'interior-mood'
  | 'interior-layout'
  | 'stock-photo'
  | 'stock-illustration'
  | 'stock-pattern'
  | 'story-chapter'
  | 'story-scene'
  | 'story-character';

// ===== Workflow Stages =====
export type WorkflowStageStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';
export type WorkflowJobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

// Workflow stage from API (used in both execute and status responses)
export interface WorkflowStageApi {
  id: string;
  name: string;
  type: string; // 'prompt' | 'enhance' | 'generate' | 'variation' | 'finalize'
  status: string; // 'pending' | 'in_progress' | 'completed' | 'failed'
  description?: string | null;
  progress?: number | null; // 0-100 for individual stage progress
  input?: unknown | null;
  output?: unknown | null;
  startedAt?: string | null;
  completedAt?: string | null;
}

// Generated asset info from workflow completion
export interface GeneratedAssetInfo {
  id: string;
  name: string;
  type: string;
  previewUrl: string;
  fullResolutionUrl: string;
  sizeBytes?: number;
  contentType?: string;
  createdAt: string;
  thumbnailBase64?: string;
  thumbnailWidth?: number;
  thumbnailHeight?: number;
}

// Response from POST /api/creative-canvas/cards/{cardId}/execute
export interface WorkflowJobResponse {
  jobId: string;
  cardId: string;
  status: string;
  estimatedDuration?: number | null;
  stages: WorkflowStageApi[];
}

// Response from GET /api/creative-canvas/cards/{cardId}/workflow/status
export interface WorkflowStatusResponse {
  cardId: string;
  jobId: string;
  status: string;
  progress: number;
  currentStage: number;
  stages: WorkflowStageApi[];
  estimatedCompletion?: string | null;
  errorMessage?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  generatedAssets?: GeneratedAssetInfo[];
}

export type JobStage = WorkflowStageApi;

export interface WorkflowStage {
  id: string;
  name: string;
  description?: string;
  order: number;
  type: 'prompt_enhancement' | 'image_generation' | 'variation_generation' | 'text_generation' | 'llm_analysis';
  status: WorkflowStageStatus;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string;
  startedAt?: string;
  completedAt?: string;
  llmModel?: string;
  imageModel?: string;
  settings?: {
    numVariations?: number;
    guidanceScale?: number;
    temperature?: number;
    maxTokens?: number;
  };
}

export interface CardWorkflow {
  id: string;
  cardId: string;
  stages: WorkflowStage[];
  currentStageIndex: number;
  status: 'idle' | 'running' | 'paused' | 'completed' | 'failed';
  startedAt?: string;
  completedAt?: string;
  error?: string;
}

// ===== Position & Layout =====
export interface CardPosition {
  x: number;
  y: number;
}

export interface CardDimensions {
  width: number;
  height: number;
}

// ===== Canvas Card =====
export interface CanvasCard {
  id: string;
  boardId: string;
  type: CardType;
  templateId: string;
  templateName?: string;
  position: CardPosition;
  dimensions: CardDimensions;
  zIndex: number;
  groupId?: string;
  isExpanded: boolean;
  isLocked: boolean;
  // Content
  title: string;
  description?: string;
  prompt?: string;
  enhancedPrompt?: string;
  // Config from API
  config?: {
    basePrompt?: string;
    style?: string;
    enhancementAgents?: string[];
    generationParams?: {
      model?: string;
      width?: number;
      height?: number;
      numImages?: number;
      seed?: number | null;
      guidanceScale?: number | null;
      negativePrompt?: string | null;
    };
  };
  // Generated outputs
  generatedImages: string[];
  generatedText?: string;
  selectedImageIndex?: number;
  thumbnailUrl?: string;
  assets?: CanvasAsset[];
  workflow?: CardWorkflow;
  settings?: {
    llmModel?: string;
    imageModel?: string;
    numVariations?: number;
    guidanceScale?: number;
    stylePreset?: string;
    [key: string]: unknown;
  };
  tags: string[];
  assetCount?: number;
  createdAt: string;
  updatedAt: string;
}

// ===== API Response Normalization =====
export const normalizeCardFromApi = (apiCard: Record<string, unknown>): CanvasCard => {
  const card = apiCard as unknown as CanvasCard & { expanded?: boolean };

  const isExpanded = card.isExpanded ?? (card as { expanded?: boolean }).expanded ?? false;
  const prompt = card.prompt ?? card.config?.basePrompt ?? '';
  const title = card.title || card.templateName || 'Untitled Card';

  const workflow = card.workflow ? {
    ...card.workflow,
    stages: card.workflow.stages?.map(stage => ({
      ...stage,
      status: normalizeStageStatus(stage.status),
    })) || [],
  } : undefined;

  let generatedImages = card.generatedImages || [];
  if (card.assets && card.assets.length > 0 && generatedImages.length === 0) {
    generatedImages = card.assets
      .filter((asset: CanvasAsset) => asset.type === 'image')
      .map((asset: CanvasAsset) => asset.fullResolutionUrl || asset.url || asset.previewUrl)
      .filter((url): url is string => !!url);
  }

  let thumbnailUrl = card.thumbnailUrl;
  if (!thumbnailUrl && card.assets && card.assets.length > 0) {
    const firstImageAsset = card.assets.find((asset: CanvasAsset) => asset.type === 'image');
    thumbnailUrl = firstImageAsset?.previewUrl;
  }

  return {
    ...card,
    isExpanded,
    isLocked: card.isLocked ?? false,
    prompt,
    title,
    workflow,
    generatedImages,
    thumbnailUrl,
    tags: card.tags || [],
    zIndex: card.zIndex ?? 0,
  };
};

const normalizeStageStatus = (status: string): WorkflowStageStatus => {
  switch (status) {
    case 'processing':
      return 'in_progress';
    case 'completed':
      return 'completed';
    case 'failed':
      return 'failed';
    case 'skipped':
    case 'cancelled':
      return 'skipped';
    case 'pending':
    default:
      return 'pending';
  }
};

// ===== Card Group =====
export interface CardGroup {
  id: string;
  boardId: string;
  name: string;
  color?: string;
  cardIds: string[];
  position: CardPosition;
  createdAt: string;
  updatedAt: string;
}

// ===== Canvas Board =====
export interface ViewportState {
  x: number;
  y: number;
  zoom: number;
}

export interface CanvasBoard {
  id: string;
  userId: string;
  name: string;
  description?: string;
  category: CardCategory;
  thumbnail?: string;
  cards: CanvasCard[] | null;
  groups: CardGroup[] | null;
  cardCount?: number;
  groupCount?: number;
  viewportState: ViewportState;
  settings?: {
    gridEnabled?: boolean;
    snapToGrid?: boolean;
    gridSize?: number;
    defaultCardWidth?: number;
    defaultCardHeight?: number;
    theme?: 'light' | 'dark';
    [key: string]: unknown;
  };
  isPublic: boolean;
  sharedWith: string[] | null;
  tags: string[] | null;
  createdAt: string;
  updatedAt: string;
}

// ===== Templates =====
export interface CardTemplate {
  id: string;
  name: string;
  description: string;
  category: CardCategory;
  type: CardType;
  icon: string;
  defaultPrompt?: string;
  promptSuggestions: string[];
  workflowStages: Omit<WorkflowStage, 'id' | 'status' | 'input' | 'output'>[];
  defaultSettings: {
    llmModel?: string;
    imageModel?: string;
    numVariations?: number;
    guidanceScale?: number;
    [key: string]: unknown;
  };
  defaultDimensions: CardDimensions;
  expandedDimensions?: CardDimensions;
  color?: string;
  isPremium: boolean;
  previewImage?: string;
  tags: string[];
}

// ===== Asset Library =====
export type AssetType = 'image' | 'video' | 'audio' | 'document' | 'template' | 'prompt';

export interface CanvasAsset {
  id: string;
  libraryId?: string | null;
  cardId?: string | null;
  name: string;
  type: AssetType | string;
  url?: string;
  previewUrl?: string;
  fullResolutionUrl?: string;
  thumbnailUrl?: string;
  imageDimensions?: CardDimensions;
  fileSizeBytes?: number;
  fileSize?: string;
  format?: string;
  generationDetails?: {
    model?: string;
    prompt?: string;
    seed?: number;
    cardId?: string;
  };
  metadata?: {
    width?: number;
    height?: number;
    fileSize?: number;
    mimeType?: string;
    duration?: number;
    [key: string]: unknown;
  };
  tags?: string[];
  folder?: string;
  isForSale?: boolean;
  price?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface AssetLibrary {
  id: string;
  userId: string;
  name: string;
  description?: string;
  category: CardCategory;
  assets: CanvasAsset[];
  assetCount: number;
  totalSize: number;
  isForSale: boolean;
  price?: number;
  previewImages: string[];
  salesCount?: number;
  rating?: number;
  reviewCount?: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// ===== Marketplace =====
export interface MarketplaceListing {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar?: string;
  itemType: 'library' | 'pack' | 'template' | 'asset';
  itemId: string;
  title: string;
  description: string;
  price: number;
  discountedPrice?: number;
  currency: string;
  salesCount: number;
  rating: number;
  reviewCount: number;
  viewCount: number;
  previewImages: string[];
  category: CardCategory;
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MarketplaceReview {
  id: string;
  listingId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

// ===== API Request/Response Types =====

export interface CreateBoardRequest {
  name: string;
  description?: string;
  category: CardCategory;
  templateId?: string;
  settings?: CanvasBoard['settings'];
  tags?: string[];
  isPublic?: boolean;
}

export interface UpdateBoardRequest {
  name?: string;
  description?: string;
  thumbnail?: string;
  viewportState?: ViewportState;
  settings?: CanvasBoard['settings'];
  isPublic?: boolean;
  sharedWith?: string[];
  tags?: string[];
}

export interface DuplicateBoardRequest {
  name?: string;
  includeCards: boolean;
  includeAssets: boolean;
}

export interface BoardListResponse {
  boards: CanvasBoard[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface BoardExportResponse {
  exportUrl: string;
  format: string;
  expiresAt: string;
}

export interface CreateCardRequest {
  type: CardType;
  templateId: string;
  position?: CardPosition;
  dimensions?: CardDimensions;
  title?: string;
  description?: string;
  prompt?: string;
  settings?: CanvasCard['settings'];
  tags?: string[];
  config?: {
    basePrompt?: string;
    style?: string;
    enhancementAgents?: string[];
    generationParams?: {
      model?: string;
      width?: number;
      height?: number;
      numImages?: number;
    };
  };
}

export interface UpdateCardRequest {
  position?: CardPosition;
  dimensions?: CardDimensions;
  zIndex?: number;
  groupId?: string | null;
  isExpanded?: boolean;
  isLocked?: boolean;
  title?: string;
  description?: string;
  prompt?: string;
  enhancedPrompt?: string;
  generatedImages?: string[];
  generatedText?: string;
  selectedImageIndex?: number;
  settings?: CanvasCard['settings'];
  tags?: string[];
  config?: {
    basePrompt?: string;
    style?: string;
    enhancementAgents?: string[];
    generationParams?: {
      model?: string;
      width?: number;
      height?: number;
      numImages?: number;
    };
  };
}

export interface BatchUpdateRequest {
  cards: Array<{
    cardId: string;
    position?: CardPosition;
    zIndex?: number;
    groupId?: string | null;
  }>;
}

export interface ExecuteWorkflowRequest {
  startFromStage?: number;
  stopAfterStage?: number | null;
  stageOverrides?: {
    stage_1?: { prompt?: string };
    stage_2?: { enhancementAgents?: string[] };
    stage_3?: {
      generationParams?: {
        model?: string;
        width?: number;
        height?: number;
        numImages?: number;
        seed?: number;
        guidanceScale?: number;
        negativePrompt?: string;
      };
    };
    stage_4?: { variationTypes?: ('color' | 'angle' | 'style' | 'lighting')[] };
    stage_5?: { libraryId?: string };
  };
  overrideSettings?: Record<string, unknown>;
}

export interface ExecuteStageRequest {
  input?: Record<string, unknown>;
  overrideSettings?: Record<string, unknown>;
}

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface JobStageInfo {
  id: string;
  name: string;
  type: string;
  status: JobStatus;
  description?: string | null;
  progress?: number | null;
  input?: Record<string, unknown> | null;
  output?: Record<string, unknown> | null;
  startedAt?: string | null;
  completedAt?: string | null;
}

export interface ExecuteJobResponse {
  jobId: string;
  cardId: string;
  status: JobStatus;
  estimatedDuration?: number | null;
  stages: JobStageInfo[];
}

export interface JobStatusResponse {
  jobId: string;
  cardId: string;
  status: JobStatus;
  stages: JobStageInfo[];
  result?: {
    enhancedPrompt?: string;
    generatedImages?: string[];
    generatedText?: string;
  };
  error?: string | null;
  startedAt?: string;
  completedAt?: string;
}

export interface CreateGroupRequest {
  name: string;
  cardIds: string[];
  color?: string;
  position?: CardPosition;
}

export interface CreateLibraryRequest {
  name: string;
  description?: string;
  category: CardCategory;
  isForSale?: boolean;
  isPublic?: boolean;
  price?: number;
  tags?: string[];
}

export interface UpdateLibraryRequest {
  name?: string;
  description?: string;
  isForSale?: boolean;
  isPublic?: boolean;
  price?: number;
  previewImages?: string[];
  tags?: string[];
}

export interface AddAssetsRequest {
  assets: Array<{
    name: string;
    type: AssetType;
    url: string;
    thumbnailUrl?: string;
    metadata?: CanvasAsset['metadata'];
    tags?: string[];
    folder?: string;
  }>;
}

export interface RemoveAssetsRequest {
  assetIds: string[];
}

export interface LibraryListResponse {
  libraries: AssetLibrary[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface MarketplaceSearchParams {
  category?: CardCategory;
  itemType?: MarketplaceListing['itemType'];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sortBy?: 'popular' | 'newest' | 'price_low' | 'price_high' | 'rating';
  search?: string;
  tags?: string[];
  page?: number;
  limit?: number;
}

export interface MarketplaceSearchResponse {
  listings: MarketplaceListing[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface PurchaseRequest {
  listingId: string;
  paymentMethodId?: string;
}

export interface CreateReviewRequest {
  rating: number;
  comment?: string;
}

export interface TemplateListResponse {
  templates: CardTemplate[];
  total: number;
}

// ===== API Response Wrapper =====
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    requestId?: string;
    timestamp?: string;
    [key: string]: unknown;
  };
}

// ===== Default Templates =====
export const FASHION_TEMPLATES: CardTemplate[] = [
  {
    id: 'fashion-concept-basic',
    name: 'Fashion Concept',
    description: 'Generate fashion design concepts with AI-enhanced prompts',
    category: 'fashion',
    type: 'fashion-concept',
    icon: 'Style',
    promptSuggestions: [
      'Haute couture evening gown with flowing silk fabric',
      'Streetwear collection inspired by urban architecture',
      'Sustainable fashion using recycled materials',
    ],
    workflowStages: [
      { name: 'Enhance Prompt', description: 'AI-powered prompt enhancement', order: 0, type: 'prompt_enhancement' },
      { name: 'Generate Concept', description: 'Generate initial concept images', order: 1, type: 'image_generation' },
      { name: 'Create Variations', description: 'Generate style variations', order: 2, type: 'variation_generation' },
    ],
    defaultSettings: {
      llmModel: 'gemini-2.5-flash',
      imageModel: 'flux-2-pro',
      numVariations: 2,
    },
    defaultDimensions: { width: 320, height: 400 },
    color: '#E91E63',
    isPremium: false,
    tags: ['fashion', 'concept', 'design'],
  },
  {
    id: 'streetwear-hoodie',
    name: 'Streetwear Hoodie',
    description: 'Design streetwear hoodies with urban aesthetic',
    category: 'fashion',
    type: 'fashion-concept',
    icon: 'Style',
    promptSuggestions: [
      'Oversized hoodie with Japanese typography',
      'Tie-dye hoodie with gradient effect',
      'Minimalist black hoodie with embroidered logo',
    ],
    workflowStages: [
      { name: 'Enhance Prompt', description: 'AI-powered prompt enhancement', order: 0, type: 'prompt_enhancement' },
      { name: 'Generate Design', description: 'Generate hoodie designs', order: 1, type: 'image_generation' },
    ],
    defaultSettings: {
      imageModel: 'flux-2-pro',
      numVariations: 2,
    },
    defaultDimensions: { width: 320, height: 400 },
    color: '#9C27B0',
    isPremium: false,
    tags: ['streetwear', 'hoodie', 'fashion'],
  },
];

export const INTERIOR_TEMPLATES: CardTemplate[] = [
  {
    id: 'interior-room-design',
    name: 'Room Design',
    description: 'Generate interior room designs with customizable styles',
    category: 'interior',
    type: 'interior-room',
    icon: 'Weekend',
    promptSuggestions: [
      'Modern minimalist living room with natural light',
      'Cozy Scandinavian bedroom with warm wood tones',
      'Industrial loft kitchen with exposed brick',
    ],
    workflowStages: [
      { name: 'Enhance Prompt', description: 'Add interior design details', order: 0, type: 'prompt_enhancement' },
      { name: 'Generate Design', description: 'Create room visualization', order: 1, type: 'image_generation' },
    ],
    defaultSettings: {
      imageModel: 'flux-2-pro',
      numVariations: 2,
    },
    defaultDimensions: { width: 360, height: 280 },
    color: '#4CAF50',
    isPremium: false,
    tags: ['interior', 'room', 'design'],
  },
];

export const STOCK_TEMPLATES: CardTemplate[] = [
  {
    id: 'stock-photo-generator',
    name: 'Stock Photo',
    description: 'Generate high-quality stock photos for commercial use',
    category: 'stock',
    type: 'stock-photo',
    icon: 'Photo',
    promptSuggestions: [
      'Professional business team meeting',
      'Fresh organic vegetables on wooden board',
      'Happy family enjoying outdoor picnic',
    ],
    workflowStages: [
      { name: 'Enhance Prompt', description: 'Optimize for stock photography', order: 0, type: 'prompt_enhancement' },
      { name: 'Generate Photo', description: 'Create high-res photo', order: 1, type: 'image_generation' },
    ],
    defaultSettings: {
      imageModel: 'flux-2-pro',
      numVariations: 2,
    },
    defaultDimensions: { width: 320, height: 240 },
    color: '#2196F3',
    isPremium: false,
    tags: ['stock', 'photo', 'commercial'],
  },
];

export const STORY_TEMPLATES: CardTemplate[] = [
  {
    id: 'story-scene',
    name: 'Scene Card',
    description: 'Design individual scenes with dialogue and visuals',
    category: 'story',
    type: 'story-scene',
    icon: 'Theaters',
    promptSuggestions: [
      'Tense confrontation in a dimly lit alley',
      'Romantic dinner on a rooftop',
      'Chase sequence through crowded marketplace',
    ],
    workflowStages: [
      { name: 'Scene Setup', description: 'Define scene elements', order: 0, type: 'llm_analysis' },
      { name: 'Dialogue', description: 'Generate character dialogue', order: 1, type: 'text_generation' },
      { name: 'Visualization', description: 'Create scene artwork', order: 2, type: 'image_generation' },
    ],
    defaultSettings: {
      llmModel: 'gemini-2.5-flash',
      imageModel: 'flux-2-dev',
    },
    defaultDimensions: { width: 320, height: 400 },
    color: '#FF9800',
    isPremium: false,
    tags: ['story', 'scene', 'dialogue'],
  },
];

export const ALL_TEMPLATES: CardTemplate[] = [
  ...FASHION_TEMPLATES,
  ...INTERIOR_TEMPLATES,
  ...STOCK_TEMPLATES,
  ...STORY_TEMPLATES,
];

export const getTemplatesByCategory = (category: CardCategory): CardTemplate[] => {
  switch (category) {
    case 'fashion':
      return FASHION_TEMPLATES;
    case 'interior':
      return INTERIOR_TEMPLATES;
    case 'stock':
      return STOCK_TEMPLATES;
    case 'story':
      return STORY_TEMPLATES;
    default:
      return ALL_TEMPLATES;
  }
};

export const getTemplateById = (templateId: string): CardTemplate | undefined => {
  return ALL_TEMPLATES.find(t => t.id === templateId);
};

// ===== Category Metadata =====
export const CATEGORY_INFO: Record<CardCategory, { name: string; icon: string; color: string; description: string }> = {
  fashion: {
    name: 'Fashion Design',
    icon: 'Style',
    color: '#E91E63',
    description: 'Create fashion concepts, designs, and collections',
  },
  interior: {
    name: 'Interior Design',
    icon: 'Weekend',
    color: '#4CAF50',
    description: 'Design rooms, mood boards, and interior layouts',
  },
  stock: {
    name: 'Stock Images',
    icon: 'Photo',
    color: '#2196F3',
    description: 'Generate professional stock photos and illustrations',
  },
  story: {
    name: 'Stories',
    icon: 'MenuBook',
    color: '#FF9800',
    description: 'Write and illustrate stories with AI assistance',
  },
};

// ===== Canvas Toolbar Types =====
export type ToolType =
  | 'fabric-swatch'
  | 'color-palette'
  | 'pattern-library'
  | 'style-preset'
  | 'material-swatch'
  | 'room-template'
  | 'prompt-agents';

export interface ToolbarItem {
  id: string;
  name: string;
  description?: string;
  thumbnailUrl?: string;
  previewUrl?: string;
  metadata?: Record<string, unknown>;
  tags?: string[];
  isPremium?: boolean;
}

export interface ColorSwatch extends ToolbarItem {
  type: 'color';
  hex: string;
  rgb: { r: number; g: number; b: number };
  colorFamily: string;
  promptKeywords: string[];
}

export interface PromptEnhancementAgent extends ToolbarItem {
  type: 'prompt-agent';
  agentType: 'expander' | 'structurer' | 'creative' | 'critic' | 'fashion' | 'scene' | 'character' | 'stock-photo' | 'interior' | 'narrative';
  categories: CardCategory[];
  endpoint: string;
  defaultParams?: {
    temperature?: number;
    maxTokens?: number;
  };
  keywords: string[];
}

export type CanvasToolbarItem = ColorSwatch | PromptEnhancementAgent | ToolbarItem;

export interface CanvasToolDefinition {
  id: string;
  type: ToolType;
  name: string;
  description: string;
  icon: string;
  category: CardCategory;
  items?: CanvasToolbarItem[];
}

// ===== Connection Types (Moments of Delight) =====
export type ConnectionActionType =
  | 'creative-dna-fusion'
  | 'style-transplant'
  | 'element-transfer'
  | 'variation-bridge'
  | 'character-inject';

export type TransferableElement =
  | 'colors'
  | 'textures'
  | 'style'
  | 'mood'
  | 'composition'
  | 'lighting'
  | 'subject';

export interface ImageTraitAnalysis {
  description: string;
  colors: Array<{ hex: string; name: string; percentage: number }>;
  textures: string[];
  mood: string;
  style: string;
  objects: string[];
  composition: string;
  tags: string[];
}

export interface ConnectionActionOptions {
  elementsToTransfer?: TransferableElement[];
  numVariations?: number;
  fusionStrength?: number;
  customInstructions?: string;
  preferredModel?: 'nano-banana-pro' | 'flux-redux' | 'auto';
  resolution?: '1K' | '2K' | '4K';
}

export interface ConnectionActionRequest {
  sourceCardId: string;
  targetCardId: string;
  actionType: ConnectionActionType;
  options?: ConnectionActionOptions;
  boardId: string;
  category: CardCategory;
}

export interface ConnectionActionResponse {
  success: boolean;
  connectionId: string;
  sourceAnalysis?: ImageTraitAnalysis;
  targetAnalysis?: ImageTraitAnalysis;
  fusedPrompt?: string;
  generatedImages?: Array<{
    url: string;
    thumbnailUrl?: string;
    width: number;
    height: number;
  }>;
  childCardIds: string[];
  model: string;
  processingTimeMs: number;
  error?: string;
}

export interface ConnectionActionDefinition {
  type: ConnectionActionType;
  name: string;
  description: string;
  icon: string;
  supportedCategories: CardCategory[] | 'all';
  preferredModel: 'nano-banana-pro' | 'flux-redux';
  requiresSourceType?: CardType[];
  requiresTargetType?: CardType[];
  defaultOptions?: Partial<ConnectionActionOptions>;
}

export const CONNECTION_ACTIONS: ConnectionActionDefinition[] = [
  {
    type: 'creative-dna-fusion',
    name: 'Creative DNA Fusion',
    description: 'Merge the creative DNA of both designs into a new hybrid',
    icon: 'Dna',
    supportedCategories: 'all',
    preferredModel: 'nano-banana-pro',
    defaultOptions: { fusionStrength: 0.5, resolution: '2K' },
  },
  {
    type: 'style-transplant',
    name: 'Style Transplant',
    description: 'Apply the visual style from source to target content',
    icon: 'Palette',
    supportedCategories: 'all',
    preferredModel: 'flux-redux',
    defaultOptions: { fusionStrength: 0.75 },
  },
  {
    type: 'element-transfer',
    name: 'Element Transfer',
    description: 'Selectively transfer specific elements (colors, textures, mood)',
    icon: 'SwapHoriz',
    supportedCategories: 'all',
    preferredModel: 'nano-banana-pro',
    defaultOptions: { elementsToTransfer: ['colors', 'mood'] },
  },
  {
    type: 'variation-bridge',
    name: 'Variation Bridge',
    description: 'Generate a spectrum of designs bridging both concepts',
    icon: 'Timeline',
    supportedCategories: 'all',
    preferredModel: 'nano-banana-pro',
    defaultOptions: { numVariations: 3 },
  },
  {
    type: 'character-inject',
    name: 'Character Injection',
    description: 'Place the character from source into the scene of target',
    icon: 'PersonAdd',
    supportedCategories: ['story', 'fashion'],
    preferredModel: 'nano-banana-pro',
    requiresSourceType: ['story-character', 'fashion-concept'],
    requiresTargetType: ['story-scene', 'story-chapter'],
  },
];
