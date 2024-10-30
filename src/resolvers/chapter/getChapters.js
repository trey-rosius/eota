import { util } from "@aws-appsync/utils";
import { scan } from "@aws-appsync/utils/dynamodb";
export const request = (ctx) => {
  const { limit, nextToken } = ctx.args;

  return scan({
    limit,
    nextToken,

    filter: {
      SK: { beginsWith: "CHAPTER#" },
    },
    scanIndexForward: true,
  });
};

export const response = (ctx) => {
  return {
    nextToken: ctx.result.nextToken,
    items: ctx.result.items,
  };
};
