# Walkthrough: Módulo de Eventos Escolares & Enquetes de Participação dos Pais

Implementamos com sucesso no painel da **Escola Aprendendo com Amor** o módulo completo de **Gestão de Eventos Escolares, Enquetes de Participação dos Pais e Cobrança Integrada**, inspirado diretamente na planilha [`CIRCO + PASCOA.html`](file:///c:/Users/kikiTo/Downloads/aprendendocomamor/CIRCO%20+%20PASCOA.html).

---

## 🎪 O Que Foi Desenvolvido

### 1. 📊 Planilha Interativa de Gestão de Eventos (`EventosView.tsx`)
Inspirada e compatível com a planilha [`CIRCO + PASCOA.html`](file:///c:/Users/kikiTo/Downloads/aprendendocomamor/CIRCO%20+%20PASCOA.html), a tela de gestão para a **Diretoria, Secretaria e Professores** reúne:
- **Painel Superior de Métricas em Tempo Real**:
  - Total de Alunos Confirmados (Votos *"Sim"*).
  - Alunos que não participarão (Votos *"Não"*).
  - Alunos Pendentes de Resposta.
  - **Barra de Progresso do Quórum Mínimo** (ex: 30 alunos necessários vs alunos confirmados).
  - Total Financeiro Arrecadado vs Previsto vs Pendente.
- **Seletor de Eventos**: Cards com status visual (`🗳️ Enquete Aberta`, `✅ Confirmado`, `🏆 Realizado`, `❌ Cancelado`), datas, turmas e valores.
- **Filtros Inteligentes**:
  - Busca instantânea por nome do aluno ou turma.
  - Filtro por Turma (*Maternal, Jardim I, Jardim II, Jardim III, 1º Ano Fundamental*).
  - Filtro por Voto (*Todos, Sim, Não, Pendentes*).
  - Filtro por Pagamento (*Todos, Pago, Pendente, Isento*).
- **Tabela de Lançamento e Alternância Rápida**:
  - Aluno(a) e Turma.
  - Alternância rápida com 1 clique de voto: **"Sim" 🟢 | "Não" 🔴 | "?" ⚪** (ideal quando o responsável avisa pelo WhatsApp ou agenda escolar).
  - Observações e restrições alimentares digitadas pela família.
  - Colunas financeiras (*Valor do Evento, Forma de Pagamento e Status do Pagamento*).
  - Botão de **Baixa Rápida de Pagamento** com emissão de recibo.
  - Botão de **Lembrete via WhatsApp** com mensagem pré-formatada direta para o pai ou mãe do aluno pendente.

---

### 2. 👨‍👩‍👧 Enquetes Interativas no Portal da Família (`PortalResponsavelView.tsx`)
Na visão dos Pais e Responsáveis, foi adicionada a nova sub-aba **"🎪 Eventos & Enquetes"** com:
- **Card do Evento com Identidade Visual Premium**:
  - Categoria, Título, Data, Horário, Local e Prazo limite para resposta.
  - Comunicado explicativo da escola aos pais sobre as atividades pedagógicas e recreativas.
- **Área de Votação Tátil**:
  - Botão de confirmação: **"Sim, meu filho(a) vai participar! 🥳"**
  - Botão de recusa: **"Não poderá participar desta vez 😢"**
  - Campo de observação / restrições alimentares (ex: *"Alergia a chocolate ao leite"*, *"Vovó irá buscar"*).
- **Módulo de Pagamento Integrado (se o evento for pago)**:
  - Exibição do valor por aluno.
  - Chave PIX oficial da escola com botão **"Copiar Chave PIX"** de 1 clique.
  - Dados bancários da escola (*Banco Inter / Sicoob*).
  - Botão direto **"Enviar Comprovante na Secretaria"** abrindo o WhatsApp já com a mensagem preenchida com o nome do aluno, turma e evento.
  - Status em tempo real do pagamento (*Aguardando Pagamento* vs *Pagamento Quitado & Confirmado com Recibo*).

---

### 3. 🖨️ Documento Oficial Timbrado A4: Lista de Embarque e Presença (`ListaEventoPrint.tsx`)
Documento oficial formatado para impressão em folha A4 com timbrado da escola para acompanhamento no dia do evento:
- **Cabeçalho Oficial Timbrado**: Logomarca da Escola, Razão Social, CNPJ, Resolução CME nº 09, Endereço e Contatos.
- **Ficha Técnica do Evento**: Título, Categoria, Data, Horário Previsto, Destino/Local e Total de Alunos Confirmados.
- **Quórum por Turma**: Resumo consolidado de participantes por sala (*Maternal: X, Jardim I: Y, Jardim II: Z, etc.*).
- **Tabela de Conferência**:
  - Nº de chamada, Nome do Aluno, Turma, Telefone de Emergência dos Pais, Situação de Pagamento, Alergias/Restrições e campo para visto de embarque/chegada.
- **Termo de Responsabilidade e Assinaturas**:
  - Campos de assinatura para Diretoria Pedagógica, Secretaria Escolar e Professor(a) Acompanhante.

---

### 4. 🗄️ Dados Pré-Carregados da Planilha `CIRCO + PASCOA.html`
O sistema já vem populado no [`initialData.ts`](file:///c:/Users/kikiTo/Downloads/aprendendocomamor/src/data/initialData.ts) com:
1. **🎪 Espetáculo do Circo Mágico da Alegria**:
   - Status: *Confirmado Oficialmente*.
   - Populado com **todos os alunos e turmas da planilha original** (*Maternal, Jardim I, Jardim II, Jardim III e Fundamental*), preservando os votos "Sim" e pagamentos registrados na planilha (como *Júlia Maternal, Théo JD1, Henri JD2, Isis JD2, Lucas JD2, Pedro Henrique JD2, Thiago JD2, Vicente JD2, Alice JD3, Lais Gaspar FUND, Laura FUND, Miguel FUND, Sarah FUND, Ysis FUND, Lucas Gabriel*).
2. **🐰 Celebração de Páscoa & Caça aos Ovos 2026**:
   - Status: *Enquete Aberta para Votação*.
   - Com data, valor (R$ 30,00), prazo de votação e opções abertas para os pais interagirem no Portal.

---

## 🛠️ Validação e Build

- **Compilação Next.js 16 + Turbopack (`npm run build`)**: Concluído com sucesso (código 0) e verificação estrita de TypeScript.
- **Persistência Local (`localStorage`)**: Sincronização automática em `STORAGE_KEYS.EVENTOS` com fallback instantâneo.
