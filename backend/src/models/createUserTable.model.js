import pool from "../configs/database.js";

const createUserTable = async (params) => {
    const queryText = `CREATE TABLE IF NOT EXIST users(
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
    )`
}

try {
    pool.query(queryText);
    console.log("User Table Created");
    
} catch (error) {
    console.log("Error in creating User Table");
    
    
}