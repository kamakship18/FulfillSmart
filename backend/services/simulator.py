# Cost comparison, break-even logic and simulation engine
import numpy as np
import pandas as pd
from typing import Dict, List

def run_simulation(processed_data: Dict, break_even_volume: int = 1000, target_time: int = 24, demand_multiplier: float = 1.0) -> List[Dict]:
    """
    Run logistics simulation based on processed Excel data and return order-wise results
    """
    try:
        # Use the actual order data from Excel
        orders_data = processed_data.get('orders', [])
        if not orders_data:
            raise ValueError("No order data found in processed file")
        
        print(f"Processing {len(orders_data)} orders from Excel file")
        
        results = []
        
        # Process each actual order from the Excel file
        for order_data in orders_data:
            # Get actual values from the Excel data
            city_name = order_data.get('city', 'Unknown')
            original_volume = order_data.get('volume', 0)
            order_type = order_data.get('order_type', 'B2B')
            base_cost = order_data.get('base_cost', 0)
            order_id = order_data.get('order_id', '')
            
            # Apply demand multiplier to the actual volume
            volume = int(original_volume * demand_multiplier)
            
            # Calculate costs based on actual volume and order type
            cost_multiplier = 1.3 if order_type.upper() == 'B2C' else 1.0
            
            # Main warehouse cost calculation
            mw_cost = (volume * 3.2 * cost_multiplier) + base_cost + np.random.randint(500, 2000)
            
            # RDC cost calculation (typically 15-25% cheaper)
            cost_reduction = 0.20 if order_type.upper() == 'B2B' else 0.15  # B2B gets better rates
            rdc_cost = (mw_cost * (1 - cost_reduction)) + np.random.randint(-200, 200)
            
            # Calculate savings
            savings_amount = mw_cost - rdc_cost
            savings_percent = round((savings_amount / mw_cost) * 100, 1) if mw_cost > 0 else 0
            
            # Determine recommendation based on volume and savings
            volume_threshold = break_even_volume * 1.2 if order_type.upper() == 'B2C' else break_even_volume
            recommended = (volume >= volume_threshold and savings_percent > 8)
            
            result = {
                "order_id": order_id,
                "city": city_name,
                "order_type": order_type.upper(),
                "volume": volume,
                "original_volume": int(original_volume),
                "mw_cost": int(mw_cost),
                "rdc_cost": int(rdc_cost),
                "savings_amount": int(savings_amount),
                "savings_percent": savings_percent,
                "recommended": recommended,
                "break_even_volume": volume_threshold
            }
            results.append(result)
        
        print(f"Generated {len(results)} simulation results")
        print(f"Sample result: {results[0] if results else 'No results'}")
        
        # Store results globally for analytics
        store_simulation_results(results)
        
        return results
    
    except Exception as e:
        print(f"Error in run_simulation: {str(e)}")
        raise Exception(f"Error running simulation: {str(e)}")

def calculate_cost_analysis(cities_data: List[Dict]) -> Dict:
    """
    Calculate cost analysis for different logistics scenarios
    """
    # Sample cost calculation logic
    base_cost = 1000
    variable_cost_per_city = 50
    
    total_cost = base_cost + (len(cities_data) * variable_cost_per_city)
    
    return {
        'total_cost': total_cost,
        'cost_per_city': variable_cost_per_city,
        'base_cost': base_cost
    }

def calculate_time_analysis(cities_data: List[Dict]) -> Dict:
    """
    Calculate time analysis for delivery scenarios
    """
    # Sample time calculation logic
    avg_delivery_time = np.random.uniform(2, 7, len(cities_data)).mean()
    
    return {
        'average_delivery_time': round(avg_delivery_time, 2),
        'min_delivery_time': 2,
        'max_delivery_time': 7
    }

def calculate_break_even(cities_data: List[Dict]) -> Dict:
    """
    Calculate break-even analysis
    """
    # Sample break-even calculation
    fixed_costs = 50000
    variable_cost_per_unit = 25
    revenue_per_unit = 100
    
    break_even_units = fixed_costs / (revenue_per_unit - variable_cost_per_unit)
    
    return {
        'break_even_units': round(break_even_units),
        'fixed_costs': fixed_costs,
        'variable_cost_per_unit': variable_cost_per_unit,
        'revenue_per_unit': revenue_per_unit
    }

def recommend_rdc_locations(cities_data: List[Dict]) -> List[Dict]:
    """
    Recommend optimal RDC locations based on city data
    """
    # Sample RDC recommendation logic
    recommended_rdcs = [
        {'name': 'North RDC', 'coordinates': [28.6139, 77.2090], 'coverage_cities': len(cities_data) // 3},
        {'name': 'South RDC', 'coordinates': [12.9716, 77.5946], 'coverage_cities': len(cities_data) // 3},
        {'name': 'West RDC', 'coordinates': [19.0760, 72.8777], 'coverage_cities': len(cities_data) // 3}
    ]
    
    return recommended_rdcs

def get_aggregate_metrics() -> Dict:
    """
    Get aggregate metrics for summary dashboard
    """
    # Sample aggregate data
    return {
        'total_simulations': 150,
        'avg_cost_savings': 23.5,
        'avg_time_savings': 15.2,
        'active_rdcs': 8,
        'cities_covered': 45
    }

# Store simulation results globally for analytics (in production, use a database)
_stored_simulation_results = []

def store_simulation_results(results: List[Dict]) -> None:
    """Store simulation results for analytics"""
    global _stored_simulation_results
    _stored_simulation_results = results

def clear_simulation_results() -> None:
    """Clear stored simulation results"""
    global _stored_simulation_results
    _stored_simulation_results = []

def get_latest_simulation_data() -> List[Dict]:
    """Get the latest simulation results for insights analysis"""
    global _stored_simulation_results
    
    if not _stored_simulation_results:
        # Return empty list if no simulation has been run yet
        return []
    
    return _stored_simulation_results

def get_grouped_summary() -> List[Dict]:
    """
    Get grouped summary data by city and order type
    """
    global _stored_simulation_results
    
    if not _stored_simulation_results:
        # Return empty if no simulation has been run yet
        return []
    
    # Group by city and order type
    groups = {}
    
    for order in _stored_simulation_results:
        key = f"{order['city']}_{order['order_type']}"
        
        if key not in groups:
            groups[key] = {
                'city': order['city'],
                'order_type': order['order_type'],
                'orders': []
            }
        
        groups[key]['orders'].append(order)
    
    # Calculate aggregated metrics for each group
    summary_data = []
    
    for group_key, group_data in groups.items():
        orders = group_data['orders']
        total_orders = len(orders)
        
        # Calculate averages
        avg_volume = sum(order['volume'] for order in orders) / total_orders
        avg_mw_cost = sum(order['mw_cost'] for order in orders) / total_orders
        avg_rdc_cost = sum(order['rdc_cost'] for order in orders) / total_orders
        avg_savings_percent = sum(order['savings_percent'] for order in orders) / total_orders
        
        # Calculate recommendation percentage
        recommended_count = sum(1 for order in orders if order['recommended'])
        recommendation_percent = (recommended_count / total_orders) * 100
        
        # Determine summary verdict
        summary_verdict = recommendation_percent > 60
        
        summary_data.append({
            'city': group_data['city'],
            'order_type': group_data['order_type'],
            'total_orders': total_orders,
            'avg_volume': round(avg_volume),
            'avg_mw_cost': round(avg_mw_cost),
            'avg_rdc_cost': round(avg_rdc_cost),
            'avg_savings_percent': round(avg_savings_percent, 1),
            'recommendation_percent': round(recommendation_percent, 1),
            'recommended_count': recommended_count,
            'summary_verdict': summary_verdict
        })
    
    return summary_data

def get_order_details(city: str, order_type: str) -> List[Dict]:
    """
    Get detailed order data filtered by city and order type
    """
    global _stored_simulation_results
    
    if not _stored_simulation_results:
        return []
    
    # Filter orders by city and order type
    filtered_orders = [
        order for order in _stored_simulation_results 
        if order['city'].lower() == city.lower() and order['order_type'].lower() == order_type.lower()
    ]
    
    # Add order IDs for tracking
    for i, order in enumerate(filtered_orders):
        order['order_id'] = f"{city[:3].upper()}-{order_type}-{i+1:03d}"
    
    return filtered_orders
