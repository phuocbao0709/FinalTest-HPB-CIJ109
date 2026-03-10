import { useState, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth } from "../api/firebase";

export const AuthForm = () => {
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

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleRegister = async (e) => {
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

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: name,
      });

      setAuthSuccess("Đăng ký thành công! Đang chuyển hướng...");

      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (error) {
      switch (error.code) {
        case "auth/email-already-in-use":
          setAuthError("Email này đã được đăng ký.");
          break;
        case "auth/invalid-email":
          setAuthError("Email không hợp lệ.");
          break;
        case "auth/weak-password":
          setAuthError("Mật khẩu quá yếu. Vui lòng chọn mật khẩu mạnh hơn.");
          break;
        default:
          setAuthError("Đã xảy ra lỗi: " + error.message);
      }
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");

    const { email, password } = formData;

    if (!email || !password) {
      setAuthError("Vui lòng nhập email và mật khẩu.");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setAuthSuccess("Đăng nhập thành công! Đang chuyển hướng...");

      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (error) {
      switch (error.code) {
        case "auth/invalid-credential":
          setAuthError("Email hoặc mật khẩu không chính xác.");
          break;
        case "auth/user-not-found":
          setAuthError("Tài khoản chưa được đăng ký.");
          break;
        case "auth/wrong-password":
          setAuthError("Mật khẩu không chính xác.");
          break;
        default:
          setAuthError("Đã xảy ra lỗi: " + error.message);
      }
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
      <button
        className="home-button"
        type="button"
        onClick={() => navigate("/")}
      >
        Back to Home
      </button>
    </div>
  );
};
