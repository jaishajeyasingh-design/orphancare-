import React from 'react';
import { Heart, Trophy, Sparkles } from 'lucide-react';

const ImpactWidget = () => {
    return (
        <div className="bg-gradient-to-br from-primary-600 to-purple-700 p-6 rounded-2xl shadow-lg mt-6 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                <Heart size={150} />
            </div>

            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Sparkles size={20} className="text-yellow-300" />
                Our Global Impact
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10 w-full items-stretch">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20 flex flex-col justify-center">
                    <div className="text-primary-100 text-sm font-medium mb-1">Children Sponsored</div>
                    <div className="text-4xl font-extrabold tracking-tight">1,204</div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20 flex flex-col justify-center">
                    <div className="text-primary-100 text-sm font-medium mb-1">Adoptions Completed</div>
                    <div className="text-4xl font-extrabold tracking-tight">48</div>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20 flex flex-col justify-center items-center">
                    <button className="flex items-center justify-center gap-2 bg-white text-primary-700 py-3 px-6 rounded-lg font-bold shadow-sm hover:scale-105 transition-transform w-full sm:w-auto h-full max-h-14">
                        <Trophy size={18} /> View Success Stories
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImpactWidget;
