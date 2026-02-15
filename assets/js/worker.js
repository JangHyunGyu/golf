// ===== Configuration =====
// Cloudflare AI Gateway 설정 (User Location Error 방지)
const ACCOUNT_ID = "f5ced3498c8b7674581b5c9987f31585";
const GATEWAY_NAME = "archer-gateway";
const GATEWAY_BASE = `https://gateway.ai.cloudflare.com/v1/${ACCOUNT_ID}/${GATEWAY_NAME}/google-ai-studio`;

// ===== CORS =====
const ALLOWED_ORIGINS = [
  "https://latindance.kr",
  "https://golf.archerlab.dev",
  "https://archerlab.dev",
  "http://localhost:3000",
  "http://localhost:8000",
  "http://127.0.0.1:5500",
  "http://127.0.0.1:5501",
  "null",
];

// 요청 Origin에 맞는 CORS 헤더를 만들어 반환합니다.
const corsHeaders = (origin) => ({

  // 허용 목록에 존재하면 해당 Origin을, 아니면 기본값을 사용합니다.
  "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],

  // 허용할 HTTP 메서드 목록입니다.
  "Access-Control-Allow-Methods": "POST, OPTIONS",

  // 클라이언트가 보낼 수 있는 헤더를 명시합니다.
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Upload-Url, X-File-Name",

  // 캐시가 Origin 헤더에 따라 달라짐을 알립니다.
  "Vary": "Origin",
  
  // [여기 추가됨!] 브라우저와 Cloudflare에게 "절대 저장하지 마"라고 명령합니다.
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0"
});

// ===== Google File API Helpers =====

async function initiateUpload(apiKey, mimeType, numBytes, displayName) {
  const url = `https://generativelanguage.googleapis.com/upload/v1beta/files?key=${apiKey}`;

  //const url = `${GATEWAY_BASE}/upload/v1beta/files?key=${apiKey}`;
  
  const headers = {
    "X-Goog-Upload-Protocol": "resumable",
    "X-Goog-Upload-Command": "start",
    "X-Goog-Upload-Header-Content-Length": numBytes.toString(),
    "X-Goog-Upload-Header-Content-Type": mimeType,
    "Content-Type": "application/json",
  };

  const metadata = {
    file: { display_name: displayName || "uploaded_video" }
  };

  const response = await fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(metadata),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Google Upload Init Failed (${response.status}): ${errText}`);
  }

  return response.headers.get("x-goog-upload-url");
}

// ===== Main Worker Logic =====
export default {
  async fetch(req, env) {
    const origin = req.headers.get("Origin") ?? "null";
    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    // Preflight
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(origin)
      });
    }

    if (!ALLOWED_ORIGINS.includes(origin)) {
      return new Response(JSON.stringify({ error: "Forbidden origin" }), { status: 403, headers: corsHeaders(origin) });
    }

    if (!env?.GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: "Server Config Error: Missing GEMINI_API_KEY" }), { status: 500, headers: corsHeaders(origin) });
    }

    try {
      // 1. 초기화 (Upload URL 발급)
      if (action === "init") {
        const body = await req.json();
        const { mimeType, numBytes, displayName } = body;
        
        const uploadUrl = await initiateUpload(env.GEMINI_API_KEY, mimeType, numBytes, displayName);
        
        return new Response(JSON.stringify({ uploadUrl }), {
          headers: { ...corsHeaders(origin), "Content-Type": "application/json" }
        });
      }

      // 2. 업로드 (스트리밍 프록시)
      if (action === "upload") {
        const uploadUrl = req.headers.get("X-Upload-Url");
        if (!uploadUrl) throw new Error("Missing X-Upload-Url header");

        const contentLength = req.headers.get("Content-Length");

        const googleResponse = await fetch(uploadUrl, {
          method: "POST",
          headers: {
            "Content-Length": contentLength,
            "X-Goog-Upload-Offset": "0",
            "X-Goog-Upload-Command": "upload, finalize",
          },
          body: req.body,
        });

        if (!googleResponse.ok) {
          const errText = await googleResponse.text();
          throw new Error(`Google Upload Failed (${googleResponse.status}): ${errText}`);
        }

        const result = await googleResponse.json();
        // fileUri와 fileName(resource name)을 모두 반환
        return new Response(JSON.stringify({ 
          fileUri: result.file.uri,
          fileName: result.file.name 
        }), {
          headers: { ...corsHeaders(origin), "Content-Type": "application/json" }
        });
      }

      // 3. 상태 확인 (Polling용)
      if (action === "check_status") {
        const body = await req.json();
        const { fileName } = body; // e.g. "files/abc..."

        //const checkUrl = `https://generativelanguage.googleapis.com/v1beta/${fileName}?key=${env.GEMINI_API_KEY}`;
        const checkUrl = `${GATEWAY_BASE}/v1beta/${fileName}?key=${env.GEMINI_API_KEY}`;
        const checkRes = await fetch(checkUrl);
        
        if (!checkRes.ok) {
           throw new Error(`Status Check Failed: ${checkRes.status}`);
        }
        
        const data = await checkRes.json();
        return new Response(JSON.stringify({ state: data.state }), {
          headers: { ...corsHeaders(origin), "Content-Type": "application/json" }
        });
      }

      // 4. 분석 (Gemini 호출)
      if (action === "analyze") {
        const body = await req.json();
        const { fileUri, mimeType, userPrompt } = body;
                  
        // 여기서는 대기하지 않고 바로 요청 (클라이언트가 이미 ACTIVE 확인했음)
        const contents = [
          {
            role: "user",
            parts: [
              { text: userPrompt },
              { fileData: { fileUri: fileUri, mimeType: mimeType || "video/mp4" } },
            ]
          }
        ];

        const model = "gemini-3-flash-preview";
        //const model = "gemini-3-pro-preview";
        //const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`;
        const geminiUrl = `${GATEWAY_BASE}/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`;
    

        const upstream = await fetch(geminiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature: 0.0,
              topK: 1, // [추가] 후보군을 1개로 강제하여 변수 차단
            },
          }),
        });

        if (!upstream.ok) {
          const errText = await upstream.text();
          throw new Error(`Gemini API Error (${upstream.status}): ${errText}`);
        }

        const data = await upstream.json();

        // Gemini 응답에서 텍스트 파트만 추출 (thought 파트는 제외)
        const parts = data.candidates?.[0]?.content?.parts || [];
        const textParts = parts.filter(p => p.text && !p.thought).map(p => p.text);
        let text = textParts.join("") || "";

        // 응답이 비어있으면 thought 포함해서라도 반환 (fallback)
        if (!text.trim()) {
          text = parts.map(p => p.text || "").filter(Boolean).join("") || "";
        }

        // 코드블록 래핑 제거 (```json ... ``` → 순수 JSON)
        text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

        // JSON 유효성 검증 및 자동 복구
        if (text) {
          try {
            JSON.parse(text);
          } catch (e) {
            let openBraces = (text.match(/\{/g) || []).length;
            let closeBraces = (text.match(/\}/g) || []).length;
            let openBrackets = (text.match(/\[/g) || []).length;
            let closeBrackets = (text.match(/\]/g) || []).length;
            while (closeBrackets < openBrackets) { text += ']'; closeBrackets++; }
            while (closeBraces < openBraces) { text += '}'; closeBraces++; }
            try { JSON.parse(text); } catch (_) { /* 클라이언트 fallback */ }
          }
        }

        const openAIResponse = {
          choices: [{ message: { role: "assistant", content: text } }]
        };

        return new Response(JSON.stringify(openAIResponse), {
          status: 200,
          headers: { ...corsHeaders(origin), "Content-Type": "application/json" }
        });
      }

      // 5. 결과 저장 (KV)
      if (action === "save_result") {
        if (!env.LATINDANCE_KV) {
            return new Response(JSON.stringify({ error: "Server Config Error: KV not bound (LATINDANCE_KV)" }), { status: 500, headers: corsHeaders(origin) });
        }
        const body = await req.json();
        const { result, genre, type } = body;
        
        // ID 생성
        const id = crypto.randomUUID();
        
        // KV에 저장 (30일 보관)
        await env.LATINDANCE_KV.put(id, JSON.stringify({ 
            result, 
            genre, 
            type, 
            createdAt: new Date().toISOString() 
        }), { expirationTtl: 60 * 60 * 24 * 30 });
        
        return new Response(JSON.stringify({ id }), {
            headers: { ...corsHeaders(origin), "Content-Type": "application/json" }
        });
      }

      // 6. 결과 조회 (KV)
      if (action === "get_result") {
        if (!env.LATINDANCE_KV) {
            return new Response(JSON.stringify({ error: "Server Config Error: KV not bound (LATINDANCE_KV)" }), { status: 500, headers: corsHeaders(origin) });
        }
        const url = new URL(req.url);
        const id = url.searchParams.get("id");
        
        if (!id) {
            return new Response(JSON.stringify({ error: "Missing id" }), { status: 400, headers: corsHeaders(origin) });
        }

        const data = await env.LATINDANCE_KV.get(id);
        
        if (!data) {
            return new Response(JSON.stringify({ error: "Result not found" }), { status: 404, headers: corsHeaders(origin) });
        }
        
        return new Response(data, {
            headers: { ...corsHeaders(origin), "Content-Type": "application/json" }
        });
      }

      throw new Error(`Invalid action: ${action}`);

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
      });
    }
  },
};
