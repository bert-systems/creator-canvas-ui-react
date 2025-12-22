/**
 * apiEnumMapper.ts - Central enum value mapping for API compatibility
 *
 * The backend API uses PascalCase enum values (e.g., "ThirdLimited", "ShortStory")
 * while the frontend uses lowercase/kebab-case (e.g., "third-limited", "short-story").
 * This utility provides bidirectional mapping between frontend and API formats.
 */

// ==================== UTILITY FUNCTIONS ====================

/**
 * Convert kebab-case or lowercase to PascalCase
 * Examples: "third-limited" → "ThirdLimited", "short" → "Short"
 */
export const toPascalCase = (str: string): string => {
  if (!str) return str;
  return str
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('');
};

/**
 * Convert PascalCase to kebab-case lowercase
 * Examples: "ThirdLimited" → "third-limited", "ShortStory" → "short-story"
 */
export const toKebabCase = (str: string): string => {
  if (!str) return str;
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase();
};

// ==================== STORYTELLING ENUMS ====================

export const storyGenreMap: Record<string, string> = {
  'fantasy': 'Fantasy', 'scifi': 'SciFi', 'sci-fi': 'SciFi',
  'mystery': 'Mystery', 'thriller': 'Thriller', 'romance': 'Romance',
  'horror': 'Horror', 'drama': 'Drama', 'comedy': 'Comedy',
  'adventure': 'Adventure', 'action': 'Adventure', 'literary': 'Literary',
  'historical': 'Historical', 'contemporary': 'Contemporary',
  'dystopian': 'Dystopian', 'magical-realism': 'MagicalRealism',
  'childrens': 'Literary',
};

export const povMap: Record<string, string> = {
  'first': 'First', 'second': 'Second', 'third-limited': 'ThirdLimited',
  'third-omniscient': 'ThirdOmniscient', 'multiple': 'Multiple',
};

export const targetLengthMap: Record<string, string> = {
  'flash': 'Flash', 'short': 'ShortStory', 'short-story': 'ShortStory',
  'novelette': 'ShortStory', 'novella': 'Novella', 'novel': 'Novel',
  'series': 'Series', 'script': 'Screenplay', 'screenplay': 'Screenplay',
};

export const audienceMap: Record<string, string> = {
  'children': 'Children', 'middle-grade': 'MiddleGrade', 'ya': 'YA',
  'new-adult': 'NewAdult', 'adult': 'Adult', 'general': 'General',
  'mature': 'Adult',
};

export const storyToneMap: Record<string, string> = {
  'dark': 'Dark', 'lighthearted': 'Lighthearted', 'serious': 'Serious',
  'whimsical': 'Whimsical', 'gritty': 'Gritty', 'hopeful': 'Hopeful',
  'melancholic': 'Melancholic', 'suspenseful': 'Suspenseful',
};

export const storyFrameworkMap: Record<string, string> = {
  'three-act': 'ThreeAct', 'threeact': 'ThreeAct',
  'save-the-cat': 'SaveTheCat', 'savethecat': 'SaveTheCat',
  'heros-journey': 'HerosJourney', 'herosjourney': 'HerosJourney',
  'story-circle': 'StoryCircle', 'storycircle': 'StoryCircle',
  'five-act': 'FiveAct', 'fiveact': 'FiveAct',
  'seven-point': 'SevenPoint', 'sevenpoint': 'SevenPoint',
  'freytags-pyramid': 'FreytagsPyramid', 'freytagspyramid': 'FreytagsPyramid',
  'kishotenketsu': 'Kishotenketsu',
};

export const detailLevelMap: Record<string, string> = {
  'high-level': 'HighLevel', 'highlevel': 'HighLevel',
  'detailed': 'Detailed',
  'comprehensive': 'Comprehensive',
};

// ==================== SOCIAL MEDIA ENUMS ====================

export const socialPlatformMap: Record<string, string> = {
  'instagram': 'Instagram', 'instagramStory': 'InstagramStory',
  'instagram-story': 'InstagramStory', 'tiktok': 'Tiktok',
  'facebook': 'Facebook', 'twitter': 'Twitter', 'linkedin': 'Linkedin',
  'pinterest': 'Pinterest', 'threads': 'Threads', 'youtube': 'Youtube',
};

export const contentToneMap: Record<string, string> = {
  'professional': 'Professional', 'casual': 'Casual', 'playful': 'Playful',
  'luxury': 'Luxury', 'edgy': 'Edgy', 'warm': 'Warm',
  'authoritative': 'Authoritative', 'friendly': 'Friendly',
};

export const captionLengthMap: Record<string, string> = {
  'short': 'Short', 'medium': 'Medium', 'long': 'Long',
};

export const carouselTypeMap: Record<string, string> = {
  'educational': 'Educational', 'product': 'Product',
  'beforeAfter': 'BeforeAfter', 'before-after': 'BeforeAfter',
  'steps': 'Steps', 'listicle': 'Listicle', 'story': 'Story',
  'comparison': 'Comparison', 'quotes': 'Quotes',
};

export const socialContentTypeMap: Record<string, string> = {
  'promotional': 'Promotional', 'educational': 'Educational',
  'bts': 'Bts', 'ugc': 'Ugc', 'announcement': 'Announcement',
  'inspirational': 'Inspirational', 'testimonial': 'Testimonial',
  'lifestyle': 'Lifestyle',
};

export const storyTypeMap: Record<string, string> = {
  'showcase': 'Showcase', 'bts': 'Bts', 'tutorial': 'Tutorial',
  'announcement': 'Announcement', 'testimonial': 'Testimonial',
  'dayInLife': 'DayInLife', 'day-in-life': 'DayInLife',
  'transformation': 'Transformation', 'trend': 'Trend',
};

export const hashtagStrategyMap: Record<string, string> = {
  'niche': 'Niche', 'popular': 'Popular', 'mixed': 'Mixed', 'branded': 'Branded',
};

// ==================== MOODBOARD ENUMS ====================

export const moodboardStyleMap: Record<string, string> = {
  'collage': 'Collage', 'pinterest': 'Pinterest', 'minimal': 'Minimal',
  'magazine': 'Magazine', 'scattered': 'Scattered', 'editorial': 'Editorial',
  'professional': 'Professional', 'artistic': 'Artistic',
};

export const moodToneMap: Record<string, string> = {
  'light': 'Light', 'dark': 'Dark', 'warm': 'Warm', 'cool': 'Cool',
  'vibrant': 'Vibrant', 'muted': 'Muted', 'balanced': 'Balanced',
  'dramatic': 'Dramatic', 'serene': 'Serene', 'energetic': 'Energetic',
};

export const industryTypeMap: Record<string, string> = {
  'tech': 'Tech', 'fashion': 'Fashion', 'food': 'Food', 'health': 'Health',
  'finance': 'Finance', 'creative': 'Creative', 'ecommerce': 'Ecommerce',
  'nonprofit': 'Nonprofit', 'education': 'Education',
  'entertainment': 'Entertainment', 'travel': 'Travel',
  'beauty': 'Beauty', 'sports': 'Sports',
};

export const brandPersonalityMap: Record<string, string> = {
  'professional': 'Professional', 'playful': 'Playful', 'luxury': 'Luxury',
  'modern': 'Modern', 'organic': 'Organic', 'bold': 'Bold',
  'minimal': 'Minimal', 'vintage': 'Vintage', 'futuristic': 'Futuristic',
};

export const textureTypeMap: Record<string, string> = {
  'fabric': 'Fabric', 'wood': 'Wood', 'stone': 'Stone', 'metal': 'Metal',
  'paper': 'Paper', 'leather': 'Leather', 'concrete': 'Concrete',
  'ceramic': 'Ceramic', 'glass': 'Glass', 'organic': 'Organic',
  'abstract': 'Abstract', 'geometric': 'Geometric', 'noise': 'Noise',
};

export const paletteTypeMap: Record<string, string> = {
  'dominant': 'Dominant', 'harmonious': 'Harmonious',
  'complementary': 'Complementary', 'analogous': 'Analogous',
  'triadic': 'Triadic', 'splitComplementary': 'SplitComplementary',
  'split-complementary': 'SplitComplementary', 'tetradic': 'Tetradic',
};

// ==================== FASHION ENUMS ====================

export const garmentTypeMap: Record<string, string> = {
  'dress': 'Dress', 'gown': 'Gown', 'jumpsuit': 'Jumpsuit', 'romper': 'Romper',
  'top': 'Top', 'blouse': 'Blouse', 'shirt': 'Shirt', 'tshirt': 'TShirt',
  't-shirt': 'TShirt', 'tank': 'Tank', 'crop-top': 'CropTop',
  'bodysuit': 'Bodysuit', 'pants': 'Pants', 'jeans': 'Jeans',
  'shorts': 'Shorts', 'skirt': 'Skirt', 'leggings': 'Leggings',
  'jacket': 'Jacket', 'coat': 'Coat', 'blazer': 'Blazer',
  'cardigan': 'Cardigan', 'vest': 'Vest', 'cape': 'Cape',
  'suit': 'Suit', 'co-ord': 'CoOrd', 'set': 'Set',
  'swimsuit': 'Swimsuit', 'bikini': 'Bikini', 'cover-up': 'CoverUp',
  'activewear-top': 'ActivewearTop', 'activewear-bottom': 'ActivewearBottom',
  'sports-bra': 'SportsBra',
};

export const seasonMap: Record<string, string> = {
  'spring': 'Spring', 'summer': 'Summer', 'fall': 'Fall', 'winter': 'Winter',
  'resort': 'Resort', 'pre-fall': 'PreFall', 'spring-summer': 'SpringSummer',
  'fall-winter': 'FallWinter',
};

export const genderMap: Record<string, string> = {
  'female': 'Female', 'male': 'Male', 'non-binary': 'NonBinary',
};

export const bodyShapeMap: Record<string, string> = {
  'hourglass': 'Hourglass', 'pear': 'Pear', 'apple': 'Apple',
  'rectangle': 'Rectangle', 'inverted-triangle': 'InvertedTriangle',
  'athletic': 'Athletic',
};

export const silhouetteMap: Record<string, string> = {
  'fitted': 'Fitted', 'a-line': 'ALine', 'empire': 'Empire',
  'mermaid': 'Mermaid', 'ballgown': 'Ballgown', 'shift': 'Shift',
  'wrap': 'Wrap', 'asymmetrical': 'Asymmetrical', 'column': 'Column',
  'trapeze': 'Trapeze', 'straight': 'Straight', 'wide-leg': 'WideLeg',
  'flared': 'Flared', 'tapered': 'Tapered', 'skinny': 'Skinny',
  'oversized': 'Oversized', 'boxy': 'Boxy', 'cropped': 'Cropped',
  'longline': 'Longline',
};

// ==================== GENERIC MAPPER ====================

/**
 * Map a frontend enum value to API format using a provided mapping
 * Falls back to PascalCase conversion if not found in map
 */
export const mapEnum = (value: string | undefined, mapping: Record<string, string>): string | undefined => {
  if (!value) return value;
  return mapping[value] || mapping[value.toLowerCase()] || toPascalCase(value);
};

/**
 * Map multiple enum values in a request object
 */
export const mapRequestEnums = <T extends Record<string, unknown>>(
  request: T,
  mappings: Array<{ key: keyof T; map: Record<string, string> }>
): T => {
  const result = { ...request };
  for (const { key, map } of mappings) {
    const value = result[key];
    if (typeof value === 'string') {
      (result as Record<string, unknown>)[key as string] = mapEnum(value, map);
    }
  }
  return result;
};
