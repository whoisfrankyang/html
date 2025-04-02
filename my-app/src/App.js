import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import axios from 'axios';
import './App.css';

function App() {
  // Investment scenario values
  const initialBalance = 28731.62;
  const investmentAmount = 20000;
  const investmentDate = '2025-03-15'; // Nvidia Buying State
  const startDisplayDate = '2023-06-01'; // Start showing data from June 2023
  const stockName = 'NVIDIA';
  const stockSymbol = 'NVDA';

  const [priceData, setPriceData] = useState([]);
  const [portfolioData, setPortfolioData] = useState([]);
  const [timeframe, setTimeframe] = useState('ALL');
  const [currentValue, setCurrentValue] = useState(`$${initialBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
  const [change, setChange] = useState({ value: '$0.00', percent: '0.00%', isNegative: false });
  const [buyingPower, setBuyingPower] = useState(`$${(initialBalance - investmentAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
  const [currentTimeLabel, setCurrentTimeLabel] = useState('Historical Data');
  const [originalValue, setOriginalValue] = useState(initialBalance);
  const [originalStartPrice, setOriginalStartPrice] = useState(initialBalance);
  const [isHovering, setIsHovering] = useState(false);
  const [sharesOwned, setSharesOwned] = useState(0);
  const [stockCurrentPrice, setStockCurrentPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch NVIDIA stock data
  useEffect(() => {
    setIsLoading(true);

    // Function to fetch data from local CSV
    const fetchStockData = async () => {
      try {
        // Load the 15-minute NVIDIA data from the CSV file
        const response = await fetch('/html/nvidia_intraday_15min_data.csv');
        const csvText = await response.text();

        // Parse CSV data
        const lines = csvText.trim().split('\n');
        const headers = lines[0].split(',');

        // Convert CSV to array of objects
        const data = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',');

          // Get timestamp, high and low prices
          const timestamp = values[0];
          const closePrice = parseFloat(values[4]);

          data.push({
            date: timestamp,
            price: closePrice,
            originalClose: parseFloat(values[4]),
            volume: parseInt(values[5])
          });
        }

        // Sort chronologically
        data.sort((a, b) => new Date(a.date) - new Date(b.date));

        // Filter to only include data from June 2023 onwards
        const startDate = new Date(startDisplayDate); // Use the defined start display date
        const filteredData = data.filter(item => new Date(item.date) >= startDate);

        // Get current stock price from the most recent data point
        const currentPrice = filteredData.length > 0 ? filteredData[filteredData.length - 1].price : 0;
        setStockCurrentPrice(currentPrice);

        // Create portfolio data with:
        // - Constant $29,000 before investment date
        // - After investment: $9,000 cash + (shares * current NVIDIA price)

        // Create full portfolio history
        const portfolioHistory = [];

        // Find the investment date index in our data
        const investDate = new Date(investmentDate);
        let investmentMadeIndex = -1;

        for (let i = 0; i < filteredData.length; i++) {
          const itemDate = new Date(filteredData[i].date);
          if (itemDate >= investDate) {
            investmentMadeIndex = i;
            break;
          }
        }

        // Add all data points to portfolio history
        // Create simulated historical balance fluctuations
        let lastSimulatedValue = initialBalance;

        for (let i = 0; i < filteredData.length; i++) {
          const item = filteredData[i];

          if (i < investmentMadeIndex || investmentMadeIndex === -1) {
            // Before investment date: simulate small fluctuations (up to ±3%)
            // Use the stock price to influence direction but limit the change
            let simulatedChange = 0;

            if (i > 0) {
              // Calculate percent change in stock price to guide our simulation
              const prevStockPrice = filteredData[i - 1].price;
              const stockPriceChange = (item.price - prevStockPrice) / prevStockPrice;

              // Scale down the change to max ±3% for more realistic account fluctuations
              // Use 60% of stock change plus some randomness, but cap at ±3%
              simulatedChange = stockPriceChange * 0.6 + (Math.random() * 0.01 - 0.005);
              simulatedChange = Math.max(Math.min(simulatedChange, 0.03), -0.03);

              // Apply change to last value to create a continuous line
              lastSimulatedValue = lastSimulatedValue * (1 + simulatedChange);

              // Ensure we never deviate more than 5% from initial balance
              const totalDeviation = (lastSimulatedValue - initialBalance) / initialBalance;
              if (Math.abs(totalDeviation) > 0.05) {
                // If outside ±5% range, bring it back toward initial balance
                lastSimulatedValue = initialBalance * (1 + Math.sign(totalDeviation) * 0.049);
              }
            }

            portfolioHistory.push({
              date: item.date,
              value: lastSimulatedValue,
              stockValue: 0,
              stockPrice: item.price,
              cashValue: lastSimulatedValue,
              isSimulated: true
            });
          } else {
            // After investment: calculate what the shares would be worth
            // Using the purchase price at investment time for share calculation
            const purchasePrice = filteredData[investmentMadeIndex].price;
            const sharesBought = parseFloat((investmentAmount / purchasePrice).toFixed(2));
            setSharesOwned(sharesBought);

            // Current value of shares at this point in time
            const sharesValue = sharesBought * item.price;
            const cashRemaining = initialBalance - investmentAmount;
            const totalValue = cashRemaining + sharesValue;

            portfolioHistory.push({
              date: item.date,
              value: totalValue,
              stockValue: sharesValue,
              stockPrice: item.price,
              cashValue: cashRemaining,
              shareCount: sharesBought
            });
          }
        }

        setPriceData(filteredData);
        setPortfolioData(portfolioHistory);

        // Set the appropriate values for UI
        // If investment was made, show current value, otherwise show initial balance
        if (investmentMadeIndex !== -1) {
          const latestPortfolioValue = portfolioHistory[portfolioHistory.length - 1].value;

          // Update the original value reference point (for change calculation)
          setOriginalValue(initialBalance); // Use initial balance as reference point for gains/losses

          // Set current displayed value
          setCurrentValue(`$${latestPortfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);

          // Buying power is initial balance minus investment
          setBuyingPower(`$${(initialBalance - investmentAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);

          // Calculate change from initial balance (not from portfolio start)
          const changeAmount = latestPortfolioValue - initialBalance;
          const changePercent = (changeAmount / initialBalance) * 100;

          setChange({
            value: `$${Math.abs(changeAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            percent: `${Math.abs(changePercent).toFixed(2)}%`,
            isNegative: changeAmount < 0
          });
        } else {
          // No investment made yet - flat line
          setOriginalValue(initialBalance);
          setCurrentValue(`$${initialBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
          setBuyingPower(`$${initialBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
          setChange({
            value: '$0.00',
            percent: '0.00%',
            isNegative: false
          });
        }

        // Set time label
        setCurrentTimeLabel(investmentMadeIndex !== -1 ? 'Historical Data' : 'Balance before investment on ' + formatDate(investmentDate));

        setIsLoading(false);
      } catch (err) {
        console.error("Error loading 15-minute data:", err);
        setError("Failed to load NVIDIA 15-minute data. Please check if the CSV file exists in the public folder.");
        setIsLoading(false);
      }
    };

    fetchStockData();
  }, []);

  useEffect(() => {
    if (portfolioData.length > 0) {
      calculateChangeForTimeframe(portfolioData, timeframe);

      // Update time label based on timeframe
      updateTimeLabel(timeframe);
    }
  }, [timeframe, portfolioData]);

  // Update the time label based on selected timeframe
  const updateTimeLabel = (tf) => {
    const now = new Date();

    switch (tf) {
      case '1D':
        setCurrentTimeLabel('Today');
        break;
      case '1W':
        setCurrentTimeLabel(`Past Week`);
        break;
      case '1M':
        setCurrentTimeLabel(`Past Month`);
        break;
      case '3M':
        setCurrentTimeLabel(`Past 3 Months`);
        break;
      case 'YTD':
        setCurrentTimeLabel(`YTD`);
        break;
      case '1Y':
        setCurrentTimeLabel(`Past Year`);
        break;
      case 'ALL':
        setCurrentTimeLabel(`Historical Data`);
        break;
      default:
        setCurrentTimeLabel('All Time');
    }
  };

  const calculateChangeForTimeframe = (data, selectedTimeframe) => {
    if (!data || data.length === 0) return;

    const filtered = getChartData();
    if (filtered.length === 0) return;

    let firstValue, lastValue;

    // For ALL timeframe, always calculate from initial balance to current
    if (selectedTimeframe === 'ALL') {
      firstValue = initialBalance;
      lastValue = filtered[filtered.length - 1].value;
    } else {
      // For other timeframes, use the first and last values in the filtered range
      firstValue = filtered[0].value;
      lastValue = filtered[filtered.length - 1].value;
    }

    const changeAmount = lastValue - firstValue;
    const changePercent = (changeAmount / firstValue) * 100;

    setChange({
      value: `$${Math.abs(changeAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      percent: `${Math.abs(changePercent).toFixed(2)}%`,
      isNegative: changeAmount < 0
    });

    setOriginalStartPrice(firstValue);
  };

  // Get data for the chart based on selected timeframe
  const getChartData = () => {
    if (!portfolioData.length) return [];

    let filteredData = [];
    const now = new Date();

    // Filter data based on selected timeframe
    switch (timeframe) {
      case '1D':
        // Get data for the last 24 hours
        filteredData = portfolioData.filter(item => {
          const itemDate = new Date(item.date);
          const oneDayAgo = new Date(now);
          oneDayAgo.setDate(oneDayAgo.getDate() - 1);
          return itemDate >= oneDayAgo;
        });
        break;
      case '1W':
        // Get data for the last week
        filteredData = portfolioData.filter(item => {
          const itemDate = new Date(item.date);
          const oneWeekAgo = new Date(now);
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
          return itemDate >= oneWeekAgo;
        });
        break;
      case '1M':
        // Get data for the last month (30 days)
        filteredData = portfolioData.filter(item => {
          const itemDate = new Date(item.date);
          const oneMonthAgo = new Date(now);
          oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
          return itemDate >= oneMonthAgo;
        });
        break;
      case '3M':
        // Get data for the last 3 months (90 days)
        filteredData = portfolioData.filter(item => {
          const itemDate = new Date(item.date);
          const threeMonthsAgo = new Date(now);
          threeMonthsAgo.setDate(threeMonthsAgo.getDate() - 90);
          return itemDate >= threeMonthsAgo;
        });
        break;
      case 'YTD':
        // Get data from the start of the current year
        filteredData = portfolioData.filter(item => {
          const itemDate = new Date(item.date);
          const startOfYear = new Date(now.getFullYear(), 0, 1); // January 1st of current year
          return itemDate >= startOfYear;
        });
        break;
      case '1Y':
        // Get data for the last year (365 days)
        filteredData = portfolioData.filter(item => {
          const itemDate = new Date(item.date);
          const oneYearAgo = new Date(now);
          oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
          return itemDate >= oneYearAgo;
        });
        break;
      case 'ALL':
      default:
        // Use all available data from startDisplayDate
        filteredData = portfolioData.filter(item => {
          const itemDate = new Date(item.date);
          const displayStartDate = new Date(startDisplayDate);
          return itemDate >= displayStartDate;
        });
        break;
    }

    // Ensure we have data
    if (!filteredData.length) {
      filteredData = [...portfolioData];
    }

    // Format data for the chart
    // For intraday data with many points, we may need to reduce the number of points for performance
    if (filteredData.length > 200 && timeframe !== '1D') {
      // Reduce number of points by selecting every Nth point
      const step = Math.ceil(filteredData.length / 200);
      const reducedData = [];

      for (let i = 0; i < filteredData.length; i += step) {
        reducedData.push(filteredData[i]);
      }

      // Always include the last point
      if (reducedData[reducedData.length - 1] !== filteredData[filteredData.length - 1]) {
        reducedData.push(filteredData[filteredData.length - 1]);
      }

      filteredData = reducedData;
    }

    // Format timestamps for display
    return filteredData.map(item => {
      const date = new Date(item.date);
      let time;

      if (timeframe === '1D') {
        // For 1D view, show time as HH:MM
        time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else if (timeframe === '1W' || timeframe === '1M') {
        // For 1W or 1M view, show day and time
        time = `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      } else {
        // For longer timeframes, just show the date
        time = date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
      }

      return {
        ...item,
        time
      };
    });
  };

  // Handle mouse hover on chart
  const handleMouseMove = (e) => {
    if (e && e.activePayload && e.activePayload.length) {
      const data = e.activePayload[0].payload;
      setCurrentValue(`$${data.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);

      // Calculate change from initial balance, not from originalValue
      const changeAmount = data.value - initialBalance;
      const changePercent = (changeAmount / initialBalance) * 100;

      setChange({
        value: `$${Math.abs(changeAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        percent: `${Math.abs(changePercent).toFixed(2)}%`,
        isNegative: changeAmount < 0
      });

      setIsHovering(true);
    }
  };

  // Handle mouse leave event on chart
  const handleMouseLeave = () => {
    setIsHovering(false);
    if (portfolioData.length > 0) {
      const latestData = portfolioData[portfolioData.length - 1];
      setCurrentValue(`$${latestData.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
    }
  };

  // Helper function to format dates
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Add loading and error handling
  if (isLoading) {
    return (
      <div className="app-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ color: 'red' }}>{error}</div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="nav-icons">
        <div className="search-icon">
          <i className="fas fa-search"></i>
        </div>
        <div className="notifications">
          <i className="fas fa-bell"></i>
          <span className="notification-badge">1</span>
        </div>
      </div>

      <div className="header">
        <div className="investing-header">
          Investing
          <i className="fas fa-chevron-down"></i>
        </div>
        <div className="gold-badge">Gold</div>
      </div>

      <div className="portfolio-value">{currentValue}</div>

      <div className={`portfolio-change ${change.isNegative ? 'portfolio-change-negative' : 'portfolio-change-positive'}`}>
        <i className={`fas fa-arrow-${change.isNegative ? 'down' : 'up'}`}></i>
        &nbsp;{change.value} ({change.percent})
      </div>

      <div className="time-label">{currentTimeLabel}</div>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={getChartData()}
            margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <Line
              type="monotone"
              dataKey="value"
              stroke={change.isNegative ? "#ff5000" : "#00c805"}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, fill: change.isNegative ? "#ff5000" : "#00c805" }}
              isAnimationActive={false}
            />
            <XAxis dataKey="time" hide={true} />
            <YAxis domain={['dataMin', 'dataMax']} hide={true} />
            <ReferenceLine y={initialBalance} stroke="#ccc" strokeDasharray="3 3" />
            <Tooltip
              formatter={(value) => [`$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Value']}
              labelFormatter={(label) => label}
              contentStyle={{ backgroundColor: '#f5f5f5', border: 'none' }}
              cursor={{ stroke: '#ccc', strokeWidth: 1 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-timeframe">
        <button
          className={`timeframe-button ${timeframe === '1D' ? 'active' : ''}`}
          onClick={() => setTimeframe('1D')}
        >
          1D
        </button>
        <button
          className={`timeframe-button ${timeframe === '1W' ? 'active' : ''}`}
          onClick={() => setTimeframe('1W')}
        >
          1W
        </button>
        <button
          className={`timeframe-button ${timeframe === '1M' ? 'active' : ''}`}
          onClick={() => setTimeframe('1M')}
        >
          1M
        </button>
        <button
          className={`timeframe-button ${timeframe === '3M' ? 'active' : ''}`}
          onClick={() => setTimeframe('3M')}
        >
          3M
        </button>
        <button
          className={`timeframe-button ${timeframe === 'YTD' ? 'active' : ''}`}
          onClick={() => setTimeframe('YTD')}
        >
          YTD
        </button>
        <button
          className={`timeframe-button ${timeframe === '1Y' ? 'active' : ''}`}
          onClick={() => setTimeframe('1Y')}
        >
          1Y
        </button>
        <button
          className={`timeframe-button ${timeframe === 'ALL' ? 'active' : ''}`}
          onClick={() => setTimeframe('ALL')}
        >
          ALL
        </button>
        <button className="settings-button">
          <i className="fas fa-cog"></i>
        </button>
      </div>

      <div className="buying-power">
        <div>Buying power</div>
        <div className="buying-power-value">{buyingPower} &gt;</div>
      </div>

      <div className="reward-card">
        <button className="close-button">
          <i className="fas fa-times"></i>
        </button>
        <div className="reward-icon">
          <div className="reward-circle"></div>
          <div className="reward-circle"></div>
          <div className="reward-circle"></div>
          <div className="reward-circle"></div>
        </div>
        <div className="reward-content">
          <div className="reward-header">
            <i className="fas fa-star"></i>
            Claim your reward
          </div>
          <div className="reward-text">
            Your Robinhood Trivia Live DOGE reward is ready. Claim it before it expires on Apr 5.
          </div>
          <div className="reward-claim">
            Claim your DOGE
          </div>
          <div className="reward-progress">1/1</div>
        </div>
      </div>

      <div className="bottom-nav">
        <div className="nav-item active">
          <i className="fas fa-chart-line"></i>
        </div>
        <div className="nav-item">
          <i className="far fa-clock"></i>
        </div>
        <div className="nav-item">
          <i className="fas fa-search"></i>
        </div>
        <div className="nav-item">
          <i className="far fa-newspaper"></i>
        </div>
        <div className="nav-item">
          <i className="far fa-user"></i>
        </div>
      </div>
      <div className="home-indicator"></div>
    </div>
  );
}

export default App;
