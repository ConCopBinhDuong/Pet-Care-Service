import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// MySQL connection configuration for Google Cloud SQL
const dbConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    // Google Cloud SQL specific settings
    ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
    } : false,
    // Connection pool settings (using valid mysql2 options only)
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4',
    timezone: '+00:00'
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

/**
 * Database wrapper class to provide consistent interface
 * This mimics the SQLite synchronous interface but uses async/await internally
 */
class Database {
    constructor() {
        this.pool = pool;
    }

    /**
     * Execute a query that returns rows (SELECT)
     * @param {string} query - SQL query string
     * @param {Array} params - Query parameters
     * @returns {Array} Query results
     */
    async query(query, params = []) {
        try {
            const [rows] = await this.pool.execute(query, params);
            return rows;
        } catch (error) {
            console.error('Database query error:', error);
            throw error;
        }
    }

    /**
     * Execute a query that modifies data (INSERT, UPDATE, DELETE)
     * @param {string} query - SQL query string
     * @param {Array} params - Query parameters
     * @returns {Object} Result with insertId, affectedRows, etc.
     */
    async execute(query, params = []) {
        try {
            const [result] = await this.pool.execute(query, params);
            return {
                insertId: result.insertId,
                affectedRows: result.affectedRows,
                changedRows: result.changedRows,
                lastInsertRowid: result.insertId // SQLite compatibility
            };
        } catch (error) {
            console.error('Database execute error:', error);
            throw error;
        }
    }

    /**
     * Get a single row from query result
     * @param {string} query - SQL query string
     * @param {Array} params - Query parameters
     * @returns {Object|null} Single row or null
     */
    async get(query, params = []) {
        try {
            const [rows] = await this.pool.execute(query, params);
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error('Database get error:', error);
            throw error;
        }
    }

    /**
     * Get all rows from query result
     * @param {string} query - SQL query string
     * @param {Array} params - Query parameters
     * @returns {Array} All rows
     */
    async all(query, params = []) {
        try {
            const [rows] = await this.pool.execute(query, params);
            return rows;
        } catch (error) {
            console.error('Database all error:', error);
            throw error;
        }
    }

    /**
     * Run a query without returning results (for backwards compatibility)
     * @param {string} query - SQL query string
     * @param {Array} params - Query parameters
     * @returns {Object} Result object
     */
    async run(query, params = []) {
        return await this.execute(query, params);
    }

    /**
     * Begin transaction
     */
    async beginTransaction() {
        const connection = await this.pool.getConnection();
        await connection.beginTransaction();
        return connection;
    }

    /**
     * Commit transaction
     * @param {Object} connection - Database connection
     */
    async commit(connection) {
        await connection.commit();
        connection.release();
    }

    /**
     * Rollback transaction
     * @param {Object} connection - Database connection
     */
    async rollback(connection) {
        await connection.rollback();
        connection.release();
    }

    /**
     * Execute multiple queries in a transaction
     * @param {Function} callback - Function containing transaction logic
     */
    async transaction(callback) {
        const connection = await this.pool.getConnection();
        try {
            await connection.beginTransaction();
            const result = await callback(connection);
            await connection.commit();
            return result;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Close the database connection pool
     */
    async close() {
        await this.pool.end();
    }

    /**
     * Test database connection
     */
    async testConnection() {
        try {
            const connection = await this.pool.getConnection();
            await connection.ping();
            connection.release();
            console.log('Database connection successful');
            return true;
        } catch (error) {
            console.error('Database connection failed:', error.message);
            return false;
        }
    }
}

// Create and export database instance
const db = new Database();

// Test connection on startup
db.testConnection().catch(console.error);

export default db;
