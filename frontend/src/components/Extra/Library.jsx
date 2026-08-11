// src/components/Extra/Library.jsx
import { useState, useEffect } from 'react';
import { useLearner } from '../../services/LearnerContext';
import { fetchBooks } from '../../services/api';
import Sidebar from '../Home/Sidebar';
import Header from '../Home/Header';
import styles from './Extra.module.css';

export default function Library() {
  const { learner, logout } = useLearner();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All Books');
  const [readingBook, setReadingBook] = useState(null);

  useEffect(() => {
    fetchBooks()
      .then(res => {
        setBooks(res.data || []);
      })
      .catch(err => console.error('Failed to fetch books:', err))
      .finally(() => setLoading(false));
  }, []);

  const filteredBooks = activeTab === 'All Books'
    ? books
    : books.filter(b => b.category === activeTab);

  const handleOpenReader = (book) => {
    setReadingBook(book);
  };

  const handleCloseReader = () => {
    setReadingBook(null);
  };

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

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>Loading books from database...</p>
          </div>
        ) : (
          <div className={styles.cardsGrid}>
            {filteredBooks.map(book => (
              <div key={book.id} className={styles.bookCard}>
                <div className={styles.bookCoverPlaceholder}>
                  {book.emoji}
                </div>
                <div className={styles.bookBody}>
                  <div className={styles.bookTagRow}>
                    <span className={styles.bookCategoryTag}>{book.category}</span>
                    <span className={styles.bookRating}>⭐ 4.8</span>
                  </div>
                  <h4 className={styles.bookTitle}>{book.title}</h4>
                  <p className={styles.bookAuthor}>by {book.author}</p>
                  <div className={styles.bookPages}>
                    📖 {book.pages} Pages | <span style={{ fontWeight: 900, color: 'var(--color-orange)' }}>{book.level}</span>
                  </div>
                  
                  <div className={styles.bookProgressContainer} style={{ marginTop: '16px' }}>
                    <button
                      className={styles.recBtn}
                      onClick={() => handleOpenReader(book)}
                      style={{ width: '100%' }}
                      type="button"
                    >
                      Open & Read Book ➔
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recommendations */}
        {!loading && books.length > 0 && (
          <div className={styles.recommendationCard}>
            <div className={styles.recLeft}>
              <span className={styles.recIcon}>💡</span>
              <div>
                <h4 className={styles.recTitle}>Personalized Recommendations</h4>
                <p className={styles.recText}>Based on your level ({learner?.level || 'Beginner'}), we recommend reading "{books[0]?.title}".</p>
              </div>
            </div>
            <button className={styles.recBtn} onClick={() => handleOpenReader(books[0])} type="button">Get Started</button>
          </div>
        )}

        {/* Reader Modal */}
        {readingBook && (
          <div className={styles.certModalOverlay} onClick={handleCloseReader}>
            <div className={styles.certModalContent} style={{ maxWidth: '640px', padding: '32px', textAlign: 'left' }} onClick={(e) => e.stopPropagation()}>
              <button className={styles.certModalClose} onClick={handleCloseReader} type="button">
                &times;
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', borderBottom: '2px dashed var(--color-peach)', paddingBottom: '12px' }}>
                <span style={{ fontSize: '32px' }}>{readingBook.emoji}</span>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--color-orange-dark)' }}>{readingBook.title}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 700 }}>by {readingBook.author}</p>
                </div>
              </div>

              <div style={{ maxHeight: '300px', overflowY: 'auto', padding: '16px', backgroundColor: 'var(--bg-cream)', borderRadius: 'var(--radius-sm)', border: '2px solid var(--color-peach-light)', color: 'var(--text-dark)', fontWeight: 600, fontSize: '15px', lineHeight: 1.6, marginBottom: '20px' }}>
                {readingBook.content}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 800 }}>Level: {readingBook.level}</span>
                <button className={styles.submitBtn} onClick={handleCloseReader} type="button">
                  Finish Reading ✓
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
