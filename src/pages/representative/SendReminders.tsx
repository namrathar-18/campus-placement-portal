import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Bell, Send, Users, CheckSquare } from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface Student {
  _id: string;
  name: string;
  registerNumber: string;
  isPlaced: boolean;
}

const SendReminders = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [reminderType, setReminderType] = useState('all');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [notificationType, setNotificationType] = useState<'info' | 'success' | 'warning'>('info');
  const [loading, setLoading] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await api.get('/representative/students');
      setStudents(response.data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch students',
        variant: 'destructive',
      });
    }
  };

  const handleReminderTypeChange = (type: string) => {
    setReminderType(type);
    
    // Auto-select students based on type
    if (type === 'all') {
      setSelectedStudents(students.map(s => s._id));
    } else if (type === 'unplaced') {
      setSelectedStudents(students.filter(s => !s.isPlaced).map(s => s._id));
    } else if (type === 'placed') {
      setSelectedStudents(students.filter(s => s.isPlaced).map(s => s._id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleStudentToggle = (studentId: string) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map(s => s._id));
    }
  };

  const handleSendReminder = async () => {
    if (!title || !message) {
      toast({
        title: 'Validation Error',
        description: 'Please provide both title and message',
        variant: 'destructive',
      });
      return;
    }

    if (selectedStudents.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please select at least one student',
        variant: 'destructive',
      });
      return;
    }

    setConfirmDialogOpen(true);
  };

  const confirmSendReminder = async () => {
    setLoading(true);
    try {
      const response = await api.post('/representative/send-reminder', {
        studentIds: selectedStudents,
        title,
        message,
        type: notificationType,
      });

      toast({
        title: 'Success',
        description: response.message || 'Reminder sent successfully',
      });

      // Reset form
      setTitle('');
      setMessage('');
      setSelectedStudents([]);
      setReminderType('all');
      setConfirmDialogOpen(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send reminder',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Quick templates
  const templates = [
    {
      title: 'Application Deadline Reminder',
      message: 'Dear Students,\n\nThis is a reminder that the application deadline for {Company Name} is approaching. Please submit your applications before the deadline.\n\nBest regards,\nPlacement Cell',
      type: 'warning' as const,
    },
    {
      title: 'Profile Update Required',
      message: 'Hello,\n\nPlease update your profile with latest information including resume, GPA, and contact details to ensure smooth placement process.\n\nThank you,\nPlacement Cell',
      type: 'info' as const,
    },
    {
      title: 'Placement Drive Notification',
      message: 'Dear Students,\n\nWe have an upcoming placement drive. Please check your dashboard for details and register accordingly.\n\nAll the best,\nPlacement Cell',
      type: 'success' as const,
    },
  ];

  const applyTemplate = (template: typeof templates[0]) => {
    setTitle(template.title);
    setMessage(template.message);
    setNotificationType(template.type);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2">Send Reminders</h1>
        <p className="text-muted-foreground">
          Send notifications and reminders to students in your department
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Compose Reminder */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Compose Reminder
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Quick Templates */}
              <div>
                <Label>Quick Templates</Label>
                <div className="grid gap-2 mt-2">
                  {templates.map((template, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="justify-start"
                      onClick={() => applyTemplate(template)}
                    >
                      {template.title}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter reminder title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Enter your message..."
                  rows={8}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="type">Notification Type</Label>
                <Select
                  value={notificationType}
                  onValueChange={(value: any) => setNotificationType(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleSendReminder}
                disabled={loading}
                className="w-full"
              >
                <Send className="h-4 w-4 mr-2" />
                Send Reminder to {selectedStudents.length} Student(s)
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Select Recipients */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Select Recipients
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Filter Students</Label>
                <Select value={reminderType} onValueChange={handleReminderTypeChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Students</SelectItem>
                    <SelectItem value="unplaced">Unplaced Only</SelectItem>
                    <SelectItem value="placed">Placed Only</SelectItem>
                    <SelectItem value="custom">Custom Selection</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2 py-2 border-b">
                <Checkbox
                  checked={selectedStudents.length === students.length}
                  onCheckedChange={handleSelectAll}
                  id="select-all"
                />
                <Label htmlFor="select-all" className="cursor-pointer">
                  Select All ({students.length})
                </Label>
              </div>

              <div className="max-h-96 overflow-y-auto space-y-2">
                {students.map((student) => (
                  <div key={student._id} className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedStudents.includes(student._id)}
                      onCheckedChange={() => handleStudentToggle(student._id)}
                      id={student._id}
                    />
                    <Label
                      htmlFor={student._id}
                      className="cursor-pointer flex-1 py-1"
                    >
                      <div className="font-medium">{student.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {student.registerNumber}
                        {student.isPlaced && ' • Placed'}
                      </div>
                    </Label>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground">
                  {selectedStudents.length} student(s) selected
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Send Reminder</DialogTitle>
            <DialogDescription>
              You are about to send this reminder to {selectedStudents.length} student(s).
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium">Title:</p>
              <p className="text-sm text-muted-foreground">{title}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Message:</p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{message}</p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialogOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={confirmSendReminder} disabled={loading}>
              {loading ? 'Sending...' : 'Confirm & Send'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SendReminders;
