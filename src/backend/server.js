const sqlite3 = require('sqlite3').verbose();

const dbChords = new sqlite3.Database('./chord.db');

const dbSentiment = new sqlite3.Database('./sentiment.db');
// /**
//  * data.js — Chordle song & chord data
//  *
//  * 🔌 API INTEGRATION NOTE:
//  * Replace the SONGS array with a fetch() call to your backend.
//  * Each song object matches the shape your Spotify + chord dataset returns.
//  * Fields like `spotifyId` and `albumArt` are ready to wire in.
//  *
//  * Example swap:
//  *   const SONGS = await fetch('/api/songs').then(r => r.json());
//  */

// const SONGS = [
//   {
//     id: "1",
//     title: "Let Her Go",
//     artist: "Passenger",
//     mood: "Melancholic",
//     moodEmoji: "🌧",
//     key: "A minor",
//     bpm: 96,
//     albumArt: null,       // swap with Spotify album art URL
//     spotifyId: null,      // swap with Spotify track ID
//     completed: { verse: false, chorus: false, bridge: false },
//     sections: {
//       verse: {
//         label: "Verse",
//         emoji: "🎵",
//         sentiment: "Quiet & introspective",
//         correctOrder: ["Am", "F", "C", "G"],
//         bank: ["Am", "F", "C", "G", "Em", "Dm", "E"],
//       },
//       chorus: {
//         label: "Chorus",
//         emoji: "🎶",
//         sentiment: "Soaring & cathartic",
//         correctOrder: ["F", "C", "G", "Am"],
//         bank: ["F", "C", "G", "Am", "Dm", "Em", "Bb"],
//       },
//       bridge: {
//         label: "Bridge",
//         emoji: "🌉",
//         sentiment: "Tense & unresolved",
//         correctOrder: ["Am", "G", "F", "E"],
//         bank: ["Am", "G", "F", "E", "C", "Dm", "Bb"],
//       },
//     },
//   },
//   {
//     id: "2",
//     title: "Blackbird",
//     artist: "The Beatles",
//     mood: "Hopeful",
//     moodEmoji: "🌤",
//     key: "G major",
//     bpm: 96,
//     albumArt: null,
//     spotifyId: null,
//     completed: { verse: false, chorus: false, bridge: false },
//     sections: {
//       verse: {
//         label: "Verse",
//         emoji: "🎵",
//         sentiment: "Gentle & yearning",
//         correctOrder: ["G", "Am", "G", "C"],
//         bank: ["G", "Am", "C", "D", "Em", "F", "Bm"],
//       },
//       chorus: {
//         label: "Chorus",
//         emoji: "🎶",
//         sentiment: "Uplifting & free",
//         correctOrder: ["C", "G", "Am", "F"],
//         bank: ["C", "G", "Am", "F", "Dm", "Em", "Bb"],
//       },
//       bridge: {
//         label: "Bridge",
//         emoji: "🌉",
//         sentiment: "Floating & resolved",
//         correctOrder: ["Am", "D", "G", "Em"],
//         bank: ["Am", "D", "G", "Em", "C", "F", "Bm"],
//       },
//     },
//   },
//   {
//     id: "3",
//     title: "Fast Car",
//     artist: "Tracy Chapman",
//     mood: "Bittersweet",
//     moodEmoji: "🚗",
//     key: "C# major",
//     bpm: 101,
//     albumArt: null,
//     spotifyId: null,
//     completed: { verse: false, chorus: false, bridge: false },
//     sections: {
//       verse: {
//         label: "Verse",
//         emoji: "🎵",
//         sentiment: "Driving & nostalgic",
//         correctOrder: ["C#", "G#", "A#", "F#"],
//         bank: ["C#", "G#", "A#", "F#", "Fm", "Bbm", "Db"],
//       },
//       chorus: {
//         label: "Chorus",
//         emoji: "🎶",
//         sentiment: "Urgent & longing",
//         correctOrder: ["A#", "F#", "C#", "G#"],
//         bank: ["A#", "F#", "C#", "G#", "Dm", "Em", "Bb"],
//       },
//       bridge: {
//         label: "Bridge",
//         emoji: "🌉",
//         sentiment: "Raw & resigned",
//         correctOrder: ["F#", "C#", "G#", "A#"],
//         bank: ["F#", "C#", "G#", "A#", "Fm", "Bbm", "Ab"],
//       },
//     },
//   },
// ];

// /**
//  * CHORD COLORS
//  * Each chord gets a deterministic warm color based on its name.
//  * These are intentionally earthy — no Duolingo greens.
//  */
// const CHORD_COLORS = [
//   { bg: "#f5e6c8", text: "#7a4a10", border: "#d4a45c", shadow: "#b8842a" },
//   { bg: "#e8d5b8", text: "#5c3a1e", border: "#c4a070", shadow: "#9a7040" },
//   { bg: "#dce8d0", text: "#3d5c28", border: "#90b870", shadow: "#6a9048" },
//   { bg: "#e8d8cc", text: "#6a3a22", border: "#c49080", shadow: "#a06050" },
//   { bg: "#f0e2c8", text: "#6a4c1a", border: "#d8b878", shadow: "#b09040" },
//   { bg: "#d8e5d8", text: "#2e5030", border: "#88aa88", shadow: "#608060" },
//   { bg: "#eeddd0", text: "#7a4030", border: "#cca088", shadow: "#a07050" },
// ];

// /**
//  * Returns a consistent color object for a given chord string.
//  * Pure function — safe to call from anywhere.
//  */
// function getChordColor(chord) {
//   let h = 0;
//   for (let i = 0; i < chord.length; i++) {
//     h = (h * 31 + chord.charCodeAt(i)) % CHORD_COLORS.length;
//   }
//   return CHORD_COLORS[h];
// }

// /**
//  * PROGRESS DATA
//  * Swap this with a real user profile API call.
//  */
// const PROGRESS_DATA = [
//   { mood: "😢 Melancholic", songs: "8 songs", pct: 72 },
//   { mood: "🌤 Hopeful",     songs: "5 songs", pct: 45 },
//   { mood: "🔥 Tense",       songs: "3 songs", pct: 30 },
// ];