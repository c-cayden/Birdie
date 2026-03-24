import React from 'react';
import { useApp } from '../context/AppContext';
import './PositionsList.css';

export default function PositionsList() {
  const { bets, markets } = useApp();

  if (!bets.length) {
    return (
      <div className="positions-empty">
        No open positions yet. Place a bet to get started.
      </div>
    );
  }

  return (
    <div className="positions-list">
      {bets.map(bet => {
        const market = markets.find(m => m.id === bet.marketId);
        const curProb = market
          ? (bet.side === 'YES' ? market.yesProb / 100 : (100 - market.yesProb) / 100)
          : bet.entryProb;
        const curValue = parseFloat((bet.payout * curProb).toFixed(1));
        const pnl = parseFloat((curValue - bet.amount).toFixed(1));

        return (
          <div key={bet.id} className="position-row">
            <div className="position-title">{bet.market?.title || bet.marketTitle}</div>
            <div className="position-meta">
              <span className={`position-side side-${bet.side.toLowerCase()}`}>{bet.side}</span>
              <span className="position-stat">{bet.amount} pts staked</span>
              <span className="position-stat">Max payout: {bet.payout.toFixed(1)} pts</span>
              <span className={`position-pnl ${pnl >= 0 ? 'pnl-up' : 'pnl-dn'}`}>
                {pnl >= 0 ? '+' : ''}{pnl} pts
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
