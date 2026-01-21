# VetPath

## AI-Powered Skills Translation for Transitioning Veterans

VetPath is an AI application that translates military experience into civilian career opportunities, helping veterans find high-paying jobs in American manufacturing, technology, and skilled trades. Built with U.S.-based AI technology, it focuses on clear, factual skills translation and workforce readiness.

## Features

- **Military Profile Parser**: AI-powered extraction of skills from military experience
- **Career Matcher**: Match veteran skills to civilian careers using O*NET data
- **Resume Generator**: Create civilian-ready resumes tailored to target positions
- **Gap Analyzer**: Identify skills gaps and recommend training paths

## Mission

- Support veterans' transition into civilian careers
- Strengthen the American workforce in manufacturing, tech, and trades
- Use U.S.-based AI providers for factual skills translation

## Tech Stack

### Backend
- Python 3.11+
- FastAPI (REST API framework)
- SQLite (database)
- OpenRouter API → Claude Haiku 4.5 (U.S.-based AI with extended thinking)

### Frontend
- React.js
- Tailwind CSS

## Getting Started

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python scripts/download_data.py  # Fetch O*NET + BLS (no API keys)
python seed_database.py  # Initialize O*NET + BLS data
uvicorn main:app --reload
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

- `POST /api/parse` - Parse military experience into structured skills
- `POST /api/match` - Match skills to civilian careers
- `POST /api/resume` - Generate civilian resume
- `POST /api/gaps` - Analyze skills gaps and recommend training

## Environment Variables

Create a `.env` file in the backend directory:

```
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

The app uses OpenRouter to access Claude Haiku 4.5 with extended thinking (4K reasoning tokens) for enhanced skills analysis.

## Data Sources (Required)

VetPath uses real-world datasets instead of hardcoded samples. You must download and place data files locally before seeding.

Required:
- O*NET Database (tab-delimited files)

Optional (enhances results):
- BLS OEWS wage data (median wages)
- Military-to-civilian crosswalk file
- Training resources CSV

See `backend/data/README.md` for exact file names and download steps.

## Project Structure

```
vetpath/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── models.py            # Pydantic models
│   ├── database.py          # Database connection
│   ├── services/
│   │   ├── parser.py        # AI skills parser
│   │   ├── matcher.py       # Career matching
│   │   ├── resume.py        # Resume generation
│   │   └── gaps.py          # Gap analysis
│   ├── data/                # Real-world datasets (O*NET, BLS, crosswalk)
│   ├── seed_database.py     # Database seeder
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   └── ...
│   ├── package.json
│   └── ...
└── README.md
```

## License

MIT License

---

Built to support American veterans and strengthen the U.S. workforce.
