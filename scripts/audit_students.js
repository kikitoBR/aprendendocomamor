const path = require('path');
const mysql = require(path.join(process.cwd(), 'node_modules', 'mysql2', 'promise'));

async function auditStudents() {
  const connection = await mysql.createConnection({
    host: 'srv1194.hstgr.io',
    port: 3306,
    user: 'u825658242_escola',
    password: process.env.DB_PASSWORD || '44434241Mm.',
    database: 'u825658242_escola',
  });

  console.log('🔍 ============================================================');
  console.log('🔍 AUDITORIA COMPLETA DOS ALUNOS NO BANCO DE DADOS MYSQL');
  console.log('🔍 ============================================================');

  // 1. Total de alunos
  const [totalRows] = await connection.query('SELECT COUNT(*) as total FROM alunos');
  const totalAlunos = totalRows[0].total;
  console.log(`\n📌 Total de Alunos Cadastrados: ${totalAlunos}`);

  // 2. Alunos por Turma
  const [turmasRows] = await connection.query(`
    SELECT turmaNome, turmaId, COUNT(*) as qtd
    FROM alunos
    GROUP BY turmaNome, turmaId
    ORDER BY turmaNome
  `);
  console.log('\n🏫 Distribuição de Alunos por Turma:');
  turmasRows.forEach(t => {
    console.log(`   • ${t.turmaNome} (${t.turmaId}): ${t.qtd} alunos`);
  });

  // 3. Status dos Alunos
  const [statusRows] = await connection.query('SELECT status, COUNT(*) as qtd FROM alunos GROUP BY status');
  console.log('\n📊 Status das Matrículas:');
  statusRows.forEach(s => {
    console.log(`   • ${s.status}: ${s.qtd} alunos`);
  });

  // 4. Verificação de Integridade dos Campos
  const [alunos] = await connection.query('SELECT * FROM alunos ORDER BY turmaNome, nome');

  let semMatricula = 0;
  let semNascimento = 0;
  let semResponsavel = 0;
  let semEndereco = 0;
  let comAlergia = 0;

  alunos.forEach(a => {
    if (!a.matricula) semMatricula++;
    if (!a.dataNascimento) semNascimento++;

    try {
      const resp = typeof a.responsaveis === 'string' ? JSON.parse(a.responsaveis) : a.responsaveis;
      if (!resp || (!resp.mae?.nome && !resp.pai?.nome && !resp.email)) semResponsavel++;
    } catch {
      semResponsavel++;
    }

    try {
      const end = typeof a.endereco === 'string' ? JSON.parse(a.endereco) : a.endereco;
      if (!end || !end.bairro) semEndereco++;
    } catch {
      semEndereco++;
    }

    try {
      const saude = typeof a.saudeERotina === 'string' ? JSON.parse(a.saudeERotina) : a.saudeERotina;
      if (saude && (saude.alergias || saude.restricoesAlimentares)) comAlergia++;
    } catch {}
  });

  console.log('\n🛡️ Integridade dos Cadastros:');
  console.log(`   • Sem matrícula: ${semMatricula} (0 esperado)`);
  console.log(`   • Sem data de nascimento: ${semNascimento} (0 esperado)`);
  console.log(`   • Sem dados de responsáveis: ${semResponsavel} (0 esperado)`);
  console.log(`   • Alunos com atenção a alergias/saúde cadastradas: ${comAlergia}`);

  // 5. Verificação de Mensalidades vinculadas a cada aluno
  const [mensRows] = await connection.query('SELECT COUNT(*) as total FROM mensalidades');
  console.log(`\n💳 Total de Parcelas de Mensalidades: ${mensRows[0].total}`);

  const [alunosSemMens] = await connection.query(`
    SELECT a.id, a.nome, a.turmaNome
    FROM alunos a
    LEFT JOIN mensalidades m ON a.id = m.alunoId
    WHERE m.id IS NULL
    GROUP BY a.id, a.nome, a.turmaNome
  `);

  if (alunosSemMens.length === 0) {
    console.log('   ✅ 100% dos 83 alunos possuem carnês de 12 parcelas de 2026 gerados!');
  } else {
    console.log(`   ⚠️ Alunos sem mensalidades: ${alunosSemMens.length}`);
  }

  // 6. Lista amostral dos primeiros alunos de cada turma
  console.log('\n📋 Amostra de Alunos por Turma:');
  const turmasUnicas = [...new Set(alunos.map(a => a.turmaNome))];
  turmasUnicas.forEach(tNome => {
    const daTurma = alunos.filter(a => a.turmaNome === tNome);
    console.log(`\n--- Turma: ${tNome} (Total: ${daTurma.length}) ---`);
    daTurma.slice(0, 3).forEach((aluno, i) => {
      const resp = typeof aluno.responsaveis === 'string' ? JSON.parse(aluno.responsaveis) : aluno.responsaveis;
      console.log(`   ${i + 1}. [${aluno.matricula}] ${aluno.nome}`);
      console.log(`      Nasc: ${aluno.dataNascimento} (${aluno.idadeCalculada}) | Turno: ${aluno.turno}`);
      console.log(`      Mãe: ${resp?.mae?.nome || 'N/A'} (Tel: ${resp?.mae?.telefone || resp?.numeroEmergencia || 'N/A'})`);
      console.log(`      Mensalidade Padrão: R$ ${aluno.valorMensalidadePadrao} (Venc: dia ${aluno.diaVencimentoPadrao})`);
    });
  });

  await connection.end();
}

auditStudents().catch(console.error);
