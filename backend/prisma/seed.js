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
  console.log("🌱 ========================================================");
  console.log("🌱 Starting CSEC-ASTU BMS Comprehensive Database Seeding...");
  console.log("🌱 ========================================================\n");

  const adminPasswordHash = await bcrypt.hash("Admin123!", 10);
  const userPasswordHash = await bcrypt.hash("Password123!", 10);

  // ───────────────────────────────────────────────────────────────────────────
  // 1. DIVISIONS (4 Specialization Pillars)
  // ───────────────────────────────────────────────────────────────────────────
  const divisionData = [
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
    {
      name: "Applied AI Division",
      slug: "applied-ai",
      description: "Applied machine learning, neural networks, natural language processing, and computer vision systems.",
    },
  ];

  const divisions = {};
  for (const div of divisionData) {
    const d = await prisma.division.upsert({
      where: { slug: div.slug },
      update: { name: div.name, description: div.description },
      create: div,
    });
    divisions[div.slug] = d;
  }
  console.log(`✅ Seeded ${Object.keys(divisions).length} Academic Divisions`);

  // ───────────────────────────────────────────────────────────────────────────
  // 2. USERS & ROLES
  // ───────────────────────────────────────────────────────────────────────────

  // 2.1 Super Admin (GLOBAL Scope)
  const superAdmin = await prisma.user.upsert({
    where: { email: "tinsae.melkamu.tk@gmail.com" },
    update: {
      fullName: "Tinsae Melkamu (Head Admin)",
      department: "Computer Science and Engineering",
      universityId: "CSEC/001",
      isEmailVerified: true,
    },
    create: {
      fullName: "Tinsae Melkamu (Head Admin)",
      email: "tinsae.melkamu.tk@gmail.com",
      passwordHash: adminPasswordHash,
      universityId: "CSEC/001",
      department: "Computer Science and Engineering",
      telegramUsername: "tinsae_admin",
      isEmailVerified: true,
    },
  });
  await ensureRoleAssignment(superAdmin.id, "SUPER_ADMIN", "GLOBAL", null);
  console.log(`✅ Super Admin: ${superAdmin.email} [SUPER_ADMIN (GLOBAL)]`);

  // 2.2 Division Admins (DIVISION Scope)
  const divisionAdminsData = [
    {
      email: "dev.admin@csec.astu.edu.et",
      fullName: "Kenenisa Bekele (Dev Head)",
      department: "Software Engineering",
      universityId: "CSEC/DIV/001",
      divisionSlug: "development",
      telegramUsername: "kenenisa_dev",
    },
    {
      email: "cyber.admin@csec.astu.edu.et",
      fullName: "Hirut Lemma (Cyber Head)",
      department: "Cybersecurity & InfoSec",
      universityId: "CSEC/DIV/002",
      divisionSlug: "cybersecurity",
      telegramUsername: "hirut_sec",
    },
    {
      email: "cp.admin@csec.astu.edu.et",
      fullName: "Natnael Tefera (CP Head)",
      department: "Computer Science",
      universityId: "CSEC/DIV/003",
      divisionSlug: "competitive-programming",
      telegramUsername: "nati_algo",
    },
    {
      email: "ai.admin@csec.astu.edu.et",
      fullName: "Bethlehem Tilahun (AI Head)",
      department: "Artificial Intelligence & Data Science",
      universityId: "CSEC/DIV/004",
      divisionSlug: "applied-ai",
      telegramUsername: "beth_ai",
    },
  ];

  const divAdmins = {};
  for (const admin of divisionAdminsData) {
    const user = await prisma.user.upsert({
      where: { email: admin.email },
      update: {
        fullName: admin.fullName,
        department: admin.department,
        universityId: admin.universityId,
        isEmailVerified: true,
      },
      create: {
        fullName: admin.fullName,
        email: admin.email,
        passwordHash: adminPasswordHash,
        universityId: admin.universityId,
        department: admin.department,
        telegramUsername: admin.telegramUsername,
        isEmailVerified: true,
      },
    });
    const targetDiv = divisions[admin.divisionSlug];
    await ensureRoleAssignment(user.id, "DIVISION_ADMIN", "DIVISION", targetDiv.id);
    divAdmins[admin.divisionSlug] = user;
    console.log(`✅ Division Admin: ${user.email} [DIVISION_ADMIN (${targetDiv.name})]`);
  }

  // 2.3 Instructors
  const instructorsData = [
    {
      idKey: "web-inst",
      email: "instructor@csec.astu.edu.et",
      fullName: "Ermias Assefa (Lead Web Instructor)",
      department: "Software Engineering",
      universityId: "CSEC/INST/001",
      telegramUsername: "ermias_web",
    },
    {
      idKey: "cyber-inst",
      email: "cyber.instructor@csec.astu.edu.et",
      fullName: "Yonas Kassa (Security Lead)",
      department: "Cybersecurity & Networks",
      universityId: "CSEC/INST/002",
      telegramUsername: "yonas_cyber",
    },
    {
      idKey: "cp-inst",
      email: "cp.instructor@csec.astu.edu.et",
      fullName: "Blen Getachew (Algorithms Coach)",
      department: "Computer Science",
      universityId: "CSEC/INST/003",
      telegramUsername: "blen_icpc",
    },
  ];

  const instructors = {};
  for (const inst of instructorsData) {
    const user = await prisma.user.upsert({
      where: { email: inst.email },
      update: {
        fullName: inst.fullName,
        department: inst.department,
        universityId: inst.universityId,
        isEmailVerified: true,
      },
      create: {
        fullName: inst.fullName,
        email: inst.email,
        passwordHash: userPasswordHash,
        universityId: inst.universityId,
        department: inst.department,
        telegramUsername: inst.telegramUsername,
        isEmailVerified: true,
      },
    });
    instructors[inst.idKey] = user;
    console.log(`✅ Instructor: ${user.email} (${user.fullName})`);
  }

  // 2.4 Students
  const studentsData = [
    {
      key: "abebe",
      email: "student@csec.astu.edu.et",
      fullName: "Abebe Bikila",
      universityId: "UGR/1234/16",
      department: "Computer Science and Engineering",
      telegramUsername: "abebe_csec",
    },
    {
      key: "selam",
      email: "selam.student@csec.astu.edu.et",
      fullName: "Selamawit Tadesse",
      universityId: "UGR/2345/16",
      department: "Software Engineering",
      telegramUsername: "selam_t",
    },
    {
      key: "kidus",
      email: "kidus.student@csec.astu.edu.et",
      fullName: "Kidus Yohannes",
      universityId: "UGR/3456/16",
      department: "Computer Science",
      telegramUsername: "kidus_y",
    },
    {
      key: "meron",
      email: "meron.student@csec.astu.edu.et",
      fullName: "Meron Hailu",
      universityId: "UGR/4567/16",
      department: "Electrical and Computer Engineering",
      telegramUsername: "meron_h",
    },
    {
      key: "yared",
      email: "yared.student@csec.astu.edu.et",
      fullName: "Yared Alemu",
      universityId: "UGR/7890/16",
      department: "Information Technology",
      telegramUsername: "yared_a",
    },
  ];

  const students = {};
  for (const s of studentsData) {
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: {
        fullName: s.fullName,
        department: s.department,
        universityId: s.universityId,
        isEmailVerified: true,
      },
      create: {
        fullName: s.fullName,
        email: s.email,
        passwordHash: userPasswordHash,
        universityId: s.universityId,
        department: s.department,
        telegramUsername: s.telegramUsername,
        isEmailVerified: true,
      },
    });
    students[s.key] = user;
    console.log(`✅ Student: ${user.email} (${user.fullName})`);
  }

  // 2.5 Guests / Applicants
  const guestsData = [
    {
      key: "chaltu",
      email: "applicant@csec.astu.edu.et",
      fullName: "Chaltu Desta",
      universityId: "UGR/5678/16",
      department: "Electrical and Computer Engineering",
    },
    {
      key: "dawit",
      email: "rejected.applicant@csec.astu.edu.et",
      fullName: "Dawit Mengistu",
      universityId: "UGR/6789/16",
      department: "Civil Engineering",
    },
    {
      key: "helen",
      email: "new.guest@csec.astu.edu.et",
      fullName: "Helen Berhanu",
      universityId: "UGR/9012/16",
      department: "Computer Science",
    },
  ];

  const guests = {};
  for (const g of guestsData) {
    const user = await prisma.user.upsert({
      where: { email: g.email },
      update: {
        fullName: g.fullName,
        department: g.department,
        universityId: g.universityId,
        isEmailVerified: true,
      },
      create: {
        fullName: g.fullName,
        email: g.email,
        passwordHash: userPasswordHash,
        universityId: g.universityId,
        department: g.department,
        isEmailVerified: true,
      },
    });
    await ensureRoleAssignment(user.id, "GUEST", "GLOBAL", null);
    guests[g.key] = user;
    console.log(`✅ Guest: ${user.email} [GUEST (GLOBAL)]`);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 3. BOOTCAMPS (6 Lifecycle Phases)
  // ───────────────────────────────────────────────────────────────────────────
  const now = new Date();
  const oneDay = 24 * 60 * 60 * 1000;

  // 3.1 ACTIVE Bootcamp: Cybersecurity & Defense 2026
  const cyberBootcamp = await prisma.bootcamp.upsert({
    where: { id: "demo-bootcamp-cyber-2026" },
    update: {
      status: "ACTIVE",
    },
    create: {
      id: "demo-bootcamp-cyber-2026",
      divisionId: divisions["cybersecurity"].id,
      title: "Cybersecurity & Defense Bootcamp 2026",
      description: "Rigorous 10-week technical bootcamp covering Linux internals, network reconnaissance, web app penetration testing, and binary exploitation.",
      status: "ACTIVE",
      applicationOpenAt: new Date(now.getTime() - 40 * oneDay),
      applicationCloseAt: new Date(now.getTime() - 25 * oneDay),
      startDate: new Date(now.getTime() - 21 * oneDay),
      endDate: new Date(now.getTime() + 49 * oneDay),
      maxApplicants: 40,
      attendanceWeight: 20,
      individualTaskWeight: 40,
      groupMilestoneWeight: 30,
      peerReviewWeight: 10,
    },
  });
  await ensureRoleAssignment(instructors["cyber-inst"].id, "INSTRUCTOR", "BOOTCAMP", cyberBootcamp.id);
  console.log(`✅ Bootcamp: "${cyberBootcamp.title}" [ACTIVE]`);

  // 3.2 OPEN Bootcamp: Fullstack Web Development 2026
  const webBootcamp = await prisma.bootcamp.upsert({
    where: { id: "demo-bootcamp-dev-2026" },
    update: {
      status: "OPEN",
    },
    create: {
      id: "demo-bootcamp-dev-2026",
      divisionId: divisions["development"].id,
      title: "Fullstack Web Development Bootcamp 2026",
      description: "Intensive 8-week engineering cohort covering PostgreSQL, Express, React, Redux Toolkit, and production cloud architecture.",
      status: "OPEN",
      applicationOpenAt: new Date(now.getTime() - 10 * oneDay),
      applicationCloseAt: new Date(now.getTime() + 5 * oneDay),
      startDate: new Date(now.getTime() + 7 * oneDay),
      endDate: new Date(now.getTime() + 63 * oneDay),
      maxApplicants: 50,
      attendanceWeight: 20,
      individualTaskWeight: 40,
      groupMilestoneWeight: 30,
      peerReviewWeight: 10,
    },
  });
  await ensureRoleAssignment(instructors["web-inst"].id, "INSTRUCTOR", "BOOTCAMP", webBootcamp.id);
  console.log(`✅ Bootcamp: "${webBootcamp.title}" [OPEN]`);

  // 3.3 SCREENING Bootcamp: Competitive Programming Winter Camp 2026
  const cpBootcamp = await prisma.bootcamp.upsert({
    where: { id: "demo-bootcamp-cp-2026" },
    update: {
      status: "SCREENING",
    },
    create: {
      id: "demo-bootcamp-cp-2026",
      divisionId: divisions["competitive-programming"].id,
      title: "Competitive Programming Winter Camp 2026",
      description: "Fast-paced algorithmic training focusing on graph theory, dynamic programming, and ICPC regional contest problems.",
      status: "SCREENING",
      applicationOpenAt: new Date(now.getTime() - 15 * oneDay),
      applicationCloseAt: new Date(now.getTime() - 1 * oneDay),
      startDate: new Date(now.getTime() + 14 * oneDay),
      endDate: new Date(now.getTime() + 42 * oneDay),
      maxApplicants: 30,
      attendanceWeight: 25,
      individualTaskWeight: 50,
      groupMilestoneWeight: 15,
      peerReviewWeight: 10,
    },
  });
  await ensureRoleAssignment(instructors["cp-inst"].id, "INSTRUCTOR", "BOOTCAMP", cpBootcamp.id);
  console.log(`✅ Bootcamp: "${cpBootcamp.title}" [SCREENING]`);

  // 3.4 DRAFT Bootcamp: Applied Generative AI & Deep Learning 2026
  const aiBootcamp = await prisma.bootcamp.upsert({
    where: { id: "demo-bootcamp-ai-2026" },
    update: {
      status: "DRAFT",
    },
    create: {
      id: "demo-bootcamp-ai-2026",
      divisionId: divisions["applied-ai"].id,
      title: "Applied Generative AI & Deep Learning 2026",
      description: "Hands-on engineering cohort building transformer models, vector retrieval pipelines, and autonomous agent systems.",
      status: "DRAFT",
      startDate: new Date(now.getTime() + 60 * oneDay),
      endDate: new Date(now.getTime() + 120 * oneDay),
      maxApplicants: 35,
      attendanceWeight: 20,
      individualTaskWeight: 35,
      groupMilestoneWeight: 35,
      peerReviewWeight: 10,
    },
  });
  console.log(`✅ Bootcamp: "${aiBootcamp.title}" [DRAFT]`);

  // 3.5 COMPLETED Bootcamp: Fullstack Web Development Cohort 2025
  const completedBootcamp = await prisma.bootcamp.upsert({
    where: { id: "demo-bootcamp-dev-2025" },
    update: {
      status: "COMPLETED",
    },
    create: {
      id: "demo-bootcamp-dev-2025",
      divisionId: divisions["development"].id,
      title: "Fullstack Web Development Cohort 2025",
      description: "Previous year web development cohort. Successfully inducted standout software engineering candidates.",
      status: "COMPLETED",
      startDate: new Date(now.getTime() - 120 * oneDay),
      endDate: new Date(now.getTime() - 30 * oneDay),
      attendanceWeight: 20,
      individualTaskWeight: 40,
      groupMilestoneWeight: 30,
      peerReviewWeight: 10,
    },
  });
  console.log(`✅ Bootcamp: "${completedBootcamp.title}" [COMPLETED]`);

  // 3.6 ARCHIVED Bootcamp: ICPC National Qualifier Training 2025
  const archivedBootcamp = await prisma.bootcamp.upsert({
    where: { id: "demo-bootcamp-cp-2025" },
    update: {
      status: "ARCHIVED",
    },
    create: {
      id: "demo-bootcamp-cp-2025",
      divisionId: divisions["competitive-programming"].id,
      title: "ICPC National Qualifier Training 2025",
      description: "Historical contest preparation archive.",
      status: "ARCHIVED",
      startDate: new Date(now.getTime() - 250 * oneDay),
      endDate: new Date(now.getTime() - 180 * oneDay),
      attendanceWeight: 25,
      individualTaskWeight: 50,
      groupMilestoneWeight: 15,
      peerReviewWeight: 10,
    },
  });
  console.log(`✅ Bootcamp: "${archivedBootcamp.title}" [ARCHIVED]`);

  // ───────────────────────────────────────────────────────────────────────────
  // 4. ENROLLMENTS & ROLE ASSIGNMENTS
  // ───────────────────────────────────────────────────────────────────────────

  // 4.1 Cyber Bootcamp (ACTIVE) - Active enrolled students
  const activeCyberStudents = [
    { user: students["abebe"], motivation: "Aiming to lead offensive security and CTF team." },
    { user: students["selam"], motivation: "Top ranking student aiming for binary exploitation excellence." },
    { user: students["kidus"], motivation: "Passionate about network traffic analysis and defense." },
    { user: students["meron"], motivation: "Hardware and embedded security specialist." },
  ];

  for (const { user, motivation } of activeCyberStudents) {
    await ensureRoleAssignment(user.id, "STUDENT", "BOOTCAMP", cyberBootcamp.id);
    await prisma.enrollment.upsert({
      where: { userId_bootcampId: { userId: user.id, bootcampId: cyberBootcamp.id } },
      update: { status: "STUDENT" },
      create: {
        userId: user.id,
        bootcampId: cyberBootcamp.id,
        status: "STUDENT",
        motivation,
        experience: "2nd/3rd year ASTU engineering with core CS coursework.",
        portfolioUrl: "https://github.com/csec-astu",
      },
    });
  }

  // 4.2 Web Bootcamp 2026 (OPEN) - Mixed applicant & student states
  await ensureRoleAssignment(students["abebe"].id, "STUDENT", "BOOTCAMP", webBootcamp.id);
  await prisma.enrollment.upsert({
    where: { userId_bootcampId: { userId: students["abebe"].id, bootcampId: webBootcamp.id } },
    update: { status: "STUDENT" },
    create: {
      userId: students["abebe"].id,
      bootcampId: webBootcamp.id,
      status: "STUDENT",
      motivation: "Eager to expand into production distributed backend architecture.",
      experience: "Completed intro web stack, built club portal prototype.",
    },
  });

  // Guest applicant (Pending)
  await prisma.enrollment.upsert({
    where: { userId_bootcampId: { userId: guests["chaltu"].id, bootcampId: webBootcamp.id } },
    update: { status: "APPLICANT" },
    create: {
      userId: guests["chaltu"].id,
      bootcampId: webBootcamp.id,
      status: "APPLICANT",
      motivation: "Passionate about UI/UX and fullstack web design. Want to build campus management tools.",
      experience: "Self-taught HTML/CSS/JavaScript and basic Node.js.",
      portfolioUrl: "https://github.com/chaltu-desta",
    },
  });

  // Guest applicant (Rejected)
  await prisma.enrollment.upsert({
    where: { userId_bootcampId: { userId: guests["dawit"].id, bootcampId: webBootcamp.id } },
    update: { status: "APPLICANT_REJECTED" },
    create: {
      userId: guests["dawit"].id,
      bootcampId: webBootcamp.id,
      status: "APPLICANT_REJECTED",
      motivation: "Looking to switch from Civil to Software.",
      experience: "No previous programming experience.",
    },
  });

  // 4.3 Completed Bootcamp 2025 Enrollments (for Induction decision demonstrations)
  const completedEnrollments = [
    { user: students["selam"], status: "INDUCTED", motivation: "Graduated with honors." },
    { user: students["abebe"], status: "INDUCTED", motivation: "Completed all capstone milestones." },
    { user: students["yared"], status: "NOT_INDUCTED", motivation: "Did not meet submission thresholds." },
  ];

  const completedEnrollmentRecords = {};
  for (const item of completedEnrollments) {
    const enr = await prisma.enrollment.upsert({
      where: { userId_bootcampId: { userId: item.user.id, bootcampId: completedBootcamp.id } },
      update: { status: item.status },
      create: {
        userId: item.user.id,
        bootcampId: completedBootcamp.id,
        status: item.status,
        motivation: item.motivation,
      },
    });
    completedEnrollmentRecords[item.user.email] = enr;
  }
  console.log(`✅ Configured realistic Enrollments across active, open, and completed cohorts`);

  // ───────────────────────────────────────────────────────────────────────────
  // 5. INDUCTION DECISIONS (4-Signal Transparent Model Demo)
  // ───────────────────────────────────────────────────────────────────────────
  // Selamawit: Top performer (>75% cutoff) -> INDUCTED
  await prisma.inductionDecision.upsert({
    where: { enrollmentId: completedEnrollmentRecords[students["selam"].email].id },
    update: {},
    create: {
      enrollmentId: completedEnrollmentRecords[students["selam"].email].id,
      decision: "INDUCTED",
      computedScoreAtDecision: 94.2,
      overrideNote: "Outstanding technical mastery: 100% session attendance and excellent capstone leadership.",
      decidedById: superAdmin.id,
      decidedAt: new Date(now.getTime() - 25 * oneDay),
    },
  });

  // Abebe: Met criteria (>75% cutoff) -> INDUCTED
  await prisma.inductionDecision.upsert({
    where: { enrollmentId: completedEnrollmentRecords[students["abebe"].email].id },
    update: {},
    create: {
      enrollmentId: completedEnrollmentRecords[students["abebe"].email].id,
      decision: "INDUCTED",
      computedScoreAtDecision: 81.5,
      overrideNote: "Strong turn-in rate on lab deliverables and high peer review scores.",
      decidedById: divAdmins["development"].id,
      decidedAt: new Date(now.getTime() - 25 * oneDay),
    },
  });

  // Yared: Under criteria (<75% cutoff) -> NOT_INDUCTED
  await prisma.inductionDecision.upsert({
    where: { enrollmentId: completedEnrollmentRecords[students["yared"].email].id },
    update: {},
    create: {
      enrollmentId: completedEnrollmentRecords[students["yared"].email].id,
      decision: "NOT_INDUCTED",
      computedScoreAtDecision: 58.4,
      overrideNote: "Missed 4 mandatory lab submissions and had an attendance rate below 60%. Encouraged to re-apply.",
      decidedById: divAdmins["development"].id,
      decidedAt: new Date(now.getTime() - 25 * oneDay),
    },
  });
  console.log(`✅ Seeded Induction Decisions demonstrating the 4-Signal Threshold Model`);

  // ───────────────────────────────────────────────────────────────────────────
  // 6. SESSIONS & ATTENDANCE CODES
  // ───────────────────────────────────────────────────────────────────────────
  const cyberInstId = instructors["cyber-inst"].id;

  // Session 1: Past / Completed
  const session1Start = new Date(now.getTime() - 14 * oneDay);
  session1Start.setHours(9, 0, 0, 0);
  const session1End = new Date(session1Start.getTime() + 3 * 60 * 60 * 1000);

  const session1 = await prisma.session.upsert({
    where: { id: "demo-cyber-session-1" },
    update: {},
    create: {
      id: "demo-cyber-session-1",
      bootcampId: cyberBootcamp.id,
      instructorId: cyberInstId,
      title: "Session 1: Linux Internals, Bash Scripting & Network Recon",
      description: "Kernel architecture, process management, shell automation, and active port scanning with Nmap.",
      location: "Lab 402 / Block 513",
      startTime: session1Start,
      endTime: session1End,
      status: "COMPLETED",
    },
  });

  // Attendance Records for Session 1
  const s1Attendance = [
    { user: students["selam"], status: "PRESENT", timeOffset: 5 },
    { user: students["abebe"], status: "PRESENT", timeOffset: 12 },
    { user: students["kidus"], status: "LATE", timeOffset: 35 },
    { user: students["meron"], status: "PRESENT", timeOffset: 8 },
  ];

  for (const item of s1Attendance) {
    await prisma.attendanceRecord.upsert({
      where: { sessionId_userId: { sessionId: session1.id, userId: item.user.id } },
      update: { status: item.status },
      create: {
        sessionId: session1.id,
        userId: item.user.id,
        status: item.status,
        submittedAt: new Date(session1Start.getTime() + item.timeOffset * 60 * 1000),
      },
    });
  }

  // Session 1 Feedback
  await prisma.sessionFeedback.upsert({
    where: { sessionId_userId: { sessionId: session1.id, userId: students["selam"].id } },
    update: {},
    create: {
      sessionId: session1.id,
      userId: students["selam"].id,
      rating: 5,
      comment: "Incredible hands-on depth with bash piping and socket programming.",
    },
  });
  await prisma.sessionFeedback.upsert({
    where: { sessionId_userId: { sessionId: session1.id, userId: students["abebe"].id } },
    update: {},
    create: {
      sessionId: session1.id,
      userId: students["abebe"].id,
      rating: 4,
      comment: "Very informative. More Wireshark capture time would be awesome.",
    },
  });

  // Session 2: LIVE TODAY with active PIN
  const session2Start = new Date(now.getTime() - 20 * 60 * 1000); // Started 20 mins ago
  const session2End = new Date(now.getTime() + 100 * 60 * 1000); // Ends in 100 mins

  const session2 = await prisma.session.upsert({
    where: { id: "demo-cyber-session-2" },
    update: {
      startTime: session2Start,
      endTime: session2End,
      status: "APPROVED",
    },
    create: {
      id: "demo-cyber-session-2",
      bootcampId: cyberBootcamp.id,
      instructorId: cyberInstId,
      title: "Session 2: Web App Penetration Testing & OWASP Top 10",
      description: "Hands-on injection exploitation, cross-site scripting (XSS), CSRF mitigations, and JWT validation bypasses.",
      location: "ASTU Main Computer Lab B",
      startTime: session2Start,
      endTime: session2End,
      status: "APPROVED",
    },
  });

  // Active Attendance PIN code (Valid for 45 mins from session open)
  const codeExpiresAt = new Date(now.getTime() + 25 * 60 * 1000); // 25 mins remaining!
  await prisma.attendanceCode.upsert({
    where: { sessionId: session2.id },
    update: {
      code: "749201",
      expiresAt: codeExpiresAt,
    },
    create: {
      sessionId: session2.id,
      code: "749201",
      windowMinutes: 45,
      openedAt: new Date(now.getTime() - 20 * 60 * 1000),
      expiresAt: codeExpiresAt,
    },
  });

  // Selamawit already checked in with PIN; Abebe has NOT checked in yet (ready to test PIN in UI!)
  await prisma.attendanceRecord.upsert({
    where: { sessionId_userId: { sessionId: session2.id, userId: students["selam"].id } },
    update: {},
    create: {
      sessionId: session2.id,
      userId: students["selam"].id,
      status: "PRESENT",
      submittedAt: new Date(now.getTime() - 15 * 60 * 1000),
    },
  });

  // Session 3: Upcoming Session
  const session3Start = new Date(now.getTime() + 4 * oneDay);
  session3Start.setHours(14, 0, 0, 0);
  const session3End = new Date(session3Start.getTime() + 3 * 60 * 60 * 1000);

  await prisma.session.upsert({
    where: { id: "demo-cyber-session-3" },
    update: {},
    create: {
      id: "demo-cyber-session-3",
      bootcampId: cyberBootcamp.id,
      instructorId: cyberInstId,
      title: "Session 3: Binary Exploitation & Memory Safety Fundamentals",
      description: "Stack overflows, return-oriented programming (ROP chains), ASLR/DEP mitigations, and Ghidra decompilation.",
      location: "Room 304, ICT Complex",
      startTime: session3Start,
      endTime: session3End,
      status: "APPROVED",
    },
  });

  // Session 4: Proposed Session (PENDING Admin approval)
  const session4Start = new Date(now.getTime() + 11 * oneDay);
  session4Start.setHours(10, 0, 0, 0);
  const session4End = new Date(session4Start.getTime() + 2 * 60 * 60 * 1000);

  await prisma.session.upsert({
    where: { id: "demo-cyber-session-4" },
    update: {},
    create: {
      id: "demo-cyber-session-4",
      bootcampId: cyberBootcamp.id,
      instructorId: cyberInstId,
      title: "Session 4: Malware Analysis Sandbox Engineering",
      description: "Static and dynamic analysis of real-world ransomware samples inside isolated hypervisor sandboxes.",
      location: "CSEC Security Lab 1",
      startTime: session4Start,
      endTime: session4End,
      status: "PENDING",
    },
  });
  console.log(`✅ Seeded Sessions: Completed, Active (PIN: 749201), Upcoming, and Pending Approval`);

  // ───────────────────────────────────────────────────────────────────────────
  // 7. TASKS & SUBMISSIONS
  // ───────────────────────────────────────────────────────────────────────────

  // 7.1 Individual Lab 1 (Past & Graded)
  const task1 = await prisma.task.upsert({
    where: { id: "demo-cyber-task-1" },
    update: {},
    create: {
      id: "demo-cyber-task-1",
      bootcampId: cyberBootcamp.id,
      type: "INDIVIDUAL",
      title: "Lab 1: Network Traffic Dissection & Threat Hunt",
      description: "Analyze provided PCAP capture files, identify beaconing malware, and write Snort IDS detection rules.",
      instructions: "Submit an executive investigation summary and the verified snort.rules file.",
      submissionType: "FILE",
      deadline: new Date(now.getTime() - 7 * oneDay),
      maxScore: 100,
      allowLateSubmission: true,
      latePenaltyPercent: 10,
      allowResubmission: true,
    },
  });

  // Graded Submissions for Task 1
  await prisma.submission.upsert({
    where: { id: "demo-sub-task1-selam" },
    update: {},
    create: {
      id: "demo-sub-task1-selam",
      taskId: task1.id,
      userId: students["selam"].id,
      version: 1,
      fileUrl: "https://csec-astu.storage/labs/selam_pcap_analysis.pdf",
      status: "GRADED",
      score: 98,
      qualFlag: "EXCELLENT",
      feedback: "Impeccable Snort rule specificity and accurate timeline reconstruction.",
      submittedAt: new Date(now.getTime() - 8 * oneDay),
      gradedAt: new Date(now.getTime() - 6 * oneDay),
      gradedBy: cyberInstId,
    },
  });

  await prisma.submission.upsert({
    where: { id: "demo-sub-task1-abebe" },
    update: {},
    create: {
      id: "demo-sub-task1-abebe",
      taskId: task1.id,
      userId: students["abebe"].id,
      version: 1,
      fileUrl: "https://csec-astu.storage/labs/abebe_pcap_report.pdf",
      status: "GRADED",
      score: 86,
      qualFlag: "SATISFACTORY",
      feedback: "Great analysis of TCP handshakes; minor false positive in DNS query extraction.",
      submittedAt: new Date(now.getTime() - 7 * oneDay),
      gradedAt: new Date(now.getTime() - 6 * oneDay),
      gradedBy: cyberInstId,
    },
  });

  // 7.2 Individual Lab 2 (Active / Due soon)
  const task2 = await prisma.task.upsert({
    where: { id: "demo-cyber-task-2" },
    update: {},
    create: {
      id: "demo-cyber-task-2",
      bootcampId: cyberBootcamp.id,
      type: "INDIVIDUAL",
      title: "Lab 2: Automated SQL Injection & Blind Exploit Suite",
      description: "Develop a Python script that discovers time-based blind SQL injection vulnerabilities and extracts database schema metadata.",
      instructions: "Push your repository with automated tests and submit your public GitHub repository link.",
      submissionType: "GITHUB_LINK",
      deadline: new Date(now.getTime() + 4 * oneDay),
      maxScore: 100,
      allowLateSubmission: false,
      allowResubmission: true,
    },
  });

  // Selam submitted Lab 2 (SUBMITTED, ready for instructor grading in dashboard)
  await prisma.submission.upsert({
    where: { id: "demo-sub-task2-selam" },
    update: {},
    create: {
      id: "demo-sub-task2-selam",
      taskId: task2.id,
      userId: students["selam"].id,
      version: 1,
      githubUrl: "https://github.com/selam-tadesse/csec-blind-sqli-suite",
      status: "SUBMITTED",
      submittedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
    },
  });

  // 7.3 Capstone Milestone Task (Group Milestone + Peer Review)
  const capstoneTask = await prisma.task.upsert({
    where: { id: "demo-cyber-task-capstone-m1" },
    update: {},
    create: {
      id: "demo-cyber-task-capstone-m1",
      bootcampId: cyberBootcamp.id,
      type: "GROUP_MILESTONE",
      milestoneNumber: 1,
      title: "Capstone Milestone 1: Zero-Trust Security Architecture & Threat Model",
      description: "Produce comprehensive STRIDE threat modeling diagrams and architecture specifications for an enterprise microservices banking portal.",
      instructions: "Team leaders must submit both the architecture document and the infrastructure GitHub repo.",
      submissionType: "BOTH",
      deadline: new Date(now.getTime() + 10 * oneDay),
      maxScore: 100,
      peerReviewRequired: true,
      allowResubmission: true,
    },
  });
  console.log(`✅ Seeded Tasks: Individual Graded Lab, Active Lab with Pending Submission, and Capstone Milestone`);

  // ───────────────────────────────────────────────────────────────────────────
  // 8. GROUPS & PEER REVIEWS
  // ───────────────────────────────────────────────────────────────────────────
  const cyberGroup = await prisma.group.upsert({
    where: { id: "demo-group-cyberdefenders" },
    update: {},
    create: {
      id: "demo-group-cyberdefenders",
      bootcampId: cyberBootcamp.id,
      name: "CyberDefenders Squad Alpha",
    },
  });

  const groupMembers = [
    { user: students["abebe"], isLeader: true },
    { user: students["selam"], isLeader: false },
    { user: students["kidus"], isLeader: false },
    { user: students["meron"], isLeader: false },
  ];

  for (const m of groupMembers) {
    await prisma.groupMember.upsert({
      where: { groupId_userId: { groupId: cyberGroup.id, userId: m.user.id } },
      update: { isLeader: m.isLeader },
      create: {
        groupId: cyberGroup.id,
        userId: m.user.id,
        isLeader: m.isLeader,
      },
    });
  }

  // Group Submission for Capstone Milestone 1
  const groupSub = await prisma.submission.upsert({
    where: { id: "demo-sub-cyber-group-m1" },
    update: {},
    create: {
      id: "demo-sub-cyber-group-m1",
      taskId: capstoneTask.id,
      groupId: cyberGroup.id,
      version: 1,
      fileUrl: "https://csec-astu.storage/capstone/cyberdefenders_threat_model.pdf",
      githubUrl: "https://github.com/csec-astu/cyberdefenders-banking-core",
      status: "SUBMITTED",
      submittedAt: new Date(now.getTime() - 1 * oneDay),
    },
  });

  // Peer reviews between squad members
  await prisma.peerReview.upsert({
    where: {
      submissionId_reviewerId_revieweeId: {
        submissionId: groupSub.id,
        reviewerId: students["selam"].id,
        revieweeId: students["abebe"].id,
      },
    },
    update: {},
    create: {
      submissionId: groupSub.id,
      reviewerId: students["selam"].id,
      revieweeId: students["abebe"].id,
      rating: 5,
      comment: "Abebe orchestrated the threat analysis meetings seamlessly and handled the DFD diagrams.",
    },
  });

  await prisma.peerReview.upsert({
    where: {
      submissionId_reviewerId_revieweeId: {
        submissionId: groupSub.id,
        reviewerId: students["abebe"].id,
        revieweeId: students["selam"].id,
      },
    },
    update: {},
    create: {
      submissionId: groupSub.id,
      reviewerId: students["abebe"].id,
      revieweeId: students["selam"].id,
      rating: 5,
      comment: "Exceptional STRIDE breakdown and detailed mitigation matrix.",
    },
  });
  console.log(`✅ Seeded Capstone Group "${cyberGroup.name}" with 4 Members, Submission, and Peer Reviews`);

  // ───────────────────────────────────────────────────────────────────────────
  // 9. RESOURCES & LEARNING MATERIALS
  // ───────────────────────────────────────────────────────────────────────────
  const resourcesData = [
    {
      id: "demo-res-linux-guide",
      bootcampId: cyberBootcamp.id,
      title: "CSEC Linux & Networking Survival Guide",
      description: "Comprehensive cheat sheet covering terminal commands, iptables, routing, and packet manipulation.",
      externalUrl: "https://github.com/csec-astu/linux-networking-guide",
      downloadCount: 54,
      uploadedById: instructors["cyber-inst"].id,
    },
    {
      id: "demo-res-owasp-ref",
      bootcampId: cyberBootcamp.id,
      sessionId: session2.id,
      title: "OWASP Top 10 Web Exploitation Reference Card",
      description: "Quick reference card distributed for Session 2 labs.",
      externalUrl: "https://owasp.org/www-project-top-ten/",
      downloadCount: 39,
      uploadedById: instructors["cyber-inst"].id,
    },
    {
      id: "demo-res-fullstack-arch",
      bootcampId: webBootcamp.id,
      title: "Fullstack System Architecture & REST Guidelines",
      description: "Clean architecture blueprint for scalable Node.js & React services.",
      externalUrl: "https://github.com/csec-astu/fullstack-curriculum-2026",
      downloadCount: 78,
      uploadedById: instructors["web-inst"].id,
    },
  ];

  for (const r of resourcesData) {
    await prisma.resource.upsert({
      where: { id: r.id },
      update: {},
      create: r,
    });
  }
  console.log(`✅ Seeded ${resourcesData.length} Educational Resources`);

  // ───────────────────────────────────────────────────────────────────────────
  // 10. NOTIFICATIONS
  // ───────────────────────────────────────────────────────────────────────────
  const notificationsData = [
    // Notification for Abebe (Student)
    {
      userId: students["abebe"].id,
      channel: "IN_APP",
      eventType: "SESSION_REMINDER",
      title: "Session 2 is Active: Web App Penetration Testing",
      body: "Session 2 has started at ASTU Main Computer Lab B. Please check in with your instructor PIN.",
      readAt: null,
    },
    {
      userId: students["abebe"].id,
      channel: "IN_APP",
      eventType: "TASK_GRADED",
      title: "Lab 1 Graded: Network Traffic Dissection",
      body: "Your submission received a score of 86/100 (SATISFACTORY) from Instructor Yonas.",
      readAt: new Date(now.getTime() - 5 * oneDay),
    },
    // Notification for Cyber Instructor
    {
      userId: instructors["cyber-inst"].id,
      channel: "IN_APP",
      eventType: "SUBMISSION_RECEIVED",
      title: "New Submission for Lab 2",
      body: "Selamawit Tadesse turned in her GitHub repository for Lab 2: Automated SQL Injection.",
      readAt: null,
    },
    // Notification for Cyber Division Admin
    {
      userId: divAdmins["cybersecurity"].id,
      channel: "IN_APP",
      eventType: "SESSION_PROPOSAL_SUBMITTED",
      title: "Session Proposal Pending Review",
      body: "Instructor Yonas Kassa proposed 'Session 4: Malware Analysis Sandbox Engineering' for review.",
      readAt: null,
    },
  ];

  for (const notif of notificationsData) {
    await prisma.notification.create({
      data: notif,
    });
  }
  console.log(`✅ Seeded ${notificationsData.length} In-App Notifications`);

  // ───────────────────────────────────────────────────────────────────────────
  // 11. AUDIT LOGS
  // ───────────────────────────────────────────────────────────────────────────
  const auditLogsData = [
    {
      actorId: divAdmins["cybersecurity"].id,
      action: "SESSION_APPROVED",
      targetType: "SESSION",
      targetId: session2.id,
      metadata: { sessionTitle: session2.title, room: session2.location },
    },
    {
      actorId: instructors["cyber-inst"].id,
      action: "ATTENDANCE_OVERRIDE",
      targetType: "ATTENDANCE_RECORD",
      targetId: session1.id,
      metadata: { student: "Kidus Yohannes", note: "Excused 5 minutes due to campus shuttle delay" },
    },
    {
      actorId: superAdmin.id,
      action: "INDUCTION_DECISION_FINALIZED",
      targetType: "BOOTCAMP",
      targetId: completedBootcamp.id,
      metadata: { inductedCount: 2, totalCandidates: 3 },
    },
  ];

  for (const log of auditLogsData) {
    await prisma.auditLog.create({
      data: log,
    });
  }
  console.log(`✅ Seeded ${auditLogsData.length} Administrative Audit Logs`);

  // ───────────────────────────────────────────────────────────────────────────
  // SUMMARY REPORT
  // ───────────────────────────────────────────────────────────────────────────
  console.log("\n========================================================");
  console.log("🎉 SEEDING COMPLETE! ROLE TEST CREDENTIALS:");
  console.log("========================================================");
  console.log("👑 1. SUPER ADMIN (Global control, full reports & logs)");
  console.log("   Email:    tinsae.melkamu.tk@gmail.com");
  console.log("   Password: Admin123!\n");

  console.log("🏢 2. DIVISION ADMINS (Division scope management & approvals)");
  console.log("   Dev Div:   dev.admin@csec.astu.edu.et     (Pass: Admin123!)");
  console.log("   Cyber Div: cyber.admin@csec.astu.edu.et   (Pass: Admin123!)");
  console.log("   CP Div:    cp.admin@csec.astu.edu.et      (Pass: Admin123!)");
  console.log("   AI Div:    ai.admin@csec.astu.edu.et      (Pass: Admin123!)\n");

  console.log("👨‍🏫 3. INSTRUCTORS (Sessions, live PIN generation, grading)");
  console.log("   Cyber Lead: cyber.instructor@csec.astu.edu.et (Pass: Password123!)");
  console.log("   Web Lead:   instructor@csec.astu.edu.et       (Pass: Password123!)");
  console.log("   CP Coach:   cp.instructor@csec.astu.edu.et    (Pass: Password123!)\n");

  console.log("🎓 4. STUDENTS (Enrolled, attendance PIN check-in, deliverables, groups)");
  console.log("   Abebe:      student@csec.astu.edu.et       (Pass: Password123!) [Active in Cyber & Web, Squad Leader]");
  console.log("   Selamawit:  selam.student@csec.astu.edu.et (Pass: Password123!) [Top rank, Inducted 2025, Active 2026]");
  console.log("   Kidus:      kidus.student@csec.astu.edu.et (Pass: Password123!) [Active in Cyber]");
  console.log("   Meron:      meron.student@csec.astu.edu.et (Pass: Password123!) [Active in Cyber]");
  console.log("   Yared:      yared.student@csec.astu.edu.et (Pass: Password123!) [Cohort 2025 Not-Inducted example]\n");

  console.log("👤 5. GUESTS / APPLICANTS (Public catalog & application flow)");
  console.log("   Pending:    applicant@csec.astu.edu.et          (Pass: Password123!)");
  console.log("   Rejected:   rejected.applicant@csec.astu.edu.et (Pass: Password123!)");
  console.log("   New Guest:  new.guest@csec.astu.edu.et          (Pass: Password123!)\n");

  console.log("🔑 LIVE ATTENDANCE PIN DEMO:");
  console.log("   Bootcamp: Cybersecurity & Defense Bootcamp 2026 (ACTIVE)");
  console.log("   Session:  Session 2: Web App Penetration Testing");
  console.log("   Active PIN Code: 749201");
  console.log("   Test Flow: Login as student@csec.astu.edu.et -> Go to Sessions -> Check-in with 749201!");
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
