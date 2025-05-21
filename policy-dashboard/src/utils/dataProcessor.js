import Papa from 'papaparse';

// CSVではなくJSON形式で集計済みデータを読み込む
export const loadProcessedData = async (fileName) => {
  try {
    const response = await fetch(`${process.env.PUBLIC_URL}/data/${fileName}`);
    const data = await response.json();
    console.log(`Loaded ${fileName}:`, Array.isArray(data) ? data.length : 'object');
    return data;
  } catch (error) {
    console.error(`Error loading ${fileName}:`, error);
    return Array.isArray([]) ? [] : {};
  }
};

// 元のCSVファイルの読み込み（バックアップ用）
export const loadCSVFile = async (fileName) => {
  try {
    const response = await fetch(`${process.env.PUBLIC_URL}/csv/${fileName}`);
    const csvData = await response.text();
    const result = Papa.parse(csvData, { 
      header: true, 
      dynamicTyping: true, 
      skipEmptyLines: true,
      encoding: "UTF-8"
    });
    console.log(`Loaded ${fileName}:`, result.data.length, 'rows');
    return result;
  } catch (error) {
    console.error('Error loading CSV:', error);
    return { data: [] };
  }
};

// 以下は処理済みデータを読み込むように変更したため、
// サーバーサイドの前処理スクリプトに移動しました。