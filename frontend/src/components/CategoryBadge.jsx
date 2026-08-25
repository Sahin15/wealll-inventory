import React from 'react';
import { getContrastYIQ } from '../utils/colorUtils';

const CategoryBadge = ({ category }) => {
  if (!category) return null;
  const name = typeof category === 'string' ? category : category.name;
  const color = typeof category === 'string' ? '#e5e7eb' : (category.color || '#e5e7eb');
  
  const textColor = getContrastYIQ(color);
  
  return (
    <span 
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border shadow-sm"
      style={{ backgroundColor: color, color: textColor, borderColor: 'rgba(0,0,0,0.1)' }}
    >
      {name}
    </span>
  );
};

export default CategoryBadge;
