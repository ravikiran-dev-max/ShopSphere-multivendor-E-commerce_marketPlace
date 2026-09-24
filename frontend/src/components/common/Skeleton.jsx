import React from 'react';

const Skeleton = ({ className = '', count = 1 }) => {
  const skeletons = Array.from({ length: count });

  return (
    <>
      {skeletons.map((_, index) => (
        <div
          key={index}
          className={`animate-pulse bg-slate-200 rounded-lg ${className}`}
        />
      ))}
    </>
  );
};

export default Skeleton;
