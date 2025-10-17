const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...\n');

    // Test basic connection
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connected successfully!');
    console.log('📅 Server time:', result.rows[0].now);
    console.log('');

    // Test tables exist
    const tablesQuery = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    console.log('📊 Tables found:', tablesQuery.rows.length);
    tablesQuery.rows.forEach(row => {
      console.log('  -', row.table_name);
    });
    console.log('');

    // Test assessment types
    const assessment = await pool.query('SELECT * FROM assessment_types LIMIT 1');
    if (assessment.rows.length > 0) {
      console.log('✅ Found assessment type:', assessment.rows[0]?.code);
      console.log('📝 Assessment name:', assessment.rows[0]?.name);
      console.log('🔢 Total questions:', assessment.rows[0]?.total_questions);
      console.log('📊 Score range:', assessment.rows[0]?.min_score, '-', assessment.rows[0]?.max_score);
    } else {
      console.log('⚠️  No assessment types found. Run seed.sql to populate data.');
    }
    console.log('');

    // Count all assessment types
    const assessmentCount = await pool.query('SELECT COUNT(*) FROM assessment_types');
    console.log('📋 Total assessment types in database:', assessmentCount.rows[0].count);
    console.log('');

    console.log('✅ All database tests passed!');

    await pool.end();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('\n💡 Troubleshooting tips:');
    console.error('  1. Check that DATABASE_URL is set in .env.local');
    console.error('  2. Verify your Neon database is active');
    console.error('  3. Ensure you ran the schema.sql file');
    console.error('  4. Check that your connection string includes ?sslmode=require');
    process.exit(1);
  }
}

testConnection();
