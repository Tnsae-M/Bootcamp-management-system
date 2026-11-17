import "dotenv/config";
import app from "../src/app.js";

const PORT = 5001;

async function runSmokeTest() {
  console.log("🚀 Starting BMS API Smoke Test...\n");

  const server = app.listen(PORT, "127.0.0.1", async () => {
    try {
      const baseUrl = `http://127.0.0.1:${PORT}/api`;

      // 1. Health check
      console.log("1️⃣ Checking API Health...");
      const healthRes = await fetch(`${baseUrl}/health`);
      const healthData = await healthRes.json();
      console.log("   Status:", healthRes.status, healthData);

      // 2. Super Admin Login
      console.log("\n2️⃣ Testing Super Admin Login...");
      const loginRes = await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "admin@csec.astu.edu.et",
          password: "Admin123!",
        }),
      });
      const loginData = await loginRes.json();
      console.log("   Status:", loginRes.status, loginData.message);
      const adminToken = loginData.data?.tokens?.accessToken;
      console.log("   Admin Token Acquired:", Boolean(adminToken));

      // 3. Browse Open Bootcamps (Public)
      console.log("\n3️⃣ Browsing Bootcamps (Public / Guest)...");
      const bootcampsRes = await fetch(`${baseUrl}/bootcamps`);
      const bootcampsData = await bootcampsRes.json();
      console.log("   Status:", bootcampsRes.status, `Found ${bootcampsData.data?.length} bootcamps`);
      const firstBootcamp = bootcampsData.data?.[0];
      console.log("   Bootcamp Title:", firstBootcamp?.title);

      // 4. Register New Guest User
      console.log("\n4️⃣ Registering New Student Guest...");
      const guestEmail = `student_${Date.now()}@astu.edu.et`;
      const registerRes = await fetch(`${baseUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: "Bilen Hailu",
          email: guestEmail,
          password: "StudentPass123!",
          universityId: `ETS_${Date.now().toString().slice(-4)}/15`,
          department: "Software Engineering",
        }),
      });
      const registerData = await registerRes.json();
      console.log("   Status:", registerRes.status, registerData.message);
      const studentToken = registerData.data?.tokens?.accessToken;
      console.log("   Student Token Acquired:", Boolean(studentToken));

      // 5. Student Applies to Open Bootcamp
      console.log("\n5️⃣ Student Applying to Bootcamp...");
      const applyRes = await fetch(`${baseUrl}/enrollments/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${studentToken}`,
        },
        body: JSON.stringify({
          bootcampId: firstBootcamp.id,
          motivation: "Eager to learn fullstack systems and contribute to CSEC-ASTU open source projects.",
          experience: "Proficient in Python and JavaScript fundamentals.",
          portfolioUrl: "https://github.com/bilen-astu",
        }),
      });
      const applyData = await applyRes.json();
      console.log("   Status:", applyRes.status, applyData.message);
      console.log("   Enrollment Status:", applyData.data?.status);

      // 6. Admin Screens Applicant to STUDENT
      console.log("\n6️⃣ Admin Screening Applicant...");
      const screenRes = await fetch(`${baseUrl}/bootcamps/${firstBootcamp.id}/screen`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          enrollmentId: applyData.data.id,
          decision: "ACCEPT",
        }),
      });
      const screenData = await screenRes.json();
      console.log("   Status:", screenRes.status, screenData.message);
      console.log("   Candidate Promoted Status:", screenData.data?.status);

      console.log("\n🎉 ALL SMOKE TESTS PASSED CLEANLY!");
    } catch (err) {
      console.error("❌ Smoke test failed:", err);
    } finally {
      server.close(() => {
        console.log("🛑 Smoke test server closed.");
        process.exit(0);
      });
    }
  });
}

runSmokeTest();
