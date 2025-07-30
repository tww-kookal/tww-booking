import { uploadToDrive } from '../../src/modules/googleDriveService';

// Mocks
const mockFile = new Blob(['test content'], { type: 'application/pdf' });
mockFile.name = 'test.pdf';
const mockBookingID = 'BID123';

beforeAll(() => {
    global.window = {};
    window.gapi = {
        auth: {
            getToken: jest.fn(() => ({ access_token: 'mock-token' }))
        }
    };
    global.fetch = jest.fn(() => Promise.resolve({ json: () => Promise.resolve({ id: 'mock-file-id' }) }));
});

describe('uploadToDrive', () => {
    it('should upload file and log file ID', async () => {
        jest.setTimeout(10000); // set 10s timeout
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
        // Mock FileReader
        const mockReadAsDataURL = jest.fn(function () {
            // simulate async read by calling onload later
            setTimeout(() => {
                this.result = 'data:text/plain;base64,aGVsbG8gd29ybGQ='; // "hello world" in base64
                this.onload(); // manually trigger
            }, 0);
        });
        global.FileReader = jest.fn().mockImplementation(() => ({
            readAsDataURL: mockReadAsDataURL,
            onload: null,
            onerror: null
        }));

        const fakeFile = new File(['hello world'], 'hello.pdf', { type: 'text/plain' });
                // Simulate FileReader onload
        // Call function
        await uploadToDrive(fakeFile, mockBookingID);
        expect(consoleSpy).toHaveBeenCalledWith('Uploaded File ID: mock-file-id');
        expect(window.gapi.auth.getToken).toHaveBeenCalled();
        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('https://www.googleapis.com/upload/drive/v3/files'),
            expect.objectContaining({
                method: 'POST',
                headers: expect.any(Headers),
                body: expect.any(FormData)
            })
        );
        consoleSpy.mockRestore();
    });

    it('should handle FileReader error', async () => {
        // Mock FileReader error
        const mockFileReader = {
            readAsDataURL: jest.fn(),
            onload: null,
            onerror: null
        };
        global.FileReader = jest.fn(() => mockFileReader);
        setTimeout(() => {
            mockFileReader.onerror('FileReader error');
        }, 0);
        await expect(uploadToDrive(mockFile, mockBookingID)).rejects.toBe('FileReader error');
    });
});
