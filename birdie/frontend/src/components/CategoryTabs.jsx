import React from 'react';
import { useApp } from '../context/AppContext';
import './CategoryTabs.css';

const CATEGORIES = [
  { key: 'All',           label: 'All' },
  { key: 'HorseRacing',  label: 'Horse Racing' },
  { key: 'Sports',        label: 'Sports' },
  { key: 'Finance',       label: 'Finance' },
  { key: 'Crypto',        label: 'Crypto' },
  { key: 'Politics',      label: 'Politics' },
  { key: 'Economy',       label: 'Economy' },
  { key: 'Tech',          label: 'Tech' },
  { key: 'Entertainment', label: 'Entertainment' },
  { key: 'Science',       label: 'Science' },
];

export default function CategoryTabs() {
  const { activeTab, setActiveTab } = useApp();

  return (
    <div className="tabs-container">
      <div className="tabs-row">
        {CATEGORIES.map(cat => (
          <button
            key={cat.key}
            className={`tab ${activeTab === cat.key ? 'tab--active' : ''}`}
            onClick={() => setActiveTab(cat.key)}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
}
