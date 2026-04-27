from fastapi import FastAPI, UploadFile, File, Form, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import shutil
import os

from services.scraper import run_scraper
from services.nlp import process_pdf_document, extract_metadata, query_rag
from database import insert_document, search_documents

app = FastAPI(title="Legal Information Retrieval System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)
os.makedirs("court_docs", exist_ok=True)

class ScrapeRequest(BaseModel):
    year: int
    keyword: Optional[str] = ""
    case_name: Optional[str] = ""
    max_pages: int = 1

class QueryRequest(BaseModel):
    query: str
    filters: dict = {} # e.g., {"date": "1952", "crime_type": "Theft", "case_name": ""}

@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    # Save file
    file_path = os.path.join("uploads", file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Process PDF to text
    text_content = process_pdf_document(file_path)
    
    # NLP extraction of metadata
    metadata = extract_metadata(text_content)
    
    # Insert to DB
    doc_id = insert_document(text_content, metadata, file.filename)
    
    return {"message": "Successfully uploaded and indexed", "doc_id": doc_id, "metadata": metadata}

class SummarizeRequest(BaseModel):
    query: str
    text: str

@app.post("/scrape")
async def trigger_scrape(req: ScrapeRequest, background_tasks: BackgroundTasks):
    background_tasks.add_task(run_scraper, req.year, req.keyword, req.case_name, req.max_pages)
    return {"message": f"Scraping started in the background."}

@app.post("/summarize")
async def generate_summary(req: SummarizeRequest):
    # This will generate a specific summary for a clicked doc
    answer = query_rag(req.query, req.text)
    return {"summary": answer}

@app.post("/search")
async def search_and_query(req: QueryRequest):
    # 1. Retrieve initial nodes based on embeddings and filters
    results = search_documents(req.query, req.filters)
    
    if not results:
        return {"answer": "No relevant legal documents found.", "sources": []}
    
    return {"answer": "", "sources": results}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
