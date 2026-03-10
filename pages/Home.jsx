import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router";
import { onAuthStateChanged } from "firebase/auth";
import { fetchCryptos } from "../api/coinGecko";
import { CryptoCard } from "../components/CryptoCard";
import { HomeOverview } from "../components/HomeOverview";
import { auth } from "../api/firebase";

export const Home = () => {
  const [user, setUser] = useState(null);
  const [cryptoList, setCryptoList] = useState([]);
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
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 6;
  const navigate = useNavigate();

  // Listen to Firebase auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          name: firebaseUser.displayName || "User",
          email: firebaseUser.email,
        });
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch crypto data when user is logged in or page changes
  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const payload = {
      vs_currency: "usd",
      order: "market_cap_desc",
      per_page: perPage,
      page: currentPage,
      sparkline: "false",
    };

    fetchCryptoData(payload);

    const interval = setInterval(() => {
      fetchCryptoData(payload);
    }, 30000);

    return () => clearInterval(interval);
  }, [user, currentPage]);

  // Fetch data when sortBy changes
  useEffect(() => {
    if (!user) return;

    if (sortBy === "favorites") {
      const payload = {
        ids: favoriteIds.length > 0 ? favoriteIds.join(",") : "bitcoin",
        vs_currency: "usd",
        order: "market_cap_desc",
        per_page: 100,
        page: 1,
        sparkline: "false",
      };
      fetchCryptoData(payload);
    } else {
      const payload = {
        vs_currency: "usd",
        order: "market_cap_desc",
        per_page: perPage,
        page: currentPage,
        sparkline: "false",
      };
      fetchCryptoData(payload);
    }
  }, [sortBy, favoriteIds.length]);

  // Save favorites to localStorage
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("crypto_favorites", JSON.stringify(favoriteIds));
      }
    } catch {
      // ignore
    }
  }, [favoriteIds]);

  const fetchCryptoData = useCallback(async (payload) => {
    setIsLoading(true);
    try {
      const data = await fetchCryptos(payload);
      setCryptoList(data);
    } catch (err) {
      console.error("Error fetching crypto: ", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await auth.signOut();
      setUser(null);
      navigate("/auth");
    } catch (error) {
      console.error("Logout error:", error);
    }
  }, [navigate]);

  const handleToggleFavorite = useCallback((cryptoId) => {
    setFavoriteIds((prev) =>
      prev.includes(cryptoId)
        ? prev.filter((id) => id !== cryptoId)
        : [...prev, cryptoId],
    );
  }, []);

  const handleNextPage = useCallback(() => {
    setCurrentPage((prev) => prev + 1);
  }, []);

  const handlePrevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  }, []);

  // Filter and sort with useMemo
  const filteredList = useMemo(() => {
    let filtered = cryptoList.filter(
      (crypto) =>
        crypto.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        crypto.symbol?.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    if (sortBy === "favorites") {
      filtered = filtered.filter((crypto) => favoriteIds.includes(crypto.id));
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "favorites":
        case "market_cap_rank":
          return (a.market_cap_rank || 0) - (b.market_cap_rank || 0);
        case "name":
          return (a.name || "").localeCompare(b.name || "");
        case "price":
          return (a.current_price || 0) - (b.current_price || 0);
        case "price_desc":
          return (b.current_price || 0) - (a.current_price || 0);
        case "change":
          return (
            (a.price_change_percentage_24h || 0) -
            (b.price_change_percentage_24h || 0)
          );
        case "market_cap":
          return (a.market_cap || 0) - (b.market_cap || 0);
        default:
          return (a.market_cap_rank || 0) - (b.market_cap_rank || 0);
      }
    });

    return filtered;
  }, [cryptoList, searchQuery, sortBy, favoriteIds]);

  // Computed stats with useMemo
  const featuredCryptos = useMemo(() => cryptoList.slice(0, 4), [cryptoList]);
  const newListedCryptos = useMemo(() => cryptoList.slice(-4), [cryptoList]);
  const totalMarketCap = useMemo(
    () => cryptoList.reduce((acc, curr) => acc + (curr.market_cap || 0), 0),
    [cryptoList],
  );
  const totalVolume = useMemo(
    () => cryptoList.reduce((acc, curr) => acc + (curr.total_volume || 0), 0),
    [cryptoList],
  );
  const btcDominance = 48.5;

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="logo-section">
            <h1>Crypto Price</h1>
            {user ? (
              <p>
                Xin chào, {user.name}! Real-time cryptocurrency prices and
                market data
              </p>
            ) : (
              <p>Real-time cryptocurrency prices and market data</p>
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
            {!user ? (
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

      {user && (
        <>
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

          {!isLoading && filteredList.length > 0 && (
            <div className="pagination">
              <button
                type="button"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
              >
                Previous
              </button>

              <span className="pagination-info">Page {currentPage}</span>

              <button
                type="button"
                onClick={handleNextPage}
                disabled={filteredList.length < perPage}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {!user && (
        <div className="welcome-message">
          <h2>Chào mừng đến với Crypto Price Tracker</h2>
          <p>Vui lòng đăng nhập để xem dữ liệu thị trường crypto real-time.</p>
          <button
            className="login-button-large"
            type="button"
            onClick={() => navigate("/auth")}
          >
            Đăng nhập ngay
          </button>
        </div>
      )}

      <footer className="footer">
        <p>CoinGecko API • Updated every 30 seconds</p>
      </footer>
    </div>
  );
};
