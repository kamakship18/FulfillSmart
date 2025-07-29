'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useBlueprintStore, ZONE_TYPES, isZoneWithinBounds, isZoneOverlapping } from '@/store/blueprintStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit3, Move, Maximize2 } from 'lucide-react';

// Individual zone component
const WarehouseZone = ({ zone, isSelected, onSelect, onUpdate }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ width: 0, height: 0 });
  const zoneRef = useRef(null);

  const zoneType = ZONE_TYPES[zone.type];
  
  // Convert pixels to sq ft (1px = 1ft for simplicity)
  const areaSqFt = zone.width * zone.height;

  // Handle drag start
  const handleMouseDown = useCallback((e) => {
    if (e.target.classList.contains('resize-handle')) return;
    
    e.preventDefault();
    setIsDragging(true);
    onSelect(zone.id);
    
    const rect = zoneRef.current.getBoundingClientRect();
    setDragStart({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  }, [zone.id, onSelect]);

  // Handle resize start
  const handleResizeStart = useCallback((e) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({ width: zone.width, height: zone.height });
  }, [zone.width, zone.height]);

  // Handle mouse move for dragging and resizing
  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      const canvas = zoneRef.current.closest('.warehouse-canvas');
      const canvasRect = canvas.getBoundingClientRect();
      
      const newX = e.clientX - canvasRect.left - dragStart.x;
      const newY = e.clientY - canvasRect.top - dragStart.y;
      
      // Ensure zone stays within bounds
      const boundedX = Math.max(0, Math.min(newX, 800 - zone.width));
      const boundedY = Math.max(0, Math.min(newY, 600 - zone.height));
      
      onUpdate(zone.id, { x: boundedX, y: boundedY });
    } else if (isResizing) {
      const canvas = zoneRef.current.closest('.warehouse-canvas');
      const canvasRect = canvas.getBoundingClientRect();
      
      const newWidth = Math.max(50, e.clientX - canvasRect.left - zone.x);
      const newHeight = Math.max(50, e.clientY - canvasRect.top - zone.y);
      
      // Ensure zone stays within bounds
      const boundedWidth = Math.min(newWidth, 800 - zone.x);
      const boundedHeight = Math.min(newHeight, 600 - zone.y);
      
      onUpdate(zone.id, { width: boundedWidth, height: boundedHeight });
    }
  }, [isDragging, isResizing, dragStart, zone, onUpdate]);

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  // Add event listeners
  React.useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={zoneRef}
      className={`absolute border-2 rounded-lg cursor-move transition-all duration-200 ${
        isSelected ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
      } ${zoneType.bgColor} ${zoneType.borderColor} ${
        isDragging ? 'opacity-80 z-50' : 'z-10'
      }`}
      style={{
        left: zone.x,
        top: zone.y,
        width: zone.width,
        height: zone.height
      }}
      onMouseDown={handleMouseDown}
      title={zone.description}
    >
      {/* Zone content */}
      <div className="p-2 h-full flex flex-col justify-between text-xs">
        <div>
          <div className="font-semibold text-gray-800 truncate">{zone.label}</div>
          <div className="text-gray-600">{areaSqFt.toLocaleString()} sq ft</div>
        </div>
        
        {/* Zone type badge */}
        <div className="self-start">
          <Badge variant="outline" className="text-xs">
            {zoneType.label}
          </Badge>
        </div>
      </div>

      {/* Resize handle */}
      {isSelected && (
        <div
          className="resize-handle absolute bottom-0 right-0 w-4 h-4 bg-blue-500 rounded-tl-lg cursor-se-resize opacity-75 hover:opacity-100"
          onMouseDown={handleResizeStart}
        >
          <Maximize2 className="w-3 h-3 text-white ml-0.5 mt-0.5" />
        </div>
      )}

      {/* Selection indicators */}
      {isSelected && (
        <>
          <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 rounded-full"></div>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"></div>
          <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 rounded-full"></div>
        </>
      )}
    </div>
  );
};

// Zone properties panel
const ZonePropertiesPanel = ({ zone, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({
    label: zone?.label || '',
    description: zone?.description || ''
  });

  if (!zone) {
    return (
      <Card className="h-full">
        <CardContent className="p-4">
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-2">📦</div>
            <p>Select a zone to view properties</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const zoneType = ZONE_TYPES[zone.type];
  const areaSqFt = zone.width * zone.height;

  const handleSave = () => {
    onUpdate(zone.id, editValues);
    setIsEditing(false);
  };

  return (
    <Card className="h-full">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Zone Properties</h3>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit3 className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDelete(zone.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Zone type and color */}
        <div className="flex items-center gap-3">
          <div
            className={`w-6 h-6 rounded ${zoneType.bgColor} border-2 ${zoneType.borderColor}`}
          ></div>
          <Badge>{zoneType.label}</Badge>
        </div>

        {/* Zone details */}
        <div className="space-y-3">
          {isEditing ? (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Label</label>
                <input
                  type="text"
                  value={editValues.label}
                  onChange={(e) => setEditValues({ ...editValues, label: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={editValues.description}
                  onChange={(e) => setEditValues({ ...editValues, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md h-20 resize-none"
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSave}>Save</Button>
                <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-600">Label</label>
                <p className="font-medium">{zone.label}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Description</label>
                <p className="text-sm text-gray-700">{zone.description}</p>
              </div>
            </>
          )}
        </div>

        {/* Dimensions and area */}
        <div className="space-y-2 pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <label className="block text-gray-600">Width</label>
              <p className="font-medium">{zone.width} ft</p>
            </div>
            <div>
              <label className="block text-gray-600">Height</label>
              <p className="font-medium">{zone.height} ft</p>
            </div>
          </div>
          <div>
            <label className="block text-gray-600">Total Area</label>
            <p className="font-medium text-lg">{areaSqFt.toLocaleString()} sq ft</p>
          </div>
          <div>
            <label className="block text-gray-600">Position</label>
            <p className="font-medium">({zone.x}, {zone.y})</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Main warehouse canvas component
export default function WarehouseCanvas() {
  const {
    zones,
    warehouse,
    ui,
    updateZone,
    removeZone,
    setSelectedZone,
    getTotalZoneArea,
    getZoneUtilization
  } = useBlueprintStore();

  const selectedZone = zones.find(zone => zone.id === ui.selectedZoneId);
  const totalArea = getTotalZoneArea();
  const utilization = getZoneUtilization();

  const handleZoneUpdate = (zoneId, updates) => {
    updateZone(zoneId, updates);
  };

  const handleZoneDelete = (zoneId) => {
    removeZone(zoneId);
    if (ui.selectedZoneId === zoneId) {
      setSelectedZone(null);
    }
  };

  const handleCanvasClick = (e) => {
    // Deselect zone if clicking on empty canvas
    if (e.target.classList.contains('warehouse-canvas')) {
      setSelectedZone(null);
    }
  };

  return (
    <div className="w-full h-full">
      {/* Canvas area */}
      <div className="h-full">
        <div className="p-4 border-b bg-white">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Warehouse Layout</h3>
            <div className="flex gap-4 text-sm text-gray-600">
              <span>Total Area: {warehouse.totalArea.toLocaleString()} sq ft</span>
              <span>Used: {totalArea.toLocaleString()} sq ft ({utilization.toFixed(1)}%)</span>
              <span>Available: {(warehouse.totalArea - totalArea).toLocaleString()} sq ft</span>
            </div>
          </div>
        </div>
        
        {/* Scrollable Canvas Container */}
        <div className="p-4 h-full overflow-auto bg-gray-50">
          <div
            className="warehouse-canvas relative bg-white border-2 border-dashed border-gray-300 rounded-lg shadow-sm"
            style={{ 
              width: `${warehouse.width}px`, 
              height: `${warehouse.height}px`,
              minWidth: '800px',
              minHeight: '600px'
            }}
            onClick={handleCanvasClick}
          >
            {/* Grid lines */}
            <svg
              className="absolute inset-0 pointer-events-none"
              width={warehouse.width}
              height={warehouse.height}
            >
              {/* Vertical grid lines */}
              {Array.from({ length: warehouse.width / 50 + 1 }, (_, i) => (
                <line
                  key={`v-${i}`}
                  x1={i * 50}
                  y1={0}
                  x2={i * 50}
                  y2={warehouse.height}
                  stroke="#e5e7eb"
                  strokeWidth={1}
                />
              ))}
              {/* Horizontal grid lines */}
              {Array.from({ length: warehouse.height / 50 + 1 }, (_, i) => (
                <line
                  key={`h-${i}`}
                  x1={0}
                  y1={i * 50}
                  x2={warehouse.width}
                  y2={i * 50}
                  stroke="#e5e7eb"
                  strokeWidth={1}
                />
              ))}
            </svg>

            {/* Zones */}
            {zones.map((zone) => (
              <WarehouseZone
                key={zone.id}
                zone={zone}
                isSelected={ui.selectedZoneId === zone.id}
                onSelect={setSelectedZone}
                onUpdate={handleZoneUpdate}
              />
            ))}

            {/* Instructions overlay when no zones */}
            {zones.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <div className="text-6xl mb-4">🏗️</div>
                  <p className="text-lg">Click "Add Zone" to start designing your warehouse</p>
                </div>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-4 bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm font-medium text-gray-700 mr-4">Zone Types:</div>
            {Object.entries(ZONE_TYPES).map(([key, zoneType]) => (
              <div key={key} className="flex items-center gap-2 text-sm">
                <div className={`w-4 h-4 rounded ${zoneType.bgColor} border ${zoneType.borderColor}`}></div>
                <span className="text-gray-700">{zoneType.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Properties panel - moved to side panel in main layout */}
      {selectedZone && (
        <div className="fixed right-4 top-24 w-80 z-40 bg-white rounded-lg shadow-lg border border-gray-200 max-h-[calc(100vh-120px)] overflow-y-auto">
          <ZonePropertiesPanel
            zone={selectedZone}
            onUpdate={handleZoneUpdate}
            onDelete={handleZoneDelete}
          />
        </div>
      )}
    </div>
  );
}
