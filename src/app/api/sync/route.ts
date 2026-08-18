import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Configuração
    const configRows = await query<any[]>('SELECT * FROM escola_config LIMIT 1');
    const rawConfig = configRows[0] || {};
    const config = {
      nome: rawConfig.nome || 'Escola Aprendendo com Amor',
      razaoSocial: rawConfig.razaoSocial || 'Escola Aprendendo com Amor LTDA',
      cnpj: rawConfig.cnpj || '33.144.173/0001-32',
      resolucao: rawConfig.resolucao || 'RESOLUÇÃO CME Nº 09 - 15/05/2024',
      endereco: rawConfig.endereco || 'Rua Waldemar Prata, 156',
      bairro: rawConfig.bairro || 'Parque Corrientes',
      cidade: rawConfig.cidade || 'Campos dos Goytacazes',
      uf: rawConfig.uf || 'RJ',
      cep: rawConfig.cep || '28055-160',
      telefonePrincipal: rawConfig.telefonePrincipal || '(22) 99762-7654',
      telefoneSecundario: rawConfig.telefoneSecundario || '(22) 99893-7242',
      email: rawConfig.email || 'aprendendocomamor.escola@gmail.com',
      instagram: rawConfig.instagram || '@aprendendocomamor',
      chavePix: rawConfig.chavePix || '33.144.173/0001-32',
      bancoPix: rawConfig.bancoPix || 'Banco Inter / Sicoob',
      titularPix: rawConfig.titularPix || 'Escola Aprendendo com Amor LTDA',
      anoLetivoAtivo: rawConfig.anoLetivoAtivo || '2026',
      diaVencimentoPadrao: Number(rawConfig.diaVencimentoPadrao) || 10,
      metaFaturamentoMensal: Number(rawConfig.metaFaturamentoMensal) || 24650.0,
    };

    // 2. Turmas
    const turmaRows = await query<any[]>('SELECT * FROM turmas ORDER BY nome ASC');
    const turmas = turmaRows.map((t) => ({
      id: t.id,
      nome: t.nome,
      codigo: t.codigo,
      nivel: t.nivel,
      faixaEtaria: t.faixaEtaria,
      turno: t.turno,
      horario: t.horario,
      capacidadeMaxima: Number(t.capacidadeMaxima),
      professorResponsavel: t.professorResponsavel || '',
      sala: t.sala || '',
      mensalidadeSugerida: Number(t.mensalidadeSugerida),
      ativa: Boolean(t.ativa),
    }));

    // 3. Alunos
    const alunoRows = await query<any[]>('SELECT * FROM alunos ORDER BY nome ASC');
    const students = alunoRows.map((s) => ({
      id: s.id,
      matricula: s.matricula,
      nome: s.nome,
      fotoUrl: s.fotoUrl || '',
      dataNascimento: s.dataNascimento || '',
      idadeCalculada: s.idadeCalculada || '',
      sexo: s.sexo || 'M',
      nacionalidade: s.nacionalidade || 'Brasileira',
      certidaoNascimento: typeof s.certidaoNascimento === 'string' ? JSON.parse(s.certidaoNascimento || '{}') : (s.certidaoNascimento || {}),
      identidade: s.identidade || '',
      cpf: s.cpf || '',
      turmaId: s.turmaId || '',
      turmaNome: s.turmaNome || '',
      turno: s.turno || 'Tarde',
      horario: s.horario || '',
      anoLetivo: s.anoLetivo || '2026',
      status: s.status || 'Ativo',
      responsaveis: typeof s.responsaveis === 'string' ? JSON.parse(s.responsaveis || '{}') : (s.responsaveis || {}),
      endereco: typeof s.endereco === 'string' ? JSON.parse(s.endereco || '{}') : (s.endereco || {}),
      saudeERotina: typeof s.saudeERotina === 'string' ? JSON.parse(s.saudeERotina || '{}') : (s.saudeERotina || {}),
      renovacoes: typeof s.renovacoes === 'string' ? JSON.parse(s.renovacoes || '[]') : (s.renovacoes || []),
      valorMensalidadePadrao: Number(s.valorMensalidadePadrao) || 0,
      diaVencimentoPadrao: Number(s.diaVencimentoPadrao) || 10,
      descontoPadrao: Number(s.descontoPadrao) || 0,
      createdAt: s.createdAt || '',
      updatedAt: s.updatedAt || '',
    }));

    // 4. Mensalidades
    const mensalidadeRows = await query<any[]>('SELECT * FROM mensalidades ORDER BY ano ASC, mesIndex ASC, alunoNome ASC');
    const mensalidades = mensalidadeRows.map((m) => ({
      id: m.id,
      alunoId: m.alunoId,
      alunoNome: m.alunoNome,
      turmaNome: m.turmaNome || '',
      mesReferencia: m.mesReferencia || '',
      mesIndex: Number(m.mesIndex),
      ano: Number(m.ano),
      numeroParcela: Number(m.numeroParcela),
      valorOriginal: Number(m.valorOriginal),
      desconto: Number(m.desconto),
      acrescimo: Number(m.acrescimo),
      valorFinal: Number(m.valorFinal),
      dataVencimento: m.dataVencimento || '',
      dataPagamento: m.dataPagamento || undefined,
      status: m.status || 'Pendente',
      formaPagamento: m.formaPagamento || undefined,
      numeroRecibo: m.numeroRecibo || undefined,
      observacoes: m.observacoes || '',
      pagoPor: m.pagoPor || undefined,
      registradoPor: m.registradoPor || undefined,
    }));

    // 5. Despesas
    const despesaRows = await query<any[]>('SELECT * FROM despesas ORDER BY ano DESC, mesIndex DESC');
    const despesas = despesaRows.map((d) => ({
      id: d.id,
      descricao: d.descricao,
      categoria: d.categoria,
      valor: Number(d.valor),
      mesReferencia: d.mesReferencia || '',
      mesIndex: Number(d.mesIndex),
      ano: Number(d.ano),
      dataVencimento: d.dataVencimento || undefined,
      dataPagamento: d.dataPagamento || undefined,
      status: d.status || 'Pendente',
      formaPagamento: d.formaPagamento || undefined,
      observacoes: d.observacoes || '',
    }));

    // 6. Frequências
    const frequenciaRows = await query<any[]>('SELECT * FROM frequencias ORDER BY data DESC');
    const frequencias = frequenciaRows.map((f) => ({
      id: f.id,
      turmaId: f.turmaId,
      turmaNome: f.turmaNome || '',
      data: f.data,
      turno: f.turno || 'Tarde',
      registros: typeof f.registros === 'string' ? JSON.parse(f.registros || '[]') : (f.registros || []),
      conteudoMinistrado: f.conteudoMinistrado || '',
      registradoPor: f.registradoPor || 'Coordenação',
      createdAt: f.createdAt || '',
    }));

    // 7. Avisos
    const avisoRows = await query<any[]>('SELECT * FROM avisos ORDER BY fixado DESC, data DESC');
    const avisos = avisoRows.map((a) => ({
      id: a.id,
      titulo: a.titulo,
      mensagem: a.mensagem,
      tipo: a.tipo || 'Geral',
      publicoAlvo: a.publicoAlvo || 'ambos',
      turmaId: a.turmaId || undefined,
      turmaNome: a.turmaNome || undefined,
      data: a.data || '',
      autor: a.autor || 'Direção',
      fixado: Boolean(a.fixado),
    }));

    return NextResponse.json({
      success: true,
      data: {
        config,
        turmas,
        students,
        mensalidades,
        despesas,
        frequencias,
        avisos,
      },
    });
  } catch (error: any) {
    console.error('Erro na rota /api/sync GET:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao sincronizar com MySQL' },
      { status: 500 }
    );
  }
}
