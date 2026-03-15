import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Company from './models/Company.js';
import Application from './models/Application.js';
import connectDB from './config/db.js';
import { defaultCompanies } from './data/defaultCompanies.js';

dotenv.config();

const seedPlacementOfficer = async () => {
  try {
    // Check if placement officer already exists
    const existingOfficer = await User.findOne({ email: 'placement@gmail.com' });

    if (existingOfficer) {
      console.log('Placement officer already exists');
      return;
    }

    // Create placement officer
    const officer = await User.create({
      email: 'placement@gmail.com',
      password: 'password',
      name: 'Placement Officer',
      role: 'placement_officer'
    });

    console.log('Placement officer created successfully');
    console.log('Email: placement@gmail.com');
    console.log('Password: password');
  } catch (error) {
    console.error('Error seeding database:', error.message);
    throw error;
  }
};

const seedStudentRepresentative = async () => {
  try {
    const existingRep = await User.findOne({ email: 'studentrep@gmail.com' });
    if (existingRep) {
      console.log('Student representative already exists');
      return;
    }

    const rep = await User.create({
      email: 'studentrep@gmail.com',
      password: 'studentrep',
      name: 'Student Representative',
      role: 'student_representative'
    });

    console.log('Student representative created successfully');
    console.log('Email: studentrep@gmail.com');
    console.log('Password: studentrep');
  } catch (error) {
    console.error('Error seeding student representative:', error.message);
    throw error;
  }
};

const ensureVishwasStudent = async () => {
  const representative = await User.findOne({ role: 'student_representative' })
    .select('department section');

  const department = representative?.department || 'MCA';
  const section = representative?.section || 'A';

  let vishwas = await User.findOne({ registerNumber: 'VISHWAS001' });

  if (!vishwas) {
    vishwas = await User.create({
      name: 'Vishwas',
      email: 'vishwas@student.demo',
      password: 'password',
      role: 'student',
      registerNumber: 'VISHWAS001',
      department,
      section,
      gpa: 8.1,
      phone: '9000000001',
      gender: 'male',
      isPlaced: false,
    });
    console.log('Demo student Vishwas created.');
  } else {
    await User.findByIdAndUpdate(vishwas._id, {
      department,
      section,
      role: 'student',
      isPlaced: false,
      gpa: vishwas.gpa ?? 8.1,
      phone: vishwas.phone || '9000000001',
      gender: vishwas.gender || 'male',
    });
  }

  return vishwas;
};

const seedDefaultCompanies = async () => {
  try {
    const defaultCompanyNames = defaultCompanies.map((company) => company.name);

    const operations = defaultCompanies.map((company) => ({
      updateOne: {
        filter: { name: company.name },
        update: {
          $set: {
            name: company.name,
            description: company.description,
            industry: company.industry,
            location: company.location,
            websiteUrl: company.websiteUrl || '',
            salary: company.salary,
            min_gpa: company.min_gpa,
            eligibility: company.eligibility,
            deadline: company.deadline,
            role: company.role,
            roles: [company.role],
            requirements: company.requirements || [],
            detailsFile: company.detailsFile || '',
            job_type: company.job_type,
            status: company.status,
            openings: company.openings,
          },
        },
        upsert: true,
      },
    }));

    const result = await Company.bulkWrite(operations, { ordered: false });
    const deleteResult = await Company.deleteMany({ name: { $nin: defaultCompanyNames } });

    console.log(`Companies synced: total=${defaultCompanies.length}, inserted=${result.upsertedCount || 0}, modified=${result.modifiedCount || 0}, removedExtra=${deleteResult.deletedCount || 0}`);
  } catch (error) {
    console.error('Error seeding companies:', error.message);
    throw error;
  }
};

const normalizeRole = (role) => (role || 'Other').trim().replace(/\s+/g, ' ') || 'Other';

const nonApprovedStatusPatterns = [
  ['under_review', 'pending', 'rejected'],
  ['pending', 'rejected', 'under_review'],
  ['rejected', 'pending', 'under_review'],
  ['pending', 'under_review', 'pending'],
];

const approvedRolePlan = [
  'Software Engineer - Backend',
  'Software Engineer - Backend',
  'Software Engineer - Backend',
  'Software Development Engineer',
  'Software Development Engineer',
  'SDE I',
  'Systems Engineer',
  'Systems Engineer',
  'Product Engineer',
  'Product Engineer',
  'Associate Software Engineer',
  'Full Stack Engineer',
  'Programmer Analyst',
  'Project Engineer',
  'Backend Engineer',
  'Backend Engineer',
  'Software Engineer',
  'Software Engineer',
  'Software Engineer',
];

const seedDemoApplications = async () => {
  try {
    const students = await User.find({ role: 'student' })
      .sort({ createdAt: 1 })
      .select('_id name role isPlaced');

    const companies = await Company.find({ status: 'active' })
      .sort({ name: 1 })
      .select('_id name role roles');

    if (students.length === 0 || companies.length === 0) {
      console.log('Skipping application seeding: no students or no active companies found.');
      return;
    }

    await Application.deleteMany({});
    await User.updateMany({ role: 'student' }, { $set: { isPlaced: false } });

    const applicationDocs = [];
    const placedStudentIds = [];

    const companiesByRole = companies.reduce((accumulator, company) => {
      const roleList = (company.roles && company.roles.length ? company.roles : [company.role || 'Other'])
        .map(normalizeRole);

      roleList.forEach((role) => {
        if (!accumulator[role]) {
          accumulator[role] = [];
        }
        accumulator[role].push(company);
      });

      return accumulator;
    }, {});

    const roleCursor = Object.keys(companiesByRole).reduce((accumulator, role) => {
      accumulator[role] = 0;
      return accumulator;
    }, {});

    const getCompanyForRole = (role, fallbackIndex) => {
      const normalizedRole = normalizeRole(role);
      const roleCompanies = companiesByRole[normalizedRole] || [];

      if (roleCompanies.length > 0) {
        const pointer = roleCursor[normalizedRole] || 0;
        const picked = roleCompanies[pointer % roleCompanies.length];
        roleCursor[normalizedRole] = pointer + 1;
        return picked;
      }

      return companies[fallbackIndex % companies.length];
    };

    students.forEach((student, studentIndex) => {
      const targetCount = Math.min(3 + (studentIndex % 2), companies.length);
      const startIndex = (studentIndex * 3) % companies.length;

      const approvedRole = studentIndex < approvedRolePlan.length ? approvedRolePlan[studentIndex] : null;
      const approvedCompany = approvedRole
        ? getCompanyForRole(approvedRole, startIndex)
        : null;

      const selectedCompanies = [];
      const selectedIds = new Set();

      if (approvedCompany) {
        selectedCompanies.push(approvedCompany);
        selectedIds.add(String(approvedCompany._id));
      }

      if (!approvedCompany) {
        let scanOffset = 0;
        while (selectedCompanies.length < targetCount && scanOffset < companies.length * 2) {
          const candidate = companies[(startIndex + scanOffset) % companies.length];
          const candidateId = String(candidate._id);
          if (!selectedIds.has(candidateId)) {
            selectedCompanies.push(candidate);
            selectedIds.add(candidateId);
          }
          scanOffset += 1;
        }
      }

      const nonApprovedPlan = nonApprovedStatusPatterns[studentIndex % nonApprovedStatusPatterns.length];
      let nonApprovedIndex = 0;

      selectedCompanies.forEach((company, companyIndex) => {
        const isApprovedCompany = approvedCompany && String(company._id) === String(approvedCompany._id);
        const status = isApprovedCompany
          ? 'approved'
          : nonApprovedPlan[nonApprovedIndex++ % nonApprovedPlan.length];

        const daysAgo = (studentIndex * 4 + companyIndex * 2) % 35;
        const appliedDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

        applicationDocs.push({
          studentId: student._id,
          companyId: company._id,
          status,
          appliedDate,
          remarks:
            status === 'approved'
              ? 'Selected after technical and HR rounds.'
              : status === 'under_review'
              ? 'Awaiting final interviewer feedback.'
              : status === 'rejected'
              ? 'Profile did not match current role requirements.'
              : 'Application submitted and screening in progress.',
          updatedAt: new Date(appliedDate.getTime() + ((studentIndex + companyIndex) % 6) * 24 * 60 * 60 * 1000),
        });
      });

      if (approvedCompany) {
        placedStudentIds.push(student._id);
      }
    });

    if (applicationDocs.length > 0) {
      await Application.insertMany(applicationDocs, { ordered: false });
    }

    if (placedStudentIds.length > 0) {
      await User.updateMany(
        { _id: { $in: placedStudentIds } },
        { $set: { isPlaced: true } }
      );
    }

    const statusCounts = await Application.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    console.log(
      `Applications seeded: total=${applicationDocs.length}, students=${students.length}, placed=${placedStudentIds.length}`
    );
    console.log(
      `Status mix: ${statusCounts.map((row) => `${row._id}:${row.count}`).join(', ')}`
    );
  } catch (error) {
    console.error('Error seeding applications:', error.message);
    throw error;
  }
};

const seedVishwasApplications = async () => {
  try {
    const vishwas = await User.findOne({ registerNumber: 'VISHWAS001', role: 'student' }).select('_id');
    if (!vishwas) {
      console.log('Skipping Vishwas applications: student not found.');
      return;
    }

    const companies = await Company.find({ status: 'active' })
      .sort({ name: 1 })
      .limit(4)
      .select('_id name');

    if (companies.length < 4) {
      console.log('Skipping Vishwas applications: fewer than 4 active companies available.');
      return;
    }

    await Application.deleteMany({ studentId: vishwas._id });

    const statuses = ['pending', 'under_review', 'rejected', 'pending'];
    const now = Date.now();

    const docs = companies.map((company, index) => {
      const appliedDate = new Date(now - (index + 2) * 24 * 60 * 60 * 1000);
      const status = statuses[index];

      return {
        studentId: vishwas._id,
        companyId: company._id,
        status,
        appliedDate,
        remarks:
          status === 'under_review'
            ? 'Technical interview scheduled.'
            : status === 'rejected'
            ? 'Did not clear screening criteria.'
            : 'Application submitted and awaiting action.',
        updatedAt: new Date(appliedDate.getTime() + 12 * 60 * 60 * 1000),
      };
    });

    await Application.insertMany(docs, { ordered: false });
    await User.findByIdAndUpdate(vishwas._id, { isPlaced: false });

    console.log('Vishwas scenario seeded: 4 applications with mixed statuses.');
  } catch (error) {
    console.error('Error seeding Vishwas applications:', error.message);
    throw error;
  }
};

const seedAll = async () => {
  try {
    await connectDB();
    await seedPlacementOfficer();
    await seedStudentRepresentative();
    await ensureVishwasStudent();
    await seedDefaultCompanies();
    await seedDemoApplications();
    await seedVishwasApplications();
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
};

seedAll();
