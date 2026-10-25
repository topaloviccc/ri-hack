import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { CourseList } from './CourseList';
import { httpResponse } from '@/test-support/api-fixture';
import type { CourseGeneration } from '@/features/courses/types';

jest.mock('@/features/courses/hooks/useOpenCourse', () => ({
  useOpenCourse: () => ({ openCourse: jest.fn(), prefetchCourse: jest.fn() }),
}));

describe('course topic search and generation', () => {
  let client: QueryClient;
  let fetchMock: jest.MockedFunction<typeof fetch>;
  const job: CourseGeneration = {
    id: 'job', query: 'Kotor heritage', state: 'RUNNING', message: null, courseId: null,
  };
  beforeEach(() => {
    client = new QueryClient({ defaultOptions: {
      queries: { retry: false, gcTime: Infinity }, mutations: { retry: false, gcTime: Infinity },
    } });
    fetchMock = jest.fn();
    globalThis.fetch = fetchMock;
  });
  afterEach(() => client.clear());
  const mount = (query = 'Kotor heritage') => render(
    <QueryClientProvider client={client}><CourseList query={query} /></QueryClientProvider>,
  );

  it('offers one row after an empty result and calls generation only after a tap', async () => {
    fetchMock.mockImplementation(async (url, init) => httpResponse(
      String(url).includes('/course-generations') ? init?.method === 'POST' ? job : null : [],
    ));
    await mount();
    const create = await screen.findByRole('button', { name: 'Create course' });
    await waitFor(() => expect(create).not.toBeDisabled());
    expect(screen.getAllByText('Create a course about “Kotor heritage”')).toHaveLength(1);
    expect(fetchMock.mock.calls.some(([, init]) => init?.method === 'POST')).toBe(false);
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('query=Kotor+heritage'), expect.anything());
    await fireEvent.press(create);
    expect(await screen.findByRole('button', { name: 'Creating course…' })).toBeDisabled();
    const posted = fetchMock.mock.calls.find(([, init]) => init?.method === 'POST');
    expect(JSON.parse(posted?.[1]?.body as string)).toEqual({ query: 'Kotor heritage' });
  });

  it('shows a refusal restored from the saved job without offering creation again', async () => {
    fetchMock.mockImplementation(async (url) => httpResponse(String(url).includes('/course-generations')
      ? { ...job, state: 'REFUSED', message: 'Choose a topic dominantly tied to one country.' } : []));
    await mount();
    expect(await screen.findByText('Choose a topic dominantly tied to one country.')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Create course' })).toBeNull();
  });

  it('shows failures with an explicit retry and keeps request errors visible', async () => {
    fetchMock.mockImplementation(async (url, init) => init?.method === 'POST'
      ? httpResponse({ detail: 'Geocoder is unavailable.' }, 409)
      : httpResponse(String(url).includes('/course-generations')
        ? { ...job, state: 'FAILED', message: 'Place could not be resolved.' } : []));
    await mount();
    expect(await screen.findByText('Place could not be resolved.')).toBeOnTheScreen();
    await fireEvent.press(await screen.findByRole('button', { name: 'Try creating again' }));
    expect(await screen.findByText('Geocoder is unavailable.')).toBeOnTheScreen();
  });

  it('does not offer generation when search fails', async () => {
    fetchMock.mockResolvedValue(httpResponse({ detail: 'Search offline' }, 503));
    await mount();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Try again' })).toBeOnTheScreen());
    expect(screen.queryByRole('button', { name: 'Create course' })).toBeNull();
    expect(fetchMock.mock.calls.every(([url]) => !String(url).includes('/course-generations'))).toBe(true);
  });
});
