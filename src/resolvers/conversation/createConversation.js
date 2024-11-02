import { util } from "@aws-appsync/utils";
import { put } from "@aws-appsync/utils/dynamodb";
export const request = (ctx) => {
  const { message, chapterId, characterId } = ctx.args.input;
  const id = util.autoId();
  const key = {
    PK: `CONVERSATION#${id}`,
    SK: `CONVERSATION#${id}`,
  };

  const item = {
    id,
    ...ctx.args.input,
    conversationId: id,
    GSI1PK: `CHARACTERID#${characterId}`,
    GSI1SK: `CONVERSATION#${id}`,
    GSI3PK: `CHAPTERID#${chapterId}`,
    GSI3SK: `CONVERSATION#${id}`,
    GSI5PK: `CONVERSATION#`,
    GSI5SK: `CONVERSATION#${id}`,
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
