// Constraint validation and scoring for timetable generation

import type {
  ScheduleSlot,
  Constraint,
  ConflictInfo,
  ProfessorInfo,
  RoomInfo,
  StudentGroupInfo,
  GenerationConfig,
} from './types';

interface ValidationContext {
  professors: Map<string, ProfessorInfo>;
  rooms: Map<string, RoomInfo>;
  studentGroups: Map<string, StudentGroupInfo>;
  constraints: Constraint[];
  config: GenerationConfig;
}

interface ValidationResult {
  isValid: boolean;
  hardViolations: number;
  softViolations: number;
  conflicts: ConflictInfo[];
  score: number;
}

// Check for professor time conflicts
function checkProfessorClashes(schedule: ScheduleSlot[]): ConflictInfo[] {
  const conflicts: ConflictInfo[] = [];
  const professorSlots = new Map<string, ScheduleSlot[]>();

  // Group slots by professor
  for (const slot of schedule) {
    const key = slot.professorId;
    if (!professorSlots.has(key)) {
      professorSlots.set(key, []);
    }
    professorSlots.get(key)!.push(slot);
  }

  // Check for overlapping times for each professor
  for (const [professorId, slots] of professorSlots) {
    for (let i = 0; i < slots.length; i++) {
      for (let j = i + 1; j < slots.length; j++) {
        if (
          slots[i].timeSlot.dayOfWeek === slots[j].timeSlot.dayOfWeek &&
          slots[i].timeSlot.startTime === slots[j].timeSlot.startTime
        ) {
          conflicts.push({
            type: 'PROFESSOR_CLASH',
            description: `Professor ${professorId} is scheduled for multiple classes at the same time`,
            slots: [slots[i], slots[j]],
            severity: 'HARD',
          });
        }
      }
    }
  }

  return conflicts;
}

// Check for room conflicts
function checkRoomClashes(schedule: ScheduleSlot[]): ConflictInfo[] {
  const conflicts: ConflictInfo[] = [];
  const roomSlots = new Map<string, ScheduleSlot[]>();

  // Group slots by room
  for (const slot of schedule) {
    const key = slot.roomId;
    if (!roomSlots.has(key)) {
      roomSlots.set(key, []);
    }
    roomSlots.get(key)!.push(slot);
  }

  // Check for overlapping times for each room
  for (const [roomId, slots] of roomSlots) {
    for (let i = 0; i < slots.length; i++) {
      for (let j = i + 1; j < slots.length; j++) {
        if (
          slots[i].timeSlot.dayOfWeek === slots[j].timeSlot.dayOfWeek &&
          slots[i].timeSlot.startTime === slots[j].timeSlot.startTime
        ) {
          conflicts.push({
            type: 'ROOM_CLASH',
            description: `Room ${roomId} is double-booked at the same time`,
            slots: [slots[i], slots[j]],
            severity: 'HARD',
          });
        }
      }
    }
  }

  return conflicts;
}

// Check for student group conflicts
function checkStudentGroupClashes(schedule: ScheduleSlot[]): ConflictInfo[] {
  const conflicts: ConflictInfo[] = [];
  const groupSlots = new Map<string, ScheduleSlot[]>();

  // Group slots by student group
  for (const slot of schedule) {
    const key = slot.studentGroupId;
    if (!groupSlots.has(key)) {
      groupSlots.set(key, []);
    }
    groupSlots.get(key)!.push(slot);
  }

  // Check for overlapping times for each student group
  for (const [groupId, slots] of groupSlots) {
    for (let i = 0; i < slots.length; i++) {
      for (let j = i + 1; j < slots.length; j++) {
        if (
          slots[i].timeSlot.dayOfWeek === slots[j].timeSlot.dayOfWeek &&
          slots[i].timeSlot.startTime === slots[j].timeSlot.startTime
        ) {
          conflicts.push({
            type: 'STUDENT_GROUP_CLASH',
            description: `Student group ${groupId} has multiple classes at the same time`,
            slots: [slots[i], slots[j]],
            severity: 'HARD',
          });
        }
      }
    }
  }

  return conflicts;
}

// Check professor workload constraints
function checkProfessorWorkload(
  schedule: ScheduleSlot[],
  professors: Map<string, ProfessorInfo>
): ConflictInfo[] {
  const conflicts: ConflictInfo[] = [];
  const professorDailyHours = new Map<string, Map<number, number>>();
  const professorWeeklyHours = new Map<string, number>();

  for (const slot of schedule) {
    const profId = slot.professorId;
    const day = slot.timeSlot.dayOfWeek;

    // Daily hours
    if (!professorDailyHours.has(profId)) {
      professorDailyHours.set(profId, new Map());
    }
    const dailyMap = professorDailyHours.get(profId)!;
    dailyMap.set(day, (dailyMap.get(day) || 0) + 1);

    // Weekly hours
    professorWeeklyHours.set(profId, (professorWeeklyHours.get(profId) || 0) + 1);
  }

  // Check against limits
  for (const [profId, dailyMap] of professorDailyHours) {
    const prof = professors.get(profId);
    if (!prof) continue;

    for (const [day, hours] of dailyMap) {
      if (hours > prof.maxHoursPerDay) {
        conflicts.push({
          type: 'CONSTRAINT_VIOLATION',
          description: `Professor ${prof.name} exceeds max daily hours (${hours}/${prof.maxHoursPerDay}) on day ${day}`,
          slots: schedule.filter(s => s.professorId === profId && s.timeSlot.dayOfWeek === day),
          severity: 'SOFT',
        });
      }
    }

    const weeklyHours = professorWeeklyHours.get(profId) || 0;
    if (weeklyHours > prof.maxHoursPerWeek) {
      conflicts.push({
        type: 'CONSTRAINT_VIOLATION',
        description: `Professor ${prof.name} exceeds max weekly hours (${weeklyHours}/${prof.maxHoursPerWeek})`,
        slots: schedule.filter(s => s.professorId === profId),
        severity: 'SOFT',
      });
    }
  }

  return conflicts;
}

// Check room capacity constraints
function checkRoomCapacity(
  schedule: ScheduleSlot[],
  rooms: Map<string, RoomInfo>,
  studentGroups: Map<string, StudentGroupInfo>
): ConflictInfo[] {
  const conflicts: ConflictInfo[] = [];

  for (const slot of schedule) {
    const room = rooms.get(slot.roomId);
    const group = studentGroups.get(slot.studentGroupId);

    if (room && group && group.studentCount > room.capacity) {
      conflicts.push({
        type: 'CONSTRAINT_VIOLATION',
        description: `Room ${room.name} (capacity: ${room.capacity}) is too small for ${group.name} (${group.studentCount} students)`,
        slots: [slot],
        severity: 'HARD',
      });
    }
  }

  return conflicts;
}

// Check custom constraints
function checkCustomConstraints(
  schedule: ScheduleSlot[],
  constraints: Constraint[],
  config: GenerationConfig
): ConflictInfo[] {
  const conflicts: ConflictInfo[] = [];

  for (const constraint of constraints) {
    if (!constraint.parameters) continue;

    const params = constraint.parameters as Record<string, unknown>;

    switch (constraint.type) {
      case 'NO_CLASSES_ON_DAY': {
        const day = params.day as number;
        const affectedSlots = schedule.filter(s => s.timeSlot.dayOfWeek === day);
        if (affectedSlots.length > 0) {
          conflicts.push({
            type: 'CONSTRAINT_VIOLATION',
            description: `Classes scheduled on restricted day ${day}`,
            slots: affectedSlots,
            severity: constraint.isHard ? 'HARD' : 'SOFT',
          });
        }
        break;
      }

      case 'AVOID_TIME_SLOT': {
        const avoidTime = params.time as string;
        const avoidDay = params.day as number | undefined;
        const affectedSlots = schedule.filter(
          s => s.timeSlot.startTime === avoidTime && (avoidDay === undefined || s.timeSlot.dayOfWeek === avoidDay)
        );
        if (affectedSlots.length > 0) {
          conflicts.push({
            type: 'CONSTRAINT_VIOLATION',
            description: `Classes scheduled at avoided time ${avoidTime}`,
            slots: affectedSlots,
            severity: constraint.isHard ? 'HARD' : 'SOFT',
          });
        }
        break;
      }

      case 'LUNCH_BREAK_REQUIRED': {
        const lunchStart = config.lunchBreakStart;
        const lunchSlots = schedule.filter(s => s.timeSlot.startTime === lunchStart);
        if (lunchSlots.length > 0) {
          conflicts.push({
            type: 'CONSTRAINT_VIOLATION',
            description: `Classes scheduled during lunch break`,
            slots: lunchSlots,
            severity: 'SOFT',
          });
        }
        break;
      }

      case 'NO_CONSECUTIVE_CLASSES': {
        if (constraint.professorId) {
          const profSlots = schedule
            .filter(s => s.professorId === constraint.professorId)
            .sort((a, b) => {
              if (a.timeSlot.dayOfWeek !== b.timeSlot.dayOfWeek) {
                return a.timeSlot.dayOfWeek - b.timeSlot.dayOfWeek;
              }
              return a.timeSlot.slotIndex - b.timeSlot.slotIndex;
            });

          for (let i = 0; i < profSlots.length - 1; i++) {
            if (
              profSlots[i].timeSlot.dayOfWeek === profSlots[i + 1].timeSlot.dayOfWeek &&
              profSlots[i + 1].timeSlot.slotIndex - profSlots[i].timeSlot.slotIndex === 1
            ) {
              conflicts.push({
                type: 'CONSTRAINT_VIOLATION',
                description: `Consecutive classes for professor ${constraint.professorId}`,
                slots: [profSlots[i], profSlots[i + 1]],
                severity: constraint.isHard ? 'HARD' : 'SOFT',
              });
            }
          }
        }
        break;
      }

      case 'EVEN_DISTRIBUTION': {
        // Check if classes are evenly distributed across days
        const dayCounts = new Map<number, number>();
        for (const slot of schedule) {
          dayCounts.set(slot.timeSlot.dayOfWeek, (dayCounts.get(slot.timeSlot.dayOfWeek) || 0) + 1);
        }
        const counts = Array.from(dayCounts.values());
        const avg = counts.reduce((a, b) => a + b, 0) / counts.length;
        const maxDeviation = Math.max(...counts.map(c => Math.abs(c - avg)));
        if (maxDeviation > 3) {
          conflicts.push({
            type: 'CONSTRAINT_VIOLATION',
            description: `Uneven distribution of classes across days (max deviation: ${maxDeviation.toFixed(1)})`,
            slots: [],
            severity: 'SOFT',
          });
        }
        break;
      }
    }
  }

  return conflicts;
}

// Main validation function
export function validateSchedule(
  schedule: ScheduleSlot[],
  context: ValidationContext
): ValidationResult {
  const allConflicts: ConflictInfo[] = [];

  // Check all constraint types
  allConflicts.push(...checkProfessorClashes(schedule));
  allConflicts.push(...checkRoomClashes(schedule));
  allConflicts.push(...checkStudentGroupClashes(schedule));
  allConflicts.push(...checkProfessorWorkload(schedule, context.professors));
  allConflicts.push(...checkRoomCapacity(schedule, context.rooms, context.studentGroups));
  allConflicts.push(...checkCustomConstraints(schedule, context.constraints, context.config));

  // Count violations
  const hardViolations = allConflicts.filter(c => c.severity === 'HARD').length;
  const softViolations = allConflicts.filter(c => c.severity === 'SOFT').length;

  // Calculate fitness score (higher is better)
  // Hard violations are heavily penalized
  const score = 1000 - (hardViolations * 100) - (softViolations * 10);

  return {
    isValid: hardViolations === 0,
    hardViolations,
    softViolations,
    conflicts: allConflicts,
    score: Math.max(0, score),
  };
}

// Calculate fitness for genetic algorithm
export function calculateFitness(
  schedule: ScheduleSlot[],
  context: ValidationContext
): number {
  const result = validateSchedule(schedule, context);
  return result.score;
}
