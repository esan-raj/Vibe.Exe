@echo off
REM Quick Training Script for Windows

echo ========================================
echo YatriAI Model Training
echo ========================================
echo.

echo Step 1: Installing dependencies...
pip install sentence-transformers transformers torch datasets

echo.
echo Step 2: Preparing training data...
python scripts/prepare_training_data.py

echo.
echo Step 3: Training embeddings model...
python scripts/train_models.py --model embeddings

echo.
echo Step 4: Training intent classifier...
python scripts/train_models.py --model intent

echo.
echo ========================================
echo Training Complete!
echo ========================================
pause










