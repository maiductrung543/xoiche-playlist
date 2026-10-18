module.exports = async function handler(req, res) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30');

    try {
        const TARGET_URL = "https://xoiche.live";
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(TARGET_URL)}`;
        
        const response = await fetch(proxyUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        
        if (!response.ok) {
            return res.status(200).send(`#EXTM3U\n\n#EXTINF:-1, Không thể tải trang nguồn (${response.status})`);
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
            "AFRICA CUP OF NATIONS QUALIFICATION", "AFRICA CUP OF NATIONS QUALIFIERS", "AFRICA CUP OF NATIONS", 
            "AFCON QUALIFICATION", "AFCON QUALIFIERS", "AFCON", "WORLD CUP QUALIFICATION", "WORLD CUP QUALIFIERS", 
            "WC QUALIFICATION", "WC QUALIFIERS", "UEFA EURO QUALIFICATION", "EURO QUALIFICATION", 
            "UEFA NATIONS LEAGUE", "NATIONS LEAGUE", "SULTANLAR LIGI NỮ", "SULTANLAR LIGI", 
            "SV.LEAGUE NHẬT BẢN", "SV.LEAGUE", "SERIE A1 Ý", "SERIE A1", "TAURON LIGA BA LAN NỮ", "TAURON LIGA",
            "ELITESERIEN", "LIGA MX", "INDIAN SUPER LEAGUE", "ACL ELITE", "ELITE", "UEFA", "AFC", 
            "CÚP VÙNG VỊNH", "CUP VÙNG VỊNH", "GULF CUP", "CÚP QUỐC GIA", "CUP QUỐC GIA", "NATIONAL CUP",
            "ASIAD WOMEN", "ASIAD U23", "ASIAD", "ASIAN GAMES", "FF ASEAN CUP", "ASEAN CUP", "AFF CUP",
            "GIAO HỮU QT", "GIAO HỮU QUỐC TẾ", "GIAO HỮU CLB", "GIAO HỮU", "CLUB FRIENDLIES", "FRIENDLY",
            "V-LEAGUE 1", "V-LEAGUE 2", "V-LEAGUE", "V.LEAGUE 1", "V.LEAGUE 2", "V.LEAGUE",
            "PREMIER LEAGUE", "NGOẠI HẠNG ANH", "LA LIGA 2", "LA LIGA", "SERIE B", "SERIE A", 
            "BUNDESLIGA 2", "BUNDESLIGA", "LIGUE 2", "LIGUE 1", "CHAMPIONS LEAGUE", "CÚP C1", 
            "EUROPA LEAGUE", "CÚP C2", "CONFERENCE LEAGUE", "CÚP C3", "CÚP C4", "AFC CHAMPIONS LEAGUE", 
            "AFC CUP", "FA CUP", "CARABAO CUP", "CÚP NHÀ VUA", "COPPA ITALIA", "MLS", "SAUDI PRO LEAGUE", 
            "WORLD CUP", "FIFA WORLD CUP", "COPPA AMERICA", "EURO", "SIÊU CÚP", "SUPER CUP",
            "CÚP LIÊN ĐOÀN", "CUP LIÊN ĐOÀN", "HẠNG NHẤT ANH", "CHAMPIONSHIP", "J-LEAGUE", "J1 LEAGUE", 
            "K-LEAGUE", "THAI LEAGUE", "SPA D1", "SPA D2", "SPA D3", "ENG PR", "ENG CH", "ENG D1", "ENG D2", 
            "ITA A", "ITA B", "GER 1", "GER 2", "FRA 1", "FRA 2"
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

        // Tinh chỉnh làm sạch tên đội và xóa triệt để tên giải bị dính liền
        function extractCleanTeam(teamStr) {
            if (!teamStr) return "";
            let clean = teamStr;

            // Xóa tên giải đấu đứng ở đầu chuỗi (kể cả dính liền không khoảng trắng)
            const sortedLeagues = KNOWN_LEAGUES.slice().sort((x, y) => y.length - x.length);
            for (let lg of sortedLeagues) {
                let escapeLg = lg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                let regexLg = new RegExp(`^\\s*${escapeLg}\\s*`, "gi");
                clean = clean.replace(regexLg, '');
            }

            clean = ultraClean(clean);
            clean = clean.replace(/^[W|M]\s+/i, '');
            clean = clean.replace(/^(two|one|three|four|five|six|seven|eight|nine|ten)\b/gi, '');
            clean = clean.replace(/^\d{1,2}[:\-]?\d{0,2}\s*/g, '');
            clean = clean.replace(/\b(SPA\s*D[1-3]|ENG\s*(D[1-4]|Ch|PR)|ITA\s*[A-C]|GER\s*[1-3]|FRA\s*[1-3]|POR\s*[1-2]|ARG\s*D[1-2]|BRA\s*D[1-2]|MEX\s*D[1-2]|USA\s*MLS)\b/gi, ' ');
            clean = clean.replace(/\bBLV\b/gi, ''); // Xóa chữ BLV thừa

            return ultraClean(clean);
        }

        const matchDict = {};

        // Hàm trích xuất dữ liệu từ một chuỗi thô thu thập được
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

            // Chuẩn hóa tỷ số hoặc các phân tách trận đấu thành ' VS '
            text = text.replace(/\b\d{1,2}\s*[:\-]\s*\d{1,2}\b/g, ' VS ');
            text = text.replace(/\s+-\s+/g, ' VS ').replace(/\bvs\b/gi, ' VS ');
            text = text.replace(/\b\d{1,3}(\+\d+)?'/g, ' ');
            text = text.replace(/Trực tiếp|Trực Tiếp|Đang đá|Đang live|\bLIVE\b|Sắp diễn ra/ig, ' ');

            if (!text.includes("VS")) return;

            // Xóa tên giải đấu nằm trong chuỗi
            const sortedLeagues = KNOWN_LEAGUES.slice().sort((x, y) => y.length - x.length);
            for (let lg of sortedLeagues) {
                let escapeLg = lg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                let regexLg = new RegExp(`${escapeLg}`, "gi");
                text = text.replace(regexLg, ' ');
            }

            // Tìm bình luận viên
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
            let team1 = "", team2 = "";

            if (parts.length >= 2) { 
                team1 = extractCleanTeam(parts[0]); 
                team2 = extractCleanTeam(parts[1]); 
            } else { 
                return; 
            }
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

        // 1. Quét từ thẻ <a> chuẩn HTML
        const aTagRegex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gis;
        let match;
        while ((match = aTagRegex.exec(html)) !== null) {
            const href = match[1];
            let rawText = match[2].replace(/<[^>]*>/g, '').trim();
            processRawMatch(href, rawText);
        }

        // 2. Quét thêm từ cấu trúc Script/JSON động nhúng trong HTML (Bắt các trận ẩn / xem thêm)
        const jsonMatch = html.match(/<script[^>]*id=["']__NEXT_DATA__["'][^>]*>(.*?)<\/script>/s) || html.match(/window\.__INITIAL_STATE__\s*=\s*({.*?});/s);
        if (jsonMatch && jsonMatch[1]) {
            try {
                const data = JSON.parse(jsonMatch[1]);
                const strData = JSON.stringify(data);
                const matchMatches = strData.match(/{"id":[^}]*}/g) || [];
                for (let mItem of matchMatches) {
                    try {
                        let itemObj = JSON.parse(mItem);
                        if (itemObj.home_name && itemObj.away_name) {
                            let text = `${itemObj.home_name} VS ${itemObj.away_name}`;
                            if (itemObj.commentator_name) text += ` BLV ${itemObj.commentator_name}`;
                            let link = itemObj.slug ? `/tran-dau/${itemObj.slug}` : `/live/${itemObj.id}`;
                            processRawMatch(link, text);
                        }
                    } catch(e){}
                }
            } catch(e) {}
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
            ? "#EXTM3U\n\n#EXTINF:-1, Không tìm thấy trận đấu nào." 
            : "#EXTM3U\n\n" + results.join("\n\n");

        return res.status(200).send(finalM3U);

    } catch (error) {
        return res.status(200).send(`#EXTM3U\n\n#EXTINF:-1, Lỗi hệ thống: ${error.message}`);
    }
};
