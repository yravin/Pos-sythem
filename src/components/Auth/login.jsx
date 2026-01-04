import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import "../Css/login.css";

export default function LoginForm({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        "https://backend-pos-api.onrender.com/api/Login/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("✅ Login ជោគជ័យ");

        // ✅ SAVE TOKEN
        localStorage.setItem("token", data.token);

        // ✅ SAVE USER
        localStorage.setItem("user", JSON.stringify(data.user));

        onLoginSuccess();
      } else {
        alert(data.error || "❌ Email ឬ Password មិនត្រឹមត្រូវ");
      }
    } catch (err) {
      alert("❌ Server Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h3 className="login-title">Login System</h3>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </span>
          </div>
        </div>

        <button
          className="submit-btn"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>
    </div>
  );
}
