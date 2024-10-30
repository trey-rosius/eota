import { util } from "@aws-appsync/utils";
import { get } from "@aws-appsync/utils/dynamodb";
export const request = (ctx) => {
  const { puzzleId } = ctx.args;

  const key = {
    PK: `PUZZLE#${puzzleId}`,
    SK: `PUZZLE#${puzzleId}`,
  };

  return get({
    key: key,
  });
};

export const response = (ctx) => {
  return ctx.result;
};
