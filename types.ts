export interface GeneratedContent {
  content: string;
  captions: string[];
  hashtags: string[];
  cta?: string;
  alt_version?: string;
  keywords?: string[];
  visual_guide?: string;
  tone_used: string;
}

export type ContentMode = 
  | "general"
  | "travel" 
  | "myth-storytelling" 
  | "tts" 
  | "marketing" 
  | "sales" 
  | "lifestyle";

export type ContentLength = "short" | "medium" | "long";

export type ContentStyle = 
  | "general"
  | "emotional"
  | "cinematic"
  | "conversational"
  | "educational"
  | "mystery"
  | "humor"
  | "motivational";

export interface GenerationRequest {
  topic: string;
  mode: ContentMode;
  style: ContentStyle;
  length: ContentLength;
}

export interface DatabaseItem {
  id: number;
  created_at: string;
  topic: string;
  data: GeneratedContent;
}