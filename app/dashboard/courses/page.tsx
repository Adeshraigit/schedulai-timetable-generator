'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Spinner } from '@/components/ui/spinner';
import { Plus, BookOpen, Search } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Course {
  id: string;
  name: string;
  code: string;
  credits: number;
  lectureHours: number;
  labHours: number;
  tutorialHours: number;
  semester: number;
  requiresLab: boolean;
  department: { name: string };
  assignments: Array<{ professor: { name: string } }>;
}

interface Department {
  id: string;
  name: string;
  code: string;
}

interface Professor {
  id: string;
  name: string;
  department: { id: string; name: string; code: string } | null;
}

export default function CoursesPage() {
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [assignmentError, setAssignmentError] = useState<string | null>(null);
  const [assigningCourseId, setAssigningCourseId] = useState<string | null>(null);
  const [selectedProfessorByCourse, setSelectedProfessorByCourse] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    credits: 3,
    lectureHours: 3,
    labHours: 0,
    tutorialHours: 0,
    semester: 1,
    requiresLab: false,
    departmentId: '',
  });

  const { data: courses, error, isLoading, mutate } = useSWR<Course[]>(
    '/api/courses',
    fetcher
  );
  const { data: departments } = useSWR<Department[]>('/api/departments', fetcher);
  const { data: professors } = useSWR<Professor[]>('/api/professors', fetcher);

  const filteredCourses = courses?.filter(
    (course) =>
      course.name.toLowerCase().includes(search.toLowerCase()) ||
      course.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await fetch('/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    setIsDialogOpen(false);
    setFormData({
      name: '',
      code: '',
      credits: 3,
      lectureHours: 3,
      labHours: 0,
      tutorialHours: 0,
      semester: 1,
      requiresLab: false,
      departmentId: '',
    });
    mutate();
  };

  const handleAssignProfessor = async (course: Course) => {
    const professorId = selectedProfessorByCourse[course.id];
    if (!professorId) {
      setAssignmentError('Please select a professor first');
      return;
    }

    setAssignmentError(null);
    setAssigningCourseId(course.id);

    try {
      const res = await fetch('/api/course-assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: course.id, professorId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || 'Failed to assign professor');
      }

      await mutate();
      setSelectedProfessorByCourse((prev) => ({ ...prev, [course.id]: '' }));
    } catch (err) {
      setAssignmentError(err instanceof Error ? err.message : 'Failed to assign professor');
    } finally {
      setAssigningCourseId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Courses</h2>
          <p className="text-muted-foreground">Manage courses and their configurations</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Course
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Course</DialogTitle>
              <DialogDescription>
                Create a new course with its schedule requirements
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Course Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Data Structures"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Course Code</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g., CS201"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select
                  value={formData.departmentId}
                  onValueChange={(value) => setFormData({ ...formData, departmentId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments?.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="credits">Credits</Label>
                  <Input
                    id="credits"
                    type="number"
                    min={1}
                    max={6}
                    value={formData.credits}
                    onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="semester">Semester</Label>
                  <Input
                    id="semester"
                    type="number"
                    min={1}
                    max={8}
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lectureHours">Lecture Hours</Label>
                  <Input
                    id="lectureHours"
                    type="number"
                    min={0}
                    max={6}
                    value={formData.lectureHours}
                    onChange={(e) => setFormData({ ...formData, lectureHours: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="labHours">Lab Hours</Label>
                  <Input
                    id="labHours"
                    type="number"
                    min={0}
                    max={4}
                    value={formData.labHours}
                    onChange={(e) => setFormData({ ...formData, labHours: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tutorialHours">Tutorial Hours</Label>
                  <Input
                    id="tutorialHours"
                    type="number"
                    min={0}
                    max={4}
                    value={formData.tutorialHours}
                    onChange={(e) => setFormData({ ...formData, tutorialHours: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div>
                  <Label htmlFor="requiresLab">Requires Lab</Label>
                  <p className="text-sm text-muted-foreground">
                    This course needs a computer lab
                  </p>
                </div>
                <Switch
                  id="requiresLab"
                  checked={formData.requiresLab}
                  onCheckedChange={(checked) => setFormData({ ...formData, requiresLab: checked })}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Course</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Courses</CardTitle>
              <CardDescription>
                {courses?.length || 0} courses registered in the system
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          {assignmentError && (
            <p className="text-sm text-destructive">{assignmentError}</p>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner className="h-6 w-6" />
            </div>
          ) : error ? (
            <div className="py-8 text-center text-muted-foreground">
              Failed to load courses
            </div>
          ) : filteredCourses && filteredCourses.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Hours (L/Lab/T)</TableHead>
                  <TableHead>Professor</TableHead>
                  <TableHead className="w-[280px]">Assign</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="rounded-lg bg-primary/10 p-2">
                          <BookOpen className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{course.code}</p>
                          <p className="text-sm text-muted-foreground">{course.name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{course.department.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">Sem {course.semester}</Badge>
                    </TableCell>
                    <TableCell>{course.credits}</TableCell>
                    <TableCell>
                      {course.lectureHours}/{course.labHours}/{course.tutorialHours}
                    </TableCell>
                    <TableCell>
                      {course.assignments.length > 0
                        ? course.assignments.map((a) => a.professor.name).join(', ')
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Select
                          value={selectedProfessorByCourse[course.id] || ''}
                          onValueChange={(value) =>
                            setSelectedProfessorByCourse((prev) => ({
                              ...prev,
                              [course.id]: value,
                            }))
                          }
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select professor" />
                          </SelectTrigger>
                          <SelectContent>
                            {(professors ?? [])
                              .filter(
                                (p) =>
                                  !p.department || p.department.id === course.department.id
                              )
                              .map((professor) => (
                                <SelectItem key={professor.id} value={professor.id}>
                                  {professor.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => handleAssignProfessor(course)}
                          disabled={assigningCourseId === course.id}
                        >
                          {assigningCourseId === course.id ? 'Assigning...' : 'Assign'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <BookOpen className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <h3 className="mb-2 text-lg font-medium text-foreground">No courses found</h3>
              <p className="mb-4 text-center text-muted-foreground">
                {search ? 'No courses match your search' : 'Add your first course to get started'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
