import React, { useState } from 'react';
import Modal from '../common/Modal';
import {
  generateAiDiagram,
  generateAiFlowchart,
  generateAiBrainstorm,
  summarizeBoardContent,
  explainBoardDiagram,
} from '../../api/ai';
import {
  Sparkles,
  Server,
  GitFork,
  BrainCircuit,
  FileText,
  HelpCircle,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';

const AI_TABS = [
  { id: 'diagram', label: 'Architecture Diagram', icon: Server },
  { id: 'flowchart', label: 'Flowchart Workflow', icon: GitFork },
  { id: 'brainstorm', label: 'Brainstorm Notes', icon: BrainCircuit },
  { id: 'summarize', label: 'Summarize Board', icon: FileText },
  { id: 'explain', label: 'Explain Diagram', icon: HelpCircle },
];

const AiAssistantModal = ({ isOpen, onClose, onInsertElements, currentElements = [], boardTitle = '' }) => {
  const [activeTab, setActiveTab] = useState('diagram');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);

    try {
      if (activeTab === 'diagram') {
        const data = await generateAiDiagram(prompt || 'Microservices cloud architecture');
        setResult(data);
      } else if (activeTab === 'flowchart') {
        const data = await generateAiFlowchart(prompt || 'User checkout and payment confirmation workflow');
        setResult(data);
      } else if (activeTab === 'brainstorm') {
        const data = await generateAiBrainstorm(prompt || 'Growth and viral product marketing strategies');
        setResult(data);
      } else if (activeTab === 'summarize') {
        const data = await summarizeBoardContent(currentElements, boardTitle);
        setResult(data);
      } else if (activeTab === 'explain') {
        const data = await explainBoardDiagram(currentElements);
        setResult(data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to synthesize AI content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyToCanvas = () => {
    if (result && Array.isArray(result.elements)) {
      onInsertElements(result.elements);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="CollabBoard AI Intelligence" maxWidth="max-w-2xl">
      <div className="space-y-5">
        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl glass-panel border border-slate-200 dark:border-slate-800 overflow-x-auto">
          {AI_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setResult(null);
                  setError('');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Input Form for Diagram, Flowchart, Brainstorm */}
        {['diagram', 'flowchart', 'brainstorm'].includes(activeTab) && (
          <form onSubmit={handleGenerate} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                {activeTab === 'diagram' && 'Describe System or Architecture to Design'}
                {activeTab === 'flowchart' && 'Describe Workflow or Process Steps'}
                {activeTab === 'brainstorm' && 'Topic to Brainstorm Ideas For'}
              </label>
              <textarea
                rows={3}
                required
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={
                  activeTab === 'diagram'
                    ? 'e.g. Distributed ride-sharing architecture with WebSockets, Kafka, Driver matching service, and Redis...'
                    : activeTab === 'flowchart'
                    ? 'e.g. Customer KYC verification workflow with ID check, fraud detection, manual review, and approval...'
                    : 'e.g. Mobile application retention ideas and gamification rewards...'
                }
                className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-500" />
                Validated JSON canvas generation
              </span>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs shadow-md shadow-indigo-500/25 transition-all hover:scale-105 disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>{loading ? 'Synthesizing...' : 'Generate with AI'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Summarize & Explain Mode Trigger */}
        {['summarize', 'explain'].includes(activeTab) && (
          <div className="p-4 rounded-2xl glass-panel border border-slate-200 dark:border-slate-800 text-center space-y-3">
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {activeTab === 'summarize'
                ? `Analyze all ${currentElements.length} elements and sticky notes on this board to extract key takeaways and action items.`
                : `Scan the canvas diagram components and connection arrows to generate a clear executive summary of the system architecture.`}
            </p>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold shadow-md shadow-indigo-500/25 hover:scale-105 transition-all disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>{loading ? 'Analyzing...' : activeTab === 'summarize' ? 'Summarize Board Content' : 'Explain Diagram'}</span>
            </button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-300">
            {error}
          </div>
        )}

        {/* Results Preview Box */}
        {result && (
          <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                AI Generation Successful
              </span>
              {result.elements && (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                  {result.elements.length} elements ready
                </span>
              )}
            </div>

            {/* Diagram / Flowchart Summary */}
            {result.summary && typeof result.summary === 'string' && (
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                {result.summary}
              </p>
            )}

            {/* Board Summarizer Report */}
            {result.summary && typeof result.summary === 'object' && (
              <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                <p className="font-semibold text-slate-900 dark:text-white">
                  {result.summary.executiveSummary}
                </p>
                {result.summary.keyTakeaways && (
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block mb-1">
                      Key Takeaways:
                    </span>
                    <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                      {result.summary.keyTakeaways.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {result.summary.actionItems && (
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1">
                      Action Items:
                    </span>
                    <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                      {result.summary.actionItems.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Explanation Report */}
            {result.explanation && (
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {result.explanation}
              </p>
            )}

            {/* Apply CTA */}
            {result.elements && result.elements.length > 0 && (
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleApplyToCanvas}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/25 flex items-center gap-1.5 transition-all hover:scale-105"
                >
                  <span>Insert Directly onto Canvas</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default AiAssistantModal;
