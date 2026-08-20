import React from 'react';

const Sales = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Sales
        </h2>
        <button className="btn-primary">New Sale</button>
      </div>
      <div className="card p-6">
        <p className="text-gray-500">Sales management coming soon.</p>
      </div>
    </div>
  );
};

export default Sales;
