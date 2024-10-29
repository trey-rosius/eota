import { util } from "@aws-appsync/utils";
import { get } from "@aws-appsync/utils/dynamodb";
export const request = (ctx) => {
  const { id } = ctx.args;

  const key = {
    PK: `CHAPTER#${id}`,
    SK: `CHAPTER#${id}`,
  };

  return get({
    key: key,
  });
};

export const response = (ctx) => {
  if (ctx.error) {
    util.error(ctx.error.message, ctx.error.type);
  }
  return ctx.result;
};
