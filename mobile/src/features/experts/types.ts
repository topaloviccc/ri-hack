import type { Subject } from '@/features/courses';

export const EXPERT_REQUEST_STATUSES = ['pending', 'approved', 'rejected'] as const;

export type ExpertRequestStatus = (typeof EXPERT_REQUEST_STATUSES)[number];

/** A file picked on the device. `uri` is local until the real upload exists. */
export type CertificateFile = {
  uri: string;
  name: string;
  sizeBytes: number;
  mimeType: string;
};

export type ExpertRequest = {
  id: string;
  subject: Subject;
  title: string;
  certificate: Pick<CertificateFile, 'name' | 'sizeBytes' | 'mimeType'>;
  /** ISO 8601 */
  submittedAt: string;
} & ({ status: 'pending' | 'approved' } | { status: 'rejected'; rejectionReason: string });

export type CreateExpertRequest = {
  subject: Subject;
  title: string;
  certificate: CertificateFile;
};
