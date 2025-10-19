/**
 * Validate dashboard data integrity
 * Run: node scripts/validate-dashboard-data.js
 */

import { db } from '../lib/db/index.js';
import { assessments, assessmentTypes, users } from '../lib/db/schema.js';
import { eq, and } from 'drizzle-orm';

async function validateData() {
  console.log('🔍 Validating dashboard data...\n');

  // Check users
  const allUsers = await db.select().from(users);
  console.log(`✅ Users found: ${allUsers.length}`);

  // Check assessment types
  const types = await db.select().from(assessmentTypes);
  console.log(`✅ Assessment types: ${types.length}`);
  types.forEach(t => {
    console.log(`   - ${t.code}: ${t.name} (${t.totalQuestions} questions)`);
  });

  // Check assessments
  const allAssessments = await db.select().from(assessments);
  console.log(`\n✅ Total assessments: ${allAssessments.length}`);

  const completed = allAssessments.filter(a => a.status === 'completed');
  console.log(`   - Completed: ${completed.length}`);
  console.log(`   - In Progress: ${allAssessments.filter(a => a.status === 'in_progress').length}`);
  console.log(`   - Abandoned: ${allAssessments.filter(a => a.status === 'abandoned').length}`);

  // Check for data issues
  console.log('\n🔍 Checking for issues...\n');

  let issues = 0;

  // Check for completed assessments without scores
  const completedNoScore = completed.filter(a => a.score === null);
  if (completedNoScore.length > 0) {
    console.log(`⚠️  ${completedNoScore.length} completed assessments missing scores`);
    issues++;
  }

  // Check for completed assessments without severity
  const completedNoSeverity = completed.filter(a => !a.severityLevel);
  if (completedNoSeverity.length > 0) {
    console.log(`⚠️  ${completedNoSeverity.length} completed assessments missing severity levels`);
    issues++;
  }

  // Check for completed assessments without completedAt
  const completedNoDate = completed.filter(a => !a.completedAt);
  if (completedNoDate.length > 0) {
    console.log(`⚠️  ${completedNoDate.length} completed assessments missing completion dates`);
    issues++;
  }

  // Check for orphaned assessments (user deleted)
  for (const assessment of allAssessments) {
    const [user] = await db.select().from(users).where(eq(users.id, assessment.userId)).limit(1);
    if (!user) {
      console.log(`⚠️  Assessment ${assessment.id} has no associated user`);
      issues++;
    }
  }

  if (issues === 0) {
    console.log('✅ No issues found!');
  }

  // Show sample completed assessments
  if (completed.length > 0) {
    console.log('\n📊 Sample completed assessments:\n');
    completed.slice(0, 5).forEach(a => {
      console.log(`   Score: ${a.score}, Severity: ${a.severityLevel}, Date: ${a.completedAt?.toLocaleDateString()}`);
    });
  }

  console.log('\n✅ Validation complete!\n');
  process.exit(0);
}

validateData().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
