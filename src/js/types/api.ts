export type CardInfoList = CardInfo[];
export type CardInfo = {
  /** スイングID */
  cardId: string;
  /** スイング名 */
  cardName: string;
  /** ドレシアタイプ(カタカナ) */
  dressiaType: string;
  /** レアリティ(英大文字) */
  rarity: string;
  /** レベル */
  level: number;
  skill: {
    text: {
      /** スキル全文 */
      full: string;
      /** スキル条件文 */
      condition: string;
      /** スキル効果文 */
      effect: string;
    };
    condition: {
      /**
       * 効果発動条件の対象
       * - -1: (何らかの理由で判定できなかった)
       * - 0: ドレシアチャンスで勝ったら
       * - 100: あいてのタイプがXXXだったら
       * - 101: あいてのレアリティがXXXだったら
       * - 102: あいてのドレシアがXXXだったら（名前）
       * - 103: あいてのドレシアがXXXだったら（レアリティ、名前）
       * - 104: あいてのレベルがXXXより大きかったら
       * - 105: あいてのレベルがXXXより小さかったら
       * - 200: なかまにタイプがいたら
       * - 201: なかまにレアリティがいたら
       * - 202: なかまにドレシアがいたら（名前）
       * - 203: なかまにドレシアがいたら（レアリティ、名前）
       * - 300: じぶんのアバターパーツがXXXだったら
       * - 400: XXXXにセットしたら(スロット)
       * - 401: XXXXにセットしたら(時刻)
       * - 500: イベント中だったら
       */
      value: number;
      /** 条件: ドレシアタイプ */
      dressiaType: string;
      /** 条件: レアリティ */
      rarity: string;
      /** 条件: ～より大きい */
      level: number;
      /** 条件: ドレシア名 */
      cardname: string;
      /** 条件: アバターパーツ部位 */
      avatarCategory: string;
      /** 条件: アバターパーツ名 */
      avatarName: string;
      /** 条件: スロット位置 */
      slot: string;
      /** 条件: 時刻 */
      time: string;
    };
    effect: {
      /**
       * 効果対象
       */
      target: {
        /**
         * 対象種別
         * - 0: じぶん
         * - 1: なかま
         * - 2: ぜんいん
         * - 3: オープニング
         * - 4: メイン
         * - 5: クライマックス
         * - 6: タイプ
         * - 7: レアリティ
         */
        type: number;
        /** ドレシアタイプ */
        dressiaType: string;
        /** レアリティ */
        rarity: string;
      };
      /**
       * 効果種別
       * - 0: レベル
       * - 1: ドレシアゲージがたまりやすい
       * - 2: ドレシアチャンスボーナスがアップする
       * - 3: パーフェクトがとりやすい
       */
      type: number;
      /** レベル増加量 */
      level: number;
      /**
       * ドレシアゲージがたまりやすい
       * - 0: なし
       * - 1: たまりやすい
       * - 2: とてもたまりやすい
       * - 3: すごくたまりやすい
       */
      scoreup: number;
      /**
       * ドレシアチャンスボーナス
       * - 0: なし
       * - 1: たまりやすい
       * - 2: とてもたまりやすい
       * - 3: すごくたまりやすい
       */
      chancebonus: number;
      /**
       * パーフェクトがとりやすい
       * - 0: なし
       * - 1: とりやすい
       * - 2: とてもとりやすい
       * - 3: すごくとりやすい
       */
      judgeSupportPerfect: number;
    };
  };
  /** スイング画像URL(表) */
  imageUrl1: string;
  /** スイング画像URL(裏) */
  imageUrl2: string;
  /** イラストレーター */
  illust: string;
  /** 弾ID */
  versionId: string;
  /** スイング固有ID */
  dressId: string;
  /** フレーバーテキスト */
  fravorText: string;
  /** 備考(プロモのみ) */
  note: string;
  /** 入手方法 */
  howtoget: string;
};
