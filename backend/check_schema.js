require('dotenv').config();
const { sql, connectDB } = require('./db.js');
connectDB().then(async pool => {
  const res = await pool.request().query(`SELECT s.Id, s.Modality, s.StudyDescription, s.OrthancStudyId, p.Name as PatientName, LEN(CAST(s.Series AS NVARCHAR(MAX))) as SeriesLen, s.Series FROM Study s LEFT JOIN Patient p ON s.PatientId = p.Id`);
  for (const row of res.recordset) {
    console.log({
      id: row.Id,
      patient: row.PatientName,
      modality: row.Modality,
      desc: row.StudyDescription,
      orthancId: row.OrthancStudyId,
      seriesLen: row.SeriesLen,
      seriesSnippet: row.Series ? String(row.Series).slice(0, 80) : null
    });
  }
  process.exit(0);
});
