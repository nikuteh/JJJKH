import kagglehub
import pandas as pd
import os
from sqlalchemy import create_engine
from dotenv import load_dotenv

# kagglehub.login()
chrodonomicon_df = pd.read_csv("hf://datasets/ailsntua/Chordonomicon/chordonomicon_v2.csv")
# print(chrodonomicon_df.info())
# print(chrodonomicon_df.head())

path = kagglehub.dataset_download("thedevastator/muse-music-sentiment-analysis")
# print("Path to dataset files:", path)
# files = os.listdir(path)
# print(f"Files in directory: {files}")
csv_path = os.path.join(path, "muse_dataset.csv")
sentiment_df = pd.read_csv(csv_path)

valid_songs = sentiment_df['spotify_id'].unique()
filtered_chords = chrodonomicon_df[chrodonomicon_df['spotify_song_id'].isin(valid_songs)]

print(f"{len(filtered_chords)}")

engine = create_engine('sqlite:///music_data.db')

# print(sentiment_df.info())
# print(sentiment_df.head())

filtered_chords.to_sql('chords', con=engine, if_exists='replace', index=False)
sentiment_df.to_sql('sentiment', con=engine, if_exists='replace', index=False)
