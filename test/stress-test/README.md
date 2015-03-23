**What is a stress test?**

A stress test is a way of verifying if a piece of code breaks under above-normal load conditions. They of course, have sense mainly for stateful objects (systems, managers, mutable collections, system bus, renderer). Such tests may also uncover performance pathologies. A stress test should end with '-stress.js'.

**What is a performance test?**

A test with the purpose of measuring the execution speed of a function to compare it with previous versions of itself or alternative proposed implementations. The alternative/old implementations are to be stored in the 'local' directory.

**Any guidelines?**

Try to make sure your test is not optimised away. Many JS optimisers figure out that the functions under test have no side effects and/or their result is not captured and thus will remove it (similar to dead-code-elimination). There are tons of jsperfs that are optimised away and execute... instantly!