# -*- coding: utf-8 -*-
import os
import json
import sqlite3
from sqlalchemy import create_engine, text

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CATALOG_PATH = os.path.join(BASE_DIR, "catalogo_preguntas_pcm.json")
SQLITE_PATH = os.path.join(BASE_DIR, "sgd_database.db")
PG_URL = os.getenv("DATABASE_URL", "postgresql+psycopg2://postgres:postgrespassword@localhost:5434/sgd_madurez")

with open(CATALOG_PATH, "r", encoding="utf-8") as f:
    catalog = json.load(f)

print(f"[MIGRACIÓN] Catálogo cargado: {len(catalog)} dimensiones.")

# 1. ACTUALIZAR SQLITE
if os.path.exists(SQLITE_PATH):
    print(f"[MIGRACIÓN] Actualizando SQLite: {SQLITE_PATH}")
    conn = sqlite3.connect(SQLITE_PATH)
    cur = conn.cursor()
    
    # Agregar columnas si no existen
    cols = [col[1] for col in cur.execute("PRAGMA table_info(preguntas)").fetchall()]
    if "titulo" not in cols:
        cur.execute("ALTER TABLE preguntas ADD COLUMN titulo TEXT")
    if "admite_na" not in cols:
        cur.execute("ALTER TABLE preguntas ADD COLUMN admite_na TEXT DEFAULT 'No'")
    conn.commit()

    # Limpiar tablas maestras
    cur.execute("DELETE FROM opciones")
    cur.execute("DELETE FROM preguntas")
    cur.execute("DELETE FROM dimensiones")
    
    for d in catalog:
        cur.execute(
            "INSERT INTO dimensiones (id, codigo, nombre, orden) VALUES (?, ?, ?, ?)",
            (d["id"], d["code"], d["name"], d["id"])
        )
        for q in d["questions"]:
            cur.execute(
                """INSERT INTO preguntas 
                   (id, dimension_codigo, codigo, titulo, enunciado, explicacion, resultados_esperados, admite_na, orden) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    q["id"],
                    d["code"],
                    q["code"],
                    q.get("titulo", ""),
                    q["enunciado"],
                    q["explicacion"],
                    q["resultados_esperados"],
                    q.get("admite_na", "No"),
                    q["id"]
                )
            )
            for opt in q["options"]:
                cur.execute(
                    "INSERT INTO opciones (pregunta_codigo, nivel, etiqueta, descripcion) VALUES (?, ?, ?, ?)",
                    (q["code"], opt["nivel"], opt["etiqueta"], opt["descripcion"])
                )
    conn.commit()
    conn.close()
    print("[MIGRACIÓN SQLITE] Finalizada con éxito: 75 preguntas y opciones actualizadas.")

# 2. ACTUALIZAR POSTGRESQL (DOCKER / LOCAL)
# Intentar conectarse a PostgreSQL
for port in ["5434", "5432"]:
    url = f"postgresql+psycopg2://postgres:postgrespassword@localhost:{port}/sgd_madurez"
    try:
        engine = create_engine(url, connect_args={"connect_timeout": 3})
        with engine.begin() as conn:
            conn.execute(text("SELECT 1"))
            print(f"[MIGRACIÓN POSTGRESQL] Conectado a {url}")
            
            # Agregar columnas si no existen
            conn.execute(text("ALTER TABLE preguntas ADD COLUMN IF NOT EXISTS titulo VARCHAR(255);"))
            conn.execute(text("ALTER TABLE preguntas ADD COLUMN IF NOT EXISTS admite_na VARCHAR(255) DEFAULT 'No';"))
            
            # Limpiar tablas maestras
            conn.execute(text("DELETE FROM opciones;"))
            conn.execute(text("DELETE FROM preguntas;"))
            conn.execute(text("DELETE FROM dimensiones;"))
            
            for d in catalog:
                conn.execute(
                    text("INSERT INTO dimensiones (id, codigo, nombre, orden) VALUES (:id, :codigo, :nombre, :orden)"),
                    {"id": d["id"], "codigo": d["code"], "nombre": d["name"], "orden": d["id"]}
                )
                for q in d["questions"]:
                    conn.execute(
                        text("""INSERT INTO preguntas 
                                (id, dimension_codigo, codigo, titulo, enunciado, explicacion, resultados_esperados, admite_na, orden) 
                                VALUES (:id, :dimension_codigo, :codigo, :titulo, :enunciado, :explicacion, :resultados_esperados, :admite_na, :orden)"""),
                        {
                            "id": q["id"],
                            "dimension_codigo": d["code"],
                            "codigo": q["code"],
                            "titulo": q.get("titulo", ""),
                            "enunciado": q["enunciado"],
                            "explicacion": q["explicacion"],
                            "resultados_esperados": q["resultados_esperados"],
                            "admite_na": q.get("admite_na", "No"),
                            "orden": q["id"]
                        }
                    )
                    for opt in q["options"]:
                        conn.execute(
                            text("INSERT INTO opciones (pregunta_codigo, nivel, etiqueta, descripcion) VALUES (:pregunta_codigo, :nivel, :etiqueta, :descripcion)"),
                            {"pregunta_codigo": q["code"], "nivel": opt["nivel"], "etiqueta": opt["etiqueta"], "descripcion": opt["descripcion"]}
                        )
            print("[MIGRACIÓN POSTGRESQL] Finalizada con éxito en PostgreSQL.")
            break
    except Exception as e:
        print(f"[MIGRACIÓN POSTGRESQL] Puerto {port} no disponible o error: {e}")
