import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button.jsx';
import { FiHome } from 'react-icons/fi';

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center space-y-4 px-4">
      <h1 className="text-8xl font-black text-indigo-600 tracking-tighter">404</h1>
      <h2 className="text-2xl font-bold text-slate-900">Page Not Found</h2>
      <p className="text-slate-500 max-w-md">
        The marketplace page or resource you are looking for might have been removed, renamed, or is temporarily unavailable.
      </p>
      <Link to="/" className="pt-2">
        <Button variant="primary" icon={FiHome}>
          Back to Homepage
        </Button>
      </Link>
    </div>
  );
};

export default NotFound;
