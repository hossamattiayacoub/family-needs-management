export interface Need {
  NeedId: number;
  NeedName: string;
  NeedCategoryId: number;
  /**
   * Stored directly on the Needs sheet row (denormalized) — populated by the
   * backend from the selected category at save time, not re-resolved on
   * every read. Renaming a category later will not retroactively update
   * this value on existing Need rows.
   */
  NeedCategoryName?: string;
}

/** Payload used when creating a need (no id yet; NeedCategoryName is populated server-side). */
export type NeedCreate = Omit<Need, 'NeedId' | 'NeedCategoryName'>;

/** Payload used when updating a need (NeedCategoryName is populated server-side). */
export type NeedUpdate = Omit<Need, 'NeedCategoryName'>;
