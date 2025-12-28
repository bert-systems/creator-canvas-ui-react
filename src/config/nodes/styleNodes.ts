/**
 * Style & Composite Nodes - Style extraction, transfer, fashion compositing
 */
import type { NodeDefinition } from '@/models/canvas';

export const styleNodes: NodeDefinition[] = [
  // STYLE NODES
  {
    type: 'styleDNA',
    category: 'style',
    label: 'Style DNA',
    displayName: 'Extract Style',
    description: 'Capture the visual style from reference images (colors, textures, mood) for reuse.',
    quickHelp: 'Reference images → Reusable style profile',
    useCase: 'Brand consistency, art direction, mood matching',
    icon: 'Palette',
    inputs: [
      { id: 'references', name: 'References', type: 'image', multiple: true, required: true },
    ],
    outputs: [{ id: 'style', name: 'Style DNA', type: 'style' }],
    parameters: [
      { id: 'styleName', name: 'Style Name', type: 'text', default: '' },
      { id: 'colorWeight', name: 'Color Weight', type: 'slider', default: 0.5, min: 0, max: 1, step: 0.1 },
      { id: 'textureWeight', name: 'Texture Weight', type: 'slider', default: 0.5, min: 0, max: 1, step: 0.1 },
    ],
    defaultDisplayMode: 'standard',
    slots: {
      preview: { type: 'colorSwatches', aspectRatio: 'auto' },
      parameters: { layout: 'inline', visibleInModes: ['standard', 'expanded'], priorityParams: ['styleName'] },
      actions: { primary: 'execute', showProgress: true },
    },
  },
  {
    type: 'styleTransfer',
    category: 'style',
    label: 'Style Transfer',
    displayName: 'Apply Style',
    description: 'Apply a captured style to any image while preserving the original content.',
    quickHelp: 'Image + Style → Styled image',
    useCase: 'Artistic effects, brand styling, visual consistency',
    icon: 'Style',
    inputs: [
      { id: 'target', name: 'Target Image', type: 'image', required: true },
      { id: 'style', name: 'Style', type: 'style', required: true },
    ],
    outputs: [{ id: 'image', name: 'Styled Image', type: 'image' }],
    parameters: [
      { id: 'strength', name: 'Transfer Strength', type: 'slider', default: 0.7, min: 0, max: 1, step: 0.1 },
    ],
    defaultDisplayMode: 'standard',
    slots: {
      preview: { type: 'comparison', aspectRatio: 'auto', showZoom: true },
      parameters: { layout: 'inline', visibleInModes: ['standard', 'expanded'], priorityParams: ['strength'] },
      actions: { primary: 'execute', secondary: ['download'], showProgress: true },
    },
  },
  {
    type: 'loraTraining',
    category: 'style',
    label: 'LoRA Training',
    displayName: 'Train Custom Style',
    description: 'Train a personalized AI style from your images. Use the trigger word to activate it.',
    quickHelp: 'Your images → Custom AI style',
    useCase: 'Personal art style, product line consistency, brand identity',
    icon: 'ModelTraining',
    inputs: [
      { id: 'trainingImages', name: 'Training Images', type: 'image', multiple: true, required: true },
    ],
    outputs: [{ id: 'lora', name: 'LoRA Model', type: 'style' }],
    parameters: [
      { id: 'loraName', name: 'LoRA Name', type: 'text', default: '' },
      { id: 'triggerWord', name: 'Trigger Word', type: 'text', default: '' },
      { id: 'steps', name: 'Training Steps', type: 'number', default: 1000, min: 100, max: 5000 },
    ],
    defaultDisplayMode: 'standard',
    slots: {
      preview: { type: 'gallery', aspectRatio: 'auto' },
      parameters: { layout: 'stack', visibleInModes: ['standard', 'expanded'], priorityParams: ['loraName', 'triggerWord'] },
      actions: { primary: 'execute', showProgress: true, showCost: true },
    },
  },

  // COMPOSITE / FASHION NODES
  {
    type: 'virtualTryOn',
    category: 'composite',
    label: 'Virtual Try-On',
    displayName: 'Outfit Visualizer',
    description: 'See how any garment looks on a model. Upload a person photo and clothing item to create a realistic try-on image.',
    quickHelp: 'Model photo + Garment → See how it looks!',
    useCase: 'Fashion lookbooks, e-commerce product visualization',
    icon: 'Checkroom',
    aiModel: 'multi-provider',
    tier: 'production',
    inputs: [
      { id: 'model', name: 'Model Photo (Image Upload)', type: 'image', required: true },
      { id: 'garment', name: 'Garment (Image Upload)', type: 'image', required: true },
    ],
    outputs: [{ id: 'image', name: 'Result', type: 'image' }],
    parameters: [
      { id: 'provider', name: 'Provider', type: 'select', default: 'fashn', options: [
        { label: 'FASHN (Recommended)', value: 'fashn' },
        { label: 'IDM-VTON (Complex Garments)', value: 'idm-vton' },
        { label: 'CAT-VTON (Fast)', value: 'cat-vton' },
        { label: 'Leffa (Balanced)', value: 'leffa' },
        { label: 'Kling-Kolors (High Quality)', value: 'kling-kolors' },
      ]},
      { id: 'category', name: 'Garment Type', type: 'select', default: 'tops', options: [
        { label: 'Tops', value: 'tops' },
        { label: 'Bottoms', value: 'bottoms' },
        { label: 'One-Pieces/Dresses', value: 'one-pieces' },
      ]},
      { id: 'mode', name: 'Quality Mode', type: 'select', default: 'quality', options: [
        { label: 'Quality', value: 'quality' },
        { label: 'Performance (Fast)', value: 'performance' },
        { label: 'Balanced', value: 'balanced' },
      ]},
      { id: 'garmentPhotoType', name: 'Garment Photo', type: 'select', default: 'auto', options: [
        { label: 'Auto Detect', value: 'auto' },
        { label: 'Flat Lay', value: 'flat-lay' },
        { label: 'Model', value: 'model' },
      ]},
    ],
    defaultDisplayMode: 'standard',
    slots: {
      preview: { type: 'image', aspectRatio: '3:4', showZoom: true },
      parameters: { layout: 'inline', visibleInModes: ['standard', 'expanded'], priorityParams: ['provider', 'category'] },
      actions: { primary: 'execute', secondary: ['download', 'duplicate'], showProgress: true },
    },
  },
  {
    type: 'clothesSwap',
    category: 'composite',
    label: 'Clothes Swap',
    displayName: 'Swap Garment (Image)',
    description: 'Replace clothing in a photo with a different garment using an image reference. Uses AI to seamlessly blend.',
    quickHelp: 'Person + Garment photo → Swapped outfit',
    useCase: 'Fashion variations, outfit exploration, lookbook creation',
    icon: 'SwapHoriz',
    aiModel: 'fashn',
    tier: 'production',
    inputs: [
      { id: 'person', name: 'Person Photo (Image Upload)', type: 'image', required: true },
      { id: 'garment', name: 'Garment Photo (Image Upload)', type: 'image', required: true },
    ],
    outputs: [{ id: 'image', name: 'Result', type: 'image' }],
    parameters: [
      { id: 'garmentDescription', name: 'Garment Description (Optional)', type: 'text', default: '' },
      { id: 'category', name: 'Garment Type', type: 'select', default: 'tops', options: [
        { label: 'Tops', value: 'tops' },
        { label: 'Bottoms', value: 'bottoms' },
        { label: 'Dresses', value: 'dresses' },
        { label: 'Outerwear', value: 'outerwear' },
      ]},
    ],
    defaultDisplayMode: 'standard',
    slots: {
      preview: { type: 'image', aspectRatio: '3:4', showZoom: true },
      parameters: { layout: 'inline', visibleInModes: ['standard', 'expanded'], priorityParams: ['category'] },
      actions: { primary: 'execute', secondary: ['download'], showProgress: true },
    },
  },
  {
    type: 'runwayAnimation',
    category: 'composite',
    label: 'Runway Animation',
    displayName: 'Fashion Catwalk',
    description: 'Turn a fashion photo into a runway walk video. Perfect for lookbooks and collections.',
    quickHelp: 'Fashion photo → Model walking video',
    useCase: 'Digital fashion shows, lookbook videos, collection presentations',
    icon: 'DirectionsWalk',
    aiModel: 'kling',
    inputs: [
      { id: 'image', name: 'Fashion Photo (Image Upload)', type: 'image', required: true },
    ],
    outputs: [{ id: 'video', name: 'Runway Video', type: 'video' }],
    parameters: [
      { id: 'walkStyle', name: 'Walk Style', type: 'select', default: 'commercial', options: [
        { label: 'Haute Couture', value: 'haute-couture' },
        { label: 'Ready-to-Wear', value: 'rtw' },
        { label: 'Commercial', value: 'commercial' },
        { label: 'Editorial', value: 'editorial' },
        { label: 'Streetwear', value: 'streetwear' },
      ]},
      { id: 'duration', name: 'Duration', type: 'select', default: '5s', options: [
        { label: '5 seconds', value: '5s' },
        { label: '10 seconds', value: '10s' },
      ]},
      { id: 'cameraStyle', name: 'Camera Style', type: 'select', default: 'follow', options: [
        { label: 'Static', value: 'static' },
        { label: 'Follow Model', value: 'follow' },
        { label: 'Crane Shot', value: 'crane' },
        { label: 'Multi-Angle', value: 'multi-angle' },
      ]},
    ],
    defaultDisplayMode: 'standard',
    slots: {
      preview: { type: 'video', aspectRatio: '9:16' },
      parameters: { layout: 'accordion', visibleInModes: ['standard', 'expanded'], priorityParams: ['walkStyle', 'duration'] },
      actions: { primary: 'execute', secondary: ['download'], showProgress: true },
    },
  },
  {
    type: 'storyboardAutopilot',
    category: 'composite',
    label: 'Storyboard Autopilot',
    displayName: 'Auto Storyboard',
    description: 'Automatically generate a visual storyboard from your script. Maintains character consistency.',
    quickHelp: 'Script → Visual storyboard panels',
    useCase: 'Film pre-production, comic creation, pitch decks',
    icon: 'AutoStories',
    inputs: [
      { id: 'script', name: 'Script', type: 'text', required: true },
      { id: 'characters', name: 'Characters', type: 'character', multiple: true },
      { id: 'style', name: 'Visual Style', type: 'style' },
    ],
    outputs: [
      { id: 'frames', name: 'Storyboard Frames', type: 'image', multiple: true },
    ],
    parameters: [
      { id: 'panelCount', name: 'Panel Count', type: 'number', default: 6, min: 3, max: 12 },
      { id: 'aspectRatio', name: 'Panel Ratio', type: 'select', default: '16:9', options: [
        { label: '16:9 (Widescreen)', value: '16:9' },
        { label: '2.35:1 (Cinematic)', value: '2.35:1' },
        { label: '1:1 (Square)', value: '1:1' },
      ]},
    ],
    defaultDisplayMode: 'standard',
    slots: {
      preview: { type: 'gallery', aspectRatio: '16:9', showZoom: true },
      parameters: { layout: 'inline', visibleInModes: ['standard', 'expanded'], priorityParams: ['panelCount', 'aspectRatio'] },
      actions: { primary: 'execute', secondary: ['download'], showProgress: true },
    },
  },
  {
    type: 'collectionSlideshow',
    category: 'composite',
    label: 'Collection Slideshow',
    displayName: 'Video Slideshow',
    description: 'Create a professional video from multiple images with smooth transitions and optional music.',
    quickHelp: 'Images + Music → Polished video',
    useCase: 'Portfolio reels, collection showcases, social media content',
    icon: 'Slideshow',
    inputs: [
      { id: 'images', name: 'Collection Images', type: 'image', multiple: true, required: true },
      { id: 'music', name: 'Background Music', type: 'audio' },
    ],
    outputs: [{ id: 'video', name: 'Slideshow Video', type: 'video' }],
    parameters: [
      { id: 'transition', name: 'Transition Style', type: 'select', default: 'elegant', options: [
        { label: 'Elegant Fade', value: 'elegant' },
        { label: 'Dynamic Zoom', value: 'dynamic' },
        { label: 'Smooth Pan', value: 'pan' },
      ]},
      { id: 'imageDuration', name: 'Image Duration (s)', type: 'number', default: 3, min: 1, max: 10 },
    ],
    defaultDisplayMode: 'standard',
    slots: {
      preview: { type: 'video', aspectRatio: '16:9' },
      parameters: { layout: 'inline', visibleInModes: ['standard', 'expanded'], priorityParams: ['transition', 'imageDuration'] },
      actions: { primary: 'execute', secondary: ['download'], showProgress: true },
    },
  },
];
