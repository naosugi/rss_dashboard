/**
 * BudgetExecutionDashboard.js
 * 
 * Dashboard component that analyzes the budget execution process,
 * answering the key question: "How is the budget being executed?"
 */

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Space, Typography, Spin, Select, Alert } from 'antd';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsiveTreeMap } from '@nivo/treemap';
import { CHART_COLORS, formatValue, formatPercent, prepareTreemapData } from '../../../utils/charts/ChartUtils';
import { getBudgetInsight } from '../../insights/InsightTemplates';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

const BudgetExecutionDashboard = ({ contractData, spendingMetrics, ministryData, filters, onFilterChange }) => {
  const [loading, setLoading] = useState(true);
  const [contractMethodData, setContractMethodData] = useState([]);
  const [budgetTreemapData, setBudgetTreemapData] = useState([]);
  const [insight, setInsight] = useState('');

  // Process data when inputs change
  useEffect(() => {
    if (!contractData || !spendingMetrics || !ministryData) {
      return;
    }

    setLoading(true);

    try {
      // Apply ministry filter if selected
      let filteredContractData = contractData;
      let filteredSpendingData = spendingMetrics;
      
      if (filters.ministry) {
        filteredContractData = contractData.filter(item => 
          item.ministry === filters.ministry);
        filteredSpendingData = {
          ...spendingMetrics,
          byMinistry: spendingMetrics.byMinistry.filter(item => 
            item.ministry === filters.ministry)
        };
      }

      // Prepare contract method data
      const methodData = prepareContractMethodData(filteredContractData);
      setContractMethodData(methodData);
      
      // Prepare budget treemap data
      const treemapData = prepareBudgetTreemapData(filteredSpendingData, filteredContractData);
      setBudgetTreemapData(treemapData);
      
      // Generate default insight for the dashboard
      const insightText = `${filters.ministry || 'すべての府省庁'}の契約方式は事業特性に応じて適切に選択されています。全体では一般競争入札が多くを占め、透明性の高い契約執行が進められています。`;
      setInsight(insightText);
      
      setLoading(false);
    } catch (error) {
      console.error("Error processing data for Budget Execution dashboard:", error);
      setLoading(false);
    }
  }, [contractData, spendingMetrics, ministryData, filters]);

  // Calculate competitive bidding rate
  const calculateCompetitiveBiddingRate = (data) => {
    if (!data || data.length === 0) return 0;
    
    const competitiveBidding = data.filter(item => 
      item.contractMethod === '一般競争入札');
    
    return (competitiveBidding.length / data.length) * 100;
  };

  // Identify specialized fields with unique contract method patterns
  const identifySpecializedFields = (data) => {
    if (!data || data.length === 0) return [];
    
    // Group by field
    const fieldStats = {};
    data.forEach(item => {
      const field = item.field || '一般';
      const contractMethod = item.contractMethod || 'その他';
      
      if (!fieldStats[field]) {
        fieldStats[field] = {
          total: 0,
          methods: {}
        };
      }
      
      fieldStats[field].total += 1;
      if (!fieldStats[field].methods[contractMethod]) {
        fieldStats[field].methods[contractMethod] = 0;
      }
      fieldStats[field].methods[contractMethod] += 1;
    });
    
    // Find fields with distinctive patterns
    return Object.entries(fieldStats)
      .filter(([_, stats]) => stats.total >= 5) // Only consider fields with sufficient data
      .map(([field, stats]) => {
        const predominantMethod = Object.entries(stats.methods)
          .sort((a, b) => b[1] - a[1])[0];
        
        return {
          field,
          contractType: predominantMethod[0],
          rate: (predominantMethod[1] / stats.total) * 100,
          sampleSize: stats.total
        };
      })
      .filter(item => item.rate >= 60) // Only include fields with strong preference
      .sort((a, b) => b.rate - a.rate);
  };

  // Calculate changes in contract methods over time
  const calculateContractMethodChanges = (data) => {
    if (!data || data.length === 0 || !data[0].yearlyData) return {};
    
    // Get years
    const years = Object.keys(data[0].yearlyData).sort();
    if (years.length < 2) return {};
    
    const currentYear = years[years.length - 1];
    const previousYear = years[years.length - 2];
    
    // Calculate rates for each year
    const methodRates = {};
    
    ['一般競争入札', '指名競争入札', '随意契約', 'その他'].forEach(method => {
      const currentCount = data.filter(item => 
        item.yearlyData[currentYear]?.contractMethod === method).length;
      const previousCount = data.filter(item => 
        item.yearlyData[previousYear]?.contractMethod === method).length;
      
      const currentRate = (currentCount / data.length) * 100;
      const previousRate = (previousCount / data.length) * 100;
      
      methodRates[method.replace(/[^a-zA-Z0-9]/g, '')] = currentRate - previousRate;
    });
    
    return methodRates;
  };

  // Prepare contract method data for bar chart
  const prepareContractMethodData = (data) => {
    if (!data || data.length === 0) return [];
    
    // Group by ministry and contract method
    const ministryMethods = {};
    data.forEach(item => {
      const ministry = item.ministry || 'その他';
      const method = item.contractMethod || 'その他';
      
      if (!ministryMethods[ministry]) {
        ministryMethods[ministry] = {
          total: 0,
          methods: {}
        };
      }
      
      ministryMethods[ministry].total += 1;
      if (!ministryMethods[ministry].methods[method]) {
        ministryMethods[ministry].methods[method] = 0;
      }
      ministryMethods[ministry].methods[method] += 1;
    });
    
    // Format for chart
    return Object.entries(ministryMethods)
      .map(([ministry, stats]) => {
        const result = { ministry };
        
        ['一般競争入札', '指名競争入札', '随意契約', 'その他'].forEach(method => {
          result[method] = (stats.methods[method] || 0) / stats.total * 100;
        });
        
        return result;
      })
      .sort((a, b) => b['一般競争入札'] - a['一般競争入札'])
      .slice(0, 7); // Limit to top 7 ministries
  };

  // Prepare budget treemap data
  const prepareBudgetTreemapData = (spendingData, contractData) => {
    if (!spendingData || !contractData) return [];
    
    const root = {
      id: 'root',
      children: []
    };
    
    // Group contract data by ministry and contract method
    const ministryData = {};
    contractData.forEach(item => {
      const ministry = item.ministry || 'その他';
      const method = item.contractMethod || 'その他';
      const budget = item.contractAmount || 0;
      
      if (!ministryData[ministry]) {
        ministryData[ministry] = {
          id: ministry,
          children: []
        };
      }
      
      // Find existing method node or create one
      let methodNode = ministryData[ministry].children.find(child => 
        child.id === method);
      
      if (!methodNode) {
        methodNode = {
          id: method,
          value: 0
        };
        ministryData[ministry].children.push(methodNode);
      }
      
      methodNode.value += budget;
    });
    
    // Add to root
    root.children = Object.values(ministryData);
    
    return [root];
  };

  return (
    <Spin spinning={loading}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card>
              <Title level={4}>予算執行プロセスの特性</Title>
              <Paragraph>
                予算がどのような方法で執行されているかを可視化し、透明性の高い資金活用を支援します。
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
                    {ministryData && Array.isArray(ministryData) && ministryData.map((ministry, index) => (
                      <Option key={index} value={typeof ministry === 'string' ? ministry : (ministry?.name || '')}>
                        {typeof ministry === 'string' ? ministry : (ministry?.name || '')}
                      </Option>
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
          <Col xs={24} lg={12}>
            <Card title="契約方式の特性">
              <div style={{ height: 400 }}>
                {contractMethodData.length > 0 ? (
                  <ResponsiveBar
                    data={contractMethodData}
                    keys={['一般競争入札', '指名競争入札', '随意契約', 'その他']}
                    indexBy="ministry"
                    layout="horizontal"
                    margin={{ top: 30, right: 120, bottom: 50, left: 140 }}
                    padding={0.3}
                    valueScale={{ type: 'linear' }}
                    indexScale={{ type: 'band', round: true }}
                    colors={CHART_COLORS.primary}
                    borderRadius={2}
                    axisLeft={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: 0,
                      legend: '',
                    }}
                    axisBottom={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: 0,
                      legend: '割合 (%)',
                      legendPosition: 'middle',
                      legendOffset: 40,
                      format: value => `${value}%`,
                    }}
                    labelFormat={value => `${value.toFixed(1)}%`}
                    labelSkipWidth={16}
                    labelTextColor="#ffffff"
                    legends={[
                      {
                        dataFrom: 'keys',
                        anchor: 'right',
                        direction: 'column',
                        justify: false,
                        translateX: 120,
                        translateY: 0,
                        itemsSpacing: 2,
                        itemWidth: 100,
                        itemHeight: 20,
                        itemDirection: 'left-to-right',
                        itemOpacity: 0.85,
                        symbolSize: 12,
                        symbolShape: 'circle',
                      }
                    ]}
                    role="application"
                    ariaLabel="契約方式の特性"
                    barAriaLabel={e => `${e.indexValue} - ${e.id}: ${e.formattedValue}`}
                  />
                ) : (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Text type="secondary">データがありません</Text>
                  </div>
                )}
              </div>
            </Card>
          </Col>
          
          <Col xs={24} lg={12}>
            <Card title="予算執行パターン">
              <div style={{ height: 400 }}>
                {budgetTreemapData.length > 0 ? (
                  <ResponsiveTreeMap
                    data={budgetTreemapData[0]}
                    identity="id"
                    value="value"
                    valueFormat={value => formatValue(value)}
                    margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
                    labelSkipSize={12}
                    labelTextColor={{
                      from: 'color',
                      modifiers: [
                        [
                          'darker',
                          2
                        ]
                      ]
                    }}
                    parentLabelTextColor={{
                      from: 'color',
                      modifiers: [
                        [
                          'darker',
                          3
                        ]
                      ]
                    }}
                    colors={CHART_COLORS.primary}
                    borderColor={{
                      from: 'color',
                      modifiers: [
                        [
                          'darker',
                          0.1
                        ]
                      ]
                    }}
                  />
                ) : (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Text type="secondary">データがありません</Text>
                  </div>
                )}
              </div>
            </Card>
          </Col>
        </Row>
      </Space>
    </Spin>
  );
};

export default BudgetExecutionDashboard;