import { util } from "@aws-appsync/utils";
import { get } from "@aws-appsync/utils/dynamodb";

export const request = (ctx) => {
  return {};
};

export const response = (ctx) => {
  ctx.stash.event = { detailType: "option.sent", detail: ctx.args.input };

  return true;
};
