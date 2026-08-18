const fs = require('fs');
const path = require('path');
const mysql = require(path.join(__dirname, '..', 'node_modules', 'mysql2', 'promise'));

async function runMigration() {
  console.log('🔄 Iniciando migração e estruturação do banco de dados MySQL...');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'srv1194.hstgr.io',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'u825658242_escola',
    password: process.env.DB_PASSWORD || '44434241Mm.',
    database: process.env.DB_NAME || 'u825658242_escola',
    waitForConnections: true,
  });

  console.log('✅ Conexão estabelecida com sucesso ao MySQL!');

  // 1. Criar tabelas
  console.log('📦 Criando tabelas no phpMyAdmin...');

  await connection.query(`
    CREATE TABLE IF NOT EXISTS escola_config (
      id INT PRIMARY KEY DEFAULT 1,
      nome VARCHAR(255) NOT NULL,
      razaoSocial VARCHAR(255),
      cnpj VARCHAR(50),
      resolucao VARCHAR(255),
      endereco VARCHAR(255),
      bairro VARCHAR(100),
      cidade VARCHAR(100),
      uf VARCHAR(10),
      cep VARCHAR(20),
      telefonePrincipal VARCHAR(50),
      telefoneSecundario VARCHAR(50),
      email VARCHAR(150),
      instagram VARCHAR(100),
      chavePix VARCHAR(150),
      bancoPix VARCHAR(100),
      titularPix VARCHAR(150),
      anoLetivoAtivo VARCHAR(20),
      diaVencimentoPadrao INT DEFAULT 10,
      metaFaturamentoMensal DECIMAL(12,2) DEFAULT 0,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS turmas (
      id VARCHAR(64) PRIMARY KEY,
      nome VARCHAR(100) NOT NULL,
      codigo VARCHAR(50),
      nivel VARCHAR(50),
      faixaEtaria VARCHAR(50),
      turno VARCHAR(50),
      horario VARCHAR(50),
      capacidadeMaxima INT DEFAULT 15,
      professorResponsavel VARCHAR(100),
      sala VARCHAR(100),
      mensalidadeSugerida DECIMAL(10,2) DEFAULT 0,
      ativa TINYINT(1) DEFAULT 1,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS alunos (
      id VARCHAR(64) PRIMARY KEY,
      matricula VARCHAR(50) UNIQUE,
      nome VARCHAR(150) NOT NULL,
      fotoUrl LONGTEXT,
      dataNascimento VARCHAR(20),
      idadeCalculada VARCHAR(50),
      sexo VARCHAR(10),
      nacionalidade VARCHAR(50),
      certidaoNascimento LONGTEXT,
      identidade VARCHAR(50),
      cpf VARCHAR(50),
      turmaId VARCHAR(64),
      turmaNome VARCHAR(100),
      turno VARCHAR(50),
      horario VARCHAR(50),
      anoLetivo VARCHAR(20),
      status VARCHAR(50) DEFAULT 'Ativo',
      responsaveis LONGTEXT,
      endereco LONGTEXT,
      saudeERotina LONGTEXT,
      renovacoes LONGTEXT,
      valorMensalidadePadrao DECIMAL(10,2) DEFAULT 0,
      diaVencimentoPadrao INT DEFAULT 10,
      descontoPadrao DECIMAL(10,2) DEFAULT 0,
      createdAt VARCHAR(50),
      updatedAt VARCHAR(50)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS mensalidades (
      id VARCHAR(64) PRIMARY KEY,
      alunoId VARCHAR(64) NOT NULL,
      alunoNome VARCHAR(150) NOT NULL,
      turmaNome VARCHAR(100),
      mesReferencia VARCHAR(50),
      mesIndex INT,
      ano INT,
      numeroParcela INT,
      valorOriginal DECIMAL(10,2) DEFAULT 0,
      desconto DECIMAL(10,2) DEFAULT 0,
      acrescimo DECIMAL(10,2) DEFAULT 0,
      valorFinal DECIMAL(10,2) DEFAULT 0,
      dataVencimento VARCHAR(50),
      dataPagamento VARCHAR(50),
      status VARCHAR(50) DEFAULT 'Pendente',
      formaPagamento VARCHAR(50),
      numeroRecibo VARCHAR(50),
      observacoes LONGTEXT,
      pagoPor VARCHAR(150),
      registradoPor VARCHAR(100),
      INDEX idx_aluno (alunoId),
      INDEX idx_mes_ano (mesIndex, ano),
      INDEX idx_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS despesas (
      id VARCHAR(64) PRIMARY KEY,
      descricao VARCHAR(255) NOT NULL,
      categoria VARCHAR(100),
      valor DECIMAL(10,2) DEFAULT 0,
      mesReferencia VARCHAR(50),
      mesIndex INT,
      ano INT,
      dataVencimento VARCHAR(50),
      dataPagamento VARCHAR(50),
      status VARCHAR(50) DEFAULT 'Pendente',
      formaPagamento VARCHAR(50),
      observacoes LONGTEXT,
      INDEX idx_mes_ano (mesIndex, ano),
      INDEX idx_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS frequencias (
      id VARCHAR(64) PRIMARY KEY,
      turmaId VARCHAR(64) NOT NULL,
      turmaNome VARCHAR(100),
      data VARCHAR(20) NOT NULL,
      turno VARCHAR(50),
      registros LONGTEXT NOT NULL,
      conteudoMinistrado LONGTEXT,
      registradoPor VARCHAR(100),
      createdAt VARCHAR(50),
      INDEX idx_turma_data (turmaId, data)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS avisos (
      id VARCHAR(64) PRIMARY KEY,
      titulo VARCHAR(255) NOT NULL,
      mensagem LONGTEXT NOT NULL,
      tipo VARCHAR(50) DEFAULT 'Geral',
      publicoAlvo VARCHAR(50) DEFAULT 'ambos',
      turmaId VARCHAR(64),
      turmaNome VARCHAR(100),
      data VARCHAR(20),
      autor VARCHAR(100),
      fixado TINYINT(1) DEFAULT 0,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  console.log('✅ Todas as 7 tabelas criadas com sucesso!');

  // 2. Importar dados das sementes
  console.log('📥 Semeando dados iniciais no banco...');

  // Configuração
  const [cfgRows] = await connection.query('SELECT COUNT(*) as cnt FROM escola_config');
  if (cfgRows[0].cnt === 0) {
    await connection.query(
      `INSERT INTO escola_config (id, nome, razaoSocial, cnpj, resolucao, endereco, bairro, cidade, uf, cep, telefonePrincipal, telefoneSecundario, email, instagram, chavePix, bancoPix, titularPix, anoLetivoAtivo, diaVencimentoPadrao, metaFaturamentoMensal)
       VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'Escola Aprendendo com Amor',
        'Escola Aprendendo com Amor LTDA',
        '33.144.173/0001-32',
        'RESOLUÇÃO CME Nº 09 - 15/05/2024',
        'Rua Waldemar Prata, 156',
        'Parque Corrientes',
        'Campos dos Goytacazes',
        'RJ',
        '28055-160',
        '(22) 99762-7654',
        '(22) 99893-7242',
        'aprendendocomamor.escola@gmail.com',
        '@aprendendocomamor',
        '33.144.173/0001-32',
        'Banco Inter / Sicoob',
        'Escola Aprendendo com Amor LTDA',
        '2026',
        10,
        24650.0,
      ]
    );
    console.log('  -> escola_config semeada');
  }

  // Turmas
  const [turmaRows] = await connection.query('SELECT COUNT(*) as cnt FROM turmas');
  if (turmaRows[0].cnt === 0) {
    const turmasData = [
      { id: 'maternal-tarde', nome: 'Maternal', codigo: 'MAT', nivel: 'Educação Infantil', faixaEtaria: '1 a 2 anos', turno: 'Tarde', horario: '13:00 às 17:00', capacidadeMaxima: 8, professorResponsavel: 'Tia Juliana Ribeiro', sala: 'Sala 01 - Maternal', mensalidadeSugerida: 480.0, ativa: 1 },
      { id: 'jardim-1-tarde', nome: 'Jardim I', codigo: 'JD1', nivel: 'Educação Infantil', faixaEtaria: '2 a 3 anos', turno: 'Tarde', horario: '13:00 às 17:00', capacidadeMaxima: 12, professorResponsavel: 'Tia Mariana Castro', sala: 'Sala 02 - Jardim I', mensalidadeSugerida: 500.0, ativa: 1 },
      { id: 'jardim-2-tarde', nome: 'Jardim II', codigo: 'JD2', nivel: 'Educação Infantil', faixaEtaria: '3 a 4 anos', turno: 'Tarde', horario: '13:00 às 17:00', capacidadeMaxima: 14, professorResponsavel: 'Tia Patrícia Gomes', sala: 'Sala 03 - Jardim II', mensalidadeSugerida: 520.0, ativa: 1 },
      { id: 'pre-1-tarde', nome: 'Pré I', codigo: 'PR1', nivel: 'Educação Infantil', faixaEtaria: '4 a 5 anos', turno: 'Tarde', horario: '13:00 às 17:00', capacidadeMaxima: 15, professorResponsavel: 'Tia Fernanda Souza', sala: 'Sala 04 - Pré I', mensalidadeSugerida: 540.0, ativa: 1 },
      { id: 'pre-2-tarde', nome: 'Pré II', codigo: 'PR2', nivel: 'Educação Infantil', faixaEtaria: '5 a 6 anos', turno: 'Tarde', horario: '13:00 às 17:00', capacidadeMaxima: 15, professorResponsavel: 'Tia Beatriz Martins', sala: 'Sala 05 - Pré II', mensalidadeSugerida: 550.0, ativa: 1 },
      { id: 'fundamental-1-tarde', nome: '1º Ano (Fund. I)', codigo: 'EF1', nivel: 'Ensino Fundamental I', faixaEtaria: '6 a 7 anos', turno: 'Tarde', horario: '13:00 às 17:30', capacidadeMaxima: 16, professorResponsavel: 'Tia Camila Lima', sala: 'Sala 06 - 1º Ano', mensalidadeSugerida: 580.0, ativa: 1 },
    ];

    for (const t of turmasData) {
      await connection.query(
        `INSERT INTO turmas (id, nome, codigo, nivel, faixaEtaria, turno, horario, capacidadeMaxima, professorResponsavel, sala, mensalidadeSugerida, ativa)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [t.id, t.nome, t.codigo, t.nivel, t.faixaEtaria, t.turno, t.horario, t.capacidadeMaxima, t.professorResponsavel, t.sala, t.mensalidadeSugerida, t.ativa]
      );
    }
    console.log(`  -> ${turmasData.length} turmas semeadas`);
  }

  // Carregar dados de alunos e mensalidades reais
  const seedFile = path.join(__dirname, '..', 'src', 'data', 'realData.ts');
  if (fs.existsSync(seedFile)) {
    // Ler alunos
    const [alunoRows] = await connection.query('SELECT COUNT(*) as cnt FROM alunos');
    if (alunoRows[0].cnt === 0) {
      // Carregar arquivo compilado ou via parse
      const seedJsonPath = path.join(__dirname, '..', '.gemini', 'real_school_seed.json');
      let studentsList = [];
      let mensalidadesList = [];
      let despesasList = [];

      // Tentar carregar do scratch se disponível
      const scratchSeed = path.join('C:', 'Users', 'kikiTo', '.gemini', 'antigravity-ide', 'brain', '9cfaf974-2090-473c-bd64-dd713513ee10', 'scratch', 'real_school_seed.json');
      if (fs.existsSync(scratchSeed)) {
        const raw = JSON.parse(fs.readFileSync(scratchSeed, 'utf8'));
        studentsList = raw.students || [];
        mensalidadesList = raw.mensalidades || [];
        despesasList = raw.despesas || [];
      }

      console.log(`  -> Inserindo ${studentsList.length} alunos reais...`);
      for (const s of studentsList) {
        await connection.query(
          `INSERT INTO alunos (id, matricula, nome, fotoUrl, dataNascimento, idadeCalculada, sexo, nacionalidade, certidaoNascimento, identidade, cpf, turmaId, turmaNome, turno, horario, anoLetivo, status, responsaveis, endereco, saudeERotina, renovacoes, valorMensalidadePadrao, diaVencimentoPadrao, descontoPadrao, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE nome=VALUES(nome)`,
          [
            s.id,
            s.matricula,
            s.nome,
            s.fotoUrl || '',
            s.dataNascimento || '',
            s.idadeCalculada || '',
            s.sexo || 'M',
            s.nacionalidade || 'Brasileira',
            JSON.stringify(s.certidaoNascimento || {}),
            s.identidade || '',
            s.cpf || '',
            s.turmaId || '',
            s.turmaNome || '',
            s.turno || 'Tarde',
            s.horario || '13:00 às 17:00',
            s.anoLetivo || '2026',
            s.status || 'Ativo',
            JSON.stringify(s.responsaveis || {}),
            JSON.stringify(s.endereco || {}),
            JSON.stringify(s.saudeERotina || {}),
            JSON.stringify(s.renovacoes || []),
            s.valorMensalidadePadrao || 0,
            s.diaVencimentoPadrao || 10,
            s.descontoPadrao || 0,
            s.createdAt || new Date().toISOString(),
            s.updatedAt || new Date().toISOString(),
          ]
        );
      }

      console.log(`  -> Inserindo ${mensalidadesList.length} mensalidades...`);
      for (const m of mensalidadesList) {
        await connection.query(
          `INSERT INTO mensalidades (id, alunoId, alunoNome, turmaNome, mesReferencia, mesIndex, ano, numeroParcela, valorOriginal, desconto, acrescimo, valorFinal, dataVencimento, dataPagamento, status, formaPagamento, numeroRecibo, observacoes, pagoPor, registradoPor)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE status=VALUES(status)`,
          [
            m.id,
            m.alunoId,
            m.alunoNome,
            m.turmaNome || '',
            m.mesReferencia || '',
            m.mesIndex || 1,
            m.ano || 2026,
            m.numeroParcela || 1,
            m.valorOriginal || 0,
            m.desconto || 0,
            m.acrescimo || 0,
            m.valorFinal || 0,
            m.dataVencimento || '',
            m.dataPagamento || null,
            m.status || 'Pendente',
            m.formaPagamento || null,
            m.numeroRecibo || null,
            m.observacoes || '',
            m.pagoPor || null,
            m.registradoPor || null,
          ]
        );
      }

      console.log(`  -> Inserindo ${despesasList.length} despesas...`);
      for (const d of despesasList) {
        await connection.query(
          `INSERT INTO despesas (id, descricao, categoria, valor, mesReferencia, mesIndex, ano, dataVencimento, dataPagamento, status, formaPagamento, observacoes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE valor=VALUES(valor)`,
          [
            d.id,
            d.descricao,
            d.categoria || '',
            d.valor || 0,
            d.mesReferencia || '',
            d.mesIndex || 1,
            d.ano || 2026,
            d.dataVencimento || '',
            d.dataPagamento || null,
            d.status || 'Pendente',
            d.formaPagamento || null,
            d.observacoes || '',
          ]
        );
      }
    }
  }

  // Avisos
  const [avisoRows] = await connection.query('SELECT COUNT(*) as cnt FROM avisos');
  if (avisoRows[0].cnt === 0) {
    const avisosData = [
      {
        id: 'aviso-1',
        titulo: 'Reunião de Pais e Mestres - 1º Bimestre',
        mensagem: 'Convidamos todos os pais e responsáveis para nossa primeira reunião pedagógica do ano letivo de 2026. Apresentação das professoras e do projeto pedagógico.',
        tipo: 'Geral',
        publicoAlvo: 'pais',
        data: '2026-02-18',
        autor: 'Diretoria Pedagógica',
        fixado: 1,
      },
      {
        id: 'aviso-2',
        titulo: 'Carnaval da Escola Aprendendo com Amor',
        mensagem: 'Nossa matinê de Carnaval acontecerá na sexta-feira à tarde. Tragam as crianças com suas fantasias favoritas para um dia repleto de brincadeiras e música!',
        tipo: 'Evento',
        publicoAlvo: 'ambos',
        data: '2026-02-28',
        autor: 'Coordenação de Eventos',
        fixado: 1,
      },
      {
        id: 'aviso-3',
        titulo: 'Entrega do Planejamento Quinzenal',
        mensagem: 'Lembramos aos professores que o envio do planejamento das próximas duas semanas deve ser realizado até sexta-feira via coordenação.',
        tipo: 'Geral',
        publicoAlvo: 'professores',
        data: '2026-02-20',
        autor: 'Coordenação Pedagógica',
        fixado: 0,
      },
    ];

    for (const a of avisosData) {
      await connection.query(
        `INSERT INTO avisos (id, titulo, mensagem, tipo, publicoAlvo, data, autor, fixado)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [a.id, a.titulo, a.mensagem, a.tipo, a.publicoAlvo, a.data, a.autor, a.fixado]
      );
    }
    console.log(`  -> ${avisosData.length} avisos semeados`);
  }

  console.log('🎉 Migração concluída com sucesso no MySQL!');
  await connection.end();
}

runMigration().catch((err) => {
  console.error('❌ Erro durante a migração:', err);
  process.exit(1);
});
