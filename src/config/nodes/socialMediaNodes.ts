/**
 * Social Media Content Nodes - Posts, carousels, reels, content optimization
 */
import type { NodeDefinition } from '@/models/canvas';

export const socialMediaNodes: NodeDefinition[] = [
  // Social Post Generator
  {
    type: 'socialPostGenerator',
    category: 'socialMedia',
    label: 'Post Generator',
    displayName: 'Social Post Generator',
    description: 'Generate platform-optimized social media posts with images and captions.',
    quickHelp: 'Topic → Ready-to-post content with visuals',
    useCase: 'Social media marketing, content creation, brand presence',
    icon: 'Article',
    aiModel: 'flux-2-pro',
    tier: 'creative',
    inputs: [
      { id: 'topic', name: 'Post Topic', type: 'text', required: true },
      { id: 'brandKit', name: 'Brand Kit', type: 'brandKit' },
      { id: 'productImage', name: 'Product/Subject Image', type: 'image' },
    ],
    outputs: [
      { id: 'post', name: 'Post Image', type: 'post' },
      { id: 'caption', name: 'Caption', type: 'caption' },
      { id: 'hashtags', name: 'Hashtags', type: 'text' },
    ],
    parameters: [
      { id: 'platform', name: 'Platform', type: 'select', default: 'instagram', options: [
        { label: 'Instagram Feed', value: 'instagram' },
        { label: 'Instagram Story', value: 'instagramStory' },
        { label: 'TikTok', value: 'tiktok' },
        { label: 'Facebook', value: 'facebook' },
        { label: 'Twitter/X', value: 'twitter' },
        { label: 'LinkedIn', value: 'linkedin' },
        { label: 'Pinterest', value: 'pinterest' },
      ]},
      { id: 'contentType', name: 'Content Type', type: 'select', default: 'promotional', options: [
        { label: 'Promotional', value: 'promotional' },
        { label: 'Educational', value: 'educational' },
        { label: 'Behind the Scenes', value: 'bts' },
        { label: 'User Generated Content', value: 'ugc' },
        { label: 'Announcement', value: 'announcement' },
        { label: 'Inspirational', value: 'inspirational' },
      ]},
      { id: 'tone', name: 'Tone', type: 'select', default: 'professional', options: [
        { label: 'Professional', value: 'professional' },
        { label: 'Casual/Friendly', value: 'casual' },
        { label: 'Fun/Playful', value: 'playful' },
        { label: 'Luxurious', value: 'luxury' },
        { label: 'Edgy/Bold', value: 'edgy' },
      ]},
      { id: 'includeCaption', name: 'Generate Caption', type: 'boolean', default: true },
      { id: 'includeHashtags', name: 'Generate Hashtags', type: 'boolean', default: true },
    ],
    defaultDisplayMode: 'standard',
    slots: {
      preview: { type: 'image', aspectRatio: '1:1', showZoom: true },
      parameters: { layout: 'stack', visibleInModes: ['standard', 'expanded'] },
      actions: { primary: 'execute', secondary: ['download', 'duplicate'], showProgress: true },
    },
  },

  // Carousel Generator
  {
    type: 'carouselGenerator',
    category: 'socialMedia',
    label: 'Carousel Generator',
    displayName: 'Carousel Creator',
    description: 'Create multi-slide carousel posts for Instagram, LinkedIn, and other platforms.',
    quickHelp: 'Topic → Swipeable carousel slides',
    useCase: 'Educational content, product showcases, storytelling',
    icon: 'ViewCarousel',
    aiModel: 'flux-2-pro',
    tier: 'creative',
    inputs: [
      { id: 'topic', name: 'Carousel Topic', type: 'text', required: true },
      { id: 'brandKit', name: 'Brand Kit', type: 'brandKit' },
      { id: 'images', name: 'Source Images', type: 'image', multiple: true },
    ],
    outputs: [
      { id: 'slides', name: 'Carousel Slides', type: 'carousel' },
      { id: 'caption', name: 'Caption', type: 'caption' },
    ],
    parameters: [
      { id: 'platform', name: 'Platform', type: 'select', default: 'instagram', options: [
        { label: 'Instagram', value: 'instagram' },
        { label: 'LinkedIn', value: 'linkedin' },
        { label: 'Facebook', value: 'facebook' },
      ]},
      { id: 'slideCount', name: 'Number of Slides', type: 'slider', default: 5, min: 2, max: 10, step: 1 },
      { id: 'carouselType', name: 'Carousel Type', type: 'select', default: 'educational', options: [
        { label: 'Educational/Tips', value: 'educational' },
        { label: 'Product Showcase', value: 'product' },
        { label: 'Before/After', value: 'beforeAfter' },
        { label: 'Step-by-Step', value: 'steps' },
        { label: 'Listicle', value: 'listicle' },
        { label: 'Story/Narrative', value: 'story' },
      ]},
      { id: 'style', name: 'Visual Style', type: 'select', default: 'modern', options: [
        { label: 'Modern Minimal', value: 'modern' },
        { label: 'Bold & Colorful', value: 'bold' },
        { label: 'Clean Professional', value: 'professional' },
        { label: 'Playful', value: 'playful' },
      ]},
    ],
    defaultDisplayMode: 'expanded',
    slots: {
      preview: { type: 'gallery', aspectRatio: '1:1', showZoom: true },
      parameters: { layout: 'stack', visibleInModes: ['standard', 'expanded'] },
      actions: { primary: 'execute', secondary: ['download'], showProgress: true },
    },
  },

  // Caption Generator
  {
    type: 'captionGenerator',
    category: 'socialMedia',
    label: 'Caption Generator',
    displayName: 'AI Caption Writer',
    description: 'Generate engaging captions, hashtags, and CTAs for social media posts.',
    quickHelp: 'Post context → Platform-optimized caption',
    useCase: 'Social copywriting, engagement optimization, content scheduling',
    icon: 'Notes',
    aiModel: 'gemini-2.5-flash',
    inputs: [
      { id: 'postImage', name: 'Post Image', type: 'image' },
      { id: 'context', name: 'Post Context', type: 'text', required: true },
      { id: 'brandKit', name: 'Brand Voice', type: 'brandKit' },
    ],
    outputs: [
      { id: 'caption', name: 'Caption', type: 'caption' },
      { id: 'hashtags', name: 'Hashtags', type: 'text' },
      { id: 'alternatives', name: 'Alternative Captions', type: 'caption', multiple: true },
    ],
    parameters: [
      { id: 'platform', name: 'Platform', type: 'select', default: 'instagram', options: [
        { label: 'Instagram', value: 'instagram' },
        { label: 'TikTok', value: 'tiktok' },
        { label: 'Twitter/X', value: 'twitter' },
        { label: 'LinkedIn', value: 'linkedin' },
        { label: 'Facebook', value: 'facebook' },
      ]},
      { id: 'tone', name: 'Tone', type: 'select', default: 'engaging', options: [
        { label: 'Professional', value: 'professional' },
        { label: 'Engaging/Fun', value: 'engaging' },
        { label: 'Inspirational', value: 'inspirational' },
        { label: 'Educational', value: 'educational' },
        { label: 'Promotional', value: 'promotional' },
      ]},
      { id: 'length', name: 'Caption Length', type: 'select', default: 'medium', options: [
        { label: 'Short (1-2 sentences)', value: 'short' },
        { label: 'Medium (3-4 sentences)', value: 'medium' },
        { label: 'Long (Micro-blog)', value: 'long' },
      ]},
      { id: 'includeEmojis', name: 'Include Emojis', type: 'boolean', default: true },
      { id: 'includeCTA', name: 'Include Call-to-Action', type: 'boolean', default: true },
      { id: 'hashtagCount', name: 'Hashtag Count', type: 'slider', default: 10, min: 0, max: 30, step: 1 },
    ],
    defaultDisplayMode: 'standard',
    slots: {
      preview: { type: 'text', aspectRatio: 'auto' },
      parameters: { layout: 'stack', visibleInModes: ['standard', 'expanded'] },
      actions: { primary: 'execute', showProgress: true },
    },
  },

  // Content Scheduler (Planner)
  {
    type: 'contentScheduler',
    category: 'socialMedia',
    label: 'Content Planner',
    displayName: 'Content Calendar',
    description: 'Plan and organize social media content with AI-suggested posting schedules.',
    quickHelp: 'Goals → Optimized content calendar',
    useCase: 'Social media planning, content strategy, posting schedules',
    icon: 'CalendarMonth',
    aiModel: 'gemini-2.5-flash',
    inputs: [
      { id: 'posts', name: 'Content Queue', type: 'post', multiple: true },
      { id: 'brandKit', name: 'Brand Kit', type: 'brandKit' },
    ],
    outputs: [
      { id: 'schedule', name: 'Content Schedule', type: 'text' },
      { id: 'suggestions', name: 'Content Suggestions', type: 'text' },
    ],
    parameters: [
      { id: 'platforms', name: 'Platforms', type: 'select', default: 'instagram', options: [
        { label: 'Instagram', value: 'instagram' },
        { label: 'TikTok', value: 'tiktok' },
        { label: 'LinkedIn', value: 'linkedin' },
        { label: 'Twitter/X', value: 'twitter' },
        { label: 'All Platforms', value: 'all' },
      ]},
      { id: 'frequency', name: 'Posting Frequency', type: 'select', default: 'daily', options: [
        { label: 'Multiple per Day', value: 'multiple' },
        { label: 'Daily', value: 'daily' },
        { label: '3-4x per Week', value: 'frequent' },
        { label: '1-2x per Week', value: 'weekly' },
      ]},
      { id: 'planDuration', name: 'Plan Duration', type: 'select', default: 'week', options: [
        { label: '1 Week', value: 'week' },
        { label: '2 Weeks', value: 'twoWeeks' },
        { label: '1 Month', value: 'month' },
      ]},
      { id: 'optimizeTimings', name: 'Optimize Post Times', type: 'boolean', default: true },
    ],
    defaultDisplayMode: 'expanded',
    slots: {
      preview: { type: 'calendar', aspectRatio: '16:9' },
      parameters: { layout: 'inline', visibleInModes: ['standard', 'expanded'] },
      actions: { primary: 'execute', showProgress: true },
    },
  },

  // Story Creator
  {
    type: 'storyCreator',
    category: 'socialMedia',
    label: 'Story Creator',
    displayName: 'Stories/Reels Creator',
    description: 'Create vertical video content for Instagram Stories, TikTok, and Reels.',
    quickHelp: 'Content → Short-form vertical video',
    useCase: 'Stories, Reels, TikToks, YouTube Shorts',
    icon: 'Slideshow',
    aiModel: 'kling-2.6-pro',
    tier: 'production',
    inputs: [
      { id: 'concept', name: 'Story Concept', type: 'text', required: true },
      { id: 'images', name: 'Source Images', type: 'image', multiple: true },
      { id: 'brandKit', name: 'Brand Kit', type: 'brandKit' },
    ],
    outputs: [
      { id: 'video', name: 'Story Video', type: 'video' },
      { id: 'frames', name: 'Story Frames', type: 'image', multiple: true },
    ],
    parameters: [
      { id: 'platform', name: 'Platform', type: 'select', default: 'instagram', options: [
        { label: 'Instagram Stories/Reels', value: 'instagram' },
        { label: 'TikTok', value: 'tiktok' },
        { label: 'YouTube Shorts', value: 'youtube' },
      ]},
      { id: 'duration', name: 'Duration', type: 'select', default: '15s', options: [
        { label: '15 seconds', value: '15s' },
        { label: '30 seconds', value: '30s' },
        { label: '60 seconds', value: '60s' },
      ]},
      { id: 'storyType', name: 'Story Type', type: 'select', default: 'showcase', options: [
        { label: 'Product Showcase', value: 'showcase' },
        { label: 'Behind the Scenes', value: 'bts' },
        { label: 'Tutorial/How-to', value: 'tutorial' },
        { label: 'Announcement', value: 'announcement' },
        { label: 'Testimonial', value: 'testimonial' },
      ]},
      { id: 'includeMusic', name: 'Add Music', type: 'boolean', default: true },
      { id: 'includeText', name: 'Add Text Overlays', type: 'boolean', default: true },
    ],
    defaultDisplayMode: 'standard',
    slots: {
      preview: { type: 'video', aspectRatio: '9:16', showFullscreen: true },
      parameters: { layout: 'stack', visibleInModes: ['standard', 'expanded'] },
      actions: { primary: 'execute', secondary: ['download'], showProgress: true },
    },
  },

  // Template Customizer
  {
    type: 'templateCustomizer',
    category: 'socialMedia',
    label: 'Template Customizer',
    displayName: 'Template Editor',
    description: 'Customize social media templates with your brand colors, fonts, and content.',
    quickHelp: 'Template + Content → Branded post',
    useCase: 'Consistent branding, quick content creation, template variations',
    icon: 'CropPortrait',
    aiModel: 'flux-2-pro',
    inputs: [
      { id: 'template', name: 'Template', type: 'template', required: true },
      { id: 'brandKit', name: 'Brand Kit', type: 'brandKit' },
      { id: 'content', name: 'Content', type: 'text' },
      { id: 'image', name: 'Feature Image', type: 'image' },
    ],
    outputs: [
      { id: 'post', name: 'Customized Post', type: 'post' },
      { id: 'variations', name: 'Color Variations', type: 'post', multiple: true },
    ],
    parameters: [
      { id: 'platform', name: 'Platform Size', type: 'select', default: 'instagramSquare', options: [
        { label: 'Instagram Square (1:1)', value: 'instagramSquare' },
        { label: 'Instagram Portrait (4:5)', value: 'instagramPortrait' },
        { label: 'Instagram Story (9:16)', value: 'instagramStory' },
        { label: 'Facebook Cover', value: 'facebookCover' },
        { label: 'LinkedIn Post', value: 'linkedin' },
        { label: 'Twitter Header', value: 'twitterHeader' },
      ]},
      { id: 'generateVariations', name: 'Generate Color Variations', type: 'boolean', default: false },
    ],
    defaultDisplayMode: 'standard',
    slots: {
      preview: { type: 'image', aspectRatio: '1:1', showZoom: true },
      parameters: { layout: 'inline', visibleInModes: ['standard', 'expanded'] },
      actions: { primary: 'execute', secondary: ['download'], showProgress: true },
    },
  },

  // Thumbnail Generator
  {
    type: 'thumbnailGenerator',
    category: 'socialMedia',
    label: 'Thumbnail Generator',
    displayName: 'Video Thumbnail Creator',
    description: 'Generate eye-catching thumbnails for YouTube, TikTok, and video content.',
    quickHelp: 'Video/Title → Click-worthy thumbnail',
    useCase: 'YouTube thumbnails, video previews, content promotion',
    icon: 'Crop169',
    aiModel: 'flux-2-pro',
    inputs: [
      { id: 'title', name: 'Video Title', type: 'text', required: true },
      { id: 'keyFrame', name: 'Key Frame (Optional)', type: 'image' },
      { id: 'brandKit', name: 'Brand Kit', type: 'brandKit' },
    ],
    outputs: [
      { id: 'thumbnail', name: 'Thumbnail', type: 'image' },
      { id: 'variations', name: 'Variations', type: 'image', multiple: true },
    ],
    parameters: [
      { id: 'platform', name: 'Platform', type: 'select', default: 'youtube', options: [
        { label: 'YouTube (16:9)', value: 'youtube' },
        { label: 'TikTok (9:16)', value: 'tiktok' },
        { label: 'Instagram Reels (9:16)', value: 'instagram' },
        { label: 'Vimeo (16:9)', value: 'vimeo' },
      ]},
      { id: 'style', name: 'Thumbnail Style', type: 'select', default: 'bold', options: [
        { label: 'Bold & Attention-Grabbing', value: 'bold' },
        { label: 'Clean & Professional', value: 'professional' },
        { label: 'Dramatic & Cinematic', value: 'cinematic' },
        { label: 'Fun & Playful', value: 'playful' },
        { label: 'Minimal & Modern', value: 'minimal' },
      ]},
      { id: 'includeText', name: 'Include Text Overlay', type: 'boolean', default: true },
      { id: 'includeFace', name: 'Include Face/Person', type: 'boolean', default: true },
      { id: 'numVariations', name: 'Number of Variations', type: 'slider', default: 3, min: 1, max: 6, step: 1 },
    ],
    defaultDisplayMode: 'standard',
    slots: {
      preview: { type: 'image', aspectRatio: '16:9', showZoom: true },
      parameters: { layout: 'stack', visibleInModes: ['standard', 'expanded'] },
      actions: { primary: 'execute', secondary: ['download'], showProgress: true },
    },
  },

  // Hook Generator
  {
    type: 'hookGenerator',
    category: 'socialMedia',
    label: 'Hook Generator',
    displayName: 'Viral Hook Writer',
    description: 'Generate attention-grabbing opening lines and hooks for social media content.',
    quickHelp: 'Topic → Scroll-stopping hooks',
    useCase: 'Video intros, post openers, engagement optimization',
    icon: 'Flare',
    aiModel: 'gemini-2.5-flash',
    inputs: [
      { id: 'topic', name: 'Content Topic', type: 'text', required: true },
      { id: 'context', name: 'Additional Context', type: 'text' },
    ],
    outputs: [
      { id: 'hooks', name: 'Generated Hooks', type: 'text' },
      { id: 'bestHook', name: 'Top Recommended Hook', type: 'text' },
    ],
    parameters: [
      { id: 'platform', name: 'Platform', type: 'select', default: 'tiktok', options: [
        { label: 'TikTok/Reels (Short-form)', value: 'tiktok' },
        { label: 'YouTube (Long-form)', value: 'youtube' },
        { label: 'Twitter/X (Text)', value: 'twitter' },
        { label: 'LinkedIn (Professional)', value: 'linkedin' },
      ]},
      { id: 'hookType', name: 'Hook Type', type: 'select', default: 'curiosity', options: [
        { label: 'Curiosity Gap', value: 'curiosity' },
        { label: 'Controversial/Hot Take', value: 'controversial' },
        { label: 'Story-Based', value: 'story' },
        { label: 'Question', value: 'question' },
        { label: 'Statistic/Fact', value: 'statistic' },
        { label: 'Problem/Pain Point', value: 'problem' },
      ]},
      { id: 'tone', name: 'Tone', type: 'select', default: 'energetic', options: [
        { label: 'Energetic & Exciting', value: 'energetic' },
        { label: 'Professional & Authoritative', value: 'professional' },
        { label: 'Casual & Friendly', value: 'casual' },
        { label: 'Mysterious & Intriguing', value: 'mysterious' },
      ]},
      { id: 'numHooks', name: 'Number of Hooks', type: 'slider', default: 5, min: 3, max: 10, step: 1 },
    ],
    defaultDisplayMode: 'standard',
    slots: {
      preview: { type: 'text', aspectRatio: 'auto' },
      parameters: { layout: 'stack', visibleInModes: ['standard', 'expanded'] },
      actions: { primary: 'execute', showProgress: true },
    },
  },

  // Hashtag Optimizer
  {
    type: 'hashtagOptimizer',
    category: 'socialMedia',
    label: 'Hashtag Optimizer',
    displayName: 'Smart Hashtag Strategy',
    description: 'Generate optimized hashtag sets based on content, niche, and trending topics.',
    quickHelp: 'Content → Strategic hashtag mix',
    useCase: 'Reach optimization, discoverability, trend surfing',
    icon: 'Tag',
    aiModel: 'gemini-2.5-flash',
    inputs: [
      { id: 'content', name: 'Post Content/Topic', type: 'text', required: true },
      { id: 'postImage', name: 'Post Image (for analysis)', type: 'image' },
    ],
    outputs: [
      { id: 'hashtags', name: 'Optimized Hashtags', type: 'text' },
      { id: 'trendingTags', name: 'Trending Tags', type: 'text' },
      { id: 'nicheTags', name: 'Niche Tags', type: 'text' },
    ],
    parameters: [
      { id: 'platform', name: 'Platform', type: 'select', default: 'instagram', options: [
        { label: 'Instagram', value: 'instagram' },
        { label: 'TikTok', value: 'tiktok' },
        { label: 'Twitter/X', value: 'twitter' },
        { label: 'LinkedIn', value: 'linkedin' },
      ]},
      { id: 'niche', name: 'Content Niche', type: 'select', default: 'general', options: [
        { label: 'Fashion & Beauty', value: 'fashion' },
        { label: 'Food & Lifestyle', value: 'food' },
        { label: 'Fitness & Health', value: 'fitness' },
        { label: 'Business & Entrepreneurship', value: 'business' },
        { label: 'Tech & Innovation', value: 'tech' },
        { label: 'Art & Design', value: 'art' },
        { label: 'Travel & Adventure', value: 'travel' },
        { label: 'General/Mixed', value: 'general' },
      ]},
      { id: 'strategy', name: 'Hashtag Strategy', type: 'select', default: 'balanced', options: [
        { label: 'Balanced (Mix of sizes)', value: 'balanced' },
        { label: 'High Reach (Popular tags)', value: 'highReach' },
        { label: 'Niche Focus (Targeted)', value: 'niche' },
        { label: 'Trending (Current trends)', value: 'trending' },
      ]},
      { id: 'hashtagCount', name: 'Number of Hashtags', type: 'slider', default: 20, min: 5, max: 30, step: 1 },
    ],
    defaultDisplayMode: 'standard',
    slots: {
      preview: { type: 'text', aspectRatio: 'auto' },
      parameters: { layout: 'stack', visibleInModes: ['standard', 'expanded'] },
      actions: { primary: 'execute', showProgress: true },
    },
  },

  // Content Repurposer
  {
    type: 'contentRepurposer',
    category: 'socialMedia',
    label: 'Content Repurposer',
    displayName: 'Cross-Platform Adapter',
    description: 'Adapt content from one platform format to multiple other platforms automatically.',
    quickHelp: 'One piece of content → Multiple platform versions',
    useCase: 'Content efficiency, multi-platform presence, repurposing',
    icon: 'Transform',
    aiModel: 'gemini-2.5-flash',
    inputs: [
      { id: 'originalContent', name: 'Original Content', type: 'text', required: true },
      { id: 'originalImage', name: 'Original Image/Video', type: 'image' },
      { id: 'brandKit', name: 'Brand Kit', type: 'brandKit' },
    ],
    outputs: [
      { id: 'instagramPost', name: 'Instagram Version', type: 'post' },
      { id: 'twitterThread', name: 'Twitter Thread', type: 'text' },
      { id: 'linkedinPost', name: 'LinkedIn Version', type: 'text' },
      { id: 'tiktokScript', name: 'TikTok Script', type: 'text' },
    ],
    parameters: [
      { id: 'sourcePlatform', name: 'Original Platform', type: 'select', default: 'blog', options: [
        { label: 'Blog Post', value: 'blog' },
        { label: 'YouTube Video', value: 'youtube' },
        { label: 'Podcast', value: 'podcast' },
        { label: 'Instagram Post', value: 'instagram' },
        { label: 'Long-form Article', value: 'article' },
      ]},
      { id: 'targetPlatforms', name: 'Target Platforms', type: 'select', default: 'all', options: [
        { label: 'All Platforms', value: 'all' },
        { label: 'Instagram + TikTok', value: 'shortForm' },
        { label: 'LinkedIn + Twitter', value: 'professional' },
        { label: 'Visual Platforms', value: 'visual' },
      ]},
      { id: 'adaptationStyle', name: 'Adaptation Style', type: 'select', default: 'optimized', options: [
        { label: 'Fully Optimized (Per platform)', value: 'optimized' },
        { label: 'Consistent Voice', value: 'consistent' },
        { label: 'Experimental/Varied', value: 'experimental' },
      ]},
    ],
    defaultDisplayMode: 'expanded',
    slots: {
      preview: { type: 'text', aspectRatio: 'auto' },
      parameters: { layout: 'stack', visibleInModes: ['standard', 'expanded'] },
      actions: { primary: 'execute', showProgress: true },
    },
  },

  // Reel Generator
  {
    type: 'reelGenerator',
    category: 'socialMedia',
    label: 'Reel Generator',
    displayName: 'AI Reel Maker',
    description: 'Generate short-form vertical video scripts and storyboards for Reels and TikToks.',
    quickHelp: 'Idea → Complete reel script with shots',
    useCase: 'Instagram Reels, TikToks, YouTube Shorts',
    icon: 'MovieCreation',
    aiModel: 'kling-2.6-pro',
    tier: 'production',
    inputs: [
      { id: 'concept', name: 'Reel Concept', type: 'text', required: true },
      { id: 'productImages', name: 'Product/Subject Images', type: 'image', multiple: true },
      { id: 'voiceover', name: 'Voiceover Script', type: 'text' },
      { id: 'brandKit', name: 'Brand Kit', type: 'brandKit' },
    ],
    outputs: [
      { id: 'video', name: 'Generated Reel', type: 'video' },
      { id: 'storyboard', name: 'Storyboard Frames', type: 'image', multiple: true },
      { id: 'script', name: 'Script', type: 'text' },
    ],
    parameters: [
      { id: 'duration', name: 'Duration', type: 'select', default: '30s', options: [
        { label: '7 seconds (Hook only)', value: '7s' },
        { label: '15 seconds (Quick)', value: '15s' },
        { label: '30 seconds (Standard)', value: '30s' },
        { label: '60 seconds (Extended)', value: '60s' },
        { label: '90 seconds (Max)', value: '90s' },
      ]},
      { id: 'reelType', name: 'Reel Type', type: 'select', default: 'trending', options: [
        { label: 'Trending Format', value: 'trending' },
        { label: 'Product Showcase', value: 'product' },
        { label: 'Tutorial/How-To', value: 'tutorial' },
        { label: 'Before/After', value: 'beforeAfter' },
        { label: 'Day in Life', value: 'dayInLife' },
        { label: 'Get Ready With Me', value: 'grwm' },
        { label: 'Storytime', value: 'storytime' },
      ]},
      { id: 'pacing', name: 'Pacing', type: 'select', default: 'fast', options: [
        { label: 'Fast & Snappy', value: 'fast' },
        { label: 'Medium', value: 'medium' },
        { label: 'Slow & Aesthetic', value: 'slow' },
      ]},
      { id: 'includeHook', name: 'Generate Hook', type: 'boolean', default: true },
      { id: 'includeCTA', name: 'Include Call-to-Action', type: 'boolean', default: true },
      { id: 'trendingAudio', name: 'Suggest Trending Audio', type: 'boolean', default: true },
    ],
    defaultDisplayMode: 'standard',
    slots: {
      preview: { type: 'video', aspectRatio: '9:16', showFullscreen: true },
      parameters: { layout: 'stack', visibleInModes: ['standard', 'expanded'] },
      actions: { primary: 'execute', secondary: ['download'], showProgress: true },
    },
  },

  // Trend Spotter
  {
    type: 'trendSpotter',
    category: 'socialMedia',
    label: 'Trend Spotter',
    displayName: 'AI Trend Analyzer',
    description: 'Identify trending topics, sounds, and formats relevant to your niche.',
    quickHelp: 'Niche → Current trending opportunities',
    useCase: 'Content strategy, trend surfing, viral potential',
    icon: 'TrendingUp',
    aiModel: 'gemini-2.5-flash',
    inputs: [
      { id: 'niche', name: 'Your Niche/Industry', type: 'text', required: true },
      { id: 'pastContent', name: 'Past Content (for context)', type: 'text' },
    ],
    outputs: [
      { id: 'trends', name: 'Current Trends', type: 'text' },
      { id: 'trendingAudios', name: 'Trending Audio/Sounds', type: 'text' },
      { id: 'contentIdeas', name: 'Content Ideas', type: 'text' },
      { id: 'timingSuggestions', name: 'Timing Suggestions', type: 'text' },
    ],
    parameters: [
      { id: 'platform', name: 'Platform Focus', type: 'select', default: 'tiktok', options: [
        { label: 'TikTok', value: 'tiktok' },
        { label: 'Instagram', value: 'instagram' },
        { label: 'YouTube', value: 'youtube' },
        { label: 'Twitter/X', value: 'twitter' },
        { label: 'All Platforms', value: 'all' },
      ]},
      { id: 'trendType', name: 'Trend Type', type: 'select', default: 'all', options: [
        { label: 'All Trends', value: 'all' },
        { label: 'Audio/Sound Trends', value: 'audio' },
        { label: 'Format/Template Trends', value: 'format' },
        { label: 'Topic/Hashtag Trends', value: 'topic' },
        { label: 'Challenge Trends', value: 'challenge' },
      ]},
      { id: 'trendAge', name: 'Trend Freshness', type: 'select', default: 'emerging', options: [
        { label: 'Emerging (Early adopter)', value: 'emerging' },
        { label: 'Growing (Sweet spot)', value: 'growing' },
        { label: 'Peak (Max reach)', value: 'peak' },
        { label: 'All Stages', value: 'all' },
      ]},
    ],
    defaultDisplayMode: 'expanded',
    slots: {
      preview: { type: 'text', aspectRatio: 'auto' },
      parameters: { layout: 'inline', visibleInModes: ['standard', 'expanded'] },
      actions: { primary: 'execute', showProgress: true },
    },
  },
];
