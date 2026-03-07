import { useState } from "react";
import { useNavigate } from "react-router";

export const AuthForm = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState("login"); // "login" | "register"
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");

    const { name, email, password, confirmPassword } = formData;

    if (!name || !email || !password || !confirmPassword) {
      setAuthError("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    if (password.length < 6) {
      setAuthError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    if (password !== confirmPassword) {
      setAuthError("Xác nhận mật khẩu không khớp.");
      return;
    }

    const newUser = { name, email, password };
    try {
      localStorage.setItem("crypto_user", JSON.stringify(newUser));
      setAuthSuccess("Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.");
      setAuthMode("login");
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    } catch {
      setAuthError("Không thể lưu thông tin người dùng. Vui lòng thử lại.");
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");

    const { email, password } = formData;
    if (!email || !password) {
      setAuthError("Vui lòng nhập email và mật khẩu.");
      return;
    }

    try {
      const stored = localStorage.getItem("crypto_user");
      if (!stored) {
        setAuthError("Chưa có tài khoản. Vui lòng đăng ký trước.");
        return;
      }

      const savedUser = JSON.parse(stored);
      if (savedUser.email !== email || savedUser.password !== password) {
        setAuthError("Email hoặc mật khẩu không đúng.");
        return;
      }

      if (onLoginSuccess) {
        onLoginSuccess({ name: savedUser.name, email: savedUser.email });
      }
      setAuthSuccess("Đăng nhập thành công!");
      setFormData((prev) => ({
        ...prev,
        password: "",
        confirmPassword: "",
      }));
      navigate("/");
    } catch {
      setAuthError("Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-header">
        <h1>Crypto Price</h1>
        <p>Đăng nhập hoặc đăng ký để xem dữ liệu thị trường.</p>
      </div>

      <div className="auth-toggle">
        <button
          className={authMode === "login" ? "active" : ""}
          onClick={() => {
            setAuthMode("login");
            setAuthError("");
            setAuthSuccess("");
          }}
        >
          Đăng nhập
        </button>
        <button
          className={authMode === "register" ? "active" : ""}
          onClick={() => {
            setAuthMode("register");
            setAuthError("");
            setAuthSuccess("");
          }}
        >
          Đăng ký
        </button>
      </div>

      {authError && <p className="auth-message error">{authError}</p>}
      {authSuccess && <p className="auth-message success">{authSuccess}</p>}

      <form
        className="auth-form"
        onSubmit={authMode === "login" ? handleLogin : handleRegister}
      >
        {authMode === "register" && (
          <div className="form-group">
            <label>Họ tên</label>
            <input
              type="text"
              name="name"
              placeholder="Nhập họ tên"
              value={formData.name}
              onChange={handleInputChange}
            />
          </div>
        )}

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            placeholder="Nhập email"
            value={formData.email}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label>Mật khẩu</label>
          <input
            type="password"
            name="password"
            placeholder="Nhập mật khẩu"
            value={formData.password}
            onChange={handleInputChange}
          />
        </div>

        {authMode === "register" && (
          <div className="form-group">
            <label>Xác nhận mật khẩu</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Nhập lại mật khẩu"
              value={formData.confirmPassword}
              onChange={handleInputChange}
            />
          </div>
        )}

        <button type="submit" className="auth-submit">
          {authMode === "login" ? "Đăng nhập" : "Đăng ký"}
        </button>
      </form>
    </div>
  );
};
