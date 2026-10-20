module.exports = async function handler(req, res) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30');

    try {
        const TARGET_URL = "https://xoiche.live";
        
        // Thêm các header giả lập trình duyệt thật để vượt qua lớp kiểm tra cơ bản của Cloudflare
        const response = await fetch(TARGET_URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
                'Accept-Encoding': 'gzip, deflate, br',
                'Referer': 'https://xoiche.live/',
                'Sec-Ch-Ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
                'Sec-Ch-Ua-Mobile': '?0',
                'Sec-Ch-Ua-Platform': '"Windows"',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'same-origin',
                'Sec-Fetch-User': '?1',
                'Upgrade-Insecure-Request': '1'
            }
        });

        // Nếu bị chặn hoặc lỗi mạng, trả về M3U rỗng thay vì hiện thông báo lỗi lên TV
        if (!response.ok) {
            res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
            return res.end(`#EXTM3U\n`);
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
            "Khô Mật": "https://live.khoga.space/live/livehub15/index.m3u8",
            "Khô Chè": "https://live.khoga.space/live/livehub5/index.m3u8",
            "Khô Bò": "https://live.khoga.space/live/livehub12/index.m3u8",
            "Xôi Gà": "https://live.khoga.space/live/livehub2/index.m3u8",
            "Xôi Xoài": "https://live.khoga.space/live/livehub3/index.m3u8"
        };

        const KNOWN_LEAGUES = [
            "AFC CHALLENGE LEAGUE", "CHALLENGE LEAGUE", "PRIMERA A", "LIGA 1", "LIGA 2",
            "SAUDI LEAGUE", "SAUDI PRO LEAGUE", "LIGA IU", "LIGA I", "LIGA II", "LIGA MX", "LIGA",
            "AFRICA CUP OF NATIONS QUALIFICATION", "AFRICA CUP OF NATIONS QUALIFIERS", "AFRICA CUP OF NATIONS", 
            "AFCON QUALIFICATION", "AFCON QUALIFIERS", "AFCON", "WORLD CUP QUALIFICATION", "WORLD CUP QUALIFIERS", 
            "WC QUALIFICATION", "WC QUALIFIERS", "UEFA EURO QUALIFICATION", "EURO QUALIFICATION", 
            "UEFA NATIONS LEAGUE", "NATIONS LEAGUE", "SULTANLAR LIGI NỮ", "SULTANLAR LIGI", 
            "SV.LEAGUE NHẬT BẢN", "SV.LEAGUE", "SERIE A1 Ý", "SERIE A1", "TAURON LIGA BA LAN NỮ", "TAURON LIGA",
            "ELITESERIEN", "INDIAN SUPER LEAGUE", "SUPER LEAGUE", "ACL ELITE", "ELITE", "UEFA", "AFC", 
            "CÚP VÙNG VỊNH", "CUP VÙNG VỊNH", "GULF CUP", "CÚP QUỐC GIA", "CUP QUỐC GIA", "NATIONAL CUP",
            "ASIAD WOMEN", "ASIAD U23", "ASIAD", "ASIAN GAMES", "FF ASEAN CUP", "ASEAN CUP", "AFF CUP",
            "GIAO HỮU QT", "GIAO HỮU QUỐC TẾ", "GIAO HỮU CLB", "GIAO HỮU", "CLUB FRIENDLIES", "FRIENDLY",
            "V-LEAGUE 1", "V-LEAGUE 2", "V-LEAGUE", "V.LEAGUE 1", "V.LEAGUE 2", "V.LEAGUE",
            "PREMIER LEAGUE", "NGOẠI HẠNG ANH", "LA LIGA 2", "LA LIGA", "SERIE B", "SERIE A", 
            "BUNDESLIGA 2", "BUNDESLIGA", "LIGUE 2", "LIGUE 1", "CHAMPIONS LEAGUE", "CÚP C1", 
            "EUROPA LEAGUE", "CÚP C2", "CONFERENCE LEAGUE", "CÚP C3", "CÚP C4", "AFC CHAMPIONS LEAGUE", 
            "AFC CUP", "FA CUP", "CARABAO CUP", "CÚP NHÀ VUA", "COPPA ITALIA", "MLS", 
            "WORLD CUP", "FIFA WORLD CUP", "COPPA AMERICA", "EURO", "SIÊU CÚP", "SUPER CUP",
            "CÚP LIÊN ĐOÀN", "CUP LIÊN ĐOÀN", "HẠNG NHẤT ANH", "CHAMPIONSHIP", "J-LEAGUE", "J1 LEAGUE", 
            "K-LEAGUE", "THAI LEAGUE", "EREDIVISIE", "PRIMEIRA LIGA", "SPA D1", "SPA D2", "SPA D3", 
            "ENG PR", "ENG CH", "ENG D1", "ENG D2", "ITA A", "ITA B", "GER 1", "GER 2", "FRA 1", "FRA 2"
        ];

        let mainSiteLogo = "https://cdn-icons-png.flaticon.com/512/8112/8112602.png";
        const logoMatch = html.match(/<img[^>]+src=["']([^"']*logo[^"']*)["'][^>]*>/i);
        if (logoMatch && logoMatch[1] && !logoMatch[1].includes('svg')) {
            let src = logoMatch[1];
            mainSiteLogo = src.startsWith('http') ? src : TARGET_URL + (src.startsWith('/') ? '' : '/') + src;
        }

        function decodeHTMLEntities(text) {
            if (!text) return "";
            return text
                .replace(/&#(\d+);/g, (m, dec) => String.fromCharCode(dec))
                .replace(/&#x([0-9a-f]+);/gi, (m, hex) => String.fromCharCode(parseInt(hex, 16)))
                .replace(/&quot;/g, '"')
                .replace(/&apos;/g, "'")
                .replace(/&#39;/g, "'")
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>');
        }

        function ultraClean(str) {
            if (!str) return "";
            let cleaned = decodeHTMLEntities(str);
            return cleaned
                .replace(/^\s*\d+;\s*/g, '')
                .replace(/^[a-z]+;\s*/gi, '')
                .replace(/[\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/gu, ' ')
                .replace(/^[^a-zA-Z0-9À-ỹ]+/g, '')
                .replace(/[^a-zA-Z0-9À-ỹ]+$/g, '')
                .replace(/\s+/g, ' ')
                .trim();
        }

        function extractCleanTeam(teamStr) {
            if (!teamStr) return "";
            let clean = decodeHTMLEntities(teamStr);
            clean = clean.replace(/([a-z])([A-Z])/g, '$1 $2');

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
            
            // Loại bỏ chữ/logo "AD" đứng độc lập ở đầu tên đội bóng
            clean = clean.replace(/^AD\s+/i, '');

            return ultraClean(clean);
        }

        const matchDict = {};

        function addMatchToDict(href, team1Raw, team2Raw, timeVal, dateVal, blvNameRaw) {
            let team1 = extractCleanTeam(team1Raw);
            let team2 = extractCleanTeam(team2Raw);
            if (!team1 || !team2) return;

            let timeDisplay = timeVal || "";
            let dateDisplay = dateVal ? dateVal.replace('-', '/') : "";

            let timeDateDisplay = "";
            if (timeDisplay && dateDisplay) {
                timeDateDisplay = `${timeDisplay} - ${dateDisplay}`;
            } else if (timeDisplay) {
                timeDateDisplay = timeDisplay;
            } else if (dateDisplay) {
                timeDateDisplay = dateDisplay;
            }

            let foundBlvs = [];
            if (blvNameRaw) {
                let cleanBlv = blvNameRaw.replace(/BLV\s*/gi, '').trim();
                const sortedBlvs = Object.keys(blvStreamMap).sort((x, y) => y.length - x.length);
                for (let b of sortedBlvs) {
                    if (cleanBlv.toLowerCase().includes(b.toLowerCase())) {
                        let stdName = (b === "Gà") ? "Gà Rừng" : (b === "Pháo") ? "Pháo Thủ" : b;
                        if (!foundBlvs.includes(stdName)) foundBlvs.push(stdName);
                    }
                }
            }

            const formattedTeams = `${team1} VS ${team2}`;
            const dictKey = `${team1} VS ${team2} - ${timeDateDisplay}`;
            const fullUrl = href ? (href.startsWith('http') ? href : (href.startsWith('/') ? TARGET_URL + href : TARGET_URL + '/' + href)) : TARGET_URL;

            if (!matchDict[dictKey]) {
                matchDict[dictKey] = { 
                    timeDate: timeDateDisplay, 
                    teams: formattedTeams,
                    blvs: foundBlvs, 
                    fallbackUrl: fullUrl 
                };
            } else {
                for (let b of foundBlvs) {
                    if (!matchDict[dictKey].blvs.includes(b)) matchDict[dictKey].blvs.push(b);
                }
            }
        }

        // 1. Trích xuất thông minh từ Next.js Data ngầm (sử dụng đệ quy để quét sâu vào JSON)
        const nextDataMatch = html.match(/<script[^>]*id=["']__NEXT_DATA__["'][^>]*>(.*?)<\/script>/s);
        if (nextDataMatch && nextDataMatch[1]) {
            try {
                const nextData = JSON.parse(nextDataMatch[1]);
                function findMatchesRecursive(obj) {
                    if (!obj || typeof obj !== 'object') return;
                    if (obj.home_name && obj.away_name) {
                        addMatchToDict(
                            obj.slug ? `/tran-dau/${obj.slug}` : (obj.id ? `/tran-dau/${obj.id}` : '/'), 
                            obj.home_name, 
                            obj.away_name, 
                            obj.match_time || obj.time, 
                            obj.match_date || obj.date, 
                            obj.commentator_name || obj.blv
                        );
                    }
                    for (let key in obj) {
                        if (obj.hasOwnProperty(key)) {
                            findMatchesRecursive(obj[key]);
                        }
                    }
                }
                if (nextData?.props?.pageProps) {
                    findMatchesRecursive(nextData.props.pageProps);
                }
            } catch (e) {}
        }

        // 2. Quét HTML thô dự phòng
        const blockRegex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gis;
        let match;
        while ((match = blockRegex.exec(html)) !== null) {
            const href = match[1];
            let rawText = decodeHTMLEntities(match[2].replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();

            let timeMatch = rawText.match(/\b([0-1]?[0-9]|2[0-3]):([0-5][0-9])\b/);
            let dateMatch = rawText.match(/\b(\d{1,2})[/-\s](\d{1,2})\b/);
            let timeStr = timeMatch ? timeMatch[0] : "";
            let dateStr = dateMatch ? `${dateMatch[1]}/${dateMatch[2]}` : "";

            let text = rawText;
            if (timeStr) text = text.replace(timeStr, ' ');
            if (dateMatch) text = text.replace(dateMatch[0], ' ');

            text = text.replace(/\b\d{1,2}\s*[:\-]\s*\d{1,2}\b/g, ' VS ');
            text = text.replace(/\s+-\s+/g, ' VS ').replace(/\bvs\b/gi, ' VS ');
            text = text.replace(/\b\d{1,3}(\+\d+)?'/g, ' ');
            text = text.replace(/Trực tiếp|Trực Tiếp|Đang đá|Đang live|\bLIVE\b|Sắp diễn ra/ig, ' ');

            if (!text.includes("VS")) continue;

            const sortedLeagues = KNOWN_LEAGUES.slice().sort((x, y) => y.length - x.length);
            for (let lg of sortedLeagues) {
                let escapeLg = lg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                text = text.replace(new RegExp(`${escapeLg}`, "gi"), ' ');
            }

            let foundBlv = "";
            const sortedBlvs = Object.keys(blvStreamMap).sort((x, y) => y.length - x.length);
            for (let blv of sortedBlvs) {
                let escapeBlv = blv.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                let regex = new RegExp(`(BLV\\s*)?(${escapeBlv})`, "gi");
                if (regex.test(text)) {
                    foundBlv = blv;
                    text = text.replace(regex, ' ');
                }
            }

            const garbageWords = ["Nghỉ giữa hiệp", "Nghỉ giữa trận", "Đang diễn ra", "Đang đá", "Hiệp 1", "Hiệp 2", "HT", "FT", "CƯỢC", "FB88", "8Xbet", "SV368", "Nhà đài", "Tất cả", "Trận hot", "BLV"];
            for (let g of garbageWords) {
                text = text.replace(new RegExp(`(^|\\s)${g}(\\s|$)`, "ig"), ' ');
            }

            let parts = text.split('VS').map(p => ultraClean(p)).filter(p => p.length > 0);
            if (parts.length >= 2) {
                addMatchToDict(href, parts[0], parts[1], timeStr, dateStr, foundBlv);
            }
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
        return res.end(`#EXTM3U\n`);
    }
};
