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
 * Industry categories for designer presets
 */
export const PRESET_CATEGORIES = [
  { id: 'all', name: 'All Presets' },
  { id: 'tech', name: 'Tech & SaaS' },
  { id: 'retail', name: 'Beauty & Lifestyle' },
  { id: 'commerce', name: 'Commerce & Food' },
  { id: 'wellness', name: 'Health & Wellness' },
  { id: 'creative', name: 'Creative & Studio' },
  { id: 'industrial', name: 'Logistics & Trade' },
  { id: 'luxury', name: 'Executive & Dark' }
];

/**
 * Curated Designer Presets for 1-click dual color palettes
 */
export const DESIGNER_PRESETS = [
  // Tech & Modern SaaS
  { id: 'indigo_cyan', category: 'tech', name: 'Indigo & Cyan', primary: '#4f46e5', secondary: '#06b6d4', desc: 'Modern High-Tech SaaS' },
  { id: 'cyber_violet', category: 'tech', name: 'Cobalt & Violet', primary: '#2563eb', secondary: '#8b5cf6', desc: 'Cloud, AI & Platforms' },
  { id: 'electric_emerald', category: 'tech', name: 'Sapphire & Mint', primary: '#1d4ed8', secondary: '#10b981', desc: 'FinTech & Analytics' },
  { id: 'teal_sky', category: 'tech', name: 'Teal & Sky', primary: '#0d9488', secondary: '#38bdf8', desc: 'Clean Digital Workspace' },
  { id: 'neon_iris', category: 'tech', name: 'Electric Iris & Fuchsia', primary: '#6366f1', secondary: '#ec4899', desc: 'Next-Gen Apps & Startups' },
  { id: 'deep_ocean', category: 'tech', name: 'Deep Ocean & Cyan', primary: '#0369a1', secondary: '#14b8a6', desc: 'Data Systems & Cloud' },

  // Beauty, Fashion & Lifestyle
  { id: 'crimson_rose', category: 'retail', name: 'Crimson & Rose', primary: '#ce3b3b', secondary: '#fb7185', desc: 'Beauty, Makeover & Salon' },
  { id: 'amethyst_orchid', category: 'retail', name: 'Amethyst & Orchid', primary: '#7c3aed', secondary: '#ec4899', desc: 'Fashion Boutique & Styling' },
  { id: 'coral_amber', category: 'retail', name: 'Coral & Sunset', primary: '#f43f5e', secondary: '#fb923c', desc: 'Cosmetics & Glamour' },
  { id: 'berry_gold', category: 'retail', name: 'Berry & Champagne', primary: '#9333ea', secondary: '#f59e0b', desc: 'Luxury Apparel & Jewelry' },
  { id: 'blush_peach', category: 'retail', name: 'Blush Rose & Peach', primary: '#e11d48', secondary: '#fda4af', desc: 'Skincare & Cosmetics' },
  { id: 'plum_rose', category: 'retail', name: 'Velvet Plum & Rose', primary: '#831843', secondary: '#fb7185', desc: 'Haute Couture & Perfumery' },

  // Commerce, Food & Beverage
  { id: 'emerald_gold', category: 'commerce', name: 'Emerald & Gold', primary: '#059669', secondary: '#f59e0b', desc: 'Growth, Wealth & Trade' },
  { id: 'forest_mint', category: 'commerce', name: 'Forest & Mint', primary: '#047857', secondary: '#34d399', desc: 'Organics & Supermarket' },
  { id: 'copper_tangerine', category: 'commerce', name: 'Copper & Amber', primary: '#ea580c', secondary: '#f59e0b', desc: 'Hardware & Tools' },
  { id: 'royal_coral', category: 'commerce', name: 'Royal & Coral', primary: '#1d4ed8', secondary: '#f97316', desc: 'Energetic Retail & Trade' },
  { id: 'espresso_caramel', category: 'commerce', name: 'Espresso & Caramel', primary: '#78350f', secondary: '#f59e0b', desc: 'Artisan Cafe & Bakery' },
  { id: 'chili_lime', category: 'commerce', name: 'Chili & Lime', primary: '#dc2626', secondary: '#84cc16', desc: 'Restaurant & Food Service' },
  { id: 'navy_sun', category: 'commerce', name: 'Navy & Sunflower', primary: '#1e3a8a', secondary: '#eab308', desc: 'Department Store & Mart' },

  // Health, Medical & Wellness
  { id: 'cyan_emerald', category: 'wellness', name: 'Cyan & Mint', primary: '#0891b2', secondary: '#10b981', desc: 'Pharmacy & Clinic' },
  { id: 'teal_sage', category: 'wellness', name: 'Teal & Sage', primary: '#0f766e', secondary: '#86efac', desc: 'Wellness Spa & Therapeutics' },
  { id: 'cobalt_ice', category: 'wellness', name: 'Cobalt & Ice Blue', primary: '#2563eb', secondary: '#67e8f9', desc: 'Dental & Diagnostics' },
  { id: 'leaf_sun', category: 'wellness', name: 'Leaf Green & Amber', primary: '#16a34a', secondary: '#eab308', desc: 'Nutrition & Herbal Stores' },
  { id: 'lavender_sky', category: 'wellness', name: 'Lavender & Sky', primary: '#7c3aed', secondary: '#38bdf8', desc: 'Physiotherapy & Care' },

  // Creative, Studio & Events
  { id: 'fuchsia_amber', category: 'creative', name: 'Fuchsia & Amber', primary: '#c026d3', secondary: '#f59e0b', desc: 'Creative Agency & Events' },
  { id: 'violet_gold', category: 'creative', name: 'Violet & Gold', primary: '#6d28d9', secondary: '#facc15', desc: 'Media & Production' },
  { id: 'coral_teal', category: 'creative', name: 'Coral & Turquoise', primary: '#ff5a5f', secondary: '#06b6d4', desc: 'Interior Design & Decor' },
  { id: 'magenta_cyan', category: 'creative', name: 'Magenta & Cyan Pop', primary: '#db2777', secondary: '#00f2fe', desc: 'Print & Graphic Studio' },
  { id: 'botanical_poppy', category: 'creative', name: 'Botanical & Poppy', primary: '#15803d', secondary: '#f43f5e', desc: 'Florist & Event Design' },

  // Logistics, Industry & Trade
  { id: 'slate_tangerine', category: 'industrial', name: 'Slate & Tangerine', primary: '#334155', secondary: '#f97316', desc: 'Warehousing & Logistics' },
  { id: 'steel_gold', category: 'industrial', name: 'Steel Blue & Gold', primary: '#1e40af', secondary: '#eab308', desc: 'Freight & Machinery' },
  { id: 'charcoal_emerald', category: 'industrial', name: 'Charcoal & Emerald', primary: '#1f2937', secondary: '#10b981', desc: 'Supply Chain & Cargo' },
  { id: 'iron_flame', category: 'industrial', name: 'Iron & Crimson', primary: '#475569', secondary: '#ef4444', desc: 'Automotive & Industrial' },

  // Executive, Dark & Luxury
  { id: 'obsidian_amber', category: 'luxury', name: 'Obsidian & Gold', primary: '#18181b', secondary: '#eab308', desc: 'Executive Carbon Black' },
  { id: 'midnight_cyan', category: 'luxury', name: 'Midnight & Cyan', primary: '#0f172a', secondary: '#38bdf8', desc: 'Corporate & Consulting' },
  { id: 'slate_emerald', category: 'luxury', name: 'Slate & Emerald', primary: '#1e293b', secondary: '#10b981', desc: 'Private Wealth & Assets' },
  { id: 'monochrome_pearl', category: 'luxury', name: 'Onyx & Pearl', primary: '#09090b', secondary: '#94a3b8', desc: 'Minimalist Prestige' },
  { id: 'bordeaux_gold', category: 'luxury', name: 'Bordeaux & Gold', primary: '#4c0519', secondary: '#f59e0b', desc: 'Fine Dining & Vintage' },
  { id: 'royal_champagne', category: 'luxury', name: 'Royal & Champagne', primary: '#312e81', secondary: '#fbbf24', desc: 'Heritage & High-End' }
];

/**
 * 12 Quick popular swatches for Primary Brand Color
 */
export const PRIMARY_QUICK_SWATCHES = [
  { name: 'Indigo', hex: '#4f46e5' },
  { name: 'Cobalt', hex: '#2563eb' },
  { name: 'Ocean', hex: '#0284c7' },
  { name: 'Teal', hex: '#0d9488' },
  { name: 'Emerald', hex: '#059669' },
  { name: 'Forest', hex: '#15803d' },
  { name: 'Crimson', hex: '#ce3b3b' },
  { name: 'Ruby', hex: '#e11d48' },
  { name: 'Violet', hex: '#7c3aed' },
  { name: 'Purple', hex: '#9333ea' },
  { name: 'Amber', hex: '#d97706' },
  { name: 'Obsidian', hex: '#18181b' }
];

/**
 * 12 Quick popular swatches for Secondary Accent Color
 */
export const SECONDARY_QUICK_SWATCHES = [
  { name: 'Rose', hex: '#fb7185' },
  { name: 'Coral', hex: '#f43f5e' },
  { name: 'Sunset', hex: '#f97316' },
  { name: 'Amber', hex: '#f59e0b' },
  { name: 'Gold', hex: '#eab308' },
  { name: 'Lime', hex: '#84cc16' },
  { name: 'Mint', hex: '#10b981' },
  { name: 'Cyan', hex: '#06b6d4' },
  { name: 'Sky', hex: '#38bdf8' },
  { name: 'Violet', hex: '#8b5cf6' },
  { name: 'Fuchsia', hex: '#d946ef' },
  { name: 'Pink', hex: '#ec4899' }
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
      { name: 'Rose Gold', hex: '#fb7185', reason: 'Warm elegant highlight' },
      { name: 'Emerald Glow', hex: '#10b981', reason: 'Vibrant fresh energy' }
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

  // 4. Triadic Pop (+120 deg)
  const triadicHue = (h + 120) % 360;
  const triadicHex = hslToHex(triadicHue, Math.min(95, s), Math.min(60, Math.max(45, l)));

  return [
    { name: 'Harmonious Flow', hex: analogousHex, reason: 'Seamless analogous gradient' },
    { name: 'Vibrant Contrast', hex: compHex, reason: 'High-energy complementary pop' },
    { name: 'Luminous Glow', hex: popHex, reason: 'Warm energetic highlight' },
    { name: 'Triadic Dynamic', hex: triadicHex, reason: 'Balanced geometric chromatic pop' }
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

