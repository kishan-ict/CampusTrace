import React from 'react';
import { 
  MapPin, 
  Calendar, 
  CheckCircle, 
  Clock, 
  ShieldCheck, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ItemCard = ({ item }) => {
  const navigate = useNavigate();

  const isLost = item.type === 'lost';
  const isReturned = item.status === 'returned';
  const isPending = item.status === 'verification_pending';

  return (
    <div 
      className={`item-card ${isLost ? 'lost-card' : 'found-card'} ${isReturned ? 'returned-card' : ''}`}
      onClick={() => navigate(`/item/${item.id}`)}
    >
      <div className="card-media">
        <img src={item.imageUrl} alt={item.title} className="card-img" />
        <div className="card-badge-overlay">
          <span className={`type-badge ${isLost ? 'lost' : 'found'}`}>
            {isLost ? 'Lost Item' : 'Found Item'}
          </span>
          {isReturned && (
            <span className="status-badge returned">
              <CheckCircle size={12} /> Returned
            </span>
          )}
          {isPending && (
            <span className="status-badge pending">
              <Clock size={12} /> Under Review
            </span>
          )}
          {item.reportedByGuard && (
            <span className="status-badge security">
              <ShieldCheck size={12} /> Security Desk
            </span>
          )}
        </div>
      </div>

      <div className="card-body">
        <div className="card-header-row">
          <span className="card-category">{item.category}</span>
          <span className="card-date">{item.dateOccurred}</span>
        </div>

        <h3 className="card-title">{item.title}</h3>
        <p className="card-desc">{item.description}</p>

        <div className="card-location">
          <MapPin size={14} className="text-primary" />
          <span>{item.location}</span>
        </div>

        {item.tags && item.tags.length > 0 && (
          <div className="card-tags">
            {item.tags.slice(0, 3).map(tag => (
              <span key={tag} className="tag-chip">#{tag}</span>
            ))}
            {item.tags.length > 3 && (
              <span className="tag-chip more">+{item.tags.length - 3}</span>
            )}
            {item.aiTagged && (
              <span className="ai-tag-badge" title="Analyzed with Gemini AI">
                <Sparkles size={11} /> AI
              </span>
            )}
          </div>
        )}

        <div className="card-footer">
          <span className="card-author">By {item.reporterName}</span>
          <span className="card-action-link">
            Details <ArrowRight size={14} />
          </span>
        </div>
      </div>
    </div>
  );
};

