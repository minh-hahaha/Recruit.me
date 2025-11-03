import mysql from 'mysql';
import { config } from './config.mjs';

let pool;

function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: config.host,
      user: config.user,
      password: config.password,
      database: config.database,
    });
  }
  return pool;
}

// get a single connection (for transactions)
export function getConnection() {
  const pool = getPool();
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) reject(err);
      else resolve(connection);
    });
  });
}


export function query(sql, params = []) {
  const pool = getPool();
  return new Promise((resolve, reject) => {
    pool.query(sql, params, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
}

export function createResponse(statusCode, body) {
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

export function handleError(error, message = 'Internal server error') {
  console.error('Error:', error);
  return createResponse(500, { error: message });
}
