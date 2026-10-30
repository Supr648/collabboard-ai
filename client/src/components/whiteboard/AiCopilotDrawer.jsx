import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  X,
  FileText,
  GitBranch,
  Network,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  Wand2,
  Upload,
  AlertTriangle,
  ChevronRight,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import {
  generateAiDiagram,
  generateAiFlowchart,
  generateAiBrainstorm,
  generateAiMindMap,
  executeAiCanvasCommand,
  extractAiDocumentIntelligence,
  critiqueAiBoard,
  summarizeBoardContent,
} from '../../api/ai';

const AiCopilotDrawer = ({
  isOpen,
  onClose,
  elements = [],
  selectedElements = [],
  onApplyElements,
  onUpdateCanvasElements,
}) => {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Hello! I am your CollabBoard AI Copilot. Ask me to generate architecture diagrams, decision flowcharts, radial mind maps, summarize your board, or execute natural language canvas commands.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'doc' | 'critique'
  const [docContent, setDocContent] = useState('');
  const [docTitle, setDocTitle] = useState('');
  const [critiques, setCritiques] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (textToSend) => {
    const prompt = (textToSend || inputPrompt).trim();
    if (!prompt || loading) return;

    const userMsg = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: prompt,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setLoading(true);

    try {
      const lower = prompt.toLowerCase();

      // Mind Map command
      if (lower.includes('mind map') || lower.includes('mindmap')) {
        const res = await generateAiMindMap(prompt);
        if (res.success && res.elements) {
          onApplyElements(res.elements);
          setMessages((prev) => [
            ...prev,
            {
              id: `ai_${Date.now()}`,
              sender: 'ai',
              text: `✅ Generated radial mind map with 4 core pillars and sub-nodes! Inserted directly onto your canvas.`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
        }
      } else if (lower.includes('flowchart') || lower.includes('flow chart') || lower.includes('workflow')) {
        // Flowchart command
        const res = await generateAiFlowchart(prompt);
        if (res.success && res.elements) {
          onApplyElements(res.elements);
          setMessages((prev) => [
            ...prev,
            {
              id: `ai_${Date.now()}`,
              sender: 'ai',
              text: `✅ Generated decision flowchart with process nodes and branching connectors!`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
        }
      } else if (lower.includes('architecture') || lower.includes('diagram') || lower.includes('system')) {
        // Architecture Diagram command
        const res = await generateAiDiagram(prompt);
        if (res.success && res.elements) {
          onApplyElements(res.elements);
          setMessages((prev) => [
            ...prev,
            {
              id: `ai_${Date.now()}`,
              sender: 'ai',
              text: `✅ Synthesized cloud architecture diagram with clients, microservices, and databases!`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
        }
      } else if (lower.includes('brainstorm') || lower.includes('ideas') || lower.includes('sticky')) {
        // Brainstorming command
        const res = await generateAiBrainstorm(prompt);
        if (res.success && res.elements) {
          onApplyElements(res.elements);
          setMessages((prev) => [
            ...prev,
            {
              id: `ai_${Date.now()}`,
              sender: 'ai',
              text: `✅ Synthesized 8 categorized brainstorming sticky notes across 4 pillars!`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
        }
      } else {
        // Natural Language Canvas Command (color change, add component, align)
        const res = await executeAiCanvasCommand(prompt, elements, selectedElements);
        if (res.success) {
          if (res.updatedElements && onUpdateCanvasElements) {
            onUpdateCanvasElements(res.updatedElements);
          }
          if (res.newElements && onApplyElements) {
            onApplyElements(res.newElements);
          }
          setMessages((prev) => [
            ...prev,
            {
              id: `ai_${Date.now()}`,
              sender: 'ai',
              text: res.message || 'Operation executed successfully on canvas.',
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
        }
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          text: `⚠️ I encountered an issue processing that instruction. Please try again or rephrase your prompt.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Run Board Critique
  const handleRunCritique = async () => {
    try {
      setLoading(true);
      const res = await critiqueAiBoard(elements);
      if (res.success && res.critiques) {
        setCritiques(res.critiques);
      }
    } catch (err) {
      console.warn('Critique failed:', err);
    } finally {
      setLoading(false);
    }
  };

  // Run Document Intelligence
  const handleExtractDoc = async () => {
    if (!docContent.trim()) return;
    try {
      setLoading(true);
      const res = await extractAiDocumentIntelligence(docContent, docTitle || 'Requirement Document');
      if (res.success && res.elements) {
        onApplyElements(res.elements);
        setActiveTab('chat');
        setMessages((prev) => [
          ...prev,
          {
            id: `ai_${Date.now()}`,
            sender: 'ai',
            text: `📄 Document Intelligence Extracted! Created presentation frame with ${res.elements.length} categorized sticky note cards summarizing "${docTitle || 'Document'}".`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        setDocContent('');
      }
    } catch (err) {
      alert('Failed to extract document. Please check content format.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-16 right-0 bottom-0 w-96 max-w-[90vw] z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Drawer Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">AI Copilot</h3>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Interactive Canvas Assistant</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100 dark:border-slate-800 px-3 bg-slate-50/50 dark:bg-slate-950/20">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
            activeTab === 'chat'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Chat & Copilot</span>
        </button>
        <button
          onClick={() => setActiveTab('doc')}
          className={`flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
            activeTab === 'doc'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Doc Intelligence</span>
        </button>
        <button
          onClick={() => {
            setActiveTab('critique');
            if (!critiques) handleRunCritique();
          }}
          className={`flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
            activeTab === 'critique'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Wand2 className="w-3.5 h-3.5" />
          <span>Layout Doctor</span>
        </button>
      </div>

      {/* Tab: Chat & Copilot */}
      {activeTab === 'chat' && (
        <>
          {/* Quick Prompts Carousel */}
          <div className="p-3 border-b border-slate-100 dark:border-slate-800/60 overflow-x-auto flex gap-2 no-scrollbar">
            <button
              onClick={() => handleSendMessage('Create a mind map for Cloud Microservices')}
              className="whitespace-nowrap px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 transition-colors"
            >
              🧠 Mind Map
            </button>
            <button
              onClick={() => handleSendMessage('Change selected elements to blue')}
              className="whitespace-nowrap px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 transition-colors"
            >
              🎨 Make Selected Blue
            </button>
            <button
              onClick={() => handleSendMessage('Organize sticky notes in a grid')}
              className="whitespace-nowrap px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 transition-colors"
            >
              📐 Clean Up Notes
            </button>
            <button
              onClick={() => handleSendMessage('Create architecture diagram for food delivery')}
              className="whitespace-nowrap px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 transition-colors"
            >
              🏛️ Food Delivery App
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200/50 dark:border-slate-700/50'
                  }`}
                >
                  <p>{msg.text}</p>
                  <span
                    className={`block text-[9px] mt-1 text-right ${
                      msg.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'
                    }`}
                  >
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2 items-center text-xs text-indigo-500 font-medium animate-pulse">
                <Bot className="w-4 h-4" />
                <span>AI Copilot is synthesizing canvas elements...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Prompt Input Box */}
          <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-2xl px-3 py-2 border border-slate-200 dark:border-slate-700 focus-within:ring-2 focus-within:ring-indigo-500"
            >
              <input
                type="text"
                placeholder="Ask Copilot (e.g. 'Generate auth flowchart')..."
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                disabled={loading}
                className="flex-1 bg-transparent text-xs text-slate-900 dark:text-white focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading || !inputPrompt.trim()}
                className="p-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-30 text-white transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </>
      )}

      {/* Tab: Document Intelligence */}
      {activeTab === 'doc' && (
        <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-4 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              Document Title
            </label>
            <input
              type="text"
              placeholder="e.g. System PRD v2.1"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div className="flex-1 flex flex-col">
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              Document Text / Requirements
            </label>
            <textarea
              rows={10}
              placeholder="Paste product specifications, architecture notes, or user requirements here..."
              value={docContent}
              onChange={(e) => setDocContent(e.target.value)}
              className="w-full flex-1 p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none resize-none"
            />
          </div>

          <button
            onClick={handleExtractDoc}
            disabled={loading || !docContent.trim()}
            className="w-full py-2.5 rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loading ? 'Synthesizing...' : 'Extract to Canvas Sticky Notes'}</span>
          </button>
        </div>
      )}

      {/* Tab: Layout Doctor & Critique */}
      {activeTab === 'critique' && (
        <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-4 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-700 dark:text-slate-300">
              Board Health Analysis
            </span>
            <button
              onClick={handleRunCritique}
              className="text-[11px] font-semibold text-indigo-600 hover:underline"
            >
              Re-scan Board
            </button>
          </div>

          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 text-slate-400">
              <Wand2 className="w-5 h-5 animate-spin text-indigo-500" />
              <span>Analyzing diagram topology and connector paths...</span>
            </div>
          ) : critiques ? (
            <div className="space-y-3">
              {critiques.map((c) => (
                <div
                  key={c.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 flex flex-col gap-1.5"
                >
                  <div className="flex items-center gap-2 font-bold text-xs text-slate-800 dark:text-slate-200">
                    {c.type === 'warning' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    )}
                    <span>{c.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    {c.description}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default AiCopilotDrawer;
