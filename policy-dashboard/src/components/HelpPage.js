import React from 'react';
import { Typography, Divider, Card, Steps, Row, Col, Space, Tag } from 'antd';
import { 
  BarChartOutlined, 
  DotChartOutlined, 
  DollarOutlined, 
  ToolOutlined,
  QuestionCircleOutlined,
  SolutionOutlined, 
  UsergroupAddOutlined, 
  SearchOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { Step } = Steps;

const HelpPage = () => {
  return (
    <div className="help-page" style={{ padding: '0 20px' }}>
      <Typography>
        <Title level={2}>政策透明化ダッシュボード 使い方ガイド</Title>
        <Paragraph>
          このダッシュボードは日本国政府の政策運営の透明性を向上させ、納税者が政策情報へ簡単にアクセスできるようにするために開発されました。予算の配分、執行状況、成果を視覚的にわかりやすく表示します。
        </Paragraph>

        <Divider />

        <Title level={3}>ユースケース - 納税者が知りたいこと</Title>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Card title={<><QuestionCircleOutlined /> ユースケース 1: 総合的な政策情報の把握</>} style={{ marginBottom: 20 }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={6}>
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                  <UsergroupAddOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                  <div><Text strong>対象ユーザー</Text></div>
                  <div>一般の納税者</div>
                </div>
              </Col>
              <Col xs={24} md={18}>
                <Title level={4}>「税金がどのように使われているか全体像を知りたい」</Title>
                <Paragraph>
                  納税者として、様々な府省庁がどのように予算を使い、どのような事業を行っているのか知りたいと思っています。新規事業と終了する事業の割合や、政府が力を入れている分野がわかれば、政策の方向性を理解する助けになります。
                </Paragraph>
                <Steps current={-1} direction="vertical" size="small">
                  <Step title="政策概要ダッシュボードを開く" description="左側メニューの「政策概要」をクリックして開きます。" />
                  <Step title="KPI概要カードで全体数を確認" description="総事業数や新規事業数など、基本情報をまず確認します。" />
                  <Step title="府省庁別事業数のツリーマップを確認" description="どの府省庁が多くの事業を持っているか視覚的に把握できます。" />
                  <Step title="主要経費分布グラフで優先分野を確認" description="予算がどのような分野に重点的に配分されているか把握できます。" />
                </Steps>
              </Col>
            </Row>
          </Card>
          
          <Card title={<><QuestionCircleOutlined /> ユースケース 2: 事業の効果・成果の確認</>} style={{ marginBottom: 20 }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={6}>
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                  <SolutionOutlined style={{ fontSize: 48, color: '#52c41a' }} />
                  <div><Text strong>対象ユーザー</Text></div>
                  <div>政策に関心のある市民</div>
                </div>
              </Col>
              <Col xs={24} md={18}>
                <Title level={4}>「事業は目標を達成しているのか？税金の効果を知りたい」</Title>
                <Paragraph>
                  予算が使われるだけでなく、しっかりと成果を出しているのかを知りたいと思っています。目標達成率の高い事業と低い事業を比較して、効果的な政策と改善が必要な政策を見分けたいです。
                </Paragraph>
                <Steps current={-1} direction="vertical" size="small">
                  <Step title="事業パフォーマンスダッシュボードを開く" description="左側メニューの「事業パフォーマンス」をクリックします。" />
                  <Step title="指標種別の統計カードで評価方法を理解" description="アクティビティ、アウトプット、アウトカムの各指標数を確認します。" />
                  <Step title="目標達成度分布の散布図で全体傾向を把握" description="多くの事業が目標を達成しているか視覚的に確認できます。" />
                  <Step title="高/低パフォーマンス事業の具体例を確認" description="特に成果の高い/低い事業の詳細を表で確認できます。" />
                </Steps>
              </Col>
            </Row>
          </Card>
          
          <Card title={<><QuestionCircleOutlined /> ユースケース 3: 予算執行の透明性確認</>} style={{ marginBottom: 20 }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={6}>
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                  <SearchOutlined style={{ fontSize: 48, color: '#fa8c16' }} />
                  <div><Text strong>対象ユーザー</Text></div>
                  <div>予算監視に関心のある市民</div>
                </div>
              </Col>
              <Col xs={24} md={18}>
                <Title level={4}>「予算はどこに流れ、誰が受け取っているのか？」</Title>
                <Paragraph>
                  税金がどのような方法で使われ、最終的にどのような組織に流れているのかを知りたいです。契約方式は公正か、特定の企業に偏った支出がないかなど、透明性の観点から確認したいと思っています。
                </Paragraph>
                <Steps current={-1} direction="vertical" size="small">
                  <Step title="予算執行ダッシュボードを開く" description="左側メニューの「予算執行」をクリックします。" />
                  <Step title="契約方式別の分布を確認" description="一般競争入札や随意契約など、どのような方法で契約されているかを確認します。" />
                  <Step title="支出先種別分布で資金の流れを把握" description="公的機関や民間企業など、どのような種類の組織に予算が流れているか把握できます。" />
                  <Step title="支出先上位リストで具体的な受取先を確認" description="最も多くの予算を受け取っている具体的な組織名を確認できます。" />
                </Steps>
              </Col>
            </Row>
          </Card>
          
          <Card title={<><QuestionCircleOutlined /> ユースケース 4: 事業改善の取り組み確認</>} style={{ marginBottom: 20 }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={6}>
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                  <ToolOutlined style={{ fontSize: 48, color: '#f5222d' }} />
                  <div><Text strong>対象ユーザー</Text></div>
                  <div>政策評価に関心のある市民</div>
                </div>
              </Col>
              <Col xs={24} md={18}>
                <Title level={4}>「行政事業レビューは実際に改善につながっているのか？」</Title>
                <Paragraph>
                  政府の自己評価システムである行政事業レビューが実際に機能し、事業改善につながっているのか知りたいです。どのような評価がなされ、具体的にどのような改善が行われているのかを確認したいと思っています。
                </Paragraph>
                <Steps current={-1} direction="vertical" size="small">
                  <Step title="政策改善トラッカーダッシュボードを開く" description="左側メニューの「政策改善トラッカー」をクリックします。" />
                  <Step title="レビュー結果分布で評価傾向を確認" description="「現状通り」「改善」「廃止」など、どのような評価結果が多いか把握できます。" />
                  <Step title="府省庁別改善率で組織別の傾向を把握" description="どの府省庁が積極的に改善に取り組んでいるか比較できます。" />
                  <Step title="改善事例ハイライトで具体的な内容を確認" description="実際にどのような改善が行われているか、具体例を通して理解できます。" />
                </Steps>
              </Col>
            </Row>
          </Card>
        </Space>

        <Divider />

        <Title level={3}>ダッシュボードの特徴</Title>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={6}>
            <Card title={<><BarChartOutlined /> 政策概要</>} style={{ height: '100%' }}>
              <ul>
                <li>総事業数と内訳</li>
                <li>府省庁別事業分布</li>
                <li>事業区分（新規/継続/終了）</li>
                <li>主要経費区分の分布</li>
              </ul>
            </Card>
          </Col>
          <Col xs={24} md={6}>
            <Card title={<><DotChartOutlined /> 事業パフォーマンス</>} style={{ height: '100%' }}>
              <ul>
                <li>指標種別の分布</li>
                <li>目標達成率の分布</li>
                <li>高パフォーマンス事業</li>
                <li>低パフォーマンス事業</li>
              </ul>
            </Card>
          </Col>
          <Col xs={24} md={6}>
            <Card title={<><DollarOutlined /> 予算執行</>} style={{ height: '100%' }}>
              <ul>
                <li>契約方式の分布</li>
                <li>支出先種別の割合</li>
                <li>大口支出先リスト</li>
                <li>支出先種別の比較</li>
              </ul>
            </Card>
          </Col>
          <Col xs={24} md={6}>
            <Card title={<><ToolOutlined /> 政策改善トラッカー</>} style={{ height: '100%' }}>
              <ul>
                <li>レビュー結果の分布</li>
                <li>府省庁別の改善率</li>
                <li>改善事例のハイライト</li>
                <li>評価と改善の連動性</li>
              </ul>
            </Card>
          </Col>
        </Row>

        <Divider />

        <Title level={3}>フィルター機能の活用方法</Title>
        <Paragraph>
          左側のサイドバーにあるフィルター機能を使うことで、より具体的で絞り込んだ分析が可能です。
          例えば、以下のような分析ができます：
        </Paragraph>
        <ul>
          <li><Tag color="blue">府省庁</Tag> 特定の府省庁（例：文部科学省）のデータのみを表示</li>
          <li><Tag color="green">事業区分</Tag> 新規事業のみを表示して、新たな政策の方向性を把握</li>
          <li><Tag color="orange">レビュー評価</Tag> 「抜本的改善」評価を受けた事業のみを表示</li>
          <li><Tag color="red">組み合わせ</Tag> 「経済産業省の新規事業のうち、一部改善が必要とされるもの」など</li>
        </ul>

        <Divider />
        
        <Title level={3}>データソースについて</Title>
        <Paragraph>
          このダッシュボードは、2024年度の行政事業レビューのデータを基にしています。データは<a href="https://rssystem.go.jp/top" target="_blank" rel="noopener noreferrer">行政事業レビュー見える化サイト</a>から入手したCSVファイルから集計・処理されています：
        </Paragraph>
        <ul>
          <li>基本情報・事業概要等</li>
          <li>効果発現経路・目標・実績</li>
          <li>効果発現経路・目標のつながり</li>
          <li>点検・評価</li>
          <li>支出先・支出情報</li>
        </ul>
        <Paragraph>
          すべてのデータは前処理され、パフォーマンスを最適化するためJSONとして保存されています。
        </Paragraph>
        
        <Title level={4}>行政事業レビューとは</Title>
        <Paragraph>
          行政事業レビューとは、各府省庁が、予算や基金を用いて行う原則すべての事業を、毎年度、自ら点検し、その点検結果を公表する取組です。
        </Paragraph>
        <Paragraph>
          EBPM(Evidence-Based Policy Making: エビデンスに基づく政策立案)の手法等を用いて、事業の目的・課題を踏まえて成果指標を設定し、外部の視点も活用して点検を行います。
        </Paragraph>
        <Paragraph>
          点検結果は翌年度の予算要求や事業の執行等に反映し、事業の効果的・効率的な実施につなげます。
        </Paragraph>
        <Paragraph>
          <strong>EBPM（エビデンスに基づく政策立案）とは</strong>：①政策目的、②その目的達成のために効果的な政策手段、③政策手段と目的の論理的なつながり（ロジック）を明確にし、さらに、④このつながりの裏付けとなるデータ等のエビデンス（根拠）を可能な限り求めることで、政策立案・実施・評価を実証的なものとし、政策の実効性や効率性を高めていく手法。
        </Paragraph>
      </Typography>
    </div>
  );
};

export default HelpPage;