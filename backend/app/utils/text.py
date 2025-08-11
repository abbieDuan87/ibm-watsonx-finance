# app/utils/text.py
def clean_text(s: str) -> str:
    s = s.strip()
    while s and s[0] in ".:->•*“”\"'` ":
        s = s[1:].lstrip()
    return s

SYSTEM_FINANCE = (
    "You are a concise finance assistant. "
    "Answer clearly in bullet points. If unsure, say so."
)