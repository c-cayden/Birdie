import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import './FundsModal.css';

const PACKAGES = [
  { id: 'starter',    points: 500,  usdPrice: '4.99',  rate: '100 pts / $1',  badge: null },
  { id: 'popular',    points: 1200, usdPrice: '9.99',  rate: '120 pts / $1',  badge: 'Popular' },
  { id: 'pro',        points: 2750, usdPrice: '19.99', rate: '137 pts / $1',  badge: null },
  { id: 'best-value', points: 6000, usdPrice: '39.99', rate: '150 pts / $1',  badge: 'Best Value' },
];

export default function FundsModal({ open, onClose }) {
  const { purchaseFunds } = useApp();
  const { user } = useAuth();

  const [view, setView]         = useState('packages');
  const [selected, setSelected] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult]     = useState(null);
  const [cardName, setCardName] = useState('');
  const [cardNum, setCardNum]   = useState('');
  const [expiry, setExpiry]     = useState('');
  const [cvv, setCvv]           = useState('');
  const [error, setError]       = useState('');

  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setView('packages'); setSelected(null);
        setCardName(''); setCardNum(''); setExpiry(''); setCvv('');
        setError(''); setResult(null); setProcessing(false);
      }, 300);
    }
  }, [open]);

  function fmtCard(v) { return v.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim(); }
  function fmtExp(v)  { const d=v.replace(/\D/g,'').slice(0,4); return d.length>=3?d.slice(0,2)+' / '+d.slice(2):d; }

  function validate() {
    if (!cardName.trim())                          return 'Cardholder name required';
    if (cardNum.replace(/\s/g,'').length < 13)     return 'Enter a valid card number';
    if (expiry.replace(/[\s/]/g,'').length < 4)    return 'Enter a valid expiry date';
    if (cvv.length < 3)                            return 'Enter a valid CVV';
    return null;
  }

  async function handlePurchase() {
    const err = validate();
    if (err) { setError(err); return; }
    setError(''); setProcessing(true);
    try {
      const data = await purchaseFunds(selected.id, {
        cardName, cardNumber: cardNum.replace(/\s/g,''), expiry, cvv,
      });
      setResult(data);
      setView('success');
    } catch { /* toasted by context */ }
    finally { setProcessing(false); }
  }

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box">
        <button className="modal-close" onClick={onClose}>✕</button>

        {view === 'packages' && (
          <>
            <h2 className="modal-title">Add Funds</h2>
            <p className="modal-sub">
              Select a package. Current balance: <strong>{user?.balance?.toLocaleString()} pts</strong>
            </p>
            <div className="pkg-grid">
              {PACKAGES.map(pkg => (
                <button
                  key={pkg.id}
                  className={`pkg-card ${selected?.id === pkg.id ? 'pkg-card--selected' : ''}`}
                  onClick={() => setSelected(pkg)}
                >
                  {pkg.badge && <span className="pkg-badge">{pkg.badge}</span>}
                  <div className="pkg-pts">{pkg.points.toLocaleString()} <span className="pkg-pts-unit">pts</span></div>
                  <div className="pkg-usd">${pkg.usdPrice}</div>
                  <div className="pkg-rate">{pkg.rate}</div>
                </button>
              ))}
            </div>
            <button className="modal-primary-btn" disabled={!selected} onClick={() => setView('payment')}>
              Continue to Payment
            </button>
          </>
        )}

        {view === 'payment' && (
          <>
            <button className="modal-back-btn" onClick={() => setView('packages')}>← Back</button>
            <h2 className="modal-title">Payment</h2>
            <div className="order-summary">
              <span>{selected?.points.toLocaleString()} pts — Birdie Balance</span>
              <span className="order-price">${selected?.usdPrice}</span>
            </div>
            <div className="form-field">
              <label className="form-label">Cardholder Name</label>
              <input className="form-input" type="text" placeholder="Jane Smith" value={cardName} onChange={e => setCardName(e.target.value)} autoComplete="cc-name" />
            </div>
            <div className="form-field">
              <label className="form-label">Card Number</label>
              <input className="form-input" type="text" placeholder="1234 5678 9012 3456" value={cardNum} onChange={e => setCardNum(fmtCard(e.target.value))} maxLength={19} inputMode="numeric" />
            </div>
            <div className="form-row">
              <div className="form-field">
                <label className="form-label">Expiry</label>
                <input className="form-input" type="text" placeholder="MM / YY" value={expiry} onChange={e => setExpiry(fmtExp(e.target.value))} maxLength={7} inputMode="numeric" />
              </div>
              <div className="form-field">
                <label className="form-label">CVV</label>
                <input className="form-input" type="text" placeholder="•••" value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g,'').slice(0,4))} maxLength={4} inputMode="numeric" />
              </div>
            </div>
            {error && <p className="form-error">{error}</p>}
            <button className="modal-primary-btn" onClick={handlePurchase} disabled={processing}>
              {processing ? 'Processing...' : 'Complete Purchase'}
            </button>
            <p className="form-disclaimer">Demo only — no real charge will be made.</p>
          </>
        )}

        {view === 'success' && (
          <div className="success-view">
            <div className="success-check">✓</div>
            <h2 className="success-title">Points Added</h2>
            <div className="success-pts">+{result?.pointsAdded?.toLocaleString()} pts</div>
            <p className="success-sub">New balance: <strong>{result?.newBalance?.toLocaleString()} pts</strong></p>
            <button className="modal-primary-btn" onClick={onClose}>Continue</button>
          </div>
        )}
      </div>
    </div>
  );
}
