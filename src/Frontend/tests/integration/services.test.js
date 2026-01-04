
// Mock Fetch
global.fetch = jest.fn(() =>
    Promise.resolve({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve([{ imo: '123', name: 'Test Vessel' }]),
    })
);

// We need to load api-service.js. It assigns to window.apiService.
require('../../wwwroot/js/services/api-service.js');

describe('ApiService (Integration)', () => {
    let service;

    beforeEach(() => {
        service = window.apiService;
        fetch.mockClear();
    });

    test('getVessels calls correct endpoint', async () => {
        const vessels = await service.getVessels();

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining('/api/vessels'),
            expect.objectContaining({ method: 'GET' })
        );
        expect(vessels).toHaveLength(1);
        expect(vessels[0].name).toBe('Test Vessel');
    });

    test('getDocks calls correct endpoint', async () => {
        await service.getDocks();
        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining('/api/docks'),
            expect.anything()
        );
    });
});
