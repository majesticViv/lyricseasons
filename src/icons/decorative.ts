// Wax seal SVG — 40px diameter circle with stylized seal
export function waxSealSvg(): string {
  return `<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="18" fill="var(--color-primary)" />
    <circle cx="20" cy="20" r="14" fill="var(--color-primary-dark)" />
    <text x="20" y="22" text-anchor="middle" dominant-baseline="middle"
      font-family="var(--font-display)" font-size="7" fill="var(--color-surface)"
      font-weight="700" letter-spacing="0.5">语录</text>
    <!-- Seal edge notches -->
    ${Array.from({ length: 16 }, (_, i) => {
      const angle = (i * 360) / 16;
      const rad = (angle * Math.PI) / 180;
      const cx = 20 + 17 * Math.cos(rad);
      const cy = 20 + 17 * Math.sin(rad);
      return `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="1.5" fill="var(--color-primary-light)" />`;
    }).join('\n    ')}
  </svg>`;
}

// Pen SVG — 60px tall, gold accent
export function penSvg(): string {
  return `<svg width="24" height="60" viewBox="0 0 24 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Pen body -->
    <rect x="8" y="4" width="8" height="38" rx="2" fill="var(--color-accent)" />
    <!-- Pen tip -->
    <polygon points="8,42 16,42 12,56" fill="var(--color-text-primary)" />
    <!-- Pen clip -->
    <rect x="16" y="8" width="2" height="18" rx="1" fill="var(--color-accent-light)" />
    <!-- Pen cap -->
    <rect x="7" y="2" width="10" height="6" rx="2" fill="var(--color-accent-light)" />
    <!-- Nib detail -->
    <line x1="12" y1="46" x2="12" y2="54" stroke="var(--color-text-secondary)" stroke-width="0.8" />
  </svg>`;
}

// Gramophone SVG — 80x80px
export function gramophoneSvg(): string {
  return `<svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Horn -->
    <path d="M28 15 L60 5 L65 30 L35 35 Z" fill="var(--color-accent)" stroke="var(--color-accent-light)" stroke-width="1" />
    <!-- Horn opening highlight -->
    <ellipse cx="62" cy="17" rx="6" ry="13" fill="var(--color-accent-light)" opacity="0.4" />
    <!-- Neck -->
    <rect x="26" y="32" width="6" height="16" rx="2" fill="var(--color-text-secondary)" />
    <!-- Body -->
    <rect x="16" y="46" width="26" height="14" rx="3" fill="var(--color-text-primary)" />
    <!-- Turntable -->
    <ellipse cx="29" cy="46" rx="12" ry="3" fill="var(--color-text-secondary)" />
    <!-- Legs -->
    <rect x="18" y="60" width="3" height="10" rx="1" fill="var(--color-text-primary)" />
    <rect x="37" y="60" width="3" height="10" rx="1" fill="var(--color-text-primary)" />
    <!-- Record -->
    <circle cx="29" cy="46" r="6" fill="var(--color-text-primary)" stroke="var(--color-text-secondary)" stroke-width="0.5" />
    <circle cx="29" cy="46" r="2" fill="var(--color-accent)" />
  </svg>`;
}

// Musical note SVG — for floating animation
export function musicalNoteSvg(): string {
  return `<svg width="16" height="20" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="5" cy="16" rx="4" ry="3" fill="var(--color-text-primary)" />
    <line x1="9" y1="16" x2="9" y2="2" stroke="var(--color-text-primary)" stroke-width="1.5" />
    <path d="M9 2 Q14 4 14 8 Q12 6 9 6" fill="var(--color-text-primary)" />
  </svg>`;
}

// Envelope SVG — for stack and season envelopes
export function envelopeSvg(width: number, height: number): string {
  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Envelope body -->
    <rect x="1" y="1" width="${width - 2}" height="${height - 2}" rx="3"
      fill="var(--color-surface)" stroke="var(--color-primary)" stroke-width="1.5" />
    <!-- Flap -->
    <path d="M1,1 L${width / 2},${height * 0.38} L${width - 1},1"
      fill="var(--color-surface)" stroke="var(--color-primary)" stroke-width="1.5" stroke-linejoin="round" />
  </svg>`;
}
