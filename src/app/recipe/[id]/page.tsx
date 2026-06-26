'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useLang } from '@/components/LanguageContext';
import { getRecipeById, categories, meta } from '@/lib/recipes';
import type { Recipe } from '@/types/recipe';

// ── data helpers ────────────────────────────────────────────────────────────

function tx(r: Recipe, field: 'name' | 'headnote' | 'notes', lang: 'id' | 'en'): string {
  if (lang === 'en') {
    const en = r[`${field}_en` as keyof Recipe] as string;
    return en || (r[`${field}_id` as keyof Recipe] as string) || '';
  }
  return (r[`${field}_id` as keyof Recipe] as string) || '';
}

function ingList(r: Recipe, lang: 'id' | 'en'): string[] {
  if (lang === 'en') return r.ingredients_en.length ? r.ingredients_en : r.ingredients_id;
  return r.ingredients_id.length ? r.ingredients_id : r.ingredients_en;
}

function methodList(r: Recipe, lang: 'id' | 'en'): string[] {
  if (lang === 'en') return r.method_en.length ? r.method_en : r.method_id;
  return r.method_id.length ? r.method_id : r.method_en;
}

// Scale ingredient quantities then optionally convert metric → imperial.
// Scale step uses negative lookahead/lookbehind to avoid matching partial numbers.
function processIngredient(text: string, factor: number, toImperial: boolean): string {
  let out = text;

  if (factor !== 1) {
    out = out.replace(/(?<!\d)(\d+(?:\.\d+)?)(?!\d)/g, (match) => {
      const n = parseFloat(match);
      if (isNaN(n) || n === 0) return match;
      const s = n * factor;
      return s === Math.round(s) ? String(Math.round(s)) : String(Math.round(s * 10) / 10);
    });
  }

  if (toImperial) {
    out = out
      // kg before g to avoid double-match
      .replace(/(\d+(?:\.\d+)?)\s*kg\b/gi, (_, n) => {
        const lbs = Math.round(parseFloat(n) * 2.20462 * 10) / 10;
        return `${lbs} lbs`;
      })
      .replace(/(\d+(?:\.\d+)?)\s*g\b/gi, (_, n) => {
        const oz = Math.round(parseFloat(n) / 28.35 * 10) / 10;
        return `${oz} oz`;
      })
      .replace(/(\d+(?:\.\d+)?)\s*ml\b/gi, (_, n) => {
        const ml = parseFloat(n);
        if (ml >= 59) return `${Math.round(ml / 236.6 * 4) / 4} cups`;
        if (ml >= 15) return `${Math.round(ml / 14.79 * 2) / 2} tbsp`;
        return `${Math.round(ml / 4.93)} tsp`;
      })
      .replace(/(\d+(?:\.\d+)?)\s*liter/gi, (_, n) => {
        return `${Math.round(parseFloat(n) * 4.227 * 4) / 4} cups`;
      });
  }

  return out;
}

// ── Leave a Note form ────────────────────────────────────────────────────────

function LeaveANote({ recipeName, lang }: { recipeName: string; lang: 'id' | 'en' }) {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    setSubmitting(true);
    try {
      await fetch('https://formspree.io/f/mnjkdvqn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name,
          message,
          recipe: recipeName,
          _subject: `Note for Hertha — ${recipeName}`,
        }),
      });
    } catch {
      // fall through — show thanks regardless
    } finally {
      setSubmitting(false);
      setSubmitted(true);
    }
  };

  return (
    <div className="note-section">
      <h2 className="note-heading">Leave a Note for Hertha</h2>
      <p className="note-subtext">
        Did you make this dish? Share your experience — Hertha would love to hear from you.
      </p>
      {submitted ? (
        <p className="note-thanks">Terima kasih &middot; Thank you for your note.</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="note-field">
            <label className="note-label" htmlFor="note-name">
              {lang === 'id' ? 'Nama Anda' : 'Your name'}
            </label>
            <input
              id="note-name"
              className="note-input"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          <div className="note-field">
            <label className="note-label" htmlFor="note-message">
              {lang === 'id' ? 'Pesan Anda' : 'Your message'}
            </label>
            <textarea
              id="note-message"
              className="note-textarea"
              rows={4}
              value={message}
              onChange={e => setMessage(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="note-submit" disabled={submitting}>
            {submitting
              ? (lang === 'id' ? 'Mengirim…' : 'Sending…')
              : (lang === 'id' ? 'Kirim' : 'Send')}
          </button>
        </form>
      )}
    </div>
  );
}

// ── Recipe page ──────────────────────────────────────────────────────────────

export default function RecipePage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { lang, toggle } = useLang();

  const [photoFailed, setPhotoFailed] = useState(false);
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
  const [serves, setServes] = useState(4);
  const baseServes = useRef(4);

  useEffect(() => {
    const stored = localStorage.getItem('ramayani_units');
    if (stored === 'imperial') setUnitSystem('imperial');
  }, []);

  const setUnit = (u: 'metric' | 'imperial') => {
    setUnitSystem(u);
    localStorage.setItem('ramayani_units', u);
  };
  const setId = () => { if (lang !== 'id') toggle(); };
  const setEn = () => { if (lang !== 'en') toggle(); };

  const recipe = getRecipeById(id);

  if (!recipe) {
    return (
      <div className="empty-state">
        <p className="empty-title">Recipe not found</p>
        <p className="empty-text">
          {lang === 'id' ? 'Resep tidak ditemukan.' : 'This recipe could not be found.'}
        </p>
        <Link href="/" style={{ color: 'var(--red)', fontFamily: 'var(--sans)', fontSize: 15, marginTop: 16, display: 'inline-block' }}>
          ← {lang === 'id' ? 'Kembali' : 'Back home'}
        </Link>
      </div>
    );
  }

  const name      = tx(recipe, 'name', lang);
  const headnote  = tx(recipe, 'headnote', lang);
  const notes     = tx(recipe, 'notes', lang);
  const showPhoto = !!recipe.photo && !photoFailed;
  const ings      = ingList(recipe, lang);
  const steps     = methodList(recipe, lang);
  const factor    = serves / baseServes.current;
  const toImperial = unitSystem === 'imperial';
  const isComingSoon = recipe.status === 'coming_soon';
  const hasIngs   = ings.length > 0;

  const processedIngs = ings.map(i => processIngredient(i, factor, toImperial));

  return (
    <>
      <nav className="recipe-topbar">
        <Link href={`/#${recipe.category}`} className="recipe-back">
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

      <div className="recipe-container">
        {/* Zone 1: photo + title + headnote */}
        <div className="recipe-zone1">
          {showPhoto && (
            <img
              src={`/images/${recipe.photo}`}
              alt={name}
              className="recipe-photo img-fade"
              loading="eager"
              onLoad={e => e.currentTarget.classList.add('loaded')}
              onError={() => setPhotoFailed(true)}
            />
          )}
          <h1 className="recipe-title">{name}</h1>
          {headnote && <p className="recipe-headnote">{headnote}</p>}
        </div>
        <div className="recipe-zone1-rule" />

        {/* Controls: unit + serves (hide for coming soon) */}
        {!isComingSoon && (
          <div className="recipe-controls">
            <div className="unit-toggle" role="group" aria-label="Unit system">
              <button className={`unit-btn${unitSystem === 'metric' ? ' active' : ''}`} onClick={() => setUnit('metric')}>
                Metric
              </button>
              <span className="unit-sep" aria-hidden="true">|</span>
              <button className={`unit-btn${unitSystem === 'imperial' ? ' active' : ''}`} onClick={() => setUnit('imperial')}>
                Imperial
              </button>
            </div>
            <div className="serves-control">
              <span>{lang === 'id' ? 'Porsi:' : 'Serves:'}</span>
              <button
                className="serves-btn"
                onClick={() => setServes(s => Math.max(1, s - 1))}
                disabled={serves <= 1}
                aria-label="Fewer servings"
              >
                −
              </button>
              <span className="serves-num">{serves}</span>
              <button
                className="serves-btn"
                onClick={() => setServes(s => s + 1)}
                aria-label="More servings"
              >
                +
              </button>
            </div>
          </div>
        )}

        {/* Zone 2: ingredients + method */}
        <div className="recipe-zone2">
          {/* Left: ingredients */}
          <div>
            <p className="col-head">
              {lang === 'id' ? 'Bahan-Bahan' : 'Ingredients'}
            </p>
            {isComingSoon ? (
              <p className="ing-empty">
                {lang === 'id' ? 'Resep lengkap segera hadir.' : 'The full recipe is coming soon.'}
              </p>
            ) : hasIngs ? (
              <ul className="ing-list">
                {processedIngs.map((item, i) => (
                  <li key={i} className="ing-item">{item}</li>
                ))}
              </ul>
            ) : (
              <p className="ing-empty">
                {lang === 'id' ? 'Bahan segera ditambahkan.' : 'Ingredients coming soon.'}
              </p>
            )}
          </div>

          {/* Right: method */}
          <div>
            <p className="col-head">
              {lang === 'id' ? 'Cara Membuat' : 'Method'}
            </p>
            {isComingSoon ? (
              <p className="method-empty">
                {lang === 'id' ? 'Cara memasak segera hadir.' : 'Method coming soon.'}
              </p>
            ) : steps.length > 0 ? (
              steps.map((step, i) => (
                <div key={i} className="method-step">
                  <div className="step-num">{i + 1}</div>
                  <div className="step-text">{step}</div>
                </div>
              ))
            ) : (
              <p className="method-empty">
                {lang === 'id' ? 'Cara memasak segera ditambahkan.' : 'Method coming soon.'}
              </p>
            )}
          </div>
        </div>

        {/* Notes */}
        {notes && (
          <div className="recipe-notes" style={{ maxWidth: 560, margin: '40px auto 0' }}>
            <p className="recipe-notes-text">{notes}</p>
          </div>
        )}

        {/* Leave a Note for Hertha */}
        <LeaveANote recipeName={name} lang={lang} />
      </div>

      <footer className="site-footer">
        <p className="footer-name">Ramayani</p>
        <p className="footer-est">est. 1983 &middot; {meta.location}</p>
      </footer>
    </>
  );
}
