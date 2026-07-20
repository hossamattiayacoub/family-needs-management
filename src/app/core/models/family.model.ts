export interface Family {
  FamilyId: number;
  FamilyName: string;
  GroupId: number;
  /** Resolved by the backend for display; not stored directly on this sheet row. */
  GroupName?: string;
  /** Optional contact/address details. */
  MobileNo1?: string;
  MobileNo2?: string;
  Address?: string;
  Location?: string;
  /** Optional free-text notes. */
  Notes?: string;
}

/** Payload used when creating a family (no id yet, no resolved GroupName). */
export type FamilyCreate = Omit<Family, 'FamilyId' | 'GroupName'>;

/** Payload used when updating a family. */
export type FamilyUpdate = Omit<Family, 'GroupName'>;
