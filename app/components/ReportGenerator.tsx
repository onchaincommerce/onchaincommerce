import React, { useState } from 'react';
import axios from 'axios';
import Papa from 'papaparse';

const timeframes = ['DAY', 'WEEK', 'MONTH', 'YTD', 'ALL TIME', 'CUSTOM'];

const ReportGenerator: React.FC = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState(timeframes[0]);

  const handleGenerate = async () => {
    try {
      const response = await axios.get('https://api.commerce.coinbase.com/charges/7ECDXH3F');
      const chargeData = response.data.data;

      const allPayments = [...(chargeData.payments || []), ...(chargeData.timeline || [])];

      const csvData = [
        ['Charge Report', selectedTimeframe],
        [],
        ['ID', chargeData.id],
        ['Code', chargeData.code],
        ['Name', chargeData.name],
        ['Description', chargeData.description],
        ['Created At', chargeData.created_at],
        ['Confirmed At', chargeData.confirmed_at],
        ['Expires At', chargeData.expires_at],
        [],
        ['Pricing'],
        ['Local Amount', `${chargeData.pricing.local.amount} ${chargeData.pricing.local.currency}`],
        ['Settlement Amount', `${chargeData.pricing.settlement.amount} ${chargeData.pricing.settlement.currency}`],
        [],
        ['Payment History'],
        ['Amount', 'Currency', 'Network', 'Status', 'Transaction Hash', 'Detected At', 'Payer Address']
      ];

      allPayments
        .filter(item => item.status === 'COMPLETED' || item.status === 'CONFIRMED')
        .forEach(item => {
          if (item.value) { // It's a payment
            csvData.push([
              item.value.crypto.amount,
              item.value.crypto.currency,
              item.network,
              item.status,
              item.transaction_id,
              item.detected_at,
              item.payer_addresses[0]
            ]);
          } else { // It's a timeline event
            csvData.push(['-', '-', '-', item.status, '-', item.time, '-']);
          }
        });

      csvData.push(
        [],
        ['Timeline'],
        ['Status', 'Time']
      );

      chargeData.timeline.forEach(event => {
        csvData.push([event.status, event.time]);
      });

      const csv = Papa.unparse(csvData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report_${selectedTimeframe.toLowerCase()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error generating report. Please try again.');
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <select
        value={selectedTimeframe}
        onChange={(e) => setSelectedTimeframe(e.target.value)}
        className="mr-2 p-2 border rounded"
      >
        {timeframes.map((tf) => (
          <option key={tf} value={tf}>
            {tf}
          </option>
        ))}
      </select>
      <button
        onClick={handleGenerate}
        className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
      >
        Generate Report
      </button>
    </div>
  );
};

export default ReportGenerator;