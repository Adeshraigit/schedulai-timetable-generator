'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Spinner } from '@/components/ui/spinner';
import Link from 'next/link';
import {
  Plus,
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  Calendar,
  Sparkles,
  Download,
} from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Timetable {
  id: string;
  name: string;
  semester: string;
  academicYear: string;
  status: 'DRAFT' | 'GENERATING' | 'GENERATED' | 'PUBLISHED' | 'ARCHIVED';
  score: number | null;
  conflicts: number;
  createdAt: string;
  department: { name: string };
  createdBy: { name: string };
  _count: { slots: number };
}

const statusColors: Record<string, string> = {
  DRAFT: 'bg-muted text-muted-foreground',
  GENERATING: 'bg-secondary/20 text-secondary',
  GENERATED: 'bg-primary/20 text-primary',
  PUBLISHED: 'bg-accent/20 text-accent',
  ARCHIVED: 'bg-muted text-muted-foreground',
};

export default function TimetablesPage() {
  const { data: timetables, error, isLoading, mutate } = useSWR<Timetable[]>(
    '/api/timetables',
    fetcher
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this timetable?')) return;

    await fetch(`/api/timetables/${id}`, { method: 'DELETE' });
    mutate();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Timetables</h2>
          <p className="text-muted-foreground">Manage and view all generated timetables</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/generate">
            <Plus className="mr-2 h-4 w-4" />
            Create Timetable
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Timetables</CardTitle>
          <CardDescription>
            View, edit, and manage your academic timetables
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner className="h-6 w-6" />
            </div>
          ) : error ? (
            <div className="py-8 text-center text-muted-foreground">
              Failed to load timetables. Please try again.
            </div>
          ) : timetables && timetables.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Slots</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {timetables.map((timetable) => (
                  <TableRow key={timetable.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span className="font-medium">{timetable.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {timetable.semester} ({timetable.academicYear})
                    </TableCell>
                    <TableCell>{timetable.department.name}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[timetable.status]}>
                        {timetable.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{timetable._count.slots}</TableCell>
                    <TableCell>
                      {timetable.score ? (
                        <span className={timetable.score >= 80 ? 'text-accent' : 'text-secondary'}>
                          {timetable.score.toFixed(0)}%
                        </span>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(timetable.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/timetables/${timetable.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/timetables/${timetable.id}/edit`}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/timetables/${timetable.id}/regenerate`}>
                              <Sparkles className="mr-2 h-4 w-4" />
                              Regenerate
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Export
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(timetable.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <Calendar className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <h3 className="mb-2 text-lg font-medium text-foreground">No timetables yet</h3>
              <p className="mb-4 text-center text-muted-foreground">
                Get started by creating your first timetable
              </p>
              <Button asChild>
                <Link href="/dashboard/generate">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Timetable
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
