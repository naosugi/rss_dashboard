import React, { useState, useEffect } from 'react';
import { Layout, Menu, Typography } from 'antd';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';

// Original dashboards
import OverviewDashboard from './components/dashboards/OverviewDashboard';
import PerformanceDashboard from './components/dashboards/PerformanceDashboard';
import BudgetDashboard from './components/dashboards/BudgetDashboard';
import ImprovementDashboard from './components/dashboards/ImprovementDashboard';
import Sidebar from './components/Sidebar';
import HelpPage from './components/HelpPage';

// New improved dashboards
import DashboardLayout from './components/dashboards/new-dashboards/DashboardLayout';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

function App() {
  const [mode, setMode] = useState('improved'); // 'original' or 'improved'
  const [dashboardData, setDashboardData] = useState({
    summary: null,
    ministryData: null,
    projectTypeData: null,
    expenseTypeData: null
  });

  // Toggle between original and improved dashboard
  const toggleDashboardMode = () => {
    const newMode = mode === 'original' ? 'improved' : 'original';
    setMode(newMode);
    localStorage.setItem('dashboardMode', newMode);
  };

  // Load data for original dashboard
  useEffect(() => {
    const loadData = async () => {
      try {
        // Create an array of fetch promises with fallback error handling
        const fetchWithFallback = async (url, defaultValue = {}) => {
          try {
            const response = await fetch(url);
            if (!response.ok) {
              console.warn(`Failed to load ${url}, using default value`);
              return defaultValue;
            }
            return await response.json();
          } catch (error) {
            console.warn(`Error loading ${url}:`, error);
            return defaultValue;
          }
        };

        // Load all data with fallbacks
        const [summary, ministryData, projectTypeData, expenseTypeData] = await Promise.all([
          fetchWithFallback('./data/summary.json', { totalProjects: 0, newProjects: 0, endingProjects: 0, improvementProjects: 0 }),
          fetchWithFallback('./data/ministryData.json', []),
          fetchWithFallback('./data/projectTypeData.json', []),
          fetchWithFallback('./data/expenseTypeData.json', [])
        ]);
        
        setDashboardData({
          summary,
          ministryData,
          projectTypeData,
          expenseTypeData
        });
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        // Set default empty data on failure
        setDashboardData({
          summary: { totalProjects: 0, newProjects: 0, endingProjects: 0, improvementProjects: 0 },
          ministryData: [],
          projectTypeData: [],
          expenseTypeData: []
        });
      }
    };

    if (mode === 'original') {
      loadData();
    }
  }, [mode]);

  // 初期値をlocalStorageから読み込む
  useEffect(() => {
    const savedMode = localStorage.getItem('dashboardMode');
    if (savedMode) {
      setMode(savedMode);
    }
  }, []);

  return (
    <Router>
      <Layout style={{ minHeight: '100vh' }}>
        <Header className="header" style={{ display: 'flex', alignItems: 'center', padding: '0 24px' }}>
          <div className="logo" style={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}>
            政策ダッシュボード
          </div>
          <Menu
            theme="dark"
            mode="horizontal"
            defaultSelectedKeys={['1']}
            style={{ flex: 1, justifyContent: 'flex-end' }}
          >
            <Menu.Item key="toggle" onClick={toggleDashboardMode}>
              {mode === 'original' ? '改良版を表示' : '元の版を表示'}
            </Menu.Item>
            <Menu.Item key="help">
              <Link to="/help">ヘルプ</Link>
            </Menu.Item>
          </Menu>
        </Header>

        <Layout>
          {mode === 'original' && (
            <Sidebar data={dashboardData} filters={{
              ministries: [], 
              projectTypes: [''], 
              expenseTypes: [''], 
              budgetRange: [0, 50000], 
              reviewTypes: []
            }} onFilterChange={() => {}} />
          )}

          <Layout style={{ padding: '0 24px 24px' }}>
            <Content
              className="site-layout-background"
              style={{
                padding: 24,
                margin: 0,
                minHeight: 280,
              }}
            >
              {mode === 'original' ? (
                <Routes>
                  <Route path="/" element={<OverviewDashboard data={dashboardData} />} />
                  <Route path="/rss_dashboard/" element={<OverviewDashboard data={dashboardData} />} />
                  <Route path="/rss_dashboard" element={<OverviewDashboard data={dashboardData} />} />
                  <Route path="/performance" element={<PerformanceDashboard data={dashboardData} />} />
                  <Route path="/rss_dashboard/performance" element={<PerformanceDashboard data={dashboardData} />} />
                  <Route path="/budget" element={<BudgetDashboard data={dashboardData} />} />
                  <Route path="/rss_dashboard/budget" element={<BudgetDashboard data={dashboardData} />} />
                  <Route path="/improvement" element={<ImprovementDashboard data={dashboardData} />} />
                  <Route path="/rss_dashboard/improvement" element={<ImprovementDashboard data={dashboardData} />} />
                  <Route path="/help" element={<HelpPage />} />
                  <Route path="/rss_dashboard/help" element={<HelpPage />} />
                </Routes>
              ) : (
                <Routes>
                  <Route path="/help" element={<HelpPage />} />
                  <Route path="/rss_dashboard/help" element={<HelpPage />} />
                  <Route path="/*" element={<DashboardLayout />} />
                </Routes>
              )}
            </Content>
          </Layout>
        </Layout>

        <Footer style={{ textAlign: 'center' }}>
          <Text type="secondary">納税者価値追跡ダッシュボード ©{new Date().getFullYear()}</Text>
        </Footer>
      </Layout>
    </Router>
  );
}

export default App;