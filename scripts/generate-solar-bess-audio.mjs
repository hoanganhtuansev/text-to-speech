import fs from 'node:fs/promises';
import path from 'node:path';
import { GoogleGenAI, Modality } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) throw new Error('GEMINI_API_KEY is missing');
const ai = new GoogleGenAI({ apiKey });

const scenes = [
  `Nhìn vào hệ thống này nhé. Chúng ta có điện mặt trời, pin lưu trữ BESS, lưới điện và ba tải gồm quạt, bóng đèn và điều hòa. Vậy khi tải thay đổi, dòng điện sẽ đi đâu?`,
  `Ban ngày, giả sử hệ thống điện mặt trời đang phát năm kilowatt. Lúc đầu, chúng ta chỉ bật một chiếc quạt, tiêu thụ khoảng không phẩy năm kilowatt. Điện mặt trời sẽ ưu tiên cấp trực tiếp cho quạt trước. Khoảng bốn phẩy năm kilowatt còn dư sẽ được đưa vào BESS để sạc pin.`,
  `Sau một thời gian, BESS được sạc đầy một trăm phần trăm. Lúc này pin không thể nhận thêm điện nữa. Quạt vẫn tiêu thụ không phẩy năm kilowatt, nên khoảng bốn phẩy năm kilowatt điện mặt trời còn dư sẽ đi qua công tơ bán điện và phát lên lưới.`,
  `Bây giờ chúng ta bật thêm một bóng đèn, tiêu thụ khoảng không phẩy hai kilowatt. Tổng tải lúc này là không phẩy bảy kilowatt. Điện mặt trời vẫn đang phát năm kilowatt và BESS vẫn đầy một trăm phần trăm. Vì vậy, điện mặt trời sẽ cấp trực tiếp cho quạt và bóng đèn. Khoảng bốn phẩy ba kilowatt còn dư tiếp tục được bán lên lưới.`,
  `Tiếp theo, chúng ta bật thêm điều hòa, công suất khoảng tám kilowatt. Tổng tải lúc này tăng lên tám phẩy bảy kilowatt, trong khi điện mặt trời chỉ phát được năm kilowatt. Như vậy hệ thống đang thiếu ba phẩy bảy kilowatt. Vì BESS đang đầy, pin bắt đầu xả để hỗ trợ tải. Giả sử BESS có thể xả hai kilowatt. Điện mặt trời cấp năm kilowatt, BESS cấp thêm hai kilowatt. Tổng cộng chúng ta có bảy kilowatt. Phần còn thiếu một phẩy bảy kilowatt sẽ được lấy thêm từ lưới điện qua công tơ mua điện.`,
  `Bây giờ hãy chuyển sang buổi tối. Không còn ánh nắng, nên điện mặt trời không phát điện nữa. Nếu chúng ta chỉ sử dụng quạt và bóng đèn, tổng tải là không phẩy bảy kilowatt. BESS sẽ xả điện để cấp toàn bộ công suất cho hai thiết bị này. Lúc này chúng ta chưa cần lấy điện từ lưới.`,
  `Nhưng nếu tiếp tục bật thêm điều hòa thì sao? Tổng tải lại tăng lên tám phẩy bảy kilowatt. Trong khi đó, giả sử hệ thống BESS chỉ có thể xả tối đa hai kilowatt. BESS sẽ cấp hai kilowatt cho tải. Phần công suất còn thiếu, tức sáu phẩy bảy kilowatt, sẽ được lưới điện cấp bù qua công tơ mua điện.`,
  `Như vậy, nguyên lý hoạt động của hệ thống Solar kết hợp BESS thực ra rất dễ nhớ. Khi có điện mặt trời, hệ thống ưu tiên cấp điện cho tải trước. Điện dư sẽ được dùng để sạc BESS. Khi BESS đã đầy mà vẫn còn dư điện, phần điện dư có thể được bán lên lưới. Khi công suất tải lớn hơn công suất điện mặt trời, BESS sẽ xả để hỗ trợ. Và nếu điện mặt trời cộng với BESS vẫn không đủ, lưới điện sẽ cấp phần công suất còn thiếu.`
];

const voiceName = 'Fenrir';
const pauseSeconds = 0.35;
const sampleRate = 24000;
const bytesPerSecond = sampleRate * 2;

const persona = `Đọc bằng tiếng Việt với giọng nam tự nhiên khoảng 30 đến 40 tuổi, như một kỹ sư điện thực chiến đang giải thích cho người xem phổ thông. Giọng thân thiện, tự tin, rõ ràng, có năng lượng vừa phải. Không đọc kiểu phát thanh viên hoặc quảng cáo. Tốc độ tự nhiên, hơi nhanh nhẹ một chút cho video YouTube/Reel. Ngắt nghỉ ngắn giữa các ý. Nhấn tự nhiên vào các từ điện mặt trời, BESS, đầy một trăm phần trăm, điện dư, bán lên lưới, thiếu điện, lấy điện từ lưới. Đọc số liệu kỹ thuật rõ ràng và tự nhiên.`;

function pcmToWav(pcm) {
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(bytesPerSecond, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

const parts = [];
const timeline = [];
let cursor = 0;

for (let i = 0; i < scenes.length; i++) {
  const text = scenes[i];
  console.log(`Generating scene ${i + 1}/${scenes.length}`);
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-tts-preview',
    contents: [{ parts: [{ text: `${persona}\n\nVăn bản cần đọc:\n"${text}"` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } },
    },
  });

  const audioPart = response.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
  if (!audioPart?.inlineData?.data) throw new Error(`No audio returned for scene ${i + 1}`);
  const pcm = Buffer.from(audioPart.inlineData.data, 'base64');
  const duration = pcm.length / bytesPerSecond;
  const start = cursor;
  const end = start + duration;
  timeline.push({ scene: i + 1, start, end, duration, text });
  parts.push(pcm);
  cursor = end;

  if (i < scenes.length - 1) {
    const silence = Buffer.alloc(Math.round(bytesPerSecond * pauseSeconds));
    parts.push(silence);
    cursor += pauseSeconds;
  }
}

const mergedPcm = Buffer.concat(parts);
const wav = pcmToWav(mergedPcm);
await fs.mkdir('output', { recursive: true });
await fs.writeFile(path.join('output', 'solar-bess-full.wav'), wav);
await fs.writeFile(path.join('output', 'solar-bess-timeline.json'), JSON.stringify({ voiceName, sampleRate, pauseSeconds, totalDuration: cursor, scenes: timeline }, null, 2));
console.log(`Done. Total duration: ${cursor.toFixed(2)}s`);
