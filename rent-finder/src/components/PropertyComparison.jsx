import { useState } from 'react';
import { X, Plus, Scale, Bed, Bath, Square, MapPin, Check, Minus } from 'lucide-react';
import { useMode } from '../context/ModeContext';
import AuraScore from './AuraScore';

export default function PropertyComparison({ properties, selectedIds, onRemove, onAdd }) {
  const { colors } = useMode();
  const selectedProperties = properties.filter(p => selectedIds.includes(p.id));
  const maxCompare = 3;

  const formatPrice = (price, priceType) => {
    if (priceType === 'month') {
      return `$${price.toLocaleString()}/mo`;
    }
    return `$${(price / 1000000).toFixed(2)}M`;
  };

  const getBestValue = (key) => {
    if (selectedProperties.length < 2) return null;
    const values = selectedProperties.map(p => {
      if (key === 'price') return p.price;
      if (key === 'sqft') return p.sqft;
      if (key === 'auraScore') return p.auraScore.overall;
      return 0;
    });
    
    // For price, lower is better; for others, higher is better
    if (key === 'price') {
      const min = Math.min(...values);
      return selectedProperties.find(p => p.price === min)?.id;
    }
    const max = Math.max(...values);
    if (key === 'sqft') return selectedProperties.find(p => p.sqft === max)?.id;
    if (key === 'auraScore') return selectedProperties.find(p => p.auraScore.overall === max)?.id;
    return null;
  };

  if (selectedIds.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 text-center">
        <Scale size={48} className="mx-auto text-slate-300 mb-4" />
        <h3 className="font-luxury text-xl font-semibold text-slate-800 mb-2">
          Compare Properties
        </h3>
        <p className="text-slate-500 mb-4">
          Select up to {maxCompare} properties to compare them side by side
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Scale size={20} className={colors.primaryText} />
          <h3 className="font-luxury text-lg font-semibold text-slate-800">
            Comparing {selectedIds.length} {selectedIds.length === 1 ? 'Property' : 'Properties'}
          </h3>
        </div>
        {selectedIds.length < maxCompare && (
          <button
            onClick={onAdd}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${colors.primaryBgLight} ${colors.primaryText} text-sm font-medium hover:opacity-80 transition-opacity`}
          >
            <Plus size={16} />
            Add Property
          </button>
        )}
      </div>

      {/* Comparison Grid */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-500 w-40">
                Property
              </th>
              {selectedProperties.map((property) => (
                <th key={property.id} className="px-4 py-4 min-w-[250px]">
                  <div className="relative">
                    <button
                      onClick={() => onRemove(property.id)}
                      className="absolute -top-1 -right-1 w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors"
                    >
                      <X size={14} />
                    </button>
                    <img
                      src={property.image}
                      alt={property.title}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                    <h4 className="font-medium text-slate-800 text-sm line-clamp-1">
                      {property.title}
                    </h4>
                  </div>
                </th>
              ))}
              {/* Empty slots */}
              {Array.from({ length: maxCompare - selectedIds.length }).map((_, idx) => (
                <th key={`empty-${idx}`} className="px-4 py-4 min-w-[250px]">
                  <button
                    onClick={onAdd}
                    className="w-full h-32 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center hover:border-slate-300 transition-colors"
                  >
                    <Plus size={24} className="text-slate-400" />
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Price */}
            <tr className="border-b border-slate-50">
              <td className="px-6 py-4 text-sm text-slate-600">Price</td>
              {selectedProperties.map((property) => (
                <td key={property.id} className="px-4 py-4 text-center">
                  <span className={`font-semibold ${getBestValue('price') === property.id ? 'text-emerald-600' : 'text-slate-800'}`}>
                    {formatPrice(property.price, property.priceType)}
                    {getBestValue('price') === property.id && (
                      <span className="ml-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Best</span>
                    )}
                  </span>
                </td>
              ))}
              {Array.from({ length: maxCompare - selectedIds.length }).map((_, idx) => (
                <td key={`empty-${idx}`} className="px-4 py-4 text-center text-slate-300">—</td>
              ))}
            </tr>

            {/* Bedrooms */}
            <tr className="border-b border-slate-50">
              <td className="px-6 py-4 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Bed size={16} />
                  Bedrooms
                </div>
              </td>
              {selectedProperties.map((property) => (
                <td key={property.id} className="px-4 py-4 text-center text-slate-800">
                  {property.bedrooms === 0 ? 'Studio' : property.bedrooms}
                </td>
              ))}
              {Array.from({ length: maxCompare - selectedIds.length }).map((_, idx) => (
                <td key={`empty-${idx}`} className="px-4 py-4 text-center text-slate-300">—</td>
              ))}
            </tr>

            {/* Bathrooms */}
            <tr className="border-b border-slate-50">
              <td className="px-6 py-4 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Bath size={16} />
                  Bathrooms
                </div>
              </td>
              {selectedProperties.map((property) => (
                <td key={property.id} className="px-4 py-4 text-center text-slate-800">
                  {property.bathrooms}
                </td>
              ))}
              {Array.from({ length: maxCompare - selectedIds.length }).map((_, idx) => (
                <td key={`empty-${idx}`} className="px-4 py-4 text-center text-slate-300">—</td>
              ))}
            </tr>

            {/* Square Feet */}
            <tr className="border-b border-slate-50">
              <td className="px-6 py-4 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Square size={16} />
                  Sq. Ft.
                </div>
              </td>
              {selectedProperties.map((property) => (
                <td key={property.id} className="px-4 py-4 text-center">
                  <span className={getBestValue('sqft') === property.id ? 'text-emerald-600 font-medium' : 'text-slate-800'}>
                    {property.sqft.toLocaleString()}
                    {getBestValue('sqft') === property.id && (
                      <span className="ml-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Largest</span>
                    )}
                  </span>
                </td>
              ))}
              {Array.from({ length: maxCompare - selectedIds.length }).map((_, idx) => (
                <td key={`empty-${idx}`} className="px-4 py-4 text-center text-slate-300">—</td>
              ))}
            </tr>

            {/* Location */}
            <tr className="border-b border-slate-50">
              <td className="px-6 py-4 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <MapPin size={16} />
                  Location
                </div>
              </td>
              {selectedProperties.map((property) => (
                <td key={property.id} className="px-4 py-4 text-center text-sm text-slate-600">
                  {property.city}
                </td>
              ))}
              {Array.from({ length: maxCompare - selectedIds.length }).map((_, idx) => (
                <td key={`empty-${idx}`} className="px-4 py-4 text-center text-slate-300">—</td>
              ))}
            </tr>

            {/* Aura Score */}
            <tr className="border-b border-slate-50">
              <td className="px-6 py-4 text-sm text-slate-600">Aura Score</td>
              {selectedProperties.map((property) => (
                <td key={property.id} className="px-4 py-4">
                  <div className="flex justify-center">
                    <AuraScore score={property.auraScore} compact />
                    {getBestValue('auraScore') === property.id && (
                      <span className="ml-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Top Rated</span>
                    )}
                  </div>
                </td>
              ))}
              {Array.from({ length: maxCompare - selectedIds.length }).map((_, idx) => (
                <td key={`empty-${idx}`} className="px-4 py-4 text-center text-slate-300">—</td>
              ))}
            </tr>

            {/* Features */}
            <tr>
              <td className="px-6 py-4 text-sm text-slate-600 align-top">Features</td>
              {selectedProperties.map((property) => (
                <td key={property.id} className="px-4 py-4">
                  <div className="flex flex-wrap justify-center gap-1">
                    {property.features.slice(0, 5).map((feature, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </td>
              ))}
              {Array.from({ length: maxCompare - selectedIds.length }).map((_, idx) => (
                <td key={`empty-${idx}`} className="px-4 py-4 text-center text-slate-300">—</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
