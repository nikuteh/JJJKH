const sqlite3 = require('sqlite3').verbose();
const express = require('express');
const { engine } = require('express-handlebars'); // New import
const path = require('path');
const session = require('express-session');

const app = express();
const PORT = 3000;

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));

// This builds an absolute path starting from src/backend/
const dbPath = path.join(__dirname, '..', 'db', 'music_data.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Failed to connect to the database:", err.message);
    } else {
        console.log("Connected to music_data.db");
    }
});

// Resolve paths
const frontendPath = path.join(__dirname, '..', 'frontend');

// --- HANDLEBARS SETUP ---
app.engine('hbs', engine({ extname: '.hbs' }));
app.set('view engine', 'hbs');
app.set('views', frontendPath); // Tell Express where index.hbs lives

// Serve CSS and JS
app.use(express.static(frontendPath));

//helper function/middleware for random picking (so main route and /api/get-lesson don't pick different songs)
function getRandomSongFromDB(callback) {
  const sql = `
    SELECT
        c.chords, 
        c.spotify_song_id AS spotifyId, 
        s.track AS title, 
        s.artist, 
        CASE
            WHEN s.valence_tags > 4.26 AND s.arousal_tags > 3.69 THEN 'Upbeat'
            WHEN s.valence_tags < 4.26 AND s.arousal_tags > 3.69 THEN 'Intense'
            WHEN s.valence_tags < 4.26 AND s.arousal_tags < 3.69 THEN 'Somber'
            WHEN s.valence_tags > 4.26 AND s.arousal_tags < 3.69 THEN 'Peaceful'
            ELSE 'Neutral'
        END AS 'sentiment'
    FROM chords c
    JOIN sentiment s ON c.spotify_song_id = s.spotify_id
    WHERE c.chords IS NOT NULL AND c.chords LIKE '%<%>%'
    ORDER BY RANDOM()
    LIMIT 1
  `;

  db.get(sql, [], (err, song) => {
    if (err || !song) return callback(err, null);

    // 2. Get 3 similar songs based on the sentiment we just calculated
    const recSql = `
      SELECT track AS title, artist, spotify_id AS spotifyId
      FROM sentiment
      WHERE spotify_id != ? 
      AND (
        CASE
            WHEN valence_tags > 4.26 AND arousal_tags > 3.69 THEN 'Upbeat'
            WHEN valence_tags < 4.26 AND arousal_tags > 3.69 THEN 'Intense'
            WHEN valence_tags < 4.26 AND arousal_tags < 3.69 THEN 'Somber'
            WHEN valence_tags > 4.26 AND arousal_tags < 3.69 THEN 'Peaceful'
            ELSE 'Neutral'
        END
      ) = ?
      ORDER BY RANDOM()
      LIMIT 3
    `;

    db.all(recSql, [song.spotifyId, song.sentiment], (recErr, recs) => {
      if (recErr) {
        song.recommendations = [];
      } else {
        song.recommendations = recs;
      }
      
      // 3. Return the song object now containing its own recommendations
      callback(null, song);
    });
  });
}
// --- THE MAIN ROUTE ---
//render random song 
app.get('/', (req, res) => {
  getRandomSongFromDB((err, row) => {
    if (err || !row) {
      console.error('DB error:', err?.message);
      return res.status(500).send('Could not load page');
    }

    // 1. Store the whole object (including recommendations) in the session
    req.session.currentLessonSong = row;

    // 2. Explicitly save the session before rendering the page
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).send("Session error");
      }
      // 3. Now render. The frontend can safely fetch /api/get-lesson now.
      res.render('index', {
        SongID: row.spotifyId,
        layout: false
      });
    });
  });
});

// get random song
app.get('/api/get-lesson', (req, res) => {
    const row = req.session.currentLessonSong;

    if (!row) {
        return res.status(404).json({ error: 'No lesson song selected yet' });
    }

    // parse the sections from the "chords" column
    const sectionRegex = /<([^>]+)>\s*([^<]+)/g;
    const sections = {};
    let match;
    let totalChordsProcessed = 0;

      while ((match = sectionRegex.exec(row.chords)) !== null) {
        const label = match[1]; // e.g., "verse_1"
        const chordList = match[2].trim().split(/\s+/);

        const startTime = totalChordsProcessed * 3;
        
        // generate the bank (Unique chords, distractor items)
        const bank = [...chordList];

        // add 3 distractors that aren't already in the song
        const distractors = ["G", "D", "F", "Em", "Bb", "E", "Am", "C"]
        .filter(c => !bank.includes(c))
        .slice(0, 3);

        sections[label] = {
            label: label.replace('_', ' ').toUpperCase(),
            emoji: label.includes('verse') ? "🎵" : "🎶",
            sentiment: row.sentiment || "Neutral",
            correctOrder: chordList,
            bank: bank,
            startTime: startTime
        };

        totalChordsProcessed += chordList.length;
      }

    const keys = Object.keys(sections);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];

    const randomSection = {
      [randomKey]: sections[randomKey] 
    };

    res.json({
        title: row.title,
        artist: row.artist,
        spotifyId: row.spotifyId,
        sections: randomSection,
        recommendations: {
          sentiment: row.sentiment,
          songs: row.recommendations
        }   
    });
});


app.listen(PORT, () => {
    console.log(`Rendering Handlebars at http://localhost:${PORT}`);
});



/* ****************************** */