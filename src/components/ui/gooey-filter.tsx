"use client";

interface GooeyFilterProps {
  id?: string;
  strength?: number;
}

/**
 * SVG filter for gooey / metaball-style tab merges. Reference with
 * `style={{ filter: \`url(#${id})\` }}` on the element to filter.
 */
export function GooeyFilter({ id = "gooey-filter", strength = 10 }: GooeyFilterProps) {
  return (
    <svg className="pointer-events-none absolute h-0 w-0 overflow-hidden" aria-hidden>
      <defs>
        <filter id={id} colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceGraphic" stdDeviation={strength} result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
            result="goo"
          />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
      </defs>
    </svg>
  );
}
