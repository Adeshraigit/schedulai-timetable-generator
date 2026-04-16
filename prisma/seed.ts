import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@schedulai.com' },
    update: {},
    create: {
      email: 'admin@schedulai.com',
      name: 'Admin User',
      password: '$2b$10$dummyhashedpassword', // In production, use bcrypt
      role: 'ADMIN',
    },
  });

  // Create department
  const csDepartment = await prisma.department.upsert({
    where: { code: 'CS' },
    update: {},
    create: {
      name: 'Computer Science',
      code: 'CS',
    },
  });

  // Create coordinator user
  const coordinator = await prisma.user.upsert({
    where: { email: 'coordinator@cs.edu' },
    update: {},
    create: {
      email: 'coordinator@cs.edu',
      name: 'John Smith',
      password: '$2b$10$dummyhashedpassword',
      role: 'COORDINATOR',
      departmentId: csDepartment.id,
    },
  });

  // Create professors
  const professors = await Promise.all([
    prisma.professor.upsert({
      where: { email: 'prof.johnson@cs.edu' },
      update: {},
      create: {
        name: 'Dr. Sarah Johnson',
        email: 'prof.johnson@cs.edu',
        employeeId: 'EMP001',
        maxHoursPerDay: 6,
        maxHoursPerWeek: 18,
        departmentId: csDepartment.id,
      },
    }),
    prisma.professor.upsert({
      where: { email: 'prof.williams@cs.edu' },
      update: {},
      create: {
        name: 'Dr. Michael Williams',
        email: 'prof.williams@cs.edu',
        employeeId: 'EMP002',
        maxHoursPerDay: 5,
        maxHoursPerWeek: 16,
        departmentId: csDepartment.id,
      },
    }),
    prisma.professor.upsert({
      where: { email: 'prof.davis@cs.edu' },
      update: {},
      create: {
        name: 'Dr. Emily Davis',
        email: 'prof.davis@cs.edu',
        employeeId: 'EMP003',
        maxHoursPerDay: 6,
        maxHoursPerWeek: 20,
        departmentId: csDepartment.id,
      },
    }),
    prisma.professor.upsert({
      where: { email: 'prof.brown@cs.edu' },
      update: {},
      create: {
        name: 'Dr. Robert Brown',
        email: 'prof.brown@cs.edu',
        employeeId: 'EMP004',
        maxHoursPerDay: 5,
        maxHoursPerWeek: 15,
        unavailableDays: JSON.stringify([4]), // Not available on Friday
        departmentId: csDepartment.id,
      },
    }),
  ]);

  // Create rooms
  const rooms = await Promise.all([
    prisma.room.upsert({
      where: { code: 'LH-101' },
      update: {},
      create: {
        name: 'Lecture Hall 101',
        code: 'LH-101',
        capacity: 120,
        type: 'LECTURE_HALL',
        hasProjector: true,
        hasAC: true,
        building: 'Main Building',
        floor: 1,
        departmentId: csDepartment.id,
      },
    }),
    prisma.room.upsert({
      where: { code: 'LH-102' },
      update: {},
      create: {
        name: 'Lecture Hall 102',
        code: 'LH-102',
        capacity: 80,
        type: 'LECTURE_HALL',
        hasProjector: true,
        hasAC: true,
        building: 'Main Building',
        floor: 1,
        departmentId: csDepartment.id,
      },
    }),
    prisma.room.upsert({
      where: { code: 'LAB-201' },
      update: {},
      create: {
        name: 'Computer Lab 201',
        code: 'LAB-201',
        capacity: 40,
        type: 'COMPUTER_LAB',
        hasProjector: true,
        hasAC: true,
        hasComputers: true,
        building: 'Tech Building',
        floor: 2,
        departmentId: csDepartment.id,
      },
    }),
    prisma.room.upsert({
      where: { code: 'LAB-202' },
      update: {},
      create: {
        name: 'Computer Lab 202',
        code: 'LAB-202',
        capacity: 35,
        type: 'COMPUTER_LAB',
        hasProjector: true,
        hasAC: true,
        hasComputers: true,
        building: 'Tech Building',
        floor: 2,
        departmentId: csDepartment.id,
      },
    }),
    prisma.room.upsert({
      where: { code: 'SR-301' },
      update: {},
      create: {
        name: 'Seminar Room 301',
        code: 'SR-301',
        capacity: 30,
        type: 'SEMINAR_ROOM',
        hasProjector: true,
        hasAC: true,
        building: 'Main Building',
        floor: 3,
        departmentId: csDepartment.id,
      },
    }),
  ]);

  // Create courses
  const courses = await Promise.all([
    prisma.course.upsert({
      where: { code: 'CS101' },
      update: {},
      create: {
        name: 'Introduction to Programming',
        code: 'CS101',
        credits: 4,
        lectureHours: 3,
        labHours: 2,
        semester: 1,
        requiresLab: true,
        departmentId: csDepartment.id,
      },
    }),
    prisma.course.upsert({
      where: { code: 'CS102' },
      update: {},
      create: {
        name: 'Data Structures',
        code: 'CS102',
        credits: 4,
        lectureHours: 3,
        labHours: 1,
        semester: 2,
        requiresLab: true,
        departmentId: csDepartment.id,
      },
    }),
    prisma.course.upsert({
      where: { code: 'CS201' },
      update: {},
      create: {
        name: 'Algorithms',
        code: 'CS201',
        credits: 3,
        lectureHours: 3,
        labHours: 0,
        semester: 3,
        departmentId: csDepartment.id,
      },
    }),
    prisma.course.upsert({
      where: { code: 'CS202' },
      update: {},
      create: {
        name: 'Database Systems',
        code: 'CS202',
        credits: 4,
        lectureHours: 3,
        labHours: 2,
        semester: 3,
        requiresLab: true,
        departmentId: csDepartment.id,
      },
    }),
    prisma.course.upsert({
      where: { code: 'CS301' },
      update: {},
      create: {
        name: 'Operating Systems',
        code: 'CS301',
        credits: 4,
        lectureHours: 3,
        labHours: 1,
        semester: 5,
        requiresLab: true,
        departmentId: csDepartment.id,
      },
    }),
    prisma.course.upsert({
      where: { code: 'CS302' },
      update: {},
      create: {
        name: 'Computer Networks',
        code: 'CS302',
        credits: 3,
        lectureHours: 3,
        labHours: 1,
        semester: 5,
        requiresLab: true,
        departmentId: csDepartment.id,
      },
    }),
  ]);

  // Create course assignments (professor-course mapping)
  await Promise.all([
    prisma.courseAssignment.upsert({
      where: {
        courseId_professorId: {
          courseId: courses[0].id,
          professorId: professors[0].id,
        },
      },
      update: {},
      create: {
        courseId: courses[0].id,
        professorId: professors[0].id,
      },
    }),
    prisma.courseAssignment.upsert({
      where: {
        courseId_professorId: {
          courseId: courses[1].id,
          professorId: professors[0].id,
        },
      },
      update: {},
      create: {
        courseId: courses[1].id,
        professorId: professors[0].id,
      },
    }),
    prisma.courseAssignment.upsert({
      where: {
        courseId_professorId: {
          courseId: courses[2].id,
          professorId: professors[1].id,
        },
      },
      update: {},
      create: {
        courseId: courses[2].id,
        professorId: professors[1].id,
      },
    }),
    prisma.courseAssignment.upsert({
      where: {
        courseId_professorId: {
          courseId: courses[3].id,
          professorId: professors[2].id,
        },
      },
      update: {},
      create: {
        courseId: courses[3].id,
        professorId: professors[2].id,
      },
    }),
    prisma.courseAssignment.upsert({
      where: {
        courseId_professorId: {
          courseId: courses[4].id,
          professorId: professors[3].id,
        },
      },
      update: {},
      create: {
        courseId: courses[4].id,
        professorId: professors[3].id,
      },
    }),
    prisma.courseAssignment.upsert({
      where: {
        courseId_professorId: {
          courseId: courses[5].id,
          professorId: professors[1].id,
        },
      },
      update: {},
      create: {
        courseId: courses[5].id,
        professorId: professors[1].id,
      },
    }),
  ]);

  // Create student groups
  const studentGroups = await Promise.all([
    prisma.studentGroup.upsert({
      where: { code: 'CS-S1-A' },
      update: {},
      create: {
        name: 'CS Semester 1 - Section A',
        code: 'CS-S1-A',
        semester: 1,
        studentCount: 60,
        academicYear: '2025-2026',
      },
    }),
    prisma.studentGroup.upsert({
      where: { code: 'CS-S2-A' },
      update: {},
      create: {
        name: 'CS Semester 2 - Section A',
        code: 'CS-S2-A',
        semester: 2,
        studentCount: 55,
        academicYear: '2025-2026',
      },
    }),
    prisma.studentGroup.upsert({
      where: { code: 'CS-S3-A' },
      update: {},
      create: {
        name: 'CS Semester 3 - Section A',
        code: 'CS-S3-A',
        semester: 3,
        studentCount: 50,
        academicYear: '2025-2026',
      },
    }),
    prisma.studentGroup.upsert({
      where: { code: 'CS-S5-A' },
      update: {},
      create: {
        name: 'CS Semester 5 - Section A',
        code: 'CS-S5-A',
        semester: 5,
        studentCount: 45,
        academicYear: '2025-2026',
      },
    }),
  ]);

  // Create time slot configurations
  const timeSlots = [
    { name: 'Period 1', startTime: '09:00', endTime: '10:00', duration: 60, order: 1 },
    { name: 'Period 2', startTime: '10:00', endTime: '11:00', duration: 60, order: 2 },
    { name: 'Period 3', startTime: '11:00', endTime: '12:00', duration: 60, order: 3 },
    { name: 'Lunch Break', startTime: '12:00', endTime: '13:00', duration: 60, order: 4, isBreak: true },
    { name: 'Period 4', startTime: '13:00', endTime: '14:00', duration: 60, order: 5 },
    { name: 'Period 5', startTime: '14:00', endTime: '15:00', duration: 60, order: 6 },
    { name: 'Period 6', startTime: '15:00', endTime: '16:00', duration: 60, order: 7 },
    { name: 'Period 7', startTime: '16:00', endTime: '17:00', duration: 60, order: 8 },
  ];

  for (const slot of timeSlots) {
    await prisma.timeSlotConfig.upsert({
      where: { id: `slot-${slot.order}` },
      update: slot,
      create: {
        id: `slot-${slot.order}`,
        ...slot,
        isBreak: slot.isBreak || false,
      },
    });
  }

  // Create sample constraints
  await prisma.constraint.upsert({
    where: { id: 'constraint-lunch' },
    update: {},
    create: {
      id: 'constraint-lunch',
      type: 'LUNCH_BREAK_REQUIRED',
      priority: 'HIGH',
      isHard: false,
      description: 'No classes during lunch break (12:00-13:00)',
      parameters: JSON.stringify({ startTime: '12:00', endTime: '13:00' }),
      createdById: adminUser.id,
    },
  });

  await prisma.constraint.upsert({
    where: { id: 'constraint-distribution' },
    update: {},
    create: {
      id: 'constraint-distribution',
      type: 'EVEN_DISTRIBUTION',
      priority: 'MEDIUM',
      isHard: false,
      description: 'Distribute classes evenly across the week',
      parameters: JSON.stringify({ maxDeviation: 2 }),
      createdById: adminUser.id,
    },
  });

  console.log('Seeding completed!');
  console.log({
    users: [adminUser.email, coordinator.email],
    department: csDepartment.name,
    professors: professors.length,
    rooms: rooms.length,
    courses: courses.length,
    studentGroups: studentGroups.length,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
