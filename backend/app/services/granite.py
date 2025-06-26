def process_file(content: bytes) -> str:
    text = content.decode("utf-8", errors="ignore")
    # Simulate model processing
    return f"Processed {len(text)} characters of input."