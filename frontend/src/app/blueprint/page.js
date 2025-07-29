'use client';

import { useState, useEffect } from 'react';
import WarehouseCanvas from '@/components/WarehouseCanvas';
import AddZoneModal from '@/components/AddZoneModal';
import SimulationResults from '@/components/SimulationResults';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBlueprintStore } from '@/store/blueprintStore';
import { Building, Layers, Users, Calculator, Plus, Save, Share, Play, Settings, BarChart3, TrendingUp, Zap, Brain, Target, AlertCircle } from 'lucide-react';

export default function Blueprint() {
  const {
    uploadedData,
    cityDemandData,
    totalDemand,
    peakDemand,
    demandTier,
    zones,
    warehouse,
    workforce,
    infrastructure,
    updateWarehouse,
    updateWorkforce,
    runSimulation,
    simulationResults,
    isSimulating,
    loadUserData,
    generateIntelligentWarehouse
  } = useBlueprintStore();

  const [showAddZoneModal, setShowAddZoneModal] = useState(false);
  const [activeTab, setActiveTab] = useState('design');
  const [isGenerating, setIsGenerating] = useState(false);

  // Load user data on component mount
  useEffect(() => {
    if (!uploadedData) {
      loadUserData();
    }
  }, [loadUserData, uploadedData]);

  const handleRunSimulation = async () => {
    await runSimulation();
    setActiveTab('results');
  };

  const handleGenerateBlueprint = async () => {
    setIsGenerating(true);
    await generateIntelligentWarehouse();
    setIsGenerating(false);
  };

  const handleSaveBlueprint = () => {
    const blueprintData = {
      warehouse,
      zones,
      workforce,
      infrastructure,
      demandAnalysis: {
        totalDemand,
        peakDemand,
        demandTier,
        cityData: cityDemandData
      },
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(blueprintData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `warehouse-blueprint-${warehouse.name || 'design'}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShareBlueprint = () => {
    const shareData = {
      warehouse: warehouse.name || 'My Warehouse',
      zones: zones.length,
      efficiency: simulationResults?.metrics?.overallEfficiency || 'Not calculated'
    };
    
    navigator.clipboard.writeText(
      `Check out my warehouse blueprint: ${shareData.warehouse} with ${shareData.zones} zones and ${shareData.efficiency}% efficiency!`
    );
    
    alert('Blueprint details copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Smart Header with Data Insights */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                AI-Powered Warehouse Blueprint
              </h2>
              <p className="text-lg text-gray-600">
                Data-driven warehouse design for {totalDemand?.toLocaleString() || 'your'} units demand across {cityDemandData?.length || 0} cities
              </p>
            </div>
            
            {!warehouse.calculatedFromData && totalDemand > 0 && (
              <Button 
                onClick={handleGenerateBlueprint}
                disabled={isGenerating}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Generating AI Blueprint...
                  </>
                ) : (
                  <>
                    <Brain className="w-5 h-5 mr-2" />
                    Generate Smart Blueprint
                  </>
                )}
              </Button>
            )}
          </div>
          
          {/* Data-Driven Insights Bar */}
          {totalDemand > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-800">Total Demand</p>
                    <p className="text-2xl font-bold text-blue-900">{totalDemand.toLocaleString()}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-800">Peak Demand</p>
                    <p className="text-2xl font-bold text-green-900">{peakDemand?.toLocaleString()}</p>
                  </div>
                  <Target className="w-8 h-8 text-green-600" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-800">Demand Tier</p>
                    <p className="text-2xl font-bold text-purple-900 capitalize">{demandTier}</p>
                  </div>
                  <Zap className="w-8 h-8 text-purple-600" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-800">Future Scale</p>
                    <p className="text-2xl font-bold text-orange-900">{warehouse.futureScaleMultiplier}x Ready</p>
                  </div>
                  <Building className="w-8 h-8 text-orange-600" />
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 p-6 rounded-xl mb-6">
              <div className="flex items-center">
                <AlertCircle className="w-8 h-8 text-yellow-600 mr-4" />
                <div>
                  <h3 className="text-lg font-semibold text-yellow-800">No Data Detected</h3>
                  <p className="text-yellow-700">Please upload your logistics data first to generate an AI-powered warehouse blueprint.</p>
                  <Button 
                    onClick={() => window.location.href = '/upload'} 
                    className="mt-3 bg-yellow-600 hover:bg-yellow-700"
                    size="sm"
                  >
                    Upload Data Now
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1">
              <TabsList className="grid w-full grid-cols-3 bg-gray-50 rounded-lg p-1">
                <TabsTrigger 
                  value="design" 
                  className="flex items-center gap-2 py-3 px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all"
                >
                  <Settings className="w-4 h-4" />
                  <span className="font-medium">Design & Configure</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="simulate" 
                  className="flex items-center gap-2 py-3 px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all"
                >
                  <Play className="w-4 h-4" />
                  <span className="font-medium">Simulate & Test</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="results" 
                  className="flex items-center gap-2 py-3 px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span className="font-medium">Results & Insights</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Design Tab */}
            <TabsContent value="design" className="mt-8">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Left Panel - Configuration */}
                <div className="lg:col-span-1 space-y-6">
                  {/* AI-Generated Warehouse Setup */}
                  <Card className="shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Building className="w-5 h-5 text-blue-600" />
                        {warehouse.calculatedFromData ? 'AI-Optimized Warehouse' : 'Warehouse Setup'}
                      </CardTitle>
                      <CardDescription>
                        {warehouse.calculatedFromData 
                          ? 'Generated from your uploaded demand data' 
                          : 'Configure dimensions and basic settings'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="warehouse-name" className="text-sm font-medium">Warehouse Name</Label>
                        <Input
                          id="warehouse-name"
                          value={warehouse.name || ''}
                          onChange={(e) => updateWarehouse({ name: e.target.value })}
                          placeholder={warehouse.calculatedFromData ? warehouse.name : "My Warehouse"}
                          className="w-full"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="width" className="text-sm font-medium">Width (ft)</Label>
                          <Input
                            id="width"
                            type="number"
                            value={warehouse.width}
                            onChange={(e) => updateWarehouse({ width: parseInt(e.target.value) || 1000 })}
                            min={200}
                            max={5000}
                            className={warehouse.calculatedFromData ? "bg-blue-50 border-blue-200" : ""}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="height" className="text-sm font-medium">Height (ft)</Label>
                          <Input
                            id="height"
                            type="number"
                            value={warehouse.height}
                            onChange={(e) => updateWarehouse({ height: parseInt(e.target.value) || 800 })}
                            min={200}
                            max={5000}
                            className={warehouse.calculatedFromData ? "bg-blue-50 border-blue-200" : ""}
                          />
                        </div>
                      </div>
                      
                      {warehouse.calculatedFromData && (
                        <div className="space-y-3">
                          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                            <div className="text-sm font-medium text-gray-700 space-y-1">
                              <div><strong>Total Area:</strong> {(warehouse.width * warehouse.height).toLocaleString()} sq ft</div>
                              <div><strong>Demand Capacity:</strong> {warehouse.demandCapacity?.toLocaleString()} units</div>
                              <div><strong>Future Scale:</strong> {warehouse.futureScaleMultiplier}x growth ready</div>
                              <div><strong>Location:</strong> {warehouse.location}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center p-3 bg-green-50 rounded-lg border border-green-200">
                            <Brain className="w-5 h-5 text-green-600 mr-2" />
                            <span className="text-sm font-medium text-green-800">
                              AI-optimized layout based on your demand patterns
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {!warehouse.calculatedFromData && (
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                          <div className="text-sm font-medium text-gray-700">
                            <strong>Total Area:</strong> {(warehouse.width * warehouse.height).toLocaleString()} sq ft
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Smart Zone Management */}
                  <Card className="shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Layers className="w-5 h-5 text-green-600" />
                        Smart Zones ({zones.length})
                        {warehouse.calculatedFromData && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                            AI Generated
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        {warehouse.calculatedFromData 
                          ? 'AI-optimized zones based on your demand analysis' 
                          : 'Manage warehouse zones and areas'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Button 
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" 
                        onClick={() => setShowAddZoneModal(true)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Custom Zone
                      </Button>
                      
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {zones.map((zone) => (
                          <div key={zone.id} className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border transition-colors">
                            <div className="flex-1">
                              <div className="font-medium text-sm text-gray-900">{zone.label}</div>
                              <div className="text-xs text-gray-500">
                                {zone.width} × {zone.height} ft ({(zone.width * zone.height).toLocaleString()} sq ft)
                              </div>
                              {zone.capacity && (
                                <div className="text-xs text-blue-600 font-medium">
                                  Capacity: {zone.capacity.toLocaleString()} units • {zone.efficiency?.toFixed(1)}% efficient
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <Badge variant="outline" className="text-xs">
                                {zone.type}
                              </Badge>
                              {zone.staffRequired && (
                                <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800">
                                  {zone.staffRequired} staff
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                        
                        {zones.length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            <Layers className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p className="text-sm font-medium">No zones configured yet</p>
                            <p className="text-xs">
                              {totalDemand > 0 
                                ? 'Generate AI blueprint from your data or add zones manually' 
                                : 'Upload data first or add zones manually'}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {warehouse.calculatedFromData && zones.length > 0 && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center mb-2">
                            <Brain className="w-4 h-4 text-blue-600 mr-2" />
                            <span className="text-sm font-medium text-blue-800">AI Optimization Insights</span>
                          </div>
                          <div className="text-xs text-blue-700 space-y-1">
                            <div>• Zones sized for {totalDemand.toLocaleString()} unit demand</div>
                            <div>• Layout optimized for {warehouse.futureScaleMultiplier}x future growth</div>
                            <div>• Process flow efficiency: 87%+</div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Data-Driven Workforce Model */}
                  <Card className="shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Users className="w-5 h-5 text-purple-600" />
                        Smart Workforce Model
                        {workforce.calculatedFromDemand && (
                          <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200">
                            Demand-Based
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        {workforce.calculatedFromDemand 
                          ? 'Optimized staffing based on your demand patterns' 
                          : 'Configure staffing levels'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="pickers" className="text-sm font-medium">Pickers</Label>
                          <Input
                            id="pickers"
                            type="number"
                            value={workforce.pickers}
                            onChange={(e) => updateWorkforce({ pickers: parseInt(e.target.value) || 0 })}
                            min={0}
                            className={workforce.calculatedFromDemand ? "bg-purple-50 border-purple-200" : ""}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="packers" className="text-sm font-medium">Packers</Label>
                          <Input
                            id="packers"
                            type="number"
                            value={workforce.packers}
                            onChange={(e) => updateWorkforce({ packers: parseInt(e.target.value) || 0 })}
                            min={0}
                            className={workforce.calculatedFromDemand ? "bg-purple-50 border-purple-200" : ""}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="quality-control" className="text-sm font-medium">Quality Control</Label>
                          <Input
                            id="quality-control"
                            type="number"
                            value={workforce.qualityControl}
                            onChange={(e) => updateWorkforce({ qualityControl: parseInt(e.target.value) || 0 })}
                            min={0}
                            className={workforce.calculatedFromDemand ? "bg-purple-50 border-purple-200" : ""}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="supervisors" className="text-sm font-medium">Supervisors</Label>
                          <Input
                            id="supervisors"
                            type="number"
                            value={workforce.supervisors}
                            onChange={(e) => updateWorkforce({ supervisors: parseInt(e.target.value) || 0 })}
                            min={0}
                            className={workforce.calculatedFromDemand ? "bg-purple-50 border-purple-200" : ""}
                          />
                        </div>
                        {workforce.calculatedFromDemand && (
                          <>
                            <div className="space-y-2">
                              <Label htmlFor="forklift-operators" className="text-sm font-medium">Forklift Operators</Label>
                              <Input
                                id="forklift-operators"
                                type="number"
                                value={workforce.forkliftOperators}
                                onChange={(e) => updateWorkforce({ forkliftOperators: parseInt(e.target.value) || 0 })}
                                min={0}
                                className="bg-purple-50 border-purple-200"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="shift-managers" className="text-sm font-medium">Shift Managers</Label>
                              <Input
                                id="shift-managers"
                                type="number"
                                value={workforce.shiftManagers}
                                onChange={(e) => updateWorkforce({ shiftManagers: parseInt(e.target.value) || 0 })}
                                min={0}
                                className="bg-purple-50 border-purple-200"
                              />
                            </div>
                          </>
                        )}
                      </div>
                      
                      <div className="pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total Staff:</span>
                            <span className="font-semibold text-gray-900">{workforce.total || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Est. Hourly Cost:</span>
                            <span className="font-semibold text-green-600">${workforce.hourlyCost || 0}</span>
                          </div>
                          {workforce.calculatedFromDemand && (
                            <>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Peak Shift:</span>
                                <span className="font-semibold text-blue-600">{workforce.peakShiftStaff} staff</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Average Shift:</span>
                                <span className="font-semibold text-purple-600">{workforce.averageShiftStaff} staff</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {workforce.calculatedFromDemand && workforce.shifts && (
                        <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                          <div className="flex items-center mb-2">
                            <Users className="w-4 h-4 text-purple-600 mr-2" />
                            <span className="text-sm font-medium text-purple-800">Shift Distribution</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="text-center">
                              <div className="font-medium text-purple-700">Morning</div>
                              <div className="text-purple-600">{workforce.shifts.morning?.staff} staff</div>
                              <div className="text-purple-500">{workforce.shifts.morning?.hours}</div>
                            </div>
                            <div className="text-center">
                              <div className="font-medium text-purple-700">Evening</div>
                              <div className="text-purple-600">{workforce.shifts.evening?.staff} staff</div>
                              <div className="text-purple-500">{workforce.shifts.evening?.hours}</div>
                            </div>
                            <div className="text-center">
                              <div className="font-medium text-purple-700">Night</div>
                              <div className="text-purple-600">{workforce.shifts.night?.staff} staff</div>
                              <div className="text-purple-500">{workforce.shifts.night?.hours}</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Infrastructure Plan */}
                  {infrastructure.equipment && infrastructure.equipment.length > 0 && (
                    <Card className="shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Settings className="w-5 h-5 text-orange-600" />
                          Infrastructure Plan
                          <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">
                            AI Recommended
                          </Badge>
                        </CardTitle>
                        <CardDescription>Equipment, technology, and capacity planning</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Equipment */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Equipment Recommendations</h4>
                          <div className="space-y-2">
                            {infrastructure.equipment.map((item, index) => (
                              <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded border">
                                <div>
                                  <span className="text-sm font-medium">{item.item}</span>
                                  <span className="text-xs text-gray-500 ml-2">({item.quantity}x)</span>
                                </div>
                                <span className="text-sm font-semibold text-green-600">
                                  ${item.totalCost.toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Technology */}
                        {infrastructure.technology && infrastructure.technology.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Technology Stack</h4>
                            <div className="space-y-2">
                              {infrastructure.technology.map((tech, index) => (
                                <div key={index} className="flex justify-between items-center p-2 bg-blue-50 rounded border border-blue-200">
                                  <div>
                                    <span className="text-sm font-medium text-blue-900">{tech.name}</span>
                                    <span className="text-xs text-blue-600 ml-2">ROI: {tech.roi}</span>
                                  </div>
                                  <span className="text-sm font-semibold text-blue-700">
                                    ${tech.cost.toLocaleString()}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Total Investment */}
                        <div className="pt-4 border-t border-gray-200">
                          <div className="flex justify-between items-center">
                            <span className="text-base font-medium text-gray-900">Total Investment Required:</span>
                            <span className="text-lg font-bold text-green-600">
                              ${infrastructure.investmentRequired?.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Center Panel - Interactive Canvas */}
                <div className="lg:col-span-3">
                  <Card className="shadow-sm">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2 text-xl">
                            <Layers className="w-6 h-6 text-blue-600" />
                            Interactive Warehouse Layout
                          </CardTitle>
                          <CardDescription className="mt-1">
                            Drag zones to reposition, resize using handles, or click to edit properties
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={handleSaveBlueprint}>
                            <Save className="w-4 h-4 mr-1" />
                            Save
                          </Button>
                          <Button variant="outline" size="sm" onClick={handleShareBlueprint}>
                            <Share className="w-4 h-4 mr-1" />
                            Share
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="w-full h-[700px] overflow-auto border border-gray-200 rounded-lg bg-white">
                        <WarehouseCanvas />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Simulate Tab */}
            <TabsContent value="simulate" className="mt-8">
              <div className="flex justify-center">
                <Card className="w-full max-w-4xl shadow-sm">
                  <CardHeader className="text-center">
                    <CardTitle className="flex items-center justify-center gap-3 text-2xl">
                      <Calculator className="w-8 h-8 text-blue-600" />
                      Advanced Warehouse Simulation
                    </CardTitle>
                    <CardDescription className="text-lg">
                      {totalDemand > 0 
                        ? `Analyze your ${totalDemand.toLocaleString()}-unit demand warehouse performance`
                        : 'Run advanced simulations to analyze warehouse performance'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    
                    {/* Current Configuration Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                        <div className="text-3xl font-bold text-blue-600 mb-2">{zones.length}</div>
                        <div className="text-sm font-medium text-blue-800">
                          {warehouse.calculatedFromData ? 'AI-Optimized Zones' : 'Zones Configured'}
                        </div>
                      </div>
                      <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                        <div className="text-3xl font-bold text-green-600 mb-2">{workforce.total || 0}</div>
                        <div className="text-sm font-medium text-green-800">
                          {workforce.calculatedFromDemand ? 'Demand-Based Staff' : 'Total Staff'}
                        </div>
                      </div>
                      <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                        <div className="text-3xl font-bold text-purple-600 mb-2">
                          {totalDemand > 0 ? totalDemand.toLocaleString() : ((warehouse.width * warehouse.height) / 1000).toFixed(0) + 'K'}
                        </div>
                        <div className="text-sm font-medium text-purple-800">
                          {totalDemand > 0 ? 'Unit Demand' : 'Sq Ft Space'}
                        </div>
                      </div>
                      <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200">
                        <div className="text-3xl font-bold text-orange-600 mb-2">
                          {infrastructure.investmentRequired 
                            ? `$${(infrastructure.investmentRequired / 1000).toFixed(0)}K`
                            : '~$500K'}
                        </div>
                        <div className="text-sm font-medium text-orange-800">Investment Required</div>
                      </div>
                    </div>

                    {/* Data-Driven Analysis */}
                    {totalDemand > 0 && (
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                          <Brain className="w-5 h-5 text-blue-600 mr-2" />
                          Your Data Analysis
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="text-sm font-medium text-gray-800 mb-2">Demand Distribution</h4>
                            <div className="space-y-2">
                              {cityDemandData.slice(0, 3).map((city, index) => (
                                <div key={index} className="flex justify-between text-sm">
                                  <span className="text-gray-600">{city.city}:</span>
                                  <span className="font-medium text-blue-600">{city.demand.toLocaleString()} units</span>
                                </div>
                              ))}
                              {cityDemandData.length > 3 && (
                                <div className="text-xs text-gray-500">
                                  +{cityDemandData.length - 3} more cities
                                </div>
                              )}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-800 mb-2">Optimization Insights</h4>
                            <div className="space-y-1 text-sm text-gray-600">
                              <div>• Demand tier: <span className="font-medium text-purple-600 capitalize">{demandTier}</span></div>
                              <div>• Future scale: <span className="font-medium text-green-600">{warehouse.futureScaleMultiplier}x ready</span></div>
                              <div>• Peak capacity: <span className="font-medium text-orange-600">{peakDemand?.toLocaleString()} units</span></div>
                              <div>• Optimal location: <span className="font-medium text-blue-600">{warehouse.location}</span></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Simulation Features */}
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Advanced Simulation Features</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li className="flex items-center">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                            {totalDemand > 0 ? 'Data-driven zone efficiency analysis' : 'Zone efficiency and utilization'}
                          </li>
                          <li className="flex items-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                            {workforce.calculatedFromDemand ? 'Demand-based workflow optimization' : 'Workflow optimization analysis'}
                          </li>
                          <li className="flex items-center">
                            <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                            {workforce.calculatedFromDemand ? 'Multi-shift staff allocation' : 'Staff allocation and productivity'}
                          </li>
                        </ul>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li className="flex items-center">
                            <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                            {infrastructure.investmentRequired ? 'ROI and cost-benefit analysis' : 'Space utilization and cost analysis'}
                          </li>
                          <li className="flex items-center">
                            <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                            {totalDemand > 0 ? 'Peak vs average demand bottlenecks' : 'Bottleneck detection'}
                          </li>
                          <li className="flex items-center">
                            <div className="w-2 h-2 bg-teal-500 rounded-full mr-3"></div>
                            {warehouse.futureScaleMultiplier ? `${warehouse.futureScaleMultiplier}x scalability analysis` : 'AI-powered improvement recommendations'}
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* Run Simulation Button */}
                    <div className="text-center">
                      <Button
                        className="px-8 py-4 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        onClick={handleRunSimulation}
                        disabled={isSimulating || zones.length === 0}
                        size="lg"
                      >
                        {isSimulating ? (
                          <>
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                            Running Advanced Simulation...
                          </>
                        ) : (
                          <>
                            <Play className="w-6 h-6 mr-3" />
                            {totalDemand > 0 
                              ? 'Run Data-Driven Simulation' 
                              : 'Run Complete Simulation'}
                          </>
                        )}
                      </Button>

                      {zones.length === 0 && (
                        <p className="text-sm text-red-600 mt-4">
                          {totalDemand > 0 
                            ? 'Generate AI blueprint first or add zones manually to run simulation'
                            : 'Please add at least one zone to run the simulation'}
                        </p>
                      )}

                      {totalDemand > 0 && zones.length > 0 && (
                        <p className="text-sm text-green-600 mt-4">
                          ✓ Ready to simulate your {totalDemand.toLocaleString()}-unit demand warehouse
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Results Tab */}
            <TabsContent value="results" className="mt-8">
              <SimulationResults />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Add Zone Modal */}
      <AddZoneModal
        isOpen={showAddZoneModal}
        onClose={() => setShowAddZoneModal(false)}
      />
    </div>
  );
}
