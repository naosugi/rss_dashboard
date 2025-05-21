/**
 * ProcessAnalysisDashboard.js
 * 
 * Dashboard component that analyzes the policy implementation process,
 * answering the key question: "How is the process from policy implementation 
 * to outcome creation progressing?"
 */

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Space, Typography, Spin, Select, Alert } from 'antd';
import { ResponsiveBar } from '@nivo/bar';
import { CHART_COLORS } from '../../../utils/charts/ChartUtils';
import { getProcessInsight } from '../../insights/InsightTemplates';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

const ProcessAnalysisDashboard = ({ ministryData, performanceMetrics, dashboardData, filters, onFilterChange }) => {
  const [loading, setLoading] = useState(true);
  const [processData, setProcessData] = useState([]);
  const [fieldProcessData, setFieldProcessData] = useState([]);
  const [insight, setInsight] = useState('');

  // Process data when inputs change
  useEffect(() => {
    if (!dashboardData || !ministryData) {
      return;
    }

    setLoading(true);

    try {
      // Use pre-aggregated data for efficiency
      setProcessData(dashboardData.processData || []);
      setFieldProcessData(dashboardData.fieldProcessData || []);
      
      // Generate default insight for the dashboard
      const insightText = `${filters.ministry || 'すべての府省庁'}の事業プロセスでは、アクティビティ、アウトプット、アウトカムの各段階で進捗状況にばらつきがあります。データに基づくプロセス管理により、効果的な進捗が図られています。`;
      setInsight(insightText);
      
      setLoading(false);
    } catch (error) {
      console.error("Error processing data for Process Analysis dashboard:", error);
      setLoading(false);
    }
  }, [dashboardData, ministryData, performanceMetrics, filters]);

  // Transform field process data for Nivo bar chart
  const formatFieldDataForChart = (data) => {
    if (!data || data.length === 0) return [];
    
    return data.map(field => ({
      field: field.field,
      'アクティビティ': field.activityRate,
      'アウトプット': field.outputRate,
      'アウトカム': field.outcomeRate,
    }));
  };

  return (
    <Spin spinning={loading}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card>
              <Title level={4}>効果発現プロセス分析</Title>
              <Paragraph>
                政策実施から成果創出までのプロセスの進捗状況を可視化し、効果的な政策実施を支援します。
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
          <Col xs={24} lg={10}>
            <Card title="政策実施プロセス">
              <div style={{ height: 400 }}>
                {processData.length > 0 ? (
                  <ResponsiveBar
                    data={processData}
                    keys={['value']}
                    indexBy="stage"
                    layout="horizontal"
                    margin={{ top: 30, right: 50, bottom: 50, left: 180 }}
                    padding={0.4}
                    valueScale={{ type: 'linear' }}
                    colors={({ data }) => data.color}
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
                      legend: '達成率 (%)',
                      legendPosition: 'middle',
                      legendOffset: 40,
                      format: value => `${value}%`,
                    }}
                    labelFormat={value => `${value.toFixed(1)}%`}
                    labelSkipWidth={12}
                    labelTextColor="#ffffff"
                    role="application"
                    ariaLabel="政策実施プロセス"
                    barAriaLabel={e => `${e.indexValue}: ${e.formattedValue}`}
                  />
                ) : (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Text type="secondary">データがありません</Text>
                  </div>
                )}
              </div>
            </Card>
          </Col>
          
          <Col xs={24} lg={14}>
            <Card title="分野別プロセス特性">
              <div style={{ height: 500 }}>
                {fieldProcessData.length > 0 ? (
                  <ResponsiveBar
                    data={formatFieldDataForChart(fieldProcessData)}
                    keys={['アクティビティ', 'アウトプット', 'アウトカム']}
                    indexBy="field"
                    layout="horizontal"
                    margin={{ top: 30, right: 120, bottom: 50, left: 160 }}
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
                      legend: '達成率 (%)',
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
                    ariaLabel="分野別プロセス特性"
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
        </Row>
      </Space>
    </Spin>
  );
};

export default ProcessAnalysisDashboard;