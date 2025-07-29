# to simulate → process Excel & return simulation
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from services.process_excel import process_excel_file
from services.simulator import run_simulation

router = APIRouter()

@router.post("/simulate")
async def simulate_logistics(
    file: UploadFile = File(...),
    breakEvenVolume: str = Form(...),
    targetTime: str = Form(...),
    demandMultiplier: str = Form(...)
):
    """
    Process uploaded Excel file and return simulation results
    """
    try:
        # Validate file type
        if not file.filename.endswith(('.xlsx', '.xls')):
            raise HTTPException(status_code=400, detail="Please upload an Excel file (.xlsx or .xls)")
        
        # Convert form parameters to appropriate types
        break_even_volume = int(breakEvenVolume)
        target_time = int(targetTime)
        demand_multiplier = float(demandMultiplier)
        
        # Process Excel file
        print(f"Processing file: {file.filename}")
        processed_data = await process_excel_file(file)
        print(f"Processed data structure: {list(processed_data.keys())}")
        print(f"Number of orders: {processed_data.get('total_records', 0)}")

        # Store the processed data for blueprint access
        from services.process_excel import store_processed_data
        store_processed_data(processed_data)

        simulation_results = run_simulation(
            processed_data,
            break_even_volume=break_even_volume,
            target_time=target_time,
            demand_multiplier=demand_multiplier
        )
        
        print(f"Simulation completed. Results count: {len(simulation_results)}")
        
        # Store results for analytics
        from services.simulator import store_simulation_results
        store_simulation_results(simulation_results)
        
        return {
            "status": "success",
            "data": simulation_results,
            "message": "Simulation completed successfully"
        }
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid parameter values: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing simulation: {str(e)}")
