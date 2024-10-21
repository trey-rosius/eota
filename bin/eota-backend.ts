#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { EotaBackendStack } from "../lib/eota-backend-stack";

const app = new cdk.App();
new EotaBackendStack(app, "EotaBackendStack", {
  env: {
    account: "132260253285",
    region: "us-east-2",
  },

  /* Uncomment the next line if you know exactly what Account and Region you
   * want to deploy the stack to. */
  // env: { account: '123456789012', region: 'us-east-1' },

  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
});
