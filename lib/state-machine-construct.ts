import { Construct } from "constructs";
import {
  EventBus,
  EventField,
  Rule,
  RuleTargetInput,
} from "aws-cdk-lib/aws-events";
import {
  Chain,
  DefinitionBody,
  Pass,
  StateMachine,
  TaskInput,
  Wait,
  WaitTime,
} from "aws-cdk-lib/aws-stepfunctions";
import { Duration } from "aws-cdk-lib";

import { SfnStateMachine } from "aws-cdk-lib/aws-events-targets";
import { ITable } from "aws-cdk-lib/aws-dynamodb";

type OptionHandlerProps = {
  eventBus: EventBus;
  eotaTable: ITable;
};

export class OptionHandler extends Construct {
  private eventBus: EventBus;

  constructor(scope: Construct, id: string, props: OptionHandlerProps) {
    super(scope, id);

    const { eventBus, eotaTable } = props;

    this.eventBus = eventBus;
    const sm = new StateMachine(this, "EotaStateMachine", {
      definitionBody: DefinitionBody.fromFile(
        "./state_workflow/eota_workflow.asl.json"
      ),
    });
    eotaTable.grantFullAccess(sm);
    eventBus.grantPutEventsTo(sm);

    new Rule(this, "OptionHandlerRule", {
      eventBus: eventBus,
      eventPattern: {
        source: ["option.api"],
        detailType: ["option.sent"],
      },
      targets: [
        new SfnStateMachine(sm, {
          input: RuleTargetInput.fromObject({
            optionId: EventField.fromPath("$.detail.optionId"),
          }),
        }),
      ],
    });
  }
}
