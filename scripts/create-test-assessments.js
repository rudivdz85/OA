/**
 * Test script to create sample assessments for dashboard testing
 * Run: node scripts/create-test-assessments.js
 */

import { db } from '../lib/db/index.js';
import { assessments, assessmentTypes, users } from '../lib/db/schema.js';
import { eq } from 'drizzle-orm';

async function createTestAssessments() {
  try {
    console.log('🔍 Finding test user...');

    // Get the first user (or specify an email)
    const [user] = await db.select().from(users).limit(1);

    if (!user) {
      console.error('❌ No users found. Please create a user first.');
      process.exit(1);
    }

    console.log(`✅ Found user: ${user.email}`);

    // Get GAD-7 assessment type
    const [gad7Type] = await db
      .select()
      .from(assessmentTypes)
      .where(eq(assessmentTypes.code, 'GAD-7'))
      .limit(1);

    if (!gad7Type) {
      console.error('❌ GAD-7 assessment type not found.');
      process.exit(1);
    }

    console.log('✅ Found GAD-7 assessment type');

    // Create test assessments with varying scores over time
    const testAssessments = [
      {
        score: 18, // Severe
        severityLevel: 'severe',
        daysAgo: 60,
      },
      {
        score: 15, // Moderately severe
        severityLevel: 'moderately_severe',
        daysAgo: 45,
      },
      {
        score: 12, // Moderate
        severityLevel: 'moderate',
        daysAgo: 30,
      },
      {
        score: 8, // Mild
        severityLevel: 'mild',
        daysAgo: 15,
      },
      {
        score: 5, // Mild
        severityLevel: 'mild',
        daysAgo: 7,
      },
      {
        score: 3, // Minimal
        severityLevel: 'minimal',
        daysAgo: 1,
      },
    ];

    console.log('\n📝 Creating test assessments...\n');

    for (const testData of testAssessments) {
      const completedAt = new Date();
      completedAt.setDate(completedAt.getDate() - testData.daysAgo);

      // Create sample answers (all questions answered with value proportional to score)
      const answers = Array.from({ length: 7 }, (_, i) => ({
        questionId: i + 1,
        answer: Math.floor(testData.score / 7), // Distribute score evenly
        timestamp: completedAt.toISOString(),
      }));

      const [newAssessment] = await db
        .insert(assessments)
        .values({
          userId: user.id,
          assessmentTypeId: gad7Type.id,
          score: testData.score,
          severityLevel: testData.severityLevel,
          status: 'completed',
          currentQuestionIndex: 7,
          assessmentVersion: gad7Type.version,
          answers: answers,
          completedAt: completedAt,
          createdAt: completedAt,
          updatedAt: completedAt,
        })
        .returning();

      console.log(`✅ Created assessment: Score ${testData.score} (${testData.severityLevel}) - ${testData.daysAgo} days ago`);
    }

    console.log('\n🎉 Successfully created test assessments!');
    console.log(`\n📊 Summary:`);
    console.log(`   User: ${user.email}`);
    console.log(`   Assessments created: ${testAssessments.length}`);
    console.log(`   Score trend: 18 → 3 (improving)`);
    console.log(`\n💡 Now visit /dashboard to see the results!\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test assessments:', error);
    process.exit(1);
  }
}

createTestAssessments();
