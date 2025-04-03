import React, { useState, useEffect } from 'react';
import { loadStockData, getNextPrice } from '../utils/stockData';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

function Home() {
  const [totalBalance, setTotalBalance] = useState(28731.62);
  const [displayBalance, setDisplayBalance] = useState(28731.62);
  const [displayChange, setDisplayChange] = useState({ change: 0, percentChange: 0 });
  const initialInvestment = 20000.00;
  const [nvidiaShares, setNvidiaShares] = useState(0);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [initialPrice, setInitialPrice] = useState(0);
  const [dayChange, setDayChange] = useState({ change: 0, percentChange: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1W');
  const [allData, setAllData] = useState([]);

  // Account opening date
  const ACCOUNT_START_DATE = new Date('2023-06-01');
  const CURRENT_DATE = new Date('2025-04-02');

  const calculatePortfolioChange = (data) => {
    if (!data || data.length < 2) {
      return { change: 0, percentChange: 0 };
    }

    // Get the most recent value and the first value in the selected timeframe
    const currentValue = data[data.length - 1].value;
    const startValue = data[0].value;

    // Calculate absolute change
    const change = currentValue - startValue;
    // Calculate percentage change
    const percentChange = ((currentValue - startValue) / startValue) * 100;

    return {
      change: change.toFixed(2), // Always show 2 decimal places
      percentChange: percentChange.toFixed(2) // Always show 2 decimal places
    };
  };

  const filterDataByTimeframe = (timeframe) => {
    if (!allData.length) return [];

    const now = CURRENT_DATE;
    let startDate = new Date(now);

    switch (timeframe) {
      case '1D':
        startDate.setDate(now.getDate() - 1);
        break;
      case '1W':
        startDate.setDate(now.getDate() - 7);
        break;
      case '1M':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case '3M':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'YTD':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case '1Y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'ALL':
        startDate = ACCOUNT_START_DATE;
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    // Filter and sort data by timestamp
    return allData
      .filter(item => {
        const itemDate = new Date(item.timestamp);
        return itemDate >= startDate && itemDate <= now;
      })
      .sort((a, b) => a.timestamp - b.timestamp);
  };

  useEffect(() => {
    const initializeData = async () => {
      const data = await loadStockData();
      if (data.length > 0) {
        const firstPrice = data[0].price;
        setInitialPrice(firstPrice);
        const shares = initialInvestment / firstPrice;
        setNvidiaShares(shares);
        setCurrentPrice(firstPrice);

        // Process all data
        const processedData = data.map(item => {
          const stockValue = item.price * shares;
          const cashBalance = initialInvestment - (firstPrice * shares);
          const totalValue = stockValue + cashBalance;

          return {
            timestamp: new Date(item.timestamp).getTime(),
            price: item.price,
            value: totalValue,
            displayTime: new Date(item.timestamp).toLocaleTimeString(),
            displayDate: new Date(item.timestamp).toLocaleDateString()
          };
        });

        setAllData(processedData);
        const filteredData = filterDataByTimeframe('1W');
        setChartData(filteredData);

        // Calculate initial change
        const initialChange = calculatePortfolioChange(filteredData);
        setDayChange(initialChange);

        setIsLoading(false);
      }
    };

    initializeData();
  }, []);

  const handleTimeframeChange = (timeframe) => {
    setSelectedTimeframe(timeframe);
    const filteredData = filterDataByTimeframe(timeframe);
    setChartData(filteredData);
    const newChange = calculatePortfolioChange(filteredData);
    setDayChange(newChange);
  };

  const cashBalance = totalBalance - initialInvestment;
  const isPositive = parseFloat(dayChange.change) >= 0;

  if (isLoading) {
    return <div className="text-white text-center py-8">Loading...</div>;
  }

  const timeframes = ['1D', '1W', '1M', '3M', 'YTD', '1Y', 'ALL'];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const stockValue = Number((data.price * nvidiaShares).toFixed(2)); // Ensure 2 decimal places
      const portfolioValue = Number((stockValue + cashBalance).toFixed(2)); // Ensure 2 decimal places

      // Update displayed balance when hovering
      setDisplayBalance(portfolioValue);

      // Calculate change from start of timeframe
      const filteredData = filterDataByTimeframe(selectedTimeframe);
      if (filteredData.length > 0) {
        const startValue = Number(filteredData[0].value.toFixed(2));
        const change = Number((portfolioValue - startValue).toFixed(2));
        const percentChange = Number(((portfolioValue - startValue) / startValue * 100).toFixed(2));
        setDisplayChange({
          change: change.toFixed(2),
          percentChange: percentChange.toFixed(2)
        });
      }

      return (
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <p className="text-black font-medium">${portfolioValue.toFixed(2)}</p>
          <p className="text-gray-600 text-sm">{data.displayDate}</p>
          <p className="text-gray-600 text-sm">{data.displayTime}</p>
        </div>
      );
    }

    // Reset to current values when not hovering
    setDisplayBalance(totalBalance);
    setDisplayChange(dayChange);
    return null;
  };

  return (
    <div className="app-container">
      <div className="main-content">
        {/* Top Bar */}
        <div className="flex justify-between items-center px-5 mb-4">
          <div className="flex-1">
            <div className="flex items-start">
              <span className="text-[32px] font-bold text-black">Investing</span>
              <span className="ml-1 text-gray-400">▼</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z" fill="black" />
              </svg>
            </button>
            <button className="relative">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.37 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.64 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16ZM16 17H8V11C8 8.52 9.51 6.5 12 6.5C14.49 6.5 16 8.52 16 11V17Z" fill="black" />
              </svg>
              <span className="absolute -top-1 -right-1 bg-[#ff4f00] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                1
              </span>
            </button>
          </div>
        </div>

        {/* Gold Button */}
        <div className="px-5 flex justify-end mb-4">
          <button className="bg-[#FFD700] text-black px-4 py-1 rounded-full text-sm font-medium">
            Gold
          </button>
        </div>

        {/* Portfolio Value */}
        <div className="px-5">
          <h2 className="text-[42px] font-bold text-black">
            ${Number(displayBalance).toFixed(2)}
          </h2>
          <div className="flex items-center" style={{ color: isPositive ? '#00C805' : '#FF5000' }}>
            <span className="text-lg mr-1">{isPositive ? '↑' : '↓'}</span>
            <span className="text-lg">
              ${Math.abs(Number(displayChange.change)).toFixed(2)} ({Number(displayChange.percentChange).toFixed(2)}%)
            </span>
          </div>
        </div>

        {/* Chart */}
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isPositive ? "#00C805" : "#FF5000"} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={isPositive ? "#00C805" : "#FF5000"} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke={isPositive ? "#00C805" : "#FF5000"}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorValue)"
                isAnimationActive={false}
              />
              <XAxis dataKey="timestamp" hide={true} />
              <YAxis hide={true} domain={['auto', 'auto']} />
              <Tooltip content={<CustomTooltip />} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Time Period Selector */}
        <div className="timeframe-buttons">
          {timeframes.map(period => (
            <button
              key={period}
              className={`px-3 py-1 rounded-md ${selectedTimeframe === period
                ? 'bg-[#00C805] text-white'
                : 'text-gray-600'
                }`}
              onClick={() => handleTimeframeChange(period)}
            >
              {period}
            </button>
          ))}
          <button className="text-gray-600">⚙️</button>
        </div>

        {/* Buying Power */}
        <div className="px-5 py-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-[17px] text-black">Buying power</span>
            <div className="flex items-center">
              <span className="text-[17px] text-black">${Number(cashBalance).toFixed(2)}</span>
              <span className="ml-2 text-gray-400">›</span>
            </div>
          </div>
        </div>

        {/* Options Section */}
        <div className="px-5 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl font-bold">Options</span>
            <span className="text-gray-400">›</span>
          </div>
          <p className="text-gray-500">Your open options positions will appear here.</p>
        </div>

        {/* Cash Section */}
        <div className="px-5 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <span className="text-2xl font-bold">Cash</span>
              <button className="ml-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 19H11V17H13V19ZM15.07 11.25L14.17 12.17C13.45 12.9 13 13.5 13 15H11V14.5C11 13.4 11.45 12.4 12.17 11.67L13.41 10.41C13.78 10.05 14 9.55 14 9C14 7.9 13.1 7 12 7C10.9 7 10 7.9 10 9H8C8 6.79 9.79 5 12 5C14.21 5 16 6.79 16 9C16 9.88 15.64 10.68 15.07 11.25Z" fill="#86888A" />
                </svg>
              </button>
            </div>
            <div className="text-black font-medium">4% APY with Gold</div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-black text-[17px]">Interest accrued this month</span>
              <span className="text-black text-[17px]">$5.14</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-black text-[17px]">Lifetime interest paid</span>
              <span className="text-black text-[17px]">$130.50</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <span className="text-black text-[17px]">Cash earning interest</span>
                <button className="ml-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 19H11V17H13V19ZM15.07 11.25L14.17 12.17C13.45 12.9 13 13.5 13 15H11V14.5C11 13.4 11.45 12.4 12.17 11.67L13.41 10.41C13.78 10.05 14 9.55 14 9C14 7.9 13.1 7 12 7C10.9 7 10 7.9 10 9H8C8 6.79 9.79 5 12 5C14.21 5 16 6.79 16 9C16 9.88 15.64 10.68 15.07 11.25Z" fill="#86888A" />
                  </svg>
                </button>
              </div>
              <span className="text-black text-[17px]">$8,731.62</span>
            </div>
            <button className="text-[#00C805] text-[17px] font-medium">Deposit cash</button>
          </div>
        </div>

        {/* Stocks & ETFs Section */}
        <div className="px-5 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl font-bold">Stocks & ETFs</span>
            <span className="text-gray-400">›</span>
          </div>
          <p className="text-gray-500">Your stocks and ETFs will appear here.</p>
        </div>

        {/* Prediction Markets Section */}
        <div className="px-5 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-2xl font-bold">Prediction markets</span>
            <span className="text-gray-400">›</span>
          </div>

          {/* Basketball Tournaments */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="black" strokeWidth="2" />
                    <path d="M12 6C8.69 6 6 8.69 6 12C6 15.31 8.69 18 12 18C15.31 18 18 15.31 18 12C18 8.69 15.31 6 12 6Z" stroke="black" strokeWidth="2" />
                  </svg>
                </div>
                <span className="text-[17px]">Men's College Basketball Tournament</span>
              </div>
              <span className="text-gray-400">›</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="black" strokeWidth="2" />
                    <path d="M12 6C8.69 6 6 8.69 6 12C6 15.31 8.69 18 12 18C15.31 18 18 15.31 18 12C18 8.69 15.31 6 12 6Z" stroke="black" strokeWidth="2" />
                  </svg>
                </div>
                <span className="text-[17px]">Women's College Basketball Tournament</span>
              </div>
              <span className="text-gray-400">›</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home; 