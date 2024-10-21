import { util } from "@aws-appsync/utils";
import { get } from "@aws-appsync/utils/dynamodb";

export const request = (ctx) => {
  const { optionId } = ctx.args.input;
  console.log(`option Id is ${optionId}`);
  /*
  const key = {
    PK: `OPTION#${optionId}`,
    SK: `OPTION#${optionId}`,
  };
  */
  return {};
};

export const response = (ctx) => {
  const { optionId } = ctx.args.input;
  ctx.stash.event = { detailType: "option.sent", detail: ctx.args.input };

  return true;
};
