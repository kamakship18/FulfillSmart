# GET /summary → aggregate metrics
from fastapi import APIRouter, HTTPException
from services.simulator import get_aggregate_metrics

router = APIRouter()

@router.get("/summary")
async def get_summary():
    """
    Get aggregate metrics and summary data
    """
    try:
        summary_data = get_aggregate_metrics()
        
        return {
            "status": "success",
            "data": summary_data,
            "message": "Summary data retrieved successfully"
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving summary: {str(e)}")
