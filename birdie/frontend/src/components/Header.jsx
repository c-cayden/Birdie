import React from 'react';
import { useAuth } from '../context/AuthContext';
import './Header.css';

export default function Header({ onAddFunds }) {
  const { user, logout } = useAuth();

  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-brand">
          <span className="brand-name">Birdie</span>
          <span className="brand-divider" />
          <span className="brand-tagline">Prediction Markets</span>
        </div>

        <div className="header-right">
          <button className="add-funds-btn" onClick={onAddFunds}>
            + Add Funds
          </button>

          <div className="balance-chip">
            <span className="balance-number">
              {user?.balance?.toLocaleString() ?? '0'}
            </span>
            <span className="balance-unit">pts</span>
          </div>

          <div className="user-menu">
            {user?.avatar ? (
              <img className="user-avatar" src={user.avatar} alt={user.username} referrerPolicy="no-referrer" />
            ) : (
              <div className="user-initials">
                {user?.username?.[0]?.toUpperCase() ?? 'U'}
              </div>
            )}
            <div className="user-dropdown">
              <div className="user-dropdown-name">{user?.username}</div>
              <div className="user-dropdown-email">{user?.email}</div>
              <hr className="user-dropdown-divider" />
              <button className="user-dropdown-logout" onClick={logout}>
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
