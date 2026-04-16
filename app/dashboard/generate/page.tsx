'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Progress } from '@/components/ui/progress';
import {
  Sparkles,
  Settings,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Zap,
} from 'lucide-react';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error || 'Request failed');
  }

  return data;
};

interface Department {
  id: string;
  name: string;
  code: string;
}

interface GenerationResult {
  success: boolean;
  score: number;
  hardViolations: number;
  softViolations: number;
  slotsCreated: number;
  generationTime: number;
  conflicts: Array<{ type: string; description: string }>;
  aiUsed?: boolean;
  aiApplied?: boolean;
  aiNotes?: string[];
}

export default function GeneratePage() {
  const [name, setName] = useState('');
  const [semester, setSemester] = useState('');
  const [academicYear, setAcademicYear] = useState('2025-2026');
  const [departmentId, setDepartmentId] = useState('');
  const [maxIterations, setMaxIterations] = useState([500]);
  const [populationSize, setPopulationSize] = useState([50]);
  const [useAdvancedConfig, setUseAdvancedConfig] = useState(false);
  const [useAiOptimization, setUseAiOptimization] = useState(true);
  const [aiPrompt, setAiPrompt] = useState('Prioritize reducing hard conflicts and avoid late-evening slots.');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: departments, error: departmentsError } = useSWR<Department[]>(
    '/api/departments',
    fetcher
  );
  const departmentOptions = Array.isArray(departments) ? departments : [];

  const handleGenerate = async () => {
    if (!name || !semester || !departmentId) {
      setError('Please fill in all required fields');
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setResult(null);
    setError(null);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + Math.random() * 15, 90));
    }, 500);

    try {
      // First create the timetable
      const createResponse = await fetch('/api/timetables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          semester,
          academicYear,
          departmentId,
          createdById: 'admin-user-id', // In a real app, this would come from auth
        }),
      });

      if (!createResponse.ok) {
        throw new Error('Failed to create timetable');
      }

      const timetable = await createResponse.json();

      // Then generate the schedule
      const generateResponse = await fetch(`/api/timetables/${timetable.id}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          useAI: useAiOptimization,
          aiPrompt,
          config: {
            maxIterations: maxIterations[0],
            populationSize: populationSize[0],
          },
        }),
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!generateResponse.ok) {
        const errorData = await generateResponse.json();
        const diagnosticText = errorData?.diagnostics
          ? ` (${JSON.stringify(errorData.diagnostics)})`
          : '';
        throw new Error((errorData.error || 'Generation failed') + diagnosticText);
      }

      const generationResult = await generateResponse.json();
      setResult(generationResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      clearInterval(progressInterval);
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Generate Timetable</h2>
        <p className="text-muted-foreground">
          Create a new optimized timetable using AI-powered scheduling
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Configuration Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuration
            </CardTitle>
            <CardDescription>Set up the parameters for timetable generation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Timetable Name</Label>
              <Input
                id="name"
                placeholder="e.g., Fall 2025 - Computer Science"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="semester">Semester</Label>
                <Select value={semester} onValueChange={setSemester}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fall">Fall</SelectItem>
                    <SelectItem value="Spring">Spring</SelectItem>
                    <SelectItem value="Summer">Summer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Academic Year</Label>
                <Select value={academicYear} onValueChange={setAcademicYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024-2025">2024-2025</SelectItem>
                    <SelectItem value="2025-2026">2025-2026</SelectItem>
                    <SelectItem value="2026-2027">2026-2027</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select value={departmentId} onValueChange={setDepartmentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departmentOptions.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name} ({dept.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {departmentsError && (
                <p className="text-sm text-destructive">Failed to load departments</p>
              )}
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div className="space-y-0.5">
                <Label>Advanced Configuration</Label>
                <p className="text-sm text-muted-foreground">
                  Fine-tune the generation algorithm
                </p>
              </div>
              <Switch checked={useAdvancedConfig} onCheckedChange={setUseAdvancedConfig} />
            </div>

            <div className="rounded-lg border border-border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Groq AI Optimization</Label>
                  <p className="text-sm text-muted-foreground">
                    Let Groq tune generation settings before scheduling
                  </p>
                </div>
                <Switch checked={useAiOptimization} onCheckedChange={setUseAiOptimization} />
              </div>
              {useAiOptimization && (
                <div className="space-y-2">
                  <Label htmlFor="aiPrompt">AI Instructions (optional)</Label>
                  <Textarea
                    id="aiPrompt"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Example: Prefer morning labs and reduce back-to-back sessions for first-year groups."
                    rows={3}
                  />
                </div>
              )}
            </div>

            {useAdvancedConfig && (
              <div className="space-y-6 rounded-lg border border-border p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Max Iterations</Label>
                    <span className="text-sm text-muted-foreground">{maxIterations[0]}</span>
                  </div>
                  <Slider
                    value={maxIterations}
                    onValueChange={setMaxIterations}
                    min={100}
                    max={2000}
                    step={100}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Population Size</Label>
                    <span className="text-sm text-muted-foreground">{populationSize[0]}</span>
                  </div>
                  <Slider
                    value={populationSize}
                    onValueChange={setPopulationSize}
                    min={20}
                    max={200}
                    step={10}
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                <AlertTriangle className="h-4 w-4" />
                {error}
              </div>
            )}

            <Button
              className="w-full"
              size="lg"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Timetable
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Generation Results
            </CardTitle>
            <CardDescription>View the output of the generation process</CardDescription>
          </CardHeader>
          <CardContent>
            {isGenerating ? (
              <div className="space-y-6 py-8">
                <div className="text-center">
                  <Sparkles className="mx-auto mb-4 h-12 w-12 animate-pulse text-primary" />
                  <h3 className="mb-2 text-lg font-medium text-foreground">
                    Generating Timetable...
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Our AI is optimizing your schedule
                  </p>
                </div>
                <Progress value={progress} className="w-full" />
                <p className="text-center text-sm text-muted-foreground">
                  {progress.toFixed(0)}% complete
                </p>
              </div>
            ) : result ? (
              <div className="space-y-6">
                <div className="flex items-center justify-center gap-2 py-4">
                  {result.success ? (
                    <>
                      <CheckCircle2 className="h-8 w-8 text-accent" />
                      <span className="text-lg font-medium text-accent">
                        Generation Successful!
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-8 w-8 text-secondary" />
                      <span className="text-lg font-medium text-secondary">
                        Generated with Conflicts
                      </span>
                    </>
                  )}
                </div>

                {result.aiUsed && (
                  <div className="rounded-lg border border-border p-4">
                    <p className="text-sm font-medium text-foreground">
                      AI Optimization: {result.aiApplied ? 'Applied' : 'Requested (no override)'}
                    </p>
                    {Array.isArray(result.aiNotes) && result.aiNotes.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {result.aiNotes.map((note) => (
                          <Badge key={note} variant="secondary">
                            {note}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border border-border p-4 text-center">
                    <p className="text-sm text-muted-foreground">Optimization Score</p>
                    <p className="text-2xl font-bold text-foreground">
                      {result.score.toFixed(0)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border p-4 text-center">
                    <p className="text-sm text-muted-foreground">Slots Created</p>
                    <p className="text-2xl font-bold text-foreground">{result.slotsCreated}</p>
                  </div>
                  <div className="rounded-lg border border-border p-4 text-center">
                    <p className="text-sm text-muted-foreground">Generation Time</p>
                    <p className="text-2xl font-bold text-foreground">
                      {(result.generationTime / 1000).toFixed(2)}s
                    </p>
                  </div>
                  <div className="rounded-lg border border-border p-4 text-center">
                    <p className="text-sm text-muted-foreground">Conflicts</p>
                    <p className="text-2xl font-bold text-foreground">
                      {result.hardViolations}
                    </p>
                  </div>
                </div>

                {result.conflicts.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">Conflicts Found:</p>
                    <div className="max-h-40 space-y-2 overflow-auto">
                      {result.conflicts.map((conflict, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2 rounded-lg bg-destructive/5 p-2 text-sm"
                        >
                          <AlertTriangle className="mt-0.5 h-3 w-3 text-destructive" />
                          <span className="text-muted-foreground">{conflict.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button className="w-full" variant="outline">
                  View Full Timetable
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Clock className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <h3 className="mb-2 text-lg font-medium text-foreground">Ready to Generate</h3>
                <p className="text-sm text-muted-foreground">
                  Configure your parameters and click Generate to create an optimized timetable
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
