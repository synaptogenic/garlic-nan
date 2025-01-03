import { assert, assertEquals, assertThrows } from "jsr:@std/assert";
import { max, min, read, write } from "./mod.ts";

const canWriteAndReadBack = [15, -15, 0, -0, max, min, max - 1, min + 1];

for (const n of canWriteAndReadBack) {
  Deno.test(
    "can write and read back: " + ((Object.is(n, -0)) ? "-0" : n).toString(),
    () => {
      const w = write(n);
      assert(Number.isNaN(w));
      const r = read(w);
      assertEquals(n, r);
    },
  );
}

Deno.test("plain NaN reads as 0", () => {
  assertEquals(read(NaN), 0);
});

const cantWrite = [max + 1, min - 1, NaN, Infinity, -Infinity, Math.PI];

for (const n of cantWrite) {
  Deno.test("can't write: " + n.toString(), () => {
    assertThrows(() => {
      write(n);
    });
  });
}

const cantRead = [
  15,
  -15,
  0,
  -0,
  max,
  min,
  max - 1,
  min + 1,
  max + 1,
  min - 1,
  Infinity,
  -Infinity,
  Math.PI,
];

for (const n of cantRead) {
  Deno.test("can't read: " + n.toString(), () => {
    assertThrows(() => {
      read(n);
    });
  });
}
