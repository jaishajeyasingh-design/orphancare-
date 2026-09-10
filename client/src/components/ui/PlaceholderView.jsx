import React from 'react';
import { Layers } from 'lucide-react';

const PlaceholderView = ({ title, description, moduleName }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-6">
        <div className="p-2 bg-primary-50 text-primary-600 rounded-lg">
          <Layers size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">{title}</h2>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
      </div>
      <div className="bg-slate-50 border border-dashed border-slate-300 rounded-lg p-8 text-center">
        <span className="inline-block px-3 py-1 bg-primary-100 text-primary-800 text-xs font-semibold rounded-full mb-3">
          {moduleName || 'OrphanCare AI Module Skeleton'}
        </span>
        <p className="text-slate-600 text-sm max-w-md mx-auto">
          This feature module is architectural structure ready for future incremental development.
        </p>
      </div>
    </div>
  );
};

export default PlaceholderView;
