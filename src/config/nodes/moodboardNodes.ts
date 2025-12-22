/**
 * Moodboard & Brand Identity Nodes - Creative direction, branding, visual themes
 */
import type { NodeDefinition } from '@/models/canvas';

export const moodboardNodes: NodeDefinition[] = [
  // Moodboard Generator
  {
    type: 'moodboardGenerator',
    category: 'moodboard',
    label: 'Moodboard Generator',
    displayName: 'AI Moodboard',
    description: 'Generate cohesive moodboards from themes, keywords, or reference images.',
    quickHelp: 'Theme or images → Beautiful curated moodboard',
    useCase: 'Creative direction, brand development, project kickoff',
    icon: 'ColorLens',
    aiModel: 'flux-2-pro',
    tier: 'creative',
    inputs: [
      { id: 'theme', name: 'Theme Description', type: 'text', required: true },
      { id: 'references', name: 'Reference Images', type: 'image', multiple: true },
    ],
    outputs: [
      { id: 'moodboard', name: 'Moodboard', type: 'moodboard' },
      { id: 'colorPalette', name: 'Extracted Colors', type: 'colorPalette' },
    ],
    parameters: [
      { id: 'style', name: 'Moodboard Style', type: 'select', default: 'collage', options: [
        { label: 'Collage Grid', value: 'collage' },
        { label: 'Pinterest Style', value: 'pinterest' },
        { label: 'Minimal Layout', value: 'minimal' },
        { label: 'Magazine Spread', value: 'magazine' },
        { label: 'Scattered/Organic', value: 'scattered' },
      ]},
      { id: 'mood', name: 'Mood/Tone', type: 'select', default: 'balanced', options: [
        { label: 'Light & Airy', value: 'light' },
        { label: 'Dark & Moody', value: 'dark' },
        { label: 'Warm & Cozy', value: 'warm' },
        { label: 'Cool & Minimal', value: 'cool' },
        { label: 'Vibrant & Bold', value: 'vibrant' },
        { label: 'Balanced/Neutral', value: 'balanced' },
      ]},
      { id: 'imageCount', name: 'Number of Images', type: 'slider', default: 6, min: 3, max: 12, step: 1 },
      { id: 'includeText', name: 'Include Typography', type: 'boolean', default: false },
    ],
    defaultDisplayMode: 'expanded',
    slots: {
      preview: { type: 'image', aspectRatio: '4:3', showZoom: true },
      parameters: { layout: 'stack', visibleInModes: ['standard', 'expanded'] },
      actions: { primary: 'execute', secondary: ['download', 'duplicate'], showProgress: true },
    },
  },

  // Color Palette Extractor
  {
    type: 'colorPaletteExtractor',
    category: 'moodboard',
    label: 'Color Extractor',
    displayName: 'Color Palette Extractor',
    description: 'Extract and generate color palettes from images, with harmonious variations.',
    quickHelp: 'Image → Extracted color palette with HEX/RGB values',
    useCase: 'Brand colors, design systems, color matching',
    icon: 'Palette',
    aiModel: 'gemini-2.5-flash',
    inputs: [
      { id: 'sourceImage', name: 'Source Image', type: 'image', required: true },
    ],
    outputs: [
      { id: 'palette', name: 'Color Palette', type: 'colorPalette' },
      { id: 'variations', name: 'Color Variations', type: 'colorPalette', multiple: true },
    ],
    parameters: [
      { id: 'colorCount', name: 'Number of Colors', type: 'slider', default: 5, min: 3, max: 10, step: 1 },
      { id: 'paletteType', name: 'Palette Type', type: 'select', default: 'dominant', options: [
        { label: 'Dominant Colors', value: 'dominant' },
        { label: 'Harmonious', value: 'harmonious' },
        { label: 'Complementary', value: 'complementary' },
        { label: 'Analogous', value: 'analogous' },
        { label: 'Triadic', value: 'triadic' },
      ]},
      { id: 'includeNeutrals', name: 'Include Neutrals', type: 'boolean', default: true },
    ],
    defaultDisplayMode: 'standard',
    slots: {
      preview: { type: 'colorSwatches', aspectRatio: 'auto' },
      parameters: { layout: 'inline', visibleInModes: ['standard', 'expanded'] },
      actions: { primary: 'execute', secondary: ['download'], showProgress: true },
    },
  },

  // Brand Kit Generator
  {
    type: 'brandKitGenerator',
    category: 'brandIdentity',
    label: 'Brand Kit Generator',
    displayName: 'AI Brand Kit',
    description: 'Generate complete brand identity kits including colors, typography, and visual elements.',
    quickHelp: 'Brand concept → Complete visual identity system',
    useCase: 'Brand creation, startup branding, rebrand projects',
    icon: 'Business',
    aiModel: 'gemini-2.5-flash',
    tier: 'production',
    inputs: [
      { id: 'brandDescription', name: 'Brand Description', type: 'text', required: true },
      { id: 'inspirationImages', name: 'Inspiration', type: 'image', multiple: true },
    ],
    outputs: [
      { id: 'brandKit', name: 'Brand Kit', type: 'brandKit' },
      { id: 'colorPalette', name: 'Brand Colors', type: 'colorPalette' },
      { id: 'moodboard', name: 'Brand Moodboard', type: 'moodboard' },
    ],
    parameters: [
      { id: 'industry', name: 'Industry', type: 'select', default: 'tech', options: [
        { label: 'Technology', value: 'tech' },
        { label: 'Fashion', value: 'fashion' },
        { label: 'Food & Beverage', value: 'food' },
        { label: 'Health & Wellness', value: 'health' },
        { label: 'Finance', value: 'finance' },
        { label: 'Creative/Agency', value: 'creative' },
        { label: 'E-commerce', value: 'ecommerce' },
        { label: 'Non-Profit', value: 'nonprofit' },
      ]},
      { id: 'personality', name: 'Brand Personality', type: 'select', default: 'professional', options: [
        { label: 'Professional & Trustworthy', value: 'professional' },
        { label: 'Playful & Fun', value: 'playful' },
        { label: 'Luxury & Premium', value: 'luxury' },
        { label: 'Modern & Innovative', value: 'modern' },
        { label: 'Earthy & Organic', value: 'organic' },
        { label: 'Bold & Edgy', value: 'bold' },
      ]},
      { id: 'includeTypography', name: 'Include Typography Suggestions', type: 'boolean', default: true },
      { id: 'includePatterns', name: 'Include Brand Patterns', type: 'boolean', default: true },
    ],
    defaultDisplayMode: 'expanded',
    slots: {
      preview: { type: 'image', aspectRatio: '16:9', showZoom: true },
      parameters: { layout: 'stack', visibleInModes: ['standard', 'expanded'] },
      actions: { primary: 'execute', secondary: ['download'], showProgress: true },
    },
  },

  // Typography Suggester
  {
    type: 'typographySuggester',
    category: 'brandIdentity',
    label: 'Typography Suggester',
    displayName: 'AI Font Pairing',
    description: 'Get font pairing suggestions that match your brand style and use case.',
    quickHelp: 'Brand style → Perfect font combinations',
    useCase: 'Brand typography, web design, print materials',
    icon: 'FontDownload',
    aiModel: 'gemini-2.5-flash',
    inputs: [
      { id: 'brandStyle', name: 'Brand Style Reference', type: 'image' },
      { id: 'colorPalette', name: 'Color Palette', type: 'colorPalette' },
    ],
    outputs: [
      { id: 'typography', name: 'Typography Suggestions', type: 'typography' },
      { id: 'samples', name: 'Font Samples', type: 'image', multiple: true },
    ],
    parameters: [
      { id: 'style', name: 'Typography Style', type: 'select', default: 'modern', options: [
        { label: 'Modern Sans-Serif', value: 'modern' },
        { label: 'Classic Serif', value: 'classic' },
        { label: 'Playful Display', value: 'playful' },
        { label: 'Elegant Script', value: 'elegant' },
        { label: 'Bold Geometric', value: 'geometric' },
        { label: 'Minimal Clean', value: 'minimal' },
      ]},
      { id: 'useCase', name: 'Primary Use', type: 'select', default: 'web', options: [
        { label: 'Web/Digital', value: 'web' },
        { label: 'Print/Editorial', value: 'print' },
        { label: 'Social Media', value: 'social' },
        { label: 'Branding/Logo', value: 'branding' },
      ]},
    ],
    defaultDisplayMode: 'standard',
    slots: {
      preview: { type: 'image', aspectRatio: '16:9' },
      parameters: { layout: 'inline', visibleInModes: ['standard', 'expanded'] },
      actions: { primary: 'execute', showProgress: true },
    },
  },

  // Aesthetic Analyzer
  {
    type: 'aestheticAnalyzer',
    category: 'moodboard',
    label: 'Aesthetic Analyzer',
    displayName: 'Visual Style Analyzer',
    description: 'Analyze images to extract aesthetic qualities, style tags, and visual characteristics.',
    quickHelp: 'Image → Detailed aesthetic analysis',
    useCase: 'Style identification, trend research, creative direction',
    icon: 'AutoAwesome',
    aiModel: 'gemini-2.5-flash',
    inputs: [
      { id: 'images', name: 'Images to Analyze', type: 'image', required: true, multiple: true },
    ],
    outputs: [
      { id: 'analysis', name: 'Aesthetic Analysis', type: 'aesthetic' },
      { id: 'styleTags', name: 'Style Tags', type: 'text' },
      { id: 'colorPalette', name: 'Detected Colors', type: 'colorPalette' },
    ],
    parameters: [
      { id: 'analysisDepth', name: 'Analysis Depth', type: 'select', default: 'standard', options: [
        { label: 'Quick Overview', value: 'quick' },
        { label: 'Standard Analysis', value: 'standard' },
        { label: 'Deep Analysis', value: 'deep' },
      ]},
      { id: 'includeComparison', name: 'Compare to Trends', type: 'boolean', default: false },
    ],
    defaultDisplayMode: 'standard',
    slots: {
      preview: { type: 'text', aspectRatio: 'auto' },
      parameters: { layout: 'inline', visibleInModes: ['standard', 'expanded'] },
      actions: { primary: 'execute', showProgress: true },
    },
  },

  // Texture Generator
  {
    type: 'textureGenerator',
    category: 'moodboard',
    label: 'Texture Generator',
    displayName: 'Seamless Texture Generator',
    description: 'Generate seamless textures and patterns for backgrounds, materials, and designs.',
    quickHelp: 'Description → Seamless tileable texture',
    useCase: '3D textures, backgrounds, material design',
    icon: 'Wallpaper',
    aiModel: 'flux-2-pro',
    inputs: [
      { id: 'description', name: 'Texture Description', type: 'text', required: true },
      { id: 'reference', name: 'Reference Image', type: 'image' },
    ],
    outputs: [
      { id: 'texture', name: 'Seamless Texture', type: 'texture' },
      { id: 'variations', name: 'Variations', type: 'texture', multiple: true },
    ],
    parameters: [
      { id: 'textureType', name: 'Texture Type', type: 'select', default: 'fabric', options: [
        { label: 'Fabric/Textile', value: 'fabric' },
        { label: 'Wood Grain', value: 'wood' },
        { label: 'Stone/Marble', value: 'stone' },
        { label: 'Metal', value: 'metal' },
        { label: 'Paper/Organic', value: 'paper' },
        { label: 'Abstract Pattern', value: 'abstract' },
      ]},
      { id: 'scale', name: 'Pattern Scale', type: 'select', default: 'medium', options: [
        { label: 'Fine/Small', value: 'small' },
        { label: 'Medium', value: 'medium' },
        { label: 'Large/Bold', value: 'large' },
      ]},
      { id: 'seamless', name: 'Make Seamless', type: 'boolean', default: true },
      { id: 'resolution', name: 'Resolution', type: 'select', default: '1024', options: [
        { label: '512x512', value: '512' },
        { label: '1024x1024', value: '1024' },
        { label: '2048x2048', value: '2048' },
      ]},
    ],
    defaultDisplayMode: 'standard',
    slots: {
      preview: { type: 'image', aspectRatio: '1:1', showZoom: true, showTiled: true },
      parameters: { layout: 'inline', visibleInModes: ['standard', 'expanded'] },
      actions: { primary: 'execute', secondary: ['download'], showProgress: true },
    },
  },

  // Moodboard Layout
  {
    type: 'moodboardLayout',
    category: 'moodboard',
    label: 'Moodboard Layout',
    displayName: 'Layout Arranger',
    description: 'Arrange images and elements into beautiful moodboard compositions.',
    quickHelp: 'Images → Curated layout arrangement',
    useCase: 'Design presentations, client boards, creative direction',
    icon: 'Dashboard',
    aiModel: 'flux-2-pro',
    inputs: [
      { id: 'images', name: 'Images', type: 'image', multiple: true, required: true },
      { id: 'colorPalette', name: 'Color Palette', type: 'colorPalette' },
      { id: 'title', name: 'Board Title', type: 'text' },
    ],
    outputs: [
      { id: 'moodboard', name: 'Arranged Moodboard', type: 'moodboard' },
      { id: 'variations', name: 'Layout Variations', type: 'moodboard', multiple: true },
    ],
    parameters: [
      { id: 'layoutStyle', name: 'Layout Style', type: 'select', default: 'grid', options: [
        { label: 'Clean Grid', value: 'grid' },
        { label: 'Collage/Organic', value: 'collage' },
        { label: 'Polaroid Stack', value: 'polaroid' },
        { label: 'Magazine Spread', value: 'magazine' },
        { label: 'Pinterest Style', value: 'pinterest' },
        { label: 'Minimal White Space', value: 'minimal' },
      ]},
      { id: 'aspectRatio', name: 'Output Size', type: 'select', default: '4:3', options: [
        { label: 'Landscape (16:9)', value: '16:9' },
        { label: 'Standard (4:3)', value: '4:3' },
        { label: 'Square (1:1)', value: '1:1' },
        { label: 'Portrait (3:4)', value: '3:4' },
        { label: 'A4 Document', value: 'a4' },
      ]},
      { id: 'includeLabels', name: 'Include Labels', type: 'boolean', default: false },
      { id: 'backgroundColor', name: 'Background', type: 'select', default: 'white', options: [
        { label: 'White', value: 'white' },
        { label: 'Off-White/Cream', value: 'cream' },
        { label: 'Light Gray', value: 'lightGray' },
        { label: 'Black', value: 'black' },
        { label: 'From Palette', value: 'fromPalette' },
      ]},
    ],
    defaultDisplayMode: 'standard',
    slots: {
      preview: { type: 'image', aspectRatio: '4:3', showZoom: true },
      parameters: { layout: 'stack', visibleInModes: ['standard', 'expanded'] },
      actions: { primary: 'execute', secondary: ['download'], showProgress: true },
    },
  },

  // Moodboard Export
  {
    type: 'moodboardExport',
    category: 'moodboard',
    label: 'Moodboard Export',
    displayName: 'Export & Share',
    description: 'Export moodboards as high-quality PDFs, images, or shareable presentations.',
    quickHelp: 'Moodboard → Export-ready files',
    useCase: 'Client presentations, portfolio, documentation',
    icon: 'PictureAsPdf',
    aiModel: 'none',
    inputs: [
      { id: 'moodboard', name: 'Moodboard', type: 'moodboard', required: true },
      { id: 'brandKit', name: 'Brand Kit (for styling)', type: 'brandKit' },
      { id: 'title', name: 'Project Title', type: 'text' },
    ],
    outputs: [
      { id: 'exportedFile', name: 'Exported File', type: 'any' },
    ],
    parameters: [
      { id: 'format', name: 'Export Format', type: 'select', default: 'pdf', options: [
        { label: 'PDF Document', value: 'pdf' },
        { label: 'PNG Image (High-res)', value: 'png' },
        { label: 'JPG Image', value: 'jpg' },
        { label: 'PowerPoint Slide', value: 'pptx' },
      ]},
      { id: 'quality', name: 'Quality', type: 'select', default: 'high', options: [
        { label: 'Web (Fast, smaller file)', value: 'web' },
        { label: 'High (Recommended)', value: 'high' },
        { label: 'Print (300 DPI)', value: 'print' },
      ]},
      { id: 'includeColorSwatches', name: 'Include Color Swatches', type: 'boolean', default: true },
      { id: 'includeCredits', name: 'Include Image Credits', type: 'boolean', default: false },
    ],
    defaultDisplayMode: 'compact',
    slots: {
      preview: { type: 'image', aspectRatio: '4:3' },
      parameters: { layout: 'inline', visibleInModes: ['standard', 'expanded'] },
      actions: { primary: 'execute', secondary: ['download'], showProgress: true },
    },
  },

  // Visual Theme Generator
  {
    type: 'visualThemeGenerator',
    category: 'moodboard',
    label: 'Theme Generator',
    displayName: 'Visual Theme Creator',
    description: 'Generate cohesive visual themes with colors, typography, and imagery style.',
    quickHelp: 'Concept → Complete visual theme',
    useCase: 'Brand development, project theming, creative direction',
    icon: 'AutoAwesome',
    aiModel: 'flux-2-pro',
    inputs: [
      { id: 'concept', name: 'Theme Concept', type: 'text', required: true },
      { id: 'references', name: 'Reference Images', type: 'image', multiple: true },
    ],
    outputs: [
      { id: 'moodboard', name: 'Theme Moodboard', type: 'moodboard' },
      { id: 'colorPalette', name: 'Color Palette', type: 'colorPalette' },
      { id: 'typography', name: 'Typography Pairing', type: 'typography' },
      { id: 'styleGuide', name: 'Style Guidelines', type: 'text' },
    ],
    parameters: [
      { id: 'themeStyle', name: 'Theme Style', type: 'select', default: 'modern', options: [
        { label: 'Modern & Minimal', value: 'modern' },
        { label: 'Luxury & Elegant', value: 'luxury' },
        { label: 'Bold & Vibrant', value: 'bold' },
        { label: 'Soft & Organic', value: 'organic' },
        { label: 'Vintage & Retro', value: 'vintage' },
        { label: 'Dark & Moody', value: 'dark' },
        { label: 'Light & Airy', value: 'light' },
      ]},
      { id: 'industry', name: 'Industry/Context', type: 'select', default: 'general', options: [
        { label: 'Fashion & Beauty', value: 'fashion' },
        { label: 'Food & Hospitality', value: 'food' },
        { label: 'Tech & Startup', value: 'tech' },
        { label: 'Wellness & Lifestyle', value: 'wellness' },
        { label: 'Creative & Arts', value: 'creative' },
        { label: 'Corporate & Professional', value: 'corporate' },
        { label: 'General', value: 'general' },
      ]},
      { id: 'colorMood', name: 'Color Mood', type: 'select', default: 'balanced', options: [
        { label: 'Warm Tones', value: 'warm' },
        { label: 'Cool Tones', value: 'cool' },
        { label: 'Neutral/Earthy', value: 'neutral' },
        { label: 'Balanced Mix', value: 'balanced' },
        { label: 'Monochromatic', value: 'mono' },
      ]},
    ],
    defaultDisplayMode: 'expanded',
    slots: {
      preview: { type: 'image', aspectRatio: '4:3', showZoom: true },
      parameters: { layout: 'stack', visibleInModes: ['standard', 'expanded'] },
      actions: { primary: 'execute', secondary: ['download'], showProgress: true },
    },
  },

  // Inspiration Curator
  {
    type: 'inspirationCurator',
    category: 'moodboard',
    label: 'Inspiration Curator',
    displayName: 'AI Inspiration Finder',
    description: 'Curate inspiration images and references based on concepts and keywords.',
    quickHelp: 'Keywords → Curated inspiration collection',
    useCase: 'Research phase, creative exploration, reference gathering',
    icon: 'Search',
    aiModel: 'gemini-2.5-flash',
    inputs: [
      { id: 'keywords', name: 'Keywords/Concepts', type: 'text', required: true },
      { id: 'avoidTerms', name: 'Avoid (Optional)', type: 'text' },
    ],
    outputs: [
      { id: 'inspirationImages', name: 'Inspiration Images', type: 'image', multiple: true },
      { id: 'moodboard', name: 'Curated Moodboard', type: 'moodboard' },
      { id: 'relatedKeywords', name: 'Related Keywords', type: 'text' },
    ],
    parameters: [
      { id: 'category', name: 'Inspiration Category', type: 'select', default: 'general', options: [
        { label: 'General/Mixed', value: 'general' },
        { label: 'Photography', value: 'photography' },
        { label: 'Graphic Design', value: 'graphicDesign' },
        { label: 'Interior Design', value: 'interior' },
        { label: 'Fashion', value: 'fashion' },
        { label: 'Architecture', value: 'architecture' },
        { label: 'Art & Illustration', value: 'art' },
        { label: 'Typography', value: 'typography' },
      ]},
      { id: 'colorFilter', name: 'Color Filter', type: 'select', default: 'any', options: [
        { label: 'Any Colors', value: 'any' },
        { label: 'Warm Tones', value: 'warm' },
        { label: 'Cool Tones', value: 'cool' },
        { label: 'Neutral/Earthy', value: 'neutral' },
        { label: 'Black & White', value: 'bw' },
        { label: 'Colorful/Vibrant', value: 'colorful' },
      ]},
      { id: 'numImages', name: 'Number of Images', type: 'slider', default: 12, min: 6, max: 24, step: 1 },
    ],
    defaultDisplayMode: 'expanded',
    slots: {
      preview: { type: 'image', aspectRatio: '4:3', showZoom: true },
      parameters: { layout: 'inline', visibleInModes: ['standard', 'expanded'] },
      actions: { primary: 'execute', showProgress: true },
    },
  },
];
