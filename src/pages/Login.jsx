import { useEffect, useState } from "preact/hooks";
import { useLocation } from "preact-iso";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { loginWithGoogle } from "../lib/auth";
import { useCurrentUser } from "../lib/currentUser";
import "../styles/Login.css";
import googleLogo from "../assets/google-logo.svg";

export default function Login() {
    const { user, role, loading: userLoading } = useCurrentUser();
    const { route } = useLocation();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (userLoading || !user) return;
        route(role === "admin" ? "/admin" : "/borrow");
    }, [user, role, userLoading, route]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);

        } catch (error) {
            setError("Invalid email or password");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError("");
        setLoading(true);
        try {
            await loginWithGoogle();
        } catch (err) {
            setError("Google login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
    <main class="login-page">
      <section class="login-card">
        <p class="eyebrow">LAB TRACK</p>
        <h1>Welcome back</h1>
        <p class="subtitle">Sign in to borrow or manage lab equipment</p>

        {error && <p class="error-msg" role="alert">{error}</p>}

        <form onSubmit={handleSubmit} class="login-form">
          <div class="field">
            <label for="email">Email</label>
            <input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              placeholder="you@carsu.edu.ph"
              value={email}
              onInput={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div class="field">
            <label for="password">Password</label>
            <div class="password-wrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onInput={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                class="toggle-pw"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button type="submit" class="btn-primary" disabled={loading}>
            {loading ? "Signing in..." : "Log in"}
          </button>
        </form>

        <div class="divider"><span>or</span></div>

        <button type="button" class="btn-google" onClick={handleGoogleLogin} disabled={loading}>
            <img src={googleLogo} alt=" " class="google-logo" width="30" height="30"/>
            Sign in with Google
        </button>
      </section>
    </main>
  );
}