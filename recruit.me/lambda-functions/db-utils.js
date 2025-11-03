// connection utils for all Lambda functions to connect to the database

const mysql = require('mysql2/promise');

const connection = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

let pool;

function getPool(){
    if (!pool){
        pool = mysql.createPool(connection);
    }
    return pool;
}

// get connection from pool
async function getConnection(){
    const pool = getPool();
    return await pool.getConnection();
}

// query the database
async function query(sql, params = []){
    const connection = await getConnection();
    try {
        const [results] = await connection.execute(sql, params);
        return results;
    } catch (error) {
        throw new Error(`Database query failed: ${error.message}`);
    } finally {
        connection.release();
    }
}

// Lambda response helper
function createResponse(statusCode, body) {
    return {
      statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      },
      body: JSON.stringify(body),
    };
  }
  
  // error handler
  function handleError(error, message = 'Internal server error') {
    console.error('Error:', error);
    return createResponse(500, { error: message });
  }
  
  module.exports = {
    query,
    getConnection,
    createResponse,
    handleError,
  };
  
  
  