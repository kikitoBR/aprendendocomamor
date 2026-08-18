const fs = require('fs');
const path = require('path');

const files = ['MATERNAL.html', 'JD I.html', 'JD 2.html', 'JD3.html', 'FUND I.html'];
const planilhaDir = path.resolve('c:/Users/kikiTo/Downloads/aprendendocomamor/planilha');

files.forEach((file) => {
  const filePath = path.join(planilhaDir, file);
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');

  console.log(`\n================== ARQUIVO: ${file} ==================`);
  const rows = content.split(/<tr[^>]*>/i).slice(1);

  rows.forEach((row, idx) => {
    const cells = [];
    const cellMatches = row.match(/<td[^>]*>([\s\S]*?)<\/td>/gi);
    if (!cellMatches) return;

    cellMatches.forEach((cell) => {
      const clean = cell.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
      cells.push(clean);
    });

    if (cells.length >= 2 && cells[1]) {
      console.log(`Linha ${idx + 1}: col0="${cells[0]}" | col1(ALUNO)="${cells[1]}" | col2(RESP)="${cells[2]}" | col3(TURNO)="${cells[3]}" | col4(VENC)="${cells[4]}" | col5(JAN)="${cells[5]}" | col17(OBS)="${cells[17] || ''}"`);
    }
  });
});
