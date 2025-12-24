import React, { useState, useEffect, useCallback, useRef } from 'react';
import { INITIAL_SLIDES, SlideData, SlideType } from './types';
import Background from './components/Background';
import SlideRenderer from './components/SlideRenderer';
import EditorPanel from './components/EditorPanel';
import { 
  Presentation, Edit3, MonitorPlay, CheckCircle, X, Plus, Sparkles, Loader2,
  Undo2, Redo2, Trash2, ArrowUp, ArrowDown, AlertCircle,
  Settings, Copy, Check, LogIn, Laptop, ChevronLeft, ChevronRight, Share2, Link, RefreshCw, HelpCircle, BookOpen
} from 'lucide-react';
import { saveToSheet, loadFromSheet } from './services/sheetService';

const STORAGE_KEY = 'limeflow_presentation_data_v9_sky_gradient';
const SHEET_URL_KEY = 'limeflow_sheet_url';
const DEFAULT_SHEET_URL = "https://script.google.com/macros/s/AKfycbz5SuSFUPBVybJ6ScUL9w-vj6dhARlPsV7n6kcZ3-tERU0cSTl0U8QWQmCAIAxmU-y-/exec";

// --- Utility: Robust Unicode-Safe Encoding/Decoding ---
const encodeData = (str: string): string => {
  if (!str) return "";
  try {
    const binaryString = unescape(encodeURIComponent(str));
    const base64 = btoa(binaryString);
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch (e) {
    console.warn("Encoding failed", e);
    return "";
  }
};

const decodeData = (str: string): string => {
  if (!str) return "";
  try {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    try {
      const binaryString = atob(base64);
      return decodeURIComponent(escape(binaryString));
    } catch (e) {
      return atob(base64);
    }
  } catch (e) {
    console.warn("Decoding failed", e);
    return "";
  }
};

const GAS_CODE_SNIPPET = `function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getRange("A1").getValue();
  if (!data) return ContentService.createTextOutput("[]");
  return ContentService.createTextOutput(data);
}

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = e.postData.contents;
  sheet.getRange("A1").setValue(data);
  return ContentService.createTextOutput(JSON.stringify({result: "success"}));
}`;

const SetupGuideModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(GAS_CODE_SNIPPET);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in p-4">
      <div className="bg-white rounded-[2rem] p-8 max-w-2xl w-full shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-lime-600" /> 공유 서버 만들기 가이드
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-6 h-6" /></button>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6">
          <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 text-sm text-blue-800 leading-relaxed">
            LimeFlow는 <strong>Google Sheet</strong>를 무료 데이터베이스로 사용합니다.<br/>
            아래 단계를 따라 나만의 저장소를 만들면 <strong>실시간 저장 및 공유</strong>가 가능합니다.
          </div>

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold flex-shrink-0">1</div>
              <div>
                <h3 className="font-bold text-lg mb-1">구글 시트 생성 및 스크립트 열기</h3>
                <p className="text-slate-600 text-sm">새 구글 시트를 만들고 상단 메뉴에서 <strong>[확장 프로그램] &gt; [Apps Script]</strong>를 클릭하세요.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold flex-shrink-0">2</div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg mb-2">코드 붙여넣기</h3>
                <div className="relative group">
                  <pre className="bg-slate-800 text-slate-100 p-4 rounded-xl text-xs font-mono overflow-x-auto">
                    {GAS_CODE_SNIPPET}
                  </pre>
                  <button onClick={handleCopy} className="absolute right-2 top-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold backdrop-blur-md transition-colors flex items-center gap-2">
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} 코드 복사
                  </button>
                </div>
                <p className="text-slate-400 text-xs mt-2">* 기존 코드는 모두 지우고 위 코드를 붙여넣으세요. 저장(Ctrl+S)도 잊지 마세요.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold flex-shrink-0">3</div>
              <div>
                <h3 className="font-bold text-lg mb-1">배포 설정 (가장 중요!)</h3>
                <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
                  <li>오른쪽 상단 <strong>[배포] &gt; [새 배포]</strong> 클릭</li>
                  <li>유형 선택: <strong>웹 앱 (Web App)</strong></li>
                  <li>설명: (아무거나 입력)</li>
                  <li>액세스 권한 승인자 (Who has access): <strong className="text-red-500 bg-red-50 px-1 rounded">모든 사용자 (Anyone)</strong> <span className="text-xs text-slate-400">(이게 아니면 공유가 안돼요!)</span></li>
                  <li><strong>[배포]</strong> 버튼 클릭 후 생성된 <strong>웹 앱 URL</strong>을 복사하세요.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-100 flex justify-end">
          <button onClick={onClose} className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-transform active:scale-95">
            확인했습니다
          </button>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const getParams = () => new URLSearchParams(window.location.search);

  // Determine View Mode strictly from URL
  const [isReadOnly, setIsReadOnly] = useState(() => getParams().get('view') === 'present');
  
  // Sheet URL Management
  const [sheetUrl, setSheetUrl] = useState(() => {
    const params = getParams();
    
    // Priority 1: 'data' param
    const encodedData = params.get('data');
    if (encodedData) {
      const decoded = decodeData(encodedData);
      if (decoded && decoded.startsWith('http')) {
        localStorage.setItem(SHEET_URL_KEY, decoded);
        return decoded;
      }
    }

    // Priority 2: 'sheet' param
    const legacyShared = params.get('sheet');
    if (legacyShared) {
      localStorage.setItem(SHEET_URL_KEY, legacyShared);
      return legacyShared;
    }

    // Priority 3: Local Storage
    return localStorage.getItem(SHEET_URL_KEY) || '';
  });

  // Slide Data
  const [slides, setSlides] = useState<SlideData[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_SLIDES;
    } catch (e) { return INITIAL_SLIDES; }
  });

  // App Mode
  const [mode, setMode] = useState<'welcome' | 'edit' | 'present'>(() => {
    const params = getParams();
    if (params.get('view') === 'present') return 'present';
    const hasData = !!params.get('data') || !!params.get('sheet') || !!localStorage.getItem(SHEET_URL_KEY);
    return hasData ? 'edit' : 'welcome';
  });

  const [history, setHistory] = useState<SlideData[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  
  const [cloudStatus, setCloudStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'synced'>('idle');
  const [cloudMessage, setCloudMessage] = useState('');
  
  const [isPresentationLoading, setIsPresentationLoading] = useState(() => {
    const params = getParams();
    return params.get('view') === 'present' && (!!params.get('data') || !!params.get('sheet'));
  });

  const [isCopied, setIsCopied] = useState(false);
  const [isShareCopied, setIsShareCopied] = useState(false);

  const [showAddSlideModal, setShowAddSlideModal] = useState(false);
  const [showCloudModal, setShowCloudModal] = useState(false);
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  
  const [loginUrl, setLoginUrl] = useState(DEFAULT_SHEET_URL);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const slidesRef = useRef(slides);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialLoadDone = useRef(false);

  useEffect(() => { slidesRef.current = slides; }, [slides]);
  const currentSlide = slides[currentSlideIndex] || slides[0];

  useEffect(() => {
    const initApp = async () => {
      const params = getParams();
      const isPresentMode = params.get('view') === 'present';
      
      let targetSheetUrl = sheetUrl;
      const encodedParam = params.get('data');
      if (encodedParam) {
          const decoded = decodeData(encodedParam);
          if (decoded) targetSheetUrl = decoded;
      }

      if (targetSheetUrl) {
        setCloudStatus('loading');
        setCloudMessage('데이터 동기화 중...');
        if (isPresentMode) setIsPresentationLoading(true);

        try {
          const loadedSlides = await loadFromSheet(targetSheetUrl);
          if (Array.isArray(loadedSlides) && loadedSlides.length > 0) {
            setSlides(loadedSlides);
            setHistory([loadedSlides]);
            setHistoryIndex(0);
            setCloudStatus('synced');
            setCloudMessage('동기화 완료');
          } else {
             setCloudStatus('synced');
             setCloudMessage('새 프로젝트');
          }
        } catch (e) {
          console.error("Load failed", e);
          setCloudStatus('error');
          setCloudMessage('오프라인 / 접속 실패');
        } finally {
          setIsPresentationLoading(false);
        }
      } else {
        setIsPresentationLoading(false);
      }
      isInitialLoadDone.current = true;
    };
    initApp();
  }, []); 

  useEffect(() => {
    if (isReadOnly) return; 
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slides));
  }, [slides, isReadOnly]);

  useEffect(() => {
    if (!isInitialLoadDone.current || !sheetUrl || isReadOnly) return;

    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    setCloudStatus('loading');
    setCloudMessage('저장 중...');

    autoSaveTimerRef.current = setTimeout(async () => {
      try {
        await saveToSheet(sheetUrl, slidesRef.current);
        setCloudStatus('synced');
        setCloudMessage('클라우드 저장됨');
      } catch (e) {
        setCloudStatus('error');
        setCloudMessage('저장 실패 (오프라인)');
      }
    }, 2000);

    return () => { if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current); };
  }, [slides, sheetUrl, isReadOnly]);

  const getShareUrl = (viewMode: 'edit' | 'present') => {
    try {
        const baseUrl = window.location.href.split('?')[0].split('#')[0];
        const url = new URL(baseUrl);
        url.search = ''; 
        
        if (sheetUrl && sheetUrl.trim()) {
            const encodedUrl = encodeData(sheetUrl.trim());
            if (encodedUrl) {
                url.searchParams.set('data', encodedUrl);
            }
        }
        
        if (viewMode === 'present') {
            url.searchParams.set('view', 'present');
        }
        
        return url.toString();
    } catch (e) {
        console.error("URL generation error", e);
        return window.location.href; 
    }
  };

  const handleShareLink = (viewMode: 'edit' | 'present') => {
    const fullUrl = getShareUrl(viewMode);
    
    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(fullUrl);
            setIsShareCopied(true);
            setTimeout(() => setIsShareCopied(false), 2000);
            alert(viewMode === 'present' ? "발표 전용 링크가 복사되었습니다!" : "공동 작업 링크가 복사되었습니다.");
        } catch (err) {
            prompt("아래 링크를 복사하세요 (Ctrl+C):", fullUrl);
        }
    };
    copyToClipboard();
  };

  const updateSlide = (updatedSlide: SlideData) => {
    const newSlides = [...slides];
    newSlides[currentSlideIndex] = updatedSlide;
    setSlides(newSlides);
    addToHistory(newSlides);
  };

  const addToHistory = useCallback((newSlides: SlideData[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...newSlides]);
    if (newHistory.length > 30) newHistory.shift();
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const addSlide = (type: SlideType = SlideType.CONTENT_LIST) => {
    const newSlide: SlideData = { id: Date.now().toString(), type, title: '새 제목', content: ['내용을 입력하세요'] };
    const newSlides = [...slides];
    newSlides.splice(currentSlideIndex + 1, 0, newSlide);
    setSlides(newSlides);
    setCurrentSlideIndex(currentSlideIndex + 1);
    addToHistory(newSlides);
  };

  const deleteSlide = (index: number) => {
    if (slides.length <= 1) return;
    const newSlides = slides.filter((_, i) => i !== index);
    setSlides(newSlides);
    setCurrentSlideIndex(Math.min(currentSlideIndex, newSlides.length - 1));
    addToHistory(newSlides);
  };

  const moveSlide = (index: number, dir: 'up' | 'down') => {
    const target = dir === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= slides.length) return;
    const newSlides = [...slides];
    [newSlides[index], newSlides[target]] = [newSlides[target], newSlides[index]];
    setSlides(newSlides);
    setCurrentSlideIndex(target);
    addToHistory(newSlides);
  };

  const handleUndo = () => { if (historyIndex > 0) { setSlides(history[historyIndex - 1]); setHistoryIndex(historyIndex - 1); } };
  const handleRedo = () => { if (historyIndex < history.length - 1) { setSlides(history[historyIndex + 1]); setHistoryIndex(historyIndex + 1); } };

  const handlePrevSlide = (e: React.MouseEvent) => { e.stopPropagation(); if (currentSlideIndex > 0) setCurrentSlideIndex(currentSlideIndex - 1); };
  const handleNextSlide = (e: React.MouseEvent) => { e.stopPropagation(); if (currentSlideIndex < slides.length - 1) setCurrentSlideIndex(currentSlideIndex + 1); };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUrl.trim()) return;
    setIsLoggingIn(true);
    try {
      const data = await loadFromSheet(loginUrl);
      if (data) {
        setSheetUrl(loginUrl);
        localStorage.setItem(SHEET_URL_KEY, loginUrl);
        setSlides(data);
        setHistory([data]);
        setHistoryIndex(0);
        setMode('edit');
        setCloudStatus('synced');
      }
    } catch (error) {
      alert("접속 실패: 링크를 확인해주세요.\n(Google Sheet가 '모든 사용자(Anyone)' 권한으로 배포되어야 합니다.)");
    } finally { setIsLoggingIn(false); }
  };

  if (mode === 'present' && isPresentationLoading) {
    return (
      <div className="fixed inset-0 bg-black text-white flex flex-col items-center justify-center z-[9999]">
        <Loader2 className="w-12 h-12 animate-spin text-lime-400 mb-6" />
        <h2 className="text-2xl font-bold mb-2">프레젠테이션 연결 중...</h2>
        <p className="text-slate-400 text-sm">보안 연결을 통해 데이터를 불러오고 있습니다.</p>
      </div>
    );
  }

  if (mode === 'present' && cloudStatus === 'error' && slidesRef.current === INITIAL_SLIDES) {
     return (
        <div className="fixed inset-0 bg-slate-900 text-white flex flex-col items-center justify-center z-[9999] p-8 text-center">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
                <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-3xl font-black mb-4">링크 접속 실패</h2>
            <p className="text-slate-400 mb-8 max-w-md">
                링크가 만료되었거나 잘못된 주소입니다.<br/>
                인터넷 연결을 확인하거나 링크를 다시 생성해주세요.
            </p>
            <button 
                onClick={() => window.location.reload()} 
                className="px-8 py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-200 transition-colors flex items-center gap-2"
            >
                <RefreshCw className="w-4 h-4" /> 다시 시도
            </button>
        </div>
     );
  }

  if (mode === 'welcome') {
    return (
      <div className="relative w-screen h-screen flex flex-col items-center justify-center font-sans text-slate-800 bg-white overflow-hidden">
        <Background />
        {showSetupGuide && <SetupGuideModal onClose={() => setShowSetupGuide(false)} />}
        <div className="z-10 w-full max-w-md p-8 glass-panel rounded-[2.5rem] shadow-2xl animate-in fade-in zoom-in-95 duration-700 flex flex-col items-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-3xl flex items-center justify-center text-white shadow-lg mb-6"><Presentation className="w-10 h-10" /></div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-2">LimeFlow Pro</h1>
          <p className="text-slate-500 text-center mb-8">가장 심플한 협업 프레젠테이션</p>
          <form onSubmit={handleLogin} className="w-full space-y-4">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">프로젝트 키 (구글 시트 URL)</label>
              <div className="relative group">
                <input type="text" value={loginUrl} onChange={(e) => setLoginUrl(e.target.value)} className="w-full bg-white border border-slate-200 rounded-2xl p-4 pr-12 text-sm font-mono focus:ring-4 focus:ring-blue-200 outline-none transition-all shadow-sm" autoFocus />
                <button type="button" onClick={() => { navigator.clipboard.writeText(loginUrl); setIsCopied(true); setTimeout(() => setIsCopied(false), 2000); }} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-blue-600 transition-colors">{isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}</button>
              </div>
            </div>
            <button type="submit" disabled={isLoggingIn || !loginUrl} className="w-full py-4 rounded-2xl font-bold bg-slate-900 text-white shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 active:scale-95">{isLoggingIn ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}<span>프로젝트 접속</span></button>
          </form>
          
          <div className="mt-6 flex flex-col w-full gap-3">
             <button onClick={() => setShowSetupGuide(true)} className="w-full py-3 rounded-2xl font-bold bg-lime-100 text-lime-800 hover:bg-lime-200 transition-colors text-xs flex items-center justify-center gap-2">
               <HelpCircle className="w-4 h-4" /> 공유 서버(구글시트) 만들기 가이드
             </button>
             <button onClick={() => setMode('edit')} className="w-full text-center text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center gap-2">
                <Laptop className="w-4 h-4" /> 오프라인으로 체험하기
             </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen flex flex-col font-sans transition-all duration-700 text-slate-800 bg-white">
      <Background />
      {showSetupGuide && <SetupGuideModal onClose={() => setShowSetupGuide(false)} />}
      
      {mode === 'edit' && !isReadOnly && (
        <header className="fixed top-0 left-0 right-0 h-16 glass-panel z-50 px-6 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 cursor-pointer"><div className="bg-gradient-to-br from-blue-400 to-cyan-500 p-2 rounded-xl text-white shadow-lg"><Presentation className="w-5 h-5" /></div><h1 className="font-bold text-slate-800 text-lg tracking-tight hidden lg:block">LimeFlow Pro</h1></div>
            <div className="flex items-center gap-1">
              <button onClick={handleUndo} disabled={historyIndex <= 0} className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-20"><Undo2 className="w-4 h-4" /></button>
              <button onClick={handleRedo} disabled={historyIndex >= history.length - 1} className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-20"><Redo2 className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 mr-2 bg-slate-50 border border-slate-100 rounded-full px-4 py-1.5">
              {cloudStatus === 'loading' ? <Loader2 className="w-3 h-3 animate-spin text-blue-500" /> : <CheckCircle className="w-3 h-3 text-blue-500" />}
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">{cloudMessage || '동기화 완료'}</span>
            </div>
            {sheetUrl && <button onClick={() => handleShareLink('present')} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-md"><Share2 className="w-4 h-4" /><span className="hidden sm:inline">발표 링크 복사</span></button>}
            <button onClick={() => setShowCloudModal(true)} className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-all"><Settings className="w-4 h-4" /></button>
            <div className="h-6 w-px bg-slate-200 mx-1 hidden md:block"></div>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button onClick={() => setMode('edit')} className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold transition-all bg-white text-blue-700 shadow-sm"><Edit3 className="w-4 h-4" /> <span className="hidden sm:inline">편집</span></button>
              <button onClick={() => setMode('present')} className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold transition-all text-slate-500 hover:text-slate-700"><MonitorPlay className="w-4 h-4" /> <span className="hidden sm:inline">발표</span></button>
            </div>
          </div>
        </header>
      )}

      <main className={`flex-1 overflow-hidden transition-all duration-700 ${mode === 'edit' ? 'pt-20 pb-20 px-4 md:px-8' : 'p-0'}`}>
        {mode === 'edit' ? (
          <div className="h-full max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-2 hidden lg:flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar">
              {slides.map((s, idx) => (
                <div key={s.id} className="relative group">
                  <button onClick={() => setCurrentSlideIndex(idx)} className={`w-full aspect-video rounded-[2rem] border-2 transition-all bg-white shadow-sm flex flex-col ${currentSlideIndex === idx ? 'border-blue-500 ring-4 ring-blue-100' : 'border-slate-100 opacity-80'}`}>
                    <div className="flex-1 p-2 flex items-center justify-center text-center"><span className="text-[10px] font-bold text-slate-800 line-clamp-2">{s.title}</span></div>
                  </button>
                  <div className="absolute -right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 scale-90">
                    <button onClick={() => moveSlide(idx, 'up')} className="p-1 bg-white shadow rounded-full"><ArrowUp className="w-3 h-3" /></button>
                    <button onClick={() => deleteSlide(idx)} className="p-1 bg-white shadow rounded-full text-red-500"><Trash2 className="w-3 h-3" /></button>
                    <button onClick={() => moveSlide(idx, 'down')} className="p-1 bg-white shadow rounded-full"><ArrowDown className="w-3 h-3" /></button>
                  </div>
                </div>
              ))}
              <button onClick={() => addSlide()} className="w-full aspect-video rounded-[2rem] border-2 border-dashed border-slate-300 hover:border-blue-400 flex items-center justify-center text-slate-400"><Plus className="w-5 h-5" /></button>
            </div>
            <div className="lg:col-span-7 h-full flex flex-col">
              <div className="flex-1 relative aspect-video bg-transparent rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100/30"><SlideRenderer slide={currentSlide} /></div>
              <div className="mt-6 flex justify-center"><button onClick={() => setShowAddSlideModal(true)} className="px-10 py-4 bg-white border border-slate-200 rounded-[2rem] text-slate-700 font-bold shadow-sm hover:border-blue-400 transition-all flex items-center gap-2"><Sparkles className="w-5 h-5 text-blue-500" /> AI 레이아웃 디자인</button></div>
            </div>
            <div className="lg:col-span-3 h-full overflow-hidden"><EditorPanel slide={currentSlide} onUpdate={updateSlide} /></div>
          </div>
        ) : (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
            <div className="absolute left-0 top-0 bottom-0 w-1/4 z-20 cursor-w-resize group" onClick={handlePrevSlide}><div className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"><ChevronLeft className="w-8 h-8" /></div></div>
            <div className="absolute right-0 top-0 bottom-0 w-3/4 z-20 cursor-e-resize group" onClick={handleNextSlide}><div className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"><ChevronRight className="w-8 h-8" /></div></div>
            <div className="w-full h-full max-w-[100vw] aspect-video relative"><SlideRenderer slide={currentSlide} /></div>
            {!isReadOnly && <button onClick={(e) => { e.stopPropagation(); setMode('edit'); }} className="absolute top-6 right-6 p-4 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md border border-white/20 z-50"><X className="w-6 h-6" /></button>}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/80 to-transparent z-40 flex items-end pb-4 px-8 pointer-events-none">
              <div className="flex-1 flex justify-between items-center text-white"><h2 className="text-xl font-bold tracking-tight opacity-90 drop-shadow-md">{currentSlide.title}</h2><div className="px-4 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-sm font-mono">{currentSlideIndex + 1} / {slides.length}</div></div>
            </div>
          </div>
        )}
      </main>

      {showCloudModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2"><Settings className="w-6 h-6" /> 프로젝트 공유</h2>
            <div className="space-y-6">
               <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">편집 권한 링크</label>
                  <div className="flex gap-2"><input readOnly value={getShareUrl('edit')} className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-500 font-mono" /><button onClick={() => handleShareLink('edit')} className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100"><Copy className="w-4 h-4" /></button></div>
               </div>
               <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                  <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 block">발표 전용 링크 (강력 추천)</label>
                  <div className="flex gap-2"><input readOnly value={getShareUrl('present')} className="flex-1 bg-white border border-indigo-200 rounded-xl px-3 py-2 text-xs text-slate-500 font-mono" /><button onClick={() => handleShareLink('present')} className="p-2 bg-indigo-100 text-indigo-600 rounded-xl hover:bg-indigo-200"><Link className="w-4 h-4" /></button></div>
                  <p className="text-[10px] text-indigo-600/70 mt-2 font-medium">이 링크는 로딩 화면 후 즉시 전체화면 발표 모드로 시작됩니다.</p>
               </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-100">
                <button onClick={() => { setShowSetupGuide(true); setShowCloudModal(false); }} className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2">
                    <BookOpen className="w-4 h-4" /> 서버(구글시트) 설정 방법 다시보기
                </button>
            </div>

            <div className="mt-8 flex justify-end gap-3"><button onClick={() => { localStorage.clear(); window.location.reload(); }} className="px-5 py-2.5 text-red-500 font-bold text-sm">로그아웃</button><button onClick={() => setShowCloudModal(false)} className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-lg">닫기</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
