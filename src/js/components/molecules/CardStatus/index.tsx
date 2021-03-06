import React from 'react';
import { Typography } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      justifyContent: 'center',
      display: 'flex',
      alignItems: 'center',
    },
    imageArea: {
      display: 'flex',
    },
  }),
);

type PropsType = {
  card: {
    baseLevel: number;
    effectLevel: number;
    scoreup: number;
    chanceBonus: number;
    judgeSupportPerfect: number;
  };
};

const App: React.FC<PropsType> = (props: PropsType) => {
  const classes = useStyles();
  // レベルの色
  let color = 'black';
  if(props.card.effectLevel > 0) {
    color = 'red';
  } else if(props.card.effectLevel < 0) {
    color = 'blue';
  }
  return (
    <div className={classes.root}>
      <Typography variant={'h6'} style={{color: color}}>{`Lv.${props.card.baseLevel + props.card.effectLevel}`}</Typography>
      <div className={classes.imageArea}>{props.card.scoreup > 0 ? <img src={`./images/dressia_gauge_${props.card.scoreup}.png`} height={15} /> : ''}</div>
      <div className={classes.imageArea}>{props.card.chanceBonus > 0 ? <img src={`./images/chance_bonus_${props.card.chanceBonus}.png`} height={15} /> : ''}</div>
      <div className={classes.imageArea}>
        {props.card.judgeSupportPerfect > 0 ? <img src={`./images/judge_support_perfect_${props.card.judgeSupportPerfect}.png`} height={15} /> : ''}
      </div>
    </div>
  );
};

export default App;
