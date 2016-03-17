# Unit tests

* Browser: `grunt unittest`
* Node.js: `npm run nodetest`

# Guidelines

+ define a proper structure using `describe` "statements": usually, a class in the engine "EngineClass.js" will have
a corresponding "EngineClass-test.js" spec which verifies the semantics of *EngineClass*. The contents of
*EngineClass* should be wrapped in a `describe('EngineClass')` and the methods of *EngineClass* should be further
wrapped in their own `describe('.superDuperMethod')`. The end result should look like a readable english sentence in
the jasmine reporter along the liens of

```
EngineClass1                        // class-level describe
  .superDuperMethod                 // method-level describe
    computes the TRUE VALUE of PI   // it statement
    computes the universe           // it statement
  .someOtherMethod                  // method-level describe
    does nothing interesting        // it statement

EngineClass2                        // class-level describe
  .boringMethod1                    // method-level describe
    does something                  // it statement
  .boringMethod2                    // method-level describe
    does something else             // it statement
```

* use `toBeCloseTo` when comparing floating point numbers. When comparing matrices/vectors use the
`toBeCloseToMatrix`/`toBeCloseToVector` custom matchers
* use existing custom matchers or define your own; Have a look at `test/CustomMatchers.js`
* when writing math related tests try to use values other than 0 or 1 as they're quite easy to get to. *Ex:* when
writiing a test for the `Matrix.determinant` function don't pick a nice matrix whose determinant will be 0 - there
are plenty of things that can cause that 0.