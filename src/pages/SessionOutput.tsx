import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { supabase, Session, SessionDrill, Drill } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import './SessionOutput.css'

interface SessionWithDrills extends Session {
  drills: (SessionDrill & { drill: Drill })[]
}

export default function SessionOutput() {
  const { id } = useParams<{ id: string }>()
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [session, setSession] = useState<SessionWithDrills | null>(null)
  const [loading, setLoading] = useState(true)
  const [favoriteDrills, setFavoriteDrills] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadSession()
    loadFavorites()
  }, [id, user])

  const loadSession = async () => {
    if (!id || !user) return

    const { data: sessionData, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (sessionError || !sessionData) {
      navigate('/dashboard')
      return
    }

    const { data: drillsData, error: drillsError } = await supabase
      .from('session_drills')
      .select(`
        *,
        drill:drills(*)
      `)
      .eq('session_id', id)
      .order('order_index')

    if (!drillsError && drillsData) {
      setSession({
        ...sessionData,
        drills: drillsData as any
      })
    }

    setLoading(false)
  }

  const loadFavorites = async () => {
    if (!user) return

    const { data } = await supabase
      .from('favorite_drills')
      .select('drill_id')
      .eq('user_id', user.id)

    if (data) {
      setFavoriteDrills(new Set(data.map(f => f.drill_id)))
    }
  }

  const toggleFavorite = async (drillId: string) => {
    if (!user) return

    if (favoriteDrills.has(drillId)) {
      await supabase
        .from('favorite_drills')
        .delete()
        .eq('user_id', user.id)
        .eq('drill_id', drillId)

      setFavoriteDrills(prev => {
        const next = new Set(prev)
        next.delete(drillId)
        return next
      })
    } else {
      await supabase
        .from('favorite_drills')
        .insert({ user_id: user.id, drill_id: drillId })

      setFavoriteDrills(prev => new Set([...prev, drillId]))
    }
  }

  const deleteSession = async () => {
    if (!id || !user) return

    if (confirm('Are you sure you want to delete this session?')) {
      await supabase
        .from('sessions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      navigate('/dashboard')
    }
  }

  const duplicateSession = async () => {
    if (!session || !user) return

    const { data: newSession, error: sessionError } = await supabase
      .from('sessions')
      .insert({
        user_id: user.id,
        name: `${session.name} (Copy)`,
        intensity: session.intensity,
        session_length: session.session_length,
        focus_areas: session.focus_areas,
        environment: session.environment,
        surface: session.surface
      })
      .select()
      .single()

    if (sessionError || !newSession) {
      alert('Failed to duplicate session')
      return
    }

    const drillsToInsert = session.drills.map(sd => ({
      session_id: newSession.id,
      drill_id: sd.drill_id,
      order_index: sd.order_index,
      duration_minutes: sd.duration_minutes,
      notes: sd.notes
    }))

    await supabase.from('session_drills').insert(drillsToInsert)

    navigate(`/session/${newSession.id}`)
  }

  if (loading) {
    return (
      <div className="session-output">
        <nav className="dashboard-nav">
          <div className="nav-content">
            <Link to="/" className="logo">POACHED</Link>
            <div className="nav-links">
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
            </div>
          </div>
        </nav>
        <div className="loading">Loading session...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="session-output">
      <nav className="dashboard-nav">
        <div className="nav-content">
          <Link to="/" className="logo">POACHED</Link>
          <div className="nav-links">
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
            <Link to="/profile" className="nav-link">Profile</Link>
            <button onClick={signOut} className="nav-link">Sign Out</button>
          </div>
        </div>
      </nav>

      <div className="session-content">
        <div className="session-top">
          <div>
            <h1>{session.name}</h1>
            <div className="session-info">
              <span className={`badge ${session.intensity}`}>{session.intensity}</span>
              <span className="info-text">{session.session_length} minutes</span>
              <span className="info-text">{session.environment}</span>
              {session.surface && <span className="info-text">{session.surface}</span>}
            </div>
          </div>
          <div className="session-actions">
            <button onClick={duplicateSession} className="btn-secondary">
              Duplicate
            </button>
            <button onClick={deleteSession} className="btn-danger">
              Delete
            </button>
          </div>
        </div>

        <div className="time-breakdown">
          <div className="breakdown-header">Session Timeline</div>
          <div className="breakdown-bar">
            {session.drills.map((sd, index) => (
              <div
                key={sd.id}
                className="breakdown-segment"
                style={{
                  width: `${(sd.duration_minutes / session.session_length) * 100}%`,
                  backgroundColor: `hsl(${(index * 360) / session.drills.length}, 70%, 50%)`
                }}
                title={`${sd.drill.name} - ${sd.duration_minutes} min`}
              />
            ))}
          </div>
        </div>

        <div className="drills-list">
          {session.drills.map((sd, index) => (
            <div key={sd.id} className="drill-card">
              <div className="drill-header">
                <div className="drill-number">{index + 1}</div>
                <div className="drill-title-section">
                  <h3>{sd.drill.name}</h3>
                  <span className="drill-category">{sd.drill.category}</span>
                </div>
                <button
                  onClick={() => toggleFavorite(sd.drill.id)}
                  className={`favorite-btn ${favoriteDrills.has(sd.drill.id) ? 'active' : ''}`}
                >
                  {favoriteDrills.has(sd.drill.id) ? '★' : '☆'}
                </button>
              </div>

              <p className="drill-description">{sd.drill.description}</p>

              <div className="drill-meta">
                <div className="meta-badge">
                  <span className="meta-icon">⏱️</span>
                  {sd.duration_minutes} min
                </div>
                <div className={`meta-badge intensity-${sd.drill.intensity_level}`}>
                  <span className="meta-icon">🔥</span>
                  {sd.drill.intensity_level}
                </div>
                <div className="meta-badge">
                  <span className="meta-icon">📊</span>
                  UTR {sd.drill.min_utr} - {sd.drill.max_utr}
                </div>
              </div>

              <div className="drill-section">
                <h4>Instructions</h4>
                <ol className="instructions-list">
                  {(sd.drill.instructions as unknown as string[]).map((instruction, i) => (
                    <li key={i}>{instruction}</li>
                  ))}
                </ol>
              </div>

              <div className="drill-section">
                <h4>Coaching Cues</h4>
                <ul className="cues-list">
                  {(sd.drill.coaching_cues as unknown as string[]).map((cue, i) => (
                    <li key={i}>{cue}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
