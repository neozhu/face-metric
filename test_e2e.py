import requests
import json

print("1. Testing backend /health...")
r = requests.get("http://127.0.0.1:8000/health")
print("Backend health status:", r.status_code, r.json())
assert r.status_code == 200

print("\n2. Testing frontend proxy /api/preprocess with test/Tom.png...")
with open("test/Tom.png", "rb") as f:
    r = requests.post("http://localhost:3000/api/preprocess", files={"image": ("Tom.png", f, "image/png")})
print("Preprocess status:", r.status_code, "Content-Type:", r.headers.get("content-type"), "Length:", len(r.content))
assert r.status_code == 200
assert r.headers.get("content-type") == "image/jpeg"
assert len(r.content) > 1000

print("\n3. Testing frontend proxy /api/compare with test/Tom.png and test/Suri.png...")
with open("test/Tom.png", "rb") as fa, open("test/Suri.png", "rb") as fb:
    r = requests.post("http://localhost:3000/api/compare", files={
        "image_a": ("Tom.png", fa, "image/png"),
        "image_b": ("Suri.png", fb, "image/png"),
    })
print("Compare status:", r.status_code)
data = r.json()
print("Compare response:", json.dumps(data, indent=2))
assert r.status_code == 200
assert "similarity" in data
assert "distance" in data
assert "model" in data
assert "confidence" in data
assert "hint" in data

print("\nALL API PROXY AND INFERENCE TESTS PASSED!")
