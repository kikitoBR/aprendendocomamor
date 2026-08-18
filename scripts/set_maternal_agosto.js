const path = require('path');
const mysql = require(path.join(process.cwd(), 'node_modules', 'mysql2', 'promise'));

async function setMaternalFrequenciasAgosto() {
  const connection = await mysql.createConnection({
    host: 'srv1194.hstgr.io',
    port: 3306,
    user: 'u825658242_escola',
    password: process.env.DB_PASSWORD || '44434241Mm.',
    database: 'u825658242_escola',
  });

  // 1. Buscar os alunos do Maternal
  const [alunosMaternal] = await connection.query(
    "SELECT id, nome, fotoUrl FROM alunos WHERE turmaId = 'maternal-tarde' ORDER BY nome"
  );

  console.log(`👶 Alunos do Maternal encontrados (${alunosMaternal.length}):`, alunosMaternal.map(a => a.nome));

  const atividadesPorDia = {
    '2026-08-01': 'Acolhimento de início do mês com musicalização infantil e roda de cantigas de roda.',
    '2026-08-03': 'Roda de acolhimento e contação da história "O Monstro das Cores". Atividade sensorial com cores primárias.',
    '2026-08-04': 'Atividade lúdica de psicomotricidade ampla: circuito de almofadas e túnel de tecido.',
    '2026-08-05': 'Pintura a dedo com tinta atóxica comestível em papel craft gigante no chão.',
    '2026-08-06': 'Hora da fruta divertida (degustação sensorial de frutas: banana, maçã e melancia) e brincadeiras livres no parque.',
    '2026-08-07': 'Confecção de brinquedo sensorial com garrafas pet e purpurina (garrafa da calma).',
    '2026-08-08': 'Sábado temático de integração com historinhas de fantoches e cantigas.',
    '2026-08-10': 'Roda de conversa sobre animais da fazenda e imitação de sons e movimentos corporais.',
    '2026-08-11': 'Atividade com massinha de modelar caseira perfumada e forminhas geométricas.',
    '2026-08-12': 'Circuito de texturas nos pezinhos (algodão, lixa macia, folhas secas e graminha).',
    '2026-08-13': 'Brincadeira com bolhas de sabão no pátio externo e banho de sol na área verde.',
    '2026-08-14': 'Oficina de artes com carimbo das mãozinhas e pezinhos com tinta guache.',
    '2026-08-15': 'Encerramento da quinzena com cineminha pedagógico e piquenique de frutas no gramado.',
  };

  const dias = [
    '2026-08-01', '2026-08-02', '2026-08-03', '2026-08-04', '2026-08-05',
    '2026-08-06', '2026-08-07', '2026-08-08', '2026-08-09', '2026-08-10',
    '2026-08-11', '2026-08-12', '2026-08-13', '2026-08-14', '2026-08-15'
  ];

  for (const dataStr of dias) {
    const id = `chamada-maternal-tarde-${dataStr}`;
    const registros = alunosMaternal.map(aluno => ({
      alunoId: aluno.id,
      alunoNome: aluno.nome,
      fotoUrl: aluno.fotoUrl || '',
      status: 'Presente',
      observacao: 'Participou com muito entusiasmo de todas as atividades!',
    }));

    const conteudo = atividadesPorDia[dataStr] || 'Atividades lúdicas de estimulação precoce, musicalização e desenvolvimento socioemocional.';

    await connection.query(
      `INSERT INTO frequencias (id, turmaId, turmaNome, data, turno, registros, conteudoMinistrado, fotosAtividades, registradoPor, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         registros=VALUES(registros),
         conteudoMinistrado=VALUES(conteudoMinistrado),
         registradoPor=VALUES(registradoPor)`,
      [
        id,
        'maternal-tarde',
        'Maternal',
        dataStr,
        'Tarde',
        JSON.stringify(registros),
        conteudo,
        JSON.stringify([]),
        'Tia Juliana Ribeiro',
        new Date().toISOString(),
      ]
    );

    console.log(`✅ Chamada registrada: ${dataStr} - 100% Presentes (${alunosMaternal.length} alunos)`);
  }

  console.log('\n🎉 TODAS AS FREQUÊNCIAS DE 01 A 15 DE AGOSTO GRAVADAS COM SUCESSO NO MYSQL!');
  await connection.end();
}

setMaternalFrequenciasAgosto().catch(console.error);
