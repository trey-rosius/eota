import { util } from "@aws-appsync/utils";
import { query } from "@aws-appsync/utils/dynamodb";
export const request = (ctx) => {
  const { limit, nextToken } = ctx.args;
  const index = "getConversations";
  const key = {
    GSI4PK: { eq: `CONVERSATION#` },
    GSI4SK: { beginsWith: "CONVERSATION#" },
  };

  return query({
    query: key,
    index,
    limit,
    nextToken,

    scanIndexForward: true,
  });
};

export const response = (ctx) => {
  console.log(ctx.result);

  return {
    items: ctx.result.items,
    nextToken: ctx.result.nextToken,
  };
};
