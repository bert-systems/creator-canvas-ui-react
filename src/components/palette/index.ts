/**
 * Creative Palette Components
 *
 * Exports for the redesigned three-tab creative palette system.
 */

// Main component
export { CreativePalette, type CreativePaletteProps } from './CreativePalette';
export { default } from './CreativePalette';

// Tab components
export { CreateTab } from './CreateTab';
export { StyleTab } from './StyleTab';
export { AssetsTab } from './AssetsTab';

// Data and types
export {
  INTENT_CATEGORIES,
  TRENDING_ITEMS,
  STYLE_PRESETS,
  COLOR_PALETTES,
  SEARCH_CAPABILITIES,
  searchByCapability,
  type IntentCategory,
  type IntentSubcategory,
  type TrendingItem,
  type StylePreset,
  type ColorPalette,
  type AssetCollection,
  type RecentAsset,
  type SearchCapability,
} from './paletteData';
