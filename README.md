# Mechovate
**AI-Powered Citizen Science & Data Quality Assurance Platform**

Mechovate is a robust platform designed to streamline the lifecycle of citizen science data. It integrates machine learning for automated validation, GraphRAG for contextual intelligence, and interactive voice agents for seamless data reporting.

---

## 🚀 Key Features

- **🤖 Automated Validation**: Multi-layer outlier detection using Scikit-learn (ML) and Great Expectations (GX) to filter invalid observations.
- **🎙️ Voice Agent Integration**: Real-time voice interaction via **LiveKit**, allowing users to submit data or query metrics hands-free.
- **🧠 Contextual Intelligence**: AI-driven chat powered by **GraphRAG** (LlamaIndex + Google Gemini) for deep insights and document-based information retrieval.
- **📊 Interactive Dashboard**: Real-time map visualization of observations, validity indicators, and data trends.
- **🕷️ Data Scraper**: Integrated Scrapy crawler (AQICN) for grounding citizen data against official environmental sources.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **UI/UX**: Tailwind CSS 4, Radix UI, Lucide React
- **Visualization**: React-Leaflet (Maps), Recharts (Analytics)
- **Voice/Video**: LiveKit Client SDK

### Backend
- **Core**: FastAPI (Python)
- **Database**: SQLite / SQLAlchemy
- **AI/ML**: Scikit-Learn, Google Gemini (Generative AI)
- **RAG**: LlamaIndex, NetworkX
- **Data Scraping**: Scrapy

---

## 🏁 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- Python (3.10+)
- LiveKit & Gemini API Keys

### 2. Backend Setup
```bash
cd backend
python -m venv .venv
# Activate venv:
# Windows: .venv\Scripts\activate
# Unix: source .venv/bin/activate
pip install -r requirements.txt
python main.py
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Environment Configuration
Configure your `.env` files in both `/frontend` and `/backend` directories:
- `LIVEKIT_API_KEY` & `LIVEKIT_API_SECRET`
- `GOOGLE_API_KEY` (for Gemini)
- `NEXT_PUBLIC_LIVEKIT_URL` (for Frontend)

---

## 📂 Project Structure

- `frontend/`: Next.js application, components, and livekit integration.
- `backend/`: FastAPI server, ML validation logic, and AI services.
- `backend/scraper/`: Scrapy spiders for environmental data grounding.
- `backend/knowledge_base/`: Source materials for GraphRAG-based intelligence.

---

## 📄 License
Part of the Mechovate Citizen Science Initiative. Created for advanced data validation and interactive reporting.
