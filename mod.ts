export const max = 2 ** 51 - 1;
export const min = -max;

// write returns a NaN that stores a signed int in the range of
// [-(2 ** 51 - 1)..(2 ** 51 - 1)].
export function write(n: number): number {
  // Validate n is an int.
  if (!Number.isInteger(n)) throw new Error("n must be an int");
  // Validate n is in range to fit in a NaN.
  if (n > max) throw new Error("n is too big");
  if (n < min) throw new Error("n is too smol");

  // Setup a float64 data view to read the sign bit.
  const srcFloat64Buffer = new ArrayBuffer(8);
  const srcFloat64View = new DataView(srcFloat64Buffer);
  srcFloat64View.setFloat64(0, n);

  // Setup a uint64 data view to read the magnitude of the integer.
  const srcUint64Buffer = new ArrayBuffer(8);
  const srcUint64View = new DataView(srcUint64Buffer);
  srcUint64View.setBigUint64(0, BigInt(Math.abs(n)));

  // Create an array of bytes that represent the NaN float64.
  const bytes = [
    // Set all exponent bits high.
    // Read sign bit from src float64.
    0b0111_1111 | srcFloat64View.getUint8(0),
    // Set all exponent bits high.
    // Set the first bit of the fraction high. This burns a bit of storage but
    //   avoids issues with +/-Infinity, makes +/-0 work as expected, and
    //   avoids edge cases with plain NaN representation.
    // Read all other magnitude bits from src uint64.
    0b1111_1000 | srcUint64View.getUint8(1),
    srcUint64View.getUint8(2),
    srcUint64View.getUint8(3),
    srcUint64View.getUint8(4),
    srcUint64View.getUint8(5),
    srcUint64View.getUint8(6),
    srcUint64View.getUint8(7),
  ];

  // Write bytes into a data view and read out the NaN.
  const dstBuffer = new ArrayBuffer(8);
  const dstView = new DataView(dstBuffer);

  for (const [i, b] of bytes.entries()) {
    dstView.setUint8(i, b);
  }

  return dstView.getFloat64(0, false);
}

// read returns a signed int previously written to a NaN. If no value was
// written 0 is returned.
export function read(n: number): number {
  // Validate n is a NaN
  if (!Number.isNaN(n)) throw new Error("n must be a NaN");

  // Setup a float64 data view to read the sign and magnitude bits.
  const srcFloat64Buffer = new ArrayBuffer(8);
  const srcFloat64View = new DataView(srcFloat64Buffer);
  srcFloat64View.setFloat64(0, n);

  // Determine the sign from the float64.
  const negative = (srcFloat64View.getUint8(0) & 0b1000_0000) > 0;

  // Create an array of bytes that represent the magnitude of the value stored
  // in the NaN.
  const bytes = [
    // None of these bits can be set.
    0,
    // Read all other magnitude bits from src uint64. The first five bits
    // aren't available.
    0b0000_0111 & srcFloat64View.getUint8(1),
    srcFloat64View.getUint8(2),
    srcFloat64View.getUint8(3),
    srcFloat64View.getUint8(4),
    srcFloat64View.getUint8(5),
    srcFloat64View.getUint8(6),
    srcFloat64View.getUint8(7),
  ];

  // Write bytes into a data view and read out the int.
  const dstBuffer = new ArrayBuffer(8);
  const dstView = new DataView(dstBuffer);

  for (const [i, b] of bytes.entries()) {
    dstView.setUint8(i, b);
  }

  let result = Number(dstView.getBigUint64(0, false));
  if (negative) result *= -1;
  return result;
}
