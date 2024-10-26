import { util } from "@aws-appsync/utils";
import { query } from "@aws-appsync/utils/dynamodb";
export const request = (ctx) => {
  const { limit, nextToken, characterId } = ctx.args;
  const index = "characterConversations";
  const key = {
    GSI1PK: { eq: `CHARACTERID#${characterId}` },
    GSI1SK: { beginsWith: "CONVERSATION#" },
  };

  return query({
    query: key,
    limit,
    nextToken,
    index,
    scanIndexForward: false,
  });
};

export const response = (ctx) => {
  ctx.stash.nextToken = ctx.result.nextToken;
  return ctx.result;
};
