'use client';

import { useState } from 'react';
import { useLang } from '@/components/LanguageContext';
import { storySections } from '@/lib/story';
import type { PressItem } from '@/types/story';
import Header from '@/components/Header';

const HELVETICA = 'Helvetica Neue, Helvetica, Arial, sans-serif';

function PortraitImg() {
  const [err, setErr] = useState(false);
  if (err) {
    return <div style={{ width: '100%', height: 380, background: '#c4a882' }} />;
  }
  return (
    <img
      src="/images/hertha-kitchen.jpg"
      alt="Hertha Tan"
      onError={() => setErr(true)}
      style={{
        width: '100%', maxHeight: 480, objectFit: 'cover',
        objectPosition: 'center top', display: 'block',
      }}
    />
  );
}

function SectionImage({ src, alt }: { src: string; alt: string }) {
  const [err, setErr] = useState(false);
  if (err) return null;
  return (
    <img
      src={`/images/${src}`}
      alt={alt}
      onError={() => setErr(true)}
      style={{ width: '100%', marginBottom: 16, display: 'block' }}
    />
  );
}

function PressThumb({ src, alt, flex }: { src: string; alt: string; flex: number }) {
  const [err, setErr] = useState(false);
  if (err) return null;
  return (
    <a href={src} target="_blank" rel="noopener noreferrer" style={{ flex, minWidth: 0, display: 'block' }}>
      <img
        ref={img => { if (img && img.complete && img.naturalWidth === 0) setErr(true); }}
        src={src}
        alt={alt}
        onError={() => setErr(true)}
        style={{ width: '100%', height: 150, display: 'block', objectFit: 'cover', objectPosition: 'top', cursor: 'pointer' }}
      />
    </a>
  );
}

function PressCard({ item, lang }: { item: PressItem; lang: 'id' | 'en' }) {
  const note = lang === 'id' ? (item.note_id ?? item.note_en) : (item.note_en ?? item.note_id);
  const images = item.images ?? [];
  return (
    <div>
      {images.length > 0 && (
        <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
          {images.map((img, i) => (
            <PressThumb
              key={i}
              src={`/images/${encodeURIComponent(img)}`}
              alt={`${item.publication} ${item.year} — page ${i + 1}`}
              flex={1}
            />
          ))}
        </div>
      )}
      <p style={{
        fontSize: 11, fontWeight: 600, color: '#cc0000',
        textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4,
        fontFamily: HELVETICA,
      }}>
        {item.publication} &middot; {item.year}
      </p>
      {note && (
        <p style={{ fontSize: 13, color: '#555555', lineHeight: 1.5, fontFamily: HELVETICA }}>{note}</p>
      )}
    </div>
  );
}

export default function AboutPage() {
  const { lang: ctxLang } = useLang();

  const mainSections = storySections.filter(s => s.type !== 'closing');
  const closingSections = storySections.filter(s => s.type === 'closing');

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh' }}>

      <Header />

      {/* Portrait */}
      <div className="about-hero-wrap" style={{ padding: '24px 32px 0' }}>
        <PortraitImg />
      </div>

      {/* Story sections */}
      <div className="about-content-wrap" style={{ padding: '48px 48px 80px' }}>

        {mainSections.map(section => {
          const title = ctxLang === 'id' ? (section.title_id ?? '') : (section.title_en ?? '');
          const body = ctxLang === 'id' ? (section.body_id ?? '') : (section.body_en ?? '');
          const imgAlt = title;

          return (
            <div key={section.id} style={{ marginBottom: 56 }}>
              {title && (
                <h2 style={{ fontSize: 38, fontWeight: 300, color: '#cc0000', marginBottom: 16, fontFamily: HELVETICA }}>
                  {title}
                </h2>
              )}

              {section.image && (
                <SectionImage src={section.image} alt={imgAlt} />
              )}

              {section.type === 'press' ? (
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                  gap: 32, alignItems: 'start',
                }}>
                  {(section.items ?? []).map((item, i) => (
                    <PressCard key={i} item={item} lang={ctxLang} />
                  ))}
                </div>
              ) : (
                body.split('\n\n').filter(p => p.trim() && !p.trim().startsWith('[')).map((para, i) => (
                  <p key={i} style={{ fontSize: 15, lineHeight: 1.75, color: '#1a1a1a', marginBottom: 16, maxWidth: 760, fontFamily: HELVETICA, fontWeight: 400 }}>
                    {para}
                  </p>
                ))
              )}
            </div>
          );
        })}

        {/* Closing — Still Dancing */}
        {closingSections.map(section => {
          const title = ctxLang === 'id' ? (section.title_id ?? '') : (section.title_en ?? '');
          const body = ctxLang === 'id' ? (section.body_id ?? '') : (section.body_en ?? '');
          return (
            <div key={section.id} style={{ borderTop: '1px solid #f0f0f0', paddingTop: 48, marginTop: 8 }}>
              {title && (
                <h2 style={{ fontSize: 38, fontWeight: 300, color: '#cc0000', marginBottom: 16, fontFamily: HELVETICA }}>
                  {title}
                </h2>
              )}
              {body.split('\n\n').filter(p => p.trim()).map((para, i) => (
                <p key={i} style={{ fontSize: 15, lineHeight: 1.75, color: '#1a1a1a', marginBottom: 16, maxWidth: 760, fontFamily: HELVETICA, fontWeight: 400 }}>
                  {para}
                </p>
              ))}
            </div>
          );
        })}

      </div>
    </div>
  );
}
