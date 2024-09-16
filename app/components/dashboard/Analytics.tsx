import React, { useState, useEffect } from 'react';
import { Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title } from 'chart.js';
import styles from './Analytics.module.css';
import StyledButton from '../StyledButton';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title);

interface AnalyticsProps {
  apiKey: string;
}

interface Charge {
  id: string;
  timeline: { status: string; time: string }[];
  pricing: {
    local: { amount: string; currency: string };
  };
  payments: { network: string }[];
  created_at: string;
}

type TimeRange = '1d' | '7d' | '30d' | '90d' | '1y' | 'all';

const Analytics: React.FC<AnalyticsProps> = ({ apiKey }) => {
  const [charges, setCharges] = useState<Charge[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllCharges();
  }, [apiKey, timeRange]);

  const fetchAllCharges = async () => {
    setIsLoading(true);
    setError(null);
    let startDate = new Date();
    const endDate = new Date();

    // Set start date based on time range
    switch (timeRange) {
      case '1d':
        startDate.setDate(endDate.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      case 'all':
        startDate = new Date(0); // Beginning of time
        break;
    }

    try {
      const response = await fetch(`https://api.commerce.coinbase.com/charges?start_date=${startDate.toISOString()}&end_date=${endDate.toISOString()}&limit=100`, {
        headers: {
          'X-CC-Api-Key': apiKey,
          'X-CC-Version': '2018-03-22',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch charges');
      }

      const data = await response.json();
      setCharges(data.data);
    } catch (err) {
      setError('Error fetching charges. Please try again.');
      console.error('Error fetching charges:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getCompletedCharges = () => {
    return charges.filter(charge => 
      charge.timeline.some(event => event.status === 'COMPLETED' && new Date(event.time) >= getStartDate())
    );
  };

  const getStartDate = () => {
    const now = new Date();
    switch (timeRange) {
      case '1d':
        return new Date(now.setDate(now.getDate() - 1));
      case '7d':
        return new Date(now.setDate(now.getDate() - 7));
      case '30d':
        return new Date(now.setDate(now.getDate() - 30));
      case '90d':
        return new Date(now.setDate(now.getDate() - 90));
      case '1y':
        return new Date(now.setFullYear(now.getFullYear() - 1));
      case 'all':
      default:
        return new Date(0);
    }
  };

  const calculateTotalRevenue = () => {
    return getCompletedCharges().reduce((total, charge) => {
      return total + parseFloat(charge.pricing.local.amount);
    }, 0);
  };

  const calculateAverageOrderValue = () => {
    const completedCharges = getCompletedCharges();
    if (completedCharges.length === 0) return 0;
    return calculateTotalRevenue() / completedCharges.length;
  };

  const getNetworkDistribution = () => {
    const networks: { [key: string]: number } = {};
    getCompletedCharges().forEach(charge => {
      const network = charge.payments[0]?.network || 'Unknown';
      networks[network] = (networks[network] || 0) + 1;
    });
    return networks;
  };

  const calculateConversionRate = () => {
    const completedCharges = getCompletedCharges().length;
    return charges.length > 0 ? (completedCharges / charges.length) * 100 : 0;
  };

  const getRevenueOverTime = () => {
    const revenueData: { [key: string]: number } = {};
    getCompletedCharges().forEach(charge => {
      const date = new Date(charge.created_at).toISOString().split('T')[0];
      revenueData[date] = (revenueData[date] || 0) + parseFloat(charge.pricing.local.amount);
    });
    return Object.entries(revenueData).sort(([a], [b]) => a.localeCompare(b));
  };

  const networkDistributionData = {
    labels: Object.keys(getNetworkDistribution()),
    datasets: [
      {
        data: Object.values(getNetworkDistribution()),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
      },
    ],
  };

  const revenueOverTimeData = {
    labels: getRevenueOverTime().map(([date]) => date),
    datasets: [
      {
        label: 'Revenue',
        data: getRevenueOverTime().map(([, amount]) => amount),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  return (
    <div className={styles.analyticsContainer}>
      <h2>Analytics</h2>
      <div className={styles.timeRangeToggle}>
        <StyledButton onClick={() => setTimeRange('1d')} className={timeRange === '1d' ? styles.active : ''}>
          1 Day
        </StyledButton>
        <StyledButton onClick={() => setTimeRange('7d')} className={timeRange === '7d' ? styles.active : ''}>
          7 Days
        </StyledButton>
        <StyledButton onClick={() => setTimeRange('30d')} className={timeRange === '30d' ? styles.active : ''}>
          30 Days
        </StyledButton>
        <StyledButton onClick={() => setTimeRange('90d')} className={timeRange === '90d' ? styles.active : ''}>
          90 Days
        </StyledButton>
        <StyledButton onClick={() => setTimeRange('1y')} className={timeRange === '1y' ? styles.active : ''}>
          1 Year
        </StyledButton>
        <StyledButton onClick={() => setTimeRange('all')} className={timeRange === 'all' ? styles.active : ''}>
          All Time
        </StyledButton>
      </div>
      {isLoading ? (
        <p>Loading analytics...</p>
      ) : error ? (
        <p className={styles.error}>{error}</p>
      ) : (
        <>
          <div className={styles.metricsContainer}>
            <div className={styles.metric}>
              <h3>Total Revenue</h3>
              <p>${calculateTotalRevenue().toFixed(2)}</p>
            </div>
            <div className={styles.metric}>
              <h3>Completed Orders</h3>
              <p>{getCompletedCharges().length}</p>
            </div>
            <div className={styles.metric}>
              <h3>Average Order Value</h3>
              <p>${calculateAverageOrderValue().toFixed(2)}</p>
            </div>
            <div className={styles.metric}>
              <h3>Conversion Rate</h3>
              <p>{calculateConversionRate().toFixed(2)}%</p>
            </div>
          </div>
          <div className={styles.chartsContainer}>
            <div className={styles.chart}>
              <h3>Network Distribution</h3>
              <Pie data={networkDistributionData} />
            </div>
            <div className={styles.chart}>
              <h3>Revenue Over Time</h3>
              <Line data={revenueOverTimeData} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;