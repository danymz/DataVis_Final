/**
 * Processes raw CSV data into a format suitable for Chart.js
 * @param {Array} rawData - Array of objects from CSV parsing
 * @returns {Object} Processed data with years and datasets
 */
export function parseData(rawData) {
    // Extract unique years and sort them
    const years = [...new Set(rawData.map(d => d.year))].sort((a, b) => a - b);
    
    // Extract unique items
    const items = [...new Set(rawData.map(d => d.item))];
    
    // Generate colors for each item
    const colors = [
        '#2196f3', // blue
        '#ff9800', // orange
        '#4caf50', // green
        '#f44336', // red
        '#9c27b0', // purple
        '#00bcd4', // cyan
        '#ffeb3b', // yellow
        '#795548'  // brown
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