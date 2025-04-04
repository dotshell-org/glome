import { db } from '../config.ts';

db.exec(`
    CREATE TABLE IF NOT EXISTS additions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        stock_name TEXT,
        date TEXT,
        object TEXT,
        quantity INTEGER
    );
    
    CREATE TABLE IF NOT EXISTS deletions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        stock_name TEXT,
        date TEXT,
        object TEXT,
        quantity INTEGER
    );
`);
