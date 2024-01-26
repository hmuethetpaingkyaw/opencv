1. cv.imread(imageElement)
   Purpose: Reads an image from an HTML image element.
   Parameters:
   imageElement: The HTML image element from which the image is read.
   Returns: An OpenCV matrix (cv.Mat) representing the image.
2. cv.cvtColor(im, im_gray, cv.COLOR_RGBA2GRAY)
   Purpose: Converts an image from one color space to another (in this case, from RGBA to grayscale).
   Parameters:
   im: The input image matrix.
   im_gray: The output grayscale image matrix.
   cv.COLOR_RGBA2GRAY: The color conversion code specifying the conversion from RGBA to grayscale.
3. cv.threshold(im_gray, threshold_im, THRESHOLD, 255, cv.THRESH_BINARY)
   Purpose: Applies a threshold to convert a grayscale image into a binary image.
   Parameters:
   im_gray: The input grayscale image matrix.
   threshold_im: The output binary image matrix.
   THRESHOLD: The threshold value.
   255: The maximum pixel value used for thresholding.
   cv.THRESH_BINARY: The thresholding type.
4. cv.findContours(threshold_im, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE)
   Purpose: Finds contours in a binary image.
   Parameters:
   threshold_im: The input binary image matrix.
   contours: A vector to store the contours.
   hierarchy: Optional output vector containing information about the image topology (not used in this example).
   cv.RETR_CCOMP: Retrieval mode for contours.
   cv.CHAIN_APPROX_SIMPLE: Approximation method for contours.
5. cv.contourArea(cnt)
   Purpose: Calculates the area of a contour.
   Parameters:
   cnt: The contour for which the area is calculated.
   Returns: The area of the contour.
6. cv.approxPolyDP(cnt, approx, epsilon, true)
   Purpose: Approximates a polygonal curve with a specified epsilon precision.
   Parameters:
   cnt: The input contour.
   approx: The output approximated polygonal curve.
   epsilon: The approximation accuracy parameter.
   true: Indicates closed contour.
7. cv.getPerspectiveTransform(fromPts, toPts)
   Purpose: Calculates the perspective transformation matrix.
   Parameters:
   fromPts: Source points (input quadrilateral).
   toPts: Destination points (output quadrilateral).
   Returns: The 3x3 perspective transformation matrix.
8. cv.warpPerspective(im, transformedIm, M, dsize)
   Purpose: Applies a perspective transformation to an image.
   Parameters:
   im: The input image matrix.
   transformedIm: The output transformed image matrix.
   M: The 3x3 perspective transformation matrix.
   dsize: The size of the output image.
9. cv.matFromArray(4, 1, cv.CV_32FC2, [cols, 0, 0, 0, 0, rows, cols, rows])
   Purpose: Creates an OpenCV matrix from an array.
   Parameters:
   4, 1: Rows and columns of the matrix.
   cv.CV_32FC2: Type of matrix elements (32-bit floating-point, 2 channels).
   [cols, 0, 0, 0, 0, rows, cols, rows]: Data array representing the four points.
10. cv.imshow("outputCanvas", transformedIm)
    Purpose: Displays an image on an HTML canvas.
    Parameters:
    "outputCanvas": The ID of the HTML canvas element.
    transformedIm: The image matrix to be displayed.
11. im.delete();
    Purpose: Deletes the memory occupied by an OpenCV matrix.
    Note: Memory management is crucial when working with OpenCV in JavaScript, and it's essential to delete matrices to avoid memory leaks.
12. hierarchy.delete();
    Purpose: Deletes the memory occupied by the hierarchy matrix.
    Note: Similar to im.delete(), it's essential to manage memory for matrices that are no longer needed.
