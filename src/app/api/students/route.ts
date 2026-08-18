import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { Student } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const student: Student = await req.json();

    await query(
      `INSERT INTO alunos (id, matricula, nome, fotoUrl, dataNascimento, idadeCalculada, sexo, nacionalidade, certidaoNascimento, identidade, cpf, turmaId, turmaNome, turno, horario, anoLetivo, status, responsaveis, endereco, saudeERotina, renovacoes, valorMensalidadePadrao, diaVencimentoPadrao, descontoPadrao, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         matricula=VALUES(matricula),
         nome=VALUES(nome),
         fotoUrl=VALUES(fotoUrl),
         dataNascimento=VALUES(dataNascimento),
         idadeCalculada=VALUES(idadeCalculada),
         sexo=VALUES(sexo),
         nacionalidade=VALUES(nacionalidade),
         certidaoNascimento=VALUES(certidaoNascimento),
         identidade=VALUES(identidade),
         cpf=VALUES(cpf),
         turmaId=VALUES(turmaId),
         turmaNome=VALUES(turmaNome),
         turno=VALUES(turno),
         horario=VALUES(horario),
         anoLetivo=VALUES(anoLetivo),
         status=VALUES(status),
         responsaveis=VALUES(responsaveis),
         endereco=VALUES(endereco),
         saudeERotina=VALUES(saudeERotina),
         renovacoes=VALUES(renovacoes),
         valorMensalidadePadrao=VALUES(valorMensalidadePadrao),
         diaVencimentoPadrao=VALUES(diaVencimentoPadrao),
         descontoPadrao=VALUES(descontoPadrao),
         updatedAt=VALUES(updatedAt)`,
      [
        student.id,
        student.matricula,
        student.nome,
        student.fotoUrl || '',
        student.dataNascimento || '',
        student.idadeCalculada || '',
        student.sexo || 'M',
        student.nacionalidade || 'Brasileira',
        JSON.stringify(student.certidaoNascimento || {}),
        student.identidade || '',
        student.cpf || '',
        student.turmaId || '',
        student.turmaNome || '',
        student.turno || 'Tarde',
        student.horario || '',
        student.anoLetivo || '2026',
        student.status || 'Ativo',
        JSON.stringify(student.responsaveis || {}),
        JSON.stringify(student.endereco || {}),
        JSON.stringify(student.saudeERotina || {}),
        JSON.stringify(student.renovacoes || []),
        student.valorMensalidadePadrao || 0,
        student.diaVencimentoPadrao || 10,
        student.descontoPadrao || 0,
        student.createdAt || new Date().toISOString(),
        student.updatedAt || new Date().toISOString(),
      ]
    );

    return NextResponse.json({ success: true, id: student.id });
  } catch (error: any) {
    console.error('Erro na rota /api/students POST:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID do aluno obrigatório' }, { status: 400 });
    }

    await query('DELETE FROM mensalidades WHERE alunoId = ?', [id]);
    await query('DELETE FROM alunos WHERE id = ?', [id]);

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error('Erro na rota /api/students DELETE:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
