import { Button, IconButton, MenuItem, Paper, Select, Tooltip, Hidden } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import React from 'react';
import { connect } from 'react-redux';
import * as actions from '../../../actions';
import { RootState } from '../../../reducers';
import { calcEffectLevel } from '../../../sagas/common';
import Modal from '../../molecules/Modal';
import Snackbar from '../../molecules/SnackBar';
import Dialog from '../../organisms/Dialog';
import CardSlot from '../../molecules/CardSlot';
import CardFilter from '../../organisms/CardFilter';
import { CardInfoList } from '../../../types/api';
import CasinoIcon from '@material-ui/icons/Casino';
import FilterListIcon from '@material-ui/icons/FilterList';
import FavoriteList from '../../organisms/FavoriteList';
import TempCardList from '../../organisms/TempCardList';
import ShareIcon from '@material-ui/icons/Share';
import StarRateIcon from '@material-ui/icons/StarRate';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: 5,
      justifyContent: 'center',
      display: 'flex',
      height: 'calc(100vh - 10px)',
      width: 'calc(100vw - 10px)',
    },
    mobileContent: {
      maxWidth: 1000,
      width: '100%',
      display: 'initial',
      height: '100%',
    },
    pcContent: {
      width: '40vw',
      maxWidth: 600,
      display: 'initial',
      height: '100%',
    },
    pcSubContent: {
      width: '30vw',
      maxWidth: 300,
      height: '100%',
      marginLeft: 10,
      marginRight: 10,
    },
    slotButtonArea: {
      display: 'flex',
      justifyContent: 'center',
    },
    slotDispArea: {
      width: '100%',
      height: '33vh',
      maxHeight: 250,
      display: 'flex',
      justifyContent: 'center',
    },
    pcSlotSelectButton: {
      padding: 0,
      minWidth: 'initial',
      width: 30,
    },
    footer: {
      position: 'fixed',
      bottom: 0,
      width: 'calc(100% - 10px)',
      maxWidth: 1000,
      justifyContent: 'center',
    },
    pcfooter: {
      height: 'calc(100vh - 600px)',
    },
    button: {
      margin: 5,
      whiteSpace: 'nowrap',
    },
  }),
);

type ComponentProps = ReturnType<typeof mapStateToProps>;
type ActionProps = typeof mapDispatchToProps;

type PropsType = ComponentProps & ActionProps;
const App: React.FC<PropsType> = (props: PropsType) => {
  const classes = useStyles({});

  const [ally, setAlly] = React.useState<(string | null)[]>(props.allyCardList);
  const [enemy, setEnemy] = React.useState<(string | null)[]>(props.enemyCardList);
  // const [ally, setAlly] = React.useState<(string | null)[]>(['165599', '163835', '163817']);
  // const [enemy, setEnemy] = React.useState<(string | null)[]>(['163799', '163799', '163799']);
  const [cardList, setCardList] = React.useState<CardInfoList>([]);
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [favoriteOpen, setFavoriteOpen] = React.useState(false);

  const [tempCardList, setTempCardList] = React.useState<string[]>([]);
  const addTempCard = (id: string) => () => {
    setTempCardList([...tempCardList, id]);
  };

  React.useEffect(() => {
    if (props.allyCardList.length > 0) setAlly(props.allyCardList);
  }, [props.allyCardList.join()]);
  React.useEffect(() => {
    if (props.enemyCardList.length > 0) setEnemy(props.enemyCardList);
  }, [props.enemyCardList.join()]);

  // フィルター
  React.useEffect(() => {
    let newList: typeof props.cardList = props.cardList;
    const filter = props.filter;
    console.log(props.filter);

    // 名前フィルタ
    if (filter.name) {
      newList = newList.filter((value) => value.cardName.includes(filter.name));
    }

    // ドレシアタイプフィルタ
    if (filter.dressiaType) {
      newList = newList.filter((value) => value.dressiaType.includes(filter.dressiaType));
    }

    // レベルフィルタ
    if (filter.level) {
      switch (filter.levelCond) {
        case 0:
          newList = newList.filter((value) => value.level === filter.level);
          break;
        case 1:
          newList = newList.filter((value) => value.level >= filter.level);
          break;
        case 2:
          newList = newList.filter((value) => value.level <= filter.level);
          break;
      }
    }

    // スキルテキスト
    if (filter.skillText) {
      newList = newList.filter((value) => value.skill.text.full.includes(filter.skillText));
    }

    // スキル効果を持ってる
    if (filter.skillEffectType) {
      switch (filter.skillEffectType) {
        case 1:
          newList = newList.filter((value) => value.skill.effect.level === 0 && value.skill.effect.scoreup === 0 && value.skill.effect.chancebonus === 0);
          break;
        case 2:
          newList = newList.filter((value) => value.skill.effect.level > 0);
          break;
        case 3:
          newList = newList.filter((value) => value.skill.effect.scoreup > 0);
          break;
        case 4:
          newList = newList.filter((value) => value.skill.effect.chancebonus > 0);
          break;
      }
    }

    // スキル効果の値
    if (filter.skillEffectType && filter.skillEffectValue) {
      console.log(`skillEffectType: ${filter.skillEffectType}   skillEffectValue: ${filter.skillEffectValue}`);
      switch (filter.skillEffectType) {
        case 2:
          newList = newList.filter((value) => value.skill.effect.level === filter.skillEffectValue);
          break;
        case 3:
          newList = newList.filter((value) => value.skill.effect.scoreup === filter.skillEffectValue);
          break;
        case 4:
          newList = newList.filter((value) => value.skill.effect.chancebonus === filter.skillEffectValue);
          break;
      }
    }

    setCardList(newList);
    setSelectCard('-');
  }, [props.cardList.length, Object.values(props.filter).join()]);

  const [cardStatus, setCardStatus] = React.useState<{
    ally: {
      baseLevel: number;
      effectLevel: number;
      scoreup: number;
      chanceBonus: number;
    }[];
    enemy: {
      baseLevel: number;
      effectLevel: number;
      scoreup: number;
      chanceBonus: number;
    }[];
  }>({
    ally: [
      {
        baseLevel: 0,
        effectLevel: 0,
        scoreup: 0,
        chanceBonus: 0,
      },
      {
        baseLevel: 0,
        effectLevel: 0,
        scoreup: 0,
        chanceBonus: 0,
      },
      {
        baseLevel: 0,
        effectLevel: 0,
        scoreup: 0,
        chanceBonus: 0,
      },
    ],
    enemy: [
      {
        baseLevel: 0,
        effectLevel: 0,
        scoreup: 0,
        chanceBonus: 0,
      },
      {
        baseLevel: 0,
        effectLevel: 0,
        scoreup: 0,
        chanceBonus: 0,
      },
      {
        baseLevel: 0,
        effectLevel: 0,
        scoreup: 0,
        chanceBonus: 0,
      },
    ],
  });

  const [selectCard, setSelectCard] = React.useState<string>('-');

  const randomSlot = () => {
    const random1 = cardList[Math.floor(Math.random() * cardList.length)];
    const random2 = cardList[Math.floor(Math.random() * cardList.length)];
    const random3 = cardList[Math.floor(Math.random() * cardList.length)];
    setAlly([random1.dressId, random2.dressId, random3.dressId]);

    const random4 = cardList[Math.floor(Math.random() * cardList.length)];
    const random5 = cardList[Math.floor(Math.random() * cardList.length)];
    const random6 = cardList[Math.floor(Math.random() * cardList.length)];
    setEnemy([random4.dressId, random5.dressId, random6.dressId]);
  };

  const shareCards = () => {
    props.shareCards({
      ally,
      enemy,
    });
  };

  const favoriteCards = () => {
    setFavoriteOpen(true);
  };

  // スロットの内容が変わったら再計算
  React.useEffect(() => {
    console.log(`${ally.join()}, ${enemy.join()}`);

    const enemyCards = enemy.map((ene) => props.cardList.find((card) => card.dressId === ene));
    const allyCards = ally.map((ene) => props.cardList.find((card) => card.dressId === ene));
    const data = calcEffectLevel(allyCards, enemyCards);

    setCardStatus(data);
  }, [ally.join(), enemy.join()]);

  const changeOp = (event: React.ChangeEvent<{ name?: string | undefined; value: string }>) => {
    setSelectCard(event.target.value);
  };
  const tempSelect = (id: string) => setSelectCard(id);

  const setCardButton = (type: 'enemy' | 'ally', position: number) => () => {
    if (type === 'ally') {
      const temp = [...ally];
      temp[position] = selectCard === '-' ? null : selectCard;
      setAlly(temp);
    } else {
      const temp = [...enemy];
      temp[position] = selectCard === '-' ? null : selectCard;
      setEnemy(temp);
    }
  };

  const applyCardList = (type: 'ally' | 'enemy', cardList: (string | null)[]) => {
    if (type === 'ally') {
      setAlly(cardList);
    } else {
      setEnemy(cardList);
    }
    props.showNotify(true, 'info', '適用完了');
  };

  const getCard = (dressId?: string | null) => {
    if (!dressId) return null;

    const temp = props.cardList.find((card) => card.dressId === dressId);
    return temp ? temp : null;
  };

  const dispSearchDialog = () => setFilterOpen(true);
  const filterModalClose = () => setFilterOpen(false);
  const favoriteModalClose = () => setFavoriteOpen(false);

  const selectCardByImageList = (type: 'ally' | 'enemy', index: number, dressId: string) => () => {
    if (type === 'ally') {
      const newList = [...ally];
      newList[index] = dressId;
      setAlly(newList);
    } else {
      const newList = [...enemy];
      newList[index] = dressId;
      setEnemy(newList);
    }
  };

  return (
    <div>
      {/* TODO: コンポーネント単位に分ける */}
      <Hidden mdUp>
        <div className={classes.root}>
          <div className={classes.mobileContent}>
            {/* 相手の編成 */}
            <Paper className={classes.slotDispArea} style={{ backgroundColor: 'pink' }}>
              <CardSlot card={getCard(enemy[0])} cardStatus={cardStatus.enemy[0]} />
              <CardSlot card={getCard(enemy[1])} cardStatus={cardStatus.enemy[1]} />
              <CardSlot card={getCard(enemy[2])} cardStatus={cardStatus.enemy[2]} />
            </Paper>

            <div style={{ margin: 10 }} />

            {/* 味方の編成 */}
            <Paper className={classes.slotDispArea} style={{ backgroundColor: 'skyblue' }}>
              <CardSlot card={getCard(ally[0])} cardStatus={cardStatus.ally[0]} />
              <CardSlot card={getCard(ally[1])} cardStatus={cardStatus.ally[1]} />
              <CardSlot card={getCard(ally[2])} cardStatus={cardStatus.ally[2]} />
            </Paper>

            <div className={classes.footer}>
              <div>
                <Tooltip title="ランダム編成">
                  <IconButton className={classes.button} color={'default'} onClick={randomSlot}>
                    <CasinoIcon />
                  </IconButton>
                </Tooltip>

                <Tooltip title="お気に入り">
                  <IconButton className={classes.button} color={'default'} onClick={favoriteCards}>
                    <StarRateIcon />
                  </IconButton>
                </Tooltip>

                <Tooltip title="編成をShare">
                  <IconButton className={classes.button} color={'default'} onClick={shareCards}>
                    <ShareIcon />
                  </IconButton>
                </Tooltip>
              </div>
              <div style={{ display: 'flex', height: '2em' }}>
                <Tooltip title="リストの絞り込み">
                  <IconButton className={classes.button} color={'default'} onClick={dispSearchDialog}>
                    <FilterListIcon />
                  </IconButton>
                </Tooltip>
                <Select variant={'outlined'} onChange={changeOp} value={selectCard} fullWidth={true}>
                  <MenuItem value={'-'}> スイングを選んでね！ </MenuItem>
                  {cardList.map((card, index) => {
                    return <MenuItem key={index} value={card.dressId}>{`${card.cardId} ${card.rarity} ${card.cardName} Lv.${card.level}`}</MenuItem>;
                  })}
                </Select>
              </div>
              <div className={classes.slotButtonArea}>
                <Button className={classes.button} variant={'contained'} color={'secondary'} onClick={setCardButton('enemy', 0)}>
                  オープニング
                </Button>
                <Button className={classes.button} variant={'contained'} color={'secondary'} onClick={setCardButton('enemy', 1)}>
                  メイン
                </Button>
                <Button className={classes.button} variant={'contained'} color={'secondary'} onClick={setCardButton('enemy', 2)}>
                  クライマックス
                </Button>
              </div>
              <div className={classes.slotButtonArea}>
                <Button className={classes.button} variant={'contained'} color={'primary'} onClick={setCardButton('ally', 0)}>
                  オープニング
                </Button>
                <Button className={classes.button} variant={'contained'} color={'primary'} onClick={setCardButton('ally', 1)}>
                  メイン
                </Button>
                <Button className={classes.button} variant={'contained'} color={'primary'} onClick={setCardButton('ally', 2)}>
                  クライマックス
                </Button>
              </div>
            </div>
          </div>
          <Modal open={filterOpen} modalClose={filterModalClose}>
            <div style={{ height: '100vh', width: '100vw', maxHeight: 500, maxWidth: 300 }}>
              <CardFilter clickButton={filterModalClose} />
            </div>
          </Modal>
          <Modal open={favoriteOpen} modalClose={favoriteModalClose}>
            <div style={{ height: '100vh', width: '100vw', maxWidth: '250px' }}>
              <FavoriteList ally={ally} enemy={enemy} applyCardList={applyCardList} />
            </div>
          </Modal>
        </div>
      </Hidden>
      {/* PC表示 */}
      <Hidden smDown>
        <div className={classes.root}>
          <div className={classes.pcSubContent}>
            <div>
              <CardFilter />
            </div>

            {/* <div style={{ height: '50%' }}>
              <TempCardList tempCardList={tempCardList} selectCard={tempSelect} />
            </div> */}
          </div>

          <div className={classes.pcContent}>
            {/* 相手の編成 */}
            <Paper className={classes.slotDispArea} style={{ backgroundColor: 'pink' }}>
              <CardSlot card={getCard(enemy[0])} cardStatus={cardStatus.enemy[0]} />
              <CardSlot card={getCard(enemy[1])} cardStatus={cardStatus.enemy[1]} />
              <CardSlot card={getCard(enemy[2])} cardStatus={cardStatus.enemy[2]} />
            </Paper>

            <div style={{ margin: 10 }} />

            {/* 味方の編成 */}
            <Paper className={classes.slotDispArea} style={{ backgroundColor: 'skyblue' }}>
              <CardSlot card={getCard(ally[0])} cardStatus={cardStatus.ally[0]} />
              <CardSlot card={getCard(ally[1])} cardStatus={cardStatus.ally[1]} />
              <CardSlot card={getCard(ally[2])} cardStatus={cardStatus.ally[2]} />
            </Paper>

            <div className={classes.pcfooter}>
              <div>
                <Tooltip title="ランダム編成">
                  <IconButton className={classes.button} color={'default'} onClick={randomSlot}>
                    <CasinoIcon />
                  </IconButton>
                </Tooltip>

                <Tooltip title="編成をShare">
                  <IconButton className={classes.button} color={'default'} onClick={shareCards}>
                    <ShareIcon />
                  </IconButton>
                </Tooltip>
              </div>
              <div style={{ display: 'flex', width: '100%', flexWrap: 'wrap', justifyContent: 'space-between', height: '100%', overflowY: 'scroll' }}>
                {cardList.map((card) => {
                  return (
                    <Paper style={{ margin: 5, padding: 5, width: 110 }} key={card.dressId}>
                      <div style={{ position: 'relative' }}>
                        <img src={card.imageUrl1} width={110} />
                      </div>
                      <div style={{ marginTop: -120 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Button className={classes.pcSlotSelectButton} color={'secondary'} variant={'contained'} onClick={selectCardByImageList('enemy', 0, card.dressId)}>
                            O
                          </Button>
                          <Button className={classes.pcSlotSelectButton} color={'secondary'} variant={'contained'} onClick={selectCardByImageList('enemy', 1, card.dressId)}>
                            M
                          </Button>
                          <Button className={classes.pcSlotSelectButton} color={'secondary'} variant={'contained'} onClick={selectCardByImageList('enemy', 2, card.dressId)}>
                            C
                          </Button>
                        </div>
                        <div style={{ marginTop: 60, display: 'flex', justifyContent: 'space-between' }}>
                          <Button className={classes.pcSlotSelectButton} color={'primary'} variant={'contained'} onClick={selectCardByImageList('ally', 0, card.dressId)}>
                            O
                          </Button>
                          <Button className={classes.pcSlotSelectButton} color={'primary'} variant={'contained'} onClick={selectCardByImageList('ally', 1, card.dressId)}>
                            M
                          </Button>
                          <Button className={classes.pcSlotSelectButton} color={'primary'} variant={'contained'} onClick={selectCardByImageList('ally', 2, card.dressId)}>
                            C
                          </Button>
                        </div>
                      </div>
                      <div style={{ height: 5 }} />
                      <div>{`${card.cardId} ${card.rarity} Lv.${card.level}`}</div>
                      <div style={{ fontSize: 'small' }}>{`${card.cardName}`}</div>
                    </Paper>
                  );
                })}
                {cardList.length % 3 === 2 ? <div style={{ margin: 5, padding: 5, width: 155 }} /> : ''}
              </div>
            </div>
          </div>
          <div className={classes.pcSubContent}>
            <FavoriteList ally={ally} enemy={enemy} applyCardList={applyCardList} />
          </div>
        </div>
      </Hidden>
      {/* 通知系 */}
      <Dialog styleOverride={{ maxWidth: 600 }} />
      <Snackbar open={props.notify.show} message={props.notify.message} variant={props.notify.type} closable={props.notify.closable} onClose={props.closeNotify} />
    </div>
  );
};

// state
const mapStateToProps = (state: RootState) => {
  return {
    notify: state.reducer.notify,
    dialog: state.reducer.dialog,
    cardList: state.reducer.cardInfo,
    filter: state.reducer.filter,
    allyCardList: state.reducer.allyCardList,
    enemyCardList: state.reducer.enemyCardList,
    favoriteList: state.reducer.favoriteList,
  };
};

// action
const mapDispatchToProps = {
  showNotify: actions.changeNotify,
  closeNotify: actions.closeNotify,
  closeModal: actions.closeDialog,
  shareCards: actions.shareCardsSaga,
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
