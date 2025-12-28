"""
Training Scripts for YatriAI Custom Models

This script provides training utilities for:
1. Semantic Embeddings Model
2. Intent Classification Model
3. Named Entity Recognition Model
4. Recommendation System
5. Budget Estimation Model

Usage:
    python scripts/train_models.py --model embeddings
    python scripts/train_models.py --model intent
    python scripts/train_models.py --model ner
    python scripts/train_models.py --model recommendations
    python scripts/train_models.py --model budget
"""

import argparse
import json
import os
import sys
from pathlib import Path
from typing import List, Dict, Tuple

# Fix Windows console encoding
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Training data structure
TRAINING_DATA_DIR = Path("training_data")
MODELS_DIR = Path("models")


def prepare_embedding_data():
    """Prepare training data for semantic embeddings model"""
    print("Loading embedding training data...")
    
    # Try to load pre-prepared data
    embedding_file = TRAINING_DATA_DIR / "embedding_pairs.json"
    if embedding_file.exists():
        with open(embedding_file, "r", encoding='utf-8') as f:
            training_pairs = json.load(f)
        print(f"SUCCESS: Loaded {len(training_pairs)} training pairs from file")
        return training_pairs
    
    # Fallback: create synthetic data
    print("⚠️  No pre-prepared data found, creating synthetic data...")
    training_pairs = []
    
    # Positive pairs: query -> relevant document
    positive_examples = [
        ("heritage sites in Kolkata", "Victoria Memorial is a white marble monument"),
        ("heritage sites in Kolkata", "Howrah Bridge is an iconic cantilever bridge"),
        ("places to visit Kolkata", "Victoria Memorial features a museum with rare artifacts"),
        ("historical monuments", "Victoria Memorial built in memory of Queen Victoria"),
        ("temples in Kolkata", "Dakshineswar Kali Temple dedicated to Goddess Kali"),
        ("book market", "College Street is Asia's largest second-hand book market"),
        ("plan 3 day trip", "3-day heritage tour of Kolkata covering major sites"),
        ("budget travel", "Budget-friendly itinerary with affordable accommodations"),
    ]
    
    # Negative pairs: query -> irrelevant document
    negative_examples = [
        ("heritage sites in Kolkata", "Random restaurant in Mumbai"),
        ("temples", "Shopping mall description"),
        ("heritage", "Modern office building"),
    ]
    
    for query, doc in positive_examples:
        training_pairs.append({
            "query": query,
            "document": doc,
            "label": 1.0
        })
    
    for query, doc in negative_examples:
        training_pairs.append({
            "query": query,
            "document": doc,
            "label": 0.0
        })
    
    # Save training data
    TRAINING_DATA_DIR.mkdir(exist_ok=True)
    with open(embedding_file, "w", encoding='utf-8') as f:
        json.dump(training_pairs, f, indent=2, ensure_ascii=False)
    
    print(f"SUCCESS: Created {len(training_pairs)} training pairs")
    
    return training_pairs


def train_embeddings_model():
    """Train semantic embeddings model using sentence-transformers"""
    try:
        from sentence_transformers import SentenceTransformer, InputExample, losses
        from torch.utils.data import DataLoader
    except ImportError:
        print("❌ Please install required packages:")
        print("   pip install sentence-transformers torch")
        return
    
    print("Training semantic embeddings model...")
    
    # Prepare data
    training_pairs = prepare_embedding_data()
    
    # Load base model
    model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
    
    # Prepare training examples
    train_examples = [
        InputExample(texts=[pair["query"], pair["document"]], label=pair["label"])
        for pair in training_pairs
    ]
    
    # Create data loader
    train_dataloader = DataLoader(train_examples, shuffle=True, batch_size=16)
    
    # Define loss function
    train_loss = losses.CosineSimilarityLoss(model)
    
    # Train model with improved parameters
    MODELS_DIR.mkdir(exist_ok=True)
    model.fit(
        train_objectives=[(train_dataloader, train_loss)],
        epochs=5,  # Increased from 3 to 5
        output_path=str(MODELS_DIR / "heritage-embeddings"),
        show_progress_bar=True,
        warmup_steps=10,  # Add warmup for better convergence
    )
    
    print(f"SUCCESS: Model trained and saved to: {MODELS_DIR / 'heritage-embeddings'}")


def prepare_intent_data():
    """Prepare training data for intent classification"""
    print("Loading intent classification training data...")
    
    # Try to load pre-prepared data
    intent_file = TRAINING_DATA_DIR / "intent_data.json"
    if intent_file.exists():
        with open(intent_file, "r", encoding='utf-8') as f:
            training_data = json.load(f)
        print(f"SUCCESS: Loaded {len(training_data)} training examples from file")
        return training_data
    
    # Fallback: create synthetic data
    print("⚠️  No pre-prepared data found, creating synthetic data...")
    training_data = [
        {"text": "Plan a 3-day itinerary for Kolkata", "intent": "plan_itinerary"},
        {"text": "I want to book a guide", "intent": "book_guide"},
        {"text": "Show me heritage sites", "intent": "find_heritage"},
        {"text": "How much will it cost?", "intent": "budget_question"},
        {"text": "Tell me about Durga Puja", "intent": "cultural_info"},
        {"text": "Check my bookings", "intent": "booking_query"},
        {"text": "Show me artisan products", "intent": "marketplace"},
        {"text": "How to reach Kolkata by train?", "intent": "transport"},
        {"text": "Hello, how are you?", "intent": "general_chat"},
    ]
    
    TRAINING_DATA_DIR.mkdir(exist_ok=True)
    with open(intent_file, "w", encoding='utf-8') as f:
        json.dump(training_data, f, indent=2, ensure_ascii=False)
    
    print(f"SUCCESS: Created {len(training_data)} training examples")
    return training_data


def train_intent_classifier():
    """Train intent classification model"""
    try:
        from transformers import AutoTokenizer, AutoModelForSequenceClassification, Trainer, TrainingArguments
        from datasets import Dataset
    except ImportError:
        print("❌ Please install required packages:")
        print("   pip install transformers datasets torch")
        return
    
    print("Training intent classification model...")
    
    # Prepare data
    training_data = prepare_intent_data()
    
    # Get unique intents
    intents = sorted(set(item["intent"] for item in training_data))
    intent_to_id = {intent: idx for idx, intent in enumerate(intents)}
    
    # Load model and tokenizer
    model_name = "distilbert-base-uncased"
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForSequenceClassification.from_pretrained(
        model_name,
        num_labels=len(intents)
    )
    
    # Prepare dataset with labels
    def prepare_examples(examples):
        texts = examples["text"]
        labels = [intent_to_id[examples["intent"][i]] for i in range(len(texts))]
        return {"text": texts, "label": labels}
    
    # Prepare dataset
    def tokenize_function(examples):
        return tokenizer(examples["text"], truncation=True, padding="max_length", max_length=128)
    
    dataset = Dataset.from_list(training_data)
    # Add labels
    dataset = dataset.map(lambda x: {"label": intent_to_id[x["intent"]]})
    tokenized_dataset = dataset.map(tokenize_function, batched=True)
    
    # Training arguments with improved settings
    training_args = TrainingArguments(
        output_dir=str(MODELS_DIR / "intent-classifier"),
        num_train_epochs=5,  # Increased from 3 to 5
        per_device_train_batch_size=16,
        save_strategy="epoch",
        learning_rate=2e-5,  # Explicit learning rate
        weight_decay=0.01,  # Add regularization
        warmup_steps=10,  # Add warmup
        logging_steps=5,
    )
    
    # Trainer
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=tokenized_dataset,
    )
    
    # Train
    trainer.train()
    
    # Save model
    model.save_pretrained(MODELS_DIR / "intent-classifier")
    tokenizer.save_pretrained(MODELS_DIR / "intent-classifier")
    
    # Save intent mapping
    with open(MODELS_DIR / "intent-classifier" / "intent_mapping.json", "w") as f:
        json.dump({"intent_to_id": intent_to_id, "id_to_intent": {v: k for k, v in intent_to_id.items()}}, f, indent=2)
    
    print(f"SUCCESS: Model trained and saved to: {MODELS_DIR / 'intent-classifier'}")


def main():
    parser = argparse.ArgumentParser(description="Train YatriAI custom models")
    parser.add_argument(
        "--model",
        choices=["embeddings", "intent", "ner", "recommendations", "budget", "all"],
        required=True,
        help="Model to train"
    )
    
    args = parser.parse_args()
    
    if args.model == "embeddings" or args.model == "all":
        train_embeddings_model()
    
    if args.model == "intent" or args.model == "all":
        train_intent_classifier()
    
    if args.model == "ner":
        print("WARNING: NER training not yet implemented. Use rule-based extraction for now.")
    
    if args.model == "recommendations":
        print("⚠️  Recommendation system uses collaborative filtering - no training needed.")
        print("   Just collect user interaction data.")
    
    if args.model == "budget":
        print("⚠️  Budget estimation uses rule-based model - no training needed.")
        print("   Can be improved with historical booking data.")


if __name__ == "__main__":
    main()

