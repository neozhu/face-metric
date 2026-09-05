import os
import sys
import time
import requests

WEIGHTS = {
    "retinaface.h5": "https://ghproxy.net/https://github.com/serengil/deepface_models/releases/download/v1.0/retinaface.h5",
    "arcface_weights.h5": "https://ghproxy.net/https://github.com/serengil/deepface_models/releases/download/v1.0/arcface_weights.h5",
    "facenet512_weights.h5": "https://ghproxy.net/https://github.com/serengil/deepface_models/releases/download/v1.0/facenet512_weights.h5",
}

EXPECTED_SIZES = {
    "retinaface.h5": 118667368,
    "arcface_weights.h5": 137026640,
    "facenet512_weights.h5": 94955648,
}

home = os.path.expanduser("~")
weights_dir = os.path.join(home, ".deepface", "weights")
os.makedirs(weights_dir, exist_ok=True)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

def log(msg):
    print(msg, flush=True)

def download_file(name: str, url: str):
    dest = os.path.join(weights_dir, name)
    part = dest + ".download"
    expected = EXPECTED_SIZES.get(name, 0)

    # Check if already complete
    if os.path.exists(dest):
        cur_size = os.path.getsize(dest)
        if cur_size == expected or (expected == 0 and cur_size > 10_000_000):
            log(f"[{name}] Already fully downloaded ({cur_size:,} bytes). Skipping.")
            return
        elif cur_size != expected and expected > 0:
            log(f"[{name}] Found file with mismatched size {cur_size:,} (expected {expected:,}), re-downloading...")
            os.remove(dest)

    downloaded = 0
    if os.path.exists(part):
        downloaded = os.path.getsize(part)
        if downloaded >= expected and expected > 0:
            # Maybe already complete
            os.rename(part, dest)
            log(f"[{name}] Download complete ({downloaded:,} bytes).")
            return

    req_headers = dict(HEADERS)
    if downloaded > 0:
        req_headers["Range"] = f"bytes={downloaded}-"
        log(f"[{name}] Resuming from {downloaded:,} bytes...")
    else:
        log(f"[{name}] Starting fresh download...")

    res = requests.get(url, headers=req_headers, stream=True, timeout=30)
    if res.status_code not in (200, 206):
        raise ValueError(f"HTTP {res.status_code}: {res.reason}")

    content_len = res.headers.get("content-length")
    if content_len:
        total = int(content_len) + (downloaded if res.status_code == 206 else 0)
    else:
        total = expected

    mode = "ab" if (downloaded > 0 and res.status_code == 206) else "wb"
    if mode == "wb":
        downloaded = 0

    start_time = time.time()
    last_print = start_time

    with open(part, mode) as f:
        for chunk in res.iter_content(chunk_size=1024 * 512):
            if chunk:
                f.write(chunk)
                downloaded += len(chunk)
                now = time.time()
                if now - last_print >= 2.0:
                    pct = (downloaded / total * 100) if total > 0 else 0
                    elapsed = now - start_time
                    speed = (downloaded / elapsed) / (1024 * 1024) if elapsed > 0 else 0
                    log(f"[{name}] {downloaded:,} / {total:,} ({pct:.1f}%) - {speed:.2f} MB/s")
                    last_print = now

    if os.path.exists(dest):
        os.remove(dest)
    os.rename(part, dest)
    log(f"[{name}] Finished: {dest} ({os.path.getsize(dest):,} bytes)!\n")

def main():
    log(f"Target weights directory: {weights_dir}")
    for name, url in WEIGHTS.items():
        for attempt in range(1, 4):
            try:
                download_file(name, url)
                break
            except Exception as e:
                log(f"[{name}] Attempt {attempt} failed: {e}")
                time.sleep(2)
        else:
            log(f"[{name}] All attempts failed!")

if __name__ == "__main__":
    main()
