from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import asyncio
import random
from datetime import datetime

router = APIRouter()

# Request/Response Models
class Zone(BaseModel):
    id: str
    type: str
    label: str
    description: Optional[str] = ""
    width: int
    height: int
    x: int
    y: int

class Warehouse(BaseModel):
    name: Optional[str] = "My Warehouse"
    width: int = 1000
    height: int = 800

class Workforce(BaseModel):
    pickers: int = 10
    packers: int = 6
    qualityControl: int = 3
    supervisors: int = 2

class SimulationRequest(BaseModel):
    warehouse: Warehouse
    zones: List[Zone]
    workforce: Workforce

class ZoneAnalysis(BaseModel):
    id: str
    label: str
    utilization: float
    efficiency: float
    capacity: int
    bottleneckRisk: str
    costImpact: float

class WorkflowStep(BaseModel):
    name: str
    duration: float
    efficiency: float

class Workflow(BaseModel):
    totalTime: float
    averageEfficiency: float
    steps: List[WorkflowStep]
    bottlenecks: List[Dict[str, str]]

class Metrics(BaseModel):
    overallEfficiency: float
    throughput: int
    laborCost: float
    spaceUtilization: float
    staffUtilization: float
    productivityIndex: float
    trainingHours: int

class Recommendation(BaseModel):
    title: str
    description: str
    priority: str  # high, medium, low
    impact: str
    savings: str

class SimulationResults(BaseModel):
    metrics: Metrics
    zoneAnalysis: List[ZoneAnalysis]
    workflow: Workflow
    recommendations: List[Recommendation]

def calculate_zone_efficiency(zone: Zone, workforce: Workforce, warehouse_area: int) -> ZoneAnalysis:
    """Calculate efficiency metrics for a zone"""
    zone_area = zone.width * zone.height
    zone_utilization = min(95, max(45, 60 + random.uniform(-15, 15)))
    
    # Calculate efficiency based on zone type and size
    base_efficiency = {
        'Storage': 75,
        'Receiving': 85,
        'Packing': 80,
        'Shipping': 82,
        'QualityControl': 70,
        'Office': 90
    }.get(zone.type, 75)
    
    efficiency = min(95, max(50, base_efficiency + random.uniform(-10, 10)))
    
    # Estimate capacity based on zone type and size
    capacity_per_sqft = {
        'Storage': 15,  # units per sq ft
        'Receiving': 8,
        'Packing': 12,
        'Shipping': 10,
        'QualityControl': 5,
        'Office': 2
    }.get(zone.type, 10)
    
    capacity = int(zone_area * capacity_per_sqft)
    
    # Determine bottleneck risk
    if efficiency < 60:
        bottleneck_risk = "High"
    elif efficiency < 75:
        bottleneck_risk = "Medium"
    else:
        bottleneck_risk = "Low"
    
    # Calculate cost impact (labor cost per hour for this zone)
    zone_workers = {
        'Storage': workforce.pickers * 0.6,
        'Receiving': workforce.pickers * 0.2,
        'Packing': workforce.packers,
        'Shipping': workforce.packers * 0.3,
        'QualityControl': workforce.qualityControl,
        'Office': workforce.supervisors
    }.get(zone.type, 2)
    
    cost_impact = zone_workers * 25  # $25/hour average
    
    return ZoneAnalysis(
        id=zone.id,
        label=zone.label,
        utilization=round(zone_utilization, 1),
        efficiency=round(efficiency, 1),
        capacity=capacity,
        bottleneckRisk=bottleneck_risk,
        costImpact=round(cost_impact, 2)
    )

def generate_workflow_analysis(zones: List[Zone], workforce: Workforce) -> Workflow:
    """Generate workflow analysis based on zones and workforce"""
    
    # Define typical warehouse workflow steps
    workflow_steps = []
    
    if any(z.type == 'Receiving' for z in zones):
        workflow_steps.append(WorkflowStep(
            name="Receiving",
            duration=round(15 + random.uniform(-3, 3), 1),
            efficiency=round(85 + random.uniform(-10, 10), 1)
        ))
    
    if any(z.type == 'QualityControl' for z in zones):
        workflow_steps.append(WorkflowStep(
            name="Quality Control",
            duration=round(8 + random.uniform(-2, 2), 1),
            efficiency=round(78 + random.uniform(-8, 8), 1)
        ))
    
    if any(z.type == 'Storage' for z in zones):
        workflow_steps.append(WorkflowStep(
            name="Storage/Put-away",
            duration=round(20 + random.uniform(-5, 5), 1),
            efficiency=round(82 + random.uniform(-12, 12), 1)
        ))
        
        workflow_steps.append(WorkflowStep(
            name="Picking",
            duration=round(35 + random.uniform(-8, 8), 1),
            efficiency=round(75 + random.uniform(-15, 15), 1)
        ))
    
    if any(z.type == 'Packing' for z in zones):
        workflow_steps.append(WorkflowStep(
            name="Packing",
            duration=round(12 + random.uniform(-3, 3), 1),
            efficiency=round(88 + random.uniform(-8, 8), 1)
        ))
    
    if any(z.type == 'Shipping' for z in zones):
        workflow_steps.append(WorkflowStep(
            name="Shipping",
            duration=round(10 + random.uniform(-2, 2), 1),
            efficiency=round(90 + random.uniform(-5, 5), 1)
        ))
    
    total_time = sum(step.duration for step in workflow_steps)
    avg_efficiency = sum(step.efficiency for step in workflow_steps) / len(workflow_steps) if workflow_steps else 0
    
    # Identify bottlenecks (steps with low efficiency or high duration)
    bottlenecks = []
    for step in workflow_steps:
        if step.efficiency < 70:
            bottlenecks.append({
                "step": step.name,
                "issue": f"Low efficiency ({step.efficiency}%) may cause delays"
            })
        if step.duration > 30:
            bottlenecks.append({
                "step": step.name,
                "issue": f"Long duration ({step.duration} min) creates bottleneck"
            })
    
    return Workflow(
        totalTime=round(total_time, 1),
        averageEfficiency=round(avg_efficiency, 1),
        steps=workflow_steps,
        bottlenecks=bottlenecks
    )

def generate_recommendations(zones: List[Zone], workforce: Workforce, warehouse: Warehouse, zone_analyses: List[ZoneAnalysis]) -> List[Recommendation]:
    """Generate AI-powered recommendations for optimization"""
    recommendations = []
    
    # Analyze zone efficiency issues
    low_efficiency_zones = [z for z in zone_analyses if z.efficiency < 70]
    if low_efficiency_zones:
        recommendations.append(Recommendation(
            title="Optimize Low-Efficiency Zones",
            description=f"Zones {', '.join([z.label for z in low_efficiency_zones])} are operating below 70% efficiency. Consider reorganizing layout, adding automation, or increasing staffing.",
            priority="high",
            impact="15-25% efficiency improvement",
            savings="$2,500-5,000/month"
        ))
    
    # Check workforce balance
    total_workers = workforce.pickers + workforce.packers + workforce.qualityControl + workforce.supervisors
    if workforce.pickers < total_workers * 0.4:
        recommendations.append(Recommendation(
            title="Increase Picking Staff",
            description="Current picking staff ratio is below optimal. Consider hiring additional pickers to improve throughput.",
            priority="medium",
            impact="10-15% throughput increase",
            savings="$1,800-3,200/month"
        ))
    
    # Check warehouse space utilization
    total_zone_area = sum(z.width * z.height for z in zones)
    warehouse_area = warehouse.width * warehouse.height
    space_utilization = (total_zone_area / warehouse_area) * 100
    
    if space_utilization < 60:
        recommendations.append(Recommendation(
            title="Optimize Space Utilization",
            description=f"Only {space_utilization:.1f}% of warehouse space is being used for operational zones. Consider expanding zones or adding new functional areas.",
            priority="medium",
            impact="20-30% capacity increase",
            savings="$3,000-6,000/month"
        ))
    
    # Check for missing zone types
    zone_types = set(z.type for z in zones)
    if 'QualityControl' not in zone_types and len(zones) > 2:
        recommendations.append(Recommendation(
            title="Add Quality Control Zone",
            description="No dedicated quality control area detected. Adding QC zone can reduce returns and improve customer satisfaction.",
            priority="low",
            impact="5-10% quality improvement",
            savings="$1,200-2,500/month"
        ))
    
    # Automation recommendations
    if total_workers > 20 and not any('automated' in z.description.lower() for z in zones):
        recommendations.append(Recommendation(
            title="Consider Automation Solutions",
            description="With your current workforce size, automated guided vehicles (AGVs) or conveyor systems could improve efficiency and reduce labor costs.",
            priority="medium",
            impact="25-40% efficiency improvement",
            savings="$8,000-15,000/month"
        ))
    
    return recommendations

@router.post("/simulate", response_model=SimulationResults)
async def simulate_warehouse(request: SimulationRequest):
    """
    Run a comprehensive warehouse simulation and return performance metrics
    """
    try:
        # Simulate processing time (in real implementation, this would be actual calculations)
        await asyncio.sleep(2)  # Simulate calculation time
        
        # Calculate zone analyses
        warehouse_area = request.warehouse.width * request.warehouse.height
        zone_analyses = [
            calculate_zone_efficiency(zone, request.workforce, warehouse_area) 
            for zone in request.zones
        ]
        
        # Generate workflow analysis
        workflow = generate_workflow_analysis(request.zones, request.workforce)
        
        # Calculate overall metrics
        total_workers = (request.workforce.pickers + request.workforce.packers + 
                        request.workforce.qualityControl + request.workforce.supervisors)
        
        # Calculate overall efficiency as weighted average of zone efficiencies
        if zone_analyses:
            total_zone_area = sum(z.width * z.height for z in request.zones)
            overall_efficiency = sum(
                (za.efficiency * (next(z for z in request.zones if z.id == za.id).width * 
                                next(z for z in request.zones if z.id == za.id).height))
                for za in zone_analyses
            ) / total_zone_area if total_zone_area > 0 else 75
        else:
            overall_efficiency = 75
        
        # Calculate throughput (orders per hour)
        base_throughput = total_workers * 8  # 8 orders per worker per hour base
        efficiency_multiplier = overall_efficiency / 100
        throughput = int(base_throughput * efficiency_multiplier)
        
        # Calculate labor cost
        labor_cost = total_workers * 25  # $25/hour average
        
        # Calculate space utilization
        used_area = sum(z.width * z.height for z in request.zones)
        space_utilization = (used_area / warehouse_area) * 100 if warehouse_area > 0 else 0
        
        metrics = Metrics(
            overallEfficiency=round(overall_efficiency, 1),
            throughput=throughput,
            laborCost=round(labor_cost, 2),
            spaceUtilization=round(space_utilization, 1),
            staffUtilization=round(85 + random.uniform(-10, 10), 1),
            productivityIndex=round(overall_efficiency * 1.2, 1),
            trainingHours=round(total_workers * 2.5, 0)
        )
        
        # Generate recommendations
        recommendations = generate_recommendations(
            request.zones, request.workforce, request.warehouse, zone_analyses
        )
        
        return SimulationResults(
            metrics=metrics,
            zoneAnalysis=zone_analyses,
            workflow=workflow,
            recommendations=recommendations
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation failed: {str(e)}")

@router.get("/zone-types")
async def get_zone_types():
    """
    Get available zone types with their configurations
    """
    return {
        "Storage": {
            "label": "Storage",
            "description": "Main inventory storage area with racking systems",
            "defaultWidth": 150,
            "defaultHeight": 120,
            "bgColor": "bg-blue-100",
            "borderColor": "border-blue-300",
            "minWorkers": 3,
            "optimalWorkers": 8
        },
        "Receiving": {
            "label": "Receiving",
            "description": "Inbound shipment processing and inspection area",
            "defaultWidth": 100,
            "defaultHeight": 80,
            "bgColor": "bg-green-100",
            "borderColor": "border-green-300",
            "minWorkers": 2,
            "optimalWorkers": 4
        },
        "Packing": {
            "label": "Packing",
            "description": "Order fulfillment and packaging stations",
            "defaultWidth": 120,
            "defaultHeight": 90,
            "bgColor": "bg-purple-100",
            "borderColor": "border-purple-300",
            "minWorkers": 2,
            "optimalWorkers": 6
        },
        "Shipping": {
            "label": "Shipping",
            "description": "Outbound processing and loading dock area",
            "defaultWidth": 100,
            "defaultHeight": 70,
            "bgColor": "bg-orange-100",
            "borderColor": "border-orange-300",
            "minWorkers": 1,
            "optimalWorkers": 3
        },
        "QualityControl": {
            "label": "Quality Control",
            "description": "Product inspection and quality assurance area",
            "defaultWidth": 80,
            "defaultHeight": 60,
            "bgColor": "bg-yellow-100",
            "borderColor": "border-yellow-300",
            "minWorkers": 1,
            "optimalWorkers": 3
        },
        "Office": {
            "label": "Office",
            "description": "Administrative and management workspace",
            "defaultWidth": 80,
            "defaultHeight": 50,
            "bgColor": "bg-gray-100",
            "borderColor": "border-gray-300",
            "minWorkers": 1,
            "optimalWorkers": 2
        }
    }

@router.post("/optimize")
async def optimize_warehouse(request: SimulationRequest):
    """
    Provide AI-powered optimization suggestions for warehouse layout
    """
    try:
        # Simulate AI processing time
        await asyncio.sleep(1.5)
        
        total_area = request.warehouse.width * request.warehouse.height
        used_area = sum(z.width * z.height for z in request.zones)
        
        optimizations = []
        
        # Space optimization
        if used_area / total_area < 0.6:
            optimizations.append({
                "type": "space",
                "title": "Expand Storage Zones",
                "description": "Increase storage zone sizes to better utilize available space",
                "impact": "25% capacity increase",
                "confidence": 0.85
            })
        
        # Layout optimization
        storage_zones = [z for z in request.zones if z.type == 'Storage']
        if len(storage_zones) > 1:
            optimizations.append({
                "type": "layout",
                "title": "Consolidate Storage Areas",
                "description": "Combine smaller storage zones for improved efficiency",
                "impact": "15% picking efficiency increase",
                "confidence": 0.78
            })
        
        # Workflow optimization
        has_receiving = any(z.type == 'Receiving' for z in request.zones)
        has_shipping = any(z.type == 'Shipping' for z in request.zones)
        
        if has_receiving and has_shipping:
            optimizations.append({
                "type": "workflow",
                "title": "Optimize Flow Path",
                "description": "Reorganize zones to create efficient receiving-to-shipping workflow",
                "impact": "20% processing time reduction",
                "confidence": 0.92
            })
        
        return {
            "optimizations": optimizations,
            "generated_at": datetime.now().isoformat(),
            "total_potential_improvement": "25-45%"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Optimization failed: {str(e)}")
