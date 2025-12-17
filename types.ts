export enum Platform {
  Facebook = 'Facebook',
  Instagram = 'Instagram',
  LinkedIn = 'LinkedIn',
  Twitter = 'Twitter',
  WhatsApp = 'WhatsApp',
  GoogleBusiness = 'Google Business Profile'
}

export interface SocialPost {
  platform: Platform;
  content: string;
  rationale: string;
  imagePromptSuggestion: string;
}

export interface GeneratedContentResponse {
  posts: SocialPost[];
  baseCreativeBrief: string;
}

export interface ImageState {
  isLoading: boolean;
  data: string | null; // Base64 string
  error: string | null;
  history: string[]; // To implement undo/redo if needed, or just track edits
  currentHistoryIndex: number; // For undo/redo tracking
}

export interface SavedCampaign {
  id: string;
  topic: string;
  language: string;
  timestamp: number;
  data: GeneratedContentResponse;
}