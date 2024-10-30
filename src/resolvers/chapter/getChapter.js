import { util } from "@aws-appsync/utils";
import { get } from "@aws-appsync/utils/dynamodb";

export const request = (ctx) => {
  const { chapterId } = ctx.args;

  const key = {
    PK: `CHAPTER#${chapterId}`,
    SK: `CHAPTER#${chapterId}`,
  };

  return get({
    key,
  });
};

export const response = (ctx) => {
  return ctx.result;
};
