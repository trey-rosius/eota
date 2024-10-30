import { util } from "@aws-appsync/utils";
import { query } from "@aws-appsync/utils/dynamodb";
export const request = (ctx) => {
  const index = "getCharacters";
  const key = {
    GSI4PK: { eq: `CHARACTERID#` },
    GSI4SK: { beginsWith: "CHARACTERID#" },
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
