/**
 * Interior Design & Space Planning Nodes - Room redesign, staging, floor plans
 */
import type { NodeDefinition } from '@/models/canvas';

export const interiorDesignNodes: NodeDefinition[] = [
  // Room Redesign - AI-powered room transformation
  {
    type: 'roomRedesign',
    category: 'interiorDesign',
    label: 'Room Redesign',
    displayName: 'AI Room Redesign',
    description: 'Transform any room photo into a redesigned space with new style, furniture, and decor while preserving the room structure.',
    quickHelp: 'Upload room photo → Select style → Get redesigned room',
    useCase: 'Home staging, renovation planning, interior design concepts',
    icon: 'Home',
    aiModel: 'flux-2-pro',
    tier: 'production',
    inputs: [
      { id: 'roomImage', name: 'Room Photo', type: 'image', required: true },
      { id: 'styleReference', name: 'Style Reference', type: 'image' },
      { id: 'designStyle', name: 'Design Style', type: 'designStyle' },
    ],
    outputs: [
      { id: 'redesignedRoom', name: 'Redesigned Room', type: 'room' },
      { id: 'beforeAfter', name: 'Before/After', type: 'image' },
    ],
    parameters: [
      { id: 'roomType', name: 'Room Type', type: 'select', default: 'livingRoom', options: [
        { label: 'Living Room', value: 'livingRoom' },
        { label: 'Bedroom', value: 'bedroom' },
        { label: 'Kitchen', value: 'kitchen' },
        { label: 'Bathroom', value: 'bathroom' },
        { label: 'Dining Room', value: 'diningRoom' },
        { label: 'Home Office', value: 'homeOffice' },
        { label: 'Outdoor/Patio', value: 'outdoor' },
      ]},
      { id: 'style', name: 'Design Style', type: 'select', default: 'modern', options: [
        { label: 'Modern Minimalist', value: 'modern' },
        { label: 'Scandinavian', value: 'scandinavian' },
        { label: 'Industrial', value: 'industrial' },
        { label: 'Mid-Century Modern', value: 'midCentury' },
        { label: 'Bohemian', value: 'bohemian' },
        { label: 'Traditional', value: 'traditional' },
        { label: 'Coastal', value: 'coastal' },
        { label: 'Farmhouse', value: 'farmhouse' },
        { label: 'Japanese Zen', value: 'japandi' },
        { label: 'Art Deco', value: 'artDeco' },
      ]},
      { id: 'preserveStructure', name: 'Preserve Structure', type: 'boolean', default: true },
      { id: 'intensity', name: 'Redesign Intensity', type: 'slider', default: 0.7, min: 0.1, max: 1, step: 0.1 },
    ],
    defaultDisplayMode: 'standard',
    slots: {
      preview: { type: 'comparison', aspectRatio: '16:9', showZoom: true },
      parameters: { layout: 'stack', visibleInModes: ['standard', 'expanded'], priorityParams: ['roomType', 'style'] },
      actions: { primary: 'execute', secondary: ['download', 'duplicate'], showProgress: true },
    },
  },

  // Virtual Staging - Add furniture to empty rooms
  {
    type: 'virtualStaging',
    category: 'interiorDesign',
    label: 'Virtual Staging',
    displayName: 'Virtual Staging',
    description: 'Add furniture and decor to empty rooms for real estate listings or design visualization.',
    quickHelp: 'Empty room → Fully staged space',
    useCase: 'Real estate staging, rental listings, property marketing',
    icon: 'Weekend',
    aiModel: 'flux-2-pro',
    tier: 'production',
    inputs: [
      { id: 'emptyRoom', name: 'Empty Room Photo', type: 'image', required: true },
      { id: 'furnitureStyle', name: 'Furniture Style', type: 'style' },
    ],
    outputs: [
      { id: 'stagedRoom', name: 'Staged Room', type: 'room' },
    ],
    parameters: [
      { id: 'roomType', name: 'Room Type', type: 'select', default: 'livingRoom', options: [
        { label: 'Living Room', value: 'livingRoom' },
        { label: 'Bedroom', value: 'bedroom' },
        { label: 'Kitchen', value: 'kitchen' },
        { label: 'Dining Room', value: 'diningRoom' },
        { label: 'Home Office', value: 'homeOffice' },
      ]},
      { id: 'style', name: 'Staging Style', type: 'select', default: 'modern', options: [
        { label: 'Modern', value: 'modern' },
        { label: 'Contemporary', value: 'contemporary' },
        { label: 'Traditional', value: 'traditional' },
        { label: 'Scandinavian', value: 'scandinavian' },
        { label: 'Luxury', value: 'luxury' },
      ]},
      { id: 'furnishingLevel', name: 'Furnishing Level', type: 'select', default: 'full', options: [
        { label: 'Minimal', value: 'minimal' },
        { label: 'Standard', value: 'standard' },
        { label: 'Full', value: 'full' },
        { label: 'Luxury', value: 'luxury' },
      ]},
    ],
    defaultDisplayMode: 'standard',
    slots: {
      preview: { type: 'image', aspectRatio: '16:9', showZoom: true },
      parameters: { layout: 'inline', visibleInModes: ['standard', 'expanded'] },
      actions: { primary: 'execute', secondary: ['download'], showProgress: true },
    },
  },

  // Floor Plan Generator
  {
    type: 'floorPlanGenerator',
    category: 'spacePlanning',
    label: 'Floor Plan Generator',
    displayName: 'AI Floor Plan',
    description: 'Generate floor plans from room dimensions or photos, with furniture layout suggestions.',
    quickHelp: 'Input dimensions or photo → Get floor plan with layouts',
    useCase: 'Space planning, architecture, furniture arrangement',
    icon: 'Dashboard',
    aiModel: 'gemini-2.5-flash',
    inputs: [
      { id: 'roomPhoto', name: 'Room Photo (Optional)', type: 'image' },
      { id: 'dimensions', name: 'Room Dimensions', type: 'text' },
    ],
    outputs: [
      { id: 'floorPlan', name: 'Floor Plan', type: 'floorPlan' },
      { id: 'layoutSuggestions', name: 'Layout Options', type: 'roomLayout', multiple: true },
    ],
    parameters: [
      { id: 'length', name: 'Length (ft)', type: 'number', default: 15, min: 5, max: 100 },
      { id: 'width', name: 'Width (ft)', type: 'number', default: 12, min: 5, max: 100 },
      { id: 'roomType', name: 'Room Type', type: 'select', default: 'livingRoom', options: [
        { label: 'Living Room', value: 'livingRoom' },
        { label: 'Bedroom', value: 'bedroom' },
        { label: 'Open Plan', value: 'openPlan' },
        { label: 'Studio', value: 'studio' },
      ]},
      { id: 'includeLayout', name: 'Include Furniture Layout', type: 'boolean', default: true },
    ],
    defaultDisplayMode: 'standard',
    slots: {
      preview: { type: 'image', aspectRatio: '1:1', showZoom: true },
      parameters: { layout: 'grid', visibleInModes: ['standard', 'expanded'] },
      actions: { primary: 'execute', showProgress: true },
    },
  },

  // Furniture Suggestion
  {
    type: 'furnitureSuggestion',
    category: 'interiorDesign',
    label: 'Furniture Finder',
    displayName: 'AI Furniture Suggestions',
    description: 'Get furniture recommendations that match your room style, dimensions, and budget.',
    quickHelp: 'Room photo or style → Matching furniture suggestions',
    useCase: 'Interior shopping, design curation, style matching',
    icon: 'Weekend',
    aiModel: 'gemini-2.5-flash',
    inputs: [
      { id: 'roomImage', name: 'Room Photo', type: 'image' },
      { id: 'style', name: 'Style Reference', type: 'style' },
    ],
    outputs: [
      { id: 'suggestions', name: 'Furniture Suggestions', type: 'furniture', multiple: true },
      { id: 'moodboard', name: 'Furniture Moodboard', type: 'moodboard' },
    ],
    parameters: [
      { id: 'furnitureType', name: 'Furniture Type', type: 'select', default: 'sofa', options: [
        { label: 'Sofa/Seating', value: 'sofa' },
        { label: 'Tables', value: 'tables' },
        { label: 'Chairs', value: 'chairs' },
        { label: 'Storage', value: 'storage' },
        { label: 'Lighting', value: 'lighting' },
        { label: 'Decor', value: 'decor' },
        { label: 'All Categories', value: 'all' },
      ]},
      { id: 'style', name: 'Style', type: 'select', default: 'modern', options: [
        { label: 'Modern', value: 'modern' },
        { label: 'Scandinavian', value: 'scandinavian' },
        { label: 'Mid-Century', value: 'midCentury' },
        { label: 'Industrial', value: 'industrial' },
        { label: 'Traditional', value: 'traditional' },
        { label: 'Bohemian', value: 'bohemian' },
      ]},
      { id: 'budget', name: 'Budget Level', type: 'select', default: 'mid', options: [
        { label: 'Budget', value: 'budget' },
        { label: 'Mid-Range', value: 'mid' },
        { label: 'Premium', value: 'premium' },
        { label: 'Luxury', value: 'luxury' },
      ]},
    ],
    defaultDisplayMode: 'standard',
    slots: {
      preview: { type: 'gallery', aspectRatio: '1:1', showZoom: true },
      parameters: { layout: 'inline', visibleInModes: ['standard', 'expanded'] },
      actions: { primary: 'execute', showProgress: true },
    },
  },

  // Material Palette
  {
    type: 'materialPalette',
    category: 'interiorDesign',
    label: 'Material Palette',
    displayName: 'Material & Finish Palette',
    description: 'Generate cohesive material palettes for floors, walls, countertops, and finishes.',
    quickHelp: 'Style input → Curated material palette',
    useCase: 'Renovation planning, design specifications, material selection',
    icon: 'Layers',
    aiModel: 'gemini-2.5-flash',
    inputs: [
      { id: 'roomImage', name: 'Room Reference', type: 'image' },
      { id: 'styleReference', name: 'Style Reference', type: 'style' },
    ],
    outputs: [
      { id: 'palette', name: 'Material Palette', type: 'material', multiple: true },
      { id: 'visualization', name: 'Palette Visualization', type: 'image' },
    ],
    parameters: [
      { id: 'style', name: 'Design Style', type: 'select', default: 'modern', options: [
        { label: 'Modern', value: 'modern' },
        { label: 'Rustic', value: 'rustic' },
        { label: 'Industrial', value: 'industrial' },
        { label: 'Scandinavian', value: 'scandinavian' },
        { label: 'Mediterranean', value: 'mediterranean' },
        { label: 'Transitional', value: 'transitional' },
      ]},
      { id: 'includeFlooring', name: 'Include Flooring', type: 'boolean', default: true },
      { id: 'includeWalls', name: 'Include Wall Finishes', type: 'boolean', default: true },
      { id: 'includeCountertops', name: 'Include Countertops', type: 'boolean', default: true },
    ],
    defaultDisplayMode: 'standard',
    slots: {
      preview: { type: 'gallery', aspectRatio: '1:1', showZoom: true },
      parameters: { layout: 'stack', visibleInModes: ['standard', 'expanded'] },
      actions: { primary: 'execute', showProgress: true },
    },
  },

  // Room 3D Visualizer
  {
    type: 'room3DVisualizer',
    category: 'spacePlanning',
    label: '3D Room Visualizer',
    displayName: '3D Room Preview',
    description: 'Convert 2D floor plans or photos into interactive 3D room visualizations.',
    quickHelp: 'Floor plan or photo → 3D walkthrough preview',
    useCase: '3D visualization, client presentations, design review',
    icon: 'ViewInAr',
    aiModel: 'meshy-6',
    tier: 'production',
    inputs: [
      { id: 'floorPlan', name: 'Floor Plan', type: 'floorPlan', required: true },
      { id: 'materials', name: 'Materials', type: 'material', multiple: true },
    ],
    outputs: [
      { id: 'model3d', name: '3D Model', type: 'mesh3d' },
      { id: 'renders', name: 'Rendered Views', type: 'image', multiple: true },
    ],
    parameters: [
      { id: 'ceilingHeight', name: 'Ceiling Height (ft)', type: 'number', default: 9, min: 7, max: 20 },
      { id: 'includeFurniture', name: 'Include Furniture', type: 'boolean', default: true },
      { id: 'lighting', name: 'Lighting', type: 'select', default: 'natural', options: [
        { label: 'Natural Daylight', value: 'natural' },
        { label: 'Evening Warm', value: 'evening' },
        { label: 'Studio Bright', value: 'studio' },
      ]},
    ],
    defaultDisplayMode: 'standard',
    slots: {
      preview: { type: '3d', aspectRatio: '16:9', showFullscreen: true },
      parameters: { layout: 'inline', visibleInModes: ['expanded'] },
      actions: { primary: 'execute', secondary: ['download'], showProgress: true },
    },
  },
];
