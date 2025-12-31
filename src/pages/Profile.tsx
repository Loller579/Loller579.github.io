import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase, Profile as ProfileType } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import './Profile.css'

export default function Profile() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const [profile, setProfile] = useState<ProfileType>({
    id: '',
    utr: 5.0,
    handedness: 'right',
    playstyle: 'baseline',
    goals: '',
    created_at: '',
    updated_at: ''
  })

  useEffect(() => {
    loadProfile()
  }, [user])

  const loadProfile = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    if (!error && data) {
      setProfile(data)
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    setSuccessMessage('')

    const { error } = await supabase
      .from('profiles')
      .update({
        utr: profile.utr,
        handedness: profile.handedness,
        playstyle: profile.playstyle,
        goals: profile.goals,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    setSaving(false)

    if (error) {
      alert('Failed to update profile')
    } else {
      setSuccessMessage('Profile updated successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  if (loading) {
    return (
      <div className="profile-page">
        <nav className="dashboard-nav">
          <div className="nav-content">
            <Link to="/" className="logo">POACHED</Link>
          </div>
        </nav>
        <div className="loading">Loading profile...</div>
      </div>
    )
  }

  return (
    <div className="profile-page">
      <nav className="dashboard-nav">
        <div className="nav-content">
          <Link to="/" className="logo">POACHED</Link>
          <div className="nav-links">
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
            <Link to="/profile" className="nav-link active">Profile</Link>
            <button onClick={handleSignOut} className="nav-link">Sign Out</button>
          </div>
        </div>
      </nav>

      <div className="profile-content">
        <h1>Your Profile</h1>
        <p className="subtitle">Manage your tennis profile and training preferences</p>

        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={user?.email || ''}
                disabled
                className="disabled-input"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="utr">UTR Level</label>
              <select
                id="utr"
                value={profile.utr}
                onChange={(e) => setProfile({ ...profile, utr: parseFloat(e.target.value) })}
                className="form-input"
              >
                {Array.from({ length: 156 }, (_, i) => (i + 10) / 10).map(level => (
                  <option key={level} value={level}>{level.toFixed(1)}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="handedness">Handedness</label>
              <select
                id="handedness"
                value={profile.handedness}
                onChange={(e) => setProfile({ ...profile, handedness: e.target.value })}
                className="form-input"
              >
                <option value="right">Right-handed</option>
                <option value="left">Left-handed</option>
                <option value="ambidextrous">Ambidextrous</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="playstyle">Playing Style</label>
              <select
                id="playstyle"
                value={profile.playstyle}
                onChange={(e) => setProfile({ ...profile, playstyle: e.target.value })}
                className="form-input"
              >
                <option value="baseline">Aggressive Baseline</option>
                <option value="counterpuncher">Counterpuncher</option>
                <option value="serve-volley">Serve and Volley</option>
                <option value="all-court">All-Court</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="goals">Training Goals</label>
              <textarea
                id="goals"
                value={profile.goals}
                onChange={(e) => setProfile({ ...profile, goals: e.target.value })}
                placeholder="Describe your tennis goals and what you're working on..."
                rows={4}
                className="form-textarea"
              />
            </div>
          </div>

          <button type="submit" className="btn-save" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  )
}
