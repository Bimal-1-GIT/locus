import { Activity, MapPin, Wifi, Sun } from 'lucide-react';
import { useMode } from '../context/ModeContext';

export default function AuraScore({ score, compact = false }) {
  const { colors, isIndigo } = useMode();
  
  const getScoreColor = (value) => {
    if (value >= 90) return 'text-emerald-500';
    if (value >= 75) return 'text-amber-500';
    return 'text-orange-500';
  };

  const getScoreLabel = (value) => {
    if (value >= 90) return 'Excellent';
    if (value >= 75) return 'Good';
    return 'Average';
  };

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${colors.gradient} text-white text-sm font-semibold`}>
        <Activity size={14} />
        <span>{score.overall}</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-slate-800">Aura Score</h4>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${colors.gradient} text-white`}>
          <Activity size={16} />
          <span className="font-bold">{score.overall}</span>
        </div>
      </div>

      <div className="space-y-3">
        {/* Lifestyle */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
            <MapPin size={16} className="text-rose-500" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-slate-600">Lifestyle</span>
              <span className={`text-sm font-semibold ${getScoreColor(score.lifestyle)}`}>
                {score.lifestyle}
              </span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-rose-400 to-rose-500 rounded-full transition-all duration-500"
                style={{ width: `${score.lifestyle}%` }}
              />
            </div>
          </div>
        </div>

        {/* Connectivity */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <Wifi size={16} className="text-blue-500" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-slate-600">Connectivity</span>
              <span className={`text-sm font-semibold ${getScoreColor(score.connectivity)}`}>
                {score.connectivity}
              </span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${score.connectivity}%` }}
              />
            </div>
          </div>
        </div>

        {/* Environment */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
            <Sun size={16} className="text-amber-500" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-slate-600">Environment</span>
              <span className={`text-sm font-semibold ${getScoreColor(score.environment)}`}>
                {score.environment}
              </span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${score.environment}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <p className="mt-4 text-xs text-slate-400 text-center">
        {getScoreLabel(score.overall)} match for your preferences
      </p>
    </div>
  );
}
