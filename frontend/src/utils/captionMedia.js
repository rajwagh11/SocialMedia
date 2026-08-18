// Downscales an image, or grabs a single representative frame from a video,
// and returns a small JPEG Blob. Used only for the AI caption suggestion —
// the actual post/reel upload always sends the original, untouched file.
//
// This is what makes caption generation fast: instead of uploading a full-size
// photo or a multi-MB video to the server (which then has to re-encode the
// whole thing to base64 and hand it to Gemini), we send one small ~700px JPEG.

const MAX_DIMENSION = 512;
const JPEG_QUALITY = 0.7;

function fitDimensions(width, height, maxDim) {
  if (width <= maxDim && height <= maxDim) return { width, height };
  if (width > height) {
    return { width: maxDim, height: Math.round((height * maxDim) / width) };
  }
  return { width: Math.round((width * maxDim) / height), height: maxDim };
}

function canvasToJpegBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Canvas export failed"))),
      "image/jpeg",
      JPEG_QUALITY
    );
  });
}

export function compressImageForCaption(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = async () => {
      try {
        const { width, height } = fitDimensions(img.naturalWidth, img.naturalHeight, MAX_DIMENSION);
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        resolve(await canvasToJpegBlob(canvas));
      } catch (err) {
        reject(err);
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Could not read image"));
    };

    img.src = objectUrl;
  });
}

export function extractVideoFrameForCaption(file) {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;
    const objectUrl = URL.createObjectURL(file);

    const cleanup = () => URL.revokeObjectURL(objectUrl);

    video.onloadedmetadata = () => {
      // Seek a little into the clip so we don't capture a blank first frame
      const target = Math.min(0.5, Math.max(video.duration * 0.1, 0.05));
      video.currentTime = isFinite(target) ? target : 0;
    };

    video.onseeked = async () => {
      try {
        const { width, height } = fitDimensions(video.videoWidth, video.videoHeight, MAX_DIMENSION);
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(video, 0, 0, width, height);
        resolve(await canvasToJpegBlob(canvas));
      } catch (err) {
        reject(err);
      } finally {
        cleanup();
      }
    };

    video.onerror = () => {
      cleanup();
      reject(new Error("Could not read video"));
    };

    video.src = objectUrl;
  });
}
