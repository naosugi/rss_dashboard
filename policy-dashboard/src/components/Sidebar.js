import React, { useState, useEffect } from 'react';
import { Menu, Checkbox, Radio, Select, Slider, Divider, Typography } from 'antd';
import { FilterOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;

const Sidebar = ({ data = {}, filters = {
  ministries: [], 
  projectTypes: [''], 
  expenseTypes: [''], 
  budgetRange: [0, 50000], 
  reviewTypes: []
}, onFilterChange = () => {} }) => {
  const [ministryOptions, setMinistryOptions] = useState([]);
  const [projectTypeOptions, setProjectTypeOptions] = useState([]);
  const [expenseTypeOptions, setExpenseTypeOptions] = useState([]);
  const [reviewTypeOptions, setReviewTypeOptions] = useState([]);

  useEffect(() => {
    // Safely handle data access with defaults and null checks
    const safeData = data || {};
    
    // 府省庁オプションの生成
    if (safeData.ministryData && Array.isArray(safeData.ministryData) && safeData.ministryData.length > 0) {
      const ministries = safeData.ministryData.map(item => item.ministry).filter(Boolean);
      setMinistryOptions(ministries);
    } else {
      setMinistryOptions([]);
    }

    // 事業区分オプションの生成
    if (safeData.projectTypeData && Array.isArray(safeData.projectTypeData) && safeData.projectTypeData.length > 0) {
      const projectTypes = safeData.projectTypeData.map(item => item.type).filter(Boolean);
      setProjectTypeOptions(projectTypes);
    } else {
      setProjectTypeOptions([]);
    }

    // 主要経費オプションの生成
    if (safeData.expenseTypeData && Array.isArray(safeData.expenseTypeData) && safeData.expenseTypeData.length > 0) {
      const expenseTypes = safeData.expenseTypeData.map(item => item.expense).filter(Boolean);
      setExpenseTypeOptions(expenseTypes);
    } else {
      setExpenseTypeOptions([]);
    }

    // レビュー評価オプションの生成
    if (safeData.reviewMetrics && safeData.reviewMetrics.reviewDistribution && 
        Array.isArray(safeData.reviewMetrics.reviewDistribution) && 
        safeData.reviewMetrics.reviewDistribution.length > 0) {
      const reviewTypes = safeData.reviewMetrics.reviewDistribution.map(item => item.review).filter(Boolean);
      setReviewTypeOptions(reviewTypes);
    } else {
      setReviewTypeOptions([]);
    }
  }, [data]);

  const handleMinistryChange = checkedValues => {
    onFilterChange({ ministries: checkedValues });
  };

  const handleProjectTypeChange = e => {
    onFilterChange({ projectTypes: [e.target.value] });
  };

  const handleExpenseTypeChange = value => {
    onFilterChange({ expenseTypes: [value] });
  };

  const handleBudgetRangeChange = value => {
    onFilterChange({ budgetRange: value });
  };

  const handleReviewTypeChange = checkedValues => {
    onFilterChange({ reviewTypes: checkedValues });
  };

  return (
    <div className="sidebar-filters" style={{ padding: '16px' }}>
      <Title level={5}>フィルター <FilterOutlined /></Title>
      <Divider style={{ margin: '8px 0' }} />

      {/* 府省庁フィルター */}
      <div className="filter-section">
        <div className="filter-title">府省庁</div>
        <Checkbox.Group 
          options={ministryOptions.map(ministry => ({ label: ministry, value: ministry }))}
          value={filters.ministries}
          onChange={handleMinistryChange}
          style={{ display: 'flex', flexDirection: 'column' }}
        />
      </div>

      <Divider style={{ margin: '8px 0' }} />

      {/* 事業区分フィルター */}
      <div className="filter-section">
        <div className="filter-title">事業区分</div>
        <Radio.Group 
          options={projectTypeOptions.map(type => ({ label: type, value: type }))}
          value={filters.projectTypes[0]}
          onChange={handleProjectTypeChange}
          style={{ display: 'flex', flexDirection: 'column' }}
        />
      </div>

      <Divider style={{ margin: '8px 0' }} />

      {/* 主要経費フィルター */}
      <div className="filter-section">
        <div className="filter-title">主要経費</div>
        <Select
          style={{ width: '100%' }}
          placeholder="選択してください"
          value={filters.expenseTypes[0]}
          onChange={handleExpenseTypeChange}
          allowClear
        >
          {expenseTypeOptions.map(expense => (
            <Option key={expense} value={expense}>{expense}</Option>
          ))}
        </Select>
      </div>

      <Divider style={{ margin: '8px 0' }} />

      {/* 予算規模フィルター */}
      <div className="filter-section">
        <div className="filter-title">予算規模 (単位: 千円)</div>
        <Slider
          range
          min={0}
          max={100000}
          step={1000}
          defaultValue={[0, 50000]}
          onChange={handleBudgetRangeChange}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>{filters.budgetRange[0].toLocaleString()}</span>
          <span>{filters.budgetRange[1].toLocaleString()}</span>
        </div>
      </div>

      <Divider style={{ margin: '8px 0' }} />

      {/* レビュー評価フィルター */}
      <div className="filter-section">
        <div className="filter-title">レビュー評価</div>
        <Checkbox.Group 
          options={reviewTypeOptions.map(review => ({ label: review, value: review }))}
          value={filters.reviewTypes}
          onChange={handleReviewTypeChange}
          style={{ display: 'flex', flexDirection: 'column' }}
        />
      </div>
    </div>
  );
};

export default Sidebar;