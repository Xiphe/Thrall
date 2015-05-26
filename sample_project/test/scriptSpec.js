/* global describe, it, expect, foo */
describe('script', function() {
  'use strict';

  it('should expose foo', function() {
    expect(foo).toBe('bar');
  });
});
