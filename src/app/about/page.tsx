'use client';

import { useState } from 'react';
import { useLang } from '@/components/LanguageContext';
import { storySections } from '@/lib/story';
import type { PressItem } from '@/types/story';

function PortraitImg() {
  const [err, setErr] = useState(false);
  if (err) {
    return <div style={{ width: '100%', height: 380, background: '#c4a882', borderRadius: 16 }} />;
  }
  return (
    <img
      src="/images/hertha-kitchen.jpg"
      alt="Hertha Tan"
      onError={() => setErr(true)}
      style={{
        width: '100%', maxHeight: 480, objectFit: 'cover',
        objectPosition: 'center top', borderRadius: 16, display: 'block',
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
      style={{ width: '100%', borderRadius: 12, marginBottom: 16, display: 'block' }}
    />
  );
}

function PressRow({ item, lang }: { item: PressItem; lang: 'id' | 'en' }) {
  const [err, setErr] = useState(false);
  const note = lang === 'id' ? (item.note_id ?? item.note_en) : (item.note_en ?? item.note_id);
  return (
    <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
      {item.image && !err && (
        <img
          src={`/images/${item.image}`}
          alt={item.publication}
          onError={() => setErr(true)}
          style={{ width: 100, flexShrink: 0, borderRadius: 8, objectFit: 'cover', alignSelf: 'flex-start' }}
        />
      )}
      <div>
        <p style={{
          fontSize: 11, fontWeight: 600, color: '#1a6a5a',
          textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6,
          fontFamily: 'var(--font-bc)',
        }}>
          {item.publication} &middot; {item.year}
        </p>
        {note && (
          <p style={{ fontSize: 14, color: '#555555', lineHeight: 1.6 }}>{note}</p>
        )}
      </div>
    </div>
  );
}

export default function AboutPage() {
  const { lang } = useLang();

  const mainSections = storySections.filter(s => s.type !== 'closing');
  const closingSections = storySections.filter(s => s.type === 'closing');

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh' }}>

      {/* Back */}
      <div style={{ padding: '24px 32px 0' }}>
        <a href="/" style={{ fontSize: 13, color: '#888888', fontWeight: 400 }}>
          ← {lang === 'id' ? 'Kembali' : 'Back'}
        </a>
      </div>

      {/* Portrait */}
      <div style={{ padding: '24px 32px 0' }}>
        <PortraitImg />
      </div>

      {/* Story sections */}
      <div style={{ maxWidth: 620, margin: '0 auto', padding: '48px 32px 80px' }}>

        {mainSections.map(section => {
          const title = lang === 'id' ? (section.title_id ?? '') : (section.title_en ?? '');
          const body = lang === 'id' ? (section.body_id ?? '') : (section.body_en ?? '');
          const imgAlt = title;

          return (
            <div key={section.id} style={{ marginBottom: 56 }}>
              {title && (
                <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1a6a5a', marginBottom: 16, fontFamily: 'var(--font-bc)', textTransform: 'uppercase' as const, letterSpacing: '0.03em' }}>
                  {title}
                </h2>
              )}

              {section.image && (
                <SectionImage src={section.image} alt={imgAlt} />
              )}

              {section.type === 'press' ? (
                <div>
                  {(section.items ?? []).map((item, i) => (
                    <PressRow key={i} item={item} lang={lang} />
                  ))}
                </div>
              ) : (
                body.split('\n\n').filter(p => p.trim() && !p.trim().startsWith('[')).map((para, i) => (
                  <p key={i} style={{ fontSize: 15, lineHeight: 1.75, color: '#333333', marginBottom: 16, fontFamily: 'var(--font-b)', fontWeight: 400 }}>
                    {para}
                  </p>
                ))
              )}
            </div>
          );
        })}

        {/* Closing — Still Dancing */}
        {closingSections.map(section => {
          const title = lang === 'id' ? (section.title_id ?? '') : (section.title_en ?? '');
          const body = lang === 'id' ? (section.body_id ?? '') : (section.body_en ?? '');
          return (
            <div key={section.id} style={{ borderTop: '1px solid #f0f0f0', paddingTop: 48, marginTop: 8 }}>
              {title && (
                <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1a6a5a', marginBottom: 16, fontFamily: 'var(--font-bc)', textTransform: 'uppercase' as const, letterSpacing: '0.03em' }}>
                  {title}
                </h2>
              )}
              {body.split('\n\n').filter(p => p.trim()).map((para, i) => (
                <p key={i} style={{ fontSize: 15, lineHeight: 1.75, color: '#333333', marginBottom: 16, fontFamily: 'var(--font-b)', fontWeight: 400 }}>
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
