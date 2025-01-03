
# Garlic `NaN`

_**Add some flavor to your `NaN`**_

Did you know that there are 2^53 - 2 distinct values of `NaN` in JavaScript? I
didn't! I was told there was only a single `NaN` in the language.

There is the regular plain `NaN` that you get when you type those characters
into the console. However the IEEE 754 Double Floating Point format allows for
a great deal more bit patterns that JavaScript engines are happy to call
`NaN`.

What identifies a 64 bit floating point number as a `NaN`? There are only two
rules that need to be followed:

1. All 11 exponent bits need to be set to 1.
2. At least 1 fractional bit has to be set to 1. Interestingly, this is
   because if all fractional bits are set to 0 you get `Infinity` or
   `-Infinity` depending on if the sign bit is set.

![float64 bit pattern][bit-pattern]  
_Image credit Codekaizen (via Wikipedia) [[link][bit-pattern-src]]_

As you can see, there are a lot of bit patterns that could qualify as `NaN`
under those rules. The regular `NaN` that you get when you type `NaN` into the
console (I refer to this as plain `NaN`) follows these rules but only sets the
first bit of the fractional bits to 1 and leaves the rest as 0. That means that
we can set the remainder of the fractional bits to whatever we want (and even
the sign bit) and so long as we don't touch the exponent bits we can
effectively encode a hidden 2^52 bit value. I refer to these as garlic `NaN`.

This library allows you to easily do just that!

Here is an example in Deno (you can do just about the same thing in Node):

```typescript
import { read, write } from "jsr:@synaptogenic/garlic-nan"
import { assert } from "jsr:@std/assert";

// The number that we will hide inside a NaN 🤫
const secretNumber = 42;

// Write the number into the NaN.
const myNan = write(secretNumber);

// Prove that the number is indeed NaN. Nothing shady going on here 😉
assert(Number.isNaN(myNan));

// At a later time read the secret number back out 😈
assert(read(myNan) === secretNumber);
```

You can store any value from: `-2_251_799_813_685_247`, to:
`2_251_799_813_685_247` this way and it will appear to just be a regular
`NaN`.

This works fine in any V8 host environment (Deno, Node, Chrome, etc). Any
JavaScriptCore or SpiderMonkey host environment (Bun, Safari, Firefox) eagerly
convert garlic `NaN` back into plain `NaN` 😞 According to ECMA 262:

> In some implementations, external code might be able to detect a difference
> between various Not-a-Number values, but such behaviour is
> implementation-defined; to ECMAScript code, all NaN values are
> indistinguishable from each other.

### Why?

![for fun][for-fun]

[bit-pattern]: https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/IEEE_754_Double_Floating_Point_Format.svg/618px-IEEE_754_Double_Floating_Point_Format.svg.png
[bit-pattern-src]: https://commons.wikimedia.org/wiki/File:IEEE_754_Double_Floating_Point_Format.svg
[for-fun]: https://raw.githubusercontent.com/synaptogenic/garlic-nan/master/fun.gif
