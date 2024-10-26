import { util, runtime } from "@aws-appsync/utils";

export function request(ctx) {
  console.log(`results  ${ctx.prev.result}`);
  const table_name = ctx.env.TABLE_NAME;
  const items = ctx.prev.result.items;
  if (items.length <= 0) {
    runtime.earlyReturn(ctx.prev.result.items);
  }
  return {
    operation: "BatchGetItem",
    tables: {
      eota: {
        keys: items.map((item) => {
          const parts = item.GSI1SK.split("#");
          const conversationId = parts[1];

          console.log(`conversation id is ${conversationId}`);

          return util.dynamodb.toMapValues({
            PK: `CONVERSATION#${conversationId}`,
            SK: `CONVERSATION#${conversationId}`,
          });
        }),
        consistentRead: true,
      },
    },
  };
}

/**
 * Returns the BatchGetItem table items
 * @param {import('@aws-appsync/utils').Context} ctx the context
 * @returns {[*]} the items
 */
export function response(ctx) {
  const table_name = ctx.env.TABLE_NAME;
  if (ctx.error) {
    util.error(ctx.error.message, ctx.error.type);
  }
  console.log(`response results  ${ctx.result.data["eota"]}`);

  return ctx.result.data[table_name];
}
