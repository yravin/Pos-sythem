import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import "../Css/login.css";

export default function LoginForm({ onLoginSuccess = () => {} }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
     const response = await fetch("https://backend-pos-api.onrender.com/api/Login/",  {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Success alert
        alert("✅ Login ជោគជ័យ");

        // Optional: save token if backend returns it
        if (data.token) {
          localStorage.setItem("token", data.token);
        }

        // Call parent function (redirect / open system)
        onLoginSuccess();
      } else {
        // Fixed: match backend error field
        alert(data.error || "❌ Email ឬ Password មិនត្រឹមត្រូវ");
      }
    } catch (error) {
      console.error(error);
      alert("❌ Server Error!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h3 className="login-title">Login System</h3>

        {/* Email */}
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            className="form-input"
            placeholder="example@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Password */}
        <div className="form-group">
          <label>Password</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              className="form-input"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          className="submit-btn"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Loging in..." : "Login"}
        </button>

        <div className="footer-text">© 2026 POS System</div>
      </div>
    </div>
  );
}
