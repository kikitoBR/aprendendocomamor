const path = require('path');
const mysql = require(path.join(process.cwd(), 'node_modules', 'mysql2', 'promise'));

async function syncRealTurmas() {
  const connection = await mysql.createConnection({
    host: 'srv1194.hstgr.io',
    port: 3306,
    user: 'u825658242_escola',
    password: process.env.DB_PASSWORD || '44434241Mm.',
    database: 'u825658242_escola',
  });

  console.log('🔄 Sincronizando turmas no MySQL com a estrutura real da escola...');

  // Limpar turmas antigas e inserir as 5 oficiais
  await connection.query('DELETE FROM turmas');

  const turmasOficiais = [
    {
      id: 'maternal-tarde',
      nome: 'Maternal',
      codigo: 'MAT',
      nivel: 'Educação Infantil',
      faixaEtaria: '1 a 2 anos',
      turno: 'Tarde',
      horario: '13:00 às 17:00',
      capacidadeMaxima: 18,
      professorResponsavel: 'Tia Juliana Ribeiro',
      sala: 'Sala 01 - Maternal',
      mensalidadeSugerida: 480.0,
      ativa: 1,
    },
    {
      id: 'jardim-1-tarde',
      nome: 'Jardim I',
      codigo: 'JD1',
      nivel: 'Educação Infantil',
      faixaEtaria: '2 a 3 anos',
      turno: 'Tarde',
      horario: '13:00 às 17:00',
      capacidadeMaxima: 18,
      professorResponsavel: 'Tia Mariana Castro',
      sala: 'Sala 02 - Jardim I',
      mensalidadeSugerida: 500.0,
      ativa: 1,
    },
    {
      id: 'jardim-2-tarde',
      nome: 'Jardim II',
      codigo: 'JD2',
      nivel: 'Educação Infantil',
      faixaEtaria: '3 a 4 anos',
      turno: 'Tarde',
      horario: '13:00 às 17:00',
      capacidadeMaxima: 30,
      professorResponsavel: 'Tia Carla Silveira',
      sala: 'Sala 03 - Jardim II',
      mensalidadeSugerida: 520.0,
      ativa: 1,
    },
    {
      id: 'jardim-3-manha',
      nome: 'Jardim III',
      codigo: 'JD3',
      nivel: 'Educação Infantil',
      faixaEtaria: '4 a 5 anos',
      turno: 'Manhã',
      horario: '07:30 às 11:30',
      capacidadeMaxima: 18,
      professorResponsavel: 'Tia Beatriz Lima',
      sala: 'Sala 04 - Jardim III',
      mensalidadeSugerida: 520.0,
      ativa: 1,
    },
    {
      id: 'fund-1-manha',
      nome: 'Fundamental I',
      codigo: 'FUND1',
      nivel: 'Ensino Fundamental I',
      faixaEtaria: '6 a 10 anos',
      turno: 'Manhã',
      horario: '07:30 às 11:45',
      capacidadeMaxima: 16,
      professorResponsavel: 'Prof. Renata Albuquerque',
      sala: 'Sala 05 - Fundamental',
      mensalidadeSugerida: 580.0,
      ativa: 1,
    },
  ];

  for (const t of turmasOficiais) {
    await connection.query(
      `INSERT INTO turmas (id, nome, codigo, nivel, faixaEtaria, turno, horario, capacidadeMaxima, professorResponsavel, sala, mensalidadeSugerida, ativa)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [t.id, t.nome, t.codigo, t.nivel, t.faixaEtaria, t.turno, t.horario, t.capacidadeMaxima, t.professorResponsavel, t.sala, t.mensalidadeSugerida, t.ativa]
    );
  }

  const [res] = await connection.query('SELECT nome, id, turno FROM turmas');
  console.log('✅ Turmas oficiais sincronizadas no MySQL:', res);

  await connection.end();
}

syncRealTurmas().catch(console.error);
