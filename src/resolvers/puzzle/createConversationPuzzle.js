import { util } from "@aws-appsync/utils";
import { put } from "@aws-appsync/utils/dynamodb";
export const request = (ctx) => {
  const { puzzleName, puzzleDescription, chapterId } = ctx.args.input;
  const id = util.autoId();
  const key = {
    PK: `PUZZLE#${id}`,
    SK: `PUZZLE#${id}`,
  };

  const item = {
    id,
    ...ctx.args.input,
    puzzleId: id,
  };

  return put({
    key: key,
    item: item,
  });
};

export const response = (ctx) => {
  return ctx.result;
};
