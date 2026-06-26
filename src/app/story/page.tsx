'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLang } from '@/components/LanguageContext';
import { storyMeta, storySections } from '@/lib/story';
import { meta as siteMeta } from '@/lib/recipes';
import type { StorySection, StoryClipping } from '@/types/story';

function bodyParagraphs(text: string): string[] {
  return text.split(/\n\n+/).map(p => p.trim()).filter(Boolean);
}

function SectionImage({
  src,
  caption,
}: {
  src: string;
  caption: string;
}) {
  const [err, setErr] = useState(false);
  if (!src || err) return null;

  return (
    <div className="story-img-wrap">
      <img
        src={`/images/${src}`}
        alt={caption || ''}
        className="story-img img-fade"
        loading="lazy"
        onLoad={e => e.currentTarget.classList.add('loaded')}
        onError={() => setErr(true)}
      />
      {caption && <p className="story-caption">{caption}</p>}
    </div>
  );
}

function ClippingCard({ clipping }: { clipping: StoryClipping }) {
  const [err, setErr] = useState(false);
  const showImg = !!clipping.image && !err;

  return (
    <div className="press-card">
      {showImg && (
        <img
          src={`/images/${clipping.image}`}
          alt={`${clipping.publication} ${clipping.year}`}
          className="press-clipping-img img-fade"
          loading="lazy"
          onLoad={e => e.currentTarget.classList.add('loaded')}
          onError={() => setErr(true)}
        />
      )}
      <div>
        <p className="press-pub">{clipping.publication}</p>
        <p className="press-meta">
          {clipping.year}
          {clipping.author ? ` · ${clipping.author}` : ''}
          {clipping.column ? ` · ${clipping.column}` : ''}
        </p>
        {clipping.quote_en && (
          <p className="press-quote">&ldquo;{clipping.quote_en}&rdquo;</p>
        )}
      </div>
    </div>
  );
}

function Section({ section, lang }: { section: StorySection; lang: 'id' | 'en' }) {
  const heading = lang === 'en' ? section.heading_en : section.heading_id;
  const body    = lang === 'en' ? section.body_en    : section.body_id;
  const caption = lang === 'en'
    ? (section.image_caption_en || '')
    : (section.image_caption_id || '');

  const hasImage = !!(section.image && section.image.trim());
  const paras    = bodyParagraphs(body);

  return (
    <div className="story-section">
      <div className="story-section-rule" aria-hidden="true" />

      {hasImage ? (
        <div className="story-with-image">
          <SectionImage src={section.image!} caption={caption} />
          <div>
            <h2 className="story-heading">{heading}</h2>
            <div className="story-body">
              {paras.map((p, i) => <p key={i}>{p}</p>)}
            </div>
          </div>
        </div>
      ) : (
        <>
          <h2 className="story-heading">{heading}</h2>
          <div className="story-body">
            {paras.map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </>
      )}

      {section.press_clippings && section.press_clippings.length > 0 && (
        <div className="press-grid">
          {section.press_clippings.map((c, i) => (
            <ClippingCard key={i} clipping={c} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function StoryPage() {
  const { lang, toggle } = useLang();

  const setId = () => { if (lang !== 'id') toggle(); };
  const setEn = () => { if (lang !== 'en') toggle(); };

  const pageTitle    = lang === 'en' ? storyMeta.page_title_en    : storyMeta.page_title_id;
  const pageSubtitle = lang === 'en' ? storyMeta.page_subtitle_en : storyMeta.page_subtitle_id;

  return (
    <>
      <nav className="recipe-topbar">
        <Link href="/" className="recipe-back">
          ← {lang === 'id' ? 'Kembali' : 'Back'}
        </Link>
        <div className="recipe-lang" role="group" aria-label="Language">
          <button className={`recipe-lang-btn${lang === 'id' ? ' active' : ''}`} onClick={setId}>
            ID
          </button>
          <span className="recipe-lang-sep" aria-hidden="true">|</span>
          <button className={`recipe-lang-btn${lang === 'en' ? ' active' : ''}`} onClick={setEn}>
            EN
          </button>
        </div>
      </nav>

      <div className="story-container">
        <h1 className="story-page-title">{pageTitle}</h1>
        {pageSubtitle && <p className="story-page-subtitle">{pageSubtitle}</p>}

        {storySections.map(section => (
          <Section key={section.id} section={section} lang={lang} />
        ))}
      </div>

      <footer className="site-footer">
        <p className="footer-name">Ramayani</p>
        <p className="footer-est">est. 1983 &middot; {siteMeta.location}</p>
      </footer>
    </>
  );
}
