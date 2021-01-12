import { action, createAction } from 'typesafe-actions';
import { Config } from '../types/global';
import { DialogState, RootState } from '../reducers';
import { CardInfoList } from '../types/api';

const OPEN_NOTIFY = 'OPEN_NOTIFY';
const CLOSE_NOTIFY = 'CLOSE_NOTIFY';
const OPEN_DIALOG = 'OPEN_DIALOG';
const CLOSE_DIALOG = 'CLOSE_DIALOG';

const DIALOG_YES = 'DIALOG_YES';
const DIALOG_NO = 'DIALOG_NO';

const STORE_CONFIG = 'STORE_CONFIG';

const UPDATE_STATUS = 'UPDATE_STATUS';
export const updateStatus = createAction(UPDATE_STATUS, (action) => {
  return (status: RootState['reducer']['status']) => action(status);
});

export const storeConfig = createAction(STORE_CONFIG, (action) => {
  return (config: Config) => action(config);
});

/** 通知欄表示 */
export const changeNotify = createAction(OPEN_NOTIFY, (action) => {
  return (show: boolean, type: 'info' | 'warning' | 'error', message: string, closable?: boolean) => action({ show, type, message, closable: closable === false ? false : true });
});
/** 通知欄閉じる */
export const closeNotify = createAction(CLOSE_NOTIFY);

/** ダイアログ表示 */
export const changeDialog = createAction(OPEN_DIALOG, (action) => {
  return (args: Partial<DialogState>) => action(args);
});
/** ダイアログ閉じる */
export const closeDialog = createAction(CLOSE_DIALOG);
/** ダイアログでYesを押す */
export const dialogYes = createAction(DIALOG_YES, (action) => {
  return (args: any) => action(args);
});
/** ダイアログでNoを押す */
export const dialogNo = createAction(DIALOG_NO, (action) => {
  return (args: any) => action(args);
});

/** カード情報更新 */
export const updateCardInfo = createAction('UPDATE_CARD_INFO', (action) => {
  return (args: CardInfoList) => action(args);
});

/** お気に入り登録(画面クリック) */
export const addFavoriteSaga = createAction('ADD_FAVORITE_SAGA', (action) => {
  return (args: Omit<RootState['reducer']['favoriteList'][0], 'id'>) => action(args);
});
/** お気に入り登録 */
export const addFavorite = createAction('ADD_FAVORITE', (action) => {
  return (args: Omit<RootState['reducer']['favoriteList'][0], 'id'>) => action(args);
});

/** お気に入り更新 */
export const updateFavoriteSaga = createAction('UPDATE_FAVORITE_SAGA', (action) => {
  return (args: RootState['reducer']['favoriteList'][0]) => action(args);
});
/** お気に入り更新 */
export const updateFavorite = createAction('UPDATE_FAVORITE', (action) => {
  return (args: RootState['reducer']['favoriteList'][0]) => action(args);
});

/** お気に入り削除 */
export const deleteFavoriteSaga = createAction('DELETE_FAVORITE_SAGA', (action) => {
  return (args: number) => action(args);
});
/** お気に入り削除 */
export const deleteFavorite = createAction('DELETE_FAVORITE', (action) => {
  return (args: number) => action(args);
});

export const updateAllyCard = createAction('UPDATE_ALLY_CARD', (action) => {
  return (index: number, dressId: string | null) => action({ index, dressId });
});

export const updateEnemyCard = createAction('UPDATE_ENEMY_CARD', (action) => {
  return (index: number, dressId: string | null) => action({ index, dressId });
});

export const updateFilter = createAction('UPDATE_FILTER', (action) => {
  return (args: RootState['reducer']['filter']) => action(args);
});

export const resetFilter = createAction('REST_FILTER', (action) => {
  return () => action();
});

/** 編成共有ボタン */
export const shareCardsSaga = createAction('SHARE_CARDS', (action) => {
  return (args: { ally: (string | null)[]; enemy: (string | null)[] }) => action(args);
});
