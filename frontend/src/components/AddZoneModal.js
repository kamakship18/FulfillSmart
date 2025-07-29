'use client';

import React, { useState } from 'react';
import { useBlueprintStore, ZONE_TYPES } from '@/store/blueprintStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Plus } from 'lucide-react';

const AddZoneModal = ({ isOpen, onClose }) => {
  const { addZone, zones, warehouse } = useBlueprintStore();
  
  const [formData, setFormData] = useState({
    type: 'Storage',
    label: '',
    description: '',
    width: 100,
    height: 80,
    x: 50,
    y: 50
  });

  const [errors, setErrors] = useState({});

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle zone type change
  const handleZoneTypeChange = (type) => {
    const zoneType = ZONE_TYPES[type];
    setFormData(prev => ({
      ...prev,
      type,
      width: zoneType.defaultWidth,
      height: zoneType.defaultHeight,
      label: prev.label || `${zoneType.label} ${zones.length + 1}`,
      description: prev.description || zoneType.description
    }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.label.trim()) {
      newErrors.label = 'Zone label is required';
    }

    if (formData.width < 20 || formData.width > warehouse.width) {
      newErrors.width = `Width must be between 20 and ${warehouse.width} ft`;
    }

    if (formData.height < 20 || formData.height > warehouse.height) {
      newErrors.height = `Height must be between 20 and ${warehouse.height} ft`;
    }

    if (formData.x < 0 || formData.x + formData.width > warehouse.width) {
      newErrors.x = `X position must allow zone to fit within warehouse`;
    }

    if (formData.y < 0 || formData.y + formData.height > warehouse.height) {
      newErrors.y = `Y position must allow zone to fit within warehouse`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Add the zone
    addZone({
      ...formData,
      width: parseInt(formData.width),
      height: parseInt(formData.height),
      x: parseInt(formData.x),
      y: parseInt(formData.y)
    });

    // Reset form and close modal
    setFormData({
      type: 'Storage',
      label: '',
      description: '',
      width: 100,
      height: 80,
      x: 50,
      y: 50
    });
    setErrors({});
    onClose();
  };

  // Handle modal close
  const handleClose = () => {
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  const selectedZoneType = ZONE_TYPES[formData.type];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white shadow-2xl border-2 border-gray-200 rounded-xl">
        <CardHeader className="bg-white border-b border-gray-100 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-gray-900 text-xl font-bold">
                <Plus className="w-6 h-6 text-blue-600" />
                Add New Zone
              </CardTitle>
              <CardDescription className="text-gray-600 text-base mt-1">
                Create a new zone for your warehouse layout
              </CardDescription>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClose} 
              className="hover:bg-gray-100 h-8 w-8 p-0 rounded-full text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="bg-white p-6 text-gray-900">{/* Ensure text is visible */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Zone Type Selection */}
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">Zone Type</Label>
              <Select value={formData.type} onValueChange={handleZoneTypeChange}>
                <SelectTrigger className="bg-white border-gray-300">
                  <SelectValue placeholder="Select zone type" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg">
                  {Object.entries(ZONE_TYPES).map(([key, zoneType]) => (
                    <SelectItem key={key} value={key} className="hover:bg-gray-50">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded ${zoneType.bgColor}`}></div>
                        <span className="text-gray-900">{zoneType.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Zone Preview */}
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-6 h-6 rounded ${selectedZoneType.bgColor} border-2 ${selectedZoneType.borderColor}`}></div>
                <span className="font-medium text-gray-900">{selectedZoneType.label}</span>
              </div>
              <p className="text-sm text-gray-600">{selectedZoneType.description}</p>
            </div>

            {/* Zone Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="label" className="text-gray-700 font-medium">Zone Label *</Label>
                <Input
                  id="label"
                  value={formData.label}
                  onChange={(e) => handleInputChange('label', e.target.value)}
                  placeholder={`${selectedZoneType.label} ${zones.length + 1}`}
                  className={`bg-white border-2 border-gray-300 text-gray-900 font-medium focus:border-blue-500 ${errors.label ? 'border-red-500' : ''}`}
                />
                {errors.label && <p className="text-sm text-red-600 font-medium">{errors.label}</p>}
              </div>

              <div className="space-y-3">
                <Label htmlFor="description" className="text-gray-900 font-semibold text-base">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Optional description"
                  className="bg-white border-2 border-gray-300 text-gray-900 font-medium focus:border-blue-500"
                />
              </div>
            </div>

            {/* Dimensions */}
            <div className="space-y-4">
              <Label className="text-base font-semibold text-gray-900">Dimensions</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="width" className="text-gray-700 font-medium">Width (ft) *</Label>
                  <Input
                    id="width"
                    type="number"
                    value={formData.width}
                    onChange={(e) => handleInputChange('width', parseInt(e.target.value) || 0)}
                    min={20}
                    max={warehouse.width}
                    className={`bg-white border-gray-300 text-gray-900 ${errors.width ? 'border-red-500' : ''}`}
                  />
                  {errors.width && <p className="text-sm text-red-500">{errors.width}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="height" className="text-gray-700 font-medium">Height (ft) *</Label>
                  <Input
                    id="height"
                    type="number"
                    value={formData.height}
                    onChange={(e) => handleInputChange('height', parseInt(e.target.value) || 0)}
                    min={20}
                    max={warehouse.height}
                    className={`bg-white border-gray-300 text-gray-900 ${errors.height ? 'border-red-500' : ''}`}
                  />
                  {errors.height && <p className="text-sm text-red-500">{errors.height}</p>}
                </div>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700">
                  <strong>Area:</strong> {(formData.width * formData.height).toLocaleString()} sq ft
                </p>
              </div>
            </div>

            {/* Position */}
            <div className="space-y-4">
              <Label className="text-base font-semibold text-gray-900">Initial Position</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="x" className="text-gray-700 font-medium">X Position (ft)</Label>
                  <Input
                    id="x"
                    type="number"
                    value={formData.x}
                    onChange={(e) => handleInputChange('x', parseInt(e.target.value) || 0)}
                    min={0}
                    max={warehouse.width - formData.width}
                    className={`bg-white border-gray-300 text-gray-900 ${errors.x ? 'border-red-500' : ''}`}
                  />
                  {errors.x && <p className="text-sm text-red-500">{errors.x}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="y" className="text-gray-700 font-medium">Y Position (ft)</Label>
                  <Input
                    id="y"
                    type="number"
                    value={formData.y}
                    onChange={(e) => handleInputChange('y', parseInt(e.target.value) || 0)}
                    min={0}
                    max={warehouse.height - formData.height}
                    className={`bg-white border-gray-300 text-gray-900 ${errors.y ? 'border-red-500' : ''}`}
                  />
                  {errors.y && <p className="text-sm text-red-500">{errors.y}</p>}
                </div>
              </div>

              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border">
                <p><strong>Note:</strong> You can drag and resize zones after creation</p>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 bg-white">
              <Button type="button" variant="outline" onClick={handleClose} className="bg-white hover:bg-gray-50 text-gray-700">
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Zone
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddZoneModal;
