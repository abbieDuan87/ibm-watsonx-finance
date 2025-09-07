# app/api/deps.py
from fastapi import Depends
from app.services.watsonx import make_watsonx_model
from ibm_watsonx_ai.foundation_models import ModelInference

def get_watsonx_model() -> ModelInference:
    return make_watsonx_model()