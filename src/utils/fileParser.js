import * as XLSX from 'xlsx';

/**
 * Parses an Excel file and extracts data from the first sheet.
 * Expects columns '语料名称' and '文字内容'.
 *
 * @param {File} file - The uploaded Excel file.
 * @returns {Promise<Array<{index: string, text: string}>>} - A promise resolving to an array of parsed data objects.
 */
export const parseExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
          reject(new Error('Excel文件中没有数据'));
          return;
        }

        const firstRow = jsonData[0];
        if (!Object.prototype.hasOwnProperty.call(firstRow, '语料名称') || !Object.prototype.hasOwnProperty.call(firstRow, '文字内容')) {
          reject(new Error('Excel文件表头必须包含"语料名称"和"文字内容"列'));
          return;
        }

        const validData = [];
        jsonData.forEach(row => {
          if (row['语料名称'] !== undefined && row['语料名称'] !== null && row['文字内容']) {
            const rawName = row['语料名称'].toString();
            const text = row['文字内容'].toString().trim();

            if (text === '') return;

            // Split by '&', trim whitespace, and create an entry for each name
            const names = rawName.split('&').map(n => n.trim()).filter(n => n !== '');

            names.forEach(name => {
              validData.push({
                index: name,
                text: text
              });
            });
          }
        });

        if (validData.length === 0) {
          reject(new Error('Excel文件中没有有效的文本数据'));
          return;
        }
        resolve(validData);
      } catch (error) {
        reject(new Error('解析Excel文件失败: ' + error.message));
      }
    };
    reader.onerror = () => reject(new Error('读取文件失败'));
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Parses TSV (Tab-Separated Values) content from clipboard.
 * Expects columns '语料名称' and '文字内容'.
 *
 * @param {string} content - The raw string content from the clipboard.
 * @returns {Array<{index: string, text: string}>} - An array of parsed data objects.
 * @throws {Error} - If parsing fails or validation rules are not met.
 */
export const parseTSVContent = (content) => {
  if (!content || !content.trim()) {
    throw new Error('粘贴内容为空');
  }

  // Manual TSV parsing to ensure robustness with Unicode and avoid library dependencies for simple text
  const rows = content.trim().split(/\r?\n/);
  if (rows.length < 2) {
    throw new Error('粘贴内容必须包含表头和至少一行数据');
  }

  // Parse headers
  const headers = rows[0].split('\t').map(h => h.trim());
  const nameIndex = headers.indexOf('语料名称');
  const textIndex = headers.indexOf('文字内容');

  if (nameIndex === -1 || textIndex === -1) {
    throw new Error('粘贴内容必须包含"语料名称"和"文字内容"列表头');
  }

  const validData = [];
  for (let i = 1; i < rows.length; i++) {
    const rowData = rows[i].split('\t');
    // Ensure row has enough columns
    if (rowData.length <= Math.max(nameIndex, textIndex)) continue;

    const name = rowData[nameIndex]?.trim();
    const text = rowData[textIndex]?.trim();

    if (name && text) {
      // Split by '&', trim whitespace, and create an entry for each name
      const names = name.split('&').map(n => n.trim()).filter(n => n !== '');

      names.forEach(n => {
        validData.push({
          index: n,
          text: text
        });
      });
    }
  }

  if (validData.length === 0) {
    throw new Error('粘贴内容中没有有效的文本数据');
  }

  return validData;
};
