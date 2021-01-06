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
