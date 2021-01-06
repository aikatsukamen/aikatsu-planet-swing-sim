import React from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { Card, CardMedia, Typography } from '@material-ui/core';
import CardStatus from '../../molecules/CardStatus';
import { CardInfo } from '../../../types/api';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      margin: 5,
      height: 'calc(100% - 10px)',
      width: '30vw',
      maxWidth: 300,
    },
    imageArea: {
      display: 'flex',
    },
  }),
);

type PropsType = {
  card: CardInfo | null;
  cardStatus: {
    baseLevel: number;
    effectLevel: number;
    scoreup: number;
    chanceBonus: number;
  };
};

const App: React.FC<PropsType> = (props: PropsType) => {
  const classes = useStyles();

  return (
    <Card className={classes.root}>
      <CardMedia style={{ height: 'calc(100% - 132px)' }} image={props.card?.imageUrl1 ?? './images/empty_swing.png'} />
      <div style={{ height: 100 }}>
        <Typography variant="body2" color="textSecondary" component="p">
          {props.card?.cardId ?? ''} {props.card?.rarity ?? ''} {props.card?.cardName ?? ''}
        </Typography>
        <Typography style={{ fontSize: 'xx-small' }} variant="caption" color="textSecondary" component="p">
          {props.card?.skill.text.full ?? ''}
        </Typography>
      </div>
      <CardStatus card={props.cardStatus} />
    </Card>
  );
};

export default App;
