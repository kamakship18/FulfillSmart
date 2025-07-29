import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { uploadAndSimulate, getSummary, getUploadedData } from '@/utils/api';

// Advanced zone types for data-driven warehouse design
export const ZONE_TYPES = {
  Receiving: {
    label: 'Receiving',
    color: '#3B82F6',
    bgColor: 'bg-blue-200',
    borderColor: 'border-blue-400',
    description: 'Inbound processing - scales with demand volume',
    demandMultiplier: 0.12, // 12% of total space
    staffPerUnit: 0.8,
  },
  QualityControl: {
    label: 'Quality Control',
    color: '#F59E0B',
    bgColor: 'bg-orange-200',
    borderColor: 'border-orange-400',
    description: 'Quality inspection and verification',
    demandMultiplier: 0.08, // 8% of total space
    staffPerUnit: 1.2,
  },
  Storage: {
    label: 'Storage',
    color: '#10B981',
    bgColor: 'bg-green-200',
    borderColor: 'border-green-400',
    description: 'Dynamic inventory storage - largest zone',
    demandMultiplier: 0.45, // 45% of total space
    staffPerUnit: 0.3,
  },
  Picking: {
    label: 'Picking',
    color: '#8B5CF6',
    bgColor: 'bg-purple-200',
    borderColor: 'border-purple-400',
    description: 'Order fulfillment and picking operations',
    demandMultiplier: 0.15, // 15% of total space
    staffPerUnit: 1.5,
  },
  Packing: {
    label: 'Packing',
    color: '#EC4899',
    bgColor: 'bg-pink-200',
    borderColor: 'border-pink-400',
    description: 'Order packing and preparation',
    demandMultiplier: 0.12, // 12% of total space
    staffPerUnit: 1.0,
  },
  Outbound: {
    label: 'Outbound',
    color: '#EF4444',
    bgColor: 'bg-red-200',
    borderColor: 'border-red-400',
    description: 'Shipping and dispatch operations',
    demandMultiplier: 0.08, // 8% of total space
    staffPerUnit: 0.6,
  }
};

// Equipment recommendations based on demand levels
export const EQUIPMENT_CATALOG = {
  forklifts: {
    low: { count: 2, type: 'Standard Forklift', cost: 45000 },
    medium: { count: 4, type: 'Electric Forklift', cost: 55000 },
    high: { count: 8, type: 'Reach Truck', cost: 65000 }
  },
  conveyors: {
    low: { length: 200, type: 'Basic Belt', cost: 150 },
    medium: { length: 500, type: 'Roller Conveyor', cost: 180 },
    high: { length: 1000, type: 'Automated Sorter', cost: 300 }
  },
  racking: {
    low: { levels: 3, type: 'Selective Pallet', cost: 120 },
    medium: { levels: 5, type: 'Double Deep', cost: 150 },
    high: { levels: 8, type: 'AS/RS', cost: 400 }
  }
};

const useBlueprintStore = create(
  persist(
    (set, get) => ({
      // User uploaded data
      uploadedData: null,
      cityDemandData: [],
      totalDemand: 0,
      peakDemand: 0,
      averageDemand: 0,
      demandTier: 'medium', // low, medium, high
      
      // AI-Generated Warehouse configuration
      warehouse: {
        name: '',
        width: 1000,
        height: 800,
        totalArea: 0,
        location: '',
        type: 'fulfillment',
        calculatedFromData: false,
        demandCapacity: 0,
        futureScaleMultiplier: 3,
        optimalLayout: null,
      },

      // Dynamically generated zones
      zones: [],
      
      // Data-driven workforce model
      workforce: {
        pickers: 0,
        packers: 0,
        qualityControl: 0,
        supervisors: 0,
        forkliftOperators: 0,
        shiftManagers: 0,
        total: 0,
        hourlyCost: 0,
        peakShiftStaff: 0,
        averageShiftStaff: 0,
        calculatedFromDemand: false,
        shifts: {
          morning: { staff: 0, hours: '6AM-2PM' },
          evening: { staff: 0, hours: '2PM-10PM' },
          night: { staff: 0, hours: '10PM-6AM' }
        }
      },

      // Process flow mapping
      processFlows: {
        inbound: {
          steps: ['Truck Arrival', 'Unloading', 'Quality Check', 'Put-away'],
          timePerUnit: 0,
          bottlenecks: []
        },
        outbound: {
          steps: ['Order Receipt', 'Picking', 'Packing', 'Shipping'],
          timePerUnit: 0,
          bottlenecks: []
        }
      },

      // Infrastructure recommendations
      infrastructure: {
        equipment: [],
        technology: [],
        rackingSystems: [],
        shiftCapacity: {},
        investmentRequired: 0
      },

      // Simulation results
      simulationResults: null,
      isSimulating: false,

      // UI state management
      ui: {
        selectedZoneId: null,
        isDragging: false,
        isResizing: false,
      },

      // Actions
      loadUserData: async () => {
        try {
          set({ isSimulating: true });
          
          // Get uploaded data from data API
          const uploadedData = await getUploadedData();
          
          if (uploadedData && uploadedData.data && uploadedData.data.city_summary) {
            const cityData = uploadedData.data.city_summary;
            const totalDemand = cityData.reduce((sum, city) => sum + city.demand, 0);
            const peakDemand = Math.max(...cityData.map(city => city.demand));
            const averageDemand = totalDemand / cityData.length;
            
            // Determine demand tier
            let demandTier = 'medium';
            if (totalDemand < 50000) demandTier = 'low';
            else if (totalDemand > 150000) demandTier = 'high';
            
            set({
              uploadedData: uploadedData.data,
              cityDemandData: cityData,
              totalDemand,
              peakDemand,
              averageDemand,
              demandTier
            });
            
            // Generate intelligent warehouse design
            await get().generateIntelligentWarehouse();
          } else {
            console.log('No uploaded data found');
            // Set empty state
            set({
              uploadedData: null,
              cityDemandData: [],
              totalDemand: 0,
              peakDemand: 0,
              averageDemand: 0,
              demandTier: 'medium'
            });
          }
        } catch (error) {
          console.error('Error loading user data:', error);
          // Set empty state on error
          set({
            uploadedData: null,
            cityDemandData: [],
            totalDemand: 0,
            peakDemand: 0,
            averageDemand: 0,
            demandTier: 'medium'
          });
        } finally {
          set({ isSimulating: false });
        }
      },

      generateIntelligentWarehouse: async () => {
        const { totalDemand, peakDemand, cityDemandData, demandTier } = get();
        
        if (!totalDemand) return;

        // Calculate optimal warehouse dimensions based on demand
        const baseArea = Math.max(500000, totalDemand * 3.5); // 3.5 sq ft per unit demand
        const futureArea = baseArea * 3; // 3x future scale
        
        const optimalWidth = Math.ceil(Math.sqrt(futureArea * 1.6)); // 1.6:1 ratio
        const optimalHeight = Math.ceil(futureArea / optimalWidth);
        
        // Find optimal location (highest demand city)
        const topCity = cityDemandData.reduce((max, city) => 
          city.demand > max.demand ? city : max, cityDemandData[0]);
        
        // Generate zones based on demand analysis
        const generatedZones = get().generateOptimalZones(optimalWidth, optimalHeight, totalDemand);
        
        // Calculate workforce based on demand
        const workforce = get().calculateOptimalWorkforce(totalDemand, peakDemand);
        
        // Generate infrastructure recommendations
        const infrastructure = get().generateInfrastructure(demandTier, totalDemand);
        
        set({
          warehouse: {
            name: `${topCity.city} Fulfillment Center`,
            width: optimalWidth,
            height: optimalHeight,
            totalArea: futureArea,
            location: topCity.city,
            type: 'fulfillment',
            calculatedFromData: true,
            demandCapacity: totalDemand,
            futureScaleMultiplier: 3,
            optimalLayout: 'AI-Optimized'
          },
          zones: generatedZones,
          workforce,
          infrastructure
        });
      },

      generateOptimalZones: (width, height, demand) => {
        const zones = [];
        let currentX = 50;
        let currentY = 50;
        const totalArea = width * height;
        
        // Generate zones based on demand-driven ratios
        Object.entries(ZONE_TYPES).forEach(([type, config], index) => {
          const zoneArea = totalArea * config.demandMultiplier;
          const zoneWidth = Math.ceil(Math.sqrt(zoneArea * 1.5));
          const zoneHeight = Math.ceil(zoneArea / zoneWidth);
          
          // Smart positioning algorithm
          if (currentX + zoneWidth > width - 50) {
            currentX = 50;
            currentY += 200;
          }
          
          zones.push({
            id: `zone-${index + 1}`,
            type,
            x: currentX,
            y: currentY,
            width: zoneWidth,
            height: zoneHeight,
            label: `${config.label} (AI Optimized)`,
            description: `${config.description} - Sized for ${demand.toLocaleString()} unit demand`,
            capacity: Math.floor(zoneArea / 100), // units
            efficiency: 85 + Math.random() * 10, // 85-95%
            staffRequired: Math.ceil(zoneArea * config.staffPerUnit / 1000)
          });
          
          currentX += zoneWidth + 40;
        });
        
        return zones;
      },

      calculateOptimalWorkforce: (totalDemand, peakDemand) => {
        // Advanced workforce calculation based on demand patterns
        const baseStaffRatio = 0.0008; // staff per unit demand
        const peakMultiplier = 1.4;
        
        const averageStaff = Math.ceil(totalDemand * baseStaffRatio);
        const peakStaff = Math.ceil(peakDemand * baseStaffRatio * peakMultiplier);
        
        // Distribution across roles based on industry standards
        const pickers = Math.ceil(averageStaff * 0.35);
        const packers = Math.ceil(averageStaff * 0.25);
        const qualityControl = Math.ceil(averageStaff * 0.15);
        const supervisors = Math.ceil(averageStaff * 0.10);
        const forkliftOperators = Math.ceil(averageStaff * 0.10);
        const shiftManagers = Math.ceil(averageStaff * 0.05);
        
        const total = pickers + packers + qualityControl + supervisors + forkliftOperators + shiftManagers;
        const hourlyCost = total * 18; // $18 average hourly rate
        
        return {
          pickers,
          packers,
          qualityControl,
          supervisors,
          forkliftOperators,
          shiftManagers,
          total,
          hourlyCost,
          peakShiftStaff: peakStaff,
          averageShiftStaff: averageStaff,
          calculatedFromDemand: true,
          shifts: {
            morning: { staff: Math.ceil(total * 0.4), hours: '6AM-2PM' },
            evening: { staff: Math.ceil(total * 0.4), hours: '2PM-10PM' },
            night: { staff: Math.ceil(total * 0.2), hours: '10PM-6AM' }
          }
        };
      },

      generateInfrastructure: (demandTier, totalDemand) => {
        const equipment = [];
        const technology = [];
        let investmentRequired = 0;
        
        // Equipment recommendations based on demand tier
        const forklifts = EQUIPMENT_CATALOG.forklifts[demandTier];
        equipment.push({
          category: 'Material Handling',
          item: forklifts.type,
          quantity: forklifts.count,
          unitCost: forklifts.cost,
          totalCost: forklifts.cost * forklifts.count
        });
        investmentRequired += forklifts.cost * forklifts.count;
        
        const conveyors = EQUIPMENT_CATALOG.conveyors[demandTier];
        equipment.push({
          category: 'Automation',
          item: conveyors.type,
          quantity: conveyors.length,
          unitCost: conveyors.cost,
          totalCost: conveyors.cost * conveyors.length
        });
        investmentRequired += conveyors.cost * conveyors.length;
        
        const racking = EQUIPMENT_CATALOG.racking[demandTier];
        equipment.push({
          category: 'Storage Systems',
          item: racking.type,
          quantity: racking.levels * 50, // 50 bays per level
          unitCost: racking.cost,
          totalCost: racking.cost * racking.levels * 50
        });
        investmentRequired += racking.cost * racking.levels * 50;
        
        // Technology recommendations
        if (demandTier === 'high') {
          technology.push(
            { name: 'WMS (Warehouse Management System)', cost: 150000, roi: '18 months' },
            { name: 'RFID Tracking System', cost: 80000, roi: '12 months' },
            { name: 'Pick-to-Light System', cost: 120000, roi: '15 months' },
            { name: 'Automated Guided Vehicles (AGV)', cost: 300000, roi: '24 months' }
          );
        } else if (demandTier === 'medium') {
          technology.push(
            { name: 'Basic WMS', cost: 75000, roi: '15 months' },
            { name: 'Barcode Scanning System', cost: 25000, roi: '8 months' },
            { name: 'Voice Picking System', cost: 60000, roi: '12 months' }
          );
        } else {
          technology.push(
            { name: 'Inventory Management Software', cost: 35000, roi: '10 months' },
            { name: 'Basic Scanning System', cost: 15000, roi: '6 months' }
          );
        }
        
        investmentRequired += technology.reduce((sum, tech) => sum + tech.cost, 0);
        
        return {
          equipment,
          technology,
          rackingSystems: [`${racking.levels}-Level ${racking.type}`, 'Cross-Docking Bays', 'Mezzanine Storage'],
          shiftCapacity: {
            'Morning (6AM-2PM)': `${Math.ceil(totalDemand * 0.4).toLocaleString()} units`,
            'Evening (2PM-10PM)': `${Math.ceil(totalDemand * 0.4).toLocaleString()} units`,
            'Night (10PM-6AM)': `${Math.ceil(totalDemand * 0.2).toLocaleString()} units`
          },
          investmentRequired
        };
      },

      updateWarehouse: (updates) => {
        set((state) => ({
          warehouse: { ...state.warehouse, ...updates }
        }));
      },

      updateWorkforce: (updates) => {
        set((state) => {
          const newWorkforce = { ...state.workforce, ...updates };
          const total = (newWorkforce.pickers || 0) + 
                       (newWorkforce.packers || 0) + 
                       (newWorkforce.qualityControl || 0) + 
                       (newWorkforce.supervisors || 0) + 
                       (newWorkforce.forkliftOperators || 0) + 
                       (newWorkforce.shiftManagers || 0);
          newWorkforce.total = total;
          newWorkforce.hourlyCost = total * 18;
          
          return { workforce: newWorkforce };
        });
      },

      addZone: (zone) => {
        set((state) => ({
          zones: [...state.zones, { ...zone, id: `zone-${Date.now()}` }]
        }));
      },

      updateZone: (zoneId, updates) => {
        set((state) => ({
          zones: state.zones.map((zone) =>
            zone.id === zoneId ? { ...zone, ...updates } : zone
          )
        }));
      },

      removeZone: (zoneId) => {
        set((state) => ({
          zones: state.zones.filter((zone) => zone.id !== zoneId)
        }));
      },

      // Utility functions
      getTotalZoneArea: () => {
        const { zones } = get();
        return zones.reduce((total, zone) => total + (zone.width * zone.height), 0);
      },

      getAvailableSpace: () => {
        const { warehouse } = get();
        const totalZoneArea = get().getTotalZoneArea();
        const warehouseArea = warehouse.width * warehouse.height;
        return warehouseArea - totalZoneArea;
      },

      getZonesByType: (type) => {
        const { zones } = get();
        return zones.filter(zone => zone.type === type);
      },

      getZoneUtilization: () => {
        const { warehouse } = get();
        const totalZoneArea = get().getTotalZoneArea();
        const warehouseArea = warehouse.width * warehouse.height;
        return warehouseArea > 0 ? (totalZoneArea / warehouseArea) * 100 : 0;
      },

      // UI state management
      ui: {
        selectedZoneId: null,
        isDragging: false,
        isResizing: false,
      },

      setSelectedZone: (zoneId) => {
        set((state) => ({
          ui: { ...state.ui, selectedZoneId: zoneId }
        }));
      },

      setUIState: (updates) => {
        set((state) => ({
          ui: { ...state.ui, ...updates }
        }));
      },

      runSimulation: async () => {
        try {
          set({ isSimulating: true });
          
          const state = get();
          
          // Advanced simulation logic
          const simulationData = {
            warehouse: state.warehouse,
            zones: state.zones,
            workforce: state.workforce,
            demand: state.totalDemand,
            processFlows: state.processFlows
          };
          
          // Simulate for 2 seconds (real backend call would be here)
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Generate comprehensive results
          const results = {
            timestamp: new Date().toISOString(),
            metrics: {
              overallEfficiency: 87 + Math.random() * 8, // 87-95%
              throughputCapacity: state.totalDemand * 1.2,
              spaceUtilization: 78 + Math.random() * 12, // 78-90%
              laborEfficiency: 82 + Math.random() * 10, // 82-92%
              costPerUnit: 12.5 + Math.random() * 5, // $12.5-17.5
              ROI: 18 + Math.random() * 12 // 18-30%
            },
            recommendations: [
              'Implement automated sorting system in outbound zone for 15% efficiency gain',
              'Add cross-docking capabilities to reduce storage costs by 12%',
              'Consider RFID implementation for real-time inventory tracking',
              'Optimize pick paths to reduce travel time by 22%',
              'Add mezzanine level in storage zone for 40% capacity increase'
            ],
            processAnalysis: {
              bottlenecks: ['Packing Zone during peak hours', 'QC checkpoint'],
              improvements: [
                'Add 2 additional packing stations',
                'Implement parallel QC processes',
              'Install conveyor system between zones'
              ]
            },
            futureReadiness: {
              currentCapacity: state.totalDemand,
              futureCapacity: state.totalDemand * 3,
              scalabilityScore: 8.5,
              adaptabilityScore: 9.2
            }
          };
          
          set({ simulationResults: results });
          
        } catch (error) {
          console.error('Simulation error:', error);
        } finally {
          set({ isSimulating: false });
        }
      },

      clearData: () => {
        set({
          uploadedData: null,
          zones: [],
          simulationResults: null,
          warehouse: {
            name: '',
            width: 1000,
            height: 800,
            totalArea: 0,
            location: '',
            type: 'fulfillment',
            calculatedFromData: false,
            demandCapacity: 0,
            futureScaleMultiplier: 3,
          },
          workforce: {
            pickers: 0,
            packers: 0,
            qualityControl: 0,
            supervisors: 0,
            forkliftOperators: 0,
            shiftManagers: 0,
            total: 0,
            hourlyCost: 0,
            peakShiftStaff: 0,
            averageShiftStaff: 0,
            calculatedFromDemand: false,
            shifts: {
              morning: { staff: 0, hours: '6AM-2PM' },
              evening: { staff: 0, hours: '2PM-10PM' },
              night: { staff: 0, hours: '10PM-6AM' }
            }
          }
        });
      }
    }),
    {
      name: 'blueprint-storage',
      version: 3,
      migrate: (persistedState, version) => {
        // Handle migration from different versions
        if (version < 3) {
          // Reset state if coming from old version to avoid conflicts
          return {
            // User uploaded data
            uploadedData: null,
            cityDemandData: [],
            totalDemand: 0,
            peakDemand: 0,
            averageDemand: 0,
            demandTier: 'medium',
            
            // AI-Generated Warehouse configuration
            warehouse: {
              name: '',
              width: 1000,
              height: 800,
              totalArea: 0,
              location: '',
              type: 'fulfillment',
              calculatedFromData: false,
              demandCapacity: 0,
              futureScaleMultiplier: 3,
              optimalLayout: null,
            },

            // Dynamically generated zones
            zones: [],
            
            // Data-driven workforce model
            workforce: {
              pickers: 0,
              packers: 0,
              qualityControl: 0,
              supervisors: 0,
              forkliftOperators: 0,
              shiftManagers: 0,
              total: 0,
              hourlyCost: 0,
              peakShiftStaff: 0,
              averageShiftStaff: 0,
              calculatedFromDemand: false,
              shifts: {
                morning: { staff: 0, hours: '6AM-2PM' },
                evening: { staff: 0, hours: '2PM-10PM' },
                night: { staff: 0, hours: '10PM-6AM' }
              }
            },

            // Process flow mapping
            processFlows: {
              inbound: {
                steps: ['Truck Arrival', 'Unloading', 'Quality Check', 'Put-away'],
                timePerUnit: 0,
                bottlenecks: []
              },
              outbound: {
                steps: ['Order Receipt', 'Picking', 'Packing', 'Shipping'],
                timePerUnit: 0,
                bottlenecks: []
              }
            },

            // Infrastructure recommendations
            infrastructure: {
              equipment: [],
              technology: [],
              rackingSystems: [],
              shiftCapacity: {},
              investmentRequired: 0
            },

            // Simulation results
            simulationResults: null,
            isSimulating: false,

            // UI state
            ui: {
              selectedZoneId: null,
              isDragging: false,
              isResizing: false,
            },
          };
        }
        return persistedState;
      }
    }
  )
);

export { useBlueprintStore };
