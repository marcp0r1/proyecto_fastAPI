"""Modelos ORM de la aplicación."""

from sqlalchemy import Column, Float, Integer, String

from database import Base


class Pelicula(Base):
    """Película almacenada en la base de datos."""

    __tablename__ = "peliculas"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String, nullable=False)
    director = Column(String, nullable=False)
    año = Column(Integer, nullable=False)
    genero = Column(String, nullable=False)
    sinopsis = Column(String, nullable=True)
    puntuacion = Column(Float, nullable=True)
