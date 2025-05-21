// サンプルデータを生成するためのスクリプト
const fs = require('fs');
const path = require('path');

// 出力ディレクトリ
const outputDir = path.join(__dirname, '..', 'public', 'data');

// 出力ディレクトリが存在しない場合は作成
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// ファイルを保存する関数
function saveJSON(data, filename) {
  const filePath = path.join(outputDir, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`Saved ${filePath}`);
}

// 基本統計データ
const summary = {
  totalProjects: 5948,
  newProjects: 289,
  endingProjects: 121,
  improvementProjects: 2514
};

// 府省庁データのサンプル
const ministryData = [
  { ministry: '文部科学省', count: 1245, percentage: '20.9' },
  { ministry: '厚生労働省', count: 987, percentage: '16.6' },
  { ministry: '経済産業省', count: 743, percentage: '12.5' },
  { ministry: '農林水産省', count: 632, percentage: '10.6' },
  { ministry: '国土交通省', count: 578, percentage: '9.7' },
  { ministry: '総務省', count: 432, percentage: '7.3' },
  { ministry: '環境省', count: 345, percentage: '5.8' },
  { ministry: '内閣府', count: 256, percentage: '4.3' },
  { ministry: '財務省', count: 234, percentage: '3.9' },
  { ministry: '外務省', count: 198, percentage: '3.3' },
  { ministry: '防衛省', count: 156, percentage: '2.6' },
  { ministry: '法務省', count: 142, percentage: '2.4' }
];

// 事業区分データのサンプル
const projectTypeData = [
  { type: '前年度事業', count: 5538, percentage: '93.1' },
  { type: '新規開始事業', count: 289, percentage: '4.9' },
  { type: '終了事業', count: 121, percentage: '2.0' }
];

// 主要経費データのサンプル
const expenseTypeData = [
  { expense: 'その他の事項経費', count: 2345, percentage: '39.4' },
  { expense: '科学技術振興費', count: 1123, percentage: '18.9' },
  { expense: '社会保障費', count: 865, percentage: '14.5' },
  { expense: '公共事業関係費', count: 587, percentage: '9.9' },
  { expense: '経済安全保障推進費', count: 354, percentage: '5.9' },
  { expense: '地方財政対策費', count: 234, percentage: '3.9' },
  { expense: '防衛関係費', count: 156, percentage: '2.6' },
  { expense: '食料安全保障関係費', count: 132, percentage: '2.2' },
  { expense: '中小企業対策費', count: 98, percentage: '1.6' },
  { expense: '教育振興助成費', count: 54, percentage: '0.9' }
];

// パフォーマンスデータのサンプル
const performanceMetrics = {
  typeDistribution: [
    { type: 'アウトプット', count: 24567 },
    { type: 'アクティビティ', count: 18976 },
    { type: 'アウトカム', count: 12587 }
  ],
  projectPerformance: [
    { projectId: 3245, achievement: '132.5', projectName: '国際的な人材育成プログラム', ministry: '文部科学省' },
    { projectId: 1872, achievement: '124.3', projectName: 'デジタル技術による地域活性化支援事業', ministry: '総務省' },
    { projectId: 4567, achievement: '115.8', projectName: '先端医療技術研究開発プロジェクト', ministry: '厚生労働省' },
    { projectId: 2345, achievement: '112.4', projectName: '次世代エネルギー技術開発事業', ministry: '経済産業省' },
    { projectId: 5678, achievement: '107.6', projectName: '食品安全高度化プログラム', ministry: '農林水産省' },
    
    // 中略...（実際のデータでは多数のプロジェクトがある）
    
    // 下位パフォーマンス
    { projectId: 987, achievement: '45.2', projectName: '地域文化発信支援事業', ministry: '文部科学省' },
    { projectId: 654, achievement: '42.8', projectName: '後進地域交通インフラ整備事業', ministry: '国土交通省' },
    { projectId: 543, achievement: '38.5', projectName: '小規模事業者販路開拓支援', ministry: '経済産業省' },
    { projectId: 432, achievement: '31.7', projectName: '高齢者デジタル活用支援事業', ministry: '厚生労働省' },
    { projectId: 321, achievement: '25.9', projectName: '遊休農地活用推進事業', ministry: '農林水産省' }
  ]
};

// レビュー評価データのサンプル
const reviewMetrics = {
  reviewDistribution: [
    { review: '事業内容の一部改善', count: 2254, percentage: '39.6' },
    { review: '現状通り', count: 1987, percentage: '34.9' },
    { review: '事業全体の抜本的な改善', count: 876, percentage: '15.4' },
    { review: '終了予定', count: 342, percentage: '6.0' },
    { review: '廃止', count: 233, percentage: '4.1' }
  ],
  ministryReviewArray: [
    { ministry: '財務省', '現状通り': 45, '事業内容の一部改善': 89, '事業全体の抜本的な改善': 67, '終了予定': 22, '廃止': 11, total: 234, improvementRate: '66.7' },
    { ministry: '内閣府', '現状通り': 56, '事業内容の一部改善': 87, '事業全体の抜本的な改善': 78, '終了予定': 23, '廃止': 12, total: 256, improvementRate: '64.5' },
    { ministry: '経済産業省', '現状通り': 276, '事業内容の一部改善': 298, '事業全体の抜本的な改善': 112, '終了予定': 34, '廃止': 23, total: 743, improvementRate: '55.2' },
    { ministry: '厚生労働省', '現状通り': 387, '事業内容の一部改善': 356, '事業全体の抜本的な改善': 156, '終了予定': 54, '廃止': 34, total: 987, improvementRate: '51.9' },
    { ministry: '国土交通省', '現状通り': 243, '事業内容の一部改善': 234, '事業全体の抜本的な改善': 45, '終了予定': 32, '廃止': 24, total: 578, improvementRate: '48.3' },
    { ministry: '総務省', '現状通り': 198, '事業内容の一部改善': 167, '事業全体の抜本的な改善': 32, '終了予定': 21, '廃止': 14, total: 432, improvementRate: '46.1' },
    { ministry: '文部科学省', '現状通り': 621, '事業内容の一部改善': 412, '事業全体の抜本的な改善': 123, '終了予定': 56, '廃止': 33, total: 1245, improvementRate: '42.9' },
    { ministry: '外務省', '現状通り': 98, '事業内容の一部改善': 67, '事業全体の抜本的な改善': 12, '終了予定': 12, '廃止': 9, total: 198, improvementRate: '39.9' },
    { ministry: '農林水産省', '現状通り': 312, '事業内容の一部改善': 234, '事業全体の抜本的な改善': 17, '終了予定': 43, '廃止': 26, total: 632, improvementRate: '39.7' },
    { ministry: '環境省', '現状通り': 176, '事業内容の一部改善': 123, '事業全体の抜本的な改善': 11, '終了予定': 21, '廃止': 14, total: 345, improvementRate: '38.8' }
  ],
  improvementCases: [
    { projectId: 1234, reviewType: '事業全体の抜本的な改善', improvement: '事業の対象を若年層に絞り、デジタル技術活用を前提としたプログラムに刷新する。また、成果指標を見直し、就職率や収入向上率等の実質的効果を測定する。予算規模は50%縮小し、効率的な執行体制を構築する。', projectName: '職業訓練総合支援事業', ministry: '厚生労働省' },
    { projectId: 5678, reviewType: '事業内容の一部改善', improvement: '補助対象を中小企業に限定し、大企業向け支援は廃止。また、成果指標として導入設備の稼働率や省エネ効果を定量的に測定する体制を構築する。', projectName: '省エネ設備導入促進事業', ministry: '経済産業省' },
    { projectId: 9012, reviewType: '事業全体の抜本的な改善', improvement: '地方自治体への一律配分方式を廃止し、人口減少率や高齢化率等の指標に基づく傾斜配分方式に変更。また、事業の評価基準を明確化し、効果の低い取組は次年度以降の対象から除外する仕組みを導入する。', projectName: '地域活性化交付金', ministry: '総務省' },
    { projectId: 3456, reviewType: '事業内容の一部改善', improvement: '海外展開支援について、対象国を絞り込み、重点市場に集中した支援体制に移行。また、支援企業の選定基準を厳格化し、輸出実績や市場開拓計画の実現可能性を重視した審査を行う。', projectName: '農産物輸出促進対策事業', ministry: '農林水産省' },
    { projectId: 7890, reviewType: '事業全体の抜本的な改善', improvement: '従来の直接的な研究費補助から、産学連携を促進するマッチングファンド方式に転換。民間企業の資金負担を条件とし、実用化を見据えた研究開発を重点的に支援する体制に刷新する。', projectName: '先端研究開発支援プログラム', ministry: '文部科学省' },
    { projectId: 2345, reviewType: '事業内容の一部改善', improvement: '災害リスクの高い地域を優先的に対象とする選定基準を導入し、費用対効果の高い箇所から整備を進める。また、維持管理費の削減につながる新技術の積極的導入を図る。', projectName: '河川整備事業', ministry: '国土交通省' },
    { projectId: 6789, reviewType: '事業全体の抜本的な改善', improvement: '複数の類似事業を統合し、ワンストップの相談窓口を設置。また、創業後5年以内の企業に支援対象を絞り込み、経営指導と資金支援を一体的に行う体制を構築する。', projectName: '中小企業経営支援事業', ministry: '経済産業省' },
    { projectId: 1357, reviewType: '事業内容の一部改善', improvement: '補助率を見直し、事業者負担を30%から50%に引き上げることで、真に必要な設備投資に絞り込む。また、CO2削減量の目標値を引き上げ、より高い環境効果を求める。', projectName: '環境配慮型設備導入支援事業', ministry: '環境省' },
    { projectId: 2468, reviewType: '事業全体の抜本的な改善', improvement: '縦割りになっている複数の社会保障システムを統合し、マイナンバーと連携した一元的なプラットフォームを構築。これにより運用コストを3割削減するとともに、利用者の手続き負担を大幅に軽減する。', projectName: '社会保障情報システム整備事業', ministry: '厚生労働省' },
    { projectId: 8024, reviewType: '事業内容の一部改善', improvement: '補助対象を先端技術分野（AI、量子技術、バイオ等）に重点化し、汎用的な研究設備の支援は縮小する。また、複数大学による共同利用を条件とし、設備の稼働率向上を図る。', projectName: '研究設備整備費補助金', ministry: '文部科学省' }
  ]
};

// 契約方式データのサンプル
const contractData = [
  { method: '一般競争契約', count: 87654, percentage: '45.2' },
  { method: '随意契約', count: 65432, percentage: '33.7' },
  { method: '指名競争契約', count: 24321, percentage: '12.5' },
  { method: '企画競争', count: 12345, percentage: '6.4' },
  { method: 'その他', count: 4381, percentage: '2.2' }
];

// 支出先データのサンプル
const spendingMetrics = {
  typeDistribution: [
    { type: '株式会社', amount: 152345678901, percentage: '42.8' },
    { type: '特殊法人', amount: 87654321098, percentage: '24.6' },
    { type: '一般社団法人', amount: 43210987654, percentage: '12.1' },
    { type: '地方公共団体', amount: 32109876543, percentage: '9.0' },
    { type: '学校法人', amount: 21098765432, percentage: '5.9' },
    { type: '国立大学法人', amount: 10987654321, percentage: '3.1' },
    { type: 'その他', amount: 9876543210, percentage: '2.5' }
  ],
  topRecipients: [
    { name: '大手建設株式会社', amount: 12345678901, formattedAmount: '12,345,678,901', type: '株式会社' },
    { name: '国立研究開発法人科学技術振興機構', amount: 9876543210, formattedAmount: '9,876,543,210', type: '特殊法人' },
    { name: '大手電機メーカー株式会社', amount: 8765432109, formattedAmount: '8,765,432,109', type: '株式会社' },
    { name: '全国中小企業団体中央会', amount: 7654321098, formattedAmount: '7,654,321,098', type: '一般社団法人' },
    { name: '大手自動車メーカー株式会社', amount: 6543210987, formattedAmount: '6,543,210,987', type: '株式会社' },
    { name: '日本商工会議所', amount: 5432109876, formattedAmount: '5,432,109,876', type: '一般社団法人' },
    { name: '国立研究開発法人産業技術総合研究所', amount: 4321098765, formattedAmount: '4,321,098,765', type: '特殊法人' },
    { name: '○○県', amount: 3210987654, formattedAmount: '3,210,987,654', type: '地方公共団体' },
    { name: '△△大学', amount: 2109876543, formattedAmount: '2,109,876,543', type: '学校法人' },
    { name: '大手IT企業株式会社', amount: 1987654321, formattedAmount: '1,987,654,321', type: '株式会社' },
    { name: '一般財団法人医療イノベーション推進機構', amount: 1876543210, formattedAmount: '1,876,543,210', type: '一般財団法人' },
    { name: '××市', amount: 1765432109, formattedAmount: '1,765,432,109', type: '地方公共団体' },
    { name: '大手通信企業株式会社', amount: 1654321098, formattedAmount: '1,654,321,098', type: '株式会社' },
    { name: '国立大学法人□□大学', amount: 1543210987, formattedAmount: '1,543,210,987', type: '国立大学法人' },
    { name: '公益社団法人経済団体連合会', amount: 1432109876, formattedAmount: '1,432,109,876', type: '公益社団法人' },
    { name: '大手商社株式会社', amount: 1321098765, formattedAmount: '1,321,098,765', type: '株式会社' },
    { name: '中堅建設会社株式会社', amount: 1210987654, formattedAmount: '1,210,987,654', type: '株式会社' },
    { name: '国立研究開発法人医療研究開発機構', amount: 1109876543, formattedAmount: '1,109,876,543', type: '特殊法人' },
    { name: 'エネルギー関連企業株式会社', amount: 1098765432, formattedAmount: '1,098,765,432', type: '株式会社' },
    { name: '◇◇財団', amount: 987654321, formattedAmount: '987,654,321', type: '一般財団法人' }
  ]
};

// 全てのサンプルデータの保存
console.log('Generating sample data files...');
saveJSON(summary, 'summary.json');
saveJSON(ministryData, 'ministryData.json');
saveJSON(projectTypeData, 'projectTypeData.json');
saveJSON(expenseTypeData, 'expenseTypeData.json');
saveJSON(performanceMetrics, 'performanceMetrics.json');
saveJSON(reviewMetrics, 'reviewMetrics.json');
saveJSON(contractData, 'contractData.json');
saveJSON(spendingMetrics, 'spendingMetrics.json');
console.log('Sample data generation complete!');