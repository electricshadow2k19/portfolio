import pandas as pd
import numpy as np
import re
import nltk
import matplotlib.pyplot as plt

from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from sklearn.ensemble import IsolationForest

# =========================
# 1. SETUP
# =========================

nltk.download("stopwords")
nltk.download("punkt")

INPUT_FILE = "cleaned_cfpb_output.csv"
OUTPUT_FILE = "arun_trend_anomaly_output.xlsx"
ANOMALY_FILE = "arun_anomalies_only.xlsx"

# =========================
# 2. LOAD DATA
# =========================

df = pd.read_csv(INPUT_FILE)

print("Columns in dataset:")
print(df.columns.tolist())
print("\nDataset shape:", df.shape)

# =========================
# 3. AUTO-DETECT TEXT COLUMN
# =========================

possible_text_columns = [
    "consumer_complaint_narrative",
    "complaint",
    "narrative",
    "text",
    "cleaned_text",
    "Consumer complaint narrative"
]

text_col = None

for col in possible_text_columns:
    if col in df.columns:
        text_col = col
        break

if text_col is None:
    object_cols = df.select_dtypes(include=["object"]).columns.tolist()
    text_col = max(object_cols, key=lambda c: df[c].astype(str).str.len().mean())

print("\nUsing text column:", text_col)

# =========================
# 4. AUTO-DETECT DATE COLUMN
# =========================

possible_date_columns = [
    "date_received",
    "Date received",
    "date",
    "submitted_date",
    "Date"
]

date_col = None

for col in possible_date_columns:
    if col in df.columns:
        date_col = col
        break

if date_col:
    df[date_col] = pd.to_datetime(df[date_col], errors="coerce")
    print("Using date column:", date_col)
else:
    print("No date column found. Trend will use row order.")
    df["row_index"] = range(len(df))

# =========================
# 5. TEXT PREPROCESSING
# =========================

stop_words = set(stopwords.words("english"))

def preprocess_text(text):
    text = str(text).lower()
    text = re.sub(r"[^a-zA-Z\s]", " ", text)
    words = word_tokenize(text)
    words = [w for w in words if w not in stop_words and len(w) > 2]
    return words

df["tokens"] = df[text_col].apply(preprocess_text)

# =========================
# 6. FEATURE ENGINEERING
# =========================

df["word_count"] = df["tokens"].apply(len)
df["char_count"] = df[text_col].astype(str).apply(len)
df["unique_word_count"] = df["tokens"].apply(lambda x: len(set(x)))
df["unique_word_ratio"] = df.apply(
    lambda row: row["unique_word_count"] / row["word_count"] if row["word_count"] > 0 else 0,
    axis=1
)

# =========================
# 7. ANOMALY DETECTION
# =========================

features = ["word_count", "char_count", "unique_word_ratio"]

model = IsolationForest(
    contamination=0.05,
    random_state=42
)

df["anomaly_flag"] = model.fit_predict(df[features])
df["anomaly_status"] = df["anomaly_flag"].map({1: "Normal", -1: "Anomaly"})

anomalies = df[df["anomaly_flag"] == -1]

print("\nTotal anomalies detected:", len(anomalies))

# =========================
# 8. TREND ANALYSIS
# =========================

if date_col:
    df["month"] = df[date_col].dt.to_period("M").astype(str)

    monthly_trend = df.groupby("month").agg(
        total_records=("word_count", "count"),
        avg_word_count=("word_count", "mean"),
        avg_char_count=("char_count", "mean"),
        anomalies=("anomaly_flag", lambda x: (x == -1).sum())
    ).reset_index()

else:
    df["trend_group"] = pd.qcut(
        df["row_index"],
        q=10,
        labels=[f"Group {i}" for i in range(1, 11)]
    )

    monthly_trend = df.groupby("trend_group").agg(
        total_records=("word_count", "count"),
        avg_word_count=("word_count", "mean"),
        avg_char_count=("char_count", "mean"),
        anomalies=("anomaly_flag", lambda x: (x == -1).sum())
    ).reset_index()

# =========================
# 9. SAVE OUTPUT TO EXCEL
# =========================

with pd.ExcelWriter(OUTPUT_FILE, engine="openpyxl") as writer:
    df.to_excel(writer, sheet_name="Processed_Data", index=False)
    anomalies.to_excel(writer, sheet_name="Anomalies", index=False)
    monthly_trend.to_excel(writer, sheet_name="Trend_Analysis", index=False)

anomalies.to_excel(ANOMALY_FILE, index=False)

print("\nFiles created:")
print(OUTPUT_FILE)
print(ANOMALY_FILE)

# =========================
# 10. CREATE TREND GRAPH
# =========================

plt.figure(figsize=(12, 6))
plt.plot(monthly_trend.iloc[:, 0], monthly_trend["avg_word_count"], marker="o")
plt.xticks(rotation=45)
plt.xlabel("Time Period")
plt.ylabel("Average Word Count")
plt.title("Trend Analysis: Average Complaint Text Length Over Time")
plt.tight_layout()
plt.savefig("trend_analysis_avg_word_count.png")
plt.show()

# =========================
# 11. CREATE ANOMALY GRAPH
# =========================

plt.figure(figsize=(10, 6))
normal = df[df["anomaly_flag"] == 1]
abnormal = df[df["anomaly_flag"] == -1]

plt.scatter(normal["char_count"], normal["word_count"], label="Normal", alpha=0.5)
plt.scatter(abnormal["char_count"], abnormal["word_count"], label="Anomaly", alpha=0.8)

plt.xlabel("Character Count")
plt.ylabel("Word Count")
plt.title("Text Anomaly Detection")
plt.legend()
plt.tight_layout()
plt.savefig("anomaly_detection_graph.png")
plt.show()

# =========================
# 12. PRINT SUMMARY
# =========================

print("\n===== SUMMARY =====")
print("Dataset used:", INPUT_FILE)
print("Text column used:", text_col)

if date_col:
    print("Date column used:", date_col)
else:
    print("Date column used: None — row grouping used")

print("Total records:", len(df))
print("Total anomalies:", len(anomalies))
print("Output Excel:", OUTPUT_FILE)