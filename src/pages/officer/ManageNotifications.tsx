import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useNotifications, useCreateNotification, useDeleteNotification, NotifUser } from '@/hooks/useNotifications';
import { useUsers } from '@/hooks/useUsers';
import { normalizeSection } from '@/constants/sections';
import { Loader2, Plus, Trash2, Bell, Search, Users, User, UsersRound } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ManageNotifications = () => {
  const { toast } = useToast();
  const { data: notifications = [], isLoading } = useNotifications();
  const { data: users = [] } = useUsers();
  const createNotification = useCreateNotification();
  const deleteNotification = useDeleteNotification();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'info' | 'warning' | 'success' | 'error'>('all');
  const [targetFilter, setTargetFilter] = useState<'all' | 'student' | 'placement_officer' | 'specific'>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info' as 'info' | 'warning' | 'success' | 'error',
    targetRole: 'all' as 'all' | 'student' | 'placement_officer',
  });
  const [targetMode, setTargetMode] = useState<'broadcast' | 'specific' | 'bulk'>('broadcast');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [userSearch, setUserSearch] = useState('');
  const [bulkSectionFilter, setBulkSectionFilter] = useState<'all' | 'A' | 'B' | 'AI/ML'>('all');

  const students = useMemo(() => (users || []).filter(u => u.role === 'student'), [users]);

  const filteredUserList = useMemo(() => {
    let list = students;
    if (bulkSectionFilter !== 'all') list = list.filter(s => normalizeSection(s.section) === bulkSectionFilter);
    if (userSearch.trim()) {
      const term = userSearch.toLowerCase();
      list = list.filter(s =>
        s.name?.toLowerCase().includes(term) ||
        s.email?.toLowerCase().includes(term) ||
        s.registerNumber?.toLowerCase().includes(term)
      );
    }
    return list;
  }, [students, bulkSectionFilter, userSearch]);

  const resetForm = () => {
    setFormData({ title: '', message: '', type: 'info', targetRole: 'all' });
    setTargetMode('broadcast');
    setSelectedUserId('');
    setSelectedUserIds(new Set());
    setUserSearch('');
    setBulkSectionFilter('all');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (targetMode === 'specific' && !selectedUserId) {
      toast({ title: 'No student selected', description: 'Please select a student to send to.', variant: 'destructive' });
      return;
    }
    if (targetMode === 'bulk' && selectedUserIds.size === 0) {
      toast({ title: 'No students selected', description: 'Please select at least one student.', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    try {
      const payload: any = {
        title: formData.title,
        message: formData.message,
        type: formData.type,
      };
      if (targetMode === 'broadcast') {
        payload.targetRole = formData.targetRole;
      } else if (targetMode === 'specific') {
        payload.targetRole = 'specific';
        payload.userId = selectedUserId;
      } else {
        payload.targetRole = 'specific';
        payload.userIds = [...selectedUserIds];
      }
      await createNotification.mutateAsync(payload);
      toast({ title: 'Notification Sent', description: 'Your notification has been published successfully.' });
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast({ title: 'Error', description: error?.message || 'Failed to send notification', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification.mutateAsync(id);
      toast({ title: 'Notification Deleted', description: 'The notification has been removed.', variant: 'destructive' });
    } catch (error: any) {
      toast({ title: 'Error', description: error?.message || 'Failed to delete notification', variant: 'destructive' });
    }
  };

  const toggleUser = (id: string) => {
    setSelectedUserIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAllVisible = () => {
    const allSelected = filteredUserList.every(s => selectedUserIds.has(s._id));
    setSelectedUserIds(prev => {
      const next = new Set(prev);
      filteredUserList.forEach(s => allSelected ? next.delete(s._id) : next.add(s._id));
      return next;
    });
  };

  const getTargetLabel = (notification: any) => {
    if (notification.targetRole === 'specific') {
      if (notification.userId && typeof notification.userId === 'object') {
        return `→ ${(notification.userId as NotifUser).name}`;
      }
      if (Array.isArray(notification.userIds) && notification.userIds.length > 0) {
        return `→ ${notification.userIds.length} student${notification.userIds.length > 1 ? 's' : ''}`;
      }
      return '→ Specific';
    }
    if (notification.targetRole === 'all') return 'All Users';
    if (notification.targetRole === 'student') return 'Students';
    if (notification.targetRole === 'placement_officer') return 'Officers';
    return notification.targetRole;
  };

  const filteredNotifications = notifications.filter((notification) => {
    const haystack = `${notification.title} ${notification.message}`.toLowerCase();
    const matchesSearch = haystack.includes(searchTerm.toLowerCase().trim());
    const matchesType = typeFilter === 'all' || notification.type === typeFilter;
    const matchesTarget = targetFilter === 'all' || notification.targetRole === targetFilter;
    return matchesSearch && matchesType && matchesTarget;
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-fade-in">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
              Notifications & Announcements
            </h1>
            <p className="text-muted-foreground">
              Create and manage announcements for students
            </p>
          </div>
          <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="relative w-full sm:w-auto sm:min-w-[220px] lg:min-w-[280px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search title or message"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 rounded-xl w-full"
              />
            </div>
            <Select value={typeFilter} onValueChange={(v: 'all' | 'info' | 'warning' | 'success' | 'error') => setTypeFilter(v)}>
              <SelectTrigger className="rounded-xl w-full sm:w-[140px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="info">Information</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
            <Select value={targetFilter} onValueChange={(v: 'all' | 'student' | 'placement_officer' | 'specific') => setTargetFilter(v)}>
              <SelectTrigger className="rounded-xl w-full sm:w-[140px]">
                <SelectValue placeholder="Audience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="student">Students</SelectItem>
                <SelectItem value="placement_officer">Officers</SelectItem>
                <SelectItem value="specific">Targeted</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button variant="hero" className="gap-2">
                <Plus className="w-4 h-4" />
                Create Notification
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Notification</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                {/* Title */}
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Notification title"
                    required
                  />
                </div>

                {/* Type */}
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={formData.type} onValueChange={(v: any) => setFormData({ ...formData, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Information</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Target Mode toggle */}
                <div className="space-y-2">
                  <Label>Send To</Label>
                  <div className="flex gap-2">
                    {([
                      { key: 'broadcast', icon: Users, label: 'Broadcast' },
                      { key: 'specific', icon: User, label: 'One Student' },
                      { key: 'bulk', icon: UsersRound, label: 'Multiple' },
                    ] as const).map(({ key, icon: Icon, label }) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => { setTargetMode(key); setSelectedUserId(''); setSelectedUserIds(new Set()); setUserSearch(''); }}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${
                          targetMode === key ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-muted-foreground border-border hover:bg-muted/80'
                        }`}
                      >
                        <Icon className="w-4 h-4" />{label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Broadcast: audience dropdown */}
                {targetMode === 'broadcast' && (
                  <div className="space-y-2">
                    <Label>Audience</Label>
                    <Select value={formData.targetRole} onValueChange={(v: any) => setFormData({ ...formData, targetRole: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="student">Students Only</SelectItem>
                        <SelectItem value="placement_officer">Officers Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Specific: single student picker */}
                {targetMode === 'specific' && (
                  <div className="space-y-2">
                    <Label>Select Student</Label>
                    <div className="relative mb-2">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by name, email or reg no..."
                        value={userSearch}
                        onChange={e => setUserSearch(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <div className="border rounded-lg max-h-44 overflow-y-auto divide-y">
                      {filteredUserList.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">No students found</p>
                      ) : filteredUserList.map(s => (
                        <label key={s._id} className={`flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-muted/50 transition-colors ${selectedUserId === s._id ? 'bg-primary/5' : ''}`}>
                          <input
                            type="radio"
                            name="specificUser"
                            value={s._id}
                            checked={selectedUserId === s._id}
                            onChange={() => setSelectedUserId(s._id)}
                            className="accent-primary"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{s.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{s.email} {s.section ? `· ${s.section}` : ''}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                    {selectedUserId && (
                      <p className="text-xs text-primary font-medium">
                        Selected: {students.find(s => s._id === selectedUserId)?.name}
                      </p>
                    )}
                  </div>
                )}

                {/* Bulk: multi-select */}
                {targetMode === 'bulk' && (
                  <div className="space-y-2">
                    <Label>Select Students</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search students..."
                        value={userSearch}
                        onChange={e => setUserSearch(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <div className="flex gap-1.5 flex-wrap">
                      {(['all', 'A', 'B', 'AI/ML'] as const).map(s => (
                        <button key={s} type="button" onClick={() => setBulkSectionFilter(s)}
                          className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${bulkSectionFilter === s ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-muted-foreground border-border'}`}>
                          {s === 'all' ? 'All' : `Sec ${s}`}
                        </button>
                      ))}
                    </div>
                    <div className="border rounded-lg max-h-44 overflow-y-auto divide-y">
                      {filteredUserList.length > 0 && (
                        <label className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-muted/50 bg-muted/30 sticky top-0">
                          <Checkbox
                            checked={filteredUserList.length > 0 && filteredUserList.every(s => selectedUserIds.has(s._id))}
                            onCheckedChange={toggleAllVisible}
                          />
                          <span className="text-xs font-semibold text-muted-foreground">Select all visible ({filteredUserList.length})</span>
                        </label>
                      )}
                      {filteredUserList.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">No students found</p>
                      ) : filteredUserList.map(s => (
                        <label key={s._id} className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-muted/50 transition-colors">
                          <Checkbox checked={selectedUserIds.has(s._id)} onCheckedChange={() => toggleUser(s._id)} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{s.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{s.email} {s.section ? `· ${s.section}` : ''}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                    {selectedUserIds.size > 0 && (
                      <p className="text-xs text-primary font-medium">{selectedUserIds.size} student{selectedUserIds.size > 1 ? 's' : ''} selected</p>
                    )}
                  </div>
                )}

                {/* Message */}
                <div className="space-y-2">
                  <Label>Message</Label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Enter your notification message..."
                    rows={4}
                    required
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>Cancel</Button>
                  <Button type="submit" variant="hero" disabled={isSubmitting}>
                    {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending...</> : 'Send Notification'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Notifications List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredNotifications.length > 0 ? (
          <div className="space-y-4">
            {filteredNotifications.map((notification, index) => (
              <div
                key={notification._id}
                className="relative animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <Card className="rounded-2xl">
                  <CardContent className="pt-6">
                    <div
                      className={`p-4 rounded-lg border flex items-start justify-between gap-4 ${
                        notification.type === 'success'
                          ? 'bg-success/5 border-success/20'
                          : notification.type === 'warning'
                          ? 'bg-warning/5 border-warning/20'
                          : 'bg-primary/5 border-primary/20'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-foreground">
                            {notification.title}
                          </h4>
                          <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground">
                            {getTargetLabel(notification)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {notification.message}
                        </p>
                        {notification.createdAt && (
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(notification._id)}
                        className="text-destructive hover:bg-destructive/10 flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        ) : (
          <Card className="rounded-2xl">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Bell className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground text-center">
                No announcements yet. Create one to get started!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ManageNotifications;
