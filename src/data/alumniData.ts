export interface Alumni {
  name: string;
  batch: string;
  currentCompany: string;
  role: string;
  linkedin: string;
  email: string;
  workHistory?: {
    company: string;
    role: string;
    fromYear: string;
    toYear: string;
  }[];
}

const baseAlumniData: Alumni[] = [
  // Google (3 alumni)
  {
    name: 'Saurabh Gupta',
    batch: '2022',
    currentCompany: 'Google',
    role: 'Software Engineer',
    linkedin: 'https://linkedin.com/in/saurabh-gupta',
    email: 'saurabh.gupta@google.com',
  },
  {
    name: 'Nikhil Shetty',
    batch: '2020',
    currentCompany: 'Google',
    role: 'Site Reliability Engineer',
    linkedin: 'https://linkedin.com/in/nikhil-shetty',
    email: 'nikhil.shetty@google.com',
  },
  {
    name: 'Arjun Mehta',
    batch: '2023',
    currentCompany: 'Google',
    role: 'Product Engineer',
    linkedin: 'https://linkedin.com/in/arjun-mehta',
    email: 'arjun.mehta@google.com',
  },
  // Microsoft (3 alumni)
  {
    name: 'Kavya Nambiar',
    batch: '2024',
    currentCompany: 'Microsoft',
    role: 'Software Engineer',
    linkedin: 'https://linkedin.com/in/kavya-nambiar',
    email: 'kavya.nambiar@microsoft.com',
  },
  {
    name: 'Rahul Desai',
    batch: '2022',
    currentCompany: 'Microsoft',
    role: 'Cloud Solutions Engineer',
    linkedin: 'https://linkedin.com/in/rahul-desai',
    email: 'rahul.desai@microsoft.com',
  },
  {
    name: 'Anjali Dhawan',
    batch: '2021',
    currentCompany: 'Microsoft',
    role: 'Full Stack Developer',
    linkedin: 'https://linkedin.com/in/anjali-dhawan',
    email: 'anjali.dhawan@microsoft.com',
  },
  // Amazon (3 alumni)
  {
    name: 'Pooja Chawla',
    batch: '2021',
    currentCompany: 'Amazon',
    role: 'Backend Engineer',
    linkedin: 'https://linkedin.com/in/pooja-chawla',
    email: 'pooja.chawla@amazon.com',
  },
  {
    name: 'Reema Mathew',
    batch: '2024',
    currentCompany: 'Amazon',
    role: 'Product Analyst',
    linkedin: 'https://linkedin.com/in/reema-mathew',
    email: 'reema.mathew@amazon.com',
  },
  {
    name: 'Varun Agarwal',
    batch: '2020',
    currentCompany: 'Amazon',
    role: 'SDE II',
    linkedin: 'https://linkedin.com/in/varun-agarwal',
    email: 'varun.agarwal@amazon.com',
  },
  // Flipkart (2 alumni)
  {
    name: 'Nitin Arora',
    batch: '2020',
    currentCompany: 'Flipkart',
    role: 'SDE I',
    linkedin: 'https://linkedin.com/in/nitin-arora',
    email: 'nitin.arora@flipkart.com',
  },
  {
    name: 'Priya Sharma',
    batch: '2023',
    currentCompany: 'Flipkart',
    role: 'Backend Engineer',
    linkedin: 'https://linkedin.com/in/priya-sharma',
    email: 'priya.sharma@flipkart.com',
  },
  // Razorpay (3 alumni)
  {
    name: 'Ritu Malhotra',
    batch: '2024',
    currentCompany: 'Razorpay',
    role: 'Backend Engineer',
    linkedin: 'https://linkedin.com/in/ritu-malhotra',
    email: 'ritu.malhotra@razorpay.com',
  },
  {
    name: 'Chirag Modi',
    batch: '2023',
    currentCompany: 'Razorpay',
    role: 'Security Engineer',
    linkedin: 'https://linkedin.com/in/chirag-modi',
    email: 'chirag.modi@razorpay.com',
  },
  {
    name: 'Deepika Rao',
    batch: '2022',
    currentCompany: 'Razorpay',
    role: 'FullStack Engineer',
    linkedin: 'https://linkedin.com/in/deepika-rao',
    email: 'deepika.rao@razorpay.com',
  },
  // Swiggy (3 alumni)
  {
    name: 'Siddharth Roy',
    batch: '2022',
    currentCompany: 'Swiggy',
    role: 'Backend Engineer',
    linkedin: 'https://linkedin.com/in/siddharth-roy',
    email: 'siddharth.roy@swiggy.com',
  },
  {
    name: 'Sanjana Prasad',
    batch: '2022',
    currentCompany: 'Swiggy',
    role: 'Backend Engineer',
    linkedin: 'https://linkedin.com/in/sanjana-prasad',
    email: 'sanjana.prasad@swiggy.com',
  },
  {
    name: 'Karan Joshi',
    batch: '2023',
    currentCompany: 'Swiggy',
    role: 'Software Engineer',
    linkedin: 'https://linkedin.com/in/karan-joshi',
    email: 'karan.joshi@swiggy.com',
  },
  // Zoho (3 alumni)
  {
    name: 'Megha Pillai',
    batch: '2019',
    currentCompany: 'Zoho',
    role: 'Product Engineer',
    linkedin: 'https://linkedin.com/in/megha-pillai',
    email: 'megha.pillai@zoho.com',
  },
  {
    name: 'Kunal Batra',
    batch: '2021',
    currentCompany: 'Zoho',
    role: 'Technical Support Engineer',
    linkedin: 'https://linkedin.com/in/kunal-batra',
    email: 'kunal.batra@zoho.com',
  },
  {
    name: 'Vipul Singh',
    batch: '2020',
    currentCompany: 'Zoho',
    role: 'Senior Developer',
    linkedin: 'https://linkedin.com/in/vipul-singh',
    email: 'vipul.singh@zoho.com',
  },
  // Freshworks (2 alumni)
  {
    name: 'Manish Tiwari',
    batch: '2023',
    currentCompany: 'Freshworks',
    role: 'Full Stack Engineer',
    linkedin: 'https://linkedin.com/in/manish-tiwari',
    email: 'manish.tiwari@freshworks.com',
  },
  {
    name: 'Sneha Patel',
    batch: '2022',
    currentCompany: 'Freshworks',
    role: 'Frontend Engineer',
    linkedin: 'https://linkedin.com/in/sneha-patel',
    email: 'sneha.patel@freshworks.com',
  },
  // TCS (3 alumni)
  {
    name: 'Aarav Nair',
    batch: '2022',
    currentCompany: 'TCS',
    role: 'Software Engineer',
    linkedin: 'https://linkedin.com/in/aarav-nair',
    email: 'aarav.nair@tcs.com',
  },
  {
    name: 'Arjun Kapoor',
    batch: '2024',
    currentCompany: 'TCS',
    role: 'Data Engineer',
    linkedin: 'https://linkedin.com/in/arjun-kapoor',
    email: 'arjun.kapoor@tcs.com',
  },
  {
    name: 'Divya Roy',
    batch: '2023',
    currentCompany: 'TCS',
    role: 'Systems Engineer',
    linkedin: 'https://linkedin.com/in/divya-roy',
    email: 'divya.roy@tcs.com',
  },
  // Infosys (3 alumni)
  {
    name: 'Isha Reddy',
    batch: '2021',
    currentCompany: 'Infosys',
    role: 'Systems Engineer',
    linkedin: 'https://linkedin.com/in/isha-reddy',
    email: 'isha.reddy@infosys.com',
  },
  {
    name: 'Pallavi Sen',
    batch: '2023',
    currentCompany: 'Infosys',
    role: 'Cloud Engineer',
    linkedin: 'https://linkedin.com/in/pallavi-sen',
    email: 'pallavi.sen@infosys.com',
  },
  {
    name: 'Rohit Verma',
    batch: '2022',
    currentCompany: 'Infosys',
    role: 'Digital Specialist',
    linkedin: 'https://linkedin.com/in/rohit-verma',
    email: 'rohit.verma@infosys.com',
  },
  // Wipro (2 alumni)
  {
    name: 'Karthik Menon',
    batch: '2020',
    currentCompany: 'Wipro',
    role: 'Project Engineer',
    linkedin: 'https://linkedin.com/in/karthik-menon',
    email: 'karthik.menon@wipro.com',
  },
  {
    name: 'Hemant Dubey',
    batch: '2022',
    currentCompany: 'Wipro',
    role: 'Full Stack Developer',
    linkedin: 'https://linkedin.com/in/hemant-dubey',
    email: 'hemant.dubey@wipro.com',
  },
  // Accenture (3 alumni)
  {
    name: 'Rohan Bhatia',
    batch: '2023',
    currentCompany: 'Accenture',
    role: 'Associate Software Engineer',
    linkedin: 'https://linkedin.com/in/rohan-bhatia',
    email: 'rohan.bhatia@accenture.com',
  },
  {
    name: 'Lakshmi Narayanan',
    batch: '2021',
    currentCompany: 'Accenture',
    role: 'Cloud Analyst',
    linkedin: 'https://linkedin.com/in/lakshmi-narayanan',
    email: 'lakshmi.narayanan@accenture.com',
  },
  {
    name: 'Vishal Kumar',
    batch: '2024',
    currentCompany: 'Accenture',
    role: 'Technology Analyst',
    linkedin: 'https://linkedin.com/in/vishal-kumar',
    email: 'vishal.kumar@accenture.com',
  },
  // Cognizant (2 alumni)
  {
    name: 'Ananya Iyer',
    batch: '2024',
    currentCompany: 'Cognizant',
    role: 'Programmer Analyst',
    linkedin: 'https://linkedin.com/in/ananya-iyer',
    email: 'ananya.iyer@cognizant.com',
  },
  {
    name: 'Amit Gupta',
    batch: '2022',
    currentCompany: 'Cognizant',
    role: 'Associate',
    linkedin: 'https://linkedin.com/in/amit-gupta',
    email: 'amit.gupta@cognizant.com',
  },
  // LTIMindtree (2 alumni)
  {
    name: 'Aditya Rao',
    batch: '2020',
    currentCompany: 'LTIMindtree',
    role: 'Software Engineer',
    linkedin: 'https://linkedin.com/in/aditya-rao',
    email: 'aditya.rao@ltimindtree.com',
  },
  {
    name: 'Pooja Nair',
    batch: '2023',
    currentCompany: 'LTIMindtree',
    role: 'Java Developer',
    linkedin: 'https://linkedin.com/in/pooja-nair',
    email: 'pooja.nair@ltimindtree.com',
  },
  // Oracle (2 alumni)
  {
    name: 'Rahul Joshi',
    batch: '2023',
    currentCompany: 'Oracle',
    role: 'Software Engineer',
    linkedin: 'https://linkedin.com/in/rahul-joshi',
    email: 'rahul.joshi@oracle.com',
  },
  {
    name: 'Nisha Reddy',
    batch: '2022',
    currentCompany: 'Oracle',
    role: 'Database Developer',
    linkedin: 'https://linkedin.com/in/nisha-reddy',
    email: 'nisha.reddy@oracle.com',
  },
  // Zomato (2 alumni)
  {
    name: 'Bhavna Singh',
    batch: '2021',
    currentCompany: 'Zomato',
    role: 'Backend Engineer',
    linkedin: 'https://linkedin.com/in/bhavna-singh',
    email: 'bhavna.singh@zomato.com',
  },
  {
    name: 'Sameer Khanna',
    batch: '2023',
    currentCompany: 'Zomato',
    role: 'Software Engineer',
    linkedin: 'https://linkedin.com/in/sameer-khanna',
    email: 'sameer.khanna@zomato.com',
  },
  // Paytm (2 alumni)
  {
    name: 'Akshay Patil',
    batch: '2022',
    currentCompany: 'Paytm',
    role: 'Software Development Engineer',
    linkedin: 'https://linkedin.com/in/akshay-patil',
    email: 'akshay.patil@paytm.com',
  },
  {
    name: 'Tanmay Shah',
    batch: '2024',
    currentCompany: 'Paytm',
    role: 'Backend Developer',
    linkedin: 'https://linkedin.com/in/tanmay-shah',
    email: 'tanmay.shah@paytm.com',
  },
  // PhonePe (2 alumni)
  {
    name: 'Divya Krishnan',
    batch: '2021',
    currentCompany: 'PhonePe',
    role: 'Backend Engineer',
    linkedin: 'https://linkedin.com/in/divya-krishnan',
    email: 'divya.krishnan@phonepe.com',
  },
  {
    name: 'Arun Kumar',
    batch: '2023',
    currentCompany: 'PhonePe',
    role: 'Software Engineer',
    linkedin: 'https://linkedin.com/in/arun-kumar',
    email: 'arun.kumar@phonepe.com',
  },
  // Groww (2 alumni)
  {
    name: 'Abhishek Jain',
    batch: '2023',
    currentCompany: 'Groww',
    role: 'Backend Engineer',
    linkedin: 'https://linkedin.com/in/abhishek-jain',
    email: 'abhishek.jain@groww.in',
  },
  {
    name: 'Riya Kapoor',
    batch: '2022',
    currentCompany: 'Groww',
    role: 'Product Engineer',
    linkedin: 'https://linkedin.com/in/riya-kapoor',
    email: 'riya.kapoor@groww.in',
  },
  // CRED (2 alumni)
  {
    name: 'Tanvi Deshpande',
    batch: '2024',
    currentCompany: 'CRED',
    role: 'Android Developer',
    linkedin: 'https://linkedin.com/in/tanvi-deshpande',
    email: 'tanvi.deshpande@cred.club',
  },
  {
    name: 'Karthik Bose',
    batch: '2023',
    currentCompany: 'CRED',
    role: 'Mobile Engineer',
    linkedin: 'https://linkedin.com/in/karthik-bose',
    email: 'karthik.bose@cred.club',
  },
];

const formerEmploymentByName: Record<string, { company: string; role: string; fromYear: string; toYear: string }[]> = {
  'Saurabh Gupta': [{ company: 'Microsoft', role: 'Software Engineer Intern', fromYear: '2022', toYear: '2023' }],
  'Nikhil Shetty': [{ company: 'Flipkart', role: 'Site Reliability Engineer', fromYear: '2020', toYear: '2022' }],
  'Arjun Mehta': [{ company: 'Amazon', role: 'SDE I', fromYear: '2023', toYear: '2024' }],
  'Kavya Nambiar': [{ company: 'Oracle', role: 'Application Developer', fromYear: '2024', toYear: '2025' }],
  'Rahul Desai': [{ company: 'Accenture', role: 'Associate Engineer', fromYear: '2022', toYear: '2024' }],
  'Anjali Dhawan': [{ company: 'Infosys', role: 'Systems Engineer', fromYear: '2021', toYear: '2023' }],
  'Pooja Chawla': [{ company: 'Flipkart', role: 'Backend Engineer', fromYear: '2021', toYear: '2023' }],
  'Reema Mathew': [{ company: 'Razorpay', role: 'Product Analyst', fromYear: '2024', toYear: '2025' }],
  'Varun Agarwal': [{ company: 'Microsoft', role: 'SDE I', fromYear: '2020', toYear: '2022' }],
  'Nitin Arora': [{ company: 'Amazon', role: 'SDE I', fromYear: '2020', toYear: '2022' }],
  'Priya Sharma': [{ company: 'Swiggy', role: 'Backend Engineer', fromYear: '2023', toYear: '2024' }],
  'Ritu Malhotra': [{ company: 'Paytm', role: 'Backend Developer', fromYear: '2024', toYear: '2025' }],
  'Chirag Modi': [{ company: 'PhonePe', role: 'Security Engineer', fromYear: '2023', toYear: '2024' }],
  'Deepika Rao': [{ company: 'Zoho', role: 'Full Stack Developer', fromYear: '2022', toYear: '2024' }],
  'Siddharth Roy': [{ company: 'Zomato', role: 'Product Analyst', fromYear: '2022', toYear: '2024' }],
  'Sanjana Prasad': [{ company: 'Paytm', role: 'Backend Engineer', fromYear: '2022', toYear: '2024' }],
  'Karan Joshi': [{ company: 'Flipkart', role: 'Software Engineer', fromYear: '2023', toYear: '2024' }],
  'Megha Pillai': [{ company: 'Freshworks', role: 'Support Engineer', fromYear: '2019', toYear: '2021' }],
  'Kunal Batra': [{ company: 'TCS', role: 'Technical Support Engineer', fromYear: '2021', toYear: '2023' }],
  'Vipul Singh': [{ company: 'Infosys', role: 'Senior Developer', fromYear: '2020', toYear: '2022' }],
  'Manish Tiwari': [{ company: 'Zoho', role: 'Full Stack Engineer', fromYear: '2023', toYear: '2024' }],
  'Sneha Patel': [{ company: 'Razorpay', role: 'Frontend Engineer', fromYear: '2022', toYear: '2024' }],
  'Aarav Nair': [{ company: 'Infosys', role: 'Systems Engineer', fromYear: '2022', toYear: '2024' }],
  'Arjun Kapoor': [{ company: 'Cognizant', role: 'Data Engineer', fromYear: '2024', toYear: '2025' }],
  'Divya Roy': [{ company: 'Wipro', role: 'Systems Engineer', fromYear: '2023', toYear: '2024' }],
  'Isha Reddy': [{ company: 'TCS', role: 'Assistant Systems Engineer', fromYear: '2021', toYear: '2023' }],
  'Pallavi Sen': [{ company: 'Accenture', role: 'Cloud Engineer', fromYear: '2023', toYear: '2024' }],
  'Rohit Verma': [{ company: 'Wipro', role: 'Digital Specialist', fromYear: '2022', toYear: '2024' }],
  'Karthik Menon': [{ company: 'Cognizant', role: 'Programmer Analyst', fromYear: '2020', toYear: '2022' }],
  'Hemant Dubey': [{ company: 'LTIMindtree', role: 'Full Stack Developer', fromYear: '2022', toYear: '2024' }],
  'Rohan Bhatia': [{ company: 'TCS', role: 'Cloud Associate', fromYear: '2023', toYear: '2024' }],
  'Lakshmi Narayanan': [{ company: 'Infosys', role: 'Cloud Analyst', fromYear: '2021', toYear: '2023' }],
  'Vishal Kumar': [{ company: 'Cognizant', role: 'Technology Analyst', fromYear: '2024', toYear: '2025' }],
  'Ananya Iyer': [{ company: 'Wipro', role: 'Programmer Analyst', fromYear: '2024', toYear: '2025' }],
  'Amit Gupta': [{ company: 'Infosys', role: 'Associate', fromYear: '2022', toYear: '2024' }],
  'Aditya Rao': [{ company: 'Accenture', role: 'Software Engineer', fromYear: '2020', toYear: '2022' }],
  'Pooja Nair': [{ company: 'Wipro', role: 'Java Developer', fromYear: '2023', toYear: '2024' }],
  'Rahul Joshi': [{ company: 'TCS', role: 'DBA Analyst', fromYear: '2023', toYear: '2024' }],
  'Nisha Reddy': [{ company: 'Infosys', role: 'Database Developer', fromYear: '2022', toYear: '2024' }],
  'Bhavna Singh': [{ company: 'Swiggy', role: 'Business Analyst', fromYear: '2021', toYear: '2023' }],
  'Sameer Khanna': [{ company: 'Flipkart', role: 'Software Engineer', fromYear: '2023', toYear: '2024' }],
  'Akshay Patil': [{ company: 'PhonePe', role: 'SDE I', fromYear: '2022', toYear: '2024' }],
  'Tanmay Shah': [{ company: 'Groww', role: 'Backend Developer', fromYear: '2024', toYear: '2025' }],
  'Divya Krishnan': [{ company: 'Razorpay', role: 'Data Associate', fromYear: '2021', toYear: '2023' }],
  'Arun Kumar': [{ company: 'Paytm', role: 'Software Engineer', fromYear: '2023', toYear: '2024' }],
  'Abhishek Jain': [{ company: 'PhonePe', role: 'Backend Engineer', fromYear: '2023', toYear: '2025' }],
  'Riya Kapoor': [{ company: 'Razorpay', role: 'Product Engineer', fromYear: '2022', toYear: '2024' }],
  'Tanvi Deshpande': [{ company: 'Swiggy', role: 'Android Engineer', fromYear: '2024', toYear: '2025' }],
  'Karthik Bose': [{ company: 'Zoho', role: 'Mobile Engineer', fromYear: '2023', toYear: '2024' }],
};

const toPersonalEmail = (name: string) =>
  `${name.toLowerCase().replace(/\s+/g, '.')}@gmail.com`;

const currentFromYear = (batch: string) => {
  const parsed = Number(batch);
  if (Number.isNaN(parsed)) {
    return '2023';
  }
  return String(Math.min(parsed + 1, 2025));
};

export const alumniData: Alumni[] = baseAlumniData.map((alumni) => {
  const previousRoles = formerEmploymentByName[alumni.name] || [];
  return {
    ...alumni,
    email: toPersonalEmail(alumni.name),
    workHistory: [
      ...previousRoles,
      {
        company: alumni.currentCompany,
        role: alumni.role,
        fromYear: currentFromYear(alumni.batch),
        toYear: 'Present',
      },
    ],
  };
});
