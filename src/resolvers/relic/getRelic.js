import { util } from "@aws-appsync/utils";
import { get } from "@aws-appsync/utils/dynamodb";
export const request = (ctx) => {
  const { relicId } = ctx.args;

  const key = {
    PK: `RELIC#${relicId}`,
    SK: `RELIC#${relicId}`,
  };

  return get({
    key: key,
  });
};

export const response = (ctx) => {
  return ctx.result;
};
