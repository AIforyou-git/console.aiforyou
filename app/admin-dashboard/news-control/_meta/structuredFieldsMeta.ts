// structuredFieldsMeta.ts

export type StructuredFieldMeta = {
    key: string;
    label: string;
    description: string;
    importance: '高' | '中' | '低';
  };
  
  export const structuredFieldsMeta: StructuredFieldMeta[] = [
    {
      key: 'structured_title',
      label: 'タイトル',
      description: '構造化された見出しタイトル',
      importance: '高'
    },
    {
      key: 'structured_agency',
      label: '募集機関',
      description: '実施主体の名称',
      importance: '中'
    },
    {
      key: 'structured_prefecture',
      label: '地域（大）',
      description: '都道府県単位の地域情報',
      importance: '中'
    },
    {
      key: 'structured_city',
      label: '地域（小）',
      description: '市区町村単位の地域情報',
      importance: '中'
    },
    {
      key: 'structured_application_period',
      label: '期間',
      description: '公募期間（開始日と終了日）',
      importance: '中'
    },
    {
      key: 'structured_industry_keywords',
      label: '業種',
      description: '関連する業種キーワード',
      importance: '中'
    },
    {
      key: 'structured_grant_type',
      label: 'カテゴリ',
      description: '補助金、助成金などの種別',
      importance: '中'
    },
    {
      key: 'structured_purpose',
      label: '目的',
      description: '制度の目的や支援理由',
      importance: '中'
    },
    {
      key: 'structured_amount_description',
      label: '金額説明',
      description: '支援金額の説明文',
      importance: '中'
    },


    {
      key: 'structured_summary_extract',
      label: '自動要約',
      description: '要点だけ把握できる。UI表示に便利。',
      importance: '高',
    },
    {
      key: 'structured_keywords',
      label: '自動キーワード',
      description: 'カテゴリ横断の検索や類似案件発見に強い。',
      importance: '中',
    },
    {
      key: 'structured_tags',
      label: 'タグ補助語',
      description: '検索・分類の補助に使う自由記述タグ。',
      importance: '中',
    },
    {
      key: 'structured_contact_info',
      label: '問い合わせ先',
      description: 'ユーザー行動導線として必須。',
      importance: '高',
    },
    {
      key: 'structured_by_gpt',
      label: 'GPT構造化済',
      description: 'メンテナンス性・構造化精度の追跡用。',
      importance: '中',
    },
    {
      key: 'structured_at',
      label: '構造化時刻',
      description: 'いつ構造化されたかの記録。',
      importance: '低',
    },
    {
      key: 'structured_support_scale',
      label: '支援規模',
      description: '従業員数や売上などの目安。',
      importance: '中',
    },
    {
      key: 'structured_grant_target_desc',
      label: '対象条件の説明',
      description: '条件判断の補助や法的制限の把握。',
      importance: '中',
    },
    {
      key: 'structured_success',
      label: '成功判定',
      description: '実用評価 or 自動フィルタリングで活用。',
      importance: '中',
    },
    {
      key: 'structured_retry_required',
      label: '構造化再試行',
      description: '品質管理。構造化失敗時の再挑戦記録。',
      importance: '中',
    },
    {
      key: 'structured_retry_at',
      label: '再試行時刻',
      description: '構造化やり直しの実行タイムスタンプ。',
      importance: '低',
    },
    {
      key: 'structured_retry_count',
      label: '再試行回数',
      description: '再試行履歴の回数（自動再試行で活用）。',
      importance: '低',
    },
    {
      key: 'needs_review',
      label: '要確認フラグ',
      description: '人間によるレビューが必要な項目に設定。',
      importance: '中',
    },
  ];
  