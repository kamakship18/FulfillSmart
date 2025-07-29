from fastapi import APIRouter, HTTPException
from services.process_excel import get_processed_data

router = APIRouter()

@router.get("/data")
async def get_uploaded_data():
    """
    Get the raw uploaded and processed data for blueprint generation
    """
    try:
        data = get_processed_data()
        
        if not data or not data.get('orders'):
            return {
                "status": "success", 
                "data": None,
                "message": "No data uploaded yet"
            }
        
        # Transform order data into city summary format for blueprint
        city_data = {}
        
        for order in data['orders']:
            city = order.get('city', 'Unknown')
            volume = order.get('volume', 0)
            
            if city not in city_data:
                city_data[city] = {
                    'city': city,
                    'demand': 0,
                    'total_orders': 0
                }
            
            city_data[city]['demand'] += volume
            city_data[city]['total_orders'] += 1
        
        # Convert to list and sort by demand
        city_summary = list(city_data.values())
        city_summary.sort(key=lambda x: x['demand'], reverse=True)
        
        return {
            "status": "success",
            "data": {
                "city_summary": city_summary,
                "total_orders": len(data['orders']),
                "total_cities": len(city_summary)
            },
            "message": "Uploaded data retrieved successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving data: {str(e)}")
