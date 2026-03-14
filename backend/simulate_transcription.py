import requests
import time
import random

API_URL = "http://127.0.0.1:8000/update-transcription"

transcription_cycle = [
    "Discussion on Digital Connectivity Bill begins in the Lok Sabha.",
    "वित्त मंत्री निर्मला सीतारमण संसद में अनुपूरक मांगों पर बोल रही हैं।",
    "Finance Minister emphasizes the ₹1 lakh crore stabilisation fund for energy.",
    "West Asia tensions cited as major risk for oil price stability.",
    "विपक्ष ने ग्रामीण एलपीजी सब्सिडी के आवंटन पर स्पष्टीकरण मांगा।",
    "Speaker calls for order as the zero-hour debate proceeds.",
    "Climate Resilient Agriculture bill introduced by private members.",
    "उत्तर पूर्व क्षेत्र के लिए नई बुनियादी ढांचा परियोजना की घोषणा की गई।",
    "Discussion on Data Protection framework expected in next session.",
    "Green Energy Corridors expansion approved for three major states.",
]

print("Starting Live Transcription Simulation (Version 2.0)...")

counter = 0
while True:
    counter += 1
    base_text = random.choice(transcription_cycle)
    text = f"[{counter}] {base_text}"
    try:
        r = requests.post(API_URL, json={"text": text})
        if r.status_code == 200:
            print(f"Update: {text}")
        else:
            print(f"Error: {r.status_code}")
    except Exception as e:
        print(f"Failed: {e}")
    
    time.sleep(10) # Update every 10 seconds to allow the frontend typing effect to catch up
