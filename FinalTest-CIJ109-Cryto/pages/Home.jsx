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

  const [cryptoList, setCryptoList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("market_cap_rank");
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
  }, [sortBy, cryptoList, searchQuery]);

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
    setUser(null);
    navigate("/auth");
  };

  const filterAndSort = () => {
    let filtered = cryptoList.filter(
      (crypto) =>
        crypto.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        crypto.symbol.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    filtered.sort((a, b) => {
      switch (sortBy) {
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
      {!user ? (
        <AuthForm onLoginSuccess={setUser} />
      ) : (
        <>
          <header className="header">
            <div className="header-content">
              <div className="logo-section">
                <h1>Crypto Price</h1>
                <p>
                  Xin chào, {user.name}! Real-time cryptocurrency prices and
                  market data
                </p>
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
              <button className="logout-button" onClick={handleLogout}>
                Đăng Xuất
              </button>
            </div>
          </header>

          <div className="controls">
            <div className="filter-group">
              <label>Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="market_cap_rank">Rank</option>
                <option value="name">Name</option>
                <option value="price">Price (Low to High)</option>
                <option value="price_desc">Price (High to Low)</option>
                <option value="change">24h Change</option>
                <option value="market_cap">Market Cap</option>
              </select>
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
                <CryptoCard crypto={crypto} key={key} />
              ))}
            </div>
          )}

          <footer className="footer">
            <p>CoinGecko API • Updated every 30 seconds</p>
          </footer>
        </>
      )}
    </div>
  );
};
