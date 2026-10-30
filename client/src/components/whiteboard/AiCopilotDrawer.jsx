import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  AlertTriangle,
  RotateCcw,
  RotateCw,
  History,
  Eye,
  Check,
  Zap,
  ListOrdered,
  FileSearch,
  Layers,
  ChevronDown,
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
  explainBoardDiagram,
} from '../../api/ai';

const SUGGESTED_PROMPTS = [
  { label: '🧠 Radial Mind Map', prompt: 'Create a mind map for Cloud Microservices Architecture' },
  { label: '🔀 Decision Flowchart', prompt: 'Create a decision flowchart for User Authentication with MFA' },
  { label: '🏛️ System Architecture', prompt: 'Create architecture diagram for E-Commerce platform with payment gateway' },
  { label: '📝 Brainstorm Notes', prompt: 'Brainstorm ideas for improving user retention in SaaS' },
  { label: '📊 Board Summary', prompt: 'Summarize the contents of this whiteboard' },
  { label: '🔍 Explain Flow', prompt: 'Explain the workflow and diagram structure on this board' },
  { label: '📐 Auto-Align Grid', prompt: 'Organize sticky notes in a clean grid' },
  { label: '🎨 Color Scheme', prompt: 'Change selected elements to blue' },
];

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
  const [loadingStep, setLoadingStep] = useState('');
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'doc' | 'critique'
  const [docContent, setDocContent] = useState('');
  const [docTitle, setDocTitle] = useState('');
  const [critiques, setCritiques] = useState(null);

  // Undo AI changes state
  const [lastAiState, setLastAiState] = useState(null);

  // Preview before apply state
  const [previewMode, setPreviewMode] = useState(false);
  const [previewElements, setPreviewElements] = useState(null);
  const [previewPrompt, setPreviewPrompt] = useState('');

  // Prompt History state
  const [promptHistory, setPromptHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('collab_ai_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showHistoryDropdown, setShowHistoryDropdown] = useState(false);
  const [lastPrompt, setLastPrompt] = useState('');

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const saveToPromptHistory = (prompt) => {
    const updated = [prompt, ...promptHistory.filter((p) => p !== prompt)].slice(0, 15);
    setPromptHistory(updated);
    try {
      localStorage.setItem('collab_ai_history', JSON.stringify(updated));
    } catch {}
  };

  const handleApplyGenerated = (newElements, actionDesc) => {
    // Save previous snapshot for 1-click Undo
    setLastAiState({
      previousElements: JSON.parse(JSON.stringify(elements)),
      description: actionDesc,
      timestamp: Date.now(),
    });

    if (previewMode) {
      setPreviewElements(newElements);
      setPreviewPrompt(actionDesc);
    } else {
      onApplyElements(newElements);
    }
  };

  const handleConfirmPreview = () => {
    if (previewElements) {
      onApplyElements(previewElements);
      setPreviewElements(null);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          text: `Applied ${previewElements.length} elements to your canvas.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  };

  const handleDiscardPreview = () => {
    setPreviewElements(null);
    setMessages((prev) => [
      ...prev,
      {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: 'Preview discarded.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const handleUndoAiChanges = () => {
    if (lastAiState && onUpdateCanvasElements) {
      onUpdateCanvasElements(lastAiState.previousElements);
      setLastAiState(null);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          text: `↺ Undid previous AI modification (${lastAiState.description}). Canvas restored.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  };

  const handleSendMessage = async (textToSend) => {
    const prompt = (textToSend || inputPrompt).trim();
    if (!prompt || loading) return;

    saveToPromptHistory(prompt);
    setLastPrompt(prompt);
    setHistoryIndex(-1);
    setShowHistoryDropdown(false);

    const userMsg = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: prompt,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setLoading(true);
    setLoadingStep('Analyzing natural language request...');

    try {
      const lower = prompt.toLowerCase();

      // 1. Board Summarization
      if (lower.includes('summar') || lower.includes('overview') || lower.includes('executive summary')) {
        setLoadingStep('Synthesizing board summary and key takeaways...');
        const res = await summarizeBoardContent(elements, 'Current Board');
        setMessages((prev) => [
          ...prev,
          {
            id: `ai_${Date.now()}`,
            sender: 'ai',
            text: res.summary || 'Summary synthesized from canvas contents.',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
      // 2. Diagram Explanation
      else if (lower.includes('explain') || lower.includes('describe') || lower.includes('walkthrough')) {
        setLoadingStep('Analyzing shapes, connections, and flow...');
        const res = await explainBoardDiagram(elements);
        setMessages((prev) => [
          ...prev,
          {
            id: `ai_${Date.now()}`,
            sender: 'ai',
            text: res.explanation || 'Detailed diagram topology and narrative generated.',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
      // 3. Mind Map generation
      else if (lower.includes('mind map') || lower.includes('mindmap') || lower.includes('radial')) {
        setLoadingStep('Generating radial hierarchy nodes and connectors...');
        const res = await generateAiMindMap(prompt);
        if (res.success && res.elements) {
          handleApplyGenerated(res.elements, 'Radial Mind Map');
          setMessages((prev) => [
            ...prev,
            {
              id: `ai_${Date.now()}`,
              sender: 'ai',
              text: `✅ Generated radial mind map with ${res.elements.length} nodes! ${
                previewMode ? 'Check the preview banner below to accept.' : 'Inserted directly onto your canvas.'
              }`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
        }
      }
      // 4. Flowchart generation
      else if (lower.includes('flowchart') || lower.includes('flow chart') || lower.includes('workflow')) {
        setLoadingStep('Designing step-by-step logic, branches, and arrows...');
        const res = await generateAiFlowchart(prompt);
        if (res.success && res.elements) {
          handleApplyGenerated(res.elements, 'Decision Flowchart');
          setMessages((prev) => [
            ...prev,
            {
              id: `ai_${Date.now()}`,
              sender: 'ai',
              text: `✅ Generated decision flowchart with branching pathways and connectors!`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
        }
      }
      // 5. Architecture / Cloud Diagram
      else if (lower.includes('architecture') || lower.includes('diagram') || lower.includes('system') || lower.includes('microservice')) {
        setLoadingStep('Structuring cloud infrastructure tiers, services, and databases...');
        const res = await generateAiDiagram(prompt);
        if (res.success && res.elements) {
          handleApplyGenerated(res.elements, 'Cloud Architecture Diagram');
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
      }
      // 6. Brainstorming Sticky Notes
      else if (lower.includes('brainstorm') || lower.includes('ideas') || lower.includes('sticky')) {
        setLoadingStep('Synthesizing multi-color categorized brainstorming cards...');
        const res = await generateAiBrainstorm(prompt);
        if (res.success && res.elements) {
          handleApplyGenerated(res.elements, 'Brainstorming Sticky Notes');
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
      }
      // 7. Missing Connections / Orphan Elements Detection
      else if (lower.includes('missing') || lower.includes('orphan') || lower.includes('connection')) {
        setLoadingStep('Detecting unconnected shapes and floating endpoints...');
        const shapes = elements.filter((e) => ['rectangle', 'circle', 'diamond', 'triangle'].includes(e.type));
        const arrows = elements.filter((e) => ['line', 'arrow'].includes(e.type));
        const orphanCount = Math.max(0, shapes.length - arrows.length);
        setMessages((prev) => [
          ...prev,
          {
            id: `ai_${Date.now()}`,
            sender: 'ai',
            text: `🔍 Topology Scan Complete:\nFound ${shapes.length} nodes and ${arrows.length} connectors. ${
              orphanCount > 0
                ? `Detected ${orphanCount} potentially unlinked nodes. Consider connecting them using the Arrow tool.`
                : 'All diagram nodes appear connected!'
            }`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
      // 8. Natural Language Canvas Command (color change, grid align, add component)
      else {
        setLoadingStep('Executing canvas geometry modification...');
        const res = await executeAiCanvasCommand(prompt, elements, selectedElements);
        if (res.success) {
          setLastAiState({
            previousElements: JSON.parse(JSON.stringify(elements)),
            description: prompt,
            timestamp: Date.now(),
          });

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
      setLoadingStep('');
    }
  };

  // Run Board Critique
  const handleRunCritique = async () => {
    try {
      setLoading(true);
      setLoadingStep('Evaluating visual hierarchy, readability, and spacing...');
      const res = await critiqueAiBoard(elements);
      if (res.success && res.critiques) {
        setCritiques(res.critiques);
      }
    } catch (err) {
      console.warn('Critique failed:', err);
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  // Run Document Intelligence
  const handleExtractDoc = async () => {
    if (!docContent.trim()) return;
    try {
      setLoading(true);
      setLoadingStep('Extracting key requirements, features, and action items...');
      const res = await extractAiDocumentIntelligence(docContent, docTitle || 'Requirement Document');
      if (res.success && res.elements) {
        handleApplyGenerated(res.elements, `Doc: ${docTitle || 'Document'}`);
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
      setLoadingStep('');
    }
  };

  // Input Keyboard Navigation for Prompt History
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      if (promptHistory.length > 0 && historyIndex < promptHistory.length - 1) {
        const newIdx = historyIndex + 1;
        setHistoryIndex(newIdx);
        setInputPrompt(promptHistory[newIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      if (historyIndex > 0) {
        const newIdx = historyIndex - 1;
        setHistoryIndex(newIdx);
        setInputPrompt(promptHistory[newIdx]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInputPrompt('');
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          className="fixed top-16 right-0 bottom-0 w-[420px] max-w-[95vw] z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col"
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">AI Copilot</h3>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
                    COPILOT 2.0
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">Generative Canvas & Workflow Assistant</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Preview Toggle */}
              <button
                onClick={() => setPreviewMode(!previewMode)}
                title={previewMode ? 'Preview Mode Enabled (Review before apply)' : 'Instant Apply Mode'}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold border transition-all ${
                  previewMode
                    ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-800 text-purple-600 dark:text-purple-400'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800'
                }`}
              >
                <Eye className="w-3 h-3" />
                <span>{previewMode ? 'Preview ON' : 'Instant'}</span>
              </button>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 1-Click Undo AI Banner if active */}
          {lastAiState && (
            <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-950/60 border-b border-indigo-100 dark:border-indigo-900/40 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300 font-medium truncate max-w-[240px]">
                <Sparkles className="w-3.5 h-3.5 shrink-0 text-indigo-500" />
                <span className="truncate">Modified: {lastAiState.description}</span>
              </div>
              <button
                onClick={handleUndoAiChanges}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-[11px] shadow-sm transition-transform active:scale-95"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Undo AI</span>
              </button>
            </div>
          )}

          {/* Preview Banner if preview pending */}
          {previewElements && (
            <div className="p-3 bg-purple-50 dark:bg-purple-950/60 border-b border-purple-200 dark:border-purple-800/50 flex flex-col gap-2 text-xs">
              <div className="flex items-center justify-between font-bold text-purple-900 dark:text-purple-200">
                <span>Preview Ready ({previewElements.length} elements)</span>
                <span className="text-[10px] font-normal text-purple-600 dark:text-purple-400">
                  {previewPrompt}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleConfirmPreview}
                  className="flex-1 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-sm transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Insert Onto Canvas</span>
                </button>
                <button
                  onClick={handleDiscardPreview}
                  className="px-3 py-1.5 rounded-lg border border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-xs font-semibold transition-colors"
                >
                  Discard
                </button>
              </div>
            </div>
          )}

          {/* Navigation Tabs */}
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
              <div className="p-2.5 border-b border-slate-100 dark:border-slate-800/60 overflow-x-auto flex gap-1.5 no-scrollbar bg-slate-50/30 dark:bg-slate-900/30">
                {SUGGESTED_PROMPTS.map((sp) => (
                  <button
                    key={sp.label}
                    onClick={() => handleSendMessage(sp.prompt)}
                    className="whitespace-nowrap px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 border border-slate-200/80 dark:border-slate-700/80 shadow-xs transition-colors"
                  >
                    {sp.label}
                  </button>
                ))}
              </div>

              {/* Messages Stream */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
                {messages.map((msg, idx) => (
                  <motion.div
                    key={msg.id || idx}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15 }}
                    className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.sender === 'ai' && (
                      <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-sm shadow-indigo-500/20">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-indigo-600 text-white rounded-tr-none'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200/60 dark:border-slate-700/60'
                      }`}
                    >
                      <p className="whitespace-pre-line">{msg.text}</p>
                      <div className="flex items-center justify-between gap-3 mt-1.5 pt-1 border-t border-black/5 dark:border-white/5">
                        <span
                          className={`text-[9px] ${
                            msg.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'
                          }`}
                        >
                          {msg.time}
                        </span>
                        {msg.sender === 'ai' && lastPrompt && idx === messages.length - 1 && !loading && (
                          <button
                            onClick={() => handleSendMessage(lastPrompt)}
                            title="Regenerate this response"
                            className="flex items-center gap-1 text-[9px] font-semibold text-slate-400 hover:text-indigo-500 transition-colors"
                          >
                            <RotateCw className="w-2.5 h-2.5" />
                            <span>Regenerate</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Animated Loading State with Micro Telemetry */}
                {loading && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-2.5 items-start p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                  >
                    <Bot className="w-4 h-4 animate-spin shrink-0 mt-0.5 text-indigo-500" />
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-xs">AI Copilot Processing</span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {loadingStep || 'Synthesizing response...'}
                      </span>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Prompt Input Box & History Dropdown */}
              <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 relative">
                {/* History Dropdown Popup */}
                {showHistoryDropdown && promptHistory.length > 0 && (
                  <div className="absolute bottom-full left-3 right-3 mb-2 p-2 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-48 overflow-y-auto space-y-1 z-20">
                    <div className="flex items-center justify-between px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <span>Recent Prompt History</span>
                      <button
                        onClick={() => setShowHistoryDropdown(false)}
                        className="hover:text-slate-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    {promptHistory.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setInputPrompt(item);
                          setShowHistoryDropdown(false);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 transition-colors truncate"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                )}

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl px-3 py-2 border border-slate-200 dark:border-slate-700 focus-within:ring-2 focus-within:ring-indigo-500 transition-all"
                >
                  {/* Prompt History Toggle */}
                  {promptHistory.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowHistoryDropdown(!showHistoryDropdown)}
                      title="View Prompt History (or use ↑ / ↓)"
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors"
                    >
                      <History className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <input
                    type="text"
                    placeholder="Ask Copilot (e.g. 'Generate auth flowchart', 'Summarize board')..."
                    value={inputPrompt}
                    onChange={(e) => setInputPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={loading}
                    className="flex-1 bg-transparent text-xs text-slate-900 dark:text-white focus:outline-none"
                  />

                  <button
                    type="submit"
                    disabled={loading || !inputPrompt.trim()}
                    className="p-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-30 text-white shadow-sm shadow-indigo-500/20 transition-all"
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
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  className="w-full flex-1 p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none leading-relaxed"
                />
              </div>

              <button
                onClick={handleExtractDoc}
                disabled={loading || !docContent.trim()}
                className="w-full py-2.5 rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>{loading ? loadingStep || 'Synthesizing...' : 'Extract to Canvas Sticky Notes'}</span>
              </button>
            </div>
          )}

          {/* Tab: Layout Doctor & Critique */}
          {activeTab === 'critique' && (
            <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  Board Health & Alignment Analysis
                </span>
                <button
                  onClick={handleRunCritique}
                  disabled={loading}
                  className="text-[11px] font-semibold text-indigo-600 hover:underline cursor-pointer"
                >
                  Re-scan Board
                </button>
              </div>

              {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-2 text-slate-400">
                  <Wand2 className="w-6 h-6 animate-spin text-indigo-500" />
                  <span className="text-center">{loadingStep || 'Analyzing diagram topology...'}</span>
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
                          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        )}
                        <span>{c.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        {c.description}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
                  <Wand2 className="w-8 h-8 text-indigo-400 mb-2" />
                  <p className="font-semibold text-xs text-slate-600 dark:text-slate-300">No layout issues detected</p>
                  <p className="text-[11px] mt-1">Click "Re-scan Board" to run diagnostic checks on element alignment, contrast, and connections.</p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AiCopilotDrawer;
