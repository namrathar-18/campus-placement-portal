import axios from 'axios';

const students = [
  { name: 'AADHARSH KRISHNAA G', gender: 'Male', id: '2547201', email: 'aadharsh.krishnaa.g@mca.christuniversity.in' },
  { name: 'ABHINAV JAIN', gender: 'Male', id: '2547203', email: 'abhinav.jain@mca.christuniversity.in' },
  { name: 'AIMEE SUSAN JOSEPH', gender: 'Female', id: '2547204', email: 'aimee.susan.joseph@mca.christuniversity.in' },
  { name: 'AJANYA VINAYAN', gender: 'Female', id: '2547205', email: 'ajanya.vinayan@mca.christuniversity.in' },
  { name: 'AKASHDEEP DEY', gender: 'Male', id: '2547206', email: 'akashdeep.dey@mca.christuniversity.in' },
  { name: 'ALAN SOJAN', gender: 'Male', id: '2547208', email: 'alan.sojan@mca.christuniversity.in' },
  { name: 'ALBIN THOMAS', gender: 'Male', id: '2547209', email: 'albin.thomas@mca.christuniversity.in' },
  { name: 'ALOK TAYAL', gender: 'Male', id: '2547210', email: 'alok.tayal@mca.christuniversity.in' },
  { name: 'AMOGH VENKAT D', gender: 'Male', id: '2547211', email: 'amogh.venkat.d@mca.christuniversity.in' },
  { name: 'ANAAMIKA KS', gender: 'Female', id: '2547212', email: 'anaamika.ks@mca.christuniversity.in' },
  { name: 'ANGEL BLESSY', gender: 'Female', id: '2547213', email: 'angel.blessy@mca.christuniversity.in' },
  { name: 'ANNETTE ELIZABETH SHONEY', gender: 'Female', id: '2547216', email: 'annette.elizabeth.shoney@mca.christuniversity.in' },
  { name: 'ANNIE NEENA A A', gender: 'Female', id: '2547217', email: 'annie.neena.a.a@mca.christuniversity.in' },
  { name: 'B K VISHNU', gender: 'Male', id: '2547218', email: 'b.k.vishnu@mca.christuniversity.in' },
  { name: 'BHAVYA DHANUKA', gender: 'Female', id: '2547219', email: 'bhavya.dhanuka@mca.christuniversity.in' },
  { name: 'DINU DEVEES GEORGE', gender: 'Male', id: '2547220', email: 'dinu.devees.george@mca.christuniversity.in' },
  { name: 'EKTA SINGH', gender: 'Female', id: '2547221', email: 'ekta.singh@mca.christuniversity.in' },
  { name: 'EMIMA J', gender: 'Female', id: '2547222', email: 'emima.j@mca.christuniversity.in' },
  { name: 'ENRITA FERNANDES', gender: 'Female', id: '2547223', email: 'enrita.fernandes@mca.christuniversity.in' },
  { name: 'EVAN JOHN MATHEW', gender: 'Male', id: '2547224', email: 'evan.john.mathew@mca.christuniversity.in' },
  { name: 'EVANA JOSEPH', gender: 'Female', id: '2547225', email: 'evana.joseph@mca.christuniversity.in' },
  { name: 'HANNA JOSHY', gender: 'Female', id: '2547226', email: 'hanna.joshy@mca.christuniversity.in' },
  { name: 'I BLESSY', gender: 'Female', id: '2547227', email: 'i.blessy@mca.christuniversity.in' },
  { name: 'JAI PAREEK', gender: 'Male', id: '2547228', email: 'jai.pareek@mca.christuniversity.in' },
  { name: 'KARUN NAGARAJ', gender: 'Male', id: '2547229', email: 'karun.nagaraj@mca.christuniversity.in' },
  { name: 'KUHELI BEGUM', gender: 'Female', id: '2547230', email: 'kuheli.begum@mca.christuniversity.in' },
  { name: 'KUNNAL', gender: 'Male', id: '2547231', email: 'kunnal@mca.christuniversity.in' },
  { name: 'MAHAMAT TAHIR SOULEYMANE', gender: 'Male', id: '2547232', email: 'mahamat.tahir.souleymane@mca.christuniversity.in' },
  { name: 'MOHAMMED REHAN SAMIR INAMDAR', gender: 'Male', id: '2547233', email: 'mohammed.rehan.samir.inamdar@mca.christuniversity.in' },
  { name: 'NAMRATHA R', gender: 'Female', id: '2547234', email: 'namratha.r@mca.christuniversity.in' },
  { name: 'NIRUPAMA VINCENT', gender: 'Female', id: '2547236', email: 'nirupama.vincent@mca.christuniversity.in' },
  { name: 'OMKAAR CHAKRABORTY', gender: 'Male', id: '2547237', email: 'omkaar.chakraborty@mca.christuniversity.in' },
  { name: 'PAAVAN GUPTA', gender: 'Male', id: '2547238', email: 'paavan.gupta@mca.christuniversity.in' },
  { name: 'PRAJWAL KT', gender: 'Male', id: '2547239', email: 'prajwal.kt@mca.christuniversity.in' },
  { name: 'PRANAV M R', gender: 'Male', id: '2547240', email: 'pranav.m.r@mca.christuniversity.in' },
  { name: 'R KARAN', gender: 'Male', id: '2547241', email: 'r.karan@mca.christuniversity.in' },
  { name: 'RAHUL MOHAN GUPTA', gender: 'Male', id: '2547242', email: 'rahul.mohan.gupta@mca.christuniversity.in' },
  { name: 'RISHI RAJ', gender: 'Male', id: '2547243', email: 'rishi.raj@mca.christuniversity.in' },
  { name: 'ROY MATHEW', gender: 'Male', id: '2547244', email: 'roy.mathew@mca.christuniversity.in' },
  { name: 'SACHIN KUMAR D', gender: 'Male', id: '2547245', email: 'sachin.kumar.d@mca.christuniversity.in' },
  { name: 'SAURABH BURNWAL', gender: 'Male', id: '2547246', email: 'saurabh.burnwal@mca.christuniversity.in' },
  { name: 'SHARON MATHEW', gender: 'Male', id: '2547247', email: 'sharon.mathew@mca.christuniversity.in' },
  { name: 'SLAVEN DERICK PAIS', gender: 'Male', id: '2547249', email: 'slaven.derick.pais@mca.christuniversity.in' },
  { name: 'SNEHA VARGHESE', gender: 'Female', id: '2547250', email: 'sneha.varghese@mca.christuniversity.in' },
  { name: 'SUDEEPA SANTHANAM', gender: 'Female', id: '2547252', email: 'sudeepa.santhanam@mca.christuniversity.in' },
  { name: 'VARUN SINGH', gender: 'Male', id: '2547254', email: 'varun.singh@mca.christuniversity.in' },
  { name: 'VISHWAS VASHISHTHA', gender: 'Male', id: '2547255', email: 'vishwas.vashishtha@mca.christuniversity.in' },
  { name: 'XAVIER AMITH J', gender: 'Male', id: '2547256', email: 'xavier.amith.j@mca.christuniversity.in' },
  { name: 'YASH BARJATYA', gender: 'Male', id: '2547257', email: 'yash.barjatya@mca.christuniversity.in' },
  { name: 'ANANYA M', gender: 'Female', id: '2547259', email: 'ananya.m@mca.christuniversity.in' },
  { name: 'MISTRY JAMIS', gender: 'Male', id: '2547260', email: 'mistry.jamis@mca.christuniversity.in' },
  { name: 'MANIARASAN J', gender: 'Male', id: '2547261', email: 'maniarasan.j@mca.christuniversity.in' },
  { name: 'ANUSHKA SINGH', gender: 'Female', id: '2547262', email: 'anushka.singh@mca.christuniversity.in' },
];

const API_URL = 'http://localhost:5000/api/auth/register';

async function signupStudents() {
  let success = 0;
  let failed = 0;
  const results = [];

  console.log(`Starting signup for ${students.length} students...\n`);

  for (const student of students) {
    try {
      const response = await axios.post(API_URL, {
        name: student.name,
        email: student.email,
        registerNumber: student.id,
        password: student.id, // Register number as password
        gender: student.gender.toLowerCase(),
        role: 'student',
      });

      if (response.data.success) {
        success++;
        results.push({ email: student.email, status: '✓ Signed up', id: student.id });
        console.log(`✓ ${student.name} (${student.email})`);
      }
    } catch (error) {
      failed++;
      const errorMsg = error.response?.data?.message || error.message;
      results.push({ email: student.email, status: `✗ ${errorMsg}`, id: student.id });
      console.log(`✗ ${student.name} - ${errorMsg}`);
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Signup Summary:`);
  console.log(`Total: ${students.length} | Success: ${success} | Failed: ${failed}`);
  console.log(`${'='.repeat(60)}\n`);

  // Save results to file
  const fs = await import('fs');
  fs.writeFileSync(
    'signup-results.json',
    JSON.stringify(results, null, 2)
  );
  console.log('Results saved to signup-results.json');
}

signupStudents().catch(err => {
  console.error('Error during signup:', err.message);
  process.exit(1);
});
