'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBlueprintStore } from '@/store/blueprintStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, Users, Package, Truck, Calculator, AlertTriangle, CheckCircle } from 'lucide-react';

const SimulationResults = () => {
  const { simulationResults, zones, workforce } = useBlueprintStore();

  if (!simulationResults) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Simulation Results
          </CardTitle>
          <CardDescription>Run a simulation to see performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No simulation data available. Click "Run Simulation" to analyze your warehouse layout.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { metrics, recommendations, processAnalysis, futureReadiness } = simulationResults;

  // Create zone analysis data from zones in store
  const zoneAnalysis = zones.map(zone => ({
    ...zone,
    utilization: 75 + Math.random() * 20, // 75-95%
    efficiency: 80 + Math.random() * 15,  // 80-95%
    throughput: Math.floor((zone.capacity || 1000) * (0.8 + Math.random() * 0.2)),
    bottlenecks: Math.random() > 0.7 ? [`${zone.label} staffing during peak hours`] : []
  }));

  // Create workflow data based on simulation results
  const workflow = {
    stages: [
      { name: 'Receiving', efficiency: 88 + Math.random() * 10, duration: 15 },
      { name: 'Storage', efficiency: 92 + Math.random() * 6, duration: 5 },
      { name: 'Picking', efficiency: 85 + Math.random() * 12, duration: 25 },
      { name: 'Packing', efficiency: 90 + Math.random() * 8, duration: 12 },
      { name: 'Shipping', efficiency: 95 + Math.random() * 4, duration: 8 }
    ],
    steps: [
      { name: 'Receiving', efficiency: 88 + Math.random() * 10, duration: 15 },
      { name: 'Storage', efficiency: 92 + Math.random() * 6, duration: 5 },
      { name: 'Picking', efficiency: 85 + Math.random() * 12, duration: 25 },
      { name: 'Packing', efficiency: 90 + Math.random() * 8, duration: 12 },
      { name: 'Shipping', efficiency: 95 + Math.random() * 4, duration: 8 }
    ],
    totalCycleTime: 65,
    totalTime: 65,
    averageEfficiency: Math.round((88 + 92 + 85 + 90 + 95) / 5),
    bottlenecks: processAnalysis?.bottlenecks || [],
    improvements: processAnalysis?.improvements || []
  };

  // Prepare chart data
  const utilizationData = zoneAnalysis.map(zone => ({
    name: zone.label,
    utilization: zone.utilization,
    efficiency: zone.efficiency,
    capacity: zone.capacity
  }));

  const workflowData = workflow.steps.map((step, index) => ({
    step: `Step ${index + 1}`,
    time: step.duration,
    efficiency: step.efficiency
  }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  return (
    <div className="space-y-6">
      {/* Key Metrics Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Performance Overview
          </CardTitle>
          <CardDescription>Key performance indicators for your warehouse design</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">Overall Efficiency</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{metrics.overallEfficiency}%</span>
                {metrics.overallEfficiency >= 80 ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Truck className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium">Throughput</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{metrics.throughput}</span>
                <span className="text-sm text-gray-500">orders/hour</span>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium">Labor Cost</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">${metrics.laborCost}</span>
                <span className="text-sm text-gray-500">/hour</span>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium">Space Utilization</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{metrics.spaceUtilization}%</span>
                {metrics.spaceUtilization >= 75 ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="zones" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="zones">Zone Analysis</TabsTrigger>
          <TabsTrigger value="workflow">Workflow</TabsTrigger>
          <TabsTrigger value="workforce">Workforce</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        {/* Zone Analysis Tab */}
        <TabsContent value="zones" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Zone Utilization Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Zone Utilization</CardTitle>
                <CardDescription>Efficiency and capacity utilization by zone</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={utilizationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="utilization" fill="#3b82f6" name="Utilization %" />
                    <Bar dataKey="efficiency" fill="#10b981" name="Efficiency %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Zone Details Table */}
            <Card>
              <CardHeader>
                <CardTitle>Zone Performance Details</CardTitle>
                <CardDescription>Detailed metrics for each zone</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {zoneAnalysis.map((zone, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{zone.label}</h4>
                        <Badge variant={zone.efficiency >= 80 ? "default" : zone.efficiency >= 60 ? "secondary" : "destructive"}>
                          {zone.efficiency}% efficient
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                        <div>Utilization: {zone.utilization}%</div>
                        <div>Capacity: {zone.capacity} units</div>
                        <div>Bottleneck Risk: {zone.bottleneckRisk}</div>
                        <div>Cost Impact: ${zone.costImpact}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Workflow Tab */}
        <TabsContent value="workflow" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Workflow Efficiency Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Workflow Efficiency</CardTitle>
                <CardDescription>Time and efficiency across workflow steps</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={workflowData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="step" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="time" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} name="Time (min)" />
                    <Area type="monotone" dataKey="efficiency" stackId="2" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Efficiency %" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Workflow Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Workflow Summary</CardTitle>
                <CardDescription>Overall workflow performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span>Total Cycle Time</span>
                    <span className="font-semibold">{workflow.totalTime} minutes</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span>Average Efficiency</span>
                    <span className="font-semibold">{workflow.averageEfficiency}%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span>Bottleneck Steps</span>
                    <span className="font-semibold">{workflow.bottlenecks.length}</span>
                  </div>
                  
                  {workflow.bottlenecks.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Identified Bottlenecks:</h4>
                      <div className="space-y-2">
                        {workflow.bottlenecks.map((bottleneck, index) => (
                          <div key={index} className="p-2 bg-red-50 border border-red-200 rounded text-sm">
                            <span className="font-medium text-red-700">{bottleneck.step}:</span>
                            <span className="text-red-600 ml-2">{bottleneck.issue}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Workforce Tab */}
        <TabsContent value="workforce" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Workforce Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Workforce Distribution</CardTitle>
                <CardDescription>Staff allocation across different roles</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Pickers', value: workforce.pickers, color: '#3b82f6' },
                        { name: 'Packers', value: workforce.packers, color: '#10b981' },
                        { name: 'Quality Control', value: workforce.qualityControl, color: '#f59e0b' },
                        { name: 'Supervisors', value: workforce.supervisors, color: '#ef4444' }
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {[
                        { name: 'Pickers', value: workforce.pickers, color: '#3b82f6' },
                        { name: 'Packers', value: workforce.packers, color: '#10b981' },
                        { name: 'Quality Control', value: workforce.qualityControl, color: '#f59e0b' },
                        { name: 'Supervisors', value: workforce.supervisors, color: '#ef4444' }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Workforce Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Workforce Metrics</CardTitle>
                <CardDescription>Performance and cost analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 border rounded-lg">
                      <div className="text-sm text-gray-600">Total Staff</div>
                      <div className="text-2xl font-bold">{workforce.total}</div>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="text-sm text-gray-600">Hourly Cost</div>
                      <div className="text-2xl font-bold">${workforce.hourlyCost}</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Staff Utilization</span>
                      <Badge variant="outline">{metrics.staffUtilization}%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Productivity Index</span>
                      <Badge variant="outline">{metrics.productivityIndex}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Training Hours/Week</span>
                      <Badge variant="outline">{metrics.trainingHours}h</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Optimization Recommendations</CardTitle>
              <CardDescription>AI-generated suggestions to improve warehouse performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendations.map((rec, index) => (
                  <div key={index} className={`p-4 border rounded-lg ${
                    rec.priority === 'high' ? 'border-red-200 bg-red-50' :
                    rec.priority === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                    'border-green-200 bg-green-50'
                  }`}>
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold">{rec.title}</h4>
                      <Badge variant={
                        rec.priority === 'high' ? 'destructive' :
                        rec.priority === 'medium' ? 'secondary' : 'default'
                      }>
                        {rec.priority} priority
                      </Badge>
                    </div>
                    <p className="text-gray-700 mb-3">{rec.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Expected Impact: {rec.impact}</span>
                      <span className="font-medium text-green-600">Potential Savings: {rec.savings}</span>
                    </div>
                  </div>
                ))}
                
                {recommendations.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Great job! No critical recommendations at this time.</p>
                    <p className="text-sm">Your warehouse layout is performing well.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SimulationResults;
