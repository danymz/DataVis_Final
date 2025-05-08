import { initChart, updateChart } from './charts/priceChart.js';
import { processExcelFiles, parseExcelData, getPresidencyForYear } from './utils/excelParser.js';
import { filterData, getUniqueItems, getYearRange, searchItems, getUniquePresidencies } from './utils/filterManager.js';
import { getCPI, getLatestCPI } from './data/cpi.js';

// Define presidency data
const presidencies = [
    { name: 'Eisenhower', start: 1953, end: 1961 },
    { name: 'Kennedy', start: 1961, end: 1963 },
    { name: 'Johnson', start: 1963, end: 1969 },
    { name: 'Nixon', start: 1969, end: 1974 },
    { name: 'Ford', start: 1974, end: 1977 },
    { name: 'Carter', start: 1977, end: 1981 },
    { name: 'Reagan', start: 1981, end: 1989 },
    { name: 'Bush', start: 1989, end: 1993 },
    { name: 'Clinton', start: 1993, end: 2001 },
    { name: 'Bush', start: 2001, end: 2009 },
    { name: 'Obama', start: 2009, end: 2017 },
    { name: 'Trump', start: 2017, end: 2021 },
    { name: 'Biden', start: 2021, end: 2024 }
];

// List of Excel files to process
const excelFiles = [
    '/data/Bread.xlsx',
    '/data/Milk.xlsx',
    '/data/Eggs.xlsx',
    '/data/Butter.xlsx',
    '/data/Chicken.xlsx',
    '/data/All_Uncooked_Ground_Beef.xlsx',
    '/data/All_Uncooked_Beef_Steaks.xlsx',
    '/data/Bacon.xlsx',
    '/data/American_Processed_Cheese.xlsx',
    '/data/Rice.xlsx',
    '/data/Potatoes.xlsx',
    '/data/Onions.xlsx',
    '/data/Tomatoes.xlsx',
    '/data/Lettuce.xlsx',
    '/data/Bananas.xlsx',
    '/data/Lemons.xlsx',
    '/data/Strawberries.xlsx',
    '/data/Sugar.xlsx',
    '/data/Flour.xlsx',
    '/data/Spaghetti_Cost_Per_Pound_453.6_Grams_In_U.S._City_Average.xlsx',
    '/data/All_Soft_Drinks.xlsx',
    '/data/Cola.xlsx',
    '/data/Wine.xlsx',
    '/data/Vodka.xlsx',
    '/data/Gasoline.xlsx',
    '/data/Electricity_Per_Kwh_In_U.S._City_Average.xlsx',
    '/data/Tuna.xlsx',
    '/data/Yogurt.xlsx',
    '/data/Rolls.xlsx'
];

// Global variables
let rawData = [];
let chart = null;
let allItems = [];
let allPresidencies = [];
let inflationAdjusted = false;

// DOM Elements
const itemSearchInput = document.getElementById('item-search');
const itemSelect = document.getElementById('item-select');
const yearStartInput = document.getElementById('year-start');
const yearEndInput = document.getElementById('year-end');
const selectAllButton = document.getElementById('select-all');
const clearSelectionButton = document.getElementById('clear-selection');
const applyFiltersButton = document.getElementById('apply-filters');
const resetFiltersButton = document.getElementById('reset-filters');
// President filter elements
const presidentSelect = document.getElementById('president-select');
const selectAllPresidentsButton = document.getElementById('select-all-presidents');
const clearPresidentsButton = document.getElementById('clear-presidents');
const adjustInflationCheckbox = document.getElementById('adjust-inflation');

// Initialize the application
async function init() {
    try {
        console.log('Loading Excel files...');
        rawData = await processExcelFiles(excelFiles);
        
        if (rawData.length === 0) {
            console.error('No data was loaded from Excel files');
            document.getElementById('priceChart').parentNode.innerHTML = 
                '<div class="error">Error: No data was loaded from Excel files. Check the console for details.</div>';
            return;
        }
        
        // Add presidency information to each data point
        const dataWithPresidency = rawData.map(item => ({
            ...item,
            presidency: getPresidencyForYear(item.year, presidencies)
        }));
        
        console.log('Data loaded successfully:', dataWithPresidency.length, 'records');
        console.log('Sample data:', dataWithPresidency.slice(0, 5));
        
        // Check if we have valid data
        const validData = dataWithPresidency.filter(item => 
            item.year !== null && 
            !isNaN(item.year) && 
            item.price !== null && 
            !isNaN(item.price) && 
            item.item !== null
        );
        
        if (validData.length === 0) {
            console.error('No valid data after filtering');
            document.getElementById('priceChart').parentNode.innerHTML = 
                '<div class="error">Error: No valid data after filtering. Check the console for details.</div>';
            return;
        }
        
        console.log('Valid data count:', validData.length);
        
        // Get all unique items
        allItems = getUniqueItems(validData);
        // Get all unique presidencies
        allPresidencies = getUniquePresidencies(validData);
        
        // Get year range
        const yearRange = getYearRange(validData);
        
        // Initialize UI
        initializeUI(validData, allItems, allPresidencies, yearRange);
        
        // Initialize chart with all data
        chart = initChart(validData, presidencies);
        
    } catch (error) {
        console.error('Error initializing chart:', error);
        document.getElementById('priceChart').parentNode.innerHTML = 
            '<div class="error">Error initializing chart: ' + error.message + '</div>';
    }
}

// Initialize UI components
function initializeUI(data, items, presidencies, yearRange) {
    // Populate item select dropdown
    populateItemSelect(items);
    // Populate president select dropdown
    populatePresidentSelect(presidencies);
    
    // Set year range inputs
    yearStartInput.value = yearRange.min;
    yearEndInput.value = yearRange.max;
    
    // Set min/max attributes
    yearStartInput.min = yearRange.min;
    yearStartInput.max = yearRange.max;
    yearEndInput.min = yearRange.min;
    yearEndInput.max = yearRange.max;
    
    // Add event listeners
    itemSearchInput.addEventListener('input', handleItemSearch);
    selectAllButton.addEventListener('click', handleSelectAll);
    clearSelectionButton.addEventListener('click', handleClearSelection);
    applyFiltersButton.addEventListener('click', handleApplyFilters);
    resetFiltersButton.addEventListener('click', handleResetFilters);
    // President filter event listeners
    selectAllPresidentsButton.addEventListener('click', handleSelectAllPresidents);
    clearPresidentsButton.addEventListener('click', handleClearPresidents);
    adjustInflationCheckbox.addEventListener('change', () => {
        handleApplyFilters();
    });
}

// Populate item select dropdown
function populateItemSelect(items, filteredItems = null) {
    itemSelect.innerHTML = '';
    
    const itemsToShow = filteredItems || items;
    
    itemsToShow.forEach(item => {
        const option = document.createElement('option');
        option.value = item;
        option.textContent = item;
        itemSelect.appendChild(option);
    });
}

// Populate president select dropdown
function populatePresidentSelect(presidencies) {
    presidentSelect.innerHTML = '';
    presidencies.forEach(president => {
        const option = document.createElement('option');
        option.value = president;
        option.textContent = president;
        presidentSelect.appendChild(option);
    });
}

// Handle item search
function handleItemSearch() {
    const searchTerm = itemSearchInput.value;
    const filteredItems = searchItems(allItems, searchTerm);
    populateItemSelect(allItems, filteredItems);
}

// Handle select all button
function handleSelectAll() {
    const options = itemSelect.options;
    for (let i = 0; i < options.length; i++) {
        options[i].selected = true;
    }
}

// Handle clear selection button
function handleClearSelection() {
    const options = itemSelect.options;
    for (let i = 0; i < options.length; i++) {
        options[i].selected = false;
    }
}

// Handle select all presidents button
function handleSelectAllPresidents() {
    const options = presidentSelect.options;
    for (let i = 0; i < options.length; i++) {
        options[i].selected = true;
    }
}

// Handle clear presidents button
function handleClearPresidents() {
    const options = presidentSelect.options;
    for (let i = 0; i < options.length; i++) {
        options[i].selected = false;
    }
}

// Inflation adjustment helper
function adjustForInflation(data) {
    const latestCPI = getLatestCPI();
    return data.map(item => {
        const cpi = getCPI(item.year);
        if (!cpi) return item;
        return {
            ...item,
            price: (item.price * latestCPI) / cpi
        };
    });
}

// Handle apply filters button
function handleApplyFilters() {
    // Get selected items
    const selectedOptions = Array.from(itemSelect.selectedOptions);
    const selectedItems = selectedOptions.map(option => option.value);
    // Get selected presidents
    const selectedPresidentOptions = Array.from(presidentSelect.selectedOptions);
    const selectedPresidencies = selectedPresidentOptions.map(option => option.value);
    // Get year range
    const startYear = parseInt(yearStartInput.value) || null;
    const endYear = parseInt(yearEndInput.value) || null;
    // Apply filters
    const filters = {
        selectedItems: selectedItems.length > 0 ? selectedItems : null,
        selectedPresidencies: selectedPresidencies.length > 0 ? selectedPresidencies : null,
        dateRange: {
            start: startYear,
            end: endYear
        }
    };
    let filteredData = filterData(rawData.map(item => ({
        ...item,
        presidency: getPresidencyForYear(item.year, presidencies)
    })), filters);
    // Inflation adjustment
    if (adjustInflationCheckbox.checked) {
        filteredData = adjustForInflation(filteredData);
    }
    // Update chart with filtered data
    if (chart && filteredData.length > 0) {
        updateChart(chart, filteredData);
    } else {
        console.warn('No data to display after filtering');
    }
}

// Handle reset filters button
function handleResetFilters() {
    // Reset item selection
    itemSelect.selectedIndex = -1;
    // Reset president selection
    presidentSelect.selectedIndex = -1;
    // Reset year range
    const yearRange = getYearRange(rawData);
    yearStartInput.value = yearRange.min;
    yearEndInput.value = yearRange.max;
    // Reset search
    itemSearchInput.value = '';
    populateItemSelect(allItems);
    // Reset inflation adjustment
    adjustInflationCheckbox.checked = false;
    // Update chart with all data
    let data = rawData.map(item => ({
        ...item,
        presidency: getPresidencyForYear(item.year, presidencies)
    }));
    if (adjustInflationCheckbox.checked) {
        data = adjustForInflation(data);
    }
    if (chart) {
        updateChart(chart, data);
    }
}

// Start the application
init(); 