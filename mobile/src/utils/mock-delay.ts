// TODO(hack): fake latency for mocks so loading states are visible; delete with the mocks. See BACKLOG.md.
const MOCK_DELAY_MS = 400;

export const mockDelay = () => new Promise<void>((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
