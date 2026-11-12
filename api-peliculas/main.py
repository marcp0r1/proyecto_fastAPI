"""Punto de entrada de la API de películas."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import models  # registra las tablas en Base antes de create_all
from database import Base, engine
from routers import peliculas

app = FastAPI(
    title="Cinema API",
    description="API para gestionar películas",
    version="1.0.0",
)

origins = [
    "http://localhost:5500",
    "http://127.0.0.1:5500",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(peliculas.router)


@app.get("/", tags=["Inicio"])
def inicio():
    """Devuelve un mensaje de bienvenida."""
    return {"mensaje": "Bienvenido a la API de películas"}
