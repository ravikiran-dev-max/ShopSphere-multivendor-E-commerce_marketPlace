import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiStar } from 'react-icons/fi';
import api from '../services/api.js';
import Loader from '../components/common/Loader.jsx';

const SellersList = () => {
  const [sellers, setSellers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/sellers')
      .then((res) => setSellers(res.data.data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <Loader fullScreen text="Loading verified sellers..." />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Verified Marketplace Merchants</h1>
        <p className="text-sm text-slate-500">Shop directly from independent verified seller storefronts.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sellers.map((s) => (
          <div key={s._id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center text-xl">
                {s.storeName?.charAt(0) || 'S'}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{s.storeName}</h3>
                <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                  <FiStar className="fill-current text-amber-400" />
                  <span>{s.ratingAverage || 4.8} rating</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-600 line-clamp-2">{s.storeDescription}</p>
            <Link to={`/products?seller=${s.user?._id}`} className="inline-block text-xs font-bold text-indigo-600 hover:underline">
              View Merchant Products ➔
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SellersList;
