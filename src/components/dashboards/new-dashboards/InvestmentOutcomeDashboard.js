/**
 * InvestmentOutcomeDashboard.js
 * 
 * Dashboard component that analyzes the relationship between investments and outcomes,
 * answering the key question: "What results are being produced by investments in each policy area?"
 */

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Space, Typography, Spin, Table, Select, Alert } from 'antd';
import { ResponsiveScatterPlot } from '@nivo/scatterplot';
import { CHART_COLORS, formatValue, formatPercent, calculateMean } from '../../../utils/charts/ChartUtils';
import { getPerformanceInsight } from '../../insights/InsightTemplates';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

const InvestmentOutcomeDashboard = ({ ministryData, performanceMetrics, filters, onFilterChange }) => {
  const [loading, setLoading] = useState(true);
  const [scatterData, setScatterData] = useState([]);
  const [improvementOpportunities, setImprovementOpportunities] = useState([]);
  const [averages, setAverages] = useState({ budget: 0, performance: 0 });
  const [insight, setInsight] = useState('');

  // Process data when inputs change
  useEffect(() => {
    if (!performanceMetrics || !ministryData) {
      return;
    }

    setLoading(true);

    try {
      // Apply ministry filter if selected
      let filteredMetrics = performanceMetrics;
      if (filters.ministry) {
        filteredMetrics = performanceMetrics.filter(item => 
          item.ministry === filters.ministry);
      }

      // Prepare scatter plot data
      const formatted = prepareScatterData(filteredMetrics);
      setScatterData(formatted.scatterData);
      
      // Calculate averages for reference lines
      setAverages({
        budget: calculateMean(filteredMetrics, 'budgetSize'),
        performance: calculateMean(filteredMetrics, 'achievementRate')
      });
      
      // Prepare improvement opportunities table data
      const opportunities = prepareImprovementOpportunities(filteredMetrics);
      setImprovementOpportunities(opportunities);
      
      // Generate insight based on the data
      const insightText = getPerformanceInsight(filteredMetrics, filters);
      setInsight(insightText);
      
      setLoading(false);
    } catch (error) {
      console.error("Error processing data for Investment-Outcome dashboard:", error);
      setLoading(false);
    }
  }, [performanceMetrics, ministryData, filters]);

  // Prepare scatter plot data
  const prepareScatterData = (data) => {
    if (!data || data.length === 0) return { scatterData: [] };
    
    // Group by ministry to create series
    const groupedByMinistry = data.reduce((acc, item) => {
      const ministry = item.ministry || 'Unknown';
      if (!acc[ministry]) {
        acc[ministry] = [];
      }
      
      acc[ministry].push({
        x: item.budgetSize,
        y: item.achievementRate,
        id: item.projectId || `project-${Math.random().toString(36).substr(2, 9)}`,
        name: item.projectName || 'Unnamed Project',
        ministry: ministry,
        field: item.field || 'General',
        size: item.projectCount || 1,
      });
      
      return acc;
    }, {});
    
    // Convert to the format needed for Nivo scatter plot
    const scatterData = Object.entries(groupedByMinistry).map(([ministry, data]) => ({
      id: ministry,
      data: data
    }));
    
    return { scatterData };
  };

  // Prepare improvement opportunities table data
  const prepareImprovementOpportunities = (data) => {
    if (!data || data.length === 0) return [];
    
    // Sort by budget size (descending)
    const sorted = [...data].sort((a, b) => b.budgetSize - a.budgetSize);
    
    // Map to table format
    return sorted.slice(0, 5).map((item, index) => ({
      key: index,
      field: item.field || 'N/A',
      ministry: item.ministry || 'N/A',
      budget: item.budgetSize,
      achievementRate: item.achievementRate,
      nextSteps: item.improvementPlan || '計画的な進捗管理と定期的な評価の実施'
    }));
  };

  // Table columns for improvement opportunities
  const columns = [
    {
      title: '分野',
      dataIndex: 'field',
      key: 'field',
    },
    {
      title: '府省庁',
      dataIndex: 'ministry',
      key: 'ministry',
    },
    {
      title: '予算額',
      dataIndex: 'budget',
      key: 'budget',
      render: (budget) => formatValue(budget),
      sorter: (a, b) => a.budget - b.budget,
    },
    {
      title: '目標達成率',
      dataIndex: 'achievementRate',
      key: 'achievementRate',
      render: (rate) => formatPercent(rate),
      sorter: (a, b) => a.achievementRate - b.achievementRate,
    },
    {
      title: '今後の取り組み',
      dataIndex: 'nextSteps',
      key: 'nextSteps',
    },
  ];

  return (
    <Spin spinning={loading}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card>
              <Title level={4}>投資と成果の関係性分析</Title>
              <Paragraph>
                各政策分野への投資とその成果の関係性を可視化し、効率的な資源配分の検討に役立てます。
              </Paragraph>
              
              {/* Filter controls */}
              <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col>
                  <Select
                    placeholder="府省庁を選択"
                    style={{ width: 200 }}
                    value={filters.ministry}
                    onChange={(value) => onFilterChange('ministry', value)}
                    allowClear
                  >
                    {ministryData && ministryData.map((ministry, index) => (
                      <Option key={index} value={ministry.name}>{ministry.name}</Option>
                    ))}
                  </Select>
                </Col>
              </Row>

              {/* Insight box */}
              {insight && (
                <Alert
                  message="データからの洞察"
                  description={insight}
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
              )}
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={14}>
            <Card title="投資と成果の関係マップ">
              <div style={{ height: 500 }}>
                {scatterData.length > 0 ? (
                  <ResponsiveScatterPlot
                    data={scatterData}
                    margin={{ top: 20, right: 140, bottom: 70, left: 90 }}
                    xScale={{ type: 'linear', min: 0, max: 'auto' }}
                    yScale={{ type: 'linear', min: 0, max: 100 }}
                    colors={CHART_COLORS.primary}
                    nodeSize={(d) => 8 + (d.data.size * 2)}
                    axisBottom={{
                      legend: '予算規模',
                      legendOffset: 50,
                      legendPosition: 'middle',
                      format: (value) => value >= 1000000000 ? `${(value / 1000000000).toFixed(1)}十億円` : value >= 1000000 ? `${(value / 1000000).toFixed(1)}百万円` : value,
                    }}
                    axisLeft={{
                      legend: '目標達成率 (%)',
                      legendOffset: -60,
                      legendPosition: 'middle',
                    }}
                    legends={[
                      {
                        anchor: 'right',
                        direction: 'column',
                        translateX: 130,
                        translateY: 0,
                        itemWidth: 100,
                        itemHeight: 12,
                        itemsSpacing: 5,
                        symbolSize: 12,
                        symbolShape: 'circle',
                      }
                    ]}
                    tooltip={({ node }) => (
                      <div
                        style={{
                          padding: 12,
                          background: 'white',
                          border: '1px solid #ccc',
                          borderRadius: 4,
                        }}
                      >
                        <strong>{node.data.name}</strong>
                        <div>府省庁: {node.data.ministry}</div>
                        <div>分野: {node.data.field}</div>
                        <div>予算: {formatValue(node.data.x)}</div>
                        <div>達成率: {formatPercent(node.data.y)}</div>
                      </div>
                    )}
                    annotations={[
                      // Horizontal line for average achievement rate
                      {
                        type: 'line',
                        match: { key: 'y' },
                        value: averages.performance,
                        lineStyle: {
                          stroke: '#888',
                          strokeWidth: 1,
                          strokeDasharray: '6 6',
                        },
                        textStyle: {
                          fill: '#333',
                        },
                        text: `平均達成率: ${formatPercent(averages.performance)}`,
                      },
                      // Vertical line for average budget
                      {
                        type: 'line',
                        match: { key: 'x' },
                        value: averages.budget,
                        lineStyle: {
                          stroke: '#888',
                          strokeWidth: 1,
                          strokeDasharray: '6 6',
                        },
                        textStyle: {
                          fill: '#333',
                        },
                        text: `平均予算: ${formatValue(averages.budget)}`,
                      },
                    ]}
                  />
                ) : (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Text type="secondary">データがありません</Text>
                  </div>
                )}
              </div>
            </Card>
          </Col>
          
          <Col xs={24} lg={10}>
            <Card title="改善機会分析" style={{ height: '100%' }}>
              <Table 
                columns={columns} 
                dataSource={improvementOpportunities}
                pagination={{ pageSize: 5 }}
                size="small"
              />
            </Card>
          </Col>
        </Row>
      </Space>
    </Spin>
  );
};

export default InvestmentOutcomeDashboard;