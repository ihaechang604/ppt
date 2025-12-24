import { SlideData } from '../types';

export const saveToSheet = async (scriptUrl: string, slides: SlideData[]) => {
  try {
    const cleanUrl = scriptUrl.trim();
    if (!cleanUrl) throw new Error("URL is empty");

    // Google Apps Script Web App quirks:
    // We use text/plain to avoid CORS preflight (OPTIONS) requests which GAS doesn't handle well.
    const response = await fetch(cleanUrl, {
      method: 'POST',
      body: JSON.stringify(slides),
      headers: {
        'Content-Type': 'text/plain',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    // Check content type to see if we got JSON or HTML (error page)
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("text/html")) {
        throw new Error("ACCESS_DENIED_HTML"); // Received HTML instead of JSON, likely a Google Auth page or 404
    }

    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error("Sheet Save Error:", error);
    
    if (error.message === "ACCESS_DENIED_HTML") {
        throw new Error("구글 시트 접근 권한이 없습니다. 스크립트 배포 설정을 '모든 사용자(Anyone)'로 확인해주세요.");
    }
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      throw new Error("CORS_ERROR");
    }
    throw error;
  }
};

export const loadFromSheet = async (scriptUrl: string): Promise<SlideData[]> => {
  try {
    const cleanUrl = scriptUrl.trim();
    if (!cleanUrl) throw new Error("URL is empty");

    const response = await fetch(cleanUrl);
    
    if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
    }

    // Check content type to see if we got JSON or HTML (error page)
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("text/html")) {
        throw new Error("ACCESS_DENIED_HTML");
    }
    
    const data = await response.json();
    return data as SlideData[];
  } catch (error: any) {
    console.error("Sheet Load Error:", error);
    if (error.message === "ACCESS_DENIED_HTML") {
        throw new Error("구글 시트 접근 권한이 없습니다. 스크립트 배포 설정을 '모든 사용자(Anyone)'로 확인해주세요.");
    }
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      throw new Error("CORS_ERROR");
    }
    throw error;
  }
};