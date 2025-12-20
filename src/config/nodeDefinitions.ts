import type { NodeDefinition } from '@/models/canvas';

export const nodeDefinitions: NodeDefinition[] = [
  // ============================================================================
  // INPUT NODES
  // ============================================================================
  {
    type: 'textInput',
    category: 'input',
    label: 'Text Input',
    displayName: 'Text / Prompt',
    description: 'Enter text prompts or descriptions to drive AI generation',
    quickHelp: 'Type what you want to create. Be descriptive!',
    useCase: 'Describe a fashion design, scene, or any creative concept',
    icon: 'TextFields',
    inputs: [],
    outputs: [{ id: 'text', name: 'Text', type: 'text' }],
    parameters: [
      { id: 'text', name: 'Text', type: 'text', default: '' },
    ],
  },
  {
    type: 'imageUpload',
    category: 'input',
    label: 'Image Upload',
    displayName: 'Upload Image',
    description: 'Upload an image to use as input for AI processing',
    quickHelp: 'Drag and drop or click to upload an image',
    useCase: 'Upload a photo for try-on, animation, or style reference',
    icon: 'Image',
    inputs: [],
    outputs: [{ id: 'image', name: 'Image', type: 'image' }],
    parameters: [
      { id: 'file', name: 'File', type: 'file' },
    ],
  },
  {
    type: 'videoUpload',
    category: 'input',
    label: 'Video Upload',
    displayName: 'Upload Video',
    description: 'Upload a video file to use as input for AI processing',
    quickHelp: 'Drag and drop or click to upload a video',
    useCase: 'Source video for editing, lip sync, or animation reference',
    icon: 'VideoFile',
    inputs: [],
    outputs: [{ id: 'video', name: 'Video', type: 'video' }],
    parameters: [
      { id: 'file', name: 'File', type: 'file' },
    ],
  },
  {
    type: 'referenceImage',
    category: 'input',
    label: 'Reference Image',
    displayName: 'Style Reference',
    description: 'Upload reference images or provide URLs to guide the style, composition, or mood of generated content',
    quickHelp: 'Upload images or paste URLs for AI to use as inspiration',
    useCase: 'Mood boards, style consistency, composition guides',
    icon: 'Collections',
    inputs: [],
    outputs: [{ id: 'images', name: 'Images', type: 'image', multiple: true }],
    parameters: [
      { id: 'images', name: 'Images', type: 'file' },
    ],
  },
  {
    type: 'characterReference',
    category: 'input',
    label: 'Character Reference',
    displayName: 'Character Photos',
    description: 'Upload photos of a person or character to maintain their identity across generations',
    quickHelp: 'Upload 1-7 photos of the same person/character',
    useCase: 'Consistent characters in stories, portraits, video content',
    icon: 'Person',
    inputs: [],
    outputs: [{ id: 'character', name: 'Character', type: 'character' }],
    parameters: [
      { id: 'files', name: 'Files', type: 'file' },
      { id: 'characterName', name: 'Character Name', type: 'text', default: '' },
    ],
  },

  // ============================================================================
  // IMAGE GENERATION NODES
  // ============================================================================
  {
    type: 'flux2Pro',
    category: 'imageGen',
    label: 'FLUX.2 Pro',
    displayName: 'Photo Generator (Pro)',
    description: 'Create stunning, photorealistic images from text descriptions. Best for high-quality, commercial-ready output.',
    quickHelp: 'Connect a text prompt → Generate beautiful images',
    useCase: 'Product photos, fashion designs, concept art',
    icon: 'AutoAwesome',
    aiModel: 'flux-2-pro',  // Maps to image-gen template on backend
    inputs: [
      { id: 'prompt', name: 'Prompt (Text Input)', type: 'text', required: true },
      { id: 'reference', name: 'Reference (Image Upload)', type: 'image' },
    ],
    outputs: [{ id: 'image', name: 'Image', type: 'image' }],
    parameters: [
      { id: 'width', name: 'Width', type: 'number', default: 1024, min: 256, max: 2048 },
      { id: 'height', name: 'Height', type: 'number', default: 1024, min: 256, max: 2048 },
      { id: 'guidance', name: 'Guidance Scale', type: 'slider', default: 3.5, min: 1, max: 20, step: 0.1 },
      { id: 'numImages', name: 'Num Images', type: 'number', default: 1, min: 1, max: 4 },
    ],
  },
  {
    type: 'flux2Dev',
    category: 'imageGen',
    label: 'FLUX.2 Dev',
    displayName: 'Photo Generator (Dev)',
    description: 'Generate images with custom style training (LoRA) support. Great for personal styles.',
    quickHelp: 'Text prompt + optional style → Custom-styled images',
    useCase: 'Personal art styles, trained aesthetics, experimental looks',
    icon: 'Science',
    aiModel: 'flux-2-dev',  // Maps to image-gen template on backend
    inputs: [
      { id: 'prompt', name: 'Prompt (Text Input)', type: 'text', required: true },
      { id: 'style', name: 'Style (LoRA Training)', type: 'style' },
    ],
    outputs: [{ id: 'image', name: 'Image', type: 'image' }],
    parameters: [
      { id: 'width', name: 'Width', type: 'number', default: 1024, min: 256, max: 2048 },
      { id: 'height', name: 'Height', type: 'number', default: 1024, min: 256, max: 2048 },
      { id: 'steps', name: 'Steps', type: 'number', default: 28, min: 1, max: 50 },
      { id: 'guidance', name: 'Guidance Scale', type: 'slider', default: 3.5, min: 1, max: 20, step: 0.1 },
    ],
  },
  {
    type: 'nanoBananaPro',
    category: 'imageGen',
    label: 'Nano Banana Pro',
    displayName: 'Multi-Character Scene',
    description: 'Create images with multiple specific people using reference photos. Supports up to 5 different faces.',
    quickHelp: 'References + Prompt → Scene with those people',
    useCase: 'Group photos, family portraits, multi-character stories',
    icon: 'GroupAdd',
    aiModel: 'nano-banana-pro',  // Maps to image-gen template on backend
    inputs: [
      { id: 'prompt', name: 'Prompt (Text Input)', type: 'text', required: true },
      { id: 'references', name: 'Face Photos (Image Upload)', type: 'image', multiple: true },
      { id: 'characters', name: 'Characters (Character Reference)', type: 'character', multiple: true },
    ],
    outputs: [{ id: 'image', name: 'Image', type: 'image' }],
    parameters: [
      { id: 'width', name: 'Width', type: 'number', default: 1024, min: 256, max: 2048 },
      { id: 'height', name: 'Height', type: 'number', default: 1024, min: 256, max: 2048 },
      { id: 'faceWeight', name: 'Face Weight', type: 'slider', default: 0.8, min: 0, max: 1, step: 0.1 },
      { id: 'styleWeight', name: 'Style Weight', type: 'slider', default: 0.6, min: 0, max: 1, step: 0.1 },
    ],
  },
  {
    type: 'fluxKontext',
    category: 'imageGen',
    label: 'FLUX Kontext',
    displayName: 'Smart Image Editor',
    description: 'Make targeted edits to existing images using text instructions. Change outfits, backgrounds, or details.',
    quickHelp: 'Image + "Change X to Y" → Edited image',
    useCase: 'Outfit changes, background swaps, detail modifications',
    icon: 'Transform',
    aiModel: 'flux-kontext',  // Maps to image-gen template on backend
    inputs: [
      { id: 'image', name: 'Source Image (Image Upload)', type: 'image', required: true },
      { id: 'prompt', name: 'Edit Prompt (Text Input)', type: 'text', required: true },
    ],
    outputs: [{ id: 'image', name: 'Image', type: 'image' }],
    parameters: [
      { id: 'strength', name: 'Edit Strength', type: 'slider', default: 0.8, min: 0, max: 1, step: 0.05 },
    ],
  },
  // === NEW DECEMBER 2025 IMAGE MODELS ===
  {
    type: 'flux2Max',
    category: 'imageGen',
    label: 'FLUX.2 Max',
    displayName: 'Photo Generator (Flagship)',
    description: 'State-of-the-art image generation with exceptional realism and multi-reference synthesis (up to 10 images). Best quality available.',
    quickHelp: 'Prompt + up to 10 references → Highest quality images',
    useCase: 'Commercial photography, premium content, multi-reference scenes',
    icon: 'Stars',
    aiModel: 'flux-2-max',
    tier: 'flagship',
    cost: '$0.07/megapixel',
    inputs: [
      { id: 'prompt', name: 'Prompt', type: 'text', required: true },
      { id: 'references', name: 'References (up to 10)', type: 'image', multiple: true },
    ],
    outputs: [{ id: 'image', name: 'Image', type: 'image' }],
    parameters: [
      { id: 'width', name: 'Width', type: 'number', default: 1024, min: 256, max: 4096 },
      { id: 'height', name: 'Height', type: 'number', default: 1024, min: 256, max: 4096 },
      { id: 'guidance', name: 'Guidance Scale', type: 'slider', default: 3.5, min: 1, max: 20, step: 0.1 },
      { id: 'numImages', name: 'Num Images', type: 'number', default: 1, min: 1, max: 4 },
    ],
  },
  {
    type: 'recraftV3',
    category: 'imageGen',
    label: 'Recraft V3',
    displayName: 'Text & Brand Designer',
    description: 'Best-in-class for text rendering, vector art, and brand-style generation. Creates posters, ads, and designs with readable long-form text.',
    quickHelp: 'Perfect for posters, ads, logos, and branded content',
    useCase: 'Posters, advertisements, brand materials, vector graphics',
    icon: 'FormatShapes',
    aiModel: 'recraft-v3',
    tier: 'production',
    bestFor: 'text',
    inputs: [
      { id: 'prompt', name: 'Prompt', type: 'text', required: true },
      { id: 'brandStyle', name: 'Brand Style Reference', type: 'image', multiple: true },
    ],
    outputs: [
      { id: 'image', name: 'Raster Image', type: 'image' },
      { id: 'vector', name: 'Vector (SVG)', type: 'style' },
    ],
    parameters: [
      { id: 'style', name: 'Style', type: 'select', default: 'realistic', options: [
        { label: 'Realistic', value: 'realistic' },
        { label: 'Digital Illustration', value: 'digital_illustration' },
        { label: 'Vector Art', value: 'vector_illustration' },
        { label: 'Icon', value: 'icon' },
      ]},
      { id: 'textContent', name: 'Text to Include', type: 'text', default: '' },
      { id: 'brandColors', name: 'Brand Colors (hex)', type: 'text', default: '' },
      { id: 'width', name: 'Width', type: 'number', default: 1024, min: 256, max: 2048 },
      { id: 'height', name: 'Height', type: 'number', default: 1024, min: 256, max: 2048 },
    ],
  },
  {
    type: 'gptImage',
    category: 'imageGen',
    label: 'GPT Image 1.5',
    displayName: 'GPT Image Generator',
    description: 'OpenAI multimodal image generation with strongest prompt adherence and understanding.',
    quickHelp: 'Most accurate prompt interpretation',
    useCase: 'Complex scenes, precise instructions, detailed compositions',
    icon: 'Psychology',
    aiModel: 'gpt-image-1.5',  // GPT Image maps to dalle3
    tier: 'flagship',
    inputs: [
      { id: 'prompt', name: 'Prompt', type: 'text', required: true },
    ],
    outputs: [{ id: 'image', name: 'Image', type: 'image' }],
    parameters: [
      { id: 'width', name: 'Width', type: 'number', default: 1024, min: 256, max: 2048 },
      { id: 'height', name: 'Height', type: 'number', default: 1024, min: 256, max: 2048 },
      { id: 'numImages', name: 'Num Images', type: 'number', default: 1, min: 1, max: 4 },
    ],
  },
  {
    type: 'zImageTurbo',
    category: 'imageGen',
    label: 'Z-Image Turbo',
    displayName: 'Fast Image Generator',
    description: 'Ultra-fast 6B parameter model for quick iterations and rapid prototyping.',
    quickHelp: 'Fastest generation for quick previews',
    useCase: 'Rapid prototyping, quick iterations, concept exploration',
    icon: 'FlashOn',
    aiModel: 'flux-schnell',  // Fast turbo model
    tier: 'fast',
    inputs: [
      { id: 'prompt', name: 'Prompt', type: 'text', required: true },
    ],
    outputs: [{ id: 'image', name: 'Image', type: 'image' }],
    parameters: [
      { id: 'width', name: 'Width', type: 'number', default: 1024, min: 256, max: 2048 },
      { id: 'height', name: 'Height', type: 'number', default: 1024, min: 256, max: 2048 },
      { id: 'numImages', name: 'Num Images', type: 'number', default: 1, min: 1, max: 4 },
    ],
  },

  // ============================================================================
  // VIDEO GENERATION NODES
  // ============================================================================
  {
    type: 'kling26T2V',
    category: 'videoGen',
    label: 'Kling 2.6 T2V',
    displayName: 'Text to Video',
    description: 'Create videos directly from text descriptions. Includes optional AI-generated sound.',
    quickHelp: 'Describe a scene → Watch it come to life',
    useCase: 'Social media clips, concept videos, story sequences',
    icon: 'Videocam',
    aiModel: 'kling',  // Kling video model
    inputs: [
      { id: 'prompt', name: 'Scene Description (Text Input)', type: 'text', required: true },
    ],
    outputs: [
      { id: 'video', name: 'Video', type: 'video' },
      { id: 'audio', name: 'Audio', type: 'audio' },
    ],
    parameters: [
      { id: 'duration', name: 'Duration (s)', type: 'select', default: 5, options: [
        { label: '5 seconds', value: 5 },
        { label: '10 seconds', value: 10 },
      ]},
      { id: 'aspectRatio', name: 'Aspect Ratio', type: 'select', default: '16:9', options: [
        { label: '16:9', value: '16:9' },
        { label: '9:16', value: '9:16' },
        { label: '1:1', value: '1:1' },
      ]},
      { id: 'enableAudio', name: 'Generate Audio', type: 'boolean', default: true },
    ],
  },
  {
    type: 'kling26I2V',
    category: 'videoGen',
    label: 'Kling 2.6 I2V',
    displayName: 'Animate Image',
    description: 'Bring any still image to life with natural motion and animation.',
    quickHelp: 'Static image → Animated video',
    useCase: 'Fashion runway videos, product animations, photo animations',
    icon: 'Animation',
    aiModel: 'kling',  // Kling i2v model
    inputs: [
      { id: 'image', name: 'Source Image (Image Upload)', type: 'image', required: true },
      { id: 'prompt', name: 'Motion Prompt (Text Input)', type: 'text' },
    ],
    outputs: [{ id: 'video', name: 'Video', type: 'video' }],
    parameters: [
      { id: 'duration', name: 'Duration (s)', type: 'select', default: 5, options: [
        { label: '5 seconds', value: 5 },
        { label: '10 seconds', value: 10 },
      ]},
      { id: 'motionIntensity', name: 'Motion Intensity', type: 'slider', default: 0.5, min: 0, max: 1, step: 0.1 },
    ],
  },
  {
    type: 'klingO1Ref2V',
    category: 'videoGen',
    label: 'Kling O1 Ref2V',
    displayName: 'Character Video',
    description: 'Create videos starring specific characters/people from reference photos. Maintains identity.',
    quickHelp: 'Person photos + Scene → Video with that person',
    useCase: 'Personalized content, character-driven stories, product demos',
    icon: 'PersonVideo',
    aiModel: 'kling',  // Kling elements model
    inputs: [
      { id: 'references', name: 'Person Photos (Image Upload)', type: 'image', multiple: true, required: true },
      { id: 'prompt', name: 'Scene Description (Text Input)', type: 'text', required: true },
    ],
    outputs: [{ id: 'video', name: 'Video', type: 'video' }],
    parameters: [
      { id: 'duration', name: 'Duration (s)', type: 'select', default: 5, options: [
        { label: '5 seconds', value: 5 },
        { label: '10 seconds', value: 10 },
      ]},
      { id: 'characterWeight', name: 'Character Weight', type: 'slider', default: 0.8, min: 0, max: 1, step: 0.1 },
    ],
  },
  {
    type: 'veo31',
    category: 'videoGen',
    label: 'VEO 3.1',
    displayName: 'Cinematic Video',
    description: 'Google\'s premium video generator. Creates cinematic, film-quality videos with natural audio.',
    quickHelp: 'Prompt → Hollywood-quality video clip',
    useCase: 'Film teasers, high-end ads, cinematic storytelling',
    icon: 'Movie',
    aiModel: 'veo',  // VEO video model
    inputs: [
      { id: 'prompt', name: 'Scene Description (Text Input)', type: 'text', required: true },
      { id: 'image', name: 'First Frame (Image Upload)', type: 'image' },
    ],
    outputs: [
      { id: 'video', name: 'Video', type: 'video' },
      { id: 'audio', name: 'Audio', type: 'audio' },
    ],
    parameters: [
      { id: 'aspectRatio', name: 'Aspect Ratio', type: 'select', default: '16:9', options: [
        { label: '16:9', value: '16:9' },
        { label: '9:16', value: '9:16' },
      ]},
      { id: 'mode', name: 'Mode', type: 'select', default: 'fast', options: [
        { label: 'Fast ($0.15/s)', value: 'fast' },
        { label: 'Standard ($0.40/s)', value: 'standard' },
      ]},
    ],
  },
  {
    type: 'klingAvatar',
    category: 'videoGen',
    label: 'Kling Avatar',
    displayName: 'Talking Head Video',
    description: 'Create a video of a face speaking with perfect lip sync. Upload a photo and audio to bring it to life.',
    quickHelp: 'Face photo + Audio → Talking video',
    useCase: 'Social media content, presentations, virtual spokespersons',
    icon: 'RecordVoiceOver',
    aiModel: 'kling',  // Kling avatar model
    inputs: [
      { id: 'image', name: 'Portrait', type: 'image', required: true },
      { id: 'audio', name: 'Audio', type: 'audio', required: true },
    ],
    outputs: [{ id: 'video', name: 'Video', type: 'video' }],
    parameters: [
      { id: 'lipSyncStrength', name: 'Lip Sync Strength', type: 'slider', default: 0.8, min: 0, max: 1, step: 0.1 },
    ],
  },
  // === NEW DECEMBER 2025 VIDEO MODELS ===
  {
    type: 'sora2',
    category: 'videoGen',
    label: 'Sora 2',
    displayName: 'Sora Video Generator',
    description: 'OpenAI\'s state-of-the-art video model with realistic physics, native audio, and multi-shot capabilities. Includes the Cameos feature.',
    quickHelp: 'Best physics & realism with synchronized audio',
    useCase: 'Professional video content, cinematic scenes, realistic motion',
    icon: 'AutoAwesome',
    aiModel: 'sora',  // Sora video model
    tier: 'flagship',
    hasAudio: true,
    cost: '$0.50/sec',
    inputs: [
      { id: 'prompt', name: 'Prompt', type: 'text', required: true },
      { id: 'image', name: 'First Frame (optional)', type: 'image' },
    ],
    outputs: [
      { id: 'video', name: 'Video', type: 'video' },
      { id: 'audio', name: 'Audio', type: 'audio' },
    ],
    parameters: [
      { id: 'duration', name: 'Duration', type: 'select', default: 5, options: [
        { label: '5 seconds', value: 5 },
        { label: '10 seconds', value: 10 },
        { label: '15 seconds', value: 15 },
      ]},
      { id: 'aspectRatio', name: 'Aspect Ratio', type: 'select', default: '16:9', options: [
        { label: '16:9 (Landscape)', value: '16:9' },
        { label: '9:16 (Portrait)', value: '9:16' },
        { label: '1:1 (Square)', value: '1:1' },
      ]},
      { id: 'enableAudio', name: 'Generate Audio', type: 'boolean', default: true },
      { id: 'audioPrompt', name: 'Audio Direction', type: 'text', default: '' },
    ],
  },
  {
    type: 'sora2Pro',
    category: 'videoGen',
    label: 'Sora 2 Pro',
    displayName: 'Sora Pro Video',
    description: 'OpenAI\'s flagship video model. Best physics, realism, and multi-shot coherence. Premium quality output.',
    quickHelp: 'Premium tier with best quality and control',
    useCase: 'Commercial productions, film-quality content, premium ads',
    icon: 'WorkspacePremium',
    aiModel: 'sora',  // Sora Pro video model
    tier: 'flagship',
    hasAudio: true,
    cost: '$0.80/sec',
    inputs: [
      { id: 'prompt', name: 'Prompt', type: 'text', required: true },
      { id: 'image', name: 'First Frame', type: 'image' },
      { id: 'storyboard', name: 'Multi-shot Storyboard', type: 'image', multiple: true },
    ],
    outputs: [
      { id: 'video', name: 'Video', type: 'video' },
      { id: 'audio', name: 'Audio', type: 'audio' },
    ],
    parameters: [
      { id: 'duration', name: 'Duration', type: 'select', default: 10, options: [
        { label: '5 seconds', value: 5 },
        { label: '10 seconds', value: 10 },
        { label: '15 seconds', value: 15 },
        { label: '20 seconds', value: 20 },
      ]},
      { id: 'aspectRatio', name: 'Aspect Ratio', type: 'select', default: '16:9', options: [
        { label: '16:9 (Cinematic)', value: '16:9' },
        { label: '21:9 (Ultra-wide)', value: '21:9' },
        { label: '9:16 (Portrait)', value: '9:16' },
        { label: '1:1 (Square)', value: '1:1' },
      ]},
      { id: 'enableAudio', name: 'Generate Audio', type: 'boolean', default: true },
      { id: 'audioPrompt', name: 'Audio Direction', type: 'text', default: '' },
      { id: 'multiShot', name: 'Multi-shot Mode', type: 'boolean', default: false },
    ],
  },
  {
    type: 'kling26Pro',
    category: 'videoGen',
    label: 'Kling 2.6 Pro',
    displayName: 'Kling Pro Video',
    description: 'Top-tier cinematic video with native bilingual audio (EN/ZH). Supports extended generation up to 3 minutes.',
    quickHelp: 'Cinematic quality with voice and sound',
    useCase: 'Long-form content, dialogue scenes, cinematic storytelling',
    icon: 'TheaterComedy',
    aiModel: 'kling',  // Kling Pro video model
    tier: 'flagship',
    hasAudio: true,
    cost: '$0.14/sec',
    inputs: [
      { id: 'prompt', name: 'Prompt', type: 'text', required: true },
      { id: 'image', name: 'First Frame', type: 'image' },
    ],
    outputs: [
      { id: 'video', name: 'Video', type: 'video' },
      { id: 'audio', name: 'Audio', type: 'audio' },
    ],
    parameters: [
      { id: 'duration', name: 'Duration', type: 'select', default: 10, options: [
        { label: '5 seconds', value: 5 },
        { label: '10 seconds', value: 10 },
        { label: '30 seconds', value: 30 },
        { label: '60 seconds', value: 60 },
        { label: '180 seconds (3 min)', value: 180 },
      ]},
      { id: 'aspectRatio', name: 'Aspect Ratio', type: 'select', default: '16:9', options: [
        { label: '16:9', value: '16:9' },
        { label: '9:16', value: '9:16' },
        { label: '1:1', value: '1:1' },
      ]},
      { id: 'enableAudio', name: 'Generate Audio', type: 'boolean', default: true },
      { id: 'audioLanguage', name: 'Audio Language', type: 'select', default: 'en', options: [
        { label: 'English', value: 'en' },
        { label: 'Chinese', value: 'zh' },
        { label: 'Auto-detect', value: 'auto' },
      ]},
    ],
  },
  {
    type: 'ltx2',
    category: 'videoGen',
    label: 'LTX-2',
    displayName: '4K Video Generator',
    description: 'Open-source 4K video at 50fps with synchronized audio. Excellent value for high-fidelity output.',
    quickHelp: '4K resolution with audio at competitive cost',
    useCase: 'High-resolution content, smooth motion, professional quality',
    icon: 'Hd',
    aiModel: 'luma',  // LTX/Luma video model
    tier: 'production',
    hasAudio: true,
    cost: '$0.16/sec',
    inputs: [
      { id: 'prompt', name: 'Prompt', type: 'text', required: true },
      { id: 'image', name: 'First Frame', type: 'image' },
    ],
    outputs: [
      { id: 'video', name: 'Video', type: 'video' },
      { id: 'audio', name: 'Audio', type: 'audio' },
    ],
    parameters: [
      { id: 'duration', name: 'Duration', type: 'select', default: 6, options: [
        { label: '6 seconds', value: 6 },
        { label: '8 seconds', value: 8 },
        { label: '10 seconds', value: 10 },
      ]},
      { id: 'resolution', name: 'Resolution', type: 'select', default: '1080p', options: [
        { label: '1080p HD', value: '1080p' },
        { label: '4K Ultra HD', value: '4k' },
      ]},
      { id: 'fps', name: 'Frame Rate', type: 'select', default: 30, options: [
        { label: '30 fps', value: 30 },
        { label: '50 fps', value: 50 },
      ]},
      { id: 'enableAudio', name: 'Generate Audio', type: 'boolean', default: true },
    ],
  },
  {
    type: 'wan26',
    category: 'videoGen',
    label: 'WAN 2.6',
    displayName: 'Multi-Shot Video',
    description: 'Create multi-shot videos with scene transitions and audio. Ideal for narrative content up to 15 seconds.',
    quickHelp: 'Multiple shots with transitions in one video',
    useCase: 'Story sequences, trailers, multi-scene content',
    icon: 'ViewCarousel',
    aiModel: 'minimax',  // WAN video model
    tier: 'creative',
    hasAudio: true,
    inputs: [
      { id: 'prompt', name: 'Scene Descriptions', type: 'text', required: true },
      { id: 'images', name: 'Scene References', type: 'image', multiple: true },
    ],
    outputs: [
      { id: 'video', name: 'Video', type: 'video' },
      { id: 'audio', name: 'Audio', type: 'audio' },
    ],
    parameters: [
      { id: 'numShots', name: 'Number of Shots', type: 'number', default: 3, min: 2, max: 6 },
      { id: 'duration', name: 'Total Duration', type: 'select', default: 10, options: [
        { label: '10 seconds', value: 10 },
        { label: '15 seconds', value: 15 },
      ]},
      { id: 'transitionStyle', name: 'Transition Style', type: 'select', default: 'cut', options: [
        { label: 'Cut', value: 'cut' },
        { label: 'Fade', value: 'fade' },
        { label: 'Dissolve', value: 'dissolve' },
      ]},
      { id: 'enableAudio', name: 'Generate Audio', type: 'boolean', default: true },
    ],
  },

  // ============================================================================
  // 3D GENERATION NODES
  // ============================================================================
  {
    type: 'meshy6',
    category: 'threeD',
    label: 'Meshy 6',
    displayName: '3D Model from Image',
    description: 'Convert any image into a full 3D model with realistic textures and materials.',
    quickHelp: 'Product photo → Rotatable 3D model',
    useCase: 'E-commerce 3D views, game assets, product visualization',
    icon: 'ViewInAr',
    aiModel: 'meshy',  // Meshy 3D model
    inputs: [
      { id: 'image', name: 'Source Image', type: 'image', required: true },
    ],
    outputs: [{ id: 'mesh', name: '3D Mesh', type: 'mesh3d' }],
    parameters: [
      { id: 'targetPolycount', name: 'Polycount', type: 'select', default: 'medium', options: [
        { label: 'Low (10K)', value: 'low' },
        { label: 'Medium (30K)', value: 'medium' },
        { label: 'High (100K)', value: 'high' },
      ]},
      { id: 'generatePBR', name: 'Generate PBR', type: 'boolean', default: true },
    ],
  },
  {
    type: 'tripoV25',
    category: 'threeD',
    label: 'Tripo v2.5',
    displayName: '3D Model (Fast)',
    description: 'Quickly generate 3D models optimized for animation and game engines.',
    quickHelp: 'Image → Game-ready 3D asset',
    useCase: 'Game development, AR/VR assets, rapid prototyping',
    icon: '3dRotation',
    aiModel: 'tripo',  // Tripo 3D model
    inputs: [
      { id: 'image', name: 'Source Image', type: 'image', required: true },
    ],
    outputs: [{ id: 'mesh', name: '3D Mesh', type: 'mesh3d' }],
    parameters: [
      { id: 'format', name: 'Export Format', type: 'select', default: 'glb', options: [
        { label: 'GLB', value: 'glb' },
        { label: 'FBX', value: 'fbx' },
        { label: 'OBJ', value: 'obj' },
      ]},
    ],
  },

  // ============================================================================
  // CHARACTER CONSISTENCY NODES
  // ============================================================================
  {
    type: 'characterLock',
    category: 'character',
    label: 'Character Lock',
    displayName: 'Character Identity Lock',
    description: 'Lock a character\'s appearance so they stay consistent across all your scenes. Upload reference images to create an identity.',
    quickHelp: 'Reference images → Consistent character in every scene',
    useCase: 'Children\'s books, comics, storytelling with recurring characters',
    icon: 'Lock',
    inputs: [
      { id: 'references', name: 'Reference Images', type: 'image', multiple: true, required: true },
    ],
    outputs: [{ id: 'character', name: 'Character Profile', type: 'character' }],
    parameters: [
      { id: 'characterName', name: 'Character Name', type: 'text', default: '' },
      { id: 'preserveStrength', name: 'Identity Preservation', type: 'slider', default: 0.8, min: 0, max: 1, step: 0.05 },
      { id: 'extractTraits', name: 'Auto-Extract Traits', type: 'boolean', default: true },
    ],
  },
  {
    type: 'faceMemory',
    category: 'character',
    label: 'Face Memory',
    displayName: 'Face Library',
    description: 'Store up to 5 different faces for use in multi-character scenes.',
    quickHelp: 'Upload faces → Use them in any generation',
    useCase: 'Family photos, team shots, group storytelling',
    icon: 'Face',
    inputs: [
      { id: 'faces', name: 'Face Images', type: 'image', multiple: true, required: true },
    ],
    outputs: [{ id: 'memory', name: 'Face Memory', type: 'character' }],
    parameters: [
      { id: 'slot1Name', name: 'Face 1 Name', type: 'text', default: 'Face 1' },
      { id: 'slot2Name', name: 'Face 2 Name', type: 'text', default: 'Face 2' },
      { id: 'slot3Name', name: 'Face 3 Name', type: 'text', default: 'Face 3' },
      { id: 'slot4Name', name: 'Face 4 Name', type: 'text', default: 'Face 4' },
      { id: 'slot5Name', name: 'Face 5 Name', type: 'text', default: 'Face 5' },
    ],
  },
  {
    type: 'elementLibrary',
    category: 'character',
    label: 'Element Library',
    displayName: 'Asset Library',
    description: 'Save reusable elements (characters, objects, environments) for consistent video generation.',
    quickHelp: 'Save assets → Reuse across videos',
    useCase: 'Brand characters, product consistency, story continuity',
    icon: 'LibraryBooks',
    aiModel: 'kling',  // Kling elements model
    inputs: [
      { id: 'elements', name: 'Element Images', type: 'image', multiple: true },
    ],
    outputs: [
      { id: 'library', name: 'Element Library', type: 'character' },
      { id: 'video', name: 'Video Output', type: 'video' },
    ],
    parameters: [
      { id: 'libraryName', name: 'Library Name', type: 'text', default: '' },
      { id: 'elementType', name: 'Element Type', type: 'select', default: 'character', options: [
        { label: 'Character', value: 'character' },
        { label: 'Object', value: 'object' },
        { label: 'Environment', value: 'environment' },
      ]},
      { id: 'duration', name: 'Video Duration', type: 'select', default: 5, options: [
        { label: '5 seconds', value: 5 },
        { label: '10 seconds', value: 10 },
      ]},
    ],
  },

  // ============================================================================
  // STYLE NODES
  // ============================================================================
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
  },

  // ============================================================================
  // COMPOSITE / FASHION NODES
  // ============================================================================
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
    aiModel: 'fashn',  // Uses fashion try-on backend (Swagger v3 aligned)
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
    aiModel: 'kling',  // Kling i2v model
    inputs: [
      { id: 'image', name: 'Fashion Photo (Image Upload)', type: 'image', required: true },
    ],
    outputs: [{ id: 'video', name: 'Runway Video', type: 'video' }],
    parameters: [
      // Aligned with Swagger v3 API schema - uses walkStyle, duration (string), cameraStyle
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
  },

  // ============================================================================
  // OUTPUT NODES
  // ============================================================================
  {
    type: 'preview',
    category: 'output',
    label: 'Preview',
    displayName: 'Preview Result',
    description: 'View any generated content (images, videos, 3D) in a dedicated preview panel.',
    quickHelp: 'Connect anything → See it large',
    useCase: 'Quality check, presentation, review before export',
    icon: 'Preview',
    inputs: [
      { id: 'content', name: 'Content', type: 'any', required: true },
    ],
    outputs: [],
    parameters: [],
  },
  {
    type: 'export',
    category: 'output',
    label: 'Export',
    displayName: 'Download / Export',
    description: 'Download your creations to your computer in various formats.',
    quickHelp: 'Content → File on your computer',
    useCase: 'Final delivery, sharing, archiving',
    icon: 'Download',
    inputs: [
      { id: 'content', name: 'Content', type: 'any', required: true },
    ],
    outputs: [],
    parameters: [
      { id: 'format', name: 'Format', type: 'select', default: 'png', options: [
        { label: 'PNG', value: 'png' },
        { label: 'JPEG', value: 'jpeg' },
        { label: 'MP4', value: 'mp4' },
        { label: 'WebM', value: 'webm' },
        { label: 'GLB', value: 'glb' },
      ]},
      { id: 'quality', name: 'Quality', type: 'slider', default: 90, min: 1, max: 100, step: 1 },
    ],
  },

  // ============================================================================
  // MULTI-FRAME NODES - STACKS (Vertical 9:16)
  // ============================================================================
  {
    type: 'stackTime',
    category: 'multiFrame',
    label: 'Time Stack',
    displayName: 'Time Progression',
    description: 'Create a sequence showing time passing - from seconds to days.',
    quickHelp: 'Subject → Multiple time moments',
    useCase: 'Action sequences, day-to-night transitions, story beats',
    icon: 'Timeline',
    inputs: [
      { id: 'reference', name: 'Reference Image', type: 'image', required: true },
      { id: 'character', name: 'Character Lock', type: 'character' },
    ],
    outputs: [
      { id: 'frames', name: 'Frame Stack', type: 'image' },
    ],
    parameters: [
      { id: 'prompt', name: 'Scene Prompt', type: 'text', default: '' },
      { id: 'frameCount', name: 'Frame Count', type: 'slider', default: 4, min: 2, max: 8, step: 1 },
      { id: 'timespan', name: 'Time Span', type: 'select', default: 'seconds', options: [
        { label: 'Seconds (Action)', value: 'seconds' },
        { label: 'Minutes', value: 'minutes' },
        { label: 'Hours', value: 'hours' },
        { label: 'Days', value: 'days' },
      ]},
    ],
    aiModel: 'flux-2-pro',
  },
  {
    type: 'stackMultiverse',
    category: 'multiFrame',
    label: 'Style Multiverse',
    description: 'Same scene in multiple art styles',
    icon: 'Palette',
    inputs: [
      { id: 'reference', name: 'Reference Image', type: 'image', required: true },
    ],
    outputs: [
      { id: 'frames', name: 'Style Variations', type: 'image' },
    ],
    parameters: [
      { id: 'prompt', name: 'Scene Prompt', type: 'text', default: '' },
      { id: 'frameCount', name: 'Style Count', type: 'slider', default: 4, min: 2, max: 6, step: 1 },
      { id: 'styles', name: 'Art Styles', type: 'text', default: 'photorealistic, anime, oil painting, noir' },
    ],
    aiModel: 'flux-2-pro',
  },
  {
    type: 'stackChrono',
    category: 'multiFrame',
    label: 'Chrono Stack',
    description: 'Time-of-day lighting progression',
    icon: 'WbSunny',
    inputs: [
      { id: 'reference', name: 'Reference Image', type: 'image', required: true },
    ],
    outputs: [
      { id: 'frames', name: 'Lighting Stack', type: 'image' },
    ],
    parameters: [
      { id: 'prompt', name: 'Scene Prompt', type: 'text', default: '' },
      { id: 'frameCount', name: 'Time Points', type: 'slider', default: 4, min: 3, max: 6, step: 1 },
      { id: 'startTime', name: 'Start Time', type: 'select', default: 'dawn', options: [
        { label: 'Dawn', value: 'dawn' },
        { label: 'Morning', value: 'morning' },
        { label: 'Noon', value: 'noon' },
        { label: 'Golden Hour', value: 'golden-hour' },
      ]},
    ],
    aiModel: 'flux-2-pro',
  },
  {
    type: 'stackSubconscious',
    category: 'multiFrame',
    label: 'Reality vs Perception',
    description: 'Psychological duality - reality vs inner perception',
    icon: 'Psychology',
    inputs: [
      { id: 'reference', name: 'Reference Image', type: 'image', required: true },
      { id: 'character', name: 'Character Lock', type: 'character' },
    ],
    outputs: [
      { id: 'frames', name: 'Duality Stack', type: 'image' },
    ],
    parameters: [
      { id: 'prompt', name: 'Scene Prompt', type: 'text', default: '' },
      { id: 'perceptionNote', name: 'Inner Perception', type: 'text', default: 'fear manifests as shadows' },
      { id: 'distortion', name: 'Distortion Level', type: 'select', default: 'moderate', options: [
        { label: 'Subtle', value: 'subtle' },
        { label: 'Moderate', value: 'moderate' },
        { label: 'Extreme', value: 'extreme' },
      ]},
    ],
    aiModel: 'flux-2-pro',
  },
  {
    type: 'stackZAxis',
    category: 'multiFrame',
    label: 'Scale Zoom Stack',
    description: 'Fractal dolly zoom from wide to macro',
    icon: 'ZoomIn',
    inputs: [
      { id: 'reference', name: 'Reference Image', type: 'image', required: true },
    ],
    outputs: [
      { id: 'frames', name: 'Zoom Stack', type: 'image' },
    ],
    parameters: [
      { id: 'prompt', name: 'Subject Prompt', type: 'text', default: '' },
      { id: 'frameCount', name: 'Zoom Levels', type: 'slider', default: 4, min: 3, max: 6, step: 1 },
      { id: 'startScale', name: 'Start Scale', type: 'select', default: 'extreme-wide', options: [
        { label: 'Extreme Wide (1km)', value: 'extreme-wide' },
        { label: 'Wide (100m)', value: 'wide' },
        { label: 'Medium (10m)', value: 'medium' },
      ]},
    ],
    aiModel: 'flux-2-pro',
  },
  {
    type: 'stackCauseEffect',
    category: 'multiFrame',
    label: 'Before & After',
    displayName: 'Before & After',
    description: 'Create dramatic before/after comparisons - transformations, makeovers, renovations.',
    quickHelp: 'Subject → Before + After shots',
    useCase: 'Interior design reveals, makeovers, product transformations',
    icon: 'CompareArrows',
    inputs: [
      { id: 'reference', name: 'Reference Image', type: 'image', required: true },
    ],
    outputs: [
      { id: 'frames', name: 'Before/After', type: 'image' },
    ],
    parameters: [
      { id: 'beforePrompt', name: 'Before State', type: 'text', default: '' },
      { id: 'afterPrompt', name: 'After State', type: 'text', default: '' },
      { id: 'effectType', name: 'Effect Type', type: 'select', default: 'transformation', options: [
        { label: 'Transformation', value: 'transformation' },
        { label: 'Damage/Repair', value: 'damage' },
        { label: 'Growth/Decay', value: 'growth' },
        { label: 'Reveal', value: 'reveal' },
      ]},
    ],
    aiModel: 'flux-2-pro',
  },

  // ============================================================================
  // MULTI-FRAME NODES - QUEUES (Horizontal 16:9+)
  // ============================================================================
  {
    type: 'queuePanorama',
    category: 'multiFrame',
    label: 'Panorama Queue',
    description: 'Ultra-wide establishing shot for camera pans (21:9)',
    icon: 'Panorama',
    inputs: [
      { id: 'reference', name: 'Reference Image', type: 'image', required: true },
    ],
    outputs: [
      { id: 'panorama', name: 'Panorama Strip', type: 'image' },
    ],
    parameters: [
      { id: 'prompt', name: 'Scene Prompt', type: 'text', default: '' },
      { id: 'panelCount', name: 'Panels', type: 'slider', default: 3, min: 3, max: 5, step: 1 },
      { id: 'environment', name: 'Environment', type: 'select', default: 'landscape', options: [
        { label: 'Landscape', value: 'landscape' },
        { label: 'Cityscape', value: 'cityscape' },
        { label: 'Interior', value: 'interior' },
        { label: 'Abstract', value: 'abstract' },
      ]},
    ],
    aiModel: 'flux-2-pro',
  },
  {
    type: 'queueWalkCycle',
    category: 'multiFrame',
    label: 'Walk Cycle Queue',
    description: 'Locomotion consistency frames for animation',
    icon: 'DirectionsWalk',
    inputs: [
      { id: 'reference', name: 'Character Image', type: 'image', required: true },
      { id: 'character', name: 'Character Lock', type: 'character' },
    ],
    outputs: [
      { id: 'frames', name: 'Walk Frames', type: 'image' },
    ],
    parameters: [
      { id: 'prompt', name: 'Character Prompt', type: 'text', default: '' },
      { id: 'frameCount', name: 'Cycle Frames', type: 'slider', default: 4, min: 4, max: 8, step: 1 },
      { id: 'locomotion', name: 'Locomotion Type', type: 'select', default: 'walk', options: [
        { label: 'Walk', value: 'walk' },
        { label: 'Run', value: 'run' },
        { label: 'Dance', value: 'dance' },
        { label: 'Custom', value: 'custom' },
      ]},
    ],
    aiModel: 'flux-2-pro',
  },
  {
    type: 'queueDialogueBeat',
    category: 'multiFrame',
    label: 'Dialogue Beat Strip',
    description: 'Setup-action-reaction storyboard (16:9)',
    icon: 'ViewColumn',
    inputs: [
      { id: 'reference', name: 'Scene Reference', type: 'image', required: true },
      { id: 'character', name: 'Character Lock', type: 'character' },
    ],
    outputs: [
      { id: 'frames', name: 'Beat Strip', type: 'image' },
    ],
    parameters: [
      { id: 'setupPrompt', name: 'Setup', type: 'text', default: '' },
      { id: 'actionPrompt', name: 'Action', type: 'text', default: '' },
      { id: 'reactionPrompt', name: 'Reaction', type: 'text', default: '' },
      { id: 'beatCount', name: 'Beats', type: 'slider', default: 3, min: 3, max: 4, step: 1 },
    ],
    aiModel: 'flux-2-pro',
  },
  {
    type: 'queueMotionTrail',
    category: 'multiFrame',
    label: 'Motion Trail Queue',
    description: 'Action blueprint with ghost trail effect',
    icon: 'Animation',
    inputs: [
      { id: 'reference', name: 'Character Image', type: 'image', required: true },
    ],
    outputs: [
      { id: 'frames', name: 'Motion Trail', type: 'image' },
    ],
    parameters: [
      { id: 'prompt', name: 'Action Prompt', type: 'text', default: '' },
      { id: 'trailCount', name: 'Ghost Positions', type: 'slider', default: 6, min: 4, max: 8, step: 1 },
      { id: 'motionType', name: 'Motion Type', type: 'select', default: 'arc', options: [
        { label: 'Arc', value: 'arc' },
        { label: 'Linear', value: 'linear' },
        { label: 'Spiral', value: 'spiral' },
        { label: 'Custom', value: 'custom' },
      ]},
    ],
    aiModel: 'flux-2-pro',
  },
  {
    type: 'queueMirror',
    category: 'multiFrame',
    label: 'Mirror Dimension',
    description: 'Reality vs reflection (inner truth reveal)',
    icon: 'Flip',
    inputs: [
      { id: 'reference', name: 'Character Image', type: 'image', required: true },
      { id: 'character', name: 'Character Lock', type: 'character' },
    ],
    outputs: [
      { id: 'frames', name: 'Mirror Split', type: 'image' },
    ],
    parameters: [
      { id: 'prompt', name: 'Character Prompt', type: 'text', default: '' },
      { id: 'truthReveal', name: 'Inner Truth', type: 'text', default: 'true inner self' },
      { id: 'mirrorType', name: 'Mirror Type', type: 'select', default: 'literal', options: [
        { label: 'Literal Mirror', value: 'literal' },
        { label: 'Water Reflection', value: 'water' },
        { label: 'Metaphorical', value: 'metaphorical' },
      ]},
    ],
    aiModel: 'flux-2-pro',
  },

  // ============================================================================
  // MULTI-FRAME NODES - GRIDS (Matrix 1:1)
  // ============================================================================
  {
    type: 'gridContact',
    category: 'multiFrame',
    label: 'Contact Sheet',
    displayName: 'Shot Variations',
    description: 'Generate 9 different camera angles and compositions of the same scene.',
    quickHelp: 'Scene → 9 shot options',
    useCase: 'Shot selection, storyboarding, director\'s coverage',
    icon: 'GridView',
    inputs: [
      { id: 'reference', name: 'Scene Reference', type: 'image', required: true },
      { id: 'character', name: 'Character Lock', type: 'character' },
    ],
    outputs: [
      { id: 'grid', name: 'Contact Grid', type: 'image' },
    ],
    parameters: [
      { id: 'prompt', name: 'Scene Prompt', type: 'text', default: '' },
      { id: 'topology', name: 'Grid Size', type: 'select', default: '3x3', options: [
        { label: '2x2 (4 shots)', value: '2x2' },
        { label: '3x3 (9 shots)', value: '3x3' },
      ]},
      { id: 'shotProgression', name: 'Shot Progression', type: 'select', default: 'proximity', options: [
        { label: 'Proximity (Wide→Close)', value: 'proximity' },
        { label: 'Angle Variety', value: 'angles' },
        { label: 'Custom', value: 'custom' },
      ]},
    ],
    aiModel: 'flux-2-pro',
  },
  {
    type: 'gridTurnaround',
    category: 'multiFrame',
    label: 'Character Turnaround',
    displayName: 'Character 360° Sheet',
    description: 'Generate front, side, and back views of a character for reference.',
    quickHelp: 'Character → All angles',
    useCase: 'Character design, 3D modeling reference, animation prep',
    icon: 'RotateRight',
    inputs: [
      { id: 'reference', name: 'Character Image', type: 'image', required: true },
      { id: 'character', name: 'Character Lock', type: 'character' },
    ],
    outputs: [
      { id: 'grid', name: 'Turnaround Grid', type: 'image' },
    ],
    parameters: [
      { id: 'prompt', name: 'Character Prompt', type: 'text', default: '' },
      { id: 'topology', name: 'Grid Layout', type: 'select', default: '2x3', options: [
        { label: '2x3 (6 views)', value: '2x3' },
        { label: '3x2 (6 views)', value: '3x2' },
      ]},
      { id: 'poseType', name: 'Pose', type: 'select', default: 'a-pose', options: [
        { label: 'A-Pose', value: 'a-pose' },
        { label: 'T-Pose', value: 't-pose' },
        { label: 'Natural', value: 'natural' },
      ]},
    ],
    aiModel: 'flux-2-pro',
  },
  {
    type: 'gridLighting',
    category: 'multiFrame',
    label: 'Lighting Compass',
    description: 'Lighting direction study (2x2 matrix)',
    icon: 'LightMode',
    inputs: [
      { id: 'reference', name: 'Scene Reference', type: 'image', required: true },
    ],
    outputs: [
      { id: 'grid', name: 'Lighting Grid', type: 'image' },
    ],
    parameters: [
      { id: 'prompt', name: 'Scene Prompt', type: 'text', default: '' },
      { id: 'lightingSet', name: 'Lighting Set', type: 'select', default: 'time', options: [
        { label: 'Time of Day', value: 'time' },
        { label: 'Direction', value: 'direction' },
        { label: 'Color Temperature', value: 'color' },
        { label: 'Mood', value: 'mood' },
      ]},
    ],
    aiModel: 'flux-2-pro',
  },
  {
    type: 'gridExpression',
    category: 'multiFrame',
    label: 'Expression Matrix',
    displayName: 'Emotion Sheet',
    description: 'Generate a range of facial expressions from a single character reference.',
    quickHelp: 'Face → 9 emotions',
    useCase: 'Character acting reference, emote sets, visual novel sprites',
    icon: 'Face',
    inputs: [
      { id: 'reference', name: 'Face Reference', type: 'image', required: true },
      { id: 'character', name: 'Character Lock', type: 'character' },
    ],
    outputs: [
      { id: 'grid', name: 'Expression Grid', type: 'image' },
    ],
    parameters: [
      { id: 'prompt', name: 'Character Prompt', type: 'text', default: '' },
      { id: 'emotionArc', name: 'Emotion Arc', type: 'select', default: 'neutral-to-realization', options: [
        { label: 'Neutral → Realization', value: 'neutral-to-realization' },
        { label: 'Calm → Anger', value: 'calm-to-anger' },
        { label: 'Sad → Happy', value: 'sad-to-happy' },
        { label: 'Fear → Relief', value: 'fear-to-relief' },
        { label: 'Custom', value: 'custom' },
      ]},
    ],
    aiModel: 'flux-2-pro',
  },
  {
    type: 'gridStylePrism',
    category: 'multiFrame',
    label: 'Style Prism',
    description: 'Same scene in 9 art styles (3x3)',
    icon: 'Brush',
    inputs: [
      { id: 'reference', name: 'Scene Reference', type: 'image', required: true },
    ],
    outputs: [
      { id: 'grid', name: 'Style Grid', type: 'image' },
    ],
    parameters: [
      { id: 'prompt', name: 'Scene Prompt', type: 'text', default: '' },
      { id: 'styleSet', name: 'Style Set', type: 'select', default: 'art-history', options: [
        { label: 'Art History', value: 'art-history' },
        { label: 'Animation', value: 'animation' },
        { label: 'Photography', value: 'photography' },
        { label: 'Custom', value: 'custom' },
      ]},
      { id: 'customStyles', name: 'Custom Styles', type: 'text', default: '' },
    ],
    aiModel: 'flux-2-pro',
  },
  {
    type: 'gridEntropy',
    category: 'multiFrame',
    label: 'Time Entropy',
    description: 'Decay/evolution across eons (3x3)',
    icon: 'Update',
    inputs: [
      { id: 'reference', name: 'Subject Reference', type: 'image', required: true },
    ],
    outputs: [
      { id: 'grid', name: 'Entropy Grid', type: 'image' },
    ],
    parameters: [
      { id: 'prompt', name: 'Subject Prompt', type: 'text', default: '' },
      { id: 'direction', name: 'Time Direction', type: 'select', default: 'decay', options: [
        { label: 'Decay (New→Ruined)', value: 'decay' },
        { label: 'Evolution (Past→Future)', value: 'evolution' },
        { label: 'Restoration (Old→New)', value: 'restoration' },
      ]},
      { id: 'timeSpan', name: 'Time Span', type: 'select', default: 'centuries', options: [
        { label: 'Years (1→100)', value: 'years' },
        { label: 'Centuries (1→1000)', value: 'centuries' },
        { label: 'Eons (1000→1M)', value: 'eons' },
      ]},
    ],
    aiModel: 'flux-2-pro',
  },

  // ============================================================================
  // ENHANCEMENT NODES
  // ============================================================================
  {
    type: 'upscaleImage',
    category: 'imageGen',
    label: 'Image Upscaler',
    displayName: 'Enhance & Upscale',
    description: 'Increase image resolution and enhance details. Makes images print-ready.',
    quickHelp: 'Small image → High-res version',
    useCase: 'Print preparation, detail enhancement, quality improvement',
    icon: 'ZoomIn',
    inputs: [
      { id: 'image', name: 'Input Image', type: 'image', required: true },
    ],
    outputs: [
      { id: 'upscaled', name: 'Upscaled Image', type: 'image' },
    ],
    parameters: [
      { id: 'scale', name: 'Scale Factor', type: 'select', default: '2x', options: [
        { label: '2x', value: '2x' },
        { label: '4x', value: '4x' },
        { label: '8x', value: '8x' },
      ]},
      { id: 'enhanceDetail', name: 'Enhance Details', type: 'boolean', default: true },
      { id: 'denoise', name: 'Denoise Level', type: 'slider', default: 0.3, min: 0, max: 1, step: 0.1 },
    ],
    aiModel: 'flux-2-pro',  // Upscaler uses image generation model
  },
  {
    type: 'enhancePrompt',
    category: 'style',
    label: 'Prompt Enhancer',
    displayName: 'Improve My Prompt',
    description: 'AI rewrites your simple prompt into a detailed, effective prompt for better results.',
    quickHelp: 'Simple idea → Detailed prompt',
    useCase: 'Better generations, learning prompt techniques, quick refinement',
    icon: 'AutoAwesome',
    inputs: [
      { id: 'text', name: 'Input Prompt', type: 'text', required: true },
    ],
    outputs: [
      { id: 'enhanced', name: 'Enhanced Prompt', type: 'text' },
    ],
    parameters: [
      { id: 'style', name: 'Enhancement Style', type: 'select', default: 'creative', options: [
        { label: 'Creative Expander', value: 'creative' },
        { label: 'Technical Detail', value: 'technical' },
        { label: 'Cinematic', value: 'cinematic' },
        { label: 'Fashion', value: 'fashion' },
        { label: 'Narrative', value: 'narrative' },
      ]},
      { id: 'verbosity', name: 'Detail Level', type: 'slider', default: 0.7, min: 0, max: 1, step: 0.1 },
    ],
    // Uses LLM for prompt enhancement (not image generation model)
    aiModel: 'gemini-2.5-flash',
  },

  // ============================================================================
  // STORYTELLING NODES - Narrative Foundation
  // ============================================================================

  // StoryGenesis - Create story concepts from ideas
  {
    type: 'storyGenesis',
    category: 'narrative',
    label: 'Story Genesis',
    displayName: 'Create Story Concept',
    description: 'Transform a simple idea into a complete story concept with theme, premise, characters, and structure.',
    quickHelp: 'Idea → Full story concept with characters, conflict, and resolution',
    useCase: 'Starting a new story from scratch, brainstorming sessions',
    icon: 'AutoStories',
    inputs: [
      { id: 'idea', name: 'Core Idea', type: 'text', required: true },
      { id: 'genreHints', name: 'Genre Hints', type: 'text' },
      { id: 'toneStyle', name: 'Tone/Style', type: 'style' },
    ],
    outputs: [
      { id: 'story', name: 'Story Concept', type: 'story' },
      { id: 'characters', name: 'Character Seeds', type: 'character', multiple: true },
      { id: 'outline', name: 'Basic Outline', type: 'outline' },
    ],
    parameters: [
      { id: 'genre', name: 'Primary Genre', type: 'select', default: 'drama', options: [
        { label: 'Drama', value: 'drama' },
        { label: 'Comedy', value: 'comedy' },
        { label: 'Thriller/Mystery', value: 'thriller' },
        { label: 'Romance', value: 'romance' },
        { label: 'Science Fiction', value: 'scifi' },
        { label: 'Fantasy', value: 'fantasy' },
        { label: 'Horror', value: 'horror' },
        { label: 'Action/Adventure', value: 'action' },
        { label: 'Historical', value: 'historical' },
        { label: "Children's", value: 'childrens' },
      ]},
      { id: 'length', name: 'Target Length', type: 'select', default: 'short', options: [
        { label: 'Flash Fiction (< 1,000 words)', value: 'flash' },
        { label: 'Short Story (1,000-7,500)', value: 'short' },
        { label: 'Novelette (7,500-20,000)', value: 'novelette' },
        { label: 'Novella (20,000-50,000)', value: 'novella' },
        { label: 'Novel (50,000+)', value: 'novel' },
        { label: 'Script (90-120 pages)', value: 'script' },
      ]},
      { id: 'audience', name: 'Target Audience', type: 'select', default: 'general', options: [
        { label: 'Children (5-12)', value: 'children' },
        { label: 'Young Adult', value: 'ya' },
        { label: 'General Adult', value: 'general' },
        { label: 'Mature', value: 'mature' },
      ]},
      { id: 'complexity', name: 'Narrative Complexity', type: 'slider', default: 0.5, min: 0, max: 1, step: 0.1 },
    ],
    aiModel: 'gemini-2.5-flash',
  },

  // StoryStructure - Apply story frameworks
  {
    type: 'storyStructure',
    category: 'narrative',
    label: 'Story Structure',
    displayName: 'Apply Story Framework',
    description: 'Structure your story using proven frameworks like Save the Cat, Hero\'s Journey, or Three-Act Structure.',
    quickHelp: 'Story concept → Structured beat sheet with all major plot points',
    useCase: 'Organizing a story, ensuring proper pacing and structure',
    icon: 'AccountTree',
    inputs: [
      { id: 'story', name: 'Story Concept', type: 'story', required: true },
      { id: 'characters', name: 'Main Characters', type: 'character', multiple: true },
    ],
    outputs: [
      { id: 'outline', name: 'Structured Outline', type: 'outline' },
      { id: 'beats', name: 'Story Beats', type: 'plotPoint', multiple: true },
    ],
    parameters: [
      { id: 'framework', name: 'Structure Framework', type: 'select', default: 'saveTheCat', options: [
        { label: 'Save the Cat (15 Beats)', value: 'saveTheCat' },
        { label: "Hero's Journey (12 Stages)", value: 'herosJourney' },
        { label: 'Three-Act Structure', value: 'threeAct' },
        { label: 'Five-Act Structure', value: 'fiveAct' },
        { label: 'Story Circle (Dan Harmon)', value: 'storyCircle' },
        { label: 'Freytag\'s Pyramid', value: 'freytag' },
        { label: 'Seven-Point Story Structure', value: 'sevenPoint' },
        { label: 'Fichtean Curve', value: 'fichtean' },
        { label: 'In Medias Res', value: 'inMediasRes' },
        { label: 'Kishotenketsu (4-Act)', value: 'kishotenketsu' },
      ]},
      { id: 'detailLevel', name: 'Beat Detail Level', type: 'select', default: 'standard', options: [
        { label: 'High-Level (Major beats only)', value: 'minimal' },
        { label: 'Standard (All framework beats)', value: 'standard' },
        { label: 'Detailed (Sub-beats included)', value: 'detailed' },
        { label: 'Comprehensive (Scene-level)', value: 'comprehensive' },
      ]},
    ],
    aiModel: 'gemini-2.5-flash',
  },

  // TreatmentGenerator - Professional treatments and synopses
  {
    type: 'treatmentGenerator',
    category: 'narrative',
    label: 'Treatment Generator',
    displayName: 'Write Treatment',
    description: 'Generate a professional story treatment, synopsis, or logline from your story materials.',
    quickHelp: 'Story + Outline → Professional treatment document',
    useCase: 'Pitching to producers, query letters, story documentation',
    icon: 'Description',
    inputs: [
      { id: 'story', name: 'Story Concept', type: 'story', required: true },
      { id: 'outline', name: 'Story Outline', type: 'outline' },
      { id: 'characters', name: 'Characters', type: 'character', multiple: true },
    ],
    outputs: [
      { id: 'treatment', name: 'Treatment Document', type: 'treatment' },
      { id: 'logline', name: 'Logline', type: 'text' },
      { id: 'synopsis', name: 'Synopsis', type: 'text' },
    ],
    parameters: [
      { id: 'format', name: 'Treatment Format', type: 'select', default: 'film', options: [
        { label: 'Film Treatment (2-5 pages)', value: 'film' },
        { label: 'TV Series Bible', value: 'tvBible' },
        { label: 'Novel Synopsis', value: 'novelSynopsis' },
        { label: 'Short Story Pitch', value: 'shortPitch' },
        { label: 'Game Narrative Doc', value: 'gameNarrative' },
      ]},
      { id: 'tone', name: 'Writing Tone', type: 'select', default: 'professional', options: [
        { label: 'Professional/Industry', value: 'professional' },
        { label: 'Enthusiastic/Pitch', value: 'enthusiastic' },
        { label: 'Literary/Artistic', value: 'literary' },
      ]},
      { id: 'includeLogline', name: 'Include Logline', type: 'boolean', default: true },
      { id: 'includeSynopsis', name: 'Include Synopsis', type: 'boolean', default: true },
    ],
    aiModel: 'gemini-2.5-flash',
  },

  // SceneGenerator - Write complete scenes
  {
    type: 'sceneGenerator',
    category: 'narrative',
    label: 'Scene Generator',
    displayName: 'Write Scene',
    description: 'Generate a complete scene with action, dialogue, and atmospheric description.',
    quickHelp: 'Scene concept → Fully written scene with all elements',
    useCase: 'Writing individual scenes, filling in outline gaps',
    icon: 'Theaters',
    inputs: [
      { id: 'sceneConcept', name: 'Scene Concept', type: 'text', required: true },
      { id: 'characters', name: 'Characters in Scene', type: 'character', multiple: true },
      { id: 'location', name: 'Location', type: 'location' },
      { id: 'precedingScene', name: 'Previous Scene', type: 'scene' },
      { id: 'story', name: 'Story Context', type: 'story' },
    ],
    outputs: [
      { id: 'scene', name: 'Complete Scene', type: 'scene' },
      { id: 'dialogue', name: 'Extracted Dialogue', type: 'dialogue' },
      { id: 'storyboardPrompts', name: 'Visual Prompts', type: 'text', multiple: true },
    ],
    parameters: [
      { id: 'format', name: 'Output Format', type: 'select', default: 'prose', options: [
        { label: 'Prose/Novel', value: 'prose' },
        { label: 'Screenplay', value: 'screenplay' },
        { label: 'Stage Play', value: 'stageplay' },
        { label: 'Graphic Novel Script', value: 'comicScript' },
      ]},
      { id: 'pov', name: 'Point of View', type: 'select', default: 'third-limited', options: [
        { label: 'First Person', value: 'first' },
        { label: 'Third Person Limited', value: 'third-limited' },
        { label: 'Third Person Omniscient', value: 'third-omniscient' },
        { label: 'Second Person', value: 'second' },
      ]},
      { id: 'sceneType', name: 'Scene Type', type: 'select', default: 'dramatic', options: [
        { label: 'Action/Chase', value: 'action' },
        { label: 'Dramatic Confrontation', value: 'dramatic' },
        { label: 'Romantic', value: 'romantic' },
        { label: 'Comedic', value: 'comedic' },
        { label: 'Suspense/Tension', value: 'suspense' },
        { label: 'Quiet/Reflective', value: 'quiet' },
        { label: 'Expository', value: 'expository' },
      ]},
      { id: 'length', name: 'Target Length', type: 'select', default: 'medium', options: [
        { label: 'Short (500-1000 words)', value: 'short' },
        { label: 'Medium (1000-2000 words)', value: 'medium' },
        { label: 'Long (2000-4000 words)', value: 'long' },
      ]},
      { id: 'generateVisualPrompts', name: 'Generate Visual Prompts', type: 'boolean', default: true },
    ],
    aiModel: 'gemini-2.5-flash',
  },

  // PlotPoint - Create story beats
  {
    type: 'plotPoint',
    category: 'narrative',
    label: 'Plot Point',
    displayName: 'Create Plot Point',
    description: 'Define a key story beat - an event, revelation, or turning point.',
    quickHelp: 'Concept → Structured plot beat with cause/effect',
    useCase: 'Building plot progressions, defining key moments',
    icon: 'TrendingUp',
    inputs: [
      { id: 'concept', name: 'Event Concept', type: 'text', required: true },
      { id: 'precedingPlot', name: 'Previous Plot Point', type: 'plotPoint' },
      { id: 'characters', name: 'Characters Involved', type: 'character', multiple: true },
      { id: 'story', name: 'Story Context', type: 'story' },
    ],
    outputs: [
      { id: 'plotPoint', name: 'Plot Point', type: 'plotPoint' },
      { id: 'consequences', name: 'Consequences', type: 'plotPoint', multiple: true },
    ],
    parameters: [
      { id: 'beatType', name: 'Beat Type', type: 'select', default: 'turning-point', options: [
        { label: 'Inciting Incident', value: 'inciting' },
        { label: 'Complication', value: 'complication' },
        { label: 'Turning Point', value: 'turning-point' },
        { label: 'Revelation', value: 'revelation' },
        { label: 'Confrontation', value: 'confrontation' },
        { label: 'Crisis', value: 'crisis' },
        { label: 'Climax', value: 'climax' },
        { label: 'Resolution', value: 'resolution' },
        { label: 'Cliffhanger', value: 'cliffhanger' },
      ]},
      { id: 'stakes', name: 'Stakes Level', type: 'slider', default: 0.5, min: 0, max: 1, step: 0.1 },
      { id: 'emotionalImpact', name: 'Emotional Impact', type: 'select', default: 'mixed', options: [
        { label: 'Positive/Triumphant', value: 'positive' },
        { label: 'Negative/Devastating', value: 'negative' },
        { label: 'Mixed/Bittersweet', value: 'mixed' },
        { label: 'Neutral/Informational', value: 'neutral' },
      ]},
    ],
    aiModel: 'gemini-2.5-flash',
  },

  // PlotTwist - Generate surprising twists
  {
    type: 'plotTwist',
    category: 'narrative',
    label: 'Plot Twist',
    displayName: 'Create Twist',
    description: 'Generate a surprising plot twist that recontextualizes the story.',
    quickHelp: 'Story → Unexpected twist with proper foreshadowing',
    useCase: 'Adding surprises, raising stakes, subverting expectations',
    icon: 'Shuffle',
    inputs: [
      { id: 'story', name: 'Story So Far', type: 'story', required: true },
      { id: 'outline', name: 'Story Outline', type: 'outline' },
      { id: 'characters', name: 'Characters', type: 'character', multiple: true },
    ],
    outputs: [
      { id: 'twist', name: 'Plot Twist', type: 'plotPoint' },
      { id: 'foreshadowing', name: 'Foreshadowing Hints', type: 'text', multiple: true },
      { id: 'aftermath', name: 'Aftermath Implications', type: 'plotPoint', multiple: true },
    ],
    parameters: [
      { id: 'twistType', name: 'Twist Type', type: 'select', default: 'revelation', options: [
        { label: 'Hidden Identity Reveal', value: 'identity' },
        { label: 'Betrayal', value: 'betrayal' },
        { label: 'False Memory/Reality', value: 'reality' },
        { label: 'Unexpected Ally/Enemy', value: 'allegiance' },
        { label: 'Time-Related', value: 'temporal' },
        { label: 'Hidden Connection', value: 'connection' },
        { label: 'Genre Subversion', value: 'genre' },
        { label: 'The Real Villain', value: 'villain' },
        { label: 'Sacrifice/Cost', value: 'sacrifice' },
      ]},
      { id: 'intensity', name: 'Twist Intensity', type: 'slider', default: 0.7, min: 0, max: 1, step: 0.1 },
      { id: 'includeForeshadowing', name: 'Include Foreshadowing', type: 'boolean', default: true },
    ],
    aiModel: 'gemini-2.5-flash',
  },

  // ConflictGenerator - Create obstacles
  {
    type: 'conflictGenerator',
    category: 'narrative',
    label: 'Conflict Generator',
    displayName: 'Create Conflict',
    description: 'Generate internal or external conflicts that drive your story forward.',
    quickHelp: 'Characters + Story → Compelling obstacles and challenges',
    useCase: 'Adding tension, creating obstacles, driving character growth',
    icon: 'Bolt',
    inputs: [
      { id: 'story', name: 'Story Context', type: 'story' },
      { id: 'characters', name: 'Characters', type: 'character', multiple: true },
      { id: 'location', name: 'Setting', type: 'location' },
    ],
    outputs: [
      { id: 'conflict', name: 'Conflict', type: 'plotPoint' },
      { id: 'escalations', name: 'Escalation Steps', type: 'plotPoint', multiple: true },
      { id: 'resolution', name: 'Possible Resolutions', type: 'plotPoint', multiple: true },
    ],
    parameters: [
      { id: 'conflictType', name: 'Conflict Type', type: 'select', default: 'interpersonal', options: [
        { label: 'Person vs. Person', value: 'interpersonal' },
        { label: 'Person vs. Self (Internal)', value: 'internal' },
        { label: 'Person vs. Nature', value: 'nature' },
        { label: 'Person vs. Society', value: 'society' },
        { label: 'Person vs. Technology', value: 'technology' },
        { label: 'Person vs. Supernatural', value: 'supernatural' },
        { label: 'Person vs. Fate/Time', value: 'fate' },
      ]},
      { id: 'intensity', name: 'Conflict Intensity', type: 'slider', default: 0.6, min: 0, max: 1, step: 0.1 },
      { id: 'includeEscalation', name: 'Include Escalation Path', type: 'boolean', default: true },
    ],
    aiModel: 'gemini-2.5-flash',
  },

  // StoryPivot - Change story direction
  {
    type: 'storyPivot',
    category: 'narrative',
    label: 'Story Pivot',
    displayName: 'Pivot Story',
    description: 'Radically change your story\'s direction while maintaining coherence.',
    quickHelp: 'Story + New direction → Transformed narrative',
    useCase: 'Major rewrites, genre shifts, exploring alternatives',
    icon: 'SwapHoriz',
    inputs: [
      { id: 'story', name: 'Current Story', type: 'story', required: true },
      { id: 'newDirection', name: 'New Direction', type: 'text', required: true },
    ],
    outputs: [
      { id: 'pivotedStory', name: 'Pivoted Story', type: 'story' },
      { id: 'newOutline', name: 'New Outline', type: 'outline' },
      { id: 'characterUpdates', name: 'Character Changes', type: 'character', multiple: true },
    ],
    parameters: [
      { id: 'pivotType', name: 'Pivot Type', type: 'select', default: 'direction', options: [
        { label: 'Direction Change', value: 'direction' },
        { label: 'Genre Shift', value: 'genre' },
        { label: 'Tone Transformation', value: 'tone' },
        { label: 'Protagonist Switch', value: 'protagonist' },
        { label: 'Timeline Shift', value: 'timeline' },
        { label: 'Scale Change (Bigger/Smaller)', value: 'scale' },
      ]},
      { id: 'preserveRatio', name: 'Preservation Level', type: 'slider', default: 0.4, min: 0, max: 1, step: 0.1 },
    ],
    aiModel: 'gemini-2.5-flash',
  },

  // IntrigueLift - Add mystery and tension
  {
    type: 'intrigueLift',
    category: 'narrative',
    label: 'Intrigue Lift',
    displayName: 'Add Intrigue',
    description: 'Inject mystery, tension, and unanswered questions into your story.',
    quickHelp: 'Story → Enhanced with secrets, mysteries, and tension',
    useCase: 'Making stories more compelling, adding mystery layers',
    icon: 'VisibilityOff',
    inputs: [
      { id: 'story', name: 'Current Story', type: 'story', required: true },
      { id: 'outline', name: 'Story Outline', type: 'outline' },
      { id: 'characters', name: 'Characters', type: 'character', multiple: true },
    ],
    outputs: [
      { id: 'secrets', name: 'Hidden Secrets', type: 'plotPoint', multiple: true },
      { id: 'mysteries', name: 'Story Mysteries', type: 'plotPoint', multiple: true },
      { id: 'tensionPoints', name: 'Tension Escalations', type: 'plotPoint', multiple: true },
      { id: 'enhancedOutline', name: 'Enhanced Outline', type: 'outline' },
    ],
    parameters: [
      { id: 'intrigueType', name: 'Intrigue Focus', type: 'select', default: 'mystery', options: [
        { label: 'Mystery/Whodunit', value: 'mystery' },
        { label: 'Hidden Identities', value: 'identity' },
        { label: 'Conspiracy', value: 'conspiracy' },
        { label: 'Forbidden Secrets', value: 'forbidden' },
        { label: 'Romantic Tension', value: 'romantic' },
        { label: 'Survival Tension', value: 'survival' },
      ]},
      { id: 'intensity', name: 'Intrigue Intensity', type: 'slider', default: 0.6, min: 0, max: 1, step: 0.1 },
      { id: 'numSecrets', name: 'Number of Secrets', type: 'number', default: 3, min: 1, max: 10 },
    ],
    aiModel: 'gemini-2.5-flash',
  },

  // StoryEnhancer - Polish and improve
  {
    type: 'storyEnhancer',
    category: 'narrative',
    label: 'Story Enhancer',
    displayName: 'Enhance Story',
    description: 'Improve prose quality, pacing, emotional impact, or sensory detail.',
    quickHelp: 'Story content → Polished, enhanced version',
    useCase: 'Revision, improving drafts, adding depth',
    icon: 'AutoFixHigh',
    inputs: [
      { id: 'content', name: 'Content to Enhance', type: 'scene', required: true },
      { id: 'story', name: 'Story Context', type: 'story' },
    ],
    outputs: [
      { id: 'enhancedContent', name: 'Enhanced Content', type: 'scene' },
      { id: 'suggestions', name: 'Further Suggestions', type: 'text', multiple: true },
    ],
    parameters: [
      { id: 'enhancementFocus', name: 'Enhancement Focus', type: 'select', default: 'comprehensive', options: [
        { label: 'Comprehensive Polish', value: 'comprehensive' },
        { label: 'Prose Quality', value: 'prose' },
        { label: 'Emotional Depth', value: 'emotional' },
        { label: "Sensory Detail (Show Don't Tell)", value: 'sensory' },
        { label: 'Pacing Improvement', value: 'pacing' },
        { label: 'Dialogue Naturalness', value: 'dialogue' },
        { label: 'Tension/Suspense', value: 'tension' },
      ]},
      { id: 'intensity', name: 'Enhancement Level', type: 'slider', default: 0.5, min: 0, max: 1, step: 0.1 },
      { id: 'preserveVoice', name: 'Preserve Original Voice', type: 'boolean', default: true },
    ],
    aiModel: 'gemini-2.5-flash',
  },

  // ============================================================================
  // STORYTELLING NODES - Character Development
  // ============================================================================

  // CharacterCreator - Deep character profiles
  {
    type: 'characterCreator',
    category: 'character',
    label: 'Character Creator',
    displayName: 'Create Character',
    description: 'Generate a complete character with personality, backstory, motivations, flaws, and arc.',
    quickHelp: 'Concept → Fully realized character with depth and complexity',
    useCase: 'Creating protagonists, antagonists, supporting cast',
    icon: 'PersonAdd',
    inputs: [
      { id: 'concept', name: 'Character Concept', type: 'text', required: true },
      { id: 'story', name: 'Story Context', type: 'story' },
      { id: 'role', name: 'Story Role', type: 'text' },
    ],
    outputs: [
      { id: 'character', name: 'Character Profile', type: 'character' },
      { id: 'backstory', name: 'Backstory', type: 'text' },
      { id: 'arc', name: 'Character Arc', type: 'plotPoint', multiple: true },
    ],
    parameters: [
      { id: 'archetype', name: 'Base Archetype', type: 'select', default: 'none', options: [
        { label: 'None/Custom', value: 'none' },
        { label: 'The Hero', value: 'hero' },
        { label: 'The Mentor', value: 'mentor' },
        { label: 'The Threshold Guardian', value: 'guardian' },
        { label: 'The Herald', value: 'herald' },
        { label: 'The Shapeshifter', value: 'shapeshifter' },
        { label: 'The Shadow (Villain)', value: 'shadow' },
        { label: 'The Ally', value: 'ally' },
        { label: 'The Trickster', value: 'trickster' },
        { label: 'The Innocent', value: 'innocent' },
        { label: 'The Orphan', value: 'orphan' },
        { label: 'The Rebel', value: 'rebel' },
        { label: 'The Lover', value: 'lover' },
        { label: 'The Creator', value: 'creator' },
        { label: 'The Ruler', value: 'ruler' },
        { label: 'The Caregiver', value: 'caregiver' },
        { label: 'The Sage', value: 'sage' },
      ]},
      { id: 'depth', name: 'Character Depth', type: 'select', default: 'full', options: [
        { label: 'Sketch (Basic traits)', value: 'sketch' },
        { label: 'Standard (Personality + goals)', value: 'standard' },
        { label: 'Full (Complete psychology)', value: 'full' },
        { label: 'Deep Dive (Trauma, wounds, growth)', value: 'deep' },
      ]},
      { id: 'generateBackstory', name: 'Generate Backstory', type: 'boolean', default: true },
      { id: 'generateArc', name: 'Generate Character Arc', type: 'boolean', default: true },
    ],
    aiModel: 'gemini-2.5-flash',
  },

  // CharacterRelationship - Map relationships
  {
    type: 'characterRelationship',
    category: 'character',
    label: 'Character Relationship',
    displayName: 'Define Relationship',
    description: 'Create and explore the relationship dynamics between two characters.',
    quickHelp: 'Two characters → Relationship history, dynamics, and conflicts',
    useCase: 'Building character chemistry, romantic subplots, rivalries',
    icon: 'People',
    inputs: [
      { id: 'character1', name: 'Character A', type: 'character', required: true },
      { id: 'character2', name: 'Character B', type: 'character', required: true },
      { id: 'story', name: 'Story Context', type: 'story' },
    ],
    outputs: [
      { id: 'relationship', name: 'Relationship Profile', type: 'text' },
      { id: 'sharedHistory', name: 'Shared History', type: 'text' },
      { id: 'conflicts', name: 'Potential Conflicts', type: 'plotPoint', multiple: true },
    ],
    parameters: [
      { id: 'relationshipType', name: 'Relationship Type', type: 'select', default: 'allies', options: [
        { label: 'Romantic Partners', value: 'romantic' },
        { label: 'Friends/Allies', value: 'allies' },
        { label: 'Rivals/Enemies', value: 'rivals' },
        { label: 'Family', value: 'family' },
        { label: 'Mentor/Student', value: 'mentor' },
        { label: 'Colleagues', value: 'colleagues' },
        { label: 'Complicated/Ambiguous', value: 'complicated' },
      ]},
      { id: 'conflictLevel', name: 'Conflict Intensity', type: 'slider', default: 0.5, min: 0, max: 1, step: 0.1 },
      { id: 'evolution', name: 'Relationship Evolution', type: 'select', default: 'static', options: [
        { label: 'Static (Unchanging)', value: 'static' },
        { label: 'Growing (Improving)', value: 'growing' },
        { label: 'Declining (Deteriorating)', value: 'declining' },
        { label: 'Transforming (Major shift)', value: 'transforming' },
        { label: 'Cyclical (On-again/off-again)', value: 'cyclical' },
      ]},
    ],
    aiModel: 'gemini-2.5-flash',
  },

  // CharacterVoice - Define speaking styles
  {
    type: 'characterVoice',
    category: 'dialogue',
    label: 'Character Voice',
    displayName: 'Define Voice',
    description: 'Establish a character\'s unique speaking style, vocabulary, and verbal quirks.',
    quickHelp: 'Character → Distinctive voice profile for consistent dialogue',
    useCase: 'Making each character sound unique and recognizable',
    icon: 'RecordVoiceOver',
    inputs: [
      { id: 'character', name: 'Character Profile', type: 'character', required: true },
    ],
    outputs: [
      { id: 'voiceProfile', name: 'Voice Profile', type: 'text' },
      { id: 'sampleDialogue', name: 'Sample Dialogue', type: 'dialogue' },
    ],
    parameters: [
      { id: 'speechPattern', name: 'Speech Pattern', type: 'select', default: 'standard', options: [
        { label: 'Standard/Neutral', value: 'standard' },
        { label: 'Formal/Educated', value: 'formal' },
        { label: 'Casual/Colloquial', value: 'casual' },
        { label: 'Street/Slang', value: 'street' },
        { label: 'Archaic/Period', value: 'archaic' },
        { label: 'Technical/Jargon', value: 'technical' },
        { label: 'Poetic/Flowery', value: 'poetic' },
        { label: 'Terse/Minimal', value: 'terse' },
      ]},
      { id: 'quirks', name: 'Add Verbal Quirks', type: 'boolean', default: true },
      { id: 'catchphrase', name: 'Generate Catchphrase', type: 'boolean', default: false },
    ],
    aiModel: 'gemini-2.5-flash',
  },

  // CharacterSheet - Visual character references
  {
    type: 'characterSheet',
    category: 'composite',
    label: 'Character Sheet',
    displayName: 'Create Character Sheet',
    description: 'Generate a visual character reference sheet with multiple views and expressions.',
    quickHelp: 'Character profile → Visual reference sheet',
    useCase: 'Character design, artist reference, consistency',
    icon: 'AssignmentInd',
    inputs: [
      { id: 'character', name: 'Character Profile', type: 'character', required: true },
      { id: 'style', name: 'Visual Style', type: 'style' },
    ],
    outputs: [
      { id: 'sheet', name: 'Character Sheet', type: 'image' },
      { id: 'expressions', name: 'Expression Grid', type: 'image' },
      { id: 'turnaround', name: 'Turnaround View', type: 'image' },
    ],
    parameters: [
      { id: 'sheetType', name: 'Sheet Type', type: 'select', default: 'comprehensive', options: [
        { label: 'Comprehensive (All views)', value: 'comprehensive' },
        { label: 'Portrait Focus', value: 'portrait' },
        { label: 'Full Body Turnaround', value: 'turnaround' },
        { label: 'Expression Sheet', value: 'expressions' },
        { label: 'Costume/Outfit Variations', value: 'costumes' },
      ]},
      { id: 'artStyle', name: 'Art Style', type: 'select', default: 'realistic', options: [
        { label: 'Realistic/Photographic', value: 'realistic' },
        { label: 'Stylized/Digital Art', value: 'stylized' },
        { label: 'Anime/Manga', value: 'anime' },
        { label: 'Western Animation', value: 'western' },
        { label: 'Comic Book', value: 'comic' },
      ]},
    ],
    aiModel: 'flux-2-pro',
  },

  // ============================================================================
  // STORYTELLING NODES - World Building
  // ============================================================================

  // LocationCreator - Create settings
  {
    type: 'locationCreator',
    category: 'worldBuilding',
    label: 'Location Creator',
    displayName: 'Create Location',
    description: 'Generate a detailed location with atmosphere, history, and narrative potential.',
    quickHelp: 'Concept → Vivid setting with sensory details and story hooks',
    useCase: 'Creating memorable settings, establishing mood',
    icon: 'Place',
    inputs: [
      { id: 'concept', name: 'Location Concept', type: 'text', required: true },
      { id: 'story', name: 'Story Context', type: 'story' },
      { id: 'lore', name: 'World Lore', type: 'lore' },
    ],
    outputs: [
      { id: 'location', name: 'Location Profile', type: 'location' },
      { id: 'description', name: 'Rich Description', type: 'text' },
      { id: 'secrets', name: 'Hidden Elements', type: 'plotPoint', multiple: true },
    ],
    parameters: [
      { id: 'locationType', name: 'Location Type', type: 'select', default: 'interior', options: [
        { label: 'Interior Space', value: 'interior' },
        { label: 'Exterior/Landscape', value: 'exterior' },
        { label: 'Urban Environment', value: 'urban' },
        { label: 'Rural/Natural', value: 'rural' },
        { label: 'Fantastical/Other-worldly', value: 'fantastical' },
        { label: 'Historical/Period', value: 'historical' },
        { label: 'Futuristic/Sci-Fi', value: 'futuristic' },
      ]},
      { id: 'mood', name: 'Atmospheric Mood', type: 'select', default: 'neutral', options: [
        { label: 'Neutral', value: 'neutral' },
        { label: 'Warm/Inviting', value: 'warm' },
        { label: 'Cold/Hostile', value: 'cold' },
        { label: 'Mysterious/Eerie', value: 'mysterious' },
        { label: 'Chaotic/Dangerous', value: 'chaotic' },
        { label: 'Serene/Peaceful', value: 'serene' },
        { label: 'Oppressive/Trapped', value: 'oppressive' },
      ]},
      { id: 'sensoryDetail', name: 'Sensory Detail Level', type: 'slider', default: 0.7, min: 0, max: 1, step: 0.1 },
      { id: 'includeHistory', name: 'Include History', type: 'boolean', default: true },
    ],
    aiModel: 'gemini-2.5-flash',
  },

  // WorldLore - Mythology and history
  {
    type: 'worldLore',
    category: 'worldBuilding',
    label: 'World Lore',
    displayName: 'Create Lore',
    description: 'Generate mythology, history, rules, and background lore for your story world.',
    quickHelp: 'Theme + Setting → Rich world history and mythology',
    useCase: 'Fantasy/sci-fi world-building, establishing rules and history',
    icon: 'MenuBook',
    inputs: [
      { id: 'worldConcept', name: 'World Concept', type: 'text', required: true },
      { id: 'story', name: 'Story Context', type: 'story' },
    ],
    outputs: [
      { id: 'lore', name: 'World Lore', type: 'lore' },
      { id: 'history', name: 'Historical Timeline', type: 'timeline' },
      { id: 'factions', name: 'Factions/Groups', type: 'text', multiple: true },
    ],
    parameters: [
      { id: 'loreType', name: 'Lore Focus', type: 'select', default: 'comprehensive', options: [
        { label: 'Comprehensive (All aspects)', value: 'comprehensive' },
        { label: 'Historical (Events & eras)', value: 'historical' },
        { label: 'Mythological (Gods & legends)', value: 'mythological' },
        { label: 'Political (Factions & power)', value: 'political' },
        { label: 'Magical/Tech System', value: 'systems' },
        { label: 'Cultural (Customs & beliefs)', value: 'cultural' },
      ]},
      { id: 'depth', name: 'Lore Depth', type: 'select', default: 'standard', options: [
        { label: 'Surface (Key facts only)', value: 'surface' },
        { label: 'Standard (Main elements)', value: 'standard' },
        { label: 'Deep (Detailed history)', value: 'deep' },
        { label: 'Encyclopedic (Everything)', value: 'encyclopedic' },
      ]},
    ],
    aiModel: 'gemini-2.5-flash',
  },

  // Timeline - Chronological events
  {
    type: 'storyTimeline',
    category: 'worldBuilding',
    label: 'Timeline',
    displayName: 'Create Timeline',
    description: 'Generate a chronological timeline of events for your story or world history.',
    quickHelp: 'Story/Lore → Organized chronological events',
    useCase: 'Tracking story events, historical backstory, parallel plotlines',
    icon: 'Timeline',
    inputs: [
      { id: 'story', name: 'Story', type: 'story' },
      { id: 'lore', name: 'World Lore', type: 'lore' },
      { id: 'characters', name: 'Characters', type: 'character', multiple: true },
    ],
    outputs: [
      { id: 'timeline', name: 'Event Timeline', type: 'timeline' },
      { id: 'events', name: 'Key Events', type: 'plotPoint', multiple: true },
    ],
    parameters: [
      { id: 'scope', name: 'Timeline Scope', type: 'select', default: 'story', options: [
        { label: 'Story Events Only', value: 'story' },
        { label: 'Character Lifetimes', value: 'characters' },
        { label: 'World History', value: 'world' },
        { label: 'Comprehensive (All)', value: 'comprehensive' },
      ]},
      { id: 'granularity', name: 'Event Granularity', type: 'select', default: 'scenes', options: [
        { label: 'Major Events Only', value: 'major' },
        { label: 'Scene-Level', value: 'scenes' },
        { label: 'Detailed (Hour by hour)', value: 'detailed' },
      ]},
    ],
    aiModel: 'gemini-2.5-flash',
  },

  // ============================================================================
  // STORYTELLING NODES - Dialogue
  // ============================================================================

  // DialogueGenerator - Authentic conversations
  {
    type: 'dialogueGenerator',
    category: 'dialogue',
    label: 'Dialogue Generator',
    displayName: 'Write Dialogue',
    description: 'Generate authentic dialogue between characters with subtext and conflict.',
    quickHelp: 'Characters + Situation → Natural, character-driven dialogue',
    useCase: 'Writing conversations, confrontations, romantic scenes',
    icon: 'Chat',
    inputs: [
      { id: 'characters', name: 'Characters Speaking', type: 'character', multiple: true, required: true },
      { id: 'situation', name: 'Situation/Context', type: 'text', required: true },
      { id: 'location', name: 'Location', type: 'location' },
      { id: 'precedingDialogue', name: 'Previous Dialogue', type: 'dialogue' },
    ],
    outputs: [
      { id: 'dialogue', name: 'Dialogue Exchange', type: 'dialogue' },
      { id: 'subtext', name: 'Subtext Analysis', type: 'text' },
    ],
    parameters: [
      { id: 'dialogueType', name: 'Dialogue Type', type: 'select', default: 'dramatic', options: [
        { label: 'Casual Conversation', value: 'casual' },
        { label: 'Dramatic/Tense', value: 'dramatic' },
        { label: 'Romantic', value: 'romantic' },
        { label: 'Comedic/Banter', value: 'comedic' },
        { label: 'Expository', value: 'expository' },
        { label: 'Confrontational', value: 'confrontational' },
        { label: 'Interrogation', value: 'interrogation' },
      ]},
      { id: 'subtextLevel', name: 'Subtext Complexity', type: 'slider', default: 0.5, min: 0, max: 1, step: 0.1 },
      { id: 'length', name: 'Exchange Length', type: 'select', default: 'medium', options: [
        { label: 'Brief (5-10 lines)', value: 'brief' },
        { label: 'Medium (10-25 lines)', value: 'medium' },
        { label: 'Extended (25-50 lines)', value: 'extended' },
      ]},
      { id: 'format', name: 'Output Format', type: 'select', default: 'prose', options: [
        { label: 'Prose (with tags)', value: 'prose' },
        { label: 'Screenplay Format', value: 'screenplay' },
        { label: 'Play Format', value: 'play' },
      ]},
    ],
    aiModel: 'gemini-2.5-flash',
  },

  // MonologueGenerator - Speeches
  {
    type: 'monologueGenerator',
    category: 'dialogue',
    label: 'Monologue Generator',
    displayName: 'Write Monologue',
    description: 'Generate a powerful monologue or speech for a character.',
    quickHelp: 'Character + Theme → Compelling speech or inner monologue',
    useCase: 'Key character speeches, villain revelations, climactic moments',
    icon: 'Mic',
    inputs: [
      { id: 'character', name: 'Speaking Character', type: 'character', required: true },
      { id: 'theme', name: 'Theme/Topic', type: 'text', required: true },
      { id: 'story', name: 'Story Context', type: 'story' },
    ],
    outputs: [
      { id: 'monologue', name: 'Monologue', type: 'dialogue' },
    ],
    parameters: [
      { id: 'monologueType', name: 'Monologue Type', type: 'select', default: 'dramatic', options: [
        { label: 'Internal/Stream of Consciousness', value: 'internal' },
        { label: 'Dramatic Speech', value: 'dramatic' },
        { label: 'Villain Reveal', value: 'villain' },
        { label: 'Inspirational', value: 'inspirational' },
        { label: 'Confession', value: 'confession' },
        { label: 'Eulogy/Memorial', value: 'eulogy' },
        { label: 'Declaration of Love', value: 'love' },
        { label: 'Philosophical', value: 'philosophical' },
      ]},
      { id: 'length', name: 'Length', type: 'select', default: 'medium', options: [
        { label: 'Short (30-60 seconds)', value: 'short' },
        { label: 'Medium (1-2 minutes)', value: 'medium' },
        { label: 'Extended (2-5 minutes)', value: 'extended' },
      ]},
      { id: 'emotionalIntensity', name: 'Emotional Intensity', type: 'slider', default: 0.7, min: 0, max: 1, step: 0.1 },
    ],
    aiModel: 'gemini-2.5-flash',
  },

  // ============================================================================
  // STORYTELLING NODES - Branching Narratives
  // ============================================================================

  // ChoicePoint - Branching decisions
  {
    type: 'choicePoint',
    category: 'branching',
    label: 'Choice Point',
    displayName: 'Create Choice',
    description: 'Create a branching decision point where the story can diverge.',
    quickHelp: 'Story moment → Multiple possible paths with consequences',
    useCase: 'Interactive fiction, games, choose-your-own-adventure',
    icon: 'CallSplit',
    inputs: [
      { id: 'precedingScene', name: 'Preceding Scene', type: 'scene', required: true },
      { id: 'characters', name: 'Characters', type: 'character', multiple: true },
      { id: 'story', name: 'Story Context', type: 'story' },
    ],
    outputs: [
      { id: 'choice', name: 'Choice Point', type: 'plotPoint' },
      { id: 'optionA', name: 'Option A Path', type: 'scene' },
      { id: 'optionB', name: 'Option B Path', type: 'scene' },
      { id: 'optionC', name: 'Option C Path', type: 'scene' },
    ],
    parameters: [
      { id: 'numChoices', name: 'Number of Choices', type: 'select', default: '2', options: [
        { label: 'Binary (2 choices)', value: '2' },
        { label: 'Triple (3 choices)', value: '3' },
        { label: 'Multiple (4 choices)', value: '4' },
      ]},
      { id: 'choiceType', name: 'Choice Nature', type: 'select', default: 'moral', options: [
        { label: 'Moral Dilemma', value: 'moral' },
        { label: 'Action Choice', value: 'action' },
        { label: 'Dialogue Response', value: 'dialogue' },
        { label: 'Strategic Decision', value: 'strategic' },
        { label: 'Relationship Choice', value: 'relationship' },
      ]},
      { id: 'consequenceWeight', name: 'Consequence Impact', type: 'slider', default: 0.5, min: 0, max: 1, step: 0.1 },
      { id: 'convergence', name: 'Path Convergence', type: 'select', default: 'delayed', options: [
        { label: 'Immediate (Next scene)', value: 'immediate' },
        { label: 'Delayed (Few scenes)', value: 'delayed' },
        { label: 'Major Branch (Long divergence)', value: 'major' },
        { label: 'Permanent (Different endings)', value: 'permanent' },
      ]},
    ],
    aiModel: 'gemini-2.5-flash',
  },

  // ConsequenceTracker - Track impacts
  {
    type: 'consequenceTracker',
    category: 'branching',
    label: 'Consequence Tracker',
    displayName: 'Track Consequences',
    description: 'Track accumulated choices and determine their long-term story impacts.',
    quickHelp: 'Choice history → Meaningful consequences and variations',
    useCase: 'Managing branching complexity, ensuring choices matter',
    icon: 'AccountBalance',
    inputs: [
      { id: 'choices', name: 'Previous Choices', type: 'plotPoint', multiple: true, required: true },
      { id: 'story', name: 'Story Context', type: 'story' },
      { id: 'characters', name: 'Characters', type: 'character', multiple: true },
    ],
    outputs: [
      { id: 'consequences', name: 'Accumulated Consequences', type: 'plotPoint', multiple: true },
      { id: 'characterChanges', name: 'Character State Changes', type: 'character', multiple: true },
      { id: 'worldChanges', name: 'World State Changes', type: 'lore' },
    ],
    parameters: [
      { id: 'evaluationType', name: 'Evaluation Type', type: 'select', default: 'narrative', options: [
        { label: 'Narrative (Story impact)', value: 'narrative' },
        { label: 'Character (Relationship changes)', value: 'character' },
        { label: 'World (Setting changes)', value: 'world' },
        { label: 'Comprehensive (All)', value: 'comprehensive' },
      ]},
    ],
    aiModel: 'gemini-2.5-flash',
  },

  // PathMerge - Reunite paths
  {
    type: 'pathMerge',
    category: 'branching',
    label: 'Path Merge',
    displayName: 'Merge Paths',
    description: 'Reunite divergent story branches while honoring previous choices.',
    quickHelp: 'Multiple paths → Single continuation that acknowledges all',
    useCase: 'Managing branching complexity, creating convergence points',
    icon: 'CallMerge',
    inputs: [
      { id: 'pathA', name: 'Path A', type: 'scene', required: true },
      { id: 'pathB', name: 'Path B', type: 'scene', required: true },
      { id: 'pathC', name: 'Path C (Optional)', type: 'scene' },
      { id: 'story', name: 'Story Context', type: 'story' },
    ],
    outputs: [
      { id: 'mergedScene', name: 'Merged Scene', type: 'scene' },
      { id: 'variationNotes', name: 'Path-Specific Variations', type: 'text', multiple: true },
    ],
    parameters: [
      { id: 'mergeStyle', name: 'Merge Style', type: 'select', default: 'variations', options: [
        { label: 'Single Scene + Variations', value: 'variations' },
        { label: 'Common Ground Only', value: 'common' },
        { label: 'Acknowledge All Paths', value: 'acknowledge' },
      ]},
      { id: 'retainMemory', name: 'Retain Choice Memory', type: 'boolean', default: true },
    ],
    aiModel: 'gemini-2.5-flash',
  },

  // ============================================================================
  // STORYTELLING NODES - Visualization
  // ============================================================================

  // SceneVisualizer - Storyboard frames
  {
    type: 'sceneVisualizer',
    category: 'composite',
    label: 'Scene Visualizer',
    displayName: 'Visualize Scene',
    description: 'Generate storyboard frames or concept art from scene descriptions.',
    quickHelp: 'Scene → Visual representations with character consistency',
    useCase: 'Storyboarding, visualization, pitch materials',
    icon: 'Panorama',
    inputs: [
      { id: 'scene', name: 'Scene', type: 'scene', required: true },
      { id: 'characters', name: 'Character References', type: 'character', multiple: true },
      { id: 'location', name: 'Location Reference', type: 'location' },
      { id: 'style', name: 'Visual Style', type: 'style' },
    ],
    outputs: [
      { id: 'frames', name: 'Storyboard Frames', type: 'image', multiple: true },
      { id: 'keyFrame', name: 'Key Frame', type: 'image' },
    ],
    parameters: [
      { id: 'numFrames', name: 'Number of Frames', type: 'slider', default: 3, min: 1, max: 9, step: 1 },
      { id: 'visualStyle', name: 'Visual Style', type: 'select', default: 'cinematic', options: [
        { label: 'Cinematic/Photorealistic', value: 'cinematic' },
        { label: 'Illustrated/Storyboard', value: 'illustrated' },
        { label: 'Comic Book', value: 'comic' },
        { label: 'Concept Art', value: 'concept' },
        { label: 'Animated/Pixar Style', value: 'animated' },
        { label: 'Manga/Anime', value: 'manga' },
      ]},
      { id: 'aspectRatio', name: 'Frame Aspect Ratio', type: 'select', default: '16:9', options: [
        { label: '16:9 (Widescreen)', value: '16:9' },
        { label: '2.35:1 (Cinematic)', value: '2.35:1' },
        { label: '1:1 (Square)', value: '1:1' },
        { label: '9:16 (Vertical)', value: '9:16' },
      ]},
      { id: 'characterConsistency', name: 'Character Consistency', type: 'boolean', default: true },
    ],
    aiModel: 'flux-2-pro',
  },

  // ScreenplayFormatter - Script formatting
  {
    type: 'screenplayFormatter',
    category: 'output',
    label: 'Screenplay Formatter',
    displayName: 'Format as Screenplay',
    description: 'Convert story content into proper industry-standard screenplay format.',
    quickHelp: 'Scene/Story → Formatted screenplay pages',
    useCase: 'Creating scripts, professional formatting',
    icon: 'LocalMovies',
    inputs: [
      { id: 'content', name: 'Story Content', type: 'scene', required: true },
      { id: 'story', name: 'Full Story Context', type: 'story' },
    ],
    outputs: [
      { id: 'screenplay', name: 'Formatted Screenplay', type: 'text' },
      { id: 'pageCount', name: 'Estimated Page Count', type: 'text' },
    ],
    parameters: [
      { id: 'format', name: 'Script Format', type: 'select', default: 'film', options: [
        { label: 'Feature Film', value: 'film' },
        { label: 'TV Episode (Hour)', value: 'tv-hour' },
        { label: 'TV Episode (Half-hour)', value: 'tv-half' },
        { label: 'Short Film', value: 'short' },
        { label: 'Web Series', value: 'web' },
      ]},
      { id: 'includeSluglines', name: 'Include Scene Headers', type: 'boolean', default: true },
      { id: 'includeParentheticals', name: 'Include Parentheticals', type: 'boolean', default: true },
    ],
    aiModel: 'gemini-2.5-flash',
  },
];

export const getNodesByCategory = (category: string): NodeDefinition[] => {
  return nodeDefinitions.filter((node) => node.category === category);
};

export const getNodeDefinition = (type: string): NodeDefinition | undefined => {
  return nodeDefinitions.find((node) => node.type === type);
};

export const nodeCategories = [
  { id: 'input', label: 'Input', icon: 'Input', color: '#22c55e' },
  { id: 'imageGen', label: 'Image Gen', icon: 'Image', color: '#3b82f6' },
  { id: 'videoGen', label: 'Video Gen', icon: 'Videocam', color: '#8b5cf6' },
  { id: 'threeD', label: '3D', icon: 'ViewInAr', color: '#f97316' },
  { id: 'multiFrame', label: 'Multi-Frame', icon: 'GridView', color: '#14b8a6' },
  { id: 'character', label: 'Character', icon: 'Person', color: '#ec4899' },
  { id: 'style', label: 'Style', icon: 'Palette', color: '#06b6d4' },
  { id: 'composite', label: 'Composite', icon: 'AutoAwesome', color: '#6366f1' },
  { id: 'output', label: 'Output', icon: 'Output', color: '#ef4444' },
  // Storytelling categories
  { id: 'narrative', label: 'Narrative', icon: 'AutoStories', color: '#10b981' },
  { id: 'worldBuilding', label: 'World Building', icon: 'Public', color: '#84cc16' },
  { id: 'dialogue', label: 'Dialogue', icon: 'Forum', color: '#f472b6' },
  { id: 'branching', label: 'Branching', icon: 'AccountTree', color: '#a78bfa' },
];
