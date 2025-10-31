import { google } from 'googleapis';
import { StudentResponse } from '@/types';
import { parseSheetData } from './data-processor';

// ID do Google Sheets extraído do URL
const SPREADSHEET_ID = '1WZDCWzW-UAXCSAUgozaQMHMNWjOm8dr_7nnmp2wPdpI';

// Nome da folha que contém todos os dados consolidados
const BASE_DADOS_SHEET = 'Base_Dados';

/**
 * Cria cliente autenticado do Google Sheets
 */
export async function getGoogleSheetsClient(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });

  return google.sheets({ version: 'v4', auth });
}

/**
 * Lê dados da folha Base_Dados
 */
export async function readBaseDados(accessToken: string): Promise<unknown[][]> {
  try {
    const sheets = await getGoogleSheetsClient(accessToken);
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${BASE_DADOS_SHEET}!A1:Z5000`, // Ler todas as colunas até linha 5000
    });

    const values = response.data.values || [];
    console.log(`📊 API retornou ${values.length} linhas do Google Sheets`);
    return values;
  } catch (error) {
    console.error('Erro ao ler Base_Dados:', error);
    throw new Error('Falha ao ler dados da folha Base_Dados');
  }
}

/**
 * Lê todos os dados de todas as respostas da Base_Dados
 */
export async function readAllResponses(accessToken: string): Promise<StudentResponse[]> {
  try {
    const data = await readBaseDados(accessToken);

    if (!data || data.length < 2) {
      console.log('Nenhum dado encontrado na Base_Dados');
      return [];
    }

    // parseSheetData já processa os dados corretamente
    // assumindo que as colunas Módulo e Edição estão nas posições B e C
    const responses = parseSheetData(data);

    console.log(`Lidos ${responses.length} registos da Base_Dados`);
    return responses;
  } catch (error) {
    console.error('Erro ao ler todas as respostas:', error);
    throw new Error('Falha ao carregar dados do Google Sheets');
  }
}

/**
 * Obtém lista de módulos disponíveis dos dados
 */
export async function getAvailableModules(accessToken: string): Promise<string[]> {
  try {
    const allResponses = await readAllResponses(accessToken);
    const modules = new Set<string>();

    allResponses.forEach(response => {
      if (response.module) {
        modules.add(response.module);
      }
    });

    // Ordenar M1, M2... M9, P1, P2 corretamente
    return Array.from(modules).sort((a, b) => {
      const getOrder = (str: string) => {
        const match = str.match(/([MP])(\d+)/);
        if (!match) return 999;
        const letter = match[1] === 'M' ? 0 : 1; // M antes de P
        const number = parseInt(match[2]);
        return letter * 100 + number;
      };
      return getOrder(a) - getOrder(b);
    });
  } catch (error) {
    console.error('Erro ao obter módulos:', error);
    return [];
  }
}

/**
 * Remove um comentário específico do Google Sheets
 * Encontra a linha pelo email (identificador único) e limpa a coluna T (comentários)
 */
export async function deleteComment(
  accessToken: string,
  email: string,
  commentText: string
): Promise<boolean> {
  try {
    const sheets = await getGoogleSheetsClient(accessToken);
    const data = await readBaseDados(accessToken);

    if (!data || data.length < 2) {
      throw new Error('Nenhum dado encontrado');
    }

    console.log('🔍 Procurando comentário para remover:', { email, commentText: commentText.substring(0, 50) });

    // Encontrar a linha que corresponde ao email e ao texto do comentário
    let rowIndex = -1;
    let foundCount = 0;

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const rowEmail = (row[1] || '').trim().toLowerCase();
      const rowComment = (row[19] || '').trim(); // Coluna T (índice 19)

      console.log(`Linha ${i + 1}: email="${rowEmail}", comentário="${rowComment.substring(0, 30)}..."`);

      // Match por email E texto do comentário (para garantir unicidade)
      if (rowEmail === email.trim().toLowerCase() && rowComment === commentText.trim()) {
        rowIndex = i + 1; // +1 porque as linhas do Sheets começam em 1
        foundCount++;
        console.log(`✅ MATCH ENCONTRADO na linha ${rowIndex}`);
      }
    }

    if (rowIndex === -1) {
      console.error('❌ Comentário não encontrado. Email:', email);
      throw new Error('Comentário não encontrado');
    }

    if (foundCount > 1) {
      console.warn(`⚠️  Encontradas ${foundCount} linhas correspondentes. Usando a primeira.`);
    }

    console.log(`🗑️  A remover comentário da linha ${rowIndex}...`);

    // Ler o valor antes de limpar (para confirmar)
    const beforeValue = data[rowIndex - 1][19] || '';
    console.log(`Valor antes de limpar: "${beforeValue}"`);

    // Limpar a célula T (coluna 20, índice 19)
    const range = `${BASE_DADOS_SHEET}!T${rowIndex}`;
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: range,
      valueInputOption: 'RAW',
      requestBody: {
        values: [['']],
      },
    });

    console.log(`✅ Comentário removido com sucesso da linha ${rowIndex}`);

    // Verificar se foi realmente removido
    const updatedData = await readBaseDados(accessToken);
    const afterValue = updatedData[rowIndex - 1]?.[19] || '';
    console.log(`Valor depois de limpar: "${afterValue}"`);

    if (afterValue !== '') {
      console.error('⚠️  AVISO: O comentário pode não ter sido removido corretamente!');
    }

    return true;
  } catch (error) {
    console.error('❌ Erro ao remover comentário:', error);
    throw error;
  }
}

/**
 * Obtém lista de edições disponíveis dos dados
 */
export async function getAvailableEditions(accessToken: string): Promise<string[]> {
  try {
    const allResponses = await readAllResponses(accessToken);
    const editions = new Set<string>();

    allResponses.forEach(response => {
      if (response.edition) {
        editions.add(response.edition);
      }
    });

    // Ordenação customizada: Ed1-Ed11, depois Ed1C-Ed3C, depois Ed1CES-Ed2CES
    return Array.from(editions).sort((a, b) => {
      const getOrder = (str: string) => {
        // Remover "Ed" do início
        const code = str.replace('Ed', '');

        // Edições CES: prioridade mais baixa (3000+)
        if (code.includes('CES')) {
          const num = parseInt(code.replace('CES', ''));
          return 3000 + num;
        }

        // Edições C (sem ES): prioridade média (2000+)
        if (code.includes('C')) {
          const num = parseInt(code.replace('C', ''));
          return 2000 + num;
        }

        // Edições numéricas simples: prioridade alta (1000+)
        const num = parseInt(code);
        if (!isNaN(num)) {
          return 1000 + num;
        }

        return 9999;
      };

      return getOrder(a) - getOrder(b);
    });
  } catch (error) {
    console.error('Erro ao obter edições:', error);
    return [];
  }
}
