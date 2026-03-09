import { useState } from "react";
import { formatPrice, formatMarketCap } from "../utils/formatter";

export const HomeOverview = ({
  featuredCryptos,
  newListedCryptos,
  totalMarketCap,
  totalVolume,
  btcDominance,
}) => {
  const [highlightTab, setHighlightTab] = useState("spot");
  const [newListedTab, setNewListedTab] = useState("spot");

  const highlightData =
    highlightTab === "spot" ? featuredCryptos : [...featuredCryptos].reverse();

  const newListedData =
    newListedTab === "spot"
      ? newListedCryptos
      : [...newListedCryptos].reverse();

  return (
    <section className="home-overview">
      {/* Bảng 1: Crypto nổi bật */}
      <div className="overview-card">
        <div className="overview-header">
          <div>
            <p className="overview-title">Crypto nổi bật</p>
          </div>
          <div className="overview-pills">
            <button
              className={`pill ${highlightTab === "spot" ? "pill-active" : ""}`}
              type="button"
              onClick={() => setHighlightTab("spot")}
            >
              Spot
            </button>
            <button
              className={`pill ${
                highlightTab === "futures" ? "pill-active" : ""
              }`}
              type="button"
              onClick={() => setHighlightTab("futures")}
            >
              Futures
            </button>
          </div>
        </div>
        <div className="overview-list">
          {highlightData.map((crypto) => (
            <div key={crypto.id} className="overview-row">
              <div className="overview-symbol">
                <img src={crypto.image} alt={crypto.name} />
                <div className="overview-symbol-text">
                  <span className="overview-name">
                    {crypto.symbol.toUpperCase()}/USDT
                  </span>
                  <span className="overview-sub">{crypto.name}</span>
                </div>
              </div>
              <div className="overview-price">
                <span>{formatPrice(crypto.current_price)}</span>
                <span
                  className={`overview-change ${
                    crypto.price_change_percentage_24h >= 0
                      ? "positive"
                      : "negative"
                  }`}
                >
                  {crypto.price_change_percentage_24h >= 0 ? "+" : ""}
                  {Math.abs(crypto.price_change_percentage_24h || 0).toFixed(2)}
                  %
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bảng 2: Tài sản mới niêm yết */}
      <div className="overview-card">
        <div className="overview-header">
          <div>
            <p className="overview-title">Tài sản mới niêm yết</p>
          </div>
          <div className="overview-pills">
            <button
              className={`pill ${newListedTab === "spot" ? "pill-active" : ""}`}
              type="button"
              onClick={() => setNewListedTab("spot")}
            >
              Spot
            </button>
            <button
              className={`pill ${
                newListedTab === "futures" ? "pill-active" : ""
              }`}
              type="button"
              onClick={() => setNewListedTab("futures")}
            >
              Futures
            </button>
          </div>
        </div>
        <div className="overview-list">
          {newListedData.map((crypto) => (
            <div key={crypto.id} className="overview-row">
              <div className="overview-symbol">
                <img src={crypto.image} alt={crypto.name} />
                <div className="overview-symbol-text">
                  <span className="overview-name">
                    {crypto.symbol.toUpperCase()}/USDT
                  </span>
                  <span className="overview-sub">{crypto.name}</span>
                </div>
              </div>
              <div className="overview-price">
                <span>{formatPrice(crypto.current_price)}</span>
                <span
                  className={`overview-change ${
                    crypto.price_change_percentage_24h >= 0
                      ? "positive"
                      : "negative"
                  }`}
                >
                  {crypto.price_change_percentage_24h >= 0 ? "+" : ""}
                  {Math.abs(crypto.price_change_percentage_24h || 0).toFixed(2)}
                  %
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
