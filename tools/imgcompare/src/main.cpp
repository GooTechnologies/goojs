/**
 * @file SURF_FlannMatcher
 * @brief SURF detector + descriptor + FLANN Matcher
 * @author A. Huaman
 * @see http://docs.opencv.org/doc/tutorials/features2d/feature_flann_matcher/feature_flann_matcher.html
 */

#include <stdio.h>
#include <iostream>
#include "opencv2/core/core.hpp"
#include "opencv2/features2d/features2d.hpp"
#include "opencv2/highgui/highgui.hpp"
#include "opencv2/nonfree/features2d.hpp"
#include "opencv2/imgproc/imgproc.hpp"

using namespace cv;

void readme();

/**
 * @function main
 * @brief Main function
 */
int main( int argc, char** argv ) {
	if( argc != 5 ) {
		readme();
		return EXIT_FAILURE;
	}

	printf("Images:\n\t1. %s\n\t2. %s\n\n", argv[1], argv[2]);
	Mat img_1 = imread( argv[1], CV_LOAD_IMAGE_GRAYSCALE );
	Mat img_2 = imread( argv[2], CV_LOAD_IMAGE_GRAYSCALE );

	double maxDist = atof(argv[3]);
	double maxSumSquares = atof(argv[4]);

	printf("Thresholds:\n\tMax feature point distance: %g\n\tMax sum of color histogram diff squares: %g\n\n",maxDist,maxSumSquares);

	if( !img_1.data || !img_2.data ){
		std::cout<< " --(!) Error reading images " << std::endl;
		return EXIT_FAILURE;
	}

	//-- Step 1: Detect the keypoints using SURF Detector
	int minHessian = 400;

	SurfFeatureDetector detector( minHessian );

	std::vector<KeyPoint> keypoints_1, keypoints_2;

	detector.detect( img_1, keypoints_1 );
	detector.detect( img_2, keypoints_2 );

	//-- Step 2: Calculate descriptors (feature vectors)
	SurfDescriptorExtractor extractor;

	Mat descriptors_1, descriptors_2;

	extractor.compute( img_1, keypoints_1, descriptors_1 );
	extractor.compute( img_2, keypoints_2, descriptors_2 );

	printf("Result:\n");

	bool doFeatureTest = true;
	if ( descriptors_1.empty() || descriptors_2.empty() ){
		if(descriptors_1.empty() && descriptors_2.empty()){
			// Both are empty, which is ok. But the FLANN test will fail if there are no features!
			printf("\tNone of the images had features... Skipping the feature test.\n");
			doFeatureTest = false;
		} else {
			// One is empty - means that images are quite different
			printf("\tImage %d had no features! Can't consider them equal.\n",descriptors_1.empty()?1:2);
			return EXIT_FAILURE;
		}
	}


	//-- Step 3: Matching descriptor vectors using FLANN matcher
	if(doFeatureTest){
		FlannBasedMatcher matcher;
		std::vector< DMatch > matches;
		matcher.match( descriptors_1, descriptors_2, matches );

		double max_dist = 0;
		double min_dist = 100;

		//-- Quick calculation of max and min distances between keypoints
		for( int i = 0; i < descriptors_1.rows; i++ ) {
			double dist = matches[i].distance;
			if( dist < min_dist ) min_dist = dist;
			if( dist > max_dist ) max_dist = dist;
		}


		//printf("%d feature points!\n", descriptors_1.rows);

		// Bail if we find feature points too far away
		double imgMaxDist = 0;
		for( int i = 0; i < descriptors_1.rows; i++ ) {
			double dist = matches[i].distance;

			if( dist > imgMaxDist ){
				imgMaxDist = dist;
			}

			if( dist > maxDist ){
				printf("\tMax dist        = %g  FAILED\n", dist );
				return EXIT_FAILURE;
			}
		}

		printf("\tMax dist       = %g  OK\n", imgMaxDist );
	}

	/*
	//-- Draw only "good" matches (i.e. whose distance is less than 2*min_dist,
	//-- or a small arbitary value ( 0.02 ) in the event that min_dist is very
	//-- small)
	//-- PS.- radiusMatch can also be used here.
	std::vector< DMatch > good_matches;


	for( int i = 0; i < descriptors_1.rows; i++ ) {
		if( matches[i].distance <= max(2*min_dist, 0.02) ) {
			good_matches.push_back( matches[i]);
		}
	}

	//-- Draw only "good" matches
	Mat img_matches;
	drawMatches(img_1, keypoints_1, img_2, keypoints_2,
				good_matches, img_matches, Scalar::all(-1), Scalar::all(-1),
				vector<char>(), DrawMatchesFlags::NOT_DRAW_SINGLE_POINTS );

	//-- Show detected matches
	imshow( "Good Matches", img_matches );

	for( int i = 0; i < (int)good_matches.size(); i++ ){
		printf(	"-- Good Match [%d] Keypoint 1: %d  -- Keypoint 2: %d  \n",
				i,
				good_matches[i].queryIdx,
				good_matches[i].trainIdx );
	}

	waitKey(0);
	*/

	// Histogram compare
	Mat img_color_1 = imread( argv[1], CV_LOAD_IMAGE_COLOR );
	Mat img_color_2 = imread( argv[2], CV_LOAD_IMAGE_COLOR );

	// Separate the image in 3 places ( B, G and R )
	vector<Mat> bgr_planes_1;
	vector<Mat> bgr_planes_2;
	split( img_color_1, bgr_planes_1 );
	split( img_color_2, bgr_planes_2 );

	/// Establish the number of bins
	int histSize = 256;

	/// Set the ranges ( for B,G,R) )
	float range[] = { 0, 256 } ;
	const float* histRange = { range };

	bool uniform = true;
	bool accumulate = false;

	Mat b_hist_1, g_hist_1, r_hist_1;
	Mat b_hist_2, g_hist_2, r_hist_2;

	/// Compute the histograms:
	calcHist( &bgr_planes_1[0], 1, 0, Mat(), b_hist_1, 1, &histSize, &histRange, uniform, accumulate );
	calcHist( &bgr_planes_1[1], 1, 0, Mat(), g_hist_1, 1, &histSize, &histRange, uniform, accumulate );
	calcHist( &bgr_planes_1[2], 1, 0, Mat(), r_hist_1, 1, &histSize, &histRange, uniform, accumulate );
	calcHist( &bgr_planes_2[0], 1, 0, Mat(), b_hist_2, 1, &histSize, &histRange, uniform, accumulate );
	calcHist( &bgr_planes_2[1], 1, 0, Mat(), g_hist_2, 1, &histSize, &histRange, uniform, accumulate );
	calcHist( &bgr_planes_2[2], 1, 0, Mat(), r_hist_2, 1, &histSize, &histRange, uniform, accumulate );

	// Draw the histograms for B, G and R
	int hist_w = 512; int hist_h = 400;
	int bin_w = cvRound( (double) hist_w/histSize );

	Mat histImage( hist_h, hist_w, CV_8UC3, Scalar( 0,0,0) );

	/// Normalize the result to [ 0, 1 ]
	double normalizeMax = 1;//histImage.rows;
	normalize(b_hist_1, b_hist_1, 0, normalizeMax, NORM_MINMAX, -1, Mat() );
	normalize(g_hist_1, g_hist_1, 0, normalizeMax, NORM_MINMAX, -1, Mat() );
	normalize(r_hist_1, r_hist_1, 0, normalizeMax, NORM_MINMAX, -1, Mat() );
	normalize(b_hist_2, b_hist_2, 0, normalizeMax, NORM_MINMAX, -1, Mat() );
	normalize(g_hist_2, g_hist_2, 0, normalizeMax, NORM_MINMAX, -1, Mat() );
	normalize(r_hist_2, r_hist_2, 0, normalizeMax, NORM_MINMAX, -1, Mat() );

	// Compute the sum of squares of the histogram diffs
	double min = b_hist_1.at<float>(0);
	double max = b_hist_1.at<float>(0);
	double sum = 0;
	for( int i = 1; i < histSize; i++ ){
		double v;
		v = b_hist_1.at<float>(i-1); if(v>max) max = v; if(v<min) min = v;
		v = g_hist_1.at<float>(i-1); if(v>max) max = v; if(v<min) min = v;
		v = r_hist_1.at<float>(i-1); if(v>max) max = v; if(v<min) min = v;
		v = b_hist_2.at<float>(i-1); if(v>max) max = v; if(v<min) min = v;
		v = g_hist_2.at<float>(i-1); if(v>max) max = v; if(v<min) min = v;
		v = r_hist_2.at<float>(i-1); if(v>max) max = v; if(v<min) min = v;

		sum += (( pow(b_hist_1.at<float>(i-1) - b_hist_2.at<float>(i-1) , 2)
				+ pow(g_hist_1.at<float>(i-1) - g_hist_2.at<float>(i-1) , 2)
				+ pow(r_hist_1.at<float>(i-1) - r_hist_2.at<float>(i-1) , 2) ) / 3);

		if(sum/histSize > maxSumSquares){
			printf("\tSum of squares = %g  FAILED (stopped when sum passed threshold)\n", sum/histSize);
			return EXIT_FAILURE;
		}
	}

	printf("\tSum of squares = %g  OK\n", sum/histSize);



	/*
	/// Draw for each channel
	for( int i = 1; i < histSize; i++ ){
	    line( histImage, Point( bin_w*(i-1), hist_h - cvRound(r_hist_1.at<float>(i-1)) ) ,
	                     Point( bin_w*(i), hist_h - cvRound(r_hist_1.at<float>(i)) ),
	                     Scalar( 255, 0, 0), 2, 8, 0  );
	    line( histImage, Point( bin_w*(i-1), hist_h - cvRound(r_hist_2.at<float>(i-1)) ) ,
	                     Point( bin_w*(i), hist_h - cvRound(r_hist_2.at<float>(i)) ),
	                     Scalar( 0, 255, 0), 2, 8, 0  );
	}

	namedWindow("calcHist Demo", CV_WINDOW_AUTOSIZE );
	imshow("calcHist Demo", histImage );

	waitKey(0);
	*/

	return EXIT_SUCCESS;
}

/**
 * @function readme
 */
void readme(){
	std::cout << " Usage: ./imgcompare <img1> <img2> <maxdist>" << std::endl;
}
