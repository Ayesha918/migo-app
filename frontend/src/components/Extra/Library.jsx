// src/components/Extra/Library.jsx
import { useState } from 'react';
import { useLearner } from '../../services/LearnerContext';
import Sidebar from '../Home/Sidebar';
import Header from '../Home/Header';
import styles from './Extra.module.css';

const MOCK_BOOKS = [
  { id: 1, title: 'The Magic of Words', author: 'Elena Vance', pages: 120, category: 'Literature', progress: 30, rating: 4.8, level: 'Beginner', emoji: '📖' },
  { id: 2, title: 'Modern Communication', author: 'Dr. Julian Thorne', pages: 245, category: 'Business', progress: 10, rating: 4.5, level: 'Intermediate', emoji: '💼' },
  { id: 3, title: 'Linguistic Psychology', author: 'Sarah Miller', pages: 310, category: 'Science', progress: 0, rating: 4.7, level: 'Advanced', emoji: '🧠' },
  { id: 4, title: 'Short Stories for Learners', author: 'Various Authors', pages: 95, category: 'Fiction', progress: 85, rating: 4.9, level: 'Beginner', emoji: '🧚' },
];

export default function Library() {
  const { learner, logout } = useLearner();
  const [activeTab, setActiveTab] = useState('All Books');

  const filteredBooks = activeTab === 'All Books'
    ? MOCK_BOOKS
    : MOCK_BOOKS.filter(b => b.category === activeTab);

  return (
    <div className={styles.pageLayout}>
      <Sidebar onLogout={logout} />
      <main className={styles.mainContent}>
        <Header />

        <div className={styles.headerArea}>
          <span className={styles.headerIcon}>📚</span>
          <div className={styles.headerMeta}>
            <h2>Library</h2>
            <p>Explore books and reading materials tailored to your skill level</p>
          </div>
        </div>

        <div className={styles.tabBar}>
          {['All Books', 'Literature', 'Business', 'Science', 'Fiction'].map(tab => (
            <button
              key={tab}
              className={`${styles.tabPill} ${activeTab === tab ? styles.activeTabPill : ''}`}
              onClick={() => setActiveTab(tab)}
              type="button"
            >
              {tab}
            </button>
          ))}
        </div>

        <div className={styles.cardsGrid}>
          {filteredBooks.map(book => (
            <div key={book.id} className={styles.bookCard}>
              <div className={styles.bookCoverPlaceholder}>
                {book.emoji}
              </div>
              <div className={styles.bookBody}>
                <div className={styles.bookTagRow}>
                  <span className={styles.bookCategoryTag}>{book.category}</span>
                  <span className={styles.bookRating}>⭐ {book.rating}</span>
                </div>
                <h4 className={styles.bookTitle}>{book.title}</h4>
                <p className={styles.bookAuthor}>by {book.author}</p>
                <div className={styles.bookPages}>
                  📖 {book.pages} Pages | <span style={{ fontWeight: 900, color: 'var(--color-orange)' }}>{book.level}</span>
                </div>
                
                <div className={styles.bookProgressContainer}>
                  <div className={styles.bookProgressLabel}>
                    <span>Progress</span>
                    <span>{book.progress}%</span>
                  </div>
                  <div className={styles.bookProgressTrack}>
                    <div className={styles.bookProgressBar} style={{ width: `${book.progress}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recommendations */}
        <div className={styles.recommendationCard}>
          <div className={styles.recLeft}>
            <span className={styles.recIcon}>💡</span>
            <div>
              <h4 className={styles.recTitle}>Personalized Recommendations</h4>
              <p className={styles.recText}>Based on your level ({learner?.level || 'Beginner'}), we recommend reading "{MOCK_BOOKS[0].title}".</p>
            </div>
          </div>
          <button className={styles.recBtn} type="button">Get Started</button>
        </div>
      </main>
    </div>
  );
}
