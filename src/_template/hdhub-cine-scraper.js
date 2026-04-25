function getStreams(tmdbId, mediaType, seasonNum, episodeNum) {
    console.log(`[MyHDHubScraper] Starting for ${mediaType} ${tmdbId}`);

    return fetchTitle(tmdbId, mediaType)
        .then(title => {
            const query = encodeURIComponent(title.replace(/[^a-zA-Z0-9]/g, '+'));
            const searchUrls = [
                `https://hdhub4u.is/search/${query}`,
                `https://cineby.com/search/${query}`,
                `https://cineflix.net/search/${query}`
                // Add current mirrors from April 2026 threads if needed
            ];

            let allStreams = [];

            // Chain fetches for each site
            return Promise.all(searchUrls.map(url => {
                return fetch(url, {
                    headers: { 'User-Agent': 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36' }
                })
                .then(res => res.text())
                .then(html => {
                    // Extract direct mp4/mkv links (common on these sites)
                    const regex = /https?:\/\/[^\s"']+\.(mp4|mkv|avi|webm)/gi;
                    let matches = html.match(regex) || [];

                    matches.forEach(link => {
                        if (link.length > 50) {
                            allStreams.push({
                                name: "My HDHub/Cine Scraper",
                                title: `${title} \( {mediaType === 'tv' ? `S \){seasonNum}E${episodeNum}` : ''}`,
                                url: link,
                                quality: link.includes('1080') || link.includes('hq') ? '1080p' : '720p',
                                size: "Unknown",
                                headers: {}  // Add referer if needed later
                            });
                        }
                    });
                })
                .catch(() => {});  // Silent fail dead sites
            })).then(() => allStreams);
        })
        .catch(err => {
            console.error('[MyHDHubScraper] Error:', err);
            return [];
        });
}

function fetchTitle(tmdbId, mediaType) {
    const apiKey = "YOUR_FREE_TMDB_KEY";  // Register free at themoviedb.org
    return fetch(`https://api.themoviedb.org/3/\( {mediaType}/ \){tmdbId}?api_key=${apiKey}`)
        .then(res => res.json())
        .then(data => data.title || data.name || "Unknown");
}

module.exports = { getStreams };
