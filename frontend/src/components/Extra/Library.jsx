// src/components/Extra/Library.jsx
import { useState, useEffect } from 'react';
import { useLearner } from '../../services/LearnerContext';
import { fetchBooks } from '../../services/api';
import Sidebar from '../Home/Sidebar';
import Header from '../Home/Header';
import styles from './Extra.module.css';

const LANGUAGE_LABELS = {
  en: 'English',
  hi: 'Hindi',
  kn: 'Kannada',
  ta: 'Tamil'
};

export default function Library() {
  const { learner, logout } = useLearner();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [filterLang, setFilterLang] = useState('All');
  const [filterAvail, setFilterAvail] = useState('All');

  // Active View states
  const [selectedBook, setSelectedBook] = useState(null);
  const [readingContentBook, setReadingContentBook] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetchBooks()
      .then(res => {
        setBooks(res.data || []);
      })
      .catch(err => console.error('Failed to load books:', err))
      .finally(() => setLoading(false));
  }, []);

  // Filter book list helper
  const getFilteredBooks = () => {
    return books.filter(book => {
      // Search text
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = book.title.toLowerCase().includes(query);
        const matchesAuthor = book.author.toLowerCase().includes(query);
        if (!matchesTitle && !matchesAuthor) return false;
      }
      // Level
      if (filterLevel !== 'All' && !book.level.includes(filterLevel)) {
        return false;
      }
      // Type
      if (filterType !== 'All' && book.book_type !== filterType) {
        return false;
      }
      // Language
      if (filterLang !== 'All' && book.language !== filterLang) {
        return false;
      }
      // Availability
      if (filterAvail !== 'All') {
        if (filterAvail === 'Free' && book.price !== 'Free') return false;
        if (filterAvail === 'Paid' && book.price === 'Free') return false;
        if (filterAvail === 'Audio Available' && !book.audio_available) return false;
      }
      return true;
    });
  };

  // Get recommended books based on current learning target and proficiency
  const getRecommendations = () => {
    if (!learner) return [];
    const learningTarget = learner.learning_language || 'en';
    const levelStr = learner.level || 'Beginner';

    // Map learner level to reading levels
    let matchingLevels = ['Level 2 — Beginner'];
    if (levelStr.toLowerCase() === 'beginner') {
      matchingLevels = ['Level 1 — Early Reader', 'Level 2 — Beginner'];
    } else if (levelStr.toLowerCase() === 'intermediate') {
      matchingLevels = ['Level 2 — Beginner', 'Level 3 — Elementary'];
    } else {
      matchingLevels = ['Level 3 — Elementary', 'Level 4 — Developing Reader'];
    }

    // Prioritize target learning language and matching reading levels
    return books.filter(b => b.language === learningTarget && matchingLevels.includes(b.level));
  };

  const filteredList = getFilteredBooks();
  const recommendations = getRecommendations();

  // Reset filters to view all
  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterLevel('All');
    setFilterType('All');
    setFilterLang('All');
    setFilterAvail('All');
    setIsSearching(false);
  };

  // Set filter triggers for See All category shelves
  const handleSeeAllCategory = (categoryName) => {
    handleResetFilters();
    setIsSearching(true);
    if (categoryName === 'Beginner Reads') {
      setFilterLevel('Level 1');
    } else if (categoryName === 'Audio Available') {
      setFilterAvail('Audio Available');
    } else {
      setFilterType(categoryName);
    }
  };

  // Helper to render book cover illustration beautifully
  const renderBookCover = (book) => {
    if (book.cover_image_path) {
      return (
        <img
          src={book.cover_image_path}
          alt={book.title}
          className={styles.bookCoverImage}
          onError={(e) => {
            // fallback if local file copy path can't load in static server
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      );
    }
    return (
      <div className={styles.bookCoverPlaceholder} style={{ height: '100%' }}>
        {book.emoji}
      </div>
    );
  };

  return (
    <div className={styles.pageLayout}>
      <Sidebar onLogout={logout} />
      <main className={styles.mainContent}>
        <Header />

        {/* Page title */}
        <div className={styles.headerArea}>
          <span className={styles.headerIcon}>📖</span>
          <div className={styles.headerMeta}>
            <h2>Play Bookstore</h2>
            <p>Discover real storybooks and fables personalized to help you learn languages</p>
          </div>
        </div>

        {/* Search & Advanced Filters Area */}
        <div className={styles.searchFilterArea}>
          <div className={styles.searchBarWrapper}>
            <input
              type="text"
              placeholder="Search by book title or author..."
              className={styles.searchBar}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value) setIsSearching(true);
              }}
            />
            {(isSearching || searchQuery || filterLevel !== 'All' || filterType !== 'All' || filterLang !== 'All' || filterAvail !== 'All') && (
              <button
                onClick={handleResetFilters}
                className={styles.tabPill}
                style={{ borderStyle: 'dashed' }}
                type="button"
              >
                Clear Filters
              </button>
            )}
          </div>

          <div className={styles.filterControls}>
            {/* Reading Level */}
            <select
              className={styles.filterSelect}
              value={filterLevel}
              onChange={(e) => {
                setFilterLevel(e.target.value);
                setIsSearching(true);
              }}
            >
              <option value="All">All Levels</option>
              <option value="Level 1">Level 1 — Early Reader</option>
              <option value="Level 2">Level 2 — Beginner</option>
              <option value="Level 3">Level 3 — Elementary</option>
              <option value="Level 4">Level 4 — Developing Reader</option>
            </select>

            {/* Type */}
            <select
              className={styles.filterSelect}
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setIsSearching(true);
              }}
            >
              <option value="All">All Types</option>
              <option value="Story">Story</option>
              <option value="Short Story">Short Story</option>
              <option value="Graded Reader">Graded Reader</option>
              <option value="Folk Tale">Folk Tale</option>
              <option value="Moral Story">Moral Story</option>
            </select>

            {/* Language */}
            <select
              className={styles.filterSelect}
              value={filterLang}
              onChange={(e) => {
                setFilterLang(e.target.value);
                setIsSearching(true);
              }}
            >
              <option value="All">All Languages</option>
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="kn">Kannada</option>
              <option value="ta">Tamil</option>
            </select>

            {/* Availability */}
            <select
              className={styles.filterSelect}
              value={filterAvail}
              onChange={(e) => {
                setFilterAvail(e.target.value);
                setIsSearching(true);
              }}
            >
              <option value="All">All Availability</option>
              <option value="Free">Free</option>
              <option value="Paid">Paid</option>
              <option value="Audio Available">Audio Available</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>Loading Bookstore catalog...</p>
          </div>
        ) : isSearching ? (
          /* Search Results view grid */
          <div className={styles.shelfSection}>
            <div className={styles.shelfHeader}>
              <h3>Search Results ({filteredList.length} matches)</h3>
              <button className={styles.seeAllLink} onClick={handleResetFilters} type="button">
                Back to Bookstore Home
              </button>
            </div>
            {filteredList.length === 0 ? (
              <div className={styles.sectionBox} style={{ textAlign: 'center', padding: '40px 20px' }}>
                <span style={{ fontSize: '48px' }}>🔍</span>
                <h4 style={{ marginTop: '12px' }}>No matches found</h4>
                <p style={{ color: 'var(--text-muted)' }}>Try resetting the filters to browse the shelves.</p>
              </div>
            ) : (
              <div className={styles.cardsGrid}>
                {filteredList.map(book => (
                  <div key={book.id} className={styles.bookCard} onClick={() => setSelectedBook(book)} style={{ cursor: 'pointer' }}>
                    <div style={{ height: '180px', overflow: 'hidden', position: 'relative' }}>
                      {renderBookCover(book)}
                      {/* fallback layout hidden if image loads */}
                      <div className={styles.bookCoverPlaceholder} style={{ display: 'none', height: '100%' }}>
                        {book.emoji}
                      </div>
                    </div>
                    <div className={styles.bookBody}>
                      <div className={styles.bookTagRow}>
                        <span className={styles.bookCategoryTag}>{book.book_type}</span>
                        <span className={styles.bookRating}>⭐ {book.rating}</span>
                      </div>
                      <h4 className={styles.bookTitle} style={{ fontSize: '15px' }}>{book.title}</h4>
                      <p className={styles.bookAuthor}>{book.author}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 800, marginTop: 'auto', color: 'var(--text-muted)' }}>
                        <span>{book.level.split(' — ')[0]}</span>
                        <span style={{ color: book.price === 'Free' ? '#27AE60' : 'var(--color-orange)' }}>{book.price}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Bookstore home view shelves */
          <>
            {/* 1. Recommended For You Horizontal Shelf */}
            {recommendations.length > 0 && (
              <div className={styles.shelfSection} style={{ backgroundColor: 'var(--color-peach-light)', padding: '20px', borderRadius: 'var(--radius-md)', border: '2px dashed var(--color-orange)' }}>
                <div className={styles.shelfHeader}>
                  <div>
                    <h3 style={{ margin: 0 }}>Recommended for You ➔</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 700, margin: '2px 0 0 0' }}>
                      Recommended for your current reading level ({learner?.level || 'Beginner'}) to build target vocabulary.
                    </p>
                  </div>
                </div>
                <div className={styles.shelfScroll}>
                  {recommendations.map(book => (
                    <div key={book.id} className={styles.bookCard} onClick={() => setSelectedBook(book)} style={{ cursor: 'pointer' }}>
                      <div style={{ height: '160px', overflow: 'hidden' }}>
                        {renderBookCover(book)}
                      </div>
                      <div className={styles.bookBody}>
                        <div className={styles.bookTagRow}>
                          <span className={styles.bookCategoryTag}>{book.book_type}</span>
                          <span className={styles.bookRating}>⭐ {book.rating}</span>
                        </div>
                        <h4 className={styles.bookTitle} style={{ fontSize: '14px' }}>{book.title}</h4>
                        <p className={styles.bookAuthor}>{book.author}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 800, marginTop: 'auto', color: 'var(--text-muted)' }}>
                          <span>{book.level.split(' — ')[0]}</span>
                          <span style={{ color: book.price === 'Free' ? '#27AE60' : 'var(--color-orange)' }}>{book.price}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. 🌱 Beginner Reads */}
            <div className={styles.shelfSection}>
              <div className={styles.shelfHeader}>
                <h3>🌱 Beginner Reads</h3>
                <button className={styles.seeAllLink} onClick={() => handleSeeAllCategory('Beginner Reads')} type="button">See all</button>
              </div>
              <div className={styles.shelfScroll}>
                {books.filter(b => b.level.includes('Level 1')).map(book => (
                  <div key={book.id} className={styles.bookCard} onClick={() => setSelectedBook(book)} style={{ cursor: 'pointer' }}>
                    <div style={{ height: '160px', overflow: 'hidden' }}>
                      {renderBookCover(book)}
                    </div>
                    <div className={styles.bookBody}>
                      <div className={styles.bookTagRow}>
                        <span className={styles.bookCategoryTag}>{book.book_type}</span>
                        <span className={styles.bookRating}>⭐ {book.rating}</span>
                      </div>
                      <h4 className={styles.bookTitle} style={{ fontSize: '14px' }}>{book.title}</h4>
                      <p className={styles.bookAuthor}>{book.author}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 800, marginTop: 'auto', color: 'var(--text-muted)' }}>
                        <span>{LANGUAGE_LABELS[book.language]}</span>
                        <span style={{ color: '#27AE60' }}>{book.price}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. 🐾 Animal Stories */}
            <div className={styles.shelfSection}>
              <div className={styles.shelfHeader}>
                <h3>🐾 Animal Stories</h3>
                <button className={styles.seeAllLink} onClick={() => handleSeeAllCategory('Moral Story')} type="button">See all</button>
              </div>
              <div className={styles.shelfScroll}>
                {books.filter(b => b.category === 'Animal Stories').map(book => (
                  <div key={book.id} className={styles.bookCard} onClick={() => setSelectedBook(book)} style={{ cursor: 'pointer' }}>
                    <div style={{ height: '160px', overflow: 'hidden' }}>
                      {renderBookCover(book)}
                    </div>
                    <div className={styles.bookBody}>
                      <div className={styles.bookTagRow}>
                        <span className={styles.bookCategoryTag}>{book.book_type}</span>
                        <span className={styles.bookRating}>⭐ {book.rating}</span>
                      </div>
                      <h4 className={styles.bookTitle} style={{ fontSize: '14px' }}>{book.title}</h4>
                      <p className={styles.bookAuthor}>{book.author}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 800, marginTop: 'auto', color: 'var(--text-muted)' }}>
                        <span>{book.level.split(' — ')[0]}</span>
                        <span style={{ color: '#27AE60' }}>{book.price}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. 🎧 Read & Listen */}
            <div className={styles.shelfSection}>
              <div className={styles.shelfHeader}>
                <h3>🎧 Read & Listen</h3>
                <button className={styles.seeAllLink} onClick={() => handleSeeAllCategory('Audio Available')} type="button">See all</button>
              </div>
              <div className={styles.shelfScroll}>
                {books.filter(b => b.audio_available).map(book => (
                  <div key={book.id} className={styles.bookCard} onClick={() => setSelectedBook(book)} style={{ cursor: 'pointer' }}>
                    <div style={{ height: '160px', overflow: 'hidden' }}>
                      {renderBookCover(book)}
                    </div>
                    <div className={styles.bookBody}>
                      <div className={styles.bookTagRow}>
                        <span className={styles.bookCategoryTag}>{book.book_type}</span>
                        <span className={styles.bookRating}>⭐ {book.rating}</span>
                      </div>
                      <h4 className={styles.bookTitle} style={{ fontSize: '14px' }}>{book.title}</h4>
                      <p className={styles.bookAuthor}>{book.author}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 800, marginTop: 'auto', color: 'var(--text-muted)' }}>
                        <span>{LANGUAGE_LABELS[book.language]}</span>
                        <span style={{ color: '#27AE60' }}>Audio 🎧</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Detailed Book Modal Dialog */}
        {selectedBook && (
          <div className={styles.certModalOverlay} onClick={() => setSelectedBook(null)}>
            <div className={styles.certModalContent} style={{ maxWidth: '600px', padding: '28px', textAlign: 'left' }} onClick={(e) => e.stopPropagation()}>
              <button className={styles.certModalClose} onClick={() => setSelectedBook(null)} type="button">
                &times;
              </button>

              <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                <div style={{ width: '130px', height: '180px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}>
                  {renderBookCover(selectedBook)}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', justify: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: 900, color: 'var(--color-orange-dark)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    {selectedBook.category}
                  </span>
                  <h3 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-dark)', margin: '0 0 4px 0', lineHeight: 1.2 }}>{selectedBook.title}</h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 700, margin: '0 0 10px 0' }}>by {selectedBook.author}</p>
                  
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '14px', fontWeight: 800, color: '#F1C40F' }}>
                    <span>⭐ {selectedBook.rating}</span>
                    <span style={{ color: 'var(--text-muted)' }}>|</span>
                    <span style={{ color: 'var(--color-orange-dark)' }}>{selectedBook.price}</span>
                  </div>
                </div>
              </div>

              {/* metadata badge row */}
              <div className={styles.metaLabelRow}>
                <span className={styles.metaBadge}>📖 {selectedBook.pages} Pages</span>
                <span className={styles.metaBadge}>🌐 {LANGUAGE_LABELS[selectedBook.language]}</span>
                <span className={styles.metaBadge}>⚡ {selectedBook.level}</span>
                <span className={styles.metaBadge}>{selectedBook.audio_available ? '🔊 Audio Support' : '🔇 No Audio'}</span>
              </div>

              {/* Why recommended box */}
              <div className={styles.whyBox}>
                <h5>Why this book?</h5>
                <p>{selectedBook.why_recommended}</p>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 850, color: 'var(--text-dark)', marginBottom: '8px' }}>Description</h4>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 700, lineHeight: 1.5 }}>
                  This is a beginner-friendly book designed to build vocabulary, pronunciation, and reading comprehension. Select an option below to begin learning.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  className={styles.submitBtn}
                  onClick={() => {
                    setSelectedBook(null);
                    setReadingContentBook(selectedBook);
                  }}
                  style={{ flex: 1 }}
                  type="button"
                >
                  Read Story 📖
                </button>
                {selectedBook.google_play_url && (
                  <a
                    href={selectedBook.google_play_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.submitBtn}
                    style={{ flex: 1, textDecoration: 'none', textAlign: 'center', background: '#3498DB', boxShadow: 'none' }}
                  >
                    View on Google Play ➔
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Offline Book Content Reader modal */}
        {readingContentBook && (
          <div className={styles.certModalOverlay} onClick={() => setReadingContentBook(null)}>
            <div className={styles.certModalContent} style={{ maxWidth: '640px', padding: '32px', textAlign: 'left' }} onClick={(e) => e.stopPropagation()}>
              <button className={styles.certModalClose} onClick={() => setReadingContentBook(null)} type="button">
                &times;
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', borderBottom: '2px dashed var(--color-peach)', paddingBottom: '12px' }}>
                <span style={{ fontSize: '32px' }}>{readingContentBook.emoji}</span>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--color-orange-dark)' }}>{readingContentBook.title}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 700 }}>by {readingContentBook.author}</p>
                </div>
              </div>

              <div style={{ maxHeight: '320px', overflowY: 'auto', padding: '20px', backgroundColor: 'var(--bg-cream)', borderRadius: 'var(--radius-sm)', border: '2px solid var(--color-peach-light)', color: 'var(--text-dark)', fontWeight: 700, fontSize: '16px', lineHeight: 1.6, marginBottom: '20px' }}>
                {readingContentBook.content}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 800 }}>Reading Level: {readingContentBook.level.split(' — ')[0]}</span>
                <button className={styles.submitBtn} onClick={() => setReadingContentBook(null)} type="button">
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
