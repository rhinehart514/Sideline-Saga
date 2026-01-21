import React, { useState } from 'react';
import { Choice } from '../types';
import { ChevronRight, MessageSquare, TrendingUp, Send, Gamepad2 } from 'lucide-react';

interface Props {
  choices: Choice[];
  onChoose: (choice: Choice, customText?: string) => void;
  disabled: boolean;
}

const getIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'dialogue': return <MessageSquare className="w-5 h-5" />;
    case 'strategy': return <TrendingUp className="w-5 h-5" />;
    case 'action': default: return <ChevronRight className="w-5 h-5" />;
  }
};

const getTypeColor = (type: string) => {
  switch (type.toLowerCase()) {
    case 'dialogue': return 'border-blue-600 hover:bg-blue-600';
    case 'strategy': return 'border-yellow-600 hover:bg-yellow-600';
    case 'action': default: return 'border-red-600 hover:bg-red-600';
  }
};

const ActionPanel: React.FC<Props> = ({ choices, onChoose, disabled }) => {
  const [customText, setCustomText] = useState('');

  const handleCustomSubmit = () => {
    if (!customText.trim()) return;
    
    const syntheticChoice: Choice = {
      id: 'custom_user_action',
      text: 'Custom Action',
      type: 'action'
    };
    
    onChoose(syntheticChoice, customText);
    setCustomText('');
  };

  return (
    <div className="bg-zinc-950 border-t-2 border-red-600 px-6 py-8 md:px-10 md:py-10">
      
      {/* Custom Action Input - Apple: generous spacing */}
      <div className="mb-10 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Gamepad2 className="w-5 h-5 text-red-500" />
            <span className="font-headline text-sm text-zinc-400 uppercase tracking-wider">Coach's Call</span>
          </div>
          <span className="font-broadcast text-xs text-zinc-600">
            Type custom action or select below
          </span>
        </div>
        
        <div className="relative flex gap-4">
          <textarea
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            disabled={disabled}
            placeholder="Type your own move (e.g., 'Call a players-only meeting', 'Bench the starting QB')..."
            className="flex-1 bg-zinc-900/50 border-2 border-zinc-800/50 focus:border-red-600/50 rounded-xl px-6 py-5 font-broadcast text-base text-zinc-200 placeholder-zinc-600 outline-none resize-none h-28 transition-all duration-200 disabled:opacity-50"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) {
                handleCustomSubmit();
              }
            }}
          />
          
          <button
            onClick={handleCustomSubmit}
            disabled={disabled || !customText.trim()}
            className="w-24 bg-red-600 hover:bg-red-500 disabled:bg-zinc-800 border-2 border-red-600 disabled:border-zinc-700 text-white disabled:text-zinc-600 rounded-xl flex flex-col items-center justify-center transition-all duration-200 shadow-lg hover:shadow-red-600/25 disabled:shadow-none"
            title="Execute Custom Action (Ctrl+Enter)"
          >
            <Send className="w-5 h-5 mb-2" />
            <span className="font-headline text-xs uppercase">Send</span>
          </button>
        </div>
      </div>

      {/* Suggested Decisions Header - Apple: clear separation */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-1.5 h-6 bg-red-600 rounded-full"></div>
        <span className="font-headline text-sm text-zinc-400 uppercase tracking-wider">Suggested Plays</span>
      </div>
      
      {/* Decision Grid - Apple: larger cards, more padding */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {choices.map((choice) => (
          <button
            key={choice.id}
            onClick={() => {
              onChoose(choice, customText);
              setCustomText('');
            }}
            disabled={disabled}
            className={`
              relative group flex items-start space-x-4 p-6 text-left rounded-xl 
              bg-zinc-900/50 border-l-4 transition-all duration-200
              ${disabled 
                ? 'opacity-50 cursor-not-allowed border-zinc-700' 
                : `${getTypeColor(choice.type)} hover:text-white`
              }
            `}
          >
            {/* Icon */}
            <div className={`
              mt-0.5 p-3 rounded-xl bg-zinc-800/50 transition-colors
              ${disabled ? 'text-zinc-600' : 'text-zinc-400 group-hover:bg-white/10 group-hover:text-white'}
            `}>
              {getIcon(choice.type)}
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <span className={`
                block font-broadcast font-bold text-base leading-relaxed
                ${disabled ? 'text-zinc-500' : 'text-zinc-200 group-hover:text-white'}
              `}>
                {choice.text}
              </span>
              <div className="flex items-center mt-2 space-x-3">
                <span className="font-headline text-xs text-zinc-600 uppercase">
                  {choice.type}
                </span>
                {customText.length > 0 && (
                  <span className="font-broadcast text-xs text-yellow-500 border border-yellow-500/50 rounded-full px-2.5 py-1">
                    + Note
                  </span>
                )}
              </div>
            </div>
            
            {/* Arrow */}
            <ChevronRight className={`
              w-6 h-6 transition-transform flex-shrink-0
              ${disabled ? 'text-zinc-700' : 'text-zinc-600 group-hover:text-white group-hover:translate-x-1'}
            `} />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ActionPanel;
