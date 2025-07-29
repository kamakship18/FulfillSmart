# Core Excel processing logic using pandas
import pandas as pd
from io import BytesIO
from fastapi import UploadFile

async def process_excel_file(file: UploadFile):
    """
    Process uploaded Excel file and extract logistics data
    """
    try:
        # Read Excel file content
        content = await file.read()
        excel_data = pd.read_excel(BytesIO(content))
        
        # Basic data validation and cleaning
        if excel_data.empty:
            raise ValueError("Excel file is empty")
        
        # Debug: Print column names to understand the structure
        print(f"Excel columns: {list(excel_data.columns)}")
        print(f"Data shape: {excel_data.shape}")
        print(f"First few rows:\n{excel_data.head()}")
        
        # Convert ALL rows to individual orders (not grouped by city)
        orders_list = []
        for index, row in excel_data.iterrows():
            order_data = {}
            
            # Map all columns to preserve original data
            for col in excel_data.columns:
                col_lower = col.lower().strip()
                raw_value = row[col]
                
                # Skip NaN values
                if pd.isna(raw_value):
                    continue
                    
                if 'city' in col_lower or 'location' in col_lower or 'place' in col_lower:
                    order_data['city'] = str(raw_value).strip()
                elif 'demand' in col_lower or 'volume' in col_lower or 'quantity' in col_lower:
                    try:
                        order_data['volume'] = float(raw_value)
                    except:
                        order_data['volume'] = 0
                elif 'type' in col_lower:
                    order_data['order_type'] = str(raw_value).strip().upper()
                elif 'cost' in col_lower or 'price' in col_lower:
                    try:
                        order_data['base_cost'] = float(raw_value)
                    except:
                        order_data['base_cost'] = 0
                elif 'id' in col_lower and 'order' in col_lower:
                    order_data['order_id'] = str(raw_value).strip()
                else:
                    # Store all other columns as well for reference
                    order_data[col_lower.replace(' ', '_')] = str(raw_value).strip()
            
            # Set required defaults for missing fields
            if 'city' not in order_data:
                order_data['city'] = f"City_{index + 1}"
            if 'volume' not in order_data:
                order_data['volume'] = 10000  # Default volume
            if 'order_type' not in order_data:
                order_data['order_type'] = "B2B"  # Default order type
            if 'base_cost' not in order_data:
                order_data['base_cost'] = 0
            if 'order_id' not in order_data:
                order_data['order_id'] = f"ORD_{index + 1:04d}"
                
            orders_list.append(order_data)
        
        # Process and return data with all orders
        processed_data = {
            'orders': orders_list,  # Changed from 'cities' to 'orders'
            'total_records': len(orders_list),
            'columns': list(excel_data.columns),
            'sample_data': orders_list[:3] if len(orders_list) > 0 else []  # For debugging
        }
        
        print(f"Processed {len(orders_list)} orders")
        print(f"Sample processed data: {processed_data['sample_data']}")
        
        return processed_data
    
    except Exception as e:
        print(f"Error in process_excel_file: {str(e)}")
        raise Exception(f"Error processing Excel file: {str(e)}")

def validate_data_structure(data):
    """
    Validate the structure of processed data
    """
    required_fields = ['orders', 'total_records']
    
    for field in required_fields:
        if field not in data:
            raise ValueError(f"Missing required field: {field}")
    
    if not isinstance(data['orders'], list) or len(data['orders']) == 0:
        raise ValueError("No valid orders found in the data")
    
    return True

# Global storage for processed data (in production, use a database)
_stored_processed_data = None

def store_processed_data(data):
    """Store processed data globally"""
    global _stored_processed_data
    _stored_processed_data = data

def get_processed_data():
    """Get stored processed data"""
    global _stored_processed_data
    return _stored_processed_data

def clear_processed_data():
    """Clear stored processed data"""
    global _stored_processed_data
    _stored_processed_data = None
