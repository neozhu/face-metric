import os
import sys
import time
from pathlib import Path
from playwright.sync_api import sync_playwright

def run_browser_tests():
    project_root = Path("d:/github/face-metric")
    tom_path = str(project_root / "test" / "Tom.png")
    suri_path = str(project_root / "test" / "Suri.png")

    assert os.path.exists(tom_path), f"File not found: {tom_path}"
    assert os.path.exists(suri_path), f"File not found: {suri_path}"

    chrome_path = "C:/Program Files/Google/Chrome/Application/chrome.exe"
    if not os.path.exists(chrome_path):
        chrome_path = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
    
    print(f"Using browser executable: {chrome_path}")

    artifact_dir = Path("C:/Users/neo_z/.gemini/antigravity/brain/c74a9606-c2e8-419f-8b81-39c59b7d2272")

    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path=chrome_path,
            headless=True,
            args=["--disable-web-security", "--no-sandbox"]
        )

        # ----------------------------------------------------
        # 1. Desktop Test (1280x800)
        # ----------------------------------------------------
        print("\n=== Starting Desktop Browser Test (1280x800) ===")
        context_desktop = browser.new_context(viewport={"width": 1280, "height": 800})
        page = context_desktop.new_page()

        console_errors = []
        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
        page.on("pageerror", lambda exc: console_errors.append(str(exc)))

        print("Navigating to http://localhost:3000...")
        page.goto("http://localhost:3000", wait_until="networkidle")
        time.sleep(1)

        # Verify page title and header
        title = page.title()
        print(f"Page title: {title}")
        assert "Face Metric" in title

        # Verify file inputs exist
        file_inputs = page.locator('input[type="file"]')
        count = file_inputs.count()
        print(f"Found {count} file input elements")
        assert count == 2

        # Upload Photo 1 (Tom.png)
        print("Uploading Photo 1 (Tom.png)...")
        file_inputs.nth(0).set_input_files(tom_path)

        # Wait for Photo 1 preview to load (img[alt="preview"])
        print("Waiting for Photo 1 face detection & crop preview...")
        page.wait_for_selector('img[alt="preview"]', timeout=30000)
        print("Photo 1 preview successfully rendered!")

        # Upload Photo 2 (Suri.png)
        print("Uploading Photo 2 (Suri.png)...")
        file_inputs.nth(1).set_input_files(suri_path)

        # Wait for both previews to be visible
        print("Waiting for Photo 2 face detection & crop preview...")
        page.wait_for_function('document.querySelectorAll("img[alt=\'preview\']").length === 2', timeout=30000)
        print("Both photo previews successfully rendered!")

        # Compare button should now be enabled
        compare_btn = page.locator('button:has-text("Compare Resemblance")')
        assert compare_btn.is_enabled(), "Compare Resemblance button should be enabled after uploading 2 photos"
        print("Compare Resemblance button is enabled. Clicking to compare...")
        compare_btn.click()

        # Wait for comparison results
        print("Waiting for resemblance inference result...")
        page.wait_for_selector('text=Resemblance Analysis', timeout=60000)
        print("Resemblance Analysis section appeared!")

        # Give it a moment to animate score
        time.sleep(1.5)

        # Extract result information
        result_card = page.locator('text=Resemblance Analysis').locator('xpath=ancestor::div[contains(@class, "rounded-xl")]')
        result_text = result_card.inner_text()
        print("\n--- Extracted Comparison Card Content ---")
        print(result_text)
        print("------------------------------------------")

        # Capture desktop result screenshot
        desktop_result_path = artifact_dir / "browser_desktop_result.png"
        page.screenshot(path=str(desktop_result_path), full_page=True)
        print(f"Desktop result screenshot saved to: {desktop_result_path}")

        context_desktop.close()

        # ----------------------------------------------------
        # 2. Mobile Test (390x844, iPhone 14 / modern smartphone)
        # ----------------------------------------------------
        print("\n=== Starting Mobile Browser Test (390x844) ===")
        context_mobile = browser.new_context(
            viewport={"width": 390, "height": 844},
            user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1",
            is_mobile=True,
            has_touch=True
        )
        page_mobile = context_mobile.new_page()

        print("Navigating to http://localhost:3000 on mobile viewport...")
        page_mobile.goto("http://localhost:3000", wait_until="networkidle")
        time.sleep(1)

        mobile_inputs = page_mobile.locator('input[type="file"]')
        print("Uploading Photo 1 & Photo 2 on mobile...")
        mobile_inputs.nth(0).set_input_files(tom_path)
        page_mobile.wait_for_selector('img[alt="preview"]', timeout=30000)
        
        mobile_inputs.nth(1).set_input_files(suri_path)
        page_mobile.wait_for_function('document.querySelectorAll("img[alt=\'preview\']").length === 2', timeout=30000)
        print("Both previews rendered on mobile!")

        mobile_compare_btn = page_mobile.locator('button:has-text("Compare Resemblance")')
        mobile_compare_btn.click()

        print("Waiting for comparison inference result on mobile...")
        page_mobile.wait_for_selector('text=Resemblance Analysis', timeout=60000)
        time.sleep(1.5)

        # Capture mobile result screenshot
        mobile_result_path = artifact_dir / "browser_mobile_result.png"
        page_mobile.screenshot(path=str(mobile_result_path), full_page=True)
        print(f"Mobile result screenshot saved to: {mobile_result_path}")

        context_mobile.close()
        browser.close()

        print("\n==============================================")
        print("ALL BROWSER E2E TESTS PASSED SUCCESSFULLY!")
        print(f"Console errors: {len(console_errors)}")
        if console_errors:
            print("Errors noticed:", console_errors)
        print("==============================================")

if __name__ == "__main__":
    run_browser_tests()
