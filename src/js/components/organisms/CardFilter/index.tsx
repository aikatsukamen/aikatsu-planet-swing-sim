import React from 'react';
import { Button, Select, TextField, Typography } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Modal from '../../molecules/Modal';
import { RootState } from '../../../reducers';
import { connect } from 'react-redux';
import * as actions from '../../../actions';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      height: '90vh',
      width: '90vw',
      padding: 5,
      backgroundColor: 'white',
      borderRadius: 10,
    },
    content: {
      height: '80vh',
      overflowY: 'scroll',
      overflowX: 'hidden',
    },
    label: {
      fontWeight: 'bold',
    },
    minilabel: {
      fontSize: 'small',
    },
  }),
);

type ComponentType = {
  open: boolean;
  modalClose: () => void;
};
type ConnectType = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

type PropsType = ComponentType & ConnectType;

const App: React.FC<PropsType> = (props: PropsType) => {
  const classes = useStyles();

  const nameRef = React.useRef<HTMLInputElement>(null);
  const dressiaTypeRef = React.useRef<HTMLInputElement>(null);
  const levelRef = React.useRef<HTMLInputElement>(null);
  const levelCondRef = React.useRef<HTMLSelectElement>(null);
  const skillTextRef = React.useRef<HTMLInputElement>(null);
  const skillEffectTypeRef = React.useRef<HTMLInputElement>(null);
  const skillEffectValueRef = React.useRef<HTMLInputElement>(null);

  const resetButton = () => {
    props.resetFilter();
    props.modalClose();
  };

  const applyButton = () => {
    const name: string = nameRef.current?.value ?? '';
    const dressiaType: string = dressiaTypeRef.current?.value ?? '';
    const level: number = Number(levelRef.current?.value) ?? 0;
    const levelCond = (Number(levelCondRef.current?.value) as 0 | 1 | 2) ?? 0;
    const skillText: string = skillTextRef.current?.value ?? '';
    const skillEffectType: 0 | 1 | 2 | 3 | 4 = (Number(skillEffectTypeRef.current?.value) as 0 | 1 | 2 | 3 | 4) ?? 0;
    const skillEffectValue: number = Number(skillEffectValueRef.current?.value) ?? 0;

    props.updateFilter({
      name,
      dressiaType,
      level,
      levelCond,
      skillText,
      skillEffectType,
      skillEffectValue,
    });
    props.modalClose();
  };

  return (
    <Modal open={props.open} modalClose={props.modalClose}>
      <div className={classes.root}>
        <div className={classes.content}>
          <div>
            <div className={classes.label}>スイング名(部分一致)</div>
            <TextField defaultValue={props.filter.name} inputRef={nameRef} fullWidth={true} />
          </div>
          <div>
            <div className={classes.label}>ドレシアタイプ名(部分一致)</div>
            <TextField defaultValue={props.filter.dressiaType} inputRef={dressiaTypeRef} fullWidth={true} />
          </div>
          <div>
            <div className={classes.label}>スイングレベル</div>
            <TextField defaultValue={props.filter.level > 0 ? props.filter.level : ''} inputRef={levelRef} fullWidth={true} />
            <div className={classes.minilabel}>スイングレベルの比較条件</div>
            <Select defaultValue={props.filter.levelCond} inputRef={levelCondRef} fullWidth={true}>
              <option value={0}>イコール</option>
              <option value={1}>以上</option>
              <option value={2}>以下</option>
            </Select>
          </div>

          <div>
            <div className={classes.label}>スキル説明文(部分一致)</div>
            <TextField defaultValue={props.filter.skillText} inputRef={skillTextRef} fullWidth={true} />
          </div>
          <div>
            <div className={classes.label}>スキル効果</div>
            <Select defaultValue={props.filter.skillEffectType} inputRef={skillEffectTypeRef} placeholder={'スキル効果種別'} fullWidth={true}>
              <option value={0}>-</option>
              <option value={1}>スキル無し</option>
              <option value={2}>レベル</option>
              <option value={3}>ドレシアゲージがたまりやすい</option>
              <option value={4}>ドレシアチャンスボーナスアップ</option>
            </Select>
            <div className={classes.minilabel}>スキル効果量</div>
            <TextField defaultValue={props.filter.skillEffectValue > 0 ? props.filter.skillEffectValue : ''} inputRef={skillEffectValueRef} fullWidth={true} />
          </div>
        </div>

        <div style={{ display: 'flex' }}>
          <Button variant={'contained'} color={'default'} size={'small'} onClick={resetButton} style={{ marginRight: 100 }}>
            リセット
          </Button>

          <Button variant={'contained'} color={'primary'} size={'small'} onClick={applyButton}>
            反映
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// state
const mapStateToProps = (state: RootState) => {
  return {
    filter: state.reducer.filter,
  };
};

// action
const mapDispatchToProps = {
  updateFilter: actions.updateFilter,
  resetFilter: actions.resetFilter,
};

const Aaaa = connect(mapStateToProps, mapDispatchToProps)(App);

export default Aaaa;