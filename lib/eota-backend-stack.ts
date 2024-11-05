import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { EventBus } from "aws-cdk-lib/aws-events";
import { Data } from "./data-construct";
import { AppSync } from "./appsync-construct";
import { OptionHandler } from "./state-machine-construct";

export class EotaBackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const eventBus = new EventBus(this, "EventBus");

    const data = new Data(this, "DataConstruct");

    new AppSync(this, "AppSyncConstruct", {
      eotaTable: data.eotaTable,
      eventBus,
    });

    new OptionHandler(this, "OptionHandler", {
      eventBus,
      eotaTable: data.eotaTable,
    });
  }
}
