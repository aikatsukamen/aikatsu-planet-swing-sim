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
  yield call(checkQuery);
  yield takeEvery(actions.shareCards, shareCards);
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

  list = list.sort((a, b) => {
    if (a.dressId > b.dressId) return 1;
    if (a.dressId < b.dressId) return -1;
    return 0;
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

function* shareCards(action: ReturnType<typeof actions.shareCards>) {
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
