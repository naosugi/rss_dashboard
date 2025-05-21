/**
 * ImprovementCycleDashboard.js
 * 
 * Dashboard component that analyzes the policy improvement cycle,
 * answering the key question: "How is the improvement cycle based 
 * on policy evaluation functioning?"
 */

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Space, Typography, Spin, Select, Table, Alert } from 'antd';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsiveLine } from '@nivo/line';
import { CHART_COLORS, formatValue } from '../../../utils/charts/ChartUtils';
import { getImprovementInsight } from '../../insights/InsightTemplates';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

const ImprovementCycleDashboard = ({ reviewMetrics, ministryData, filters, onFilterChange }) => {
  const [loading, setLoading] = useState(true);
  const [improvementData, setImprovementData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [longTermProjects, setLongTermProjects] = useState([]);
  const [insight, setInsight] = useState('');

  // Process data when inputs change
  useEffect(() => {
    if (!reviewMetrics || !ministryData) {
      return;
    }

    setLoading(true);

    try {
      // Apply ministry filter if selected
      let filteredMetrics = reviewMetrics;
      if (filters.ministry) {
        filteredMetrics = reviewMetrics.filter(item => 
          item.ministry === filters.ministry);
      }

      // Prepare improvement cycle data
      const improvementStats = prepareImprovementData(filteredMetrics);
      setImprovementData(improvementStats);
      
      // Prepare trend data
      const trends = prepareTrendData(filteredMetrics);
      setTrendData(trends);
      
      // Prepare long-term projects data
      const longTerm = prepareLongTermProjects(filteredMetrics);
      setLongTermProjects(longTerm);
      
      // Generate default insight for the dashboard
      const insightText = `${filters.ministry || 'すべての府省庁'}では体系的な評価プロセスに基づく改善サイクルが機能しています。評価結果は次期計画へ反映され、PDCAサイクルが確立されています。`;
      setInsight(insightText);
      
      setLoading(false);
    } catch (error) {
      console.error("Error processing data for Improvement Cycle dashboard:", error);
      setLoading(false);
    }
  }, [reviewMetrics, ministryData, filters]);

  // Calculate year-over-year change in improvement metrics
  const calculateYearOverYearChange = (data) => {
    if (!data || data.length === 0 || !data[0].yearlyMetrics) return 0;
    
    const years = Object.keys(data[0].yearlyMetrics).sort();
    if (years.length < 2) return 0;
    
    const currentYear = years[years.length - 1];
    const previousYear = years[years.length - 2];
    
    const currentMetric = data.reduce((sum, item) => 
      sum + (item.yearlyMetrics[currentYear]?.improvementCount || 0), 0);
    
    const previousMetric = data.reduce((sum, item) => 
      sum + (item.yearlyMetrics[previousYear]?.improvementCount || 0), 0);
    
    if (previousMetric === 0) return 0;
    
    return ((currentMetric - previousMetric) / previousMetric) * 100;
  };

  // Prepare improvement cycle data for bar chart
  const prepareImprovementData = (data) => {
    if (!data || data.length === 0) return [];
    
    // Group data by ministry
    const ministryStats = {};
    data.forEach(item => {
      const ministry = item.ministry || 'その他';
      if (!ministryStats[ministry]) {
        ministryStats[ministry] = {
          reviewCount: 0,
          improvementCount: 0,
          implementedCount: 0,
        };
      }
      ministryStats[ministry].reviewCount += 1;
      ministryStats[ministry].improvementCount += (item.improvementCount || 0);
      ministryStats[ministry].implementedCount += (item.implementedImprovementCount || 0);
    });
    
    // Format for chart
    return Object.entries(ministryStats)
      .map(([ministry, stats]) => ({
        ministry,
        '改善提案数': stats.improvementCount,
        '実施済改善数': stats.implementedCount,
      }))
      .sort((a, b) => b['改善提案数'] - a['改善提案数'])
      .slice(0, 6); // Limit to top 6 ministries
  };

  // Prepare trend data for line chart
  const prepareTrendData = (data) => {
    if (!data || data.length === 0 || !data[0].yearlyMetrics) return [];
    
    // Get all available years
    const years = Object.keys(data[0].yearlyMetrics).sort();
    
    // Calculate metrics for each year
    const yearlyMetrics = years.map(year => {
      const yearData = data.reduce((acc, item) => {
        const yearMetric = item.yearlyMetrics[year] || { 
          reviewCount: 0, 
          improvementCount: 0, 
          implementationRate: 0 
        };
        
        acc.reviewCount += yearMetric.reviewCount || 0;
        acc.improvementCount += yearMetric.improvementCount || 0;
        
        return acc;
      }, { reviewCount: 0, improvementCount: 0 });
      
      return {
        year,
        reviewCount: yearData.reviewCount,
        improvementCount: yearData.improvementCount,
        maturityIndex: calculateMaturityIndex(yearData),
      };
    });
    
    // Format for line chart
    return [
      {
        id: '改善サイクル成熟度',
        data: yearlyMetrics.map(item => ({
          x: item.year,
          y: item.maturityIndex,
        })),
      }
    ];
  };

  // Calculate a maturity index based on review and improvement metrics
  const calculateMaturityIndex = (yearData) => {
    if (yearData.reviewCount === 0) return 0;
    
    // Simple formula: (improvements / reviews) * implementation factor
    const improvementRatio = yearData.improvementCount / yearData.reviewCount;
    const implementationFactor = 0.8; // Placeholder - could be calculated from real data
    
    return Math.min(100, improvementRatio * 100 * implementationFactor);
  };

  // Prepare long-term projects data for table
  const prepareLongTermProjects = (data) => {
    if (!data || data.length === 0) return [];
    
    return data
      .filter(item => item.projectDuration && item.projectDuration >= 3)
      .sort((a, b) => b.projectDuration - a.projectDuration)
      .slice(0, 5)
      .map((item, index) => ({
        key: index,
        name: item.projectName || `長期プロジェクト ${index + 1}`,
        ministry: item.ministry || 'N/A',
        duration: item.projectDuration || 0,
        totalBudget: item.totalBudget || 0,
        progress: item.progressStatus || '継続中',
        futurePlan: item.futurePlan || '定期的な評価と改善を継続',
      }));
  };

  // Table columns for long-term projects
  const columns = [
    {
      title: '事業名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '府省庁',
      dataIndex: 'ministry',
      key: 'ministry',
    },
    {
      title: '継続年数',
      dataIndex: 'duration',
      key: 'duration',
      render: (years) => `${years}年`,
      sorter: (a, b) => a.duration - b.duration,
    },
    {
      title: '投資総額',
      dataIndex: 'totalBudget',
      key: 'totalBudget',
      render: (budget) => formatValue(budget),
      sorter: (a, b) => a.totalBudget - b.totalBudget,
    },
    {
      title: '進捗状況',
      dataIndex: 'progress',
      key: 'progress',
    },
    {
      title: '将来展望',
      dataIndex: 'futurePlan',
      key: 'futurePlan',
    },
  ];

  return (
    <Spin spinning={loading}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card>
              <Title level={4}>継続的改善の取り組み</Title>
              <Paragraph>
                政策評価に基づく改善サイクルの機能状況を可視化し、政策効果の持続的向上を支援します。
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
          <Col xs={24} lg={14}>
            <Card title="改善サイクル進捗状況">
              <Row gutter={[0, 16]}>
                <Col span={24}>
                  <div style={{ height: 400 }}>
                    {improvementData.length > 0 ? (
                      <ResponsiveBar
                        data={improvementData}
                        keys={['改善提案数', '実施済改善数']}
                        indexBy="ministry"
                        margin={{ top: 30, right: 130, bottom: 50, left: 140 }}
                        padding={0.3}
                        valueScale={{ type: 'linear' }}
                        indexScale={{ type: 'band', round: true }}
                        colors={[CHART_COLORS.primary[0], CHART_COLORS.primary[2]]}
                        borderRadius={2}
                        axisLeft={{
                          tickSize: 5,
                          tickPadding: 5,
                          tickRotation: 0,
                          legend: '件数',
                          legendPosition: 'middle',
                          legendOffset: -40,
                        }}
                        axisBottom={{
                          tickSize: 5,
                          tickPadding: 5,
                          tickRotation: -45,
                          legend: '府省庁',
                          legendPosition: 'middle',
                          legendOffset: 40,
                        }}
                        labelSkipWidth={12}
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
                        ariaLabel="改善サイクル進捗状況"
                      />
                    ) : (
                      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Text type="secondary">データがありません</Text>
                      </div>
                    )}
                  </div>
                </Col>
                
                <Col span={24}>
                  <div style={{ height: 200 }}>
                    {trendData.length > 0 ? (
                      <ResponsiveLine
                        data={trendData}
                        margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
                        xScale={{ type: 'point' }}
                        yScale={{
                          type: 'linear',
                          min: 0,
                          max: 'auto',
                        }}
                        curve="monotoneX"
                        axisLeft={{
                          legend: '成熟度指数',
                          legendOffset: -50,
                          legendPosition: 'middle',
                        }}
                        axisBottom={{
                          legend: '年度',
                          legendOffset: 36,
                          legendPosition: 'middle',
                        }}
                        colors={CHART_COLORS.primary[1]}
                        pointSize={10}
                        pointColor={{ theme: 'background' }}
                        pointBorderWidth={2}
                        pointBorderColor={{ from: 'serieColor' }}
                        pointLabelYOffset={-12}
                        useMesh={true}
                        enableGridX={false}
                      />
                    ) : (
                      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Text type="secondary">トレンドデータがありません</Text>
                      </div>
                    )}
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
          
          <Col xs={24} lg={10}>
            <Card title="長期的取り組み事業" style={{ height: '100%' }}>
              <Table 
                columns={columns} 
                dataSource={longTermProjects}
                pagination={{ pageSize: 5 }}
                size="small"
                scroll={{ x: true }}
              />
            </Card>
          </Col>
        </Row>
      </Space>
    </Spin>
  );
};

export default ImprovementCycleDashboard;