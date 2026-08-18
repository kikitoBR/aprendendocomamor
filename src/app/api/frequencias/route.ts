import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { ChamadaFrequencia } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const chamada: ChamadaFrequencia = await req.json();

    await query(
      `INSERT INTO frequencias (id, turmaId, turmaNome, data, turno, registros, conteudoMinistrado, registradoPor, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         turmaNome=VALUES(turmaNome),
         turno=VALUES(turno),
         registros=VALUES(registros),
         conteudoMinistrado=VALUES(conteudoMinistrado),
         registradoPor=VALUES(registradoPor)`,
      [
        chamada.id,
        chamada.turmaId,
        chamada.turmaNome || '',
        chamada.data,
        chamada.turno || 'Tarde',
        JSON.stringify(chamada.registros || []),
        chamada.conteudoMinistrado || '',
        chamada.registradoPor || 'Coordenação',
        chamada.createdAt || new Date().toISOString(),
      ]
    );

    return NextResponse.json({ success: true, id: chamada.id });
  } catch (error: any) {
    console.error('Erro na rota /api/frequencias POST:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
