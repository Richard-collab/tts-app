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

        const validData = jsonData
          .filter(row => row['语料名称'] && row['文字内容'])
          .map(row => ({
            index: row['语料名称'],
            text: row['文字内容'].toString().trim()
          }))
          .filter(item => item.text !== '');

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
