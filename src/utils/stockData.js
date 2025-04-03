import Papa from 'papaparse';

let stockData = null;
let currentIndex = 0;

export const loadStockData = async () => {
  try {
    const response = await fetch('/nvidia_clean_data.csv');
    const csvText = await response.text();

    const results = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
    });

    stockData = results.data
      .map(row => ({
        timestamp: new Date(row.timestamp).getTime(),
        price: parseFloat(row.price)
      }))
      .filter(item => !isNaN(item.timestamp) && !isNaN(item.price))
      .sort((a, b) => a.timestamp - b.timestamp);

    return stockData;
  } catch (error) {
    console.error('Error loading stock data:', error);
    return [];
  }
};

export const getCurrentPrice = () => {
  if (!stockData || stockData.length === 0) return null;
  return stockData[currentIndex].price;
};

export const getNextPrice = () => {
  if (!stockData || stockData.length === 0) return null;
  currentIndex = (currentIndex + 1) % stockData.length;
  return stockData[currentIndex];
};

export const calculateDayChange = () => {
  if (!stockData || stockData.length === 0) return { change: 0, percentChange: 0 };

  const currentPrice = stockData[currentIndex].price;
  const openPrice = stockData[0].price;
  const change = currentPrice - openPrice;
  const percentChange = (change / openPrice) * 100;

  return {
    change: change.toFixed(2),
    percentChange: percentChange.toFixed(2)
  };
}; 