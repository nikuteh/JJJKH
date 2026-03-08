import kagglehub
import pandas as pd
import os

# kagglehub.login()
chrodonomicon_df = pd.read_csv("hf://datasets/ailsntua/Chordonomicon/chordonomicon_v2.csv")
print(chrodonomicon_df.info())
print(chrodonomicon_df.head())

path = kagglehub.dataset_download("thedevastator/muse-music-sentiment-analysis")
print("Path to dataset files:", path)

files = os.listdir(path)
print(f"Files in directory: {files}")

csv_path = os.path.join(path, "muse_dataset.csv")
sentiment_df = pd.read_csv(csv_path)

print(sentiment_df.info())
print(sentiment_df.head())