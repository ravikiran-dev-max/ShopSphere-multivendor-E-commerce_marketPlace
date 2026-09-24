import React from 'react';

const Loader = ({ size = 'md', fullScreen = false, text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  const loaderContent = (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div
        className={`${sizeClasses[size]} border-indigo-600 border-t-transparent rounded-full animate-spin`}
      ></div>
      {text && <p className="text-sm font-medium text-slate-600 animate-pulse">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-xs flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 flex items-center justify-center min-w-[180px]">
          {loaderContent}
        </div>
      </div>
    );
  }

  return loaderContent;
};

export default Loader;
