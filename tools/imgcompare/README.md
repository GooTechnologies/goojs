imgcompare
==========

Command-line tool for comparing the similarity between two images. Compares feature points and color histograms.

# Install
The main dependency is [OpenCV](http://opencv.org/). The tool has successfully been used with version 2.4.8.2.

* On OSX, you can install this via [homebrew](http://brew.sh/): ```brew install opencv```

You'll also need [CMake](http://cmake.org/).

To build the project, run
```sh
mkdir build;
cd build;
cmake ..;
make;
```

The executable ends up in bin/.
