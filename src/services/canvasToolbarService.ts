/**
 * Canvas Toolbar Service
 * Provides category-specific tools, swatches, and prompt enhancement agents
 * Synthesizes node definitions with fashion/creative tools from legacy implementation
 */

import type { BoardCategory } from '@/models/canvas';

// ===== Type Definitions =====

export type ToolbarItemType =
  | 'fabric'
  | 'color'
  | 'pattern'
  | 'style'
  | 'african-textile'
  | 'adinkra-symbol'
  | 'african-color'
  | 'african-garment'
  | 'material'
  | 'room'
  | 'lighting'
  | 'character'
  | 'scene'
  | 'narrative'
  | 'photo-style'
  | 'composition'
  | 'prompt-agent';

export interface ToolbarItem {
  id: string;
  type: ToolbarItemType;
  name: string;
  description?: string;
  thumbnailUrl?: string;
  promptKeywords: string[];
  tags: string[];
  isPremium?: boolean;
  metadata?: Record<string, unknown>;
}

export interface ColorSwatch extends ToolbarItem {
  type: 'color' | 'african-color';
  hex: string;
  rgb: { r: number; g: number; b: number };
  colorFamily?: string;
  culturalMeaning?: string;
  region?: string;
}

export interface FabricSwatch extends ToolbarItem {
  type: 'fabric';
  material: string;
  texture: string;
  weight: 'light' | 'medium' | 'heavy';
  stretch: boolean;
  transparency: 'opaque' | 'semi-transparent' | 'transparent';
}

export interface AfricanTextile extends ToolbarItem {
  type: 'african-textile';
  textileName: string;
  region: string;
  country: string;
  technique: string;
  colors: string[];
  culturalMeaning: string;
}

export interface AdinkraSymbol extends ToolbarItem {
  type: 'adinkra-symbol';
  symbolName: string;
  meaning: string;
  category: 'spirituality' | 'wisdom' | 'royalty' | 'human-relations' | 'nature';
}

export interface AfricanGarment extends ToolbarItem {
  type: 'african-garment';
  garmentName: string;
  region: string;
  gender: 'male' | 'female' | 'unisex';
  occasion: 'everyday' | 'ceremonial' | 'formal' | 'religious';
  silhouette: string;
  traditionalFabrics: string[];
}

export interface PatternItem extends ToolbarItem {
  type: 'pattern';
  patternType: string;
  scale: 'small' | 'medium' | 'large';
  repeat: 'seamless' | 'non-repeat';
  colorScheme: string[];
}

export interface StylePreset extends ToolbarItem {
  type: 'style';
  styleCategory: string;
  era: string;
  occasion: string;
  promptTemplate: string;
}

export interface PromptEnhancementAgent extends ToolbarItem {
  type: 'prompt-agent';
  agentType: 'expander' | 'structurer' | 'creative' | 'fashion' | 'interior' | 'stock-photo' | 'narrative';
  categories: BoardCategory[];
  endpoint: string;
  keywords: string[];
}

export interface ToolDefinition {
  id: string;
  type: string;
  name: string;
  description: string;
  icon: string;
  category: BoardCategory;
  items: ToolbarItem[];
}

export interface CategoryToolbarConfig {
  category: BoardCategory;
  tools: ToolDefinition[];
}

// ===== Fashion Swatches =====

const FABRIC_SWATCHES: FabricSwatch[] = [
  {
    id: 'fabric-cotton-white',
    type: 'fabric',
    name: 'Cotton - White',
    description: 'Premium white cotton, perfect for casual and formal wear',
    material: 'cotton',
    texture: 'smooth',
    weight: 'medium',
    stretch: false,
    transparency: 'opaque',
    promptKeywords: ['white cotton fabric', 'crisp cotton', 'breathable cotton'],
    tags: ['basic', 'versatile', 'summer'],
  },
  {
    id: 'fabric-silk-gold',
    type: 'fabric',
    name: 'Silk - Gold',
    description: 'Luxurious golden silk with subtle sheen',
    material: 'silk',
    texture: 'smooth',
    weight: 'light',
    stretch: false,
    transparency: 'semi-transparent',
    promptKeywords: ['golden silk fabric', 'luxurious silk', 'shimmering silk'],
    tags: ['luxury', 'evening', 'elegant'],
    isPremium: true,
  },
  {
    id: 'fabric-denim-blue',
    type: 'fabric',
    name: 'Denim - Indigo',
    description: 'Classic indigo denim, medium weight',
    material: 'denim',
    texture: 'woven',
    weight: 'heavy',
    stretch: false,
    transparency: 'opaque',
    promptKeywords: ['indigo denim', 'blue denim fabric', 'classic denim'],
    tags: ['casual', 'durable', 'everyday'],
  },
  {
    id: 'fabric-wool-grey',
    type: 'fabric',
    name: 'Wool - Charcoal',
    description: 'Fine merino wool in charcoal grey',
    material: 'wool',
    texture: 'textured',
    weight: 'heavy',
    stretch: false,
    transparency: 'opaque',
    promptKeywords: ['charcoal wool', 'fine wool fabric', 'warm wool'],
    tags: ['winter', 'formal', 'warm'],
  },
  {
    id: 'fabric-velvet-burgundy',
    type: 'fabric',
    name: 'Velvet - Burgundy',
    description: 'Rich burgundy velvet with soft pile',
    material: 'velvet',
    texture: 'smooth',
    weight: 'medium',
    stretch: false,
    transparency: 'opaque',
    promptKeywords: ['burgundy velvet', 'rich velvet fabric', 'luxurious velvet'],
    tags: ['luxury', 'evening', 'winter'],
    isPremium: true,
  },
  {
    id: 'fabric-leather-black',
    type: 'fabric',
    name: 'Leather - Black',
    description: 'Supple black leather, medium weight',
    material: 'leather',
    texture: 'smooth',
    weight: 'medium',
    stretch: false,
    transparency: 'opaque',
    promptKeywords: ['black leather', 'supple leather', 'premium leather'],
    tags: ['edgy', 'classic', 'durable'],
  },
];

const COLOR_SWATCHES: ColorSwatch[] = [
  { id: 'color-black', type: 'color', name: 'Classic Black', hex: '#000000', rgb: { r: 0, g: 0, b: 0 }, colorFamily: 'neutral', promptKeywords: ['black', 'noir', 'dark'], tags: ['basic', 'formal'] },
  { id: 'color-white', type: 'color', name: 'Pure White', hex: '#FFFFFF', rgb: { r: 255, g: 255, b: 255 }, colorFamily: 'neutral', promptKeywords: ['white', 'pure white', 'crisp white'], tags: ['basic', 'clean'] },
  { id: 'color-navy', type: 'color', name: 'Navy Blue', hex: '#1B2838', rgb: { r: 27, g: 40, b: 56 }, colorFamily: 'cool', promptKeywords: ['navy blue', 'deep blue', 'dark blue'], tags: ['classic', 'formal'] },
  { id: 'color-burgundy', type: 'color', name: 'Burgundy', hex: '#800020', rgb: { r: 128, g: 0, b: 32 }, colorFamily: 'warm', promptKeywords: ['burgundy', 'wine red', 'deep red'], tags: ['elegant', 'fall'] },
  { id: 'color-emerald', type: 'color', name: 'Emerald Green', hex: '#50C878', rgb: { r: 80, g: 200, b: 120 }, colorFamily: 'cool', promptKeywords: ['emerald green', 'jewel green', 'rich green'], tags: ['vibrant', 'spring'] },
  { id: 'color-coral', type: 'color', name: 'Living Coral', hex: '#FF6F61', rgb: { r: 255, g: 111, b: 97 }, colorFamily: 'warm', promptKeywords: ['coral', 'peachy coral', 'living coral'], tags: ['trendy', 'summer'] },
  { id: 'color-sage', type: 'color', name: 'Sage Green', hex: '#9CAF88', rgb: { r: 156, g: 175, b: 136 }, colorFamily: 'earth', promptKeywords: ['sage green', 'muted green', 'earthy green'], tags: ['natural', 'calming'] },
  { id: 'color-blush', type: 'color', name: 'Blush Pink', hex: '#F8C8DC', rgb: { r: 248, g: 200, b: 220 }, colorFamily: 'pastel', promptKeywords: ['blush pink', 'soft pink', 'pale pink'], tags: ['feminine', 'romantic'] },
  { id: 'color-mustard', type: 'color', name: 'Mustard Yellow', hex: '#FFDB58', rgb: { r: 255, g: 219, b: 88 }, colorFamily: 'warm', promptKeywords: ['mustard yellow', 'golden yellow', 'warm yellow'], tags: ['bold', 'fall'] },
  { id: 'color-terracotta', type: 'color', name: 'Terracotta', hex: '#E2725B', rgb: { r: 226, g: 114, b: 91 }, colorFamily: 'earth', promptKeywords: ['terracotta', 'burnt orange', 'earthy orange'], tags: ['earthy', 'warm'] },
];

const PATTERN_ITEMS: PatternItem[] = [
  { id: 'pattern-stripes', type: 'pattern', name: 'Classic Stripes', description: 'Timeless horizontal stripes', patternType: 'stripes', scale: 'medium', repeat: 'seamless', colorScheme: ['#000000', '#FFFFFF'], promptKeywords: ['striped pattern', 'horizontal stripes'], tags: ['classic', 'nautical'] },
  { id: 'pattern-tartan', type: 'pattern', name: 'Scottish Tartan', description: 'Traditional tartan plaid', patternType: 'plaid', scale: 'large', repeat: 'seamless', colorScheme: ['#8B0000', '#000080', '#006400'], promptKeywords: ['tartan plaid', 'scottish tartan'], tags: ['traditional', 'winter'] },
  { id: 'pattern-floral', type: 'pattern', name: 'Botanical Floral', description: 'Delicate botanical print', patternType: 'floral', scale: 'medium', repeat: 'non-repeat', colorScheme: ['#FFB6C1', '#98FB98', '#FFFFFF'], promptKeywords: ['floral print', 'botanical flowers'], tags: ['feminine', 'spring'] },
  { id: 'pattern-geometric', type: 'pattern', name: 'Modern Geometric', description: 'Contemporary shapes', patternType: 'geometric', scale: 'large', repeat: 'seamless', colorScheme: ['#2C3E50', '#E74C3C', '#ECF0F1'], promptKeywords: ['geometric pattern', 'modern geometric'], tags: ['modern', 'bold'] },
  { id: 'pattern-polkadot', type: 'pattern', name: 'Polka Dots', description: 'Classic polka dot', patternType: 'dots', scale: 'small', repeat: 'seamless', colorScheme: ['#FFFFFF', '#000000'], promptKeywords: ['polka dots', 'dotted pattern'], tags: ['retro', 'playful'] },
  { id: 'pattern-leopard', type: 'pattern', name: 'Leopard Print', description: 'Bold animal print', patternType: 'animal', scale: 'medium', repeat: 'seamless', colorScheme: ['#D2691E', '#8B4513', '#000000'], promptKeywords: ['leopard print', 'animal print'], tags: ['bold', 'statement'], isPremium: true },
];

const STYLE_PRESETS: StylePreset[] = [
  { id: 'style-streetwear', type: 'style', name: 'Urban Streetwear', description: 'Contemporary street fashion', styleCategory: 'streetwear', era: 'modern', occasion: 'casual', promptTemplate: 'Urban streetwear fashion, {garment}, oversized fit, street style', promptKeywords: ['streetwear', 'urban style', 'oversized'], tags: ['casual', 'urban', 'youth'] },
  { id: 'style-minimalist', type: 'style', name: 'Minimalist Chic', description: 'Clean lines, neutral colors', styleCategory: 'minimalist', era: 'modern', occasion: 'work', promptTemplate: 'Minimalist fashion, {garment}, clean lines, neutral colors', promptKeywords: ['minimalist', 'clean lines', 'neutral'], tags: ['elegant', 'professional'] },
  { id: 'style-bohemian', type: 'style', name: 'Bohemian Spirit', description: 'Flowing fabrics, earthy tones', styleCategory: 'bohemian', era: 'modern', occasion: 'casual', promptTemplate: 'Bohemian fashion, {garment}, flowing fabric, earthy tones', promptKeywords: ['bohemian', 'boho', 'flowing'], tags: ['casual', 'artistic'] },
  { id: 'style-formal', type: 'style', name: 'Formal Evening', description: 'Elegant black-tie attire', styleCategory: 'formal', era: 'modern', occasion: 'party', promptTemplate: 'Formal evening wear, {garment}, elegant, luxurious fabric', promptKeywords: ['formal', 'evening wear', 'elegant'], tags: ['elegant', 'luxury'], isPremium: true },
  { id: 'style-vintage70s', type: 'style', name: '70s Vintage', description: 'Retro 1970s inspired', styleCategory: 'vintage', era: '1970s', occasion: 'casual', promptTemplate: 'Vintage 1970s fashion, {garment}, retro style, warm tones', promptKeywords: ['vintage', '70s', 'retro'], tags: ['retro', 'statement'] },
];

// ===== African Fashion Heritage =====

const AFRICAN_TEXTILES: AfricanTextile[] = [
  {
    id: 'textile-kente-asante',
    type: 'african-textile',
    name: 'Kente - Asante',
    description: 'Royal Asante kente with intricate geometric patterns',
    textileName: 'kente',
    region: 'west-africa',
    country: 'Ghana',
    technique: 'weaving',
    colors: ['#FFD700', '#008000', '#FF0000', '#000000'],
    culturalMeaning: 'Symbol of royalty, wealth, and cultural identity',
    promptKeywords: ['Asante kente cloth', 'Ghanaian kente', 'royal African textile', 'gold and green kente'],
    tags: ['royal', 'ceremonial', 'ghana'],
    isPremium: true,
  },
  {
    id: 'textile-adire-oniko',
    type: 'african-textile',
    name: 'Adire Oniko',
    description: 'Yoruba tie-dye indigo resist fabric',
    textileName: 'adire',
    region: 'west-africa',
    country: 'Nigeria',
    technique: 'tie-dye',
    colors: ['#1B3F8B', '#FFFFFF', '#4169E1'],
    culturalMeaning: 'Traditional Yoruba cloth symbolizing creativity',
    promptKeywords: ['Adire fabric', 'Nigerian indigo dye', 'Yoruba tie-dye'],
    tags: ['indigo', 'traditional', 'nigeria'],
  },
  {
    id: 'textile-bogolan',
    type: 'african-textile',
    name: 'Bogolan (Mudcloth)',
    description: 'Malian mudcloth with symbolic patterns',
    textileName: 'bogolan',
    region: 'west-africa',
    country: 'Mali',
    technique: 'mud-cloth',
    colors: ['#3D2B1F', '#8B4513', '#F5DEB3', '#000000'],
    culturalMeaning: 'Each pattern tells a story or conveys a proverb',
    promptKeywords: ['Bogolan mudcloth', 'Malian mud cloth', 'earth-tone African fabric'],
    tags: ['earth-tones', 'symbolic', 'mali'],
  },
  {
    id: 'textile-kuba-raffia',
    type: 'african-textile',
    name: 'Kuba Raffia Cloth',
    description: 'Intricate raffia palm cloth from DRC',
    textileName: 'kuba',
    region: 'central-africa',
    country: 'DRC',
    technique: 'appliqué',
    colors: ['#DEB887', '#8B4513', '#000000', '#F4A460'],
    culturalMeaning: 'Status symbol of the Kuba kingdom',
    promptKeywords: ['Kuba cloth', 'raffia textile', 'Congolese fabric'],
    tags: ['geometric', 'royal', 'drc'],
    isPremium: true,
  },
  {
    id: 'textile-kitenge',
    type: 'african-textile',
    name: 'Kitenge',
    description: 'Vibrant East African wax print',
    textileName: 'kitenge',
    region: 'east-africa',
    country: 'Tanzania',
    technique: 'wax-print',
    colors: ['#FF4500', '#00CED1', '#FFD700', '#8B008B'],
    culturalMeaning: 'Everyday fabric expressing personal style',
    promptKeywords: ['Kitenge print', 'African wax print', 'vibrant East African fabric'],
    tags: ['vibrant', 'everyday', 'tanzania'],
  },
  {
    id: 'textile-shweshwe',
    type: 'african-textile',
    name: 'Shweshwe',
    description: 'South African geometric print cotton',
    textileName: 'shweshwe',
    region: 'south-africa',
    country: 'South Africa',
    technique: 'block-print',
    colors: ['#00008B', '#8B0000', '#8B4513', '#FFFFFF'],
    culturalMeaning: 'National heritage fabric of South Africa',
    promptKeywords: ['Shweshwe fabric', 'South African print', 'geometric cotton print'],
    tags: ['geometric', 'traditional', 'south-africa'],
  },
];

const ADINKRA_SYMBOLS: AdinkraSymbol[] = [
  {
    id: 'adinkra-gye-nyame',
    type: 'adinkra-symbol',
    name: 'Gye Nyame',
    description: 'The supremacy of God - most popular Adinkra symbol',
    symbolName: 'gye-nyame',
    meaning: 'Except God, I fear none. Symbol of God\'s omnipotence.',
    category: 'spirituality',
    promptKeywords: ['Gye Nyame symbol', 'Adinkra supremacy of God', 'Ghanaian spiritual symbol'],
    tags: ['spiritual', 'popular', 'protection'],
  },
  {
    id: 'adinkra-sankofa',
    type: 'adinkra-symbol',
    name: 'Sankofa',
    description: 'Return and fetch it - learning from the past',
    symbolName: 'sankofa',
    meaning: 'Go back and fetch it. Learn from the past.',
    category: 'wisdom',
    promptKeywords: ['Sankofa symbol', 'Adinkra wisdom', 'bird looking back symbol'],
    tags: ['wisdom', 'heritage', 'learning'],
  },
  {
    id: 'adinkra-adinkrahene',
    type: 'adinkra-symbol',
    name: 'Adinkrahene',
    description: 'King of Adinkra symbols - leadership',
    symbolName: 'adinkrahene',
    meaning: 'Chief of Adinkra symbols. Greatness and leadership.',
    category: 'royalty',
    promptKeywords: ['Adinkrahene symbol', 'king of Adinkra', 'leadership symbol'],
    tags: ['royalty', 'leadership', 'greatness'],
    isPremium: true,
  },
  {
    id: 'adinkra-dwennimmen',
    type: 'adinkra-symbol',
    name: 'Dwennimmen',
    description: 'Ram\'s horns - humility with strength',
    symbolName: 'dwennimmen',
    meaning: 'Even the strong must be humble.',
    category: 'wisdom',
    promptKeywords: ['Dwennimmen symbol', 'ram horns Adinkra', 'humility and strength'],
    tags: ['wisdom', 'strength', 'humility'],
  },
  {
    id: 'adinkra-akoma',
    type: 'adinkra-symbol',
    name: 'Akoma',
    description: 'The heart - patience and tolerance',
    symbolName: 'akoma',
    meaning: 'Take heart, have patience.',
    category: 'human-relations',
    promptKeywords: ['Akoma symbol', 'Adinkra heart', 'patience symbol'],
    tags: ['patience', 'love', 'endurance'],
  },
];

const AFRICAN_COLORS: ColorSwatch[] = [
  { id: 'african-color-red', type: 'african-color', name: 'Life Force Red', hex: '#DC143C', rgb: { r: 220, g: 20, b: 60 }, region: 'west-africa', culturalMeaning: 'Life force, vitality, spiritual power', promptKeywords: ['African red', 'life force color', 'ceremonial red'], tags: ['spiritual', 'powerful'] },
  { id: 'african-color-gold', type: 'african-color', name: 'Royal Gold', hex: '#FFD700', rgb: { r: 255, g: 215, b: 0 }, region: 'west-africa', culturalMeaning: 'Wealth, royalty, prosperity', promptKeywords: ['African gold', 'royal gold', 'kente gold'], tags: ['royalty', 'wealth'], isPremium: true },
  { id: 'african-color-green', type: 'african-color', name: 'Growth Green', hex: '#228B22', rgb: { r: 34, g: 139, b: 34 }, region: 'west-africa', culturalMeaning: 'Growth, renewal, harvest', promptKeywords: ['African green', 'growth green', 'renewal color'], tags: ['nature', 'growth'] },
  { id: 'african-color-blue', type: 'african-color', name: 'Protection Blue', hex: '#1B3F8B', rgb: { r: 27, g: 63, b: 139 }, region: 'west-africa', culturalMeaning: 'Sky, peace, divine protection', promptKeywords: ['African indigo', 'protection blue', 'adire blue'], tags: ['spiritual', 'protection'] },
  { id: 'african-color-maasai-red', type: 'african-color', name: 'Maasai Red', hex: '#B22222', rgb: { r: 178, g: 34, b: 34 }, region: 'east-africa', culturalMeaning: 'Bravery, strength, warrior spirit', promptKeywords: ['Maasai red', 'warrior red', 'shuka red'], tags: ['warrior', 'strength'] },
  { id: 'african-color-sahara', type: 'african-color', name: 'Sahara Earth', hex: '#C19A6B', rgb: { r: 193, g: 154, b: 107 }, region: 'north-africa', culturalMeaning: 'Connection to earth and desert', promptKeywords: ['Sahara earth tone', 'desert color', 'natural brown'], tags: ['natural', 'earth'] },
];

const AFRICAN_GARMENTS: AfricanGarment[] = [
  {
    id: 'garment-boubou',
    type: 'african-garment',
    name: 'Grand Boubou',
    description: 'Flowing wide-sleeved robe worn across West Africa',
    garmentName: 'boubou',
    region: 'west-africa',
    gender: 'unisex',
    occasion: 'ceremonial',
    silhouette: 'Flowing A-line robe with wide sleeves, floor length',
    traditionalFabrics: ['Brocade', 'Bazin', 'Damask'],
    promptKeywords: ['Grand Boubou', 'flowing African robe', 'West African ceremonial dress'],
    tags: ['elegant', 'ceremonial', 'flowing'],
    isPremium: true,
  },
  {
    id: 'garment-dashiki',
    type: 'african-garment',
    name: 'Dashiki',
    description: 'Colorful loose-fitting shirt with V-shaped neckline',
    garmentName: 'dashiki',
    region: 'west-africa',
    gender: 'unisex',
    occasion: 'everyday',
    silhouette: 'Loose-fitting tunic with V-shaped collar',
    traditionalFabrics: ['Cotton', 'Ankara', 'Wax Print'],
    promptKeywords: ['Dashiki shirt', 'colorful African top', 'embroidered V-neck'],
    tags: ['colorful', 'casual', 'popular'],
  },
  {
    id: 'garment-agbada',
    type: 'african-garment',
    name: 'Agbada',
    description: 'Prestigious Yoruba four-piece attire with embroidery',
    garmentName: 'agbada',
    region: 'west-africa',
    gender: 'male',
    occasion: 'ceremonial',
    silhouette: 'Wide flowing outer robe with elaborate sleeves',
    traditionalFabrics: ['Aso Oke', 'Lace', 'Brocade'],
    promptKeywords: ['Agbada', 'Nigerian ceremonial', 'Yoruba robe'],
    tags: ['prestigious', 'embroidered', 'ceremonial'],
    isPremium: true,
  },
  {
    id: 'garment-kaftan',
    type: 'african-garment',
    name: 'Moroccan Kaftan',
    description: 'Luxurious floor-length robe with intricate embroidery',
    garmentName: 'kaftan',
    region: 'north-africa',
    gender: 'female',
    occasion: 'ceremonial',
    silhouette: 'Floor-length fitted robe with front opening',
    traditionalFabrics: ['Silk', 'Brocade', 'Velvet'],
    promptKeywords: ['Moroccan kaftan', 'embroidered robe', 'luxurious caftan'],
    tags: ['luxurious', 'embroidered', 'ceremonial'],
    isPremium: true,
  },
  {
    id: 'garment-maasai-shuka',
    type: 'african-garment',
    name: 'Maasai Shuka',
    description: 'Iconic red and blue plaid wrap',
    garmentName: 'shuka',
    region: 'east-africa',
    gender: 'unisex',
    occasion: 'everyday',
    silhouette: 'Rectangular cloth wrapped around body',
    traditionalFabrics: ['Cotton', 'Wool blend'],
    promptKeywords: ['Maasai Shuka', 'red African wrap', 'warrior blanket'],
    tags: ['iconic', 'warrior', 'cultural'],
  },
];

// ===== Prompt Enhancement Agents =====

const PROMPT_ENHANCEMENT_AGENTS: PromptEnhancementAgent[] = [
  {
    id: 'agent-fashion-enhancer',
    type: 'prompt-agent',
    name: 'Fashion Prompt Enhancer',
    description: 'Enhances prompts with fashion-specific terminology and details',
    agentType: 'fashion',
    categories: ['fashion'],
    endpoint: '/api/agents/fashion-prompt-enhancer',
    keywords: ['silhouette', 'drape', 'texture', 'styling'],
    promptKeywords: ['fashion details', 'garment terminology', 'style description'],
    tags: ['fashion', 'enhancement'],
  },
  {
    id: 'agent-creative-expander',
    type: 'prompt-agent',
    name: 'Creative Expander',
    description: 'Expands brief prompts into detailed, creative descriptions',
    agentType: 'expander',
    categories: ['fashion', 'interior', 'stock', 'story'],
    endpoint: '/api/agents/creative-expander',
    keywords: ['expand', 'detail', 'elaborate'],
    promptKeywords: ['detailed description', 'creative expansion'],
    tags: ['creative', 'universal'],
  },
  {
    id: 'agent-interior-specialist',
    type: 'prompt-agent',
    name: 'Interior Design Specialist',
    description: 'Adds architectural and interior design terminology',
    agentType: 'interior',
    categories: ['interior'],
    endpoint: '/api/agents/interior-specialist',
    keywords: ['architecture', 'spatial', 'lighting', 'materials'],
    promptKeywords: ['interior design terms', 'architectural details'],
    tags: ['interior', 'architecture'],
  },
  {
    id: 'agent-stock-photo',
    type: 'prompt-agent',
    name: 'Stock Photo Optimizer',
    description: 'Optimizes prompts for commercial stock photography',
    agentType: 'stock-photo',
    categories: ['stock'],
    endpoint: '/api/agents/stock-photo',
    keywords: ['commercial', 'licensing', 'composition'],
    promptKeywords: ['stock photography', 'commercial use'],
    tags: ['stock', 'commercial'],
  },
  {
    id: 'agent-narrative',
    type: 'prompt-agent',
    name: 'Story Scene Director',
    description: 'Enhances story scenes with cinematic direction',
    agentType: 'narrative',
    categories: ['story'],
    endpoint: '/api/agents/narrative',
    keywords: ['cinematic', 'dramatic', 'scene', 'composition'],
    promptKeywords: ['scene direction', 'cinematic framing'],
    tags: ['story', 'cinematic'],
  },
];

// ===== Tool Definitions by Category =====

const FASHION_TOOLS: ToolDefinition[] = [
  {
    id: 'tool-fabric-swatch',
    type: 'fabric-swatch',
    name: 'Fabric Swatches',
    description: 'Browse fabric materials and textures',
    icon: 'Texture',
    category: 'fashion',
    items: FABRIC_SWATCHES,
  },
  {
    id: 'tool-color-palette',
    type: 'color-palette',
    name: 'Color Palette',
    description: 'Fashion color swatches',
    icon: 'Palette',
    category: 'fashion',
    items: COLOR_SWATCHES,
  },
  {
    id: 'tool-pattern-library',
    type: 'pattern-library',
    name: 'Pattern Library',
    description: 'Prints and patterns',
    icon: 'GridView',
    category: 'fashion',
    items: PATTERN_ITEMS,
  },
  {
    id: 'tool-style-preset',
    type: 'style-preset',
    name: 'Style Presets',
    description: 'Fashion style templates',
    icon: 'Style',
    category: 'fashion',
    items: STYLE_PRESETS,
  },
  {
    id: 'tool-african-textile',
    type: 'african-textile',
    name: 'African Textiles',
    description: 'Traditional African fabrics - Kente, Adire, Bogolan & more',
    icon: 'Texture',
    category: 'fashion',
    items: AFRICAN_TEXTILES,
  },
  {
    id: 'tool-adinkra-symbol',
    type: 'adinkra-symbol',
    name: 'Adinkra Symbols',
    description: 'Ghanaian symbolic patterns',
    icon: 'AutoAwesome',
    category: 'fashion',
    items: ADINKRA_SYMBOLS,
  },
  {
    id: 'tool-african-color',
    type: 'african-color',
    name: 'African Colors',
    description: 'Traditional color symbolism',
    icon: 'Palette',
    category: 'fashion',
    items: AFRICAN_COLORS,
  },
  {
    id: 'tool-african-garment',
    type: 'african-garment',
    name: 'African Garments',
    description: 'Traditional silhouettes',
    icon: 'Style',
    category: 'fashion',
    items: AFRICAN_GARMENTS,
  },
  {
    id: 'tool-prompt-agents-fashion',
    type: 'prompt-agents',
    name: 'AI Enhancers',
    description: 'AI agents to enhance prompts',
    icon: 'AutoAwesome',
    category: 'fashion',
    items: PROMPT_ENHANCEMENT_AGENTS.filter(a => a.categories.includes('fashion')),
  },
];

const INTERIOR_TOOLS: ToolDefinition[] = [
  {
    id: 'tool-color-palette-interior',
    type: 'color-palette',
    name: 'Color Schemes',
    description: 'Interior color palettes',
    icon: 'Palette',
    category: 'interior',
    items: COLOR_SWATCHES.filter(c => ['neutral', 'earth', 'warm'].includes(c.colorFamily || '')),
  },
  {
    id: 'tool-prompt-agents-interior',
    type: 'prompt-agents',
    name: 'AI Enhancers',
    description: 'AI agents to enhance prompts',
    icon: 'AutoAwesome',
    category: 'interior',
    items: PROMPT_ENHANCEMENT_AGENTS.filter(a => a.categories.includes('interior')),
  },
];

const STORY_TOOLS: ToolDefinition[] = [
  {
    id: 'tool-prompt-agents-story',
    type: 'prompt-agents',
    name: 'AI Enhancers',
    description: 'AI agents to enhance prompts',
    icon: 'AutoAwesome',
    category: 'story',
    items: PROMPT_ENHANCEMENT_AGENTS.filter(a => a.categories.includes('story')),
  },
];

const STOCK_TOOLS: ToolDefinition[] = [
  {
    id: 'tool-color-palette-stock',
    type: 'color-palette',
    name: 'Color Grades',
    description: 'Color grading presets',
    icon: 'Palette',
    category: 'stock',
    items: COLOR_SWATCHES,
  },
  {
    id: 'tool-prompt-agents-stock',
    type: 'prompt-agents',
    name: 'AI Enhancers',
    description: 'AI agents to enhance prompts',
    icon: 'AutoAwesome',
    category: 'stock',
    items: PROMPT_ENHANCEMENT_AGENTS.filter(a => a.categories.includes('stock')),
  },
];

// ===== Service Functions =====

export const getToolbarConfig = async (category: BoardCategory): Promise<CategoryToolbarConfig> => {
  await new Promise(resolve => setTimeout(resolve, 50));

  let tools: ToolDefinition[];

  switch (category) {
    case 'fashion':
      tools = FASHION_TOOLS;
      break;
    case 'interior':
      tools = INTERIOR_TOOLS;
      break;
    case 'story':
      tools = STORY_TOOLS;
      break;
    case 'stock':
      tools = STOCK_TOOLS;
      break;
    default:
      tools = [];
  }

  return { category, tools };
};

export const getToolItems = async (toolId: string): Promise<ToolbarItem[]> => {
  await new Promise(resolve => setTimeout(resolve, 50));

  const allTools = [...FASHION_TOOLS, ...INTERIOR_TOOLS, ...STORY_TOOLS, ...STOCK_TOOLS];
  const tool = allTools.find(t => t.id === toolId);

  return tool?.items || [];
};

export const searchToolbarItems = async (
  category: BoardCategory,
  query: string
): Promise<ToolbarItem[]> => {
  await new Promise(resolve => setTimeout(resolve, 100));

  const config = await getToolbarConfig(category);
  const allItems = config.tools.flatMap(tool => tool.items || []);

  const lowerQuery = query.toLowerCase();
  return allItems.filter(item =>
    item.name.toLowerCase().includes(lowerQuery) ||
    item.description?.toLowerCase().includes(lowerQuery) ||
    item.tags?.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
    item.promptKeywords?.some(kw => kw.toLowerCase().includes(lowerQuery))
  );
};

export const getAllSwatchesForPrompt = (category: BoardCategory): ToolbarItem[] => {
  const allTools = [...FASHION_TOOLS, ...INTERIOR_TOOLS, ...STORY_TOOLS, ...STOCK_TOOLS];
  const categoryTools = allTools.filter(t => t.category === category);
  return categoryTools.flatMap(tool => tool.items);
};

export default {
  getToolbarConfig,
  getToolItems,
  searchToolbarItems,
  getAllSwatchesForPrompt,
};
