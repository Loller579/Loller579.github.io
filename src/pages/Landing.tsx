import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Landing.css'

export default function Landing() {
  const { user } = useAuth()

  return (
    <div className="landing">
      <nav className="nav">
        <div className="nav-content">
          <Link to="/" className="logo">POACHED</Link>
          <div className="nav-links">
            {user ? (
              <Link to="/dashboard" className="btn-nav">Dashboard</Link>
            ) : (
              <>
                <Link to="/login" className="btn-nav">Sign In</Link>
                <Link to="/signup" className="btn-nav-primary">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Custom Tennis Drills.
            <br />
            <span className="highlight">Built For Your Level.</span>
          </h1>
          <p className="hero-description">
            Elite training sessions tailored to your UTR, goals, and available time. Generated in seconds.
          </p>
          <div className="hero-actions">
            <Link to={user ? "/create-session" : "/signup"} className="btn-hero-primary">
              Generate Your First Session
            </Link>
          </div>
        </div>

        <div className="hero-stats">
          <div className="stat-card">
            <div className="stat-number">50+</div>
            <div className="stat-label">Pro-Level Drills</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">1-16.5</div>
            <div className="stat-label">UTR Range</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">8</div>
            <div className="stat-label">Focus Areas</div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="feature">
          <div className="feature-icon">⚡</div>
          <h3>Instant Generation</h3>
          <p>Complete training sessions in seconds based on your level and goals</p>
        </div>
        <div className="feature">
          <div className="feature-icon">🎯</div>
          <h3>Precision Targeting</h3>
          <p>Focus on specific skills: forehand, serve, movement, patterns, and more</p>
        </div>
        <div className="feature">
          <div className="feature-icon">📊</div>
          <h3>Adaptive Difficulty</h3>
          <p>Drills scale from 1.0 to 16.5 UTR with coaching cues for every level</p>
        </div>
      </section>
    </div>
  )
}
