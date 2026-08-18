import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { Turma } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const turma: Turma = await req.json();

    await query(
      `INSERT INTO turmas (id, nome, codigo, nivel, faixaEtaria, turno, horario, capacidadeMaxima, professorResponsavel, sala, mensalidadeSugerida, ativa)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         nome=VALUES(nome),
         codigo=VALUES(codigo),
         nivel=VALUES(nivel),
         faixaEtaria=VALUES(faixaEtaria),
         turno=VALUES(turno),
         horario=VALUES(horario),
         capacidadeMaxima=VALUES(capacidadeMaxima),
         professorResponsavel=VALUES(professorResponsavel),
         sala=VALUES(sala),
         mensalidadeSugerida=VALUES(mensalidadeSugerida),
         ativa=VALUES(ativa)`,
      [
        turma.id,
        turma.nome,
        turma.codigo || '',
        turma.nivel || 'Educação Infantil',
        turma.faixaEtaria || '',
        turma.turno || 'Tarde',
        turma.horario || '',
        turma.capacidadeMaxima || 15,
        turma.professorResponsavel || '',
        turma.sala || '',
        turma.mensalidadeSugerida || 0,
        turma.ativa ? 1 : 0,
      ]
    );

    return NextResponse.json({ success: true, id: turma.id });
  } catch (error: any) {
    console.error('Erro na rota /api/turmas POST:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID da turma obrigatório' }, { status: 400 });
    }

    await query('DELETE FROM turmas WHERE id = ?', [id]);

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error('Erro na rota /api/turmas DELETE:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
