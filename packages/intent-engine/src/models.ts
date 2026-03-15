import type { GroupMoveIntent, GroupMoveMember, MoveIntent, Rect, ResizeIntent } from "@ai-ui-runtime/shared";

export type CreateMoveIntentParams = {
  componentId: string;
  before: Rect;
  after: Rect;
};

export type CreateResizeIntentParams = {
  componentId: string;
  before: Rect;
  after: Rect;
};

export type CreateGroupMoveIntentParams = {
  componentIds: string[];
  members: GroupMoveMember[];
};

export type { GroupMoveIntent, GroupMoveMember, MoveIntent, ResizeIntent };
