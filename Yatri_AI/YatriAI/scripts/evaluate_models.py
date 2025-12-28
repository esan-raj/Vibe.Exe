"""
Evaluate Trained Models

This script evaluates the trained models and computes metrics:
- Embeddings: Similarity scores, retrieval accuracy
- Intent Classifier: Accuracy, Precision, Recall, F1-score, Confusion Matrix

Usage:
    python scripts/evaluate_models.py
"""

import json
import sys
from pathlib import Path
from typing import List, Dict, Tuple
import numpy as np

# Fix Windows console encoding
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

TRAINING_DATA_DIR = Path("training_data")
MODELS_DIR = Path("models")


def evaluate_embeddings_model():
    """Evaluate semantic embeddings model"""
    print("=" * 60)
    print("EVALUATING EMBEDDINGS MODEL")
    print("=" * 60)
    
    try:
        from sentence_transformers import SentenceTransformer
        from sklearn.metrics.pairwise import cosine_similarity
    except ImportError:
        print("ERROR: Please install required packages:")
        print("   pip install sentence-transformers scikit-learn")
        return
    
    # Load model
    model_path = MODELS_DIR / "heritage-embeddings"
    if not model_path.exists():
        print(f"ERROR: Model not found at {model_path}")
        return
    
    print(f"Loading model from {model_path}...")
    model = SentenceTransformer(str(model_path))
    
    # Load test data
    test_file = TRAINING_DATA_DIR / "embedding_pairs.json"
    if not test_file.exists():
        print(f"ERROR: Test data not found at {test_file}")
        return
    
    with open(test_file, "r", encoding='utf-8') as f:
        test_data = json.load(f)
    
    print(f"Loaded {len(test_data)} test pairs")
    
    # Separate positive and negative pairs
    positive_pairs = [p for p in test_data if p["label"] == 1.0]
    negative_pairs = [p for p in test_data if p["label"] == 0.0]
    
    print(f"  Positive pairs: {len(positive_pairs)}")
    print(f"  Negative pairs: {len(negative_pairs)}")
    
    # Evaluate positive pairs
    positive_similarities = []
    for pair in positive_pairs:
        query_emb = model.encode(pair["query"])
        doc_emb = model.encode(pair["document"])
        similarity = cosine_similarity([query_emb], [doc_emb])[0][0]
        positive_similarities.append(similarity)
    
    # Evaluate negative pairs
    negative_similarities = []
    for pair in negative_pairs:
        query_emb = model.encode(pair["query"])
        doc_emb = model.encode(pair["document"])
        similarity = cosine_similarity([query_emb], [doc_emb])[0][0]
        negative_similarities.append(similarity)
    
    # Calculate metrics
    avg_positive_sim = np.mean(positive_similarities)
    avg_negative_sim = np.mean(negative_similarities)
    separation = avg_positive_sim - avg_negative_sim
    
    # Threshold-based accuracy (using 0.5 as threshold)
    threshold = 0.5
    true_positives = sum(1 for s in positive_similarities if s >= threshold)
    true_negatives = sum(1 for s in negative_similarities if s < threshold)
    false_positives = sum(1 for s in negative_similarities if s >= threshold)
    false_negatives = sum(1 for s in positive_similarities if s < threshold)
    
    accuracy = (true_positives + true_negatives) / len(test_data)
    precision = true_positives / (true_positives + false_positives) if (true_positives + false_positives) > 0 else 0
    recall = true_positives / (true_positives + false_negatives) if (true_positives + false_negatives) > 0 else 0
    f1_score = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
    
    # Print results
    print("\n" + "-" * 60)
    print("EMBEDDINGS MODEL METRICS")
    print("-" * 60)
    print(f"Average Positive Similarity: {avg_positive_sim:.4f}")
    print(f"Average Negative Similarity: {avg_negative_sim:.4f}")
    print(f"Separation (Positive - Negative): {separation:.4f}")
    print(f"\nThreshold-based Metrics (threshold = {threshold}):")
    print(f"  Accuracy:  {accuracy:.4f} ({accuracy*100:.2f}%)")
    print(f"  Precision: {precision:.4f} ({precision*100:.2f}%)")
    print(f"  Recall:    {recall:.4f} ({recall*100:.2f}%)")
    print(f"  F1-Score:  {f1_score:.4f} ({f1_score*100:.2f}%)")
    print(f"\nConfusion Matrix:")
    print(f"  True Positives:  {true_positives}")
    print(f"  True Negatives:  {true_negatives}")
    print(f"  False Positives: {false_positives}")
    print(f"  False Negatives: {false_negatives}")
    
    # Similarity distribution
    print(f"\nSimilarity Distribution:")
    print(f"  Positive pairs - Min: {min(positive_similarities):.4f}, Max: {max(positive_similarities):.4f}, Std: {np.std(positive_similarities):.4f}")
    print(f"  Negative pairs - Min: {min(negative_similarities):.4f}, Max: {max(negative_similarities):.4f}, Std: {np.std(negative_similarities):.4f}")
    
    return {
        "accuracy": float(accuracy),
        "precision": float(precision),
        "recall": float(recall),
        "f1_score": float(f1_score),
        "avg_positive_sim": float(avg_positive_sim),
        "avg_negative_sim": float(avg_negative_sim),
        "separation": float(separation)
    }


def evaluate_intent_classifier():
    """Evaluate intent classification model"""
    print("\n" + "=" * 60)
    print("EVALUATING INTENT CLASSIFIER")
    print("=" * 60)
    
    try:
        import torch
        from transformers import AutoTokenizer, AutoModelForSequenceClassification
        from sklearn.metrics import accuracy_score, precision_recall_fscore_support, confusion_matrix, classification_report
    except ImportError:
        print("ERROR: Please install required packages:")
        print("   pip install transformers scikit-learn torch")
        return
    
    # Load model
    model_path = MODELS_DIR / "intent-classifier"
    if not model_path.exists():
        print(f"ERROR: Model not found at {model_path}")
        return
    
    print(f"Loading model from {model_path}...")
    tokenizer = AutoTokenizer.from_pretrained(str(model_path))
    model = AutoModelForSequenceClassification.from_pretrained(str(model_path))
    
    # Load intent mapping
    mapping_file = model_path / "intent_mapping.json"
    if not mapping_file.exists():
        print(f"ERROR: Intent mapping not found at {mapping_file}")
        return
    
    with open(mapping_file, "r", encoding='utf-8') as f:
        mapping = json.load(f)
    
    id_to_intent = {int(k): v for k, v in mapping["id_to_intent"].items()}
    intent_to_id = {v: int(k) for k, v in mapping["id_to_intent"].items()}
    
    # Load test data
    test_file = TRAINING_DATA_DIR / "intent_data.json"
    if not test_file.exists():
        print(f"ERROR: Test data not found at {test_file}")
        return
    
    with open(test_file, "r", encoding='utf-8') as f:
        test_data = json.load(f)
    
    print(f"Loaded {len(test_data)} test examples")
    
    # Prepare test data
    texts = [item["text"] for item in test_data]
    true_labels = [intent_to_id[item["intent"]] for item in test_data]
    
    # Predict
    print("Running predictions...")
    predictions = []
    for text in texts:
        inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=128)
        with torch.no_grad():
            outputs = model(**inputs)
        predicted_id = outputs.logits.argmax().item()
        predictions.append(predicted_id)
    
    # Calculate metrics
    accuracy = accuracy_score(true_labels, predictions)
    precision, recall, f1, support = precision_recall_fscore_support(
        true_labels, predictions, average='weighted', zero_division=0
    )
    
    # Per-class metrics
    precision_per_class, recall_per_class, f1_per_class, support_per_class = precision_recall_fscore_support(
        true_labels, predictions, average=None, zero_division=0
    )
    
    # Confusion matrix
    cm = confusion_matrix(true_labels, predictions)
    
    # Print results
    print("\n" + "-" * 60)
    print("INTENT CLASSIFIER METRICS")
    print("-" * 60)
    print(f"Overall Accuracy: {accuracy:.4f} ({accuracy*100:.2f}%)")
    print(f"Weighted Precision: {precision:.4f} ({precision*100:.2f}%)")
    print(f"Weighted Recall: {recall:.4f} ({recall*100:.2f}%)")
    print(f"Weighted F1-Score: {f1:.4f} ({f1*100:.2f}%)")
    
    # Per-class metrics
    print(f"\nPer-Class Metrics:")
    print(f"{'Intent':<20} {'Precision':<12} {'Recall':<12} {'F1-Score':<12} {'Support':<10}")
    print("-" * 70)
    for i, intent in sorted(id_to_intent.items()):
        intent_name = intent[:18]  # Truncate if too long
        print(f"{intent_name:<20} {precision_per_class[i]:<12.4f} {recall_per_class[i]:<12.4f} {f1_per_class[i]:<12.4f} {support_per_class[i]:<10}")
    
    # Confusion matrix
    print(f"\nConfusion Matrix:")
    print("Rows = True labels, Columns = Predicted labels")
    print(f"{'':<15}", end="")
    for i in sorted(id_to_intent.keys()):
        print(f"{id_to_intent[i][:10]:<12}", end="")
    print()
    for i, intent_id in enumerate(sorted(id_to_intent.keys())):
        print(f"{id_to_intent[intent_id][:14]:<15}", end="")
        for j in sorted(id_to_intent.keys()):
            print(f"{cm[i][j]:<12}", end="")
        print()
    
    # Classification report
    print(f"\nDetailed Classification Report:")
    print(classification_report(
        true_labels, 
        predictions, 
        target_names=[id_to_intent[i] for i in sorted(id_to_intent.keys())],
        zero_division=0
    ))
    
    # Error analysis
    print(f"\nError Analysis:")
    errors = []
    for i, (text, true_label, pred_label) in enumerate(zip(texts, true_labels, predictions)):
        if true_label != pred_label:
            errors.append({
                "text": text,
                "true": id_to_intent[true_label],
                "predicted": id_to_intent[pred_label]
            })
    
    if errors:
        print(f"Found {len(errors)} misclassified examples:")
        for i, error in enumerate(errors[:10], 1):  # Show first 10 errors
            print(f"  {i}. '{error['text']}'")
            print(f"     True: {error['true']}, Predicted: {error['predicted']}")
        if len(errors) > 10:
            print(f"  ... and {len(errors) - 10} more errors")
    else:
        print("  No errors found! Perfect classification!")
    
    return {
        "accuracy": float(accuracy),
        "precision": float(precision),
        "recall": float(recall),
        "f1_score": float(f1),
        "num_errors": len(errors),
        "total_examples": len(test_data)
    }


def main():
    print("\n" + "=" * 60)
    print("YATRIAI MODEL EVALUATION")
    print("=" * 60)
    print()
    
    # Import torch here to avoid import error if not needed
    try:
        import torch
    except ImportError:
        print("ERROR: PyTorch not installed. Please install: pip install torch")
        return
    
    results = {}
    
    # Evaluate embeddings
    try:
        results["embeddings"] = evaluate_embeddings_model()
    except Exception as e:
        print(f"ERROR evaluating embeddings: {e}")
        import traceback
        traceback.print_exc()
    
    # Evaluate intent classifier
    try:
        results["intent"] = evaluate_intent_classifier()
    except Exception as e:
        print(f"ERROR evaluating intent classifier: {e}")
        import traceback
        traceback.print_exc()
    
    # Summary
    print("\n" + "=" * 60)
    print("EVALUATION SUMMARY")
    print("=" * 60)
    
    if "embeddings" in results:
        emb = results["embeddings"]
        print(f"\nEmbeddings Model:")
        print(f"  Accuracy:  {emb['accuracy']:.4f} ({emb['accuracy']*100:.2f}%)")
        print(f"  Precision: {emb['precision']:.4f} ({emb['precision']*100:.2f}%)")
        print(f"  Recall:    {emb['recall']:.4f} ({emb['recall']*100:.2f}%)")
        print(f"  F1-Score:  {emb['f1_score']:.4f} ({emb['f1_score']*100:.2f}%)")
    
    if "intent" in results:
        intent = results["intent"]
        print(f"\nIntent Classifier:")
        print(f"  Accuracy:  {intent['accuracy']:.4f} ({intent['accuracy']*100:.2f}%)")
        print(f"  Precision: {intent['precision']:.4f} ({intent['precision']*100:.2f}%)")
        print(f"  Recall:    {intent['recall']:.4f} ({intent['recall']*100:.2f}%)")
        print(f"  F1-Score:  {intent['f1_score']:.4f} ({intent['f1_score']*100:.2f}%)")
        print(f"  Errors:    {intent['num_errors']}/{intent['total_examples']}")
    
    # Save results
    results_file = Path("evaluation_results.json")
    with open(results_file, "w", encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    print(f"\nResults saved to: {results_file}")
    print("\n" + "=" * 60)


if __name__ == "__main__":
    main()

