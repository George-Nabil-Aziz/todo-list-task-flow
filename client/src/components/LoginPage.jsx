import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../hooks/useTheme.js";
import { isValidEmail } from "../utils/validation.js";
import ThemeToggle from "./ThemeToggle.jsx";
import {
  AlertIcon,
  CheckCircleIcon,
  ClipboardIcon,
  LockIcon,
  MailIcon,
} from "./icons.jsx";

function validate({ email, password }) {
  const errors = {};
  if (!email.trim()) {
    errors.email = "Email is required.";
  } else if (!isValidEmail(email)) {
    errors.email = "Enter a valid email address.";
  }
  if (!password) {
    errors.password = "Password is required.";
  }
  return errors;
}

function LoginPage({ onSwitchToRegister }) {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [touched, setTouched] = useState({ email: false, password: false });

  const errors = validate({ email, password });

  function markTouched(field) {
    setTouched((current) => ({ ...current, [field]: true }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (Object.keys(errors).length > 0) {
      return;
    }
    try {
      setError("");
      await login(email, password);
    } catch (err) {
      setError(err.message);
    }
  }

  const emailInvalid = touched.email && Boolean(errors.email);
  const passwordInvalid = touched.password && Boolean(errors.password);

  return (
    <div className="auth-page">
      <ThemeToggle
        theme={theme}
        onToggle={toggleTheme}
        className="theme-toggle--corner"
      />
      <div className="auth-shell">
        <aside className="auth-brand" aria-hidden="true">
          <span className="auth-brand__mark">
            <span className="auth-brand__mark-icon">
              <ClipboardIcon />
            </span>
            TaskFlow
          </span>
          <div>
            <h2 className="auth-brand__heading">
              Organize your work, stay ahead of everything.
            </h2>
            <p className="auth-brand__sub">
              A focused space to plan your day, track priorities, and get things
              done.
            </p>
          </div>
          <ul className="auth-brand__points">
            <li>
              <CheckCircleIcon /> Prioritize what matters most
            </li>
            <li>
              <CheckCircleIcon /> Track progress at a glance
            </li>
            <li>
              <CheckCircleIcon /> Stay organized across devices
            </li>
          </ul>
        </aside>
        <div className="auth-form-panel">
          <form onSubmit={handleSubmit} className="auth-card" noValidate>
            <h1>Log In</h1>
            <p className="auth-card__lede">
              Welcome back. Enter your details to continue.
            </p>
            <div className="field">
              <label htmlFor="login-email">Email</label>
              <div
                className={`input-group${emailInvalid ? " input-group--invalid" : ""}`}
              >
                <span className="input-group__icon">
                  <MailIcon />
                </span>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => markTouched("email")}
                  placeholder="you@example.com"
                  autoComplete="email"
                  aria-invalid={emailInvalid}
                  aria-describedby={
                    emailInvalid ? "login-email-error" : undefined
                  }
                />
              </div>
              {emailInvalid && (
                <p className="field-error" id="login-email-error" role="alert">
                  <AlertIcon />
                  {errors.email}
                </p>
              )}
            </div>
            <div className="field">
              <label htmlFor="login-password">Password</label>
              <div
                className={`input-group${passwordInvalid ? " input-group--invalid" : ""}`}
              >
                <span className="input-group__icon">
                  <LockIcon />
                </span>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => markTouched("password")}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  aria-invalid={passwordInvalid}
                  aria-describedby={
                    passwordInvalid ? "login-password-error" : undefined
                  }
                />
              </div>
              {passwordInvalid && (
                <p
                  className="field-error"
                  id="login-password-error"
                  role="alert"
                >
                  <AlertIcon />
                  {errors.password}
                </p>
              )}
            </div>
            {error && (
              <p role="alert" className="alert">
                <AlertIcon />
                {error}
              </p>
            )}
            <button type="submit" className="btn btn--primary btn--block">
              Log In
            </button>
            <button
              type="button"
              className="btn btn--link"
              onClick={onSwitchToRegister}
            >
              Need an account? Register
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
