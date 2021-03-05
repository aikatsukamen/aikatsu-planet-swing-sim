import { combineReducers } from 'redux';
import { ActionType, getType } from 'typesafe-actions';
import * as actions from '../actions';
import { CardInfo, CardInfoList } from '../types/api';
import { Config } from '../types/global';
type Action = ActionType<typeof actions>;

export type DialogState = {
  /** ダイアログ表示 */
  show: boolean;
  /** 確認ダイアログか否か */
  confirm: boolean;
  /** ダイアログ種別 */
  type: 'info' | 'warning' | 'error';
  /** 簡潔に表すメッセージ */
  message: string;
  /** テキストボックスとかで表示したい詳細 */
  detail: string;
};

export type GlobalState = {
  status: 'initialzing' | 'uploading' | 'posting' | 'ok' | 'error';
  /** 通知欄 */
  notify: {
    /** 表示可否 */
    show: boolean;
    /** 色 */
    type: 'info' | 'warning' | 'error';
    /** メッセージ */
    message: string;
    /** 手動で閉じられるか */
    closable: boolean;
  };
  /** ダイアログ */
  dialog: DialogState;
  /** 設定ファイルの内容 */
  config: Config;
  /** カード情報 */
  cardInfo: CardInfoList;
  /** カード一覧の絞り込み条件 */
  filter: {
    /** カード名 */
    name: string;
    /** ドレシアタイプ */
    dressiaType: string;
    /** スイングレベル */
    level: number;
    /** スイングレベルの基準。イコール、以上、以下 */
    levelCond: 0 | 1 | 2;
    /** スキルテキストで検索 */
    skillText: string;
    /**
     * 効果タイプ
     * - 0: 未指定
     * - 1: スキル無し
     * - 2: レベル
     * - 3: たまりやすい
     * - 4: チャンス
     */
    skillEffectType: 0 | 1 | 2 | 3 | 4;
    /** 効果量 */
    skillEffectValue: number;
  };
  /** 相手のスイング */
  enemyCardList: (string | null)[];
  /** 味方のスイング */
  allyCardList: (string | null)[];
  /** お気に入りリスト */
  favoriteList: {
    id: number;
    card: (string | null)[];
  }[];
};

export type RootState = {
  reducer: GlobalState;
};

const initial: GlobalState = {
  status: 'ok',
  // 通知欄
  notify: {
    show: false,
    type: 'info',
    message: '',
    closable: true,
  },
  dialog: {
    show: false,
    confirm: false,
    type: 'info',
    message: '',
    detail: '',
  },
  config: {
    api: {
      cardInfoBase: '',
    },
    cardInfo: {
      promoVersion: [],
      versionBase: 0,
    },
  },
  cardInfo: [],
  filter: {
    name: '',
    dressiaType: '',
    level: 0,
    levelCond: 0,
    skillText: '',
    skillEffectType: 0,
    skillEffectValue: 0,
  },
  allyCardList: [],
  enemyCardList: [],
  favoriteList: [],
};

const reducer = (state: GlobalState = initial, action: Action): GlobalState => {
  switch (action.type) {
    case getType(actions.updateStatus): {
      return { ...state, status: action.payload };
    }
    case getType(actions.storeConfig): {
      return { ...state, config: action.payload };
    }
    case getType(actions.changeNotify): {
      return { ...state, notify: { ...action.payload } };
    }
    case getType(actions.closeNotify): {
      return { ...state, notify: { ...state.notify, show: false } };
    }
    case getType(actions.changeDialog): {
      if (action.payload.show === false) {
        return { ...state, dialog: initial.dialog };
      } else {
        return { ...state, dialog: { ...state.dialog, ...action.payload } };
      }
    }
    case getType(actions.closeDialog): {
      return { ...state, dialog: { ...initial.dialog } };
    }
    case getType(actions.updateCardInfo): {
      return {
        ...state,
        cardInfo: action.payload,
      };
    }
    case getType(actions.addFavorite): {
      const id = state.favoriteList.length > 0 ? state.favoriteList[state.favoriteList.length - 1].id + 1 : 1;
      return {
        ...state,
        favoriteList: [
          ...state.favoriteList,
          {
            id,
            card: action.payload.card,
          },
        ],
      };
    }
    case getType(actions.updateFavorite): {
      const favoriteList = [];
      for (const fav of state.favoriteList) {
        if (fav.id === action.payload.id) {
          favoriteList.push(action.payload);
        } else {
          favoriteList.push(fav);
        }
      }
      return {
        ...state,
        favoriteList,
      };
    }
    case getType(actions.deleteFavorite): {
      const favoriteList = [];
      for (const fav of state.favoriteList) {
        if (fav.id !== action.payload) {
          favoriteList.push(fav);
        }
      }
      return {
        ...state,
        favoriteList,
      };
    }
    case getType(actions.updateAllyCard): {
      const allyCardList = [...state.allyCardList];
      allyCardList[action.payload.index] = action.payload.dressId;
      return {
        ...state,
        allyCardList,
      };
    }
    case getType(actions.updateEnemyCard): {
      const enemyCardList = [...state.enemyCardList];
      enemyCardList[action.payload.index] = action.payload.dressId;
      return {
        ...state,
        enemyCardList,
      };
    }
    case getType(actions.updateFilter): {
      return {
        ...state,
        filter: action.payload,
      };
    }
    case getType(actions.resetFilter): {
      return {
        ...state,
        filter: { ...initial.filter },
      };
    }
    default:
      return state;
  }
};

export default combineReducers({ reducer });
