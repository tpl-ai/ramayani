'use client'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { useLang } from '@/components/LanguageContext'
import { recipePhotoSrc } from '@/lib/photo'
import type { RecipeSummary, FilterCat } from '@/types/recipe'

const HELVETICA = 'Helvetica Neue, Helvetica, Arial, sans-serif'
const SERIF = 'var(--font-logo), Libre Baskerville, Georgia, serif'
const CREAM = '#f7f5f2'

// One shared type scale for every homepage text element below (not just
// section headings) -- point of a scale is that nothing on the page picks
// its own one-off size. Only intentional exception: TAGLINE_SIZE, a notch
// below HEADING_SIZE so the (longer, English) tagline still fits on one
// line -- see the comment on .hero-tagline in globals.css.
const EYEBROW_SIZE = 12   // small uppercase labels: MOST ASKED FOR, ALSO AVAILABLE
const BODY_SIZE = 15      // paragraphs, search input, tags, newsletter inputs, byline
const BUTTON_SIZE = 13    // every button/CTA
const CAPTION_SIZE = 15   // photo captions: type-tile labels and Favourites titles alike
const HEADING_SIZE = 30   // Favourites / Welcome / Cookbook headings (.home-heading)

type TypeTile = { id: string; label_en: string; label_id: string; photo: string }

export default function HomeView({ favoriteRecipes, typeTiles, categories }: {
  favoriteRecipes: RecipeSummary[]
  typeTiles: TypeTile[]
  categories: FilterCat[]
}) {
  const router = useRouter()
  const { lang } = useLang()
  const recipesScrollRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState('')

  const runSearch = () => {
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <div style={{ fontFamily: HELVETICA, background: '#fff', color: '#1a1a1a' }}>

      {/* NAV */}
      <Header categories={categories} groupItems={typeTiles.map(({ id, label_en, label_id }) => ({ id, label_en, label_id }))} />

      {/* HERO — tagline + browse-by-type tiles */}
      <section className="home-section-pad" style={{ background: CREAM, paddingTop: 40, paddingBottom: 32 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <p className="hero-tagline" style={{
            fontFamily: SERIF, fontWeight: 400, textAlign: 'center',
            color: '#1a1a1a', margin: '0 0 32px',
          }}>
            {lang === 'id'
              ? 'Resep Indonesia dari restoran di Los Angeles dan dapur keluarga kami'
              : 'Indonesian recipes from the Los Angeles restaurant and our family kitchen'}
          </p>
          <div className="hero-type-tiles" style={{
            display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 28,
          }}>
            {typeTiles.map(tile => (
              <div
                key={tile.id}
                className="hero-tile"
                onClick={() => router.push(`/recipes?type=${tile.id}`)}
                style={{ cursor: 'pointer', textAlign: 'center', width: 240 }}
              >
                <div className="hero-tile-photo" style={{
                  width: 240, height: 240, overflow: 'hidden',
                  background: '#e8e2da', marginBottom: 10,
                }}>
                  {tile.photo && (
                    <img src={recipePhotoSrc(tile.photo)} alt={lang === 'id' ? tile.label_id : tile.label_en}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  )}
                </div>
                <span style={{ fontSize: CAPTION_SIZE, fontWeight: 600, color: '#1a1a1a' }}>
                  {lang === 'id' ? tile.label_id : tile.label_en}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEARCH — big search bar + most-asked-for tags, drawn from Favourites */}
      <section className="home-section-pad" style={{ background: CREAM, paddingTop: 8, paddingBottom: 44 }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') runSearch() }}
              placeholder={lang === 'id' ? 'Cari resep — rendang, sambal, gado-gado...' : 'Search recipes — rendang, sambal, gado-gado...'}
              style={{
                flex: 1, border: '1px solid #e0d9cd', borderRadius: 50,
                padding: '14px 22px', fontSize: BODY_SIZE, fontFamily: HELVETICA,
                color: '#1a1a1a', outline: 'none', background: '#fff',
              }}
            />
            <button onClick={runSearch} style={{
              background: '#cc0000', color: '#fff', border: 'none', borderRadius: 50,
              padding: '0 32px', fontSize: BUTTON_SIZE, fontWeight: 700, letterSpacing: '0.08em',
              cursor: 'pointer', fontFamily: HELVETICA,
            }}>
              {lang === 'id' ? 'CARI' : 'SEARCH'}
            </button>
          </div>
          <div style={{
            display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px 18px',
            marginTop: 18,
          }}>
            <span style={{ fontSize: EYEBROW_SIZE, fontWeight: 700, letterSpacing: '0.1em', color: '#aaa' }}>
              {lang === 'id' ? 'PALING DICARI' : 'MOST ASKED FOR'}
            </span>
            {favoriteRecipes.slice(0, 5).map(r => (
              <a key={r.id} onClick={() => router.push(`/resep/${r.id}`)} style={{
                fontSize: BODY_SIZE, color: '#1a1a1a', cursor: 'pointer',
                borderBottom: '1px solid #ccc', paddingBottom: 2,
              }}>
                {r.name_id || r.name_en}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* FAVOURITES */}
      <section id="recipes" style={{ paddingTop: 48, position: 'relative' }}>
        <h2 className="home-heading" style={{ fontFamily: SERIF, fontWeight: 400, color: '#cc0000', padding: '0 48px', marginBottom: 20 }}>
          {lang === 'id' ? 'Favorit' : 'Favourites'}
        </h2>
        <div ref={recipesScrollRef} style={{
          display: 'flex', gap: 35, overflowX: 'auto',
          paddingLeft: 48, paddingRight: 48, paddingBottom: 28,
          scrollbarWidth: 'none', msOverflowStyle: 'none',
        }}>
          {favoriteRecipes.map(r => {
            // Indonesian-first, always -- see RecipeResults.tsx for the
            // same rule applied on /recipes and /search.
            const name = r.name_id || r.name_en
            const ready = r.content_state !== 'no_content'
            return (
              <div key={r.id} className="recipe-card" onClick={() => ready && router.push(`/resep/${r.id}`)}
                style={{ flexShrink: 0, cursor: ready ? 'pointer' : 'default', opacity: ready ? 1 : 0.5 }}>
                <div className="recipe-photo" style={{ overflow: 'hidden', position: 'relative', background: '#e8e2da', marginBottom: 8 }}>
                  <img src={recipePhotoSrc(r.photo)} alt={name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  {!ready && (
                    <div style={{
                      position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
                      background: '#cc0000', color: '#fff', fontSize: 10, fontWeight: 600,
                      padding: '4px 12px', letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap',
                    }}>Coming soon</div>
                  )}
                </div>
                <div style={{ fontSize: CAPTION_SIZE, fontWeight: 600, color: ready ? '#1a1a1a' : '#999', lineHeight: 1.3 }}>{name}</div>
              </div>
            )
          })}
        </div>
        <div
          className="scroll-arrow"
          onMouseEnter={e => { e.currentTarget.style.opacity = '1' }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '0' }}
          onClick={() => recipesScrollRef.current?.scrollBy({ left: 400, behavior: 'smooth' })}
          style={{
            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
            width: 56, height: 56, borderRadius: '50%', background: 'rgba(0,0,0,0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', opacity: 0, transition: 'opacity 0.2s ease', zIndex: 10,
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </div>
        <div
          className="scroll-arrow"
          onMouseEnter={e => { e.currentTarget.style.opacity = '1' }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '0' }}
          onClick={() => recipesScrollRef.current?.scrollBy({ left: -400, behavior: 'smooth' })}
          style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            width: 56, height: 56, borderRadius: '50%', background: 'rgba(0,0,0,0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', opacity: 0, transition: 'opacity 0.2s ease', zIndex: 10,
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 6l-6 6 6 6" />
          </svg>
        </div>
      </section>

      {/* WELCOME — bio teaser, links to /about */}
      <section style={{ background: CREAM, marginTop: 56 }}>
        <div className="welcome-row" style={{
          display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 40,
          maxWidth: 1100, margin: '0 auto', padding: '48px',
        }}>
          <img
            src="/images/hertha-kitchen.jpg"
            alt="Hertha Tan in the Ramayani kitchen"
            style={{ width: 320, height: 320, objectFit: 'cover', borderRadius: 10, flexShrink: 0 }}
          />
          <div style={{ flex: 1, minWidth: 260 }}>
            <h2 className="home-heading" style={{ fontFamily: SERIF, fontWeight: 400, color: '#1a1a1a', margin: '0 0 16px' }}>
              {lang === 'id' ? 'Selamat Datang!' : 'Selamat Datang! Welcome!'}
            </h2>
            <p style={{ fontSize: BODY_SIZE, lineHeight: 1.75, color: '#444', marginBottom: 20 }}>
              {lang === 'id'
                ? 'Nama saya Hertha, dan saya menjalankan Ramayani selama ~35 tahun (hingga 2019) karena saya suka memasak dan menikmati masakan Indonesia. Banyak pelanggan lama Ramayani meminta resep kami, jadi kami berharap koleksi ini membawa kebahagiaan bagi meja makan Anda seperti yang telah dibawa bagi kami.'
                : "My name is Hertha, and I ran Ramayani for ~35 years (until 2019) because I love cooking and eating Indonesian food. Many of Ramayani's former customers have asked us for our recipes, and so we hope that this collection brings as much joy to your dinner table as it has to ours."}
            </p>
            <p style={{ fontSize: BODY_SIZE, lineHeight: 1.75, color: '#444', marginBottom: 28 }}>
              {lang === 'id' ? 'Selamat Makan! Semoga makanan Anda enak!' : 'Selamat Makan! Have a Great Meal!'}<br />
              Hertha Tan
            </p>
            <button onClick={() => router.push('/about')} style={{
              background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 4,
              padding: '11px 22px', fontSize: BUTTON_SIZE, fontWeight: 600, letterSpacing: '0.04em',
              cursor: 'pointer', fontFamily: HELVETICA,
            }}>
              {lang === 'id' ? 'Lanjut >' : 'More >'}
            </button>
          </div>
        </div>
      </section>

      {/* NEWSLETTER — placeholder, no backend wired up yet */}
      <section style={{ background: '#1a1a1a', padding: '22px 48px' }}>
        <form
          onSubmit={e => e.preventDefault()}
          style={{
            display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 14,
            maxWidth: 1100, margin: '0 auto',
          }}
        >
          <span style={{ color: '#fff', fontSize: BODY_SIZE, fontWeight: 500, marginRight: 'auto' }}>
            {lang === 'id' ? 'Berlangganan untuk resep lewat email:' : 'Subscribe to get recipes via email:'}
          </span>
          <input placeholder={lang === 'id' ? 'Nama depan' : 'First name'} style={{
            border: 'none', borderRadius: 4, padding: '10px 14px', fontSize: BODY_SIZE,
            fontFamily: HELVETICA, minWidth: 140,
          }} />
          <input type="email" placeholder="Email" style={{
            border: 'none', borderRadius: 4, padding: '10px 14px', fontSize: BODY_SIZE,
            fontFamily: HELVETICA, minWidth: 180,
          }} />
          <button type="submit" style={{
            background: '#cc0000', color: '#fff', border: 'none', borderRadius: 4,
            padding: '11px 20px', fontSize: BUTTON_SIZE, fontWeight: 700, letterSpacing: '0.04em',
            cursor: 'pointer', fontFamily: HELVETICA, whiteSpace: 'nowrap',
          }}>
            {lang === 'id' ? 'YA, SAYA MAU!' : 'YES, I WANT THIS!'}
          </button>
        </form>
      </section>

      {/* COOKBOOK PROMO — placeholder purchase links */}
      <section style={{ background: CREAM, padding: '56px 48px 72px' }}>
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 48,
          maxWidth: 1100, margin: '0 auto', alignItems: 'center',
        }}>
          <img
            src="/images/rijsttafel.jpg"
            alt="The Ramayani Cookbook"
            style={{ width: 260, height: 347, objectFit: 'cover', borderRadius: 6, boxShadow: '0 12px 32px rgba(0,0,0,0.18)', flexShrink: 0 }}
          />
          <div style={{ flex: 1, minWidth: 260 }}>
            <span style={{ fontSize: EYEBROW_SIZE, fontWeight: 700, letterSpacing: '0.12em', color: '#aaa' }}>
              {lang === 'id' ? 'JUGA TERSEDIA' : 'ALSO AVAILABLE'}
            </span>
            <h2 className="home-heading" style={{ fontFamily: SERIF, fontWeight: 700, color: '#1a1a1a', margin: '8px 0 4px' }}>
              {lang === 'id' ? 'Buku Masak Ramayani' : 'The Ramayani Cookbook'}
            </h2>
            <p style={{ fontSize: BODY_SIZE, color: '#888', marginBottom: 18 }}>by Hertha Tan</p>
            <p style={{ fontSize: BODY_SIZE, lineHeight: 1.75, color: '#444', marginBottom: 28, maxWidth: 480 }}>
              {lang === 'id'
                ? "Hidangan restoran, diedit dan difoto, dalam satu jilid. Edisi cetak memuat masakan yang membuat Ramayani terkenal; edisi digital memuat seluruh koleksi, termasuk resep keluarga."
                : "The restaurant's dishes, edited and photographed, in one volume. The paperback carries the food Ramayani was known for; the digital edition carries the whole collection, family recipes included."}
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a href="#" style={{
                background: '#1a1a1a', color: '#fff', textDecoration: 'none', borderRadius: 4,
                padding: '13px 24px', fontSize: BUTTON_SIZE, fontWeight: 700, letterSpacing: '0.06em',
                fontFamily: HELVETICA,
              }}>
                {lang === 'id' ? 'EDISI DIGITAL' : 'DIGITAL EDITION'}
              </a>
              <a href="#" style={{
                background: '#fff', color: '#1a1a1a', textDecoration: 'none', borderRadius: 4,
                border: '1px solid #1a1a1a', padding: '13px 24px', fontSize: BUTTON_SIZE, fontWeight: 700,
                letterSpacing: '0.06em', fontFamily: HELVETICA,
              }}>
                {lang === 'id' ? 'CETAK' : 'PAPERBACK'}
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
