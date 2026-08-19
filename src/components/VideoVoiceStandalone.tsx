import React, { useState } from "react";
import { VideoVoicePanel } from "./VideoVoicePanel";

const DEFAULT_SOLAR_BESS_SCRIPT = `Nhìn vào hệ thống này nhé. Chúng ta có điện mặt trời, pin lưu trữ BESS, lưới điện và ba tải gồm quạt, bóng đèn và điều hòa. Vậy khi tải thay đổi, dòng điện sẽ đi đâu?

Ban ngày, giả sử hệ thống điện mặt trời đang phát năm kilowatt. Lúc đầu, chúng ta chỉ bật một chiếc quạt, tiêu thụ khoảng không phẩy năm kilowatt. Điện mặt trời sẽ ưu tiên cấp trực tiếp cho quạt trước. Khoảng bốn phẩy năm kilowatt còn dư sẽ được đưa vào BESS để sạc pin.

Sau một thời gian, BESS được sạc đầy một trăm phần trăm. Lúc này pin không thể nhận thêm điện nữa. Quạt vẫn tiêu thụ không phẩy năm kilowatt, nên khoảng bốn phẩy năm kilowatt điện mặt trời còn dư sẽ đi qua công tơ bán điện và phát lên lưới.

Bây giờ chúng ta bật thêm một bóng đèn, tiêu thụ khoảng không phẩy hai kilowatt. Tổng tải lúc này là không phẩy bảy kilowatt. Điện mặt trời vẫn đang phát năm kilowatt và BESS vẫn đầy một trăm phần trăm. Vì vậy, điện mặt trời sẽ cấp trực tiếp cho quạt và bóng đèn. Khoảng bốn phẩy ba kilowatt còn dư tiếp tục được bán lên lưới.

Tiếp theo, chúng ta bật thêm điều hòa, công suất khoảng tám kilowatt. Tổng tải lúc này tăng lên tám phẩy bảy kilowatt, trong khi điện mặt trời chỉ phát được năm kilowatt. Như vậy hệ thống đang thiếu ba phẩy bảy kilowatt. Vì BESS đang đầy, pin bắt đầu xả để hỗ trợ tải. Giả sử BESS có thể xả hai kilowatt. Điện mặt trời cấp năm kilowatt, BESS cấp thêm hai kilowatt. Tổng cộng chúng ta có bảy kilowatt. Phần còn thiếu một phẩy bảy kilowatt sẽ được lấy thêm từ lưới điện qua công tơ mua điện.

Bây giờ hãy chuyển sang buổi tối. Không còn ánh nắng, nên điện mặt trời không phát điện nữa. Nếu chúng ta chỉ sử dụng quạt và bóng đèn, tổng tải là không phẩy bảy kilowatt. BESS sẽ xả điện để cấp toàn bộ công suất cho hai thiết bị này. Lúc này chúng ta chưa cần lấy điện từ lưới.

Nhưng nếu tiếp tục bật thêm điều hòa thì sao? Tổng tải lại tăng lên tám phẩy bảy kilowatt. Trong khi đó, giả sử hệ thống BESS chỉ có thể xả tối đa hai kilowatt. BESS sẽ cấp hai kilowatt cho tải. Phần công suất còn thiếu, tức sáu phẩy bảy kilowatt, sẽ được lưới điện cấp bù qua công tơ mua điện.

Như vậy, nguyên lý hoạt động của hệ thống Solar kết hợp BESS thực ra rất dễ nhớ. Khi có điện mặt trời, hệ thống ưu tiên cấp điện cho tải trước. Điện dư sẽ được dùng để sạc BESS. Khi BESS đã đầy mà vẫn còn dư điện, phần điện dư có thể được bán lên lưới. Khi công suất tải lớn hơn công suất điện mặt trời, BESS sẽ xả để hỗ trợ. Và nếu điện mặt trời cộng với BESS vẫn không đủ, lưới điện sẽ cấp phần công suất còn thiếu.`;

export function VideoVoiceStandalone() {
  const [script, setScript] = useState(DEFAULT_SOLAR_BESS_SCRIPT);
  const [voiceName, setVoiceName] = useState("Fenrir");
  const [speed, setSpeed] = useState(1.0);

  return (
    <div className="bg-slate-950 px-4 pb-12 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-4 border-t border-slate-900 pt-8">
        <div>
          <h2 className="text-xl font-bold text-white">Video Voice V2 — Solar + BESS</h2>
          <p className="mt-1 text-xs text-slate-400">Kịch bản 2 phút đã được nạp sẵn. Mỗi đoạn trống là một scene để app tạo audio và timeline chính xác.</p>
        </div>

        <textarea
          value={script}
          onChange={(e) => setScript(e.target.value)}
          className="min-h-[320px] w-full rounded-2xl border border-slate-800 bg-slate-900 p-4 text-sm leading-6 text-slate-200 outline-none focus:border-cyan-700"
        />

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <label className="text-slate-400">Voice</label>
          <select value={voiceName} onChange={(e) => setVoiceName(e.target.value)} className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2">
            <option value="Fenrir">Fenrir</option>
            <option value="Puck">Puck</option>
            <option value="Charon">Charon</option>
            <option value="Kore">Kore</option>
            <option value="Aoede">Aoede</option>
          </select>

          <label className="ml-2 text-slate-400">Speed</label>
          <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2">
            <option value={0.9}>0.9x</option>
            <option value={1}>1.0x</option>
            <option value={1.05}>1.05x</option>
            <option value={1.1}>1.1x</option>
          </select>
        </div>

        <VideoVoicePanel script={script} voiceName={voiceName} speed={speed} />
      </div>
    </div>
  );
}
