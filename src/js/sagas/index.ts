import { select, call, put, take, takeEvery, race } from 'redux-saga/effects';
import * as actions from '../actions';
import { confirmSaga } from './dialog';
import { RootState } from '../reducers';
import { Config, GeneratorType } from '../types/global';
import { fetchJson } from './common';
import { CardInfoList } from '../types/api';

export default function* rootSaga() {
  yield call(fetchConfig);
  yield call(fetchCardInfo);
  yield call(loadStorage);
  yield call(checkQuery);
  yield takeEvery(actions.shareCardsSaga, shareCards);
  yield takeEvery(actions.addFavoriteSaga, addFavorite);
  yield takeEvery(actions.updateFavoriteSaga, updateFavorite);
  yield takeEvery(actions.deleteFavoriteSaga, deleteFavorite);
}

function* errorHandler(error: any) {
  try {
    const message = (error.message as string) || '予期せぬエラーが発生しました。';
    yield put(actions.changeNotify(true, 'error', message));
    yield put(actions.updateStatus('error'));
  } catch (e) {
    console.error('★激辛だ★');
  }
}

function* fetchConfig() {
  try {
    const config: Config = yield call(fetchJson, './config.json');
    yield put(actions.storeConfig(config));
  } catch (error) {
    yield call(errorHandler, error);
  }
}

function* fetchCardInfo() {
  const state: RootState = yield select();

  let list: CardInfoList = [];
  // プロモデータ取得
  for (const version of state.reducer.config.cardInfo.promoVersion) {
    try {
      const cardinfo: CardInfoList = yield call(fetchJson, `${state.reducer.config.api.cardInfoBase}/${version}.json`);
      list.push(...cardinfo);
    } catch (e) {
      console.error(e);
    }
  }

  // 通常弾データ取得
  let iscontinue = true;
  let i = 1;
  while (iscontinue) {
    const baseId = state.reducer.config.cardInfo.versionBase;
    console.log(baseId);
    const versionId = baseId + i;
    try {
      const cardinfo: CardInfoList = yield call(fetchJson, `${state.reducer.config.api.cardInfoBase}/${versionId}.json`);
      list.push(...cardinfo);
    } catch (e) {
      console.error(e);
      iscontinue = false;
    }
    i++;
  }

  // カードIDでソート
  list = list.sort((a, b) => {
    // if (a.dressId > b.dressId) return 1;
    // if (a.dressId < b.dressId) return -1;
    try {
      const a1 = a.cardId.split('-')[0];
      const a2 = a.cardId.split('-')[1];

      const b1 = b.cardId.split('-')[0];
      const b2 = b.cardId.split('-')[1];

      if (a1 > b1) return 1;
      if (a1 < b1) return -1;

      if (Number(a2) > Number(b2)) return 1;
      if (Number(a2) < Number(b2)) return -1;

      return 0;
    } catch (e) {
      return 0;
    }
  });

  // 更新
  yield put(actions.updateCardInfo(list));
}

/** クエリからカード情報取得する */
function* checkQuery() {
  const queryText = window.location.search.slice(1);
  console.log(`Query: ${queryText}`);
  if (!queryText) return;

  const queries = queryText.split('&');
  const kvList = queries.map((q) => q.split('='));
  console.log(kvList);

  // 編成初期値
  let ally: string[] = [];
  let enemy: string[] = [];

  for (const kv of kvList) {
    if (kv.length !== 2) continue;
    // 編成初期値
    if (kv[0] === 'ally') {
      if (kv[1].match(/\d*,\d*,\d*/)) {
        ally = kv[1].split(',');
      }
    }
    if (kv[0] === 'enemy') {
      if (kv[1].match(/\d*,\d*,\d*/)) {
        enemy = kv[1].split(',');
      }
    }
  }

  // 編成初期値
  if (ally.length === 3 && enemy.length === 3) {
    console.log('スイング初期値設定');
    for (let i = 0; i < ally.length; i++) {
      yield put(actions.updateAllyCard(i, ally[i]));
    }
    for (let i = 0; i < enemy.length; i++) {
      yield put(actions.updateEnemyCard(i, enemy[i]));
    }
  }
}

function* shareCards(action: ReturnType<typeof actions.shareCardsSaga>) {
  if (navigator.clipboard) {
    const baseUrl = window.location.href.replace(/\?.*$/, '');
    const ally = action.payload.ally.join();
    const enemy = action.payload.enemy.join();
    const url = `${baseUrl}?ally=${ally}&enemy=${enemy}`;
    navigator.clipboard.writeText(url);
    yield put(actions.changeNotify(true, 'info', '共有URLをコピーしました', true));
  } else {
    yield put(actions.changeNotify(true, 'warning', 'このブラウザでは対応してないよ！', true));
  }
}

const LOCALSTORAGE_FAVORITE = 'favorite';

/** ローカルストレージからデータ読み込み */
function* loadStorage() {
  // お気に入り
  const favStr = window.localStorage.getItem(LOCALSTORAGE_FAVORITE);
  if (favStr) {
    const fav = JSON.parse(favStr);
    if (Array.isArray(fav) && fav.length > 0) {
      for (const f of fav) {
        yield put(actions.addFavorite(f));
      }
    }
  }
}

function* addFavorite(action: ReturnType<typeof actions.addFavoriteSaga>) {
  yield put(actions.addFavorite(action.payload));

  const state: RootState = yield select();
  window.localStorage.setItem(LOCALSTORAGE_FAVORITE, JSON.stringify(state.reducer.favoriteList));
}

function* updateFavorite(action: ReturnType<typeof actions.updateFavoriteSaga>) {
  //
}

function* deleteFavorite(action: ReturnType<typeof actions.deleteFavoriteSaga>) {
  const ret = yield call(confirmSaga, 'お気に入りから削除してもよろしいですか？', 'info');
  if (!ret) return;

  yield put(actions.deleteFavorite(action.payload));
}
