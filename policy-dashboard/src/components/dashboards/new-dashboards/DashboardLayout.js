/**
 * DashboardLayout.js
 * 
 * Main layout component for the improved dashboard that integrates
 * all individual dashboard components and manages shared state.
 */

import React, { useState, useEffect } from 'react';
import { Layout, Menu, Typography, Spin, Select, Tabs, Button } from 'antd';
import { AreaChartOutlined, BarChartOutlined, LineChartOutlined, PieChartOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import InvestmentOutcomeDashboard from './InvestmentOutcomeDashboard';
import ProcessAnalysisDashboard from './ProcessAnalysisDashboard';
import ImprovementCycleDashboard from './ImprovementCycleDashboard';
import BudgetExecutionDashboard from './BudgetExecutionDashboard';

const { Header, Content, Sider } = Layout;
const { Title } = Typography;
const { TabPane } = Tabs;

const DashboardLayout = () => {
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [activeKey, setActiveKey] = useState('1');
  
  // Data state
  const [summaryData, setSummaryData] = useState(null);
  const [ministryData, setMinistryData] = useState(null);
  const [performanceMetrics, setPerformanceMetrics] = useState(null);
  const [reviewMetrics, setReviewMetrics] = useState(null);
  const [contractData, setContractData] = useState(null);
  const [spendingData, setSpendingData] = useState(null);
  const [newDashboardData, setNewDashboardData] = useState(null);
  
  // Filter state
  const [filters, setFilters] = useState({
    ministry: null,
    year: null,
    expenseType: null
  });

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load only the required pre-aggregated data file
        try {
          const newData = await fetch('./data/newDashboardData.json').then(res => res.json());
          setNewDashboardData(newData);
          
          // Also try to load other data, but don't fail if not available
          try {
            const [summary, ministries, performance, reviews, contracts, spending] = await Promise.all([
              fetch('./data/summary.json').then(res => res.json()),
              fetch('./data/ministryData.json').then(res => res.json()),
              fetch('./data/performanceMetrics.json').then(res => res.json()),
              fetch('./data/reviewMetrics.json').then(res => res.json()),
              fetch('./data/contractData.json').then(res => res.json()),
              fetch('./data/spendingMetrics.json').then(res => res.json())
            ]);
            
            setSummaryData(summary);
            // Extract ministry names as simple strings to prevent React errors
            if (Array.isArray(ministries)) {
              const ministryNames = ministries.map(m => m.ministry || m.name || '').filter(Boolean);
              setMinistryData(ministryNames);
            } else {
              setMinistryData([]);
            }
            setPerformanceMetrics(performance);
            setReviewMetrics(reviews);
            setContractData(contracts);
            setSpendingData(spending);
          } catch (subError) {
            console.warn("Some secondary data files could not be loaded, using only pre-aggregated data");
            // Create minimal ministry data from the pre-aggregated data
            const ministryNames = [...new Set([
              ...newData.investmentOutcome.improvementOpportunities.map(item => item.ministry),
              ...newData.budgetExecution.contractMethodData.map(item => item.ministry)
            ])];
            // Create simple strings array instead of objects to prevent React errors
            setMinistryData(ministryNames);
          }
        } catch (error) {
          console.error("Error loading dashboard data:", error);
          setLoading(false);
          return;
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Handle filter changes
  const handleFilterChange = (filterKey, value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [filterKey]: value
    }));
  };

  // Handle tab changes
  const handleTabChange = (key) => {
    setActiveKey(key);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header className="header" style={{ display: 'flex', alignItems: 'center', padding: '0 24px', background: '#fff', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)' }}>
        <div className="logo" style={{ marginRight: 16 }}>
          <AreaChartOutlined style={{ fontSize: 24, color: '#1890ff' }} />
        </div>
        <Title level={4} style={{ margin: 0, flex: 1 }}>納税者価値追跡ダッシュボード</Title>
        <Button type="text" icon={<QuestionCircleOutlined />}>ヘルプ</Button>
      </Header>

      <Layout>
        <Sider 
          width={200} 
          collapsible 
          collapsed={collapsed}
          onCollapse={setCollapsed}
          style={{ background: '#fff' }}
        >
          <Menu
            mode="inline"
            defaultSelectedKeys={['1']}
            selectedKeys={[activeKey]}
            style={{ height: '100%', borderRight: 0 }}
            onClick={({ key }) => setActiveKey(key)}
          >
            <Menu.Item key="1" icon={<AreaChartOutlined />}>投資と成果の関係性分析</Menu.Item>
            <Menu.Item key="2" icon={<LineChartOutlined />}>効果発現プロセス分析</Menu.Item>
            <Menu.Item key="3" icon={<BarChartOutlined />}>継続的改善の取り組み</Menu.Item>
            <Menu.Item key="4" icon={<PieChartOutlined />}>予算執行プロセスの特性</Menu.Item>
          </Menu>
        </Sider>

        <Layout style={{ padding: '0 24px 24px' }}>
          <Content
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
              background: '#fff',
            }}
          >
            <Spin spinning={loading} tip="データを読み込み中...">
              {!loading && newDashboardData && (
                <Tabs activeKey={activeKey} onChange={handleTabChange} tabPosition="top">
                  <TabPane tab="投資と成果の関係性分析" key="1">
                    <InvestmentOutcomeDashboard
                      ministryData={ministryData}
                      performanceMetrics={performanceMetrics}
                      dashboardData={newDashboardData.investmentOutcome}
                      filters={filters}
                      onFilterChange={handleFilterChange}
                    />
                  </TabPane>
                  
                  <TabPane tab="効果発現プロセス分析" key="2">
                    <ProcessAnalysisDashboard
                      ministryData={ministryData}
                      performanceMetrics={performanceMetrics}
                      dashboardData={newDashboardData.processAnalysis}
                      filters={filters}
                      onFilterChange={handleFilterChange}
                    />
                  </TabPane>
                  
                  <TabPane tab="継続的改善の取り組み" key="3">
                    <ImprovementCycleDashboard
                      ministryData={ministryData}
                      reviewMetrics={reviewMetrics}
                      dashboardData={newDashboardData.improvementCycle}
                      filters={filters}
                      onFilterChange={handleFilterChange}
                    />
                  </TabPane>
                  
                  <TabPane tab="予算執行プロセスの特性" key="4">
                    <BudgetExecutionDashboard
                      ministryData={ministryData}
                      contractData={contractData}
                      spendingMetrics={spendingData}
                      dashboardData={newDashboardData.budgetExecution}
                      filters={filters}
                      onFilterChange={handleFilterChange}
                    />
                  </TabPane>
                </Tabs>
              )}
            </Spin>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;