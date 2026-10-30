import React from 'react';
import { Pencil, Eraser, Type } from 'lucide-react';

const RemoteCursors = ({ cursors = {}, zoom = 1, pan = { x: 0, y: 0 } }) => {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-30">
      {Object.entries(cursors).map(([socketId, cursor]) => {
        if (!cursor || cursor.x === undefined || cursor.y === undefined) return null;

        // Convert canvas coordinates to screen coordinates
        const screenX = cursor.x * zoom + pan.x;
        const screenY = cursor.y * zoom + pan.y;

        const user = cursor.user || {};
        const userName = user.name || 'Collaborator';
        const userColor = user.avatarColor || '#6366f1';
        const activeTool = cursor.activeTool;

        return (
          <div
            key={socketId}
            className="absolute transition-transform duration-75 ease-out"
            style={{
              transform: `translate3d(${screenX}px, ${screenY}px, 0)`,
            }}
          >
            {/* SVG Mouse Pointer Arrow */}
            <svg
              className="w-5 h-5 -rotate-45 drop-shadow-md"
              viewBox="0 0 24 24"
              fill={userColor}
              stroke="white"
              strokeWidth="1.5"
            >
              <path d="M3 3l7 18 3-7 7-3L3 3z" />
            </svg>

            {/* User Label Badge */}
            <div
              className="cursor-badge absolute left-4 top-2 px-2 py-0.5 rounded-full text-white text-[10px] font-bold shadow-md whitespace-nowrap flex items-center gap-1 border border-white/30"
              style={{ backgroundColor: userColor }}
            >
              <span>{userName}</span>
              {activeTool === 'pen' && <Pencil className="w-2.5 h-2.5" />}
              {activeTool === 'eraser' && <Eraser className="w-2.5 h-2.5" />}
              {activeTool === 'text' && <Type className="w-2.5 h-2.5" />}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RemoteCursors;
