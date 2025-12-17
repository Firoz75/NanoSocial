import React from 'react';
import { X, Calendar, Trash2, ArrowRight, Bookmark } from 'lucide-react';
import { SavedCampaign } from '../types';

interface SavedCampaignsModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaigns: SavedCampaign[];
  onLoad: (campaign: SavedCampaign) => void;
  onDelete: (id: string) => void;
}

const SavedCampaignsModal: React.FC<SavedCampaignsModalProps> = ({ 
  isOpen, 
  onClose, 
  campaigns, 
  onLoad, 
  onDelete 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 w-full max-w-2xl rounded-2xl border border-slate-700 shadow-2xl flex flex-col max-h-[80vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800 rounded-t-2xl">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Bookmark className="text-indigo-400" />
            Saved Campaigns
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* List */}
        <div className="flex-grow overflow-auto p-4 space-y-3">
          {campaigns.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Bookmark size={48} className="mx-auto mb-4 opacity-20" />
              <p>No saved campaigns yet.</p>
            </div>
          ) : (
            campaigns.map((campaign) => (
              <div 
                key={campaign.id} 
                className="bg-slate-800/50 border border-slate-700 hover:border-indigo-500/50 rounded-xl p-4 transition-all group"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-white text-lg truncate pr-4">{campaign.topic}</h3>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => onLoad(campaign)}
                      className="text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors"
                    >
                      Load <ArrowRight size={14} />
                    </button>
                    <button 
                      onClick={() => onDelete(campaign.id)}
                      className="text-slate-500 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(campaign.timestamp).toLocaleDateString()}
                  </span>
                  <span className="bg-slate-700 px-2 py-0.5 rounded text-slate-300">
                    {campaign.language}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 bg-slate-800 rounded-b-2xl">
          <button 
            onClick={onClose}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2.5 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SavedCampaignsModal;