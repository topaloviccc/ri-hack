export type Wallet = { balance: number };

export type UnlockCourseInput = {
  courseId: string;
  /** One key per unlock attempt; resending it never charges twice. */
  idempotencyKey: string;
};
