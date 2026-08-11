// src/components/Extra/Community.jsx
import { useState, useEffect } from 'react';
import { useLearner } from '../../services/LearnerContext';
import { fetchCommunityPosts, createCommunityPost, toggleLikePost } from '../../services/api';
import Sidebar from '../Home/Sidebar';
import Header from '../Home/Header';
import styles from './Extra.module.css';

export default function Community() {
  const { learner, logout } = useLearner();
  const [activeTab, setActiveTab] = useState('Discussions');
  const [postText, setPostText] = useState('');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadPosts = () => {
    if (!learner) return;
    setLoading(true);
    fetchCommunityPosts(learner.learner_id)
      .then(res => {
        setPosts(res.data || []);
      })
      .catch(err => console.error('Failed to fetch posts:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPosts();
  }, [learner]);

  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!postText.trim()) return;

    createCommunityPost({
      learner_id: learner?.learner_id,
      content: postText.trim()
    })
      .then(res => {
        setPosts([res.data, ...posts]);
        setPostText('');
      })
      .catch(err => console.error('Failed to create post:', err));
  };

  const handleLikePost = (postId) => {
    if (!learner) return;
    toggleLikePost(postId, learner.learner_id)
      .then(res => {
        setPosts(posts.map(p => p.id === postId ? { ...p, likes: res.data.likes, liked: res.data.liked } : p));
      })
      .catch(err => console.error('Failed to like post:', err));
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
            {loading ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <p>Loading posts...</p>
              </div>
            ) : posts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <p>No community posts yet. Be the first to write one!</p>
              </div>
            ) : (
              posts.map(post => (
                <div key={post.id} className={styles.postCard}>
                  <div className={styles.postHeader}>
                    <span className={styles.composerAvatar}>
                      {post.avatar === 'boy' ? '👦' : post.avatar === 'girl' ? '👧' : '🦊'}
                    </span>
                    <div className={styles.postMeta}>
                      <h5>{post.author}</h5>
                      <span>{post.time}</span>
                    </div>
                  </div>
                  <p className={styles.postText}>{post.content}</p>
                  <div className={styles.postActions}>
                    <button
                      className={styles.postActionBtn}
                      onClick={() => handleLikePost(post.id)}
                      style={{ color: post.liked ? 'var(--color-orange)' : 'var(--text-muted)' }}
                      type="button"
                    >
                      {post.liked ? '❤️' : '🤍'} {post.likes} Likes
                    </button>
                    <button className={styles.postActionBtn} type="button">
                      💬 {post.comments} Comments
                    </button>
                  </div>
                </div>
              ))
            )}
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
