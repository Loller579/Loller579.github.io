import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase, Drill } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import './CreateSession.css'

const focusAreas = [
  'forehand',
  'backhand',
  'serve',
  'return',
  'volleys',
  'overheads',
  'movement',
  'patterns'
]

export default function CreateSession() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [generating, setGenerating] = useState(false)

  const [formData, setFormData] = useState({
    utr: 5.0,
    focusAreas: [] as string[],
    intensity: 'medium',
    sessionLength: 60,
    environment: 'alone',
    surface: ''
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
      setFormData(prev => ({ ...prev, utr: data.utr }))
    }
  }

  const toggleFocusArea = (area: string) => {
    setFormData(prev => ({
      ...prev,
      focusAreas: prev.focusAreas.includes(area)
        ? prev.focusAreas.filter(a => a !== area)
        : [...prev.focusAreas, area]
    }))
  }

  const generateSession = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.focusAreas.length === 0) {
      alert('Please select at least one focus area')
      return
    }

    setGenerating(true)

    try {
      const { data: allDrills, error: drillsError } = await supabase
        .from('drills')
        .select('*')
        .in('category', formData.focusAreas)
        .lte('min_utr', formData.utr)
        .gte('max_utr', formData.utr)
        .eq('intensity_level', formData.intensity)

      if (drillsError || !allDrills) {
        throw new Error('Failed to load drills')
      }

      const numDrills = formData.sessionLength <= 30 ? 3 :
                        formData.sessionLength <= 60 ? 5 : 7

      const selectedDrills: Drill[] = []
      const categoryCounts: { [key: string]: number } = {}

      formData.focusAreas.forEach(area => {
        categoryCounts[area] = 0
      })

      const shuffled = [...allDrills].sort(() => Math.random() - 0.5)

      for (const drill of shuffled) {
        if (selectedDrills.length >= numDrills) break

        const category = drill.category
        const maxPerCategory = Math.ceil(numDrills / formData.focusAreas.length)

        if (categoryCounts[category] < maxPerCategory) {
          selectedDrills.push(drill)
          categoryCounts[category]++
        }
      }

      while (selectedDrills.length < numDrills && shuffled.length > selectedDrills.length) {
        for (const drill of shuffled) {
          if (!selectedDrills.find(d => d.id === drill.id)) {
            selectedDrills.push(drill)
            break
          }
        }
      }

      const sessionName = `${formData.intensity.charAt(0).toUpperCase() + formData.intensity.slice(1)} ${formData.focusAreas.join(', ')} Session`

      const { data: session, error: sessionError } = await supabase
        .from('sessions')
        .insert({
          user_id: user!.id,
          name: sessionName,
          intensity: formData.intensity,
          session_length: formData.sessionLength,
          focus_areas: formData.focusAreas,
          environment: formData.environment,
          surface: formData.surface || null
        })
        .select()
        .single()

      if (sessionError || !session) {
        throw new Error('Failed to create session')
      }

      const drillDuration = Math.floor(formData.sessionLength / selectedDrills.length)

      const sessionDrills = selectedDrills.map((drill, index) => ({
        session_id: session.id,
        drill_id: drill.id,
        order_index: index + 1,
        duration_minutes: index === selectedDrills.length - 1
          ? formData.sessionLength - (drillDuration * (selectedDrills.length - 1))
          : drillDuration,
        notes: ''
      }))

      const { error: drillsInsertError } = await supabase
        .from('session_drills')
        .insert(sessionDrills)

      if (drillsInsertError) {
        throw new Error('Failed to add drills to session')
      }

      navigate(`/session/${session.id}`)
    } catch (error) {
      console.error('Error generating session:', error)
      alert('Failed to generate session. Please try again.')
      setGenerating(false)
    }
  }

  return (
    <div className="create-session">
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

      <div className="create-content">
        <h1>Generate Session</h1>
        <p className="subtitle">Customize your training based on goals and available time</p>

        <form onSubmit={generateSession} className="session-form">
          <div className="form-section">
            <label className="form-label">UTR Level</label>
            <select
              className="form-select"
              value={formData.utr}
              onChange={(e) => setFormData({ ...formData, utr: parseFloat(e.target.value) })}
            >
              {Array.from({ length: 156 }, (_, i) => (i + 10) / 10).map(level => (
                <option key={level} value={level}>{level.toFixed(1)}</option>
              ))}
            </select>
          </div>

          <div className="form-section">
            <label className="form-label">Focus Areas (select at least one)</label>
            <div className="focus-grid">
              {focusAreas.map(area => (
                <button
                  key={area}
                  type="button"
                  className={`focus-btn ${formData.focusAreas.includes(area) ? 'active' : ''}`}
                  onClick={() => toggleFocusArea(area)}
                >
                  {area.charAt(0).toUpperCase() + area.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="form-section">
            <label className="form-label">Intensity</label>
            <div className="intensity-options">
              {['light', 'medium', 'high'].map(level => (
                <button
                  key={level}
                  type="button"
                  className={`intensity-btn ${formData.intensity === level ? 'active' : ''}`}
                  onClick={() => setFormData({ ...formData, intensity: level })}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="form-section">
            <label className="form-label">
              Session Length: {formData.sessionLength} minutes
            </label>
            <input
              type="range"
              min="15"
              max="120"
              step="5"
              value={formData.sessionLength}
              onChange={(e) => setFormData({ ...formData, sessionLength: parseInt(e.target.value) })}
              className="slider"
            />
            <div className="slider-labels">
              <span>15 min</span>
              <span>120 min</span>
            </div>
          </div>

          <div className="form-section">
            <label className="form-label">Environment</label>
            <select
              className="form-select"
              value={formData.environment}
              onChange={(e) => setFormData({ ...formData, environment: e.target.value })}
            >
              <option value="alone">Alone</option>
              <option value="partner">With Partner</option>
              <option value="coach">With Coach</option>
            </select>
          </div>

          <div className="form-section">
            <label className="form-label">Surface (optional)</label>
            <select
              className="form-select"
              value={formData.surface}
              onChange={(e) => setFormData({ ...formData, surface: e.target.value })}
            >
              <option value="">Any</option>
              <option value="hard">Hard Court</option>
              <option value="clay">Clay Court</option>
              <option value="grass">Grass Court</option>
            </select>
          </div>

          <button type="submit" className="btn-generate" disabled={generating}>
            {generating ? 'Generating...' : 'Generate Session'}
          </button>
        </form>
      </div>
    </div>
  )
}
