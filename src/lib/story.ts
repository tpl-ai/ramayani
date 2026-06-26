import storyJson from '../../story.json';
import type { StoryData, StorySection, StoryMeta } from '@/types/story';

const data = storyJson as StoryData;

export const storyMeta: StoryMeta = data.meta;
export const storySections: StorySection[] = data.sections;
