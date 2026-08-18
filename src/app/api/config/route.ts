import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { EscolaConfig } from '@/types';

export const dynamic = 'force-dynamic';

export async function PUT(req: Request) {
  try {
    const config: Partial<EscolaConfig> = await req.json();

    await query(
      `INSERT INTO escola_config (id, nome, razaoSocial, cnpj, resolucao, endereco, bairro, cidade, uf, cep, telefonePrincipal, telefoneSecundario, email, instagram, chavePix, bancoPix, titularPix, anoLetivoAtivo, diaVencimentoPadrao, metaFaturamentoMensal)
       VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         nome=VALUES(nome),
         razaoSocial=VALUES(razaoSocial),
         cnpj=VALUES(cnpj),
         resolucao=VALUES(resolucao),
         endereco=VALUES(endereco),
         bairro=VALUES(bairro),
         cidade=VALUES(cidade),
         uf=VALUES(uf),
         cep=VALUES(cep),
         telefonePrincipal=VALUES(telefonePrincipal),
         telefoneSecundario=VALUES(telefoneSecundario),
         email=VALUES(email),
         instagram=VALUES(instagram),
         chavePix=VALUES(chavePix),
         bancoPix=VALUES(bancoPix),
         titularPix=VALUES(titularPix),
         anoLetivoAtivo=VALUES(anoLetivoAtivo),
         diaVencimentoPadrao=VALUES(diaVencimentoPadrao),
         metaFaturamentoMensal=VALUES(metaFaturamentoMensal)`,
      [
        config.nome || 'Escola Aprendendo com Amor',
        config.razaoSocial || 'Escola Aprendendo com Amor LTDA',
        config.cnpj || '33.144.173/0001-32',
        config.resolucao || 'RESOLUÇÃO CME Nº 09 - 15/05/2024',
        config.endereco || 'Rua Waldemar Prata, 156',
        config.bairro || 'Parque Corrientes',
        config.cidade || 'Campos dos Goytacazes',
        config.uf || 'RJ',
        config.cep || '28055-160',
        config.telefonePrincipal || '(22) 99762-7654',
        config.telefoneSecundario || '(22) 99893-7242',
        config.email || 'aprendendocomamor.escola@gmail.com',
        config.instagram || '@aprendendocomamor',
        config.chavePix || '33.144.173/0001-32',
        config.bancoPix || 'Banco Inter / Sicoob',
        config.titularPix || 'Escola Aprendendo com Amor LTDA',
        config.anoLetivoAtivo || '2026',
        config.diaVencimentoPadrao || 10,
        config.metaFaturamentoMensal || 24650.0,
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erro na rota /api/config PUT:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
