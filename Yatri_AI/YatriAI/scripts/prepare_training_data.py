"""
Prepare Training Data from YatriAI Mock Data

This script extracts data from mockData.ts and creates training datasets
for embeddings and intent classification.
"""

import json
import re
import sys
from pathlib import Path

# Fix Windows console encoding
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Paths
MOCK_DATA_FILE = Path("src/data/mockData.ts")
TRAINING_DATA_DIR = Path("training_data")
TRAINING_DATA_DIR.mkdir(exist_ok=True)


def extract_ts_data():
    """Extract data from TypeScript mockData.ts file"""
    print("Reading mockData.ts...")
    
    with open(MOCK_DATA_FILE, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract destinations
    destinations = []
    dest_pattern = r"name:\s*['\"]([^'\"]+)['\"].*?description:\s*['\"]([^'\"]+)['\"].*?category:\s*['\"]([^'\"]+)['\"]"
    dest_matches = re.finditer(r"\{[^}]*name:\s*['\"]([^'\"]+)['\"][^}]*description:\s*['\"]([^'\"]+)['\"][^}]*category:\s*['\"]([^'\"]+)['\"][^}]*\}", content, re.DOTALL)
    
    for match in dest_matches:
        # Extract name, description, category
        name_match = re.search(r"name:\s*['\"]([^'\"]+)['\"]", match.group(0))
        desc_match = re.search(r"description:\s*['\"]([^'\"]+)['\"]", match.group(0))
        cat_match = re.search(r"category:\s*['\"]([^'\"]+)['\"]", match.group(0))
        
        if name_match and desc_match and cat_match:
            destinations.append({
                "name": name_match.group(1),
                "description": desc_match.group(1),
                "category": cat_match.group(1)
            })
    
    # Extract guides
    guides = []
    guide_matches = re.finditer(r"\{[^}]*name:\s*['\"]([^'\"]+)['\"][^}]*specialties:\s*\[([^\]]+)\][^}]*\}", content, re.DOTALL)
    
    for match in guide_matches:
        name_match = re.search(r"name:\s*['\"]([^'\"]+)['\"]", match.group(0))
        specialties_match = re.search(r"specialties:\s*\[([^\]]+)\]", match.group(0))
        
        if name_match and specialties_match:
            specialties = [s.strip().strip("'\"") for s in specialties_match.group(1).split(',')]
            guides.append({
                "name": name_match.group(1),
                "specialties": specialties
            })
    
    # Extract itineraries
    itineraries = []
    itin_matches = re.finditer(r"\{[^}]*title:\s*['\"]([^'\"]+)['\"][^}]*activities:\s*\[([^\]]+)\][^}]*\}", content, re.DOTALL)
    
    for match in itin_matches:
        title_match = re.search(r"title:\s*['\"]([^'\"]+)['\"]", match.group(0))
        activities_match = re.search(r"activities:\s*\[([^\]]+)\]", match.group(0))
        
        if title_match and activities_match:
            activities = [a.strip().strip("'\"") for a in activities_match.group(1).split(',')]
            itineraries.append({
                "title": title_match.group(1),
                "activities": activities
            })
    
    print(f"✅ Extracted: {len(destinations)} destinations, {len(guides)} guides, {len(itineraries)} itineraries")
    
    return destinations, guides, itineraries


def create_embedding_training_data(destinations, guides, itineraries):
    """Create training pairs for embeddings model"""
    print("Creating embedding training data...")
    
    training_pairs = []
    
    # Positive pairs: query -> relevant document
    positive_examples = []
    
    # Heritage sites queries
    heritage_dests = [d for d in destinations if 'heritage' in d['category'].lower() or 'heritage' in d['description'].lower()]
    for dest in heritage_dests:
        positive_examples.extend([
            (f"heritage sites in Kolkata", f"{dest['name']}. {dest['description']}"),
            (f"historical monuments", f"{dest['name']}. {dest['description']}"),
            (f"places to visit Kolkata", f"{dest['name']}. {dest['description']}"),
            (f"heritage attractions", f"{dest['name']}. {dest['description']}"),
        ])
    
    # Temple queries
    temple_dests = [d for d in destinations if 'temple' in d['category'].lower() or 'temple' in d['name'].lower()]
    for dest in temple_dests:
        positive_examples.extend([
            (f"temples in Kolkata", f"{dest['name']}. {dest['description']}"),
            (f"religious sites", f"{dest['name']}. {dest['description']}"),
            (f"hindu temples", f"{dest['name']}. {dest['description']}"),
        ])
    
    # Guide queries
    for guide in guides:
        specialties_text = ", ".join(guide['specialties'])
        positive_examples.extend([
            (f"book a guide for {guide['specialties'][0].lower()}", f"{guide['name']}. Specializes in {specialties_text}"),
            (f"hire a {guide['specialties'][0].lower()} guide", f"{guide['name']}. {specialties_text}"),
            (f"find a local guide", f"{guide['name']}. {specialties_text}"),
        ])
    
    # Itinerary queries
    for itin in itineraries:
        activities_text = " ".join(itin['activities'])
        positive_examples.extend([
            (f"plan {itin['title'].lower()}", f"{itin['title']}. Activities: {activities_text}"),
            (f"itinerary for {itin['activities'][0].lower()}", f"{itin['title']}. {activities_text}"),
            (f"travel plan", f"{itin['title']}. {activities_text}"),
        ])
    
    # Add to training pairs
    for query, doc in positive_examples:
        training_pairs.append({
            "query": query,
            "document": doc,
            "label": 1.0
        })
    
    # Negative pairs: query -> irrelevant document (expanded)
    negative_examples = [
        ("heritage sites in Kolkata", "Random restaurant in Mumbai serving biryani"),
        ("temples", "Shopping mall with multiple stores"),
        ("heritage", "Modern office building with glass facade"),
        ("book guide", "Hotel booking website"),
        ("plan itinerary", "Flight booking system"),
        ("heritage sites", "Online shopping website"),
        ("temples in Kolkata", "Restaurant menu with prices"),
        ("historical monuments", "Tech company office"),
        ("book a guide", "E-commerce product page"),
        ("plan trip", "Weather forecast website"),
        ("heritage", "Social media platform"),
        ("temples", "News article about sports"),
        ("guide booking", "Movie ticket booking"),
        ("itinerary", "Recipe website"),
        ("heritage sites", "Job listing website"),
    ]
    
    for query, doc in negative_examples:
        training_pairs.append({
            "query": query,
            "document": doc,
            "label": 0.0
        })
    
    # Save
    with open(TRAINING_DATA_DIR / "embedding_pairs.json", "w", encoding='utf-8') as f:
        json.dump(training_pairs, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Created {len(training_pairs)} embedding training pairs")
    print(f"   Positive: {len(positive_examples)}, Negative: {len(negative_examples)}")
    
    return training_pairs


def create_intent_training_data():
    """Create training data for intent classification"""
    print("Creating intent classification training data...")
    
    training_data = [
        # Plan Itinerary (expanded)
        {"text": "Plan a 3-day itinerary for Kolkata", "intent": "plan_itinerary"},
        {"text": "Create a travel plan", "intent": "plan_itinerary"},
        {"text": "I need an itinerary", "intent": "plan_itinerary"},
        {"text": "Make a schedule for my trip", "intent": "plan_itinerary"},
        {"text": "Organize a 5-day tour", "intent": "plan_itinerary"},
        {"text": "Plan my Kolkata visit", "intent": "plan_itinerary"},
        {"text": "Create itinerary", "intent": "plan_itinerary"},
        {"text": "Schedule a trip", "intent": "plan_itinerary"},
        {"text": "I want to plan a trip", "intent": "plan_itinerary"},
        {"text": "Can you create an itinerary?", "intent": "plan_itinerary"},
        {"text": "Plan a weekend trip", "intent": "plan_itinerary"},
        {"text": "Make a travel itinerary", "intent": "plan_itinerary"},
        {"text": "I need a travel plan", "intent": "plan_itinerary"},
        {"text": "Design an itinerary", "intent": "plan_itinerary"},
        {"text": "Plan my journey", "intent": "plan_itinerary"},
        
        # Book Guide (expanded)
        {"text": "I want to book a guide", "intent": "book_guide"},
        {"text": "Hire a local guide", "intent": "book_guide"},
        {"text": "Find a guide for tomorrow", "intent": "book_guide"},
        {"text": "Need a guide", "intent": "book_guide"},
        {"text": "Book guide", "intent": "book_guide"},
        {"text": "Guide available?", "intent": "book_guide"},
        {"text": "I need a guide", "intent": "book_guide"},
        {"text": "Can I book a guide?", "intent": "book_guide"},
        {"text": "I want to hire a guide", "intent": "book_guide"},
        {"text": "Find me a guide", "intent": "book_guide"},
        {"text": "Book a tour guide", "intent": "book_guide"},
        {"text": "I need a local guide", "intent": "book_guide"},
        {"text": "Guide booking", "intent": "book_guide"},
        {"text": "Get me a guide", "intent": "book_guide"},
        {"text": "Can you find a guide?", "intent": "book_guide"},
        
        # Find Heritage (expanded)
        {"text": "Show me heritage sites", "intent": "find_heritage"},
        {"text": "Heritage sites in Kolkata", "intent": "find_heritage"},
        {"text": "Historical monuments", "intent": "find_heritage"},
        {"text": "Show heritage attractions", "intent": "find_heritage"},
        {"text": "List heritage sites", "intent": "find_heritage"},
        {"text": "What heritage sites are there?", "intent": "find_heritage"},
        {"text": "Heritage places to visit", "intent": "find_heritage"},
        {"text": "Show monuments", "intent": "find_heritage"},
        {"text": "Find historical places", "intent": "find_heritage"},
        {"text": "Show me monuments", "intent": "find_heritage"},
        {"text": "Heritage locations", "intent": "find_heritage"},
        {"text": "What monuments can I see?", "intent": "find_heritage"},
        {"text": "List historical sites", "intent": "find_heritage"},
        {"text": "Show heritage places", "intent": "find_heritage"},
        {"text": "Find heritage attractions", "intent": "find_heritage"},
        
        # Budget Question (expanded)
        {"text": "How much will it cost?", "intent": "budget_question"},
        {"text": "What's the budget?", "intent": "budget_question"},
        {"text": "How much money do I need?", "intent": "budget_question"},
        {"text": "What's the price?", "intent": "budget_question"},
        {"text": "Cost estimate", "intent": "budget_question"},
        {"text": "Budget for trip", "intent": "budget_question"},
        {"text": "How expensive?", "intent": "budget_question"},
        {"text": "What will it cost?", "intent": "budget_question"},
        {"text": "How much does it cost?", "intent": "budget_question"},
        {"text": "What is the cost?", "intent": "budget_question"},
        {"text": "Estimate the budget", "intent": "budget_question"},
        {"text": "How much should I budget?", "intent": "budget_question"},
        {"text": "What's the expense?", "intent": "budget_question"},
        {"text": "Cost of trip", "intent": "budget_question"},
        {"text": "Budget estimate please", "intent": "budget_question"},
        
        # Cultural Info (expanded but more specific)
        {"text": "Tell me about Durga Puja", "intent": "cultural_info"},
        {"text": "Explain heritage significance", "intent": "cultural_info"},
        {"text": "What is Victoria Memorial?", "intent": "cultural_info"},
        {"text": "History of Kolkata", "intent": "cultural_info"},
        {"text": "Tell me about the culture", "intent": "cultural_info"},
        {"text": "Explain traditions", "intent": "cultural_info"},
        {"text": "What's the significance?", "intent": "cultural_info"},
        {"text": "Tell me more about this", "intent": "cultural_info"},
        {"text": "What is the history?", "intent": "cultural_info"},
        {"text": "Explain the culture", "intent": "cultural_info"},
        {"text": "Tell me about traditions", "intent": "cultural_info"},
        {"text": "What does this mean?", "intent": "cultural_info"},
        {"text": "Explain this place", "intent": "cultural_info"},
        {"text": "Cultural significance", "intent": "cultural_info"},
        {"text": "What's the story behind this?", "intent": "cultural_info"},
        
        # Booking Query (expanded)
        {"text": "Check my bookings", "intent": "booking_query"},
        {"text": "My booking status", "intent": "booking_query"},
        {"text": "View reservations", "intent": "booking_query"},
        {"text": "Show my bookings", "intent": "booking_query"},
        {"text": "Booking confirmation", "intent": "booking_query"},
        {"text": "What are my bookings?", "intent": "booking_query"},
        {"text": "Show reservations", "intent": "booking_query"},
        {"text": "Check reservations", "intent": "booking_query"},
        {"text": "My booked items", "intent": "booking_query"},
        {"text": "View my bookings", "intent": "booking_query"},
        {"text": "List my bookings", "intent": "booking_query"},
        {"text": "Show booking details", "intent": "booking_query"},
        {"text": "Check booking status", "intent": "booking_query"},
        {"text": "What did I book?", "intent": "booking_query"},
        {"text": "Display my bookings", "intent": "booking_query"},
        
        # Marketplace (expanded significantly)
        {"text": "Show me artisan products", "intent": "marketplace"},
        {"text": "Handicrafts for sale", "intent": "marketplace"},
        {"text": "Buy products", "intent": "marketplace"},
        {"text": "Marketplace", "intent": "marketplace"},
        {"text": "Show crafts", "intent": "marketplace"},
        {"text": "I want to buy handicrafts", "intent": "marketplace"},
        {"text": "Show me products", "intent": "marketplace"},
        {"text": "Artisan marketplace", "intent": "marketplace"},
        {"text": "Where can I buy crafts?", "intent": "marketplace"},
        {"text": "Show artisan items", "intent": "marketplace"},
        {"text": "I want to shop", "intent": "marketplace"},
        {"text": "Browse products", "intent": "marketplace"},
        {"text": "Show marketplace items", "intent": "marketplace"},
        {"text": "What products are available?", "intent": "marketplace"},
        {"text": "Show me things to buy", "intent": "marketplace"},
        
        # Transport (expanded)
        {"text": "How to reach Kolkata by train?", "intent": "transport"},
        {"text": "Transport options", "intent": "transport"},
        {"text": "How to get there?", "intent": "transport"},
        {"text": "Train booking", "intent": "transport"},
        {"text": "Travel routes", "intent": "transport"},
        {"text": "How do I get to Kolkata?", "intent": "transport"},
        {"text": "Transportation options", "intent": "transport"},
        {"text": "Book a train", "intent": "transport"},
        {"text": "How to travel?", "intent": "transport"},
        {"text": "Show transport options", "intent": "transport"},
        {"text": "Train routes", "intent": "transport"},
        {"text": "How can I reach?", "intent": "transport"},
        {"text": "Transportation help", "intent": "transport"},
        {"text": "Book transport", "intent": "transport"},
        {"text": "Travel options", "intent": "transport"},
        
        # General Chat (expanded significantly)
        {"text": "Hello, how are you?", "intent": "general_chat"},
        {"text": "Hi", "intent": "general_chat"},
        {"text": "Thanks", "intent": "general_chat"},
        {"text": "Good morning", "intent": "general_chat"},
        {"text": "Help me", "intent": "general_chat"},
        {"text": "Hello", "intent": "general_chat"},
        {"text": "Hey", "intent": "general_chat"},
        {"text": "Goodbye", "intent": "general_chat"},
        {"text": "Thank you", "intent": "general_chat"},
        {"text": "Thanks a lot", "intent": "general_chat"},
        {"text": "Good evening", "intent": "general_chat"},
        {"text": "Nice to meet you", "intent": "general_chat"},
        {"text": "How can you help?", "intent": "general_chat"},
        {"text": "What can you do?", "intent": "general_chat"},
        {"text": "Tell me about yourself", "intent": "general_chat"},
    ]
    
    with open(TRAINING_DATA_DIR / "intent_data.json", "w", encoding='utf-8') as f:
        json.dump(training_data, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Created {len(training_data)} intent training examples")
    print(f"   Intents: {len(set(d['intent'] for d in training_data))}")
    
    return training_data


def main():
    print("Preparing Training Data for YatriAI Models\n")
    print("=" * 50)
    
    # Extract data from TypeScript file
    try:
        destinations, guides, itineraries = extract_ts_data()
    except Exception as e:
        print(f"WARNING: Could not extract from TypeScript file: {e}")
        print("   Using synthetic data instead...")
        destinations, guides, itineraries = [], [], []
    
    # Create embedding training data
    create_embedding_training_data(destinations, guides, itineraries)
    
    # Create intent training data
    create_intent_training_data()
    
    print("\n" + "=" * 50)
    print("SUCCESS: Training data preparation complete!")
    print(f"   Data saved to: {TRAINING_DATA_DIR}")
    print("\nNext step: Run training script")
    print("   python scripts/train_models.py --model embeddings")
    print("   python scripts/train_models.py --model intent")


if __name__ == "__main__":
    main()

