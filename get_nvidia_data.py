import requests
import csv
from datetime import datetime
import os

def get_nvidia_daily_data():
    # Alpha Vantage API key - you should replace this with your own API key
    api_key = 'JSMI5IJNQLT73NPZ'  # Free tier key
    
    # API endpoint for daily time series data
    url = f'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=NVDA&outputsize=full&apikey={api_key}'
    
    print("Fetching NVIDIA daily historical data from Alpha Vantage...")
    response = requests.get(url)
    
    if response.status_code != 200:
        print(f"Error: API request failed with status code {response.status_code}")
        return
    
    data = response.json()
    
    if 'Error Message' in data:
        print(f"Error: {data['Error Message']}")
        return
    
    if 'Time Series (Daily)' not in data:
        print("Error: No time series data available")
        return
    
    # Process the data
    time_series = data['Time Series (Daily)']
    
    # Convert to list of records
    records = []
    for date, values in time_series.items():
        # Only include dates from 2023-01-01 onward
        if date >= '2023-01-01':
            record = {
                'date': date,
                'open': float(values['1. open']),
                'high': float(values['2. high']),
                'low': float(values['3. low']),
                'close': float(values['4. close']),
                'volume': int(values['5. volume'])
            }
            records.append(record)
    
    # Sort by date
    records.sort(key=lambda x: x['date'])
    
    # Save to CSV
    csv_filename = 'nvidia_daily_data.csv'
    with open(csv_filename, 'w', newline='') as csvfile:
        fieldnames = ['date', 'open', 'high', 'low', 'close', 'volume']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        
        writer.writeheader()
        for record in records:
            writer.writerow(record)
    
    print(f"Daily data saved to {os.path.abspath(csv_filename)}")
    print(f"Total records: {len(records)}")
    
    if records:
        print(f"Date range: {records[0]['date']} to {records[-1]['date']}")
        
        # Show first few rows
        print("\nFirst 5 rows of daily data:")
        for i, record in enumerate(records[:5]):
            print(f"{record['date']}: Close = ${record['close']}, Volume = {record['volume']}")


def get_nvidia_intraday_data():
    # Alpha Vantage API key - you should replace this with your own API key
    api_key = 'JSMI5IJNQLT73NPZ'  # Free tier key
    
    # API endpoint for intraday data (15-minute intervals)
    # Note: Free tier has limitations on API calls (e.g., 25 calls per day)
    url = f'https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=NVDA&interval=15min&outputsize=full&apikey={api_key}'
    
    print("\nFetching NVIDIA 15-minute intraday data from Alpha Vantage...")
    response = requests.get(url)
    
    if response.status_code != 200:
        print(f"Error: API request failed with status code {response.status_code}")
        return
    
    data = response.json()
    
    if 'Error Message' in data:
        print(f"Error: {data['Error Message']}")
        return
    
    if 'Time Series (15min)' not in data:
        print("Error: No intraday time series data available")
        return
    
    # Process the data
    time_series = data['Time Series (15min)']
    
    # Convert to list of records
    records = []
    for timestamp, values in time_series.items():
        record = {
            'timestamp': timestamp,
            'open': float(values['1. open']),
            'high': float(values['2. high']),
            'low': float(values['3. low']),
            'close': float(values['4. close']),
            'volume': int(values['5. volume'])
        }
        records.append(record)
    
    # Sort by timestamp
    records.sort(key=lambda x: x['timestamp'])
    
    # Save to CSV
    csv_filename = 'nvidia_intraday_15min_data.csv'
    with open(csv_filename, 'w', newline='') as csvfile:
        fieldnames = ['timestamp', 'open', 'high', 'low', 'close', 'volume']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        
        writer.writeheader()
        for record in records:
            writer.writerow(record)
    
    print(f"Intraday data saved to {os.path.abspath(csv_filename)}")
    print(f"Total intraday records: {len(records)}")
    
    if records:
        print(f"Timestamp range: {records[0]['timestamp']} to {records[-1]['timestamp']}")
        
        # Show first few rows
        print("\nFirst 5 rows of 15-minute intraday data:")
        for i, record in enumerate(records[:5]):
            print(f"{record['timestamp']}: Close = ${record['close']}, Volume = {record['volume']}")


def get_nvidia_hourly_data():
    # Alpha Vantage API key - you should replace this with your own API key
    api_key = 'JSMI5IJNQLT73NPZ'  # Free tier key
    
    # API endpoint for hourly data
    url = f'https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=NVDA&interval=60min&outputsize=full&apikey={api_key}'
    
    print("\nFetching NVIDIA hourly data from Alpha Vantage...")
    response = requests.get(url)
    
    if response.status_code != 200:
        print(f"Error: API request failed with status code {response.status_code}")
        return
    
    data = response.json()
    
    if 'Error Message' in data:
        print(f"Error: {data['Error Message']}")
        return
    
    if 'Time Series (60min)' not in data:
        print("Error: No hourly time series data available")
        return
    
    # Process the data
    time_series = data['Time Series (60min)']
    
    # Convert to list of records
    records = []
    for timestamp, values in time_series.items():
        record = {
            'timestamp': timestamp,
            'open': float(values['1. open']),
            'high': float(values['2. high']),
            'low': float(values['3. low']),
            'close': float(values['4. close']),
            'volume': int(values['5. volume'])
        }
        records.append(record)
    
    # Sort by timestamp
    records.sort(key=lambda x: x['timestamp'])
    
    # Save to CSV
    csv_filename = 'nvidia_hourly_data.csv'
    with open(csv_filename, 'w', newline='') as csvfile:
        fieldnames = ['timestamp', 'open', 'high', 'low', 'close', 'volume']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        
        writer.writeheader()
        for record in records:
            writer.writerow(record)
    
    print(f"Hourly data saved to {os.path.abspath(csv_filename)}")
    print(f"Total hourly records: {len(records)}")
    
    if records:
        print(f"Timestamp range: {records[0]['timestamp']} to {records[-1]['timestamp']}")
        
        # Show first few rows
        print("\nFirst 5 rows of hourly data:")
        for i, record in enumerate(records[:5]):
            print(f"{record['timestamp']}: Close = ${record['close']}, Volume = {record['volume']}")


if __name__ == "__main__":
    get_nvidia_daily_data()
    get_nvidia_intraday_data()
    get_nvidia_hourly_data()
    
    print("\nNote: Alpha Vantage free tier has limitations (e.g., 25 API calls per day).")
    print("If you encounter errors, you may have reached your daily limit.")
    print("Intraday data typically covers only the last 1-2 months, not the entire historical period.") 