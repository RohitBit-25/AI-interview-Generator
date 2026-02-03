#!/bin/bash
# Simple runner script for Mac/Linux

echo "Starting AI Interview Question Generator..."

# Check if streamlit is installed
if ! command -v streamlit &> /dev/null
then
    echo "Streamlit could not be found. Please install requirements first."
    echo "pip install -r requirements.txt"
    exit 1
fi

# Run the app
streamlit run app.py
