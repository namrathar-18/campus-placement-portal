# Student Representative Module - Setup Guide

## Quick Setup

### 1. Backend Setup
The backend routes and models have been automatically configured. No additional setup required.

### 2. Create a Student Representative Account

Run the seed script to create a sample representative:

```bash
cd server
node create-representative.js
```

This will create a representative with:
- **Register Number**: REP2024001
- **Password**: representative123
- **Role**: student_representative
- **Department**: MCA

### 3. Manual Creation via Database

Alternatively, you can manually create a representative by:

1. Create a regular user with role `student_representative`
2. Set `isRepresentative: true`
3. Set `representativeDesignation` to one of:
   - `class_representative`
   - `department_representative`
   - `placement_coordinator`
4. Ensure `department` field is set

### 4. Login

1. Go to the login page
2. Select "Student" login type
3. Enter Register Number: `REP2024001`
4. Enter Password: `representative123`
5. You'll be redirected to the Representative Dashboard

## Features Available

### Dashboard (`/representative/dashboard`)
- View total students in department
- See placed/unplaced statistics
- Monitor pending applications
- Check active companies
- View recent notifications

### Manage Students (`/representative/students`)
- Search and filter students
- View detailed student profiles
- See application history
- Update placement status
- Export data

### View Applications (`/representative/applications`)
- Monitor all applications
- Filter by status
- Search by student or company
- Track application statistics

### Send Reminders (`/representative/reminders`)
- Send notifications to students
- Use quick templates
- Select specific recipients
- Target placed/unplaced students

### Reports (`/representative/report`)
- View placement statistics
- Company-wise breakdown
- Export to CSV
- Department analytics

## API Endpoints

All representative endpoints are prefixed with `/api/representative/`:

- `GET /dashboard-stats` - Dashboard data
- `GET /students` - List all students
- `GET /student/:id` - Student details
- `GET /applications` - All applications
- `POST /send-reminder` - Send notifications
- `POST /update-student-status` - Update placement status
- `GET /placement-report` - Department report
- `GET /companies-deadline` - Upcoming deadlines

## Permissions

Student Representatives can:
- ✅ View all students in their department
- ✅ View all applications from their department
- ✅ Send notifications to department students
- ✅ Update student placement status
- ✅ Generate department reports
- ✅ Export data to CSV

Student Representatives CANNOT:
- ❌ View students from other departments
- ❌ Modify company information
- ❌ Approve/reject applications
- ❌ Access placement officer features
- ❌ View system-wide statistics

## Testing

### Test User Credentials
```
Register Number: REP2024001
Password: representative123
Role: student_representative
Department: MCA
```

### Test Scenarios

1. **Login Test**
   - Login with representative credentials
   - Verify redirect to representative dashboard

2. **Dashboard Test**
   - Check if statistics load correctly
   - Verify department-specific data

3. **Student Management Test**
   - Search for students
   - Filter by placement status
   - View student details
   - Update placement status

4. **Notification Test**
   - Create a reminder
   - Select recipients
   - Send notification
   - Verify delivery

5. **Report Test**
   - Generate placement report
   - Verify statistics
   - Export to CSV

## Troubleshooting

### Issue: Cannot login as representative
**Solution**: Ensure the user role is set to `student_representative` in the database

### Issue: No students visible
**Solution**: Check that representative and students have the same `department` value

### Issue: Cannot send notifications
**Solution**: Verify students belong to the same department as the representative

### Issue: Statistics not loading
**Solution**: Ensure MongoDB connection is active and collections are populated

## Directory Structure

```
server/
  routes/
    representative.js          # Representative API routes
  models/
    User.js                    # Updated with representative fields
  create-representative.js     # Seed script

src/
  pages/
    representative/
      RepresentativeDashboard.tsx
      ManageStudents.tsx
      ViewApplications.tsx
      SendReminders.tsx
      PlacementReport.tsx
  types/
    index.ts                   # Updated with new role type
```

## Next Steps

1. **Create Representative Accounts**: Set up representatives for each department
2. **Configure Departments**: Ensure all students have department field populated
3. **Test Features**: Use the test credentials to explore all features
4. **Customize Templates**: Update notification templates as needed
5. **Train Users**: Provide training to student representatives
6. **Monitor Usage**: Track how representatives use the system

## Support

For technical support or questions:
- Check the main documentation: `STUDENT_REPRESENTATIVE_MODULE.md`
- Review API endpoints in `server/routes/representative.js`
- Contact system administrator

## Version
Current Version: 1.0.0
Last Updated: February 5, 2026
