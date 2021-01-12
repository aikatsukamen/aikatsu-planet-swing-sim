import React from 'react';
import { Button, Divider, IconButton, MenuItem, Select, TextField, Typography } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Modal from '../../molecules/Modal';
import { RootState } from '../../../reducers';
import { connect } from 'react-redux';
import * as actions from '../../../actions';
import FavoriteIcon from '@material-ui/icons/Star';
import NonFavoriteIcon from '@material-ui/icons/StarBorder';
import CloseIcon from '@material-ui/icons/Close';
import LoadIcon from '@material-ui/icons/PlayCircleFilled';
import { CardInfo } from '../../../types/api';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      height: 'calc(100% - 10px)',
      width: 'calc(100% - 10px)',
      padding: 5,
      backgroundColor: 'white',
      borderRadius: 10,
    },
    content: {
      overflowY: 'scroll',
      overflowX: 'hidden',
      height: 'calc(100% - 3em)',
    },
    label: {
      fontWeight: 'bold',
    },
    minilabel: {
      fontSize: 'small',
    },
    favButton: {
      color: 'darkorange',
    },
    loadButton: {
      paddingTop: 5,
      paddingBottom: 5,
    },
  }),
);

type ComponentType = {
  ally: (string | null)[];
  enemy: (string | null)[];
  applyCardList: (target: 'ally' | 'enemy', cardList: (string | null)[]) => void;
};
type ConnectType = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

type PropsType = ComponentType & ConnectType;

const MiniCard: React.FC<{ card?: CardInfo }> = (props: { card?: CardInfo }) => {
  let imgUrl = '';
  let name = '';
  if (props.card) {
    imgUrl = props.card.imageUrl1;
    name = `${props.card.cardId} ${props.card.rarity}`;
  }
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ width: 60 }}>
        <img src={imgUrl} width={60} />
      </div>
      <div style={{ fontSize: 'small' }}>{name}</div>
    </div>
  );
};

const App: React.FC<PropsType> = (props: PropsType) => {
  const classes = useStyles();

  /** 既存のお気に入りリストに登録済みの編成であるか。あるならそのID。無ければ-1 */
  const getIncludeFavId = (target: 'ally' | 'enemy') => {
    const targetCardList = props[target];
    const targetLength = targetCardList.length;

    let result = -1;

    for (const fav of props.favorite) {
      if (fav.card.length !== targetLength) return;

      let isDiff = false;
      for (let i = 0; i < targetLength; i++) {
        if (fav.card[i] !== targetCardList[i]) isDiff = true;
      }
      if (!isDiff) {
        result = fav.id;
        break;
      }
    }

    return result;
  };

  const addFavorite = (target: 'ally' | 'enemy') => () => {
    props.add({ card: props[target] });
  };
  const deleteFavoriteByNowSlot = (target: 'ally' | 'enemy') => () => {
    const id = getIncludeFavId(target);
    if (!Number.isNaN(id)) props.delete(id as number);
  };
  const deleteFavorite = (id: number) => () => props.delete(id);

  const getCard = (dressId: string | null) => {
    const card = props.cardList.find((card) => card.dressId === dressId);
    return card;
  };

  // お気に入りからロード
  const applyCardList = (favid: number, target: 'ally' | 'enemy') => () => {
    const cardList = props.favorite.find((f) => f.id === favid);
    if (cardList) props.applyCardList(target, cardList.card);
  };

  return (
    <div className={classes.root}>
      <Typography variant={'h5'}>お気に入り</Typography>
      <div className={classes.content}>
        {/* 現在のリストをお気に入りに追加 */}
        <div>
          <Typography>現在の編成をお気に入り登録</Typography>
          {/* 敵 */}
          <div style={{ display: 'flex' }}>
            <MiniCard card={getCard(props.enemy[0])} />
            <MiniCard card={getCard(props.enemy[1])} />
            <MiniCard card={getCard(props.enemy[2])} />
            {props.enemy.filter((e) => e !== null).length === 0 ? (
              ''
            ) : getIncludeFavId('enemy') === -1 ? (
              <IconButton onClick={addFavorite('enemy')}>
                <NonFavoriteIcon />
              </IconButton>
            ) : (
              <IconButton className={classes.favButton} color={'inherit'} onClick={deleteFavoriteByNowSlot('enemy')}>
                <FavoriteIcon />
              </IconButton>
            )}
          </div>
          {/* 味方 */}
          <div style={{ display: 'flex' }}>
            <MiniCard card={getCard(props.ally[0])} />
            <MiniCard card={getCard(props.ally[1])} />
            <MiniCard card={getCard(props.ally[2])} />
            {props.ally.filter((a) => a !== null).length === 0 ? (
              ''
            ) : getIncludeFavId('ally') === -1 ? (
              <IconButton onClick={addFavorite('ally')}>
                <NonFavoriteIcon />
              </IconButton>
            ) : (
              <IconButton className={classes.favButton} color={'inherit'} onClick={deleteFavoriteByNowSlot('ally')}>
                <FavoriteIcon />
              </IconButton>
            )}
          </div>
        </div>

        <Divider style={{ marginTop: 5, marginBottom: 5 }} />

        {/* 登録済みお気に入り */}
        <div>
          <Typography>登録済みお気に入り</Typography>
          {props.favorite.map((fav) => {
            return (
              <div key={fav.id}>
                <div style={{ display: 'flex' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {fav.card.map((card) => {
                      return <MiniCard card={getCard(card)} />;
                    })}
                  </div>
                  <div style={{ display: 'flex', flexFlow: 'column' }}>
                    <IconButton onClick={deleteFavorite(fav.id)}>
                      <CloseIcon />
                    </IconButton>
                    <IconButton onClick={applyCardList(fav.id, 'enemy')} color={'secondary'} className={classes.loadButton}>
                      <LoadIcon />
                    </IconButton>
                    <IconButton onClick={applyCardList(fav.id, 'ally')} color={'primary'} className={classes.loadButton}>
                      <LoadIcon />
                    </IconButton>
                  </div>
                </div>
                <Divider style={{ marginTop: 2, marginBottom: 10 }} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// state
const mapStateToProps = (state: RootState) => {
  return {
    favorite: state.reducer.favoriteList,
    cardList: state.reducer.cardInfo,
  };
};

// action
const mapDispatchToProps = {
  add: actions.addFavoriteSaga,
  delete: actions.deleteFavoriteSaga,
};

const Aaaa = connect(mapStateToProps, mapDispatchToProps)(App);

export default Aaaa;
