# GET /api/grouped-summary → aggregated data by city + order type
from fastapi import APIRouter, HTTPException, Query
from services.simulator import get_grouped_summary, get_order_details, get_latest_simulation_data
from typing import Optional, List
import pandas as pd

router = APIRouter()

@router.get("/grouped-summary")
async def get_grouped_summary_data():
    """
    Get aggregated summary data grouped by city and order type
    """
    try:
        summary_data = get_grouped_summary()
        
        return {
            "status": "success",
            "data": summary_data,
            "message": "Grouped summary data retrieved successfully"
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving grouped summary: {str(e)}")

@router.get("/order-details")
async def get_order_details_data(
    city: str = Query(..., description="City name to filter by"),
    order_type: str = Query(..., description="Order type to filter by")
):
    """
    Get detailed order data filtered by city and order type
    """
    try:
        order_details = get_order_details(city, order_type)
        
        return {
            "status": "success",
            "data": order_details,
            "message": f"Order details for {city} - {order_type} retrieved successfully"
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving order details: {str(e)}")

@router.get("/insights-data")
async def get_insights_data(
    city: Optional[str] = Query(None, description="Comma-separated list of cities to filter by"),
    orderType: Optional[str] = Query(None, description="Comma-separated list of order types to filter by"),
    minVolume: Optional[float] = Query(0, description="Minimum order volume filter"),
    savingsThreshold: Optional[float] = Query(-100, description="Minimum savings percentage threshold")
):
    """
    Get comprehensive insights data for analytics dashboard with filtering capabilities
    """
    try:
        # Get the latest simulation data
        simulation_data = get_latest_simulation_data()
        
        if not simulation_data:
            raise HTTPException(status_code=404, detail="No simulation data available. Please run a simulation first.")
        
        # Convert to DataFrame for easier processing
        df = pd.DataFrame(simulation_data)
        
        # Apply filters
        if city:
            cities = [c.strip() for c in city.split(',')]
            df = df[df['city'].isin(cities)]
            
        if orderType:
            order_types = [ot.strip() for ot in orderType.split(',')]
            df = df[df['order_type'].isin(order_types)]
            
        if minVolume is not None:
            df = df[df['volume'] >= minVolume]
            
        if savingsThreshold is not None:
            df = df[df['savings_percent'] >= savingsThreshold]
        
        # Calculate summary statistics
        total_cities = len(df['city'].unique())
        recommended_count = len(df[df['recommended'] == True])
        avg_savings = df['savings_percent'].mean() if len(df) > 0 else 0
        
        # Find cities with highest/lowest savings
        if len(df) > 0:
            highest_saving_city = df.loc[df['savings_percent'].idxmax(), 'city']
            lowest_saving_city = df.loc[df['savings_percent'].idxmin(), 'city']
        else:
            highest_saving_city = "N/A"
            lowest_saving_city = "N/A"
        
        # Prepare chart data
        charts_data = {
            "costVsTime": [],
            "savingsHistogram": [],
            "volumeVsSavings": [],
            "recommendationSplit": []
        }
        
        if len(df) > 0:
            # Cost vs Time data (assuming transit_time is available)
            for _, row in df.iterrows():
                charts_data["costVsTime"].append({
                    "city": row['city'],
                    "time": row.get('transit_time', 15),  # Default value if not available
                    "mwCost": row['mw_cost'],
                    "rdcCost": row['rdc_cost'],
                    "volume": row['volume']
                })
            
            # Savings histogram
            savings_bins = [
                ("<0%", len(df[df['savings_percent'] < 0])),
                ("0-5%", len(df[(df['savings_percent'] >= 0) & (df['savings_percent'] < 5)])),
                ("5-10%", len(df[(df['savings_percent'] >= 5) & (df['savings_percent'] < 10)])),
                ("10-15%", len(df[(df['savings_percent'] >= 10) & (df['savings_percent'] < 15)])),
                ("15-20%", len(df[(df['savings_percent'] >= 15) & (df['savings_percent'] < 20)])),
                ("20-30%", len(df[(df['savings_percent'] >= 20) & (df['savings_percent'] < 30)])),
                ("30%+", len(df[df['savings_percent'] >= 30]))
            ]
            
            charts_data["savingsHistogram"] = [
                {"bucket": bucket, "count": count} 
                for bucket, count in savings_bins if count > 0
            ]
            
            # Volume vs Savings scatter plot
            for _, row in df.iterrows():
                charts_data["volumeVsSavings"].append({
                    "city": row['city'],
                    "volume": row['volume'],
                    "savings": row['savings_percent'],
                    "recommended": row['recommended']
                })
            
            # Recommendation split
            recommended_count = len(df[df['recommended'] == True])
            not_recommended_count = len(df[df['recommended'] == False])
            total = recommended_count + not_recommended_count
            
            if total > 0:
                charts_data["recommendationSplit"] = [
                    {
                        "name": "Recommended",
                        "count": recommended_count,
                        "percentage": round((recommended_count / total) * 100, 1)
                    },
                    {
                        "name": "Not Recommended", 
                        "count": not_recommended_count,
                        "percentage": round((not_recommended_count / total) * 100, 1)
                    }
                ]
        
        # Prepare table data
        table_data = []
        for _, row in df.iterrows():
            table_data.append({
                "city": row['city'],
                "orderType": row['order_type'],
                "volume": row['volume'],
                "mwCost": row['mw_cost'],
                "rdcCost": row['rdc_cost'],
                "savings": row['savings_percent'],
                "transitTime": row.get('transit_time', 15),  # Default value
                "recommended": row['recommended'],
                "breakEvenAchieved": row['savings_percent'] > 10 and row['volume'] > 200  # Business logic
            })
        
        return {
            "summary": {
                "totalCities": total_cities,
                "recommendedCount": recommended_count,
                "avgSavings": f"{avg_savings:.1f}%",
                "highestSavingCity": highest_saving_city,
                "lowestSavingCity": lowest_saving_city
            },
            "charts": charts_data,
            "tableData": table_data
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving insights data: {str(e)}")
