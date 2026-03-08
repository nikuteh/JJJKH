/**
 * Generates the iframe HTML for a Spotify track.
 * @param {string} trackId - The Spotify Song ID (e.g., from your dataset)
 * @returns {string} - Full HTML string for the iframe
 */
function createSpotifyEmbed(trackId) {
    const embedUrl = `https://open.spotify.com/embed/track/${trackId}?utm_source=generator`;
    
    return `
        <iframe 
            style="border-radius:12px" 
            src="${embedUrl}" 
            width="100%" 
            height="152" 
            frameBorder="0" 
            allowfullscreen="" 
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
            loading="lazy">
        </iframe>`;
}

// Select the elements from the DOM
const button = document.getElementById('load-song');
const container = document.getElementById('player-container');

// Mock data point from your dataset
const testSongId = "6jjYDGxVJsWS0a5wlVF5vS";

// Event listener to inject the embed on click
button.addEventListener('click', () => {
    container.innerHTML = createSpotifyEmbed(testSongId);
});