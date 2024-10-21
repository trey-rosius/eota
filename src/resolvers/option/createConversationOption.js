import { util } from "@aws-appsync/utils";
import { put } from "@aws-appsync/utils/dynamodb";
export const request = (ctx) => {
  const {
    relicId,
    puzzleId,
    conversationId,
    nextConversationId,
    nextStepType,
    optionText,
  } = ctx.args.input;
  const id = util.autoId();
  const key = {
    PK: `OPTION#${id}`,
    SK: `OPTION#${id}`,
  };

  const item = {
    id,
    ...ctx.args.input,
    optionId: id,
    GSI2PK: `CONVERSATION#${conversationId}`,
    GSI2SK: `OPTION#${id}`,
  };

  return put({
    key: key,
    item: item,
  });
};

export const response = (ctx) => {
  return ctx.result;
};
