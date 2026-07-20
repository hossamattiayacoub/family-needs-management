export interface NeedCategory {
  NeedCategoryId: number;
  NeedCategoryName: string;
}

/** Payload used when creating a need category (no id yet). */
export type NeedCategoryCreate = Pick<NeedCategory, 'NeedCategoryName'>;

/** Payload used when updating a need category. */
export type NeedCategoryUpdate = NeedCategory;
