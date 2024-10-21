import { put } from "@aws-appsync/utils/dynamodb";
export const request = (ctx) => {
  const { id, characterId, chapterId, message } = ctx.args.input;
  /*
  const key = {
    PK: `ROSIUS#${characterId}`,
    SK: `ROSIUS#${characterId}`,
  };

  return put({
    key: key,
    item: {
      ...ctx.args.input,
    },
  });
  */
  return {};
};

export const response = (ctx) => {
  return ctx.arguments.input;
};
