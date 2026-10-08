import os
import sys
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, accuracy_score
import joblib

# Ensure we can import app modules if needed
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def main():
    print("Loading dataset...")
    data_path = os.path.join("datasets", "raw", "grievances_synthetic.csv")
    
    if not os.path.exists(data_path):
        print(f"Error: Dataset not found at {data_path}")
        return
        
    df = pd.read_csv(data_path)
    print(f"Loaded {len(df)} records.")
    
    # We expect 'text' and 'category' columns
    if 'text' not in df.columns or 'category' not in df.columns:
        print("Error: Dataset must contain 'text' and 'category' columns.")
        return
        
    # Drop missing values
    df = df.dropna(subset=['text', 'category'])
    
    X = df['text']
    y = df['category']
    
    print("Splitting dataset into train and test sets...")
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Building NLP Pipeline (TF-IDF + LogisticRegression)...")
    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(max_features=5000, ngram_range=(1, 2))),
        ('clf', LogisticRegression(max_iter=1000, C=1.0, class_weight='balanced'))
    ])
    
    print("Training model (this might take a few seconds)...")
    pipeline.fit(X_train, y_train)
    
    print("Evaluating model...")
    y_pred = pipeline.predict(X_test)
    
    acc = accuracy_score(y_test, y_pred)
    print(f"\nAccuracy: {acc:.4f}\n")
    print("Classification Report:")
    print(classification_report(y_test, y_pred))
    
    # Save the model
    models_dir = os.path.join("app", "ml", "models")
    os.makedirs(models_dir, exist_ok=True)
    
    model_path = os.path.join(models_dir, "department_classifier.joblib")
    joblib.dump(pipeline, model_path)
    print(f"Model successfully saved to {model_path}")

if __name__ == "__main__":
    main()
