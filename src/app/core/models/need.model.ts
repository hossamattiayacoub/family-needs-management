export interface Need {
  NeedId: number;
  NeedName: string;
}

/** Payload used when creating a need (no id yet). */
export type NeedCreate = Pick<Need, 'NeedName'>;

/** Payload used when updating a need. */
export type NeedUpdate = Need;
