import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import CategoryTabs from '../components/CategoryTabs';
import MarketCard from '../components/MarketCard';
import PositionsList from '../components/PositionsList';
import './Home.css';

const SKELETON_COUNT = 6;

export default function Home() {
  const { markets, activeTab, setActiveTab, loading, generating, generateMarkets, apiKey, setApiKey } = useApp();
  const [topic, setTopic] = useState('');
  const [showApiInput, setShowApiInput] = useState(false);

  async function handleGenerate(e) {
    e.preventDefault();
    if (!topic.trim()) return;
    await generateMarkets(topic.trim());
    setTopic('');
  }

  return (
    <div className="home">
      <div className="home-inner">

        {/* Generate bar */}
        <section className="generate-section">
          <form className="generate-form" onSubmit={handleGenerate}>
            <div className="generate-label">AI Market Generator</div>
            <div className="generate-row">
              <input
                className="generate-input"
                type="text"
                placeholder="Try: Fed rate decision, March Madness, Bitcoin, AI regulation..."
                value={topic}
                onChange={e => setTopic(e.target.value)}
                disabled={generating}
              />
              <button
                className="generate-btn"
                type="submit"
                disabled={generating || !topic.trim() || !apiKey}
              >
                {generating ? 'Generating...' : 'Generate'}
              </button>
            </div>

            {/* API key row */}
            <div className="generate-footer">
              {!apiKey ? (
                showApiInput ? (
                  <div className="api-key-inline">
                    <input
                      className="api-key-input"
                      type="password"
                      placeholder="sk-ant-api03-..."
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          const val = e.target.value.trim();
                          if (val.startsWith('sk-ant-')) {
                            setApiKey(val);
                            setShowApiInput(false);
                          }
                        }
                      }}
                    />
                    <span className="api-key-hint">Press Enter to save</span>
                  </div>
                ) : (
                  <button type="button" className="api-key-prompt" onClick={() => setShowApiInput(true)}>
                    + Add Anthropic API key to enable generation
                  </button>
                )
              ) : (
                <span className="api-key-set">
                  <span className="api-dot" />
                  Anthropic API connected ·{' '}
                  <button type="button" className="api-key-remove" onClick={() => setApiKey('')}>
                    Remove
                  </button>
                </span>
              )}
            </div>
          </form>
        </section>

        {/* Tabs */}
        <CategoryTabs />

        {/* Markets */}
        <section className="markets-section">
          {loading ? (
            <div className="markets-grid">
              {Array.from({ length: SKELETON_COUNT }, (_, i) => (
                <div className="skeleton-card" key={i}>
                  <div className="skeleton-line short" />
                  <div className="skeleton-line long" />
                  <div className="skeleton-bar" />
                  <div className="skeleton-line medium" />
                  <div className="skeleton-buttons" />
                </div>
              ))}
            </div>
          ) : markets.length ? (
            <div className="markets-grid">
              {markets.map((market, idx) => (
                <MarketCard key={market.id} market={market} index={idx} />
              ))}
            </div>
          ) : (
            <div className="markets-empty">
              <p className="markets-empty-title">
                No {activeTab === 'All' ? '' : activeTab.toLowerCase() + ' '}markets yet
              </p>
              <p className="markets-empty-sub">
                {activeTab === 'All'
                  ? 'Use the generator above to create markets.'
                  : 'Try a different category or generate new markets.'}
              </p>
              {activeTab !== 'All' && (
                <button className="markets-empty-link" onClick={() => setActiveTab('All')}>
                  View all markets
                </button>
              )}
            </div>
          )}
        </section>

        <hr className="section-divider" />

        {/* Positions */}
        <section className="positions-section">
          <h2 className="section-heading">My Positions</h2>
          <PositionsList />
        </section>

      </div>
    </div>
  );
}
