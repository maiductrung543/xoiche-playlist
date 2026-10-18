module.exports = async function handler(req, res) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30');

    try {
        const TARGET_URL = "https://xoiche.live";
        // Gọi thẳng vào API JSON trận đấu của xoiche.live
        const API_URL = "https://xoiche.live/api/matches?type=all";

        const response = await fetch(API_URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Referer': 'https://xoiche.live/',
                'Accept': 'application/json, text/plain, */*'
            }
        });

        let matchesList = [];

        if (response.ok) {
            const data = await response.json();
            matchesList = data?.data || data?.matches || (Array.isArray(data) ? data : []);
        }

        // Nếu API trả về trống hoặc lỗi, fallback cào dữ liệu từ trang chính
        if (!matchesList || matchesList.length === 0) {
            const htmlRes = await fetch(TARGET_URL, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
            });
            if (htmlRes.ok) {
                const html = await htmlRes.text();
                const nextDataMatch = html.match(/<script[^>]*id=["']__NEXT_DATA__["'][^>]*>(.*?)<\/script>/s);
                if (nextDataMatch && nextDataMatch[1]) {
                    try {
                        const parsed = JSON.parse(nextDataMatch[1]);
                        const props = parsed?.props?.pageProps;
                        matchesList = props?.matches || props?.hotMatches || props?.data?.matches || [];
                    } catch (e) {}
                }
            }
        }

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

        function cleanTeamName(name) {
            if (!name) return "";
            return name
                .replace(/^BLV\s+/gi, '')
                .replace(/[\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/gu, '')
                .trim();
        }

        const results = [];
        const mainSiteLogo = "https://cdn-icons-png.flaticon.com/512/8112/8112602.png";
        const vlcOpt = "#EXTVLCOPT:http-user-agent=Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36";
        const groupTitle = "Xôi Chè TV";

        if (matchesList && matchesList.length > 0) {
            for (let m of matchesList) {
                let home = cleanTeamName(m.home_name || m.homeTeam?.name || m.home);
                let away = cleanTeamName(m.away_name || m.awayTeam?.name || m.away);
                if (!home || !away) continue;

                let timeStr = m.match_time || m.time || "";
                let dateStr = m.match_date || m.date || "";
                
                // Định dạng hiển thị thời gian [Giờ - Ngày]
                let timeDateDisplay = "";
                if (timeStr && dateStr) {
                    timeDateDisplay = `[${timeStr} - ${dateStr.replace('-', '/')}] `;
                } else if (timeStr) {
                    timeDateDisplay = `[${timeStr}] `;
                }

                let blvName = m.commentator_name || m.blv_name || m.blv || "";
                let slug = m.slug || m.id;
                let fallbackUrl = slug ? `https://xoiche.live/tran-dau/${slug}` : TARGET_URL;

                let foundBlv = null;
                if (blvName) {
                    const sortedBlvs = Object.keys(blvStreamMap).sort((x, y) => y.length - x.length);
                    for (let b of sortedBlvs) {
                        if (blvName.toLowerCase().includes(b.toLowerCase())) {
                            foundBlv = (b === "Gà") ? "Gà Rừng" : (b === "Pháo") ? "Pháo Thủ" : b;
                            break;
                        }
                    }
                }

                if (foundBlv) {
                    const streamUrl = blvStreamMap[foundBlv] || fallbackUrl;
                    results.push(`#EXTINF:-1 group-title="${groupTitle}" tvg-logo="${mainSiteLogo}", ${timeDateDisplay}${home} VS ${away} (BLV ${foundBlv})\n${vlcOpt}\n${streamUrl}`);
                } else {
                    results.push(`#EXTINF:-1 group-title="${groupTitle}" tvg-logo="${mainSiteLogo}", ${timeStr}${home} VS ${away}\n${vlcOpt}\n${fallbackUrl}`);
                }
            }
        }

        const finalM3U = results.length === 0 
            ? `#EXTM3U\n\n#EXTINF:-1 group-title="${groupTitle}", Không tìm thấy trận đấu nào.\nhttp://invalid` 
            : "#EXTM3U\n\n" + results.join("\n\n");

        res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
        return res.end(finalM3U);

    } catch (error) {
        res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
        return res.end(`#EXTM3U\n\n#EXTINF:-1 group-title="Xôi Chè TV", Lỗi hệ thống: ${error.message}\nhttp://invalid`);
    }
};
