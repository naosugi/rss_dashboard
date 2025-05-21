import React, { useState } from 'react';
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

  // Toggle between original and improved dashboard
  const toggleDashboardMode = () => {
    setMode(prevMode => prevMode === 'original' ? 'improved' : 'original');
  };

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
            <Sidebar />
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
                  <Route path="/" element={<OverviewDashboard />} />
                  <Route path="/performance" element={<PerformanceDashboard />} />
                  <Route path="/budget" element={<BudgetDashboard />} />
                  <Route path="/improvement" element={<ImprovementDashboard />} />
                  <Route path="/help" element={<HelpPage />} />
                </Routes>
              ) : (
                <Routes>
                  <Route path="*" element={<DashboardLayout />} />
                  <Route path="/help" element={<HelpPage />} />
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