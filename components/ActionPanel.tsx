
import React, { useState } from 'react';
import { Choice } from '../types';
import { ChevronRight, MessageSquare, TrendingUp, Send, Terminal, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  choices: Choice[];
  onChoose: (choice: Choice, customText?: string) => void;
  disabled: boolean;
}

const getIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'dialogue': return <MessageSquare className="w-3 h-3" />;
    case 'strategy': return <TrendingUp className="w-3 h-3" />;
    case 'action': default: return <ChevronRight className="w-3 h-3" />;
  }
};

const ActionPanel: React.FC<Props> = ({ choices, onChoose, disabled }) => {
  const [customText, setCustomText] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);

  const handleCustomSubmit = () => {
    if (!customText.trim()) return;
    
    // Create a synthetic choice for the custom input
    const syntheticChoice: Choice = {
        id: 'custom_user_action',
        text: 'Custom Action',
        type: 'action'
    };
    
    onChoose(syntheticChoice, customText);
    setCustomText('');
  };

  return (
    <div className={`
      bg-slate-900 border-t border-slate-800 w-full z-10 shadow-[0_-5px_15px_rgba(0,0,0,0.3)] transition-all duration-300
      ${isMinimized ? 'h-auto' : ''}
    `}>
      <div className="max-w-5xl mx-auto p-2 md:p-3 relative">
        
        {/* Collapse Toggle */}
        <button 
           onClick={() => setIsMinimized(!isMinimized)}
           className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-800 border-b-0 rounded-t-lg px-3 py-0.5 text-slate-400 hover:text-white transition-colors"
        >
            {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {/* Choices Grid - Compact */}
        {!isMinimized && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-2">
            {choices.map((choice) => (
              <button
                key={choice.id}
                onClick={() => {
                    onChoose(choice, customText);
                    setCustomText(''); // Clear after sending
                }}
                disabled={disabled}
                className={`
                  relative group flex items-start space-x-3 px-3 py-2 text-left rounded border transition-all duration-200
                  min-h-[3rem] h-auto
                  ${disabled 
                    ? 'opacity-50 cursor-not-allowed border-slate-800 bg-slate-800' 
                    : 'bg-slate-800 border-slate-700 hover:bg-slate-750 hover:border-emerald-500/50 hover:shadow-sm'
                  }
                `}
              >
                <div className={`
                  flex-shrink-0 p-1 rounded transition-colors mt-0.5
                  ${disabled ? 'text-slate-600' : 'text-emerald-500 group-hover:bg-emerald-500/10 group-hover:text-emerald-400'}
                `}>
                  {getIcon(choice.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <span className={`block text-xs font-bold whitespace-normal break-words leading-snug ${disabled ? 'text-slate-500' : 'text-slate-200 group-hover:text-white'}`}>
                    {choice.text}
                  </span>
                  <span className="text-[9px] text-slate-600 capitalize block leading-none mt-1">
                    {choice.type}
                    {customText.length > 0 && (
                      <span className="ml-1 text-emerald-500/80 font-mono">
                        (+Note)
                      </span>
                    )}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Input Bar - Chat Style */}
        <div className="relative flex items-center gap-2 bg-slate-950 p-1.5 rounded-lg border border-slate-800 focus-within:border-emerald-600/50 transition-colors">
            <div className="pl-2 pr-1 text-slate-600">
                <Terminal className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              disabled={disabled}
              placeholder="Type a custom action or add context to a selection above..."
              className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-600 outline-none h-8 disabled:opacity-50"
              onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                      handleCustomSubmit();
                  }
              }}
            />
            
            <button
              onClick={handleCustomSubmit}
              disabled={disabled || !customText.trim()}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold uppercase tracking-wider transition-colors disabled:opacity-30 disabled:bg-slate-700 flex items-center gap-1"
            >
              <span>Send</span>
              <Send className="w-3 h-3" />
            </button>
        </div>
        
      </div>
    </div>
  );
};

export default ActionPanel;
