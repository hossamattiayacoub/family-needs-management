export interface Group {
  GroupId: number;
  GroupName: string;
}

/** Payload used when creating a group (no id yet). */
export type GroupCreate = Pick<Group, 'GroupName'>;

/** Payload used when updating a group. */
export type GroupUpdate = Group;
