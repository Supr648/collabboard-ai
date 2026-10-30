import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
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
import Minimap from '../components/whiteboard/Minimap';
import LiveReactions from '../components/whiteboard/LiveReactions';
import CommentsOverlay from '../components/whiteboard/CommentsOverlay';
import AiAssistantModal from '../components/whiteboard/AiAssistantModal';
import AiCopilotDrawer from '../components/whiteboard/AiCopilotDrawer';
import TasksModal from '../components/whiteboard/TasksModal';
import TemplatesModal from '../components/dashboard/TemplatesModal';
import VersionHistoryModal from '../components/whiteboard/VersionHistoryModal';
import ShareModal from '../components/whiteboard/ShareModal';
import Modal from '../components/common/Modal';
import Toast from '../components/common/Toast';
import CommandPalette from '../components/common/CommandPalette';
import ShortcutsModal from '../components/common/ShortcutsModal';
import {
  exportBoardAsPNG,
  exportBoardAsSVG,
  exportBoardAsPDF,
  generateThumbnail,
  getElementBoundingBox,
  bringToFront,
  sendToBack,
  bringForward,
  sendBackward,
  toggleLockElements,
  groupElements,
  ungroupElements,
} from '../utils/canvasUtils';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Radio,
  Presentation,
  CheckSquare,
  Download,
  Grid,
  Trash2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

const WhiteboardPage = () => {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDark } = useTheme();

  // Role from query param: ?role=viewer or default to editor
  const userRole = searchParams.get('role') === 'viewer' ? 'viewer' : 'editor';
  const isReadOnly = userRole === 'viewer';

  // Whiteboard metadata
  const [board, setBoard] = useState(null);
  const [title, setTitle] = useState('Untitled Whiteboard');
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('saved');

  // Canvas drawing state
  const [elements, setElements] = useState([]);
  const [selectedElements, setSelectedElements] = useState([]);
  const [clipboard, setClipboard] = useState([]);
  const [activeTool, setActiveTool] = useState('select');
  const [strokeColor, setStrokeColor] = useState('#6366f1');
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [fillColor, setFillColor] = useState('transparent');
  const [opacity, setOpacity] = useState(1);
  const [textConfig, setTextConfig] = useState({
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    bold: false,
    italic: false,
    underline: false,
    align: 'left',
  });

  // Zoom & Pan state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [isPresentation, setIsPresentation] = useState(false);

  // Undo / Redo History Stack & Version Checkpoints
  const [history, setHistory] = useState([[]]);
  const [historyStep, setHistoryStep] = useState(0);
  const [versionCheckpoints, setVersionCheckpoints] = useState([]);

  // Modals & Panels
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiCopilotOpen, setAiCopilotOpen] = useState(false);
  const [tasksModalOpen, setTasksModalOpen] = useState(false);
  const [taskToConvert, setTaskToConvert] = useState(null);
  const [templatesModalOpen, setTemplatesModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info' });
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);

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

  const handleRemoteUpdate = useCallback((updatedElement) => {
    setElements((prev) =>
      prev.map((el) => (el.id === updatedElement.id ? updatedElement : el))
    );
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
    remoteLaserTrail,
    remotePresentationSlide,
    incomingReactions,
    comments,
    typingUsers,
    emitCursorMove,
    emitElementAdd,
    emitElementUpdate,
    emitElementDelete,
    emitCanvasClear,
    emitCanvasSync,
    emitReaction,
    emitCommentAdd,
    emitCommentResolve,
    emitTyping,
    emitLaserPointer,
    emitPresentationSlide,
  } = useCollaboration({
    roomId,
    user,
    role: userRole,
    onRemoteSync: handleRemoteSync,
    onRemoteAdd: handleRemoteAdd,
    onRemoteUpdate: handleRemoteUpdate,
    onRemoteDelete: handleRemoteDelete,
    onRemoteClear: handleRemoteClear,
  });

  // Fetch initial whiteboard data from API or SessionStorage
  useEffect(() => {
    const fetchBoard = async () => {
      try {
        setLoading(true);

        // Check if there are template initial elements passed from Dashboard
        const sessionElementsRaw = sessionStorage.getItem(`init_elements_${roomId}`);
        let initialElements = [];
        if (sessionElementsRaw) {
          try {
            initialElements = JSON.parse(sessionElementsRaw);
            sessionStorage.removeItem(`init_elements_${roomId}`);
          } catch (e) {}
        }

        const res = await getWhiteboardByRoomId(roomId);
        if (res.success && res.whiteboard) {
          const wb = res.whiteboard;
          setBoard(wb);
          setTitle(wb.title || 'Untitled Whiteboard');
          const loadedElements = initialElements.length > 0 ? initialElements : wb.elements || [];
          setElements(loadedElements);
          setHistory([loadedElements]);
          setHistoryStep(0);
          setVersionCheckpoints([
            { id: 'v_init', title: 'Initial Load', elements: loadedElements, timestamp: new Date().toISOString() },
            ...(wb.versionHistory || []),
          ]);

          if (initialElements.length > 0) {
            triggerAutoSave(loadedElements);
          }
        }
      } catch (err) {
        setBoard({ roomId, title: 'Collaborative Workspace', owner: user?.id });
      } finally {
        setLoading(false);
      }
    };

    fetchBoard();
  }, [roomId]);

  // Debounced Auto-Save to backend
  const triggerAutoSave = useCallback(
    (currentElements) => {
      if (isReadOnly) return;
      setSaveStatus('saving');
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }

      autoSaveTimerRef.current = setTimeout(async () => {
        try {
          const thumbnail = generateThumbnail(currentElements, isDark);
          await saveWhiteboardState(roomId, currentElements, thumbnail);
          setSaveStatus('saved');

          // Record auto-save snapshot checkpoint every few saves
          setVersionCheckpoints((prev) => [
            {
              id: `v_${Date.now()}`,
              title: `Auto-save checkpoint (${currentElements.length} items)`,
              elements: [...currentElements],
              timestamp: new Date().toISOString(),
            },
            ...prev.slice(0, 15),
          ]);
        } catch (err) {
          setSaveStatus('saved');
        }
      }, 1500);
    },
    [roomId, isDark, isReadOnly]
  );

  // Add a newly drawn element
  const handleAddElement = useCallback(
    (element) => {
      if (isReadOnly) return;
      setElements((prev) => {
        const next = [...prev, element];
        setHistory((prevHist) => [...prevHist.slice(0, historyStep + 1), next]);
        setHistoryStep((prevStep) => prevStep + 1);

        emitElementAdd(element);
        triggerAutoSave(next);
        return next;
      });
    },
    [historyStep, emitElementAdd, triggerAutoSave, isReadOnly]
  );

  // Update an existing element (moved, resized, text edited)
  const handleUpdateElement = useCallback(
    (element) => {
      if (isReadOnly) return;
      setElements((prev) => {
        const next = prev.map((el) => (el.id === element.id ? element : el));
        emitElementUpdate(element);
        triggerAutoSave(next);
        return next;
      });
    },
    [emitElementUpdate, triggerAutoSave, isReadOnly]
  );

  // Insert multiple elements (from AI or Templates)
  const handleInsertElements = useCallback(
    (newElements) => {
      if (isReadOnly || !Array.isArray(newElements)) return;
      setElements((prev) => {
        const next = [...prev, ...newElements];
        setHistory((prevHist) => [...prevHist.slice(0, historyStep + 1), next]);
        setHistoryStep((prevStep) => prevStep + 1);

        emitCanvasSync(next, 'ai_insert');
        triggerAutoSave(next);
        return next;
      });

      confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
      setToast({ message: `Added ${newElements.length} elements to canvas!`, type: 'success' });
    },
    [historyStep, emitCanvasSync, triggerAutoSave, isReadOnly]
  );

  // Delete an element
  const handleDeleteElement = useCallback(
    (elementId) => {
      if (isReadOnly) return;
      setElements((prev) => {
        const next = prev.filter((el) => el.id !== elementId);
        setHistory((prevHist) => [...prevHist.slice(0, historyStep + 1), next]);
        setHistoryStep((prevStep) => prevStep + 1);

        emitElementDelete(elementId);
        triggerAutoSave(next);
        return next;
      });
    },
    [historyStep, emitElementDelete, triggerAutoSave, isReadOnly]
  );

  // Undo
  const handleUndo = useCallback(() => {
    if (isReadOnly) return;
    if (historyStep > 0) {
      const prevStep = historyStep - 1;
      const targetState = history[prevStep] || [];
      setHistoryStep(prevStep);
      setElements(targetState);
      emitCanvasSync(targetState, 'undo');
      triggerAutoSave(targetState);
    }
  }, [history, historyStep, emitCanvasSync, triggerAutoSave, isReadOnly]);

  // Redo
  const handleRedo = useCallback(() => {
    if (isReadOnly) return;
    if (historyStep < history.length - 1) {
      const nextStep = historyStep + 1;
      const targetState = history[nextStep] || [];
      setHistoryStep(nextStep);
      setElements(targetState);
      emitCanvasSync(targetState, 'redo');
      triggerAutoSave(targetState);
    }
  }, [history, historyStep, emitCanvasSync, triggerAutoSave, isReadOnly]);

  // Fit to content screen
  const handleFitToScreen = () => {
    if (elements.length === 0) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
      return;
    }

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    elements.forEach((el) => {
      const b = getElementBoundingBox(el);
      if (b) {
        minX = Math.min(minX, b.minX);
        minY = Math.min(minY, b.minY);
        maxX = Math.max(maxX, b.maxX);
        maxY = Math.max(maxY, b.maxY);
      }
    });

    const padding = 100;
    const contentW = maxX - minX + padding * 2;
    const contentH = maxY - minY + padding * 2;

    const scale = Math.min(window.innerWidth / contentW, window.innerHeight / contentH, 1.5);
    const newZoom = Math.max(0.2, Math.min(2.5, scale));

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    setZoom(newZoom);
    setPan({
      x: window.innerWidth / 2 - centerX * newZoom,
      y: window.innerHeight / 2 - centerY * newZoom,
    });
  };

  // Duplicate selected elements
  const handleDuplicateSelected = useCallback(() => {
    if (selectedElements.length === 0 || isReadOnly) return;

    const offset = 30;
    const duplicated = selectedElements.map((el) => {
      const copy = JSON.parse(JSON.stringify(el));
      copy.id = `el_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      if (copy.points) {
        copy.points = copy.points.map((p) => ({ x: p.x + offset, y: p.y + offset }));
      } else if (copy.x1 !== undefined) {
        copy.x1 += offset;
        copy.y1 += offset;
        copy.x2 += offset;
        copy.y2 += offset;
      } else if (copy.x !== undefined) {
        copy.x += offset;
        copy.y += offset;
      }
      return copy;
    });

    setElements((prev) => {
      const next = [...prev, ...duplicated];
      setHistory((prevHist) => [...prevHist.slice(0, historyStep + 1), next]);
      setHistoryStep((prevStep) => prevStep + 1);
      duplicated.forEach((d) => emitElementAdd(d));
      triggerAutoSave(next);
      return next;
    });

    setSelectedElements(duplicated);
  }, [selectedElements, historyStep, emitElementAdd, triggerAutoSave, isReadOnly]);

  // Presentation frames
  const frames = elements.filter((el) => el.type === 'frame');

  // Presentation slide navigator
  const navigateToFrame = useCallback(
    (index) => {
      if (frames.length === 0) return;
      const boundedIndex = Math.max(0, Math.min(frames.length - 1, index));
      setCurrentFrameIndex(boundedIndex);
      const target = frames[boundedIndex];
      if (target) {
        const minX = Math.min(target.x1, target.x2);
        const maxX = Math.max(target.x1, target.x2);
        const minY = Math.min(target.y1, target.y2);
        const maxY = Math.max(target.y1, target.y2);
        const w = Math.max(120, maxX - minX);
        const h = Math.max(120, maxY - minY);
        const scale = Math.min(Math.min((window.innerWidth * 0.82) / w, (window.innerHeight * 0.82) / h), 2.0);
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;
        setZoom(scale);
        setPan({
          x: window.innerWidth / 2 - centerX * scale,
          y: window.innerHeight / 2 - centerY * scale,
        });
        emitPresentationSlide(boundedIndex);
      }
    },
    [frames, emitPresentationSlide]
  );

  // Sync when presenter moves slide
  useEffect(() => {
    if (remotePresentationSlide && typeof remotePresentationSlide.frameIndex === 'number') {
      const idx = remotePresentationSlide.frameIndex;
      setCurrentFrameIndex(idx);
      if (!isPresentation) setIsPresentation(true);
      const target = frames[idx];
      if (target) {
        const minX = Math.min(target.x1, target.x2);
        const maxX = Math.max(target.x1, target.x2);
        const minY = Math.min(target.y1, target.y2);
        const maxY = Math.max(target.y1, target.y2);
        const w = Math.max(120, maxX - minX);
        const h = Math.max(120, maxY - minY);
        const scale = Math.min(Math.min((window.innerWidth * 0.82) / w, (window.innerHeight * 0.82) / h), 2.0);
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;
        setZoom(scale);
        setPan({
          x: window.innerWidth / 2 - centerX * scale,
          y: window.innerHeight / 2 - centerY * scale,
        });
      }
    }
  }, [remotePresentationSlide, frames, isPresentation]);

  // Object Layering
  const handleBringToFront = useCallback(
    (element) => {
      if (isReadOnly) return;
      const ids = element ? [element.id] : selectedElements.map((e) => e.id);
      if (ids.length === 0) return;
      setElements((prev) => {
        const next = bringToFront(prev, ids);
        emitCanvasSync(next, 'bring_to_front');
        triggerAutoSave(next);
        return next;
      });
    },
    [selectedElements, emitCanvasSync, triggerAutoSave, isReadOnly]
  );

  const handleSendToBack = useCallback(
    (element) => {
      if (isReadOnly) return;
      const ids = element ? [element.id] : selectedElements.map((e) => e.id);
      if (ids.length === 0) return;
      setElements((prev) => {
        const next = sendToBack(prev, ids);
        emitCanvasSync(next, 'send_to_back');
        triggerAutoSave(next);
        return next;
      });
    },
    [selectedElements, emitCanvasSync, triggerAutoSave, isReadOnly]
  );

  const handleToggleLock = useCallback(
    (element) => {
      if (isReadOnly) return;
      const ids = element ? [element.id] : selectedElements.map((e) => e.id);
      if (ids.length === 0) return;
      setElements((prev) => {
        const next = toggleLockElements(prev, ids);
        emitCanvasSync(next, 'toggle_lock');
        triggerAutoSave(next);
        return next;
      });
      setToast({ message: 'Toggled lock state', type: 'info' });
    },
    [selectedElements, emitCanvasSync, triggerAutoSave, isReadOnly]
  );

  const handleGroup = useCallback(() => {
    if (isReadOnly || selectedElements.length < 2) return;
    const ids = selectedElements.map((e) => e.id);
    setElements((prev) => {
      const next = groupElements(prev, ids);
      emitCanvasSync(next, 'group');
      triggerAutoSave(next);
      return next;
    });
    setToast({ message: `Grouped ${selectedElements.length} elements`, type: 'success' });
  }, [selectedElements, emitCanvasSync, triggerAutoSave, isReadOnly]);

  const handleUngroup = useCallback(() => {
    if (isReadOnly || selectedElements.length === 0) return;
    const ids = selectedElements.map((e) => e.id);
    setElements((prev) => {
      const next = ungroupElements(prev, ids);
      emitCanvasSync(next, 'ungroup');
      triggerAutoSave(next);
      return next;
    });
    setToast({ message: 'Ungrouped elements', type: 'info' });
  }, [selectedElements, emitCanvasSync, triggerAutoSave, isReadOnly]);

  // Convert Sticky Note / Canvas Element to Actionable Kanban Task
  const handleConvertToTask = useCallback((element) => {
    const text = element.text || element.title || `${element.type.toUpperCase()} Item`;
    setTaskToConvert({
      title: text.length > 50 ? text.slice(0, 50) + '...' : text,
      description: `Task created from whiteboard element (type: ${element.type}, ID: ${element.id})`,
      originElementId: element.id,
      priority: 'medium',
      status: 'backlog',
    });
    setTasksModalOpen(true);
  }, []);

  // AI Copilot Mutation Handler (Natural Language Commands)
  const handleUpdateCanvasElements = useCallback(
    (nextElements) => {
      if (isReadOnly || !Array.isArray(nextElements)) return;
      setElements(nextElements);
      setHistory((prevHist) => [...prevHist.slice(0, historyStep + 1), nextElements]);
      setHistoryStep((prevStep) => prevStep + 1);
      emitCanvasSync(nextElements, 'ai_command_mutate');
      triggerAutoSave(nextElements);
      setToast({ message: 'Canvas mutated by AI Copilot!', type: 'success' });
    },
    [historyStep, emitCanvasSync, triggerAutoSave, isReadOnly]
  );

  // Import Image
  const handleImportImage = (base64Data) => {
    if (isReadOnly) return;
    const img = new Image();
    img.onload = () => {
      const w = Math.min(400, img.width);
      const h = (img.height / img.width) * w;
      const newEl = {
        id: `el_img_${Date.now()}`,
        type: 'image',
        src: base64Data,
        x1: -pan.x / zoom + window.innerWidth / (2 * zoom) - w / 2,
        y1: -pan.y / zoom + window.innerHeight / (2 * zoom) - h / 2,
        x2: -pan.x / zoom + window.innerWidth / (2 * zoom) + w / 2,
        y2: -pan.y / zoom + window.innerHeight / (2 * zoom) + h / 2,
        strokeColor: '#cbd5e1',
        strokeWidth: 1,
      };
      handleAddElement(newEl);
      setSelectedElements([newEl]);
    };
    img.src = base64Data;
  };

  // Clear canvas
  const handleClearCanvas = useCallback(() => {
    if (isReadOnly) return;
    setElements([]);
    setSelectedElements([]);
    setHistory((prev) => [...prev.slice(0, historyStep + 1), []]);
    setHistoryStep((prev) => prev + 1);
    emitCanvasClear();
    triggerAutoSave([]);
    setClearModalOpen(false);
    setToast({ message: 'Canvas cleared', type: 'info' });
  }, [historyStep, emitCanvasClear, triggerAutoSave, isReadOnly]);

  // Rename title
  const handleRenameTitle = async (newTitle) => {
    setTitle(newTitle);
    if (board && (board._id || board.id)) {
      try {
        await updateWhiteboard(board._id || board.id, { title: newTitle });
        setToast({ message: 'Title saved', type: 'success' });
      } catch (err) {}
    }
  };

  // Restore version checkpoint
  const handleRestoreVersion = (versionElements) => {
    setElements(versionElements);
    setSelectedElements([]);
    setHistory((prev) => [...prev.slice(0, historyStep + 1), versionElements]);
    setHistoryStep((prev) => prev + 1);
    emitCanvasSync(versionElements, 'restore_checkpoint');
    triggerAutoSave(versionElements);
    setToast({ message: 'Restored board version checkpoint', type: 'success' });
  };

  // Exports
  const handleExportPNG = () => {
    exportBoardAsPNG(elements, title, isDark);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.9 } });
  };

  const handleExportSVG = () => {
    exportBoardAsSVG(elements, title, isDark);
  };

  const handleExportPDF = () => {
    exportBoardAsPDF(elements, title, isDark);
  };

  const whiteboardCommands = [
    {
      id: 'cmd_export_png',
      category: 'Canvas Export',
      title: 'Export as High-Res PNG',
      subtitle: 'Download the current board drawing as a PNG image',
      icon: Download,
      action: handleExportPNG,
    },
    {
      id: 'cmd_export_svg',
      category: 'Canvas Export',
      title: 'Export as Vector SVG',
      subtitle: 'Download vector graphic file with clean paths',
      icon: Download,
      action: handleExportSVG,
    },
    {
      id: 'cmd_export_pdf',
      category: 'Canvas Export',
      title: 'Export as PDF Document',
      subtitle: 'Generate formatted multi-page printable PDF',
      icon: Download,
      action: handleExportPDF,
    },
    {
      id: 'cmd_toggle_grid',
      category: 'Canvas Options',
      title: `Toggle Grid Snapping (${snapToGrid ? 'Active' : 'Off'})`,
      subtitle: 'Snap coordinates to 20px magnetic alignment grid',
      icon: Grid,
      action: () => setSnapToGrid(!snapToGrid),
    },
    {
      id: 'cmd_fit_screen',
      category: 'Canvas Navigation',
      title: 'Fit to Content',
      subtitle: 'Center and auto-zoom to fit all shapes',
      icon: Maximize2,
      action: handleFitToScreen,
    },
    {
      id: 'cmd_presentation',
      category: 'Collaboration',
      title: 'Start Presentation Mode',
      subtitle: 'Present frame slides full-screen to collaborators',
      icon: Presentation,
      action: () => {
        setIsPresentation(true);
        if (frames.length > 0) navigateToFrame(0);
      },
    },
    {
      id: 'cmd_clear_board',
      category: 'Destructive',
      title: 'Clear Entire Canvas',
      subtitle: 'Wipe all drawings and shapes on this whiteboard',
      icon: Trash2,
      action: () => setClearModalOpen(true),
    },
  ];

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      // Command Palette (Ctrl+K)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
        return;
      }

      // Shortcuts Guide (?)
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setShortcutsOpen((prev) => !prev);
        return;
      }

      // Undo / Redo
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }
      // Duplicate
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        handleDuplicateSelected();
      }
      // Copy & Paste
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        if (selectedElements.length > 0) {
          setClipboard(JSON.parse(JSON.stringify(selectedElements)));
          setToast({ message: `Copied ${selectedElements.length} element(s)`, type: 'info' });
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
        if (clipboard.length > 0 && !isReadOnly) {
          const offset = 25;
          const pasted = clipboard.map((c) => {
            const el = { ...c, id: `el_${Date.now()}_${Math.random().toString(36).substr(2, 6)}` };
            if (el.points) el.points = el.points.map((p) => ({ x: p.x + offset, y: p.y + offset }));
            else if (el.x1 !== undefined) {
              el.x1 += offset;
              el.y1 += offset;
              el.x2 += offset;
              el.y2 += offset;
            } else if (el.x !== undefined) {
              el.x += offset;
              el.y += offset;
            }
            return el;
          });
          pasted.forEach((p) => handleAddElement(p));
          setSelectedElements(pasted);
        }
      }
      // Delete Selected
      else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedElements.length > 0 && !isReadOnly) {
          selectedElements.forEach((sel) => handleDeleteElement(sel.id));
          setSelectedElements([]);
        }
      }
      // Tool Hotkeys
      else {
        switch (e.key.toLowerCase()) {
          case 'v': setActiveTool('select'); break;
          case 'p': setActiveTool('pen'); break;
          case 'h': setActiveTool('highlighter'); break;
          case 's': setActiveTool('sticky'); break;
          case 'r': setActiveTool('rectangle'); break;
          case 'c': setActiveTool('circle'); break;
          case 'd': setActiveTool('triangle'); break;
          case 'l': setActiveTool('line'); break;
          case 'a': setActiveTool('arrow'); break;
          case 't': setActiveTool('text'); break;
          case 'e': setActiveTool('eraser'); break;
          case 'escape':
            setSelectedElements([]);
            setIsPresentation(false);
            break;
          default: break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, handleDuplicateSelected, selectedElements, clipboard, isReadOnly]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            Loading CollabBoard AI Workspace...
          </p>
        </div>
      </div>
    );
  }

  const isOwner = !board?.owner || board?.owner === user?.id || board?.owner?._id === user?.id;

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none bg-slate-50 dark:bg-slate-950">
      {/* Top Header Bar */}
      <CollaboratorsBar
        title={title}
        onRenameTitle={handleRenameTitle}
        participants={participants}
        saveStatus={saveStatus}
        onOpenShare={() => setShareModalOpen(true)}
        onOpenAi={() => setAiModalOpen(true)}
        onOpenTemplates={() => setTemplatesModalOpen(true)}
        onOpenHistory={() => setHistoryModalOpen(true)}
        onOpenTasks={() => setTasksModalOpen(true)}
        onOpenCopilot={() => setAiCopilotOpen(true)}
        isOwner={isOwner}
        userRole={userRole}
        isPresentation={isPresentation}
      />

      {/* Floating Drawing Toolbar */}
      {!isPresentation && (
        <Toolbar
          activeTool={activeTool}
          onSelectTool={setActiveTool}
          onImportImage={handleImportImage}
          isReadOnly={isReadOnly}
        />
      )}

      {/* Properties Palette */}
      {!isPresentation && !isReadOnly && (
        <PropertiesBar
          strokeColor={strokeColor}
          onChangeStrokeColor={setStrokeColor}
          strokeWidth={strokeWidth}
          onChangeStrokeWidth={setStrokeWidth}
          fillColor={fillColor}
          onChangeFillColor={setFillColor}
          opacity={opacity}
          onChangeOpacity={setOpacity}
          activeTool={activeTool}
          textConfig={textConfig}
          onChangeTextConfig={(newCfg) => setTextConfig((prev) => ({ ...prev, ...newCfg }))}
          selectedElement={selectedElements[0]}
        />
      )}

      {/* Remote Collaborators Cursors */}
      <RemoteCursors cursors={cursors} zoom={zoom} pan={pan} />

      {/* Canvas Layer */}
      <Canvas
        elements={elements}
        onAddElement={handleAddElement}
        onUpdateElement={handleUpdateElement}
        onDeleteElement={handleDeleteElement}
        remoteLiveStroke={remoteLiveStroke}
        activeTool={activeTool}
        strokeColor={strokeColor}
        strokeWidth={strokeWidth}
        fillColor={fillColor}
        opacity={opacity}
        textConfig={textConfig}
        zoom={zoom}
        setZoom={setZoom}
        pan={pan}
        setPan={setPan}
        snapToGrid={snapToGrid}
        selectedElements={selectedElements}
        setSelectedElements={setSelectedElements}
        onCursorMove={emitCursorMove}
        isDark={isDark}
        isReadOnly={isReadOnly}
        onConvertToTask={handleConvertToTask}
        onLaserMove={emitLaserPointer}
        remoteLaserTrail={remoteLaserTrail}
        onBringToFront={handleBringToFront}
        onSendToBack={handleSendToBack}
        onToggleLock={handleToggleLock}
        onGroup={handleGroup}
        onUngroup={handleUngroup}
        onDuplicateSelected={handleDuplicateSelected}
      />

      {/* Pinned Comments on Canvas */}
      <CommentsOverlay
        comments={comments}
        onAddComment={emitCommentAdd}
        onResolveComment={emitCommentResolve}
        zoom={zoom}
        pan={pan}
        currentUser={user}
      />

      {/* Live Floating Emoji Reactions */}
      <LiveReactions
        onTriggerReaction={(emoji) => emitReaction(emoji, window.innerWidth / 2, window.innerHeight - 100)}
        incomingReactions={incomingReactions}
      />

      {/* Minimap */}
      {!isPresentation && (
        <Minimap
          elements={elements}
          zoom={zoom}
          pan={pan}
          setPan={setPan}
          isDark={isDark}
        />
      )}

      {/* Action Controls & Multi-Format Export */}
      {!isPresentation && (
        <ActionControls
          canUndo={historyStep > 0}
          canRedo={historyStep < history.length - 1}
          onUndo={handleUndo}
          onRedo={handleRedo}
          zoom={zoom}
          onZoomIn={() => setZoom((z) => Math.min(3, z * 1.2))}
          onZoomOut={() => setZoom((z) => Math.max(0.2, z / 1.2))}
          onResetZoom={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
          onFitToScreen={handleFitToScreen}
          snapToGrid={snapToGrid}
          onToggleSnapToGrid={() => setSnapToGrid(!snapToGrid)}
          onTogglePresentation={() => {
            setIsPresentation(true);
            if (frames.length > 0) navigateToFrame(0);
          }}
          onClearCanvas={() => setClearModalOpen(true)}
          onExportPNG={handleExportPNG}
          onExportSVG={handleExportSVG}
          onExportPDF={handleExportPDF}
        />
      )}

      {/* Presentation Mode Slideshow Header */}
      {isPresentation && (
        <div className="fixed top-5 inset-x-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="glass-panel px-4 py-2.5 rounded-2xl shadow-2xl border border-purple-500/50 bg-slate-900/90 backdrop-blur-xl text-white flex items-center gap-3 pointer-events-auto">
            <div className="flex items-center gap-1.5 text-xs font-bold text-purple-400">
              <Presentation className="w-4 h-4 text-purple-400 animate-pulse" />
              <span>Presentation</span>
            </div>

            {frames.length > 0 ? (
              <div className="flex items-center gap-2 border-l border-r border-slate-700/80 px-3">
                <button
                  onClick={() => navigateToFrame(currentFrameIndex - 1)}
                  disabled={currentFrameIndex === 0}
                  className="p-1.5 rounded-xl hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Previous Slide"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex flex-col items-center">
                  <span className="text-xs font-bold truncate max-w-[150px]">
                    {frames[currentFrameIndex]?.text || frames[currentFrameIndex]?.title || `Frame ${currentFrameIndex + 1}`}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {currentFrameIndex + 1} of {frames.length}
                  </span>
                </div>
                <button
                  onClick={() => navigateToFrame(currentFrameIndex + 1)}
                  disabled={currentFrameIndex === frames.length - 1}
                  className="p-1.5 rounded-xl hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Next Slide"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    emitPresentationSlide(currentFrameIndex);
                    setToast({ message: `Synced Slide ${currentFrameIndex + 1} to all collaborators!`, type: 'success' });
                  }}
                  className="p-1.5 rounded-xl hover:bg-purple-900/50 text-purple-300 transition-colors ml-1"
                  title="Broadcast slide view to all participants"
                >
                  <Radio className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <span className="text-xs text-slate-400 px-2 italic">
                No frames defined. Use Frame tool to add slides.
              </span>
            )}

            <button
              onClick={() => {
                if (!document.fullscreenElement) {
                  document.documentElement.requestFullscreen().catch(() => {});
                } else {
                  document.exitFullscreen().catch(() => {});
                }
              }}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-300 transition-colors"
              title="Toggle Fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsPresentation(false)}
              className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-500/20"
            >
              Exit (Esc)
            </button>
          </div>
        </div>
      )}

      {/* AI Assistant Modal */}
      <AiAssistantModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        onInsertElements={handleInsertElements}
        currentElements={elements}
        boardTitle={title}
      />

      {/* Project Management & Kanban Tasks Modal */}
      <TasksModal
        isOpen={tasksModalOpen}
        onClose={() => {
          setTasksModalOpen(false);
          setTaskToConvert(null);
        }}
        boardId={board?._id || board?.id || roomId}
        initialTaskData={taskToConvert}
        onClearInitial={() => setTaskToConvert(null)}
      />

      {/* AI Copilot Interactive Chat & Command Drawer */}
      <AiCopilotDrawer
        isOpen={aiCopilotOpen}
        onClose={() => setAiCopilotOpen(false)}
        elements={elements}
        selectedElements={selectedElements}
        onApplyElements={handleInsertElements}
        onUpdateCanvasElements={handleUpdateCanvasElements}
      />

      {/* Templates Blueprint Modal */}
      <TemplatesModal
        isOpen={templatesModalOpen}
        onClose={() => setTemplatesModalOpen(false)}
        onSelectTemplate={(tpl) => handleInsertElements(tpl.generateElements())}
      />

      {/* Version History Modal */}
      <VersionHistoryModal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        versions={versionCheckpoints}
        onRestoreVersion={handleRestoreVersion}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        roomId={roomId}
        title={title}
      />

      {/* Clear Canvas Confirmation */}
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

      {/* Universal Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onOpenTemplates={() => setTemplatesModalOpen(true)}
        onOpenShortcuts={() => setShortcutsOpen(true)}
        onOpenTasks={() => setTasksModalOpen(true)}
        onOpenAi={() => setAiModalOpen(true)}
        customCommands={whiteboardCommands}
      />

      {/* Global Keyboard Shortcuts Guide (?) */}
      <ShortcutsModal
        isOpen={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />

      {/* Toast Notification */}
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
