// Types for the timetable generation algorithm

export interface TimeSlot {
  dayOfWeek: number; // 0 = Monday, 4 = Friday
  startTime: string; // "09:00"
  endTime: string;   // "10:00"
  slotIndex: number; // Index within the day
}

export interface ScheduleSlot {
  timeSlot: TimeSlot;
  courseId: string;
  professorId: string;
  roomId: string;
  studentGroupId: string;
  slotType: 'LECTURE' | 'LAB' | 'TUTORIAL' | 'SEMINAR';
}

export interface CourseRequirement {
  courseId: string;
  courseName: string;
  courseCode: string;
  professorId: string;
  professorName: string;
  studentGroupId: string;
  lectureHours: number;
  labHours: number;
  tutorialHours: number;
  requiresLab: boolean;
  specialRoomType: string | null;
  semester: number;
}

export interface RoomInfo {
  id: string;
  name: string;
  code: string;
  capacity: number;
  type: string;
  hasComputers: boolean;
  specialEquipment: string[];
}

export interface ProfessorInfo {
  id: string;
  name: string;
  maxHoursPerDay: number;
  maxHoursPerWeek: number;
  preferredDays: number[];
  unavailableDays: number[];
  preferredTimeSlots: string[];
}

export interface StudentGroupInfo {
  id: string;
  name: string;
  code: string;
  semester: number;
  studentCount: number;
}

export interface Constraint {
  id: string;
  type: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  isHard: boolean;
  parameters: Record<string, unknown>;
  courseId?: string;
  professorId?: string;
  roomId?: string;
  studentGroupId?: string;
}

export interface GenerationConfig {
  workingDays: number[]; // [0, 1, 2, 3, 4] for Mon-Fri
  timeSlots: TimeSlot[];
  maxIterations: number;
  populationSize: number;
  mutationRate: number;
  crossoverRate: number;
  elitismCount: number;
  lunchBreakStart: string;
  lunchBreakEnd: string;
}

export interface ConflictInfo {
  type: 'PROFESSOR_CLASH' | 'ROOM_CLASH' | 'STUDENT_GROUP_CLASH' | 'CONSTRAINT_VIOLATION';
  description: string;
  slots: ScheduleSlot[];
  severity: 'HARD' | 'SOFT';
}

export interface GenerationResult {
  success: boolean;
  schedule: ScheduleSlot[];
  score: number;
  hardViolations: number;
  softViolations: number;
  conflicts: ConflictInfo[];
  iterations: number;
  generationTime: number;
}

export interface ScheduleState {
  slots: ScheduleSlot[];
  fitness: number;
  hardViolations: number;
  softViolations: number;
}

// Default time slots for a typical academic day
export const DEFAULT_TIME_SLOTS: TimeSlot[] = [
  { dayOfWeek: 0, startTime: '09:00', endTime: '10:00', slotIndex: 0 },
  { dayOfWeek: 0, startTime: '10:00', endTime: '11:00', slotIndex: 1 },
  { dayOfWeek: 0, startTime: '11:00', endTime: '12:00', slotIndex: 2 },
  { dayOfWeek: 0, startTime: '12:00', endTime: '13:00', slotIndex: 3 }, // Lunch
  { dayOfWeek: 0, startTime: '13:00', endTime: '14:00', slotIndex: 4 },
  { dayOfWeek: 0, startTime: '14:00', endTime: '15:00', slotIndex: 5 },
  { dayOfWeek: 0, startTime: '15:00', endTime: '16:00', slotIndex: 6 },
  { dayOfWeek: 0, startTime: '16:00', endTime: '17:00', slotIndex: 7 },
];

export const DEFAULT_CONFIG: GenerationConfig = {
  workingDays: [0, 1, 2, 3, 4], // Monday to Friday
  timeSlots: DEFAULT_TIME_SLOTS,
  maxIterations: 1000,
  populationSize: 50,
  mutationRate: 0.1,
  crossoverRate: 0.8,
  elitismCount: 5,
  lunchBreakStart: '12:00',
  lunchBreakEnd: '13:00',
};
