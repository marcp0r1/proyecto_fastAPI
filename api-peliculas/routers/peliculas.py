"""Endpoints (controlador) para gestionar películas."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import crud
from database import get_db
from schemas import PeliculaCreate, PeliculaResponse

router = APIRouter(prefix="/peliculas", tags=["Películas"])


@router.get("", response_model=list[PeliculaResponse])
def obtener_peliculas(db: Session = Depends(get_db)):
    """Lista todas las películas."""
    return crud.obtener_peliculas(db)


@router.get("/{id}", response_model=PeliculaResponse)
def obtener_pelicula(id: int, db: Session = Depends(get_db)):
    """Devuelve una película por su ID."""
    pelicula = crud.obtener_pelicula(db, id)

    if pelicula is None:
        raise HTTPException(status_code=404, detail="Película no encontrada")

    return pelicula


@router.post("", response_model=PeliculaResponse, status_code=201)
def crear_pelicula(pelicula: PeliculaCreate, db: Session = Depends(get_db)):
    """Crea una nueva película."""
    return crud.crear_pelicula(db, pelicula)


@router.put("/{id}", response_model=PeliculaResponse)
def actualizar_pelicula(
    id: int,
    pelicula: PeliculaCreate,
    db: Session = Depends(get_db),
):
    """Actualiza una película existente."""
    pelicula_existente = crud.obtener_pelicula(db, id)

    if pelicula_existente is None:
        raise HTTPException(status_code=404, detail="Película no encontrada")

    return crud.actualizar_pelicula(db, pelicula_existente, pelicula)


@router.delete("/{id}")
def eliminar_pelicula(id: int, db: Session = Depends(get_db)):
    """Elimina una película por su ID."""
    pelicula_existente = crud.obtener_pelicula(db, id)

    if pelicula_existente is None:
        raise HTTPException(status_code=404, detail="Película no encontrada")

    crud.eliminar_pelicula(db, pelicula_existente)

    return {"mensaje": "Película eliminada correctamente"}
