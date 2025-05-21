import React from 'react';
import { Card, Row, Col, Table, Progress, Divider, Statistic } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28BFF'];

const PerformanceDashboard = ({ data }) => {
  const { performanceMetrics } = data;

  // パフォーマンステーブルの列定義
  const performanceColumns = [
    {
      title: '事業名',
      dataIndex: 'projectName',
      key: 'projectName',
      ellipsis: true,
      width: '40%'
    },
    {
      title: '府省庁',
      dataIndex: 'ministry',
      key: 'ministry',
    },
    {
      title: '達成率',
      dataIndex: 'achievement',
      key: 'achievement',
      render: (achievement) => (
        <Progress 
          percent={achievement} 
          size="small" 
          status={achievement >= 100 ? 'success' : 'active'}
          format={(percent) => `${percent}%`}
        />
      ),
      sorter: (a, b) => a.achievement - b.achievement
    },
    {
      title: '状態',
      key: 'status',
      render: (_, record) => (
        record.achievement >= 100 ? 
          <CheckCircleOutlined style={{ color: '#52c41a' }} /> : 
          <CloseCircleOutlined style={{ color: record.achievement >= 80 ? '#faad14' : '#f5222d' }} />
      )
    }
  ];

  if (!performanceMetrics || !performanceMetrics.typeDistribution || !performanceMetrics.projectPerformance) {
    return <div>データを読み込み中...</div>;
  }

  // 上位/下位パフォーマンスプロジェクトの抽出
  const topPerformers = performanceMetrics.projectPerformance.slice(0, 5); // 上位5件
  const lowPerformers = [...performanceMetrics.projectPerformance].sort((a, b) => a.achievement - b.achievement).slice(0, 5); // 下位5件

  // 指標種別のデータを加工
  const indicatorTypeData = performanceMetrics.typeDistribution.map(item => ({
    ...item,
    count: item.count,
    percentage: ((item.count / performanceMetrics.typeDistribution.reduce((sum, i) => sum + i.count, 0)) * 100).toFixed(1)
  }));

  return (
    <div className="performance-dashboard">
      <Row gutter={16} style={{ marginBottom: '20px' }}>
        {indicatorTypeData.map((item, index) => (
          <Col span={8} key={index}>
            <Card>
              <Statistic 
                title={`${item.type}指標`} 
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
          <Card title="指標種別分布">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={indicatorTypeData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}件`]} />
                <Legend />
                <Bar dataKey="count" name="指標数" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Divider />

      <Row gutter={16}>
        <Col span={24}>
          <Card title="目標達成度分布">
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              >
                <CartesianGrid />
                <XAxis 
                  type="number" 
                  dataKey="projectId" 
                  name="事業ID" 
                  unit="" 
                  domain={['dataMin', 'dataMax']} 
                />
                <YAxis 
                  type="number" 
                  dataKey="achievement" 
                  name="達成率" 
                  unit="%" 
                  domain={[0, 'dataMax']} 
                />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }} 
                  formatter={(value, name) => [
                    name === '達成率' ? `${value}%` : value,
                    name
                  ]}
                />
                <Legend />
                <Scatter 
                  name="達成率" 
                  data={performanceMetrics.projectPerformance.map(p => ({ 
                    projectId: p.projectId, 
                    achievement: parseFloat(p.achievement)
                  }))}
                  fill="#8884d8" 
                  shape="circle"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Divider />

      <Row gutter={16}>
        <Col span={12}>
          <Card title="高パフォーマンス事業トップ5" style={{ height: '400px' }}>
            <Table 
              columns={performanceColumns} 
              dataSource={topPerformers.map((item, index) => ({ ...item, key: `top-${index}` }))} 
              pagination={false}
              size="middle"
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="低パフォーマンス事業ワースト5" style={{ height: '400px' }}>
            <Table 
              columns={performanceColumns} 
              dataSource={lowPerformers.map((item, index) => ({ ...item, key: `low-${index}` }))} 
              pagination={false}
              size="middle"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PerformanceDashboard;