import React from 'react';
import { Button, Divider, Grid, IconButton, MenuItem, Select, TextField, Typography } from '@material-ui/core';
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
  tempCardList: string[];
  selectCard: (dressId: string) => void;
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

  const selectCard = (id: string) => () => props.selectCard(id);

  const getCard = (dressId: string | null) => {
    const card = props.cardList.find((card) => card.dressId === dressId);
    return card;
  };

  return (
    <div className={classes.root}>
      <Typography variant={'h5'}>一時保存置き場</Typography>
      <div className={classes.content}>
        {props.tempCardList.map((card) => (
          <div>
            <div onClick={selectCard(card)}>
              <MiniCard card={getCard(card)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// state
const mapStateToProps = (state: RootState) => {
  return {
    cardList: state.reducer.cardInfo,
  };
};

// action
const mapDispatchToProps = {};

const Aaaa = connect(mapStateToProps, mapDispatchToProps)(App);

export default Aaaa;
