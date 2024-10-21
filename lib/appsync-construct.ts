import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { ITable } from "aws-cdk-lib/aws-dynamodb";
import {
  AppsyncFunction,
  AuthorizationType,
  CfnGraphQLApi,
  Code,
  Definition,
  FieldLogLevel,
  FunctionRuntime,
  GraphqlApi,
} from "aws-cdk-lib/aws-appsync";
import { CfnRule, EventBus } from "aws-cdk-lib/aws-events";
import {
  Effect,
  PolicyDocument,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from "aws-cdk-lib/aws-iam";

type AppSyncConstructProps = {
  eotaTable: ITable;
  eventBus: EventBus;
};

export class AppSync extends Construct {
  constructor(scope: Construct, id: string, props: AppSyncConstructProps) {
    super(scope, id);

    const { eotaTable, eventBus } = props;

    // Define the AppSync API
    const api = new GraphqlApi(this, "Api", {
      name: "EOTA API",
      definition: Definition.fromFile("./schema/schema.graphql"),
      logConfig: {
        fieldLogLevel: FieldLogLevel.ALL,
      },
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: AuthorizationType.API_KEY,
        },
        additionalAuthorizationModes: [
          { authorizationType: AuthorizationType.IAM },
        ],
      },
    });

    const eotaDs = api.addDynamoDbDataSource("eota", eotaTable);
    const eventBridgeDs = api.addEventBridgeDataSource("EventBridge", eventBus);
    const noneDs = api.addNoneDataSource("None");

    const sendOptionFunction = new AppsyncFunction(this, "SendOption", {
      api: api,
      name: "SendOption",
      dataSource: noneDs,
      runtime: FunctionRuntime.JS_1_0_0,
      code: Code.fromAsset("./src/resolvers/sendOption.js"),
    });

    const putEvent = new AppsyncFunction(this, "PutEvent", {
      api: api,
      name: "PutEvent",
      dataSource: eventBridgeDs,
      runtime: FunctionRuntime.JS_1_0_0,
      code: Code.fromAsset("./src/resolvers/putEvent.js"),
    });

    api.createResolver("SendOption", {
      typeName: "Mutation",
      fieldName: "sendOption",
      runtime: FunctionRuntime.JS_1_0_0,
      pipelineConfig: [sendOptionFunction, putEvent],
      code: Code.fromInline(`
        export const request = () => { return {}; }
        export const response = (ctx) => { return ctx.result; }
      `),
    });

    api.createResolver("optionResponse", {
      typeName: "Mutation",
      fieldName: "notifyOptionResponse",
      runtime: FunctionRuntime.JS_1_0_0,
      dataSource: noneDs,
      code: Code.fromAsset("./src/resolvers/notifyOptionResponse.js"),
    });
    api.createResolver("createConversation", {
      typeName: "Mutation",
      fieldName: "createConversation",
      runtime: FunctionRuntime.JS_1_0_0,
      dataSource: eotaDs,
      code: Code.fromAsset(
        "./src/resolvers/conversation/createConversation.js"
      ),
    });
    api.createResolver("createConversationOption", {
      typeName: "Mutation",
      fieldName: "createConversationOption",
      runtime: FunctionRuntime.JS_1_0_0,
      dataSource: eotaDs,
      code: Code.fromAsset(
        "./src/resolvers/option/createConversationOption.js"
      ),
    });

    const policyStatement = new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ["appsync:GraphQL"],
      resources: [`${api.arn}/types/Mutation/*`],
    });

    const ebRuleRole = new Role(scope, "AppSyncEventBridgeRole", {
      assumedBy: new ServicePrincipal("events.amazonaws.com"),
      inlinePolicies: {
        PolicyStatement: new PolicyDocument({
          statements: [policyStatement],
        }),
      },
    });

    new CfnRule(scope, "OptionResponse", {
      eventBusName: eventBus.eventBusName,
      eventPattern: {
        source: ["option.responding"],
        "detail-type": ["option.responded"],
      },
      targets: [
        {
          id: "OptionResponse",
          arn: (api.node.defaultChild as CfnGraphQLApi).attrGraphQlEndpointArn,
          roleArn: ebRuleRole.roleArn,
          appSyncParameters: {
            graphQlOperation: `mutation NotifyOptionResponse($input: NotifyOptionResponseInput!) { notifyOptionResponse(input: $input) { id conversationType imageUrl relicId puzzleId message characterId chapterId} }`,
          },
          inputTransformer: {
            inputPathsMap: {
              id: "$.detail.option.id",
              conversationType: "$.detail.option.conversationType",
              imageUrl: "$.detail.option.imageUrl",
              relicId: "$.detail.option.relicId",
              puzzleId: "$.detail.option.puzzleId",
              message: "$.detail.option.message",
              characterId: "$.detail.option.characterId",
              chapterId: "$.detail.option.chapterId",
            },
            inputTemplate: JSON.stringify({
              input: {
                id: "<id>",
                conversationType: "<conversationType>",
                imageUrl: "<imageUrl>",
                relicId: "<relicId>",
                puzzleId: "<puzzleId>",
                message: "<message>",
                characterId: "<characterId>",
                chapterId: "<chapterId>",
              },
            }),
          },
        },
      ],
    });

    // Output the API URL and API Key
    new cdk.CfnOutput(this, "GraphQLAPIURL", {
      value: api.graphqlUrl,
    });

    new cdk.CfnOutput(this, "GraphQLAPIKey", {
      value: api.apiKey || "",
    });
  }
}
