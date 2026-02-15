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
    const isBot = /bot|googlebot|crawler|spider|robot|crawling/i.test(navigator.userAgent);
    
    // 내부 이동 감지 (사이트 내에서 링크 클릭으로 이동한 경우 리다이렉트 방지)
    const referrer = document.referrer;
    const isInternal = referrer && referrer.indexOf(window.location.hostname) !== -1;

    // 봇이 아니고, 내부 이동이 아닐 때만(외부 유입/첫 진입) 브라우저 언어에 따라 리다이렉션합니다.
    if (browserLang && !isBot && !isInternal) {
        const currentPath = window.location.pathname;
        const currentFile = currentPath.substring(currentPath.lastIndexOf('/') + 1) || "index.html";
        
        // 현재 파일명에서 기본 이름 추출 (예: analysis-en.html -> analysis)
        let baseName = currentFile.replace(/-en\.html$|-es\.html$|\.html$/, "");
        if (!baseName || baseName === "index") baseName = "index";

        let targetFile = null;
        
        // 브라우저 언어와 현재 페이지 언어가 다를 경우 타겟 파일 설정
        if (browserLang === "ko" && !docLang.startsWith("ko")) {
            targetFile = baseName + ".html";
        } else if (browserLang === "ja" && !docLang.startsWith("ja")) {
            targetFile = baseName + "-jp.html";
        } else if (browserLang === "en" && !docLang.startsWith("en")) {
            targetFile = baseName + "-en.html";
        }

        // 타겟 파일이 존재하고 현재 파일과 다를 경우 이동
        if (targetFile && targetFile !== currentFile) {
            window.location.replace(targetFile);
        }
    }
})();

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
        return `<p style="text-align:center; color:#ff9800; font-size:1.1rem; padding:2rem 1rem;">${escapeHtml(data.rejectMessage || '')}</p>`;
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
        
        if (file.size > 100 * 1024 * 1024) { // 100MB limit
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
            const initRes = await fetch(`${API_URL}?action=init`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    mimeType: file.type,
                    numBytes: file.size,
                    displayName: file.name
                })
            });
            
            if (!initRes.ok) {
                const text = await initRes.text();
                if (text.includes("User location is not supported") || text.includes("FAILED_PRECONDITION")) {
                    throw new Error("해당 IP가 Google 서비스 접속이 차단되었습니다.\n(VPN, Google One, 또는 보안 Wi-Fi를 끄고 시도해주세요)");
                }
                throw new Error(`Init failed (${initRes.status}): ${text}`);
            }
            const { uploadUrl } = await initRes.json();

            // 2. Upload (with retry)
            console.log("Step 2: Upload");
            const MAX_UPLOAD_RETRIES = 3;
            const uploadTimeoutMs = Math.min(Math.max(60000, (file.size / (1024 * 1024)) * 10000), 300000);
            let uploadRes;
            let currentUploadUrl = uploadUrl;

            for (let attempt = 1; attempt <= MAX_UPLOAD_RETRIES; attempt++) {
                setModalStep('step-upload');
                const retryInfo = attempt > 1 ? `<p style="font-size: 0.85rem; color: #ffcc00; text-align:center; margin-bottom: 8px;">⟳ 재시도 ${attempt}/${MAX_UPLOAD_RETRIES}</p>` : '';
                modalBody.innerHTML = `
                    ${retryInfo}
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

                try {
                    if (attempt > 1) {
                        console.log(`Upload retry ${attempt}: re-initializing upload URL`);
                        const retryInitRes = await fetch(`${API_URL}?action=init`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                mimeType: file.type,
                                numBytes: file.size,
                                displayName: file.name
                            })
                        });
                        if (!retryInitRes.ok) throw new Error(`Re-init failed (${retryInitRes.status})`);
                        const retryInitData = await retryInitRes.json();
                        currentUploadUrl = retryInitData.uploadUrl;
                    }

                    uploadRes = await new Promise((resolve, reject) => {
                        const xhr = new XMLHttpRequest();
                        xhr.open("POST", `${API_URL}?action=upload`);
                        xhr.setRequestHeader("X-Upload-Url", currentUploadUrl);
                        xhr.setRequestHeader("Content-Type", file.type);
                        xhr.timeout = uploadTimeoutMs;

                        let lastUpdate = 0;
                        let startTime = Date.now();

                        xhr.upload.onprogress = (e) => {
                            if (e.lengthComputable) {
                                const now = Date.now();
                                if (now - lastUpdate > 100 || e.loaded === e.total) {
                                    const percent = Math.round((e.loaded / e.total) * 100);
                                    const timeDiff = (now - startTime) / 1000;
                                    const speed = timeDiff > 0 ? (e.loaded / 1024 / 1024) / timeDiff : 0;
                                    if (progressBar && progressPercent) {
                                        requestAnimationFrame(() => {
                                            progressBar.style.width = `${percent}%`;
                                            progressPercent.textContent = `${percent}% (${speed.toFixed(1)} MB/s)`;
                                        });
                                    }
                                    lastUpdate = now;
                                }
                            }
                        };

                        xhr.onload = () => {
                            if (xhr.status >= 200 && xhr.status < 300) {
                                try {
                                    resolve(JSON.parse(xhr.responseText));
                                } catch (e) {
                                    reject(new Error("Invalid JSON response from upload"));
                                }
                            } else {
                                reject(new Error(`Upload failed (${xhr.status}): ${xhr.responseText}`));
                            }
                        };

                        xhr.onerror = () => reject(new Error("Network error during upload"));
                        xhr.ontimeout = () => reject(new Error("Upload timed out"));
                        xhr.send(file);
                    });
                    break;
                } catch (uploadErr) {
                    console.warn(`Upload attempt ${attempt} failed:`, uploadErr.message);
                    if (attempt === MAX_UPLOAD_RETRIES) {
                        throw new Error(`업로드 실패 (${MAX_UPLOAD_RETRIES}회 시도)\n네트워크 연결을 확인하고 다시 시도해주세요.\n(${uploadErr.message})`);
                    }
                    const waitSec = Math.pow(2, attempt);
                    if (progressPercent) {
                        progressPercent.textContent = `${waitSec}초 후 재시도...`;
                    }
                    await new Promise(r => setTimeout(r, waitSec * 1000));
                }
            }

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
            const checkRes = await fetch(`${API_URL}?action=check_status`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fileName })
            });
            
            if (!checkRes.ok) throw new Error("Status check failed");
            const statusData = await checkRes.json();
            
            if (statusData.state === "ACTIVE") {
                isReady = true;
                break;
            }
            if (statusData.state === "FAILED") {
                throw new Error("Video processing failed at server side");
            }
            
            // Wait 2s
            await new Promise(r => setTimeout(r, 2000));
        }
        
        if (!isReady) throw new Error("Video processing timed out");

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

        const analyzeRes = await fetch(`${API_URL}?action=analyze`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                fileUri: fileUri,
                mimeType: file.type,
                genre: genre,
                userPrompt: prompt
            })
        });

        if (!analyzeRes.ok) {
            const text = await analyzeRes.text();
            throw new Error(`Analysis failed (${analyzeRes.status}): ${text}`);
        }
        
        const text = await analyzeRes.text();
        if (!text) throw new Error("Empty response from server");
        
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            throw new Error(`Invalid JSON response: ${text.substring(0, 100)}...`);
        }
        
        let content = data.choices?.[0]?.message?.content || ANALYSIS_CONFIG.messages.resultError;
        
        latestAnalysisResult = content;

        // Save Result
        try {
            const saveRes = await fetch(`${API_URL}?action=save_result`, {
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
        modalBody.innerHTML = `<p style="color:red">${error.message}</p>`;
        modalFooter.style.display = 'none';
    } finally {
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
            const res = await fetch(`${API_URL}?action=get_result&id=${sharedId}`);
            if (!res.ok) throw new Error("Result not found");
            
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
            modalBody.innerHTML = `<p>${ANALYSIS_CONFIG.messages.loadSharedFail}<br>(${err.message})</p>`;
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
