import sqlite3
import os
import json
from typing import Dict, Any, List, Optional
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "ecotrack.db")

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    # Packages Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS packages (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        package_type TEXT NOT NULL,
        plastic_type TEXT NOT NULL,
        resin_code INTEGER,
        registration_date TEXT NOT NULL,
        usage_count INTEGER DEFAULT 0,
        weight_grams REAL DEFAULT 0,
        intended_use TEXT DEFAULT 'General',
        current_condition TEXT DEFAULT 'Pending Assessment',
        current_score INTEGER DEFAULT 0,
        current_recommendation TEXT DEFAULT 'FURTHER INSPECTION REQUIRED',
        recovery_status TEXT DEFAULT 'Awaiting Assessment',
        image_url TEXT DEFAULT '',
        notes TEXT DEFAULT '',
        is_demo INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    )
    """)

    # Inspections Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS inspections (
        id TEXT PRIMARY KEY,
        package_id TEXT NOT NULL,
        inspection_date TEXT NOT NULL,
        assessment_method TEXT NOT NULL,
        findings TEXT NOT NULL, -- JSON string array
        condition_score INTEGER NOT NULL,
        confidence_pct REAL NOT NULL,
        recommendation TEXT NOT NULL,
        rationale TEXT NOT NULL,
        image_url TEXT DEFAULT '',
        annotated_image_url TEXT DEFAULT '',
        inspector_notes TEXT DEFAULT '',
        is_demo INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE
    )
    """)

    # Recovery Decisions Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS recovery_records (
        id TEXT PRIMARY KEY,
        package_id TEXT NOT NULL,
        decision_date TEXT NOT NULL,
        priority_level TEXT NOT NULL,
        recommended_action TEXT NOT NULL,
        final_outcome TEXT NOT NULL,
        environmental_rationale TEXT NOT NULL,
        preparation_steps TEXT NOT NULL, -- JSON string array
        safety_notes TEXT NOT NULL,
        facility_info TEXT DEFAULT '',
        is_verified INTEGER DEFAULT 0,
        inspector_notes TEXT DEFAULT '',
        is_demo INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE
    )
    """)

    # Config / Settings Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
    )
    """)

    # Default settings if not present
    default_settings = {
        "min_reuse_score": "75",
        "crack_penalty": "35",
        "deformation_penalty": "30",
        "discoloration_penalty": "15",
        "food_contact_strict": "true",
        "max_reuse_cycles_warning": "30",
        "demo_mode": "true"
    }

    for k, v in default_settings.items():
        cursor.execute("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)", (k, v))

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully at", DB_PATH)
