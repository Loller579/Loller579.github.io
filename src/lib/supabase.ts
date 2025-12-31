import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface Profile {
  id: string
  utr: number
  handedness: string
  playstyle: string
  goals: string
  created_at: string
  updated_at: string
}

export interface Drill {
  id: string
  name: string
  description: string
  category: string
  min_utr: number
  max_utr: number
  intensity_level: string
  default_duration_minutes: number
  instructions: string[]
  coaching_cues: string[]
  created_at: string
}

export interface Session {
  id: string
  user_id: string
  name: string
  intensity: string
  session_length: number
  focus_areas: string[]
  environment: string
  surface: string | null
  created_at: string
}

export interface SessionDrill {
  id: string
  session_id: string
  drill_id: string
  order_index: number
  duration_minutes: number
  notes: string
  drill?: Drill
}
