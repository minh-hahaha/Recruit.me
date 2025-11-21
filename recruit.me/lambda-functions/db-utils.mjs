import mysql from 'mysql';
import { config } from './config.mjs';


const pool = mysql.createPool({
  host: config.host,
  user: config.user,
  password: config.password,
  database: config.database,
  connectionLimit: 5
});

// get a single connection (for transactions)
export function getConnection() {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, conn) => {
      if (err) return reject(err);
      resolve(conn);
    });
  });
}

export function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    pool.query(sql, params, (err, results) => {  
      if (err) return reject(err);
      resolve(results);
    });
  });
}

export function createResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Credentials': "true"
    },
    body: JSON.stringify(body),
  };
}

export function handleError(error, message = 'Internal server error') {
  console.error('Error:', error);
  return createResponse(500, { error: message });
}
