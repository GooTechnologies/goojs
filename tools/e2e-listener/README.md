### What is this?

It's an util that runs the e2e tests for the engine on the intel NUC and posts the result to some server.
The tests are run every 10 minutes.
This result server is forever running and also provides a page from where the log can be observed.
The result-page is refreshed every 5 minutes.

### How to run?

+ Start the result-catching server on your machine (sorry - it's hardwired to my ip).
+ Run the `./start.sh` on the test running machine.
+ Serve the contents of goojs with some server.
+ Open `http://127.0.0.1:8003/goojs/tools/e2e-listener/status.html` and keep it open (it self-refreshes)