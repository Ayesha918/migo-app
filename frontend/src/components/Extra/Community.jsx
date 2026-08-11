// src/components/Extra/Community.jsx
import { useState } from 'react';
import { useLearner } from '../../services/LearnerContext';
import Sidebar from '../Home/Sidebar';
import Header from '../Home/Header';
import styles from './Extra.module.css';

const MOCK_POSTS = [
  { id: 1, author: 'nithya', avatar: '👧', time: '21h ago', content: 'im struggling in communication, any tips on intermediate dialogues?', likes: 2, comments: 0 },
  { id: 2, author: 'Priya S.', avatar: '👵', time: '3d ago', content: 'Just hit a 42-day streak! Who else is starting fresh on MiGo today?', likes: 32, comments: 8 }
];

export default function Community() {
  const { learner, logout } = useLearner();
  const [activeTab, setActiveTab] = useState('Discussions');
  const [postText, setPostText] = useState('');
  const [posts, setPosts] = useState(MOCK_POSTS);

  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!postText.trim()) return;

    const newPost = {
      id: posts.length + 1,
      author: learner?.name || 'You',
      avatar: learner?.avatar === 'boy' ? '👦' : learner?.avatar === 'girl' ? '👧' : '🦊',
      time: 'Just now',
      content: postText.trim(),
      likes: 0,
      comments: 0
    };

    setPosts([newPost, ...posts]);
    setPostText('');
  };

  const handleLikePost = (id) => {
    setPosts(posts.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p));
  };

  return (
    <div className={styles.pageLayout}>
      <Sidebar onLogout={logout} />
      <main className={styles.mainContent}>
        <Header />

        <div className={styles.headerArea}>
          <span className={styles.headerIcon}>👥</span>
          <div className={styles.headerMeta}>
            <h2>Community</h2>
            <p>Connect, compete, and learn together with fellow learners</p>
          </div>
        </div>

        <div className={styles.tabBar}>
          {['Leaderboard', 'Discussions', 'Study Groups'].map(tab => (
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

        {activeTab === 'Discussions' ? (
          <div style={{ maxWidth: '680px', width: '100%', margin: '0 auto' }}>
            {/* composer */}
            <form onSubmit={handleCreatePost} className={styles.communityComposer}>
              <span className={styles.composerAvatar}>✍️</span>
              <div className={styles.composerRight}>
                <textarea
                  className={styles.composerInput}
                  placeholder="Share something with the community..."
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                  rows={2}
                  required
                />
                <div className={styles.composerFooter}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700 }}>Speaking friendly only</span>
                  <button className={styles.postBtn} type="submit">
                    Post
                  </button>
                </div>
              </div>
            </form>

            {/* feed */}
            {posts.map(post => (
              <div key={post.id} className={styles.postCard}>
                <div className={styles.postHeader}>
                  <span className={styles.composerAvatar}>{post.avatar}</span>
                  <div className={styles.postMeta}>
                    <h5>{post.author}</h5>
                    <span>{post.time}</span>
                  </div>
                </div>
                <p className={styles.postText}>{post.content}</p>
                <div className={styles.postActions}>
                  <button className={styles.postActionBtn} onClick={() => handleLikePost(post.id)} type="button">
                    ❤️ {post.likes} Likes
                  </button>
                  <button className={styles.postActionBtn} type="button">
                    💬 {post.comments} Comments
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : activeTab === 'Leaderboard' ? (
          <div className={styles.sectionBox} style={{ maxWidth: '680px', width: '100%', margin: '0 auto' }}>
            <h3>🏆 Weekly Rank Challenge</h3>
            <p style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: '14px', marginBottom: '16px' }}>
              Keep studying to rank up! The top 3 learners win bonus virtual coins at the end of the week.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: 'var(--color-peach-light)', borderRadius: 'var(--radius-sm)', border: '2px solid var(--color-peach)' }}>
                <span style={{ fontWeight: 900 }}>🥇 1. Sara</span>
                <span style={{ fontWeight: 800 }}>1,250 XP</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-sm)', border: '2px solid var(--color-peach-light)' }}>
                <span style={{ fontWeight: 800 }}>🥈 2. {learner?.name || 'You'}</span>
                <span style={{ fontWeight: 800 }}>820 XP</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-sm)', border: '2px solid var(--color-peach-light)' }}>
                <span style={{ fontWeight: 800 }}>🥉 3. nithya</span>
                <span style={{ fontWeight: 800 }}>640 XP</span>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.sectionBox} style={{ maxWidth: '680px', width: '100%', margin: '0 auto', textAlign: 'center', padding: '40px 20px' }}>
            <span style={{ fontSize: '48px' }}>📚</span>
            <h3 style={{ border: 'none', padding: 0, marginTop: '12px' }}>Study Groups</h3>
            <p style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: '15px' }}>
              Join study circles with other neo-learners matching your target language levels! (Coming soon)
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
