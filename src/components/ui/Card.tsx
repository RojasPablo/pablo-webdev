'use client';

import React, { useState } from 'react';
import { motion, type MotionStyle } from 'framer-motion';
import { TbPoint } from 'react-icons/tb';
import '@/styles/card.css';

const CARD_CONTENT_FADE_DELAY_MS = 500;
const CARD_CONTENT_FADE_DURATION_MS = 800;
const BUTTON_TILE_MASK_POST_CARD_DELAY_MS = 0;

interface CardProps {
  title: string;
  content?: string;
  meta?: string;
  bullets?: string[];
  initialColor: string;
  children?: React.ReactNode;
  className?: string;
  customContent?: React.ReactNode;
  entryDelayMs?: number;
  style?: MotionStyle;
  contentStyle?: MotionStyle;
}

const Card: React.FC<CardProps> = ({
  title,
  content,
  meta,
  bullets,
  customContent,
  initialColor,
  children,
  className = '',
  entryDelayMs = 0,
  style,
  contentStyle,
}) => {
  const [isButtonTileMaskPrimed, setIsButtonTileMaskPrimed] = useState(false);

  const truncatedContent =
    content && content.length > 300 ? content.substring(0, 300) + '...' : content;
  const resolvedEntryDelaySeconds = entryDelayMs / 1000;
  const resolvedContentDelaySeconds = (entryDelayMs + CARD_CONTENT_FADE_DELAY_MS) / 1000;
  const resolvedButtonTileMaskDelayMs =
    entryDelayMs + CARD_CONTENT_FADE_DELAY_MS + CARD_CONTENT_FADE_DURATION_MS + BUTTON_TILE_MASK_POST_CARD_DELAY_MS;

  return (
    <motion.div
      className={`card ${className}`}
      initial={{ scale: 0.86, y: 26, opacity: 0 }}
      whileInView={{ scale: 1, y: 0, opacity: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 14,
        mass: 1.15,
        delay: resolvedEntryDelaySeconds,
      }}
      style={{ willChange: 'transform, opacity', ...style }}
    >
      <div className="card__background" style={{ backgroundColor: initialColor }} />

      <motion.div
        className="card__reveal"
        initial={{ scale: 0.15 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{
          duration: 1,
          delay: resolvedEntryDelaySeconds,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
        style={{ willChange: 'transform' }}
      />

      <motion.div
        className="card__content"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        onViewportEnter={() => setIsButtonTileMaskPrimed(true)}
        transition={{
          duration: CARD_CONTENT_FADE_DURATION_MS / 1000,
          delay: resolvedContentDelaySeconds,
          ease: 'easeOut',
        }}
        style={{ willChange: 'opacity', ...contentStyle }}
      >
        {customContent ? customContent : (
          <>
            <h2 className="card__title">{title}</h2>
            {meta ? <p className="card__meta">{meta}</p> : null}
            {bullets?.length ? (
              <ul className="card__list">
                {bullets.map((bullet) => (
                  <li key={bullet} className="card__listItem">
                    <TbPoint className="card__listIcon" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            ) : truncatedContent ? (
              <p className="card__text">{truncatedContent}</p>
            ) : null}
          </>
        )}

        {children && (
          <div className="card__action">
            {React.isValidElement(children)
              ? React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
                  tileMaskEnabled: isButtonTileMaskPrimed,
                  tileMaskDelayMs: resolvedButtonTileMaskDelayMs,
                })
              : children}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default Card;
