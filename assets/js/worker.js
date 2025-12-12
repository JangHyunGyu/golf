// ===== CORS =====
const ALLOWED_ORIGINS = [
  "https://latindance.kr",
  "http://localhost:3000",
  "http://localhost:8000",
  "http://127.0.0.1:5500",
  "null",
];

const corsHeaders = (origin) => ({
  "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Vary": "Origin",
});

// ===== Google File API Helpers =====

// 1. 초기 업로드 URL 획득 (Resumable Upload 시작)
async function initiateUpload(apiKey, file, mimeType) {
  const url = `https://generativelanguage.googleapis.com/upload/v1beta/files?key=${apiKey}`;
  
  const headers = {
    "X-Goog-Upload-Protocol": "resumable",
    "X-Goog-Upload-Command": "start",
    "X-Goog-Upload-Header-Content-Length": file.size.toString(),
    "X-Goog-Upload-Header-Content-Type": mimeType,
    "Content-Type": "application/json",
  };

  const metadata = {
    file: { display_name: file.name || "uploaded_video" }
  };

  const response = await fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(metadata),
  });

  if (!response.ok) {
    throw new Error(`Upload initiation failed: ${response.statusText}`);
  }

  // 업로드할 실제 URL은 헤더에 담겨 옴
  return response.headers.get("x-goog-upload-url");
}

// 2. 실제 파일 데이터 전송
async function uploadBytes(uploadUrl, file) {
  const headers = {
    "Content-Length": file.size.toString(),
    "X-Goog-Upload-Offset": "0",
    "X-Goog-Upload-Command": "upload, finalize",
  };

  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: headers,
    body: file, // File 객체(Blob)를 그대로 전송
  });

  if (!response.ok) {
    throw new Error(`File upload failed: ${response.statusText}`);
  }

  const result = await response.json();
  return result.file.uri; // fileUri 반환
}

// 3. 파일 처리 상태 대기 (Polling)
async function waitForFileActive(apiKey, fileUri) {
  const name = fileUri.split("/").pop(); // uri에서 파일 이름 추출 (files/xxx -> xxx 아님, 전체 uri 사용 가능)
  // API 호출 시에는 files/NAME 형식이 필요함. fileUri 자체가 그 형식임.
  
  const url = `https://generativelanguage.googleapis.com/v1beta/${fileUri}?key=${apiKey}`;

  let attempts = 0;
  while (attempts < 30) { // 최대 60초 대기 (2초 * 30회)
    const response = await fetch(url);
    const data = await response.json();

    if (data.state === "ACTIVE") {
      return; // 준비 완료
    }
    if (data.state === "FAILED") {
      throw new Error("File processing failed");
    }

    // 2초 대기
    await new Promise(resolve => setTimeout(resolve, 2000));
    attempts++;
  }
  throw new Error("File processing timed out");
}


// ===== Main Worker Logic =====
export default {
  async fetch(req, env) {
    const origin = req.headers.get("Origin") ?? "null";

    // Preflight
    if (req.method === "OPTIONS") {
      const headers = corsHeaders(origin);
      return new Response(null, {
        status: ALLOWED_ORIGINS.includes(origin) ? 204 : 403,
        headers
      });
    }

    if (req.method === "GET") {
      return new Response(JSON.stringify({ ok: true, service: "latindance-video-analysis-api" }), {
        status: 200,
        headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
      });
    }

    if (!ALLOWED_ORIGINS.includes(origin)) {
      return new Response(JSON.stringify({ error: "Forbidden origin" }), { status: 403, headers: corsHeaders(origin) });
    }

    if (!env?.GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing GEMINI_API_KEY" }), { status: 500, headers: corsHeaders(origin) });
    }

    try {
      const contentType = req.headers.get("content-type") || "";
      let userMessage = "";
      let fileUri = null;
      let hasVideo = false;

      // 1. 요청 파싱 (FormData 필수)
      if (contentType.includes("multipart/form-data")) {
        const formData = await req.formData();
        userMessage = formData.get("message") || "이 춤 영상을 분석해줘. 동작의 정확성, 리듬감, 자세 교정할 점을 알려줘.";
        const file = formData.get("file");

        if (file && file instanceof File) {
          hasVideo = true;
          // A. 업로드 시작
          const uploadUrl = await initiateUpload(env.GEMINI_API_KEY, file, file.type);
          // B. 바이트 전송
          fileUri = await uploadBytes(uploadUrl, file);
          // C. 처리 대기
          await waitForFileActive(env.GEMINI_API_KEY, fileUri);
        } else {
            throw new Error("No video file provided");
        }
      } else {
        throw new Error("Content-Type must be multipart/form-data");
      }

      // 2. Gemini 요청 구성
      const contents = [
        {
          role: "user",
          parts: [
            { text: userMessage },
            ...(fileUri ? [{ fileData: { fileUri: fileUri, mimeType: "video/mp4" } }] : [])
          ]
        }
      ];

      const geminiPayload = {
        contents,
        generationConfig: {
          temperature: 1.0,
          thinkingConfig: {
            thinkingLevel: "HIGH", // 비디오 분석은 항상 HIGH
          },
        },
      };

      // 3. Gemini 호출 (Gemini 3 Pro Preview)
      const model = "gemini-3-pro-preview"; // or gemini-1.5-pro-latest if preferred, but user asked for 3
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`;

      const upstream = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(geminiPayload),
      });

      if (!upstream.ok) {
        const errText = await upstream.text();
        throw new Error(`Gemini API Error: ${upstream.status} ${errText}`);
      }

      const data = await upstream.json();
      
      // 4. 응답 추출
      const parts = data.candidates?.[0]?.content?.parts || [];
      const responseText = parts.map(p => p.text).join("\n");

      // OpenAI 포맷으로 반환 (클라이언트 호환성)
      const openAIResponse = {
        choices: [
          {
            message: {
              role: "assistant",
              content: responseText,
            },
          },
        ],
      };

      return new Response(JSON.stringify(openAIResponse), {
        headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
      });
    }
  },
};
