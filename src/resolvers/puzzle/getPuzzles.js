import { util } from "@aws-appsync/utils";
import { scan } from "@aws-appsync/utils/dynamodb";
export const request = (ctx) => {
  const { limit = 10 } = ctx.args;

  return scan({
    limit,

    filter: {
      SK: { beginsWith: "PUZZLE#" },
    },
    scanIndexForward: true,
  });
};

export const response = (ctx) => {
  return {
    items: ctx.result.items,
  };
};
