// src/services/mockHomeData.js
// TEMPORARY — replace with a real API call once Modules 12a-12e exist.
// Shape mirrors what GET /api/home/summary?learner_id=... will eventually return.

export const mockHomeData = {
  learner: {
    name: 'Ayesha',
    avatar: '👧',
    level: 'Beginner Level',
    streak_days: 7,
    stars: 230,
  },
  progress: {
    percent: 35,
    lessons_completed: 18,
    lessons_total: 50,
  },
  stats: {
    lessons: 18,
    stars: 230,
    streak: 7,
  },
  today_goal: {
    completed: 1,
    total: 2,
  },
  next_lesson: {
    id: 9,
    letter: 'A',
    title: 'Letter Sounds',
  },
  roadmap: [
    { day: 1, title: 'Letter Recognition', status: 'completed', stars: 3 },
    { day: 2, title: 'Letter Sounds', status: 'completed', stars: 3 },
    { day: 3, title: 'Simple Words', status: 'completed', stars: 3 },
    { day: 4, title: 'Read Aloud', status: 'current', progress: '0/3' },
    { day: 5, title: 'Picture Words', status: 'locked' },
    { day: 6, title: 'Short Sentences', status: 'locked' },
  ],
  migo_message: "Great job, Ayesha! 🎉 You read 5 new words today. Keep it up!",
};