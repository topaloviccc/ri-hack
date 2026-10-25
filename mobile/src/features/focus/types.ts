export type BlockableApp = {
  packageName: string;
  name: string;
  /** PNG data URI; absent when Android couldn't render the app's icon. */
  iconUri?: string;
};

export type FocusPermissions = {
  /** "Display over other apps": draws the block screen. */
  overlay: boolean;
  /** "Usage access": tells which app is open. */
  usageAccess: boolean;
  /** Optional: the "Nice try!" notification. */
  notifications: boolean;
};
