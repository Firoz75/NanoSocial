import React, { useState } from 'react';
import { Loader2, Wand2, X, Download, Send } from 'lucide-react';
import { ImageState } from '../types';

interface ImageEditorProps {
  isOpen: boolean;
  onClose: () => void;
  imageState: ImageState;
  onEdit: (prompt: string) => void;
  initialPrompt?: string;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ isOpen, onClose, imageState, onEdit, initialPrompt }) => {
  const [editPrompt, setEditPrompt] = useState('');

  if (!isOpen) return null;

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editPrompt.trim()) {
      onEdit(editPrompt);
      setEditPrompt('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 w-full max-w-4xl rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Wand2 className="text-indigo-400" />
            Image Studio
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-auto p-6 flex flex-col items-center justify-center bg-slate-950 relative">
            {imageState.isLoading ? (
                <div className="flex flex-col items-center gap-4 animate-pulse">
                    <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-indigo-400 font-medium">Processing with Nano Banana...</p>
                </div>
            ) : imageState.data ? (
                <div className="relative group w-full h-full flex items-center justify-center">
                    <img 
                        src={imageState.data} 
                        alt="Generated" 
                        className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-lg border border-slate-800"
                    />
                    <a 
                        href={imageState.data} 
                        download="nano-social-image.png"
                        className="absolute bottom-4 right-4 bg-slate-900/80 hover:bg-black text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md border border-slate-700"
                        title="Download Image"
                    >
                        <Download size={20} />
                    </a>
                </div>
            ) : (
                <div className="text-center text-slate-500 max-w-md">
                    <Wand2 size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No image generated yet. Select a post to visualize it.</p>
                </div>
            )}
             {imageState.error && (
                <div className="absolute bottom-6 left-6 right-6 bg-red-900/90 text-red-100 p-4 rounded-lg border border-red-700">
                    <p className="font-semibold">Error:</p>
                    <p className="text-sm">{imageState.error}</p>
                </div>
            )}
        </div>

        {/* Footer / Controls */}
        <div className="p-4 bg-slate-800 border-t border-slate-700">
            <form onSubmit={handleEditSubmit} className="flex gap-2">
                <input
                    type="text"
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    placeholder={imageState.data ? "Describe changes (e.g., 'Add a retro filter', 'Make it cyberpunk')" : "Enter a prompt to generate..."}
                    className="flex-grow bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={imageState.isLoading}
                />
                <button 
                    type="submit" 
                    disabled={imageState.isLoading || !editPrompt.trim()}
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 rounded-lg font-medium flex items-center gap-2 transition-colors"
                >
                    {imageState.data ? 'Edit' : 'Generate'}
                    <Send size={18} />
                </button>
            </form>
            <p className="text-xs text-slate-500 mt-2 ml-1">
                Powered by Gemini 2.5 Flash Image. {imageState.data ? 'Describe edits naturally.' : 'Describe the image you want.'}
            </p>
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;
