import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const timeframes = [
  { key: 'daily', label: 'Daily', days: 7 },
  { key: 'weekly', label: 'Weekly', days: 28 },
  { key: 'monthly', label: 'Monthly', days: 90 },
];

const RevenueGraph: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] = useState('daily');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiKey = localStorage.getItem('coinbaseCommerceApiKey');
        if (!apiKey) {
          setError('API key not found. Please enter your API key.');
          setLoading(false);
          return;
        }

        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - (timeframes.find(t => t.key === selectedTimeframe)?.days || 7) * 24 * 60 * 60 * 1000);

        const response = await axios.get('https://api.commerce.coinbase.com/charges', {
          headers: {
            'X-CC-Api-Key': apiKey,
            'X-CC-Version': '2018-03-22'
          },
          params: {
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
            limit: 100,
          }
        });

        const charges = response.data.data;
        const revenueData = processCharges(charges, selectedTimeframe);
        setData(revenueData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching revenue data:', err);
        setError('Failed to load revenue data. Please check your API key and try again.');
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedTimeframe]);

  const processCharges = (charges: any[], timeframe: string) => {
    const revenueMap = new Map();

    charges.forEach(charge => {
      const completedPayment = charge.timeline.find((event: any) => event.status === 'COMPLETED');
      if (completedPayment) {
        const date = new Date(completedPayment.time);
        let key;
        switch (timeframe) {
          case 'daily':
            key = date.toISOString().split('T')[0];
            break;
          case 'weekly':
            const weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
            key = weekStart.toISOString().split('T')[0];
            break;
          case 'monthly':
            key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            break;
        }

        const revenue = parseFloat(charge.pricing.local.amount);
        revenueMap.set(key, (revenueMap.get(key) || 0) + revenue);
      }
    });

    return Array.from(revenueMap, ([date, revenue]) => ({ date, revenue })).sort((a, b) => a.date.localeCompare(b.date));
  };

  if (loading) return <div>Loading revenue data...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Revenue Graph</h2>
      <div className="mb-4">
        <label htmlFor="timeframe-select" className="mr-2">Select timeframe:</label>
        <select
          id="timeframe-select"
          value={selectedTimeframe}
          onChange={(e) => setSelectedTimeframe(e.target.value)}
          className="p-2 border rounded"
        >
          {timeframes.map(({ key, label }) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="revenue" fill="#8884d8" name="Revenue (USD)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueGraph;