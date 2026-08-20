import React from 'react';

const Purchases = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Purchases
        </h2>
        <button className="btn-primary">New Purchase</button>
      </div>
      <div className="card p-6">
        <p className="text-gray-500">Purchases management coming soon.</p>
      </div>
    </div>
  );
};

export default Purchases;
