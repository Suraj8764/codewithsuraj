const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/codewithsuraj';

async function seed() {
  console.log('Connecting to MongoDB at:', MONGODB_URI);
  await mongoose.connect(MONGODB_URI);

  const db = mongoose.connection.db;

  // Clear existing if any
  await db.collection('users').deleteMany({});
  await db.collection('trainers').deleteMany({});
  await db.collection('courses').deleteMany({});
  await db.collection('blogs').deleteMany({});
  await db.collection('faqs').deleteMany({});
  await db.collection('testimonials').deleteMany({});
  await db.collection('sitesettings').deleteMany({});

  console.log('Cleaned existing collections.');

  // 1. Admin User
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await db.collection('users').insertOne({
    name: 'Suraj Sahoo',
    email: 'admin@codewithsuraj.com',
    password: hashedPassword,
    role: 'super_admin',
    permissions: ['all'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  console.log('✓ Seeded Admin User');

  // 2. Site Settings
  await db.collection('sitesettings').insertMany([
    {
      section: 'general',
      data: {
        siteName: 'CodeWithSuraj',
        tagline: 'Master Modern Tech. Build Real Projects. Accelerate Your Career.',
        logoUrl: '',
        faviconUrl: '',
        description: 'Elite full-stack development and cloud engineering training platform led by industry experts.',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      section: 'contact',
      data: {
        email: 'contact@codewithsuraj.com',
        phone: '+91 98765 43210',
        whatsapp: '+91 98765 43210',
        address: 'Tech Innovation Hub, Cyber City, Bangalore, Karnataka 560100',
        operatingHours: 'Mon - Sat: 9:00 AM - 8:00 PM IST',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      section: 'social',
      data: {
        linkedin: 'https://linkedin.com/in/surajsahoo',
        github: 'https://github.com/surajsahoo',
        instagram: 'https://instagram.com/codewithsuraj',
        youtube: 'https://youtube.com/@codewithsuraj',
        twitter: 'https://x.com/codewithsuraj',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      section: 'seo',
      data: {
        metaTitle: 'CodeWithSuraj — Learn Full Stack Development, Cloud & AI',
        metaDescription: 'Hands-on practical training in MERN Stack, Next.js, .NET Core, Python, and AI Engineering.',
        keywords: 'full stack coding, web development bootcamp, MERN stack, nextjs, react, python, dot net, bangalore',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
  console.log('✓ Seeded Site Settings');

  // 3. Trainers
  const trainersResult = await db.collection('trainers').insertMany([
    {
      name: 'Suraj Sahoo',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      designation: 'Founder & Principal Architect',
      bio: 'Ex-Senior Tech Lead with 10+ years of experience architecting high-scale distributed systems and mentoring 15,000+ developers globally.',
      experience: 10,
      skills: ['MERN Stack', 'Next.js', 'System Design', 'Microservices', 'AWS', 'Docker'],
      linkedin: 'https://linkedin.com',
      github: 'https://github.com',
      twitter: 'https://twitter.com',
      youtube: 'https://youtube.com',
      isActive: true,
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Dr. Vikram Malhotra',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      designation: 'AI & Data Science Specialist',
      bio: 'PhD in Machine Learning with experience leading AI research teams at top Fortune 500 enterprises.',
      experience: 8,
      skills: ['Python', 'TensorFlow', 'PyTorch', 'LLMs', 'FastAPI', 'LangChain'],
      linkedin: 'https://linkedin.com',
      github: 'https://github.com',
      isActive: true,
      order: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Priya Sharma',
      photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
      designation: 'Staff Frontend Engineer & UI/UX Expert',
      bio: 'Design systems fanatic and frontend lead with extensive production experience in React 19, Next.js, and Web Performance.',
      experience: 7,
      skills: ['React', 'Next.js', 'TypeScript', 'TailwindCSS', 'Web Performance', 'Figma'],
      linkedin: 'https://linkedin.com',
      github: 'https://github.com',
      isActive: true,
      order: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Ananya Roy',
      photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
      designation: 'Cloud & DevOps Architect',
      bio: 'Certified Kubernetes Administrator (CKA) and AWS Solutions Architect specializing in CI/CD automation and enterprise security.',
      experience: 6,
      skills: ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'CI/CD Pipelines', 'Linux'],
      linkedin: 'https://linkedin.com',
      github: 'https://github.com',
      isActive: true,
      order: 4,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
  console.log('✓ Seeded Trainers');

  const trainerIds = Object.values(trainersResult.insertedIds);

  // 4. Courses
  await db.collection('courses').insertMany([
    {
      name: 'Mastering MERN Stack & Full Stack Architecture',
      slug: 'mastering-mern-stack-full-stack-architecture',
      shortDescription: 'Build production-grade full-stack applications with MongoDB, Express, React 19, and Node.js with real microservices.',
      fullDescription: 'Comprehensive hands-on training that takes you from fundamental JavaScript through modern React 19, Express REST APIs, MongoDB database optimization, secure JWT & OAuth authentication, Docker containerization, and AWS deployment. Build 4 end-to-end industry scale capstone projects.',
      category: 'Full Stack',
      level: 'Intermediate',
      duration: '14 Weeks',
      price: 19999,
      discountPrice: 12999,
      currency: 'INR',
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=80',
      heroImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80',
      technologies: ['MongoDB', 'Express', 'React', 'Node.js', 'TypeScript', 'Docker', 'Redis', 'AWS'],
      skillsCovered: ['REST API Design', 'State Management', 'Database Indexing', 'Authentication & RBAC', 'Cloud Deployment'],
      learningOutcomes: [
        'Architect scalable full-stack applications from scratch',
        'Implement robust authentication and role-based access control',
        'Build real-time features using WebSockets and Redis pub/sub',
        'Containerize and deploy apps with Docker and AWS Cloud',
      ],
      requirements: ['Basic understanding of JavaScript and HTML/CSS'],
      whoIsThisFor: ['Frontend devs wanting to master backend', 'Aspiring Full Stack Engineers', 'College grads preparing for tech jobs'],
      features: [
        { icon: '🚀', title: 'Live Mentorship', description: 'Weekly live interactive coding sessions and code reviews' },
        { icon: '💼', title: 'Job Assistance', description: 'Resume workshops, mock interviews, and direct referral network' },
        { icon: '🛠️', title: '4 Real Projects', description: 'Production deployments of E-commerce, SaaS, and Social platforms' },
        { icon: '📜', title: 'Verified Certificate', description: 'Shareable credential recognized by 200+ partner tech companies' },
      ],
      classMode: 'Online',
      classTimings: 'Weekends 10:00 AM - 1:00 PM IST',
      numberOfSessions: 48,
      trainers: [trainerIds[0], trainerIds[2]],
      status: 'published',
      enrollmentStatus: 'open',
      maxSeats: 35,
      availableSeats: 8,
      batchStartDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      classFrequency: 'Every Saturday & Sunday',
      weekdays: ['Saturday', 'Sunday'],
      isFeatured: true,
      order: 1,
      enrollmentCount: 428,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Modern Next.js 15 & React 19 Masterclass',
      slug: 'modern-nextjs-react-masterclass',
      shortDescription: 'Master App Router, Server Actions, Server Components, Streaming SSR, and high-performance UI architectures.',
      fullDescription: 'Deep dive into modern web development with Next.js 15 and React 19. Learn Server Components, Server Actions, Parallel & Intercepting Routes, Edge Middleware, Caching strategies, and build full-featured interactive web apps with stunning aesthetics and optimal SEO performance.',
      category: 'Frontend',
      level: 'All Levels',
      duration: '8 Weeks',
      price: 14999,
      discountPrice: 8999,
      currency: 'INR',
      thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
      heroImage: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&auto=format&fit=crop&q=80',
      technologies: ['Next.js', 'React 19', 'TypeScript', 'TailwindCSS', 'Framer Motion', 'Zod', 'Prisma'],
      skillsCovered: ['React Server Components', 'Server Actions', 'Optimistic UI', 'SEO & Core Web Vitals', 'Edge Computing'],
      learningOutcomes: [
        'Master the Next.js App Router architecture and server paradigms',
        'Build lightning-fast web applications with 100/100 Lighthouse scores',
        'Implement complex animations, micro-interactions, and sleek UIs',
        'Handle dynamic routing, data mutations, and real-time streaming',
      ],
      requirements: ['Basic knowledge of HTML, CSS, and modern JavaScript'],
      whoIsThisFor: ['React developers upgrading to modern standards', 'Frontend engineers looking to build full-stack apps'],
      features: [
        { icon: '⚡', title: 'Zero to Production', description: 'Deploy serverless apps to Vercel and AWS with custom domains' },
        { icon: '🎨', title: 'Design & UX Focus', description: 'Master modern aesthetic UI systems and motion design' },
      ],
      classMode: 'Online',
      classTimings: 'Tues & Thurs 8:00 PM - 10:00 PM IST',
      numberOfSessions: 24,
      trainers: [trainerIds[2]],
      status: 'published',
      enrollmentStatus: 'open',
      maxSeats: 30,
      availableSeats: 12,
      batchStartDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      classFrequency: 'Tuesday & Thursday evenings',
      weekdays: ['Tuesday', 'Thursday'],
      isFeatured: true,
      order: 2,
      enrollmentCount: 312,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Python for AI, Machine Learning & LLM Apps',
      slug: 'python-ai-machine-learning-llm-apps',
      shortDescription: 'Build intelligent AI systems, RAG applications, autonomous agents, and fine-tune models using Python and LangChain.',
      fullDescription: 'From Python data structures to modern generative AI engineering. Learn NumPy, Pandas, Scikit-Learn, PyTorch, LangChain, Vector Databases (Pinecone, Chroma), OpenAI & Anthropic API integrations, and how to build production-ready RAG AI assistants.',
      category: 'AI & Data Science',
      level: 'Beginner',
      duration: '12 Weeks',
      price: 24999,
      discountPrice: 15999,
      currency: 'INR',
      thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
      heroImage: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=1200&auto=format&fit=crop&q=80',
      technologies: ['Python', 'LangChain', 'OpenAI', 'Pinecone', 'FastAPI', 'PyTorch', 'Hugging Face', 'Docker'],
      skillsCovered: ['Prompt Engineering', 'RAG Pipelines', 'Vector Search', 'Fine-tuning', 'FastAPI Deployment'],
      learningOutcomes: [
        'Build custom AI chatbots and document search engines with RAG',
        'Integrate state-of-the-art LLMs into web applications',
        'Train and deploy machine learning models with FastAPI',
        'Automate complex multi-step workflows using AI agents',
      ],
      requirements: ['No prior AI experience required. Basic math and logic skills.'],
      whoIsThisFor: ['Developers wanting to transition to AI engineering', 'Data enthusiasts', 'Product builders'],
      features: [
        { icon: '🤖', title: 'Hands-on AI Labs', description: 'Deploy real RAG applications and custom agentic pipelines' },
        { icon: '💡', title: 'Industry Projects', description: 'Enterprise knowledge-base assistant and code generation tool' },
      ],
      classMode: 'Online',
      classTimings: 'Weekends 2:00 PM - 5:00 PM IST',
      numberOfSessions: 36,
      trainers: [trainerIds[1]],
      status: 'published',
      enrollmentStatus: 'open',
      maxSeats: 25,
      availableSeats: 5,
      batchStartDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      classFrequency: 'Saturday & Sunday',
      weekdays: ['Saturday', 'Sunday'],
      isFeatured: true,
      order: 3,
      enrollmentCount: 520,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Enterprise Full Stack .NET Core & Microservices',
      slug: 'enterprise-full-stack-dotnet-microservices',
      shortDescription: 'Master C#, ASP.NET Core Web API, Entity Framework, Clean Architecture, Docker, and Angular/React.',
      fullDescription: 'Become a highly sought-after enterprise engineer. Learn C# 12, ASP.NET Core, Entity Framework Core, SQL Server, RabbitMQ message brokers, Docker orchestration, CQRS pattern, and Clean Architecture for building resilient fintech and enterprise services.',
      category: 'Backend',
      level: 'Advanced',
      duration: '16 Weeks',
      price: 22999,
      discountPrice: 14999,
      currency: 'INR',
      thumbnail: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&auto=format&fit=crop&q=80',
      heroImage: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=1200&auto=format&fit=crop&q=80',
      technologies: ['C#', 'ASP.NET Core', 'SQL Server', 'Entity Framework', 'Docker', 'RabbitMQ', 'Azure', 'Angular'],
      skillsCovered: ['Clean Architecture', 'CQRS & MediatR', 'Microservices', 'Distributed Caching', 'Azure CI/CD'],
      learningOutcomes: [
        'Design enterprise-grade backend microservices in .NET Core',
        'Implement asynchronous event-driven messaging with RabbitMQ',
        'Secure APIs with OAuth 2.0 and OpenID Connect',
        'Deploy microservice clusters to Microsoft Azure',
      ],
      requirements: ['Familiarity with Object-Oriented Programming'],
      whoIsThisFor: ['Backend developers', 'Enterprise software engineers', 'Tech leads'],
      features: [
        { icon: '🏢', title: 'Enterprise Blueprint', description: 'Industry-standard architectures used by banking and enterprise firms' },
        { icon: '☁️', title: 'Azure Cloud Labs', description: 'Hands-on deployments with Azure App Services and CosmosDB' },
      ],
      classMode: 'Online',
      classTimings: 'Weekends 6:00 PM - 9:00 PM IST',
      numberOfSessions: 40,
      trainers: [trainerIds[0], trainerIds[3]],
      status: 'published',
      enrollmentStatus: 'open',
      maxSeats: 30,
      availableSeats: 15,
      batchStartDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
      classFrequency: 'Saturday & Sunday',
      weekdays: ['Saturday', 'Sunday'],
      isFeatured: false,
      order: 4,
      enrollmentCount: 215,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
  console.log('✓ Seeded Courses');

  // 5. Blogs
  await db.collection('blogs').insertMany([
    {
      title: 'The Full Stack Developer Roadmap for 2026: From Zero to Industry Pro',
      slug: 'full-stack-developer-roadmap-2026',
      coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80',
      excerpt: 'A comprehensive step-by-step guide detailing the languages, frameworks, architecture patterns, and tools you must master to land top engineering roles.',
      content: `
# The Full Stack Developer Roadmap for 2026

The software landscape is evolving faster than ever. AI coding assistants, serverless infrastructure, and edge computing have redefined what it means to be a 10x Full Stack Developer. 

In this exhaustive guide, we break down the definitive path to becoming a world-class engineer.

---

### 1. Modern JavaScript & TypeScript Foundations
TypeScript is no longer optional—it is the baseline standard across the industry.
- **Key Concepts:** Discriminated Unions, Generics, Utility Types, Async Iterators, Event Loops.
- **Tip:** Avoid using \`any\`. Strict TypeScript prevents 80% of runtime production bugs.

### 2. The Frontend Evolution: React 19 & Next.js 15
Modern frontend development is no longer just about client-side SPAs. It's about hybrid rendering:
- **Server Components (RSC):** Fetch data directly inside components with zero bundle overhead.
- **Server Actions:** Seamlessly mutate data without creating boilerplate API endpoints.
- **Optimistic UI:** Keep interfaces responsive by rendering expected state before network confirmation.

\`\`\`typescript
// Example React Server Action in Next.js
export async function updateProfile(formData: FormData) {
  'use server';
  const name = formData.get('name');
  await db.user.update({ where: { id }, data: { name } });
  revalidatePath('/profile');
}
\`\`\`

### 3. Resilient Backend Systems & Microservices
Monoliths are great for speed, but microservices power enterprise scale:
- **Node.js & Express / Fastify:** High-throughput async I/O.
- **Database Architecture:** PostgreSQL with indexing for relational data, MongoDB for unstructured documents, Redis for distributed caching.
- **Event-Driven Architecture:** Kafka and RabbitMQ for decoupling critical business domains.

---

### 4. Containerization & DevOps
Every modern developer must know how their code runs in production:
- **Docker:** Multi-stage builds to minimize container images.
- **CI/CD:** GitHub Actions workflows for automated testing and zero-downtime deployment.
- **Cloud Infrastructure:** AWS (ECS, S3, RDS, CloudFront) or Serverless Edge networks.

### Summary
Consistency and hands-on project building will always beat passive video watching. Pick a project, ship it to production, break it, and optimize it.
      `,
      author: 'Suraj Sahoo',
      authorImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      category: 'Career & Roadmaps',
      tags: ['Full Stack', 'Web Development', 'Career Guide', 'React', 'Node.js', 'Roadmap'],
      seoTitle: 'Full Stack Developer Roadmap 2026 — CodeWithSuraj',
      seoDescription: 'Master web development in 2026 with our complete Full Stack Engineering roadmap.',
      seoKeywords: ['full stack roadmap', 'web dev 2026', 'react 19', 'nodejs', 'career advice'],
      status: 'published',
      publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      views: 1840,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      title: 'Demystifying React Server Components and Server Actions in Next.js',
      slug: 'demystifying-react-server-components-nextjs',
      coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&auto=format&fit=crop&q=80',
      excerpt: 'Understand how React Server Components work behind the scenes, how hydration changes, and how to avoid the most common developer pitfalls.',
      content: `
# Demystifying React Server Components and Server Actions

React Server Components (RSC) represent the biggest architectural shift in React since Hooks were introduced in 2018.

### Why Server Components?
In traditional Client-Side Rendering (CSR):
1. The browser downloads a large JavaScript bundle.
2. The JavaScript executes and triggers API calls.
3. The UI renders and hydrates.

With **React Server Components**:
- Components render on the server into a special streaming format (RSC Payload).
- Zero JavaScript sent to the browser for server-only components.
- Direct access to databases, secrets, and internal microservices without exposing APIs.

\`\`\`tsx
// Server Component: No 'use client' required
import db from '@/lib/db';

export default async function CoursesList() {
  const courses = await db.course.findMany();
  return (
    <div className="grid">
      {courses.map(c => <h3 key={c.id}>{c.title}</h3>)}
    </div>
  );
}
\`\`\`

### When to use 'use client'?
Only use \`'use client'\` at the leaves of your component tree when you need:
- React State (\`useState\`, \`useReducer\`)
- Lifecycle effects (\`useEffect\`)
- Event listeners (\`onClick\`, \`onChange\`, \`onMouseEnter\`)
- Browser-only APIs (\`window\`, \`localStorage\`)

By following this pattern, your application remains lightning fast while delivering dynamic interactivity.
      `,
      author: 'Priya Sharma',
      authorImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
      category: 'Frontend',
      tags: ['React', 'Next.js', 'Server Components', 'Web Performance'],
      seoTitle: 'React Server Components in Next.js Explained',
      seoDescription: 'Master React Server Components and Server Actions in Next.js App Router.',
      seoKeywords: ['react server components', 'rsc', 'nextjs server actions', 'react 19'],
      status: 'published',
      publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      views: 2450,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      title: 'Building Intelligent RAG Applications with Python and LangChain',
      slug: 'building-rag-applications-python-langchain',
      coverImage: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=1200&auto=format&fit=crop&q=80',
      excerpt: 'Learn how Retrieval-Augmented Generation (RAG) works, how to chunk documents, generate vector embeddings, and build production AI assistants.',
      content: `
# Building Intelligent RAG Applications with Python and LangChain

Large Language Models (LLMs) are revolutionary, but they suffer from hallucinations and knowledge cutoffs. **Retrieval-Augmented Generation (RAG)** solves this by grounding the model with your company's custom proprietary data.

### The 4 Pillars of RAG:
1. **Document Ingestion & Chunking:** Splitting raw PDFs, markdown, or databases into semantic chunks.
2. **Embedding Generation:** Transforming text into high-dimensional vector embeddings using OpenAI or HuggingFace models.
3. **Vector Database Indexing:** Storing vectors in Pinecone, ChromaDB, or Qdrant for millisecond cosine-similarity search.
4. **Context Injection:** Injecting the retrieved context into the LLM system prompt before generating the final answer.

\`\`\`python
from langchain.vectorstores import Pinecone
from langchain.embeddings import OpenAIEmbeddings
from langchain.chains import RetrievalQA
from langchain.llms import OpenAI

embeddings = OpenAIEmbeddings()
vectorstore = Pinecone.from_existing_index("knowledge-base", embeddings)
qa_chain = RetrievalQA.from_chain_type(
    llm=OpenAI(temperature=0.2),
    retriever=vectorstore.as_retriever(search_kwargs={"k": 3})
)

response = qa_chain.run("How do I cancel my subscription?")
print(response)
\`\`\`

With this architecture, developers can build domain-specific AI assistants that provide 99.9% factual responses without expensive fine-tuning.
      `,
      author: 'Dr. Vikram Malhotra',
      authorImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      category: 'AI & Data Science',
      tags: ['AI', 'Python', 'LangChain', 'RAG', 'Machine Learning', 'LLMs'],
      seoTitle: 'Building Production RAG Systems with Python and LangChain',
      seoDescription: 'Complete tutorial on building Retrieval-Augmented Generation AI apps.',
      seoKeywords: ['rag tutorial', 'langchain python', 'vector database', 'ai engineering'],
      status: 'published',
      publishedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
      views: 3120,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      title: 'System Design 101: Architecting Microservices for High Concurrency',
      slug: 'system-design-microservices-high-concurrency',
      coverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop&q=80',
      excerpt: 'How to handle 100,000+ requests per second: rate limiting, circuit breakers, distributed caching, and database sharding patterns.',
      content: `
# System Design 101: Architecting for High Concurrency

When your application scales from 1,000 users to 1,000,000 users, traditional database queries and synchronous API chains quickly fall apart.

### Key Strategies for Extreme Scale:
1. **Multi-Tier Caching:** CDN edge caching for static assets, Redis memory caching for frequent reads, and local in-memory caches.
2. **Circuit Breakers & Graceful Degradation:** Use patterns like Resilience4j or Polly to prevent cascading service failures.
3. **Database Read Replicas & Connection Pooling:** Offload read queries to read-replicas and maintain optimal connection pools with PgBouncer.
4. **Idempotent API Handlers:** Ensure payment and transaction endpoints use UUID idempotency keys to avoid duplicate charges.

Mastering these core principles will elevate you from a coder to a seasoned software architect.
      `,
      author: 'Suraj Sahoo',
      authorImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      category: 'Backend',
      tags: ['System Design', 'Microservices', 'Distributed Systems', 'Architecture', 'High Concurrency'],
      seoTitle: 'System Design Guide: High Concurrency Microservices',
      seoDescription: 'Learn system design and scalability patterns for high-throughput backends.',
      seoKeywords: ['system design', 'microservices', 'caching', 'concurrency', 'distributed systems'],
      status: 'published',
      publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      views: 4200,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
  console.log('✓ Seeded Blogs');

  // 6. Testimonials
  await db.collection('testimonials').insertMany([
    {
      name: 'Rohan Deshmukh',
      role: 'Full Stack Engineer',
      company: 'Amazon',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
      content: 'CodeWithSuraj completely transformed my career trajectory. The MERN Stack bootcamp gave me practical system design skills that directly helped me clear the Amazon technical interview rounds. Suraj mentors with unmatched passion!',
      rating: 5,
      isFeatured: true,
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Sneha Patel',
      role: 'Frontend Developer',
      company: 'Razorpay',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
      content: 'The React 19 & Next.js training is the most up-to-date and practical course anywhere on the web. I went from struggling with state management to building real-time dashboards with confidence.',
      rating: 5,
      isFeatured: true,
      order: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Aman Verma',
      role: 'AI Engineer',
      company: 'Swiggy',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      content: 'The Python & LangChain bootcamp is phenomenal. Dr. Vikram explains complex mathematical concepts and RAG vector pipelines with extreme clarity. Got placed within 2 months of completion!',
      rating: 5,
      isFeatured: true,
      order: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
  console.log('✓ Seeded Testimonials');

  // 7. FAQs
  await db.collection('faqs').insertMany([
    {
      question: 'Are the live sessions recorded for later review?',
      answer: 'Yes, absolutely! Every live session is recorded in HD and uploaded to your personal student portal within 2 hours of completion, complete with source code, slides, and class notes. You have lifetime access.',
      category: 'General',
      isGlobal: true,
      order: 1,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      question: 'Do you offer placement support and career guidance?',
      answer: 'Yes. We provide 1-on-1 resume reviews, mock technical interviews, LinkedIn profile optimization, and direct job referral access to our network of 200+ hiring partner startups and tech companies.',
      category: 'Placement',
      isGlobal: true,
      order: 2,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      question: 'Can I pay in installments or EMIs?',
      answer: 'Yes, we offer flexible 0% interest EMI options through Razorpay for major credit and debit cards, as well as no-cost EMI plans up to 6 months.',
      category: 'Payments',
      isGlobal: true,
      order: 3,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      question: 'What if I miss a live batch session?',
      answer: 'You can watch the high-resolution recording, attend doubt-clearing office hours with teaching assistants, or attend the same topic in another running batch anytime.',
      category: 'Curriculum',
      isGlobal: true,
      order: 4,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      question: 'Is there a prerequisite or coding background required?',
      answer: 'Our beginner tracks start from the ground up with foundational JavaScript and Python. For intermediate and advanced tracks, basic programming knowledge is recommended.',
      category: 'General',
      isGlobal: true,
      order: 5,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
  console.log('✓ Seeded FAQs');

  console.log('🎉 Seeding successfully completed!');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding error:', err);
  process.exit(1);
});
