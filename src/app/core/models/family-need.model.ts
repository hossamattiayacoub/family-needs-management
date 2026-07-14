export type NeedStatus = 'Pending' | 'Done';

export const NEED_STATUS_VALUES: NeedStatus[] = ['Pending', 'Done'];

export interface FamilyNeed {
  /** Hidden physical row reference returned by the backend, required for update/delete. */
  __row?: number;
  FamilyId: number;
  FamilyName: string;
  NeedId: number;
  NeedName: string;
  Status: NeedStatus;
  /** ISO date string (or '') as returned by the backend. Required when Status = Pending. */
  OrderDate?: string | null;
  /** ISO date string (or '') as returned by the backend. Required when Status = Done. */
  OrderCompletionDate?: string | null;
}

/** Shape submitted from the Add/Edit dialog (dropdown ids + status + dates). */
export interface FamilyNeedFormValue {
  __row?: number;
  FamilyId: number;
  NeedId: number;
  Status: NeedStatus;
  OrderDate?: Date | null;
  OrderCompletionDate?: Date | null;
}
