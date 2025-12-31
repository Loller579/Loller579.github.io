import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase, Session } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import './Dashboard.css'

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    loadSessions()
  }, [user])

  const loadSessions = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setSessions(data)
    }
    setLoading(false)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="dashboard">
      <nav className="dashboard-nav">
        <div className="nav-content">
          <Link to="/" className="logo">POACHED</Link>
          <div className="nav-links">
            <Link to="/dashboard" className="nav-link active">Dashboard</Link>
            <Link to="/profile" className="nav-link">Profile</Link>
            <button onClick={handleSignOut} className="nav-link">Sign Out</button>
          </div>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Your Sessions</h1>
          <Link to="/create-session" className="btn-primary">
            + New Session
          </Link>
        </div>

        {loading ? (
          <div className="loading">Loading sessions...</div>
        ) : sessions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎾</div>
            <h2>No sessions yet</h2>
            <p>Create your first custom training session to get started</p>
            <Link to="/create-session" className="btn-primary">
              Generate Session
            </Link>
          </div>
        ) : (
          <div className="sessions-grid">
            {sessions.map((session) => (
              <Link to={`/session/${session.id}`} key={session.id} className="session-card">
                <div className="session-header">
                  <h3>{session.name}</h3>
                  <span className={`intensity-badge ${session.intensity}`}>
                    {session.intensity}
                  </span>
                </div>
                <div className="session-meta">
                  <div className="meta-item">
                    <span className="meta-label">Duration</span>
                    <span className="meta-value">{session.session_length} min</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Environment</span>
                    <span className="meta-value">{session.environment}</span>
                  </div>
                  {session.surface && (
                    <div className="meta-item">
                      <span className="meta-label">Surface</span>
                      <span className="meta-value">{session.surface}</span>
                    </div>
                  )}
                </div>
                <div className="session-footer">
                  <span className="session-date">{formatDate(session.created_at)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
