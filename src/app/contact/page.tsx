'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './page.module.css';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_DIGITS_REQUIRED = 10;
const PACKAGE_OPTIONS = ['Strategy', 'Design', 'Engineering', 'Retainer'];
const DEFAULT_CAL_LINK = 'pablo-rojas-dev/15min';
const ASCII_CHARS = ' .,:;i1tfLCG08@#';
const ASCII_FONT_SIZE = 10;
const ASCII_CHAR_ASPECT = 0.55;

function formatPhoneDigits(value: string) {
  const cleaned = value.replace(/\D/g, '').slice(0, PHONE_DIGITS_REQUIRED);
  const area = cleaned.slice(0, 3);
  const prefix = cleaned.slice(3, 6);
  const line = cleaned.slice(6, 10);

  if (!cleaned) return '';
  if (cleaned.length <= 3) return `(${area}`;
  if (cleaned.length <= 6) return `(${area}) ${prefix}`;
  return `(${area}) ${prefix}-${line}`;
}

function FishAsciiOverlay() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const sampler = document.createElement('canvas');
    const samplerContext = sampler.getContext('2d');
    if (!samplerContext) return;

    const width = canvas.width;
    const height = canvas.height;
    const cols = Math.floor(width / (ASCII_FONT_SIZE * ASCII_CHAR_ASPECT));
    const rows = Math.floor(height / ASCII_FONT_SIZE);
    const cellWidth = width / cols;
    const cellHeight = height / rows;

    sampler.width = cols;
    sampler.height = rows;

    let animationFrameId = 0;
    let mounted = true;

    const SLOWDOWN_WINDOW_S = 2.5; // seconds before end to start decelerating
    const MIN_RATE = 0.5;

    const renderFrame = () => {
      if (!mounted) return;

      // Stop the loop once the video has ended — last frame stays painted on canvas
      if (video.ended) return;

      // Gradually reduce playback rate as we approach the end
      if (video.duration > 0) {
        const timeLeft = video.duration - video.currentTime;
        if (timeLeft < SLOWDOWN_WINDOW_S) {
          const progress = 1 - timeLeft / SLOWDOWN_WINDOW_S; // 0 → 1
          const eased = progress * progress; // quadratic ease-in
          try {
            video.playbackRate = Math.max(MIN_RATE, 1 - eased * (1 - MIN_RATE));
          } catch {
            // Browser rejected the rate — leave it as-is
          }
        }
      }

      ctx.clearRect(0, 0, width, height);

      if (video.readyState >= 2) {
        samplerContext.clearRect(0, 0, cols, rows);

        const sourceWidth = video.videoWidth || cols;
        const sourceHeight = video.videoHeight || rows;
        const sourceAspect = sourceWidth / sourceHeight;
        const targetAspect = cols / rows;

        let drawWidth = cols;
        let drawHeight = rows;
        let drawX = 0;
        let drawY = 0;

        if (sourceAspect > targetAspect) {
          drawWidth = rows * sourceAspect;
          drawX = (cols - drawWidth) / 2;
        } else {
          drawHeight = cols / sourceAspect;
          drawY = (rows - drawHeight) / 2;
        }

        samplerContext.drawImage(video, drawX, drawY, drawWidth, drawHeight);
        const { data } = samplerContext.getImageData(0, 0, cols, rows);

        ctx.font = `${ASCII_FONT_SIZE}px "Courier New", monospace`;
        ctx.textBaseline = 'top';
        ctx.fillStyle = '#ffffff';

        for (let row = 0; row < rows; row += 1) {
          for (let col = 0; col < cols; col += 1) {
            const pixelIndex = (row * cols + col) * 4;
            const r = data[pixelIndex];
            const g = data[pixelIndex + 1];
            const b = data[pixelIndex + 2];
            const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
            const char = ASCII_CHARS[Math.floor(lum * (ASCII_CHARS.length - 1))];

            if (char !== ' ') {
              ctx.fillText(char, col * cellWidth, row * cellHeight);
            }
          }
        }
      }

      animationFrameId = requestAnimationFrame(renderFrame);
    };

    video.play().catch(() => {});
    animationFrameId = requestAnimationFrame(renderFrame);

    return () => {
      mounted = false;
      video.pause();
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <>
      <video
        ref={videoRef}
        src="/videos/fishies.webm"
        muted
        playsInline
        preload="metadata"
        className={styles.hiddenVideo}
        aria-hidden="true"
      />
      <canvas
        ref={canvasRef}
        width={720}
        height={1280}
        className={styles.fishAsciiCanvas}
        aria-hidden="true"
      />
    </>
  );
}

export default function ContactPage() {
  const calLink = (process.env.NEXT_PUBLIC_CAL_LINK ?? DEFAULT_CAL_LINK)
    .replace(/^https?:\/\/(?:www\.)?cal\.com\//, '')
    .replace(/^\/+|\/+$/g, '');
  const calEmbedUrl = `https://cal.com/${calLink}?embed=true&theme=light`;

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    budget: '',
    packages: [] as string[],
    message: '',
  });
  const [showErrors, setShowErrors] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const firstNameValid = formData.firstName.trim().length > 0;
  const lastNameValid = formData.lastName.trim().length > 0;
  const emailValid = EMAIL_PATTERN.test(formData.email.trim());
  const phoneValid = formData.phone.length === PHONE_DIGITS_REQUIRED;
  const budgetValid = formData.budget.length > 0;
  const messageValid = formData.message.trim().length > 0;
  const formValid =
    firstNameValid && lastNameValid && emailValid && phoneValid && budgetValid && messageValid;

  const updateField = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: name === 'phone' ? value.replace(/\D/g, '').slice(0, PHONE_DIGITS_REQUIRED) : value,
    }));
  };

  const togglePackage = (packageName: string) => {
    setFormData((current) => ({
      ...current,
      packages: current.packages.includes(packageName)
        ? current.packages.filter((item) => item !== packageName)
        : [...current.packages, packageName],
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setShowErrors(true);

    if (!formValid) {
      return;
    }
  };

  return (
    <main className={styles.stage}>
      <section className={`grid-container ${styles.grid}`} aria-label="Contact page">
        <div className={`grid-layout ${styles.cardRow}`}>
          <article className={`grid-span-12 md:grid-span-4 md:grid-start-3 ${styles.card} ${styles.infoImageCard}`}>
            <span className={styles.image} aria-hidden="true" />
            <span className={styles.tint} aria-hidden="true" />
            <FishAsciiOverlay />

            <div className={styles.infoOverlay}>
              <h1>Let&apos;s Talk</h1>

              <div className={styles.details}>
                <p>Pablo Rojas</p>
                <a href="tel:12065817359">(206) 581-7359</a>
                <a href="mailto:pabrojas@uw.edu">pabrojas@uw.edu</a>
                <p>Working in the PNW</p>
                <p>Available 7-5pm PST</p>
              </div>

              <button
                type="button"
                className={styles.calendarButton}
                onClick={() => setCalendarOpen(true)}
              >
                View calendar
              </button>
            </div>
          </article>

          <article className={`grid-span-12 md:grid-span-4 md:grid-start-7 ${styles.formCard}`}>
            <form className={styles.messageForm} onSubmit={handleSubmit} noValidate>
              <div className={styles.topLayer}>
                <h2>Send a message</h2>

                <div className={styles.fieldGrid}>
                  <label data-invalid={showErrors && !firstNameValid}>
                    <span>First Name*</span>
                    <input
                      name="firstName"
                      value={formData.firstName}
                      onChange={updateField}
                      autoComplete="given-name"
                      required
                    />
                    <small>First name is required.</small>
                  </label>
                  <label data-invalid={showErrors && !lastNameValid}>
                    <span>Last Name*</span>
                    <input
                      name="lastName"
                      value={formData.lastName}
                      onChange={updateField}
                      autoComplete="family-name"
                      required
                    />
                    <small>Last name is required.</small>
                  </label>
                  <label data-invalid={showErrors && !emailValid}>
                    <span>Email*</span>
                    <input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={updateField}
                      autoComplete="email"
                      required
                    />
                    <small>Use a valid email address.</small>
                  </label>
                  <label data-invalid={showErrors && !phoneValid}>
                    <span>Phone number*</span>
                    <input
                      name="phone"
                      type="tel"
                      value={formatPhoneDigits(formData.phone)}
                      onChange={updateField}
                      autoComplete="tel"
                      inputMode="numeric"
                      required
                    />
                    <small>Use a valid 10-digit phone number.</small>
                  </label>
                  <label>
                    <span>Company</span>
                    <input
                      name="company"
                      value={formData.company}
                      onChange={updateField}
                      autoComplete="organization"
                    />
                  </label>
                  <label data-invalid={showErrors && !budgetValid}>
                    <span>budget range *</span>
                    <select name="budget" value={formData.budget} onChange={updateField} required>
                      <option value="" disabled />
                      <option value="under-5k">Under $5k</option>
                      <option value="5k-10k">$5k-$10k</option>
                      <option value="10k-25k">$10k-$25k</option>
                      <option value="25k-plus">$25k+</option>
                    </select>
                    <small>Budget range is required.</small>
                  </label>
                </div>
              </div>

              <fieldset className={styles.packageField}>
                <legend>Package needed</legend>
                <div className={styles.packageGrid}>
                  {PACKAGE_OPTIONS.map((packageName) => {
                    const checked = formData.packages.includes(packageName);

                    return (
                      <label key={packageName}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => togglePackage(packageName)}
                        />
                        <span>{packageName}</span>
                        <span className={styles.checkboxVisual} aria-hidden="true">
                          <span>✓</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              <div className={styles.bottomLayer}>
                <label
                  className={styles.messageField}
                  data-invalid={showErrors && !messageValid}
                >
                  <span>Tell us more about what you need*</span>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={updateField}
                    rows={5}
                    required
                  />
                  <small>Project details are required.</small>
                </label>

                <div className={styles.buttonSplit} data-muted="true">
                  <button type="submit">Send message</button>
                  <button type="submit" aria-label="Send message">
                    +
                  </button>
                </div>
              </div>
            </form>
          </article>
        </div>
      </section>

      {calendarOpen && (
        <div className={styles.calendarModal} role="dialog" aria-modal="true" aria-label="Schedule a call">
          <button
            type="button"
            className={styles.modalBackdrop}
            onClick={() => setCalendarOpen(false)}
            aria-label="Close calendar"
          />
          <div className={styles.modalPanel}>
            <iframe
              src={calEmbedUrl}
              title="Schedule a call"
              className={styles.calFrame}
              loading="lazy"
              allow="camera; microphone; fullscreen; payment"
            />
          </div>
        </div>
      )}
    </main>
  );
}
