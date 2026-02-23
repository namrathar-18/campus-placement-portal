# Student Representative Module

## Overview
The Student Representative module provides a comprehensive system for student coordinators to manage and coordinate placement activities within their department. This module bridges the gap between students and the placement office.

## Features

### 1. Dashboard
- **Overview Statistics**: Total students, placed/unplaced counts, application statistics
- **Placement Percentage**: Real-time calculation of department placement success rate
- **Active Companies**: Number of companies currently hiring
- **Recent Notifications**: Latest announcements and updates
- **Quick Action Items**: Pending tasks and alerts

### 2. Student Management
- **View All Students**: Complete list of students in the department
- **Search & Filter**: Search by name, register number, or email; filter by placement status
- **Student Details**: View comprehensive student profile including:
  - Personal information (name, register number, contact details)
  - Academic details (department, section, GPA)
  - Placement status
  - Application history
- **Update Placement Status**: Mark students as placed or unplaced
- **Export Data**: Export student lists to CSV

### 3. Send Reminders
- **Targeted Notifications**: Send messages to specific students or groups
- **Quick Templates**: Pre-built templates for common reminders:
  - Application deadline reminders
  - Profile update requests
  - Placement drive notifications
- **Recipient Selection**: 
  - All students
  - Placed students only
  - Unplaced students only
  - Custom selection
- **Notification Types**: Info, Success, Warning categories
- **Batch Sending**: Send to multiple students simultaneously

### 4. Placement Reports
- **Department Statistics**:
  - Total students count
  - Placed vs unplaced breakdown
  - Success rate percentage
- **Company-wise Analysis**: Number of students placed per company
- **Package Information**: Company packages and locations
- **Student List**: Complete roster with placement status
- **Export to CSV**: Download reports for offline analysis

## User Roles

### Student Representative
- **Access Level**: Department-specific
- **Can View**: All students in their department
- **Can Modify**: Student placement status
- **Can Send**: Notifications and reminders to department students
- **Can Generate**: Reports for their department

## API Endpoints

### Dashboard
```
GET /api/representative/dashboard-stats
```
Returns: Dashboard statistics including student counts, applications, and notifications

### Student Management
```
GET /api/representative/students
Query Parameters: department, search, placementStatus
```
Returns: List of students with filtering options

```
GET /api/representative/student/:id
```
Returns: Detailed student information including applications

```
POST /api/representative/update-student-status
Body: { studentId, isPlaced }
```
Updates student placement status

### Applications
```
GET /api/representative/applications
Query Parameters: status, companyId
```
Returns: All applications from department students

### Notifications
```
POST /api/representative/send-reminder
Body: { studentIds[], title, message, type }
```
Sends notification to selected students

### Reports
```
GET /api/representative/placement-report
```
Returns: Comprehensive placement report for the department

```
GET /api/representative/companies-deadline
```
Returns: Companies with upcoming deadlines (next 7 days)

## Database Schema Updates

### User Model
```javascript
{
  role: {
    type: String,
    enum: ['student', 'student_representative', 'placement_officer', 'admin'],
    default: 'student'
  },
  isRepresentative: {
    type: Boolean,
    default: false
  },
  representativeDesignation: {
    type: String,
    enum: ['class_representative', 'department_representative', 'placement_coordinator'],
    sparse: true
  }
}
```

## Frontend Components

### Pages
1. **RepresentativeDashboard.tsx** - Main dashboard with statistics
2. **ManageStudents.tsx** - Student listing and management
3. **SendReminders.tsx** - Notification composition and sending
4. **PlacementReport.tsx** - Comprehensive reports and analytics

### Routes
```
/representative/dashboard - Dashboard
/representative/students - Student management
/representative/reminders - Send notifications
/representative/report - View reports
```

## How to Use

### For Administrators
1. Assign student representative role to a user
2. Set their department in user profile
3. Optionally set designation (class_representative, department_representative, etc.)

### For Student Representatives
1. **Login**: Use register number or email
2. **Dashboard**: View overall statistics and quick actions
3. **Manage Students**:
   - Navigate to "Manage Students"
   - Use search/filter to find specific students
   - Click "View" to see detailed information
   - Use "Mark Placed/Unplaced" to update status
4. **Send Reminders**:
   - Navigate to "Send Reminders"
   - Choose recipients (all, placed, unplaced, or custom)
   - Select or create message
   - Review and send
5. **View Reports**:
   - Navigate to "Reports"
   - View comprehensive placement statistics
   - Export to CSV for offline analysis

## Security Features
- **Department Isolation**: Representatives can only access students from their own department
- **Authorization Middleware**: All endpoints protected with role-based access
- **Token-based Authentication**: JWT tokens for secure API access

## Notification Templates

### Template 1: Application Deadline
```
Title: Application Deadline Reminder
Message: Dear Students, this is a reminder that the application deadline 
for {Company Name} is approaching. Please submit your applications before 
the deadline.
Type: Warning
```

### Template 2: Profile Update
```
Title: Profile Update Required
Message: Hello, please update your profile with latest information including 
resume, GPA, and contact details to ensure smooth placement process.
Type: Info
```

### Template 3: Placement Drive
```
Title: Placement Drive Notification
Message: Dear Students, we have an upcoming placement drive. Please check 
your dashboard for details and register accordingly.
Type: Success
```

## Export Features
- **CSV Export**: Student lists with register number, name, GPA, and placement status
- **Report Download**: Complete placement reports with company-wise breakdown
- **Date Stamped**: All exports include timestamp in filename

## Statistics & Analytics
- Real-time placement percentage calculation
- Company-wise placement distribution
- Department-level success metrics
- Application status tracking
- Trend analysis capabilities

## Best Practices
1. **Regular Updates**: Keep student placement status updated
2. **Timely Reminders**: Send notifications well before deadlines
3. **Accurate Records**: Verify student information regularly
4. **Report Generation**: Generate reports periodically for tracking
5. **Communication**: Maintain clear communication with placement office

## Future Enhancements
- Email integration for notifications
- SMS alerts for urgent reminders
- Advanced analytics and visualizations
- Interview schedule coordination
- Feedback collection system
- Mobile app for on-the-go management

## Support
For issues or questions regarding the Student Representative module:
- Contact: Placement Office
- Email: placement@christuniversity.in
- Documentation: Refer to this guide

## Version History
- **v1.0.0** (Current): Initial release with core features
  - Dashboard with statistics
  - Student management
  - Notification system
  - Report generation
