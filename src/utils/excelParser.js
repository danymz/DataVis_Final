import * as XLSX from 'xlsx';

/**
 * Reads an Excel file and returns its data
 * @param {string} filePath - Path to the Excel file
 * @returns {Array} Array of objects with the Excel data
 */
export async function readExcelFile(filePath) {
  try {
    const response = await fetch(filePath);
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    // Log sheet names
    console.log(`Sheet names in ${filePath}:`, workbook.SheetNames);
    
    // Get the "data" sheet instead of the first sheet
    let worksheet;
    if (workbook.SheetNames.includes('data')) {
      worksheet = workbook.Sheets['data'];
      console.log(`Using 'data' sheet from ${filePath}`);
    } else if (workbook.SheetNames.includes('Data')) {
      worksheet = workbook.Sheets['Data'];
      console.log(`Using 'Data' sheet from ${filePath}`);
    } else {
      // Fall back to the first sheet if "data" sheet doesn't exist
      const firstSheetName = workbook.SheetNames[0];
      worksheet = workbook.Sheets[firstSheetName];
      console.warn(`No "data" sheet found in ${filePath}, using first sheet: ${firstSheetName}`);
    }
    
    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    // Log the first few rows to understand the structure
    console.log(`Data from ${filePath}:`, data.slice(0, 3));
    
    // Log column names
    if (data.length > 0) {
      console.log(`Column names in ${filePath}:`, Object.keys(data[0]));
    }
    
    return data;
  } catch (error) {
    console.error(`Error reading Excel file ${filePath}:`, error);
    return [];
  }
}

/**
 * Processes multiple Excel files and combines the data
 * @param {Array} filePaths - Array of paths to Excel files
 * @returns {Promise<Array>} Combined data from all Excel files
 */
export async function processExcelFiles(filePaths) {
  const allData = [];
  
  for (const filePath of filePaths) {
    const data = await readExcelFile(filePath);
    
    // Extract item name from file path
    const fileName = filePath.split('/').pop();
    const itemName = fileName.split('.')[0].replace(/_/g, ' ');
    
    // Process the data based on the structure
    const processedData = data.map(row => {
      // Always use 'Year' and 'Average' columns (case-insensitive)
      let year = null;
      let average = null;
      for (const key of Object.keys(row)) {
        if (key.toLowerCase() === 'year') year = row[key];
        if (key.toLowerCase() === 'average') average = row[key];
      }
      if (year === null || average === null) {
        console.warn(`Could not find Year and Average for ${itemName}:`, row);
        return null;
      }
      return {
        year: Number(year),
        price: Number(average),
        item: itemName
      };
    }).filter(item => item !== null); // Remove null items
    
    allData.push(...processedData);
  }
  
  console.log('Combined data:', allData.slice(0, 10));
  return allData;
}

/**
 * Determines the presidency for a given year
 * @param {number} year - The year to check
 * @param {Array} presidencies - Array of presidency objects
 * @returns {string} Name of the president for that year
 */
export function getPresidencyForYear(year, presidencies) {
  for (const presidency of presidencies) {
    if (year >= presidency.start && year <= presidency.end) {
      return presidency.name;
    }
  }
  return 'Unknown';
}

/**
 * Creates presidency annotations for the chart
 * @param {Array} presidencies - Array of presidency objects
 * @returns {Array} Array of annotation objects for Chart.js
 */
export function createPresidencyAnnotations(presidencies) {
  const colors = ['rgba(200,200,200,0.1)', 'rgba(200,200,200,0.15)'];
  
  return presidencies.map((presidency, index) => ({
    type: 'box',
    xMin: presidency.start,
    xMax: presidency.end,
    backgroundColor: colors[index % colors.length],
    borderWidth: 0,
    label: {
      content: presidency.name,
      position: 'start',
      enabled: true,
      color: '#666',
      font: {
        size: 12
      }
    }
  }));
}

/**
 * Processes raw data from Excel files into a format suitable for Chart.js
 * @param {Array} rawData - Array of objects from Excel parsing
 * @param {Array} presidencies - Array of presidency objects
 * @returns {Object} Processed data with years and datasets
 */
export function parseExcelData(rawData, presidencies) {
  // Extract unique years and sort them
  const years = [...new Set(rawData.map(d => d.year))].sort((a, b) => a - b);
  
  // Extract unique items
  const items = [...new Set(rawData.map(d => d.item))];
  
  console.log('Years:', years);
  console.log('Items:', items);
  
  // Generate colors for each item
  const colors = [
    '#2196f3', // blue
    '#ff9800', // orange
    '#4caf50', // green
    '#f44336', // red
    '#9c27b0', // purple
    '#00bcd4', // cyan
    '#ffeb3b', // yellow
    '#795548', // brown
    '#607d8b', // blue grey
    '#e91e63', // pink
    '#3f51b5', // indigo
    '#009688', // teal
    '#ff5722', // deep orange
    '#8bc34a', // light green
    '#673ab7', // deep purple
    '#03a9f4', // light blue
    '#cddc39', // lime
    '#ffc107', // amber
    '#9e9e9e', // grey
    '#ff4081'  // accent pink
  ];
  
  // Build datasets array for Chart.js
  const datasets = items.map((item, idx) => ({
    label: item,
    data: years.map(year => {
      const record = rawData.find(d => d.item === item && d.year === year);
      return record ? record.price : null;
    }),
    borderColor: colors[idx % colors.length],
    backgroundColor: colors[idx % colors.length],
    borderWidth: 2,
    tension: 0.1,
    spanGaps: false,
    pointRadius: 3,
    pointHoverRadius: 5
  }));
  
  return { years, datasets };
} 