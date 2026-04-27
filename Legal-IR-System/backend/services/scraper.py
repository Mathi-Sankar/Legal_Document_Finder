import os
import time
import urllib.parse
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from database import insert_document
from services.nlp import process_pdf_document, extract_metadata

def wait_and_click(driver, by, value, timeout=10):
    try:
        element = WebDriverWait(driver, timeout).until(EC.element_to_be_clickable((by, value)))
        element.click()
        return True
    except:
        return False

def run_scraper(year: int, keyword: str = "", case_name: str = "", max_pages: int = 1):
    """
    Background job to run the real Selenium scraper for IndianKanoon.
    """
    print(f"Starting real scraper...")
    
    download_dir = os.path.join(os.getcwd(), "court_docs")
    os.makedirs(download_dir, exist_ok=True)
    
    options = webdriver.ChromeOptions()
    options.add_argument("--headless=new")
    options.add_experimental_option("prefs", {
        "download.default_directory": download_dir,
        "plugins.always_open_pdf_externally": True,
        "download.prompt_for_download": False,
        "directory_upgrade": True
    })
    
    try:
        driver = webdriver.Chrome(options=options)
    except Exception as e:
        print(f"Failed to initialize Chrome Driver: {e}")
        return

    # Build Native Search URL
    from_date = f"1-1-{year}"
    to_date = f"31-12-{year}"
    query = f"doctypes:supremecourt fromdate:{from_date} todate:{to_date}"
    if keyword:
        query += f" {keyword}"
    if case_name:
        query += f" title:{case_name}"
        
    search_url = f"https://indiankanoon.org/search/?formInput={urllib.parse.quote(query)}"
    
    try:
        driver.get(search_url)
        time.sleep(2)
        
        # We'll just grab the first page since crawling takes time
        case_links = driver.find_elements(By.CSS_SELECTOR, 'a[href*="/doc/"]')
        links_to_visit = list({a.get_attribute("href") for a in case_links if "/doc/" in a.get_attribute("href")})
        
        print(f"Found {len(links_to_visit)} case links")
        
        for idx, link in enumerate(links_to_visit[:max_pages * 5]): # Cap at 5 cases for speed
            print(f"Visiting {link}")
            driver.get(link)
            time.sleep(2)
            
            # Start download
            clicked = wait_and_click(driver, By.XPATH, "//button[@id='pdfdoc']")
            if clicked:
                time.sleep(4) # Wait for download
                
        driver.quit()
        
        # Process newly downloaded PDFs
        for file in os.listdir(download_dir):
            if file.lower().endswith(".pdf"):
                print(f"Indexing {file}...")
                pdf_path = os.path.join(download_dir, file)
                text = process_pdf_document(pdf_path)
                if text:
                    metadata = extract_metadata(text)
                    # Override if user explicitly searched for it
                    if keyword: metadata['crime_type'] = keyword
                    if case_name: metadata['case_name'] = case_name
                    
                    insert_document(text, metadata, file)
                    
                    # Optional: delete file after index if we don't want to store huge pdfs, 
                    # but we keep them for now.
                    
    except Exception as e:
        print(f"Scraper error: {e}")
        try:
            driver.quit()
        except:
            pass

