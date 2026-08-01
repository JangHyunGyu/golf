/**
 * Dance Analysis Logic
 * Handles file upload, API communication, and UI updates.
 * Depends on a global `ANALYSIS_CONFIG` object for localization.
 */

/**
 * Language Redirection Logic
 */
const detectBrowserLanguage = () => {
  const candidate = Array.isArray(navigator.languages) && navigator.languages.length
    ? navigator.languages[0]
    : navigator.language || navigator.userLanguage || "";

  if (!candidate) return null;

  const lowered = candidate.toLowerCase();
  if (lowered.startsWith("ko")) return "ko";
  if (lowered.startsWith("ja")) return "ja";
  return "en";
};

(function() {
    const docLang = (document.documentElement.lang || "en").toLowerCase();
    const browserLang = detectBrowserLanguage();

    // 검색 봇 감지 (SEO 문제 방지)
    if (/bot|crawl|spider|slurp|facebookexternalhit|mediapartners/i.test(navigator.userAgent)) return;
    const isBot = /bot|crawl|spider|slurp|facebookexternalhit|mediapartners/i.test(navigator.userAgent);
    
    // 내부 이동 감지 (사이트 내에서 링크 클릭으로 이동한 경우 리다이렉트 방지)
    const referrer = document.referrer;
    const isInternal = referrer && referrer.indexOf(window.location.hostname) !== -1;

    // 봇이 아니고, 내부 이동이 아닐 때만(외부 유입/첫 진입) 브라우저 언어에 따라 리다이렉션합니다.
    if (browserLang && !isBot && !isInternal) {
        const currentPath = window.location.pathname;
        const currentFile = currentPath.substring(currentPath.lastIndexOf('/') + 1) || "";

        // 현재 파일명에서 기본 이름 추출 (예: analysis-en -> analysis)
        let baseName = currentFile.replace(/-en(\.html)?$|-jp(\.html)?$|(\.html)$/, "");
        if (!baseName || baseName === "index") baseName = "index";

        let targetFile = null;

        // 브라우저 언어와 현재 페이지 언어가 다를 경우 타겟 파일 설정
        if (browserLang === "ko" && !docLang.startsWith("ko")) {
            targetFile = baseName === "index" ? "/" : baseName;
        } else if (browserLang === "ja" && !docLang.startsWith("ja")) {
            targetFile = baseName + "-jp";
        } else if (browserLang === "en" && !docLang.startsWith("en")) {
            targetFile = baseName + "-en";
        }

        // 타겟 파일이 존재하고 현재 파일과 다를 경우 이동
        if (targetFile && targetFile !== currentFile) {
            window.location.replace(targetFile);
        }
    }
})();

const ANALYSIS_LANGUAGE = (() => {
    const language = (document.documentElement.lang || "en").toLowerCase().split("-")[0];
    return ["ko", "en", "ja"].includes(language) ? language : "en";
})();

const ANALYSIS_CLIENT_MESSAGES = ({
    ko: {
        rejection: "업로드한 영상에서 골프 스윙을 확인할 수 없어 분석을 진행할 수 없습니다. 골프 스윙 영상으로 다시 시도해 주세요.",
        initFailed: "영상 업로드 준비에 실패했습니다.",
        uploadPartFailed: "영상 {part}번째 조각 업로드에 실패했습니다.",
        uploadNetwork: "영상 {part}번째 조각을 업로드하는 중 네트워크 오류가 발생했습니다.",
        uploadTimeout: "영상 {part}번째 조각 업로드 시간이 초과되었습니다.",
        uploadCompletionFailed: "영상 업로드 완료 처리에 실패했습니다.",
        statusCheckFailed: "영상 처리 상태를 확인하지 못했습니다.",
        processingFailed: "서버에서 영상을 처리하지 못했습니다.",
        processingTimeout: "영상 처리 대기 시간이 초과되었습니다.",
        analysisFailed: "영상 분석에 실패했습니다.",
        emptyResponse: "서버에서 빈 분석 결과를 반환했습니다.",
        invalidResponse: "서버 분석 결과 형식이 올바르지 않습니다.",
        resultNotFound: "공유된 분석 결과를 찾을 수 없습니다.",
    },
    en: {
        rejection: "We couldn't identify a golf swing in the uploaded video, so it can't be analyzed. Please try again with a golf swing video.",
        initFailed: "Failed to prepare the video upload.",
        uploadPartFailed: "Failed to upload video part {part}.",
        uploadNetwork: "A network error occurred while uploading video part {part}.",
        uploadTimeout: "The upload of video part {part} timed out.",
        uploadCompletionFailed: "Failed to complete the video upload.",
        statusCheckFailed: "Failed to check the video processing status.",
        processingFailed: "The server could not process the video.",
        processingTimeout: "Video processing timed out.",
        analysisFailed: "Video analysis failed.",
        emptyResponse: "The server returned an empty analysis result.",
        invalidResponse: "The server returned an invalid analysis result.",
        resultNotFound: "The shared analysis result was not found.",
    },
    ja: {
        rejection: "アップロードされた動画でゴルフスイングを確認できなかったため、分析できません。ゴルフスイングの動画でもう一度お試しください。",
        initFailed: "動画アップロードの準備に失敗しました。",
        uploadPartFailed: "動画のパート{part}のアップロードに失敗しました。",
        uploadNetwork: "動画のパート{part}のアップロード中にネットワークエラーが発生しました。",
        uploadTimeout: "動画のパート{part}のアップロードがタイムアウトしました。",
        uploadCompletionFailed: "動画アップロードの完了処理に失敗しました。",
        statusCheckFailed: "動画の処理状況を確認できませんでした。",
        processingFailed: "サーバーで動画を処理できませんでした。",
        processingTimeout: "動画処理がタイムアウトしました。",
        analysisFailed: "動画の分析に失敗しました。",
        emptyResponse: "サーバーから空の分析結果が返されました。",
        invalidResponse: "サーバーから無効な分析結果が返されました。",
        resultNotFound: "共有された分析結果が見つかりません。",
    },
})[ANALYSIS_LANGUAGE];

function analysisMessage(key, values = {}) {
    return Object.entries(values).reduce(
        (message, [name, value]) => message.replaceAll(`{${name}}`, String(value)),
        ANALYSIS_CLIENT_MESSAGES[key] || ANALYSIS_CLIENT_MESSAGES.analysisFailed
    );
}

function analysisApiUrl(baseUrl, action, params = {}) {
    const url = new URL(baseUrl);
    url.searchParams.set("action", action);
    url.searchParams.set("lang", ANALYSIS_LANGUAGE);
    Object.entries(params).forEach(([name, value]) => url.searchParams.set(name, String(value)));
    return url.toString();
}

function xhrApiError(xhr, fallbackKey, values = {}) {
    try {
        const payload = JSON.parse(xhr.responseText || "{}");
        if (typeof payload.error === "string" && payload.error.trim()) return payload.error;
    } catch (_) {
        // Use the localized client fallback below.
    }
    return `${analysisMessage(fallbackKey, values)} (${xhr.status || 0})`;
}

async function responseApiError(response, fallbackKey) {
    const text = await response.text();
    try {
        const payload = JSON.parse(text);
        if (typeof payload.error === "string" && payload.error.trim()) return payload.error;
    } catch (_) {
        // Use the localized client fallback below.
    }
    return `${analysisMessage(fallbackKey)} (${response.status})`;
}

// Kakao SDK Init
try {
    Kakao.init('41684f8ded61c7e396e37031d51bbc3c'); 
} catch (e) {
    console.warn("Kakao SDK init failed (Key not set)");
}

const videoInput = document.getElementById('videoInput');
const analyzeBtn = document.getElementById('analyzeBtn');
const fileNameDiv = document.getElementById('fileName');
const dropZone = document.getElementById('dropZone');

// Modal Elements
const resultModal = document.getElementById('resultModal');
const modalContainer = document.querySelector('.modal-container');
const modalBody = document.getElementById('modalBody');
const modalTitle = document.getElementById('modalTitle');
const modalFooter = document.getElementById('modalFooter');
const scrollTopBtn = document.getElementById('scrollTopBtn');
const modalCloseBtn = document.getElementById('modalCloseBtn');

// Guide Modal Elements
const guideBtn = document.getElementById('guideBtn');
const guideModal = document.getElementById('guideModal');
const guideCloseBtn = document.getElementById('guideCloseBtn');

let isAnalyzing = false;
let latestAnalysisResult = "";
let currentAnalysisId = null;

// --- JSON Analysis Renderer ---
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
}

function highlightText(text) {
    let escaped = escapeHtml(text);
    // Highlight timestamps [mm:ss] or [mm:ss~mm:ss] or [mm:ss - mm:ss]
    escaped = escaped.replace(/\[(\d{2}:\d{2}(?:\s*[~\-]\s*\d{2}:\d{2})?)\]/g, '<span class="timestamp">[$1]</span>');
    // Highlight scores
    const unit = ANALYSIS_CONFIG.messages.scoreUnit || '점';
    escaped = escaped.replace(new RegExp(`\\b([0-9]\\.[0-9]{1,2})\\b(?!${unit})`, 'g'), `<span class="score">$1${unit}</span>`);
    escaped = escaped.replace(new RegExp(`\\b([0-9]\\.[0-9]{1,2})${unit}`, 'g'), `<span class="score">$1${unit}</span>`);
    return escaped;
}

function renderJsonAnalysis(content) {
    let data;
    try {
        data = JSON.parse(content);
    } catch (e) {
        return null; // Not JSON, fallback to markdown
    }

    if (!data || typeof data !== 'object') return null;

    const msg = ANALYSIS_CONFIG.messages;
    const unit = msg.scoreUnit || '점';

    // Rejected
    if (data.rejected) {
        return `<p style="text-align:center; color:#ff9800; font-size:1.1rem; padding:2rem 1rem;">${escapeHtml(ANALYSIS_CLIENT_MESSAGES.rejection)}</p>`;
    }

    let html = '';

    // 1. Summary
    html += `<h3>1. ${escapeHtml(msg.sectionSummary || '총평')}</h3>`;
    html += `<ul>`;
    html += `<li><strong>${escapeHtml(msg.labelStrengths || '장점')}:</strong> ${highlightText(data.summary?.strengths || '')}</li>`;
    html += `<li><strong>${escapeHtml(msg.labelWeaknesses || '단점 및 개선점')}:</strong> ${highlightText(data.summary?.weaknesses || '')}</li>`;
    html += `</ul>`;

    // 2. Detail Scores
    html += `<h3>2. ${escapeHtml(msg.sectionDetail || '핵심 요소 정밀 분석')}</h3>`;
    if (data.detailScores && Array.isArray(data.detailScores)) {
        data.detailScores.forEach((item, i) => {
            html += `<div style="margin-bottom:1.2rem;">`;
            html += `<p style="margin:0 0 0.3rem 0;"><strong>${i + 1}. ${escapeHtml(item.name)}</strong>: <span class="score">${Number(item.score).toFixed(1)}${unit}</span></p>`;
            html += `<p style="margin:0 0 0 1rem; line-height:1.7;">${highlightText(item.comment || '')}</p>`;
            html += `</div>`;
        });
    }

    // 3. Overall Score & Grade
    html += `<h3>3. ${escapeHtml(msg.sectionOverall || '종합 평점 및 등급')}</h3>`;
    html += `<ul>`;
    html += `<li><strong>${escapeHtml(msg.labelScore || '종합 점수')}:</strong> <span class="score">${Number(data.overallScore || 0).toFixed(2)}${unit}</span></li>`;
    html += `<li><strong>${escapeHtml(msg.labelGrade || '등급')}:</strong> ${escapeHtml(data.grade || '')}</li>`;
    html += `</ul>`;

    // 4. One Point Lesson
    html += `<h3>4. ${escapeHtml(msg.sectionLesson || '원포인트 레슨')}</h3>`;
    html += `<ul><li>${highlightText(data.onePointLesson || '')}</li></ul>`;

    return html;
}

function renderMarkdownFallback(content) {
    let formattedContent;
    if (typeof marked !== 'undefined' && marked.parse) {
        formattedContent = marked.parse(content);
    } else {
        formattedContent = content.replace(/\n/g, '<br>');
    }
    const unit = ANALYSIS_CONFIG.messages.scoreUnit || '점';
    // Highlight timestamps
    formattedContent = formattedContent.replace(/\[(\d{2}:\d{2}(?:\s*[~-]\s*\d{2}:\d{2})?)\]/g, '<span class="timestamp">[$1]</span>');
    // Highlight scores
    formattedContent = formattedContent.replace(new RegExp(`\\b([0-9]\\.[0-9]{1,2})\\b(?!${unit})`, 'g'), `<span class="score">$1${unit}</span>`);
    formattedContent = formattedContent.replace(new RegExp(`\\b([0-9]\\.[0-9]{1,2})${unit}`, 'g'), `<span class="score">$1${unit}</span>`);
    return formattedContent;
}
// --- End JSON Analysis Renderer ---

// Cache for re-analysis
let lastUploadedFileMetadata = null;
let lastUploadedFileUri = null;
let lastUploadedServerFileName = null;

// Event Listeners
videoInput.addEventListener('change', handleFileSelect);

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#2e7d32';
});

dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = 'rgba(0, 0, 0, 0.1)';
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = 'rgba(0, 0, 0, 0.1)';
    if (e.dataTransfer.files.length > 0) {
        videoInput.files = e.dataTransfer.files;
        handleFileSelect();
    }
});

analyzeBtn.addEventListener('click', runAnalysis);

resultModal.addEventListener('click', (e) => {
    if (isAnalyzing) return;
    if (e.target === resultModal) {
        closeModal();
    }
});

// Guide Modal Events
guideBtn.addEventListener('click', () => {
    guideModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
});

guideCloseBtn.addEventListener('click', () => {
    guideModal.style.display = 'none';
    document.body.style.overflow = 'auto';
});

guideModal.addEventListener('click', (e) => {
    if (e.target === guideModal) {
        guideModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});

modalBody.addEventListener('scroll', () => {
    if (modalBody.scrollTop > 300) {
        scrollTopBtn.style.display = 'flex';
    } else {
        scrollTopBtn.style.display = 'none';
    }
});

scrollTopBtn.addEventListener('click', () => {
    modalBody.scrollTo({ top: 0, behavior: 'smooth' });
});

// Functions

function handleFileSelect() {
    const file = videoInput.files[0];
    if (file) {
        const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
        
        if (file.size > 100 * 1024 * 1024) { // R2 direct upload limit
            alert(ANALYSIS_CONFIG.messages.fileTooLarge.replace('{size}', sizeInMB));
            videoInput.value = "";
            fileNameDiv.textContent = "";
            analyzeBtn.disabled = true;
            return;
        }

        fileNameDiv.textContent = `${ANALYSIS_CONFIG.messages.fileSelected}: ${file.name} (${sizeInMB} MB)`;
        analyzeBtn.disabled = false;
    } else {
        fileNameDiv.textContent = '';
        analyzeBtn.disabled = true;
    }
}

async function uploadVideoInChunks(apiUrl, file, session, onProgress) {
    const chunkBytes = Number(session.chunkBytes) || 10 * 1024 * 1024;
    const partCount = Math.ceil(file.size / chunkBytes);
    const startedAt = Date.now();

    for (let partNumber = 1; partNumber <= partCount; partNumber++) {
        const start = (partNumber - 1) * chunkBytes;
        const chunk = file.slice(start, Math.min(start + chunkBytes, file.size));
        let uploaded = false;

        for (let attempt = 1; attempt <= 3 && !uploaded; attempt++) {
            try {
                await new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.open("POST", analysisApiUrl(apiUrl, "upload_part"));
                    xhr.setRequestHeader("Content-Type", session.mimeType || file.type || "video/mp4");
                    xhr.setRequestHeader("X-Upload-Token", session.uploadToken);
                    xhr.setRequestHeader("X-Part-Number", String(partNumber));
                    xhr.timeout = 120000;
                    xhr.upload.onprogress = (event) => {
                        if (!event.lengthComputable) return;
                        const loaded = start + event.loaded;
                        const elapsed = Math.max((Date.now() - startedAt) / 1000, 0.1);
                        onProgress({
                            percent: Math.min(100, Math.round(loaded / file.size * 100)),
                            speed: loaded / 1024 / 1024 / elapsed,
                            partNumber,
                            partCount,
                            attempt,
                        });
                    };
                    xhr.onload = () => {
                        if (xhr.status >= 200 && xhr.status < 300) resolve();
                        else reject(new Error(xhrApiError(xhr, "uploadPartFailed", { part: partNumber })));
                    };
                    xhr.onerror = () => reject(new Error(analysisMessage("uploadNetwork", { part: partNumber })));
                    xhr.ontimeout = () => reject(new Error(analysisMessage("uploadTimeout", { part: partNumber })));
                    xhr.send(chunk);
                });
                uploaded = true;
            } catch (error) {
                if (attempt === 3) throw error;
                await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
            }
        }
    }

    const completeRes = await fetch(analysisApiUrl(apiUrl, "complete_upload"), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Upload-Token": session.uploadToken,
        },
        body: "{}",
    });
    if (!completeRes.ok) {
        throw new Error(await responseApiError(completeRes, "uploadCompletionFailed"));
    }
    onProgress({ percent: 100, speed: file.size / 1024 / 1024 / Math.max((Date.now() - startedAt) / 1000, 0.1), partNumber: partCount, partCount, attempt: 1 });
    return completeRes.json();
}

async function runAnalysis() {
    const file = videoInput.files[0];
    if (!file) return;

    isAnalyzing = true;
    latestAnalysisResult = "";

    // UI State Change
    analyzeBtn.disabled = true;
    document.getElementById('danceGenre').disabled = true;
    document.querySelector('label[for="videoInput"]').style.pointerEvents = "none";
    document.querySelector('label[for="videoInput"]').style.opacity = "0.5";
    
    // Show Modal
    resultModal.style.display = 'flex';
    setModalStep('step-init');
    modalTitle.textContent = ANALYSIS_CONFIG.messages.processTitle;
    modalFooter.style.display = 'none';
    modalCloseBtn.style.display = 'none';
    document.body.style.overflow = 'hidden';

    try {
        const API_URL = "https://latindance-api.yama5993.workers.dev"; 

        let fileUri, fileName;
        const currentFileMetadata = `${file.name}_${file.size}_${file.lastModified}`;

        if (currentFileMetadata === lastUploadedFileMetadata && lastUploadedFileUri && lastUploadedServerFileName) {
            console.log("Skipping upload, reusing existing file.");
            fileUri = lastUploadedFileUri;
            fileName = lastUploadedServerFileName;
        } else {
            // 1. Init
            console.log("Step 1: Init");
            setModalStep('step-init');
            modalBody.innerHTML = `<p>${ANALYSIS_CONFIG.messages.stepInit}</p>`;
            const initRes = await fetch(analysisApiUrl(API_URL, "init"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    mimeType: file.type,
                    numBytes: file.size,
                    displayName: file.name
                })
            });
            
            if (!initRes.ok) {
                throw new Error(await responseApiError(initRes, "initFailed"));
            }
            const uploadSession = await initRes.json();

            // 2. Upload in 10 MB multipart chunks through the existing Worker R2 binding.
            console.log("Step 2: Multipart upload");
            setModalStep('step-upload');
            modalBody.innerHTML = `
                <div class="progress-status">${ANALYSIS_CONFIG.messages.stepUpload}</div>
                <div class="progress-text" id="progressPercent" style="font-size: 2.2rem;">0%</div>
                <div class="progress-container">
                    <div class="progress-bar" id="progressBar"></div>
                </div>
                <p style="font-size: 0.85rem; color: rgba(255,255,255,0.5); text-align:center; margin-top: 20px;">
                    ${ANALYSIS_CONFIG.messages.uploadWarning}
                    <br><span style="color: #ffcc00; font-size: 0.8rem;">${ANALYSIS_CONFIG.messages.networkWarning}</span>
                </p>
            `;
            const progressBar = modalBody.querySelector('#progressBar');
            const progressPercent = modalBody.querySelector('#progressPercent');
            const uploadRes = await uploadVideoInChunks(API_URL, file, uploadSession, ({ percent, speed, partNumber, partCount, attempt }) => {
                requestAnimationFrame(() => {
                    if (progressBar) progressBar.style.width = `${percent}%`;
                    if (progressPercent) {
                        const retry = attempt > 1 ? ` · retry ${attempt}/3` : '';
                        progressPercent.textContent = `${percent}% (${speed.toFixed(1)} MB/s) · ${partNumber}/${partCount}${retry}`;
                    }
                });
            });

            fileUri = uploadRes.fileUri;
            fileName = uploadRes.fileName;

            // Update Cache
            lastUploadedFileMetadata = currentFileMetadata;
            lastUploadedFileUri = fileUri;
            lastUploadedServerFileName = fileName;
        }

        // 3. Polling
        console.log("Step 3: Polling Status");
        setModalStep('step-processing');
        modalBody.innerHTML = `
            <div class="loader-orbit"></div>
            <p style="text-align:center; font-weight:bold; color:#41d1ff;">${ANALYSIS_CONFIG.messages.stepProcessing}</p>
            <p style="font-size: 0.9rem; color: #888; text-align:center">${ANALYSIS_CONFIG.messages.waitMessage}</p>
        `;
        
        let isReady = false;
        for (let i = 0; i < 60; i++) { // Max 2 mins
            const checkRes = await fetch(analysisApiUrl(API_URL, "check_status"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fileName })
            });
            
            if (!checkRes.ok) throw new Error(await responseApiError(checkRes, "statusCheckFailed"));
            const statusData = await checkRes.json();
            
            if (statusData.state === "ACTIVE") {
                isReady = true;
                break;
            }
            if (statusData.state === "FAILED") {
                throw new Error(analysisMessage("processingFailed"));
            }
            
            // Wait 2s
            await new Promise(r => setTimeout(r, 2000));
        }
        
        if (!isReady) throw new Error(analysisMessage("processingTimeout"));

        // 4. Analyze
        console.log("Step 4: Analyze");
        setModalStep('step-analyzing');
        modalBody.innerHTML = `
            <div class="loader-wave">
                <div></div><div></div><div></div><div></div><div></div>
                <div></div><div></div><div></div><div></div><div></div>
                <div></div><div></div><div></div><div></div><div></div>
            </div>
            <p style="text-align:center; font-weight:bold; color:#d4af37;">${ANALYSIS_CONFIG.messages.stepAnalyzing}</p>
            <p style="font-size: 0.9rem; color: #b0bec5; text-align:center">${ANALYSIS_CONFIG.messages.analyzeTimeWarning}</p>
        `;

        const genre = document.getElementById('danceGenre').value;

        // Generate Prompt using the function injected from HTML
        const prompt = ANALYSIS_CONFIG.generatePrompt(genre);

        const analyzeRes = await fetch(analysisApiUrl(API_URL, "analyze"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                fileUri: fileUri,
                fileName: fileName,
                mimeType: file.type,
                genre: genre,
                userPrompt: prompt
            })
        });

        if (!analyzeRes.ok) {
            throw new Error(await responseApiError(analyzeRes, "analysisFailed"));
        }
        
        const text = await analyzeRes.text();
        if (!text) throw new Error(analysisMessage("emptyResponse"));
        
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            throw new Error(analysisMessage("invalidResponse"));
        }
        
        let content = data.choices?.[0]?.message?.content || ANALYSIS_CONFIG.messages.resultError;
        
        latestAnalysisResult = content;

        // Save Result
        try {
            const saveRes = await fetch(analysisApiUrl(API_URL, "save_result"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    result: content,
                    genre: genre
                })
            });
            if (saveRes.ok) {
                const saveData = await saveRes.json();
                currentAnalysisId = saveData.id;
                console.log("Result saved with ID:", currentAnalysisId);
            }
        } catch (saveErr) {
            console.warn("Failed to save result for sharing:", saveErr);
        }

        // Render: try JSON first, fallback to markdown
        let formattedContent = renderJsonAnalysis(content);
        if (!formattedContent) {
            formattedContent = renderMarkdownFallback(content);
        }

        setModalStep('step-complete');
        modalTitle.textContent = ANALYSIS_CONFIG.messages.resultTitle;
        modalBody.innerHTML = formattedContent;
        modalFooter.style.display = 'flex';

    } catch (error) {
        console.error(error);
        setModalStep('step-error');
        alert(`${ANALYSIS_CONFIG.messages.errorTitle}: ${error.message}`);
        modalTitle.textContent = ANALYSIS_CONFIG.messages.errorTitle;
        modalBody.innerHTML = `<p style="color:red">${escapeHtml(error.message)}</p>`;
        modalFooter.style.display = 'none';
    } finally {
        // MiMo 분석이 끝나면 서버가 임시 동영상을 삭제하므로 업로드 캐시도 폐기합니다.
        lastUploadedFileMetadata = null;
        lastUploadedFileUri = null;
        lastUploadedServerFileName = null;
        isAnalyzing = false;
        modalCloseBtn.style.display = 'block';

        // UI Restore
        analyzeBtn.disabled = false;
        document.getElementById('danceGenre').disabled = false;
        document.querySelector('label[for="videoInput"]').style.pointerEvents = "auto";
        document.querySelector('label[for="videoInput"]').style.opacity = "1";
    }
}

function closeModal() {
    if (isAnalyzing) return;
    resultModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    setModalStep(null);
}

function shareKakao() {
    if (typeof Kakao === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.1/kakao.min.js';
        script.onload = () => {
            try {
                if (!Kakao.isInitialized()) {
                    Kakao.init('41684f8ded61c7e396e37031d51bbc3c');
                }
                shareKakao();
            } catch (e) {
                alert('Kakao SDK Init Failed: ' + e.message);
            }
        };
        script.onerror = () => {
            alert('Failed to load Kakao SDK.');
        };
        document.head.appendChild(script);
        return;
    }

    try {
        if (!Kakao.isInitialized()) {
            Kakao.init('41684f8ded61c7e396e37031d51bbc3c');
        }

        const shareUrl = window.location.href.split('?')[0] + (currentAnalysisId ? `?id=${currentAnalysisId}` : '');

        Kakao.Share.sendDefault({
            objectType: 'feed',
            content: {
                title: ANALYSIS_CONFIG.messages.shareTitle,
                description: ANALYSIS_CONFIG.messages.shareDesc,
                imageUrl: 'https://golf.archerlab.dev/assets/images/kakao_golf.png',
                imageWidth: 1200,
                imageHeight: 630,
                link: {
                    mobileWebUrl: shareUrl,
                    webUrl: shareUrl,
                },
            },
            buttons: [
                {
                    title: ANALYSIS_CONFIG.messages.shareBtn,
                    link: {
                        mobileWebUrl: shareUrl,
                        webUrl: shareUrl,
                    },
                },
            ],
        });
    } catch (err) {
        console.error('Kakao Share Error:', err);
        alert('카카오톡 공유 실패: ' + JSON.stringify(err, Object.getOwnPropertyNames(err)));
    }
}

function copyResult() {
    if (!latestAnalysisResult) {
        alert(ANALYSIS_CONFIG.messages.copyNoResult);
        return;
    }
    
    navigator.clipboard.writeText(latestAnalysisResult).then(() => {
        alert(ANALYSIS_CONFIG.messages.copySuccess);
    }).catch(err => {
        console.error('Copy failed:', err);
        alert(ANALYSIS_CONFIG.messages.copyFail);
    });
}

// Load Shared Result
window.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const sharedId = urlParams.get('id');

    if (sharedId) {
        const API_URL = "https://latindance-api.yama5993.workers.dev";
        
        resultModal.style.display = 'flex';
        setModalStep('step-processing'); // Initial loading state
        modalTitle.textContent = ANALYSIS_CONFIG.messages.loadingShared;
        modalBody.innerHTML = '<div class="spinner"></div><p style="text-align:center">...</p>';
        modalFooter.style.display = 'none';
        modalCloseBtn.style.display = 'block';

        try {
            const res = await fetch(analysisApiUrl(API_URL, "get_result", { id: sharedId }), { method: "POST" });
            if (!res.ok) throw new Error(await responseApiError(res, "resultNotFound"));
            
            const data = await res.json();
            const content = data.result;
            latestAnalysisResult = content;

            // Render: try JSON first, fallback to markdown
            let formattedContent = renderJsonAnalysis(content);
            if (!formattedContent) {
                formattedContent = renderMarkdownFallback(content);
            }

            setModalStep('step-complete'); // Success state (Green)
            modalTitle.textContent = ANALYSIS_CONFIG.messages.resultTitleShared;
            modalBody.innerHTML = formattedContent;
            modalFooter.style.display = 'flex';
            
        } catch (err) {
            console.error(err);
            setModalStep('step-error'); // Error state (Red)
            modalTitle.textContent = ANALYSIS_CONFIG.messages.errorTitle;
            modalBody.innerHTML = `<p>${escapeHtml(ANALYSIS_CONFIG.messages.loadSharedFail)}<br>(${escapeHtml(err.message)})</p>`;
        }
    }
});

function setModalStep(step) {
    if (!modalContainer) return;
    modalContainer.classList.remove('step-init', 'step-upload', 'step-processing', 'step-analyzing', 'step-complete', 'step-error');
    if (step) {
        modalContainer.classList.add(step);
    }
}
