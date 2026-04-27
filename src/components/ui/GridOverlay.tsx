'use client';

import { useEffect, useState } from 'react';

export default function GridOverlay() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === 'g') {
        e.preventDefault();
        setVisible((v) => !v);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9998]">
      <div className="grid h-full w-full grid-cols-12 gap-4 px-8">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="h-full bg-[#ff6a2f]/10" />
        ))}
      </div>
    </div>
  );
}
