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
  UserIcon,
} from "./icons.jsx";

function validate({ username, email, password }) {
  const errors = {};
  if (!username.trim()) {
    errors.username = "Username is required.";
  }
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

function RegisterPage({ onSwitchToLogin }) {
  const { register } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [touched, setTouched] = useState({
    username: false,
    email: false,
    password: false,
  });

  const errors = validate({ username, email, password });

  function markTouched(field) {
    setTouched((current) => ({ ...current, [field]: true }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setTouched({ username: true, email: true, password: true });
    if (Object.keys(errors).length > 0) {
      return;
    }
    try {
      setError("");
      await register(email, password, username);
    } catch (err) {
      setError(err.message);
    }
  }

  const usernameInvalid = touched.username && Boolean(errors.username);
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
              Join TaskFlow and take control of your day.
            </h2>
            <p className="auth-brand__sub">
              Create your free account and start turning your to-do list into
              done.
            </p>
          </div>
          <ul className="auth-brand__points">
            <li>
              <CheckCircleIcon /> Free, fast, and simple to use
            </li>
            <li>
              <CheckCircleIcon /> Your tasks, private to your account
            </li>
            <li>
              <CheckCircleIcon /> Set up in under a minute
            </li>
          </ul>
        </aside>
        <div className="auth-form-panel">
          <form onSubmit={handleSubmit} className="auth-card" noValidate>
            <h1>Register</h1>
            <p className="auth-card__lede">
              Create an account to start organizing your tasks.
            </p>
            <div className="field">
              <label htmlFor="register-username">Username</label>
              <div
                className={`input-group${usernameInvalid ? " input-group--invalid" : ""}`}
              >
                <span className="input-group__icon">
                  <UserIcon />
                </span>
                <input
                  id="register-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onBlur={() => markTouched("username")}
                  placeholder="jane_doe"
                  autoComplete="username"
                  aria-invalid={usernameInvalid}
                  aria-describedby={
                    usernameInvalid ? "register-username-error" : undefined
                  }
                />
              </div>
              {usernameInvalid && (
                <p
                  className="field-error"
                  id="register-username-error"
                  role="alert"
                >
                  <AlertIcon />
                  {errors.username}
                </p>
              )}
            </div>
            <div className="field">
              <label htmlFor="register-email">Email</label>
              <div
                className={`input-group${emailInvalid ? " input-group--invalid" : ""}`}
              >
                <span className="input-group__icon">
                  <MailIcon />
                </span>
                <input
                  id="register-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => markTouched("email")}
                  placeholder="you@example.com"
                  autoComplete="email"
                  aria-invalid={emailInvalid}
                  aria-describedby={
                    emailInvalid ? "register-email-error" : undefined
                  }
                />
              </div>
              {emailInvalid && (
                <p
                  className="field-error"
                  id="register-email-error"
                  role="alert"
                >
                  <AlertIcon />
                  {errors.email}
                </p>
              )}
            </div>
            <div className="field">
              <label htmlFor="register-password">Password</label>
              <div
                className={`input-group${passwordInvalid ? " input-group--invalid" : ""}`}
              >
                <span className="input-group__icon">
                  <LockIcon />
                </span>
                <input
                  id="register-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => markTouched("password")}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  aria-invalid={passwordInvalid}
                  aria-describedby={
                    passwordInvalid ? "register-password-error" : undefined
                  }
                />
              </div>
              {passwordInvalid && (
                <p
                  className="field-error"
                  id="register-password-error"
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
              Register
            </button>
            <button
              type="button"
              className="btn btn--link"
              onClick={onSwitchToLogin}
            >
              Already have an account? Log in
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
