import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const LegalPage = ({ title, children, lastUpdated = 'September 23, 2025' }) => {
  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto">
      <Link 
     to="/"                          className="flex items-center mb-[30px] space-x-[10px] text-[16px] text-gray-500 hover:text-gray-700"
                             >
                               <ArrowLeft className="w-[24px] h-[24px] text-gray-700 border-[1px] border-gray-300 rounded-[8px] p-[5px]" />
                               <span>Go back to Home</span>
                             </Link>
          <div className="prose prose-indigo max-w-none">
            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              {title}
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              Last updated: {lastUpdated}
            </p>
            
            <div className="mt-8 text-gray-600 space-y-6">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalPage;
