# Pydantic models for request/response validation
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class CityData(BaseModel):
    """Model for individual city data"""
    city: str
    demand: Optional[float] = None
    location: Optional[str] = None
    coordinates: Optional[List[float]] = None

class SimulationRequest(BaseModel):
    """Model for simulation request"""
    cities: List[CityData]
    simulation_type: Optional[str] = "standard"

class CostAnalysis(BaseModel):
    """Model for cost analysis results"""
    total_cost: float
    cost_per_city: float
    base_cost: float

class TimeAnalysis(BaseModel):
    """Model for time analysis results"""
    average_delivery_time: float
    min_delivery_time: float
    max_delivery_time: float

class BreakEvenAnalysis(BaseModel):
    """Model for break-even analysis"""
    break_even_units: int
    fixed_costs: float
    variable_cost_per_unit: float
    revenue_per_unit: float

class RDCRecommendation(BaseModel):
    """Model for RDC recommendations"""
    name: str
    coordinates: List[float]
    coverage_cities: int

class SimulationResponse(BaseModel):
    """Model for simulation response"""
    cost_analysis: CostAnalysis
    time_analysis: TimeAnalysis
    break_even_analysis: BreakEvenAnalysis
    recommended_rdcs: List[RDCRecommendation]
    total_cities: int

class SummaryData(BaseModel):
    """Model for summary/aggregate data"""
    total_simulations: int
    avg_cost_savings: float
    avg_time_savings: float
    active_rdcs: int
    cities_covered: int

class APIResponse(BaseModel):
    """Generic API response model"""
    status: str
    data: Dict[str, Any]
    message: str
