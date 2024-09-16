import React, { useState, useEffect } from 'react';
import axios from 'axios';

const statusOptions = ['All', 'NEW', 'PENDING', 'COMPLETED', 'EXPIRED', 'SIGNED'];

const PaymentHistory: React.FC = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const apiKey = localStorage.getItem('coinbaseCommerceApiKey');
        if (!apiKey) {
          setError('API key not found. Please enter your API key.');
          setLoading(false);
          return;
        }

        let allPayments: any[] = [];
        let nextPage = null;

        do {
          const response = await axios.get('https://api.commerce.coinbase.com/charges', {
            headers: {
              'X-CC-Api-Key': apiKey,
              'X-CC-Version': '2018-03-22'
            },
            params: {
              limit: 100,
              ...(nextPage ? { 'starting_after': nextPage } : {})
            }
          });

          allPayments = [...allPayments, ...response.data.data];
          nextPage = response.data.pagination.cursor;
        } while (nextPage);

        setPayments(allPayments);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching payments:', err);
        setError('Failed to load payment history. Please check your API key and try again.');
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  useEffect(() => {
    setFilteredPayments(
      statusFilter === 'All'
        ? payments
        : payments.filter(payment => payment.timeline.some(event => event.status === statusFilter))
    );
  }, [statusFilter, payments]);

  const getBlockExplorerUrl = (payment: any) => {
    const network = payment.payments[0]?.network;
    const txId = payment.payments[0]?.transaction_id;
    if (!network || !txId) return '#';

    switch (network) {
      case 'ethereum':
        return `https://etherscan.io/tx/${txId}`;
      case 'bitcoin':
        return `https://blockstream.info/tx/${txId}`;
      case 'base':
        return `https://basescan.org/tx/${txId}`;
      case 'polygon':
        return `https://polygonscan.com/tx/${txId}`;
      default:
        return '#';
    }
  };

  if (loading) return <div>Loading payment history...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Payment History</h2>
      <div className="mb-4">
        <label htmlFor="status-filter" className="mr-2">Filter by status:</label>
        <select
          id="status-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="p-2 border rounded"
        >
          {statusOptions.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">Order Code</th>
            <th className="p-2 text-left">Charge ID</th>
            <th className="p-2 text-left">Amount</th>
            <th className="p-2 text-left">Created At</th>
            <th className="p-2 text-left">Payment At</th>
            <th className="p-2 text-left">Status</th>
            <th className="p-2 text-left">Transaction</th>
          </tr>
        </thead>
        <tbody>
          {filteredPayments.map((payment, index) => {
            const latestStatus = payment.timeline[payment.timeline.length - 1].status;
            const paymentEvent = payment.timeline.find((event: any) => event.status === 'COMPLETED');
            return (
              <tr key={index} className="border-t">
                <td className="p-2">{payment.code}</td>
                <td className="p-2">{payment.id}</td>
                <td className="p-2">{`${payment.pricing.local.amount} ${payment.pricing.local.currency}`}</td>
                <td className="p-2">{new Date(payment.created_at).toLocaleString()}</td>
                <td className="p-2">{paymentEvent ? new Date(paymentEvent.time).toLocaleString() : '-'}</td>
                <td className="p-2">{latestStatus}</td>
                <td className="p-2">
                  {payment.payments.length > 0 ? (
                    <a href={getBlockExplorerUrl(payment)} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                      View Transaction
                    </a>
                  ) : '-'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PaymentHistory;