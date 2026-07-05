import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Lock, UserRound } from 'lucide-react';
import { grantLoveAccess } from '../auth/loveAuth';

const VALID_LOGINS = ['Qonxor Qizim', 'Qxr Qm'];
const VALID_PASSWORD = 'hayotim';

export default function LoginPage() {
  const navigate = useNavigate();
  const [loginValue, setLoginValue] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const cleanLogin = loginValue.trim().replace(/\s+/g, ' ');
    const hasValidLogin = VALID_LOGINS.some((value) => value.toLowerCase() === cleanLogin.toLowerCase());

    if (!hasValidLogin || password !== VALID_PASSWORD) {
      setError('Login yoki password xato');
      return;
    }

    grantLoveAccess();
    navigate('/love');
  };

  return (
    <main className="love-screen love-page--personal">
      <div className="page-orb page-orb-one" aria-hidden />
      <div className="page-orb page-orb-two" aria-hidden />

      <div className="login-wrap">
        <section className="login-hero" aria-label="Login">
          <div className="login-mark">
            <Heart size={30} className="animated-heart-icon" />
          </div>
          <h1>Just open it once and read it, please.</h1>
          <p>The right words open the next page.</p>
        </section>

        <section className="login-card">
          <h2>Enter the private page</h2>

          {error && (
            <div className="login-error" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <label className="field">
              <span>Login</span>
              <div className="field-control">
                <UserRound size={18} />
                <input
                  data-testid="login-input"
                  type="text"
                  value={loginValue}
                  onChange={(e) => setLoginValue(e.target.value)}
                  placeholder="Q**x*r Q***m"
                  required
                />
              </div>
            </label>

            <label className="field">
              <span>Password</span>
              <div className="field-control">
                <Lock size={18} />
                <input
                  data-testid="password-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="h*****"
                  required
                />
              </div>
            </label>

            <button type="submit" className="love-button">
              Open personal page
            </button>
          </form>

          <div className="entry-note">
            <p className="entry-title">Entry code :</p>
            <p>The name I saved you under in my contacts</p>
            <p>Login : Q**x*r Q***m</p>
            <p>You used to start every morning like this</p>
            <p>password : (Assalomu aleykum) h*****</p>
          </div>
        </section>

        <p className="login-foot">Made for a private archive</p>
      </div>
    </main>
  );
}
