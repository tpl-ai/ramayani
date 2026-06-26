export interface StoryClipping {
  publication: string;
  year: string;
  author: string;
  column: string;
  quote_en: string;
  image: string;
}

export interface StorySection {
  id: string;
  heading_en: string;
  heading_id: string;
  body_en: string;
  body_id: string;
  image?: string;
  image_caption_en?: string;
  image_caption_id?: string;
  press_clippings?: StoryClipping[];
}

export interface StoryMeta {
  page_title_en: string;
  page_title_id: string;
  page_subtitle_en: string;
  page_subtitle_id: string;
}

export interface StoryData {
  meta: StoryMeta;
  sections: StorySection[];
}
