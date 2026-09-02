import { getFilterCategories, getBrowseTypeList } from '@/lib/recipes';
import AboutView from './AboutView';

// Server Component: exists only to fetch the category/group-tab data for
// the header's RECIPES menu -- see the comment on Header's `categories`
// prop. Everything else on this page (Hertha's story, press, portrait)
// comes from lib/story.ts, not recipes.json.
export default function AboutPage() {
  const categories = getFilterCategories();
  const groupItems = getBrowseTypeList();
  return <AboutView categories={categories} groupItems={groupItems} />;
}
