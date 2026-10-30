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
export const renderElement = (ctx, el) => {
  if (!el) return;

  ctx.save();
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

      if (el.fillColor && el.fillColor !== 'transparent') {
        ctx.beginPath();
        ctx.rect(minX, minY, width, height);
        ctx.fill();
      }

      ctx.beginPath();
      ctx.rect(minX, minY, width, height);
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

    case 'text': {
      if (!el.text) break;
      ctx.font = `${el.fontSize || 20}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      ctx.fillStyle = el.strokeColor || '#1e293b';
      ctx.textBaseline = 'top';

      const lines = el.text.split('\n');
      const lineHeight = (el.fontSize || 20) * 1.3;
      lines.forEach((line, index) => {
        ctx.fillText(line, el.x, el.y + index * lineHeight);
      });
      break;
    }

    default:
      break;
  }

  ctx.restore();
};

// Check if a point (x, y) in canvas coordinates hits an element (for eraser or selection)
export const isPointNearElement = (px, py, el, threshold = 10) => {
  if (!el) return false;

  const hitDist = threshold + (el.strokeWidth || 3) / 2;

  switch (el.type) {
    case 'pen': {
      if (!el.points) return false;
      return el.points.some((p) => {
        const d = Math.hypot(p.x - px, p.y - py);
        return d <= hitDist;
      });
    }

    case 'line':
    case 'arrow': {
      return distanceToSegment(px, py, el.x1, el.y1, el.x2, el.y2) <= hitDist;
    }

    case 'rectangle': {
      const minX = Math.min(el.x1, el.x2);
      const maxX = Math.max(el.x1, el.x2);
      const minY = Math.min(el.y1, el.y2);
      const maxY = Math.max(el.y1, el.y2);

      // Check perimeter
      const onTop = distanceToSegment(px, py, minX, minY, maxX, minY) <= hitDist;
      const onBottom = distanceToSegment(px, py, minX, maxY, maxX, maxY) <= hitDist;
      const onLeft = distanceToSegment(px, py, minX, minY, minX, maxY) <= hitDist;
      const onRight = distanceToSegment(px, py, maxX, minY, maxX, maxY) <= hitDist;

      // Inside check if filled
      const inside = px >= minX && px <= maxX && py >= minY && py <= maxY;
      return onTop || onBottom || onLeft || onRight || inside;
    }

    case 'circle': {
      const centerX = (el.x1 + el.x2) / 2;
      const centerY = (el.y1 + el.y2) / 2;
      const rx = Math.abs(el.x2 - el.x1) / 2;
      const ry = Math.abs(el.y2 - el.y1) / 2;

      // Normalized ellipse equation: (x - cx)^2/rx^2 + (y - cy)^2/ry^2
      if (rx <= 0 || ry <= 0) return false;
      const normDist = Math.pow((px - centerX) / (rx + hitDist), 2) + Math.pow((py - centerY) / (ry + hitDist), 2);
      return normDist <= 1;
    }

    case 'text': {
      const width = (el.text ? el.text.length : 1) * ((el.fontSize || 20) * 0.6);
      const height = (el.fontSize || 20) * 1.4;
      return px >= el.x - 5 && px <= el.x + width + 5 && py >= el.y - 5 && py <= el.y + height + 5;
    }

    default:
      return false;
  }
};

// Math helper: distance from point (px, py) to line segment (x1, y1) -> (x2, y2)
function distanceToSegment(px, py, x1, y1, x2, y2) {
  const l2 = Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2);
  if (l2 === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
}

// Generate thumbnail data URL from elements array
export const generateThumbnail = (elements, isDark = false) => {
  if (!elements || elements.length === 0) return '';

  try {
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 180;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = isDark ? '#1e293b' : '#f8fafc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Compute bounding box of elements
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    elements.forEach((el) => {
      if (el.type === 'pen' && el.points) {
        el.points.forEach((p) => {
          minX = Math.min(minX, p.x);
          minY = Math.min(minY, p.y);
          maxX = Math.max(maxX, p.x);
          maxY = Math.max(maxY, p.y);
        });
      } else if (el.x1 !== undefined) {
        minX = Math.min(minX, el.x1, el.x2);
        minY = Math.min(minY, el.y1, el.y2);
        maxX = Math.max(maxX, el.x1, el.x2);
        maxY = Math.max(maxY, el.y1, el.y2);
      } else if (el.x !== undefined) {
        minX = Math.min(minX, el.x);
        minY = Math.min(minY, el.y);
        maxX = Math.max(maxX, el.x + 100);
        maxY = Math.max(maxY, el.y + 40);
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

  // Calculate bounding box
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  elements.forEach((el) => {
    if (el.type === 'pen' && el.points) {
      el.points.forEach((p) => {
        minX = Math.min(minX, p.x);
        minY = Math.min(minY, p.y);
        maxX = Math.max(maxX, p.x);
        maxY = Math.max(maxY, p.y);
      });
    } else if (el.x1 !== undefined) {
      minX = Math.min(minX, el.x1, el.x2);
      minY = Math.min(minY, el.y1, el.y2);
      maxX = Math.max(maxX, el.x1, el.x2);
      maxY = Math.max(maxY, el.y1, el.y2);
    } else if (el.x !== undefined) {
      minX = Math.min(minX, el.x);
      minY = Math.min(minY, el.y);
      maxX = Math.max(maxX, el.x + 200);
      maxY = Math.max(maxY, el.y + 60);
    }
  });

  const padding = 60;
  const width = Math.max(800, maxX - minX + padding * 2);
  const height = Math.max(600, maxY - minY + padding * 2);

  const canvas = document.createElement('canvas');
  canvas.width = width * 2; // 2x retina export
  canvas.height = height * 2;
  const ctx = canvas.getContext('2d');

  ctx.scale(2, 2);

  // Background
  ctx.fillStyle = isDark ? '#0f172a' : '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Subtle watermark / branding in footer
  ctx.save();
  ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillStyle = isDark ? '#475569' : '#94a3b8';
  ctx.fillText(`Collaborative Whiteboard • ${title}`, 20, height - 20);
  ctx.restore();

  // Shift context to center the drawings
  ctx.save();
  ctx.translate(-minX + padding, -minY + padding);
  elements.forEach((el) => renderElement(ctx, el));
  ctx.restore();

  // Trigger download
  const link = document.createElement('a');
  link.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
};
