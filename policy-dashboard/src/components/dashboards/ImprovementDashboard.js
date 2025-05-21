import React from 'react';
import { Card, Row, Col, Table, Tag, Divider, Statistic } from 'antd';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28BFF'];

const ImprovementDashboard = ({ data }) => {
  const { reviewMetrics } = data;

  // 評価結果タグのカラー設定
  const getReviewTypeColor = (type) => {
    switch (type) {
      case '現状通り':
        return 'green';
      case '事業内容の一部改善':
        return 'orange';
      case '事業全体の抜本的な改善':
        return 'red';
      case '終了予定':
        return 'blue';
      case '廃止':
        return 'black';
      default:
        return 'default';
    }
  };

  // 改善事例テーブルの列定義
  const improvementColumns = [
    {
      title: '事業名',
      dataIndex: 'projectName',
      key: 'projectName',
      ellipsis: true,
      width: '25%',
    },
    {
      title: '府省庁',
      dataIndex: 'ministry',
      key: 'ministry',
      width: '15%',
    },
    {
      title: '評価結果',
      dataIndex: 'reviewType',
      key: 'reviewType',
      width: '20%',
      render: (text) => (
        <Tag color={getReviewTypeColor(text)}>{text}</Tag>
      )
    },
    {
      title: '改善内容',
      dataIndex: 'improvement',
      key: 'improvement',
      ellipsis: true,
    }
  ];

  if (!reviewMetrics || !reviewMetrics.reviewDistribution || !reviewMetrics.ministryReviewArray || !reviewMetrics.improvementCases) {
    return <div>データを読み込み中...</div>;
  }

  return (
    <div className="improvement-dashboard">
      <Row gutter={16} style={{ marginBottom: '20px' }}>
        {reviewMetrics.reviewDistribution.map((item, index) => (
          <Col span={Math.floor(24 / reviewMetrics.reviewDistribution.length)} key={index}>
            <Card>
              <Statistic 
                title={item.review} 
                value={item.count} 
                suffix="件" 
                valueStyle={{ color: getReviewTypeColor(item.review) }}
              />
              <div style={{ marginTop: '8px', fontSize: '14px' }}>全体の {item.percentage}%</div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <Card title="レビュー結果分布">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={reviewMetrics.reviewDistribution}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="review" />
                <YAxis />
                <Tooltip formatter={(value, name) => [`${value}件`, name === "count" ? "件数" : ""]} />
                <Legend />
                <Bar dataKey="count" name="件数" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Divider />

      <Row gutter={16}>
        <Col span={24}>
          <Card title="府省庁別改善率">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={reviewMetrics.ministryReviewArray.slice(0, 10)} // 上位10府省庁のみ表示
                layout="vertical"
                margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis 
                  dataKey="ministry" 
                  type="category" 
                  width={100} 
                />
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend />
                <Bar dataKey="improvementRate" fill="#8884d8" name="改善率(%)" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Divider />

      <Row>
        <Col span={24}>
          <Card title="改善事例ハイライト">
            <Table 
              columns={improvementColumns} 
              dataSource={reviewMetrics.improvementCases.map((item, index) => ({ ...item, key: index }))} 
              pagination={false}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ImprovementDashboard;