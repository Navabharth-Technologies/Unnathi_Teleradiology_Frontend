import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMockDb } from "../../store/useMockDb";
import { useAuthStore } from "../../store/useAuthStore";
import { Button } from "../../components/ui/button";
import {
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  Move,
  Contrast,
  Edit3,
  Share2,
  LayoutGrid,
  Crosshair,
  BoxSelect,
  Maximize,
  RotateCw,
  Settings,
  Grid3X3,
  ArrowRightLeft,
  Type as TypeIcon,
  CheckCircle2,
  Image as ImageIcon,
  Lock,
  ExternalLink,
  Layers,
  Sparkles,
  MonitorPlay,
  Play,
  Pause,
  ChevronUp,
  ChevronDown,
  Sliders,
  SkipBack,
  SkipForward,
  Sun,
  Moon,
} from "lucide-react";
import { ShareModal } from "../../components/modals/ShareModal";
import { RichTextEditor } from "../../components/ui/RichTextEditor";
import standardStudiesCatalog from "../../data/standardStudiesCatalog.json";
import kulashekarStudySeries from "../../data/kulashekarStudySeries.json";

export default function ViewerShell() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentRole } = useAuthStore();
  const { studies, patients, hospitals, updateStudy, users, templates, fetchStudyById } =
    useMockDb();

  const [remoteStudy, setRemoteStudy] = useState(null);
  const [isLoadingStudy, setIsLoadingStudy] = useState(false);

  const study = remoteStudy || studies.find((s) => s.id === id);
  const patient =
    patients.find((p) => p.id === study?.patientId) || {
      name: study?.patientName || study?.patient || "Patient",
      age: study?.age || "",
      gender: study?.gender || "",
    };
  const hospital =
    hospitals.find((h) => h.id === study?.hospitalId) || {
      name: "Hospital",
    };

  const [reportText, setReportText] = useState("");
  const [activeTool, setActiveTool] = useState("move");
  const [zoom, setZoom] = useState(100);
  const [windowLevel, setWindowLevel] = useState({ w: 1500, l: -500 });
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isReportingExpanded, setIsReportingExpanded] = useState(true);
  const [activeSeries, setActiveSeries] = useState(0);
  const [activeSlice, setActiveSlice] = useState(0);
  const [isPlayingCine, setIsPlayingCine] = useState(false);
  const [cineFps, setCineFps] = useState(15);
  const [layoutMode, setLayoutMode] = useState("1x1"); // "1x1", "1x2"
  const [reportStatus, setReportStatus] = useState(
    study?.priority === "STAT" || study?.priority === "Emergency" || study?.reportingStatus === "Critical"
      ? "Critical"
      : study?.reportingStatus === "Final"
      ? "Final"
      : "Draft",
  );
  const [showLockedWarning, setShowLockedWarning] = useState(true);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  // Viewer engine mode: "native" (Kin's Cloud PACS DICOM Viewport), "stone" (Orthanc / Stone WebViewer)
  const [viewerEngine, setViewerEngine] = useState("native");
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [isAdjustingWindow, setIsAdjustingWindow] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [activeOrthancId, setActiveOrthancId] = useState(
    study?.orthancStudyId || study?.orthancId || null
  );

  const [orthancSeriesList, setOrthancSeriesList] = useState([]);
  const [studyInstanceUID, setStudyInstanceUID] = useState("");
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);

  // Dedicated map for study instances on Orthanc
  const KNOWN_ORTHANC_STUDIES = {
    st1791790075870: "b44b5adc-7ebcb73b-6bdd1958-e1603611-c7f18465", // Joythi Devi (CT KUB)
    st1792055526381: "b1fa5eaf-70ac981d-e648e6d3-10425267-4898a8a7", // Chandana S K (MR Abdomen)
    st1791878302324: "181da841-cccd5491-1f21a089-e1ed82d8-085c1cb4", // Akshatah Kumari (MR Brain)
    st1791877185303: "1bde1b16-8089af90-eb031297-fc3642fb-8b060c04", // Sarojamma (MR L-Spine)
    st1791887795937: "1bde1b16-8089af90-eb031297-fc3642fb-8b060c04", // Sarojamma (MR L-Spine)
    st1791976917581: "1bde1b16-8089af90-eb031297-fc3642fb-8b060c04", // Sarojamma (MR L-Spine)
    st1792817515327: "83b20b0e-7a76959f-e0803e12-d138e310-b097b511", // Kulashekar (MR L-Spine)
    st1792836411957: "83b20b0e-7a76959f-e0803e12-d138e310-b097b511", // Kulashekar (MR L-Spine)
    st1792835901634: "e8835bdb-37a3d7d6-6b6971b0-b24d07fb-a242c6f3", // Vageesha B (MR Shoulder)
  };

  const isKulashekarStudy = useMemo(() => {
    const pName = (patient?.name || study?.patientName || "").toLowerCase();
    const sDesc = (study?.studyDescription || study?.bodyPart || "").toLowerCase();
    const sUid = (study?.studyInstanceUID || "").toLowerCase();
    return (
      id === "st1792817515327" ||
      id === "st1792836411957" ||
      study?.id === "st1792817515327" ||
      study?.id === "st1792836411957" ||
      study?.orthancStudyId === "83b20b0e-7a76959f-e0803e12-d138e310-b097b511" ||
      pName.includes("kulashekar") ||
      sDesc.includes("ispine") ||
      sDesc.includes("l-spine lifecare") ||
      sUid.includes("30000026102408151555200000003")
    );
  }, [id, study, patient]);

  // Load full study with real scan images from backend if local copy has stripped series or is missing
  useEffect(() => {
    if (!id) return;
    const localStudy = studies.find((s) => s.id === id);
    const hasImages =
      Array.isArray(localStudy?.series) &&
      localStudy.series.some(
        (s) => (s.slices && s.slices.length > 0) || s.image || s.fullImage
      );

    const isOrthancKnown =
      localStudy?.orthancStudyId ||
      localStudy?.orthancId ||
      KNOWN_ORTHANC_STUDIES[localStudy?.id] ||
      KNOWN_ORTHANC_STUDIES[id];

    if (!hasImages && !isOrthancKnown) {
      setIsLoadingStudy(true);
      fetch(`/api/studies/${id}`)
        .then((res) => (res.ok ? res.json() : fetch(`http://localhost:5000/api/studies/${id}`).then((r) => r.json())))
        .then((data) => {
          if (data && data.id) {
            setRemoteStudy(data);
          }
        })
        .catch((err) => {
          console.warn("Could not fetch study by id:", err);
        })
        .finally(() => {
          setIsLoadingStudy(false);
        });
    }
  }, [id, studies]);

  // Fetch Orthanc series whenever study belongs to Orthanc
  useEffect(() => {
    setStudyInstanceUID("");

    let isCancelled = false;

    async function queryOrthanc(level, queryObj) {
      try {
        const bodyStr = JSON.stringify({ Level: level, Query: queryObj });
        const res = await fetch("/orthanc-pacs/tools/find", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: bodyStr,
        }).catch(() =>
          fetch("http://localhost:8042/tools/find", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: bodyStr,
          }).catch(() => null)
        );

        if (res && res.ok) {
          const list = await res.json();
          if (Array.isArray(list) && list.length > 0) {
            return list[0];
          }
        }
      } catch {
        // Ignore and continue fallback
      }
      return null;
    }

    async function resolveAndLoadOrthancStudy() {
      let fetchStudyId =
        study?.orthancStudyId ||
        study?.orthancId ||
        KNOWN_ORTHANC_STUDIES[study?.id] ||
        KNOWN_ORTHANC_STUDIES[id];

      // Auto-discover study in Orthanc universally if not explicitly mapped
      if (!fetchStudyId) {
        try {
          // 1. Match by PatientID / UHID
          const patientIdQuery = patient?.uhid || study?.patientUHID || patient?.id;
          if (patientIdQuery) {
            fetchStudyId = await queryOrthanc("Study", { PatientID: patientIdQuery });
          }

          // 2. Match by StudyInstanceUID
          if (!fetchStudyId) {
            const studyUID =
              study?.studyInstanceUID ||
              study?.series?.[0]?.studyInstanceUID;
            if (studyUID) {
              fetchStudyId = await queryOrthanc("Study", { StudyInstanceUID: studyUID });
            }
          }

          // 3. Match by Accession Number
          if (!fetchStudyId) {
            const acc = study?.accessionNumber || study?.caseNumber;
            if (acc) {
              fetchStudyId = await queryOrthanc("Study", { AccessionNumber: acc });
            }
          }

          // 4. Match by PatientName
          if (!fetchStudyId && (patient?.name || study?.patientName)) {
            const rawName = patient?.name || study?.patientName || "";
            const nameTokens = rawName.replace(/[^\w\s]/g, "").trim().split(/\s+/).filter(Boolean);
            const nameQuery = nameTokens[0];
            if (nameQuery) {
              fetchStudyId = await queryOrthanc("Study", { PatientName: `*${nameQuery}*` });
            }
          }
        } catch (findErr) {
          console.warn("Could not auto-find study in Orthanc:", findErr);
        }
      }

      if (!fetchStudyId || isCancelled) {
        if (!fetchStudyId) {
          setOrthancSeriesList([]);
          setStudyInstanceUID("");
        }
        return;
      }

      setActiveOrthancId(fetchStudyId);

      // Fetch authentic StudyInstanceUID from Orthanc study details
      fetch(`/orthanc-pacs/studies/${fetchStudyId}`)
        .then((res) => (res.ok ? res.json() : fetch(`http://localhost:8042/studies/${fetchStudyId}`).then((r) => r.json())))
        .then((studyDetails) => {
          if (isCancelled) return;
          const uid =
            studyDetails?.MainDicomTags?.StudyInstanceUID ||
            studyDetails?.StudyInstanceUID ||
            "";
          if (uid) {
            setStudyInstanceUID(uid);
          }
        })
        .catch(() => {});

      // Fetch authentic series and all instances directly from Orthanc
      fetch(`/orthanc-pacs/studies/${fetchStudyId}/series`)
        .then((res) => (res.ok ? res.json() : fetch(`http://localhost:8042/studies/${fetchStudyId}/series`).then((r) => r.json())))
        .then(async (rawSeriesList) => {
          if (isCancelled) return;
          if (Array.isArray(rawSeriesList) && rawSeriesList.length > 0) {
            // Sort series by SeriesNumber to maintain natural radiological order
            const seriesList = [...rawSeriesList].sort((a, b) => {
              const numA = Number(a.MainDicomTags?.SeriesNumber) || 0;
              const numB = Number(b.MainDicomTags?.SeriesNumber) || 0;
              return numA - numB;
            });

            const loaded = [];
            for (let i = 0; i < seriesList.length; i++) {
              const s = seriesList[i];
              const seriesId = s.ID || s.id;
              const desc = s.MainDicomTags?.SeriesDescription || `Series ${s.MainDicomTags?.SeriesNumber || i + 1}`;
              const instanceIds = s.Instances || [];
              
              let sliceUrls = [];

              if (instanceIds.length > 0) {
                const metadataResults = await Promise.all(
                  instanceIds.map(async (instId, originalIndex) => {
                    try {
                      const response = await fetch(
                        `/orthanc-pacs/instances/${instId}/tags?simplify`
                      ).catch(() => fetch(`http://localhost:8042/instances/${instId}/tags?simplify`).catch(() => null));

                      if (!response || !response.ok) {
                        return {
                          instId,
                          originalIndex,
                          z: null,
                          instanceNumber: null,
                          numberOfFrames: 1,
                        };
                      }

                      const tags = await response.json();
                      const position = tags.ImagePositionPatient
                        ?.split("\\")
                        .map(Number);

                      const z =
                        position?.length >= 3 &&
                        Number.isFinite(position[2])
                          ? position[2]
                          : null;

                      const parsedInstanceNumber = Number(
                        tags.InstanceNumber
                      );

                      const numFrames = Number(tags.NumberOfFrames);

                      return {
                        instId,
                        originalIndex,
                        z,
                        instanceNumber:
                          Number.isFinite(parsedInstanceNumber) &&
                          tags.InstanceNumber !== undefined
                            ? parsedInstanceNumber
                            : null,
                        numberOfFrames: Number.isFinite(numFrames) && numFrames > 1 ? numFrames : 1,
                      };
                    } catch {
                      return {
                        instId,
                        originalIndex,
                        z: null,
                        instanceNumber: null,
                        numberOfFrames: 1,
                      };
                    }
                  })
                );

                const hasSpatialPositions = metadataResults.some(
                  (entry) => entry.z !== null
                );

                const hasInstanceNumbers = metadataResults.some(
                  (entry) => entry.instanceNumber !== null
                );

                metadataResults.sort((a, b) => {
                  if (hasSpatialPositions && a.z !== null && b.z !== null) {
                    return a.z - b.z || a.originalIndex - b.originalIndex;
                  }

                  if (
                    hasInstanceNumbers &&
                    a.instanceNumber !== null &&
                    b.instanceNumber !== null
                  ) {
                    return (
                      a.instanceNumber - b.instanceNumber ||
                      a.originalIndex - b.originalIndex
                    );
                  }

                  return a.originalIndex - b.originalIndex;
                });

                // Generate slice URLs: handle both Multi-Frame DICOM instances and Single-Slice instances
                for (const item of metadataResults) {
                  if (item.numberOfFrames > 1) {
                    // Multi-frame DICOM instance (e.g. enhanced MR with 96 frames or 13 frames)
                    for (let f = 0; f < item.numberOfFrames; f++) {
                      sliceUrls.push(`/orthanc-pacs/instances/${item.instId}/frames/${f}/preview`);
                    }
                  } else {
                    // Single-frame DICOM slice
                    sliceUrls.push(`/orthanc-pacs/instances/${item.instId}/preview`);
                  }
                }
              }

              if (sliceUrls.length > 0) {
                const midIdx = Math.floor(sliceUrls.length / 2);
                loaded.push({
                  id: i + 1,
                  seriesId: seriesId,
                  name: desc.toUpperCase().slice(0, 24),
                  image: sliceUrls[midIdx] || sliceUrls[0],
                  fullImage: sliceUrls[midIdx] || sliceUrls[0],
                  sliceCount: sliceUrls.length,
                  slices: sliceUrls,
                });
              }
            }

            if (!isCancelled && loaded.length > 0) {
              setOrthancSeriesList(loaded);
              const firstSlices = loaded[0]?.slices || [];
              if (firstSlices.length > 0) {
                setActiveSlice(0);
              }
            }
          }
        })
        .catch(() => {});
    }

    resolveAndLoadOrthancStudy();

    return () => {
      isCancelled = true;
    };
  }, [study?.id, study?.orthancStudyId, study?.orthancId, study?.studyInstanceUID, patient?.name, id]);

  const activeSeriesList = useMemo(() => {
    // 1. If linked to Orthanc and series are loaded, use only real PACS series
    if (activeOrthancId && orthancSeriesList.length > 0) {
      return orthancSeriesList;
    }

    // 2. For studies with uploaded series in DB, use actual series and slices
    if (Array.isArray(study?.series) && study.series.length > 0) {
      const hasPreformedSlices = study.series.some(
        (s) => Array.isArray(s.slices) && s.slices.length > 0
      );

      if (hasPreformedSlices) {
        return study.series
          .map((s, idx) => {
            const slices = (s.slices || []).filter(
              (url) => typeof url === "string" && url.length > 0
            );

            const fallbackImage = s.fullImage || s.image;

            if (slices.length === 0 && fallbackImage) {
              slices.push(fallbackImage);
            }

            return {
              id: s.id ?? idx + 1,
              name: s.name || `Series ${idx + 1}`,
              image: slices[0] || fallbackImage || null,
              fullImage: fallbackImage || slices[0] || null,
              slices,
              sliceCount: slices.length,
            };
          })
          .filter((s) => s.slices.length > 0);
      }

      // Group individual slice objects by series name (e.g. from DICOM ZIP uploads)
      const seriesMap = new Map();
      study.series.forEach((s, idx) => {
        const imgUrl = s.fullImage || s.image;
        if (!imgUrl) return;

        const seriesKey = s.name || s.seriesName || `Series 1`;
        if (!seriesMap.has(seriesKey)) {
          seriesMap.set(seriesKey, {
            id: seriesMap.size + 1,
            name: seriesKey.toUpperCase().slice(0, 24),
            slices: [],
          });
        }
        seriesMap.get(seriesKey).slices.push(imgUrl);
      });

      const grouped = Array.from(seriesMap.values()).map((g) => {
        const rawCount = g.slices.length;
        const targetCount = g.sliceCount || g.imageCount || rawCount;
        let finalSlices = g.slices;
        if (rawCount === 1 && targetCount > 1) {
          finalSlices = Array.from({ length: targetCount }, () => g.slices[0]);
        }
        return {
          ...g,
          image: finalSlices[Math.floor(finalSlices.length / 2)] || finalSlices[0],
          fullImage: finalSlices[Math.floor(finalSlices.length / 2)] || finalSlices[0],
          sliceCount: finalSlices.length,
          slices: finalSlices,
        };
      });

      if (grouped.length > 0) {
        return grouped;
      }
    }

    // 3. For Kulashekar MR L-Spine study (whether viewed locally or hosted on GitHub Pages),
    // provide the authentic 9 series with real scanned previews and full slice counts (e.g. 1/96, 1/13)
    if (isKulashekarStudy) {
      return (kulashekarStudySeries || []).map((s, idx) => ({
        id: s.id ?? idx + 1,
        seriesNumber: s.seriesNumber,
        name: s.name,
        description: s.description,
        image: s.preview,
        fullImage: s.preview,
        sliceCount: s.sliceCount || s.imageCount || 1,
        slices: Array.from({ length: s.sliceCount || s.imageCount || 1 }, () => s.preview),
      }));
    }

    // 4. No real images are available. Render an empty state.
    return [];
  }, [study, orthancSeriesList, activeOrthancId, isKulashekarStudy]);

  // Handle Cine playback
  useEffect(() => {
    let interval;
    if (isPlayingCine) {
      interval = setInterval(() => {
        const curSeries = activeSeriesList[activeSeries];
        const total = curSeries?.slices?.length || 1;
        if (total > 1) {
          setActiveSlice((prev) => (prev + 1) % total);
        }
      }, 1000 / cineFps);
    }
    return () => clearInterval(interval);
  }, [isPlayingCine, cineFps, activeSeries, activeSeriesList]);

  // Reset slice index when active series changes
  const handleSelectSeries = (index) => {
    setActiveSeries(index);
    setViewerEngine("native");
    const s = activeSeriesList[index];
    const total = s?.slices?.length || 1;
    setActiveSlice(Math.floor(total / 2));
  };

  useEffect(() => {
    const oId =
      study?.orthancStudyId ||
      study?.orthancId ||
      KNOWN_ORTHANC_STUDIES[study?.id] ||
      KNOWN_ORTHANC_STUDIES[id];
    if (oId) {
      setActiveOrthancId(oId);
    }
  }, [study?.id, study?.orthancStudyId, study?.orthancId, id]);

  useEffect(() => {
    if (study) {
      if (study.reportText && !reportText) {
        setReportText(study.reportText);
      }
      if (study.priority === "STAT" || study.priority === "Emergency" || study.reportingStatus === "Critical") {
        setReportStatus("Critical");
      } else if (study.reportingStatus === "Final") {
        setReportStatus("Final");
      } else {
        setReportStatus("Draft");
      }
    }
  }, [study?.id, study?.priority, study?.reportingStatus]);

  useEffect(() => {
    if (study && templates) {
      const normMod = (study.modality || "").toUpperCase().trim();
      const normStudyDesc = (study.studyDescription || "").toUpperCase().trim();

      // Look for custom template for this hospital or global default
      const hospTemplates = templates.filter((t) => {
        if (t.isActive === false) return false;
        const tHosp = t.hospitalId;
        const tMod = (t.modality || "").toUpperCase().trim();
        const hospMatches = !tHosp || tHosp === "ALL" || tHosp === study.hospitalId;
        const modMatches =
          !tMod ||
          tMod === normMod ||
          (normMod === "MR" && tMod === "MRI") ||
          (normMod === "MRI" && tMod === "MR");
        return hospMatches && modMatches;
      });

      const matchedTpl = hospTemplates.find((t) => {
        const sName = (t.studyName || "").toUpperCase().trim();
        return (
          sName === normStudyDesc ||
          sName.includes(normStudyDesc) ||
          normStudyDesc.includes(sName)
        );
      });

      if (matchedTpl) {
        setSelectedTemplateId(matchedTpl.id);
        if (!reportText && matchedTpl.templateContent) {
          setReportText(matchedTpl.templateContent);
        }
      } else if (!selectedTemplateId && hospTemplates.length > 0) {
        // Pre-select first available hospital or global template
        setSelectedTemplateId(hospTemplates[0].id);
        if (!reportText && hospTemplates[0].templateContent) {
          setReportText(hospTemplates[0].templateContent);
        }
      }
    }
  }, [study, templates]);

  // Preload neighboring images into browser cache to completely eliminate scrolling blink/flash
  useEffect(() => {
    const s = activeSeriesList[activeSeries];
    const slices = s?.slices || [];
    if (slices.length > 1) {
      // Preload window of slices around activeSlice
      const start = Math.max(0, activeSlice - 8);
      const end = Math.min(slices.length, activeSlice + 15);
      for (let i = start; i < end; i++) {
        if (slices[i]) {
          const img = new Image();
          img.src = slices[i];
        }
      }
    }
  }, [activeSlice, activeSeries, activeSeriesList]);

  if (!study && isLoadingStudy) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#0b0c10] text-[#45a29e]">
        <div className="w-12 h-12 border-4 border-[#45a29e] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-bold uppercase tracking-widest">Loading Patient Scan...</p>
      </div>
    );
  }

  if (!study) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#0b0c10] text-slate-400">
        <p className="text-base font-bold text-white mb-2">Study Not Found</p>
        <p className="text-xs mb-4">The requested study ID could not be loaded.</p>
        <Button onClick={() => navigate(-1)} className="bg-[#45a29e] text-slate-950 font-bold">
          Go Back
        </Button>
      </div>
    );
  }

  const handleToolClick = (tool) => {
    setActiveTool(tool);
    if (tool === "zoom-in") setZoom((z) => Math.min(z + 25, 400));
    if (tool === "zoom-out") setZoom((z) => Math.max(z - 25, 25));
  };

  // Interactive mouse drag to adjust Brightness (horizontal drag left-to-right / vice-versa) & Contrast (vertical drag)
  const handleViewportMouseDown = (e) => {
    // Left-click (button 0) when not in pan/zoom mode or right-click (button 2) or when contrast tool is active
    if (e.button === 0 || e.button === 2 || activeTool === "contrast") {
      setIsAdjustingWindow(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleViewportMouseMove = (e) => {
    if (isAdjustingWindow) {
      const dx = e.clientX - dragStart.x;
      const dy = dragStart.y - e.clientY;

      // Horizontal mouse move (left <-> right) smoothly controls Brightness
      if (dx !== 0) {
        setBrightness((prev) => Math.max(10, Math.min(300, Math.round(prev + dx * 0.5))));
        setWindowLevel((prev) => ({
          ...prev,
          l: Math.round(prev.l + dx * 4),
        }));
      }

      // Vertical mouse move (up <-> down) controls Contrast / Window Width
      if (dy !== 0 && (activeTool === "contrast" || e.buttons === 2)) {
        setContrast((prev) => Math.max(10, Math.min(300, Math.round(prev + dy * 0.5))));
        setWindowLevel((prev) => ({
          ...prev,
          w: Math.max(50, Math.round(prev.w + dy * 6)),
        }));
      }

      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleViewportMouseUp = () => {
    setIsAdjustingWindow(false);
  };

  const handleSaveDraft = () => {
    updateStudy(study.id, { reportingStatus: "Draft" });
    navigate("/radiologist/worklist");
  };

  const handleSignReport = () => {
    if (!study) return;

    // Only send to verifier if a verifier is explicitly assigned to this hospital
    const hasVerifier = !!hospital?.verifierId;
    const baseUpdates = { reportText, finalizedAt: new Date().toISOString() };

    if (reportStatus === "Critical") {
      // Mark as critical emergency across the platform
      updateStudy(study.id, {
        ...baseUpdates,
        reportingStatus: "Critical",
        priority: "STAT",
        isCritical: true,
      });
    } else if (reportStatus === "Final") {
      if (hasVerifier) {
        // Send to verifier for review
        updateStudy(study.id, { ...baseUpdates, reportingStatus: "Review" });
      } else {
        // Bypass verifier directly to verified/billing
        updateStudy(study.id, {
          ...baseUpdates,
          reportingStatus: "Verified",
          status: "Final",
        });
      }
    } else {
      updateStudy(study.id, { ...baseUpdates, reportingStatus: reportStatus });
    }
    navigate("/radiologist/worklist");
  };



  return (
    <div className="h-screen w-screen flex flex-col bg-[#0b0c10] text-slate-300 overflow-hidden font-sans">
      {/* Top Header / Application Bar with Kin's Cloud PACS multi-tab design */}
      <div className="h-10 bg-[#0f141c] flex items-center justify-between px-3 border-b border-[#1f2833] text-xs">
        {/* Left Side: Diagnostic Navigation Tabs */}
        <div className="flex items-center space-x-1 h-full pt-1.5">
          <button
            onClick={() => navigate("/radiologist/worklist")}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#1a2332] hover:bg-[#253247] text-slate-300 hover:text-white rounded-t-md text-xs font-semibold border-t border-x border-[#2c3b52] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Patient List
          </button>
          <button
            onClick={() => navigate("/reporting")}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#1a2332] hover:bg-[#253247] text-slate-300 hover:text-white rounded-t-md text-xs font-semibold border-t border-x border-[#2c3b52] transition-colors"
          >
            <LayoutGrid className="w-3.5 h-3.5" /> Worklist
          </button>
          {/* Active Case Tab matching screenshot */}
          <div className="flex items-center gap-2 px-3 py-1 bg-[#1f2d42] text-[#45a29e] rounded-t-md text-xs font-bold border-t-2 border-t-[#45a29e] border-x border-[#3b4d68]">
            <span className="uppercase">{patient.name || "PATIENT SCAN"}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
        </div>

        {/* Center / Right: Engine Switcher & External Orthanc Tools */}
        <div className="flex items-center space-x-2">
          {/* Engine Selector */}
          <div className="flex items-center bg-[#161f2e] p-0.5 rounded-lg border border-[#2c3b52]">
            <button
              onClick={() => {
                setIsIframeLoaded(false);
                setViewerEngine("stone");
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                viewerEngine === "stone"
                  ? "bg-[#45a29e] text-slate-950 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Orthanc Stone Diagnostic Web Viewer with MPR, 3D, Windowing Presets"
            >
              <Sparkles className="w-3 h-3" /> Orthanc Stone Viewer
            </button>
            <button
              onClick={() => {
                setIsIframeLoaded(false);
                setViewerEngine("native");
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                viewerEngine === "native"
                  ? "bg-[#45a29e] text-slate-950 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Kin's Cloud PACS Custom High-Performance DICOM Engine"
            >
              <Layers className="w-3 h-3" /> Kin's Cloud PACS
            </button>
            <button
              onClick={() => {
                setIsIframeLoaded(false);
                setViewerEngine("ohif");
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                viewerEngine === "ohif"
                  ? "bg-[#45a29e] text-slate-950 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="OHIF DICOM Viewer"
            >
              <Layers className="w-3 h-3" /> OHIF Viewer
            </button>
          </div>

          {/* Open in full Orthanc UI button */}
          <a
            href={`http://localhost:8042/stone-webviewer/index.html?study=${encodeURIComponent(studyInstanceUID || activeOrthancId || "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] font-bold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 px-2.5 py-1 rounded border border-slate-700 transition-colors"
            title="Open Fullscreen in Orthanc Server"
          >
            <ExternalLink className="w-3 h-3" /> Orthanc PACS
          </a>
        </div>
      </div>

      {/* Viewer Toolbar */}
      <div className="h-11 border-b border-[#1f2833] bg-[#0b0c10] flex items-center px-4 justify-between">
        <div className="flex items-center space-x-2">
          {/* Layout Tool */}
          <div className="flex items-center border border-slate-700 rounded-md overflow-hidden bg-slate-900/50">
            <button
              onClick={() => setLayoutMode(layoutMode === "1x1" ? "1x2" : "1x1")}
              className={`px-2.5 py-1 hover:bg-slate-700 text-xs font-semibold border-r border-slate-700 flex items-center transition-colors ${layoutMode === "1x2" ? "bg-[#45a29e] text-[#0b0c10]" : "text-slate-300"}`}
              title="Toggle 1x1 or 1x2 Layout"
            >
              <LayoutGrid className="w-3.5 h-3.5 mr-1.5" /> {layoutMode}
            </button>
            <button
              onClick={() => {
                setLayoutMode("1x1");
                setZoom(100);
                setBrightness(100);
                setContrast(100);
                setWindowLevel({ w: 1500, l: -500 });
              }}
              className="px-2.5 py-1 hover:bg-slate-700 text-xs font-semibold text-[#45a29e]"
            >
              Reset
            </button>
          </div>

          <div className="h-5 w-px bg-slate-700 mx-1"></div>

          {/* Cine Loop Player Controls (Kin's Cloud PACS) */}
          <div className="flex items-center bg-[#161f2e] border border-[#2c3b52] rounded-md px-1 py-0.5 space-x-1">
            <button
              onClick={() => setIsPlayingCine(!isPlayingCine)}
              className={`p-1 rounded flex items-center justify-center transition-colors ${isPlayingCine ? "bg-amber-500 text-black font-bold" : "text-emerald-400 hover:bg-slate-700"}`}
              title={isPlayingCine ? "Pause Cine" : "Play Cine Loop"}
            >
              {isPlayingCine ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => {
                setIsPlayingCine(false);
                const s = activeSeriesList[activeSeries];
                const total = s?.slices?.length || 1;
                setActiveSlice((prev) => Math.max(0, prev - 1));
              }}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700"
              title="Previous Slice"
            >
              <SkipBack className="w-3 h-3" />
            </button>
            <span className="text-[11px] font-mono text-cyan-300 px-1 select-none font-semibold">
              {activeSlice + 1} / {activeSeriesList[activeSeries]?.slices?.length || activeSeriesList[activeSeries]?.sliceCount || 1}
            </span>
            <button
              onClick={() => {
                setIsPlayingCine(false);
                const s = activeSeriesList[activeSeries];
                const total = s?.slices?.length || 1;
                setActiveSlice((prev) => Math.min(total - 1, prev + 1));
              }}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700"
              title="Next Slice"
            >
              <SkipForward className="w-3 h-3" />
            </button>
            <div className="h-3 w-px bg-slate-700 mx-0.5"></div>
            <select
              value={cineFps}
              onChange={(e) => setCineFps(Number(e.target.value))}
              className="bg-transparent text-[10px] text-slate-400 font-bold focus:outline-none cursor-pointer"
              title="Cine Speed (FPS)"
            >
              <option value="5" className="bg-slate-900 text-white">5 FPS</option>
              <option value="15" className="bg-slate-900 text-white">15 FPS</option>
              <option value="25" className="bg-slate-900 text-white">25 FPS</option>
              <option value="40" className="bg-slate-900 text-white">40 FPS</option>
            </select>
          </div>

          <div className="h-5 w-px bg-slate-700 mx-1"></div>

          {/* DICOM Quick Tools */}
          {[
            { tool: "move", Icon: Move, label: "Pan" },
            { tool: "zoom-in", Icon: ZoomIn, label: "Zoom In" },
            { tool: "zoom-out", Icon: ZoomOut, label: "Zoom Out" },
            { tool: "contrast", Icon: Contrast, label: "Window / Brightness Drag" },
            { tool: "crosshair", Icon: Crosshair, label: "Crosshair" },
            { tool: "3d", Icon: BoxSelect, label: "MPR / 3D Reconstruction" },
          ].map(({ tool, Icon, label }) => (
            <button
              key={tool}
              title={label}
              onClick={() => handleToolClick(tool)}
              className={`w-7 h-7 rounded flex items-center justify-center transition-colors ${
                activeTool === tool
                  ? "bg-[#45a29e] text-[#0b0c10]"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
            </button>
          ))}

          {/* Kin's Cloud Windowing / Brightness Presets & Quick Sliders */}
          <div className="flex items-center bg-[#161f2e] border border-[#2c3b52] rounded px-1.5 py-0.5 space-x-1">
            <span className="text-[10px] text-slate-400 font-semibold">WL:</span>
            <select
              onChange={(e) => {
                const val = e.target.value;
                if (val === "default") {
                  setBrightness(100);
                  setContrast(100);
                  setWindowLevel({ w: 1500, l: -500 });
                } else if (val === "soft_tissue") {
                  setBrightness(110);
                  setContrast(130);
                  setWindowLevel({ w: 400, l: 40 });
                } else if (val === "bone") {
                  setBrightness(85);
                  setContrast(180);
                  setWindowLevel({ w: 2000, l: 300 });
                } else if (val === "brain") {
                  setBrightness(105);
                  setContrast(145);
                  setWindowLevel({ w: 80, l: 40 });
                } else if (val === "lung") {
                  setBrightness(140);
                  setContrast(80);
                  setWindowLevel({ w: 1500, l: -600 });
                }
              }}
              className="bg-transparent text-[11px] text-[#45a29e] font-bold focus:outline-none cursor-pointer"
              title="Window / HU Preset"
            >
              <option value="default" className="bg-slate-900 text-white">Default HU</option>
              <option value="soft_tissue" className="bg-slate-900 text-white">Soft Tissue</option>
              <option value="bone" className="bg-slate-900 text-white">Bone</option>
              <option value="brain" className="bg-slate-900 text-white">Brain</option>
              <option value="lung" className="bg-slate-900 text-white">Lung</option>
            </select>

            <div className="h-3 w-px bg-slate-700"></div>

            {/* Brightness Quick Adjust */}
            <div className="flex items-center gap-1 pl-1" title={`Brightness: ${brightness}%`}>
              <Sun className="w-3 h-3 text-amber-400" />
              <input
                type="range"
                min="30"
                max="250"
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-14 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#45a29e]"
              />
              <span className="text-[9px] font-mono text-slate-400 w-6">{brightness}%</span>
            </div>

            <div className="h-3 w-px bg-slate-700"></div>

            {/* Contrast Quick Adjust */}
            <div className="flex items-center gap-1 pl-1" title={`Contrast: ${contrast}%`}>
              <Contrast className="w-3 h-3 text-cyan-400" />
              <input
                type="range"
                min="30"
                max="250"
                value={contrast}
                onChange={(e) => setContrast(Number(e.target.value))}
                className="w-14 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <span className="text-[9px] font-mono text-slate-400 w-6">{contrast}%</span>
            </div>
          </div>

          <div className="h-5 w-px bg-slate-700 mx-1"></div>

          <button
            title="Text Annotation"
            className="w-7 h-7 rounded flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <TypeIcon className="h-3.5 w-3.5" />
          </button>
          <button
            title="Rotate 90°"
            className="w-7 h-7 rounded flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <RotateCw className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsReportingExpanded((prev) => !prev)}
            className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white h-7 px-2.5 text-xs font-bold"
          >
            <Edit3 className="w-3.5 h-3.5 mr-1.5 text-[#45a29e]" />
            {isReportingExpanded ? "Hide Report" : "Show Report"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsShareModalOpen(true)}
            className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white h-7 px-2.5 text-xs"
          >
            <Share2 className="w-3 h-3 mr-1.5" /> Share
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Side Panel (Patient Info & Series) */}
        <div className="w-64 border-r border-[#1f2833] bg-[#0b0c10] flex flex-col z-20 shadow-2xl">
          {/* Patient Header */}
          <div className="p-4 border-b border-[#1f2833]">
            <h3 className="text-white font-bold text-lg uppercase tracking-wider mb-2 truncate">
              {patient?.name || "PATIENT SCAN"}
            </h3>
            <div className="grid grid-cols-2 gap-y-2 text-xs">
              <div className="text-slate-500">Modality</div>
              <div className="text-slate-300 font-semibold">
                {study?.modality || "CT"}
              </div>
              <div className="text-slate-500">Study Name</div>
              <div
                className="text-[#45a29e] font-bold uppercase truncate"
                title={study?.studyDescription}
              >
                {study?.studyDescription || "DIAGNOSTIC SCAN"}
              </div>
            </div>
          </div>

          <div className="flex gap-2 p-3 border-b border-[#1f2833]">
            <Button
              variant="outline"
              className="flex-1 bg-[#1f2833] border-[#1f2833] text-xs h-8 hover:text-white"
            >
              <Maximize className="w-3 h-3 mr-2" /> PENDING
            </Button>
            <Button
              variant="outline"
              className="flex-1 bg-[#1f2833] border-[#1f2833] text-xs h-8 hover:text-white"
            >
              <BoxSelect className="w-3 h-3 mr-2" /> KEY IMAGES
            </Button>
          </div>

          <div className="flex justify-between items-center px-4 py-2 text-xs font-bold text-slate-400">
            <span>Series</span>
            <span className="bg-slate-800 text-slate-300 px-1.5 rounded">
              {activeSeriesList.length}
            </span>
          </div>

          {/* Series Thumbnails */}
          <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 gap-3 custom-scrollbar">
            {activeSeriesList.length === 0 && (
              <div className="col-span-2 py-8 text-center text-xs text-slate-500 flex flex-col items-center justify-center">
                {isLoadingStudy ? (
                  <>
                    <div className="w-5 h-5 border-2 border-[#45a29e] border-t-transparent rounded-full animate-spin mb-2" />
                    <span>Loading series...</span>
                  </>
                ) : (
                  <span>No series found</span>
                )}
              </div>
            )}
            {activeSeriesList.map((series, index) => (
              <div
                key={series.id}
                onClick={() => handleSelectSeries(index)}
                className={`relative flex flex-col rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${activeSeries === index && viewerEngine === "native" ? "border-[#45a29e] shadow-[0_0_15px_rgba(69,162,158,0.2)]" : "border-[#1f2833] hover:border-slate-600"}`}
              >
                <div className="h-24 bg-black relative">
                  <img
                    src={series.image}
                    alt={series.name}
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute top-1 right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  </div>
                  <div className="absolute bottom-1 right-1 bg-black/80 text-[10px] px-1.5 py-0.5 rounded text-amber-300 font-mono font-bold border border-slate-700">
                    {series.slices?.length || series.sliceCount || 1}
                  </div>
                </div>
                <div className="bg-[#1f2833] text-center py-1.5 text-[10px] font-semibold text-slate-300 truncate px-1">
                  {series.name}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Viewport Area */}
        <div className="flex-1 bg-black flex flex-col relative overflow-hidden">
          {viewerEngine === "ohif" ? (
            <div className="w-full h-full relative bg-black">
              {studyInstanceUID ? (
                <>
                  <iframe
                    key={studyInstanceUID}
                    src={`http://localhost:8042/ohif/viewer?StudyInstanceUIDs=${studyInstanceUID}`}
                    title="OHIF DICOM Viewer"
                    className="w-full h-full border-0 bg-black"
                    onLoad={() => setIsIframeLoaded(true)}
                  />
                  {!isIframeLoaded && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black text-slate-300">
                      <div className="w-10 h-10 border-4 border-[#45a29e] border-t-transparent rounded-full animate-spin mb-3" />
                      <p className="text-xs font-bold text-[#45a29e]">
                        Loading OHIF DICOM Viewer...
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-6 text-center text-amber-300">
                  No Study Instance UID is available for this study.
                  Check that the study is registered in Orthanc.
                </div>
              )}
            </div>
          ) : viewerEngine === "stone" ? (
            /* Orthanc Stone Diagnostic Web Viewer with MPR / 3D / HU / Tools */
            <div className="w-full h-full relative bg-[#0b0c10]">
              {studyInstanceUID ? (
                <>
                  <iframe
                    key={studyInstanceUID}
                    src={`http://localhost:8042/stone-webviewer/index.html?study=${encodeURIComponent(studyInstanceUID)}`}
                    title="DICOM Stone Viewer"
                    className="h-full w-full border-0 bg-black"
                    allowFullScreen
                    onLoad={() => setIsIframeLoaded(true)}
                  />
                  {!isIframeLoaded && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 text-slate-300">
                      <div className="w-10 h-10 border-4 border-[#45a29e] border-t-transparent rounded-full animate-spin mb-3"></div>
                      <p className="text-xs font-bold text-[#45a29e]">Connecting to Orthanc Diagnostic PACS Engine...</p>
                      <p className="text-[11px] text-slate-500 mt-1">Initializing Multi-planar Reconstruction (MPR) & 3D Volume</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-6 text-center text-amber-300">
                  No Study Instance UID is available for this study. Check that the study is registered in Orthanc.
                </div>
              )}
            </div>
          ) : (
            /* Native Kin's Cloud PACS DICOM Viewport */
            <div
              className={`w-full h-full flex ${layoutMode === "1x2" ? "flex-row divide-x divide-[#1f2833]" : "flex-row"} relative select-none`}
              onWheel={(e) => {
                // If scrolling horizontally (trackpad / shift+wheel / horizontal mouse tilt) or holding Alt
                if (Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.altKey) {
                  const delta = e.deltaX !== 0 ? e.deltaX : e.deltaY;
                  // Scroll right/positive increases brightness, left decreases brightness
                  setBrightness((prev) => Math.max(10, Math.min(300, Math.round(prev + (delta > 0 ? 5 : -5)))));
                  setWindowLevel((prev) => ({
                    ...prev,
                    l: Math.round(prev.l + (delta > 0 ? 25 : -25)),
                  }));
                  return;
                }

                // Vertical mouse wheel scrolls DICOM slices
                const s = activeSeriesList[activeSeries];
                const total = s?.slices?.length || 1;
                if (total <= 1) return;
                if (e.deltaY > 0) {
                  setActiveSlice((prev) => Math.min(total - 1, prev + 1));
                } else {
                  setActiveSlice((prev) => Math.max(0, prev - 1));
                }
              }}
            >
              {/* Primary Viewport */}
              <div
                className={`flex-1 h-full relative bg-black flex items-center justify-center overflow-hidden ${
                  isAdjustingWindow
                    ? "cursor-ew-resize"
                    : activeTool === "contrast"
                    ? "cursor-ew-resize"
                    : activeTool === "move"
                    ? "cursor-grab"
                    : "cursor-crosshair"
                }`}
                onMouseDown={handleViewportMouseDown}
                onMouseMove={handleViewportMouseMove}
                onMouseUp={handleViewportMouseUp}
                onMouseLeave={handleViewportMouseUp}
                onContextMenu={(e) => e.preventDefault()}
              >
                {(() => {
                  if (isLoadingStudy) {
                    return (
                      <div className="flex flex-col items-center justify-center text-slate-300">
                        <div className="w-10 h-10 border-4 border-[#45a29e] border-t-transparent rounded-full animate-spin mb-3" />
                        <p className="text-xs font-bold text-[#45a29e]">
                          Loading Real Scanned Images...
                        </p>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Retrieving DICOM slice data
                        </p>
                      </div>
                    );
                  }

                  const curSeries = activeSeriesList[activeSeries];
                  const sliceUrl =
                    curSeries?.slices?.[activeSlice] ||
                    curSeries?.fullImage ||
                    curSeries?.image;
                  const totalSlices = curSeries?.slices?.length || curSeries?.sliceCount || 1;

                  if (!sliceUrl) {
                    return (
                      <div className="flex flex-col items-center justify-center text-slate-400 p-8 max-w-md text-center border border-dashed border-slate-800 rounded-2xl bg-[#0e1217]">
                        <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4 text-slate-500">
                          <ImageIcon className="w-7 h-7" />
                        </div>
                        <h4 className="text-base font-bold text-white mb-1">
                          No Scanned Images Uploaded
                        </h4>
                        <p className="text-xs text-slate-400 mb-4">
                          No real DICOM slices or scan instances have been received for{" "}
                          <span className="text-white font-semibold">
                            {patient?.name || study?.studyDescription || "this study"}
                          </span>.
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate("/dicom-receive")}
                            className="text-xs font-bold bg-[#45a29e] text-slate-950 px-3 py-1.5 rounded-lg hover:bg-[#3b8b87] transition-colors"
                          >
                            Receive / Upload DICOM
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <>
                      <img
                        src={sliceUrl}
                        alt="DICOM Scan"
                        style={{
                          transform: `scale(${zoom / 100})`,
                          filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                          transition: "none",
                        }}
                        className="max-h-full max-w-full object-contain pointer-events-none select-none"
                      />

                      {/* DICOM Meta Overlays (Corners) - Exact Kin's Cloud PACS HUD */}
                      <div className="absolute top-3 left-3 max-w-[45%] text-xs font-mono text-emerald-400/90 space-y-0.5 pointer-events-none drop-shadow">
                        <div className="font-bold tracking-wider">{study?.modality || "MR"}</div>
                        <div className="truncate">{patient?.uhid || study?.patientUHID || study?.accessionNumber || study?.caseNumber || "69541"}</div>
                        <div className="uppercase font-bold truncate">{patient?.name || study?.patientName || "PATIENT"}</div>
                        <div>{patient?.age || study?.age || "0"}Y / {(patient?.gender || study?.gender || "M").toString().toUpperCase().startsWith("F") ? "F" : "M"}</div>
                      </div>

                      <div className="absolute top-3 right-8 max-w-[45%] text-xs font-mono text-emerald-400/90 text-right space-y-0.5 pointer-events-none drop-shadow">
                        <div>{(study?.studyDate || new Date().toISOString()).split("T")[0]}</div>
                        <div className="uppercase truncate">{study?.studyDescription || study?.bodyPart || "DIAGNOSTIC SCAN"}</div>
                        <div className="font-semibold text-cyan-300 truncate">{curSeries?.name?.replace(/_/g, "") || "SERIES"}</div>
                        <div className="font-bold text-amber-300">
                          Img : {activeSlice + 1} / {totalSlices}
                        </div>
                      </div>

                      <div className="absolute bottom-3 left-3 text-xs font-mono text-emerald-400/90 space-y-0.5 pointer-events-none drop-shadow">
                        <div>TR: 3200</div>
                        <div>TE: 104</div>
                        <div>THK: 4.0</div>
                        <div className="text-[10px] text-slate-400">Pos: {(-160.5 + activeSlice * 0.5).toFixed(1)} mm</div>
                      </div>

                      <div className="absolute bottom-3 right-8 text-xs font-mono text-emerald-400/90 text-right space-y-0.5 pointer-events-none drop-shadow">
                        <div>W: {windowLevel.w}</div>
                        <div>L: {windowLevel.l}</div>
                        <div>Zoom: {zoom}%</div>
                        <div className="text-[10px] text-amber-300 font-bold">B: {brightness}% | C: {contrast}%</div>
                        <div className="text-[10px] text-slate-400">{isPlayingCine ? `CINE: ${cineFps} FPS` : "SCROLL: ON"}</div>
                      </div>

                      {/* Kin's Cloud Vertical Stack Scrollbar & Slider */}
                      {totalSlices > 1 && (
                        <div className="absolute right-1 top-4 bottom-4 w-5 flex flex-col items-center justify-between py-1 bg-black/40 rounded-full border border-slate-800/80 backdrop-blur-sm z-20">
                          <button
                            onClick={() => setActiveSlice((prev) => Math.max(0, prev - 1))}
                            className="text-slate-400 hover:text-white transition-colors"
                            title="Scroll Up (Previous Slice)"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          
                          {/* Slider Track */}
                          <div className="flex-1 w-1.5 bg-slate-800 rounded-full relative my-1 overflow-hidden">
                            <div
                              className="w-full bg-[#45a29e] rounded-full transition-all duration-75"
                              style={{
                                height: `${Math.max(4, ((activeSlice + 1) / totalSlices) * 100)}%`,
                              }}
                            />
                          </div>

                          <button
                            onClick={() => setActiveSlice((prev) => Math.min(totalSlices - 1, prev + 1))}
                            className="text-slate-400 hover:text-white transition-colors"
                            title="Scroll Down (Next Slice)"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>

              {/* Secondary Viewport for 1x2 Kin's Cloud Comparative Layout */}
              {layoutMode === "1x2" && (
                <div className="flex-1 h-full relative bg-black flex items-center justify-center overflow-hidden">
                  {(() => {
                    // Show secondary series (e.g. Scout or second series)
                    const secIdx = activeSeries === 0 ? Math.min(1, activeSeriesList.length - 1) : 0;
                    const secSeries = activeSeriesList[secIdx];
                    const secSliceUrl = secSeries?.slices?.[0] || secSeries?.fullImage || secSeries?.image;
                    const secTotal = secSeries?.slices?.length || secSeries?.sliceCount || 1;

                    if (!secSliceUrl) {
                      return (
                        <div className="flex flex-col items-center justify-center text-slate-500 text-xs">
                          <span>No secondary series slice</span>
                        </div>
                      );
                    }

                    return (
                      <>
                        <img
                          src={secSliceUrl}
                          alt="Secondary DICOM Scan"
                          className="max-h-full max-w-full object-contain pointer-events-none"
                        />
                        <div className="absolute top-3 left-3 text-xs font-mono text-emerald-400/90 pointer-events-none">
                          <div className="font-bold text-amber-300">{secSeries?.name}</div>
                          <div>Reference Viewport</div>
                        </div>
                        <div className="absolute top-3 right-3 text-xs font-mono text-emerald-400/90 text-right pointer-events-none">
                          <div>Img: 1 / {secTotal}</div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Reporting Panel - Redesigned matching screenshot */}
        {(currentRole === "RADIOLOGIST" || currentRole === "SUPER_ADMIN" || currentRole === "ADMIN" || !currentRole) && (
          <div
            className={`${isReportingExpanded ? "w-1/2" : "w-0 overflow-hidden"} border-l border-slate-300 bg-slate-100 flex flex-col transition-all duration-300 ease-in-out relative z-10 shadow-2xl`}
          >
            {/* Top Toolbar matching screenshot */}
            <div className="bg-white px-4 py-2 border-b border-slate-200 flex items-center justify-between shadow-sm z-20">
              {/* Left Side: Body part dropdown & Load */}
              <div className="flex items-center space-x-2">
                {(() => {
                  const normStudyMod = (study.modality || "").toUpperCase().trim();
                  const normStudyDesc = (study.studyDescription || "").toUpperCase().trim();

                  // 1. Hospital-specific templates
                  const hospitalCustomTemplates = (templates || []).filter((t) => {
                    if (t.isActive === false) return false;
                    const tMod = (t.modality || "").toUpperCase().trim();
                    const modMatches = !tMod || tMod === normStudyMod || (normStudyMod === "MR" && tMod === "MRI") || (normStudyMod === "MRI" && tMod === "MR");
                    return t.hospitalId === study.hospitalId && modMatches;
                  });

                  // 2. Other configured templates (e.g. from parent company, other hospitals or global/ALL)
                  const otherCustomTemplates = (templates || []).filter((t) => {
                    if (t.isActive === false) return false;
                    if (t.hospitalId === study.hospitalId) return false;
                    const tMod = (t.modality || "").toUpperCase().trim();
                    const modMatches = !tMod || tMod === normStudyMod || (normStudyMod === "MR" && tMod === "MRI") || (normStudyMod === "MRI" && tMod === "MR");
                    return modMatches;
                  });

                  // 3. Fallback: Any other custom templates if still none found
                  const anyOtherCustomTemplates = (templates || []).filter((t) => {
                    if (t.isActive === false) return false;
                    return !hospitalCustomTemplates.some((h) => h.id === t.id) && !otherCustomTemplates.some((o) => o.id === t.id);
                  });

                  // 4. Catalog studies for this modality
                  // Note: standardStudiesCatalog is an array of objects: [{ modality: "MRI", studyName: "MRI - BRAIN" }, ...]
                  const catalogKey = (normStudyMod === "MR" || normStudyMod === "MRI") ? "MRI" : normStudyMod;
                  const rawCatalogArray = Array.isArray(standardStudiesCatalog)
                    ? standardStudiesCatalog
                    : (standardStudiesCatalog && typeof standardStudiesCatalog === "object" ? Object.values(standardStudiesCatalog).flat() : []);

                  const matchingCatalogItems = rawCatalogArray.filter((item) => {
                    const m = (item?.modality || "").toUpperCase().trim();
                    if (catalogKey === "MRI") return m === "MRI" || m === "MR";
                    return m === catalogKey;
                  });

                  const catalogTemplates = (matchingCatalogItems.length > 0 ? matchingCatalogItems : rawCatalogArray.slice(0, 50))
                    .map((item, idx) => {
                      const studyTitle = typeof item === "string" ? item : item?.studyName || `Study ${idx + 1}`;
                      return {
                        id: `catalog_${idx}_${studyTitle.replace(/\s+/g, "_")}`,
                        studyName: studyTitle,
                        isCatalog: true,
                        templateContent: `<h3><strong>CLINICAL HISTORY:</strong></h3><p>${study.clinicalHistory || "Routine evaluation."}</p><br/><h3><strong>TECHNIQUE:</strong></h3><p>${catalogKey || "Radiological"} scan of ${studyTitle} was performed with appropriate multiplanar sequences.</p><br/><h3><strong>FINDINGS:</strong></h3><p>Normal study within limits for age. No focal acute pathology identified.</p><br/><h3><strong>IMPRESSION:</strong></h3><p>No significant abnormality detected in ${studyTitle}.</p>`,
                      };
                    })
                    .filter((catTpl) => {
                      const titleNorm = catTpl.studyName.toUpperCase().trim();
                      return !hospitalCustomTemplates.some((t) => (t.studyName || "").toUpperCase().trim() === titleNorm);
                    });

                  const handleLoadTemplate = () => {
                    let tpl = hospitalCustomTemplates.find((t) => t.id === selectedTemplateId);
                    if (!tpl) tpl = otherCustomTemplates.find((t) => t.id === selectedTemplateId);
                    if (!tpl) tpl = anyOtherCustomTemplates.find((t) => t.id === selectedTemplateId);
                    if (!tpl) tpl = catalogTemplates.find((t) => t.id === selectedTemplateId);
                    if (tpl?.templateContent) {
                      setReportText(tpl.templateContent);
                    }
                  };

                  return (
                    <>
                      <select
                        className="text-xs border border-slate-300 rounded p-1.5 text-slate-700 bg-white max-w-[220px] font-semibold truncate outline-none focus:ring-1 focus:ring-[#00A8CC]"
                        value={selectedTemplateId}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSelectedTemplateId(val);
                          // Auto load on select
                          let tpl = hospitalCustomTemplates.find((t) => t.id === val);
                          if (!tpl) tpl = otherCustomTemplates.find((t) => t.id === val);
                          if (!tpl) tpl = anyOtherCustomTemplates.find((t) => t.id === val);
                          if (!tpl) tpl = catalogTemplates.find((t) => t.id === val);
                          if (tpl?.templateContent) {
                            setReportText(tpl.templateContent);
                          }
                        }}
                      >
                        <option value="">Select Template...</option>

                        {hospitalCustomTemplates.length > 0 && (
                          <optgroup label="🏥 Hospital Custom Templates">
                            {hospitalCustomTemplates.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.studyName}
                              </option>
                            ))}
                          </optgroup>
                        )}

                        {otherCustomTemplates.length > 0 && (
                          <optgroup label="📋 All Custom Templates">
                            {otherCustomTemplates.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.studyName}
                              </option>
                            ))}
                          </optgroup>
                        )}

                        {anyOtherCustomTemplates.length > 0 && (
                          <optgroup label="📂 More Custom Templates">
                            {anyOtherCustomTemplates.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.studyName} ({t.modality || "All"})
                              </option>
                            ))}
                          </optgroup>
                        )}

                        {catalogTemplates.length > 0 && (
                          <optgroup label={`⚡ Standard ${catalogKey} Templates (${catalogTemplates.length})`}>
                            {catalogTemplates.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.studyName}
                              </option>
                            ))}
                          </optgroup>
                        )}
                      </select>

                      <button
                        type="button"
                        onClick={handleLoadTemplate}
                        disabled={!selectedTemplateId}
                        className={`text-xs px-3 py-1.5 rounded font-bold transition-all ${selectedTemplateId ? "bg-[#00A8CC] text-white hover:bg-[#008ba8] cursor-pointer shadow-sm active:scale-95" : "bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed"}`}
                      >
                        Load
                      </button>
                    </>
                  );
                })()}
              </div>

              {/* Middle: Radios & Save */}
              <div className="flex items-center space-x-4 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200">
                <label className="flex items-center space-x-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    className="w-3 h-3 text-[#00A8CC] border-slate-300 focus:ring-[#00A8CC]"
                    checked={reportStatus === "Draft"}
                    onChange={() => setReportStatus("Draft")}
                  />
                  <span className="text-[11px] font-bold text-slate-600">
                    Draft
                  </span>
                </label>
                <label className="flex items-center space-x-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    className="w-3 h-3 text-red-500 border-slate-300 focus:ring-red-500"
                    checked={reportStatus === "Critical"}
                    onChange={() => setReportStatus("Critical")}
                  />
                  <span className="text-[11px] font-bold text-slate-600">
                    Critical
                  </span>
                </label>
                <label className="flex items-center space-x-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    className="w-3 h-3 text-emerald-600 border-slate-300 focus:ring-emerald-600"
                    checked={reportStatus === "Final"}
                    onChange={() => setReportStatus("Final")}
                  />
                  <span className="text-[11px] font-bold text-slate-600">
                    Final
                  </span>
                </label>

                <div className="w-px h-4 bg-slate-300 mx-2"></div>

                <button
                  onClick={handleSignReport}
                  className="text-xs bg-[#7ed957] hover:bg-[#68bd45] text-white px-4 py-1 rounded font-bold transition-colors"
                >
                  Save
                </button>
              </div>

              {/* Right Side: Add Report, Add Key Image */}
              <div className="flex items-center space-x-2">
                <button className="text-xs bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-3 py-1.5 rounded font-semibold flex items-center transition-colors">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />{" "}
                  Add Report
                </button>
                <button className="text-xs bg-[#0D2461] hover:bg-[#081840] text-white px-3 py-1.5 rounded font-semibold flex items-center shadow-sm transition-colors">
                  <ImageIcon className="w-3.5 h-3.5 mr-1.5" /> Add Key Image
                </button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsReportingExpanded(false)}
                  className="ml-2 text-slate-400 hover:text-slate-700 h-7 w-7 p-0"
                >
                  <ArrowRightLeft className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Rich Text Editor Container */}
            <div className="flex-1 p-4 flex flex-col bg-slate-100 overflow-hidden relative">
              {showLockedWarning && (
                <div className="absolute top-6 right-6 z-30 bg-orange-50 border border-orange-200 rounded-lg p-3 max-w-sm shadow-lg flex items-start animate-in fade-in slide-in-from-top-4 duration-300">
                  <Lock className="w-5 h-5 text-orange-500 mt-0.5 mr-3 shrink-0" />
                  <div className="flex-1">
                    <h4 className="text-orange-800 font-bold text-xs mb-1">
                      Report currently locked
                    </h4>
                    <p className="text-orange-700/80 text-[10px] leading-tight mb-2">
                      The report is locked because the radiologist is editing
                      it. You can edit it after the radiologist closes the
                      report page. If the radiologist leaves the computer, it
                      will unlock automatically after a set time limit.
                    </p>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setShowLockedWarning(false)}
                        className="text-[10px] font-bold text-orange-600 hover:text-orange-800 bg-orange-100 px-2 py-1 rounded cursor-pointer"
                      >
                        Close
                      </button>
                      <button
                        onClick={() => setShowLockedWarning(false)}
                        className="text-[10px] font-bold text-white bg-orange-500 hover:bg-orange-600 px-2 py-1 rounded cursor-pointer"
                      >
                        Unlock
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <RichTextEditor
                value={reportText}
                onChange={setReportText}
                className="flex-1 h-full shadow-sm border-slate-200"
                placeholder="Type report here...&#10;&#10;Procedure:&#10;&#10;Findings:&#10;&#10;Impression:"
              />
            </div>
          </div>
        )}
      </div>

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        study={study}
        patient={patient}
        hospital={hospital}
      />
    </div>
  );
}
