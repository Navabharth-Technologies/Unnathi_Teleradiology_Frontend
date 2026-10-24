require('dotenv').config();
const { connectDB } = require("./db");

async function update() {
  const pool = await connectDB();
  await pool.request().query("UPDATE Study SET OrthancStudyId = 'b44b5adc-7ebcb73b-6bdd1958-e1603611-c7f18465' WHERE id = 'st1791790075870'");
  await pool.request().query("UPDATE Study SET OrthancStudyId = 'b1fa5eaf-70ac981d-e648e6d3-10425267-4898a8a7' WHERE id = 'st1792055526381'");
  await pool.request().query("UPDATE Study SET OrthancStudyId = '181da841-cccd5491-1f21a089-e1ed82d8-085c1cb4' WHERE id = 'st1791878302324'");
  await pool.request().query("UPDATE Study SET OrthancStudyId = '1bde1b16-8089af90-eb031297-fc3642fb-8b060c04' WHERE id IN ('st1791877185303', 'st1791887795937', 'st1791976917581')");

  const res = await pool.request().query("SELECT id, modality, studyDescription, OrthancStudyId FROM Study");
  console.log("Updated Studies in MSSQL:");
  console.table(res.recordset);
  process.exit(0);
}

update().catch(err => {
  console.error(err);
  process.exit(1);
});
