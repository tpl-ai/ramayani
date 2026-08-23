'use client'
import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

const RECIPES = [
  { id: 'resep-2',    name: 'Ramayani Chicken Curry',       photo: 'ayam-kare.jpg',             ready: true  },
  { id: 'resep-18',   name: 'Grilled Fish, Sweet Soy',      photo: 'ikan-bakar.jpg',             ready: true  },
  { id: 'resep-29',   name: 'Ramayani Special Chicken Noodles', photo: 'bakmi-ayam-jakarta.jpg', ready: true  },
  { id: 'resep-34',   name: 'Belacan Water Spinach',        photo: 'tumis-kangkung.jpg',         ready: true  },
  { id: 'resep-35',   name: 'Gado-Gado',                    photo: 'gado-gado.jpg',              ready: true  },
  { id: 'resep-41',   name: 'Coconut Vegetable Soup',       photo: 'sayur-lodeh.jpg',            ready: true  },
  { id: 'resep-40',   name: 'Lamb Curry',                   photo: 'gule-kambing.jpg',           ready: false },
  { id: 'resep-50',   name: 'Butter Squid',                 photo: 'cumi-cumi-goreng.jpg',       ready: false },
  { id: 'resep-10',   name: 'Chicken in Ramayani Sauce',    photo: 'ayam-sauce-ramayani.jpg',    ready: false },
  { id: 'cs-rendang', name: 'Beef Rendang',                 photo: 'rendang.jpg',                ready: false },
]

const CATEGORIES = [
  { id: 'ayam',          label: 'Chicken'       },
  { id: 'daging',        label: 'Beef & Pork'   },
  { id: 'seafood',       label: 'Seafood'        },
  { id: 'nasi_mie',      label: 'Rice & Noodles' },
  { id: 'sayuran_salad', label: 'Vegetables'     },
  { id: 'sambal_saus',   label: 'Sambal'         },
]

function ChickenIcon() {
  return <img src="/images/icon-chicken.svg" alt="" width={125} height={125} className="category-icon" />
}

function BeefIcon() {
  return <img src="/images/icon-beef.svg" alt="" width={125} height={125} className="category-icon" />
}

function SeafoodIcon() {
  return <img src="/images/icon-fish.svg" alt="" width={125} height={125} className="category-icon" />
}

function RiceIcon() {
  return <img src="/images/icon-noodles.svg" alt="" width={125} height={125} className="category-icon" />
}

function VegetableIcon() {
  return <img src="/images/icon-vegetables.svg" alt="" width={125} height={125} className="category-icon" />
}

function SambalIcon() {
  return <img src="/images/icon-sambal.svg" alt="" width={125} height={125} className="category-icon" />
}

const ICONS: Record<string, () => React.ReactElement> = {
  ayam: ChickenIcon,
  daging: BeefIcon,
  seafood: SeafoodIcon,
  nasi_mie: RiceIcon,
  sayuran_salad: VegetableIcon,
  sambal_saus: SambalIcon,
}

export default function Home() {
  const router = useRouter()
  const [lang, setLang] = useState<'EN' | 'ID'>('EN')
  const recipesScrollRef = useRef<HTMLDivElement>(null)
  const categoriesScrollRef = useRef<HTMLDivElement>(null)

  return (
    <div style={{ fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif', background: '#fff', color: '#1a1a1a' }}>

      {/* NAV */}
      <Header lang={lang} setLang={setLang} />

      {/* SPLASH */}
      <div className="splash-hero" style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
        <img
          src="/images/rijsttafel.jpg"
          alt="Ramayani rijsttafel"
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center center' }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to right, rgba(0,0,0,0.70) 0%, rgba(0,0,0,0.40) 50%, rgba(0,0,0,0.05) 100%)',
        }} />
        {/* Title — top-left */}
        <div className="splash-text-block" style={{ position: 'absolute', top: 0, left: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', padding: '48px 0 0 56px' }}>
          <h1 className="splash-title" style={{ fontWeight: 400, color: '#fff', lineHeight: 1, marginBottom: 14 }}>
            Hertha's<br />Indonesian Cookbook
          </h1>
          <p className="splash-subtitle" style={{ fontWeight: 500, color: 'rgba(255,255,255,0.88)', lineHeight: 1.5 }}>
            Beloved recipes from Ramayani Westwood
          </p>
        </div>
        {/* Buy the book — bottom-right */}
        <a href="#" style={{
          position: 'absolute', bottom: 0, right: 182,
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: 18, fontWeight: 500, color: '#fff',
          background: '#cc0000', padding: '20px 15px',
          textDecoration: 'none', letterSpacing: '0.04em',
        }}>
          Buy the book
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 17L17 7M17 7H9M17 7V15" />
          </svg>
        </a>
      </div>

      {/* FAVORITE RECIPES */}
      <section id="recipes" style={{ paddingTop: 48, position: 'relative' }}>
        <h2 className="section-heading" style={{ fontWeight: 300, color: '#cc0000', padding: '0 48px', marginBottom: 20 }}>
          {lang === 'EN' ? 'Favorite recipes' : 'Resep favorit'}
        </h2>
        <div ref={recipesScrollRef} style={{
          display: 'flex', gap: 35, overflowX: 'auto',
          paddingLeft: 48, paddingRight: 48, paddingBottom: 28,
          scrollbarWidth: 'none', msOverflowStyle: 'none',
        }}>
          {RECIPES.map(r => (
            <div key={r.id} onClick={() => r.ready && router.push(`/resep/${r.id}`)}
              style={{ flexShrink: 0, width: 320, cursor: r.ready ? 'pointer' : 'default', opacity: r.ready ? 1 : 0.5 }}>
              <div style={{ width: 320, height: 500, overflow: 'hidden', position: 'relative', background: '#e8e2da', marginBottom: 8 }}>
                <img src={`/images/${r.photo}`} alt={r.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                {!r.ready && (
                  <div style={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
                    background: '#cc0000', color: '#fff', fontSize: 10, fontWeight: 600,
                    padding: '4px 12px', letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap',
                  }}>Coming soon</div>
                )}
              </div>
              <div style={{ fontSize: 20, fontWeight: 500, color: r.ready ? '#1a1a1a' : '#999', lineHeight: 1.3 }}>{r.name}</div>
            </div>
          ))}
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

      {/* RECIPES BY CATEGORY */}
      <section style={{ padding: '48px 0 72px', position: 'relative' }}>
        <h2 className="section-heading" style={{ fontWeight: 300, color: '#cc0000', padding: '0 48px', marginBottom: 20 }}>
          {lang === 'EN' ? 'Recipes by category' : 'Resep menurut jenis'}
        </h2>
        <div ref={categoriesScrollRef} style={{
          display: 'flex', gap: 30, overflowX: 'auto',
          paddingLeft: 48, paddingRight: 48, paddingBottom: 24,
          scrollbarWidth: 'none', msOverflowStyle: 'none',
        }}>
          {CATEGORIES.map(cat => {
            const Icon = ICONS[cat.id]
            return (
              <div key={cat.id} className="category-tile" onClick={() => router.push(`/recipes?category=${cat.id}`)}
                style={{
                  flexShrink: 0, background: '#cc0000',
                  cursor: 'pointer', display: 'flex', flexDirection: 'column',
                  justifyContent: 'space-between', padding: '14px 14px 18px',
                }}>
                <span className="category-label" style={{ fontWeight: 400, color: '#fff', lineHeight: 1.2 }}>{cat.label}</span>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', paddingBottom: '40px'  }}>
                  {Icon && <Icon />}
                </div>
              </div>
            )
          })}
        </div>
        <div
          className="scroll-arrow"
          onMouseEnter={e => { e.currentTarget.style.opacity = '1' }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '0' }}
          onClick={() => categoriesScrollRef.current?.scrollBy({ left: 400, behavior: 'smooth' })}
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
          onClick={() => categoriesScrollRef.current?.scrollBy({ left: -400, behavior: 'smooth' })}
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

    </div>
  )
}
