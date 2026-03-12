import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';

dotenv.config();

// Gender data from bulk-signup (email → gender)
const genderMap = {
  'aadharsh.krishnaa.g@mca.christuniversity.in': 'male',
  'abhinav.jain@mca.christuniversity.in': 'male',
  'aimee.susan.joseph@mca.christuniversity.in': 'female',
  'ajanya.vinayan@mca.christuniversity.in': 'female',
  'akashdeep.dey@mca.christuniversity.in': 'male',
  'alan.sojan@mca.christuniversity.in': 'male',
  'albin.thomas@mca.christuniversity.in': 'male',
  'alok.tayal@mca.christuniversity.in': 'male',
  'amogh.venkat.d@mca.christuniversity.in': 'male',
  'anaamika.ks@mca.christuniversity.in': 'female',
  'angel.blessy@mca.christuniversity.in': 'female',
  'annette.elizabeth.shoney@mca.christuniversity.in': 'female',
  'annie.neena.a.a@mca.christuniversity.in': 'female',
  'b.k.vishnu@mca.christuniversity.in': 'male',
  'bhavya.dhanuka@mca.christuniversity.in': 'female',
  'dinu.devees.george@mca.christuniversity.in': 'male',
  'ekta.singh@mca.christuniversity.in': 'female',
  'emima.j@mca.christuniversity.in': 'female',
  'enrita.fernandes@mca.christuniversity.in': 'female',
  'evan.john.mathew@mca.christuniversity.in': 'male',
  'evana.joseph@mca.christuniversity.in': 'female',
  'hanna.joshy@mca.christuniversity.in': 'female',
  'i.blessy@mca.christuniversity.in': 'female',
  'jai.pareek@mca.christuniversity.in': 'male',
  'karun.nagaraj@mca.christuniversity.in': 'male',
  'kuheli.begum@mca.christuniversity.in': 'female',
  'kunnal@mca.christuniversity.in': 'male',
  'mahamat.tahir.souleymane@mca.christuniversity.in': 'male',
  'mohammed.rehan.samir.inamdar@mca.christuniversity.in': 'male',
  'namratha.r@mca.christuniversity.in': 'female',
  'nirupama.vincent@mca.christuniversity.in': 'female',
  'omkaar.chakraborty@mca.christuniversity.in': 'male',
  'paavan.gupta@mca.christuniversity.in': 'male',
  'prajwal.kt@mca.christuniversity.in': 'male',
  'pranav.m.r@mca.christuniversity.in': 'male',
  'r.karan@mca.christuniversity.in': 'male',
  'rahul.mohan.gupta@mca.christuniversity.in': 'male',
  'rishi.raj@mca.christuniversity.in': 'male',
  'roy.mathew@mca.christuniversity.in': 'male',
  'sachin.kumar.d@mca.christuniversity.in': 'male',
  'saurabh.burnwal@mca.christuniversity.in': 'male',
  'sharon.mathew@mca.christuniversity.in': 'male',
  'slaven.derick.pais@mca.christuniversity.in': 'male',
  'sneha.varghese@mca.christuniversity.in': 'female',
  'sudeepa.santhanam@mca.christuniversity.in': 'female',
  'varun.singh@mca.christuniversity.in': 'male',
  'vishwas.vashishtha@mca.christuniversity.in': 'male',
  'xavier.amith.j@mca.christuniversity.in': 'male',
  'yash.barjatya@mca.christuniversity.in': 'male',
  'ananya.m@mca.christuniversity.in': 'female',
  'mistry.jamis@mca.christuniversity.in': 'male',
  'maniarasan.j@mca.christuniversity.in': 'male',
  'anushka.singh@mca.christuniversity.in': 'female',
};

const run = async () => {
  await connectDB();

  const students = await User.find({ role: 'student', gender: { $in: [null, undefined, ''] } }).lean();
  console.log(`Found ${students.length} students without gender\n`);

  let updated = 0;
  let skipped = 0;

  for (const student of students) {
    const email = student.email?.toLowerCase();
    const gender = genderMap[email];
    if (gender) {
      await User.findByIdAndUpdate(student._id, { gender });
      console.log(`✓ ${student.name} (${email}) → ${gender}`);
      updated++;
    } else {
      console.log(`- ${student.name} (${email}) → no data`);
      skipped++;
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Updated: ${updated} | No data: ${skipped}`);
  console.log(`${'='.repeat(60)}`);

  await mongoose.disconnect();
};

run().catch(console.error);
