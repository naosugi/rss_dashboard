/**
 * InvestmentOutcomeDashboard.js
 * 
 * Dashboard component that analyzes the relationship between investments and outcomes,
 * answering the key question: "What results are being produced by investments in each policy area?"
 */

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Space, Typography, Spin, Table, Select, Alert } from 'antd';
import { ResponsiveBar } from '@nivo/bar';
import { CHART_COLORS, formatValue, formatPercent, calculateMean } from '../../../utils/charts/ChartUtils';
import { getPerformanceInsight } from '../../insights/InsightTemplates';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

const InvestmentOutcomeDashboard = ({ ministryData, performanceMetrics, dashboardData, filters, onFilterChange }) => {
  const [loading, setLoading] = useState(true);
  const [improvementOpportunities, setImprovementOpportunities] = useState([]);
  const [insight, setInsight] = useState('');

  // Process data when inputs change
  useEffect(() => {
    if (!dashboardData || !ministryData) {
      return;
    }

    setLoading(true);

    try {
      // Use pre-aggregated data for efficiency
      setImprovementOpportunities(dashboardData.improvementOpportunities || []);
      
      // Generate default insight for the dashboard
      const insightText = `${filters.ministry || 'すべての府省庁'}の事業では様々な予算規模と達成率のパターンが見られます。効率的な資源配分を進めるために、達成率の高い事業の成功要因が分析されています。`;
      setInsight(insightText);
      
      setLoading(false);
    } catch (error) {
      console.error("Error processing data for Investment-Outcome dashboard:", error);
      setLoading(false);
    }
  }, [dashboardData, ministryData, performanceMetrics, filters]);

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
            <Card title="投資と成果の関係マップ">
              <div style={{ height: 500 }}>
                {improvementOpportunities.length > 0 ? (
                  <ResponsiveBar
                    data={improvementOpportunities}
                    keys={['achievementRate']}
                    indexBy="field"
                    margin={{ top: 20, right: 130, bottom: 70, left: 90 }}
                    padding={0.3}
                    valueScale={{ type: 'linear' }}
                    indexScale={{ type: 'band', round: true }}
                    colors={CHART_COLORS.primary}
                    borderRadius={2}
                    axisBottom={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: -45,
                      legend: '分野',
                      legendPosition: 'middle',
                      legendOffset: 50
                    }}
                    axisLeft={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: 0,
                      legend: '目標達成率 (%)',
                      legendPosition: 'middle',
                      legendOffset: -60
                    }}
                    labelFormat={value => `${value}%`}
                    labelSkipWidth={12}
                    labelTextColor="#ffffff"
                    tooltip={({ data, value, color }) => (
                      <div
                        style={{
                          padding: 12,
                          background: 'white',
                          border: '1px solid #ccc',
                          borderRadius: 4,
                        }}
                      >
                        <strong>{data.field}</strong>
                        <div>府省庁: {data.ministry}</div>
                        <div>予算: {formatValue(data.budget)}</div>
                        <div>達成率: {formatPercent(value)}</div>
                      </div>
                    )}
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