import type { Subject } from '@/features/courses';
import type { CertificateFile } from '@/features/experts/types';

export const MAX_CERTIFICATE_BYTES = 10 * 1024 * 1024;

export type ExpertFormValues = {
  subject: Subject | null;
  title: string;
  certificate: CertificateFile | null;
};

export type ExpertFormErrors = Partial<Record<keyof ExpertFormValues, string>>;

export function validateExpertForm(values: ExpertFormValues): ExpertFormErrors {
  const errors: ExpertFormErrors = {};
  if (!values.subject) errors.subject = 'Choose a field.';
  if (!values.title.trim()) errors.title = 'Add your title.';
  if (!values.certificate) errors.certificate = 'Upload a certificate.';
  else if (values.certificate.sizeBytes > MAX_CERTIFICATE_BYTES) {
    errors.certificate = 'The file is larger than 10 MB.';
  }
  return errors;
}
