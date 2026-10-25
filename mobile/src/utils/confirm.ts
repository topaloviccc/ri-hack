import { Alert } from 'react-native';

export type ConfirmOptions = {
  title: string;
  message?: string;
  /** Label of the destructive button, e.g. "Remove". */
  confirmLabel: string;
  onConfirm: () => void;
};

/** The app's one confirmation pattern for destructive or irreversible actions. */
export function confirmDestructive({ title, message, confirmLabel, onConfirm }: ConfirmOptions) {
  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    { text: confirmLabel, style: 'destructive', onPress: onConfirm },
  ]);
}
