import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getWhiteboardByRoomId, saveWhiteboardState, updateWhiteboard } from '../api/whiteboard';
import { useCollaboration } from '../hooks/useCollaboration';
import Canvas from '../components/whiteboard/Canvas';
import Toolbar from '../components/whiteboard/Toolbar';
import PropertiesBar from '../components/whiteboard/PropertiesBar';
import ActionControls from '../components/whiteboard/ActionControls';
import CollaboratorsBar from '../components/whiteboard/CollaboratorsBar';
import RemoteCursors from '../components/whiteboard/RemoteCursors';
import ShareModal from '../components/whiteboard/ShareModal';
import Modal from '../components/common/Modal';
import Toast from '../components/common/Toast';
import { exportBoardAsPNG, generateThumbnail } from '../utils/canvasUtils';
import confetti from 'canvas-confetti';

const WhiteboardPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDark } = useTheme();

  // Whiteboard metadata
  const [board, setBoard] = useState(null);
  const [title, setTitle] = useState('Untitled Whiteboard');
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved' | 'saving' | 'unsaved'

  // Canvas drawing state
  const [elements, setElements] = useState([]);
  const [activeTool, setActiveTool] = useState('pen');
  const [strokeColor, setStrokeColor] = useState('#6366f1');
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [fillColor, setFillColor] = useState('transparent');

  // Zoom & Pan state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // Undo / Redo History Stack
  const [history, setHistory] = useState([[]]);
  const [historyStep, setHistoryStep] = useState(0);

  // Modals & Toasts
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  const autoSaveTimerRef = useRef(null);

  // Collaboration callbacks
  const handleRemoteSync = useCallback((remoteElements) => {
    setElements(remoteElements);
    setHistory((prev) => [...prev.slice(0, historyStep + 1), remoteElements]);
    setHistoryStep((prev) => prev + 1);
  }, [historyStep]);

  const handleRemoteAdd = useCallback((newElement) => {
    setElements((prev) => [...prev, newElement]);
  }, []);

  const handleRemoteDelete = useCallback((elementId) => {
    setElements((prev) => prev.filter((el) => el.id !== elementId));
  }, []);

  const handleRemoteClear = useCallback(() => {
    setElements([]);
    setToast({ message: 'Canvas was cleared by a collaborator', type: 'info' });
  }, []);

  // Hook for Socket.IO real-time collaboration
  const {
    participants,
    cursors,
    remoteLiveStroke,
    connectionStatus,
    emitCursorMove,
    emitElementAdd,
    emitElementDelete,
    emitCanvasClear,
    emitCanvasSync,
  } = useCollaboration({
    roomId,
    user,
    onRemoteSync: handleRemoteSync,
    onRemoteAdd: handleRemoteAdd,
    onRemoteDelete: handleRemoteDelete,
    onRemoteClear: handleRemoteClear,
  });

  // Fetch initial whiteboard data from API
  useEffect(() => {
    const fetchBoard = async () => {
      try {
        setLoading(true);
        const res = await getWhiteboardByRoomId(roomId);
        if (res.success && res.whiteboard) {
          const wb = res.whiteboard;
          setBoard(wb);
          setTitle(wb.title || 'Untitled Whiteboard');
          const initialElements = wb.elements || [];
          setElements(initialElements);
          setHistory([initialElements]);
          setHistoryStep(0);
        }
      } catch (err) {
        console.warn('Whiteboard not in database yet; creating dynamic session room:', err.message);
        // Allow dynamic rooms even if unpersisted initially
        setBoard({ roomId, title: 'Collaborative Session', owner: user?.id });
      } finally {
        setLoading(false);
      }
    };

    fetchBoard();
  }, [roomId]);

  // Debounced Auto-Save to backend
  const triggerAutoSave = useCallback(
    (currentElements) => {
      setSaveStatus('saving');
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }

      autoSaveTimerRef.current = setTimeout(async () => {
        try {
          const thumbnail = generateThumbnail(currentElements, isDark);
          await saveWhiteboardState(roomId, currentElements, thumbnail);
          setSaveStatus('saved');
        } catch (err) {
          // If public room or unauthenticated guest, ignore save error
          setSaveStatus('saved');
        }
      }, 1500);
    },
    [roomId, isDark]
  );

  // Add a newly drawn element
  const handleAddElement = useCallback(
    (element) => {
      setElements((prev) => {
        const next = [...prev, element];

        // Record history snapshot for undo/redo
        setHistory((prevHist) => {
          const nextHist = prevHist.slice(0, historyStep + 1);
          return [...nextHist, next];
        });
        setHistoryStep((prevStep) => prevStep + 1);

        // Emit through Socket.IO to collaborators
        emitElementAdd(element);

        // Trigger Auto-Save
        triggerAutoSave(next);

        return next;
      });
    },
    [historyStep, emitElementAdd, triggerAutoSave]
  );

  // Delete an element (eraser)
  const handleDeleteElement = useCallback(
    (elementId) => {
      setElements((prev) => {
        const next = prev.filter((el) => el.id !== elementId);

        setHistory((prevHist) => [...prevHist.slice(0, historyStep + 1), next]);
        setHistoryStep((prevStep) => prevStep + 1);

        emitElementDelete(elementId);
        triggerAutoSave(next);

        return next;
      });
    },
    [historyStep, emitElementDelete, triggerAutoSave]
  );

  // Undo
  const handleUndo = useCallback(() => {
    if (historyStep > 0) {
      const prevStep = historyStep - 1;
      const targetState = history[prevStep] || [];
      setHistoryStep(prevStep);
      setElements(targetState);
      emitCanvasSync(targetState, 'undo');
      triggerAutoSave(targetState);
    }
  }, [history, historyStep, emitCanvasSync, triggerAutoSave]);

  // Redo
  const handleRedo = useCallback(() => {
    if (historyStep < history.length - 1) {
      const nextStep = historyStep + 1;
      const targetState = history[nextStep] || [];
      setHistoryStep(nextStep);
      setElements(targetState);
      emitCanvasSync(targetState, 'redo');
      triggerAutoSave(targetState);
    }
  }, [history, historyStep, emitCanvasSync, triggerAutoSave]);

  // Clear canvas
  const handleClearCanvas = useCallback(() => {
    setElements([]);
    setHistory((prev) => [...prev.slice(0, historyStep + 1), []]);
    setHistoryStep((prev) => prev + 1);
    emitCanvasClear();
    triggerAutoSave([]);
    setClearModalOpen(false);
    setToast({ message: 'Canvas cleared', type: 'info' });
  }, [historyStep, emitCanvasClear, triggerAutoSave]);

  // Rename title
  const handleRenameTitle = async (newTitle) => {
    setTitle(newTitle);
    if (board && (board._id || board.id)) {
      try {
        await updateWhiteboard(board._id || board.id, { title: newTitle });
        setToast({ message: 'Title saved', type: 'success' });
      } catch (err) {
        // Non-fatal
      }
    }
  };

  // Export PNG
  const handleExportPNG = () => {
    exportBoardAsPNG(elements, title, isDark);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.9 },
    });
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is typing in text area or input
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      } else {
        switch (e.key.toLowerCase()) {
          case 'v':
            setActiveTool('select');
            break;
          case 'p':
            setActiveTool('pen');
            break;
          case 'e':
            setActiveTool('eraser');
            break;
          case 'l':
            setActiveTool('line');
            break;
          case 'a':
            setActiveTool('arrow');
            break;
          case 'r':
            setActiveTool('rectangle');
            break;
          case 'c':
            setActiveTool('circle');
            break;
          case 't':
            setActiveTool('text');
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            Joining room #{roomId}...
          </p>
        </div>
      </div>
    );
  }

  const isOwner = !board?.owner || board?.owner === user?.id || board?.owner?._id === user?.id;

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none bg-slate-50 dark:bg-slate-950">
      {/* Top Bar: Title, Save Status, Collaborator Avatars, Share Button */}
      <CollaboratorsBar
        title={title}
        onRenameTitle={handleRenameTitle}
        participants={participants}
        saveStatus={saveStatus}
        onOpenShare={() => setShareModalOpen(true)}
        isOwner={isOwner}
      />

      {/* Floating Drawing Tool Selection Bar */}
      <Toolbar activeTool={activeTool} onSelectTool={setActiveTool} />

      {/* Floating Properties Palette (Colors, Stroke Width, Fill) */}
      <PropertiesBar
        strokeColor={strokeColor}
        onChangeStrokeColor={setStrokeColor}
        strokeWidth={strokeWidth}
        onChangeStrokeWidth={setStrokeWidth}
        fillColor={fillColor}
        onChangeFillColor={setFillColor}
        activeTool={activeTool}
      />

      {/* Remote Live Collaborators Cursor Overlay */}
      <RemoteCursors cursors={cursors} zoom={zoom} pan={pan} />

      {/* Interactive Canvas Surface */}
      <Canvas
        elements={elements}
        onAddElement={handleAddElement}
        onDeleteElement={handleDeleteElement}
        remoteLiveStroke={remoteLiveStroke}
        activeTool={activeTool}
        strokeColor={strokeColor}
        strokeWidth={strokeWidth}
        fillColor={fillColor}
        zoom={zoom}
        setZoom={setZoom}
        pan={pan}
        setPan={setPan}
        onCursorMove={emitCursorMove}
        isDark={isDark}
      />

      {/* Action Controls (Undo, Redo, Zoom In/Out, Clear Canvas, Export PNG) */}
      <ActionControls
        canUndo={historyStep > 0}
        canRedo={historyStep < history.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
        zoom={zoom}
        onZoomIn={() => setZoom((z) => Math.min(3, z * 1.2))}
        onZoomOut={() => setZoom((z) => Math.max(0.2, z / 1.2))}
        onResetZoom={() => {
          setZoom(1);
          setPan({ x: 0, y: 0 });
        }}
        onClearCanvas={() => setClearModalOpen(true)}
        onExportPNG={handleExportPNG}
      />

      {/* Share Invitation Modal */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        roomId={roomId}
        title={title}
      />

      {/* Clear Canvas Confirmation Modal */}
      <Modal
        isOpen={clearModalOpen}
        onClose={() => setClearModalOpen(false)}
        title="Clear Entire Canvas?"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            This will wipe all {elements.length} elements from the whiteboard for all participants in this room.
          </p>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={() => setClearModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              onClick={handleClearCanvas}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-500/20"
            >
              Yes, Clear Canvas
            </button>
          </div>
        </div>
      </Modal>

      {/* Toast Alert Notification */}
      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: '', type: 'info' })}
        />
      )}
    </div>
  );
};

export default WhiteboardPage;
