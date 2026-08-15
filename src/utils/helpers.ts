import { Student, Mensalidade, EscolaConfig, Aviso } from '@/types';

export function calcularIdade(dataNascimento: string): string {
  if (!dataNascimento) return '';
  const nasc = new Date(dataNascimento);
  if (isNaN(nasc.getTime())) return '';

  const hoje = new Date();
  let anos = hoje.getFullYear() - nasc.getFullYear();
  let meses = hoje.getMonth() - nasc.getMonth();

  if (meses < 0 || (meses === 0 && hoje.getDate() < nasc.getDate())) {
    anos--;
    meses += 12;
  }

  if (hoje.getDate() < nasc.getDate()) {
    meses--;
    if (meses < 0) {
      meses += 12;
    }
  }

  if (anos <= 0) {
    return meses === 1 ? '1 mês' : `${meses} meses`;
  }

  if (meses === 0) {
    return anos === 1 ? '1 ano' : `${anos} anos`;
  }

  return `${anos} ${anos === 1 ? 'ano' : 'anos'} e ${meses} ${meses === 1 ? 'mês' : 'meses'}`;
}

export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor || 0);
}

export function formatarDataBR(dataISO?: string): string {
  if (!dataISO) return '-';
  if (dataISO.includes('/')) return dataISO;
  const partes = dataISO.split('-');
  if (partes.length === 3) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }
  return dataISO;
}

export function mesesAno(): { index: number; nome: string }[] {
  return [
    { index: 1, nome: 'Janeiro' },
    { index: 2, nome: 'Fevereiro' },
    { index: 3, nome: 'Março' },
    { index: 4, nome: 'Abril' },
    { index: 5, nome: 'Maio' },
    { index: 6, nome: 'Junho' },
    { index: 7, nome: 'Julho' },
    { index: 8, nome: 'Agosto' },
    { index: 9, nome: 'Setembro' },
    { index: 10, nome: 'Outubro' },
    { index: 11, nome: 'Novembro' },
    { index: 12, nome: 'Dezembro' },
  ];
}

export function gerarMensalidadesParaAluno(
  aluno: Student,
  ano: number = 2026,
  diaVencimento: number = 10
): Mensalidade[] {
  const listaMeses = mesesAno();
  const valorPadrao = aluno.valorMensalidadePadrao || 500;
  const desconto = aluno.descontoPadrao || 0;
  const valorFinal = Math.max(0, valorPadrao - desconto);

  return listaMeses.map((m, idx) => {
    const mesStr = String(m.index).padStart(2, '0');
    const diaStr = String(diaVencimento).padStart(2, '0');
    const dataVencimento = `${ano}-${mesStr}-${diaStr}`;
    const id = `mensalidade-${aluno.id}-${ano}-${m.index}`;

    // Para o mês 1 (Janeiro) ou 2 (Fevereiro), simular status pago para demonstração inicial se for o aluno demo
    const isDemoPago = (aluno.id === 'aluno-maria-julia' || aluno.id === 'aluno-sophia-valente') && m.index === 1;

    return {
      id,
      alunoId: aluno.id,
      alunoNome: aluno.nome,
      turmaNome: aluno.turmaNome,
      mesReferencia: `${m.nome} / ${ano}`,
      mesIndex: m.index,
      ano,
      numeroParcela: idx + 1,
      valorOriginal: valorPadrao,
      desconto,
      acrescimo: 0,
      valorFinal,
      dataVencimento,
      dataPagamento: isDemoPago ? `${ano}-01-08` : undefined,
      status: isDemoPago ? 'Pago' : 'Pendente',
      formaPagamento: isDemoPago ? 'PIX' : undefined,
      numeroRecibo: isDemoPago ? `REC-${ano}-00${idx + 1}` : undefined,
      pagoPor: isDemoPago ? aluno.responsaveis.mae.nome : undefined,
      observacoes: '',
    };
  });
}

export function gerarNumeroRecibo(sequencial: number = 1, ano: number = 2026): string {
  const seqStr = String(sequencial).padStart(4, '0');
  return `REC-${ano}-${seqStr}`;
}

export function gerarNumeroMatricula(ano: string = '2026', totalAlunos: number = 0): string {
  const seq = String(totalAlunos + 1).padStart(3, '0');
  return `${ano}-${seq}`;
}

export function formatarTelefoneWhatsApp(telefone: string): string {
  const limpo = telefone.replace(/\D/g, '');
  if (!limpo) return '';
  if (limpo.startsWith('55')) return limpo;
  return `55${limpo}`;
}

export function linkWhatsApp(telefone: string, mensagem: string): string {
  const num = formatarTelefoneWhatsApp(telefone);
  const textoEncoded = encodeURIComponent(mensagem);
  // Utilizar api.whatsapp.com direto evita a perda de codificação UTF-8 de emojis que ocorre no redirect do wa.me
  return `https://api.whatsapp.com/send?phone=${num}&text=${textoEncoded}`;
}

export function gerarMensagemCobrancaAmigavel(
  mensalidade: Mensalidade,
  aluno: Student,
  config: EscolaConfig
): string {
  const primeiroNomeResponsavel = aluno.responsaveis.mae.nome
    ? aluno.responsaveis.mae.nome.split(' ')[0]
    : 'Família';

  return `Olá, ${primeiroNomeResponsavel}! Tudo bem? ✨\n\n` +
    `Passando para lembrar com carinho da mensalidade da *${aluno.nome}* referente a *${mensalidade.mesReferencia}* na *${config.nome}*.\n\n` +
    `📋 *Detalhes da Mensalidade:*\n` +
    `• Vencimento: ${formatarDataBR(mensalidade.dataVencimento)}\n` +
    `• Valor: ${formatarMoeda(mensalidade.valorFinal)}\n\n` +
    `💳 *Chave PIX da Escola:*\n` +
    `• Chave CNPJ: ${config.chavePix}\n` +
    `• Titular: ${config.titularPix} (${config.bancoPix})\n\n` +
    `Após realizar o pagamento, basta nos enviar o comprovante por aqui. Agradecemos a parceria e a confiança na educação do seu tesouro! ❤️🏫`;
}

export function gerarMensagemRecibo(
  mensalidade: Mensalidade,
  aluno: Student,
  config: EscolaConfig
): string {
  return `Olá! Confirmamos com alegria o recebimento da mensalidade de *${mensalidade.mesReferencia}* do(a) aluno(a) *${aluno.nome}*! 🧾✨\n\n` +
    `📋 *Comprovante Escolar:*\n` +
    `• Nº Recibo: ${mensalidade.numeroRecibo || 'Oficial'}\n` +
    `• Valor Pago: ${formatarMoeda(mensalidade.valorFinal)}\n` +
    `• Data do Pagamento: ${formatarDataBR(mensalidade.dataPagamento)}\n` +
    `• Forma: ${mensalidade.formaPagamento || 'PIX'}\n\n` +
    `Obrigado pela parceria de sempre! - *${config.nome}* ❤️`;
}

export function valorPorExtenso(valor: number): string {
  // Conversor simplificado de moeda para recibos oficiais
  const inteiros = Math.floor(valor);
  const centavos = Math.round((valor - inteiros) * 100);

  const unidades = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
  const dezenas1 = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
  const dezenas2 = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
  const centenas = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];

  function converterGrupo(n: number): string {
    if (n === 100) return 'cem';
    const c = Math.floor(n / 100);
    const d = Math.floor((n % 100) / 10);
    const u = n % 10;
    const partes: string[] = [];

    if (c > 0) partes.push(centenas[c]);
    if (d === 1) {
      partes.push(dezenas1[u]);
    } else {
      if (d > 1) partes.push(dezenas2[d]);
      if (u > 0) partes.push(unidades[u]);
    }
    return partes.join(' e ');
  }

  if (inteiros === 0) return 'zero reais';
  const extenso = converterGrupo(inteiros);
  const reais = inteiros === 1 ? 'real' : 'reais';

  if (centavos > 0) {
    const centExt = converterGrupo(centavos);
    const centStr = centavos === 1 ? 'centavo' : 'centavos';
    return `${extenso} ${reais} e ${centExt} ${centStr}`;
  }

  return `${extenso} ${reais}`;
}
