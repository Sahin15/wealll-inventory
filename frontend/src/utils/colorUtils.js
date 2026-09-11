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

/**
 * Generates a complete CSS custom property dictionary for a tenant's primary brand color.
 */
export const generateBrandTheme = (rawBrandColor) => {
  const brandColor = rawBrandColor && /^#([0-9A-F]{3}){1,2}$/i.test(rawBrandColor)
    ? rawBrandColor
    : '#4f46e5';

  const { r, g, b, rgbString } = hexToRgb(brandColor);
  const contrastText = getContrastYIQ(brandColor);
  const isVeryDark = (r * 0.299 + g * 0.587 + b * 0.114) < 40;

  // Generate darker and lighter complementary shades
  const darkShade = isVeryDark ? '#1e293b' : adjustBrightness(brandColor, -35);
  const lightShade = isVeryDark ? '#334155' : adjustBrightness(brandColor, 25);

  // Gradient design: For deep rich dark tones or vibrant hues
  const heroGradient = isVeryDark
    ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 60%, #020617 100%)'
    : `linear-gradient(135deg, ${brandColor} 0%, ${darkShade} 55%, #0f172a 100%)`;

  const glowShadow = isVeryDark
    ? '0 10px 25px -5px rgba(15, 23, 42, 0.4)'
    : `0 10px 25px -5px rgba(${rgbString}, 0.35)`;

  return {
    '--brand-color': brandColor,
    '--brand-text-color': contrastText,
    '--brand-primary': brandColor,
    '--brand-primary-rgb': rgbString,
    '--brand-dark': darkShade,
    '--brand-light': lightShade,
    '--brand-tint': isVeryDark ? 'rgba(255, 255, 255, 0.08)' : `rgba(${rgbString}, 0.08)`,
    '--brand-tint-strong': isVeryDark ? 'rgba(255, 255, 255, 0.15)' : `rgba(${rgbString}, 0.16)`,
    '--brand-border': isVeryDark ? 'rgba(255, 255, 255, 0.18)' : `rgba(${rgbString}, 0.22)`,
    '--brand-glow': glowShadow,
    '--brand-gradient': heroGradient
  };
};

