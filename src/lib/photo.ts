/**
 * recipe.photo is either a bare filename served from /public/images (the
 * original convention) or a full URL from Vercel Blob (written by the
 * admin tool's photo upload). Absolute URLs are used as-is; anything else
 * is resolved against /images/.
 *
 * Deliberately its own file, not part of lib/recipes.ts: that module
 * imports the full recipes.json at module scope, so anything importing
 * from it -- even just this one pure function -- would pull the entire
 * dataset into a client component's bundle. This file has no such import,
 * so client components can use it freely.
 */
export function recipePhotoSrc(photo: string): string {
  return /^https?:\/\//.test(photo) ? photo : `/images/${photo}`;
}
