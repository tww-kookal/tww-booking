import { updateBookingRow, appendBookingRow, handleGenerateReceipt } from '../../src/modules/googleSheetsService';

describe('googleSheetsService', () => {
  beforeEach(() => {
    global.window.gapi = {
      client: {
        sheets: {
          spreadsheets: {
            values: {
              update: jest.fn().mockResolvedValue({ result: 'updated' }),
              append: jest.fn().mockResolvedValue({ result: 'appended' }),
            }
          }
        }
      }
    };
  });

  describe('updateBookingRow', () => {
    it('calls gapi.client.sheets.spreadsheets.values.update with correct params', async () => {
      const rowIndex = 2;
      const bookingRow = ['A', 'B', 'C'];
      await updateBookingRow(rowIndex, bookingRow);
      expect(window.gapi.client.sheets.spreadsheets.values.update).toHaveBeenCalledWith({
        spreadsheetId: expect.any(String),
        range: expect.stringContaining('!A3'),
        valueInputOption: 'USER_ENTERED',
        resource: { values: [bookingRow] }
      });
    });

    it('returns the result from gapi update', async () => {
      const result = await updateBookingRow(1, ['X']);
      expect(result).toEqual({ result: 'updated' });
    });
  });

  describe('appendBookingRow', () => {
    it('calls gapi.client.sheets.spreadsheets.values.append with correct params', async () => {
      const bookingRow = ['A', 'B', 'C'];
      await appendBookingRow(bookingRow);
      expect(window.gapi.client.sheets.spreadsheets.values.append).toHaveBeenCalledWith({
        spreadsheetId: expect.any(String),
        range: expect.any(String),
        valueInputOption: 'USER_ENTERED',
        resource: { values: [bookingRow] }
      });
    });

    it('returns the result from gapi append', async () => {
      const result = await appendBookingRow(['Y']);
      expect(result).toEqual({ result: 'appended' });
    });
  });

  describe('handleGenerateReceipt', () => {
    let openSpy, receiptWindowMock;
    beforeEach(() => {
      receiptWindowMock = {
        document: {
          write: jest.fn(),
          close: jest.fn(),
        }
      };
      openSpy = jest.spyOn(window, 'open').mockReturnValue(receiptWindowMock);
    });

    afterEach(() => {
      openSpy.mockRestore();
    });

    it('opens a new window and writes receipt HTML', () => {
      const booking = {
        bookingID: 'B123',
        customerName: 'John Doe',
        roomName: 'Cedar',
        checkInDate: '2025-08-01',
        checkOutDate: '2025-08-05',
        numberOfNights: 4,
        numberOfPeople: 2,
        contactNumber: '1234567890',
        status: 'Confirmed',
        roomAmount: 5000,
        food: 200,
        campFire: 100,
        otherServices: 50,
        advancePaid: 1000,
        balanceToPay: 4000,
      };
      handleGenerateReceipt(booking);
      expect(window.open).toHaveBeenCalledWith('', '_blank');
      expect(receiptWindowMock.document.write).toHaveBeenCalled();
      const html = receiptWindowMock.document.write.mock.calls[0][0];
      expect(html).toContain('Booking Receipt');
      expect(html).toContain('John Doe');
      expect(html).toContain('Cedar');
      expect(html).toContain('₹5000');
      expect(html).toContain('₹200');
      expect(html).toContain('₹100');
      expect(html).toContain('₹50');
      expect(html).toContain('₹1000');
      expect(html).toContain('₹4000');
      expect(html).toContain('Print Receipt');
      expect(receiptWindowMock.document.close).toHaveBeenCalled();
    });

    it('does not render food/campFire/otherServices rows if values are zero or missing', () => {
      const booking = {
        bookingID: 'B124',
        customerName: 'Jane Doe',
        roomName: 'Pine',
        checkInDate: '2025-09-01',
        checkOutDate: '2025-09-03',
        numberOfNights: 2,
        numberOfPeople: 1,
        contactNumber: '9876543210',
        status: 'Cancelled',
        roomAmount: 3000,
        food: 0,
        campFire: 0,
        otherServices: 0,
        advancePaid: 500,
        balanceToPay: 2500,
      };
      handleGenerateReceipt(booking);
      const html = receiptWindowMock.document.write.mock.calls[0][0];
      expect(html).not.toContain('Food:</th>');
      expect(html).not.toContain('Camp Fire:</th>');
      expect(html).not.toContain('Other Services:</th>');
    });

    it('renders correctly with missing optional fields', () => {
      const booking = {
        bookingID: 'B125',
        customerName: 'Sam',
        roomName: 'Tent',
        checkInDate: '2025-10-01',
        checkOutDate: '2025-10-04',
        numberOfNights: 3,
        numberOfPeople: 3,
        contactNumber: '5555555555',
        status: 'Available',
        roomAmount: 4000,
        advancePaid: 0,
        balanceToPay: 4000,
      };
      handleGenerateReceipt(booking);
      const html = receiptWindowMock.document.write.mock.calls[0][0];
      expect(html).toContain('Tent');
      expect(html).toContain('₹4000');
      expect(html).toContain('₹0');
    });
  });
});