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
        if (data[type][i].chanceBonus > 3) data[type][i].chanceBonus = 3;
        if (data[type][i].scoreup > 3) data[type][i].scoreup = 3;
      }
    }
  });

  return data;
};

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

    const ene = cards1[eneIndex];
    if (!ene) continue;

    let isConditionOk = false;
    switch (ene.skill.condition.value) {
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
          if (temp.dressiaType === ene.skill.condition.dressiaType) {
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
          if (temp.rarity === ene.skill.condition.rarity || (ene.skill.condition.rarity === 'PR' && temp.rarity === 'SEC')) {
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
          if (temp.cardName === ene.skill.condition.cardname) {
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
          if (temp.cardName === ene.skill.condition.cardname && (temp.rarity === ene.skill.condition.rarity || (ene.skill.condition.rarity === 'PR' && temp.rarity === 'SEC'))) {
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
          if (temp.baseLevel > ene.skill.condition.level) {
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
          if (temp.dressiaType === ene.skill.condition.dressiaType) isConditionOk = true;
        }
        break;
      }
      case 201: {
        // 201: なかまにレアリティがいたら
        for (let j = 0; j < cards1.length; j++) {
          if (eneIndex === j) continue;
          const temp = cards1[j];
          if (!temp) continue;
          if (temp.rarity === ene.skill.condition.rarity || (ene.skill.condition.rarity === 'PR' && temp.rarity === 'SEC')) isConditionOk = true;
        }
        break;
      }
      case 202: {
        // 202: なかまにドレシアがいたら（名前）
        for (let j = 0; j < cards1.length; j++) {
          if (eneIndex === j) continue;
          const temp = cards1[j];
          if (!temp) continue;
          if (temp.cardName === ene.skill.condition.cardname) isConditionOk = true;
        }
        break;
      }
      case 203: {
        // 202: なかまにドレシアがいたら（レア、名前）
        for (let j = 0; j < cards1.length; j++) {
          if (eneIndex === j) continue;
          const temp = cards1[j];
          if (!temp) continue;
          if (temp.cardName === ene.skill.condition.cardname && temp.rarity === ene.skill.condition.rarity) isConditionOk = true;
        }
        break;
      }
      case 300: {
        // 300: アバターパーツ
        isConditionOk = true;
        break;
      }
    }
    if (!ene.skill.text.condition) {
      isConditionOk = true;
      isExistNewApplied = true;
    }

    if (!isConditionOk) continue;
    appliedCard[type][eneIndex] = true;

    // 効果を発揮
    switch (ene.skill.effect.target.type) {
      case 0: {
        // じぶん
        switch (ene.skill.effect.type) {
          case 0: {
            effectedData[type][eneIndex].effectLevel += ene.skill.effect.level;
            break;
          }
          case 1: {
            effectedData[type][eneIndex].scoreup += ene.skill.effect.scoreup;
            break;
          }
          case 2: {
            effectedData[type][eneIndex].chanceBonus += ene.skill.effect.chancebonus;
            break;
          }
        }
        break;
      }
      case 1: {
        // なかま
        for (let j = 0; j < cards1.length; j++) {
          if (j === eneIndex) continue;

          switch (ene.skill.effect.type) {
            case 0: {
              effectedData[type][j].effectLevel += ene.skill.effect.level;
              break;
            }
            case 1: {
              effectedData[type][j].scoreup += ene.skill.effect.scoreup;
              break;
            }
            case 2: {
              effectedData[type][j].chanceBonus += ene.skill.effect.chancebonus;
              break;
            }
          }
        }
        break;
      }
      case 2: {
        // ぜんいん
        for (let j = 0; j < cards1.length; j++) {
          switch (ene.skill.effect.type) {
            case 0: {
              effectedData[type][j].effectLevel += ene.skill.effect.level;
              break;
            }
            case 1: {
              effectedData[type][j].scoreup += ene.skill.effect.scoreup;
              break;
            }
            case 2: {
              effectedData[type][j].chanceBonus += ene.skill.effect.chancebonus;
              break;
            }
          }
        }
        break;
      }
      case 3: {
        // オープニング
        switch (ene.skill.effect.type) {
          case 0: {
            effectedData[type][0].effectLevel += ene.skill.effect.level;
            break;
          }
          case 1: {
            effectedData[type][0].scoreup += ene.skill.effect.scoreup;
            break;
          }
          case 2: {
            effectedData[type][0].chanceBonus += ene.skill.effect.chancebonus;
            break;
          }
        }
        break;
      }
      case 4: {
        // メイン
        switch (ene.skill.effect.type) {
          case 0: {
            effectedData[type][1].effectLevel += ene.skill.effect.level;
            break;
          }
          case 1: {
            effectedData[type][1].scoreup += ene.skill.effect.scoreup;
            break;
          }
          case 2: {
            effectedData[type][1].chanceBonus += ene.skill.effect.chancebonus;
            break;
          }
        }
        break;
      }
      case 5: {
        // クライマックス
        switch (ene.skill.effect.type) {
          case 0: {
            effectedData[type][2].effectLevel += ene.skill.effect.level;
            break;
          }
          case 1: {
            effectedData[type][2].scoreup += ene.skill.effect.scoreup;
            break;
          }
          case 2: {
            effectedData[type][2].chanceBonus += ene.skill.effect.chancebonus;
            break;
          }
        }
        break;
      }
      case 6: {
        // ドレシアタイプ
        for (let j = 0; j < cards1.length; j++) {
          const target = cards1[j];
          if (!target) continue;
          if (target.dressiaType !== ene.skill.effect.target.dressiaType) continue;
          switch (ene.skill.effect.type) {
            case 0: {
              effectedData[type][j].effectLevel += ene.skill.effect.level;
              break;
            }
            case 1: {
              effectedData[type][j].scoreup += ene.skill.effect.scoreup;
              break;
            }
            case 2: {
              effectedData[type][j].chanceBonus += ene.skill.effect.chancebonus;
              break;
            }
          }
        }
        break;
      }
      case 7: {
        // レアリティ
        for (let j = 0; j < cards1.length; j++) {
          const target = cards1[j];
          if (!target) continue;
          if (target.rarity !== ene.skill.effect.target.rarity) continue;
          switch (ene.skill.effect.type) {
            case 0: {
              effectedData[type][j].effectLevel += ene.skill.effect.level;
              break;
            }
            case 1: {
              effectedData[type][j].scoreup += ene.skill.effect.scoreup;
              break;
            }
            case 2: {
              effectedData[type][j].chanceBonus += ene.skill.effect.chancebonus;
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
