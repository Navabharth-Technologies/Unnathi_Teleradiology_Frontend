import dicomParser from "dicom-parser";
import daikon from "daikon";

/**
 * Converts a decoded DICOM image into a browser-renderable Data URL (JPEG/PNG) via HTML Canvas.
 * Supports both uncompressed grayscale/RGB and encapsulated/JPEG frames.
 */
export async function renderDicomToDataUrl(arrayBuffer, frameIndex = 0) {
  try {
    // 1. Try Daikon parser for direct interpreted pixel data
    const daikonParser = new (daikon.default?.Parser || daikon.Parser)();
    const dataView = new DataView(arrayBuffer);
    const dImg = daikonParser.parse(dataView);

    if (dImg && dImg.hasPixelData()) {
      const cols = dImg.getCols();
      const rows = dImg.getRows();

      if (cols > 0 && rows > 0) {
        const interp = dImg.getInterpretedData(false, false, frameIndex);
        if (interp && interp.length >= cols * rows) {
          let minVal;
          let maxVal;

          // Check if WindowCenter and WindowWidth are present in DICOM header
          const wc = dImg.getWindowCenter?.();
          const ww = dImg.getWindowWidth?.();

          if (wc !== undefined && ww !== undefined && ww > 1) {
            // Apply authentic radiological window leveling (e.g. CT/MR Window)
            minVal = wc - ww / 2;
            maxVal = wc + ww / 2;
          } else {
            let min = dImg.getImageMin?.();
            let max = dImg.getImageMax?.();

            if (min === undefined || max === undefined || min === max) {
              min = Infinity;
              max = -Infinity;
              for (let i = 0; i < interp.length; i++) {
                const val = interp[i];
                if (val < min) min = val;
                if (val > max) max = val;
              }
            }
            minVal = min;
            maxVal = max;
          }

          const range = maxVal - minVal || 1;

          if (typeof document !== "undefined") {
            const canvas = document.createElement("canvas");
            canvas.width = cols;
            canvas.height = rows;
            const ctx = canvas.getContext("2d");
            const imgData = ctx.createImageData(cols, rows);
            const data = imgData.data;

            const isRgb = dImg.getNumberOfSamplesPerPixel?.() === 3;

            if (isRgb) {
              for (let i = 0, j = 0; i < cols * rows; i++, j += 4) {
                data[j] = interp[i * 3];
                data[j + 1] = interp[i * 3 + 1];
                data[j + 2] = interp[i * 3 + 2];
                data[j + 3] = 255;
              }
            } else {
              for (let i = 0, j = 0; i < cols * rows; i++, j += 4) {
                const norm = Math.min(255, Math.max(0, Math.round(((interp[i] - minVal) / range) * 255)));
                data[j] = norm;
                data[j + 1] = norm;
                data[j + 2] = norm;
                data[j + 3] = 255;
              }
            }

            ctx.putImageData(imgData, 0, 0);
            return canvas.toDataURL("image/jpeg", 0.95);
          }
        }
      }
    }
  } catch (daikonErr) {
    console.warn("Daikon rasterization fallback:", daikonErr);
  }

  // 2. Fallback: dicomParser check for encapsulated JPEG/JPEGLS frames
  try {
    const parser = dicomParser.default ?? dicomParser;
    const byteArray = new Uint8Array(arrayBuffer);
    const dataSet = parser.parseDicom(byteArray);

    const pixelDataElement = dataSet.elements.x7fe00010;
    if (pixelDataElement && pixelDataElement.encapsulatedPixelData) {
      const frame = parser.readEncapsulatedPixelData(dataSet, pixelDataElement, 0);
      if (frame && frame.length > 0) {
        const blob = new Blob([frame], { type: "image/jpeg" });
        return URL.createObjectURL(blob);
      }
    }
  } catch (dpErr) {
    console.warn("dicom-parser frame fallback:", dpErr);
  }

  return null;
}

/**
 * Extracts all clinical images, series, and patient metadata from an uploaded ZIP archive or raw DCM file.
 * Returns an object with study metadata and an array of extracted series/images.
 */
export async function extractDicomArchive(file, JSZip) {
  const isZip = file.name.toLowerCase().endsWith(".zip") || file.type.includes("zip");

  let patientName = "Unknown Patient";
  let patientUHID = `PAT-${Date.now().toString().slice(-6)}`;
  let age = 45;
  let gender = "Female";
  let modality = "CT";
  let studyDesc = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ").trim() || "Diagnostic Scan";
  let bodyPart = "BODY";
  let accessionNo = `ACC-${Date.now().toString().slice(-6)}`;
  let studyDate = new Date().toISOString();

  const seriesList = [];
  const allRawBuffers = [];

  if (isZip) {
    const zip = new JSZip();
    const zipContent = await zip.loadAsync(file);

    // Collect all image entries (DICOM, JPG, PNG, WebP)
    const entries = [];
    for (const relativePath in zipContent.files) {
      const entry = zipContent.files[relativePath];
      if (entry.dir) continue;
      const lower = relativePath.toLowerCase();

      // Check for DICOM or standard image formats inside ZIP
      if (
        lower.endsWith(".dcm") ||
        lower.endsWith(".ima") ||
        lower.endsWith(".dicom") ||
        lower.endsWith(".jpg") ||
        lower.endsWith(".jpeg") ||
        lower.endsWith(".png") ||
        lower.endsWith(".webp") ||
        (!relativePath.includes(".") && !lower.includes("meta") && !lower.includes("readme"))
      ) {
        entries.push({ relativePath, entry, lower });
      }
    }

    // Sort entries to maintain anatomical sequence
    entries.sort((a, b) => a.relativePath.localeCompare(b.relativePath, undefined, { numeric: true }));

    for (let i = 0; i < entries.length; i++) {
      const { relativePath, entry, lower } = entries[i];
      const fileNameOnly = relativePath.split("/").pop().replace(/\.[^/.]+$/, "");

      try {
        if (
          lower.endsWith(".jpg") ||
          lower.endsWith(".jpeg") ||
          lower.endsWith(".png") ||
          lower.endsWith(".webp")
        ) {
          if (seriesList.length < 50) {
            const blob = await entry.async("blob");
            const url = URL.createObjectURL(blob);
            seriesList.push({
              id: seriesList.length + 1,
              name: fileNameOnly.toUpperCase().slice(0, 24) || `SERIES ${seriesList.length + 1}`,
              image: url,
              fullImage: url,
            });
          }
        } else {
          // Process DICOM
          const buffer = await entry.async("arraybuffer");
          allRawBuffers.push(buffer);
          const byteArray = new Uint8Array(buffer);

          let dicomIdentifiers = {
            studyInstanceUID: "",
            seriesInstanceUID: "",
            seriesDescription: "",
            sopInstanceUID: "",
            instanceNumber: "",
          };

          let numberOfFrames = 1;
          try {
            const parser = dicomParser.default ?? dicomParser;
            const ds = parser.parseDicom(byteArray);

            const getIdentifierTag = (tag) => {
              try {
                return ds.string(tag) || "";
              } catch {
                return "";
              }
            };

            const rawFrames = getIdentifierTag("x00280008");
            if (rawFrames) {
              const parsedFrames = parseInt(rawFrames);
              if (!isNaN(parsedFrames) && parsedFrames > 1) {
                numberOfFrames = parsedFrames;
              }
            }

            dicomIdentifiers = {
              studyInstanceUID: getIdentifierTag("x0020000d"),
              seriesInstanceUID: getIdentifierTag("x0020000e"),
              seriesDescription: getIdentifierTag("x0008103e"),
              seriesNumber: getIdentifierTag("x00200011"),
              sopInstanceUID: getIdentifierTag("x00080018"),
              instanceNumber: getIdentifierTag("x00200013"),
              numberOfFrames,
            };
          } catch (identifierErr) {
            console.warn("DICOM identifier extraction error:", identifierErr);
          }

          // Extract DICOM metadata once from first valid DICOM file
          if (seriesList.length === 0) {
            try {
              const parser = dicomParser.default ?? dicomParser;
              const ds = parser.parseDicom(byteArray, { untilTag: "00200013" });

              const getTag = (t) => {
                try {
                  return ds.string(t) || "";
                } catch {
                  return "";
                }
              };

              const rawName = getTag("x00100010");
              if (rawName) {
                const parts = rawName.split("^").map((s) => s.trim()).filter(Boolean);
                patientName = parts.length >= 2 ? `${parts[1]} ${parts[0]}` : parts[0] || rawName;
              }

              const rawId = getTag("x00100020");
              if (rawId) patientUHID = rawId;

              const rawMod = getTag("x00080060");
              if (rawMod) modality = rawMod;

              const rawDesc = getTag("x00081030");
              if (rawDesc) studyDesc = rawDesc;

              const rawBody = getTag("x00180015");
              if (rawBody) bodyPart = rawBody;

              const rawAcc = getTag("x00080050");
              if (rawAcc) accessionNo = rawAcc;

              const rawSex = getTag("x00100040")?.toUpperCase().trim();
              if (rawSex === "M") gender = "Male";
              else if (rawSex === "F") gender = "Female";

              const rawAge = getTag("x00101010");
              if (rawAge) {
                const parsedAge = parseInt(rawAge);
                if (!isNaN(parsedAge)) age = parsedAge;
              }
            } catch (metaErr) {
              console.warn("DICOM metadata parse error:", metaErr);
            }
          }

          // Extract folder or series metadata
          const pathSegments = relativePath.split("/").filter(Boolean);
          const folderName = pathSegments.length > 1 ? pathSegments[pathSegments.length - 2] : "";
          const sDesc =
            dicomIdentifiers.seriesDescription ||
            (folderName && !folderName.toLowerCase().includes("dicom") ? folderName : "") ||
            fileNameOnly;

          const seriesKey =
            dicomIdentifiers.seriesInstanceUID ||
            (dicomIdentifiers.seriesNumber ? `SERIES_${dicomIdentifiers.seriesNumber}` : "") ||
            (dicomIdentifiers.seriesDescription ? dicomIdentifiers.seriesDescription : "") ||
            folderName ||
            "SERIES_1";

          if (numberOfFrames > 1) {
            // Multi-frame DICOM
            const slices = [];
            const midFrame = Math.floor(numberOfFrames / 2);
            let previewUrl = null;

            for (let f = 0; f < numberOfFrames; f++) {
              const fUrl = await renderDicomToDataUrl(buffer, f);
              if (fUrl) {
                slices.push(fUrl);
                if (f === midFrame || !previewUrl) {
                  previewUrl = fUrl;
                }
              }
            }

            seriesList.push({
              id: seriesList.length + 1,
              seriesKey,
              name: sDesc.toUpperCase().slice(0, 24) || `SERIES ${seriesList.length + 1}`,
              image: previewUrl || slices[0] || null,
              fullImage: previewUrl || slices[0] || null,
              slices: slices.length > 0 ? slices : undefined,
              imageCount: numberOfFrames,
              numberOfFrames: numberOfFrames,
              rawBuffer: buffer,
              studyInstanceUID: dicomIdentifiers.studyInstanceUID,
              seriesInstanceUID: dicomIdentifiers.seriesInstanceUID,
              seriesDescription: dicomIdentifiers.seriesDescription,
              sopInstanceUID: dicomIdentifiers.sopInstanceUID,
              instanceNumber: dicomIdentifiers.instanceNumber,
              seriesNumber: dicomIdentifiers.seriesNumber,
            });
          } else {
            // Single-frame slice: extract image
            // Allow extracting slices across all series (up to 1500 slices total)
            if (seriesList.length < 1500) {
              const renderedUrl = await renderDicomToDataUrl(buffer, 0);
              if (renderedUrl) {
                seriesList.push({
                  id: seriesList.length + 1,
                  seriesKey,
                  name: sDesc.toUpperCase().slice(0, 24) || `SERIES ${seriesList.length + 1}`,
                  image: renderedUrl,
                  fullImage: renderedUrl,
                  slices: [renderedUrl],
                  imageCount: 1,
                  numberOfFrames: 1,
                  rawBuffer: buffer,
                  studyInstanceUID: dicomIdentifiers.studyInstanceUID,
                  seriesInstanceUID: dicomIdentifiers.seriesInstanceUID,
                  seriesDescription: dicomIdentifiers.seriesDescription,
                  sopInstanceUID: dicomIdentifiers.sopInstanceUID,
                  instanceNumber: dicomIdentifiers.instanceNumber,
                  seriesNumber: dicomIdentifiers.seriesNumber,
                });
              }
            }
          }
        }
      } catch (entryErr) {
        console.warn(`Error processing file ${relativePath}:`, entryErr);
      }
    }
  } else {
    // Single DCM file upload
    const buffer = await file.arrayBuffer();
    const byteArray = new Uint8Array(buffer);

    try {
      const parser = dicomParser.default ?? dicomParser;
      const ds = parser.parseDicom(byteArray, { untilTag: "00200013" });

      const getTag = (t) => {
        try {
          return ds.string(t) || "";
        } catch {
          return "";
        }
      };

      const rawName = getTag("x00100010");
      if (rawName) {
        const parts = rawName.split("^").map((s) => s.trim()).filter(Boolean);
        patientName = parts.length >= 2 ? `${parts[1]} ${parts[0]}` : parts[0] || rawName;
      }
      const rawId = getTag("x00100020");
      if (rawId) patientUHID = rawId;

      const rawMod = getTag("x00080060");
      if (rawMod) modality = rawMod;

      const rawDesc = getTag("x00081030");
      if (rawDesc) studyDesc = rawDesc;

      const rawBody = getTag("x00180015");
      if (rawBody) bodyPart = rawBody;

      const rawAcc = getTag("x00080050");
      if (rawAcc) accessionNo = rawAcc;

      const rawSex = getTag("x00100040")?.toUpperCase().trim();
      if (rawSex === "M") gender = "Male";
      else if (rawSex === "F") gender = "Female";

      const rawAge = getTag("x00101010");
      if (rawAge) {
        const parsedAge = parseInt(rawAge);
        if (!isNaN(parsedAge)) age = parsedAge;
      }
    } catch (err) {
      console.warn("Single DCM metadata error:", err);
    }

    const renderedUrl = await renderDicomToDataUrl(buffer);
    if (renderedUrl) {
      seriesList.push({
        id: 1,
        name: file.name.replace(/\.[^/.]+$/, "").toUpperCase().slice(0, 24) || "SCAN_1",
        image: renderedUrl,
        fullImage: renderedUrl,
        rawBuffer: buffer,
      });
    }
  }

  const studyInstanceUIDs = [
    ...new Set(
      seriesList
        .map((series) => series.studyInstanceUID)
        .filter(Boolean)
    ),
  ];

  const studyInstanceUID =
    studyInstanceUIDs.length === 1 ? studyInstanceUIDs[0] : "";

  return {
    patientName,
    patientUHID,
    age,
    gender,
    modality,
    studyDesc,
    bodyPart,
    accessionNo,
    studyDate,
    studyInstanceUID,
    studyInstanceUIDs,
    seriesList,
    allRawBuffers: allRawBuffers.length > 0 ? allRawBuffers : seriesList.map((s) => s.rawBuffer).filter(Boolean),
  };
}
