import React, { useState } from 'react';
import { Choice } from '../types';
import { ChevronRight, MessageSquare, TrendingUp, PenLine, Send, Terminal } from 'lucide-react';

interface Props {
  choices: Choice[];
  onChoose: (choice: Choice, customText?: string) => void;
  disabled: boolean;
}

const getIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'dialogue': return <MessageSquare className="w-4 h-4" />;
    case 'strategy': return <TrendingUp className="w-4 h-4" />;
    case 'action': default: return <ChevronRight className="w-4 h-4" />;
  }
};

const ActionPanel: React.FC<Props> = ({ choices, onChoose, disabled }) => {
  const [customText, setCustomText] = useState('');

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
    <div className="bg-slate-900 border-t border-slate-700 p-4 md:p-6 pb-8">
      
      {/* Input Area - Now allows independent submission */}
      <div className="mb-6 animate-fade-in">
        <label className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
          <div className="flex items-center space-x-2">
            <Terminal className="w-3 h-3 text-emerald-500" />
            <span>Coach's Console</span>
          </div>
          <span className="text-[10px] text-slate-600">Type a custom action or add notes to a choice below</span>
        </label>
        
        <div className="relative flex gap-2">
          <textarea
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            disabled={disabled}
            placeholder="Type your own move here (e.g., 'Call a players-only meeting', 'Bench the starting QB', 'Leap onto the table')..."
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 placeholder-slate-600 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500/50 outline-none resize-none h-20 transition-colors disabled:opacity-50"
            onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                    handleCustomSubmit();
                }
            }}
          />
          
          {/* Submit Custom Action Button */}
          <button
            onClick={handleCustomSubmit}
            disabled={disabled || !customText.trim()}
            className="w-20 bg-emerald-600/20 border border-emerald-600/50 hover:bg-emerald-600 hover:text-white text-emerald-500 rounded-lg flex flex-col items-center justify-center transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-emerald-500"
            title="Execute Custom Action"
          >
            <Send className="w-4 h-4 mb-1" />
            <span className="text-[10px] font-bold uppercase">Send</span>
          </button>
        </div>
      </div>

      <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-4">Suggested Decisions</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {choices.map((choice) => (
          <button
            key={choice.id}
            onClick={() => {
                onChoose(choice, customText);
                setCustomText(''); // Clear after sending
            }}
            disabled={disabled}
            className={`
              relative group flex items-start space-x-3 p-4 text-left rounded-lg border transition-all duration-200
              ${disabled 
                ? 'opacity-50 cursor-not-allowed border-slate-800 bg-slate-800' 
                : 'bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-emerald-500/50 hover:shadow-md hover:-translate-y-0.5'
              }
            `}
          >
            <div className={`
              mt-0.5 p-1.5 rounded-md transition-colors
              ${disabled ? 'bg-slate-700 text-slate-500' : 'bg-slate-900 text-emerald-500 group-hover:bg-emerald-500/10 group-hover:text-emerald-400'}
            `}>
              {getIcon(choice.type)}
            </div>
            <div className="flex-1">
              <span className={`block font-medium ${disabled ? 'text-slate-500' : 'text-slate-200 group-hover:text-white'}`}>
                {choice.text}
              </span>
              <span className="text-xs text-slate-500 capitalize mt-1 block flex items-center">
                {choice.type}
                {customText.length > 0 && (
                   <span className="ml-2 text-emerald-500/80 text-[10px] font-mono border border-emerald-500/30 rounded px-1">
                     + Note Attached
                   </span>
                )}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ActionPanel;