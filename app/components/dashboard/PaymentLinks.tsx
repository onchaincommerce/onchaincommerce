import React, { useState, useEffect } from 'react';
import styles from './PaymentLinks.module.css';
import StyledButton from '../StyledButton';
import QRCode from 'qrcode';
import axios from 'axios';

interface PaymentLinksProps {
  apiKey: string;
}

type PaymentType = 'invoice' | 'checkout' | 'donation';

const PaymentLinks: React.FC<PaymentLinksProps> = ({ apiKey }) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [paymentType, setPaymentType] = useState<PaymentType>('invoice');
  const [paymentLink, setPaymentLink] = useState<string | null>(null);
  const [qrCode, setQRCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [smsSent, setSmsSent] = useState<boolean>(false);
  const [copyButtonText, setCopyButtonText] = useState('Copy');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPaymentLink(null);
    setQRCode(null);

    try {
      let endpoint = '';
      let body = {};

      if (paymentType === 'invoice') {
        endpoint = 'https://api.commerce.coinbase.com/charges';
        body = {
          name: name,
          description: `Payment for ${name}`,
          pricing_type: 'fixed_price',
          local_price: {
            amount: amount,
            currency: currency,
          },
        };
      } else {
        endpoint = 'https://api.commerce.coinbase.com/checkouts';
        body = {
          name: name,
          description: paymentType === 'donation' ? `Donation for ${name}` : `Payment for ${name}`,
          pricing_type: paymentType === 'donation' ? 'no_price' : 'fixed_price',
          local_price: paymentType === 'donation' ? undefined : {
            amount: amount,
            currency: currency,
          },
          requested_info: ['name', 'email'],
        };
      }

      const response = await axios.post(endpoint, body, {
        headers: {
          'X-CC-Api-Key': apiKey,
          'X-CC-Version': '2018-03-22',
        },
      });

      const hostedUrl = paymentType === 'invoice' 
        ? response.data.data.hosted_url 
        : `https://commerce.coinbase.com/checkout/${response.data.data.id}`;
      
      setPaymentLink(hostedUrl);

      const qrCodeDataUrl = await QRCode.toDataURL(hostedUrl);
      setQRCode(qrCodeDataUrl);
    } catch (err) {
      setError(`Error creating ${paymentType}. Please try again.`);
      console.error(`Error creating ${paymentType}:`, err);
    }
  };

  const handleCopyLink = () => {
    if (paymentLink) {
      navigator.clipboard.writeText(paymentLink);
      setCopyButtonText('Copied!');
      setTimeout(() => setCopyButtonText('Copy'), 2000);
    }
  };

  const sendSMS = async () => {
    if (paymentLink && phoneNumber) {
      try {
        const response = await axios.post('/api/send-sms', {
          to: phoneNumber,
          body: `Here's your payment link: ${paymentLink}`,
          paymentLink: paymentLink // Add this line to explicitly pass the paymentLink
        });
        if (response.data.success) {
          setSmsSent(true);
          setTimeout(() => setSmsSent(false), 2000);
        }
      } catch (error) {
        console.error('Error sending SMS:', error);
        setError('Failed to send SMS. Please try again.');
      }
    }
  };

  return (
    <div className={styles.paymentLinksContainer}>
      <h2>Create Payment Link</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <div className={styles.inputField}>
            <label htmlFor="paymentType" className={styles.label}>Payment Type:</label>
            <select
              id="paymentType"
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value as PaymentType)}
              className={styles.select}
            >
              <option value="invoice">Invoice</option>
              <option value="checkout">Checkout</option>
              <option value="donation">Donation</option>
            </select>
          </div>
          <div className={styles.inputField}>
            <label htmlFor="name" className={styles.label}>Name:</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={styles.input}
            />
          </div>
          {paymentType !== 'donation' && (
            <div className={styles.inputField}>
              <label htmlFor="amount" className={styles.label}>Amount:</label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required={paymentType !== 'donation'}
                step="0.01"
                min="0"
                className={styles.input}
              />
            </div>
          )}
          <div className={styles.inputField}>
            <label htmlFor="currency" className={styles.label}>Currency:</label>
            <select
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className={styles.select}
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              {/* Add more currency options as needed */}
            </select>
          </div>
        </div>
        <StyledButton type="submit">Create Payment Link</StyledButton>
      </form>
      {error && <p className={styles.error}>{error}</p>}
      {paymentLink && (
        <div className={styles.paymentLinkResult}>
          <h3>Payment Link Created:</h3>
          <div className={styles.generatedLinkContainer}>
            <input
              type="text"
              value={paymentLink}
              readOnly
              className={styles.generatedLink}
            />
            <StyledButton onClick={handleCopyLink} className={styles.copyButton}>
              {copyButtonText}
            </StyledButton>
          </div>
          <div className={styles.qrCodeAndSmsContainer}>
            {qrCode && (
              <div className={styles.qrCodeContainer}>
                <img src={qrCode} alt="Payment Link QR Code" className={styles.qrCode} />
              </div>
            )}
            <div className={styles.smsContainer}>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter phone number"
                className={styles.input}
              />
              <StyledButton onClick={sendSMS} className={styles.smsButton}>
                {smsSent ? 'SMS Sent!' : 'Send SMS'}
              </StyledButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentLinks;