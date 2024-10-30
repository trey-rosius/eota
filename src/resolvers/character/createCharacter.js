import { util } from "@aws-appsync/utils";
import { put } from "@aws-appsync/utils/dynamodb";
export const request = (ctx) => {
  const { characterName, characterBackstory, role } = ctx.args.input;
  const id = util.autoId();
  const key = {
    PK: `CHARACTER#${id}`,
    SK: `CHARACTER#${id}`,
  };

  const item = {
    id,
    ...ctx.args.input,
    GSI4PK: `CHARACTERID#`,
    GSI4SK: `CHARACTERID#${id}`,
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
