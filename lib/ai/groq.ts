import Groq from 'groq-sdk';
import type {
  Constraint,
  CourseRequirement,
  GenerationConfig,
  ProfessorInfo,
  RoomInfo,
  StudentGroupInfo,
} from '@/lib/timetable';

interface OptimizationInput {
  config: GenerationConfig;
  courses: CourseRequirement[];
  professors: ProfessorInfo[];
  rooms: RoomInfo[];
  studentGroups: StudentGroupInfo[];
  constraints: Constraint[];
  userPrompt?: string;
}

interface OptimizationOutput {
  configOverrides: Partial<GenerationConfig>;
  notes: string[];
}

const DEFAULT_MODEL = 'llama-3.3-70b-versatile';

function sanitizeConfig(overrides: unknown): Partial<GenerationConfig> {
  if (!overrides || typeof overrides !== 'object') {
    return {};
  }

  const candidate = overrides as Record<string, unknown>;
  const safe: Partial<GenerationConfig> = {};

  const numberKeys: Array<keyof Pick<GenerationConfig, 'maxIterations' | 'populationSize' | 'mutationRate' | 'crossoverRate' | 'elitismCount'>> = [
    'maxIterations',
    'populationSize',
    'mutationRate',
    'crossoverRate',
    'elitismCount',
  ];

  for (const key of numberKeys) {
    const value = candidate[key];
    if (typeof value === 'number' && Number.isFinite(value)) {
      safe[key] = value;
    }
  }

  if (Array.isArray(candidate.workingDays)) {
    const days = candidate.workingDays.filter((d) => typeof d === 'number' && d >= 0 && d <= 6);
    if (days.length > 0) {
      safe.workingDays = Array.from(new Set(days));
    }
  }

  if (typeof candidate.lunchBreakStart === 'string') {
    safe.lunchBreakStart = candidate.lunchBreakStart;
  }

  if (typeof candidate.lunchBreakEnd === 'string') {
    safe.lunchBreakEnd = candidate.lunchBreakEnd;
  }

  return safe;
}

export async function optimizeGenerationConfigWithGroq(
  input: OptimizationInput
): Promise<OptimizationOutput | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return null;
  }

  const groq = new Groq({ apiKey });
  const compactSummary = {
    currentConfig: input.config,
    totals: {
      courseRequirements: input.courses.length,
      professors: input.professors.length,
      rooms: input.rooms.length,
      studentGroups: input.studentGroups.length,
      constraints: input.constraints.length,
      labRequiredCourses: input.courses.filter((c) => c.requiresLab).length,
    },
    professorWorkload: input.professors.map((p) => ({
      id: p.id,
      maxHoursPerDay: p.maxHoursPerDay,
      maxHoursPerWeek: p.maxHoursPerWeek,
      unavailableDays: p.unavailableDays,
    })),
  };

  const systemPrompt = [
    'You optimize genetic algorithm parameters for university timetable scheduling.',
    'Return ONLY valid JSON with this exact shape:',
    '{"configOverrides": {"maxIterations"?: number, "populationSize"?: number, "mutationRate"?: number, "crossoverRate"?: number, "elitismCount"?: number, "workingDays"?: number[], "lunchBreakStart"?: string, "lunchBreakEnd"?: string}, "notes": string[]}',
    'Do not include markdown fences.',
    'Do not add extra keys.',
    'Keep values realistic and conservative for stable optimization.',
  ].join(' ');

  const userPrompt = [
    `Scheduling summary: ${JSON.stringify(compactSummary)}`,
    input.userPrompt ? `User preference: ${input.userPrompt}` : '',
  ]
    .filter(Boolean)
    .join('\n\n');

  const completion = await groq.chat.completions.create({
    model: process.env.GROQ_MODEL || DEFAULT_MODEL,
    temperature: 0.2,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) {
    return null;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  if (!parsed || typeof parsed !== 'object') {
    return null;
  }

  const data = parsed as { configOverrides?: unknown; notes?: unknown };
  const configOverrides = sanitizeConfig(data.configOverrides);
  const notes = Array.isArray(data.notes)
    ? data.notes.filter((n): n is string => typeof n === 'string').slice(0, 8)
    : [];

  return { configOverrides, notes };
}
