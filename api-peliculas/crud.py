"""Operaciones de acceso a datos para las películas."""

from sqlalchemy.orm import Session

import models
from schemas import PeliculaCreate


def obtener_peliculas(db: Session):
    """Devuelve todas las películas."""
    return db.query(models.Pelicula).all()


def obtener_pelicula(db: Session, id: int):
    """Devuelve una película por su ID, o None si no existe."""
    return db.query(models.Pelicula).filter(models.Pelicula.id == id).first()


def crear_pelicula(db: Session, pelicula: PeliculaCreate):
    """Crea una película y la guarda en la base de datos."""
    nueva_pelicula = models.Pelicula(**pelicula.model_dump())

    db.add(nueva_pelicula)
    db.commit()
    db.refresh(nueva_pelicula)

    return nueva_pelicula


def actualizar_pelicula(
    db: Session,
    pelicula_existente: models.Pelicula,
    datos: PeliculaCreate,
):
    """Actualiza todos los campos de una película existente."""
    for campo, valor in datos.model_dump().items():
        setattr(pelicula_existente, campo, valor)

    db.commit()
    db.refresh(pelicula_existente)

    return pelicula_existente


def eliminar_pelicula(db: Session, pelicula_existente: models.Pelicula):
    """Elimina una película de la base de datos."""
    db.delete(pelicula_existente)
    db.commit()
