import { util } from "@aws-appsync/utils";
import { get } from "@aws-appsync/utils/dynamodb";

export const request = (ctx) => {
  const { characterId } = ctx.args;

  const key = {
    PK: `CHARACTERID#${characterId}`,
    SK: `CHARACTERID#${characterId}`,
  };

  return get({
    key,
  });
};

export const response = (ctx) => {
  return ctx.result;
};
