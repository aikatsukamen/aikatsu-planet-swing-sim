import { CardInfo } from '../types/api';

/**
 * JSONの取得
 * @param url 取得先のURL
 * @return JSONオブジェクト
 * @throws 通信エラー
 * @throws JSON変換エラー
 */
export const fetchJson = async (url: string) => {
  try {
    const result = await fetch(url);
    const config = await result.json();
    return config;
  } catch (e) {
    console.error(e);
    throw new Error('通信エラーが発生しました。');
  }
};

export const postJson = async (url: string, body: object) => {
  try {
    const result = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    return await result.json();
  } catch (error) {
    console.error(error);
    throw new Error('通信エラーが発生しました。');
  }
};

export const postFile = async (url: string, file: File) => {
  try {
    const formData = new FormData();
    formData.append(file.name, file);

    const result = await fetch(url, {
      method: 'POST',
      body: formData,
    });
    return await result.json();
  } catch (error) {
    throw new Error('通信エラーが発生しました。');
  }
};

export const calcEffectLevel = (allyCards: (CardInfo | undefined)[], enemyCards: (CardInfo | undefined)[]) => {
  let data = {
    ally: [
      {
        baseLevel: 0,
        effectLevel: 0,
        scoreup: 0,
        chanceBonus: 0,
        judgeSupportPerfect: 0,
      },
      {
        baseLevel: 0,
        effectLevel: 0,
        scoreup: 0,
        chanceBonus: 0,
        judgeSupportPerfect: 0,
      },
      {
        baseLevel: 0,
        effectLevel: 0,
        scoreup: 0,
        chanceBonus: 0,
        judgeSupportPerfect: 0,
      },
    ],
    enemy: [
      {
        baseLevel: 0,
        effectLevel: 0,
        scoreup: 0,
        chanceBonus: 0,
        judgeSupportPerfect: 0,
      },
      {
        baseLevel: 0,
        effectLevel: 0,
        scoreup: 0,
        chanceBonus: 0,
        judgeSupportPerfect: 0,
      },
      {
        baseLevel: 0,
        effectLevel: 0,
        scoreup: 0,
        chanceBonus: 0,
        judgeSupportPerfect: 0,
      },
    ],
  };

  for (let i = 0; i < enemyCards.length; i++) {
    const ene = enemyCards[i];
    if (ene) data.enemy[i].baseLevel = ene.level;
  }
  for (let i = 0; i < allyCards.length; i++) {
    const ene = allyCards[i];
    if (ene) data.ally[i].baseLevel = ene.level;
  }

  // スキル計算
  /** 発動済みカード */
  let appliedCard = {
    ally: allyCards.map(() => false),
    enemy: enemyCards.map(() => false),
  };
  let isContinue = true;
  while (isContinue) {
    const result1 = calcSpecified(allyCards, enemyCards, 'ally', data, appliedCard);
    const result2 = calcSpecified(enemyCards, allyCards, 'enemy', data, appliedCard);
    isContinue = result1.isExistNewApplied || result2.isExistNewApplied;
  }

  // 上限値でカットする
  ['ally', 'enemy'].map((type) => {
    for (let i = 0; i < data.ally.length; i++) {
      if (data[type][i].baseLevel > 0) {
        if (data[type][i].baseLevel + data[type][i].effectLevel > 15) {
          data[type][i].effectLevel = 15 - data[type][i].baseLevel;
        }
        if (data[type][i].chanceBonus > 4) data[type][i].chanceBonus = 4;
        if (data[type][i].scoreup > 3) data[type][i].scoreup = 3;
      }
    }
  });

  return data;
};

/**
 *
 * @param cards1 計算の基準となるカード
 * @param cards2 計算の相手側となるカード
 * @param type card1がどっちサイドか
 * @param effectedData レベルの情報
 * @param appliedCard カードごとに適用済みか否かの配列
 */
const calcSpecified = (
  cards1: (CardInfo | undefined)[],
  cards2: (CardInfo | undefined)[],
  type: 'ally' | 'enemy',
  effectedData: ReturnType<typeof calcEffectLevel>,
  appliedCard: { ally: boolean[]; enemy: boolean[] },
) => {
  let isExistNewApplied = false;
  /** 計算の基準の相手 */
  const targetType = type === 'ally' ? 'enemy' : 'ally';

  for (let eneIndex = 0; eneIndex < cards1.length; eneIndex++) {
    // スキル適用済みのカードならスキップ
    if (appliedCard[type][eneIndex] === true) continue;

    /** 計算の基準となるカード */
    const targetCard = cards1[eneIndex];
    if (!targetCard) continue;
    console.log(
      `position=${eneIndex} ${targetCard.cardName} cond=${targetCard.skill.condition.value} target=${targetCard.skill.effect.target.type} effect=${targetCard.skill.effect.type}`,
    );

    /** いずれかの条件を満たした */
    let isConditionOk = false;
    switch (targetCard.skill.condition.value) {
      case 0: {
        // ドレシアチャンスで勝ったら
        isConditionOk = true;
        isExistNewApplied = true;
        break;
      }
      case 100: {
        // あいてのタイプがXXXだったら
        const temp = cards2[eneIndex];
        if (temp) {
          if (temp.dressiaType === targetCard.skill.condition.dressiaType) {
            isConditionOk = true;
            isExistNewApplied = true;
          }
        }
        break;
      }
      case 101: {
        // あいてのレアリティがXXXだったら
        const temp = cards2[eneIndex];
        if (temp) {
          if (temp.rarity === targetCard.skill.condition.rarity || (targetCard.skill.condition.rarity === 'PR' && temp.rarity === 'SEC')) {
            isConditionOk = true;
            isExistNewApplied = true;
          }
        }
        break;
      }
      case 102: {
        // あいてのドレシアがXXXだったら（名前）
        const temp = cards2[eneIndex];
        if (temp) {
          if (temp.cardName === targetCard.skill.condition.cardname) {
            isConditionOk = true;
            isExistNewApplied = true;
          }
        }
        break;
      }
      case 103: {
        // あいてのドレシアがXXXだったら（レアリティ、名前）
        const temp = cards2[eneIndex];
        if (temp) {
          if (
            temp.cardName === targetCard.skill.condition.cardname &&
            (temp.rarity === targetCard.skill.condition.rarity || (targetCard.skill.condition.rarity === 'PR' && temp.rarity === 'SEC'))
          ) {
            isConditionOk = true;
            isExistNewApplied = true;
          }
        }
        break;
      }
      case 104: {
        // あいてのレベルがXXXより大きかったら
        const temp = effectedData[targetType][eneIndex];
        if (temp) {
          if (temp.baseLevel > targetCard.skill.condition.level) {
            isConditionOk = true;
            isExistNewApplied = true;
          }
        }
        break;
      }
      case 105: {
        // あいてのレベルがXXXより小さかったら
        const temp = effectedData[targetType][eneIndex];
        if (temp) {
          if (temp.baseLevel < targetCard.skill.condition.level) {
            isConditionOk = true;
            isExistNewApplied = true;
          }
        }
        break;
      }
      case 150: {
        // あいてにタイプがいたら
        for (let j = 0; j < cards2.length; j++) {
          const temp = cards2[j];
          if (!temp) continue;
          if (temp.dressiaType === targetCard.skill.condition.dressiaType) {
            isConditionOk = true;
            isExistNewApplied = true;
          }
        }
        break;
      }
      case 151: {
        // あいてにレアリティがいたら
        for (let j = 0; j < cards2.length; j++) {
          const temp = cards2[j];
          if (!temp) continue;
          if (temp.rarity === targetCard.skill.condition.rarity) {
            isConditionOk = true;
            isExistNewApplied = true;
          }
        }
        break;
      }
      case 152: {
        // あいてにドレシアがいたら（名前）
        for (let j = 0; j < cards2.length; j++) {
          const temp = cards2[j];
          if (!temp) continue;
          if (temp.cardName === targetCard.skill.condition.cardname) {
            isConditionOk = true;
            isExistNewApplied = true;
          }
        }
        break;
      }
      case 153: {
        // あいてにドレシアがいたら（レアリティ、名前）
        for (let j = 0; j < cards2.length; j++) {
          const temp = cards2[j];
          if (!temp) continue;
          if (temp.cardName === targetCard.skill.condition.cardname && temp.rarity === targetCard.skill.condition.rarity) {
            isConditionOk = true;
            isExistNewApplied = true;
          }
        }
        break;
      }
      case 200: {
        // 200: なかまにタイプがいたら
        for (let j = 0; j < cards1.length; j++) {
          if (eneIndex === j) continue;
          const temp = cards1[j];
          if (!temp) continue;
          if (temp.dressiaType === targetCard.skill.condition.dressiaType) {
            isConditionOk = true;
            isExistNewApplied = true;
          }
        }
        break;
      }
      case 201: {
        // 201: なかまにレアリティがいたら
        for (let j = 0; j < cards1.length; j++) {
          if (eneIndex === j) continue;
          const temp = cards1[j];
          if (!temp) continue;
          if (temp.rarity === targetCard.skill.condition.rarity || (targetCard.skill.condition.rarity === 'PR' && temp.rarity === 'SEC')) {
            isConditionOk = true;
            isExistNewApplied = true;
          }
        }
        break;
      }
      case 202: {
        // 202: なかまにドレシアがいたら（名前）
        for (let j = 0; j < cards1.length; j++) {
          if (eneIndex === j) continue;
          const temp = cards1[j];
          if (!temp) continue;
          if (temp.cardName === targetCard.skill.condition.cardname) {
            isConditionOk = true;
            isExistNewApplied = true;
          }
        }
        break;
      }
      case 203: {
        // 202: なかまにドレシアがいたら（レア、名前）
        for (let j = 0; j < cards1.length; j++) {
          if (eneIndex === j) continue;
          const temp = cards1[j];
          if (!temp) continue;
          if (temp.cardName === targetCard.skill.condition.cardname && temp.rarity === targetCard.skill.condition.rarity) {
            isConditionOk = true;
            isExistNewApplied = true;
          }
        }
        break;
      }
      case 210: {
        // 210: ぜんいんがタイプがいたら
        let count = 0;
        for (let j = 0; j < cards1.length; j++) {
          const temp = cards1[j];
          if (!temp) continue;
          if (temp.dressiaType === targetCard.skill.condition.dressiaType) count++;
        }
        console.log(`type:210 count=${count}`);
        if(count === cards1.length) {
          isConditionOk = true;
          isExistNewApplied = true;
        }
        break;
      }
      case 211: {
        // 211: ぜんいんがレアリティがいたら
        let count = 0;
        for (let j = 0; j < cards1.length; j++) {
          const temp = cards1[j];
          if (!temp) continue;
          if (temp.rarity === targetCard.skill.condition.rarity || (targetCard.skill.condition.rarity === 'PR' && temp.rarity === 'SEC')) count++;
        }
        if(count === cards1.length) {
          isConditionOk = true;
          isExistNewApplied = true;
        }
        break;
      }
      case 212: {
        // 212: ぜんいんがドレシアがいたら（名前）
        let count = 0;
        for (let j = 0; j < cards1.length; j++) {
          const temp = cards1[j];
          if (!temp) continue;
          if (temp.cardName === targetCard.skill.condition.cardname) count++;
        }
        if(count === cards1.length) {
          isConditionOk = true;
          isExistNewApplied = true;
        }
        break;
      }
      case 213: {
        // 212: ぜんいんがドレシアがいたら（レア、名前）
        let count = 0;
        for (let j = 0; j < cards1.length; j++) {
          const temp = cards1[j];
          if (!temp) continue;
          if (temp.cardName === targetCard.skill.condition.cardname && temp.rarity === targetCard.skill.condition.rarity) count++;
        }
        if(count === cards1.length) {
          isConditionOk = true;
          isExistNewApplied = true;
        }
        break;
      }
      case 300: {
        // 300: アバターパーツ
        isConditionOk = true;
        isExistNewApplied = true;
        break;
      }
      case 400: {
        // 400: スロット
        // スロットの名前が、置いてる位置とあってれば発動
        enum battleEnum {
          'オープニングバトル',
          'メインバトル',
          'クライマックスバトル',
        }
        const condPositionIndex = battleEnum[targetCard.skill.condition.slot];
        if (condPositionIndex === eneIndex) {
          isConditionOk = true;
          isExistNewApplied = true;
        }
        break;
      }
      case 401: {
        // 401: 時刻
        // 常時発動にしておく
        isConditionOk = true;
        isExistNewApplied = true;
        break;
      }
      case 500: {
        // イベント中だったら
        // 常時発動にしておく
        isConditionOk = true;
        isExistNewApplied = true;
        break;
      }
      case 600: {
        // xxxがパーフェクトを10回以上とれたら
        // 常時発動にしておく
        isConditionOk = true;
        isExistNewApplied = true;
        break;
      }
    }

    // 条件が存在しない場合は、無条件で発動
    if (!targetCard.skill.text.condition) {
      isConditionOk = true;
      isExistNewApplied = true;
    }

    if (!isConditionOk) continue;
    appliedCard[type][eneIndex] = true;

    // 効果を発揮
    switch (targetCard.skill.effect.target.type) {
      case 0: {
        // じぶん
        switch (targetCard.skill.effect.type) {
          case 0: {
            effectedData[type][eneIndex].effectLevel += targetCard.skill.effect.level;
            break;
          }
          case 1: {
            effectedData[type][eneIndex].scoreup += targetCard.skill.effect.scoreup;
            break;
          }
          case 2: {
            effectedData[type][eneIndex].chanceBonus += targetCard.skill.effect.chancebonus;
            break;
          }
          case 3: {
            effectedData[type][eneIndex].judgeSupportPerfect += targetCard.skill.effect.judgeSupportPerfect;
            break;
          }
        }
        break;
      }
      case 1: {
        // なかま
        for (let j = 0; j < cards1.length; j++) {
          if (j === eneIndex) continue; // じぶんは除外

          // パフェ回数をとったやつ
          if (targetCard.skill.condition.value === 600) {
            switch (targetCard.skill.condition.notesAchieve) {
              case 'じぶん': {
                // じぶんより前の位置には適用しない
                if (j < eneIndex) continue;
              }
            }
          }

          switch (targetCard.skill.effect.type) {
            case 0: {
              effectedData[type][j].effectLevel += targetCard.skill.effect.level;
              break;
            }
            case 1: {
              effectedData[type][j].scoreup += targetCard.skill.effect.scoreup;
              break;
            }
            case 2: {
              effectedData[type][j].chanceBonus += targetCard.skill.effect.chancebonus;
              break;
            }
            case 3: {
              effectedData[type][j].judgeSupportPerfect += targetCard.skill.effect.judgeSupportPerfect;
              break;
            }
          }
        }
        break;
      }
      case 2: {
        // ぜんいん
        for (let j = 0; j < cards1.length; j++) {
          // パフェ回数をとったやつ
          if (targetCard.skill.condition.value === 600) {
            switch (targetCard.skill.condition.notesAchieve) {
              case 'じぶん': {
                // じぶんより前の位置には適用しない
                if (j < eneIndex) continue;
              }
            }
          }

          switch (targetCard.skill.effect.type) {
            case 0: {
              effectedData[type][j].effectLevel += targetCard.skill.effect.level;
              break;
            }
            case 1: {
              effectedData[type][j].scoreup += targetCard.skill.effect.scoreup;
              break;
            }
            case 2: {
              effectedData[type][j].chanceBonus += targetCard.skill.effect.chancebonus;
              break;
            }
            case 3: {
              effectedData[type][j].judgeSupportPerfect += targetCard.skill.effect.judgeSupportPerfect;
              break;
            }
          }
        }
        break;
      }
      case 3: {
        // パフェ回数をとったやつ
        if (targetCard.skill.condition.value === 600) {
          switch (targetCard.skill.condition.notesAchieve) {
            case 'じぶん': {
              // じぶんより前の位置には適用しない
              if (0 < eneIndex) continue;
            }
          }
        }

        // オープニング
        switch (targetCard.skill.effect.type) {
          case 0: {
            effectedData[type][0].effectLevel += targetCard.skill.effect.level;
            break;
          }
          case 1: {
            effectedData[type][0].scoreup += targetCard.skill.effect.scoreup;
            break;
          }
          case 2: {
            effectedData[type][0].chanceBonus += targetCard.skill.effect.chancebonus;
            break;
          }
          case 3: {
            effectedData[type][0].judgeSupportPerfect += targetCard.skill.effect.judgeSupportPerfect;
            break;
          }
        }
        break;
      }
      case 4: {
        // パフェ回数をとったやつ
        if (targetCard.skill.condition.value === 600) {
          switch (targetCard.skill.condition.notesAchieve) {
            case 'じぶん': {
              // じぶんより前の位置には適用しない
              if (1 < eneIndex) continue;
            }
          }
        }

        // メイン
        switch (targetCard.skill.effect.type) {
          case 0: {
            effectedData[type][1].effectLevel += targetCard.skill.effect.level;
            break;
          }
          case 1: {
            effectedData[type][1].scoreup += targetCard.skill.effect.scoreup;
            break;
          }
          case 2: {
            effectedData[type][1].chanceBonus += targetCard.skill.effect.chancebonus;
            break;
          }
          case 3: {
            effectedData[type][1].judgeSupportPerfect += targetCard.skill.effect.judgeSupportPerfect;
            break;
          }
        }
        break;
      }
      case 5: {
        // クライマックス
        switch (targetCard.skill.effect.type) {
          case 0: {
            effectedData[type][2].effectLevel += targetCard.skill.effect.level;
            break;
          }
          case 1: {
            effectedData[type][2].scoreup += targetCard.skill.effect.scoreup;
            break;
          }
          case 2: {
            effectedData[type][2].chanceBonus += targetCard.skill.effect.chancebonus;
            break;
          }
          case 3: {
            effectedData[type][2].judgeSupportPerfect += targetCard.skill.effect.judgeSupportPerfect;
            break;
          }
        }
        break;
      }
      case 6: {
        // ドレシアタイプ
        for (let j = 0; j < cards1.length; j++) {
          // パフェ回数をとったやつ
          if (targetCard.skill.condition.value === 600) {
            switch (targetCard.skill.condition.notesAchieve) {
              case 'じぶん': {
                // じぶんより前の位置には適用しない
                if (j < eneIndex) continue;
              }
            }
          }

          const target = cards1[j];
          if (!target) continue;
          if (target.dressiaType !== targetCard.skill.effect.target.dressiaType) continue;
          switch (targetCard.skill.effect.type) {
            case 0: {
              effectedData[type][j].effectLevel += targetCard.skill.effect.level;
              break;
            }
            case 1: {
              effectedData[type][j].scoreup += targetCard.skill.effect.scoreup;
              break;
            }
            case 2: {
              effectedData[type][j].chanceBonus += targetCard.skill.effect.chancebonus;
              break;
            }
            case 3: {
              effectedData[type][j].judgeSupportPerfect += targetCard.skill.effect.judgeSupportPerfect;
              break;
            }
          }
        }
        break;
      }
      case 7: {
        // レアリティ
        for (let j = 0; j < cards1.length; j++) {
          // パフェ回数をとったやつ
          if (targetCard.skill.condition.value === 600) {
            switch (targetCard.skill.condition.notesAchieve) {
              case 'じぶん': {
                // じぶんより前の位置には適用しない
                if (j < eneIndex) continue;
              }
            }
          }

          const target = cards1[j];
          if (!target) continue;
          if (target.rarity !== targetCard.skill.effect.target.rarity) continue;
          switch (targetCard.skill.effect.type) {
            case 0: {
              effectedData[type][j].effectLevel += targetCard.skill.effect.level;
              break;
            }
            case 1: {
              effectedData[type][j].scoreup += targetCard.skill.effect.scoreup;
              break;
            }
            case 2: {
              effectedData[type][j].chanceBonus += targetCard.skill.effect.chancebonus;
              break;
            }
            case 3: {
              effectedData[type][j].judgeSupportPerfect += targetCard.skill.effect.judgeSupportPerfect;
              break;
            }
          }
        }
        break;
      }
    }
  }

  return {
    effectedData,
    appliedCard,
    isExistNewApplied,
  };
};
