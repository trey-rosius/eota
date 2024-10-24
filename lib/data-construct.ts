import { Construct } from "constructs";
import {
  Table,
  AttributeType,
  BillingMode,
  ProjectionType,
} from "aws-cdk-lib/aws-dynamodb";
import { RemovalPolicy } from "aws-cdk-lib";

export class Data extends Construct {
  public readonly eotaTable: Table;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.eotaTable = new Table(this, "eota", {
      partitionKey: {
        name: "PK",
        type: AttributeType.STRING,
      },
      sortKey: {
        name: "SK",
        type: AttributeType.STRING,
      },
      tableName: "eota",

      billingMode: BillingMode.PAY_PER_REQUEST,

      removalPolicy: RemovalPolicy.RETAIN_ON_UPDATE_OR_DELETE,
    });

    this.eotaTable.addGlobalSecondaryIndex({
      indexName: "characterConversations",
      partitionKey: { name: "GSI1PK", type: AttributeType.STRING },
      sortKey: { name: "GSI1SK", type: AttributeType.STRING },
      projectionType: ProjectionType.INCLUDE,
      nonKeyAttributes: ["characterId", "message", "chapterId"],
    });

    this.eotaTable.addGlobalSecondaryIndex({
      indexName: "conversationOptions",
      partitionKey: { name: "GSI2PK", type: AttributeType.STRING },
      sortKey: { name: "GSI2SK", type: AttributeType.STRING },
      projectionType: ProjectionType.INCLUDE,
      nonKeyAttributes: ["characterId", "nextConversationId", "chapterId"],
    });
    this.eotaTable.addGlobalSecondaryIndex({
      indexName: "chapterConversations",
      partitionKey: {
        name: "GSI3PK",
        type: AttributeType.STRING,
      },
      sortKey: { name: "GSI3SK", type: AttributeType.STRING },
      projectionType: ProjectionType.INCLUDE,
      nonKeyAttributes: ["characterId", "conversationId", "chapterId"],
    });
  }
}
