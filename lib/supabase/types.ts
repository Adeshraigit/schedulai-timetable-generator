export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string
          role: string
          department_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          role?: string
          department_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: string
          department_id?: string | null
          updated_at?: string
        }
      }
      departments: {
        Row: {
          id: string
          name: string
          code: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          code: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          code?: string
          updated_at?: string
        }
      }
      courses: {
        Row: {
          id: string
          name: string
          code: string
          credits: number
          lecture_hours: number
          lab_hours: number
          tutorial_hours: number
          semester: number
          requires_lab: boolean
          requires_special: boolean
          special_room_type: string | null
          department_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          code: string
          credits?: number
          lecture_hours?: number
          lab_hours?: number
          tutorial_hours?: number
          semester: number
          requires_lab?: boolean
          requires_special?: boolean
          special_room_type?: string | null
          department_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          code?: string
          credits?: number
          lecture_hours?: number
          lab_hours?: number
          tutorial_hours?: number
          semester?: number
          requires_lab?: boolean
          requires_special?: boolean
          special_room_type?: string | null
          department_id?: string
          updated_at?: string
        }
      }
      professors: {
        Row: {
          id: string
          user_id: string | null
          name: string
          email: string
          employee_id: string
          max_hours_per_day: number
          max_hours_per_week: number
          preferred_days: Json | null
          unavailable_days: Json | null
          preferred_time_slots: Json | null
          department_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          email: string
          employee_id: string
          max_hours_per_day?: number
          max_hours_per_week?: number
          preferred_days?: Json | null
          unavailable_days?: Json | null
          preferred_time_slots?: Json | null
          department_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string | null
          name?: string
          email?: string
          employee_id?: string
          max_hours_per_day?: number
          max_hours_per_week?: number
          preferred_days?: Json | null
          unavailable_days?: Json | null
          preferred_time_slots?: Json | null
          department_id?: string
          updated_at?: string
        }
      }
      rooms: {
        Row: {
          id: string
          name: string
          code: string
          capacity: number
          type: string
          has_projector: boolean
          has_ac: boolean
          has_computers: boolean
          special_equipment: Json | null
          building: string | null
          floor: number | null
          is_available: boolean
          department_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          code: string
          capacity: number
          type?: string
          has_projector?: boolean
          has_ac?: boolean
          has_computers?: boolean
          special_equipment?: Json | null
          building?: string | null
          floor?: number | null
          is_available?: boolean
          department_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          code?: string
          capacity?: number
          type?: string
          has_projector?: boolean
          has_ac?: boolean
          has_computers?: boolean
          special_equipment?: Json | null
          building?: string | null
          floor?: number | null
          is_available?: boolean
          department_id?: string
          updated_at?: string
        }
      }
      student_groups: {
        Row: {
          id: string
          name: string
          code: string
          semester: number
          student_count: number
          academic_year: string
          department_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          code: string
          semester: number
          student_count: number
          academic_year: string
          department_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          code?: string
          semester?: number
          student_count?: number
          academic_year?: string
          department_id?: string
          updated_at?: string
        }
      }
      timetables: {
        Row: {
          id: string
          name: string
          semester: string
          academic_year: string
          status: string
          is_published: boolean
          version: number
          score: number | null
          conflicts: number
          department_id: string
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          semester: string
          academic_year: string
          status?: string
          is_published?: boolean
          version?: number
          score?: number | null
          conflicts?: number
          department_id: string
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          semester?: string
          academic_year?: string
          status?: string
          is_published?: boolean
          version?: number
          score?: number | null
          conflicts?: number
          department_id?: string
          updated_at?: string
        }
      }
      timetable_slots: {
        Row: {
          id: string
          timetable_id: string
          course_id: string
          professor_id: string
          room_id: string
          student_group_id: string
          day_of_week: number
          start_time: string
          end_time: string
          slot_type: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          timetable_id: string
          course_id: string
          professor_id: string
          room_id: string
          student_group_id: string
          day_of_week: number
          start_time: string
          end_time: string
          slot_type?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          timetable_id?: string
          course_id?: string
          professor_id?: string
          room_id?: string
          student_group_id?: string
          day_of_week?: number
          start_time?: string
          end_time?: string
          slot_type?: string
          updated_at?: string
        }
      }
      constraints: {
        Row: {
          id: string
          type: string
          priority: string
          is_hard: boolean
          description: string | null
          parameters: Json
          is_active: boolean
          created_by: string
          course_id: string | null
          professor_id: string | null
          room_id: string | null
          student_group_id: string | null
          department_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          type: string
          priority?: string
          is_hard?: boolean
          description?: string | null
          parameters: Json
          is_active?: boolean
          created_by: string
          course_id?: string | null
          professor_id?: string | null
          room_id?: string | null
          student_group_id?: string | null
          department_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          type?: string
          priority?: string
          is_hard?: boolean
          description?: string | null
          parameters?: Json
          is_active?: boolean
          course_id?: string | null
          professor_id?: string | null
          room_id?: string | null
          student_group_id?: string | null
          department_id?: string | null
          updated_at?: string
        }
      }
    }
  }
}
