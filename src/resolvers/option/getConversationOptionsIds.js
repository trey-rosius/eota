import { util } from "@aws-appsync/utils";
import { query } from "@aws-appsync/utils/dynamodb";
export const request = (ctx) => {
  const { conversationId } = ctx.args;
  const index = "conversationOptions";
  const key = {
    GSI2PK: { eq: `CONVERSATION#${conversationId}` },
    GSI2SK: { beginsWith: "OPTION#" },
  };

  return query({
    query: key,
    index,
    scanIndexForward: true,
  });
};

export const response = (ctx) => {
  return ctx.result;
};
