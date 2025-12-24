import React, { useState, useRef, useEffect } from 'react';
import { SlideData, SlideType } from '../types.ts';
import { Wand2, Loader2, Layout, Plus, Minus, Type, Sparkles, Send } from 'lucide-react';
import { generateSlideContent, generateNewSlideFromTopic } from '../services/geminiService.ts';

interface EditorPanelProps {
  slide: SlideData;
  onUpdate: (updatedSlide: SlideData) => void;
}

const AutoResizeTextarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };
  useEffect(() => { adjustHeight(); }, [props.value]);
  return (
    <div className="relative group w-full">
      <textarea
        ref={textareaRef}
        {...props}
        rows={1}
        className={`w-full bg-white/80 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-lime-400 focus:outline-none resize-none transition-all shadow-sm ${props.className || ''}`}
        onInput={(e) => { adjustHeight(); props.onInput?.(e); }}
      />
    </div>
  );
};

const EditorPanel: React.FC<EditorPanelProps> = ({ slide, onUpdate }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [designInstruction, setDesignInstruction] = useState('');
  const [isRedesigning, setIsRedesigning] = useState(false);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ ...slide, title: e.target.value });
  };

  const handleSubtitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ ...slide, subtitle: e.target.value });
  };

  const handleContentChange = (index: number, value: string) => {
    const newContent = [...slide.content];
    newContent[index] = value;
    onUpdate({ ...slide, content: newContent });
  };

  const addContentItem = () => {
    onUpdate({ ...slide, content: [...slide.content, ''] });
  };

  const removeContentItem = (index: number) => {
    const newContent = slide.content.filter((_, i) => i !== index);
    onUpdate({ ...slide, content: newContent });
  };

  const handleMagicGenerate = async () => {
    setIsGenerating(true);
    const generatedText = await generateSlideContent(slide.content.join('\n'), slide.title, slide.subtitle);
    const newItems = generatedText.split('\n').map(line => line.replace(/^-\s*/, '').trim()).filter(line => line.length > 0);
    onUpdate({ ...slide, content: newItems });
    setIsGenerating(false);
  };

  const handleAIDesign = async () => {
    if (!designInstruction.trim()) return;
    setIsRedesigning(true);
    const newSlide = await generateNewSlideFromTopic(slide.title, `현재 내용: ${slide.content.join(', ')}. 요구사항: ${designInstruction}`);
    if (newSlide) {
      onUpdate({ ...newSlide, id: slide.id }); // ID 유지하며 업데이트
      setDesignInstruction('');
    }
    setIsRedesigning(false);
  };

  return (
    <div className="glass-panel h-full p-6 rounded-[2.5rem] flex flex-col overflow-y-auto custom-scrollbar border-slate-200/50 shadow-xl bg-white/40">
      <div className="mb-8 p-5 bg-gradient-to-br from-lime-500/10 to-emerald-500/5 rounded-3xl border border-lime-200/30">
        <h3 className="text-xs font-black text-lime-700 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
          <Sparkles className="w-3 h-3" /> AI 레이아웃 재디자인
        </h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={designInstruction}
            onChange={(e) => setDesignInstruction(e.target.value)}
            placeholder="예: 4개 분할로 구성해줘..."
            className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-lime-400 outline-none transition-all shadow-sm"
            onKeyDown={(e) => e.key === 'Enter' && handleAIDesign()}
          />
          <button
            onClick={handleAIDesign}
            disabled={isRedesigning || !designInstruction}
            className="bg-slate-900 text-white p-2 rounded-xl hover:bg-slate-800 disabled:opacity-30 transition-all shadow-md"
          >
            {isRedesigning ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
        <p className="text-[10px] text-slate-400 mt-2 pl-1 font-medium italic">* 내용과 어울리는 최적의 레이아웃을 AI가 선택합니다.</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2 pl-1">
             <Type className="w-3 h-3" /> 슬라이드 제목
          </label>
          <input
            type="text"
            value={slide.title}
            onChange={handleTitleChange}
            className="w-full bg-white/80 border border-slate-200 rounded-xl p-4 text-sm font-bold focus:ring-2 focus:ring-lime-400 focus:outline-none transition-all shadow-sm"
            placeholder="제목을 입력하세요..."
          />
        </div>

        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">부제목</label>
          <input
            type="text"
            value={slide.subtitle || ''}
            onChange={handleSubtitleChange}
            className="w-full bg-white/80 border border-slate-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-lime-400 focus:outline-none transition-all shadow-sm"
            placeholder="부제목 입력..."
          />
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">슬라이드 본문</label>
            <button
              onClick={handleMagicGenerate}
              disabled={isGenerating}
              className="flex items-center gap-2 text-[10px] font-black text-white bg-gradient-to-r from-lime-600 to-emerald-600 hover:from-lime-700 hover:to-emerald-700 px-3 py-1.5 rounded-full shadow-lg transition-all disabled:opacity-50"
            >
              {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
              AI 자동 채우기
            </button>
          </div>
          
          <div className="space-y-4">
            {slide.content.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2 group animate-in slide-in-from-right-2 duration-300">
                <AutoResizeTextarea
                  value={item}
                  onChange={(e) => handleContentChange(idx, e.target.value)}
                  placeholder={`항목 ${idx + 1}`}
                />
                <button 
                  onClick={() => removeContentItem(idx)}
                  className="p-2 text-slate-300 hover:text-red-500 rounded-lg transition-all flex-shrink-0"
                >
                  <Minus className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              onClick={addContentItem}
              className="w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:text-lime-600 hover:border-lime-300 hover:bg-lime-50 transition-all text-xs font-black flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> 항목 추가
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorPanel;
