import { RiceType } from '../enums';
import { MealGroup } from '../models';
import { Reply } from '../models/message';

export async function analyseReplies(replies: Reply[]): Promise<MealGroup[]> {
  // const replies = await getReplies();

  // if (!replies.length) {
  //   return Promise.resolve([]);
  // }

  const mealGroups: MealGroup[] = [];

  replies.forEach((reply) => {
    const message = reply.message.replace(/<@U[A-Z0-9]+>/, '');
    const mealNo = analyseMealNo(message);
    const appetite = analyseAppetite(message);
    const specialRequirement = analyseSpecialRequirement(message);
    let riceType = analyseRiceType(message);

    if (riceType === undefined && [1, 2].includes(mealNo)) {
      riceType = RiceType.PurpleRice;
    }

    const mealGroup = mealGroups.find(
      (g) =>
        g.mealNo === mealNo &&
        g.riceType === riceType &&
        g.lessRice === appetite &&
        g.specialRequirement === specialRequirement,
    );

    if (!mealGroup) {
      mealGroups.push({
        mealNo,
        count: 1,
        riceType,
        lessRice: appetite,
        specialRequirement,
        replies: [{ ...reply }],
      });
      return;
    }

    mealGroup.count += 1;
    mealGroup.replies.push({ ...reply });
  });

  return mealGroups;
}

function analyseAppetite(message: string): boolean | undefined {
  if (message.includes('飯少')) {
    return true;
  }

  if (message.includes('少飯')) {
    return true;
  }

  if (message.includes('飯一半')) {
    return true;
  }

  return undefined;
}

function analyseMealNo(message: string): number {
  const matches = message.match(/[1-5]/g);

  if (matches && matches.length === 1) {
    return Number.parseInt(matches[0], 10);
  }

  return -1;
}

function analyseRiceType(message: string): RiceType | undefined {
  if (message.includes('白飯')) {
    return RiceType.WhiteRice;
  }

  if (message.includes('紫米')) {
    return RiceType.PurpleRice;
  }

  return undefined;
}

function analyseSpecialRequirement(message: string): boolean | undefined {
  const pattern1Result = message.includes('不吃');
  const pattern2Result = message.includes('不要');

  if (pattern1Result || pattern2Result) {
    return true;
  }

  return undefined;
}
