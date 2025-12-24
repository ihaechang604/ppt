import { GoogleGenAI, Type } from "@google/genai";
import { SlideData, SlideType } from '../types';

const getAIInstance = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateSlideContent = async (
  currentContent: string,
  sectionTitle: string,
  context: string = ''
): Promise<string> => {
  if (!process.env.API_KEY) return "API Key is missing.";

  const ai = getAIInstance();
  const model = 'gemini-3-flash-preview';
  
  const prompt = `
    당신은 전문 프레젠테이션 디자이너입니다.
    섹션 제목: "${sectionTitle}"
    현재 내용: "${currentContent}"
    추가 맥락: "${context}"
    
    위 내용을 바탕으로 발표용 슬라이드에 들어갈 간결하고 전문적인 문장들을 생성하세요.
    - 한국어로 작성하세요.
    - 불필요한 서술어는 생략하고 핵심 위주로 작성하세요.
    - 줄바꿈으로 각 항목을 구분하세요. (최대 4개 항목)
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text || "내용을 생성할 수 없습니다.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "오류가 발생했습니다.";
  }
};

export const generateNewSlideFromTopic = async (topic: string, instruction: string = ""): Promise<SlideData | null> => {
  if (!process.env.API_KEY) return null;

  const ai = getAIInstance();
  const model = 'gemini-3-flash-preview';
  
  const prompt = `
    사용자의 요구사항에 맞춰 최적화된 프레젠테이션 슬라이드 1개를 생성하세요.
    주제: "${topic}"
    추가 요구사항: "${instruction}"
    
    [레이아웃 선택 가이드]
    - TITLE: 제목 슬라이드, 프로젝트 시작
    - CONTENT_LIST: 일반적인 목록 설명
    - TWO_COLUMN: 비교, 대조, 혹은 두 영역으로 나눌 때
    - GRID_FOUR: 4가지 핵심 요소, SWOT 분석 등
    - QUOTE: 명언, 강조 문구, 핵심 비전
    
    반드시 다음 JSON 형식으로 응답하세요:
    {
      "type": "TITLE" | "CONTENT_LIST" | "TWO_COLUMN" | "GRID_FOUR" | "QUOTE",
      "title": "슬라이드 제목",
      "subtitle": "부제목 또는 설명",
      "content": ["항목1", "항목2", ...]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, enum: ["TITLE", "CONTENT_LIST", "TWO_COLUMN", "GRID_FOUR", "QUOTE"] },
            title: { type: Type.STRING },
            subtitle: { type: Type.STRING },
            content: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["type", "title", "content"]
        }
      }
    });
    
    const data = JSON.parse(response.text || "{}");
    return { ...data, id: Date.now().toString() };
  } catch (error) {
    console.error("Failed to generate slide:", error);
    return null;
  }
};