// Genetic Algorithm-based Timetable Generator

import type {
  ScheduleSlot,
  CourseRequirement,
  RoomInfo,
  ProfessorInfo,
  StudentGroupInfo,
  Constraint,
  GenerationConfig,
  GenerationResult,
  ScheduleState,
  TimeSlot,
} from './types';
import { validateSchedule } from './constraints';
import { DEFAULT_CONFIG } from './types';

interface GeneratorContext {
  courses: CourseRequirement[];
  rooms: Map<string, RoomInfo>;
  professors: Map<string, ProfessorInfo>;
  studentGroups: Map<string, StudentGroupInfo>;
  constraints: Constraint[];
  config: GenerationConfig;
  allTimeSlots: TimeSlot[];
}

// Generate all possible time slots for the week
function generateAllTimeSlots(config: GenerationConfig): TimeSlot[] {
  const slots: TimeSlot[] = [];
  
  for (const day of config.workingDays) {
    for (let i = 0; i < config.timeSlots.length; i++) {
      const baseSlot = config.timeSlots[i];
      slots.push({
        ...baseSlot,
        dayOfWeek: day,
        slotIndex: i,
      });
    }
  }
  
  return slots;
}

// Check if a time slot is during lunch break
function isLunchBreak(slot: TimeSlot, config: GenerationConfig): boolean {
  return slot.startTime >= config.lunchBreakStart && slot.startTime < config.lunchBreakEnd;
}

// Find available rooms for a given time slot and requirements
function findAvailableRooms(
  timeSlot: TimeSlot,
  requirement: CourseRequirement,
  schedule: ScheduleSlot[],
  rooms: Map<string, RoomInfo>,
  studentGroups: Map<string, StudentGroupInfo>
): RoomInfo[] {
  const occupiedRoomIds = new Set(
    schedule
      .filter(s => 
        s.timeSlot.dayOfWeek === timeSlot.dayOfWeek && 
        s.timeSlot.startTime === timeSlot.startTime
      )
      .map(s => s.roomId)
  );

  const studentGroup = studentGroups.get(requirement.studentGroupId);
  const requiredCapacity = studentGroup?.studentCount || 30;

  return Array.from(rooms.values()).filter(room => {
    // Not already occupied
    if (occupiedRoomIds.has(room.id)) return false;
    
    // Has sufficient capacity
    if (room.capacity < requiredCapacity) return false;
    
    // Matches room type requirement
    if (requirement.requiresLab && room.type !== 'COMPUTER_LAB' && room.type !== 'PHYSICS_LAB') {
      return false;
    }
    
    if (requirement.specialRoomType) {
      const roomTypeMap: Record<string, string[]> = {
        'computer_lab': ['COMPUTER_LAB'],
        'physics_lab': ['PHYSICS_LAB'],
        'chemistry_lab': ['CHEMISTRY_LAB'],
        'workshop': ['WORKSHOP'],
      };
      const requiredTypes = roomTypeMap[requirement.specialRoomType] || [];
      if (requiredTypes.length > 0 && !requiredTypes.includes(room.type)) {
        return false;
      }
    }
    
    return true;
  });
}

// Check if professor is available at a given time slot
function isProfessorAvailable(
  professorId: string,
  timeSlot: TimeSlot,
  schedule: ScheduleSlot[],
  professors: Map<string, ProfessorInfo>
): boolean {
  // Check if already teaching at this time
  const isOccupied = schedule.some(
    s => s.professorId === professorId &&
         s.timeSlot.dayOfWeek === timeSlot.dayOfWeek &&
         s.timeSlot.startTime === timeSlot.startTime
  );
  if (isOccupied) return false;

  const professor = professors.get(professorId);
  if (!professor) return true;

  // Check unavailable days
  if (professor.unavailableDays.includes(timeSlot.dayOfWeek)) {
    return false;
  }

  return true;
}

// Check if student group is available at a given time slot
function isStudentGroupAvailable(
  studentGroupId: string,
  timeSlot: TimeSlot,
  schedule: ScheduleSlot[]
): boolean {
  return !schedule.some(
    s => s.studentGroupId === studentGroupId &&
         s.timeSlot.dayOfWeek === timeSlot.dayOfWeek &&
         s.timeSlot.startTime === timeSlot.startTime
  );
}

// Generate initial random schedule
function generateRandomSchedule(context: GeneratorContext): ScheduleSlot[] {
  const schedule: ScheduleSlot[] = [];
  const { courses, rooms, professors, studentGroups, config, allTimeSlots } = context;

  // Filter out lunch break slots
  const availableSlots = allTimeSlots.filter(slot => !isLunchBreak(slot, config));

  for (const course of courses) {
    // Calculate total slots needed
    const lectureSlots = course.lectureHours;
    const labSlots = course.labHours;
    const tutorialSlots = course.tutorialHours;

    // Assign lecture slots
    for (let i = 0; i < lectureSlots; i++) {
      const assigned = tryAssignSlot(
        course,
        'LECTURE',
        availableSlots,
        schedule,
        rooms,
        professors,
        studentGroups
      );
      if (assigned) {
        schedule.push(assigned);
      }
    }

    // Assign lab slots
    for (let i = 0; i < labSlots; i++) {
      const assigned = tryAssignSlot(
        course,
        'LAB',
        availableSlots,
        schedule,
        rooms,
        professors,
        studentGroups
      );
      if (assigned) {
        schedule.push(assigned);
      }
    }

    // Assign tutorial slots
    for (let i = 0; i < tutorialSlots; i++) {
      const assigned = tryAssignSlot(
        course,
        'TUTORIAL',
        availableSlots,
        schedule,
        rooms,
        professors,
        studentGroups
      );
      if (assigned) {
        schedule.push(assigned);
      }
    }
  }

  return schedule;
}

// Try to assign a slot for a course
function tryAssignSlot(
  course: CourseRequirement,
  slotType: 'LECTURE' | 'LAB' | 'TUTORIAL' | 'SEMINAR',
  availableSlots: TimeSlot[],
  currentSchedule: ScheduleSlot[],
  rooms: Map<string, RoomInfo>,
  professors: Map<string, ProfessorInfo>,
  studentGroups: Map<string, StudentGroupInfo>
): ScheduleSlot | null {
  // Shuffle available slots for randomness
  const shuffledSlots = [...availableSlots].sort(() => Math.random() - 0.5);

  for (const timeSlot of shuffledSlots) {
    // Check professor availability
    if (!isProfessorAvailable(course.professorId, timeSlot, currentSchedule, professors)) {
      continue;
    }

    // Check student group availability
    if (!isStudentGroupAvailable(course.studentGroupId, timeSlot, currentSchedule)) {
      continue;
    }

    // Find available rooms
    const availableRooms = findAvailableRooms(
      timeSlot,
      course,
      currentSchedule,
      rooms,
      studentGroups
    );

    if (availableRooms.length > 0) {
      // Pick a random room from available ones
      const room = availableRooms[Math.floor(Math.random() * availableRooms.length)];

      return {
        timeSlot,
        courseId: course.courseId,
        professorId: course.professorId,
        roomId: room.id,
        studentGroupId: course.studentGroupId,
        slotType,
      };
    }
  }

  return null;
}

// Crossover two parent schedules to create offspring
function crossover(parent1: ScheduleSlot[], parent2: ScheduleSlot[]): ScheduleSlot[] {
  // Single-point crossover
  const crossoverPoint = Math.floor(Math.random() * Math.min(parent1.length, parent2.length));
  const offspring = [
    ...parent1.slice(0, crossoverPoint),
    ...parent2.slice(crossoverPoint),
  ];
  
  return offspring;
}

// Mutate a schedule by randomly reassigning some slots
function mutate(
  schedule: ScheduleSlot[],
  context: GeneratorContext,
  mutationRate: number
): ScheduleSlot[] {
  const mutated = [...schedule];
  const { rooms, professors, studentGroups, config, allTimeSlots } = context;
  const availableSlots = allTimeSlots.filter(slot => !isLunchBreak(slot, config));

  for (let i = 0; i < mutated.length; i++) {
    if (Math.random() < mutationRate) {
      const slot = mutated[i];
      const scheduleWithoutSlot = mutated.filter((_, idx) => idx !== i);

      // Try to find a better time slot
      const shuffledSlots = [...availableSlots].sort(() => Math.random() - 0.5);
      
      for (const timeSlot of shuffledSlots.slice(0, 10)) { // Only check first 10 random slots
        if (!isProfessorAvailable(slot.professorId, timeSlot, scheduleWithoutSlot, professors)) {
          continue;
        }

        if (!isStudentGroupAvailable(slot.studentGroupId, timeSlot, scheduleWithoutSlot)) {
          continue;
        }

        const course: CourseRequirement = {
          courseId: slot.courseId,
          courseName: '',
          courseCode: '',
          professorId: slot.professorId,
          professorName: '',
          studentGroupId: slot.studentGroupId,
          lectureHours: 0,
          labHours: 0,
          tutorialHours: 0,
          requiresLab: slot.slotType === 'LAB',
          specialRoomType: null,
          semester: 1,
        };

        const availableRooms = findAvailableRooms(
          timeSlot,
          course,
          scheduleWithoutSlot,
          rooms,
          studentGroups
        );

        if (availableRooms.length > 0) {
          const room = availableRooms[Math.floor(Math.random() * availableRooms.length)];
          mutated[i] = {
            ...slot,
            timeSlot,
            roomId: room.id,
          };
          break;
        }
      }
    }
  }

  return mutated;
}

// Tournament selection
function tournamentSelect(population: ScheduleState[], tournamentSize: number): ScheduleState {
  const tournament: ScheduleState[] = [];
  
  for (let i = 0; i < tournamentSize; i++) {
    const randomIndex = Math.floor(Math.random() * population.length);
    tournament.push(population[randomIndex]);
  }
  
  return tournament.reduce((best, current) => 
    current.fitness > best.fitness ? current : best
  );
}

// Main genetic algorithm
export async function generateTimetable(
  courses: CourseRequirement[],
  roomsArray: RoomInfo[],
  professorsArray: ProfessorInfo[],
  studentGroupsArray: StudentGroupInfo[],
  constraints: Constraint[],
  config: GenerationConfig = DEFAULT_CONFIG,
  onProgress?: (iteration: number, bestScore: number) => void
): Promise<GenerationResult> {
  const startTime = Date.now();

  // Build lookup maps
  const rooms = new Map(roomsArray.map(r => [r.id, r]));
  const professors = new Map(professorsArray.map(p => [p.id, p]));
  const studentGroups = new Map(studentGroupsArray.map(g => [g.id, g]));
  const allTimeSlots = generateAllTimeSlots(config);

  const context: GeneratorContext = {
    courses,
    rooms,
    professors,
    studentGroups,
    constraints,
    config,
    allTimeSlots,
  };

  const validationContext = {
    professors,
    rooms,
    studentGroups,
    constraints,
    config,
  };

  // Initialize population
  let population: ScheduleState[] = [];
  
  for (let i = 0; i < config.populationSize; i++) {
    const schedule = generateRandomSchedule(context);
    const validation = validateSchedule(schedule, validationContext);
    population.push({
      slots: schedule,
      fitness: validation.score,
      hardViolations: validation.hardViolations,
      softViolations: validation.softViolations,
    });
  }

  // Sort by fitness (descending)
  population.sort((a, b) => b.fitness - a.fitness);

  let bestSolution = population[0];
  let stagnationCount = 0;
  const maxStagnation = 100;

  // Main evolution loop
  for (let iteration = 0; iteration < config.maxIterations; iteration++) {
    const newPopulation: ScheduleState[] = [];

    // Elitism: keep best solutions
    for (let i = 0; i < config.elitismCount; i++) {
      newPopulation.push(population[i]);
    }

    // Generate rest of new population
    while (newPopulation.length < config.populationSize) {
      // Selection
      const parent1 = tournamentSelect(population, 3);
      const parent2 = tournamentSelect(population, 3);

      let offspring: ScheduleSlot[];

      // Crossover
      if (Math.random() < config.crossoverRate) {
        offspring = crossover(parent1.slots, parent2.slots);
      } else {
        offspring = [...parent1.slots];
      }

      // Mutation
      offspring = mutate(offspring, context, config.mutationRate);

      // Evaluate
      const validation = validateSchedule(offspring, validationContext);
      newPopulation.push({
        slots: offspring,
        fitness: validation.score,
        hardViolations: validation.hardViolations,
        softViolations: validation.softViolations,
      });
    }

    // Sort by fitness
    population = newPopulation.sort((a, b) => b.fitness - a.fitness);

    // Track best solution
    if (population[0].fitness > bestSolution.fitness) {
      bestSolution = population[0];
      stagnationCount = 0;
    } else {
      stagnationCount++;
    }

    // Progress callback
    if (onProgress && iteration % 10 === 0) {
      onProgress(iteration, bestSolution.fitness);
    }

    // Early termination if perfect solution found or stagnation
    if (bestSolution.hardViolations === 0 && bestSolution.softViolations === 0) {
      break;
    }

    if (stagnationCount >= maxStagnation) {
      // Increase mutation rate to escape local optimum
      config.mutationRate = Math.min(0.5, config.mutationRate * 1.5);
      stagnationCount = 0;
    }
  }

  const finalValidation = validateSchedule(bestSolution.slots, validationContext);
  const generationTime = Date.now() - startTime;

  return {
    success: finalValidation.hardViolations === 0,
    schedule: bestSolution.slots,
    score: bestSolution.fitness,
    hardViolations: finalValidation.hardViolations,
    softViolations: finalValidation.softViolations,
    conflicts: finalValidation.conflicts,
    iterations: config.maxIterations,
    generationTime,
  };
}

// Greedy algorithm for simpler/faster generation
export function generateTimetableGreedy(
  courses: CourseRequirement[],
  roomsArray: RoomInfo[],
  professorsArray: ProfessorInfo[],
  studentGroupsArray: StudentGroupInfo[],
  constraints: Constraint[],
  config: GenerationConfig = DEFAULT_CONFIG
): GenerationResult {
  const startTime = Date.now();

  const rooms = new Map(roomsArray.map(r => [r.id, r]));
  const professors = new Map(professorsArray.map(p => [p.id, p]));
  const studentGroups = new Map(studentGroupsArray.map(g => [g.id, g]));
  const allTimeSlots = generateAllTimeSlots(config);

  const context: GeneratorContext = {
    courses,
    rooms,
    professors,
    studentGroups,
    constraints,
    config,
    allTimeSlots,
  };

  const schedule = generateRandomSchedule(context);

  const validationContext = {
    professors,
    rooms,
    studentGroups,
    constraints,
    config,
  };

  const validation = validateSchedule(schedule, validationContext);
  const generationTime = Date.now() - startTime;

  return {
    success: validation.hardViolations === 0,
    schedule,
    score: validation.score,
    hardViolations: validation.hardViolations,
    softViolations: validation.softViolations,
    conflicts: validation.conflicts,
    iterations: 1,
    generationTime,
  };
}
