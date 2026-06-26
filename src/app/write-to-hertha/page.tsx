'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLang } from '@/components/LanguageContext';

export default function WriteToHerthaPage() {
  const { lang } = useLang();
  const [name, setName] = useState('');
  const [from, setFrom] = useState('');
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
          from,
          message,
          _subject: `Write to Hertha — from ${name}${from ? ', ' + from : ''}`,
        }),
      });
    } catch {
      // show thanks regardless
    } finally {
      setSubmitting(false);
      setSubmitted(true);
    }
  };

  return (
    <>
      <div className="wth-topbar">
        <Link href="/" className="wth-back">← {lang === 'id' ? 'Kembali' : 'Back'}</Link>
      </div>

      <div className="wth-container">
        <h1 className="wth-title">Write to Hertha</h1>
        <p className="wth-note">
          My mother spent 36 years cooking these dishes for strangers who became regulars
          who became friends. If one of her recipes made it onto your table, she would love
          to know.
        </p>

        {submitted ? (
          <p className="wth-thanks">
            Terima kasih &middot; Thank you. Hertha will be glad to hear from you.
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="wth-field">
              <label className="wth-label" htmlFor="wth-name">
                {lang === 'id' ? 'Nama Anda' : 'Your name'}
              </label>
              <input
                id="wth-name"
                className="wth-input"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>

            <div className="wth-field">
              <label className="wth-label" htmlFor="wth-from">
                {lang === 'id' ? 'Asal Anda' : 'Where you are from'}
              </label>
              <input
                id="wth-from"
                className="wth-input"
                type="text"
                value={from}
                onChange={e => setFrom(e.target.value)}
              />
            </div>

            <div className="wth-field">
              <label className="wth-label" htmlFor="wth-message">
                {lang === 'id' ? 'Pesan Anda' : 'Your message'}
              </label>
              <textarea
                id="wth-message"
                className="wth-textarea"
                rows={5}
                value={message}
                onChange={e => setMessage(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="wth-submit" disabled={submitting}>
              {submitting
                ? (lang === 'id' ? 'Mengirim…' : 'Sending…')
                : (lang === 'id' ? 'Kirim kepada Hertha' : 'Send to Hertha')}
            </button>
          </form>
        )}
      </div>

      <footer className="site-footer">
        <p className="footer-copy">&copy; Hertha Tan &middot; Ramayani &middot; Los Angeles</p>
      </footer>
    </>
  );
}
