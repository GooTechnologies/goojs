CMAKE_MINIMUM_REQUIRED(VERSION 2.8)

INCLUDE_DIRECTORIES(${OPENCV_INCLUDE_DIR})
LINK_DIRECTORIES   (${OPENCV_LIBS_DIR})

SET(SRCS
    src/main.cpp
)
SET(HEADERS
)

SET(EXECUTABLE_OUTPUT_PATH "${CMAKE_CURRENT_LIST_DIR}/bin")

ADD_EXECUTABLE(imgcompare ${HEADERS} ${SRCS})

TARGET_LINK_LIBRARIES(imgcompare
    opencv_core
    opencv_features2d
    opencv_highgui
    opencv_imgproc
    opencv_nonfree
    opencv_flann
    opencv_core
)
