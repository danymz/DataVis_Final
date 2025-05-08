import { Chart, registerables } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import zoomPlugin from 'chartjs-plugin-zoom';
import { parseExcelData, createPresidencyAnnotations } from '../utils/excelParser.js';

Chart.register(...registerables, annotationPlugin, zoomPlugin);

export function initChart(data, presidencies) {
    const ctx = document.getElementById('priceChart').getContext('2d');

    const { years, datasets } = parseExcelData(data, presidencies);
    
    const annotations = createPresidencyAnnotations(presidencies);

    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: years,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: {
                    bottom: 50
                }
            },
            interaction: {
                mode: 'index',
                intersect: false
            },
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
                    },
                    enabled: true
                },
                legend: {
                    position: 'bottom',
                    align: 'center',
                    labels: {
                        boxWidth: 12,
                        font: {
                            size: 11
                        },
                        color: '#333',
                        padding: 5,
                        usePointStyle: true
                    }
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

export function updateChart(chart, data) {
    const { years, datasets } = parseExcelData(data, chart.options.plugins.annotation.annotations);
    
    chart.data.labels = years;
    chart.data.datasets = datasets;
    
    chart.update();
} 