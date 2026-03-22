import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Info } from 'lucide-react';

interface InfoTooltipProps {
  items: { color: string; label: string; desc?: string }[];
  title?: string;
}

const InfoTooltip = ({ items, title = 'How it works' }: InfoTooltipProps) => {
  const [show, setShow] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const updatePosition = useCallback(() => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setPos({
      top: rect.bottom + 8,
      left: rect.left + rect.width / 2,
    });
  }, []);

  useEffect(() => {
    if (!show) return;
    updatePosition();

    const onScroll = () => updatePosition();
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);

    const onClick = (e: MouseEvent) => {
      if (
        btnRef.current?.contains(e.target as Node) ||
        tooltipRef.current?.contains(e.target as Node)
      ) return;
      setShow(false);
    };
    document.addEventListener('mousedown', onClick);

    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
      document.removeEventListener('mousedown', onClick);
    };
  }, [show, updatePosition]);

  const tooltip = show
    ? createPortal(
        <div
          ref={tooltipRef}
          className="fixed w-[270px] p-4 rounded-xl shadow-2xl border z-[9999]"
          style={{
            top: pos.top,
            left: pos.left,
            transform: 'translateX(-50%)',
            backgroundColor: 'var(--card-bg)',
            borderColor: 'var(--card-border)',
          }}
          onMouseEnter={() => setShow(true)}
          onMouseLeave={() => setShow(false)}
        >
          <div
            className="absolute left-1/2 -translate-x-1/2 -top-1.5 w-3 h-3 rotate-45 border-l border-t"
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--card-border)',
            }}
          />
          <p
            className="text-[11px] font-bold uppercase tracking-widest mb-2.5"
            style={{ color: 'var(--text-primary)' }}
          >
            {title}
          </p>
          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <span
                  className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <p className="text-[11px] leading-relaxed m-0">
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                    {item.label}
                  </span>
                  {item.desc && (
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {' '}&mdash; {item.desc}
                    </span>
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      <button
        ref={btnRef}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(prev => !prev)}
        className="p-1 rounded-md hover:bg-[var(--bg-tertiary)] transition-colors"
        style={{ color: 'var(--text-muted)' }}
      >
        <Info size={13} />
      </button>
      {tooltip}
    </>
  );
};

export default InfoTooltip;
