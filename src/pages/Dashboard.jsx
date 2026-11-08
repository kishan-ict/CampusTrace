import React, { useState, useMemo } from 'react';
import { 
  Search, 
  MapPin, 
  Plus, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Package,
  ShieldAlert,
  AlertTriangle 
} from 'lucide-react';
import { useItems } from '../contexts/ItemsContext';
import { useAuth } from '../contexts/AuthContext';
import { ItemCard } from '../components/ItemCard';
import { SecurityGuardView } from '../components/SecurityGuardView';
import { DisputeModal } from '../components/DisputeModal';
import { CATEGORIES, LOCATIONS } from '../utils/constants';

export const Dashboard = ({ onOpenReport }) => {
  const { items, claims, disputes } = useItems();
  const { currentUser, guardMode } = useAuth();

  // Feed Tab Filters: 'all' | 'lost' | 'found' | 'claimed' | 'my_reported' | 'my_claims'
  const [activeTab, setActiveTab] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Dispute modal state for "It is my item but someone else claimed it"
  const [disputeItem, setDisputeItem] = useState(null);

  // Counters Bar
  const activeLost = items.filter(i => i.type === 'lost' && i.status !== 'returned').length;
  const foundWaiting = items.filter(i => i.type === 'found' && i.status !== 'returned').length;
  const claimedCount = items.filter(i => {
    const itemClaims = claims.filter(c => c.itemId === i.id || c.itemCustomId === i.id);
    return itemClaims.some(c => c.status === 'approved' || c.status === 'completed') || i.status === 'returned';
  }).length;
  const returnedCount = items.filter(i => i.status === 'returned').length;

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const itemClaims = claims.filter(c => c.itemId === item.id || c.itemCustomId === item.id);
      const isClaimed = itemClaims.some(c => c.status === 'approved' || c.status === 'completed') || item.status === 'returned';

      // 1. Tab filter
      if (activeTab === 'lost' && item.type !== 'lost') return false;
      if (activeTab === 'found' && item.type !== 'found') return false;
      if (activeTab === 'claimed' && !isClaimed) return false;
      if (activeTab === 'my_reported') {
        if (item.reporterId !== currentUser?.uid && item.reporterName !== currentUser?.name) return false;
      }
      if (activeTab === 'my_claims') {
        const hasClaim = itemClaims.some(c => c.claimantId === currentUser?.uid || c.claimantName === currentUser?.name);
        if (!hasClaim) return false;
      }

      // 2. Category filter
      if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;

      // 3. Location filter
      if (selectedLocation !== 'All' && item.location !== selectedLocation) return false;

      // 4. Live Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title?.toLowerCase().includes(q);
        const matchLoc = item.location?.toLowerCase().includes(q);
        const matchDesc = item.description?.toLowerCase().includes(q);
        const matchTags = item.tags?.some(t => String(t).toLowerCase().includes(q));
        if (!matchTitle && !matchLoc && !matchDesc && !matchTags) return false;
      }

      return true;
    });
  }, [items, claims, activeTab, selectedCategory, selectedLocation, searchQuery, currentUser]);

  return (
    <div className="dashboard-container">
      {guardMode && <SecurityGuardView />}

      {/* Hero Counters Bar */}
      <div className="counters-bar">
        <div className="counter-card lost">
          <div className="counter-icon-box lost">
            <AlertCircle size={22} />
          </div>
          <div className="counter-data">
            <span className="counter-val">{activeLost}</span>
            <span className="counter-label">Active Lost</span>
          </div>
        </div>

        <div className="counter-card found">
          <div className="counter-icon-box found">
            <Clock size={22} />
          </div>
          <div className="counter-data">
            <span className="counter-val">{foundWaiting}</span>
            <span className="counter-label">Found Waiting</span>
          </div>
        </div>

        <div className="counter-card claimed-stat" onClick={() => setActiveTab('claimed')} style={{ cursor: 'pointer' }}>
          <div className="counter-icon-box claimed">
            <CheckCircle size={22} />
          </div>
          <div className="counter-data">
            <span className="counter-val">{claimedCount}</span>
            <span className="counter-label">Claimed Items</span>
          </div>
        </div>

        <div className="counter-card returned">
          <div className="counter-icon-box returned">
            <CheckCircle size={22} />
          </div>
          <div className="counter-data">
            <span className="counter-val">{returnedCount}</span>
            <span className="counter-label">Returned Hero</span>
          </div>
        </div>
      </div>

      {/* Controls & Search */}
      <div className="controls-panel">
        <div className="search-bar-wrapper">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search items by name, campus location, or #tags..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="search-clear-btn" onClick={() => setSearchQuery('')}>×</button>
          )}
        </div>

        <div className="filter-dropdown-wrapper">
          <MapPin size={16} className="dropdown-icon" />
          <select 
            className="filter-select"
            value={selectedLocation}
            onChange={e => setSelectedLocation(e.target.value)}
          >
            <option value="All">All Campus Locations</option>
            {LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
          </select>
        </div>

        <button className="primary-btn report-cta-btn" onClick={onOpenReport}>
          <Plus size={18} />
          <span>Report Item</span>
        </button>
      </div>

      {/* Feed Tabs: Including NEW "Claimed Items" section */}
      <div className="tabs-row">
        <button 
          className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Items ({items.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'lost' ? 'active lost' : ''}`}
          onClick={() => setActiveTab('lost')}
        >
          Lost Items
        </button>
        <button 
          className={`tab-btn ${activeTab === 'found' ? 'active found' : ''}`}
          onClick={() => setActiveTab('found')}
        >
          Found Items
        </button>
        <button 
          className={`tab-btn ${activeTab === 'claimed' ? 'active claimed-tab' : ''}`}
          onClick={() => setActiveTab('claimed')}
        >
          🏷️ Claimed Items ({claimedCount})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'my_reported' ? 'active' : ''}`}
          onClick={() => setActiveTab('my_reported')}
        >
          My Reported Items
        </button>
        <button 
          className={`tab-btn ${activeTab === 'my_claims' ? 'active' : ''}`}
          onClick={() => setActiveTab('my_claims')}
        >
          My Claims
        </button>
      </div>

      {/* Category Pills */}
      <div className="category-pills-row">
        <button 
          className={`pill-btn ${selectedCategory === 'All' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('All')}
        >
          All Categories
        </button>
        {CATEGORIES.map(cat => (
          <button 
            key={cat}
            className={`pill-btn ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Notice Banner when in Claimed Items Section */}
      {activeTab === 'claimed' && (
        <div className="claimed-section-banner animate-fade-in mb-3">
          <div className="flex-row items-center gap-2">
            <ShieldAlert size={20} className="text-warning flex-shrink-0" />
            <div>
              <h4 className="font-bold text-sm">Claimed Items Archive & Anti-Fraud Center</h4>
              <p className="text-xs text-muted">
                These items have already been claimed or approved. If you see your belongings here and suspect someone else wrongfully claimed it, click <strong>"It is my item but someone else claimed it"</strong> on the item to alert Campus Safety Moderators!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="empty-feed-card animate-fade-in">
          <Package size={48} className="text-muted mb-3" />
          <h3 className="empty-title">No matching campus items</h3>
          <p className="empty-subtitle">
            Try adjusting your search query, location filter, or category pills.
          </p>
          <button className="secondary-btn mt-3" onClick={onOpenReport}>
            Report This Item
          </button>
        </div>
      ) : (
        <div className="items-grid">
          {filteredItems.map(item => {
            const itemClaims = claims.filter(c => c.itemId === item.id || c.itemCustomId === item.id);
            const isClaimed = itemClaims.some(c => c.status === 'approved' || c.status === 'completed') || item.status === 'returned';

            return (
              <div key={item.id} className="item-card-wrapper">
                <ItemCard item={item} />
                
                {/* Dispute Button on Claimed Items */}
                {isClaimed && (
                  <button 
                    type="button" 
                    className="dispute-trigger-card-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDisputeItem(item);
                    }}
                  >
                    <AlertTriangle size={14} className="text-danger" />
                    <span>It is my item but someone else claimed it</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Dispute Modal */}
      <DisputeModal 
        isOpen={!!disputeItem} 
        onClose={() => setDisputeItem(null)} 
        item={disputeItem} 
      />
    </div>
  );
};
