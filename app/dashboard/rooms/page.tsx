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
import { Plus, DoorOpen, Search, Users, Monitor, Thermometer } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Room {
  id: string;
  name: string;
  code: string;
  capacity: number;
  type: string;
  hasProjector: boolean;
  hasAC: boolean;
  hasComputers: boolean;
  building: string | null;
  floor: number | null;
  department: { name: string };
}

interface Department {
  id: string;
  name: string;
  code: string;
}

const roomTypes = [
  { value: 'LECTURE_HALL', label: 'Lecture Hall' },
  { value: 'SEMINAR_ROOM', label: 'Seminar Room' },
  { value: 'COMPUTER_LAB', label: 'Computer Lab' },
  { value: 'PHYSICS_LAB', label: 'Physics Lab' },
  { value: 'CHEMISTRY_LAB', label: 'Chemistry Lab' },
  { value: 'WORKSHOP', label: 'Workshop' },
  { value: 'AUDITORIUM', label: 'Auditorium' },
];

const roomTypeColors: Record<string, string> = {
  LECTURE_HALL: 'bg-primary/20 text-primary',
  SEMINAR_ROOM: 'bg-secondary/20 text-secondary',
  COMPUTER_LAB: 'bg-accent/20 text-accent',
  PHYSICS_LAB: 'bg-purple-100 text-purple-700',
  CHEMISTRY_LAB: 'bg-pink-100 text-pink-700',
  WORKSHOP: 'bg-orange-100 text-orange-700',
  AUDITORIUM: 'bg-blue-100 text-blue-700',
};

export default function RoomsPage() {
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    capacity: 30,
    type: 'LECTURE_HALL',
    hasProjector: true,
    hasAC: false,
    hasComputers: false,
    building: '',
    floor: 1,
    departmentId: '',
  });

  const { data: rooms, error, isLoading, mutate } = useSWR<Room[]>('/api/rooms', fetcher);
  const { data: departments } = useSWR<Department[]>('/api/departments', fetcher);

  const filteredRooms = rooms?.filter(
    (room) =>
      room.name.toLowerCase().includes(search.toLowerCase()) ||
      room.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await fetch('/api/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    setIsDialogOpen(false);
    setFormData({
      name: '',
      code: '',
      capacity: 30,
      type: 'LECTURE_HALL',
      hasProjector: true,
      hasAC: false,
      hasComputers: false,
      building: '',
      floor: 1,
      departmentId: '',
    });
    mutate();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Rooms</h2>
          <p className="text-muted-foreground">Manage classrooms, labs, and other venues</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Room
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Room</DialogTitle>
              <DialogDescription>Register a new room with its facilities</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Room Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Lecture Hall 101"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Room Code</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g., LH-101"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="type">Room Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {roomTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min={1}
                    max={500}
                    value={formData.capacity}
                    onChange={(e) =>
                      setFormData({ ...formData, capacity: parseInt(e.target.value) })
                    }
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
                  <Label htmlFor="building">Building</Label>
                  <Input
                    id="building"
                    value={formData.building}
                    onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                    placeholder="e.g., Main Building"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="floor">Floor</Label>
                  <Input
                    id="floor"
                    type="number"
                    min={-2}
                    max={20}
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Facilities</Label>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="hasProjector"
                      checked={formData.hasProjector}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, hasProjector: checked })
                      }
                    />
                    <Label htmlFor="hasProjector" className="text-sm">
                      Projector
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="hasAC"
                      checked={formData.hasAC}
                      onCheckedChange={(checked) => setFormData({ ...formData, hasAC: checked })}
                    />
                    <Label htmlFor="hasAC" className="text-sm">
                      AC
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="hasComputers"
                      checked={formData.hasComputers}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, hasComputers: checked })
                      }
                    />
                    <Label htmlFor="hasComputers" className="text-sm">
                      Computers
                    </Label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Room</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Rooms</CardTitle>
              <CardDescription>{rooms?.length || 0} rooms available</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search rooms..."
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
            <div className="py-8 text-center text-muted-foreground">Failed to load rooms</div>
          ) : filteredRooms && filteredRooms.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Facilities</TableHead>
                  <TableHead>Department</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRooms.map((room) => (
                  <TableRow key={room.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="rounded-lg bg-primary/10 p-2">
                          <DoorOpen className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{room.code}</p>
                          <p className="text-sm text-muted-foreground">{room.name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={roomTypeColors[room.type] || 'bg-muted'}>
                        {roomTypes.find((t) => t.value === room.type)?.label || room.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        {room.capacity}
                      </div>
                    </TableCell>
                    <TableCell>
                      {room.building && room.floor !== null ? (
                        <span className="text-sm">
                          {room.building}, Floor {room.floor}
                        </span>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {room.hasProjector && (
                          <Badge variant="outline" className="text-xs">
                            Projector
                          </Badge>
                        )}
                        {room.hasAC && (
                          <Badge variant="outline" className="text-xs">
                            <Thermometer className="mr-1 h-3 w-3" />
                            AC
                          </Badge>
                        )}
                        {room.hasComputers && (
                          <Badge variant="outline" className="text-xs">
                            <Monitor className="mr-1 h-3 w-3" />
                            PCs
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{room.department.name}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <DoorOpen className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <h3 className="mb-2 text-lg font-medium text-foreground">No rooms found</h3>
              <p className="mb-4 text-center text-muted-foreground">
                {search ? 'No rooms match your search' : 'Add your first room to get started'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
