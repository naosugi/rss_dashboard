// CSVデータを処理して静的JSONデータを生成するスクリプト
const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

// CSVファイルを読み込んでJSONに変換するメインクラス
class DataProcessor {
  constructor() {
    this.basicInfoData = [];
    this.performanceData = [];
    this.evaluationData = [];
    this.spendingData = [];
    
    this.inputDir = path.join(__dirname, '..', 'csv');
    this.outputDir = path.join(__dirname, '..', 'public', 'data');
    
    // 出力ディレクトリが存在しない場合は作成
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }
  
  // CSVファイルを読み込む関数
  readCSV(filePath) {
    console.log(`Reading ${filePath}...`);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const result = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true
    });
    console.log(`Parsed ${result.data.length} rows`);
    return result.data;
  }

  // 処理結果をJSONファイルとして保存
  saveJSON(data, filename) {
    const filePath = path.join(this.outputDir, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Saved ${filePath}`);
  }

  // 府省庁別事業数を集計
  processMinistryData() {
    console.log('Processing ministry data...');
    const ministryCounts = {};
    
    this.basicInfoData.forEach(row => {
      const ministry = row['政策所管府省庁'];
      if (ministry) {
        ministryCounts[ministry] = (ministryCounts[ministry] || 0) + 1;
      }
    });
    
    const ministryData = Object.entries(ministryCounts)
      .map(([ministry, count]) => ({
        ministry,
        count,
        percentage: (count / this.basicInfoData.length * 100).toFixed(1)
      }))
      .sort((a, b) => b.count - a.count);
    
    this.saveJSON(ministryData, 'ministryData.json');
    return ministryData;
  }

  // 事業区分データを集計
  processProjectTypeData() {
    console.log('Processing project type data...');
    const typeCounts = {};
    
    this.basicInfoData.forEach(row => {
      const type = row['事業区分'];
      if (type) {
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      }
    });
    
    const projectTypeData = Object.entries(typeCounts)
      .map(([type, count]) => ({
        type,
        count,
        percentage: (count / this.basicInfoData.length * 100).toFixed(1)
      }))
      .sort((a, b) => b.count - a.count);
    
    this.saveJSON(projectTypeData, 'projectTypeData.json');
    return projectTypeData;
  }

  // 主要経費データを集計
  processExpenseTypeData() {
    console.log('Processing expense type data...');
    const expenseCounts = {};
    
    this.basicInfoData.forEach(row => {
      const expense = row['主要経費'];
      if (expense) {
        expenseCounts[expense] = (expenseCounts[expense] || 0) + 1;
      }
    });
    
    const expenseTypeData = Object.entries(expenseCounts)
      .map(([expense, count]) => ({
        expense,
        count,
        percentage: (count / this.basicInfoData.length * 100).toFixed(1)
      }))
      .sort((a, b) => b.count - a.count);
    
    this.saveJSON(expenseTypeData, 'expenseTypeData.json');
    return expenseTypeData;
  }

  // パフォーマンスデータを集計
  processPerformanceData() {
    console.log('Processing performance data...');
    const typeCount = {
      アクティビティ: 0,
      アウトプット: 0,
      アウトカム: 0
    };
    
    // 種別ごとの集計
    this.performanceData.forEach(row => {
      const type = row['種別（アクティビティ・アウトプット・アウトカム）'];
      if (type && typeCount[type] !== undefined) {
        typeCount[type]++;
      }
    });
    
    // 目標達成率の計算 (2023年度実績/2023年度目標値)
    const projectPerformance = [];
    const uniqueProjectIds = [...new Set(this.performanceData.map(row => row['予算事業ID']))];
    console.log(`Processing ${uniqueProjectIds.length} unique projects...`);
    
    uniqueProjectIds.forEach(projectId => {
      const projectRows = this.performanceData.filter(row => row['予算事業ID'] === projectId);
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
        const basicInfo = this.basicInfoData.find(item => item['予算事業ID'] === projectId);
        projectPerformance.push({
          projectId,
          achievement: (totalAchievement / validIndicators).toFixed(1),
          projectName: basicInfo ? basicInfo['事業名'] : '不明',
          ministry: basicInfo ? basicInfo['政策所管府省庁'] : '不明'
        });
      }
    });
    
    const performanceMetrics = {
      typeDistribution: Object.entries(typeCount).map(([type, count]) => ({ type, count })),
      projectPerformance: projectPerformance.sort((a, b) => b.achievement - a.achievement)
    };
    
    this.saveJSON(performanceMetrics, 'performanceMetrics.json');
    return performanceMetrics;
  }

  // レビュー評価データを集計
  processReviewData() {
    console.log('Processing review data...');
    const reviewCounts = {};
    
    this.evaluationData.forEach(row => {
      const review = row['行政事業レビュー推進チームの所見'];
      if (review) {
        reviewCounts[review] = (reviewCounts[review] || 0) + 1;
      }
    });
    
    const reviewDistribution = Object.entries(reviewCounts)
      .map(([review, count]) => ({
        review,
        count,
        percentage: (count / this.evaluationData.length * 100).toFixed(1)
      }))
      .sort((a, b) => b.count - a.count);

    // 府省庁別レビュー結果の集計
    console.log('Processing ministry review data...');
    const ministryReviews = {};
    this.evaluationData.forEach(review => {
      const projectId = review['予算事業ID'];
      const reviewResult = review['行政事業レビュー推進チームの所見'];
      
      if (projectId && reviewResult) {
        const basicInfo = this.basicInfoData.find(info => info['予算事業ID'] === projectId);
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
    console.log('Processing improvement cases...');
    const improvementCases = this.evaluationData
      .filter(review => 
        review['行政事業レビュー推進チームの所見'] === '事業内容の一部改善' || 
        review['行政事業レビュー推進チームの所見'] === '事業全体の抜本的な改善')
      .map(review => {
        const projectId = review['予算事業ID'];
        const basicInfo = this.basicInfoData.find(info => info['予算事業ID'] === projectId);
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
    
    const reviewMetrics = {
      reviewDistribution,
      ministryReviewArray,
      improvementCases
    };
    
    this.saveJSON(reviewMetrics, 'reviewMetrics.json');
    return reviewMetrics;
  }

  // 契約方式データを集計
  processContractData() {
    console.log('Processing contract data...');
    const contractCounts = {};
    let totalCount = 0;
    
    this.spendingData.forEach(row => {
      const method = row['契約方式等'];
      if (method) {
        contractCounts[method] = (contractCounts[method] || 0) + 1;
        totalCount++;
      }
    });
    
    const contractData = Object.entries(contractCounts)
      .map(([method, count]) => ({
        method,
        count,
        percentage: (count / totalCount * 100).toFixed(1)
      }))
      .sort((a, b) => b.count - a.count);
    
    this.saveJSON(contractData, 'contractData.json');
    return contractData;
  }

  // 支出先データを集計
  processSpendingData() {
    console.log('Processing spending data...');
    const typeDistribution = {};
    const topRecipients = [];
    
    // データサイズが大きいため、一部の処理を絞る
    const sampleSize = Math.min(50000, this.spendingData.length);
    console.log(`Using ${sampleSize} samples out of ${this.spendingData.length} rows`);
    
    // サンプルを取得
    const sampledData = this.spendingData
      .sort(() => 0.5 - Math.random()) // ランダマイズ
      .slice(0, sampleSize);
    
    sampledData.forEach(row => {
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
    
    const spendingMetrics = {
      typeDistribution: typeData,
      topRecipients: sortedRecipients
    };
    
    this.saveJSON(spendingMetrics, 'spendingMetrics.json');
    return spendingMetrics;
  }

  // 基本集計情報を計算して保存
  processSummary() {
    console.log('Processing summary data...');
    const summary = {
      totalProjects: this.basicInfoData.length,
      newProjects: this.basicInfoData.filter(row => row['事業区分'] === '新規開始事業').length,
      endingProjects: this.basicInfoData.filter(row => row['事業区分'] === '終了事業').length,
      improvementProjects: this.evaluationData.filter(row => 
        row['行政事業レビュー推進チームの所見'] === '事業内容の一部改善' || 
        row['行政事業レビュー推進チームの所見'] === '事業全体の抜本的な改善'
      ).length
    };
    
    this.saveJSON(summary, 'summary.json');
    return summary;
  }

  // 全データを読み込んで処理
  async processAll() {
    console.log('Loading all data...');
    
    // データの読み込み
    this.basicInfoData = this.readCSV(path.join(this.inputDir, '1-2_RS_2024_基本情報_事業概要等.csv'));
    this.performanceData = this.readCSV(path.join(this.inputDir, '3-1_RS_2024_効果発現経路_目標・実績.csv'));
    this.evaluationData = this.readCSV(path.join(this.inputDir, '4-1_RS_2024_点検・評価.csv'));
    this.spendingData = this.readCSV(path.join(this.inputDir, '5-1_RS_2024_支出先_支出情報.csv'));
    
    console.log('Processing all data...');
    
    // 各種データの処理
    this.processSummary();
    this.processMinistryData();
    this.processProjectTypeData();
    this.processExpenseTypeData();
    this.processPerformanceData();
    this.processReviewData();
    this.processContractData();
    this.processSpendingData();
    
    console.log('All data processed successfully!');
  }
}

// スクリプト実行
const processor = new DataProcessor();
processor.processAll().catch(err => console.error('Error processing data:', err));