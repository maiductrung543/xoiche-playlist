module.exports = async function handler(req, res) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30');

    try {
        const TARGET_URL = "https://xoiche.live";
        // Thay đổi sang corsproxy.io giúp tốc độ load nhanh và ổn định hơn
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(TARGET_URL)}`;
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

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
            res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
            return res.end(`#EXTM3U\n\n#EXTINF:-1 group-title="Xôi Chè TV", Lỗi timeout kết nối nguồn\nhttp://invalid`);
        }
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
            return res.end(`#EXTM3U\n\n#EXTINF:-1 group-title="Xôi Chè TV", Không thể tải trang nguồn (${response.status})\nhttp://invalid`);
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

        const KNOWN_LEAGUES = [
            "AFRICA CUP OF NATIONS", "WORLD CUP", "UEFA EURO", "NATIONS LEAGUE", 
            "SULTANLAR LIGI", "SV.LEAGUE", "SERIE A1", "TAURON LIGA",
            "ELITESERIEN", "LIGA MX", "INDIAN SUPER LEAGUE", "ACL ELITE", "ELITE", "UEFA", "AFC", 
            "CÚP VÙNG VỊNH", "CUP VÙNG VỊNH", "GULF CUP", "CÚP QUỐC GIA", "CUP QUỐC GIA", "NATIONAL CUP",
            "ASIAD WOMEN", "ASIAD U23", "ASIAD", "ASIAN GAMES", "ASEAN CUP", "AFF CUP",
            "GIAO HỮU", "CLUB FRIENDLIES", "FRIENDLY", "V-LEAGUE", "V.LEAGUE",
            "PREMIER LEAGUE", "NGOẠI HẠNG ANH", "LA LIGA", "SERIE B", "SERIE A", 
            "BUNDESLIGA", "LIGUE 2", "LIGUE 1", "CHAMPIONS LEAGUE", "CÚP C1", 
            "EUROPA LEAGUE", "CÚP C2", "CONFERENCE LEAGUE", "CÚP C3", "CÚP C4", 
            "AFC CUP", "FA CUP", "CARABAO CUP", "COPPA ITALIA", "MLS", "SAUDI PRO LEAGUE", 
            "COPPA AMERICA", "EURO", "SUPER CUP", "HẠNG NHẤT ANH", "CHAMPIONSHIP", 
            "J-LEAGUE", "K-LEAGUE", "THAI LEAGUE", "SPA D1", "SPA D2", "SPA D3", 
            "ENG PR", "ENG CH", "ENG D1", "ENG D2", "ITA A", "ITA B", "GER 1", "GER 2", "FRA 1", "FRA 2"
        ];

        let mainSiteLogo = "https://cdn-icons-png.flaticon.com/512/8112/8112602.png";
        const logoMatch = html.match(/<img[^>]+src=["']([^"']*logo[^"']*)["'][^>]*>/i);
        if (logoMatch && logoMatch[1] && !logoMatch[1].includes('svg')) {
            let src = logoMatch[1];
            mainSiteLogo = src.startsWith('http') ? src : TARGET_URL + (src.startsWith('/') ? '' : '/') + src;
        }

        function ultraClean(str) {
            if (!str) return "";
            return str
                .replace(/[\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/gu, ' ')
                .replace(/^[^a-zA-Z0-9À-ỹ]+/g, '')
                .replace(/[^a-zA-Z0-9À-ỹ]+$/g, '')
                .replace(/\s+/g, ' ')
                .trim();
        }

        function extractCleanTeam(teamStr) {
            if (!teamStr) return "";
            let clean = teamStr;
            const sortedLeagues = KNOWN_LEAGUES.slice().sort((x, y) => y.length - x.length);
            for (let lg of sortedLeagues) {
                let escapeLg = lg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                let regexLg = new RegExp(`^\\s*${escapeLg}\\s*`, "gi");
                clean = clean.replace(regexLg, '');
            }
            clean = ultraClean(clean);
            clean = clean.replace(/^[W|M]\s+/i, '');
            clean = clean.replace(/^\d{1,2}[:\-]?\d{0,2}\s*/g, '');
            clean = clean.replace(/\bBLV\b/gi, '');
            return ultraClean(clean);
        }

        const matchDict = {};

        function processRawMatch(href, rawText) {
            if (!href || !rawText || rawText.length < 4) return;
            let text = rawText.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();

            let timeStr = "", dateStr = "";
            const timeMatch = text.match(/\b([0-1]?[0-9]|2[0-3]):([0-5][0-9])\b/);
            if (timeMatch) { 
                timeStr = timeMatch[0]; 
                text = text.replace(timeStr, ' '); 
            }
            const dateMatch = text.match(/\b(\d{1,2})[/-\s](\d{1,2})\b/);
            if (dateMatch) { 
                dateStr = `${dateMatch[1]}/${dateMatch[2]}`; 
                text = text.replace(dateMatch[0], ' '); 
            }
            text = text.replace(/\b202\d\b/g, ' '); 

            text = text.replace(/\b\d{1,2}\s*[:\-]\s*\d{1,2}\b/g, ' VS ');
            text = text.replace(/\s+-\s+/g, ' VS ').replace(/\bvs\b/gi, ' VS ');
            text = text.replace(/\b\d{1,3}(\+\d+)?'/g, ' ');
            text = text.replace(/Trực tiếp|Trực Tiếp|Đang đá|Đang live|\bLIVE\b|Sắp diễn ra/ig, ' ');

            if (!text.includes("VS")) return;

            const sortedLeagues = KNOWN_LEAGUES.slice().sort((x, y) => y.length - x.length);
            for (let lg of sortedLeagues) {
                let escapeLg = lg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                let regexLg = new RegExp(`${escapeLg}`, "gi");
                text = text.replace(regexLg, ' ');
            }

            let foundBlvs = [];
            const sortedBlvs = Object.keys(blvStreamMap).sort((x, y) => y.length - x.length);
            for (let blv of sortedBlvs) {
                let escapeBlv = blv.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                let regex = new RegExp(`(BLV\\s*)?(${escapeBlv})`, "gi");
                if (regex.test(text)) {
                    let stdName = (blv === "Gà") ? "Gà Rừng" : (blv === "Pháo") ? "Pháo Thủ" : blv;
                    if (!foundBlvs.includes(stdName)) foundBlvs.push(stdName);
                    text = text.replace(regex, ' '); 
                }
            }

            const garbageWords = [
                "Nghỉ giữa hiệp", "Nghỉ giữa trận", "Đang diễn ra", "Đang đá", 
                "Hiệp 1", "Hiệp 2", "HT", "FT", "CƯỢC", "FB88", "8Xbet", 
                "SV368", "Nhà đài", "Tất cả", "Trận hot", "BLV"
            ];
            for (let g of garbageWords) {
                text = text.replace(new RegExp(`(^|\\s)${g}(\\s|$)`, "ig"), ' ');
            }
            
            text = text.replace(/[\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/gu, ' ');
            text = text.replace(/\s+/g, ' ').trim();

            let parts = text.split('VS').map(p => ultraClean(p)).filter(p => p.length > 0);
            if (parts.length < 2) return;
            
            let team1 = extractCleanTeam(parts[0]);
            let team2 = extractCleanTeam(parts[1]);
            if (!team1 || !team2) return; 

            let timeDateDisplay = timeStr;
            if (timeStr && dateStr) timeDateDisplay = `${timeStr} - ${dateStr}`;
            else if (!timeStr && dateStr) timeDateDisplay = dateStr;

            const formattedTeams = `${team1} VS ${team2}`;
            const dictKey = `${team1} VS ${team2} - ${timeDateDisplay}`;
            const fullUrl = href.startsWith('http') ? href : (href.startsWith('/') ? TARGET_URL + href : TARGET_URL + '/' + href);

            if (!matchDict[dictKey]) {
                matchDict[dictKey] = { 
                    timeDate: timeDateDisplay, teams: formattedTeams,
                    blvs: foundBlvs, fallbackUrl: fullUrl 
                };
            } else {
                for (let b of foundBlvs) {
                    if (!matchDict[dictKey].blvs.includes(b)) matchDict[dictKey].blvs.push(b);
                }
            }
        }

        const aTagRegex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gis;
        let match;
        let count = 0;
        while ((match = aTagRegex.exec(html)) !== null && count < 250) {
            count++;
            processRawMatch(match[1], match[2].replace(/<[^>]*>/g, '').trim());
        }

        const results = [];
        const vlcOpt = "#EXTVLCOPT:http-user-agent=Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36";
        const groupTitle = "Xôi Chè TV";

        for (let key in matchDict) {
            const data = matchDict[key];
            const timeStr = data.timeDate ? `[${data.timeDate}] ` : "";

            if (data.blvs.length > 0) {
                data.blvs.forEach(blv => {
                    const streamUrl = blvStreamMap[blv] || data.fallbackUrl;
                    results.push(`#EXTINF:-1 group-title="${groupTitle}" tvg-logo="${mainSiteLogo}", ${timeStr}${data.teams} (BLV ${blv})\n${vlcOpt}\n${streamUrl}`);
                });
            } else {
                results.push(`#EXTINF:-1 group-title="${groupTitle}" tvg-logo="${mainSiteLogo}", ${timeStr}${data.teams}\n${vlcOpt}\n${data.fallbackUrl}`);
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
