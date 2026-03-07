const companyDescriptions = {
  'Google': {
    description: `Google is seeking talented Software Engineers to join our innovative teams. You will work on critical projects that impact billions of users worldwide, building next-generation technologies that change how people connect, explore, and interact with information.

Required Skills: Strong foundation in Data Structures, Algorithms, and Object-Oriented Programming. Proficiency in one or more of: Java, Python, C++, or Go. Understanding of system design, distributed systems, and scalability concepts.

Responsibilities:
- Design, develop, test, deploy, maintain, and improve software
- Work on problems of moderate-to-high complexity
- Collaborate with cross-functional teams to define and build new features
- Participate in design reviews and code reviews
- Optimize application performance and scalability

Tech Stack: Java, Python, C++, Go, Kubernetes, TensorFlow, Angular/React, Google Cloud Platform

Preferred: Experience with web technologies (JavaScript/TypeScript), machine learning frameworks, or open-source contributions.`,
    eligibility: `Computer Science or related degree. Minimum 7.5 GPA. Strong coding and problem-solving skills. Experience with data structures and algorithms.`,
  },
  'Microsoft': {
    description: `Microsoft is hiring Software Engineers to create innovative solutions that empower every person and organization on the planet to achieve more. You'll work on cutting-edge products including Azure, Office 365, Windows, and AI platforms.

Required Skills: Strong programming fundamentals in C#, Java, Python, or JavaScript. Knowledge of cloud computing, software engineering principles, and agile methodologies. Understanding of RESTful APIs and microservices architecture.

Responsibilities:
- Design and implement scalable cloud-based solutions
- Write clean, maintainable, and efficient code
- Collaborate with PM and design teams to deliver features
- Debug issues and implement automated testing
- Contribute to technical specifications and architecture decisions

Tech Stack: C#, .NET Core, Azure, TypeScript, React, SQL Server, Docker, Kubernetes

Preferred: Contributions to open-source projects, experience with Azure or AWS, knowledge of DevOps practices.`,
    eligibility: `BE/B.Tech in Computer Science or related field. Minimum 7.5 GPA. Strong analytical and problem-solving abilities.`,
  },
  'Amazon': {
    description: `Amazon is looking for Backend Engineers to build highly scalable distributed systems for e-commerce, AWS, and logistics platforms. Join us to work on challenging problems at unprecedented scale.

Required Skills: Proficiency in Java, Python, or C++. Strong understanding of object-oriented design, data structures, and algorithms. Experience with relational and NoSQL databases. Knowledge of distributed systems and scalability patterns.

Responsibilities:
- Design and build robust, scalable backend services
- Write high-quality, well-tested code
- Optimize database queries and system performance
- Participate in on-call rotations and production support
- Collaborate with teams across Amazon's global engineering community

Tech Stack: Java, Python, AWS (EC2, S3, Lambda, DynamoDB), Redis, MySQL, Kafka, Docker

Preferred: Experience with AWS services, microservices architecture, or high-traffic production systems.`,
    eligibility: `B.Tech/BE in Computer Science. Minimum 7.0 GPA. Strong coding skills and system design knowledge.`,
  },
  'Flipkart': {
    description: `Flipkart is seeking SDE I engineers to build India's leading e-commerce platform. Work on large-scale distributed systems, real-time data pipelines, and customer-facing applications.

Required Skills: Strong programming skills in Java or Python. Understanding of RESTful services, databases (MySQL, MongoDB), and caching mechanisms. Knowledge of data structures, algorithms, and design patterns.

Responsibilities:
- Develop features for supply chain, payments, or marketplace platforms
- Build scalable microservices and APIs
- Implement monitoring and alerting systems
- Optimize application performance and user experience
- Work in agile teams with product and design

Tech Stack: Java, Spring Boot, Python, Kafka, Redis, MySQL, MongoDB, Kubernetes, React

Preferred: Experience with Spring Framework, Kafka, or large-scale web applications.`,
    eligibility: `BE/B.Tech in Computer Science or related discipline. Minimum 7.0 GPA. Strong problem-solving skills.`,
  },
  'Razorpay': {
    description: `Razorpay is hiring Backend Engineers to build India's most developer-friendly payment solutions. Work on payment gateways, banking integrations, fraud detection, and real-time transaction processing.

Required Skills: Proficiency in Java, Python, or Go. Strong understanding of databases (PostgreSQL, MySQL), caching (Redis), and message queues. Knowledge of API design, security best practices, and financial systems.

Responsibilities:
- Design and build payment processing systems
- Implement fraud detection and security mechanisms
- Integrate with banking and payment partners
- Ensure 99.99% uptime and handle high transaction volumes
- Write comprehensive tests and documentation

Tech Stack: Java, Python, Go, PostgreSQL, Redis, Kafka, Kubernetes, AWS

Preferred: Understanding of payment systems, PCI compliance, or experience with fintech applications.`,
    eligibility: `B.Tech/BE in Computer Science. Minimum 7.0 GPA. Strong analytical and coding skills. Interest in fintech.`,
  },
  'Swiggy': {
    description: `Swiggy is looking for Backend Engineers to power India's largest food delivery platform. Build systems handling millions of orders, real-time location tracking, and logistics optimization.

Required Skills: Strong programming in Java, Python, or Node.js. Experience with databases, REST APIs, and cloud platforms. Understanding of distributed systems and real-time data processing.

Responsibilities:
- Develop microservices for ordering, delivery, and payments
- Build real-time tracking and notification systems
- Optimize delivery algorithms and routing logic
- Ensure system reliability during peak traffic
- Collaborate with product teams on feature development

Tech Stack: Java, Python, Node.js, MySQL, Redis, Kafka, AWS, Kubernetes, React

Preferred: Experience with location-based services, real-time systems, or high-availability architectures.`,
    eligibility: `BE/B.Tech in Computer Science. Minimum 6.8 GPA. Strong problem-solving and coding abilities.`,
  },
  'Zoho': {
    description: `Zoho is hiring Product Engineers to build SaaS applications used by millions of businesses worldwide. Work on CRM, email, collaboration tools, and productivity software with minimal supervision.

Required Skills: Strong programming in Java, JavaScript, or Python. Understanding of full-stack development, databases, and web technologies. Ability to own features end-to-end.

Responsibilities:
- Design and implement product features independently
- Write scalable and maintainable code
- Optimize application performance
- Debug and fix production issues
- Contribute to product architecture and technical decisions

Tech Stack: Java, JavaScript, HTML/CSS, MySQL, PostgreSQL, Redis, Linux

Preferred: Full-stack development experience, ownership mentality, self-driven learning.`,
    eligibility: `BE/B.Tech in Computer Science. Minimum 6.5 GPA. Strong fundamentals and passion for building products.`,
  },
  'Freshworks': {
    description: `Freshworks is seeking Full Stack Engineers to build modern SaaS products for customer engagement. Work on both frontend (React) and backend (Ruby/Node.js) to deliver delightful user experiences.

Required Skills: Proficiency in JavaScript/TypeScript and React. Backend experience with Node.js, Ruby, or Python. Understanding of databases, REST APIs, and cloud deployment.

Responsibilities:
- Build responsive web applications with React
- Develop scalable backend services and APIs
- Implement real-time features and integrations
- Write automated tests and maintain code quality
- Participate in product planning and agile ceremonies

Tech Stack: React, Node.js, Ruby on Rails, PostgreSQL, Redis, AWS, Docker, TypeScript

Preferred: Experience with modern JavaScript frameworks, GraphQL, or SaaS product development.`,
    eligibility: `B.Tech/BE in Computer Science. Minimum 6.8 GPA. Full-stack development skills preferred.`,
  },
  'TCS': {
    description: `Tata Consultancy Services is hiring Software Engineers for client projects across banking, insurance, retail, and technology domains. Work on enterprise applications, digital transformation, and emerging technologies.

Required Skills: Programming knowledge in Java, Python, or C++. Understanding of software development lifecycle, testing, and documentation. Willingness to learn new technologies and work in teams.

Responsibilities:
- Develop and maintain enterprise applications
- Write clean code following best practices
- Participate in requirements gathering and design discussions
- Debug issues and provide production support
- Collaborate with offshore and onsite teams

Tech Stack: Java, Spring, Python, Oracle/SQL Server, Angular/React, Jenkins, Git

Preferred: Knowledge of Agile methodologies, cloud platforms, or internship experience.`,
    eligibility: `BE/B.Tech/MCA in Computer Science or related field. Minimum 6.5 GPA. No active backlogs.`,
  },
  'Infosys': {
    description: `Infosys is recruiting Systems Engineers to work on digital transformation projects for global clients. Training provided in latest technologies including cloud, AI/ML, and full-stack development.

Required Skills: Basic programming in any language (Java, Python, C++). Strong analytical and problem-solving skills. Good communication and teamwork abilities.

Responsibilities:
- Undergo comprehensive technical training program
- Develop software solutions based on client requirements
- Test and debug applications
- Document technical specifications
- Support production systems and resolve issues

Tech Stack: Java, Python, Spring Boot, Angular, MySQL, AWS/Azure, Jenkins

Preferred: Academic projects, certifications, or coding competition participation.`,
    eligibility: `BE/B.Tech in any engineering discipline. Minimum 6.0 GPA throughout academics. No current arrears.`,
  },
  'Wipro': {
    description: `Wipro is hiring Project Engineers for software development and application maintenance projects. Work across domains including BFSI, healthcare, retail, and manufacturing.

Required Skills: Programming fundamentals in Java, Python, or .NET. Understanding of databases and web technologies. Ability to learn quickly and adapt to project needs.

Responsibilities:
- Design, code, and test software modules
- Participate in code reviews and knowledge sharing
- Create and maintain technical documentation
- Provide application support and troubleshooting
- Work in global delivery model with diverse teams

Tech Stack: Java, Python, .NET, SQL, JavaScript, Oracle, AWS, Git

Preferred: Internship experience, academic projects, or online course certifications.`,
    eligibility: `B.E/B.Tech in Computer Science or IT. Minimum 6.0 GPA. Strong academic record with no backlogs.`,
  },
  'Accenture': {
    description: `Accenture is seeking Associate Software Engineers for technology consulting and digital transformation projects. Work on cloud migration, application development, and automation initiatives.

Required Skills: Programming knowledge in Java, Python, or JavaScript. Understanding of cloud platforms (AWS/Azure). Problem-solving and analytical thinking abilities.

Responsibilities:
- Develop and deploy cloud-based solutions
- Implement automation scripts and workflows
- Support application migration to cloud platforms
- Create technical documentation and user guides
- Participate in client meetings and project planning

Tech Stack: Java, Python, AWS, Azure, Docker, Kubernetes, Terraform, Spring Boot

Preferred: Cloud certifications (AWS/Azure), DevOps knowledge, or consulting interest.`,
    eligibility: `BE/B.Tech in Computer Science or related field. Minimum 6.5 GPA. Strong communication skills.`,
  },
  'Cognizant': {
    description: `Cognizant is hiring Programmer Analysts to work on enterprise application development and quality engineering projects for Fortune 500 clients.

Required Skills: Programming in Java, Python, or .NET. Understanding of software testing concepts. Knowledge of SQL and web technologies.

Responsibilities:
- Develop and test software applications
- Write automation scripts for testing
- Analyze requirements and design solutions
- Debug and fix defects in applications
- Collaborate with global teams across time zones

Tech Stack: Java, Selenium, Python, SQL, JavaScript, Jenkins, JUnit, TestNG

Preferred: Knowledge of automation testing, Agile methodologies, or ISTQB certification.`,
    eligibility: `BE/B.Tech/MCA in Computer Science or IT. Minimum 6.0 GPA. Good analytical and communication skills.`,
  },
  'LTIMindtree': {
    description: `LTIMindtree is recruiting Software Engineers for digital engineering and enterprise solutions. Work on cloud-native applications, microservices, and modernization projects.

Required Skills: Strong Java or Python programming. Understanding of object-oriented design and databases. Knowledge of web frameworks and REST APIs.

Responsibilities:
- Design and develop microservices applications
- Build RESTful APIs and integrate with databases
- Write unit tests and integration tests
- Deploy applications on cloud platforms
- Participate in agile sprints and daily standups

Tech Stack: Java, Spring Boot, Python, React, MySQL, MongoDB, Docker, Kubernetes, AWS

Preferred: Experience with Spring ecosystem, Docker, or API development.`,
    eligibility: `B.Tech/BE in Computer Science or IT. Minimum 6.5 GPA. Strong technical and problem-solving skills.`,
  },
  'Oracle': {
    description: `Oracle is hiring Software Engineers to work on enterprise cloud applications, database technologies, and SaaS platforms. Build solutions powering mission-critical business systems worldwide.

Required Skills: Strong programming in Java, Python, or C++. Understanding of databases, SQL, and data modeling. Knowledge of distributed systems and cloud architecture.

Responsibilities:
- Develop features for Oracle Cloud Infrastructure
- Build database tools and management applications
- Optimize query performance and scalability
- Implement security and compliance features
- Contribute to technical design and architecture

Tech Stack: Java, Python, Oracle Database, PL/SQL, Kubernetes, Linux, REST APIs

Preferred: Database internals knowledge, cloud platform experience, or systems programming.`,
    eligibility: `BE/B.Tech in Computer Science. Minimum 7.0 GPA. Strong fundamentals in databases and algorithms.`,
  },
  'Zomato': {
    description: `Zomato is seeking Backend Engineers to build food delivery and restaurant discovery platforms. Work on real-time systems, recommendation engines, and logistics optimization.

Required Skills: Proficiency in Java, Python, or Go. Experience with databases and caching systems. Understanding of microservices and distributed architectures.

Responsibilities:
- Develop scalable backend services for food delivery
- Build restaurant recommendation algorithms
- Implement real-time order tracking systems
- Optimize delivery assignment and routing
- Ensure high availability during peak hours

Tech Stack: Java, Python, Go, PostgreSQL, Redis, Kafka, Kubernetes, AWS

Preferred: Experience with location-based systems, recommendation engines, or high-scale applications.`,
    eligibility: `BE/B.Tech in Computer Science. Minimum 6.5 GPA. Strong problem-solving and coding skills.`,
  },
  'Paytm': {
    description: `Paytm is hiring Software Development Engineers to build payment, banking, and commerce platforms. Work on wallet systems, merchant solutions, and financial services.

Required Skills: Strong programming in Java or Python. Knowledge of databases, APIs, and security practices. Understanding of payment systems and transaction processing.

Responsibilities:
- Develop payment processing and wallet features
- Implement merchant onboarding and KYC systems
- Build fraud detection and risk management tools
- Ensure PCI-DSS compliance and security standards
- Optimize transaction success rates

Tech Stack: Java, Python, MySQL, Redis, Kafka, AWS, Spring Boot, React

Preferred: Fintech domain knowledge, security awareness, or payment gateway experience.`,
    eligibility: `B.Tech/BE in Computer Science or IT. Minimum 6.8 GPA. Interest in financial technology.`,
  },
  'PhonePe': {
    description: `PhonePe is looking for Backend Engineers to build India's leading digital payments platform. Work on UPI trans actions, merchant solutions, and financial services at massive scale.

Required Skills: Proficiency in Java, Kotlin, or Go. Strong understanding of databases and distributed systems. Knowledge of payment protocols and security.

Responsibilities:
- Develop high-throughput payment processing systems
- Build merchant and consumer-facing APIs
- Implement security and fraud prevention measures
- Ensure 99.99% uptime for payment services
- Collaborate with product teams on new features

Tech Stack: Java, Kotlin, MySQL, Cassandra, Redis, Kafka, Kubernetes, AWS

Preferred: Experience with payment systems, UPI, or high-availability distributed systems.`,
    eligibility: `BE/B.Tech in Computer Science. Minimum 6.8 GPA. Strong system design and coding abilities.`,
  },
  'Groww': {
    description: `Groww is hiring Backend Engineers to build investment and trading platforms. Work on stock trading systems, mutual fund platforms, and real-time market data processing.

Required Skills: Strong programming in Java, Python, or Go. Understanding of databases and distributed systems. Knowledge of financial markets and trading concepts.

Responsibilities:
- Develop trading and investment platform features
- Build real-time market data processing systems
- Implement order management and portfolio tracking
- Ensure regulatory compliance and security
- Optimize system performance and latency

Tech Stack: Java, Python, PostgreSQL, Redis, Kafka, Kubernetes, AWS

Preferred: Interest in financial markets, low-latency systems, or trading platform experience.`,
    eligibility: `BE/B.Tech in Computer Science. Minimum 7.0 GPA. Strong algorithms and system design skills.`,
  },
  'CRED': {
    description: `CRED is seeking Mobile Engineers (Android) to build premium credit card and payment experiences. Work on consumer-facing apps with focus on design, performance, and user delight.

Required Skills: Strong Android development with Kotlin. Understanding of Android SDK, Jetpack components, and Material Design. Knowledge of REST APIs and mobile architecture patterns.

Responsibilities:
- Build beautiful and performant Android applications
- Implement complex animations and custom views
- Integrate with backend APIs and third-party SDKs
- Optimize app performance and battery usage
- Write automated tests and maintain code quality

Tech Stack: Kotlin, Android SDK, Jetpack, Coroutines, Retrofit, Room, Firebase

Preferred: Published apps on Play Store, experience with MVVM/MVI, or design sensibility.`,
    eligibility: `BE/B.Tech in Computer Science. Minimum 7.0 GPA. Strong Android development skills and portfolio.`,
  },
};

export const defaultCompanies = [
  { name: 'Google', role: 'Software Engineer', salary: '24,00,000', industry: 'Product', location: 'Bengaluru', min_gpa: 7.5 },
  { name: 'Microsoft', role: 'Software Engineer', salary: '20,00,000', industry: 'Product', location: 'Hyderabad', min_gpa: 7.5 },
  { name: 'Amazon', role: 'Backend Engineer', salary: '18,00,000', industry: 'E-commerce and Cloud', location: 'Hyderabad', min_gpa: 7.0 },
  { name: 'Flipkart', role: 'SDE I', salary: '16,00,000', industry: 'E-commerce', location: 'Bengaluru', min_gpa: 7.0 },
  { name: 'Razorpay', role: 'Backend Engineer', salary: '14,00,000', industry: 'FinTech', location: 'Bengaluru', min_gpa: 7.0 },
  { name: 'Swiggy', role: 'Backend Engineer', salary: '11,00,000', industry: 'FoodTech', location: 'Bengaluru', min_gpa: 6.8 },
  { name: 'Zoho', role: 'Product Engineer', salary: '10,00,000', industry: 'SaaS', location: 'Chennai', min_gpa: 6.5 },
  { name: 'Freshworks', role: 'Full Stack Engineer', salary: '12,00,000', industry: 'SaaS', location: 'Chennai', min_gpa: 6.8 },
  { name: 'TCS', role: 'Software Engineer', salary: '7,00,000', industry: 'IT Services', location: 'Bengaluru', min_gpa: 6.5 },
  { name: 'Infosys', role: 'Systems Engineer', salary: '6,50,000', industry: 'IT Services', location: 'Mysuru', min_gpa: 6.0 },
  { name: 'Wipro', role: 'Project Engineer', salary: '6,00,000', industry: 'IT Services', location: 'Hyderabad', min_gpa: 6.0 },
  { name: 'Accenture', role: 'Associate Software Engineer', salary: '8,00,000', industry: 'Consulting', location: 'Pune', min_gpa: 6.5 },
  { name: 'Cognizant', role: 'Programmer Analyst', salary: '6,50,000', industry: 'IT Services', location: 'Chennai', min_gpa: 6.0 },
  { name: 'LTIMindtree', role: 'Software Engineer', salary: '7,20,000', industry: 'IT Services', location: 'Mumbai', min_gpa: 6.5 },
  { name: 'Oracle', role: 'Software Engineer', salary: '13,00,000', industry: 'Enterprise Software', location: 'Bengaluru', min_gpa: 7.0 },
  { name: 'Zomato', role: 'Backend Engineer', salary: '10,50,000', industry: 'FoodTech', location: 'Gurugram', min_gpa: 6.5 },
  { name: 'Paytm', role: 'Software Development Engineer', salary: '11,00,000', industry: 'FinTech', location: 'Noida', min_gpa: 6.8 },
  { name: 'PhonePe', role: 'Backend Engineer', salary: '12,00,000', industry: 'FinTech', location: 'Bengaluru', min_gpa: 6.8 },
  { name: 'Groww', role: 'Backend Engineer', salary: '13,00,000', industry: 'FinTech', location: 'Bengaluru', min_gpa: 7.0 },
  { name: 'CRED', role: 'Android Developer', salary: '15,00,000', industry: 'FinTech', location: 'Bengaluru', min_gpa: 7.0 },
].map((company) => ({
  ...company,
  description: companyDescriptions[company.name]?.description || `${company.name} campus hiring drive for ${company.role}.`,
  eligibility: companyDescriptions[company.name]?.eligibility || `Students with minimum ${company.min_gpa} GPA and relevant technical skills are eligible.`,
  deadline: '2026-04-30',
  job_type: 'full-time',
  status: 'active',
  openings: 10,
}));
