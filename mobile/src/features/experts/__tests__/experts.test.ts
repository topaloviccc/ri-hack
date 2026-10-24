import { expertsApi, isSubjectBlocked } from '@/features/experts/api/experts.api';
import { MAX_CERTIFICATE_BYTES, validateExpertForm } from '@/features/experts/validation';

jest.mock('@/utils/mock-delay', () => ({ mockDelay: () => Promise.resolve() }));

const certificate = {
  uri: 'file:///diploma.pdf',
  name: 'diploma.pdf',
  sizeBytes: 1000,
  mimeType: 'application/pdf',
};

describe('validateExpertForm', () => {
  it('requires every field', () => {
    expect(validateExpertForm({ subject: null, title: '  ', certificate: null })).toEqual({
      subject: 'Choose a field.',
      title: 'Add your title.',
      certificate: 'Upload a certificate.',
    });
  });

  it('rejects files over 10 MB', () => {
    const big = { ...certificate, sizeBytes: MAX_CERTIFICATE_BYTES + 1 };
    expect(validateExpertForm({ subject: 'History', title: 'PhD', certificate: big })).toEqual({
      certificate: 'The file is larger than 10 MB.',
    });
  });

  it('passes a complete form', () => {
    expect(validateExpertForm({ subject: 'History', title: 'PhD', certificate })).toEqual({});
  });
});

describe('expert requests', () => {
  it('blocks pending/approved fields but lets rejected ones re-apply', async () => {
    const list = await expertsApi.list();
    expect(isSubjectBlocked(list, 'History')).toBe(true); // approved seed
    expect(isSubjectBlocked(list, 'Food & Drink')).toBe(false); // rejected seed

    const created = await expertsApi.create({
      subject: 'Food & Drink',
      title: 'Chef',
      certificate,
    });
    expect(created.status).toBe('pending');
    await expect(
      expertsApi.create({ subject: 'Food & Drink', title: 'Chef', certificate }),
    ).rejects.toThrow('already have a request');
  });
});
