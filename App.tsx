import React, { useState, useRef, useEffect } from 'react';
import { generateSocialContent, generateImage, editImage } from './services/geminiService';
import { GeneratedContentResponse, ImageState, SavedCampaign } from './types';
import PostCard from './components/PostCard';
import ImageEditor from './components/ImageEditor';
import SavedCampaignsModal from './components/SavedCampaignsModal';
import { Sparkles, Bot, Share2, AlertCircle, Loader2, Globe, Bookmark, Save } from 'lucide-react';

const App: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [language, setLanguage] = useState('English');
  const [isGeneratingText, setIsGeneratingText] = useState(false);
  const [content, setContent] = useState<GeneratedContentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Saved Campaigns State
  const [savedCampaigns, setSavedCampaigns] = useState<SavedCampaign[]>([]);
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);

  // Image Modal State
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageState, setImageState] = useState<ImageState>({
    isLoading: false,
    data: null,
    error: null,
    history: []
  });

  const generateRef = useRef<HTMLDivElement>(null);

  // Load saved campaigns from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('nanoSocial_saved_campaigns');
    if (saved) {
      try {
        setSavedCampaigns(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved campaigns", e);
      }
    }
  }, []);

  const handleGenerateContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsGeneratingText(true);
    setError(null);
    setContent(null);

    try {
      const result = await generateSocialContent(topic, language);
      setContent(result);
      // Slight delay to allow DOM render before scroll
      setTimeout(() => {
        generateRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err: any) {
      setError(err.message || "Failed to generate content. Please try again.");
    } finally {
      setIsGeneratingText(false);
    }
  };

  const handleSaveCampaign = () => {
    if (!content || !topic) return;

    const newCampaign: SavedCampaign = {
      id: Date.now().toString(),
      topic,
      language,
      timestamp: Date.now(),
      data: content
    };

    const updatedCampaigns = [newCampaign, ...savedCampaigns];
    setSavedCampaigns(updatedCampaigns);
    localStorage.setItem('nanoSocial_saved_campaigns', JSON.stringify(updatedCampaigns));
    alert('Campaign saved successfully!');
  };

  const handleDeleteCampaign = (id: string) => {
    const updatedCampaigns = savedCampaigns.filter(c => c.id !== id);
    setSavedCampaigns(updatedCampaigns);
    localStorage.setItem('nanoSocial_saved_campaigns', JSON.stringify(updatedCampaigns));
  };

  const handleLoadCampaign = (campaign: SavedCampaign) => {
    setTopic(campaign.topic);
    setLanguage(campaign.language);
    setContent(campaign.data);
    setIsSavedModalOpen(false);
    
    setTimeout(() => {
      generateRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const openImageEditor = async (prompt: string) => {
    setIsImageModalOpen(true);
    setImageState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const base64Img = await generateImage(prompt);
      setImageState({
        isLoading: false,
        data: base64Img,
        error: null,
        history: [base64Img]
      });
    } catch (err: any) {
      setImageState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: err.message || "Failed to generate image." 
      }));
    }
  };

  const handleImageEdit = async (prompt: string) => {
    // If no image exists, treat as fresh generation
    if (!imageState.data) {
        openImageEditor(prompt);
        return;
    }

    setImageState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const newImage = await editImage(imageState.data, prompt);
      setImageState(prev => ({
        isLoading: false,
        data: newImage,
        error: null,
        history: [...prev.history, newImage]
      }));
    } catch (err: any) {
      setImageState(prev => ({
        ...prev,
        isLoading: false,
        error: err.message || "Failed to edit image."
      }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30">
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setContent(null); setTopic(''); }}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Bot className="text-white" size={20} />
            </div>
            <span className="font-bold text-xl tracking-tight">NanoSocial<span className="text-indigo-400">AI</span></span>
          </div>
          <div className="flex items-center gap-3">
             <button 
                onClick={() => setIsSavedModalOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors text-sm text-slate-300"
             >
                <Bookmark size={16} />
                <span className="hidden sm:inline">Saved</span>
             </button>
             <div className="h-4 w-px bg-slate-700 hidden sm:block"></div>
             <span className="hidden sm:inline text-sm text-slate-400">Powered by Gemini 2.5 Flash</span>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hero / Input Section */}
        <section className={`max-w-3xl mx-auto text-center mb-12 transition-all duration-500 ${content ? 'mt-0' : 'mt-10 sm:mt-20'}`}>
          {!content && (
            <>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-indigo-200 mb-6 animate-in slide-in-from-bottom-4 duration-700">
                Social Media Content,<br />Instantly.
              </h1>
              <p className="text-lg text-slate-400 mb-8 leading-relaxed animate-in slide-in-from-bottom-5 duration-700 delay-100">
                Generate tailored posts for Facebook, Instagram, LinkedIn, and more. 
                Create and edit stunning visuals with the power of Nano Banana (Gemini 2.5 Flash Image).
              </p>
            </>
          )}

          <form onSubmit={handleGenerateContent} className="relative group z-10">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative flex items-stretch bg-slate-900 rounded-xl p-2 border border-slate-700 shadow-2xl">
              
              {/* Language Selector */}
              <div className="hidden sm:flex items-center border-r border-slate-700 pr-2 mr-2 pl-2 gap-2">
                <Globe size={18} className="text-slate-400" />
                <select 
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-transparent text-slate-300 text-sm font-medium focus:outline-none border-none py-2 pr-6 cursor-pointer hover:text-white transition-colors"
                  style={{ backgroundImage: 'none' }}
                >
                  <option value="English" className="bg-slate-800">English</option>
                  <option value="Hinglish" className="bg-slate-800">Hinglish</option>
                  <option value="Hindi" className="bg-slate-800">Hindi</option>
                </select>
              </div>

              {/* Mobile Language Selector */}
              <div className="flex sm:hidden items-center border-r border-slate-700 pr-2 mr-2 pl-2">
                 <select 
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-transparent text-slate-300 text-sm font-medium focus:outline-none border-none py-2 appearance-none cursor-pointer"
                  title="Select Language"
                >
                  <option value="English" className="bg-slate-800">EN</option>
                  <option value="Hinglish" className="bg-slate-800">Hin</option>
                  <option value="Hindi" className="bg-slate-800">HI</option>
                </select>
              </div>

              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="What's your topic? (e.g., 'New vegan bakery')"
                className="flex-grow bg-transparent border-none focus:ring-0 text-white placeholder-slate-500 px-2 sm:px-4 text-base sm:text-lg min-w-0"
              />
              <button
                type="submit"
                disabled={isGeneratingText || !topic.trim()}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white px-4 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold transition-all flex items-center gap-2 shrink-0"
              >
                {isGeneratingText ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    <span className="hidden sm:inline">Generate</span>
                    <Sparkles size={18} />
                  </>
                )}
              </button>
            </div>
            <div className="mt-2 text-center sm:text-left flex justify-between items-center px-1">
               <p className="text-xs text-slate-500">Selected Language: <span className="text-indigo-400">{language}</span></p>
            </div>
          </form>

          {error && (
            <div className="mt-6 p-4 bg-red-900/20 border border-red-800 rounded-lg flex items-center gap-3 text-red-200 text-left mx-auto max-w-2xl animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="shrink-0" />
              <p>{error}</p>
            </div>
          )}
        </section>

        {/* Results Section */}
        {content && (
          <div ref={generateRef} className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 border-b border-slate-800 pb-6">
              <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Share2 className="text-indigo-400" />
                    Generated Content
                </h2>
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <span className="bg-slate-800 px-2 py-0.5 rounded text-xs border border-slate-700 font-mono">
                        {topic}
                    </span>
                    <span>•</span>
                    <span className="text-xs">{language}</span>
                </div>
              </div>
              
              <button 
                onClick={handleSaveCampaign}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-600/50 rounded-lg text-sm font-medium transition-all"
              >
                <Save size={16} />
                Save Campaign
              </button>
            </div>

            {/* Creative Brief Highlight */}
            <div className="mb-8 bg-gradient-to-r from-slate-900 to-slate-800 border-l-4 border-indigo-500 p-6 rounded-r-lg shadow-lg">
                <h3 className="text-indigo-400 font-semibold mb-2 uppercase tracking-wide text-xs">Visual Creative Brief</h3>
                <p className="text-slate-300 italic text-lg">"{content.baseCreativeBrief}"</p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {content.posts.map((post) => (
                <PostCard 
                  key={post.platform} 
                  post={post} 
                  onGenerateImage={openImageEditor}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      <ImageEditor 
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        imageState={imageState}
        onEdit={handleImageEdit}
      />

      <SavedCampaignsModal 
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        campaigns={savedCampaigns}
        onLoad={handleLoadCampaign}
        onDelete={handleDeleteCampaign}
      />

      <footer className="border-t border-slate-800 mt-12 py-8 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p>&copy; {new Date().getFullYear()} NanoSocial AI. Powered by Google Gemini.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;