const path = require('path');
const mysql = require(path.join(process.cwd(), 'node_modules', 'mysql2', 'promise'));

async function inspectStudentNames() {
  const connection = await mysql.createConnection({
    host: 'srv1194.hstgr.io',
    port: 3306,
    user: 'u825658242_escola',
    password: process.env.DB_PASSWORD || '44434241Mm.',
    database: 'u825658242_escola',
  });

  const [alunos] = await connection.query('SELECT matricula, nome, turmaNome FROM alunos ORDER BY matricula ASC');
  console.log(`Total de alunos no MySQL: ${alunos.length}`);
  alunos.forEach((a, i) => {
    console.log(`${(i+1).toString().padStart(2, ' ')}. [${a.matricula}] ${a.nome} (${a.turmaNome})`);
  });

  await connection.end();
}

inspectStudentNames().catch(console.error);
