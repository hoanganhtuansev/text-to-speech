import { ScriptPreset, VoiceOption } from "../types";

export const KEYWORDS_TO_HIGHLIGHT = [
  "điện mặt trời",
  "BESS",
  "đầy 100 phần trăm",
  "100%",
  "điện dư",
  "bán lên lưới",
  "thiếu điện",
  "lấy điện từ lưới",
  "inverter",
  "biến tần",
  "pin lưu trữ",
  "lưới điện",
  "kWh",
  "kWp",
  "MWh",
  "MW",
];

export const VOICE_OPTIONS: VoiceOption[] = [
  {
    id: "Fenrir",
    name: "Fenrir (Kỹ sư Trầm Ấm)",
    gender: "male",
    vibe: "Tự tin, đĩnh đạc, rõ ràng",
    description: "Giọng nam 35 tuổi, chất giọng kỹ sư điện nhiều năm kinh nghiệm, giải thích mạch lạc và thuyết phục.",
    recommendedFor: "Kịch bản phân tích kỹ thuật, tổng quan hệ thống Solar & BESS",
    badge: "Khuyên Dùng ★",
  },
  {
    id: "Puck",
    name: "Puck (Kỹ sư Hoạt Bát)",
    gender: "male",
    vibe: "Năng động, nhanh nhẹn, cuốn hút",
    description: "Giọng nam 30 tuổi trẻ trung, năng lượng tích cực, nhịp điệu hơi nhanh rất hợp làm YouTube Shorts và TikTok.",
    recommendedFor: "Video Shorts, Reels, TikTok giải thích nhanh dưới 45 giây",
    badge: "Chuẩn Shorts/Reels",
  },
  {
    id: "Charon",
    name: "Charon (Kỹ sư Điềm Tĩnh)",
    gender: "male",
    vibe: "Chuyên sâu, chậm rãi, uy tín",
    description: "Giọng nam 40 tuổi dày dặn, nhấn nhá sâu vào từng con số và chỉ số kỹ thuật an toàn điện.",
    recommendedFor: "Tài liệu kỹ thuật chuyên sâu, đào tạo vận hành BESS",
  },
  {
    id: "Zephyr",
    name: "Zephyr (Kỹ sư Hiện Đại)",
    gender: "male",
    vibe: "Sáng sủa, tự nhiên, công nghệ",
    description: "Giọng nam công nghệ cao cấp, phát âm chuẩn xác các thuật ngữ tiếng Anh kết hợp tiếng Việt.",
    recommendedFor: "Giải pháp Microgrid, IoT Energy Management",
  },
  {
    id: "Kore",
    name: "Kore (Kỹ sư Nữ Cố Vấn)",
    gender: "female",
    vibe: "Truyền cảm, rành mạch",
    description: "Tùy chọn giọng nữ cố vấn năng lượng kỹ thuật nếu cần đối thoại 2 chiều.",
    recommendedFor: "Kịch bản phỏng vấn hoặc giải đáp tình huống",
  },
];

export const SCRIPT_PRESETS: ScriptPreset[] = [
  {
    id: "preset-solar-bess-full",
    title: "1. Nguyên Lý Vận Hành Điện Mặt Trời & BESS Trong Ngày",
    category: "Solar & BESS",
    description: "Kịch bản chuẩn giải thích toàn diện chu trình ban ngày nạp đầy pin 100%, phát điện dư lên lưới và cấp điện ban đêm.",
    text: `Chào các bạn, hôm nay mình sẽ giải thích nhanh cách một hệ thống điện mặt trời kết hợp pin lưu trữ BESS vận hành trong ngày nhé!

Vào buổi sáng khi nắng lên, điện mặt trời sinh ra sẽ ưu tiên cấp thẳng cho phụ tải sinh hoạt trong nhà. Phần công suất dư thừa lập tức được sạc vào hệ thống pin lưu trữ BESS.

Đến khoảng 11 giờ trưa, khi BESS đã sạc đầy 100 phần trăm, toàn bộ lượng điện dư tiếp theo sẽ được tự động bán lên lưới hoặc giảm phát qua tính năng Zero Export nếu chưa có hợp đồng mua bán điện.

Còn lúc chiều tối khi tắt nắng, hệ thống sẽ xả điện từ BESS ra sử dụng. Nhờ vậy, ngay cả giờ cao điểm gia đình bạn cũng không lo thiếu điện và hoàn toàn không cần lấy điện từ lưới!`,
    durationEstimate: "~45 giây",
    keywords: ["điện mặt trời", "BESS", "đầy 100 phần trăm", "điện dư", "bán lên lưới", "thiếu điện", "lấy điện từ lưới"],
  },
  {
    id: "preset-peak-shaving",
    title: "2. Cắt Đỉnh Giờ Cao Điểm (Peak Shaving) & Tối Ưu Chi Phí",
    category: "Peak Shaving",
    description: "Giải thích kỹ thuật cơ chế nạp xả thông minh để tránh giá điện cao điểm cho nhà xưởng và doanh nghiệp.",
    text: `Nhiều bạn hỏi mình: Tại sao nhà xưởng bắt buộc phải lắp thêm BESS cho hệ thống điện mặt trời?

Bí quyết nằm ở bài toán giá điện 3 giá! Ban ngày, điện mặt trời phát ra với chi phí gần như bằng không. Khi BESS nạp đầy 100 phần trăm vào buổi trưa, chúng ta sẽ có ngay nguồn năng lượng dự trữ dồi dào.

Đến khung giờ cao điểm từ 17 giờ đến 20 giờ tối, giá điện lưới tăng vọt. Thay vì phải lấy điện từ lưới với giá đắt đỏ, hệ thống sẽ tự động xả BESS ra bù đắp. Doanh nghiệp vừa giải quyết dứt điểm nỗi lo thiếu điện, vừa tiết kiệm hàng trăm triệu tiền điện mỗi tháng!`,
    durationEstimate: "~40 giây",
    keywords: ["điện mặt trời", "BESS", "đầy 100 phần trăm", "lấy điện từ lưới", "thiếu điện", "điện dư"],
  },
  {
    id: "preset-shorts-hook",
    title: "3. Kịch Bản Siêu Ngắn 30s Cho YouTube Shorts / Reels",
    category: "Shorts & Reels",
    description: "Nhịp điệu nhanh, cuốn hút ngay 3 giây đầu, ngắt nghỉ gãy gọn dành riêng cho video ngắn lan tỏa.",
    text: `Lắp điện mặt trời mà không có BESS thì cực kỳ lãng phí! Vì sao?

Bởi vì buổi trưa nắng to nhất, điện dư bạn dùng không hết mà chưa bán lên lưới được thì đành phải bỏ phí. Nhưng khi có pin lưu trữ BESS, chỉ cần nạp đến đầy 100 phần trăm, bạn đã tích trữ trọn vẹn nguồn năng lượng sạch này.

Đến tối khi mất điện hoặc thiếu điện, BESS tự động kích hoạt cấp nguồn êm ru mà không cần lấy điện từ lưới một kí-lô-oát-giờ nào!`,
    durationEstimate: "~28 giây",
    keywords: ["điện mặt trời", "BESS", "điện dư", "bán lên lưới", "đầy 100 phần trăm", "thiếu điện", "lấy điện từ lưới"],
  },
  {
    id: "preset-grid-overload",
    title: "4. Giải Quyết Nghẽn Mạch & Cắt Giảm Công Suất Lưới Điện",
    category: "Grid Overload",
    description: "Phân tích chuyên môn kỹ thuật điện về vai trò cân bằng tần số và chống quá tải máy biến áp.",
    text: `Trong kỹ thuật truyền tải, khi công suất điện mặt trời dồn vào đường dây quá lớn vào giữa trưa sẽ gây ra hiện tượng nghẽn lưới và tăng điện áp.

Giải pháp tối ưu nhất hiện nay chính là trạm BESS quy mô tập trung. Khi đường dây đạt giới hạn tải, lượng điện dư thay vì bị cắt giảm lãng phí sẽ được dồn vào nạp BESS đến đầy 100 phần trăm.

Khi phụ tải công nghiệp tăng vọt gây nguy cơ thiếu điện cục bộ, BESS sẽ xả ngược lại giúp ổn định tần số 50 Héc và giảm phụ thuộc vào việc phải lấy điện từ lưới điện than đắt đỏ!`,
    durationEstimate: "~45 giây",
    keywords: ["điện mặt trời", "BESS", "điện dư", "đầy 100 phần trăm", "thiếu điện", "lấy điện từ lưới"],
  },
  {
    id: "preset-zero-export",
    title: "5. Cơ Chế Zero-Export & Tự Dùng Điện Mặt Trời 100%",
    category: "Technical Guide",
    description: "Hướng dẫn kỹ thuật giải pháp bám tải kết hợp cảm biến Smart Meter và bộ lưu trữ BESS.",
    text: `Nếu khu vực của bạn chưa cho phép bán lên lưới, hệ thống điện mặt trời bám tải Zero Export kết hợp BESS chính là giải pháp sống còn.

Cảm biến đo đếm thông minh Smart Meter sẽ liên tục giám sát tải tiêu thụ. Nếu có điện dư phát sinh, Inverter sẽ điều hướng dòng điện nạp vào BESS cho tới khi đầy 100 phần trăm.

Vào ban đêm hoặc những ngày mưa âm u thiếu điện, toàn bộ tải trong nhà sẽ được cấp trực tiếp từ BESS. Bạn sẽ hạn chế tối đa việc phải lấy điện từ lưới điện quốc gia!`,
    durationEstimate: "~42 giây",
    keywords: ["bán lên lưới", "điện mặt trời", "BESS", "điện dư", "đầy 100 phần trăm", "thiếu điện", "lấy điện từ lưới"],
  },
];
