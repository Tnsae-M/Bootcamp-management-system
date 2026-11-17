import "dotenv/config";
import prisma from "../src/config/prisma.js";
import bcrypt from "bcrypt";

async function main() {
  console.log("🌱 Starting CSEC-ASTU BMS Database Seed...");

  // 1. Create Super Admin User
  const passwordHash = await bcrypt.hash("Admin123!", 10);
  const superAdmin = await prisma.user.upsert({
    where: { email: "admin@csec.astu.edu.et" },
    update: {},
    create: {
      fullName: "CSEC Head Admin",
      email: "admin@csec.astu.edu.et",
      passwordHash,
      universityId: "CSEC/001",
      department: "Computer Science and Engineering",
      roleAssignments: {
        create: {
          role: "SUPER_ADMIN",
          scopeType: "GLOBAL",
        },
      },
    },
    include: { roleAssignments: true },
  });
  console.log(`✅ Super Admin created: ${superAdmin.email} (Password: Admin123!)`);

  // 2. Create Divisions
  const divisions = [
    {
      name: "Cybersecurity Division",
      slug: "cybersecurity",
      description: "Offensive and defensive cybersecurity, CTF training, binary exploitation, and network security.",
    },
    {
      name: "Development Division",
      slug: "development",
      description: "Full-stack software engineering, modern web applications, distributed systems, and open source.",
    },
    {
      name: "Competitive Programming Division",
      slug: "competitive-programming",
      description: "Data structures, algorithms, problem solving, and ICPC competition preparation.",
    },
  ];

  const createdDivisions = [];
  for (const div of divisions) {
    const d = await prisma.division.upsert({
      where: { slug: div.slug },
      update: {},
      create: div,
    });
    createdDivisions.push(d);
  }
  console.log(`✅ Seeded ${createdDivisions.length} CSEC-ASTU Divisions`);

  // 3. Create Sample Open Bootcamp
  const devDiv = createdDivisions.find((d) => d.slug === "development");
  const now = new Date();
  const startDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const endDate = new Date(now.getTime() + 67 * 24 * 60 * 60 * 1000);

  const bootcamp = await prisma.bootcamp.upsert({
    where: { id: "demo-bootcamp-2026" },
    update: {},
    create: {
      id: "demo-bootcamp-2026",
      divisionId: devDiv.id,
      title: "Fullstack Web Development Bootcamp 2026",
      description: "Intensive 8-week engineering cohort covering PostgreSQL, Express, React, and production system architecture.",
      status: "OPEN",
      startDate,
      endDate,
      attendanceWeight: 20,
      individualTaskWeight: 40,
      groupMilestoneWeight: 30,
      peerReviewWeight: 10,
    },
  });
  console.log(`✅ Demo Bootcamp created: "${bootcamp.title}" (Status: ${bootcamp.status})`);

  // 4. Create Sample Task
  const taskDeadline = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  const task = await prisma.task.upsert({
    where: { id: "demo-task-1" },
    update: {},
    create: {
      id: "demo-task-1",
      bootcampId: bootcamp.id,
      type: "INDIVIDUAL",
      title: "Lab 1: Git & GitHub Workflow Setup",
      description: "Set up your development repository, establish clean commit conventions, and create your first pull request.",
      submissionType: "GITHUB_LINK",
      deadline: taskDeadline,
      maxScore: 100,
      allowLateSubmission: true,
      allowResubmission: true,
    },
  });
  console.log(`✅ Sample Task created: "${task.title}"`);

  console.log("✨ Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
