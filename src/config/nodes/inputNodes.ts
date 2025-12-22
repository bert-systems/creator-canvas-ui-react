/**
 * Input Nodes - Sources for text, images, video, and references
 */
import type { NodeDefinition } from '@/models/canvas';

export const inputNodes: NodeDefinition[] = [
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
    defaultDisplayMode: 'standard',
    slots: {
      parameters: { layout: 'inline', visibleInModes: ['standard', 'expanded'] },
      actions: { primary: 'preview' },
    },
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
      { id: 'file', name: 'File', type: 'image' },
    ],
    defaultDisplayMode: 'standard',
    slots: {
      preview: { type: 'image', aspectRatio: 'auto', showZoom: true },
      parameters: { layout: 'inline', visibleInModes: ['expanded'] },
      actions: { primary: 'preview' },
    },
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
      { id: 'file', name: 'File', type: 'video' },
    ],
    defaultDisplayMode: 'standard',
    slots: {
      preview: { type: 'video', aspectRatio: '16:9', showFullscreen: true },
      parameters: { layout: 'inline', visibleInModes: ['expanded'] },
      actions: { primary: 'preview' },
    },
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
      { id: 'images', name: 'Images', type: 'image' },
    ],
    defaultDisplayMode: 'standard',
    slots: {
      preview: { type: 'gallery', aspectRatio: 'auto', showZoom: true },
      parameters: { layout: 'inline', visibleInModes: ['expanded'] },
      actions: { primary: 'preview' },
    },
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
      { id: 'files', name: 'Files', type: 'image' },
      { id: 'characterName', name: 'Character Name', type: 'text', default: '' },
    ],
    defaultDisplayMode: 'standard',
    slots: {
      preview: { type: 'gallery', aspectRatio: '3:4', showZoom: true },
      parameters: { layout: 'inline', visibleInModes: ['standard', 'expanded'], priorityParams: ['characterName'] },
      actions: { primary: 'preview' },
    },
  },
];
