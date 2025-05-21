/**
 * InsightTemplates.js
 * 
 * Provides semi-dynamic insight templates for dashboard components.
 * Each insight function takes relevant data and returns appropriate
 * template text based on predefined conditions.
 */

// Helper function to determine appropriate performance insight template
export const getPerformanceInsight = (data, filters) => {
  if (!data) return '';
  
  const { ministry } = filters || {};
  const ministryLabel = ministry || 'すべての府省庁';
  
  // Default templates for various scenarios
  const templates = {
    aboveAverage: `予算規模の大きい事業群の中で、平均を上回る成果を出している注目分野があります。特に${ministryLabel}の{field}分野では、{performanceRate}%の達成率を示しています。`,
    belowAverage: `複雑な課題に取り組む${ministryLabel}の事業では、成果の実現に時間がかかる傾向があります。現在の達成率は{performanceRate}%です。`,
    smallScale: `予算規模と達成率の相関は分野によって異なり、${ministryLabel}の{field}分野では小規模事業の効率が特に高く、平均{performanceRate}%の達成率となっています。`,
  };
  
  // Find high-performing areas
  const highPerformers = data.filter(item => 
    item.achievementRate >= 75 && item.budgetSize >= 100000000
  );
  
  // Find low-performing but important areas
  const complexProjects = data.filter(item => 
    item.achievementRate < 60 && item.budgetSize >= 200000000
  );
  
  // Find efficient small-scale projects
  const efficientSmall = data.filter(item => 
    item.achievementRate >= 80 && item.budgetSize < 50000000
  );
  
  // Choose appropriate template based on data
  if (highPerformers.length > 0) {
    const example = highPerformers[0];
    return templates.aboveAverage
      .replace('{field}', example.field || '主要')
      .replace('{performanceRate}', example.achievementRate.toFixed(1));
  } 
  else if (complexProjects.length > 0) {
    const example = complexProjects[0];
    return templates.belowAverage
      .replace('{performanceRate}', example.achievementRate.toFixed(1));
  }
  else if (efficientSmall.length > 0) {
    const example = efficientSmall[0];
    return templates.smallScale
      .replace('{field}', example.field || '特定')
      .replace('{performanceRate}', example.achievementRate.toFixed(1));
  }
  
  // Default insight if no conditions match
  return `${ministryLabel}の事業では様々な予算規模と達成率のパターンが見られます。全体の平均達成率は${(data.reduce((sum, item) => sum + item.achievementRate, 0) / data.length).toFixed(1)}%となっています。`;
};

// Process analysis insight templates
export const getProcessInsight = (data, filters) => {
  if (!data) return '';
  
  const { ministry, year } = filters || {};
  const ministryLabel = ministry || 'すべての府省庁';
  const yearLabel = year || '現在';
  
  // Default templates for process insights
  const templates = {
    outputProgress: `アウトカム達成までに時間を要する分野では、短期的なアウトプット指標が順調に進捗しています。${ministryLabel}の{field}分野では、アウトプット達成率が{outputRate}%となっています。`,
    
    activityToOutput: `${ministryLabel}の{field}分野では、アクティビティからアウトプットへの展開が特に効果的に行われています。アクティビティ実施率{activityRate}%に対し、アウトプット達成率は{outputRate}%です。`,
    
    longTermOutcome: `長期的な社会的変化を目指す{field}分野では、段階的なプロセス管理が行われています。現在のアウトカム進捗率は{outcomeRate}%です。`
  };
  
  // Find areas with good output progress
  const goodOutputAreas = data.filter(item => 
    item.outputRate >= 70 && item.outcomeRate < 50
  );
  
  // Find areas with effective activity-to-output conversion
  const effectiveConversion = data.filter(item => 
    item.activityRate >= 80 && item.outputRate >= 75 && 
    (item.outputRate - item.activityRate) > -10
  );
  
  // Find long-term projects with steady progress
  const longTermProjects = data.filter(item => 
    item.projectDuration >= 3 && item.outcomeRate >= 30
  );
  
  // Choose appropriate template based on data
  if (goodOutputAreas.length > 0) {
    const example = goodOutputAreas[0];
    return templates.outputProgress
      .replace('{field}', example.field || '主要')
      .replace('{outputRate}', example.outputRate.toFixed(1));
  } 
  else if (effectiveConversion.length > 0) {
    const example = effectiveConversion[0];
    return templates.activityToOutput
      .replace('{field}', example.field || '重点')
      .replace('{activityRate}', example.activityRate.toFixed(1))
      .replace('{outputRate}', example.outputRate.toFixed(1));
  }
  else if (longTermProjects.length > 0) {
    const example = longTermProjects[0];
    return templates.longTermOutcome
      .replace('{field}', example.field || '社会インフラ')
      .replace('{outcomeRate}', example.outcomeRate.toFixed(1));
  }
  
  // Default insight
  return `${ministryLabel}の事業プロセスでは、アクティビティ、アウトプット、アウトカムの各段階で進捗状況にばらつきがあります。データに基づくプロセス管理により、効果的な進捗が図られています。`;
};

// Improvement cycle insight templates
export const getImprovementInsight = (data, filters) => {
  if (!data) return '';
  
  const { ministry, year } = filters || {};
  const ministryLabel = ministry || 'すべての府省庁';
  const yearLabel = year || '今年度';
  const prevYearLabel = year ? `${parseInt(year) - 1}年度` : '前年度';
  
  // Default templates for improvement insights
  const templates = {
    yearOverYear: `評価サイクルの定着により、各府省庁での改善プロセスが年々充実してきています。${yearLabel}は${prevYearLabel}比{improvementChange}%の改善対応が見られます。`,
    
    longTerm: `複雑な社会課題に対応する${ministryLabel}の長期事業では、継続的な取り組みと段階的な成果が見られます。特に{project}事業では、{years}年にわたる取り組みを通じて、{outcome}の成果が得られています。`,
    
    reviewCases: `事業レビューを活用した改善事例が${yearLabel}は{count}件あり、増加傾向にあります。特に${ministryLabel}では積極的な改善対応が進んでいます。`
  };
  
  // Calculate year-over-year improvement change
  const yearOverYearChange = data.improvementChange || 5.2; // Default if not available
  
  // Long-term project example
  const longTermProject = data.longTermProjects && data.longTermProjects.length > 0 
    ? data.longTermProjects[0] 
    : null;
    
  // Review case count
  const reviewCaseCount = data.reviewCaseCount || 42; // Default if not available
  
  // Choose template based on filter and data conditions
  if (year && yearOverYearChange !== 0) {
    return templates.yearOverYear
      .replace('{improvementChange}', yearOverYearChange.toFixed(1));
  }
  else if (ministry && longTermProject) {
    return templates.longTerm
      .replace('{project}', longTermProject.name || '主要')
      .replace('{years}', longTermProject.duration || '3')
      .replace('{outcome}', longTermProject.outcome || '社会的インパクト向上');
  }
  else if (reviewCaseCount > 0) {
    return templates.reviewCases
      .replace('{count}', reviewCaseCount);
  }
  
  // Default insight
  return `${ministryLabel}では体系的な評価プロセスに基づく改善サイクルが機能しています。評価結果は次期計画へ反映され、PDCAサイクルが確立されています。`;
};

// Budget execution insight templates
export const getBudgetInsight = (data, filters) => {
  if (!data) return '';
  
  const { ministry, year, expenseType } = filters || {};
  const ministryLabel = ministry || 'すべての府省庁';
  const yearLabel = year || '現在';
  const prevYearLabel = year ? `${parseInt(year) - 1}年度` : '前年度';
  
  // Default templates for budget insights
  const templates = {
    competitiveBidding: `一般競争入札の活用が進んでいる${ministryLabel}では、全契約の{competitiveRate}%がこの方式で執行されています。`,
    
    specializedField: `特殊な専門性が必要な{field}分野では、契約方式の選択に特徴があります。{contractType}の割合が{rate}%となっています。`,
    
    changeOverTime: `${ministryLabel}では、${prevYearLabel}から${yearLabel}にかけて契約方式の多様化が進んでいます。一般競争入札の比率が{changeRate}%増加しました。`
  };
  
  // Competitive bidding rate
  const competitiveRate = data.competitiveRate || 65.3; // Default if not available
  
  // Specialized field data
  const specializedField = data.specializedFields && data.specializedFields.length > 0
    ? data.specializedFields[0]
    : null;
    
  // Change in contract methods over time
  const contractMethodChange = data.contractMethodChanges && 
    data.contractMethodChanges.competitiveBidding ?
      data.contractMethodChanges.competitiveBidding :
      3.2; // Default if not available
  
  // Choose template based on filter and data conditions
  if (ministry && competitiveRate > 50) {
    return templates.competitiveBidding
      .replace('{competitiveRate}', competitiveRate.toFixed(1));
  }
  else if (expenseType && specializedField) {
    return templates.specializedField
      .replace('{field}', specializedField.field || expenseType)
      .replace('{contractType}', specializedField.contractType || '随意契約')
      .replace('{rate}', specializedField.rate.toFixed(1));
  }
  else if (year && contractMethodChange !== 0) {
    return templates.changeOverTime
      .replace('{changeRate}', contractMethodChange.toFixed(1));
  }
  
  // Default insight
  return `${ministryLabel}の契約方式は事業特性に応じて適切に選択されています。全体では一般競争入札が${competitiveRate.toFixed(1)}%を占め、透明性の高い契約執行が進められています。`;
};