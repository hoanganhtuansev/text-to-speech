import express from "express";
import path from "path";
import { GoogleGenAI, Modality } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in environment variables.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Helper to convert raw PCM (24kHz 16-bit mono) to WAV Buffer
function pcmToWavBuffer(
  pcmBuffer: Buffer,
  sampleRate = 24000,
  numChannels = 1,
  bitsPerSample = 16
): Buffer {
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = pcmBuffer.length;
  const wavBuffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  wavBuffer.write("RIFF", 0);
  wavBuffer.writeUInt32LE(36 + dataSize, 4);
  wavBuffer.write("WAVE", 8);

  // fmt subchunk
  wavBuffer.write("fmt ", 12);
  wavBuffer.writeUInt32LE(16, 16); // Subchunk1Size for PCM
  wavBuffer.writeUInt16LE(1, 20); // AudioFormat: 1 = PCM
  wavBuffer.writeUInt16LE(numChannels, 22);
  wavBuffer.writeUInt32LE(sampleRate, 24);
  wavBuffer.writeUInt32LE(byteRate, 28);
  wavBuffer.writeUInt16LE(blockAlign, 32);
  wavBuffer.writeUInt16LE(bitsPerSample, 34);

  // data subchunk
  wavBuffer.write("data", 36);
  wavBuffer.writeUInt32LE(dataSize, 40);
  pcmBuffer.copy(wavBuffer, 44);

  return wavBuffer;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "15mb" }));

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      hasApiKey: Boolean(process.env.GEMINI_API_KEY),
      model: "gemini-3.1-flash-tts-preview",
    });
  });

  // TTS Endpoint using gemini-3.1-flash-tts-preview
  app.post("/api/tts", async (req, res) => {
    try {
      const {
        text,
        voiceName = "Fenrir",
        speed = "normal",
        customPrompt,
      } = req.body;

      if (!text || typeof text !== "string" || !text.trim()) {
        return res.status(400).json({ error: "Nội dung văn bản (text) không được để trống." });
      }

      const ai = getGeminiClient();

      // Build structured prompt adhering strictly to Vietnamese Electrical Engineer persona
      const engineerPersonaInstruction =
        customPrompt ||
        `Đọc văn bản sau bằng tiếng Việt với giọng nam tự nhiên, độ tuổi khoảng 30–40 tuổi.
Phong cách: Một kỹ sư điện đang nhiệt tình, thân thiện giải thích kiến thức cho người xem phổ thông.
Đặc điểm giọng: Tự tin, rõ ràng, gãy gọn, có năng lượng vừa phải. Tuyệt đối không đọc như phát thanh viên đài truyền hình, không đọc giọng quảng cáo, không quá trang trọng cứng nhắc.
Tốc độ nói: Tự nhiên, hơi nhanh nhẹ một chút (phù hợp video YouTube/Reel cuốn hút). Có ngắt nghỉ ngắn gọn, dứt khoát giữa các ý.
Nhấn giọng tự nhiên vào các từ khóa kỹ thuật trọng tâm: "điện mặt trời", "BESS", "đầy 100 phần trăm", "điện dư", "bán lên lưới", "thiếu điện", "lấy điện từ lưới".
Các thông số, số liệu và đơn vị kỹ thuật (kW, kWh, MW, MWh, V, %) đọc chuẩn xác, tự nhiên, rành mạch.

Văn bản cần đọc:
"${text.trim()}"`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [
          {
            parts: [{ text: engineerPersonaInstruction }],
          },
        ],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: voiceName || "Fenrir",
              },
            },
          },
        },
      });

      const candidate = response.candidates?.[0];
      const audioPart = candidate?.content?.parts?.find((p) => p.inlineData?.data);

      if (!audioPart?.inlineData?.data) {
        return res.status(500).json({
          error: "Không nhận được dữ liệu âm thanh từ mô hình Gemini TTS.",
        });
      }

      const rawBase64 = audioPart.inlineData.data;
      const rawMime = audioPart.inlineData.mimeType || "audio/pcm;rate=24000";

      let finalWavBase64 = rawBase64;
      let sampleRate = 24000;

      // Extract sample rate if present
      const rateMatch = rawMime.match(/rate=(\d+)/);
      if (rateMatch) {
        sampleRate = parseInt(rateMatch[1], 10) || 24000;
      }

      // Convert raw PCM to standard WAV if mimeType is PCM or raw
      if (rawMime.includes("pcm") || !rawMime.includes("wav")) {
        const rawBuffer = Buffer.from(rawBase64, "base64");
        const wavBuffer = pcmToWavBuffer(rawBuffer, sampleRate, 1, 16);
        finalWavBase64 = wavBuffer.toString("base64");
      }

      const audioDataUrl = `data:audio/wav;base64,${finalWavBase64}`;
      const estimatedDurationSeconds = Math.round(
        (Buffer.from(finalWavBase64, "base64").length - 44) / (sampleRate * 2)
      );

      return res.json({
        success: true,
        audioDataUrl,
        mimeType: "audio/wav",
        sampleRate,
        estimatedDurationSeconds,
        voiceUsed: voiceName,
        textLength: text.length,
      });
    } catch (err: any) {
      console.error("TTS generation error:", err);
      return res.status(500).json({
        error: err?.message || "Có lỗi xảy ra khi tạo giọng đọc kỹ sư điện.",
      });
    }
  });

  // AI Script Assistant: Generate or refine Vietnamese Electrical Engineering script
  app.post("/api/script-ai", async (req, res) => {
    try {
      const { action, topic, currentScript } = req.body;
      const ai = getGeminiClient();

      let prompt = "";
      if (action === "optimize") {
        prompt = `Bạn là một kỹ sư điện chuyên nghiệp và chuyên gia sáng tạo nội dung YouTube/Reel về Năng lượng tái tạo, Điện mặt trời và Pin lưu trữ BESS.
Nhiệm vụ: Hãy tối ưu hóa kịch bản dưới đây để chuẩn bị đưa vào hệ thống Text-to-Speech đọc bằng giọng nam kỹ sư điện (30-40 tuổi) giải thích cho khán giả phổ thông.
Yêu cầu kịch bản tối ưu:
1. Giọng văn tự nhiên, đối thoại, tự tin, hấp dẫn như đang trò chuyện chia sẻ kinh nghiệm thực tế.
2. Viết rõ ràng các số liệu kỹ thuật để đọc tự nhiên (ví dụ "100%" viết thành "đầy 100 phần trăm", "50 kWp" viết thành "50 ki-lô-oát-píc (50 kWp)", v.v.).
3. Nhấn nhá các từ khóa cốt lõi: "điện mặt trời", "BESS", "đầy 100 phần trăm", "điện dư", "bán lên lưới", "thiếu điện", "lấy điện từ lưới".
4. Giữ độ dài vừa phải cho video ngắn (khoảng 60-150 từ, thời lượng đọc khoảng 30s - 50s).
5. Trả về DUY NHẤT nội dung kịch bản tiếng Việt đã được trau chuốt, không kèm lời mở đầu hoặc kết luận meta.

Kịch bản gốc:
"""${currentScript || topic || "Điện mặt trời mái nhà kết hợp pin lưu trữ BESS"}"""`;
      } else {
        // Generate new script
        prompt = `Bạn là một kỹ sư điện đam mê chia sẻ kiến thức về Điện mặt trời (Solar PV) và Hệ thống pin lưu trữ năng lượng (BESS - Battery Energy Storage System) cho khán giả đại chúng trên video ngắn YouTube/Reels.
Hãy viết một kịch bản ngắn gọn, súc tích (khoảng 80-140 từ, đọc trong 30-45 giây) về chủ đề: "${topic || "Hệ thống điện mặt trời và BESS hoạt động như thế nào trong ngày"}".
Phong cách:
- Giọng nam kỹ sư điện thực chiến, thân thiện, dễ hiểu, không dùng từ ngữ hàn lâm khó hiểu.
- Sử dụng và nhấn mạnh tự nhiên các từ: "điện mặt trời", "BESS", "đầy 100 phần trăm", "điện dư", "bán lên lưới", "thiếu điện", "lấy điện từ lưới".
- Đọc mượt mà, câu văn ngắt nghỉ gãy gọn theo nhịp nói đời thường.
Chỉ trả về nội dung kịch bản lời thoại bằng tiếng Việt, không kèm tiêu đề phụ hay ghi chú ngoài.`;
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
      });

      const generatedScript = response.text?.trim() || "";
      return res.json({ success: true, script: generatedScript });
    } catch (err: any) {
      console.error("Script AI error:", err);
      return res.status(500).json({
        error: err?.message || "Có lỗi xảy ra khi tạo kịch bản.",
      });
    }
  });

  // Vite middleware in dev mode / static serve in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
