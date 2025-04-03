import pandas as pd

# Read the original NVIDIA data
df = pd.read_csv('public/nvidia-intraday_15min_data.csv')

# Keep only timestamp and closing price, ensure they are properly formatted
clean_data = df[['timestamp', 'close']].copy()
clean_data.columns = ['timestamp', 'price']  # Rename 'close' to 'price'

# Sort by timestamp
clean_data = clean_data.sort_values('timestamp')

# Save the clean data
clean_data.to_csv('public/nvidia_clean_data.csv', index=False)
print(f"Processed {len(clean_data)} data points from NVIDIA data") 