import { useState } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import PropertyCard from './PropertyCard';
import { useMode } from '../context/ModeContext';

export default function DiscoveryFeed({ properties }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { colors } = useMode();
  
  const visibleCount = 3;
  const maxIndex = Math.max(0, properties.length - visibleCount);

  const next = () => {
    setCurrentIndex(prev => Math.min(prev + 1, maxIndex));
  };

  const prev = () => {
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  };

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${colors.primaryBg} flex items-center justify-center`}>
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <h2 className="font-luxury text-2xl font-semibold text-slate-800">Discovery Feed</h2>
            <p className="text-sm text-slate-500">Curated picks based on your preferences</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={prev}
            disabled={currentIndex === 0}
            className="w-10 h-10 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={next}
            disabled={currentIndex >= maxIndex}
            className="w-10 h-10 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Swipeable cards */}
      <div className="relative overflow-hidden">
        <div 
          className="flex gap-6 transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentIndex * (100 / visibleCount + 2)}%)` }}
        >
          {properties.map((property) => (
            <div 
              key={property.id} 
              className="w-full md:w-[calc(33.333%-1rem)] flex-shrink-0"
            >
              <PropertyCard property={property} />
            </div>
          ))}
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-2 mt-6">
        {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-2 h-2 rounded-full transition-all ${
              idx === currentIndex 
                ? `w-6 ${colors.primaryBg}` 
                : 'bg-slate-300 hover:bg-slate-400'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
