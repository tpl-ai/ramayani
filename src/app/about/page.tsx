import { getFilterCategories } from '@/lib/recipes';
import AboutView from './AboutView';

// Server Component: exists only to fetch the category-tab data for the
// header's RECIPES menu -- see the comment on Header's `categories` prop.
// Everything else on this page (Hertha's story, press, portrait) comes
// from lib/story.ts, not recipes.json.
export default function AboutPage() {
  const categories = getFilterCategories();
  return <AboutView categories={categories} />;
}
