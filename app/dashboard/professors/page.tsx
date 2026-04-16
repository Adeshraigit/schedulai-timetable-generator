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
import { Spinner } from '@/components/ui/spinner';
import { Plus, Users, Search, Mail, Clock } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Professor {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  maxHoursPerDay: number;
  maxHoursPerWeek: number;
  department: { name: string };
  assignments: Array<{ course: { name: string; code: string } }>;
}

interface Department {
  id: string;
  name: string;
  code: string;
}

export default function ProfessorsPage() {
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    employeeId: '',
    maxHoursPerDay: 6,
    maxHoursPerWeek: 20,
    departmentId: '',
  });

  const { data: professors, error, isLoading, mutate } = useSWR<Professor[]>(
    '/api/professors',
    fetcher
  );
  const { data: departments } = useSWR<Department[]>('/api/departments', fetcher);

  const filteredProfessors = professors?.filter(
    (prof) =>
      prof.name.toLowerCase().includes(search.toLowerCase()) ||
      prof.email.toLowerCase().includes(search.toLowerCase()) ||
      prof.employeeId.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await fetch('/api/professors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    setIsDialogOpen(false);
    setFormData({
      name: '',
      email: '',
      employeeId: '',
      maxHoursPerDay: 6,
      maxHoursPerWeek: 20,
      departmentId: '',
    });
    mutate();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Professors</h2>
          <p className="text-muted-foreground">Manage teaching staff and their availability</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Professor
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Professor</DialogTitle>
              <DialogDescription>
                Register a new professor with their availability constraints
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Dr. John Smith"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john.smith@university.edu"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employeeId">Employee ID</Label>
                  <Input
                    id="employeeId"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    placeholder="EMP001"
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

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="maxHoursPerDay">Max Hours/Day</Label>
                  <Input
                    id="maxHoursPerDay"
                    type="number"
                    min={1}
                    max={8}
                    value={formData.maxHoursPerDay}
                    onChange={(e) => setFormData({ ...formData, maxHoursPerDay: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxHoursPerWeek">Max Hours/Week</Label>
                  <Input
                    id="maxHoursPerWeek"
                    type="number"
                    min={1}
                    max={40}
                    value={formData.maxHoursPerWeek}
                    onChange={(e) => setFormData({ ...formData, maxHoursPerWeek: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Professor</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Professors</CardTitle>
              <CardDescription>
                {professors?.length || 0} professors in the system
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search professors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner className="h-6 w-6" />
            </div>
          ) : error ? (
            <div className="py-8 text-center text-muted-foreground">
              Failed to load professors
            </div>
          ) : filteredProfessors && filteredProfessors.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Professor</TableHead>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Availability</TableHead>
                  <TableHead>Courses</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProfessors.map((professor) => (
                  <TableRow key={professor.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Users className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{professor.name}</p>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {professor.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{professor.employeeId}</Badge>
                    </TableCell>
                    <TableCell>{professor.department.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        {professor.maxHoursPerDay}h/day, {professor.maxHoursPerWeek}h/week
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {professor.assignments.slice(0, 3).map((a, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {a.course.code}
                          </Badge>
                        ))}
                        {professor.assignments.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{professor.assignments.length - 3}
                          </Badge>
                        )}
                        {professor.assignments.length === 0 && (
                          <span className="text-sm text-muted-foreground">No courses</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <Users className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <h3 className="mb-2 text-lg font-medium text-foreground">No professors found</h3>
              <p className="mb-4 text-center text-muted-foreground">
                {search ? 'No professors match your search' : 'Add your first professor to get started'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
