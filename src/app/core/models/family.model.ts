export interface Family {
  FamilyId: number;
  FamilyName: string;
}

/** Payload used when creating a family (no id yet). */
export type FamilyCreate = Pick<Family, 'FamilyName'>;

/** Payload used when updating a family. */
export type FamilyUpdate = Family;
