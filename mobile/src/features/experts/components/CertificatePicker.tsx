import Ionicons from '@expo/vector-icons/Ionicons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Pressable, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import type { CertificateFile } from '@/features/experts/types';
import { cn } from '@/lib/cn';
import { useThemeColors } from '@/lib/theme';
import { formatBytes } from '@/utils/format';

const ACCEPTED_TYPES = ['application/pdf', 'image/*'];

async function pickFromFiles(): Promise<CertificateFile | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ACCEPTED_TYPES,
    copyToCacheDirectory: true,
  });
  const asset = result.canceled ? undefined : result.assets[0];
  if (!asset) return null;
  return {
    uri: asset.uri,
    name: asset.name,
    sizeBytes: asset.size ?? 0,
    mimeType: asset.mimeType ?? 'application/octet-stream',
  };
}

async function pickFromPhotos(): Promise<CertificateFile | null> {
  const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'images', quality: 0.9 });
  const asset = result.canceled ? undefined : result.assets[0];
  if (!asset) return null;
  return {
    uri: asset.uri,
    name: asset.fileName ?? 'certificate.jpg',
    sizeBytes: asset.fileSize ?? 0,
    mimeType: asset.mimeType ?? 'image/jpeg',
  };
}

export type CertificatePickerProps = {
  value: CertificateFile | null;
  onChange: (file: CertificateFile | null) => void;
  hasError?: boolean;
};

/** One certificate (PDF or image) from Files or Photos. */
export function CertificatePicker({ value, onChange, hasError = false }: CertificatePickerProps) {
  const colors = useThemeColors();

  const pick = async (source: () => Promise<CertificateFile | null>) => {
    try {
      const file = await source();
      if (file) onChange(file);
    } catch {
      Alert.alert("Couldn't open the file", 'Please try again or pick another file.');
    }
  };

  const handleUpload = () =>
    Alert.alert('Upload certificate', 'Choose where your diploma or certificate is.', [
      { text: 'Files', onPress: () => pick(pickFromFiles) },
      { text: 'Photos', onPress: () => pick(pickFromPhotos) },
      { text: 'Cancel', style: 'cancel' },
    ]);

  if (!value) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Upload certificate"
        onPress={handleUpload}
        className={cn(
          'min-h-24 items-center justify-center gap-1 rounded-card border-2 border-dashed bg-surface p-4 active:opacity-70',
          hasError ? 'border-primary' : 'border-border',
        )}
      >
        <Ionicons name="cloud-upload-outline" size={28} color={colors.primary} />
        <Text variant="label">Upload certificate</Text>
        <Text variant="caption">PDF or image, up to 10 MB</Text>
      </Pressable>
    );
  }

  const isPdf = value.mimeType === 'application/pdf';
  return (
    <View className="flex-row items-center gap-3 rounded-card border border-border bg-surface p-3">
      <Ionicons name={isPdf ? 'document-text' : 'image'} size={28} color={colors.primary} />
      <View className="flex-1">
        <Text variant="label" numberOfLines={1}>
          {value.name}
        </Text>
        <Text variant="caption">{formatBytes(value.sizeBytes)}</Text>
      </View>
      <Button
        variant="soft"
        label="Remove"
        accessibilityLabel={`Remove ${value.name}`}
        onPress={() => onChange(null)}
      />
    </View>
  );
}
