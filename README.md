# FinSight AI (ibm-watsonx-finance)

Empowering small businesses with AI-driven financial insights. Upload your financial reports (PDF, CSV, XLSX) and interact with a WatsonX-powered assistant to get instant, actionable analysis and guidance—no data science expertise required.

---

## Features

- **File Upload:** Upload PDF, CSV, or Excel files for automatic text extraction and analysis.
- **WatsonX Chat:** Ask questions about your uploaded data or general finance topics and get AI-powered answers.
- **Modern UI:** Built with Next.js, Tailwind CSS, and daisyUI for a clean, responsive experience.
- **Backend API:** FastAPI backend for file parsing, OCR, and integration with IBM WatsonX foundation models.

---

## Folder Structure

```
skillsbuild-finance-app/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes/
│   │   │   │   ├── analyze.py
│   │   │   │   └── upload.py
│   │   │   └── deps.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   └── logging.py
│   │   ├── models/
│   │   │   └── schemas.py
│   │   ├── services/
│   │   │   ├── granite.py
│   │   │   ├── ocr.py
│   │   │   └── watsonx.py
│   │   ├── utils/
│   │   │   └── text.py
│   │   └── main.py
│   ├── requirements.txt
│   └── start.sh
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/
│   │   │   │   ├── analyze/route.ts
│   │   │   │   └── upload/route.ts
│   │   │   ├── components/
│   │   │   │   ├── ChatWindow.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── MessageBubble.tsx
│   │   │   │   └── UploadArea.tsx
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── tutorial/page.tsx
│   │   │   ├── upload/page.tsx
│   │   │   └── upload-test/page.tsx
│   │   ├── hooks/
│   │   │   └── useChat.ts
│   │   ├── lib/
│   │   │   └── api.ts
│   │   ├── types/
│   │   │   └── chat.ts
│   │   ├── utils/
│   │   │   └── parsers.ts
│   │   └── public/
│   │       └── logo.png
│   ├── package.json
│   ├── tailwind.config.js
│   └── globals.css
├── package.json
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- Python 3.10+
- pip

### Backend Setup

1. Navigate to the backend folder:
   ```sh
   cd backend
   ```
2. Install dependencies:
   ```sh
   pip install -r requirements.txt
   ```
3. Start the backend server:
   ```sh
   uvicorn app.main:app --reload
   ```

### Frontend Setup

1. Navigate to the frontend folder:
   ```sh
   cd frontend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the frontend dev server:
   ```sh
   npm run dev
   ```

---

## Usage

- Go to `http://localhost:3000` in your browser.
- Upload a financial report (PDF, CSV, XLSX).
- View extracted text and AI-generated insights.
- Use the chat window to ask questions about your data or general finance topics.

---

## Technologies Used

- **Frontend:** Next.js, React, Tailwind CSS, daisyUI
- **Backend:** FastAPI, pandas, pytesseract, pdf2image, openpyxl
- **AI:** IBM WatsonX foundation models

---

## License

This project is for educational and demonstration purposes. See [LICENSE](LICENSE) for details.

---

## Acknowledgements

- IBM SkillsBuild
- IBM WatsonX
- Open source libraries and the developer community
