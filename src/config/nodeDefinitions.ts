import type { NodeDefinition } from '@/models/canvas';

export const nodeDefinitions: NodeDefinition[] = [
  // ============================================================================
  // INPUT NODES
  // ============================================================================
  {
    type: 'textInput',
    category: 'input',
    label: 'Text Input',
    description: 'Enter text prompts or descriptions',
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
    description: 'Upload an image file',
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
    description: 'Upload a video file',
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
    description: 'Upload reference images for style/composition',
    icon: 'Collections',
    inputs: [],
    outputs: [{ id: 'images', name: 'Images', type: 'image', multiple: true }],
    parameters: [
      { id: 'files', name: 'Files', type: 'file' },
    ],
  },
  {
    type: 'characterReference',
    category: 'input',
    label: 'Character Reference',
    description: 'Upload character reference images (up to 7)',
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
    description: 'High-fidelity image generation (4MP, commercial)',
    icon: 'AutoAwesome',
    aiModel: 'fal-ai/flux-pro/v1.1',
    inputs: [
      { id: 'prompt', name: 'Prompt', type: 'text', required: true },
      { id: 'reference', name: 'Reference', type: 'image' },
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
    description: 'Experimental generation with LoRA support',
    icon: 'Science',
    aiModel: 'fal-ai/flux/dev',
    inputs: [
      { id: 'prompt', name: 'Prompt', type: 'text', required: true },
      { id: 'style', name: 'Style LoRA', type: 'style' },
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
    description: 'Multi-reference generation (14 refs, 5-face memory)',
    icon: 'GroupAdd',
    aiModel: 'fal-ai/nano-banana-pro',
    inputs: [
      { id: 'prompt', name: 'Prompt', type: 'text', required: true },
      { id: 'references', name: 'References', type: 'image', multiple: true },
      { id: 'characters', name: 'Characters', type: 'character', multiple: true },
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
    description: 'Context-aware editing and clothes swap',
    icon: 'Transform',
    aiModel: 'fal-ai/flux-kontext/pro',
    inputs: [
      { id: 'image', name: 'Source Image', type: 'image', required: true },
      { id: 'prompt', name: 'Edit Prompt', type: 'text', required: true },
    ],
    outputs: [{ id: 'image', name: 'Image', type: 'image' }],
    parameters: [
      { id: 'strength', name: 'Edit Strength', type: 'slider', default: 0.8, min: 0, max: 1, step: 0.05 },
    ],
  },

  // ============================================================================
  // VIDEO GENERATION NODES
  // ============================================================================
  {
    type: 'kling26T2V',
    category: 'videoGen',
    label: 'Kling 2.6 T2V',
    description: 'Text-to-video with native audio (1080p-4K)',
    icon: 'Videocam',
    aiModel: 'fal-ai/kling-video/v2.6/pro/text-to-video',
    inputs: [
      { id: 'prompt', name: 'Prompt', type: 'text', required: true },
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
    description: 'Image-to-video animation',
    icon: 'Animation',
    aiModel: 'fal-ai/kling-video/v2.6/pro/image-to-video',
    inputs: [
      { id: 'image', name: 'Source Image', type: 'image', required: true },
      { id: 'prompt', name: 'Motion Prompt', type: 'text' },
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
    description: 'Reference-to-video with character consistency (7 refs)',
    icon: 'PersonVideo',
    aiModel: 'fal-ai/kling-video/v1.6/pro/elements',
    inputs: [
      { id: 'references', name: 'References', type: 'image', multiple: true, required: true },
      { id: 'prompt', name: 'Scene Prompt', type: 'text', required: true },
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
    description: 'Cinematic video with native audio (8s)',
    icon: 'Movie',
    aiModel: 'fal-ai/veo3',
    inputs: [
      { id: 'prompt', name: 'Prompt', type: 'text', required: true },
      { id: 'image', name: 'First Frame', type: 'image' },
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
    description: 'Talking head from image + audio (48fps)',
    icon: 'RecordVoiceOver',
    aiModel: 'fal-ai/kling-video/v2/avatar',
    inputs: [
      { id: 'image', name: 'Portrait', type: 'image', required: true },
      { id: 'audio', name: 'Audio', type: 'audio', required: true },
    ],
    outputs: [{ id: 'video', name: 'Video', type: 'video' }],
    parameters: [
      { id: 'lipSyncStrength', name: 'Lip Sync Strength', type: 'slider', default: 0.8, min: 0, max: 1, step: 0.1 },
    ],
  },

  // ============================================================================
  // 3D GENERATION NODES
  // ============================================================================
  {
    type: 'meshy6',
    category: 'threeD',
    label: 'Meshy 6',
    description: 'Image-to-3D with PBR materials',
    icon: 'ViewInAr',
    aiModel: 'fal-ai/meshy',
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
    description: 'Fast 3D with quad mesh, FBX export',
    icon: '3dRotation',
    aiModel: 'fal-ai/tripo',
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
    description: 'Lock character identity across generations (up to 7 refs)',
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
    description: '5-face memory for multi-character scenes',
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
    description: 'Kling O1 element library for video consistency',
    icon: 'LibraryBooks',
    aiModel: 'fal-ai/kling-video/v1.6/pro/elements',
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
    description: 'Extract style DNA from reference images',
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
    description: 'Apply style to target image',
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
    description: 'Train custom LoRA from images',
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
    description: 'AI-powered garment try-on with multiple providers',
    icon: 'Checkroom',
    aiModel: 'multi-provider',
    inputs: [
      { id: 'model', name: 'Model Photo', type: 'image', required: true },
      { id: 'garment', name: 'Garment', type: 'image', required: true },
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
        { label: 'Speed', value: 'speed' },
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
    description: 'Change clothing via AI text prompt (FLUX Kontext)',
    icon: 'SwapHoriz',
    aiModel: 'fal-ai/flux-kontext/pro',
    inputs: [
      { id: 'person', name: 'Person Image', type: 'image', required: true },
      { id: 'prompt', name: 'Clothing Prompt', type: 'text', required: true },
    ],
    outputs: [{ id: 'image', name: 'Result', type: 'image' }],
    parameters: [
      { id: 'prompt', name: 'Clothing Description', type: 'text', default: '' },
      { id: 'preserveIdentity', name: 'Preserve Identity', type: 'boolean', default: true },
      { id: 'preserveBackground', name: 'Preserve Background', type: 'boolean', default: true },
      { id: 'guidanceScale', name: 'Guidance Scale', type: 'slider', default: 7.5, min: 1, max: 20, step: 0.5 },
      { id: 'numInferenceSteps', name: 'Steps', type: 'number', default: 30, min: 10, max: 50 },
    ],
  },
  {
    type: 'runwayAnimation',
    category: 'composite',
    label: 'Runway Animation',
    description: 'Fashion animation from lookbook image',
    icon: 'DirectionsWalk',
    aiModel: 'fal-ai/kling-video/v2.6/pro/image-to-video',
    inputs: [
      { id: 'image', name: 'Lookbook Image', type: 'image', required: true },
    ],
    outputs: [{ id: 'video', name: 'Runway Video', type: 'video' }],
    parameters: [
      { id: 'animationType', name: 'Animation Type', type: 'select', default: 'catwalk', options: [
        { label: 'Catwalk', value: 'catwalk' },
        { label: '360° Spin', value: 'spin' },
        { label: 'Fabric Flow', value: 'fabric-flow' },
        { label: 'Pose to Pose', value: 'pose-to-pose' },
      ]},
      { id: 'duration', name: 'Duration', type: 'select', default: 5, options: [
        { label: '5 seconds', value: 5 },
        { label: '10 seconds', value: 10 },
      ]},
      { id: 'audioEnabled', name: 'Enable Audio', type: 'boolean', default: false },
      { id: 'cameraMotion', name: 'Camera Motion', type: 'select', default: 'follow', options: [
        { label: 'Static', value: 'static' },
        { label: 'Follow Model', value: 'follow' },
        { label: 'Pan', value: 'pan' },
      ]},
      { id: 'musicStyle', name: 'Music Style', type: 'select', default: 'none', options: [
        { label: 'None', value: 'none' },
        { label: 'Electronic', value: 'electronic' },
        { label: 'Classical', value: 'classical' },
        { label: 'Ambient', value: 'ambient' },
      ]},
    ],
  },
  {
    type: 'storyboardAutopilot',
    category: 'composite',
    label: 'Storyboard Autopilot',
    description: 'Auto-generate storyboard sequence',
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
    description: 'Generate fashion collection video',
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
    description: 'Preview generated content',
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
    description: 'Export to file',
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
  { id: 'character', label: 'Character', icon: 'Person', color: '#ec4899' },
  { id: 'style', label: 'Style', icon: 'Palette', color: '#06b6d4' },
  { id: 'composite', label: 'Composite', icon: 'AutoAwesome', color: '#6366f1' },
  { id: 'output', label: 'Output', icon: 'Output', color: '#ef4444' },
];
