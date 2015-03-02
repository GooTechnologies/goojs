**What is a visual test?**

A very simple scene that features a particular feature of the engine or a bug that was once occurring.
No new feature should be added to the engine unless it is unit tested and/or visual tested.

All *.html* files in this folder are tested using an image comparator. If for some reason you wish to exclude your 
visual test from this comparator add appropriate filters in the *test/e2etesting/filterList.js* file. Also, 
be sure to consult the *README.md* file for e2e testing.

**Any guidelines?**

+ Use *V* to write tests faster and have them working with the automatic checking
+ Add comments here and there - since visual tests target individual features, they can be useful when examples are lacking. Don't go overboard with comments - these are still tests and not full tutorials. If you do wish to write something more elaborate consider doing either a full tutorial or an example (check the `examples` folder)
+ Keep common resources in the base resource folder. Keep resources only relevant to one visual test in the test's folder.
+ Don't require interactivity unless the feature is intrinsically interactive (keyboard/mouse scripts)
+ Don't use scenes created in *Create* - they are a nightmare to maintain with all the data model changes and they rely on too many things that can go wrong therefore rendering the test useless. Exceptions are of course the vtests for the handlers themselves.

**What is V?**

    V.initGoo();              // get some goo
    V.addColoredSpheres();    // adds a bunch of colored spheres
    V.addLights();            // adds standard 3 point lighting
    V.addOrbitCamera();       // adds a orbit camera

    V.process();              // add this to the *end* of any test that is time-dependant (water-shaders, physics vtests, anything moving, ...)

    V.rng                     // the random number generator used by V (for getting random colors)
                              // if you need any randomness use this RNG
    V.rng.nextInt(start, end) // returns a random
    V.rng.nextFloat()         // returns a number between 0 and 1

*V* contains loads more useful methods and is fully documented; check the source.

