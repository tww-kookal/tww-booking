import { getStartingCharacters } from '../../src/modules/roomAvailabilityDotChart.module';

describe('getStartingCharacters', () => {
  it('returns the full name if length is less than numberOfCharacters', () => {
    expect(getStartingCharacters('Sam', 5)).toBe('Sam');
    expect(getStartingCharacters('Room', 10)).toBe('Room');
  });

  it('returns the full name if length is equal to numberOfCharacters', () => {
    expect(getStartingCharacters('Cedar', 5)).toBe('Cedar');
  });

  it('returns the first N characters if name is longer than numberOfCharacters', () => {
    expect(getStartingCharacters('Westwood', 5)).toBe('Westw');
    expect(getStartingCharacters('Pineapple', 4)).toBe('Pine');
  });

  it('returns empty string if name is undefined or null', () => {
    expect(getStartingCharacters(undefined, 5)).toBe('');
    expect(getStartingCharacters(null, 5)).toBe('');
  });

  it('returns empty string if name is empty', () => {
    expect(getStartingCharacters('', 5)).toBe('');
  });

  it('defaults to 5 characters if numberOfCharacters is not provided', () => {
    expect(getStartingCharacters('MapleTree')).toBe('Maple');
  });

  it('handles numberOfCharacters as 0', () => {
    expect(getStartingCharacters('Cedar', 0)).toBe('');
  });

  it('handles numberOfCharacters as negative', () => {
    expect(getStartingCharacters('Cedar', -2)).toBe('');
  });
});