
export function filterData(data, filters) {
  if (!data || !Array.isArray(data)) {
    console.error('Invalid data provided to filterData');
    return [];
  }

  // If no filters are applied, return all data
  if (!filters || 
      (!filters.selectedItems || filters.selectedItems.length === 0) && 
      (!filters.dateRange || (!filters.dateRange.start && !filters.dateRange.end)) &&
      (!filters.selectedPresidencies || filters.selectedPresidencies.length === 0)) {
    return data;
  }

  return data.filter(item => {
    // Filter by selected items
    if (filters.selectedItems && filters.selectedItems.length > 0) {
      if (!filters.selectedItems.includes(item.item)) {
        return false;
      }
    }

    // Filter by date range
    if (filters.dateRange) {
      if (filters.dateRange.start && item.year < filters.dateRange.start) {
        return false;
      }
      if (filters.dateRange.end && item.year > filters.dateRange.end) {
        return false;
      }
    }

    // Filter by president(s)
    if (filters.selectedPresidencies && filters.selectedPresidencies.length > 0) {
      if (!filters.selectedPresidencies.includes(item.presidency)) {
        return false;
      }
    }

    return true;
  });
}

export function getUniqueItems(data) {
  if (!data || !Array.isArray(data)) {
    return [];
  }
  
  return [...new Set(data.map(item => item.item))].sort();
}

export function getUniquePresidencies(data) {
  if (!data || !Array.isArray(data)) {
    return [];
  }
  return [...new Set(data.map(item => item.presidency))].sort();
}

export function getYearRange(data) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return { min: 0, max: 0 };
  }
  
  const years = data.map(item => item.year);
  return {
    min: Math.min(...years),
    max: Math.max(...years)
  };
}

export function searchItems(items, searchTerm) {
  if (!searchTerm || searchTerm.trim() === '') {
    return items;
  }
  
  const term = searchTerm.toLowerCase().trim();
  return items.filter(item => 
    item.toLowerCase().includes(term)
  );
} 