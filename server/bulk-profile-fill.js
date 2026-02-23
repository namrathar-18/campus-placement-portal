import axios from 'axios';

const students = [
  { name: 'AADHARSH KRISHNAA G', id: '2547201', email: 'aadharsh.krishnaa.g@mca.christuniversity.in' },
  { name: 'ABHINAV JAIN', id: '2547203', email: 'abhinav.jain@mca.christuniversity.in' },
  { name: 'AIMEE SUSAN JOSEPH', id: '2547204', email: 'aimee.susan.joseph@mca.christuniversity.in' },
  { name: 'AJANYA VINAYAN', id: '2547205', email: 'ajanya.vinayan@mca.christuniversity.in' },
  { name: 'AKASHDEEP DEY', id: '2547206', email: 'akashdeep.dey@mca.christuniversity.in' },
  { name: 'ALAN SOJAN', id: '2547208', email: 'alan.sojan@mca.christuniversity.in' },
  { name: 'ALBIN THOMAS', id: '2547209', email: 'albin.thomas@mca.christuniversity.in' },
  { name: 'ALOK TAYAL', id: '2547210', email: 'alok.tayal@mca.christuniversity.in' },
  { name: 'AMOGH VENKAT D', id: '2547211', email: 'amogh.venkat.d@mca.christuniversity.in' },
  { name: 'ANAAMIKA KS', id: '2547212', email: 'anaamika.ks@mca.christuniversity.in' },
  { name: 'ANGEL BLESSY', id: '2547213', email: 'angel.blessy@mca.christuniversity.in' },
  { name: 'ANNETTE ELIZABETH SHONEY', id: '2547216', email: 'annette.elizabeth.shoney@mca.christuniversity.in' },
  { name: 'ANNIE NEENA A A', id: '2547217', email: 'annie.neena.a.a@mca.christuniversity.in' },
  { name: 'B K VISHNU', id: '2547218', email: 'b.k.vishnu@mca.christuniversity.in' },
  { name: 'BHAVYA DHANUKA', id: '2547219', email: 'bhavya.dhanuka@mca.christuniversity.in' },
  { name: 'DINU DEVEES GEORGE', id: '2547220', email: 'dinu.devees.george@mca.christuniversity.in' },
  { name: 'EKTA SINGH', id: '2547221', email: 'ekta.singh@mca.christuniversity.in' },
  { name: 'EMIMA J', id: '2547222', email: 'emima.j@mca.christuniversity.in' },
  { name: 'ENRITA FERNANDES', id: '2547223', email: 'enrita.fernandes@mca.christuniversity.in' },
  { name: 'EVAN JOHN MATHEW', id: '2547224', email: 'evan.john.mathew@mca.christuniversity.in' },
  { name: 'EVANA JOSEPH', id: '2547225', email: 'evana.joseph@mca.christuniversity.in' },
  { name: 'HANNA JOSHY', id: '2547226', email: 'hanna.joshy@mca.christuniversity.in' },
  { name: 'I BLESSY', id: '2547227', email: 'i.blessy@mca.christuniversity.in' },
  { name: 'JAI PAREEK', id: '2547228', email: 'jai.pareek@mca.christuniversity.in' },
  { name: 'KARUN NAGARAJ', id: '2547229', email: 'karun.nagaraj@mca.christuniversity.in' },
  { name: 'KUHELI BEGUM', id: '2547230', email: 'kuheli.begum@mca.christuniversity.in' },
  { name: 'KUNNAL', id: '2547231', email: 'kunnal@mca.christuniversity.in' },
  { name: 'MAHAMAT TAHIR SOULEYMANE', id: '2547232', email: 'mahamat.tahir.souleymane@mca.christuniversity.in' },
  { name: 'MOHAMMED REHAN SAMIR INAMDAR', id: '2547233', email: 'mohammed.rehan.samir.inamdar@mca.christuniversity.in' },
  { name: 'NIRUPAMA VINCENT', id: '2547236', email: 'nirupama.vincent@mca.christuniversity.in' },
  { name: 'OMKAAR CHAKRABORTY', id: '2547237', email: 'omkaar.chakraborty@mca.christuniversity.in' },
  { name: 'PAAVAN GUPTA', id: '2547238', email: 'paavan.gupta@mca.christuniversity.in' },
  { name: 'PRAJWAL KT', id: '2547239', email: 'prajwal.kt@mca.christuniversity.in' },
  { name: 'PRANAV M R', id: '2547240', email: 'pranav.m.r@mca.christuniversity.in' },
  { name: 'R KARAN', id: '2547241', email: 'r.karan@mca.christuniversity.in' },
  { name: 'RAHUL MOHAN GUPTA', id: '2547242', email: 'rahul.mohan.gupta@mca.christuniversity.in' },
  { name: 'RISHI RAJ', id: '2547243', email: 'rishi.raj@mca.christuniversity.in' },
  { name: 'ROY MATHEW', id: '2547244', email: 'roy.mathew@mca.christuniversity.in' },
  { name: 'SACHIN KUMAR D', id: '2547245', email: 'sachin.kumar.d@mca.christuniversity.in' },
  { name: 'SAURABH BURNWAL', id: '2547246', email: 'saurabh.burnwal@mca.christuniversity.in' },
  { name: 'SHARON MATHEW', id: '2547247', email: 'sharon.mathew@mca.christuniversity.in' },
  { name: 'SLAVEN DERICK PAIS', id: '2547249', email: 'slaven.derick.pais@mca.christuniversity.in' },
  { name: 'SNEHA VARGHESE', id: '2547250', email: 'sneha.varghese@mca.christuniversity.in' },
  { name: 'SUDEEPA SANTHANAM', id: '2547252', email: 'sudeepa.santhanam@mca.christuniversity.in' },
  { name: 'VARUN SINGH', id: '2547254', email: 'varun.singh@mca.christuniversity.in' },
  { name: 'VISHWAS VASHISHTHA', id: '2547255', email: 'vishwas.vashishtha@mca.christuniversity.in' },
  { name: 'XAVIER AMITH J', id: '2547256', email: 'xavier.amith.j@mca.christuniversity.in' },
  { name: 'ANANYA M', id: '2547259', email: 'ananya.m@mca.christuniversity.in' },
  { name: 'MISTRY JAMIS', id: '2547260', email: 'mistry.jamis@mca.christuniversity.in' },
  { name: 'MANIARASAN J', id: '2547261', email: 'maniarasan.j@mca.christuniversity.in' },
  { name: 'ANUSHKA SINGH', id: '2547262', email: 'anushka.singh@mca.christuniversity.in' },
];

const API_URL = 'http://localhost:5000/api';

// Generate random 10-digit mobile number
function generateMobileNumber() {
  return Math.floor(6000000000 + Math.random() * 4000000000).toString();
}

// Randomly assign 8.5 or 9.0 CGPA
function generateCGPA() {
  return Math.random() > 0.5 ? 8.5 : 9.0;
}

async function fillStudentProfiles() {
  let success = 0;
  let failed = 0;
  const results = [];

  console.log(`Starting profile fill for ${students.length} students...\n`);

  for (const student of students) {
    try {
      // Step 1: Login to get token
      const loginResponse = await axios.post(`${API_URL}/auth/login`, {
        email: student.email,
        password: student.id, // Register number is password
      });

      if (!loginResponse.data.success) {
        throw new Error('Login failed');
      }

      const token = loginResponse.data.data.token;
      const userId = loginResponse.data.data.id;

      // Step 2: Update profile
      const updateResponse = await axios.put(
        `${API_URL}/users/${userId}`,
        {
          name: student.name,
          registerNumber: student.id,
          department: 'Computer Science',
          section: 'B',
          gpa: generateCGPA(),
          phone: generateMobileNumber(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (updateResponse.data.success) {
        success++;
        results.push({
          name: student.name,
          email: student.email,
          registerNumber: student.id,
          gpa: updateResponse.data.data.gpa,
          phone: updateResponse.data.data.phone,
          status: '✓ Profile filled',
        });
        console.log(`✓ ${student.name} - Register: ${student.id}, CGPA: ${updateResponse.data.data.gpa}, Mobile: ${updateResponse.data.data.phone}`);
      }
    } catch (error) {
      failed++;
      const errorMsg = error.response?.data?.message || error.message;
      results.push({
        name: student.name,
        email: student.email,
        registerNumber: student.id,
        status: `✗ ${errorMsg}`,
      });
      console.log(`✗ ${student.name} - ${errorMsg}`);
    }
  }

  console.log(`\n${'='.repeat(80)}`);
  console.log(`Profile Fill Summary:`);
  console.log(`Total: ${students.length} | Success: ${success} | Failed: ${failed}`);
  console.log(`${'='.repeat(80)}\n`);

  // Save results to file
  const fs = await import('fs');
  fs.writeFileSync(
    'profile-fill-results.json',
    JSON.stringify(results, null, 2)
  );
  console.log('Results saved to profile-fill-results.json');
}

fillStudentProfiles().catch(err => {
  console.error('Error during profile fill:', err.message);
  process.exit(1);
});
