import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import './MarketCard.css';

const CAT_CLASS = {
  Finance:       'cat-finance',
  Crypto:        'cat-crypto',
  Sports:        'cat-sports',
  Tech:          'cat-tech',
  Politics:      'cat-politics',
  Economy:       'cat-economy',
  Entertainment: 'cat-entertainment',
  Science:       'cat-science',
  HorseRacing:   'cat-horseracing',
};

function shortVol(v) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000)     return `$${(v / 1_000).toFixed(1)}k`;
  return `$${v}`;
}

export default function MarketCard({ market }) {
  const { placeBet } = useApp();
  const { user } = require('../context/AuthContext').useAuth
    ? require('../context/AuthContext').useAuth()
    : { user: null };

  const [stake, setStake]     = useState(10);
  const [placing, setPlacing] = useState(false);

  const yp = Math.min(95, Math.max(5, market.yesProb));
  const np = 100 - yp;
  const yesPayout = stake > 0 ? (stake / yp * 100).toFixed(1) : '0.0';
  const noPayout  = stake > 0 ? (stake / np * 100).toFixed(1) : '0.0';
  const catClass  = CAT_CLASS[market.category] || 'cat-finance';
  const balance   = user?.balance ?? 0;

  async function handleBet(side) {
    if (placing) return;
    setPlacing(true);
    await placeBet(market.id, side, Number(stake));
    setPlacing(false);
  }

  return (
    <div className="market-card">
      <div className="card-header">
        <span className={`card-category ${catClass}`}>{market.category}</span>
        <span className="card-vol">{shortVol(market.volume)} vol</span>
      </div>

      <p className="card-title">{market.title}</p>

      <div className="prob-bar-wrap">
        <div className="prob-bar-yes" style={{ width: `${yp}%` }} />
        <div className="prob-bar-no" />
      </div>

      <div className="prob-labels">
        <span className="prob-yes-lbl">YES &nbsp;{yp}%</span>
        <span className="prob-no-lbl">{np}% &nbsp;NO</span>
      </div>

      <div className="stake-row">
        <label className="stake-label" htmlFor={`stake-${market.id}`}>Stake</label>
        <div className="stake-input-wrap">
          <input
            id={`stake-${market.id}`}
            className="stake-input"
            type="number"
            min="1"
            step="1"
            value={stake}
            onChange={e => setStake(Math.max(1, parseInt(e.target.value) || 1))}
          />
          <span className="stake-unit">pts</span>
        </div>
      </div>

      <div className="payout-preview">
        YES pays <span className="payout-yes">{yesPayout} pts</span>
        &nbsp;·&nbsp;
        NO pays <span className="payout-no">{noPayout} pts</span>
      </div>

      <div className="bet-buttons">
        <button
          className="btn-yes"
          onClick={() => handleBet('YES')}
          disabled={placing || stake > balance}
        >
          {placing ? '...' : `Yes ${yp}%`}
        </button>
        <button
          className="btn-no"
          onClick={() => handleBet('NO')}
          disabled={placing || stake > balance}
        >
          {placing ? '...' : `No ${np}%`}
        </button>
      </div>

      {stake > balance && (
        <p className="insufficient">Insufficient points</p>
      )}
    </div>
  );
}
