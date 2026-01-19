# VetPath

## AI-Powered Skills Translation for Transitioning Veterans

VetPath is an AI application that translates military experience into civilian career opportunities, helping veterans find high-paying jobs in American manufacturing, technology, and skilled trades.

## Features

- **Military Profile Parser**: AI-powered extraction of skills from military experience
- **Career Matcher**: Match veteran skills to civilian careers using O*NET data
- **Resume Generator**: Create civilian-ready resumes tailored to target positions
- **Gap Analyzer**: Identify skills gaps and recommend training paths

## Tech Stack

### Backend
- Python 3.11+
- FastAPI (REST API framework)
- SQLite (database)
- Claude API (AI integration)

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
python seed_database.py  # Initialize O*NET data
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
ANTHROPIC_API_KEY=your_api_key_here
```

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

Built to support American veterans in their transition to civilian careers.
