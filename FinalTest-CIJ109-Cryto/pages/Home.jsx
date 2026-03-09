import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { fetchCryptos } from "../api/coinGecko";
import { CryptoCard } from "../components/CryptoCard";
import { AuthForm } from "./AuthForm";
import { HomeOverview } from "../components/HomeOverview";

export const Home = () => {
  const [user, setUser] = useState(() => {
    if (typeof window === "undefined") return null;
    try {
      const stored = localStorage.getItem("crypto_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [isAccessToken, setIsAccessToken] = useState(() => {
    if (typeof window === "undefined") return null;
    try {
      const stored = localStorage.getItem("access_token");
      return stored ? true : false;
    } catch {
      return false;
    }
  });
  const [cryptoList, setCryptoList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("market_cap_rank");
  const [favoriteIds, setFavoriteIds] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem("crypto_favorites");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    fetchCryptoData();
    const interval = setInterval(fetchCryptoData, 30000);

    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    filterAndSort();
  }, [sortBy, cryptoList, searchQuery, favoriteIds]);

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("crypto_favorites", JSON.stringify(favoriteIds));
      }
    } catch {
      // ignore
    }
  }, [favoriteIds]);

  const fetchCryptoData = async () => {
    try {
      const data = await fetchCryptos();
      setCryptoList(data);
    } catch (err) {
      console.error("Error fetching crypto: ", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
      }
    } catch {
      // ignore
    }
    setUser(null);
    navigate("/auth");
  };

  const filterAndSort = () => {
    let filtered = cryptoList.filter(
      (crypto) =>
        crypto.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        crypto.symbol.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    if (sortBy === "favorites") {
      filtered = filtered.filter((crypto) => favoriteIds.includes(crypto.id));
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "favorites":
          return a.market_cap_rank - b.market_cap_rank;
        case "name":
          return a.name.localeCompare(b.name);
        case "price":
          return a.current_price - b.current_price;
        case "price_desc":
          return b.current_price - a.current_price;
        case "change":
          return a.price_change_percentage_24h - b.price_change_percentage_24h;
        case "market_cap":
          return a.market_cap - b.market_cap;
        default:
          return a.market_cap_rank - b.market_cap_rank;
      }
    });

    setFilteredList(filtered);
  };
  const handleToggleFavorite = (cryptoId) => {
    setFavoriteIds((prev) =>
      prev.includes(cryptoId)
        ? prev.filter((id) => id !== cryptoId)
        : [...prev, cryptoId],
    );
  };
  const featuredCryptos = cryptoList.slice(0, 4); // Lấy 4 đồng đầu tiên
  const newListedCryptos = cryptoList.slice(-4); // Lấy 4 đồng cuối
  const totalMarketCap = cryptoList.reduce(
    (acc, curr) => acc + (curr.market_cap || 0),
    0,
  );
  const totalVolume = cryptoList.reduce(
    (acc, curr) => acc + (curr.total_volume || 0),
    0,
  );
  const btcDominance = 48.5; // Bạn có thể tính % dựa trên BTC/Total
  return (
    <div className="app">
      {
        <>
          <header className="header">
            <div className="header-content">
              <div className="logo-section">
                <h1>Crypto Price</h1>
                {isAccessToken ? (
                  <p>
                    Xin chào, {user.name}! Real-time cryptocurrency prices and
                    market data
                  </p>
                ) : (
                  <></>
                )}
              </div>
              <div className="search-section">
                <input
                  type="text"
                  placeholder="Search cryptos..."
                  className="search-input"
                  onChange={(e) => setSearchQuery(e.target.value)}
                  value={searchQuery}
                />
              </div>
              <div className="auth-buttons">
                {!isAccessToken ? (
                  <button
                    className="login-button"
                    type="button"
                    onClick={() => navigate("/auth")}
                  >
                    Đăng nhập
                  </button>
                ) : (
                  <button
                    className="logout-button"
                    type="button"
                    onClick={handleLogout}
                  >
                    Đăng xuất
                  </button>
                )}
              </div>
            </div>
          </header>

          <div className="controls">
            <div className="filter-group">
              <div className="navigation-tabs">
                <button
                  type="button"
                  className={sortBy === "market_cap_rank" ? "active" : ""}
                  onClick={() => setSortBy("market_cap_rank")}
                >
                  Rank
                </button>
                <button
                  type="button"
                  className={sortBy === "name" ? "active" : ""}
                  onClick={() => setSortBy("name")}
                >
                  Name
                </button>
                <button
                  type="button"
                  className={sortBy === "price" ? "active" : ""}
                  onClick={() => setSortBy("price")}
                >
                  Price (Low → High)
                </button>
                <button
                  type="button"
                  className={sortBy === "price_desc" ? "active" : ""}
                  onClick={() => setSortBy("price_desc")}
                >
                  Price (High → Low)
                </button>
                <button
                  type="button"
                  className={sortBy === "change" ? "active" : ""}
                  onClick={() => setSortBy("change")}
                >
                  24h Change
                </button>
                <button
                  type="button"
                  className={sortBy === "market_cap" ? "active" : ""}
                  onClick={() => setSortBy("market_cap")}
                >
                  Market Cap
                </button>
                <button
                  type="button"
                  className={sortBy === "favorites" ? "active" : ""}
                  onClick={() => setSortBy("favorites")}
                >
                  Favorites
                </button>
              </div>
            </div>
            <div className="view-toggle">
              <button
                className={viewMode === "grid" ? "active" : ""}
                onClick={() => setViewMode("grid")}
              >
                Grid
              </button>
              <button
                className={viewMode === "list" ? "active" : ""}
                onClick={() => setViewMode("list")}
              >
                List
              </button>
            </div>
          </div>

          {!isLoading && cryptoList.length > 0 && (
            <HomeOverview
              featuredCryptos={featuredCryptos}
              newListedCryptos={newListedCryptos}
              totalMarketCap={totalMarketCap}
              totalVolume={totalVolume}
              btcDominance={btcDominance}
            />
          )}

          {isLoading ? (
            <div className="loading">
              <div className="spinner" />
              <p>Loading crypto data...</p>
            </div>
          ) : (
            <div className={`crypto-container ${viewMode}`}>
              {filteredList.map((crypto, key) => (
                <CryptoCard
                  crypto={crypto}
                  key={crypto.id || key}
                  isFavorite={favoriteIds.includes(crypto.id)}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          )}

          <footer className="footer">
            <p>CoinGecko API • Updated every 30 seconds</p>
          </footer>
        </>
      }
    </div>
  );
};
