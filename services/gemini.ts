
import { GoogleGenAI } from "@google/genai";
import { GeneratedContent, GenerationRequest } from "../types";

// The persona and rules provided by the user
const SYSTEM_INSTRUCTION_JSON = {
  "system_instruction": "Bạn là công cụ chuyên tạo nội dung hiện đại, đậm tính FOMO và có khả năng viral cao. Khi người dùng cung cấp một chủ đề, bạn sinh ra nội dung tối ưu cho video ngắn, bài viết mạng xã hội, caption hoặc voiceover. Nội dung luôn rõ ràng, giàu hình ảnh, dễ thu hút, phù hợp giao diện web và ứng dụng hiện đại. Tất cả phản hồi phải đúng định dạng JSON.",
  "content_rules": {
    "tone": "modern viral fomo",
    "writing_style": {
      "general": "câu ngắn, nhịp nhanh, giàu hình dung, tạo được sự gấp gáp, kích thích người xem",
    },
    "length_control": {
       "strict_mode": true,
       "note": "AI MUST follow the word count limits strictly defined in the user prompt."
    },
    "structure": {
      "enable": true,
      "types": {
        "hook_first": "bắt đầu bằng câu gây sốc hoặc câu hỏi FOMO",
        "story_style": "tạo cảm giác đang xem một phân đoạn phim",
        "fact_style": "dùng số liệu, facts mạnh để tăng độ tin cậy",
        "question_based": "kích hoạt tò mò bằng câu hỏi ngay dòng đầu"
      }
    },
    "content_components": {
      "must_include": [
        "nội dung chính (content) TUÂN THỦ NGHIÊM NGẶT ĐỘ DÀI",
        "3 caption tối ưu FOMO",
        "bộ hashtag gồm: nhóm chính, nhóm mở rộng và nhóm viral"
      ],
      "optional": {
        "cta": "tạo 1 câu kêu gọi tương tác mạnh",
        "alt_versions": "tạo thêm 1 phiên bản khác với tone khác",
        "keywords": "đề xuất các từ khóa phù hợp SEO và search",
        "visual_guide": "mô tả mood màu, ánh sáng, nhịp dựng video"
      }
    }
  },
  "response_structure": {
    "content": "string (The main body text)",
    "captions": ["string", "string", "string"],
    "hashtags": ["string"],
    "cta": "string_optional",
    "alt_version": "string_optional",
    "keywords": ["string_optional"],
    "visual_guide": "string_optional (Descriptive guide for visuals/video)",
    "tone_used": "modern viral fomo"
  },
  "output_instruction": "Return ONLY JSON. No markdown formatting like ```json."
};

const SYSTEM_PROMPT = JSON.stringify(SYSTEM_INSTRUCTION_JSON);

export const generateViralContent = async (req: GenerationRequest, apiKey: string): Promise<GeneratedContent> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your account settings.");
  }

  // Initialize with the user-provided, decrypted key
  const ai = new GoogleGenAI({ apiKey: apiKey });

  // Define strict length rules to force the model to comply
  const lengthRules = {
    short: "SIÊU NGẮN (Super Short): Tối đa 3 câu. Dưới 100 từ. Cực gắt, đi thẳng vào vấn đề. Phù hợp Reels/TikTok 15s.",
    medium: "VỪA PHẢI (Medium): 2 đoạn văn ngắn. Khoảng 450-500 từ. Đủ ý, có mở đầu hấp dẫn và kết thúc thúc giục. Phù hợp Facebook Post.",
    long: "RẤT CHI TIẾT (Long Script): Dài trên 1000 từ. Chia thành các phần rõ rệt (Hook, 3 luận điểm chính, Kết luận). Kể chuyện chi tiết, đào sâu vấn đề. Phù hợp Blog/Youtube Script."
  };

  const specificRule = lengthRules[req.length] || lengthRules.medium;

  // Constructing a specific prompt based on user selection
  const userPrompt = `
    CHỦ ĐỀ (TOPIC): ${req.topic}
    CHẾ ĐỘ (MODE): ${req.mode}
    PHONG CÁCH (STYLE): ${req.style}
    
    YÊU CẦU ĐỘ DÀI (LENGTH CONSTRAINT): ${specificRule}
    
    Generate viral content now based on these parameters. Ensure the 'content' field matches the length requirement exactly.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        temperature: 0.8, // Slightly creative for viral content
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as GeneratedContent;
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};
