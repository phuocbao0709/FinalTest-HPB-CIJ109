import { BrowserRouter, Routes, Route } from "react-router";
import { Home } from "../pages/Home";
import { CoinDetail } from "../pages/CoinDetail";
import { AuthForm } from "../pages/AuthForm";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/coin/:id" element={<CoinDetail />} />
        <Route path="/auth" element={<AuthForm />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
