import { util } from "@aws-appsync/utils";
import { put } from "@aws-appsync/utils/dynamodb";
export const request = (ctx) => {
  const id = util.autoId();
  const key = {
    PK: `RELIC#${id}`,
    SK: `RELIC#${id}`,
  };

  const item = {
    id,
    ...ctx.args.input,
    GSI6PK: "RELIC#",
    GSI6SK: `RELIC#${id}`,
    createdAt: util.time.nowISO8601(),
    updatedAt: util.time.nowISO8601(),
  };

  return put({
    key: key,
    item: item,
  });
};

export const response = (ctx) => {
  if (ctx.error) {
    util.error(ctx.error.message, ctx.error.type);
  }
  return ctx.result;
};
