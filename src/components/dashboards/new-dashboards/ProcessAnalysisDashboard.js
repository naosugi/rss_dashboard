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
import { CHART_COLORS, formatPercent, prepareMultiStageData } from '../../../utils/charts/ChartUtils';
import { getProcessInsight } from '../../insights/InsightTemplates';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

const ProcessAnalysisDashboard = ({ performanceMetrics, ministryData, filters, onFilterChange }) => {
  const [loading, setLoading] = useState(true);
  const [processData, setProcessData] = useState([]);
  const [fieldProcessData, setFieldProcessData] = useState([]);
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

      // Prepare process data - overall stages
      const processStages = prepareProcessData(filteredMetrics);
      setProcessData(processStages);
      
      // Prepare field-specific process data
      const fieldData = prepareFieldProcessData(filteredMetrics);
      setFieldProcessData(fieldData);
      
      // Generate insight based on the data
      const insightText = getProcessInsight(filteredMetrics, filters);
      setInsight(insightText);
      
      setLoading(false);
    } catch (error) {
      console.error("Error processing data for Process Analysis dashboard:", error);
      setLoading(false);
    }
  }, [performanceMetrics, ministryData, filters]);

  // Prepare process data for bar chart
  const prepareProcessData = (data) => {
    if (!data || data.length === 0) return [];
    
    // Calculate averages for each stage
    const activityAvg = data.reduce((sum, item) => sum + (item.activityRate || 0), 0) / data.length;
    const outputAvg = data.reduce((sum, item) => sum + (item.outputRate || 0), 0) / data.length;
    const outcomeAvg = data.reduce((sum, item) => sum + (item.outcomeRate || 0), 0) / data.length;
    
    // Format data for bar chart
    return [
      {
        stage: 'アクティビティ実施率',
        value: activityAvg,
        color: CHART_COLORS.primary[0],
      },
      {
        stage: 'アウトプット達成状況',
        value: outputAvg,
        color: CHART_COLORS.primary[1],
      },
      {
        stage: 'アウトカム進捗状況',
        value: outcomeAvg,
        color: CHART_COLORS.primary[2],
      }
    ];
  };

  // Prepare field-specific process data
  const prepareFieldProcessData = (data) => {
    if (!data || data.length === 0) return [];
    
    // Group data by field
    const fields = {};
    data.forEach(item => {
      const field = item.field || 'その他';
      if (!fields[field]) {
        fields[field] = {
          count: 0,
          activitySum: 0,
          outputSum: 0,
          outcomeSum: 0,
        };
      }
      fields[field].count += 1;
      fields[field].activitySum += (item.activityRate || 0);
      fields[field].outputSum += (item.outputRate || 0);
      fields[field].outcomeSum += (item.outcomeRate || 0);
    });
    
    // Calculate averages and format for bar chart
    return Object.entries(fields)
      .map(([field, stats]) => ({
        field,
        activityRate: stats.activitySum / stats.count,
        outputRate: stats.outputSum / stats.count,
        outcomeRate: stats.outcomeSum / stats.count,
        count: stats.count,
      }))
      .filter(item => item.count >= 2) // Only include fields with sufficient data
      .sort((a, b) => b.count - a.count) // Sort by count (descending)
      .slice(0, 8); // Limit to top 8 fields
  };

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