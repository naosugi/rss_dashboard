/**
 * Utility functions for chart data and formatting
 */

import { format } from 'd3-format';

// Common formatting functions
export const formatValue = (value) => {
  return value >= 1000000
    ? format('.2s')(value).replace('M', '百万円').replace('G', '十億円')
    : format(',')(value) + '円';
};

export const formatPercent = (value) => {
  return format('.1f')(value) + '%';
};

// Color schemes for consistent visualization
export const CHART_COLORS = {
  // Main color palette (blue to teal gradient)
  primary: ['#2C699A', '#0E86D4', '#5ADBFF', '#29C7AC', '#54C6EB', '#81D3EB', '#A8E6CF'],
  
  // Accent colors for highlights
  accent: ['#FF9671', '#FFC75F', '#F9F871'],
  
  // Neutral colors for background elements
  neutral: ['#F0F0F0', '#D9D9D9', '#BFBFBF', '#8C8C8C', '#595959'],
  
  // Status colors
  status: {
    positive: '#29C7AC',
    neutral: '#5ADBFF',
    negative: '#FF9671',
    alert: '#FF6F91'
  }
};

// Common chart dimensions and configurations
export const CHART_CONFIG = {
  margin: { top: 20, right: 30, bottom: 60, left: 60 },
  barHeight: 30,
  barSpacing: 10,
  labelOffset: 10,
  animationDuration: 800,
  responsive: true
};

/**
 * Calculates relative change percentage between two values
 * @param {number} current - Current value
 * @param {number} previous - Previous value
 * @returns {number} Percentage change
 */
export const calculateChange = (current, previous) => {
  if (!previous || previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

/**
 * Maps a value to a color based on thresholds
 * @param {number} value - The value to map
 * @param {Object} thresholds - Threshold configuration object
 * @returns {string} Color code
 */
export const getColorByValue = (value, thresholds = {
  positive: 75,
  neutral: 50,
  negative: 0
}) => {
  if (value >= thresholds.positive) return CHART_COLORS.status.positive;
  if (value >= thresholds.neutral) return CHART_COLORS.status.neutral;
  if (value >= thresholds.negative) return CHART_COLORS.status.negative;
  return CHART_COLORS.status.alert;
};

/**
 * Prepares bar chart data for horizontal bars
 * @param {Array} data - Raw data array
 * @param {string} labelKey - Key for the label
 * @param {string} valueKey - Key for the value
 * @param {number} limit - Max number of items to include
 * @returns {Array} Formatted data for bar chart
 */
export const prepareBarChartData = (data, labelKey, valueKey, limit = 10) => {
  if (!data || !Array.isArray(data) || data.length === 0) return [];
  
  return data
    .sort((a, b) => b[valueKey] - a[valueKey])
    .slice(0, limit)
    .map((item) => ({
      label: item[labelKey],
      value: item[valueKey]
    }));
};

/**
 * Prepares treemap data for visualization
 * @param {Array} data - Raw data array
 * @param {string} idKey - Key for the id/name
 * @param {string} valueKey - Key for the value
 * @param {string} parentKey - Optional key for parent (hierarchical data)
 * @returns {Array} Formatted data for treemap
 */
export const prepareTreemapData = (data, idKey, valueKey, parentKey = null) => {
  if (!data || !Array.isArray(data) || data.length === 0) return [];
  
  const root = {
    id: 'root',
    children: []
  };
  
  if (parentKey) {
    // Group by parent first
    const grouped = data.reduce((acc, item) => {
      const parentValue = item[parentKey] || 'その他';
      if (!acc[parentValue]) {
        acc[parentValue] = {
          id: parentValue,
          children: []
        };
      }
      
      acc[parentValue].children.push({
        id: item[idKey],
        value: item[valueKey]
      });
      
      return acc;
    }, {});
    
    root.children = Object.values(grouped);
  } else {
    // Flat structure
    root.children = data.map(item => ({
      id: item[idKey],
      value: item[valueKey]
    }));
  }
  
  return [root];
};

/**
 * Prepares scatter plot data
 * @param {Array} data - Raw data array
 * @param {string} xKey - Key for X axis value
 * @param {string} yKey - Key for Y axis value
 * @param {string} idKey - Key for data point ID
 * @param {string} sizeKey - Optional key for point size
 * @param {string} groupKey - Optional key for grouping/coloring
 * @returns {Array} Formatted data for scatter plot
 */
export const prepareScatterData = (data, xKey, yKey, idKey, sizeKey = null, groupKey = null) => {
  if (!data || !Array.isArray(data) || data.length === 0) return [];
  
  return data.map(item => {
    const point = {
      id: item[idKey],
      x: item[xKey],
      y: item[yKey]
    };
    
    if (sizeKey) point.size = item[sizeKey];
    if (groupKey) point.group = item[groupKey];
    
    return point;
  });
};

/**
 * Calculate mean/average value from an array of objects
 * @param {Array} data - Array of objects
 * @param {string} key - Key to average
 * @returns {number} Average value
 */
export const calculateMean = (data, key) => {
  if (!data || !Array.isArray(data) || data.length === 0) return 0;
  
  const sum = data.reduce((acc, item) => acc + (Number(item[key]) || 0), 0);
  return sum / data.length;
};

/**
 * Prepare data for multi-stage bar chart (showing progress through stages)
 * @param {Array} data - Raw data
 * @param {Array} stages - Array of stage keys in order
 * @param {string} groupKey - Key to group by
 * @returns {Array} Formatted data for multi-stage visualization
 */
export const prepareMultiStageData = (data, stages, groupKey) => {
  if (!data || !Array.isArray(data) || data.length === 0) return [];
  
  // Group the data
  const groupedData = data.reduce((acc, item) => {
    const group = item[groupKey];
    if (!acc[group]) {
      acc[group] = {};
      stages.forEach(stage => {
        acc[group][stage] = 0;
      });
    }
    
    // Count or sum values for each stage in this group
    stages.forEach(stage => {
      if (item[stage] !== undefined) {
        acc[group][stage] += Number(item[stage]) || 0;
      }
    });
    
    return acc;
  }, {});
  
  // Convert to array format for charting
  return Object.entries(groupedData).map(([group, values]) => {
    return {
      group,
      ...values
    };
  });
};