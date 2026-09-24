import React from 'react';

/**
 * Interactive OpenStreetMap component for Rider Delivery Navigation
 */
const LeafletMap = ({ latitude = 19.0760, longitude = 72.8777, address = 'Customer Address', recipientName = 'Customer' }) => {
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.015}%2C${latitude - 0.015}%2C${longitude + 0.015}%2C${latitude + 0.015}&layer=mapnik&marker=${latitude}%2C${longitude}`;
  const directionsUrl = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=%2C%3B${latitude}%2C${longitude}`;

  return (
    <div className="space-y-3">
      <div className="relative w-full h-64 rounded-2xl overflow-hidden border border-slate-700 shadow-inner bg-slate-900">
        <iframe
          title="Customer Location Map"
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          marginHeight="0"
          marginWidth="0"
          src={mapUrl}
          className="w-full h-full filter contrast-105"
        ></iframe>

        {/* Map Overlay Badge */}
        <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-xl border border-slate-700/80 shadow-lg flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="font-bold">Destination: {recipientName}</span>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span className="truncate">📍 {address}</span>
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-lg transition-colors shrink-0"
        >
          Open Turn-by-Turn Navigation ↗
        </a>
      </div>
    </div>
  );
};

export default LeafletMap;
