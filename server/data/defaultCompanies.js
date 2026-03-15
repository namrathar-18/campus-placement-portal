const companyHiringFocus = {
  'Anuki Technologies': 'Build backend services for workflow automation, candidate scoring, and recruiter analytics dashboards.',
  'Google': 'Work on large-scale distributed systems for search, ads, and cloud-native developer platforms.',
  'Microsoft': 'Contribute to Azure and M365 services with focus on reliability, observability, and platform scale.',
  'Amazon': 'Develop core backend services for commerce and cloud workloads with high throughput and low latency.',
  'Flipkart': 'Deliver features across catalog, checkout, and supply chain systems in a microservices ecosystem.',
  'Razorpay': 'Build secure payment APIs, merchant onboarding flows, and transaction reconciliation pipelines.',
  'Swiggy': 'Improve order lifecycle, dispatch, and partner integrations for real-time logistics systems.',
  'Zoho': 'Develop end-to-end SaaS product modules used by business users across CRM and productivity tools.',
  'Freshworks': 'Ship full-stack customer experience features with scalable APIs and responsive web interfaces.',
  'TCS': 'Support enterprise client projects across development, integration, quality, and production support.',
  'Infosys': 'Join structured engineering projects with training-first model in full-stack and digital transformation.',
  'Wipro': 'Work on delivery projects for application enhancement, testing, and production incident resolution.',
  'Accenture': 'Build modernization and cloud migration solutions for global consulting engagements.',
  'Cognizant': 'Contribute to software delivery and QA automation streams for enterprise products.',
  'LTIMindtree': 'Develop APIs and cloud-native integrations for modernization programs across domains.',
  'Oracle': 'Engineer enterprise cloud and database platform capabilities with performance-focused design.',
  'Zomato': 'Build low-latency backend systems for order orchestration and restaurant discovery journeys.',
  'Paytm': 'Develop payments and merchant platform services with transaction reliability and fraud controls.',
  'PhonePe': 'Build UPI and merchant payment backend services focused on security, resilience, and latency.',
  'Groww': 'Develop investment platform APIs for order routing, portfolio services, and market data workflows.',
};

const companyTechStack = {
  'Anuki Technologies': 'Node.js, TypeScript, PostgreSQL, Redis, Docker, AWS',
  'Google': 'Java/C++, Go, Python, Kubernetes, gRPC, BigQuery',
  'Microsoft': 'C#, .NET, TypeScript, Azure, Cosmos DB, Kubernetes',
  'Amazon': 'Java, Python, AWS, DynamoDB, SQS/SNS, Kafka',
  'Flipkart': 'Java, Spring Boot, MySQL, Kafka, Redis, React',
  'Razorpay': 'Java/Go, PostgreSQL, Redis, Kafka, Kubernetes',
  'Swiggy': 'Java, Node.js, MySQL, Redis, Kafka, AWS',
  'Zoho': 'Java, JavaScript, SQL, Linux, distributed web services',
  'Freshworks': 'React, TypeScript, Node.js, PostgreSQL, Redis, AWS',
  'TCS': 'Java/Python, SQL, REST APIs, Git, CI/CD',
  'Infosys': 'Java, Spring Boot, SQL, cloud fundamentals, testing tools',
  'Wipro': 'Java/.NET/Python, SQL, service integration, test automation',
  'Accenture': 'Java, Python, cloud services, APIs, DevOps pipelines',
  'Cognizant': 'Java/.NET, SQL, Selenium, REST services, CI tooling',
  'LTIMindtree': 'Java, Spring, React, Docker, Kubernetes, AWS',
  'Oracle': 'Java, SQL/PLSQL, OCI, Linux, distributed systems',
  'Zomato': 'Java/Go, PostgreSQL, Redis, Kafka, containerized deployments',
  'Paytm': 'Java, Spring Boot, MySQL, Redis, event-driven systems',
  'PhonePe': 'Java/Kotlin, MySQL/Cassandra, Redis, Kafka, Kubernetes',
  'Groww': 'Java/Python, PostgreSQL, Redis, Kafka, low-latency services',
};

const officialCompanyCareerUrls = {
  'Anuki Technologies': 'https://www.anukitechnologies.com/careers',
  Google: 'https://www.google.com/about/careers/applications/',
  Microsoft: 'https://careers.microsoft.com/v2/global/en/home.html',
  Amazon: 'https://www.amazon.jobs/',
  Flipkart: 'https://www.flipkartcareers.com/#!/joblist',
  Razorpay: 'https://razorpay.com/jobs/',
  Swiggy: 'https://careers.swiggy.com/',
  Zoho: 'https://www.zoho.com/careers/',
  Freshworks: 'https://www.freshworks.com/company/careers/',
  TCS: 'https://www.tcs.com/careers',
  Infosys: 'https://www.infosys.com/careers/',
  Wipro: 'https://careers.wipro.com/',
  Accenture: 'https://www.accenture.com/in-en/careers',
  Cognizant: 'https://careers.cognizant.com/global/en',
  LTIMindtree: 'https://www.ltimindtree.com/careers/',
  Oracle: 'https://www.oracle.com/careers/',
  Zomato: 'https://www.zomato.com/careers',
  Paytm: 'https://paytm.com/careers/',
  PhonePe: 'https://www.phonepe.com/careers/',
  Groww: 'https://groww.in/careers',
};

const buildRealisticDescription = (company) => {
  const focus = companyHiringFocus[company.name] || `Build and maintain core ${company.industry} products.`;
  const stack = companyTechStack[company.name] || 'Programming language, SQL/NoSQL, APIs, cloud basics';
  const documents = (company.requirements || []).join(', ');

  return `Job Title: ${company.role}
Company: ${company.name}
Location: ${company.location}

Role Summary:
${company.name} is hiring for the ${company.role} role. ${focus}

Key Responsibilities:
- Design, develop, test, and deploy production-ready modules.
- Build secure and scalable REST/gRPC APIs and backend workflows.
- Write clean, maintainable code with unit/integration tests.
- Debug production issues, monitor service health, and improve reliability.
- Collaborate with product, QA, and DevOps teams for sprint delivery.

Required Skills:
- Strong fundamentals in data structures, algorithms, OOP, DBMS, OS, and computer networks.
- Hands-on coding in one or more backend-focused languages.
- Good understanding of API design, SQL queries, and performance tuning.
- Familiarity with Git workflows and agile development practices.

Preferred Skills:
- Exposure to cloud services, CI/CD, observability, and microservices.
- Internship, capstone, or open-source contributions in relevant domains.
- Strong communication and documentation skills.

Tech Stack (indicative):
${stack}

Eligibility:
${company.eligibility}

Selection Process:
Online assessment (coding + aptitude) -> technical interviews -> HR discussion.

Important:
Only candidates meeting the minimum GPA (${company.min_gpa}) and document requirements will be shortlisted.`;
};

const escapePdfText = (text) =>
  String(text)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');

const wrapLine = (text, maxChars = 88) => {
  const words = String(text || '').split(/\s+/).filter(Boolean);
  const lines = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxChars) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }

  if (current) lines.push(current);
  return lines.length ? lines : [''];
};

const createCompanyDetailsPdfDataUri = (company) => {
  const summary = buildRealisticDescription(company);
  const lines = [];

  lines.push(`${company.name} - Campus Placement Details`);
  lines.push('');
  lines.push(`Role: ${company.role}`);
  lines.push(`Location: ${company.location}`);
  lines.push(`Salary: INR ${company.salary} CTC`);
  lines.push(`Minimum GPA: ${company.min_gpa}`);
  lines.push(`Openings: ${company.openings}`);
  lines.push('');
  lines.push('Job Description:');
  for (const paragraph of summary.split('\n')) {
    const wrapped = wrapLine(paragraph, 88);
    for (const wrappedLine of wrapped) {
      lines.push(wrappedLine);
    }
  }

  const maxLines = 46;
  const printableLines = lines.slice(0, maxLines);
  const contentCommands = [];
  contentCommands.push('BT');
  contentCommands.push('/F1 11 Tf');
  contentCommands.push('50 760 Td');

  printableLines.forEach((line, index) => {
    if (index === 0) {
      contentCommands.push(`(${escapePdfText(line)}) Tj`);
    } else {
      contentCommands.push('0 -15 Td');
      contentCommands.push(`(${escapePdfText(line)}) Tj`);
    }
  });

  contentCommands.push('ET');
  const streamContent = `${contentCommands.join('\n')}\n`;

  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n',
    '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
    `5 0 obj\n<< /Length ${Buffer.byteLength(streamContent, 'utf8')} >>\nstream\n${streamContent}endstream\nendobj\n`,
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [0];

  for (const obj of objects) {
    offsets.push(Buffer.byteLength(pdf, 'utf8'));
    pdf += obj;
  }

  const xrefStart = Buffer.byteLength(pdf, 'utf8');
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';

  for (let i = 1; i <= objects.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return `data:application/pdf;base64,${Buffer.from(pdf, 'utf8').toString('base64')}`;
};

export const defaultCompanies = [
  {
    name: 'Anuki Technologies',
    role: 'Software Engineer - Backend',
    salary: '12,00,000',
    industry: 'Product Engineering',
    location: 'Bengaluru',
    min_gpa: 7.0,
    description:
      'Anuki Technologies is hiring backend engineers to build high-availability APIs for HR tech and workflow automation products. You will design services, implement secure authentication, and optimize database-heavy workloads for enterprise customers.',
    eligibility:
      'B.E./B.Tech/MCA in Computer Science, IT, or related discipline with minimum 7.0 GPA. Strong DSA, SQL, and API fundamentals required.',
    requirements: [
      'Updated resume (PDF)',
      'Government photo ID proof (Aadhaar/PAN)',
      'Latest semester marksheets',
      'Consolidated transcript',
      'Portfolio or GitHub profile link'
    ],
    deadline: '2026-04-10',
    job_type: 'full-time',
    status: 'active',
    openings: 8,
  },
  {
    name: 'Google',
    role: 'Software Engineer',
    salary: '24,00,000',
    industry: 'Product',
    location: 'Bengaluru',
    min_gpa: 7.5,
    description:
      'Google is hiring software engineers to build large-scale systems across search, cloud, and productivity products. The role focuses on writing performant code, solving distributed systems problems, and shipping user-impactful features with strong engineering practices.',
    eligibility:
      'B.E./B.Tech in Computer Science or related field with minimum 7.5 GPA. Strong coding ability in Java/C++/Python and system design knowledge expected.',
    requirements: [
      'Updated resume (PDF)',
      'Official transcript',
      'Government ID proof',
      '2 project write-ups',
      'Coding profile links (LeetCode/Codeforces)'
    ],
    deadline: '2026-04-12',
    job_type: 'full-time',
    status: 'active',
    openings: 12,
  },
  {
    name: 'Microsoft',
    role: 'Software Engineer',
    salary: '20,00,000',
    industry: 'Product',
    location: 'Hyderabad',
    min_gpa: 7.5,
    description:
      'Microsoft is recruiting software engineers to work on cloud-native product features across Azure and M365 services. You will collaborate with cross-functional teams, build reliable APIs, and contribute to performance and observability improvements.',
    eligibility:
      'B.E./B.Tech/MCA with minimum 7.5 GPA. Strong OOP, DBMS, OS, and computer networks fundamentals required.',
    requirements: [
      'Resume (PDF)',
      'All semester marksheets',
      'Consolidated transcript',
      'Photo ID proof',
      'Internship or project certificate (if available)'
    ],
    deadline: '2026-04-14',
    job_type: 'full-time',
    status: 'active',
    openings: 10,
  },
  {
    name: 'Amazon',
    role: 'SDE I - Backend',
    salary: '18,00,000',
    industry: 'E-commerce and Cloud',
    location: 'Hyderabad',
    min_gpa: 7.0,
    description:
      'Amazon is hiring backend engineers for highly scalable services supporting e-commerce and cloud operations. You will design APIs, implement core business logic, and monitor systems in production with a focus on reliability and latency.',
    eligibility:
      'B.E./B.Tech in Computer Science or equivalent with 7.0 GPA and above. Good grasp of DSA, OOP, and low-level design needed.',
    requirements: [
      'Updated resume',
      'Official transcripts',
      'Government ID',
      'NOC (if any internship overlap)',
      'GitHub or project repository links'
    ],
    deadline: '2026-04-16',
    job_type: 'full-time',
    status: 'active',
    openings: 14,
  },
  {
    name: 'Flipkart',
    role: 'SDE I',
    salary: '16,00,000',
    industry: 'E-commerce',
    location: 'Bengaluru',
    min_gpa: 7.0,
    description:
      'Flipkart is looking for SDE I engineers to build transaction-safe services for catalog, checkout, and logistics domains. The role involves end-to-end feature ownership, code reviews, and writing robust, testable microservices.',
    eligibility:
      'B.E./B.Tech with minimum 7.0 GPA. Strong Java/Python coding and DB optimization skills required.',
    requirements: [
      'Resume (PDF)',
      'Latest marksheets',
      'Bonafide certificate',
      'Government ID proof',
      'Project demo links'
    ],
    deadline: '2026-04-18',
    job_type: 'full-time',
    status: 'active',
    openings: 9,
  },
  {
    name: 'Razorpay',
    role: 'Backend Engineer',
    salary: '14,00,000',
    industry: 'FinTech',
    location: 'Bengaluru',
    min_gpa: 7.0,
    description:
      'Razorpay is hiring backend engineers to build secure payment flows, reconciliation pipelines, and merchant onboarding APIs. You will work on high-throughput systems, fraud prevention integrations, and platform reliability.',
    eligibility:
      'B.E./B.Tech/MCA with 7.0 GPA or above. Proficiency in Java/Python/Go and strong SQL fundamentals required.',
    requirements: [
      'Resume',
      'Government ID',
      'Academic transcripts',
      'Internship letters (if any)',
      'Open-source contributions (optional)'
    ],
    deadline: '2026-04-20',
    job_type: 'full-time',
    status: 'active',
    openings: 8,
  },
  {
    name: 'Swiggy',
    role: 'Software Engineer - Platform',
    salary: '11,00,000',
    industry: 'FoodTech',
    location: 'Bengaluru',
    min_gpa: 6.8,
    description:
      'Swiggy seeks platform engineers to support order lifecycle, delivery tracking, and partner integrations. You will build APIs, optimize queue consumers, and improve system observability in a real-time production environment.',
    eligibility:
      'B.E./B.Tech with 6.8 GPA and above. Strong backend fundamentals, SQL, and problem-solving required.',
    requirements: [
      'Updated CV',
      'Semester marksheets',
      'ID proof',
      'Two project abstracts',
      'Any certification documents'
    ],
    deadline: '2026-04-22',
    job_type: 'full-time',
    status: 'active',
    openings: 7,
  },
  {
    name: 'Zoho',
    role: 'Product Engineer',
    salary: '10,00,000',
    industry: 'SaaS',
    location: 'Chennai',
    min_gpa: 6.5,
    description:
      'Zoho is hiring product engineers for SaaS platforms across CRM, mail, and collaboration suites. You will deliver full-stack features, debug production issues, and improve product quality through iterative releases.',
    eligibility:
      'B.E./B.Tech/MCA with minimum 6.5 GPA. Good understanding of Java/JavaScript and web application concepts expected.',
    requirements: [
      'Resume in PDF format',
      'Consolidated marksheet',
      'Government ID proof',
      'Academic project report',
      'Profile photo (passport size)'
    ],
    deadline: '2026-04-24',
    job_type: 'full-time',
    status: 'active',
    openings: 10,
  },
  {
    name: 'Freshworks',
    role: 'Full Stack Engineer',
    salary: '12,00,000',
    industry: 'SaaS',
    location: 'Chennai',
    min_gpa: 6.8,
    description:
      'Freshworks is looking for full stack engineers to build customer engagement features across web applications. You will work with React and backend services, write tests, and collaborate closely with product teams.',
    eligibility:
      'B.E./B.Tech with minimum 6.8 GPA. Experience with JavaScript/TypeScript, REST APIs, and relational databases preferred.',
    requirements: [
      'Updated resume',
      'Latest transcripts',
      'ID proof',
      'Project portfolio links',
      'Internship completion certificate (if any)'
    ],
    deadline: '2026-04-25',
    job_type: 'full-time',
    status: 'active',
    openings: 9,
  },
  {
    name: 'TCS',
    role: 'Software Engineer',
    salary: '7,00,000',
    industry: 'IT Services',
    location: 'Bengaluru',
    min_gpa: 6.5,
    description:
      'TCS is hiring software engineers for enterprise projects in banking, healthcare, and retail domains. You will be involved in module development, testing, maintenance, and structured delivery with global teams.',
    eligibility:
      'B.E./B.Tech/MCA with minimum 6.5 GPA and no active backlogs. Good communication and coding fundamentals required.',
    requirements: [
      'Resume',
      'All semester marksheets',
      'College ID copy',
      'Government ID proof',
      'Passport size photo'
    ],
    deadline: '2026-04-26',
    job_type: 'full-time',
    status: 'active',
    openings: 40,
  },
  {
    name: 'Infosys',
    role: 'Systems Engineer',
    salary: '6,50,000',
    industry: 'IT Services',
    location: 'Mysuru',
    min_gpa: 6.0,
    description:
      'Infosys is onboarding systems engineers for digital transformation engagements. The role includes software development, testing, and support activities after a structured training and onboarding program.',
    eligibility:
      'B.E./B.Tech in any circuit branch or CS/IT with minimum 6.0 GPA and no active arrears.',
    requirements: [
      'Updated CV',
      'Academic transcript',
      'Government ID',
      'College bonafide letter',
      'Any online certification proof (optional)'
    ],
    deadline: '2026-04-27',
    job_type: 'full-time',
    status: 'active',
    openings: 35,
  },
  {
    name: 'Wipro',
    role: 'Project Engineer',
    salary: '6,00,000',
    industry: 'IT Services',
    location: 'Hyderabad',
    min_gpa: 6.0,
    description:
      'Wipro is recruiting project engineers to contribute to software delivery and maintenance programs. You will work on coding tasks, bug fixes, production support, and quality improvements.',
    eligibility:
      'B.E./B.Tech with minimum 6.0 GPA, good communication skills, and willingness to work in project-based delivery model.',
    requirements: [
      'Resume PDF',
      'Semester marksheets',
      'Government ID proof',
      'Address proof',
      'Passport size photo'
    ],
    deadline: '2026-04-28',
    job_type: 'full-time',
    status: 'active',
    openings: 30,
  },
  {
    name: 'Accenture',
    role: 'Associate Software Engineer',
    salary: '8,00,000',
    industry: 'Consulting',
    location: 'Pune',
    min_gpa: 6.5,
    description:
      'Accenture is hiring associate software engineers for cloud migration and digital modernization projects. The role includes API development, automation scripting, and deployment support.',
    eligibility:
      'B.E./B.Tech/MCA with minimum 6.5 GPA. Strong communication, coding basics, and team collaboration expected.',
    requirements: [
      'Updated resume',
      'Consolidated transcript',
      'ID proof',
      'Internship/project completion letters',
      'Recent passport-size photo'
    ],
    deadline: '2026-04-29',
    job_type: 'full-time',
    status: 'active',
    openings: 22,
  },
  {
    name: 'Cognizant',
    role: 'Programmer Analyst',
    salary: '6,50,000',
    industry: 'IT Services',
    location: 'Chennai',
    min_gpa: 6.0,
    description:
      'Cognizant is seeking programmer analysts for software delivery and quality engineering tracks. You will write modules, execute test cases, and support enterprise-grade deployments.',
    eligibility:
      'B.E./B.Tech/MCA with minimum 6.0 GPA and basic understanding of Java/Python/.NET stack.',
    requirements: [
      'Resume',
      'Official academic transcripts',
      'Government photo ID',
      'College ID copy',
      'Any internship offer/relieving letters'
    ],
    deadline: '2026-04-30',
    job_type: 'full-time',
    status: 'active',
    openings: 25,
  },
  {
    name: 'LTIMindtree',
    role: 'Software Engineer',
    salary: '7,20,000',
    industry: 'IT Services',
    location: 'Mumbai',
    min_gpa: 6.5,
    description:
      'LTIMindtree is hiring software engineers for cloud-native and enterprise modernization engagements. You will build APIs, integrate services, and contribute to CI/CD based delivery pipelines.',
    eligibility:
      'B.E./B.Tech with minimum 6.5 GPA. Good programming and database fundamentals are mandatory.',
    requirements: [
      'Resume in PDF',
      'All semester marksheets',
      'Government ID proof',
      'Address proof',
      'Project summary document'
    ],
    deadline: '2026-05-01',
    job_type: 'full-time',
    status: 'active',
    openings: 18,
  },
  {
    name: 'Oracle',
    role: 'Software Engineer',
    salary: '13,00,000',
    industry: 'Enterprise Software',
    location: 'Bengaluru',
    min_gpa: 7.0,
    description:
      'Oracle is recruiting software engineers to build cloud and database platform capabilities for enterprise customers. The role includes backend feature development, query optimization, and reliability enhancements.',
    eligibility:
      'B.E./B.Tech with minimum 7.0 GPA and strong database, SQL, and Java fundamentals.',
    requirements: [
      'Updated CV',
      'Academic transcript',
      'Government ID proof',
      'Database project documentation',
      'Internship letter (if applicable)'
    ],
    deadline: '2026-05-02',
    job_type: 'full-time',
    status: 'active',
    openings: 11,
  },
  {
    name: 'Zomato',
    role: 'Backend Engineer',
    salary: '10,50,000',
    industry: 'FoodTech',
    location: 'Gurugram',
    min_gpa: 6.5,
    description:
      'Zomato is hiring backend engineers to support order orchestration, restaurant discovery, and fulfillment services. You will work on low-latency APIs and production-grade distributed components.',
    eligibility:
      'B.E./B.Tech/MCA with minimum 6.5 GPA and strong knowledge of APIs, DBMS, and distributed systems.',
    requirements: [
      'Resume (PDF)',
      'Official transcripts',
      'Government ID',
      'Open-source/project links',
      'Any internship certificates'
    ],
    deadline: '2026-05-03',
    job_type: 'full-time',
    status: 'active',
    openings: 10,
  },
  {
    name: 'Paytm',
    role: 'Software Development Engineer',
    salary: '11,00,000',
    industry: 'FinTech',
    location: 'Noida',
    min_gpa: 6.8,
    description:
      'Paytm is seeking SDEs for payment gateway and merchant platform teams. The role includes building secure services, improving transaction reliability, and implementing monitoring for high-volume systems.',
    eligibility:
      'B.E./B.Tech with minimum 6.8 GPA. Strong coding and API fundamentals required; fintech interest is preferred.',
    requirements: [
      'Updated resume',
      'Consolidated marksheet',
      'Government ID proof',
      'KYC document copy',
      'Project write-up or GitHub links'
    ],
    deadline: '2026-05-04',
    job_type: 'full-time',
    status: 'active',
    openings: 12,
  },
  {
    name: 'PhonePe',
    role: 'Backend Engineer',
    salary: '12,00,000',
    industry: 'FinTech',
    location: 'Bengaluru',
    min_gpa: 6.8,
    description:
      'PhonePe is hiring backend engineers for UPI and merchant payment infrastructure. You will work on secure transaction services, optimize latency, and build reliable integrations with partner systems.',
    eligibility:
      'B.E./B.Tech/MCA with 6.8 GPA and above. Strong Java/Kotlin/Go fundamentals and DBMS knowledge required.',
    requirements: [
      'Resume PDF',
      'Latest academic transcript',
      'Government ID proof',
      'Address proof',
      'Internship/experience documents (if any)'
    ],
    deadline: '2026-05-05',
    job_type: 'full-time',
    status: 'active',
    openings: 9,
  },
  {
    name: 'Groww',
    role: 'Backend Engineer',
    salary: '13,00,000',
    industry: 'FinTech',
    location: 'Bengaluru',
    min_gpa: 7.0,
    description:
      'Groww is looking for backend engineers to build investment and trading platform components. You will implement APIs for order flow, market data ingestion, and portfolio services with strong reliability standards.',
    eligibility:
      'B.E./B.Tech with minimum 7.0 GPA. Strong Java/Python backend skills, SQL, and data modeling knowledge expected.',
    requirements: [
      'Updated resume',
      'Official transcript',
      'Government ID',
      'Finance or trading project summary (if any)',
      'Coding profile links'
    ],
    deadline: '2026-05-06',
    job_type: 'full-time',
    status: 'active',
    openings: 8,
  },
].map((company) => ({
  ...company,
  websiteUrl: officialCompanyCareerUrls[company.name] || '',
  description: buildRealisticDescription(company),
  detailsFile: createCompanyDetailsPdfDataUri(company),
}));
