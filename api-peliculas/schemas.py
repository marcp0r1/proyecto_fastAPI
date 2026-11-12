"""Esquemas de validación de datos (Pydantic)."""

from typing import Optional

from pydantic import BaseModel, ConfigDict


class PeliculaBase(BaseModel):
    """Campos comunes de una película."""

    titulo: str
    director: str
    año: int
    genero: str
    sinopsis: Optional[str] = None
    puntuacion: Optional[float] = None


class PeliculaCreate(PeliculaBase):
    """Datos necesarios para crear o actualizar una película."""


class PeliculaResponse(PeliculaBase):
    """Película devuelta por la API, incluyendo su ID."""

    id: int

    model_config = ConfigDict(from_attributes=True)
