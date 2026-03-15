import type { GroupMoveIntent, GroupMoveMember, MoveIntent, ResizeIntent } from "@ai-ui-runtime/shared";
import { cloneRect, roundRect, roundTo } from "@ai-ui-runtime/shared";
import type { CreateGroupMoveIntentParams, CreateMoveIntentParams, CreateResizeIntentParams } from "./models";

export class IntentEngine {
  createGroupMoveIntent(params: CreateGroupMoveIntentParams): GroupMoveIntent {
    const members = params.members.map<GroupMoveMember>((member) => ({
      componentId: member.componentId,
      before: roundRect(cloneRect(member.before)),
      after: roundRect(cloneRect(member.after))
    }));

    const anchor = members[0];
    const deltaX = anchor ? roundTo(anchor.after.x - anchor.before.x) : 0;
    const deltaY = anchor ? roundTo(anchor.after.y - anchor.before.y) : 0;

    return {
      action: "move-group",
      componentIds: params.componentIds,
      deltaX,
      deltaY,
      members
    };
  }

  createMoveIntent(params: CreateMoveIntentParams): MoveIntent {
    const before = roundRect(cloneRect(params.before));
    const after = roundRect(cloneRect(params.after));

    return {
      action: "move",
      componentId: params.componentId,
      deltaX: roundTo(after.x - before.x),
      deltaY: roundTo(after.y - before.y),
      before,
      after
    };
  }

  createResizeIntent(params: CreateResizeIntentParams): ResizeIntent {
    const before = roundRect(cloneRect(params.before));
    const after = roundRect(cloneRect(params.after));

    return {
      action: "resize",
      componentId: params.componentId,
      deltaWidth: roundTo(after.width - before.width),
      deltaHeight: roundTo(after.height - before.height),
      before,
      after
    };
  }
}
