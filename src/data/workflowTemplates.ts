/**
 * Workflow Templates - Pre-built connected workflows for each persona
 *
 * These templates provide users with ready-to-use workflows that demonstrate
 * how to connect nodes effectively for common creative tasks.
 */

import type { NodeType } from '../models/canvas';

// ============================================================================
// TYPES
// ============================================================================

export type PersonaType =
  | 'fashion'
  | 'storytelling'
  | 'interior'
  | 'content-creator'
  | 'ecommerce'
  | 'general';

export interface Persona {
  id: PersonaType;
  name: string;
  emoji: string;
  tagline: string;
  description: string;
  color: string;
  examples: string[];
}

export interface WorkflowNode {
  id: string;
  nodeType: NodeType;
  label: string;
  position: { x: number; y: number };
  parameters?: Record<string, unknown>;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  sourceHandle: string;
  target: string;
  targetHandle: string;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  persona: PersonaType;
  icon: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  guidedSteps: GuidedStep[];
  tags: string[];
  featured?: boolean;
}

export interface GuidedStep {
  order: number;
  nodeId: string;
  title: string;
  description: string;
  action: 'upload' | 'enter-text' | 'configure' | 'connect' | 'execute';
}

// ============================================================================
// PERSONA DEFINITIONS
// ============================================================================

export const PERSONAS: Persona[] = [
  {
    id: 'fashion',
    name: 'Fashion Designer',
    emoji: '👗',
    tagline: 'Create stunning fashion concepts & collections',
    description: 'Design garments, visualize outfits on models, build consistent collections with AI-powered tools.',
    color: '#E91E63',
    examples: ['Virtual try-on', 'Collection lookbooks', 'Style variations', 'Runway animations'],
  },
  {
    id: 'storytelling',
    name: 'Storyteller',
    emoji: '📖',
    tagline: 'Illustrate stories with consistent characters',
    description: 'Create characters that stay consistent across scenes, generate storyboards, and bring your narratives to life.',
    color: '#FF9800',
    examples: ['Character sheets', 'Scene illustrations', 'Expression studies', 'Storyboards'],
  },
  {
    id: 'interior',
    name: 'Interior Designer',
    emoji: '🏠',
    tagline: 'Visualize spaces & design concepts',
    description: 'Generate room concepts, explore lighting variations, create mood boards and before/after comparisons.',
    color: '#4CAF50',
    examples: ['Room concepts', 'Lighting studies', 'Material swaps', 'Before/after'],
  },
  {
    id: 'content-creator',
    name: 'Content Creator',
    emoji: '📱',
    tagline: 'Create engaging social media content',
    description: 'Generate videos, talking head content, trending visuals, and eye-catching posts for any platform.',
    color: '#9C27B0',
    examples: ['Talking head videos', 'Image animations', 'Style trending', 'Multi-format exports'],
  },
  {
    id: 'ecommerce',
    name: 'E-Commerce',
    emoji: '🛍️',
    tagline: 'Product visuals & marketing assets',
    description: 'Create product mockups, lifestyle images, and batch variations for your online store.',
    color: '#00BCD4',
    examples: ['Product mockups', 'Lifestyle shots', 'Batch variations', 'A/B test images'],
  },
  {
    id: 'general',
    name: 'General Creative',
    emoji: '🎨',
    tagline: 'Explore all creative possibilities',
    description: 'Access all tools and build custom workflows for any creative project.',
    color: '#607D8B',
    examples: ['Image generation', 'Video creation', '3D models', 'Custom workflows'],
  },
];

// ============================================================================
// FASHION DESIGNER WORKFLOWS
// ============================================================================

const FASHION_WORKFLOWS: WorkflowTemplate[] = [
  {
    id: 'fashion-garment-design',
    name: 'Design a Garment',
    description: 'Generate fashion designs from your text description. Perfect for exploring new concepts quickly.',
    persona: 'fashion',
    icon: '👗',
    difficulty: 'beginner',
    estimatedTime: '2 min',
    featured: true,
    tags: ['image', 'fashion', 'concept'],
    nodes: [
      {
        id: 'text-1',
        nodeType: 'textInput',
        label: 'Design Description',
        position: { x: 100, y: 200 },
        parameters: { text: '' },
      },
      {
        id: 'gen-1',
        nodeType: 'flux2Pro',
        label: 'Generate Design',
        position: { x: 400, y: 200 },
        parameters: {
          aspectRatio: '3:4',
          numImages: 4,
        },
      },
      {
        id: 'preview-1',
        nodeType: 'preview',
        label: 'Preview Results',
        position: { x: 700, y: 200 },
      },
    ],
    edges: [
      { id: 'e1', source: 'text-1', sourceHandle: 'text', target: 'gen-1', targetHandle: 'prompt' },
      { id: 'e2', source: 'gen-1', sourceHandle: 'image', target: 'preview-1', targetHandle: 'input' },
    ],
    guidedSteps: [
      {
        order: 1,
        nodeId: 'text-1',
        title: 'Describe Your Design',
        description: 'Enter a detailed description of your garment. Include style, fabric, colors, and silhouette.',
        action: 'enter-text',
      },
      {
        order: 2,
        nodeId: 'gen-1',
        title: 'Generate Images',
        description: 'Click the play button to generate your fashion design concepts.',
        action: 'execute',
      },
      {
        order: 3,
        nodeId: 'preview-1',
        title: 'Review & Save',
        description: 'Browse your generated designs and save your favorites to your collection.',
        action: 'configure',
      },
    ],
  },
  {
    id: 'fashion-virtual-tryon',
    name: 'Virtual Try-On',
    description: 'See how any garment looks on a model. Upload a person photo and a clothing item to visualize the outfit.',
    persona: 'fashion',
    icon: '👚',
    difficulty: 'beginner',
    estimatedTime: '3 min',
    featured: true,
    tags: ['try-on', 'fashion', 'composite'],
    nodes: [
      {
        id: 'model-1',
        nodeType: 'imageUpload',
        label: 'Model Photo',
        position: { x: 100, y: 100 },
      },
      {
        id: 'garment-1',
        nodeType: 'imageUpload',
        label: 'Garment Image',
        position: { x: 100, y: 350 },
      },
      {
        id: 'tryon-1',
        nodeType: 'virtualTryOn',
        label: 'Outfit Visualizer',
        position: { x: 400, y: 200 },
      },
      {
        id: 'preview-1',
        nodeType: 'preview',
        label: 'Try-On Result',
        position: { x: 700, y: 200 },
      },
    ],
    edges: [
      { id: 'e1', source: 'model-1', sourceHandle: 'image', target: 'tryon-1', targetHandle: 'modelImage' },
      { id: 'e2', source: 'garment-1', sourceHandle: 'image', target: 'tryon-1', targetHandle: 'garmentImage' },
      { id: 'e3', source: 'tryon-1', sourceHandle: 'image', target: 'preview-1', targetHandle: 'input' },
    ],
    guidedSteps: [
      {
        order: 1,
        nodeId: 'model-1',
        title: 'Upload Model Photo',
        description: 'Upload a clear photo of a person. Front-facing photos work best.',
        action: 'upload',
      },
      {
        order: 2,
        nodeId: 'garment-1',
        title: 'Upload Garment',
        description: 'Upload the clothing item you want to try on. Flat lay or mannequin photos work best.',
        action: 'upload',
      },
      {
        order: 3,
        nodeId: 'tryon-1',
        title: 'Generate Try-On',
        description: 'Click play to see how the garment looks on your model.',
        action: 'execute',
      },
    ],
  },
  {
    id: 'fashion-style-variations',
    name: 'Style Variations',
    description: 'Generate multiple style variations of a garment or concept using the Style Prism grid.',
    persona: 'fashion',
    icon: '🎨',
    difficulty: 'intermediate',
    estimatedTime: '4 min',
    tags: ['variations', 'grid', 'style'],
    nodes: [
      {
        id: 'ref-1',
        nodeType: 'imageUpload',
        label: 'Reference Image',
        position: { x: 100, y: 200 },
      },
      {
        id: 'grid-1',
        nodeType: 'gridStylePrism',
        label: 'Style Variations',
        position: { x: 400, y: 200 },
        parameters: {
          styles: ['Minimalist', 'Streetwear', 'Haute Couture', 'Vintage', 'Futuristic', 'Bohemian', 'Athletic', 'Romantic', 'Punk'],
        },
      },
      {
        id: 'preview-1',
        nodeType: 'preview',
        label: 'Style Grid',
        position: { x: 700, y: 200 },
      },
    ],
    edges: [
      { id: 'e1', source: 'ref-1', sourceHandle: 'image', target: 'grid-1', targetHandle: 'referenceImage' },
      { id: 'e2', source: 'grid-1', sourceHandle: 'images', target: 'preview-1', targetHandle: 'input' },
    ],
    guidedSteps: [
      {
        order: 1,
        nodeId: 'ref-1',
        title: 'Upload Reference',
        description: 'Upload a garment or fashion concept you want to explore in different styles.',
        action: 'upload',
      },
      {
        order: 2,
        nodeId: 'grid-1',
        title: 'Configure Styles',
        description: 'Choose which fashion styles you want to see variations in.',
        action: 'configure',
      },
      {
        order: 3,
        nodeId: 'grid-1',
        title: 'Generate Grid',
        description: 'Click play to generate a 3x3 grid of style variations.',
        action: 'execute',
      },
    ],
  },
];

// ============================================================================
// STORYTELLING WORKFLOWS
// ============================================================================

const STORYTELLING_WORKFLOWS: WorkflowTemplate[] = [
  {
    id: 'story-create-character',
    name: 'Create a Character',
    description: 'Design a character and lock their identity for consistent use across all your scenes.',
    persona: 'storytelling',
    icon: '👤',
    difficulty: 'beginner',
    estimatedTime: '3 min',
    featured: true,
    tags: ['character', 'consistency', 'identity'],
    nodes: [
      {
        id: 'text-1',
        nodeType: 'textInput',
        label: 'Character Description',
        position: { x: 100, y: 200 },
        parameters: { text: '' },
      },
      {
        id: 'gen-1',
        nodeType: 'flux2Pro',
        label: 'Generate Character',
        position: { x: 400, y: 200 },
        parameters: {
          aspectRatio: '1:1',
          numImages: 4,
        },
      },
      {
        id: 'lock-1',
        nodeType: 'characterLock',
        label: 'Lock Identity',
        position: { x: 700, y: 200 },
      },
    ],
    edges: [
      { id: 'e1', source: 'text-1', sourceHandle: 'text', target: 'gen-1', targetHandle: 'prompt' },
      { id: 'e2', source: 'gen-1', sourceHandle: 'image', target: 'lock-1', targetHandle: 'referenceImages' },
    ],
    guidedSteps: [
      {
        order: 1,
        nodeId: 'text-1',
        title: 'Describe Your Character',
        description: 'Write a detailed description: age, appearance, clothing style, personality traits.',
        action: 'enter-text',
      },
      {
        order: 2,
        nodeId: 'gen-1',
        title: 'Generate Options',
        description: 'Generate multiple character designs to choose from.',
        action: 'execute',
      },
      {
        order: 3,
        nodeId: 'lock-1',
        title: 'Lock Your Favorite',
        description: 'Select the best design to lock as your character identity for future scenes.',
        action: 'configure',
      },
    ],
  },
  {
    id: 'story-scene-with-character',
    name: 'Scene with Character',
    description: 'Place your locked character into any scene while maintaining their appearance.',
    persona: 'storytelling',
    icon: '🎬',
    difficulty: 'intermediate',
    estimatedTime: '3 min',
    featured: true,
    tags: ['scene', 'character', 'consistency'],
    nodes: [
      {
        id: 'char-1',
        nodeType: 'characterReference',
        label: 'Your Character',
        position: { x: 100, y: 100 },
      },
      {
        id: 'scene-1',
        nodeType: 'textInput',
        label: 'Scene Description',
        position: { x: 100, y: 350 },
        parameters: { text: '' },
      },
      {
        id: 'gen-1',
        nodeType: 'fluxKontext',
        label: 'Generate Scene',
        position: { x: 400, y: 200 },
      },
      {
        id: 'preview-1',
        nodeType: 'preview',
        label: 'Scene Result',
        position: { x: 700, y: 200 },
      },
    ],
    edges: [
      { id: 'e1', source: 'char-1', sourceHandle: 'character', target: 'gen-1', targetHandle: 'characterRef' },
      { id: 'e2', source: 'scene-1', sourceHandle: 'text', target: 'gen-1', targetHandle: 'prompt' },
      { id: 'e3', source: 'gen-1', sourceHandle: 'image', target: 'preview-1', targetHandle: 'input' },
    ],
    guidedSteps: [
      {
        order: 1,
        nodeId: 'char-1',
        title: 'Select Character',
        description: 'Choose a character you previously created and locked.',
        action: 'configure',
      },
      {
        order: 2,
        nodeId: 'scene-1',
        title: 'Describe the Scene',
        description: 'Describe where your character is and what they are doing.',
        action: 'enter-text',
      },
      {
        order: 3,
        nodeId: 'gen-1',
        title: 'Generate Scene',
        description: 'Click play to place your character in the scene.',
        action: 'execute',
      },
    ],
  },
  {
    id: 'story-expression-sheet',
    name: 'Expression Sheet',
    description: 'Generate a grid of character expressions for animation or illustration reference.',
    persona: 'storytelling',
    icon: '😊',
    difficulty: 'intermediate',
    estimatedTime: '4 min',
    tags: ['expressions', 'grid', 'character'],
    nodes: [
      {
        id: 'char-1',
        nodeType: 'imageUpload',
        label: 'Character Reference',
        position: { x: 100, y: 200 },
      },
      {
        id: 'grid-1',
        nodeType: 'gridExpression',
        label: 'Expression Matrix',
        position: { x: 400, y: 200 },
        parameters: {
          expressions: ['Happy', 'Sad', 'Angry', 'Surprised', 'Confused', 'Determined', 'Scared', 'Smug', 'Neutral'],
        },
      },
      {
        id: 'preview-1',
        nodeType: 'preview',
        label: 'Expression Sheet',
        position: { x: 700, y: 200 },
      },
    ],
    edges: [
      { id: 'e1', source: 'char-1', sourceHandle: 'image', target: 'grid-1', targetHandle: 'referenceImage' },
      { id: 'e2', source: 'grid-1', sourceHandle: 'images', target: 'preview-1', targetHandle: 'input' },
    ],
    guidedSteps: [
      {
        order: 1,
        nodeId: 'char-1',
        title: 'Upload Character',
        description: 'Upload a clear face shot of your character.',
        action: 'upload',
      },
      {
        order: 2,
        nodeId: 'grid-1',
        title: 'Choose Expressions',
        description: 'Select which emotions you want in your expression sheet.',
        action: 'configure',
      },
      {
        order: 3,
        nodeId: 'grid-1',
        title: 'Generate Sheet',
        description: 'Generate a 3x3 grid of expressions.',
        action: 'execute',
      },
    ],
  },
];

// ============================================================================
// INTERIOR DESIGN WORKFLOWS
// ============================================================================

const INTERIOR_WORKFLOWS: WorkflowTemplate[] = [
  {
    id: 'interior-room-concept',
    name: 'Room Concept',
    description: 'Generate interior design concepts from your description. Explore different styles and layouts.',
    persona: 'interior',
    icon: '🛋️',
    difficulty: 'beginner',
    estimatedTime: '2 min',
    featured: true,
    tags: ['room', 'concept', 'interior'],
    nodes: [
      {
        id: 'text-1',
        nodeType: 'textInput',
        label: 'Room Description',
        position: { x: 100, y: 200 },
        parameters: { text: '' },
      },
      {
        id: 'gen-1',
        nodeType: 'flux2Pro',
        label: 'Generate Room',
        position: { x: 400, y: 200 },
        parameters: {
          aspectRatio: '16:9',
          numImages: 4,
        },
      },
      {
        id: 'preview-1',
        nodeType: 'preview',
        label: 'Room Concepts',
        position: { x: 700, y: 200 },
      },
    ],
    edges: [
      { id: 'e1', source: 'text-1', sourceHandle: 'text', target: 'gen-1', targetHandle: 'prompt' },
      { id: 'e2', source: 'gen-1', sourceHandle: 'image', target: 'preview-1', targetHandle: 'input' },
    ],
    guidedSteps: [
      {
        order: 1,
        nodeId: 'text-1',
        title: 'Describe the Room',
        description: 'Include room type, style (modern, rustic, etc.), colors, key furniture, and mood.',
        action: 'enter-text',
      },
      {
        order: 2,
        nodeId: 'gen-1',
        title: 'Generate Concepts',
        description: 'Click play to generate interior design options.',
        action: 'execute',
      },
    ],
  },
  {
    id: 'interior-lighting-study',
    name: 'Lighting Study',
    description: 'See how a room looks at different times of day with various lighting conditions.',
    persona: 'interior',
    icon: '💡',
    difficulty: 'intermediate',
    estimatedTime: '4 min',
    featured: true,
    tags: ['lighting', 'stack', 'time'],
    nodes: [
      {
        id: 'room-1',
        nodeType: 'imageUpload',
        label: 'Room Photo',
        position: { x: 100, y: 200 },
      },
      {
        id: 'stack-1',
        nodeType: 'stackChrono',
        label: 'Lighting Timeline',
        position: { x: 400, y: 200 },
        parameters: {
          timePoints: ['Dawn', 'Morning', 'Noon', 'Afternoon', 'Golden Hour', 'Dusk'],
        },
      },
      {
        id: 'preview-1',
        nodeType: 'preview',
        label: 'Lighting Study',
        position: { x: 700, y: 200 },
      },
    ],
    edges: [
      { id: 'e1', source: 'room-1', sourceHandle: 'image', target: 'stack-1', targetHandle: 'referenceImage' },
      { id: 'e2', source: 'stack-1', sourceHandle: 'images', target: 'preview-1', targetHandle: 'input' },
    ],
    guidedSteps: [
      {
        order: 1,
        nodeId: 'room-1',
        title: 'Upload Room',
        description: 'Upload a room photo or generated concept.',
        action: 'upload',
      },
      {
        order: 2,
        nodeId: 'stack-1',
        title: 'Choose Times',
        description: 'Select which times of day you want to visualize.',
        action: 'configure',
      },
      {
        order: 3,
        nodeId: 'stack-1',
        title: 'Generate Study',
        description: 'Generate a vertical stack of lighting variations.',
        action: 'execute',
      },
    ],
  },
  {
    id: 'interior-before-after',
    name: 'Before & After',
    description: 'Create compelling before/after comparisons for renovations and redesigns.',
    persona: 'interior',
    icon: '↔️',
    difficulty: 'intermediate',
    estimatedTime: '3 min',
    tags: ['before-after', 'comparison', 'renovation'],
    nodes: [
      {
        id: 'before-1',
        nodeType: 'imageUpload',
        label: 'Before Photo',
        position: { x: 100, y: 100 },
      },
      {
        id: 'style-1',
        nodeType: 'textInput',
        label: 'Redesign Style',
        position: { x: 100, y: 350 },
        parameters: { text: '' },
      },
      {
        id: 'stack-1',
        nodeType: 'stackCauseEffect',
        label: 'Before/After',
        position: { x: 400, y: 200 },
      },
      {
        id: 'preview-1',
        nodeType: 'preview',
        label: 'Comparison',
        position: { x: 700, y: 200 },
      },
    ],
    edges: [
      { id: 'e1', source: 'before-1', sourceHandle: 'image', target: 'stack-1', targetHandle: 'referenceImage' },
      { id: 'e2', source: 'style-1', sourceHandle: 'text', target: 'stack-1', targetHandle: 'prompt' },
      { id: 'e3', source: 'stack-1', sourceHandle: 'images', target: 'preview-1', targetHandle: 'input' },
    ],
    guidedSteps: [
      {
        order: 1,
        nodeId: 'before-1',
        title: 'Upload "Before"',
        description: 'Upload the current state of the room.',
        action: 'upload',
      },
      {
        order: 2,
        nodeId: 'style-1',
        title: 'Describe Changes',
        description: 'Describe the redesign: new colors, furniture, style changes.',
        action: 'enter-text',
      },
      {
        order: 3,
        nodeId: 'stack-1',
        title: 'Generate Comparison',
        description: 'Create the before/after comparison.',
        action: 'execute',
      },
    ],
  },
];

// ============================================================================
// CONTENT CREATOR WORKFLOWS
// ============================================================================

const CONTENT_CREATOR_WORKFLOWS: WorkflowTemplate[] = [
  {
    id: 'content-talking-head',
    name: 'Talking Head Video',
    description: 'Create a video of yourself or an avatar speaking with lip sync. Perfect for social media.',
    persona: 'content-creator',
    icon: '🗣️',
    difficulty: 'beginner',
    estimatedTime: '3 min',
    featured: true,
    tags: ['video', 'avatar', 'lip-sync'],
    nodes: [
      {
        id: 'face-1',
        nodeType: 'imageUpload',
        label: 'Face Photo',
        position: { x: 100, y: 100 },
      },
      {
        id: 'audio-1',
        nodeType: 'audioUpload',
        label: 'Voice Audio',
        position: { x: 100, y: 350 },
      },
      {
        id: 'avatar-1',
        nodeType: 'klingAvatar',
        label: 'Talking Head Generator',
        position: { x: 400, y: 200 },
      },
      {
        id: 'preview-1',
        nodeType: 'preview',
        label: 'Video Result',
        position: { x: 700, y: 200 },
      },
    ],
    edges: [
      { id: 'e1', source: 'face-1', sourceHandle: 'image', target: 'avatar-1', targetHandle: 'faceImage' },
      { id: 'e2', source: 'audio-1', sourceHandle: 'audio', target: 'avatar-1', targetHandle: 'audio' },
      { id: 'e3', source: 'avatar-1', sourceHandle: 'video', target: 'preview-1', targetHandle: 'input' },
    ],
    guidedSteps: [
      {
        order: 1,
        nodeId: 'face-1',
        title: 'Upload Face Photo',
        description: 'Upload a clear front-facing photo. The face should be clearly visible.',
        action: 'upload',
      },
      {
        order: 2,
        nodeId: 'audio-1',
        title: 'Upload Audio',
        description: 'Upload your voice recording or script audio.',
        action: 'upload',
      },
      {
        order: 3,
        nodeId: 'avatar-1',
        title: 'Generate Video',
        description: 'Create your talking head video with lip sync.',
        action: 'execute',
      },
    ],
  },
  {
    id: 'content-image-animation',
    name: 'Animate an Image',
    description: 'Turn any still image into a short animated video with motion.',
    persona: 'content-creator',
    icon: '🎬',
    difficulty: 'beginner',
    estimatedTime: '2 min',
    featured: true,
    tags: ['video', 'animation', 'image-to-video'],
    nodes: [
      {
        id: 'image-1',
        nodeType: 'imageUpload',
        label: 'Image to Animate',
        position: { x: 100, y: 200 },
      },
      {
        id: 'animate-1',
        nodeType: 'kling26I2V',
        label: 'Image Animator',
        position: { x: 400, y: 200 },
        parameters: {
          duration: '5s',
          motionAmount: 'medium',
        },
      },
      {
        id: 'preview-1',
        nodeType: 'preview',
        label: 'Animated Video',
        position: { x: 700, y: 200 },
      },
    ],
    edges: [
      { id: 'e1', source: 'image-1', sourceHandle: 'image', target: 'animate-1', targetHandle: 'image' },
      { id: 'e2', source: 'animate-1', sourceHandle: 'video', target: 'preview-1', targetHandle: 'input' },
    ],
    guidedSteps: [
      {
        order: 1,
        nodeId: 'image-1',
        title: 'Upload Image',
        description: 'Upload an image you want to animate. Works great with portraits and landscapes.',
        action: 'upload',
      },
      {
        order: 2,
        nodeId: 'animate-1',
        title: 'Configure Motion',
        description: 'Choose duration and motion intensity.',
        action: 'configure',
      },
      {
        order: 3,
        nodeId: 'animate-1',
        title: 'Animate',
        description: 'Generate your animated video.',
        action: 'execute',
      },
    ],
  },
  {
    id: 'content-text-to-video',
    name: 'Text to Video',
    description: 'Generate a video from a text description. Great for quick content creation.',
    persona: 'content-creator',
    icon: '📝',
    difficulty: 'beginner',
    estimatedTime: '3 min',
    tags: ['video', 'text-to-video', 'ai'],
    nodes: [
      {
        id: 'text-1',
        nodeType: 'textInput',
        label: 'Video Description',
        position: { x: 100, y: 200 },
        parameters: { text: '' },
      },
      {
        id: 'gen-1',
        nodeType: 'veo31',
        label: 'Video Generator',
        position: { x: 400, y: 200 },
        parameters: {
          aspectRatio: '16:9',
          duration: '4s',
        },
      },
      {
        id: 'preview-1',
        nodeType: 'preview',
        label: 'Generated Video',
        position: { x: 700, y: 200 },
      },
    ],
    edges: [
      { id: 'e1', source: 'text-1', sourceHandle: 'text', target: 'gen-1', targetHandle: 'prompt' },
      { id: 'e2', source: 'gen-1', sourceHandle: 'video', target: 'preview-1', targetHandle: 'input' },
    ],
    guidedSteps: [
      {
        order: 1,
        nodeId: 'text-1',
        title: 'Describe Your Video',
        description: 'Write what you want to see: scene, action, camera movement, style.',
        action: 'enter-text',
      },
      {
        order: 2,
        nodeId: 'gen-1',
        title: 'Generate Video',
        description: 'Create your video from the description.',
        action: 'execute',
      },
    ],
  },
];

// ============================================================================
// E-COMMERCE WORKFLOWS
// ============================================================================

const ECOMMERCE_WORKFLOWS: WorkflowTemplate[] = [
  {
    id: 'ecommerce-product-variations',
    name: 'Product Variations',
    description: 'Generate multiple color or style variations of your product for A/B testing.',
    persona: 'ecommerce',
    icon: '🎨',
    difficulty: 'beginner',
    estimatedTime: '3 min',
    featured: true,
    tags: ['product', 'variations', 'grid'],
    nodes: [
      {
        id: 'product-1',
        nodeType: 'imageUpload',
        label: 'Product Photo',
        position: { x: 100, y: 200 },
      },
      {
        id: 'grid-1',
        nodeType: 'gridStylePrism',
        label: 'Color/Style Variations',
        position: { x: 400, y: 200 },
        parameters: {
          styles: ['Original', 'Black', 'White', 'Navy', 'Red', 'Green', 'Gold', 'Silver', 'Rose Gold'],
        },
      },
      {
        id: 'preview-1',
        nodeType: 'preview',
        label: 'Product Grid',
        position: { x: 700, y: 200 },
      },
    ],
    edges: [
      { id: 'e1', source: 'product-1', sourceHandle: 'image', target: 'grid-1', targetHandle: 'referenceImage' },
      { id: 'e2', source: 'grid-1', sourceHandle: 'images', target: 'preview-1', targetHandle: 'input' },
    ],
    guidedSteps: [
      {
        order: 1,
        nodeId: 'product-1',
        title: 'Upload Product',
        description: 'Upload a clean product photo on white or neutral background.',
        action: 'upload',
      },
      {
        order: 2,
        nodeId: 'grid-1',
        title: 'Choose Variations',
        description: 'Select colors or styles you want to generate.',
        action: 'configure',
      },
      {
        order: 3,
        nodeId: 'grid-1',
        title: 'Generate Grid',
        description: 'Create a grid of product variations.',
        action: 'execute',
      },
    ],
  },
  {
    id: 'ecommerce-lifestyle-shot',
    name: 'Lifestyle Shot',
    description: 'Place your product in a lifestyle context for marketing images.',
    persona: 'ecommerce',
    icon: '📷',
    difficulty: 'intermediate',
    estimatedTime: '3 min',
    featured: true,
    tags: ['lifestyle', 'marketing', 'context'],
    nodes: [
      {
        id: 'product-1',
        nodeType: 'imageUpload',
        label: 'Product Photo',
        position: { x: 100, y: 100 },
      },
      {
        id: 'context-1',
        nodeType: 'textInput',
        label: 'Lifestyle Scene',
        position: { x: 100, y: 350 },
        parameters: { text: '' },
      },
      {
        id: 'gen-1',
        nodeType: 'fluxKontext',
        label: 'Scene Generator',
        position: { x: 400, y: 200 },
      },
      {
        id: 'preview-1',
        nodeType: 'preview',
        label: 'Lifestyle Image',
        position: { x: 700, y: 200 },
      },
    ],
    edges: [
      { id: 'e1', source: 'product-1', sourceHandle: 'image', target: 'gen-1', targetHandle: 'image' },
      { id: 'e2', source: 'context-1', sourceHandle: 'text', target: 'gen-1', targetHandle: 'prompt' },
      { id: 'e3', source: 'gen-1', sourceHandle: 'image', target: 'preview-1', targetHandle: 'input' },
    ],
    guidedSteps: [
      {
        order: 1,
        nodeId: 'product-1',
        title: 'Upload Product',
        description: 'Upload your product on a clean background.',
        action: 'upload',
      },
      {
        order: 2,
        nodeId: 'context-1',
        title: 'Describe Scene',
        description: 'Describe the lifestyle context: "coffee table in modern living room", "beach towel on sandy shore".',
        action: 'enter-text',
      },
      {
        order: 3,
        nodeId: 'gen-1',
        title: 'Generate',
        description: 'Create the lifestyle shot.',
        action: 'execute',
      },
    ],
  },
  {
    id: 'ecommerce-upscale-enhance',
    name: 'Upscale & Enhance',
    description: 'Upscale low-resolution product photos to high quality for print or web.',
    persona: 'ecommerce',
    icon: '🔍',
    difficulty: 'beginner',
    estimatedTime: '2 min',
    tags: ['upscale', 'enhance', 'quality'],
    nodes: [
      {
        id: 'image-1',
        nodeType: 'imageUpload',
        label: 'Low-Res Image',
        position: { x: 100, y: 200 },
      },
      {
        id: 'upscale-1',
        nodeType: 'upscaleImage',
        label: 'AI Upscaler',
        position: { x: 400, y: 200 },
        parameters: {
          scale: 4,
          enhanceDetails: true,
        },
      },
      {
        id: 'preview-1',
        nodeType: 'preview',
        label: 'High-Res Result',
        position: { x: 700, y: 200 },
      },
    ],
    edges: [
      { id: 'e1', source: 'image-1', sourceHandle: 'image', target: 'upscale-1', targetHandle: 'image' },
      { id: 'e2', source: 'upscale-1', sourceHandle: 'image', target: 'preview-1', targetHandle: 'input' },
    ],
    guidedSteps: [
      {
        order: 1,
        nodeId: 'image-1',
        title: 'Upload Image',
        description: 'Upload the low-resolution image you want to enhance.',
        action: 'upload',
      },
      {
        order: 2,
        nodeId: 'upscale-1',
        title: 'Configure',
        description: 'Choose upscale factor (2x, 4x) and enhancement options.',
        action: 'configure',
      },
      {
        order: 3,
        nodeId: 'upscale-1',
        title: 'Upscale',
        description: 'Generate the high-resolution version.',
        action: 'execute',
      },
    ],
  },
];

// ============================================================================
// GENERAL CREATIVE WORKFLOWS
// ============================================================================

const GENERAL_WORKFLOWS: WorkflowTemplate[] = [
  {
    id: 'general-text-to-image',
    name: 'Text to Image',
    description: 'The simplest workflow: describe what you want and generate images.',
    persona: 'general',
    icon: '🎨',
    difficulty: 'beginner',
    estimatedTime: '1 min',
    featured: true,
    tags: ['image', 'basic', 'text-to-image'],
    nodes: [
      {
        id: 'text-1',
        nodeType: 'textInput',
        label: 'Your Prompt',
        position: { x: 100, y: 200 },
        parameters: { text: '' },
      },
      {
        id: 'gen-1',
        nodeType: 'flux2Pro',
        label: 'Image Generator',
        position: { x: 400, y: 200 },
        parameters: {
          numImages: 4,
        },
      },
      {
        id: 'preview-1',
        nodeType: 'preview',
        label: 'Results',
        position: { x: 700, y: 200 },
      },
    ],
    edges: [
      { id: 'e1', source: 'text-1', sourceHandle: 'text', target: 'gen-1', targetHandle: 'prompt' },
      { id: 'e2', source: 'gen-1', sourceHandle: 'image', target: 'preview-1', targetHandle: 'input' },
    ],
    guidedSteps: [
      {
        order: 1,
        nodeId: 'text-1',
        title: 'Enter Prompt',
        description: 'Describe what you want to create in detail.',
        action: 'enter-text',
      },
      {
        order: 2,
        nodeId: 'gen-1',
        title: 'Generate',
        description: 'Click play to create your images.',
        action: 'execute',
      },
    ],
  },
  {
    id: 'general-image-to-3d',
    name: 'Image to 3D Model',
    description: 'Convert any image into a 3D model you can rotate and export.',
    persona: 'general',
    icon: '🧊',
    difficulty: 'intermediate',
    estimatedTime: '3 min',
    featured: true,
    tags: ['3d', 'model', 'conversion'],
    nodes: [
      {
        id: 'image-1',
        nodeType: 'imageUpload',
        label: 'Source Image',
        position: { x: 100, y: 200 },
      },
      {
        id: '3d-1',
        nodeType: 'tripoV25',
        label: '3D Generator',
        position: { x: 400, y: 200 },
      },
      {
        id: 'preview-1',
        nodeType: 'preview',
        label: '3D Model',
        position: { x: 700, y: 200 },
      },
    ],
    edges: [
      { id: 'e1', source: 'image-1', sourceHandle: 'image', target: '3d-1', targetHandle: 'image' },
      { id: 'e2', source: '3d-1', sourceHandle: 'mesh3d', target: 'preview-1', targetHandle: 'input' },
    ],
    guidedSteps: [
      {
        order: 1,
        nodeId: 'image-1',
        title: 'Upload Image',
        description: 'Upload an image of an object you want to convert to 3D.',
        action: 'upload',
      },
      {
        order: 2,
        nodeId: '3d-1',
        title: 'Generate 3D',
        description: 'Create the 3D model from your image.',
        action: 'execute',
      },
    ],
  },
  {
    id: 'general-enhance-prompt',
    name: 'Enhance Your Prompt',
    description: 'Use AI to improve your prompt for better image generation results.',
    persona: 'general',
    icon: '✨',
    difficulty: 'beginner',
    estimatedTime: '2 min',
    tags: ['prompt', 'enhance', 'ai'],
    nodes: [
      {
        id: 'text-1',
        nodeType: 'textInput',
        label: 'Your Basic Prompt',
        position: { x: 100, y: 200 },
        parameters: { text: '' },
      },
      {
        id: 'enhance-1',
        nodeType: 'enhancePrompt',
        label: 'Prompt Enhancer',
        position: { x: 400, y: 100 },
      },
      {
        id: 'gen-1',
        nodeType: 'flux2Pro',
        label: 'Image Generator',
        position: { x: 700, y: 200 },
      },
      {
        id: 'preview-1',
        nodeType: 'preview',
        label: 'Results',
        position: { x: 1000, y: 200 },
      },
    ],
    edges: [
      { id: 'e1', source: 'text-1', sourceHandle: 'text', target: 'enhance-1', targetHandle: 'prompt' },
      { id: 'e2', source: 'enhance-1', sourceHandle: 'text', target: 'gen-1', targetHandle: 'prompt' },
      { id: 'e3', source: 'gen-1', sourceHandle: 'image', target: 'preview-1', targetHandle: 'input' },
    ],
    guidedSteps: [
      {
        order: 1,
        nodeId: 'text-1',
        title: 'Enter Basic Prompt',
        description: 'Write a simple description - the AI will enhance it.',
        action: 'enter-text',
      },
      {
        order: 2,
        nodeId: 'enhance-1',
        title: 'Enhance',
        description: 'Let AI add detail, style, and technical keywords.',
        action: 'execute',
      },
      {
        order: 3,
        nodeId: 'gen-1',
        title: 'Generate',
        description: 'Create images with your enhanced prompt.',
        action: 'execute',
      },
    ],
  },
];

// ============================================================================
// COMBINED EXPORTS
// ============================================================================

export const ALL_WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  ...FASHION_WORKFLOWS,
  ...STORYTELLING_WORKFLOWS,
  ...INTERIOR_WORKFLOWS,
  ...CONTENT_CREATOR_WORKFLOWS,
  ...ECOMMERCE_WORKFLOWS,
  ...GENERAL_WORKFLOWS,
];

export const getWorkflowsByPersona = (persona: PersonaType): WorkflowTemplate[] => {
  return ALL_WORKFLOW_TEMPLATES.filter(w => w.persona === persona);
};

export const getFeaturedWorkflows = (persona?: PersonaType): WorkflowTemplate[] => {
  const templates = persona
    ? ALL_WORKFLOW_TEMPLATES.filter(w => w.persona === persona)
    : ALL_WORKFLOW_TEMPLATES;
  return templates.filter(w => w.featured);
};

export const getWorkflowById = (id: string): WorkflowTemplate | undefined => {
  return ALL_WORKFLOW_TEMPLATES.find(w => w.id === id);
};

export const getPersonaById = (id: PersonaType): Persona | undefined => {
  return PERSONAS.find(p => p.id === id);
};
