import React from 'react';
import { Card, Row, Col, Table, Divider, Statistic } from 'antd';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Treemap } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28BFF', '#FF6E76', '#4ECDC4', '#FFA577', '#D291BC', '#9D5C63'];

const BudgetDashboard = ({ data = {} }) => {
  const { contractData, spendingMetrics } = data || {};

  // 支出先テーブルの列定義
  const recipientColumns = [
    {
      title: '支出先名',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      width: '50%',
    },
    {
      title: '種別',
      dataIndex: 'type',
      key: 'type',
      width: '20%',
    },
    {
      title: '支出額',
      dataIndex: 'formattedAmount',
      key: 'formattedAmount',
      sorter: (a, b) => a.amount - b.amount,
      defaultSortOrder: 'descend',
      render: (text) => `${text} 円`
    }
  ];

  // Treemapのカスタムコンテンツ
  const CustomizedTreemapContent = ({ root, depth, x, y, width, height, index, name, value, percentage }) => {
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
            {width > 100 ? <tspan x={x + width / 2} y={y + height / 2 + 20}>{`${percentage}%`}</tspan> : null}
          </text>
        ) : null}
      </g>
    );
  };

  if (!contractData || !spendingMetrics || !spendingMetrics.typeDistribution || !spendingMetrics.topRecipients) {
    return <div>データを読み込み中...</div>;
  }

  return (
    <div className="budget-dashboard">
      <Row gutter={16} style={{ marginBottom: '20px' }}>
        {contractData.slice(0, 4).map((item, index) => (
          <Col span={6} key={index}>
            <Card>
              <Statistic 
                title={item.method} 
                value={item.count} 
                suffix="件" 
                valueStyle={{ color: COLORS[index % COLORS.length] }}
              />
              <div style={{ marginTop: '8px', fontSize: '14px' }}>全体の {item.percentage}%</div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <Card title="契約方式別件数">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={contractData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="method" />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip formatter={(value, name) => {
                  if (name === "count") return [`${value}件`, "件数"];
                  if (name === "percentage") return [`${value}%`, "割合"];
                  return [value, name];
                }} />
                <Legend />
                <Bar yAxisId="left" dataKey="count" name="件数" fill="#8884d8" />
                <Bar yAxisId="right" dataKey="percentage" name="割合(%)" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Divider />

      <Row gutter={16}>
        <Col span={12}>
          <Card title="支出先種別分布">
            <ResponsiveContainer width="100%" height={300}>
              <Treemap
                data={spendingMetrics.typeDistribution}
                dataKey="amount"
                ratio={4 / 3}
                stroke="#fff"
                content={({ root, depth, x, y, width, height, index, name }) => {
                  // Add safety check to prevent rendering errors
                  if (!spendingMetrics?.typeDistribution || !Array.isArray(spendingMetrics.typeDistribution) || index >= spendingMetrics.typeDistribution.length) {
                    return null;
                  }
                  
                  const currentItem = spendingMetrics.typeDistribution[index] || {};
                  return (
                    <CustomizedTreemapContent
                      root={root}
                      depth={depth}
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                      index={index}
                      name={currentItem?.type || ''}
                      value={currentItem?.amount || 0}
                      percentage={currentItem?.percentage || 0}
                    />
                  );
                }}
              />
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="支出先上位20社" style={{ height: '300px', overflowY: 'auto' }}>
            <Table 
              columns={recipientColumns} 
              dataSource={spendingMetrics.topRecipients.map((item, index) => ({ ...item, key: index }))} 
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>

      <Divider />

      <Row>
        <Col span={24}>
          <Card title="支出先種別比率">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={spendingMetrics.typeDistribution}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip formatter={(value, name) => [name === "percentage" ? `${value}%` : `${new Intl.NumberFormat('ja-JP').format(value)}円`, name === "percentage" ? "割合" : "金額"]} />
                <Legend />
                <Bar dataKey="percentage" name="割合(%)" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default BudgetDashboard;