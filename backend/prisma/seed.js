import "dotenv/config";
import prisma from "../src/config/prisma.js";
import bcrypt from "bcrypt";

/**
 * Ensures a UserRoleAssignment exists without duplicating records
 */
async function ensureRoleAssignment(userId, role, scopeType, scopeId = null) {
  const existing = await prisma.userRoleAssignment.findFirst({
    where: {
      userId,
      role,
      scopeType,
      scopeId: scopeId || null,
    },
  });

  if (!existing) {
    return prisma.userRoleAssignment.create({
      data: {
        userId,
        role,
        scopeType,
        scopeId: scopeId || null,
      },
    });
  }
  return existing;
}

async function main() {
  console.log("🌱 Starting CSEC-ASTU BMS Database Seed...");

  const adminPasswordHash = await bcrypt.hash("Admin123!", 10);
  const userPasswordHash = await bcrypt.hash("Password123!", 10);

  // ─── 1. Super Admin (GLOBAL Scope) ──────────────────────────────────────────
  const superAdmin = await prisma.user.upsert({
    where: { email: "tinsae.melkamu.tk@gmail.com" },
    update: {
      fullName: "CSEC Head Admin",
      department: "Computer Science and Engineering",
    },
    create: {
      fullName: "CSEC Head Admin",
      email: "tinsae.melkamu.tk@gmail.com",
      passwordHash: adminPasswordHash,
      universityId: "CSEC/001",
      department: "Computer Science and Engineering",
      isEmailVerified: true,
    },
  });
  await ensureRoleAssignment(superAdmin.id, "SUPER_ADMIN", "GLOBAL", null);
  console.log(`✅ Super Admin: ${superAdmin.email} [Role: SUPER_ADMIN (GLOBAL)]`);

  // ─── 2. Divisions ───────────────────────────────────────────────────────────
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
      update: { description: div.description },
      create: div,
    });
    createdDivisions.push(d);
  }
  console.log(`✅ Seeded ${createdDivisions.length} CSEC-ASTU Divisions`);

  const devDiv = createdDivisions.find((d) => d.slug === "development");

  // ─── 3. Division Admin (DIVISION Scope) ──────────────────────────────────────
  const divisionAdmin = await prisma.user.upsert({
    where: { email: "dev.admin@csec.astu.edu.et" },
    update: {
      fullName: "Development Division Head",
      department: "Software Engineering",
    },
    create: {
      fullName: "Development Division Head",
      email: "dev.admin@csec.astu.edu.et",
      passwordHash: adminPasswordHash,
      universityId: "CSEC/DIV/001",
      department: "Software Engineering",
      isEmailVerified: true,
    },
  });
  await ensureRoleAssignment(divisionAdmin.id, "DIVISION_ADMIN", "DIVISION", devDiv.id);
  console.log(`✅ Division Admin: ${divisionAdmin.email} [Role: DIVISION_ADMIN (DIVISION: ${devDiv.name})]`);

  // ─── 4. Bootcamp Cohort ─────────────────────────────────────────────────────
  const now = new Date();
  const startDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const endDate = new Date(now.getTime() + 67 * 24 * 60 * 60 * 1000);

  const bootcamp = await prisma.bootcamp.upsert({
    where: { id: "demo-bootcamp-2026" },
    update: {
      status: "OPEN",
    },
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
  console.log(`✅ Demo Bootcamp: "${bootcamp.title}" [Status: ${bootcamp.status}]`);

  // ─── 5. Instructor (BOOTCAMP Scope) ─────────────────────────────────────────
  const instructor = await prisma.user.upsert({
    where: { email: "instructor@csec.astu.edu.et" },
    update: {
      fullName: "Lead Web Instructor",
      department: "Computer Science and Engineering",
    },
    create: {
      fullName: "Lead Web Instructor",
      email: "instructor@csec.astu.edu.et",
      passwordHash: userPasswordHash,
      universityId: "CSEC/INST/001",
      department: "Computer Science and Engineering",
      isEmailVerified: true,
    },
  });
  await ensureRoleAssignment(instructor.id, "INSTRUCTOR", "BOOTCAMP", bootcamp.id);
  console.log(`✅ Instructor: ${instructor.email} [Role: INSTRUCTOR (BOOTCAMP: ${bootcamp.title})]`);

  // ─── 6. Student (BOOTCAMP Scope & Active Enrollment) ────────────────────────
  const student = await prisma.user.upsert({
    where: { email: "student@csec.astu.edu.et" },
    update: {
      fullName: "Abebe Bikila",
      department: "Computer Science and Engineering",
    },
    create: {
      fullName: "Abebe Bikila",
      email: "student@csec.astu.edu.et",
      passwordHash: userPasswordHash,
      universityId: "UGR/1234/16",
      department: "Computer Science and Engineering",
      isEmailVerified: true,
    },
  });
  await ensureRoleAssignment(student.id, "STUDENT", "BOOTCAMP", bootcamp.id);

  await prisma.enrollment.upsert({
    where: {
      userId_bootcampId: {
        userId: student.id,
        bootcampId: bootcamp.id,
      },
    },
    update: { status: "STUDENT" },
    create: {
      userId: student.id,
      bootcampId: bootcamp.id,
      status: "STUDENT",
      motivation: "Passionate about fullstack web development and open source systems.",
    },
  });
  console.log(`✅ Student: ${student.email} [Role: STUDENT (BOOTCAMP: ${bootcamp.title})]`);

  // ─── 7. Guest User (GLOBAL Scope & Applicant Enrollment) ────────────────────
  const guestUser = await prisma.user.upsert({
    where: { email: "applicant@csec.astu.edu.et" },
    update: {
      fullName: "Chaltu Desta",
      department: "Electrical and Computer Engineering",
    },
    create: {
      fullName: "Chaltu Desta",
      email: "applicant@csec.astu.edu.et",
      passwordHash: userPasswordHash,
      universityId: "UGR/5678/16",
      department: "Electrical and Computer Engineering",
      isEmailVerified: true,
    },
  });
  await ensureRoleAssignment(guestUser.id, "GUEST", "GLOBAL", null);

  await prisma.enrollment.upsert({
    where: {
      userId_bootcampId: {
        userId: guestUser.id,
        bootcampId: bootcamp.id,
      },
    },
    update: { status: "APPLICANT" },
    create: {
      userId: guestUser.id,
      bootcampId: bootcamp.id,
      status: "APPLICANT",
      motivation: "Excited to learn backend distributed systems and contribute to club projects.",
    },
  });
  console.log(`✅ Guest / Applicant: ${guestUser.email} [Role: GUEST (GLOBAL, Status: APPLICANT)]`);

  // ─── 8. Sample Academic Session ─────────────────────────────────────────────
  const sessionStartTime = new Date(startDate.getTime() + 10 * 60 * 60 * 1000); // 10:00 AM
  const sessionEndTime = new Date(sessionStartTime.getTime() + 2 * 60 * 60 * 1000); // 12:00 PM

  const session = await prisma.session.upsert({
    where: { id: "demo-session-1" },
    update: {},
    create: {
      id: "demo-session-1",
      bootcampId: bootcamp.id,
      instructorId: instructor.id,
      title: "Session 1: Node.js & Database Architecture",
      description: "Core fundamentals of Express, PostgreSQL schema design, and asynchronous patterns.",
      location: "Lab 402 / Block 513",
      startTime: sessionStartTime,
      endTime: sessionEndTime,
      status: "APPROVED",
    },
  });
  console.log(`✅ Sample Session created: "${session.title}" (Instructor: ${instructor.fullName})`);

  // ─── 9. Sample Task ─────────────────────────────────────────────────────────
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

  // ─── 10. Sample Capstone Project Group ───────────────────────────────────────
  const group = await prisma.group.upsert({
    where: { id: "demo-group-alpha" },
    update: {},
    create: {
      id: "demo-group-alpha",
      bootcampId: bootcamp.id,
      name: "Capstone Squad Alpha",
    },
  });

  await prisma.groupMember.upsert({
    where: {
      groupId_userId: {
        groupId: group.id,
        userId: student.id,
      },
    },
    update: { isLeader: true },
    create: {
      groupId: group.id,
      userId: student.id,
      isLeader: true,
    },
  });
  console.log(`✅ Capstone Group created: "${group.name}" with Leader "${student.fullName}"`);

  console.log("\n========================================================");
  console.log("✨ Seed completed successfully! Test Accounts:");
  console.log("  1. SUPER_ADMIN:    tinsae.melkamu.tk@gmail.com  (Pass: Admin123!)");
  console.log("  2. DIVISION_ADMIN: dev.admin@csec.astu.edu.et   (Pass: Admin123!)");
  console.log("  3. INSTRUCTOR:     instructor@csec.astu.edu.et  (Pass: Password123!)");
  console.log("  4. STUDENT:        student@csec.astu.edu.et     (Pass: Password123!)");
  console.log("  5. GUEST:          applicant@csec.astu.edu.et   (Pass: Password123!)");
  console.log("========================================================\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
