var fs = require('fs')
,   Canvas = require('canvas')
,   Image = Canvas.Image

// check if there's enough input
if (empty($argv[1]) || empty($argv[2])) {
    echo 'gimme at least two image filenames, please.', "\n";
    echo 'e.g. "php idiff.php img1.png img2.png"';
    echo "\n", 'third filename is the image diff, optional, default is "diffy.png"';
    exit(1);
}

// create images
$i1 = @imagecreatefromstring(file_get_contents($argv[1]));
$i2 = @imagecreatefromstring(file_get_contents($argv[2]));

// check if we were given garbage
if (!$i1) {
    echo $argv[1] . ' is not a valid image';
    exit(1);
}
if (!$i2) {
    echo $argv[2] . ' is not a valid image';
    exit(1);
}

// dimensions of the first image
$sx1 = imagesx($i1);
$sy1 = imagesy($i1);

// compare dimensions
if ($sx1 !== imagesx($i2) || $sy1 !== imagesy($i2)) {
    echo "The images are not even the same size";
    exit(1);
}

// create a diff image
$diffi = imagecreatetruecolor($sx1, $sy1);
$green = imagecolorallocate($diffi, 0, 255, 0);
imagefill($diffi, 0, 0, imagecolorallocate($diffi, 0, 0, 0));

// increment this counter when encountering a pixel diff
$different_pixels = 0;

// loop x and y
for ($x = 0; $x < $sx1; $x++) {
    for ($y = 0; $y < $sy1; $y++) {

        $rgb1 = imagecolorat($i1, $x, $y);
        $pix1 = imagecolorsforindex($i1, $rgb1);

        $rgb2 = imagecolorat($i2, $x, $y);
        $pix2 = imagecolorsforindex($i2, $rgb2);

        if ($pix1 !== $pix2) { // different pixel
            // increment and paint in the diff image
            $different_pixels++;
            imagesetpixel($diffi, $x, $y, $green);
        }

    }
}


if (!$different_pixels) {
    echo "Image is the same";
    exit(0);
} else {
    if (empty($argv[3])) {
        $argv[3] = 'diffy.png'; // default result filename
    }
    imagepng($diffi, $argv[3]);
    $total = $sx1 * $sy1;
    echo "$different_pixels/$total different pixels, or ", number_format(100 * $different_pixels / $total, 2), '%';
    exit(1);
}
?>
