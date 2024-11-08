import { util } from "@aws-appsync/utils";
import { query } from "@aws-appsync/utils/dynamodb";
export const request = (ctx) => {
  const index = "getRelics";
  const key = {
    GSI6PK: { eq: `RELIC#` },
    GSI6SK: { beginsWith: "RELIC#" },
  };

  return query({
    query: key,
    index,

    scanIndexForward: true,
  });
};

export const response = (ctx) => {
  console.log(ctx.result);

  return {
    items: ctx.result.items,
  };
};
