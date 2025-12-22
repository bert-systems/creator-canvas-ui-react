/**
 * Node Definitions Index - Aggregates all category-specific node definition files
 */
export { inputNodes } from './inputNodes';
export { imageGenNodes } from './imageGenNodes';
export { videoGenNodes } from './videoGenNodes';
export { styleNodes } from './styleNodes';
export { outputNodes } from './outputNodes';
export { storytellingNodes } from './storytellingNodes';
export { interiorDesignNodes } from './interiorDesignNodes';
export { moodboardNodes } from './moodboardNodes';
export { socialMediaNodes } from './socialMediaNodes';
export { audioNodes } from './audioNodes';

// Re-export aggregated array for convenience
import { inputNodes } from './inputNodes';
import { imageGenNodes } from './imageGenNodes';
import { videoGenNodes } from './videoGenNodes';
import { styleNodes } from './styleNodes';
import { outputNodes } from './outputNodes';
import { storytellingNodes } from './storytellingNodes';
import { interiorDesignNodes } from './interiorDesignNodes';
import { moodboardNodes } from './moodboardNodes';
import { socialMediaNodes } from './socialMediaNodes';
import { audioNodes } from './audioNodes';

export const allNodeDefinitions = [
  ...inputNodes,
  ...imageGenNodes,
  ...videoGenNodes,
  ...styleNodes,
  ...outputNodes,
  ...storytellingNodes,
  ...interiorDesignNodes,
  ...moodboardNodes,
  ...socialMediaNodes,
  ...audioNodes,
];
