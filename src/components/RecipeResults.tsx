'use client';

import { useState } from 'react';
import { recipePhotoSrc } from '@/lib/photo';
import type { RecipeSummary } from '@/types/recipe';

// Shared between /recipes and /search so the two can't drift apart the way
// they did before -- /search kept its own copy of this exact rendering and
// didn't get the grid/no-photo-list split when /recipes did.

function RecipeCard({ recipe, lang, onClick, onPhotoError }: { recipe: RecipeSummary; lang: 'en' | 'id'; onClick: () => void; onPhotoError: () => void }) {
  const [err, setErr] = useState(false);
  const name = lang === 'id' ? (recipe.name_id || recipe.name_en) : (recipe.name_en || recipe.name_id);
  const hasPhoto = !!recipe.photo && !err;

  return (
    <div
      onClick={recipe.content_state !== 'no_content' ? onClick : undefined}
      style={{
        cursor: recipe.content_state !== 'no_content' ? 'pointer' : 'default',
        opacity: recipe.content_state === 'no_content' ? 0.45 : 1,
      }}
    >
      <div style={{
        width: '100%',
        paddingBottom: '130%',
        position: 'relative',
        overflow: 'hidden',
        background: '#e8e2da',
      }}>
        {hasPhoto && (
          <img
            // Server-rendered <img> tags start loading as soon as the
            // browser parses the HTML -- often before React hydrates and
            // attaches onError. A fast 404 can finish failing before that
            // listener exists, so it never fires and the broken image
            // sits there silently. The ref callback catches that
            // already-failed state the moment React attaches to the DOM
            // node, same idiom as the fade-in effect on the recipe
            // detail page.
            ref={img => {
              if (img && img.complete && img.naturalWidth === 0) { setErr(true); onPhotoError(); }
            }}
            src={recipePhotoSrc(recipe.photo)}
            alt={name}
            onError={() => { setErr(true); onPhotoError(); }}
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'cover', display: 'block',
            }}
          />
        )}
      </div>
      <div style={{
        fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
        fontSize: 20, fontWeight: 400, color: '#1a1a1a', lineHeight: 1.2,
        marginTop: 8, paddingBottom: 16,
      }}>
        {name}
      </div>
    </div>
  );
}

// A recipe shown as a plain text row rather than a photo card -- either
// because it has no photo yet (the /recipes "More recipes" section below),
// or because the surface it's on (search results) deliberately never shows
// photos at all, to avoid fetching images for every partial keystroke as
// someone types -- see SearchView, which uses this directly. The small
// square is a quiet accent mark (sized to the header's EN/ID button
// height, in the same red as the Ramayani logo) rather than an icon, so a
// row still reads as "a recipe card," just without a photo.
export function TextRow({ recipe, lang, onClick }: { recipe: RecipeSummary; lang: 'en' | 'id'; onClick: () => void }) {
  const name = lang === 'id' ? (recipe.name_id || recipe.name_en) : (recipe.name_en || recipe.name_id);
  const ready = recipe.content_state !== 'no_content';

  return (
    <div
      onClick={ready ? onClick : undefined}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '14px 0', borderBottom: '1px solid #eee',
        cursor: ready ? 'pointer' : 'default',
        opacity: ready ? 1 : 0.6,
      }}
    >
      <div style={{ width: 14, height: 14, background: '#cc0000', flexShrink: 0 }} />
      <div style={{
        fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
        fontSize: 20, fontWeight: 400, lineHeight: 1.2,
        color: ready ? '#1a1a1a' : '#999',
      }}>
        {name}
      </div>
    </div>
  );
}

export function LoadMoreButton({ lang, onClick }: { lang: 'en' | 'id'; onClick: () => void }) {
  return (
    <div style={{ textAlign: 'center', padding: '32px 32px 0' }}>
      <button
        onClick={onClick}
        style={{
          fontSize: 15, fontWeight: 500, color: '#1a1a1a',
          border: '1.5px solid #e0e0e0', borderRadius: 50,
          padding: '11px 28px', background: '#fff', cursor: 'pointer', fontFamily: 'inherit',
        }}
      >
        {lang === 'id' ? 'Lihat lebih banyak' : 'Load more'}
      </button>
    </div>
  );
}

export default function RecipeResults({ items, lang, onSelect, hasMore, onLoadMore }: {
  items: RecipeSummary[];
  lang: 'en' | 'id';
  onSelect: (id: string) => void;
  hasMore: boolean;
  onLoadMore: () => void;
}) {
  // Recipes whose photo field is set but the actual file 404s (a stale/
  // wrong filename) -- discovered only client-side, via the img's own
  // onError/ref check, since the server has no way to know a referenced
  // file is missing without fetching it. Falls through to the text list
  // below instead of sitting in the grid as an empty gray box.
  const [brokenPhotoIds, setBrokenPhotoIds] = useState<Set<string>>(new Set());

  const withPhoto = items.filter(r => r.photo && r.photo.trim() !== '' && !brokenPhotoIds.has(r.id));
  const withoutPhoto = items.filter(r => !r.photo || r.photo.trim() === '' || brokenPhotoIds.has(r.id));

  return (
    <>
      {withPhoto.length > 0 && (
        <div className="recipes-grid" style={{
          display: 'grid',
          gap: 24,
          padding: '0 48px',
        }}>
          {withPhoto.map((r) => (
            <RecipeCard
              key={r.id}
              recipe={r}
              lang={lang}
              onClick={() => onSelect(r.id)}
              onPhotoError={() => setBrokenPhotoIds(prev => new Set(prev).add(r.id))}
            />
          ))}
        </div>
      )}

      {/* Recipes without a photo yet — plain text rows, no placeholder box.
          A heading names the section explicitly (not just a divider line)
          so it reads as a continuation of the same recipe list, not
          unrelated content; single column and a capped width match how a
          list wants to be read (top to bottom), not a grid. */}
      {withoutPhoto.length > 0 && (
        <>
          {withPhoto.length > 0 && (
            <hr style={{ margin: '44px 48px 0', border: 'none', borderTop: '1px solid #e8e8e8' }} />
          )}
          <h2 style={{
            fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
            fontSize: 22, fontWeight: 300, color: '#cc0000',
            padding: '28px 48px 4px', margin: 0,
          }}>
            {lang === 'id' ? 'Resep lainnya' : 'More recipes'}
          </h2>
          <div style={{ maxWidth: 640, padding: '0 48px' }}>
            {withoutPhoto.map((r) => (
              <TextRow
                key={r.id}
                recipe={r}
                lang={lang}
                onClick={() => onSelect(r.id)}
              />
            ))}
          </div>
        </>
      )}

      {hasMore && <LoadMoreButton lang={lang} onClick={onLoadMore} />}
    </>
  );
}
