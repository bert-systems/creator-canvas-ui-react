/**
 * Output, Multi-Frame, and Enhancement Nodes
 */
import type { NodeDefinition } from '@/models/canvas';

export const outputNodes: NodeDefinition[] = [
  // OUTPUT NODES
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
    defaultDisplayMode: 'expanded',
    slots: {
      preview: { type: 'gallery', aspectRatio: 'auto', showZoom: true, showFullscreen: true },
      actions: { primary: 'preview', secondary: ['download'] },
    },
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
    defaultDisplayMode: 'standard',
    slots: {
      preview: { type: 'gallery', aspectRatio: 'auto', showDownload: true },
      parameters: { layout: 'inline', visibleInModes: ['standard', 'expanded'], priorityParams: ['format', 'quality'] },
      actions: { primary: 'download' },
    },
  },

  // MULTI-FRAME NODES - STACKS (Vertical 9:16)
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
    aiModel: 'flux-2-pro-edit',
    agentBinding: {
      agentType: 'multiframe-stack',
      endpoint: '/api/MultiFrame/stacks/time',
      config: {},
    },
    defaultDisplayMode: 'standard',
    slots: {
      preview: { type: 'gallery', aspectRatio: '9:16', showZoom: true },
      parameters: { layout: 'inline', visibleInModes: ['standard', 'expanded'], priorityParams: ['frameCount', 'timespan'] },
      actions: { primary: 'execute', secondary: ['download'], showProgress: true },
    },
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
    aiModel: 'flux-2-pro-edit',
    agentBinding: {
      agentType: 'multiframe-stack',
      endpoint: '/api/MultiFrame/stacks/multiverse',
      config: {},
    },
    defaultDisplayMode: 'standard',
    slots: {
      preview: { type: 'gallery', aspectRatio: '9:16', showZoom: true },
      parameters: { layout: 'inline', visibleInModes: ['standard', 'expanded'], priorityParams: ['frameCount', 'styles'] },
      actions: { primary: 'execute', secondary: ['download'], showProgress: true },
    },
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
    aiModel: 'flux-2-pro-edit',
    agentBinding: {
      agentType: 'multiframe-stack',
      endpoint: '/api/MultiFrame/stacks/time',
      config: { subtype: 'chrono' },
    },
    defaultDisplayMode: 'standard',
    slots: {
      preview: { type: 'gallery', aspectRatio: '9:16', showZoom: true },
      parameters: { layout: 'inline', visibleInModes: ['standard', 'expanded'], priorityParams: ['frameCount', 'startTime'] },
      actions: { primary: 'execute', secondary: ['download'], showProgress: true },
    },
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
    aiModel: 'flux-2-pro-edit',
    agentBinding: {
      agentType: 'multiframe-stack',
      endpoint: '/api/MultiFrame/stacks/concept',
      config: { subtype: 'subconscious' },
    },
    defaultDisplayMode: 'standard',
    slots: {
      preview: { type: 'gallery', aspectRatio: '9:16', showZoom: true },
      parameters: { layout: 'stack', visibleInModes: ['standard', 'expanded'], priorityParams: ['perceptionNote', 'distortion'] },
      actions: { primary: 'execute', secondary: ['download'], showProgress: true },
    },
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
    aiModel: 'flux-2-pro-edit',
    agentBinding: {
      agentType: 'multiframe-stack',
      endpoint: '/api/MultiFrame/stacks/perspective',
      config: {},
    },
    defaultDisplayMode: 'standard',
    slots: {
      preview: { type: 'gallery', aspectRatio: '9:16', showZoom: true },
      parameters: { layout: 'inline', visibleInModes: ['standard', 'expanded'], priorityParams: ['frameCount', 'startScale'] },
      actions: { primary: 'execute', secondary: ['download'], showProgress: true },
    },
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
    aiModel: 'flux-2-pro-edit',
    agentBinding: {
      agentType: 'multiframe-stack',
      endpoint: '/api/MultiFrame/stacks/transformation',
      config: {},
    },
    defaultDisplayMode: 'standard',
    slots: {
      preview: { type: 'comparison', aspectRatio: '9:16', showZoom: true },
      parameters: { layout: 'stack', visibleInModes: ['standard', 'expanded'], priorityParams: ['beforePrompt', 'afterPrompt', 'effectType'] },
      actions: { primary: 'execute', secondary: ['download'], showProgress: true },
    },
  },

  // MULTI-FRAME NODES - QUEUES (Horizontal 16:9+)
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
    aiModel: 'flux-2-pro-edit',
    agentBinding: {
      agentType: 'multiframe-queue',
      endpoint: '/api/MultiFrame/queues/comparison',
      config: { subtype: 'panorama' },
    },
    defaultDisplayMode: 'standard',
    slots: {
      preview: { type: 'gallery', aspectRatio: '16:9', showZoom: true },
      parameters: { layout: 'inline', visibleInModes: ['standard', 'expanded'], priorityParams: ['panelCount', 'environment'] },
      actions: { primary: 'execute', secondary: ['download'], showProgress: true },
    },
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
    aiModel: 'flux-2-pro-edit',
    agentBinding: {
      agentType: 'multiframe-queue',
      endpoint: '/api/MultiFrame/queues/process',
      config: { subtype: 'walkcycle' },
    },
    defaultDisplayMode: 'standard',
    slots: {
      preview: { type: 'gallery', aspectRatio: '16:9', showZoom: true },
      parameters: { layout: 'inline', visibleInModes: ['standard', 'expanded'], priorityParams: ['frameCount', 'locomotion'] },
      actions: { primary: 'execute', secondary: ['download'], showProgress: true },
    },
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
    aiModel: 'flux-2-pro-edit',
    agentBinding: {
      agentType: 'multiframe-queue',
      endpoint: '/api/MultiFrame/queues/storyboard',
      config: {},
    },
    defaultDisplayMode: 'standard',
    slots: {
      preview: { type: 'gallery', aspectRatio: '16:9', showZoom: true },
      parameters: { layout: 'stack', visibleInModes: ['standard', 'expanded'], priorityParams: ['setupPrompt', 'actionPrompt', 'reactionPrompt'] },
      actions: { primary: 'execute', secondary: ['download'], showProgress: true },
    },
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
    aiModel: 'flux-2-pro-edit',
    agentBinding: {
      agentType: 'multiframe-queue',
      endpoint: '/api/MultiFrame/queues/process',
      config: { subtype: 'motiontrail' },
    },
    defaultDisplayMode: 'standard',
    slots: {
      preview: { type: 'gallery', aspectRatio: '16:9', showZoom: true },
      parameters: { layout: 'inline', visibleInModes: ['standard', 'expanded'], priorityParams: ['trailCount', 'motionType'] },
      actions: { primary: 'execute', secondary: ['download'], showProgress: true },
    },
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
    aiModel: 'flux-2-pro-edit',
    agentBinding: {
      agentType: 'multiframe-queue',
      endpoint: '/api/MultiFrame/queues/comparison',
      config: { subtype: 'mirror' },
    },
    defaultDisplayMode: 'standard',
    slots: {
      preview: { type: 'comparison', aspectRatio: '16:9', showZoom: true },
      parameters: { layout: 'stack', visibleInModes: ['standard', 'expanded'], priorityParams: ['truthReveal', 'mirrorType'] },
      actions: { primary: 'execute', secondary: ['download'], showProgress: true },
    },
  },

  // MULTI-FRAME NODES - GRIDS (Matrix 1:1)
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
    aiModel: 'flux-2-pro-edit',
    agentBinding: {
      agentType: 'multiframe-grid',
      endpoint: '/api/MultiFrame/grids/contact',
      config: {},
    },
    defaultDisplayMode: 'standard',
    slots: {
      preview: { type: 'gallery', aspectRatio: '1:1', showZoom: true },
      parameters: { layout: 'inline', visibleInModes: ['standard', 'expanded'], priorityParams: ['topology', 'shotProgression'] },
      actions: { primary: 'execute', secondary: ['download'], showProgress: true },
    },
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
    aiModel: 'flux-2-pro-edit',
    agentBinding: {
      agentType: 'multiframe-grid',
      endpoint: '/api/MultiFrame/grids/turnaround',
      config: {},
    },
    defaultDisplayMode: 'standard',
    slots: {
      preview: { type: 'gallery', aspectRatio: '4:3', showZoom: true },
      parameters: { layout: 'inline', visibleInModes: ['standard', 'expanded'], priorityParams: ['topology', 'poseType'] },
      actions: { primary: 'execute', secondary: ['download'], showProgress: true },
    },
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
    aiModel: 'flux-2-pro-edit',
    agentBinding: {
      agentType: 'multiframe-grid',
      endpoint: '/api/MultiFrame/grids/lighting',
      config: {},
    },
    defaultDisplayMode: 'standard',
    slots: {
      preview: { type: 'gallery', aspectRatio: '1:1', showZoom: true },
      parameters: { layout: 'inline', visibleInModes: ['standard', 'expanded'], priorityParams: ['lightingSet'] },
      actions: { primary: 'execute', secondary: ['download'], showProgress: true },
    },
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
    aiModel: 'flux-2-pro-edit',
    agentBinding: {
      agentType: 'multiframe-grid',
      endpoint: '/api/MultiFrame/grids/expression',
      config: {},
    },
    defaultDisplayMode: 'standard',
    slots: {
      preview: { type: 'gallery', aspectRatio: '1:1', showZoom: true },
      parameters: { layout: 'inline', visibleInModes: ['standard', 'expanded'], priorityParams: ['emotionArc'] },
      actions: { primary: 'execute', secondary: ['download'], showProgress: true },
    },
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
    aiModel: 'flux-2-pro-edit',
    agentBinding: {
      agentType: 'multiframe-grid',
      endpoint: '/api/MultiFrame/grids/moodboard',
      config: { subtype: 'styleprism' },
    },
    defaultDisplayMode: 'standard',
    slots: {
      preview: { type: 'gallery', aspectRatio: '1:1', showZoom: true },
      parameters: { layout: 'inline', visibleInModes: ['standard', 'expanded'], priorityParams: ['styleSet', 'customStyles'] },
      actions: { primary: 'execute', secondary: ['download'], showProgress: true },
    },
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
    aiModel: 'flux-2-pro-edit',
    agentBinding: {
      agentType: 'multiframe-grid',
      endpoint: '/api/MultiFrame/grids/material',
      config: { subtype: 'entropy' },
    },
    defaultDisplayMode: 'standard',
    slots: {
      preview: { type: 'gallery', aspectRatio: '1:1', showZoom: true },
      parameters: { layout: 'inline', visibleInModes: ['standard', 'expanded'], priorityParams: ['direction', 'timeSpan'] },
      actions: { primary: 'execute', secondary: ['download'], showProgress: true },
    },
  },

  // ENHANCEMENT NODES
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
    aiModel: 'flux-2-pro-edit',
    defaultDisplayMode: 'standard',
    slots: {
      preview: { type: 'comparison', aspectRatio: 'auto', showZoom: true },
      parameters: { layout: 'inline', visibleInModes: ['standard', 'expanded'], priorityParams: ['scale', 'enhanceDetail'] },
      actions: { primary: 'execute', secondary: ['download'], showProgress: true },
    },
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
    aiModel: 'gemini-2.5-flash',
    defaultDisplayMode: 'standard',
    slots: {
      preview: { type: 'text', aspectRatio: 'auto' },
      parameters: { layout: 'inline', visibleInModes: ['standard', 'expanded'], priorityParams: ['style', 'verbosity'] },
      actions: { primary: 'execute', secondary: ['download'], showProgress: true },
    },
  },
];
