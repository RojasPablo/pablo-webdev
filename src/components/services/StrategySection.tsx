'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const processStages = [
  {
    id: 'research',
    banner: 'Research & Discovery',
    items: ['Technical Audit', 'Keyword Research', 'Competitor Analysis'],
    accent: '#9589d3',
  },
  {
    id: 'implementation',
    banner: 'Optimization & Implementation',
    items: ['Backlinking', 'Internal Linking', 'On-Page SEO'],
    accent: '#4d9fff',
  },
  {
    id: 'refinement',
    banner: 'Tracking & Refinement',
    items: ['Analytics & Goals', 'Monthly Reporting', 'Ongoing Campaign'],
    accent: '#8fd462',
  },
];

const strategyDetails = [
  {
    title: 'Technical Audit',
    description:
      "Inspect your website's technical foundation and fix the issues that can hold back visibility, crawlability, and rankings.",
  },
  {
    title: 'Keyword Research',
    description:
      'Find profitable search terms your customers actually use by studying competitors, historical data, and hidden demand trends.',
  },
  {
    title: 'Competitor Analysis',
    description:
      "Study top-ranking competitors' keywords, content, structure, and backlinks to find the gaps worth attacking.",
  },
  {
    title: 'Backlinking',
    description:
      'Build trust and authority through local citations, directories, and relevant links from niche-specific sources.',
  },
  {
    title: 'Internal Linking',
    description:
      'Connect pages strategically so Google understands your site structure and which pages deserve the most ranking power.',
  },
  {
    title: 'On-Page SEO',
    description:
      'Shape page titles, descriptions, headings, and content signals so search engines can understand and rank each page.',
  },
  {
    title: 'Analytics & Goals',
    description:
      'Set up tracking through Google Analytics and Search Console so campaign performance can be measured clearly.',
  },
  {
    title: 'Monthly Reporting',
    description:
      'Review ranking progress, traffic movement, and campaign priorities through monthly screenshares and on-demand reports.',
  },
  {
    title: 'Ongoing Campaign',
    description:
      'Review performance regularly and keep improving on-page and off-page work as rankings, competitors, and goals shift.',
  },
];

const stageByItem = new Map(
  processStages.flatMap((stage) =>
    stage.items.map((item) => [
      item,
      {
        accent: stage.accent,
        group: stage.banner,
      },
    ]),
  ),
);

const strategyGridCards = strategyDetails.map((detail) => ({
  ...detail,
  accent: stageByItem.get(detail.title)?.accent ?? '#8fd462',
  group: stageByItem.get(detail.title)?.group ?? 'Strategy',
}));

const stageCardCollapsedHeight = 'clamp(11rem, 15vw, 15.5rem)';
const stageCardExpandedHeight = 'clamp(18rem, 46vh, 25rem)';

function getTileMotion(index: number) {
  const columnIndex = index % 3;
  const elasticScrub = [4.2, 1.75, 0.08][columnIndex];

  return {
    x: 0,
    y: 420,
    scale: 1,
    scaleY: 1,
    scrub: elasticScrub,
  };
}

type StrategySectionProps = {
  mode?: 'full' | 'embedded';
};

export default function StrategySection({ mode = 'full' }: StrategySectionProps) {
  const isEmbedded = mode === 'embedded';
  const introSectionRef = useRef<HTMLElement>(null);
  const gridSectionRef = useRef<HTMLElement>(null);
  const stageCardRefs = useRef<(HTMLElement | null)[]>([]);
  const tileRefs = useRef<(HTMLElement | null)[]>([]);
  const [hoveredTileIndex, setHoveredTileIndex] = useState<number | null>(null);

  useEffect(() => {
    const section = introSectionRef.current;
    const cards = stageCardRefs.current.filter(
      (card): card is HTMLElement => card !== null,
    );

    if (!section || !cards.length) {
      return;
    }

    const context = gsap.context(() => {
      gsap.set(cards, {
        autoAlpha: 1,
        height: stageCardCollapsedHeight,
        y: 56,
      });

      const revealTimeline = gsap.timeline({ paused: true });

      cards.forEach((card, index) => {
        const list = card.querySelector('[data-stage-list]');
        const startAt = 0.22 + index * 0.18;

        revealTimeline
          .fromTo(
            card,
            { y: 56 },
            { y: 0, duration: 0.72, ease: 'power3.out' },
            startAt,
          )
          .to(
            card,
            { height: stageCardExpandedHeight, duration: 0.9, ease: 'power3.inOut' },
            startAt + 0.12,
          );

        if (list) {
          revealTimeline.fromTo(
            list,
            { autoAlpha: 0, y: 20 },
            { autoAlpha: 1, y: 0, duration: 0.52, ease: 'power2.out' },
            startAt + 0.52,
          );
        }
      });

      ScrollTrigger.create({
        trigger: section,
        start: 'top 72%',
        once: true,
        onEnter: () => revealTimeline.play(),
      });
    }, section);

    ScrollTrigger.refresh();

    return () => {
      context.revert();
    };
  }, []);

  useEffect(() => {
    const section = gridSectionRef.current;

    if (!section) {
      return;
    }

    const context = gsap.context(() => {
      tileRefs.current.forEach((tile, index) => {
        if (!tile) {
          return;
        }

        const motion = getTileMotion(index);

        gsap.fromTo(
          tile,
          {
            x: 0,
            y: 0,
            scale: 1,
            scaleY: 1,
          },
          {
            x: motion.x,
            y: motion.y,
            scale: motion.scale,
            scaleY: motion.scaleY,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top 82%',
              end: 'bottom 70%',
              scrub: motion.scrub,
              invalidateOnRefresh: true,
            },
          },
        );
      });
    }, section);

    ScrollTrigger.refresh();

    return () => {
      context.revert();
    };
  }, []);

  return (
    <>
      <section
        ref={introSectionRef}
        id={isEmbedded ? undefined : 'seo'}
        className="min-h-screen w-full bg-[#eeeeee] px-6 py-6 text-[#171717] sm:px-8 lg:px-8"
        data-service-section={isEmbedded ? undefined : 'seo'}
      >
        <div className="grid min-h-[calc(100vh-3rem)] w-full grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center lg:gap-4">
          <div className="flex min-h-[34vh] flex-col justify-between lg:col-start-2 lg:col-end-5 lg:h-[clamp(18rem,46vh,25rem)] lg:min-h-0 lg:self-center">
            <div>
              <h1 className="max-w-[13ch] text-[clamp(1.65rem,2.5vw,3.25rem)] font-semibold leading-[0.98] tracking-normal">
                Search that compounds.
              </h1>
              <p className="mt-4 max-w-[24rem] text-[clamp(0.88rem,0.82vw,1rem)] leading-[1.4] text-[#2d2d2d]">
                Good strategy is built in layers: understand how people search,
                improve the pages that need to perform, and keep refining
                around what the data proves. That is how your business becomes
                easier to find, easier to trust, and easier to choose.
              </p>
            </div>

            <div className="pb-1">
              <h2 className="text-[clamp(1.05rem,1vw,1.25rem)] font-semibold leading-none">
                Ready to grow?
              </h2>
              <div className="mt-5 flex flex-wrap items-center gap-2 text-[0.78rem] font-semibold uppercase tracking-[0.06em]">
                <a
                  href="/contact"
                  className="bg-[#171717] px-4 py-2.5 font-mono text-[0.7rem] text-[#eeeeee]"
                >
                  Book a Strategy Call
                </a>
                <a
                  href="/contact"
                  aria-label="Start strategy project"
                  className="grid size-9 place-items-center bg-[#171717] text-base font-normal leading-none text-[#eeeeee]"
                >
                  +
                </a>
              </div>
            </div>
          </div>

          <div className="grid min-h-[42vh] grid-cols-1 gap-5 md:grid-cols-3 lg:contents">
            {processStages.map((stage, index) => {
              const desktopColumns = [
                'lg:col-start-6 lg:col-end-8',
                'lg:col-start-8 lg:col-end-10',
                'lg:col-start-10 lg:col-end-12',
              ];

              return (
                <article
                  key={stage.id}
                  ref={(node) => {
                    stageCardRefs.current[index] = node;
                  }}
                  className={`flex min-h-[18rem] flex-col justify-between overflow-hidden bg-[#141414] p-5 text-[#eeeeee] sm:p-6 lg:min-h-0 lg:self-center xl:p-7 ${desktopColumns[index]}`}
                >
                  <div>
                    <div
                      className="mb-5 h-1.5 w-10"
                      style={{ backgroundColor: stage.accent }}
                    />
                    <p className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-[#a7a7a7]">
                      0{index + 1}
                    </p>
                    <h2 className="mt-3 max-w-[13ch] text-[clamp(1.55rem,2vw,2.35rem)] font-light leading-[1] tracking-normal text-[#dedede]">
                      {stage.banner}
                    </h2>
                  </div>

                  <ul
                    data-stage-list
                    className="space-y-2 font-mono text-[0.62rem] uppercase tracking-[0.07em] text-[#cfcfcf]"
                  >
                    {stage.items.map((item) => (
                      <li key={item} className="flex items-center gap-3">
                        <span
                          className="size-1.5 shrink-0"
                          style={{ backgroundColor: stage.accent }}
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section
        ref={gridSectionRef}
        className="relative min-h-[calc(100vh+28rem)] w-full overflow-visible bg-[#eeeeee] px-6 text-[#171717] sm:px-8 lg:px-8"
      >
        <Image
          src="/images/purple.jpg"
          alt=""
          fill
          sizes="100vw"
          className="pointer-events-none absolute inset-0 object-cover"
          priority={false}
        />
        <div className="pointer-events-none absolute inset-0 bg-[#eeeeee]/20" />
        <style>
          {`
            .strategy-point-grid {
              --page-padding: 4rem;
              --column-gap-total: 11rem;
              --main-column-width: calc((100vw - var(--page-padding) - var(--column-gap-total)) / 12);
              --tile-width: clamp(12rem, calc((var(--main-column-width) * 2) + 1rem), 17rem);

              max-width: calc((var(--tile-width) * 3) + 2rem);
            }

            .strategy-point-tile {
              --tile-padding: 1.25rem;
              background-color: #141414;
              container-type: inline-size;
              transform: translate3d(0, 0, 0);
              transform-origin: center top;
              will-change: transform;
            }

            @media (min-width: 640px) {
              .strategy-point-tile {
                --tile-padding: 1.5rem;
              }
            }

            .strategy-point-summary,
            .strategy-point-description {
              transition:
                transform 560ms cubic-bezier(0.16, 1, 0.3, 1),
                opacity 360ms ease;
            }

            .strategy-point-summary {
              transform: translateY(0);
            }

            .strategy-point-description {
              opacity: 0;
              transform: translateY(1.35rem);
            }

            .strategy-point-tile:hover .strategy-point-summary,
            .strategy-point-tile:focus-visible .strategy-point-summary {
              transform: translateY(calc(-100cqw + 100% + (var(--tile-padding) * 0.25)));
            }

            .strategy-point-tile:hover .strategy-point-description,
            .strategy-point-tile:focus-visible .strategy-point-description {
              opacity: 1;
              transform: translateY(0);
            }
          `}
        </style>

        <div className="sticky top-0 z-10 grid h-screen w-full place-items-center py-20">
          <div className="strategy-point-grid mx-auto grid w-full grid-cols-1 gap-4 sm:grid-cols-3 lg:gap-4">
            {strategyGridCards.map((point, index) => (
              <article
                key={point.title}
                ref={(node) => {
                  tileRefs.current[index] = node;
                }}
                className="strategy-point-tile relative aspect-square overflow-hidden p-5 text-[#eeeeee] outline-none sm:p-6"
                tabIndex={0}
                onMouseEnter={() => setHoveredTileIndex(index)}
                onMouseLeave={() => setHoveredTileIndex(null)}
                style={{
                  opacity: hoveredTileIndex !== null && hoveredTileIndex !== index ? 0.4 : 1,
                  transition: 'opacity 0.3s ease',
                }}
              >
                <div className="strategy-point-summary absolute inset-x-5 bottom-5 sm:inset-x-6 sm:bottom-6">
                  <span
                    className="mb-4 block size-1.5"
                    style={{ backgroundColor: point.accent }}
                  />
                  <p className="mb-3 font-mono text-[0.56rem] uppercase tracking-[0.12em] text-[#d5d5d5]">
                    {point.group}
                  </p>
                  <h2 className="text-[clamp(1.1rem,1.35vw,1.55rem)] font-semibold leading-[1.05] tracking-normal">
                    {point.title}
                  </h2>
                </div>

                <p className="strategy-point-description absolute inset-x-5 bottom-5 text-[0.925rem] leading-[1.32] text-[#d6d6d6] sm:inset-x-6 sm:bottom-6">
                  {point.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
