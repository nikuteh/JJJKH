# Chordle

Chordle is an interactive app that helps users understand how chord progressions shape the emotional tone of music. Users can listen to a song and then try to arrange the chords into the correct progression, gamifying the process of learning chord patterns. This encourages people to think about how chords flow together instead of just recognizing them individually.


# Running through Source

Prerequisite: 
- Node LTS (24)
- npm LTS (11)

`git clone https://github.com/nikuteh/JJJKH.git`

Run `npm install`

Start app with `node src/backend/server.js` while in `JJJKH` project root

Open `http://localhost:3000`

# Acknowledgements
The usage of chord data and Spotify-integrated song IDs come from the Chordonomicon dataset by the Artificial Intelligence and Learning Systems Laboratory, National Technical University of Athens, Greece. Their paper and data availability can be found at this GitHub repository: [Chordonomicon](https://github.com/spyroskantarelis/chordonomicon?tab=readme-ov-file). 

The usage of sentiments found in the songs is sourced from this Kaggle dataset, containing the `valence`, `arousal`, and `dominance` of roughly 90,000 songs: [MuSe Music Sentiment Analysis](https://www.kaggle.com/datasets/thedevastator/muse-music-sentiment-analysis?select=muse_dataset.csv). 
