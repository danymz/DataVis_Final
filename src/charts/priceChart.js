import { Chart, registerables } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import zoomPlugin from 'chartjs-plugin-zoom';
import { parseExcelData, createPresidencyAnnotations } from '../utils/excelParser.js';

// Register Chart.js components
Chart.register(...registerables, annotationPlugin, zoomPlugin);

/**
 * Initialize the price chart
 * @param {Array} data - Array of data points
 * @param {Array} presidencies - Array of presidency objects
 * @returns {Chart} Chart.js instance
 */
export function initChart(data, presidencies) {
    const ctx = document.getElementById('priceChart').getContext('2d');
    
    // Process data for Chart.js
    const { years, datasets } = parseExcelData(data, presidencies);
    
    // Create presidency annotations
    const annotations = createPresidencyAnnotations(presidencies);
    
    // Create chart
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: years,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Household Item Prices Over Time',
                    font: {
                        size: 16
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: 'USD',
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                }).format(context.parsed.y);
                            }
                            return label;
                        }
                    }
                },
                legend: {
                    position: 'right',
                    align: 'start'
                },
                zoom: {
                    pan: {
                        enabled: true,
                        mode: 'x'
                    },
                    zoom: {
                        wheel: {
                            enabled: true
                        },
                        pinch: {
                            enabled: true
                        },
                        mode: 'x'
                    }
                },
                annotation: {
                    annotations: annotations
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Year'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Price (USD)'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'USD',
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0
                            }).format(value);
                        }
                    }
                }
            }
        }
    });
    
    return chart;
}

/**
 * Update the chart with new data
 * @param {Chart} chart - Chart.js instance
 * @param {Array} data - Array of data points
 */
export function updateChart(chart, data) {
    // Process data for Chart.js
    const { years, datasets } = parseExcelData(data, chart.options.plugins.annotation.annotations);
    
    // Update chart data
    chart.data.labels = years;
    chart.data.datasets = datasets;
    
    // Update chart
    chart.update();
} 