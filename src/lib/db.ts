import mysql from 'mysql2/promise';

// Pool de conexão único reutilizável no Next.js
declare global {
  // eslint-disable-next-line no-var
  var _mysqlPool: mysql.Pool | undefined;
}

const getPool = (): mysql.Pool => {
  if (!global._mysqlPool) {
    global._mysqlPool = mysql.createPool({
      host: process.env.DB_HOST || 'srv1194.hstgr.io',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'u825658242_escola',
      password: process.env.DB_PASSWORD || '44434241Mm.',
      database: process.env.DB_NAME || 'u825658242_escola',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
    });
  }
  return global._mysqlPool;
};

export const pool = getPool();

export async function query<T = any>(sql: string, params: any[] = []): Promise<T> {
  const connection = await pool.getConnection();
  try {
    const [results] = await connection.query(sql, params);
    return results as T;
  } finally {
    connection.release();
  }
}
