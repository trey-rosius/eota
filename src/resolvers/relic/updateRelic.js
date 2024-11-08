//update conversation
import { util } from "@aws-appsync/utils";
import { update, operations } from "@aws-appsync/utils/dynamodb";

export const request = (ctx) => {
  console.log(ctx.args.input);
  const { id } = ctx.args.input;

  const key = {
    PK: `RELIC#${id}`,
    SK: `RELIC#${id}`,
  };

  return update({
    key,
    update: {
      ...ctx.args.input,
      updatedAt: operations.add(util.time.nowISO8601()),
    },
  });
};

export const response = (ctx) => {
  if (ctx.error) {
    util.error(ctx.error.message, ctx.error.type);
  }
  return ctx.result;
};
