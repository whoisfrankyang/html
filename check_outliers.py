def read_csv(filename):
    with open(filename, 'r') as f:
        lines = f.readlines()
    
    # Skip header
    data = []
    for line in lines[1:]:
        try:
            parts = line.strip().split(',')
            timestamp = parts[0]
            price = float(parts[1])
            data.append((timestamp, price))
        except (ValueError, IndexError):
            print(f"Skipping invalid line: {line.strip()}")
            continue
    
    return data

def find_outliers(data):
    if not data:
        print("No valid data found!")
        return
        
    prices = [price for _, price in data]
    
    # Calculate basic statistics
    avg_price = sum(prices) / len(prices)
    sorted_prices = sorted(prices)
    median = sorted_prices[len(sorted_prices) // 2]
    
    # Calculate price changes between consecutive points
    changes = []
    for i in range(1, len(data)):
        prev_price = data[i-1][1]
        curr_price = data[i][1]
        pct_change = ((curr_price - prev_price) / prev_price) * 100
        changes.append((data[i][0], pct_change, prev_price, curr_price))
    
    # Find significant changes (more than 5% between consecutive points)
    significant_changes = [
        (timestamp, change, prev, curr) 
        for timestamp, change, prev, curr in changes 
        if abs(change) > 5
    ]
    
    print(f"\nData Summary:")
    print(f"Total points: {len(data)}")
    print(f"Average price: ${avg_price:.2f}")
    print(f"Median price: ${median:.2f}")
    print(f"Price range: ${min(prices):.2f} to ${max(prices):.2f}")
    
    if significant_changes:
        print(f"\nFound {len(significant_changes)} significant price changes (>5%):")
        for timestamp, change, prev, curr in significant_changes:
            print(f"At {timestamp}: {change:+.2f}% (${prev:.2f} -> ${curr:.2f})")

# Read and analyze the data
print("Reading data from nvidia_clean_data.csv...")
data = read_csv('public/nvidia_clean_data.csv')
find_outliers(data) 