'use client';

import { use } from 'react';
import { useRef, useState } from 'react';
import useSWR from 'swr';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import Link from 'next/link';
import {
  ArrowLeft,
  Download,
  Sparkles,
  Calendar,
  Clock,
  Users,
  DoorOpen,
  BookOpen,
} from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface TimetableSlot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotType: string;
  course: { name: string; code: string };
  professor: { name: string };
  room: { name: string; code: string };
  studentGroup: { name: string; code: string };
}

interface Timetable {
  id: string;
  name: string;
  semester: string;
  academicYear: string;
  status: string;
  score: number | null;
  conflicts: number;
  createdAt: string;
  department: { name: string };
  createdBy: { name: string };
  slots: TimetableSlot[];
}

const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const timeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];

const slotTypeColors: Record<string, string> = {
  LECTURE: 'bg-primary/20 border-primary/30 text-primary',
  LAB: 'bg-accent/20 border-accent/30 text-accent',
  TUTORIAL: 'bg-secondary/20 border-secondary/30 text-secondary',
  SEMINAR: 'bg-purple-100 border-purple-300 text-purple-700',
};

export default function TimetableViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [isExporting, setIsExporting] = useState(false);
  const gridExportRef = useRef<HTMLDivElement | null>(null);
  const { id } = use(params);
  const { data: timetable, error, isLoading } = useSWR<Timetable>(
    `/api/timetables/${id}`,
    fetcher
  );

  const handleExportPdf = async () => {
    if (!timetable || isExporting || !gridExportRef.current) return;

    setIsExporting(true);
    try {
      const [{ jsPDF }, { toPng }] = await Promise.all([
        import('jspdf'),
        import('html-to-image'),
      ]);

      const imageData = await toPng(gridExportRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      });

      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load generated image'));
        img.src = imageData;
      });

      const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const marginX = 24;
      const marginY = 20;
      const maxImageWidth = pageWidth - marginX * 2;
      const maxImageHeight = pageHeight - 110;

      doc.setFontSize(18);
      doc.text(`Timetable: ${timetable.name}`, marginX, 40);

      doc.setFontSize(11);
      doc.text(
        `${timetable.semester} ${timetable.academicYear} - ${timetable.department.name}`,
        marginX,
        60
      );
      doc.text(`Status: ${timetable.status}`, marginX, 76);
      doc.text(`Generated Slots: ${timetable.slots.length}`, marginX + 220, 76);

      const imageRatio = img.width / img.height;

      let renderWidth = maxImageWidth;
      let renderHeight = renderWidth / imageRatio;
      if (renderHeight > maxImageHeight) {
        renderHeight = maxImageHeight;
        renderWidth = renderHeight * imageRatio;
      }

      doc.addImage(
        imageData,
        'PNG',
        (pageWidth - renderWidth) / 2,
        95,
        renderWidth,
        renderHeight
      );

      const safeName = timetable.name.replace(/[^a-zA-Z0-9-_]/g, '_');
      doc.save(`${safeName}_timetable.pdf`);
    } catch (exportError) {
      console.error('Failed to export PDF:', exportError);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (error || !timetable) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">Failed to load timetable</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/dashboard/timetables">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Timetables
          </Link>
        </Button>
      </div>
    );
  }

  // Group slots by day and time for the grid view
  const getSlotAt = (day: number, time: string): TimetableSlot | undefined => {
    return timetable.slots.find(
      (slot) => slot.dayOfWeek === day && slot.startTime === time
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/dashboard/timetables">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-foreground">{timetable.name}</h2>
            <p className="text-muted-foreground">
              {timetable.semester} {timetable.academicYear} - {timetable.department.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            className={
              timetable.status === 'PUBLISHED'
                ? 'bg-accent/20 text-accent'
                : timetable.status === 'GENERATED'
                ? 'bg-primary/20 text-primary'
                : 'bg-muted text-muted-foreground'
            }
          >
            {timetable.status}
          </Badge>
          <Button variant="outline" onClick={handleExportPdf} disabled={isExporting}>
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? 'Exporting...' : 'Export PDF'}
          </Button>
          <Button>
            <Sparkles className="mr-2 h-4 w-4" />
            Regenerate
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-primary/10 p-2">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Slots</p>
              <p className="text-xl font-bold text-foreground">{timetable.slots.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-accent/10 p-2">
              <BookOpen className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Courses</p>
              <p className="text-xl font-bold text-foreground">
                {new Set(timetable.slots.map((s) => s.course.code)).size}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-secondary/10 p-2">
              <Users className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Professors</p>
              <p className="text-xl font-bold text-foreground">
                {new Set(timetable.slots.map((s) => s.professor.name)).size}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-primary/10 p-2">
              <DoorOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Rooms Used</p>
              <p className="text-xl font-bold text-foreground">
                {new Set(timetable.slots.map((s) => s.room.code)).size}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timetable Grid */}
      <Card ref={gridExportRef}>
        <CardHeader>
          <CardTitle>Weekly Schedule</CardTitle>
          <CardDescription>View the complete timetable grid</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Header */}
              <div className="grid grid-cols-6 gap-2 border-b border-border pb-2">
                <div className="flex items-center justify-center p-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </div>
                {dayNames.map((day) => (
                  <div
                    key={day}
                    className="p-2 text-center text-sm font-medium text-foreground"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Time slots */}
              {timeSlots.map((time) => (
                <div key={time} className="grid grid-cols-6 gap-2 border-b border-border py-1">
                  <div className="flex items-center justify-center p-2 text-sm text-muted-foreground">
                    {time}
                  </div>
                  {[0, 1, 2, 3, 4].map((day) => {
                    const slot = getSlotAt(day, time);
                    return (
                      <div key={`${day}-${time}`} className="min-h-[80px] p-1">
                        {slot ? (
                          <div
                            className={`h-full rounded-lg border p-2 ${
                              slotTypeColors[slot.slotType] || slotTypeColors.LECTURE
                            }`}
                          >
                            <p className="text-xs font-semibold">{slot.course.code}</p>
                            <p className="truncate text-xs">{slot.course.name}</p>
                            <p className="mt-1 truncate text-xs opacity-80">
                              {slot.professor.name}
                            </p>
                            <p className="truncate text-xs opacity-60">{slot.room.code}</p>
                          </div>
                        ) : (
                          <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-border bg-muted/30">
                            <span className="text-xs text-muted-foreground">-</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-6 flex flex-wrap gap-4 border-t border-border pt-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-primary/30" />
              <span className="text-sm text-muted-foreground">Lecture</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-accent/30" />
              <span className="text-sm text-muted-foreground">Lab</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-secondary/30" />
              <span className="text-sm text-muted-foreground">Tutorial</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
