import React, { useState } from 'react';
import { SocialPost, Platform } from '../types';
import { Copy, Image as ImageIcon, Check, Share2 } from 'lucide-react';

interface PostCardProps {
  post: SocialPost;
  onGenerateImage: (prompt: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onGenerateImage }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(post.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `NanoSocial Post for ${post.platform}`,
          text: post.content,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      handleCopy();
      alert("Sharing is not supported on this browser/device. Text copied to clipboard instead.");
    }
  };

  const getPlatformIcon = (platform: Platform) => {
    switch (platform) {
      case Platform.Facebook: return "text-blue-500";
      case Platform.Twitter: return "text-sky-400";
      case Platform.Instagram: return "text-pink-500";
      case Platform.LinkedIn: return "text-blue-700";
      case Platform.WhatsApp: return "text-green-500";
      case Platform.GoogleBusiness: return "text-red-500";
      default: return "text-gray-400";
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 flex flex-col gap-4 shadow-lg hover:border-slate-600 transition-colors">
      <div className="flex justify-between items-center border-b border-slate-700 pb-4">
        <h3 className={`font-bold text-lg flex items-center gap-2 ${getPlatformIcon(post.platform)}`}>
           {post.platform}
        </h3>
        <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Generated</span>
      </div>

      <div className="flex-grow">
        <p className="text-slate-200 whitespace-pre-wrap leading-relaxed">{post.content}</p>
      </div>

      <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
        <p className="text-xs text-slate-400 italic">
          <span className="font-semibold text-slate-300 not-italic">Strategy: </span>
          {post.rationale}
        </p>
      </div>

      <div className="flex gap-2 mt-2 pt-4 border-t border-slate-700">
        <button
          onClick={handleCopy}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-all text-slate-200"
          title="Copy Text"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>
        <button
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-all text-slate-200"
          title="Share Post"
        >
          <Share2 size={16} />
        </button>
        <button
          onClick={() => onGenerateImage(post.imagePromptSuggestion)}
          className="flex-[2] flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-all"
        >
          <ImageIcon size={16} />
          Visualize
        </button>
      </div>
    </div>
  );
};

export default PostCard;