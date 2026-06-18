import numpy as np

def calculate_gaze_bias(x_coordinates, screen_width=1920, margin_percentage=0.05):
    """
    Analyzes x-coordinates relative to the screen width and margin to determine
    gaze points on the left vs. right stimuli. Filters out central transition noise.
    
    Args:
        x_coordinates (list): List of floats representing gaze X positions.
        screen_width (int): Viewport width in pixels.
        margin_percentage (float): Centered dead-zone width percentage to filter transition noise.
        
    Returns:
        dict: Containing left_count, right_count, final_prediction, and clean_coordinates.
    """
    if not x_coordinates:
        return {
            "left_count": 0,
            "right_count": 0,
            "final_prediction": "Balanced",
            "clean_coordinates": []
        }
        
    # Calculate center and dead-zone boundary lines
    center = screen_width / 2.0
    dead_zone = screen_width * margin_percentage
    
    left_boundary = center - dead_zone
    right_boundary = center + dead_zone
    
    left_count = 0
    right_count = 0
    clean_coords = []
    
    for x in x_coordinates:
        try:
            val = float(x)
        except (ValueError, TypeError):
            continue
            
        # Filter off-screen outlier noise
        if val < 0 or val > screen_width:
            continue
            
        if val < left_boundary:
            left_count += 1
            clean_coords.append(val)
        elif val > right_boundary:
            right_count += 1
            clean_coords.append(val)
            
    if left_count > right_count:
        final_prediction = "Left"
    elif right_count > left_count:
        final_prediction = "Right"
    else:
        final_prediction = "Balanced"
        
    return {
        "left_count": left_count,
        "right_count": right_count,
        "final_prediction": final_prediction,
        "clean_coordinates": clean_coords
    }
