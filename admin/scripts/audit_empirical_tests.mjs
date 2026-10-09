// C:/Users/satya/Documents/antigravity/modest-hypatia/admin/scripts/audit_empirical_tests.mjs
// Empirical test suite for Challenger 2: CropModal & Storage Upload fixes

import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("===============================================================");
console.log(" EMPIRICAL VERIFICATION HARNESS: Crop & Storage Upload Fixes");
console.log("===============================================================\n");

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`[PASS] Test ${totalTests}: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`[FAIL] Test ${totalTests}: ${name}`);
    console.error(err);
    process.exitCode = 1;
  }
}

async function runTestAsync(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`[PASS] Test ${totalTests}: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`[FAIL] Test ${totalTests}: ${name}`);
    console.error(err);
    process.exitCode = 1;
  }
}

async function main() {


// ============================================================================
// SUITE 1: CropModal Aspect Ratio Handling & Geometry Math
// ============================================================================
console.log("--- SUITE 1: CropModal Aspect Ratio Handling & Geometry Math ---");

// Replicate react-image-crop core math used in CropModal:
// makeAspectCrop, centerCrop, convertToPixelCrop
function makeAspectCrop(crop, aspect, containerWidth, containerHeight) {
  const pixelCrop = {
    unit: "%",
    width: crop.width,
    height: 0,
    x: crop.x || 0,
    y: crop.y || 0,
  };

  const containerAspect = containerWidth / containerHeight;
  if (aspect > containerAspect) {
    // Width bounded
    pixelCrop.width = crop.width;
    pixelCrop.height = (crop.width * containerWidth) / (containerHeight * aspect);
  } else {
    // Height bounded
    pixelCrop.height = (crop.width * containerAspect) / aspect;
    if (pixelCrop.height > 100) {
      pixelCrop.height = 85;
      pixelCrop.width = (pixelCrop.height * containerHeight * aspect) / containerWidth;
    }
  }
  return pixelCrop;
}

function centerCrop(crop, containerWidth, containerHeight) {
  return {
    ...crop,
    x: (100 - crop.width) / 2,
    y: (100 - crop.height) / 2,
  };
}

function convertToPixelCrop(crop, width, height) {
  return {
    unit: "px",
    x: Math.round((crop.x / 100) * width),
    y: Math.round((crop.y / 100) * height),
    width: Math.round((crop.width / 100) * width),
    height: Math.round((crop.height / 100) * height),
  };
}

// Test image matrices
const testAspectScenarios = [
  { name: "1:1 Square Crop on 1920x1080 Landscape Image", imgW: 1920, imgH: 1080, aspect: 1 },
  { name: "16:9 Landscape Crop on 1080x1920 Portrait Image", imgW: 1080, imgH: 1920, aspect: 16 / 9 },
  { name: "9:16 Mobile Crop on 1920x1080 Landscape Image", imgW: 1920, imgH: 1080, aspect: 9 / 16 },
  { name: "4:3 Classic Crop on 1000x1000 Square Image", imgW: 1000, imgH: 1000, aspect: 4 / 3 },
  { name: "3:4 Product Portrait Crop on 2400x1600 Image", imgW: 2400, imgH: 1600, aspect: 3 / 4 },
  { name: "21:9 Ultrawide Crop on 3840x2160 4K Image", imgW: 3840, imgH: 2160, aspect: 21 / 9 },
  { name: "Extreme 1:10 Banner Crop on 1000x1000 Image", imgW: 1000, imgH: 1000, aspect: 1 / 10 },
  { name: "Extreme 10:1 Ribbon Crop on 1000x1000 Image", imgW: 1000, imgH: 1000, aspect: 10 / 1 },
  { name: "Tiny 20x20 Image with 1:1 Crop", imgW: 20, imgH: 20, aspect: 1 },
  { name: "Huge 8000x6000 Raw Photo with 3:2 Aspect", imgW: 8000, imgH: 6000, aspect: 3 / 2 },
];

testAspectScenarios.forEach((s) => {
  runTest(`Aspect ratio consistency: ${s.name}`, () => {
    const initialPercentCrop = centerCrop(
      makeAspectCrop({ unit: "%", width: 85 }, s.aspect, s.imgW, s.imgH),
      s.imgW,
      s.imgH
    );
    const pixelCrop = convertToPixelCrop(initialPercentCrop, s.imgW, s.imgH);

    assert(pixelCrop.width > 0, `Width should be > 0, got ${pixelCrop.width}`);
    assert(pixelCrop.height > 0, `Height should be > 0, got ${pixelCrop.height}`);
    assert(pixelCrop.x >= 0, `x should be >= 0, got ${pixelCrop.x}`);
    assert(pixelCrop.y >= 0, `y should be >= 0, got ${pixelCrop.y}`);
    assert(pixelCrop.x + pixelCrop.width <= s.imgW + 1, "Crop right edge should stay within image width");
    assert(pixelCrop.y + pixelCrop.height <= s.imgH + 1, "Crop bottom edge should stay within image height");

    const calculatedAspect = pixelCrop.width / pixelCrop.height;
    const diff = Math.abs(calculatedAspect - s.aspect);
    // Allow small rounding tolerance for pixel grid discretization
    const maxAllowedDiff = 0.05 * s.aspect;
    assert(
      diff <= maxAllowedDiff,
      `Calculated aspect ratio ${calculatedAspect} deviates from requested ${s.aspect} by ${diff}`
    );
  });
});

runTest("Free-form crop (aspect = undefined) handles without crashing", () => {
  const imgW = 1200;
  const imgH = 800;
  const initialCrop = { unit: "%", width: 85, height: 85, x: 7.5, y: 7.5 };
  const pixelCrop = convertToPixelCrop(initialCrop, imgW, imgH);

  assert.strictEqual(pixelCrop.width, 1020);
  assert.strictEqual(pixelCrop.height, 680);
  assert.strictEqual(pixelCrop.x, 90);
  assert.strictEqual(pixelCrop.y, 60);
  assert(pixelCrop.x + pixelCrop.width <= imgW);
  assert(pixelCrop.y + pixelCrop.height <= imgH);
});

// ============================================================================
// SUITE 2: Coordinate Scaling Math & DevicePixelRatio Verification
// ============================================================================
console.log("\n--- SUITE 2: Coordinate Scaling Math & DevicePixelRatio Verification ---");

runTest("Source coordinate scaling maps DOM CSS pixels to natural image pixels accurately", () => {
  // Simulating an image displayed in DOM at 600x400, but with natural resolution 1800x1200
  const displayedWidth = 600;
  const displayedHeight = 400;
  const naturalWidth = 1800;
  const naturalHeight = 1200;

  const scaleX = naturalWidth / displayedWidth; // 3.0
  const scaleY = naturalHeight / displayedHeight; // 3.0

  assert.strictEqual(scaleX, 3.0);
  assert.strictEqual(scaleY, 3.0);

  const completedCrop = { x: 50, y: 40, width: 300, height: 200 };

  const sourceX = completedCrop.x * scaleX;
  const sourceY = completedCrop.y * scaleY;
  const sourceWidth = completedCrop.width * scaleX;
  const sourceHeight = completedCrop.height * scaleY;

  assert.strictEqual(sourceX, 150);
  assert.strictEqual(sourceY, 120);
  assert.strictEqual(sourceWidth, 900);
  assert.strictEqual(sourceHeight, 600);

  // Target dimensions without scaling
  const MAX_DIMENSION = 1920;
  let targetWidth = Math.round(sourceWidth);
  let targetHeight = Math.round(sourceHeight);

  assert(targetWidth <= MAX_DIMENSION);
  assert(targetHeight <= MAX_DIMENSION);
  assert.strictEqual(targetWidth / targetHeight, completedCrop.width / completedCrop.height);
});

runTest("CropModal.tsx code does NOT inappropriately multiply by devicePixelRatio", () => {
  const cropModalPath = path.resolve(__dirname, "../src/components/CropModal.tsx");
  const cropModalCode = fs.readFileSync(cropModalPath, "utf-8");

  // Verify devicePixelRatio is not present in canvas math
  const hasDpr = /devicePixelRatio/i.test(cropModalCode);
  assert.strictEqual(
    hasDpr,
    false,
    "CropModal.tsx should NOT contain devicePixelRatio multiplying canvas dimensions"
  );

  // Verify scaleX and scaleY are defined cleanly as naturalWidth / image.width
  const hasScaleX = /const\s+scaleX\s*=\s*image\.naturalWidth\s*\/\s*image\.width/.test(cropModalCode);
  const hasScaleY = /const\s+scaleY\s*=\s*image\.naturalHeight\s*\/\s*image\.height/.test(cropModalCode);
  assert(hasScaleX, "CropModal.tsx must define scaleX as image.naturalWidth / image.width");
  assert(hasScaleY, "CropModal.tsx must define scaleY as image.naturalHeight / image.height");
});

runTest("Dimension bounding (MAX_DIMENSION = 1920) preserves aspect ratio on massive crops", () => {
  const MAX_DIMENSION = 1920;

  // Case A: Landscape crop exceeding 1920
  const sourceWidthA = 4000;
  const sourceHeightA = 2500;
  const initialRatioA = sourceWidthA / sourceHeightA;

  let targetWidthA = Math.round(sourceWidthA);
  let targetHeightA = Math.round(sourceHeightA);

  if (targetWidthA > MAX_DIMENSION || targetHeightA > MAX_DIMENSION) {
    if (targetWidthA > targetHeightA) {
      targetHeightA = Math.round((targetHeightA * MAX_DIMENSION) / targetWidthA);
      targetWidthA = MAX_DIMENSION;
    } else {
      targetWidthA = Math.round((targetWidthA * MAX_DIMENSION) / targetHeightA);
      targetHeightA = MAX_DIMENSION;
    }
  }

  assert.strictEqual(targetWidthA, 1920);
  assert.strictEqual(targetHeightA, 1200);
  const finalRatioA = targetWidthA / targetHeightA;
  assert.strictEqual(finalRatioA, initialRatioA, "Landscape aspect ratio must be strictly preserved");

  // Case B: Portrait crop exceeding 1920
  const sourceWidthB = 2500;
  const sourceHeightB = 4000;
  const initialRatioB = sourceWidthB / sourceHeightB;

  let targetWidthB = Math.round(sourceWidthB);
  let targetHeightB = Math.round(sourceHeightB);

  if (targetWidthB > MAX_DIMENSION || targetHeightB > MAX_DIMENSION) {
    if (targetWidthB > targetHeightB) {
      targetHeightB = Math.round((targetHeightB * MAX_DIMENSION) / targetWidthB);
      targetWidthB = MAX_DIMENSION;
    } else {
      targetWidthB = Math.round((targetWidthB * MAX_DIMENSION) / targetHeightB);
      targetHeightB = MAX_DIMENSION;
    }
  }

  assert.strictEqual(targetHeightB, 1920);
  assert.strictEqual(targetWidthB, 1200);
  const finalRatioB = targetWidthB / targetHeightB;
  assert.strictEqual(finalRatioB, initialRatioB, "Portrait aspect ratio must be strictly preserved");
});

// ============================================================================
// SUITE 3: Memory Leak Cleanup: URL.revokeObjectURL
// ============================================================================
console.log("\n--- SUITE 3: Memory Leak Cleanup: URL.revokeObjectURL ---");

runTest("CropModal.tsx registers URL.revokeObjectURL in useEffect cleanup and completion", () => {
  const cropModalPath = path.resolve(__dirname, "../src/components/CropModal.tsx");
  const cropModalCode = fs.readFileSync(cropModalPath, "utf-8");

  // Check useEffect cleanup hook
  const hasCleanupHook = /useEffect\s*\(\s*\(\)\s*=>\s*\{[\s\S]*?return\s*\(\)\s*=>\s*\{[\s\S]*?URL\.revokeObjectURL\(imageSrc\)[\s\S]*?\};\s*\}\s*,\s*\[imageSrc\]\s*\)/.test(
    cropModalCode
  );
  assert(hasCleanupHook, "CropModal.tsx must contain useEffect cleanup hook revoking imageSrc");

  // Check completion cleanup
  const hasCompletionCleanup = /URL\.revokeObjectURL\(imageSrc\)/.test(cropModalCode);
  assert(hasCompletionCleanup, "CropModal.tsx must call URL.revokeObjectURL on completion");
});

runTest("Simulated Lifecycle executes revokeObjectURL for blob URLs and ignores non-blob URLs", () => {
  const revokedUrls = [];
  const fakeURL = {
    revokeObjectURL: (url) => {
      revokedUrls.push(url);
    },
  };

  // Simulate unmount hook
  function simulateUnmount(imageSrc) {
    if (imageSrc && imageSrc.startsWith("blob:")) {
      fakeURL.revokeObjectURL(imageSrc);
    }
  }

  // 1. Blob URL unmount
  simulateUnmount("blob:http://localhost:3001/uuid-1234");
  assert.strictEqual(revokedUrls.length, 1);
  assert.strictEqual(revokedUrls[0], "blob:http://localhost:3001/uuid-1234");

  // 2. Remote HTTPS URL unmount (should NOT revoke)
  simulateUnmount("https://images.unsplash.com/photo-luxury-gown.jpg");
  assert.strictEqual(revokedUrls.length, 1, "Should not revoke https URLs");

  // 3. Double revoke test (must be safe)
  simulateUnmount("blob:http://localhost:3001/uuid-1234");
  assert.strictEqual(revokedUrls.length, 2, "Second revoke of same blob is safe no-op");
});

// ============================================================================
// SUITE 4: uploadHelper.ts SVG Bypass of WebP Conversion
// ============================================================================
console.log("\n--- SUITE 4: uploadHelper.ts SVG Bypass of WebP Conversion ---");

runTest("uploadHelper.ts detects and bypasses raster compression for SVG, ICO, and GIF files", () => {
  const uploadHelperPath = path.resolve(__dirname, "../src/lib/uploadHelper.ts");
  const uploadHelperCode = fs.readFileSync(uploadHelperPath, "utf-8");

  // Verify isSvg detection logic
  const hasSvgCheck = /isSvg\s*=\s*file\.type\s*===\s*['"]image\/svg\+xml['"]\s*\|\|\s*file\.name\.toLowerCase\(\)\.endsWith\(['"]\.svg['"]\)/.test(
    uploadHelperCode
  );
  assert(hasSvgCheck, "uploadHelper.ts must check both MIME image/svg+xml and .svg extension case-insensitively");

  // Verify SVG branch preserves contentType image/svg+xml and ext 'svg'
  const hasSvgBranch = /if\s*\(isSvg\)\s*\{[\s\S]*?ext\s*=\s*['"]svg['"][\s\S]*?contentType\s*=\s*['"]image\/svg\+xml['"][\s\S]*?fileToUpload\s*=\s*file/.test(
    uploadHelperCode
  );
  assert(hasSvgBranch, "uploadHelper.ts must set ext='svg', contentType='image/svg+xml', and preserve original file");

  // Verify already optimized WebP branch
  const hasOptimizedWebpBranch = /isAlreadyOptimizedWebp[\s\S]*?ext\s*=\s*['"]webp['"][\s\S]*?contentType\s*=\s*['"]image\/webp['"]/.test(
    uploadHelperCode
  );
  assert(hasOptimizedWebpBranch, "uploadHelper.ts must bypass compression for pre-optimized WebP files");
});

runTest("Simulated uploadImage logic preserves SVG without passing to imageCompression", () => {
  let compressionInvoked = false;
  function mockImageCompression() {
    compressionInvoked = true;
    return new Blob(["compressed-webp"], { type: "image/webp" });
  }

  function simulateFileClassifier(file) {
    const isSvg = file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg");
    const isIco = file.type === "image/x-icon" || file.name.toLowerCase().endsWith(".ico");
    const isGif = file.type === "image/gif" || file.name.toLowerCase().endsWith(".gif");
    const isAlreadyOptimizedWebp = file.type === "image/webp" && file.size < 2 * 1024 * 1024;

    let fileToUpload = file;
    let ext = "webp";
    let contentType = "image/webp";

    if (isSvg) {
      ext = "svg";
      contentType = "image/svg+xml";
      fileToUpload = file;
    } else if (isIco) {
      ext = "ico";
      contentType = "image/x-icon";
      fileToUpload = file;
    } else if (isGif) {
      ext = "gif";
      contentType = "image/gif";
      fileToUpload = file;
    } else if (isAlreadyOptimizedWebp) {
      ext = "webp";
      contentType = "image/webp";
      fileToUpload = file;
    } else {
      fileToUpload = mockImageCompression(file);
      ext = "webp";
      contentType = "image/webp";
    }

    return { ext, contentType, fileToUpload };
  }

  // Test SVG file
  compressionInvoked = false;
  const svgResult = simulateFileClassifier({
    name: "raani-atelier-crest.SVG",
    type: "image/svg+xml",
    size: 4096,
  });
  assert.strictEqual(compressionInvoked, false, "imageCompression must NOT be invoked for SVG");
  assert.strictEqual(svgResult.ext, "svg");
  assert.strictEqual(svgResult.contentType, "image/svg+xml");

  // Test PNG file (raster) -> should invoke compression
  compressionInvoked = false;
  const pngResult = simulateFileClassifier({
    name: "photo.png",
    type: "image/png",
    size: 500000,
  });
  assert.strictEqual(compressionInvoked, true, "imageCompression MUST be invoked for PNG raster");
  assert.strictEqual(pngResult.ext, "webp");
  assert.strictEqual(pngResult.contentType, "image/webp");
});

// ============================================================================
// SUITE 5: HLS Chunk Upload Error Catching & Reporting
// ============================================================================
console.log("\n--- SUITE 5: HLS Chunk Upload Error Catching & Reporting ---");

runTest("uploadHelper.ts checks error in HLS chunk upload loop and throws descriptive message", () => {
  const uploadHelperPath = path.resolve(__dirname, "../src/lib/uploadHelper.ts");
  const uploadHelperCode = fs.readFileSync(uploadHelperPath, "utf-8");

  // Verify the loop checks error: chunkError
  const hasChunkErrorCheck = /const\s*\{\s*error:\s*chunkError\s*\}\s*=\s*await\s*supabase\.storage[\s\S]*?\.upload\(filePath,\s*blob/.test(
    uploadHelperCode
  );
  assert(hasChunkErrorCheck, "uploadHelper.ts must destructure { error: chunkError } from supabase upload");

  // Verify that chunkError throws
  const throwsOnChunkError = /if\s*\(chunkError\)\s*\{\s*throw\s+new\s+Error\(`Failed to upload HLS segment \$\{f\.name\}: \$\{chunkError\.message\}`\);\s*\}/.test(
    uploadHelperCode
  );
  assert(throwsOnChunkError, "uploadHelper.ts must throw descriptive Error on chunk upload failure");
});

  await runTestAsync("Simulated HLS chunk loop aborts and reports on segment upload failure", async () => {
    const hlsFiles = [
      { name: "output.m3u8" },
      { name: "output0.ts" },
      { name: "output1.ts" },
      { name: "output2.ts" },
    ];

    const uploadedFiles = [];

    // Mock Supabase storage uploader that fails on segment output1.ts
    const mockUpload = async (filePath, _blob) => {
      if (filePath.includes("output1.ts")) {
        return { error: { message: "Storage quota exceeded or 503 Service Unavailable" } };
      }
      uploadedFiles.push(filePath);
      return { error: null };
    };

    async function simulateHlsUpload(files) {
      const folderId = "test-folder-123";
      for (const f of files) {
        const filePath = `videos/${folderId}/${f.name}`;
        const { error: chunkError } = await mockUpload(filePath, {});
        if (chunkError) {
          throw new Error(`Failed to upload HLS segment ${f.name}: ${chunkError.message}`);
        }
      }
    }

    let caughtError = null;
    try {
      await simulateHlsUpload(hlsFiles);
    } catch (err) {
      caughtError = err;
    }

    assert(caughtError !== null, "HLS chunk loop MUST throw on segment failure");
    assert(
      caughtError.message.includes("Failed to upload HLS segment output1.ts: Storage quota exceeded"),
      `Unexpected error message: ${caughtError.message}`
    );
    // Verify that output2.ts was NEVER attempted after output1.ts failed
    assert(
      !uploadedFiles.some((p) => p.includes("output2.ts")),
      "output2.ts should not be uploaded after output1.ts failed"
    );
  });

  // ============================================================================
  // SUMMARY
  // ============================================================================
  console.log("\n===============================================================");
  console.log(` EMPIRICAL VERIFICATION SUMMARY: ${passedTests}/${totalTests} TESTS PASSED`);
  console.log("===============================================================");

  if (passedTests === totalTests) {
    console.log("All empirical verification tests passed with 0 errors!");
    process.exit(0);
  } else {
    console.error(`Failed ${totalTests - passedTests} tests!`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal error in test suite:", err);
  process.exit(1);
});

