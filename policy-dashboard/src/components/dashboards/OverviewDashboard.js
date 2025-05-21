import React from 'react';
import { Card, Row, Col, Statistic, Button, Divider } from 'antd';
import { DownloadOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Treemap, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28BFF', '#FF6E76', '#4ECDC4', '#FFA577', '#D291BC', '#9D5C63'];

const OverviewDashboard = ({ data = {} }) => {
  const { summary, ministryData, projectTypeData, expenseTypeData } = data || {};

  // Treemapのカスタムコンテンツ
  const CustomizedTreemapContent = (props) => {
    const { root, depth, x, y, width, height, index } = props;
    // 表示するデータをindexから取得
    const item = (ministryData && Array.isArray(ministryData) && index < ministryData.length) 
      ? ministryData[index] 
      : {};
    const name = item?.ministry || '';
    const count = item?.count || 0;
    const percentage = item?.percentage || 0;
    
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: COLORS[index % COLORS.length],
            stroke: '#fff',
            strokeWidth: 2 / (depth + 1e-10),
            strokeOpacity: 1 / (depth + 1e-10),
          }}
        />
        {width > 50 && height > 30 ? (
          <text x={x + width / 2} y={y + height / 2} textAnchor="middle" fill="#fff" fontSize={14}>
            {name}
            {width > 100 ? <tspan x={x + width / 2} y={y + height / 2 + 20}>{`${count}件 (${percentage}%)`}</tspan> : null}
          </text>
        ) : null}
      </g>
    );
  };

  if (!summary || !ministryData || !projectTypeData || !expenseTypeData) {
    return <div>データを読み込み中...</div>;
  }

  return (
    <div className="overview-dashboard">
      {/* KPI概要カード */}
      <Row gutter={16} className="kpi-row">
        <Col span={6}>
          <Card>
            <Statistic title="総事業数" value={summary.totalProjects} suffix="件" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="新規事業" value={summary.newProjects} suffix="件" valueStyle={{ color: '#3f8600' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="終了事業" value={summary.endingProjects} suffix="件" valueStyle={{ color: '#cf1322' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="評価改善要事業" value={summary.improvementProjects} suffix="件" />
          </Card>
        </Col>
      </Row>

      <Divider />

      {/* 事業区分分布 */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={24}>
          <Card title="事業区分分布" extra={<Button size="small" icon={<InfoCircleOutlined />}>詳細</Button>}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={projectTypeData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip formatter={(value, name) => {
                  if (name === "count") return [`${value}件`, "事業数"];
                  if (name === "percentage") return [`${value}%`, "割合"];
                  return [value, name];
                }} />
                <Legend />
                <Bar yAxisId="left" dataKey="count" name="事業数" fill="#8884d8" />
                <Bar yAxisId="right" dataKey="percentage" name="割合(%)" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* 府省庁別事業マップ */}
      <Row gutter={16}>
        <Col span={24}>
          <Card title="府省庁別事業数" extra={<Button size="small" icon={<DownloadOutlined />}>エクスポート</Button>}>
            <ResponsiveContainer width="100%" height={400}>
              <Treemap
                data={ministryData}
                dataKey="count"
                ratio={4 / 3}
                stroke="#fff"
                content={CustomizedTreemapContent}
              />
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Divider />

      {/* 主要経費分布 */}
      <Row>
        <Col span={24}>
          <Card title="主要経費分布（上位10件）" extra={<Button size="small" icon={<InfoCircleOutlined />}>詳細</Button>}>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                layout="vertical"
                data={expenseTypeData.slice(0, 10)}
                margin={{ top: 20, right: 30, left: 150, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="expense" type="category" width={140} />
                <Tooltip formatter={(value, name) => [name === "count" ? `${value}件` : `${value}%`, name === "count" ? "事業数" : "割合"]} />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" name="事業数" />
                <Bar dataKey="percentage" fill="#82ca9d" name="割合(%)" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default OverviewDashboard;