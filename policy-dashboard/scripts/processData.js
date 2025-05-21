const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

// CSVファイルのパス
const csvDir = path.join(__dirname, '..', 'public', 'csv');
const outputDir = path.join(__dirname, '..', 'public', 'data');

// 出力ディレクトリがなければ作成
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// CSVファイルを読み込む関数
function readCSV(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const result = Papa.parse(fileContent, {
    header: true,
    skipEmptyLines: true
  });
  return result.data;
}

// 府省庁別データの集計
function processMinistryData(basicInfoData) {
  const ministryCounts = {};
  
  basicInfoData.forEach(row => {
    const ministry = row['政策所管府省庁'];
    if (ministry) {
      ministryCounts[ministry] = (ministryCounts[ministry] || 0) + 1;
    }
  });
  
  // 集計結果を配列に変換
  return Object.entries(ministryCounts)
    .map(([ministry, count]) => ({
      ministry,
      count,
      percentage: (count / basicInfoData.length * 100).toFixed(1)
    }))
    .sort((a, b) => b.count - a.count);
}

// 事業区分データの集計
function processProjectTypeData(basicInfoData) {
  const typeCounts = {};
  
  basicInfoData.forEach(row => {
    const type = row['事業区分'];
    if (type) {
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    }
  });
  
  // 集計結果を配列に変換
  return Object.entries(typeCounts)
    .map(([type, count]) => ({
      type,
      count,
      percentage: (count / basicInfoData.length * 100).toFixed(1)
    }))
    .sort((a, b) => b.count - a.count);
}

// 主要経費データの集計
function processExpenseTypeData(basicInfoData) {
  const expenseCounts = {};
  
  basicInfoData.forEach(row => {
    const expense = row['主要経費'];
    if (expense) {
      expenseCounts[expense] = (expenseCounts[expense] || 0) + 1;
    }
  });
  
  // 集計結果を配列に変換
  return Object.entries(expenseCounts)
    .map(([expense, count]) => ({
      expense,
      count,
      percentage: (count / basicInfoData.length * 100).toFixed(1)
    }))
    .sort((a, b) => b.count - a.count);
}

// パフォーマンスデータの集計
function processPerformanceData(performanceData, basicInfoData) {
  const typeCount = {
    アクティビティ: 0,
    アウトプット: 0,
    アウトカム: 0
  };
  
  // 種別ごとの集計
  performanceData.forEach(row => {
    const type = row['種別（アクティビティ・アウトプット・アウトカム）'];
    if (type && typeCount[type] !== undefined) {
      typeCount[type]++;
    }
  });
  
  // 目標達成率の計算 (2023年度実績/2023年度目標値)
  const projectPerformance = [];
  const uniqueProjectIds = [...new Set(performanceData.map(row => row['予算事業ID']))]; 
  
  uniqueProjectIds.forEach(projectId => {
    const projectRows = performanceData.filter(row => row['予算事業ID'] === projectId);
    const outputRows = projectRows.filter(row => row['種別（アクティビティ・アウトプット・アウトカム）'] === 'アウトプット');
    
    let totalAchievement = 0;
    let validIndicators = 0;
    
    outputRows.forEach(row => {
      const target2023 = row['2023年度目標値'];
      const actual2023 = row['2023年度実績値'];
      
      if (target2023 && actual2023 && target2023 > 0) {
        totalAchievement += (actual2023 / target2023) * 100;
        validIndicators++;
      }
    });
    
    if (validIndicators > 0) {
      const basicInfo = basicInfoData.find(item => item['予算事業ID'] === projectId);
      projectPerformance.push({
        projectId,
        achievement: (totalAchievement / validIndicators).toFixed(1),
        projectName: basicInfo ? basicInfo['事業名'] : '不明',
        ministry: basicInfo ? basicInfo['政策所管府省庁'] : '不明'
      });
    }
  });
  
  return {
    typeDistribution: Object.entries(typeCount).map(([type, count]) => ({ type, count })),
    projectPerformance: projectPerformance.sort((a, b) => b.achievement - a.achievement)
  };
}

// レビュー評価データの集計
function processReviewData(reviewData, basicInfoData) {
  const reviewCounts = {};
  
  reviewData.forEach(row => {
    const review = row['行政事業レビュー推進チームの所見'];
    if (review) {
      reviewCounts[review] = (reviewCounts[review] || 0) + 1;
    }
  });
  
  // 集計結果を配列に変換
  const reviewDistribution = Object.entries(reviewCounts)
    .map(([review, count]) => ({
      review,
      count,
      percentage: (count / reviewData.length * 100).toFixed(1)
    }))
    .sort((a, b) => b.count - a.count);

  // 府省庁別レビュー結果の集計
  const ministryReviews = {};
  reviewData.forEach(review => {
    const projectId = review['予算事業ID'];
    const reviewResult = review['行政事業レビュー推進チームの所見'];
    
    if (projectId && reviewResult) {
      const basicInfo = basicInfoData.find(info => info['予算事業ID'] === projectId);
      if (basicInfo) {
        const ministry = basicInfo['政策所管府省庁'];
        if (ministry) {
          if (!ministryReviews[ministry]) {
            ministryReviews[ministry] = {
              ministry,
              '現状通り': 0,
              '事業内容の一部改善': 0,
              '事業全体の抜本的な改善': 0,
              '終了予定': 0,
              '廃止': 0,
              total: 0
            };
          }
          ministryReviews[ministry][reviewResult] = (ministryReviews[ministry][reviewResult] || 0) + 1;
          ministryReviews[ministry].total++;
        }
      }
    }
  });

  // 府省庁別集計結果を配列に変換
  const ministryReviewArray = Object.values(ministryReviews)
    .map(item => {
      const improvementCount = (item['事業内容の一部改善'] || 0) + (item['事業全体の抜本的な改善'] || 0);
      return {
        ...item,
        improvementRate: (improvementCount / item.total * 100).toFixed(1)
      };
    })
    .sort((a, b) => b.improvementRate - a.improvementRate);
  
  // 代表的な改善事例を取得
  const improvementCases = reviewData
    .filter(review => 
      review['行政事業レビュー推進チームの所見'] === '事業内容の一部改善' || 
      review['行政事業レビュー推進チームの所見'] === '事業全体の抜本的な改善')
    .map(review => {
      const projectId = review['予算事業ID'];
      const basicInfo = basicInfoData.find(info => info['予算事業ID'] === projectId);
      return {
        projectId,
        reviewType: review['行政事業レビュー推進チームの所見'],
        improvement: review['所見を踏まえた改善点／概算要求における反映状況'],
        projectName: basicInfo ? basicInfo['事業名'] : '不明',
        ministry: basicInfo ? basicInfo['政策所管府省庁'] : '不明'
      };
    })
    .filter(project => project.improvement) // 改善点が記載されているもののみ取得
    .sort(() => 0.5 - Math.random()) // ランダムに並び替え
    .slice(0, 10); // 上位10件を取得
  
  return {
    reviewDistribution,
    ministryReviewArray,
    improvementCases
  };
}

// 契約方式データの集計
function processContractData(spendingData) {
  const contractCounts = {};
  let totalCount = 0;
  
  spendingData.forEach(row => {
    const method = row['契約方式等'];
    if (method) {
      contractCounts[method] = (contractCounts[method] || 0) + 1;
      totalCount++;
    }
  });
  
  // 集計結果を配列に変換
  return Object.entries(contractCounts)
    .map(([method, count]) => ({
      method,
      count,
      percentage: (count / totalCount * 100).toFixed(1)
    }))
    .sort((a, b) => b.count - a.count);
}

// 支出先データの集計
function processSpendingData(spendingData) {
  const typeDistribution = {};
  const topRecipients = [];
  
  spendingData.forEach(row => {
    const type = row['法人種別'];
    const name = row['支出先名'];
    const amount = parseFloat(row['支出先の合計支出額']) || 0;
    
    if (type) {
      typeDistribution[type] = (typeDistribution[type] || 0) + amount;
    }
    
    if (name && amount > 0) {
      const existingRecipient = topRecipients.find(r => r.name === name);
      if (existingRecipient) {
        existingRecipient.amount += amount;
      } else {
        topRecipients.push({ name, amount, type: type || '不明' });
      }
    }
  });
  
  // 支出先タイプの集計結果を配列に変換
  const typeData = Object.entries(typeDistribution)
    .map(([type, amount]) => ({
      type,
      amount,
      percentage: (amount / Object.values(typeDistribution).reduce((a, b) => a + b, 0) * 100).toFixed(1)
    }))
    .sort((a, b) => b.amount - a.amount);
  
  // 支出額の多い順にソート
  const sortedRecipients = topRecipients
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 50)  // 上位50件
    .map(item => ({
      ...item,
      amount: Math.round(item.amount),
      formattedAmount: new Intl.NumberFormat('ja-JP').format(Math.round(item.amount))
    }));
  
  return {
    typeDistribution: typeData,
    topRecipients: sortedRecipients
  };
}

// メイン処理
async function main() {
  console.log('データ処理を開始します...');

  try {
    // 基本情報データの読み込み
    console.log('基本情報データを読み込み中...');
    const basicInfoData = readCSV(path.join(csvDir, '1-2_RS_2024_基本情報_事業概要等.csv'));
    console.log(`基本情報データを読み込みました: ${basicInfoData.length}件`);

    // パフォーマンスデータの読み込み
    console.log('パフォーマンスデータを読み込み中...');
    const performanceData = readCSV(path.join(csvDir, '3-1_RS_2024_効果発現経路_目標・実績.csv'));
    console.log(`パフォーマンスデータを読み込みました: ${performanceData.length}件`);

    // 評価データの読み込み
    console.log('評価データを読み込み中...');
    const evaluationData = readCSV(path.join(csvDir, '4-1_RS_2024_点検・評価.csv'));
    console.log(`評価データを読み込みました: ${evaluationData.length}件`);

    // 支出先データの読み込み
    console.log('支出先データを読み込み中...');
    const spendingData = readCSV(path.join(csvDir, '5-1_RS_2024_支出先_支出情報.csv'));
    console.log(`支出先データを読み込みました: ${spendingData.length}件`);

    // データを集計
    console.log('データを集計中...');
    const ministryData = processMinistryData(basicInfoData);
    const projectTypeData = processProjectTypeData(basicInfoData);
    const expenseTypeData = processExpenseTypeData(basicInfoData);
    const performanceMetrics = processPerformanceData(performanceData, basicInfoData);
    const reviewMetrics = processReviewData(evaluationData, basicInfoData);
    const contractData = processContractData(spendingData);
    const spendingMetrics = processSpendingData(spendingData);

    // 集計データを保存
    console.log('集計結果を保存中...');
    fs.writeFileSync(path.join(outputDir, 'ministryData.json'), JSON.stringify(ministryData));
    fs.writeFileSync(path.join(outputDir, 'projectTypeData.json'), JSON.stringify(projectTypeData));
    fs.writeFileSync(path.join(outputDir, 'expenseTypeData.json'), JSON.stringify(expenseTypeData));
    fs.writeFileSync(path.join(outputDir, 'performanceMetrics.json'), JSON.stringify(performanceMetrics));
    fs.writeFileSync(path.join(outputDir, 'reviewMetrics.json'), JSON.stringify(reviewMetrics));
    fs.writeFileSync(path.join(outputDir, 'contractData.json'), JSON.stringify(contractData));
    fs.writeFileSync(path.join(outputDir, 'spendingMetrics.json'), JSON.stringify(spendingMetrics));

    // 基本集計情報を保存
    const summary = {
      totalProjects: basicInfoData.length,
      newProjects: basicInfoData.filter(row => row['事業区分'] === '新規開始事業').length,
      endingProjects: basicInfoData.filter(row => row['事業区分'] === '終了事業').length,
      improvementProjects: evaluationData.filter(row => 
        row['行政事業レビュー推進チームの所見'] === '事業内容の一部改善' || 
        row['行政事業レビュー推進チームの所見'] === '事業全体の抜本的な改善'
      ).length
    };
    fs.writeFileSync(path.join(outputDir, 'summary.json'), JSON.stringify(summary));

    console.log('全ての処理が完了しました！');

  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

main();