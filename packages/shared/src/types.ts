export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type UIComponent = {
  id: string;
  tag: string;
  classList: string[];
  text?: string;
  rect: Rect;
};

export type MoveIntent = {
  action: "move";
  componentId: string;
  deltaX: number;
  deltaY: number;
  before: Rect;
  after: Rect;
};

export type GroupMoveMember = {
  componentId: string;
  before: Rect;
  after: Rect;
};

export type GroupMoveIntent = {
  action: "move-group";
  componentIds: string[];
  deltaX: number;
  deltaY: number;
  members: GroupMoveMember[];
};

export type ResizeIntent = {
  action: "resize";
  componentId: string;
  deltaWidth: number;
  deltaHeight: number;
  before: Rect;
  after: Rect;
};

export type UIIntent = GroupMoveIntent | MoveIntent | ResizeIntent;
