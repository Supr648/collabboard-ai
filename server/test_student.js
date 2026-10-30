import http from 'http';

const request = (path, method = 'GET', data = null, token = null) => {
  return new Promise((resolve, reject) => {
    const payload = data ? JSON.stringify(data) : null;
    const headers = { 'Content-Type': 'application/json' };
    if (payload) headers['Content-Length'] = Buffer.byteLength(payload);
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(
      { hostname: 'localhost', port: 5000, path, method, headers },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(body) });
          } catch (e) {
            resolve({ status: res.statusCode, data: body });
          }
        });
      }
    );
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
};

const run = async () => {
  console.log('🧪 Testing Student Learning Workspace & AI Suite...');
  const testId = Date.now();

  // Register student
  const regRes = await request('/api/auth/register', 'POST', {
    name: 'Maya Lin',
    email: `maya_${testId}@mit.edu`,
    password: 'password123',
    primaryWorkspaceType: 'student',
  });

  const token = regRes.data.token;
  console.log('✅ Student registered:', regRes.data.user.name);

  // 1. Fetch student summary
  const summaryRes = await request('/api/student/summary', 'GET', null, token);
  if (summaryRes.status !== 200 || !summaryRes.data.decks) {
    console.error('❌ Failed to fetch student summary:', summaryRes);
    process.exit(1);
  }
  console.log(`✅ Student summary loaded: ${summaryRes.data.stats.totalDecks} decks, ${summaryRes.data.stats.totalCards} cards, mastery: ${summaryRes.data.stats.masteryPercentage}%`);

  // 2. Update flashcard mastery
  const flashcardDeck = summaryRes.data.decks.find((d) => d.type === 'flashcards');
  const deckId = flashcardDeck._id || flashcardDeck.id;
  const masteryRes = await request(`/api/student/decks/${deckId}/cards/0/mastery`, 'PUT', {
    masteryScore: 5,
  }, token);

  if (masteryRes.status !== 200) {
    console.error('❌ Failed to update card mastery:', masteryRes);
    process.exit(1);
  }
  console.log('✅ Flashcard mastery score updated to 5 (Mastered)');

  // 3. Submit quiz attempt
  const quizDeck = summaryRes.data.decks.find((d) => d.type === 'quiz');
  const quizId = quizDeck._id || quizDeck.id;
  const attemptRes = await request(`/api/student/decks/${quizId}/attempt`, 'POST', {
    score: 3,
    total: 4,
    weakTopics: ['Distributed Eventual Consistency'],
  }, token);

  if (attemptRes.status !== 200) {
    console.error('❌ Failed to submit quiz attempt:', attemptRes);
    process.exit(1);
  }
  console.log('✅ Quiz attempt recorded: 3/4 score, identified weak topic: Distributed Eventual Consistency');

  // 4. Test AI Quiz generation
  const aiQuizRes = await request('/api/student/ai-quiz', 'POST', {
    topic: 'Relational Database Indexing B-Trees',
    subject: 'Computer Science',
  }, token);

  if (aiQuizRes.status !== 201 || !aiQuizRes.data.deck.questions) {
    console.error('❌ Failed to generate AI Quiz:', aiQuizRes);
    process.exit(1);
  }
  console.log(`✅ AI Quiz synthesized: '${aiQuizRes.data.deck.title}' with ${aiQuizRes.data.deck.questions.length} questions`);

  // 5. Test AI Flashcards generation
  const aiCardsRes = await request('/api/student/ai-flashcards', 'POST', {
    topic: 'Microservices and Kubernetes Orchestration',
    subject: 'DevOps',
  }, token);

  if (aiCardsRes.status !== 201 || !aiCardsRes.data.deck.cards) {
    console.error('❌ Failed to generate AI Flashcards:', aiCardsRes);
    process.exit(1);
  }
  console.log(`✅ AI Flashcards synthesized: '${aiCardsRes.data.deck.title}' with ${aiCardsRes.data.deck.cards.length} cards`);

  console.log('\n🎉 ALL STUDENT LEARNING & AI SUITE TESTS PASSED CLEANLY (100%)!\n');
};

run().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
