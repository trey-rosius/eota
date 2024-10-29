import { util } from "@aws-appsync/utils";
import { put } from "@aws-appsync/utils/dynamodb";
export const request = (ctx) => {
  const { chapterTitle } = ctx.args.input;
  const id = util.autoId();
  const key = {
    PK: `CHAPTER#${id}`,
    SK: `CHAPTER#${id}`,
  };

  const item = {
    id,
    ...ctx.args.input,
    conversationId: id,
    chapterId: id,
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
