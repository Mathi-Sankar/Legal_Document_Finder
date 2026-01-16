<div align="center">
  <h1>⚖️ Lexretrieve</h1>
  <p><strong>A Semantic Legal Search Engine & Information Retrieval System</strong></p>
</div>

> Hi, I'm **[Mathi Sankar M R](https://mathi-sankar.github.io/portfolio)** — I built this semantic legal search engine to explore vector embeddings, Retrieval-Augmented Generation (RAG), and automated web scraping.

---

<div align="center">
  <a href="https://frontend-one-beta-89.vercel.app"><strong>🚀 Live Demo</strong></a> | 
  <a href="#-architecture"><strong>Architecture</strong></a> | 
  <a href="#-features"><strong>Features</strong></a> | 
  <a href="#-deployment"><strong>Deployment</strong></a>
</div>

<br>

Lexretrieve is a full-stack, AI-powered Information Retrieval (IR) system designed to scrape, index, and semantically search complex legal documents (specifically Indian Supreme Court judgments). Built as a privacy-first alternative to expensive legal research platforms, it utilizes local vector embeddings and Retrieval-Augmented Generation (RAG) to provide fast, highly accurate legal insights.

## ✨ Features

- **Semantic Search Engine**: Uses **ChromaDB** for vector embeddings to perform highly accurate semantic searches, going beyond traditional keyword matching.
- **On-Demand AI Summarization (RAG)**: Generates concise, context-aware summaries of complex legal judgments instantly using Retrieval-Augmented Generation.
- **Automated Web Scraping Pipeline**: Background Selenium scrapers dynamically hunt down, download, and index specific court judgments from legal databases.
- **Intelligent Document Processing**: Automatically extracts structured metadata (e.g., date, case name, crime type) and utilizes sliding window chunking to process massive PDFs without losing context.
- **Privacy First & Cost Efficient**: Designed to run entirely on local infrastructure with local Persistent ChromaDB, completely eliminating dependency on paid third-party APIs.

## 🏗 Architecture

### Tech Stack
- **Frontend**: React.js, Vite
- **Backend**: Python, FastAPI, Uvicorn
- **Vector Database**: ChromaDB (Local Persistent)
- **Data Pipeline**: Selenium (Web Scraping), PyPDF (Document Processing)

---

## 📖 How to Use

The application is divided into two primary workflows:

### 1. Data Ingestion
Before you can search, the system needs legal documents to index. You can ingest data in two ways:
- **Local Upload**: Upload existing legal PDF documents directly from your computer. The system will parse, chunk, and generate vector embeddings for them.
- **Web Scraping**: Enter specific case details (like year, keyword, or crime type). The backend will use a headless Selenium browser to automatically hunt down, download, and index the relevant Supreme Court judgments straight from public legal databases.

### 2. Smart Search
Once the data is ingested and indexed into ChromaDB, you can use the **Smart Search** interface:
- **Semantic Filtering**: Search through the uploaded data using natural language queries instead of exact keyword matches.
- **Contextual Summaries**: Select a retrieved document chunk to instantly generate an AI-powered summary explaining why the document is relevant to your case.

---

## 🚀 Deployment

The project is split into a React frontend and a Python backend. Because the backend requires Google Chrome (for Selenium) and a persistent disk (for ChromaDB), we recommend deploying using **Render** for the backend and **Vercel** for the frontend.

### 1. Deploy the Backend (Render)
1. Fork or upload this repository to your GitHub.
2. Sign in to [Render](https://render.com/).
3. Click **New > Blueprint**.
4. Connect this repository. Render will automatically read the `render.yaml` file in the `backend/` directory and build the Docker image with Google Chrome installed on the free tier. *(Note: To run entirely on the free tier without requiring a credit card, the ChromaDB database is embedded statelessly. Newly scraped documents will reset on server sleep, but the pre-loaded GitHub documents remain intact).*
5. Wait for the deployment to finish and copy your live backend URL (e.g., `https://lexretrieve-backend.onrender.com`).

### 2. Deploy the Frontend (Vercel)
1. Sign in to [Vercel](https://vercel.com/).
2. Click **Add New Project** and connect your GitHub repository.
3. Set the **Root Directory** to `Legal-IR-System/frontend`.
4. Add an Environment Variable: 
   - `VITE_API_URL` = `https://lexretrieve-backend.onrender.com`
5. Click **Deploy**.

---

## 💻 Local Setup

If you wish to run the project locally on your machine:

### Backend Setup
```bash
cd Legal-IR-System/backend
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
pip install -r requirements.txt
python main.py
```
*The backend API will be available at http://localhost:8000*

### Frontend Setup
```bash
cd Legal-IR-System/frontend
npm install
npm run dev
```
*The frontend will be available at http://localhost:5173*

---
<div align="center">
  <i>Developed with ❤️ by <a href="https://github.com/Mathi-Sankar">Mathi Sankar</a></i>
</div>
