export interface PressItem {
  publication: string;
  year: string;
  image?: string;
  image2?: string;
  quote_id?: string | null;
  quote_en?: string | null;
  note_id?: string | null;
  note_en?: string | null;
}

export interface StorySection {
  id: string;
  position: 'before_recipes' | 'between_categories' | 'after_recipes';
  after_category?: string;
  type: 'story' | 'press' | 'closing';
  title_id?: string;
  title_en?: string;
  image?: string | null;
  image_caption_id?: string;
  image_caption_en?: string;
  body_id?: string;
  body_en?: string;
  items?: PressItem[];
}

export interface StoryMeta {
  title_id: string;
  title_en: string;
  subtitle_id: string;
  subtitle_en: string;
  tagline_id: string;
  tagline_en: string;
  founder_id: string;
  founder_quote_id: string;
  founder_quote_en: string;
  cover_image: string;
  cover_caption_id: string;
  cover_caption_en: string;
}

export interface StoryData {
  meta: StoryMeta;
  sections: StorySection[];
}
