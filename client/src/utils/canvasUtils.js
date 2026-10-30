import { jsPDF } from 'jspdf';

// Draw arrow head at (toX, toY) pointing from (fromX, fromY)
export const drawArrowHead = (ctx, fromX, fromY, toX, toY, size = 14) => {
  const angle = Math.atan2(toY - fromY, toX - fromX);
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(
    toX - size * Math.cos(angle - Math.PI / 6),
    toY - size * Math.sin(angle - Math.PI / 6)
  );
  ctx.lineTo(
    toX - size * Math.cos(angle + Math.PI / 6),
    toY - size * Math.sin(angle + Math.PI / 6)
  );
  ctx.closePath();
  ctx.fillStyle = ctx.strokeStyle;
  ctx.fill();
  ctx.restore();
};

// Render a single element onto canvas 2D context
export const renderElement = (ctx, el, imageCache = {}) => {
  if (!el) return;

  ctx.save();
  ctx.globalAlpha = el.opacity !== undefined ? el.opacity : 1;
  ctx.strokeStyle = el.strokeColor || '#1e293b';
  ctx.fillStyle = el.fillColor || 'transparent';
  ctx.lineWidth = el.strokeWidth || 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  switch (el.type) {
    case 'pen': {
      if (!el.points || el.points.length === 0) break;
      ctx.beginPath();
      if (el.points.length === 1) {
        ctx.arc(el.points[0].x, el.points[0].y, (el.strokeWidth || 3) / 2, 0, Math.PI * 2);
        ctx.fillStyle = el.strokeColor || '#1e293b';
        ctx.fill();
      } else {
        ctx.moveTo(el.points[0].x, el.points[0].y);
        for (let i = 1; i < el.points.length; i++) {
          const xc = (el.points[i - 1].x + el.points[i].x) / 2;
          const yc = (el.points[i - 1].y + el.points[i].y) / 2;
          ctx.quadraticCurveTo(el.points[i - 1].x, el.points[i - 1].y, xc, yc);
        }
        ctx.lineTo(el.points[el.points.length - 1].x, el.points[el.points.length - 1].y);
        ctx.stroke();
      }
      break;
    }

    case 'highlighter': {
      if (!el.points || el.points.length === 0) break;
      ctx.save();
      ctx.globalAlpha = el.opacity !== undefined ? el.opacity : 0.35;
      ctx.lineWidth = el.strokeWidth || 24;
      ctx.lineCap = 'square';
      ctx.strokeStyle = el.strokeColor || '#facc15';

      ctx.beginPath();
      ctx.moveTo(el.points[0].x, el.points[0].y);
      for (let i = 1; i < el.points.length; i++) {
        ctx.lineTo(el.points[i].x, el.points[i].y);
      }
      ctx.stroke();
      ctx.restore();
      break;
    }

    case 'line': {
      ctx.beginPath();
      ctx.moveTo(el.x1, el.y1);
      ctx.lineTo(el.x2, el.y2);
      ctx.stroke();
      break;
    }

    case 'arrow': {
      ctx.beginPath();
      ctx.moveTo(el.x1, el.y1);
      ctx.lineTo(el.x2, el.y2);
      ctx.stroke();
      drawArrowHead(ctx, el.x1, el.y1, el.x2, el.y2, Math.max(12, (el.strokeWidth || 3) * 3));
      break;
    }

    case 'rectangle': {
      const minX = Math.min(el.x1, el.x2);
      const minY = Math.min(el.y1, el.y2);
      const width = Math.abs(el.x2 - el.x1);
      const height = Math.abs(el.y2 - el.y1);
      const radius = el.radius || 8;

      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(minX, minY, width, height, radius);
      } else {
        ctx.rect(minX, minY, width, height);
      }

      if (el.fillColor && el.fillColor !== 'transparent') {
        ctx.fill();
      }
      ctx.stroke();
      break;
    }

    case 'circle': {
      const centerX = (el.x1 + el.x2) / 2;
      const centerY = (el.y1 + el.y2) / 2;
      const radiusX = Math.abs(el.x2 - el.x1) / 2;
      const radiusY = Math.abs(el.y2 - el.y1) / 2;

      ctx.beginPath();
      ctx.ellipse(centerX, centerY, Math.max(1, radiusX), Math.max(1, radiusY), 0, 0, Math.PI * 2);

      if (el.fillColor && el.fillColor !== 'transparent') {
        ctx.fill();
      }
      ctx.stroke();
      break;
    }

    case 'triangle': {
      const minX = Math.min(el.x1, el.x2);
      const maxX = Math.max(el.x1, el.x2);
      const minY = Math.min(el.y1, el.y2);
      const maxY = Math.max(el.y1, el.y2);
      const midX = (minX + maxX) / 2;

      ctx.beginPath();
      ctx.moveTo(midX, minY);
      ctx.lineTo(maxX, maxY);
      ctx.lineTo(minX, maxY);
      ctx.closePath();

      if (el.fillColor && el.fillColor !== 'transparent') {
        ctx.fill();
      }
      ctx.stroke();
      break;
    }

    case 'sticky': {
      const minX = Math.min(el.x1, el.x2);
      const minY = Math.min(el.y1, el.y2);
      const width = Math.max(120, Math.abs(el.x2 - el.x1));
      const height = Math.max(100, Math.abs(el.y2 - el.y1));

      // Drop Shadow
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 4;

      // Note background
      ctx.fillStyle = el.fillColor || '#fef3c7';
      ctx.strokeStyle = el.strokeColor || '#f59e0b';
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(minX, minY, width, height, 8);
      } else {
        ctx.rect(minX, minY, width, height);
      }
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Top color bar / pin
      ctx.fillStyle = el.strokeColor || '#f59e0b';
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(minX, minY, width, 8, [8, 8, 0, 0]);
      } else {
        ctx.rect(minX, minY, width, 8);
      }
      ctx.fill();

      // Render Note Text
      if (el.text) {
        ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillStyle = '#1e293b';
        ctx.textBaseline = 'top';

        const lines = el.text.split('\n');
        const lineHeight = 18;
        lines.forEach((line, index) => {
          ctx.fillText(line, minX + 12, minY + 18 + index * lineHeight, width - 24);
        });
      }
      break;
    }

    case 'text': {
      if (!el.text) break;
      const fontStyle = `${el.italic ? 'italic ' : ''}${el.bold ? 'bold ' : ''}`;
      const fontSize = el.fontSize || 20;
      const fontFamily = el.fontFamily || '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.font = `${fontStyle}${fontSize}px ${fontFamily}`;
      ctx.fillStyle = el.strokeColor || '#1e293b';
      ctx.textBaseline = 'top';
      ctx.textAlign = el.align || 'left';

      const lines = el.text.split('\n');
      const lineHeight = fontSize * 1.35;

      lines.forEach((line, index) => {
        const lineY = el.y + index * lineHeight;
        ctx.fillText(line, el.x, lineY);

        if (el.underline) {
          const width = ctx.measureText(line).width;
          let underlineX = el.x;
          if (el.align === 'center') underlineX -= width / 2;
          else if (el.align === 'right') underlineX -= width;

          ctx.beginPath();
          ctx.moveTo(underlineX, lineY + fontSize + 2);
          ctx.lineTo(underlineX + width, lineY + fontSize + 2);
          ctx.lineWidth = Math.max(1, fontSize / 14);
          ctx.strokeStyle = el.strokeColor || '#1e293b';
          ctx.stroke();
        }
      });
      break;
    }

    case 'diamond': {
      const minX = Math.min(el.x1, el.x2);
      const maxX = Math.max(el.x1, el.x2);
      const minY = Math.min(el.y1, el.y2);
      const maxY = Math.max(el.y1, el.y2);
      const midX = (minX + maxX) / 2;
      const midY = (minY + maxY) / 2;

      ctx.beginPath();
      ctx.moveTo(midX, minY);
      ctx.lineTo(maxX, midY);
      ctx.lineTo(midX, maxY);
      ctx.lineTo(minX, midY);
      ctx.closePath();

      if (el.fillColor && el.fillColor !== 'transparent') {
        ctx.fill();
      }
      ctx.stroke();

      if (el.text) {
        ctx.font = `${el.bold ? 'bold ' : ''}${el.fontSize || 14}px sans-serif`;
        ctx.fillStyle = el.strokeColor || '#1e293b';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(el.text, midX, midY);
      }
      break;
    }

    case 'polygon': {
      const minX = Math.min(el.x1, el.x2);
      const maxX = Math.max(el.x1, el.x2);
      const minY = Math.min(el.y1, el.y2);
      const maxY = Math.max(el.y1, el.y2);
      const cx = (minX + maxX) / 2;
      const cy = (minY + maxY) / 2;
      const rx = Math.abs(maxX - minX) / 2;
      const ry = Math.abs(maxY - minY) / 2;
      const sides = el.sides || 6; // Regular hexagon

      ctx.beginPath();
      for (let i = 0; i < sides; i++) {
        const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
        const x = cx + rx * Math.cos(angle);
        const y = cy + ry * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();

      if (el.fillColor && el.fillColor !== 'transparent') {
        ctx.fill();
      }
      ctx.stroke();
      break;
    }

    case 'frame': {
      const minX = Math.min(el.x1, el.x2);
      const maxX = Math.max(el.x1, el.x2);
      const minY = Math.min(el.y1, el.y2);
      const maxY = Math.max(el.y1, el.y2);
      const w = Math.max(160, maxX - minX);
      const h = Math.max(120, maxY - minY);

      ctx.save();
      ctx.strokeStyle = el.strokeColor || '#6366f1';
      ctx.fillStyle = el.fillColor || 'rgba(99, 102, 241, 0.04)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 6]);

      // Frame box
      if (ctx.roundRect) ctx.roundRect(minX, minY, w, h, 12);
      else ctx.rect(minX, minY, w, h);
      ctx.fill();
      ctx.stroke();

      // Top title pill
      ctx.setLineDash([]);
      ctx.fillStyle = el.strokeColor || '#6366f1';
      const label = el.title || el.text || 'Presentation Frame';
      ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      const textMetrics = ctx.measureText(label);
      const pillW = Math.max(90, textMetrics.width + 24);
      const pillH = 22;

      if (ctx.roundRect) ctx.roundRect(minX, minY - pillH, pillW, pillH, [6, 6, 0, 0]);
      else ctx.rect(minX, minY - pillH, pillW, pillH);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, minX + 8, minY - pillH / 2);
      ctx.restore();
      break;
    }

    case 'image': {
      const minX = Math.min(el.x1, el.x2);
      const minY = Math.min(el.y1, el.y2);
      const width = Math.abs(el.x2 - el.x1);
      const height = Math.abs(el.y2 - el.y1);

      if (el.src) {
        let img = imageCache[el.src];
        if (!img) {
          img = new Image();
          img.src = el.src;
          imageCache[el.src] = img;
        }

        if (img.complete && img.naturalWidth > 0) {
          ctx.drawImage(img, minX, minY, width, height);
        } else {
          // Placeholder loading box
          ctx.fillStyle = '#f1f5f9';
          ctx.fillRect(minX, minY, width, height);
          ctx.strokeRect(minX, minY, width, height);
        }
      }
      break;
    }

    default:
      break;
  }

  // Draw Lock Badge if element is locked
  if (el.isLocked) {
    const box = getElementBoundingBox(el);
    if (box) {
      ctx.save();
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(box.maxX - 10, box.minY + 10, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🔒', box.maxX - 10, box.minY + 10);
      ctx.restore();
    }
  }

  ctx.restore();
};

// Calculate exact bounding box for an element { minX, minY, maxX, maxY, width, height }
export const getElementBoundingBox = (el) => {
  if (!el) return null;

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  if ((el.type === 'pen' || el.type === 'highlighter') && el.points) {
    el.points.forEach((p) => {
      minX = Math.min(minX, p.x);
      minY = Math.min(minY, p.y);
      maxX = Math.max(maxX, p.x);
      maxY = Math.max(maxY, p.y);
    });
    const padding = (el.strokeWidth || 4) / 2;
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;
  } else if (el.x1 !== undefined) {
    minX = Math.min(el.x1, el.x2);
    minY = Math.min(el.y1, el.y2);
    maxX = Math.max(el.x1, el.x2);
    maxY = Math.max(el.y1, el.y2);
  } else if (el.x !== undefined) {
    minX = el.x;
    minY = el.y;
    const lines = (el.text || '').split('\n');
    const fontSize = el.fontSize || 20;
    const maxLineLen = lines.reduce((max, l) => Math.max(max, l.length), 1);
    maxX = el.x + maxLineLen * (fontSize * 0.65);
    maxY = el.y + lines.length * (fontSize * 1.35);
  }

  if (minX === Infinity) return null;

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: Math.max(2, maxX - minX),
    height: Math.max(2, maxY - minY),
  };
};

// Render selection outline with 8 corner/edge resize handles
export const renderSelectionOutline = (ctx, selectedElements) => {
  if (!selectedElements || selectedElements.length === 0) return;

  selectedElements.forEach((el) => {
    const box = getElementBoundingBox(el);
    if (!box) return;

    ctx.save();
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);

    const pad = 6;
    ctx.strokeRect(box.minX - pad, box.minY - pad, box.width + pad * 2, box.height + pad * 2);

    // Draw 4 corner handles
    ctx.setLineDash([]);
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 2;

    const handleSize = 8;
    const corners = [
      { x: box.minX - pad, y: box.minY - pad },
      { x: box.maxX + pad, y: box.minY - pad },
      { x: box.maxX + pad, y: box.maxY + pad },
      { x: box.minX - pad, y: box.maxY + pad },
    ];

    corners.forEach((c) => {
      ctx.fillRect(c.x - handleSize / 2, c.y - handleSize / 2, handleSize, handleSize);
      ctx.strokeRect(c.x - handleSize / 2, c.y - handleSize / 2, handleSize, handleSize);
    });

    ctx.restore();
  });
};

// Check if point hits resize handle: returns 'nw' | 'ne' | 'se' | 'sw' | null
export const getHandleAtPoint = (px, py, element, pad = 6, handleSize = 10) => {
  const box = getElementBoundingBox(element);
  if (!box) return null;

  const corners = {
    nw: { x: box.minX - pad, y: box.minY - pad },
    ne: { x: box.maxX + pad, y: box.minY - pad },
    se: { x: box.maxX + pad, y: box.maxY + pad },
    sw: { x: box.minX - pad, y: box.maxY + pad },
  };

  for (const [pos, c] of Object.entries(corners)) {
    if (Math.hypot(px - c.x, py - c.y) <= handleSize) {
      return pos;
    }
  }

  return null;
};

// Proximity check for selection or eraser
export const isPointNearElement = (px, py, el, threshold = 10) => {
  if (!el) return false;

  const hitDist = threshold + (el.strokeWidth || 3) / 2;

  switch (el.type) {
    case 'pen':
    case 'highlighter': {
      if (!el.points) return false;
      return el.points.some((p) => Math.hypot(p.x - px, p.y - py) <= hitDist);
    }

    case 'line':
    case 'arrow': {
      return distanceToSegment(px, py, el.x1, el.y1, el.x2, el.y2) <= hitDist;
    }

    case 'rectangle':
    case 'sticky':
    case 'image':
    case 'diamond':
    case 'polygon':
    case 'frame': {
      const minX = Math.min(el.x1, el.x2);
      const maxX = Math.max(el.x1, el.x2);
      const minY = Math.min(el.y1, el.y2);
      const maxY = Math.max(el.y1, el.y2);

      const onTop = distanceToSegment(px, py, minX, minY, maxX, minY) <= hitDist;
      const onBottom = distanceToSegment(px, py, minX, maxY, maxX, maxY) <= hitDist;
      const onLeft = distanceToSegment(px, py, minX, minY, minX, maxY) <= hitDist;
      const onRight = distanceToSegment(px, py, maxX, minY, maxX, maxY) <= hitDist;
      const inside = px >= minX && px <= maxX && py >= minY && py <= maxY;

      return onTop || onBottom || onLeft || onRight || inside;
    }

    case 'circle': {
      const centerX = (el.x1 + el.x2) / 2;
      const centerY = (el.y1 + el.y2) / 2;
      const rx = Math.abs(el.x2 - el.x1) / 2;
      const ry = Math.abs(el.y2 - el.y1) / 2;

      if (rx <= 0 || ry <= 0) return false;
      const normDist = Math.pow((px - centerX) / (rx + hitDist), 2) + Math.pow((py - centerY) / (ry + hitDist), 2);
      return normDist <= 1;
    }

    case 'triangle': {
      const box = getElementBoundingBox(el);
      if (!box) return false;
      return px >= box.minX - 5 && px <= box.maxX + 5 && py >= box.minY - 5 && py <= box.maxY + 5;
    }

    case 'text': {
      const box = getElementBoundingBox(el);
      if (!box) return false;
      return px >= box.minX - 6 && px <= box.maxX + 6 && py >= box.minY - 6 && py <= box.maxY + 6;
    }

    default:
      return false;
  }
};

function distanceToSegment(px, py, x1, y1, x2, y2) {
  const l2 = Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2);
  if (l2 === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
}

// Generate thumbnail
export const generateThumbnail = (elements, isDark = false) => {
  if (!elements || elements.length === 0) return '';

  try {
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 180;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = isDark ? '#1e293b' : '#f8fafc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

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

    if (minX !== Infinity && maxX - minX > 0 && maxY - minY > 0) {
      const padding = 20;
      const boundWidth = maxX - minX + padding * 2;
      const boundHeight = maxY - minY + padding * 2;
      const scale = Math.min(canvas.width / boundWidth, canvas.height / boundHeight);

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.scale(scale, scale);
      ctx.translate(-(minX + maxX) / 2, -(minY + maxY) / 2);

      elements.forEach((el) => renderElement(ctx, el));
      ctx.restore();
    }

    return canvas.toDataURL('image/jpeg', 0.6);
  } catch (e) {
    return '';
  }
};

// Export board elements as high-resolution PNG
export const exportBoardAsPNG = (elements, title = 'whiteboard', isDark = false) => {
  if (!elements || elements.length === 0) {
    alert('Canvas is empty. Draw something before downloading!');
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

  const padding = 60;
  const width = Math.max(800, maxX - minX + padding * 2);
  const height = Math.max(600, maxY - minY + padding * 2);

  const canvas = document.createElement('canvas');
  canvas.width = width * 2; // 2x retina
  canvas.height = height * 2;
  const ctx = canvas.getContext('2d');

  ctx.scale(2, 2);
  ctx.fillStyle = isDark ? '#0f172a' : '#ffffff';
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillStyle = isDark ? '#475569' : '#94a3b8';
  ctx.fillText(`CollabBoard AI • ${title}`, 20, height - 20);
  ctx.restore();

  ctx.save();
  ctx.translate(-minX + padding, -minY + padding);
  elements.forEach((el) => renderElement(ctx, el));
  ctx.restore();

  const link = document.createElement('a');
  link.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
};

// Export board as vector SVG
export const exportBoardAsSVG = (elements, title = 'whiteboard', isDark = false) => {
  if (!elements || elements.length === 0) {
    alert('Canvas is empty. Draw something before downloading SVG!');
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

  const padding = 50;
  const width = Math.max(800, maxX - minX + padding * 2);
  const height = Math.max(600, maxY - minY + padding * 2);

  const bg = isDark ? '#0f172a' : '#ffffff';

  let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">\n`;
  svgContent += `<rect width="${width}" height="${height}" fill="${bg}"/>\n<g transform="translate(${-minX + padding}, ${-minY + padding})">\n`;

  elements.forEach((el) => {
    const stroke = el.strokeColor || '#1e293b';
    const fill = el.fillColor || 'none';
    const sw = el.strokeWidth || 3;
    const op = el.opacity !== undefined ? el.opacity : 1;

    if (el.type === 'pen' && el.points) {
      const d = el.points.map((p, idx) => (idx === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');
      svgContent += `<path d="${d}" stroke="${stroke}" stroke-width="${sw}" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="${op}"/>\n`;
    } else if (el.type === 'line' || el.type === 'arrow') {
      svgContent += `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" opacity="${op}"/>\n`;
    } else if (el.type === 'rectangle' || el.type === 'sticky') {
      const x = Math.min(el.x1, el.x2);
      const y = Math.min(el.y1, el.y2);
      const w = Math.abs(el.x2 - el.x1);
      const h = Math.abs(el.y2 - el.y1);
      svgContent += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" stroke="${stroke}" stroke-width="${sw}" fill="${fill}" opacity="${op}"/>\n`;
    } else if (el.type === 'circle') {
      const cx = (el.x1 + el.x2) / 2;
      const cy = (el.y1 + el.y2) / 2;
      const rx = Math.abs(el.x2 - el.x1) / 2;
      const ry = Math.abs(el.y2 - el.y1) / 2;
      svgContent += `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" stroke="${stroke}" stroke-width="${sw}" fill="${fill}" opacity="${op}"/>\n`;
    } else if (el.type === 'diamond') {
      const minX = Math.min(el.x1, el.x2);
      const maxX = Math.max(el.x1, el.x2);
      const minY = Math.min(el.y1, el.y2);
      const maxY = Math.max(el.y1, el.y2);
      const midX = (minX + maxX) / 2;
      const midY = (minY + maxY) / 2;
      svgContent += `<polygon points="${midX},${minY} ${maxX},${midY} ${midX},${maxY} ${minX},${midY}" stroke="${stroke}" stroke-width="${sw}" fill="${fill}" opacity="${op}"/>\n`;
    } else if (el.type === 'frame') {
      const x = Math.min(el.x1, el.x2);
      const y = Math.min(el.y1, el.y2);
      const w = Math.abs(el.x2 - el.x1);
      const h = Math.abs(el.y2 - el.y1);
      svgContent += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" stroke="${stroke}" stroke-width="${sw}" stroke-dasharray="6,6" fill="${fill}" opacity="${op}"/>\n`;
    } else if (el.type === 'text') {
      svgContent += `<text x="${el.x}" y="${el.y + (el.fontSize || 20)}" font-size="${el.fontSize || 20}" font-family="sans-serif" fill="${stroke}">${el.text}</text>\n`;
    }
  });

  svgContent += `</g>\n</svg>`;

  const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}.svg`;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
};

// Export board as PDF document
export const exportBoardAsPDF = (elements, title = 'whiteboard', isDark = false) => {
  if (!elements || elements.length === 0) {
    alert('Canvas is empty. Draw something before downloading PDF!');
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

  const padding = 50;
  const width = Math.max(800, maxX - minX + padding * 2);
  const height = Math.max(600, maxY - minY + padding * 2);

  const canvas = document.createElement('canvas');
  canvas.width = width * 1.5;
  canvas.height = height * 1.5;
  const ctx = canvas.getContext('2d');

  ctx.scale(1.5, 1.5);
  ctx.fillStyle = isDark ? '#0f172a' : '#ffffff';
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.translate(-minX + padding, -minY + padding);
  elements.forEach((el) => renderElement(ctx, el));
  ctx.restore();

  const imgData = canvas.toDataURL('image/jpeg', 0.95);
  const orientation = width > height ? 'landscape' : 'portrait';
  const pdf = new jsPDF({
    orientation,
    unit: 'px',
    format: [width, height],
  });

  pdf.addImage(imgData, 'JPEG', 0, 0, width, height);
  pdf.save(`${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}.pdf`);
};

// Calculate 4 magnetic anchor points for shapes (top, bottom, left, right)
export const getShapeAnchorPoints = (el) => {
  const box = getElementBoundingBox(el);
  if (!box) return null;
  return {
    top: { x: (box.minX + box.maxX) / 2, y: box.minY, name: 'top' },
    bottom: { x: (box.minX + box.maxX) / 2, y: box.maxY, name: 'bottom' },
    left: { x: box.minX, y: (box.minY + box.maxY) / 2, name: 'left' },
    right: { x: box.maxX, y: (box.minY + box.maxY) / 2, name: 'right' },
  };
};

// Find nearest magnetic anchor point across elements
export const findNearestAnchorPoint = (px, py, elements, excludeId = null, threshold = 28) => {
  let nearest = null;
  let minDist = threshold;

  elements.forEach((el) => {
    if (el.id === excludeId || el.type === 'pen' || el.type === 'highlighter' || el.type === 'line' || el.type === 'arrow') return;
    const anchors = getShapeAnchorPoints(el);
    if (!anchors) return;

    Object.values(anchors).forEach((anchor) => {
      const dist = Math.hypot(px - anchor.x, py - anchor.y);
      if (dist < minDist) {
        minDist = dist;
        nearest = { ...anchor, elementId: el.id };
      }
    });
  });

  return nearest;
};

// Object Layering: Bring to Front
export const bringToFront = (elements, selectedIds = []) => {
  if (!elements || selectedIds.length === 0) return elements;
  const idSet = new Set(selectedIds);
  const unselected = elements.filter((el) => !idSet.has(el.id));
  const selected = elements.filter((el) => idSet.has(el.id));
  return [...unselected, ...selected];
};

// Object Layering: Send to Back
export const sendToBack = (elements, selectedIds = []) => {
  if (!elements || selectedIds.length === 0) return elements;
  const idSet = new Set(selectedIds);
  const unselected = elements.filter((el) => !idSet.has(el.id));
  const selected = elements.filter((el) => idSet.has(el.id));
  return [...selected, ...unselected];
};

// Object Layering: Bring Forward
export const bringForward = (elements, selectedIds = []) => {
  if (!elements || selectedIds.length === 0) return elements;
  const result = [...elements];
  for (let i = result.length - 2; i >= 0; i--) {
    if (selectedIds.includes(result[i].id) && !selectedIds.includes(result[i + 1].id)) {
      const temp = result[i];
      result[i] = result[i + 1];
      result[i + 1] = temp;
    }
  }
  return result;
};

// Object Layering: Send Backward
export const sendBackward = (elements, selectedIds = []) => {
  if (!elements || selectedIds.length === 0) return elements;
  const result = [...elements];
  for (let i = 1; i < result.length; i++) {
    if (selectedIds.includes(result[i].id) && !selectedIds.includes(result[i - 1].id)) {
      const temp = result[i];
      result[i] = result[i - 1];
      result[i - 1] = temp;
    }
  }
  return result;
};

// Toggle Lock/Unlock on Elements
export const toggleLockElements = (elements, selectedIds = []) => {
  if (!elements || selectedIds.length === 0) return elements;
  const idSet = new Set(selectedIds);
  const anyUnlocked = elements.some((el) => idSet.has(el.id) && !el.isLocked);
  return elements.map((el) => {
    if (idSet.has(el.id)) {
      return { ...el, isLocked: anyUnlocked };
    }
    return el;
  });
};

// Group Selected Elements
export const groupElements = (elements, selectedIds = []) => {
  if (!elements || selectedIds.length < 2) return elements;
  const newGroupId = `group_${Date.now()}`;
  const idSet = new Set(selectedIds);
  return elements.map((el) => {
    if (idSet.has(el.id)) {
      return { ...el, groupId: newGroupId };
    }
    return el;
  });
};

// Ungroup Selected Elements
export const ungroupElements = (elements, selectedIds = []) => {
  if (!elements || selectedIds.length === 0) return elements;
  const idSet = new Set(selectedIds);
  return elements.map((el) => {
    if (idSet.has(el.id)) {
      const copy = { ...el };
      delete copy.groupId;
      return copy;
    }
    return el;
  });
};

// Laser Pointer Trail Renderer
export const renderLaserTrail = (ctx, points = []) => {
  if (!points || points.length < 2) return;
  const now = Date.now();
  const maxAge = 1200; // 1.2s decay

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  for (let i = 1; i < points.length; i++) {
    const age = now - points[i].time;
    if (age > maxAge) continue;
    const progress = 1 - age / maxAge;
    ctx.lineWidth = Math.max(2, 7 * progress);
    ctx.strokeStyle = `rgba(244, 63, 94, ${progress})`;
    ctx.shadowColor = '#fb7185';
    ctx.shadowBlur = 10 * progress;

    ctx.beginPath();
    ctx.moveTo(points[i - 1].x, points[i - 1].y);
    ctx.lineTo(points[i].x, points[i].y);
    ctx.stroke();
  }

  // Draw glowing head
  const latest = points[points.length - 1];
  if (latest && now - latest.time < maxAge) {
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#f43f5e';
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(latest.x, latest.y, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
};

