import { marginText } from './string';

describe('string test', () => {
  it('marginText', () => {
    expect(marginText('test', 10)).toBe('------');
    expect(marginText('test', 4)).toBe('');
  });
});
