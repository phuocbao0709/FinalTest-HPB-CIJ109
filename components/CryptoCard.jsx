import { Link } from "react-router";
import { formatMarketCap, formatPrice } from "../utils/formatter";

export const CryptoCard = ({ crypto, isFavorite, onToggleFavorite }) => {
  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleFavorite && crypto?.id) {
      onToggleFavorite(crypto.id);
    }
  };

  return (
    <div className="crypto-card">
      <button
        type="button"
        className={`favorite-badge ${isFavorite ? "active" : ""}`}
        onClick={handleFavoriteClick}
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      >
        ★
      </button>

      <Link
        to={`/coin/${crypto.id}`}
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <div className="crypto-header">
          <div className="crypto-info">
            <img src={crypto.image} alt={crypto.name} />
            <div>
              <h3>{crypto.name}</h3>
              <p className="symbol">{crypto.symbol.toUpperCase()}</p>
              <span className="rank">#{crypto.market_cap_rank}</span>
            </div>
          </div>
        </div>

        <div className="crypto-price">
          <p className="price">{formatPrice(crypto.current_price)}</p>
          <p
            className={`change ${
              crypto.price_change_percentage_24h >= 0 ? "positive" : "negative"
            }`}
          >
            {crypto.price_change_percentage_24h >= 0 ? "↑" : "↓"}{" "}
            {Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%
          </p>
        </div>

        <div className="crypto-stats">
          <div className="stat">
            <span className="stat-label">Market Cap</span>
            <span className="stat-value">
              ${formatMarketCap(crypto.market_cap)}
            </span>
          </div>

          <div className="stat">
            <span className="stat-label">Volume</span>
            <span className="stat-value">
              ${formatMarketCap(crypto.total_volume)}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};
