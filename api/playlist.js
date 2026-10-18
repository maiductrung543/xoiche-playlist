module.exports = async function handler(req, res) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30');

    try {
        const TARGET_URL = "https://xoiche.live";
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(TARGET_URL)}`;
        
        // Thêm cơ chế chống treo/timeout (giới hạn 7 giây)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 7000);

        let response;
        try {
            response = await fetch(proxyUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                signal: controller.signal
            });
        } catch (e) {
            clearTimeout(timeoutId);
            return res.status(200).send(`#EXTM3U\n\n#EXTINF:-1 group-title="Xôi Chè TV", Lỗi kết nối timeout trang nguồn\nhttp://invalid`);
        }
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            return res.status(200).send(`#EXTM3U\n\n#EXTINF:-1 group-title="Xôi Chè TV", Không thể tải trang nguồn (${response.status})\nhttp://invalid`);
        }

        const html = await response.text();
        
        const blvStreamMap = {
            "KaKa": "https://luong.phaohoa.live/live/phaohoa7/index.m3u8",
            "Tiểu Mây": "https://luong.phaohoa.live/live/phaohoa9/index.m3u8",
            "Văn Minh": "https://luong.phaohoa.live/live/phaohoa3/index.m3u8",
            "Người Kiến": "https://luong.phaohoa.live/live/phaohoa1/index.m3u8",
            "Famy": "https://luong.phaohoa.live/live/phaohoa6/index.m3u8",
            "Pháo Thủ": "https://luong.phaohoa.live/live/phaohoa4/index.m3u8",
            "Pháo": "https://luong.phaohoa.live/live/phaohoa4/index.m3u8",
            "Chim Nhỏ": "https://luong.phaohoa.live/live/phaohoa5/index.m3u8",
            "Văn Tài": "https://live.xoiche.tv/hls/vantai/index.m3u8",
            "Lee Sin": "https://luong.phaohoa.live/live/phaohoa10/index.m3u8",
            "Gà Rừng": "https://livecdn.cdnfastter.xyz/live/livehub4/index.m3u8",
            "Gà": "https://livecdn.cdnfastter.xyz/live/livehub4/index.m3u8",
            "Enzo": "https://luong.phaohoa.live/live/phaohoa2/index.m3u8",
            "Kền Kền": "https://luong.phaohoa.live/live/phaohoa6/index.m3u8",
            "Táo Dai": "https://livecdn.cdnfastter.xyz/live/livehub1/index.m3u8",
            "Xôi Gấc": "https://live.khoga.space/live/livehub11/index.m3u8",
            "Tam Mao": "https://live.khoga.space/live/livehub8/index.m3u8",
            "Khô Cay": "https://live.khoga.space/live/livehub9/index.m3u8",
            "Xôi Bắp": "https://live.khoga.space/live/livehub6/index.m3u8",
            "Tày": "https://live.khoga.space/live/livehub10/index.m3u8",
            "Khô Mật": "https://live.khoga.space/live/livehub13/index.m3u8",
            "Khô Chè": "https://live.khoga.space/live/livehub5/index.m3u8",
            "Khô Bò": "https://live.khoga.space/live/livehub12/index.m3u8",
            "Xôi Gà": "https://live.khoga.space/live/livehub2/index.m3u8",
            "Xôi Xoài": "https://live.khoga.space/live/livehub3/index.m3u8"
        };

        const KNOWN_LEAGUES =
