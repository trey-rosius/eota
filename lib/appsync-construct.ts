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

    api.addEnvironmentVariable("TABLE_NAME", eotaTable.tableName);
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
    api.createResolver("createChapter", {
      typeName: "Mutation",
      fieldName: "createChapter",
      runtime: FunctionRuntime.JS_1_0_0,
      dataSource: eotaDs,
      code: Code.fromAsset("./src/resolvers/chapter/createChapter.js"),
    });
    api.createResolver("createCharacter", {
      typeName: "Mutation",
      fieldName: "createCharacter",
      runtime: FunctionRuntime.JS_1_0_0,
      dataSource: eotaDs,
      code: Code.fromAsset("./src/resolvers/character/createCharacter.js"),
    });
    api.createResolver("getCharacter", {
      typeName: "Query",
      fieldName: "getCharacter",
      runtime: FunctionRuntime.JS_1_0_0,
      dataSource: eotaDs,
      code: Code.fromAsset("./src/resolvers/character/getCharacter.js"),
    });
    api.createResolver("getCharacters", {
      typeName: "Query",
      fieldName: "getCharacters",
      runtime: FunctionRuntime.JS_1_0_0,
      dataSource: eotaDs,
      code: Code.fromAsset("./src/resolvers/character/getCharacters.js"),
    });

    api.createResolver("getChapter", {
      typeName: "Query",
      fieldName: "getChapter",
      runtime: FunctionRuntime.JS_1_0_0,
      dataSource: eotaDs,
      code: Code.fromAsset("./src/resolvers/chapter/getChapter.js"),
    });
    api.createResolver("getChapters", {
      typeName: "Query",
      fieldName: "getChapters",
      runtime: FunctionRuntime.JS_1_0_0,
      dataSource: eotaDs,
      code: Code.fromAsset("./src/resolvers/chapter/getChapters.js"),
    });

    api.createResolver("SendOption", {
      typeName: "Mutation",
      fieldName: "sendOption",
      runtime: FunctionRuntime.JS_1_0_0,
      pipelineConfig: [sendOptionFunction, putEvent],
      code: Code.fromAsset("./src/resolvers/pipeline/default.js"),
    });

    api.createResolver("notifyConversationResponse", {
      typeName: "Mutation",
      fieldName: "notifyConversationResponse",
      runtime: FunctionRuntime.JS_1_0_0,
      dataSource: noneDs,
      code: Code.fromAsset("./src/resolvers/notifyConversationResponse.js"),
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

    api.createResolver("createConversationPuzzle", {
      typeName: "Mutation",
      fieldName: "createConversationPuzzle",
      runtime: FunctionRuntime.JS_1_0_0,
      dataSource: eotaDs,
      code: Code.fromAsset(
        "./src/resolvers/puzzle/createConversationPuzzle.js"
      ),
    });
    const getConversationOptionsIdsFunction = new AppsyncFunction(
      this,
      "getConversationOptionsIdsFunction",
      {
        api: api,
        dataSource: eotaDs,
        name: "getConversationOptionsIdsFunction",
        code: Code.fromAsset(
          "./src/resolvers/option/getConversationOptionsIds.js"
        ),
        runtime: FunctionRuntime.JS_1_0_0,
      }
    );

    const batchGetOptionsFunction = new AppsyncFunction(
      this,
      "batchGetOptionsFunction",
      {
        api: api,
        dataSource: eotaDs,
        name: "batchGetOptionsFunction",
        code: Code.fromAsset("./src/resolvers/option/batchGetOptions.js"),
        runtime: FunctionRuntime.JS_1_0_0,
      }
    );

    const afterBatchGetOptionsFunction = new AppsyncFunction(
      this,
      "afterBatchGetOptionsFunction",
      {
        api: api,
        dataSource: noneDs,
        name: "afterBatchGetOptionsFunction",
        code: Code.fromAsset("./src/resolvers/option/afterBatchGetOptions.js"),
        runtime: FunctionRuntime.JS_1_0_0,
      }
    );
    const getCharacterConversationIdsFunction = new AppsyncFunction(
      this,
      "getCharacterConversationIdsFunction",
      {
        api: api,
        dataSource: eotaDs,
        name: "getCharacterConversationIdsFunction",
        code: Code.fromAsset(
          "./src/resolvers/conversation/getCharacterConversationIds.js"
        ),
        runtime: FunctionRuntime.JS_1_0_0,
      }
    );

    const batchGetConversationsFunction = new AppsyncFunction(
      this,
      "batchGetConversationFunction",
      {
        api: api,
        dataSource: eotaDs,
        name: "batchGetConversationFunction",
        code: Code.fromAsset(
          "./src/resolvers/conversation/batchGetConversations.js"
        ),
        runtime: FunctionRuntime.JS_1_0_0,
      }
    );
    const afterBatchGetConversationsFunction = new AppsyncFunction(
      this,
      "afterBatchGetConversationsFunction",
      {
        api: api,
        dataSource: noneDs,
        name: "afterBatchGetConversationsFunction",
        code: Code.fromAsset(
          "./src/resolvers/conversation/afterBatchGetConversations.js"
        ),
        runtime: FunctionRuntime.JS_1_0_0,
      }
    );

    api.createResolver("getCharacterConversations", {
      typeName: "Query",
      code: Code.fromAsset("./src/resolvers/pipeline/default.js"),
      fieldName: "getCharacterConversations",
      pipelineConfig: [
        getCharacterConversationIdsFunction,
        batchGetConversationsFunction,
        afterBatchGetConversationsFunction,
      ],

      runtime: FunctionRuntime.JS_1_0_0,
    });
    api.createResolver("getConversationsOptions", {
      typeName: "Query",
      code: Code.fromAsset("./src/resolvers/pipeline/default.js"),
      fieldName: "getConversationOptions",
      pipelineConfig: [
        getConversationOptionsIdsFunction,
        batchGetOptionsFunction,
        afterBatchGetOptionsFunction,
      ],

      runtime: FunctionRuntime.JS_1_0_0,
    });
    api.createResolver("getPuzzle", {
      typeName: "Query",
      fieldName: "getPuzzle",
      runtime: FunctionRuntime.JS_1_0_0,
      dataSource: eotaDs,
      code: Code.fromAsset("./src/resolvers/puzzle/getPuzzle.js"),
    });
    api.createResolver("getPuzzles", {
      typeName: "Query",
      fieldName: "getPuzzles",
      runtime: FunctionRuntime.JS_1_0_0,
      dataSource: eotaDs,
      code: Code.fromAsset("./src/resolvers/puzzle/getPuzzles.js"),
    });

    api.createResolver("updateConversation", {
      typeName: "Mutation",
      fieldName: "updateConversation",
      runtime: FunctionRuntime.JS_1_0_0,
      dataSource: eotaDs,
      code: Code.fromAsset(
        "./src/resolvers/conversation/updateConversation.js"
      ),
    });

    api.createResolver("getConversation", {
      typeName: "Query",
      fieldName: "getConversation",
      runtime: FunctionRuntime.JS_1_0_0,
      dataSource: eotaDs,
      code: Code.fromAsset("./src/resolvers/conversation/getConversation.js"),
    });
    api.createResolver("getConversations", {
      typeName: "Query",
      fieldName: "getConversations",
      runtime: FunctionRuntime.JS_1_0_0,
      dataSource: eotaDs,
      code: Code.fromAsset("./src/resolvers/conversation/getConversations.js"),
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

    new CfnRule(scope, "ConversationResponse", {
      eventBusName: eventBus.eventBusName,
      eventPattern: {
        source: ["option.responding"],
        "detail-type": ["option.responded"],
      },
      targets: [
        {
          id: "ConversationResponse",
          arn: (api.node.defaultChild as CfnGraphQLApi).attrGraphQlEndpointArn,
          roleArn: ebRuleRole.roleArn,
          appSyncParameters: {
            graphQlOperation: `mutation NotifyConversationResponse($input:ConversationResponseInput!) { notifyConversationResponse(input: $input) { id conversationType imageUrl relicId puzzleId message 
            hasOptions firstConversation characterId chapterId} }`,
          },
          inputTransformer: {
            inputPathsMap: {
              id: "$.detail.option.id",
              conversationType: "$.detail.option.conversationType",
              imageUrl: "$.detail.option.imageUrl",
              relicId: "$.detail.option.relicId",
              puzzleId: "$.detail.option.puzzleId",
              firstConversation: "$.detail.option.firstConversation",
              hasOptions: "$.detail.option.hasOptions",
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
                firstConversation: "<firstConversation>",
                hasOptions: "<hasOptions>",
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
