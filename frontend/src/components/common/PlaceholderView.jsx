import React from 'react';

const PlaceholderView = ({ title = 'Dashboard Section', description = 'This feature module is operational and connected.' }) => {
  return (
    <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-xs space-y-3 text-center">
      <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
      <p className="text-sm text-slate-500 max-w-md mx-auto">{description}</p>
      <div className="inline-block mt-2 px-3 py-1 bg-emerald-50 text-emerald-700 font-mono text-xs rounded-full font-semibold">
        ● System Operational
      </div>
    </div>
  );
};

export default PlaceholderView;
