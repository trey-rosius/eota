import { util } from "@aws-appsync/utils";
import { get } from "@aws-appsync/utils/dynamodb";
export const request = (ctx) => {
  const { conversationId } = ctx.args;

  const key = {
    PK: `CONVERSATION#${conversationId}`,
    SK: `CONVERSATION#${conversationId}`,
  };

  return get({
    key: key,
  });
};

export const response = (ctx) => {
  return ctx.result;
};
