const path = require('path');
const mysql = require(path.join('c:/Users/kikiTo/Downloads/aprendendocomamor', 'node_modules', 'mysql2', 'promise'));

async function checkTurmas() {
  const connection = await mysql.createConnection({
    host: 'srv1194.hstgr.io',
    port: 3306,
    user: 'u825658242_escola',
    password: process.env.DB_PASSWORD || '44434241Mm.',
    database: 'u825658242_escola',
  });

  const [turmas] = await connection.query('SELECT * FROM turmas');
  console.log('📋 Turmas no MySQL:', JSON.stringify(turmas, null, 2));

  const [alunosTurmas] = await connection.query('SELECT turmaNome, turmaId, COUNT(*) as total FROM alunos GROUP BY turmaNome, turmaId');
  console.log('👥 Alunos por Turma:', JSON.stringify(alunosTurmas, null, 2));

  await connection.end();
}

checkTurmas().catch(console.error);
