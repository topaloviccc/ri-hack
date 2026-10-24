import type { CreateExpertRequest, ExpertRequest } from '@/features/experts/types';
import { ApiError } from '@/lib/api-client';
import { mockDelay } from '@/utils/mock-delay';

// TODO(hack): mock backend kept in memory (resets on restart); the certificate is not actually
// uploaded. Swap for api-client calls (multipart upload) once the API exists. See BACKLOG.md.
const DAY_MS = 86_400_000;

let requests: ExpertRequest[] = [
  {
    id: 'er2',
    subject: 'Food & Drink',
    title: 'Sommelier, WSET Level 3',
    certificate: { name: 'wset-level-3.jpg', sizeBytes: 1_480_000, mimeType: 'image/jpeg' },
    submittedAt: new Date(Date.now() - 6 * DAY_MS).toISOString(),
    status: 'rejected',
    rejectionReason: 'The certificate photo is blurry. Please upload a clearer scan.',
  },
  {
    id: 'er1',
    subject: 'History',
    title: 'MA in Mediterranean History',
    certificate: { name: 'ma-diploma.pdf', sizeBytes: 820_000, mimeType: 'application/pdf' },
    submittedAt: new Date(Date.now() - 30 * DAY_MS).toISOString(),
    status: 'approved',
  },
];

let nextId = 3;

/** A field is blocked while it has a pending or approved request; rejected ones can re-apply. */
export const isSubjectBlocked = (list: ExpertRequest[], subject: ExpertRequest['subject']) =>
  list.some((r) => r.subject === subject && r.status !== 'rejected');

export const expertsApi = {
  /** The signed-in user's requests, newest first. */
  list: async (): Promise<ExpertRequest[]> => {
    await mockDelay();
    return [...requests].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  },
  create: async ({ subject, title, certificate }: CreateExpertRequest): Promise<ExpertRequest> => {
    await mockDelay();
    if (isSubjectBlocked(requests, subject)) {
      throw new ApiError(409, `You already have a request for ${subject}.`);
    }
    const request: ExpertRequest = {
      id: `er${nextId++}`,
      subject,
      title: title.trim(),
      certificate: {
        name: certificate.name,
        sizeBytes: certificate.sizeBytes,
        mimeType: certificate.mimeType,
      },
      submittedAt: new Date().toISOString(),
      status: 'pending',
    };
    requests = [request, ...requests];
    return request;
  },
};
