import spacy
import fitz
from contextlib import asynccontextmanager
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import FileResponse 
from pydantic import BaseModel
from typing import List
from fastapi.middleware.cors import CORSMiddleware
import json
from io import BytesIO
import pymupdf
import uuid
import pathlib
import shutil
nlp = None
skills = ""
ruler = None

class SkillRequest(BaseModel):
    skills: List[str] = []

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Code executed on startup
    # Load the English model
    global nlp
    nlp = spacy.load('en_core_web_sm')
    skills = "jz_skill_patterns.jsonl"
    ruler = nlp.add_pipe("entity_ruler", config={"validate": True}, before="ner")
    ruler.from_disk(skills)
    print("Loaded skill patterns")
    yield
    # Code executed on shut down
    print("Shutting down")


app = FastAPI(lifespan=lifespan)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # List of origins allowed to make requests
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

@app.post("/extract_skills")
async def extract_skills(skills:List[str] = Form(...) ,file: UploadFile=File(...)):
    try:
        global nlp
        res = [] 
        binary_data = await file.read()
        pdf_text = convert_pdf_to_txt(binary_data)
        doc = nlp(pdf_text)
        for ent in doc.ents:
            if ent.label_ == 'SKILL' and ent.text.upper() in skills and ent.text.upper() not in res:
                res.append(ent.text.upper())
        matching_score = (len(res) / len(skills)) * 100
        return {"matching_score": matching_score, "skills_matched": res}
    except Exception as e:
        return {"error": "error while extracting skills", "message": str(e)}

@app.post("/highlight_skills")
async def highlight_skills(skills:List[str] = Form(...) ,file: UploadFile=File(...)):
    try:
        base = pathlib.Path('../tmp')
        base.mkdir(parents=True, exist_ok=True)
        file_id = str(uuid.uuid4())
        filename = file_id + ".pdf"
        file_path = str(base / filename)
        binary_data = await file.read()
        pdf_doc = pymupdf.open(stream=binary_data, filetype="pdf")
        rects = []
        for i in range(len(pdf_doc)):
            page = pdf_doc[i]
            for skill in skills:
                rects = rects + page.search_for(skill)
            page.add_highlight_annot(rects)
        with open(file_path, "wb") as f:
            pdf_doc.save(f)
        pdf_doc.close()
        return {"success": True, "filename": file_id }
    except Exception as e:
        return {"error": "error while highlighting skills", "message": str(e)}

@app.get("/get_file/{filename}")
async def get_file(filename: str):
    file_path = pathlib.Path('../tmp/' + filename + '.pdf')
    return FileResponse(file_path, media_type='application/pdf')

def convert_pdf_to_txt(binary):
    # Create a empty PDF document
    pdf_doc = fitz.open(stream=binary, filetype="pdf")
    text = ""
    for page in pdf_doc:
        text += page.get_text()
    tx = " ".join(text.split("\n"))
    return tx

@app.get("/delete_dir")
def delete_directory():
    try:
        path = pathlib.Path('../tmp')
        if path.is_dir():
            shutil.rmtree(path)
        return {"success": True}
    except Exception as e:
        return {"success": False, "message": str(e)}


    
