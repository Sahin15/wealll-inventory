export const getContrastYIQ = (hexcolor) => {
  if (!hexcolor) return '#ffffff';
  
  // Remove hash if exists
  let cleanHex = hexcolor.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('');
  }
  
  // Parse RGB
  let r = parseInt(cleanHex.substr(0, 2), 16) || 0;
  let g = parseInt(cleanHex.substr(2, 2), 16) || 0;
  let b = parseInt(cleanHex.substr(4, 2), 16) || 0;
  
  // Calculate YIQ ratio
  let yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  
  // Check contrast
  return (yiq >= 140) ? '#0f172a' : '#ffffff';
};

export const hexToRgb = (hex) => {
  if (!hex) return { r: 79, g: 70, b: 229, rgbString: '79, 70, 229' };
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('');
  }
  const num = parseInt(cleanHex, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return {
    r: isNaN(r) ? 79 : r,
    g: isNaN(g) ? 70 : g,
    b: isNaN(b) ? 229 : b,
    rgbString: `${isNaN(r) ? 79 : r}, ${isNaN(g) ? 70 : g}, ${isNaN(b) ? 229 : b}`
  };
};

export const adjustBrightness = (hex, percent) => {
  const { r, g, b } = hexToRgb(hex);
  const amount = Math.floor((percent / 100) * 255);
  const newR = Math.min(255, Math.max(0, r + amount));
  const newG = Math.min(255, Math.max(0, g + amount));
  const newB = Math.min(255, Math.max(0, b + amount));
  return `#${((1 << 24) + (newR << 16) + (newG << 8) + newB).toString(16).slice(1)}`;
};

export const hexToHsl = (hex) => {
  const { r, g, b } = hexToRgb(hex);
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rNorm:
        h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
        break;
      case gNorm:
        h = (bNorm - rNorm) / d + 2;
        break;
      case bNorm:
        h = (rNorm - gNorm) / d + 4;
        break;
      default:
        break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
};

export const hslToHex = (h, s, l) => {
  const sNorm = s / 100;
  const lNorm = l / 100;

  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lNorm - c / 2;

  let r = 0;
  let g = 0;
  let b = 0;

  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0;
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x;
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c;
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c;
  } else if (h >= 300 && h < 360) {
    r = c; g = 0; b = x;
  }

  const toHex = (val) => {
    const hex = Math.round((val + m) * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

/**
 * Curated Designer Presets for 1-click dual color palettes
 */
export const DESIGNER_PRESETS = [
  { id: 'crimson_rose', name: 'Crimson & Rose', primary: '#ce3b3b', secondary: '#fb7185', desc: 'Luxury, Beauty & Lifestyle' },
  { id: 'indigo_cyan', name: 'Indigo & Cyan', primary: '#4f46e5', secondary: '#06b6d4', desc: 'Modern High-Tech SaaS' },
  { id: 'emerald_gold', name: 'Emerald & Gold', primary: '#059669', secondary: '#f59e0b', desc: 'Growth, Wealth & Commerce' },
  { id: 'obsidian_amber', name: 'Obsidian & Amber', primary: '#18181b', secondary: '#f59e0b', desc: 'Executive Carbon Dark' },
  { id: 'royal_coral', name: 'Royal & Coral', primary: '#1d4ed8', secondary: '#f97316', desc: 'Energetic Retail & Trade' },
  { id: 'amethyst_pink', name: 'Amethyst & Orchid', primary: '#7c3aed', secondary: '#ec4899', desc: 'Creative Design Studio' }
];

/**
 * Computes dynamic harmonious secondary color recommendations based on a primary hex
 */
export const getHarmoniousRecommendations = (primaryHex) => {
  const cleanHex = primaryHex && /^#([0-9A-F]{3}){1,2}$/i.test(primaryHex) ? primaryHex : '#4f46e5';
  const { h, s, l } = hexToHsl(cleanHex);

  // If neutral or black, provide vibrant contrast accents
  if (s < 10) {
    return [
      { name: 'Electric Amber', hex: '#f59e0b', reason: 'High-contrast luxury pop' },
      { name: 'Vibrant Cyan', hex: '#06b6d4', reason: 'Modern tech accent' },
      { name: 'Rose Gold', hex: '#fb7185', reason: 'Warm elegant highlight' }
    ];
  }

  // 1. Analogous (+30 deg)
  const analogousHue = (h + 30) % 360;
  const analogousHex = hslToHex(analogousHue, Math.min(95, s + 5), Math.min(65, Math.max(45, l)));

  // 2. Complementary Contrast (+180 deg)
  const compHue = (h + 180) % 360;
  const compHex = hslToHex(compHue, Math.min(95, s), Math.min(60, Math.max(45, l)));

  // 3. Vibrant Adjacent Pop (-40 deg)
  const popHue = (h - 40 + 360) % 360;
  const popHex = hslToHex(popHue, Math.min(100, s + 10), Math.min(62, Math.max(48, l)));

  return [
    { name: 'Harmonious Flow', hex: analogousHex, reason: 'Seamless analogous gradient' },
    { name: 'Vibrant Contrast', hex: compHex, reason: 'High-energy complementary pop' },
    { name: 'Luminous Glow', hex: popHex, reason: 'Warm energetic highlight' }
  ];
};

/**
 * Generates a complete CSS custom property dictionary for a tenant's Primary and Secondary brand colors.
 */
export const generateBrandTheme = (rawPrimary, rawSecondary) => {
  const brandColor = rawPrimary && /^#([0-9A-F]{3}){1,2}$/i.test(rawPrimary)
    ? rawPrimary
    : '#4f46e5';

  const defaultSecondary = getHarmoniousRecommendations(brandColor)[0].hex;
  const secondaryColor = rawSecondary && /^#([0-9A-F]{3}){1,2}$/i.test(rawSecondary)
    ? rawSecondary
    : defaultSecondary;

  const primaryRgb = hexToRgb(brandColor);
  const secondaryRgb = hexToRgb(secondaryColor);
  const contrastText = getContrastYIQ(brandColor);
  const isVeryDark = (primaryRgb.r * 0.299 + primaryRgb.g * 0.587 + primaryRgb.b * 0.114) < 40;

  // Dual-color rich gradient
  const heroGradient = isVeryDark
    ? `linear-gradient(135deg, #18181b 0%, ${secondaryColor} 55%, #09090b 100%)`
    : `linear-gradient(135deg, ${brandColor} 0%, ${secondaryColor} 60%, #0f172a 100%)`;

  const glowShadow = isVeryDark
    ? '0 10px 25px -5px rgba(15, 23, 42, 0.4)'
    : `0 10px 25px -5px rgba(${primaryRgb.rgbString}, 0.35)`;

  const secondaryGlow = `0 10px 25px -5px rgba(${secondaryRgb.rgbString}, 0.35)`;

  return {
    '--brand-color': brandColor,
    '--brand-text-color': contrastText,
    '--brand-primary': brandColor,
    '--brand-primary-rgb': primaryRgb.rgbString,
    '--brand-dark': isVeryDark ? '#1e293b' : adjustBrightness(brandColor, -35),
    '--brand-light': isVeryDark ? '#334155' : adjustBrightness(brandColor, 25),
    '--brand-tint': isVeryDark ? 'rgba(255, 255, 255, 0.08)' : `rgba(${primaryRgb.rgbString}, 0.08)`,
    '--brand-tint-strong': isVeryDark ? 'rgba(255, 255, 255, 0.15)' : `rgba(${primaryRgb.rgbString}, 0.16)`,
    '--brand-border': isVeryDark ? 'rgba(255, 255, 255, 0.18)' : `rgba(${primaryRgb.rgbString}, 0.22)`,
    '--brand-glow': glowShadow,
    
    // Secondary color properties
    '--brand-secondary': secondaryColor,
    '--brand-secondary-rgb': secondaryRgb.rgbString,
    '--brand-secondary-tint': `rgba(${secondaryRgb.rgbString}, 0.09)`,
    '--brand-secondary-border': `rgba(${secondaryRgb.rgbString}, 0.25)`,
    '--brand-secondary-glow': secondaryGlow,

    // Dual-color blends
    '--brand-gradient': heroGradient,
    '--brand-dual-line': `linear-gradient(90deg, ${brandColor} 0%, ${secondaryColor} 100%)`
  };
};

