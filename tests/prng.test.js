import mulberry32 from '../src/js/prng.js';

test('mulberry32 produces deterministic sequence', () => {
  const rng = mulberry32(123);
  expect(rng()).toBeCloseTo(0.7872516233474016);
  expect(rng()).toBeCloseTo(0.1785435655619949);
  expect(rng()).toBeCloseTo(0.49531551403924823);
});
