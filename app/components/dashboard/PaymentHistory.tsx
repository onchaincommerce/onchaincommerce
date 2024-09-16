"use client";

import React, { useState, useEffect } from 'react';
import styles from './PaymentHistory.module.css';
import RefundButton from './RefundButton';
import StyledButton from '../StyledButton';

interface PaymentHistoryProps {
  apiKey: string;
}

interface Charge {
  id: string;
  code: string;
  created_at: string;
  pricing: { local: { amount: string; currency: string } };
  payments: {
    network: string;
    transaction_id: string;
    value: { local: { amount: string; currency: string } };
  }[];
  timeline: { status: string; time: string }[];
  metadata: {
    sender?: string;
  };
  resource: string;
}

const PaymentHistory: React.FC<PaymentHistoryProps> = ({ apiKey }) => {
  const [charges, setCharges] = useState<Charge[]>([]);
  const [filteredCharges, setFilteredCharges] = useState<Charge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const chargesPerPage = 10;

  useEffect(() => {
    fetchCharges();
  }, [apiKey]);

  useEffect(() => {
    filterCharges();
  }, [charges, statusFilter, searchTerm]);

  const fetchCharges = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let allCharges: Charge[] = [];
      let nextUri: string | null = 'https://api.commerce.coinbase.com/charges';

      while (nextUri) {
        const response = await fetch(nextUri, {
          headers: {
            'X-CC-Api-Key': apiKey,
            'X-CC-Version': '2018-03-22',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch charges');
        }

        const data = await response.json();
        allCharges = [...allCharges, ...data.data];
        nextUri = data.pagination.next_uri;
      }

      setCharges(allCharges);
    } catch (err) {
      setError('Error fetching charges. Please try again.');
      console.error('Error fetching charges:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filterCharges = () => {
    let filtered = charges;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(charge => 
        charge.timeline[charge.timeline.length - 1]?.status === statusFilter
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(charge =>
        charge.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        charge.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        charge.payments[0]?.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredCharges(filtered);
    setCurrentPage(1);
  };

  const getCompletedTimestamp = (charge: Charge) => {
    const completedEvent = charge.timeline.find(event => event.status === 'COMPLETED');
    return completedEvent ? new Date(completedEvent.time).toLocaleString() : 'N/A';
  };

  const getTransactionLink = (charge: Charge) => {
    const payment = charge.payments[0];
    if (!payment?.transaction_id) return 'N/A';

    const baseUrl = payment.network === 'ethereum' 
      ? 'https://etherscan.io/tx/' 
      : 'https://basescan.org/tx/';

    return (
      <a
        href={`${baseUrl}${payment.transaction_id}`}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.txLink}
      >
        {payment.transaction_id.slice(0, 10)}...
      </a>
    );
  };

  const indexOfLastCharge = currentPage * chargesPerPage;
  const indexOfFirstCharge = indexOfLastCharge - chargesPerPage;
  const currentCharges = filteredCharges.slice(indexOfFirstCharge, indexOfLastCharge);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className={styles.paymentHistory}>
      <h2>Payment History</h2>
      <div className={styles.filters}>
        <select
          className={styles.statusFilter}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="NEW">New</option>
          <option value="PENDING">Pending</option>
          <option value="COMPLETED">Completed</option>
          <option value="EXPIRED">Expired</option>
        </select>
        <input
          type="text"
          placeholder="Search by ID, Code or Transaction Hash"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </div>
      {isLoading ? (
        <p>Loading payment history...</p>
      ) : error ? (
        <p className={styles.error}>{error}</p>
      ) : filteredCharges.length === 0 ? (
        <p className={styles.noResults}>No matching charges found.</p>
      ) : (
        <>
          <table className={styles.paymentTable}>
            <thead>
              <tr>
                <th>Charge ID</th>
                <th>Order Code</th>
                <th>Date Created</th>
                <th>Date Completed</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Type</th>
                <th>Transaction Hash</th>
                <th>Refund</th>
              </tr>
            </thead>
            <tbody>
              {currentCharges.map((charge) => {
                const latestStatus = charge.timeline[charge.timeline.length - 1]?.status;
                return (
                  <tr key={charge.id}>
                    <td>{charge.id}</td>
                    <td>{charge.code}</td>
                    <td>{new Date(charge.created_at).toLocaleString()}</td>
                    <td>{getCompletedTimestamp(charge)}</td>
                    <td>
                      {charge.pricing.local.amount} {charge.pricing.local.currency}
                    </td>
                    <td>{latestStatus}</td>
                    <td>{charge.resource}</td>
                    <td>{getTransactionLink(charge)}</td>
                    <td className={styles.refundCell}>
                      {latestStatus === 'COMPLETED' && (
                        <RefundButton charge={charge} />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className={styles.pagination}>
            <StyledButton
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={styles.paginationButton}
            >
              Previous
            </StyledButton>
            <span className={styles.pageInfo}>
              Page {currentPage} of {Math.ceil(filteredCharges.length / chargesPerPage)}
            </span>
            <StyledButton
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === Math.ceil(filteredCharges.length / chargesPerPage)}
              className={styles.paginationButton}
            >
              Next
            </StyledButton>
          </div>
        </>
      )}
    </div>
  );
};

export default PaymentHistory;