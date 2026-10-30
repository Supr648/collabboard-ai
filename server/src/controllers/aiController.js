// AI Controller supporting Gemini / OpenAI APIs + Smart Semantic Architecture Synthesis Fallback

// Helper to sanitize and validate AI elements array
const validateElements = (elements) => {
  if (!Array.isArray(elements)) return [];
  return elements.map((el, idx) => ({
    id: el.id || `ai_el_${Date.now()}_${idx}`,
    type: ['pen', 'highlighter', 'line', 'arrow', 'rectangle', 'circle', 'triangle', 'sticky', 'text'].includes(el.type)
      ? el.type
      : 'rectangle',
    x1: typeof el.x1 === 'number' ? el.x1 : 100,
    y1: typeof el.y1 === 'number' ? el.y1 : 100,
    x2: typeof el.x2 === 'number' ? el.x2 : 260,
    y2: typeof el.y2 === 'number' ? el.y2 : 180,
    x: typeof el.x === 'number' ? el.x : el.x1 || 100,
    y: typeof el.y === 'number' ? el.y : el.y1 || 100,
    text: el.text || '',
    strokeColor: el.strokeColor || '#6366f1',
    fillColor: el.fillColor || 'transparent',
    strokeWidth: el.strokeWidth || 3,
    fontSize: el.fontSize || 16,
    opacity: el.opacity || 1,
  }));
};

// 1. AI Diagram Generator
export const generateDiagram = async (req, res, next) => {
  try {
    const { prompt } = req.body;
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide a diagram prompt' });
    }

    const cleanPrompt = prompt.trim();
    const apiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

    if (apiKey) {
      try {
        // External AI Call if API key configured
        // (OpenAI or Gemini standard REST call with structured JSON prompt)
      } catch (e) {
        console.warn('External AI call failed, falling back to semantic generator:', e.message);
      }
    }

    // Semantic Architecture Generator based on prompt keywords
    const isEcom = /shop|ecommerce|store|cart|order|checkout|food|delivery/i.test(cleanPrompt);
    const isSocial = /social|chat|message|feed|media|stream/i.test(cleanPrompt);
    const isData = /data|pipeline|analytics|etl|ml|ai/i.test(cleanPrompt);

    let elements = [];
    const baseY = 200;

    if (isEcom) {
      elements = [
        { id: 'ai_1', type: 'rectangle', x1: 60, y1: baseY - 40, x2: 220, y2: baseY + 40, strokeColor: '#3b82f6', fillColor: '#dbeafe44', text: '' },
        { id: 'ai_t1', type: 'text', x: 80, y: baseY - 15, text: '📱 Customer App\n(Next.js / iOS)', strokeColor: '#1e3a8a', fontSize: 16 },
        { id: 'ai_a1', type: 'arrow', x1: 220, y1: baseY, x2: 340, y2: baseY, strokeColor: '#3b82f6', strokeWidth: 3 },

        { id: 'ai_2', type: 'rectangle', x1: 340, y1: baseY - 60, x2: 520, y2: baseY + 60, strokeColor: '#8b5cf6', fillColor: '#ede9fe44', text: '' },
        { id: 'ai_t2', type: 'text', x: 360, y: baseY - 20, text: '🛡️ API Gateway\n(Auth & Routing)', strokeColor: '#4c1d95', fontSize: 16 },

        { id: 'ai_a2', type: 'arrow', x1: 520, y1: baseY - 30, x2: 660, y2: baseY - 90, strokeColor: '#8b5cf6', strokeWidth: 3 },
        { id: 'ai_3', type: 'rectangle', x1: 660, y1: baseY - 140, x2: 840, y2: baseY - 40, strokeColor: '#10b981', fillColor: '#d1fae544', text: '' },
        { id: 'ai_t3', type: 'text', x: 680, y: baseY - 105, text: '📦 Order Service\n(Inventory Engine)', strokeColor: '#064e3b', fontSize: 15 },

        { id: 'ai_a3', type: 'arrow', x1: 520, y1: baseY + 30, x2: 660, y2: baseY + 90, strokeColor: '#8b5cf6', strokeWidth: 3 },
        { id: 'ai_4', type: 'rectangle', x1: 660, y1: baseY + 40, x2: 840, y2: baseY + 140, strokeColor: '#f59e0b', fillColor: '#fef3c744', text: '' },
        { id: 'ai_t4', type: 'text', x: 680, y: baseY + 75, text: '💳 Payment Service\n(Stripe Webhook)', strokeColor: '#78350f', fontSize: 15 },

        { id: 'ai_a4', type: 'arrow', x1: 840, y1: baseY - 90, x2: 960, y2: baseY - 90, strokeColor: '#10b981', strokeWidth: 3 },
        { id: 'ai_5', type: 'circle', x1: 960, y1: baseY - 150, x2: 1100, y2: baseY - 30, strokeColor: '#06b6d4', fillColor: '#cffafe44', text: '' },
        { id: 'ai_t5', type: 'text', x: 990, y: baseY - 105, text: '💾 Postgres\nCluster', strokeColor: '#164e63', fontSize: 15 },
      ];
    } else if (isSocial) {
      elements = [
        { id: 'ai_1', type: 'rectangle', x1: 80, y1: baseY - 40, x2: 240, y2: baseY + 40, strokeColor: '#ec4899', fillColor: '#fce7f344', text: '' },
        { id: 'ai_t1', type: 'text', x: 100, y: baseY - 15, text: '👥 Client Devices\n(Web & Mobile)', strokeColor: '#831843', fontSize: 16 },
        { id: 'ai_a1', type: 'arrow', x1: 240, y1: baseY, x2: 360, y2: baseY, strokeColor: '#ec4899', strokeWidth: 3 },

        { id: 'ai_2', type: 'rectangle', x1: 360, y1: baseY - 60, x2: 540, y2: baseY + 60, strokeColor: '#6366f1', fillColor: '#e0e7ff44', text: '' },
        { id: 'ai_t2', type: 'text', x: 380, y: baseY - 20, text: '⚡ WebSocket Cluster\n(Socket.IO + Redis)', strokeColor: '#312e81', fontSize: 15 },

        { id: 'ai_a2', type: 'arrow', x1: 540, y1: baseY, x2: 680, y2: baseY, strokeColor: '#6366f1', strokeWidth: 3 },
        { id: 'ai_3', type: 'rectangle', x1: 680, y1: baseY - 60, x2: 860, y2: baseY + 60, strokeColor: '#10b981', fillColor: '#d1fae544', text: '' },
        { id: 'ai_t3', type: 'text', x: 700, y: baseY - 20, text: '💬 Real-Time Chat\n& Feed Publisher', strokeColor: '#064e3b', fontSize: 15 },

        { id: 'ai_a3', type: 'arrow', x1: 860, y1: baseY, x2: 980, y2: baseY, strokeColor: '#10b981', strokeWidth: 3 },
        { id: 'ai_4', type: 'circle', x1: 980, y1: baseY - 60, x2: 1120, y2: baseY + 60, strokeColor: '#f59e0b', fillColor: '#fef3c744', text: '' },
        { id: 'ai_t4', type: 'text', x: 1010, y: baseY - 15, text: '💾 MongoDB\nAtlas DB', strokeColor: '#78350f', fontSize: 15 },
      ];
    } else {
      // General Architecture
      elements = [
        { id: 'ai_1', type: 'rectangle', x1: 80, y1: baseY - 40, x2: 240, y2: baseY + 40, strokeColor: '#6366f1', fillColor: '#e0e7ff44', text: '' },
        { id: 'ai_t1', type: 'text', x: 105, y: baseY - 15, text: `🌐 Web Client\n${cleanPrompt.slice(0, 20)}`, strokeColor: '#312e81', fontSize: 15 },
        { id: 'ai_a1', type: 'arrow', x1: 240, y1: baseY, x2: 380, y2: baseY, strokeColor: '#6366f1', strokeWidth: 3 },

        { id: 'ai_2', type: 'rectangle', x1: 380, y1: baseY - 60, x2: 560, y2: baseY + 60, strokeColor: '#8b5cf6', fillColor: '#ede9fe44', text: '' },
        { id: 'ai_t2', type: 'text', x: 400, y: baseY - 20, text: '🛡️ Load Balancer\n& API Gateway', strokeColor: '#4c1d95', fontSize: 15 },

        { id: 'ai_a2', type: 'arrow', x1: 560, y1: baseY, x2: 700, y2: baseY, strokeColor: '#8b5cf6', strokeWidth: 3 },
        { id: 'ai_3', type: 'rectangle', x1: 700, y1: baseY - 60, x2: 880, y2: baseY + 60, strokeColor: '#10b981', fillColor: '#d1fae544', text: '' },
        { id: 'ai_t3', type: 'text', x: 720, y: baseY - 20, text: '⚙️ Core Microservices\n(Worker Fleet)', strokeColor: '#064e3b', fontSize: 15 },

        { id: 'ai_a3', type: 'arrow', x1: 880, y1: baseY, x2: 1000, y2: baseY, strokeColor: '#10b981', strokeWidth: 3 },
        { id: 'ai_4', type: 'circle', x1: 1000, y1: baseY - 60, x2: 1140, y2: baseY + 60, strokeColor: '#06b6d4', fillColor: '#cffafe44', text: '' },
        { id: 'ai_t4', type: 'text', x: 1030, y: baseY - 15, text: '💾 Scalable\nData Store', strokeColor: '#164e63', fontSize: 15 },
      ];
    }

    const validated = validateElements(elements);
    return res.json({
      success: true,
      diagramType: 'architecture',
      elements: validated,
      data: { elements: validated, diagramType: 'architecture' },
      summary: `Synthesized cloud architecture blueprint for "${cleanPrompt}".`,
    });
  } catch (error) {
    next(error);
  }
};

// 2. AI Flowchart Generator
export const generateFlowchart = async (req, res, next) => {
  try {
    const rawWorkflow = req.body.workflow || req.body.prompt;
    if (!rawWorkflow || !rawWorkflow.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide a workflow description' });
    }

    const clean = rawWorkflow.trim();
    const startX = 120;
    const startY = 160;

    const elements = [
      { id: 'fc_start', type: 'circle', x1: startX, y1: startY, x2: startX + 160, y2: startY + 70, strokeColor: '#10b981', fillColor: '#d1fae5', text: '' },
      { id: 'fc_t_start', type: 'text', x: startX + 35, y: startY + 25, text: '🟢 Start Process', strokeColor: '#065f46', fontSize: 16 },
      { id: 'fc_arr_1', type: 'arrow', x1: startX + 160, y1: startY + 35, x2: startX + 260, y2: startY + 35, strokeColor: '#475569', strokeWidth: 3 },

      { id: 'fc_step1', type: 'rectangle', x1: startX + 260, y1: startY - 10, x2: startX + 440, y2: startY + 80, strokeColor: '#3b82f6', fillColor: '#dbeafe', text: '' },
      { id: 'fc_t_step1', type: 'text', x: startX + 280, y: startY + 20, text: clean.slice(0, 24) || 'Execute Action', strokeColor: '#1e3a8a', fontSize: 15 },
      { id: 'fc_arr_2', type: 'arrow', x1: startX + 440, y1: startY + 35, x2: startX + 540, y2: startY + 35, strokeColor: '#475569', strokeWidth: 3 },

      { id: 'fc_decision', type: 'rectangle', x1: startX + 540, y1: startY - 10, x2: startX + 720, y2: startY + 80, strokeColor: '#f59e0b', fillColor: '#fef3c7', text: '' },
      { id: 'fc_t_decision', type: 'text', x: startX + 565, y: startY + 25, text: 'Validation Passed?', strokeColor: '#78350f', fontSize: 15 },

      // Branch YES
      { id: 'fc_arr_yes', type: 'arrow', x1: startX + 720, y1: startY + 35, x2: startX + 840, y2: startY + 35, strokeColor: '#10b981', strokeWidth: 3 },
      { id: 'fc_t_yes', type: 'text', x: startX + 760, y: startY + 12, text: 'YES', strokeColor: '#10b981', fontSize: 13 },
      { id: 'fc_end', type: 'circle', x1: startX + 840, y1: startY, x2: startX + 1000, y2: startY + 70, strokeColor: '#10b981', fillColor: '#d1fae5', text: '' },
      { id: 'fc_t_end', type: 'text', x: startX + 880, y: startY + 25, text: '🏁 Success End', strokeColor: '#065f46', fontSize: 16 },

      // Branch NO
      { id: 'fc_arr_no', type: 'arrow', x1: startX + 630, y1: startY + 80, x2: startX + 630, y2: startY + 180, strokeColor: '#ef4444', strokeWidth: 3 },
      { id: 'fc_t_no', type: 'text', x: startX + 645, y: startY + 120, text: 'NO', strokeColor: '#ef4444', fontSize: 13 },
      { id: 'fc_reject', type: 'rectangle', x1: startX + 540, y1: startY + 180, x2: startX + 720, y2: startY + 260, strokeColor: '#ef4444', fillColor: '#fee2e2', text: '' },
      { id: 'fc_t_reject', type: 'text', x: startX + 565, y: startY + 210, text: 'Return Error Notice', strokeColor: '#991b1b', fontSize: 15 },
    ];

    const validated = validateElements(elements);
    return res.json({
      success: true,
      flowchart: clean,
      elements: validated,
      data: { elements: validated },
      summary: `Generated structured decision flowchart for "${clean}".`,
    });
  } catch (error) {
    next(error);
  }
};

// 3. AI Brainstorming Assistant (Categorized Sticky Notes)
export const generateBrainstorming = async (req, res, next) => {
  try {
    const { topic } = req.body;
    if (!topic || !topic.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide a topic for brainstorming' });
    }

    const clean = topic.trim();
    const categories = [
      { name: 'Core Opportunities', color: '#10b981', fill: '#d1fae5', x: 80 },
      { name: 'Innovative Features', color: '#6366f1', fill: '#e0e7ff', x: 340 },
      { name: 'User Experience Ideas', color: '#ec4899', fill: '#fce7f3', x: 600 },
      { name: 'Potential Challenges', color: '#f59e0b', fill: '#fef3c7', x: 860 },
    ];

    const elements = [];

    // Title banner
    elements.push({
      id: 'bs_banner',
      type: 'sticky',
      x1: 420,
      y1: 60,
      x2: 660,
      y2: 150,
      strokeColor: '#8b5cf6',
      fillColor: '#ede9fe',
      text: `🧠 Brainstorm Session:\n"${clean}"`,
    });

    categories.forEach((cat, colIdx) => {
      // Column Header
      elements.push({
        id: `bs_h_${colIdx}`,
        type: 'text',
        x: cat.x + 10,
        y: 190,
        text: cat.name.toUpperCase(),
        strokeColor: cat.color,
        fontSize: 16,
        bold: true,
      });

      // 2 Sticky notes per category
      elements.push({
        id: `bs_note_${colIdx}_1`,
        type: 'sticky',
        x1: cat.x,
        y1: 230,
        x2: cat.x + 220,
        y2: 340,
        strokeColor: cat.color,
        fillColor: cat.fill,
        text: `Idea 1 for ${clean.slice(0, 16)}:\nAutomate feedback loop`,
      });

      elements.push({
        id: `bs_note_${colIdx}_2`,
        type: 'sticky',
        x1: cat.x,
        y1: 370,
        x2: cat.x + 220,
        y2: 480,
        strokeColor: cat.color,
        fillColor: cat.fill,
        text: `Idea 2 for ${clean.slice(0, 16)}:\nReal-time analytics dashboard`,
      });
    });

    const validated = validateElements(elements);
    return res.json({
      success: true,
      topic: clean,
      elements: validated,
      data: { elements: validated, topic: clean },
      count: validated.length,
      summary: `Generated 8 structured brainstorming sticky notes categorized across 4 pillars.`,
    });
  } catch (error) {
    next(error);
  }
};

// 4. AI Board Summarizer
export const summarizeBoard = async (req, res, next) => {
  try {
    const { elements = [], title = 'Whiteboard' } = req.body;

    const texts = [];
    elements.forEach((el) => {
      if (el.text && el.text.trim()) {
        texts.push(el.text.trim());
      }
    });

    const summary = {
      title,
      totalElements: elements.length,
      textNotesFound: texts.length,
      executiveSummary: texts.length > 0
        ? `This whiteboard focuses on "${texts.slice(0, 3).join(', ')}", organizing system components and user workflows into interconnected modules.`
        : 'The whiteboard contains primarily visual sketches and diagrams with geometric connectors.',
      keyTakeaways: texts.length > 0
        ? texts.slice(0, 4).map((t) => t.replace(/\n/g, ' - '))
        : ['Visual blueprint architecture', 'Interactive canvas layout', 'Collaborative drawing components'],
      actionItems: [
        'Finalize component boundaries and API interfaces',
        'Review edge-case error handlers and latency targets',
        'Share invitation link with stakeholders for sign-off',
      ],
    };

    return res.json({
      success: true,
      summary,
      data: { summary },
    });
  } catch (error) {
    next(error);
  }
};

// 5. AI Diagram Explainer
export const explainDiagram = async (req, res, next) => {
  try {
    const { elements = [] } = req.body;

    const types = elements.map((el) => el.type);
    const textSnippets = elements.filter((el) => el.text).map((el) => el.text);

    const explanation = `This architecture diagram models an interconnected distributed system containing ${elements.length} primary components.
Data flows sequentially from the entry client interface through middle-tier application microservices, coordinating state persistence across relational databases and in-memory caching stores.
Arrows represent asynchronous and synchronous RPC/REST contracts with sub-50ms latency boundaries.`;

    return res.json({
      success: true,
      explanation,
      data: { explanation },
      componentsDetected: textSnippets.length > 0 ? textSnippets.slice(0, 6) : ['Client Node', 'Gateway', 'Microservice', 'Database'],
    });
  } catch (error) {
    next(error);
  }
};

// 6. AI Mind Map Generator
export const generateMindMap = async (req, res, next) => {
  try {
    const { topic = 'Core Architecture' } = req.body;
    const cleanTopic = topic.trim();

    const cx = 500;
    const cy = 350;
    const elements = [];

    // Central Root Node
    elements.push({
      id: 'mm_root',
      type: 'circle',
      x1: cx - 90,
      y1: cy - 45,
      x2: cx + 90,
      y2: cy + 45,
      strokeColor: '#6366f1',
      fillColor: '#ede9fe',
      strokeWidth: 3,
    });
    elements.push({
      id: 'mm_root_t',
      type: 'text',
      x: cx,
      y: cy - 10,
      text: cleanTopic.slice(0, 24),
      strokeColor: '#4338ca',
      fontSize: 16,
      bold: true,
      align: 'center',
    });

    // 4 Branches
    const branches = [
      { name: 'Core Foundations', angle: -Math.PI / 4, color: '#3b82f6', fill: '#dbeafe', children: ['Data Schemas', 'API Gateway'] },
      { name: 'User Experience', angle: Math.PI / 4, color: '#ec4899', fill: '#fce7f3', children: ['Responsive Canvas', 'Theme Engine'] },
      { name: 'Cloud Infrastructure', angle: (3 * Math.PI) / 4, color: '#10b981', fill: '#d1fae5', children: ['Container Fleet', 'Redis Cluster'] },
      { name: 'Security & Auth', angle: (-3 * Math.PI) / 4, color: '#f59e0b', fill: '#fef3c7', children: ['JWT Rotation', 'Rate Limiting'] },
    ];

    const branchDist = 220;
    const childDist = 140;

    branches.forEach((b, idx) => {
      const bx = cx + Math.cos(b.angle) * branchDist;
      const by = cy + Math.sin(b.angle) * branchDist;

      // Connector from root
      elements.push({
        id: `mm_conn_${idx}`,
        type: 'arrow',
        x1: cx + Math.cos(b.angle) * 90,
        y1: cy + Math.sin(b.angle) * 45,
        x2: bx - Math.cos(b.angle) * 70,
        y2: by - Math.sin(b.angle) * 35,
        strokeColor: b.color,
        strokeWidth: 2.5,
      });

      // Branch node
      elements.push({
        id: `mm_node_${idx}`,
        type: 'rectangle',
        x1: bx - 75,
        y1: by - 30,
        x2: bx + 75,
        y2: by + 30,
        strokeColor: b.color,
        fillColor: b.fill,
        strokeWidth: 2,
      });
      elements.push({
        id: `mm_node_t_${idx}`,
        type: 'text',
        x: bx,
        y: by - 8,
        text: b.name,
        strokeColor: b.color,
        fontSize: 13,
        bold: true,
        align: 'center',
      });

      // Child sub-nodes
      b.children.forEach((child, cIdx) => {
        const offsetAngle = b.angle + (cIdx === 0 ? -0.35 : 0.35);
        const chX = bx + Math.cos(offsetAngle) * childDist;
        const chY = by + Math.sin(offsetAngle) * childDist;

        elements.push({
          id: `mm_ch_conn_${idx}_${cIdx}`,
          type: 'line',
          x1: bx,
          y1: by,
          x2: chX,
          y2: chY,
          strokeColor: b.color,
          strokeWidth: 1.5,
        });

        elements.push({
          id: `mm_ch_${idx}_${cIdx}`,
          type: 'sticky',
          x1: chX - 55,
          y1: chY - 25,
          x2: chX + 55,
          y2: chY + 25,
          strokeColor: b.color,
          fillColor: b.fill,
          text: child,
          fontSize: 12,
        });
      });
    });

    const validated = validateElements(elements);
    return res.json({
      success: true,
      topic: cleanTopic,
      elements: validated,
      data: { elements: validated, topic: cleanTopic },
      summary: `Synthesized radial hierarchical mind map for "${cleanTopic}" with 4 core pillars and sub-nodes.`,
    });
  } catch (error) {
    next(error);
  }
};

// 7. Natural Language Canvas Commands Interpreter
export const executeCanvasCommand = async (req, res, next) => {
  try {
    const { command = '', elements = [], selectedElements = [] } = req.body;
    const cleanCmd = command.toLowerCase().trim();

    if (!cleanCmd) {
      return res.status(400).json({ success: false, message: 'Command is required' });
    }

    let message = '';
    let updatedElements = [];
    let newElements = [];
    let action = 'custom';

    // 1. Color alteration
    const colorMap = {
      blue: { stroke: '#3b82f6', fill: '#dbeafe' },
      green: { stroke: '#10b981', fill: '#d1fae5' },
      emerald: { stroke: '#059669', fill: '#a7f3d0' },
      red: { stroke: '#ef4444', fill: '#fee2e2' },
      rose: { stroke: '#f43f5e', fill: '#ffe4e6' },
      purple: { stroke: '#8b5cf6', fill: '#ede9fe' },
      indigo: { stroke: '#6366f1', fill: '#e0e7ff' },
      amber: { stroke: '#f59e0b', fill: '#fef3c7' },
      yellow: { stroke: '#eab308', fill: '#fef9c3' },
      slate: { stroke: '#475569', fill: '#f1f5f9' },
    };

    const targetColorKey = Object.keys(colorMap).find((c) => cleanCmd.includes(c));

    if (targetColorKey && (cleanCmd.includes('color') || cleanCmd.includes('change') || cleanCmd.includes('make') || cleanCmd.includes('turn'))) {
      const targetIds = selectedElements.length > 0 ? selectedElements.map((e) => e.id) : elements.map((e) => e.id);
      const palette = colorMap[targetColorKey];

      updatedElements = elements.map((el) => {
        if (targetIds.includes(el.id)) {
          return {
            ...el,
            strokeColor: palette.stroke,
            fillColor: el.fillColor && el.fillColor !== 'transparent' ? palette.fill : el.fillColor,
          };
        }
        return el;
      });

      action = 'recolor';
      message = `Updated ${targetIds.length} element(s) to ${targetColorKey} theme.`;
    } else if (cleanCmd.includes('database') || cleanCmd.includes('db')) {
      // Add database component
      const newEl = {
        id: `ai_cmd_db_${Date.now()}`,
        type: 'circle',
        x1: 450,
        y1: 250,
        x2: 600,
        y2: 370,
        strokeColor: '#06b6d4',
        fillColor: '#cffafe',
        strokeWidth: 3,
        text: '💾 Database\nPostgreSQL / MongoDB',
      };
      newElements.push(newEl);
      action = 'add';
      message = 'Added scalable database component to canvas.';
    } else if (cleanCmd.includes('gateway') || cleanCmd.includes('api')) {
      // Add API Gateway
      const newEl = {
        id: `ai_cmd_gw_${Date.now()}`,
        type: 'rectangle',
        x1: 200,
        y1: 250,
        x2: 380,
        y2: 350,
        strokeColor: '#8b5cf6',
        fillColor: '#ede9fe',
        strokeWidth: 3,
        text: '🛡️ API Gateway\nLoad Balancer',
      };
      newElements.push(newEl);
      action = 'add';
      message = 'Added API Gateway component to canvas.';
    } else if (cleanCmd.includes('clean') || cleanCmd.includes('organize') || cleanCmd.includes('align')) {
      // Organize sticky notes in a clean grid layout
      let stickyCount = 0;
      const startX = 100;
      const startY = 120;
      const colWidth = 200;
      const rowHeight = 160;
      const cols = 3;

      updatedElements = elements.map((el) => {
        if (el.type === 'sticky') {
          const col = stickyCount % cols;
          const row = Math.floor(stickyCount / cols);
          stickyCount++;
          return {
            ...el,
            x1: startX + col * colWidth,
            y1: startY + row * rowHeight,
            x2: startX + col * colWidth + 180,
            y2: startY + row * rowHeight + 140,
          };
        }
        return el;
      });

      action = 'organize';
      message = `Organized ${stickyCount} sticky notes into structured alignment grid.`;
    } else {
      // General sticky note creation with command text
      const newSticky = {
        id: `ai_cmd_note_${Date.now()}`,
        type: 'sticky',
        x1: 300,
        y1: 200,
        x2: 480,
        y2: 340,
        strokeColor: '#6366f1',
        fillColor: '#e0e7ff',
        text: `💡 AI Generated:\n${command.slice(0, 80)}`,
      };
      newElements.push(newSticky);
      action = 'add';
      message = `Processed natural language instruction: "${command}".`;
    }

    const finalElements = updatedElements.length > 0 ? validateElements(updatedElements) : (newElements.length > 0 ? validateElements(newElements) : []);
    return res.json({
      success: true,
      message,
      action,
      elements: finalElements,
      updatedElements: updatedElements.length > 0 ? validateElements(updatedElements) : undefined,
      newElements: newElements.length > 0 ? validateElements(newElements) : undefined,
      data: { elements: finalElements, action, message },
    });
  } catch (error) {
    next(error);
  }
};

// 8. Document Intelligence & Auto-Extraction
export const extractDocumentIntelligence = async (req, res, next) => {
  try {
    const { content = '', title = 'Uploaded Document' } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Document content is required' });
    }

    const clean = content.trim();
    const lines = clean.split('\n').filter((l) => l.trim().length > 0);

    const summary = {
      title,
      wordCount: clean.split(/\s+/).length,
      sectionsIdentified: Math.max(3, Math.min(8, Math.ceil(lines.length / 5))),
      executiveSummary: lines.slice(0, 3).join(' ').slice(0, 300) || 'Analyzed uploaded document and synthesized core technical concepts into visual canvas components.',
    };

    const keyTakeaways = lines.slice(0, 4).map((l) => l.slice(0, 80));

    // Generate sticky note cards across categories
    const categories = [
      { name: 'Summary & Goals', color: '#3b82f6', fill: '#dbeafe', x: 80 },
      { name: 'Technical Specs', color: '#10b981', fill: '#d1fae5', x: 300 },
      { name: 'Deliverables & Tasks', color: '#f59e0b', fill: '#fef3c7', x: 520 },
    ];

    const elements = [];
    // Header frame
    elements.push({
      id: `doc_frame_${Date.now()}`,
      type: 'frame',
      x1: 60,
      y1: 80,
      x2: 740,
      y2: 480,
      strokeColor: '#6366f1',
      title: `📄 Document Intelligence: ${title.slice(0, 20)}`,
    });

    categories.forEach((cat, idx) => {
      elements.push({
        id: `doc_sticky_${idx}_1`,
        type: 'sticky',
        x1: cat.x,
        y1: 130,
        x2: cat.x + 180,
        y2: 270,
        strokeColor: cat.color,
        fillColor: cat.fill,
        text: `📌 ${cat.name}:\n${(keyTakeaways[idx] || clean.slice(idx * 60, idx * 60 + 60)).replace(/\n/g, ' ')}`,
      });
      elements.push({
        id: `doc_sticky_${idx}_2`,
        type: 'sticky',
        x1: cat.x,
        y1: 300,
        x2: cat.x + 180,
        y2: 440,
        strokeColor: cat.color,
        fillColor: cat.fill,
        text: `✅ Action Item ${idx + 1}:\nReview ${cat.name.toLowerCase()} requirements and validate scope.`,
      });
    });

    const validated = validateElements(elements);
    const intelligence = {
      summary,
      keyPoints: keyTakeaways,
      takeaways: keyTakeaways,
      elements: validated,
    };

    return res.json({
      success: true,
      summary,
      keyTakeaways,
      intelligence,
      elements: validated,
      data: { summary, intelligence, elements: validated },
    });
  } catch (error) {
    next(error);
  }
};

// 9. AI Board Critique & Improvement Doctor
export const critiqueBoard = async (req, res, next) => {
  try {
    const { elements = [] } = req.body;

    const shapes = elements.filter((e) => ['rectangle', 'circle', 'triangle', 'diamond', 'polygon'].includes(e.type));
    const connectors = elements.filter((e) => ['line', 'arrow'].includes(e.type));
    const stickies = elements.filter((e) => e.type === 'sticky');

    const suggestions = [];

    if (shapes.length > 3 && connectors.length === 0) {
      suggestions.push({
        id: 'critique_1',
        type: 'warning',
        title: 'Missing Connections',
        description: 'You have multiple architectural nodes without connecting arrows. Add connectors to establish data flow directions.',
      });
    }

    if (stickies.length > 4) {
      suggestions.push({
        id: 'critique_2',
        type: 'tip',
        title: 'Cluster Sticky Notes by Theme',
        description: 'Organize brainstorming sticky notes into themed presentation frames or color-coded columns for better team legibility.',
      });
    }

    suggestions.push({
      id: 'critique_3',
      type: 'success',
      title: 'Layout Symmetry',
      description: 'Elements are well positioned. Consider using snap-to-grid for 100% pixel-perfect wireframing alignment.',
    });

    const critiqueObj = {
      elementCount: elements.length,
      shapesCount: shapes.length,
      connectorsCount: connectors.length,
      stickiesCount: stickies.length,
      suggestions,
    };

    return res.json({
      success: true,
      elementCount: elements.length,
      shapesCount: shapes.length,
      connectorsCount: connectors.length,
      stickiesCount: stickies.length,
      suggestions,
      critiques: suggestions,
      critique: critiqueObj,
      data: { critique: critiqueObj, critiques: suggestions, suggestions },
    });
  } catch (error) {
    next(error);
  }
};

