import React from 'react';
import { AlertTriangle, Zap } from 'lucide-react';

interface Props {
  headline: string;
  isUrgent?: boolean;
}

const BreakingNews: React.FC<Props> = ({ headline, isUrgent = false }) => {
  return (
    <div className={`
      relative overflow-hidden rounded-sm mb-4
      ${isUrgent ? 'breaking-gradient' : 'bg-red-600'}
    `}>
      {/* Breaking Badge */}
      <div className="flex items-stretch">
        <div className="bg-black px-3 py-2 flex items-center space-x-2">
          {isUrgent ? (
            <AlertTriangle className="w-4 h-4 text-yellow-400 animate-pulse" />
          ) : (
            <Zap className="w-4 h-4 text-red-500" />
          )}
          <span className="font-headline text-white text-xs uppercase tracking-wider">
            {isUrgent ? 'URGENT' : 'BREAKING'}
          </span>
        </div>
        
        <div className="flex-1 px-4 py-2 flex items-center">
          <p className="font-broadcast text-white text-sm font-bold">
            {headline}
          </p>
        </div>
      </div>
      
      {/* Animated border */}
      {isUrgent && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-400 breaking-flash" />
      )}
    </div>
  );
};

export default BreakingNews;
