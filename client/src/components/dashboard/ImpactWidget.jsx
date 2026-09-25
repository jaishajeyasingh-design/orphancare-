import React from 'react';
import { Heart, Trophy, Sparkles } from 'lucide-react';

const ImpactWidget = () => {
    return (
        <div className="bg-gradient-to-r from-blue-50/90 to-purple-50/90 p-4.5 rounded-xl border border-[#E2E8F0] shadow-2xs text-[#0F172A] overflow-hidden relative">
            <div className="absolute top-0 right-0 opacity-5 transform translate-x-1/4 -translate-y-1/4 pointer-events-none">
                <Heart size={150} />
            </div>

            <h2 className="text-base font-bold mb-3 flex items-center gap-2 text-[#0F172A]">
                <Sparkles size={18} className="text-[#8B5CF6]" />
                Our Global Impact
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10 w-full items-stretch">
                <div className="bg-white p-3.5 rounded-lg border border-[#E2E8F0] shadow-2xs flex flex-col justify-center">
                    <div className="text-[#64748B] text-xs font-medium mb-0.5">Children Sponsored</div>
                    <div className="text-2xl font-bold tracking-tight text-[#2563EB]">1,204</div>
                </div>
                
                <div className="bg-white p-3.5 rounded-lg border border-[#E2E8F0] shadow-2xs flex flex-col justify-center">
                    <div className="text-[#64748B] text-xs font-medium mb-0.5">Adoptions Completed</div>
                    <div className="text-2xl font-bold tracking-tight text-[#10B981]">48</div>
                </div>

                <div className="bg-white p-3.5 rounded-lg border border-[#E2E8F0] shadow-2xs flex flex-col justify-center items-center">
                    <button className="flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-[#1d4ed8] text-white py-2 px-4 rounded-lg text-xs font-bold transition-colors w-full h-full">
                        <Trophy size={16} /> View Success Stories
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImpactWidget;
