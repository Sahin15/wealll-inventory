export const getContrastYIQ = (hexcolor) => {
  if (!hexcolor) return '#ffffff';
  
  // Remove hash if exists
  hexcolor = hexcolor.replace('#', '');
  
  // Parse RGB
  let r = parseInt(hexcolor.substr(0, 2), 16);
  let g = parseInt(hexcolor.substr(2, 2), 16);
  let b = parseInt(hexcolor.substr(4, 2), 16);
  
  // Calculate YIQ ratio
  let yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  
  // Check contrast
  return (yiq >= 128) ? '#000000' : '#ffffff';
};
