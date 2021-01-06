import { Button, MenuItem, Paper, Select } from '@material-ui/core';
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

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: 5,
      justifyContent: 'center',
      display: 'flex',
    },
    content: {
      maxWidth: 1000,
      width: '100%',
      display: 'initial',
      height: '100%',
    },
    slotButtonArea: {
      display: 'flex',
      justifyContent: 'center',
    },
    slotDispArea: {
      width: '100%',
      height: '33vh',
      display: 'flex',
      justifyContent: 'center',
    },
    footer: {
      position: 'fixed',
      bottom: 0,
      width: 'calc(100% - 10px)',
      maxWidth: 1000,
      justifyContent: 'center',
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

  const [ally, setAlly] = React.useState<(string | null)[]>([null, null, null]);
  const [enemy, setEnemy] = React.useState<(string | null)[]>([null, null, null]);
  // const [ally, setAlly] = React.useState<(string | null)[]>(['165599', '163835', '163817']);
  // const [enemy, setEnemy] = React.useState<(string | null)[]>(['163799', '163799', '163799']);
  const [cardList, setCardList] = React.useState<CardInfoList>([]);
  const [filterOpen, setFilterOpen] = React.useState(false);

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
      switch (filter.skillEffectType) {
        case 1:
          newList = newList.filter((value) => value.skill.effect.level === filter.skillEffectValue);
          break;
        case 2:
          newList = newList.filter((value) => value.skill.effect.scoreup === filter.skillEffectValue);
          break;
        case 3:
          newList = newList.filter((value) => value.skill.effect.chancebonus === filter.skillEffectValue);
          break;
      }
    }

    setCardList(newList);
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

  const setCardButton = (type: 'enemy' | 'ally', position: number) => () => {
    console.log(`${type}  ${position}`);
    if (type === 'ally') {
      const temp = [...ally];
      temp[position] = selectCard;
      setAlly(temp);
    } else {
      const temp = [...enemy];
      temp[position] = selectCard;
      setEnemy(temp);
    }
  };

  const getCard = (dressId?: string | null) => {
    if (!dressId) return null;

    const temp = props.cardList.find((card) => card.dressId === dressId);
    return temp ? temp : null;
  };

  const dispSearchDialog = () => setFilterOpen(true);
  const modalClose = () => setFilterOpen(false);

  return (
    <div className={classes.root}>
      <div className={classes.content}>
        <Paper className={classes.slotDispArea} style={{ backgroundColor: 'pink' }}>
          <CardSlot card={getCard(enemy[0])} cardStatus={cardStatus.enemy[0]} />
          <CardSlot card={getCard(enemy[1])} cardStatus={cardStatus.enemy[1]} />
          <CardSlot card={getCard(enemy[2])} cardStatus={cardStatus.enemy[2]} />
        </Paper>

        <div style={{ margin: 10 }} />

        <Paper className={classes.slotDispArea} style={{ backgroundColor: 'skyblue' }}>
          <CardSlot card={getCard(ally[0])} cardStatus={cardStatus.ally[0]} />
          <CardSlot card={getCard(ally[1])} cardStatus={cardStatus.ally[1]} />
          <CardSlot card={getCard(ally[2])} cardStatus={cardStatus.ally[2]} />
        </Paper>

        <div className={classes.footer}>
          <div>
            <Button className={classes.button} style={{ marginRight: 40 }} size={'small'} variant={'contained'} color={'default'} onClick={dispSearchDialog}>
              スイング絞り込み
            </Button>

            <Button className={classes.button} size={'small'} variant={'contained'} color={'default'} onClick={randomSlot}>
              ランダム編成
            </Button>
          </div>
          <div>
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
      <CardFilter open={filterOpen} modalClose={modalClose} />
      {/* 通知系 */}
      <Dialog />
      <Modal open={props.dialog.show} modalClose={props.closeModal}>
        {props.dialog.message}
      </Modal>
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
  };
};

// action
const mapDispatchToProps = {
  closeNotify: actions.closeNotify,
  closeModal: actions.closeDialog,
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
