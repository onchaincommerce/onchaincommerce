"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import ChargeGenerator from './ChargeGenerator';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface DashboardContentProps {
  walletAddress: string | undefined;
  coinbaseApiKey: string;
}

interface Balance {
  currency: string;
  amount: string;
}

interface Charge {
  id: string;
  code: string;
  created_at: string;
  confirmed_at: string | null;
  amount: {
    local?: { amount: string; currency: string };
  };
  payments: {
    block: {
      height: number;
    };
    transaction_id: string;
  }[];
  status: string;
}

const DashboardContent: React.FC<DashboardContentProps> = ({ walletAddress, coinbaseApiKey }) => {
  const [totalBalance, setTotalBalance] = useState<string | null>(null);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [revenueData, setRevenueData] = useState<{ labels: string[], datasets: any[] }>({ labels: [], datasets: [] });
  const [charges, setCharges] = useState<Charge[]>([]);
  const [filteredCharges, setFilteredCharges] = useState<Charge[]>([]);
  const [copied, setCopied] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [revenueTimeframe, setRevenueTimeframe] = useState<string>('day');
  const chargesPerPage = 5;

  useEffect(() => {
    if (walletAddress) {
      fetchBalances(walletAddress);
    }
    fetchCharges();
  }, [walletAddress, coinbaseApiKey]);

  useEffect(() => {
    filterCharges();
  }, [charges, statusFilter, currentPage]);

  useEffect(() => {
    updateRevenueData();
  }, [charges, revenueTimeframe]);

  const fetchBalances = async (address: string) => {
    const apiKey = process.env.NEXT_PUBLIC_BASESCAN_API_KEY;
    const baseUrl = 'https://api.basescan.org/api';

    try {
      // Fetch ETH balance
      const ethResponse = await axios.get(`${baseUrl}`, {
        params: {
          module: 'account',
          action: 'balance',
          address: address,
          tag: 'latest',
          apikey: apiKey
        }
      });

      const ethBalance = parseFloat(ethResponse.data.result) / 1e18; // Convert from wei to ETH

      // Fetch token balances
      const tokenResponse = await axios.get(`${baseUrl}`, {
        params: {
          module: 'account',
          action: 'tokenbalance',
          address: address,
          tag: 'latest',
          apikey: apiKey
        }
      });

      const tokenBalances = tokenResponse.data.result.map((token: any) => ({
        currency: token.tokenSymbol,
        amount: (parseFloat(token.balance) / Math.pow(10, token.tokenDecimal)).toFixed(4)
      }));

      const allBalances = [{ currency: 'ETH', amount: ethBalance.toFixed(4) }, ...tokenBalances];
      setBalances(allBalances);
      const total = allBalances.reduce((acc, curr) => acc + parseFloat(curr.amount), 0).toFixed(2);
      setTotalBalance(total);
    } catch (error) {
      console.error('Error fetching balances:', error);
    }
  };

  const fetchCharges = async () => {
    const apiKey = localStorage.getItem('coinbaseApiKey');
    if (!apiKey) return;

    try {
      const response = await axios.get('https://api.commerce.coinbase.com/charges', {
        headers: {
          'X-CC-Api-Key': apiKey,
          'X-CC-Version': '2018-03-22'
        }
      });

      const chargesData = response.data.data;
      setCharges(chargesData);

      // Filter completed charges for revenue data
      const completedCharges = chargesData.filter((charge: Charge) => charge.status === 'COMPLETED');
      const revenueLabels = completedCharges.map((charge: Charge) => new Date(charge.created_at).toLocaleDateString());
      const revenueAmounts = completedCharges.map((charge: Charge) => parseFloat(charge.amount.local?.amount || '0'));

      const revenueData = {
        labels: revenueLabels,
        datasets: [
          {
            label: 'Revenue',
            data: revenueAmounts,
            borderColor: 'rgb(0, 255, 255)',
            backgroundColor: 'rgba(0, 255, 255, 0.5)',
          },
        ],
      };
      setRevenueData(revenueData);
    } catch (error) {
      console.error('Error fetching charges:', error);
    }
  };

  const filterCharges = () => {
    let filtered = charges;
    if (statusFilter !== 'all') {
      filtered = charges.filter(charge => charge.status === statusFilter);
    }
    setFilteredCharges(filtered.slice(currentPage * chargesPerPage, (currentPage + 1) * chargesPerPage));
  };

  const handlePageChange = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentPage > 0) {
      setCurrentPage(currentPage - 1);
    } else if (direction === 'next' && (currentPage + 1) * chargesPerPage < charges.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleWithdraw = (currency: string) => {
    // Implement withdrawal logic here
    console.log(`Withdrawing ${currency}`);
  };

  const copyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const updateRevenueData = () => {
    const completedCharges = charges.filter((charge: Charge) => charge.status === 'COMPLETED');
    let filteredCharges: Charge[] = [];
    const now = new Date();

    switch (revenueTimeframe) {
      case 'day':
        filteredCharges = completedCharges.filter((charge: Charge) => 
          new Date(charge.created_at).getTime() > now.getTime() - 24 * 60 * 60 * 1000
        );
        break;
      case 'week':
        filteredCharges = completedCharges.filter((charge: Charge) => 
          new Date(charge.created_at).getTime() > now.getTime() - 7 * 24 * 60 * 60 * 1000
        );
        break;
      case 'month':
        filteredCharges = completedCharges.filter((charge: Charge) => 
          new Date(charge.created_at).getTime() > now.getTime() - 30 * 24 * 60 * 60 * 1000
        );
        break;
      case 'ytd':
        filteredCharges = completedCharges.filter((charge: Charge) => 
          new Date(charge.created_at).getFullYear() === now.getFullYear()
        );
        break;
      case 'all':
      default:
        filteredCharges = completedCharges;
    }

    const revenueLabels = filteredCharges.map((charge: Charge) => new Date(charge.created_at).toLocaleDateString());
    const revenueAmounts = filteredCharges.map((charge: Charge) => parseFloat(charge.amount.local?.amount || '0'));

    const newRevenueData = {
      labels: revenueLabels,
      datasets: [
        {
          label: 'Revenue',
          data: revenueAmounts,
          borderColor: 'rgb(0, 255, 255)',
          backgroundColor: 'rgba(0, 255, 255, 0.5)',
        },
      ],
    };
    setRevenueData(newRevenueData);
  };

  return (
    <div className="dashboard-content">
      <div className="grid">
        <div className="box wallet">
          <h2 className="section-title">Wallet</h2>
          <div className="address-container">
            <p>{walletAddress}</p>
            <button onClick={copyAddress} title="Copy address">
              {copied ? '✓' : '📋'}
            </button>
          </div>
          <h3>Balances</h3>
          <p>Total: ${totalBalance || 'Loading...'}</p>
          <ul>
            {balances.map((balance, index) => (
              <li key={index}>
                {balance.currency}: {balance.amount}
                <button onClick={() => handleWithdraw(balance.currency)}>Withdraw</button>
              </li>
            ))}
          </ul>
        </div>
        <div className="box revenue-graph">
          <div className="revenue-header">
            <h2 className="section-title">Revenue</h2>
            <div className="revenue-timeframe">
              <button onClick={() => setRevenueTimeframe('day')} className={revenueTimeframe === 'day' ? 'active' : ''}>Day</button>
              <button onClick={() => setRevenueTimeframe('week')} className={revenueTimeframe === 'week' ? 'active' : ''}>Week</button>
              <button onClick={() => setRevenueTimeframe('month')} className={revenueTimeframe === 'month' ? 'active' : ''}>Month</button>
              <button onClick={() => setRevenueTimeframe('ytd')} className={revenueTimeframe === 'ytd' ? 'active' : ''}>YTD</button>
              <button onClick={() => setRevenueTimeframe('all')} className={revenueTimeframe === 'all' ? 'active' : ''}>All Time</button>
            </div>
          </div>
          <Line data={revenueData} />
        </div>
        <div className="box payment-history">
          <div className="payment-history-header">
            <h2 className="section-title">Payment History</h2>
            <div className="filter-container">
              <label htmlFor="statusFilter">Filter by Status:</label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="NEW">New</option>
                <option value="PENDING">Pending</option>
                <option value="COMPLETED">Completed</option>
                <option value="EXPIRED">Expired</option>
                <option value="CANCELED">Canceled</option>
                <option value="SIGNED">Signed</option>
              </select>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Order Code</th>
                <th>Charge ID</th>
                <th>Amount</th>
                <th>Created At</th>
                <th>Completed At</th>
                <th>View Transaction</th>
              </tr>
            </thead>
            <tbody>
              {filteredCharges.map((charge) => (
                <tr key={charge.id}>
                  <td>{charge.code}</td>
                  <td>{charge.id}</td>
                  <td>{charge.amount?.local ? `${charge.amount.local.amount} ${charge.amount.local.currency}` : 'N/A'}</td>
                  <td>{new Date(charge.created_at).toLocaleDateString()}</td>
                  <td>{charge.confirmed_at ? new Date(charge.confirmed_at).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    {charge.payments.length > 0 && (
                      <a
                        href={`https://basescan.org/tx/${charge.payments[0].transaction_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Transaction
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="pagination">
            <button onClick={() => handlePageChange('prev')} disabled={currentPage === 0}>Previous</button>
            <button onClick={() => handlePageChange('next')} disabled={(currentPage + 1) * chargesPerPage >= charges.length}>Next</button>
          </div>
        </div>
        <div className="box charge-generator">
          <ChargeGenerator coinbaseApiKey={coinbaseApiKey} />
        </div>
      </div>
      <style jsx>{`
        .dashboard-content {
          color: #00ffff;
          padding: 20px;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          grid-template-rows: auto auto;
          gap: 20px;
        }
        .box {
          background-color: rgba(0, 255, 255, 0.1);
          border: 1px solid #00ffff;
          border-radius: 10px;
          padding: 20px;
          box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
        }
        .section-title {
          padding: 10px 20px;
          font-size: 16px;
          font-weight: bold;
          color: #00ffff;
          background-color: rgba(0, 255, 255, 0.1);
          border: 2px solid #00ffff;
          border-radius: 25px;
          cursor: pointer;
          outline: none;
          overflow: hidden;
          transition: all 0.3s ease;
          box-shadow: 0 0 10px #00ffff, inset 0 0 10px #00ffff;
          text-shadow: 0 0 5px #00ffff;
          display: inline-block;
          margin-bottom: 20px;
        }
        .address-container {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
        }
        .address-container p {
          flex-grow: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .address-container button {
          background-color: transparent;
          border: 1px solid #00ffff;
          color: #00ffff;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          transition: all 0.3s ease;
        }
        .address-container button:hover {
          background-color: rgba(0, 255, 255, 0.2);
        }
        ul {
          list-style-type: none;
          padding: 0;
        }
        li {
          margin-bottom: 10px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        button {
          background-color: #00ffff;
          color: black;
          border: none;
          padding: 5px 10px;
          cursor: pointer;
          border-radius: 5px;
        }
        .revenue-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .revenue-timeframe {
          display: flex;
          gap: 10px;
        }
        .revenue-timeframe button {
          background-color: rgba(0, 255, 255, 0.1);
          color: #00ffff;
          border: 1px solid #00ffff;
          padding: 5px 10px;
          cursor: pointer;
          border-radius: 5px;
          transition: all 0.3s ease;
        }
        .revenue-timeframe button:hover,
        .revenue-timeframe button.active {
          background-color: rgba(0, 255, 255, 0.3);
        }
        .payment-history-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .filter-container {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .filter-container select {
          background-color: #333;
          color: #00ffff;
          border: 1px solid #00ffff;
          padding: 5px;
          border-radius: 5px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          border: 1px solid #00ffff;
          padding: 10px;
          text-align: left;
        }
        th {
          background-color: rgba(0, 255, 255, 0.2);
        }
        .pagination {
          display: flex;
          justify-content: space-between;
          margin-top: 20px;
        }
        .pagination button {
          background-color: rgba(0, 255, 255, 0.1);
          color: #00ffff;
          border: 1px solid #00ffff;
          padding: 5px 10px;
          cursor: pointer;
          border-radius: 5px;
          transition: all 0.3s ease;
        }
        .pagination button:hover {
          background-color: rgba(0, 255, 255, 0.2);
        }
        .pagination button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default DashboardContent;