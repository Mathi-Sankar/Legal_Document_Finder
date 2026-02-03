import chromadb
from chromadb.config import Settings
import uuid

# Initialize local Vector DB
client = chromadb.PersistentClient(path="./chroma_db")
collection = client.get_or_create_collection(
    name="legal_docs",
    metadata={"hnsw:space": "cosine"}
)

def insert_document(text_content: str, metadata: dict, filename: str) -> str:
    """Inserts document text into Chroma DB with structured metadata using sliding window chunking."""
    base_doc_id = str(uuid.uuid4())

    chroma_metadata = {
        "filename": filename,
        "date": metadata.get("date", "Unknown"),
        "crime_type": metadata.get("crime_type", "General"),
        "case_name": metadata.get("case_name", "Unknown Case")
    }

    # Chunking: 3000 chars with 500 char overlap
    chunk_size = 3000
    overlap = 500

    chunks = []
    ids = []
    metadatas = []

    start = 0
    while start < len(text_content):
        end = min(start + chunk_size, len(text_content))
        chunk = text_content[start:end]
        chunks.append(chunk)
        ids.append(f"{base_doc_id}_{len(chunks)-1}")
        metadatas.append(chroma_metadata)

        start += (chunk_size - overlap)
        if start >= len(text_content):
            break

    if chunks:
        collection.add(
            documents=chunks,
            metadatas=metadatas,
            ids=ids
        )
    return base_doc_id

def search_documents(query: str, filters: dict, n_results: int = 5):
    """Searches using Dense retrieval with exact match filtering on metadata."""

    where_clause = {}
    if "date" in filters and filters["date"]:
        where_clause["date"] = filters["date"]
    if "crime_type" in filters and filters["crime_type"]:
        where_clause["crime_type"] = filters["crime_type"]
    if "case_name" in filters and filters["case_name"]:
        where_clause["case_name"] = filters["case_name"]

    # Fetch more than needed so deduplication still yields enough unique docs
    count = collection.count()
    if count == 0:
        return []
    fetch_n = min(count, n_results * 5)

    query_kwargs = {
        "query_texts": [query],
        "n_results": fetch_n
    }
    if len(where_clause) == 1:
        query_kwargs["where"] = where_clause
    elif len(where_clause) > 1:
        query_kwargs["where"] = {"$and": [{k: v} for k, v in where_clause.items()]}

    results = collection.query(**query_kwargs)

    if not results or not results['documents'] or len(results['documents'][0]) == 0:
        return []

    docs = results['documents'][0]
    metadatas = results['metadatas'][0]
    distances = results['distances'][0]

    # Deduplicate: keep best-scoring chunk per filename
    seen = {}
    for i in range(len(docs)):
        filename = metadatas[i].get("filename", f"doc_{i}")
        if filename not in seen or distances[i] < seen[filename]["score"]:
            seen[filename] = {
                "text": docs[i],
                "metadata": metadatas[i],
                "score": distances[i]
            }

    return sorted(seen.values(), key=lambda x: x["score"])[:n_results]
