// src/components/Extra/StudyGroups.jsx
import { useState, useEffect, useRef } from 'react';
import { 
  Users, Calendar, Search, Plus, MessageSquare, Trash2, Pin, UserPlus, 
  FolderOpen, Shield, CheckCircle, ExternalLink, Clock, ArrowLeft, 
  ThumbsUp, LogOut, Check, BookOpen, AlertCircle, Info, Sparkles, Filter
} from 'lucide-react';
import styles from './Extra.module.css';

// Initial Mock Seed Data
const INITIAL_GROUPS = [
  {
    id: 'group_1',
    name: 'English Beginners',
    language: 'en',
    level: 'Beginner',
    topic: 'Grammar & CVC Words',
    description: 'Perfect for learners starting their reading roadmap. We practice everyday consonant-vowel-consonant spelling words and basic sentence structures.',
    creatorName: 'Teacher John',
    creatorId: 't_john',
    schedule: 'Mon, Wed at 4:00 PM',
    frequency: 'Weekly',
    privacy: 'Public',
    rules: [
      'Be encouraging and respect other learners.',
      'Practice speaking in English as much as possible.',
      'Complete the assigned daily fables.'
    ],
    membersCount: 5,
    maxMembers: 12,
    dateCreated: '2026-08-01T10:00:00Z',
    members: [
      { id: 'learner_1', name: 'Sara', level: 'Beginner', role: 'Admin', joinDate: '2026-08-01' },
      { id: 'learner_2', name: 'Kabir', level: 'Beginner', role: 'Member', joinDate: '2026-08-02' },
      { id: 'learner_3', name: 'Ananya', level: 'Beginner', role: 'Member', joinDate: '2026-08-03' },
      { id: 'learner_4', name: 'Rahul', level: 'Intermediate', role: 'Member', joinDate: '2026-08-04' }
    ]
  },
  {
    id: 'group_2',
    name: 'English Speaking Practice',
    language: 'en',
    level: 'Intermediate',
    topic: 'Conversational Fluency',
    description: 'Focuses on building speaking fluency, correct pronunciations, and expressive reading. We read fables aloud and practice with the voice recognizer.',
    creatorName: 'Tutor Emma',
    creatorId: 't_emma',
    schedule: 'Tue, Thu at 5:30 PM',
    frequency: 'Weekly',
    privacy: 'Public',
    rules: [
      'Allow everyone a turn to read aloud.',
      'Provide constructive feedback only.',
      'Ensure a quiet background during sessions.'
    ],
    membersCount: 8,
    maxMembers: 15,
    dateCreated: '2026-08-02T12:00:00Z',
    members: [
      { id: 'learner_5', name: 'Sara', level: 'Intermediate', role: 'Member', joinDate: '2026-08-02' },
      { id: 'learner_6', name: 'Amit', level: 'Intermediate', role: 'Admin', joinDate: '2026-08-02' }
    ]
  },
  {
    id: 'group_3',
    name: 'ಕನ್ನಡ ವರ್ಣಮಾಲೆ ಕಲಿರಿ (Kannada Vowels)',
    language: 'kn',
    level: 'Beginner',
    topic: 'Script & Basic Nouns',
    description: 'Learn to read and write Kannada vowels (ಸ್ವರಗಳು). Practice clicking letters on the Interactive Charts and reading animal fables.',
    creatorName: 'Tutor Ramesh',
    creatorId: 't_ramesh',
    schedule: 'Saturdays at 11:00 AM',
    frequency: 'Weekly',
    privacy: 'Public',
    rules: [
      'Practice writing letters on paper.',
      'Listen to pronunciation audio guides carefully.',
      'Ask questions freely.'
    ],
    membersCount: 3,
    maxMembers: 8,
    dateCreated: '2026-08-05T09:00:00Z',
    members: [
      { id: 'learner_7', name: 'Karthik', level: 'Beginner', role: 'Admin', joinDate: '2026-08-05' }
    ]
  },
  {
    id: 'group_4',
    name: 'தமிழ் உயிர் எழுத்துக்கள் (Tamil Vowels)',
    language: 'ta',
    level: 'Beginner',
    topic: 'Vocabulary & Pronunciation',
    description: 'Practice classical Tamil vowels (உயிர் எழுத்துக்கள்) and primary objects worksheets. Excellent for young beginners starting Tamil phonics.',
    creatorName: 'Tutor Priya',
    creatorId: 't_priya',
    schedule: 'Sundays at 6:00 PM',
    frequency: 'Weekly',
    privacy: 'Private',
    rules: [
      'Speak slowly and enunciate vowel symbols clearly.',
      'Help teammates with spelling pronunciation.',
      'Complete tasks before meetings.'
    ],
    membersCount: 4,
    maxMembers: 10,
    dateCreated: '2026-08-06T15:00:00Z',
    members: [
      { id: 'learner_8', name: 'Nithya', level: 'Beginner', role: 'Admin', joinDate: '2026-08-06' }
    ]
  },
  {
    id: 'group_5',
    name: 'Hindi Conversational Club',
    language: 'hi',
    level: 'Intermediate',
    topic: 'Syllables & Grammar rules',
    description: 'A fun practice group to correct spelling mistakes, read short stories page-by-page, and build strong vocabulary matching early school curriculums.',
    creatorName: 'Tutor Amit',
    creatorId: 't_amit',
    schedule: 'Wed, Fri at 7:00 PM',
    frequency: 'Weekly',
    privacy: 'Public',
    rules: [
      'Participate actively in discussions.',
      'Do not spam messages.',
      'Review vocabulary translations.'
    ],
    membersCount: 6,
    maxMembers: 20,
    dateCreated: '2026-08-08T18:00:00Z',
    members: [
      { id: 'learner_9', name: 'Rohan', level: 'Intermediate', role: 'Admin', joinDate: '2026-08-08' }
    ]
  }
];

const INITIAL_POSTS = [
  {
    id: 'post_1',
    groupId: 'group_1',
    author: 'Teacher John',
    authorId: 't_john',
    avatar: 'boy',
    content: 'Welcome to the English Beginners group! 📖 Please check our upcoming study session schedule and RSVP. We will practice consonant sounds.',
    timestamp: '2026-08-10T14:30:00Z',
    likes: 3,
    likedBy: ['learner_2', 'learner_3'],
    isPinned: true
  },
  {
    id: 'post_2',
    groupId: 'group_1',
    author: 'Kabir',
    authorId: 'learner_2',
    avatar: 'girl',
    content: 'Glad to join! I am currently completing Level 1 Roadmap, the voice exercises are really helpful.',
    timestamp: '2026-08-11T09:15:00Z',
    likes: 1,
    likedBy: ['learner_1'],
    isPinned: false
  },
  {
    id: 'post_3',
    groupId: 'group_2',
    author: 'Tutor Emma',
    authorId: 't_emma',
    avatar: 'girl',
    content: 'Hello everyone! During our session tomorrow, we will read the fable "The Honest Woodcutter" page-by-page. Please review the target words.',
    timestamp: '2026-08-12T16:00:00Z',
    likes: 4,
    likedBy: ['learner_5', 'learner_6'],
    isPinned: true
  }
];

const INITIAL_SESSIONS = [
  {
    id: 'session_1',
    groupId: 'group_1',
    title: 'Phonics: Vowel & Consonant blends',
    description: 'We will practice merging three-letter phonics sounds using printable charts.',
    date: '2026-08-18',
    startTime: '16:00',
    endTime: '17:00',
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    rsvps: ['learner_1', 'learner_2']
  },
  {
    id: 'session_2',
    groupId: 'group_2',
    title: 'Aloud Reading: The Honest Woodcutter',
    description: 'A round-robin reading practice session focusing on tone, flow, and pause controls.',
    date: '2026-08-19',
    startTime: '17:30',
    endTime: '18:30',
    meetingLink: 'https://meet.google.com/xyz-uvwx-yza',
    rsvps: ['learner_5', 'learner_6']
  }
];

const INITIAL_RESOURCES = [
  {
    id: 'res_1',
    groupId: 'group_1',
    title: 'CVC Phonics Worksheets PDF',
    description: 'Spelling worksheets with short vowels to print and practice.',
    link: 'https://migoapp.com/resources/cvc-worksheets.pdf'
  },
  {
    id: 'res_2',
    groupId: 'group_2',
    title: 'The Honest Woodcutter Pronunciation Vocabulary',
    description: 'Lists key words like integrity, axe, and reward with pronunciation notes.',
    link: 'https://migoapp.com/resources/woodcutter-vocab.pdf'
  }
];

export default function StudyGroups({ learner }) {
  // DB states loaded from localStorage
  const [groups, setGroups] = useState([]);
  const [posts, setPosts] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [resources, setResources] = useState([]);
  const [joinedGroupIds, setJoinedGroupIds] = useState([]);

  // UI state
  const [viewingGroupId, setViewingGroupId] = useState(null);
  const [groupTab, setGroupTab] = useState('overview'); // 'overview' | 'discussion' | 'resources' | 'members' | 'schedule'
  const [toast, setToast] = useState(null);
  
  // Search & filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLang, setFilterLang] = useState('All');
  const [filterLevel, setFilterLevel] = useState('All');
  const [filterAvailability, setFilterAvailability] = useState('All');
  const [sortBy, setSortBy] = useState('Popular');

  // Modal forms
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupLang, setNewGroupLang] = useState('en');
  const [newGroupLevel, setNewGroupLevel] = useState('Beginner');
  const [newGroupTopic, setNewGroupTopic] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [newGroupMax, setNewGroupMax] = useState(10);
  const [newGroupSchedule, setNewGroupSchedule] = useState('');
  const [newGroupFreq, setNewGroupFreq] = useState('Weekly');
  const [newGroupPrivacy, setNewGroupPrivacy] = useState('Public');
  const [newGroupRules, setNewGroupRules] = useState('');

  // Admin session form
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [sessTitle, setSessTitle] = useState('');
  const [sessDesc, setSessDesc] = useState('');
  const [sessDate, setSessDate] = useState('');
  const [sessStart, setSessStart] = useState('');
  const [sessEnd, setSessEnd] = useState('');
  const [sessLink, setSessLink] = useState('');

  // Discussion composer states
  const [newPostText, setNewPostText] = useState('');
  const [replyingToPostId, setReplyingToPostId] = useState(null);
  const [newReplyText, setNewReplyText] = useState('');

  // Resource form
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [resTitle, setResTitle] = useState('');
  const [resDesc, setResDesc] = useState('');
  const [resLink, setResLink] = useState('');

  // Initialize DB from LocalStorage
  useEffect(() => {
    // Groups
    let savedGroups = localStorage.getItem('migo_study_groups');
    if (!savedGroups) {
      localStorage.setItem('migo_study_groups', JSON.stringify(INITIAL_GROUPS));
      savedGroups = JSON.stringify(INITIAL_GROUPS);
    }
    const parsedGroups = JSON.parse(savedGroups);
    setGroups(parsedGroups);

    // Join lists based on user logged in
    if (learner) {
      const userJoined = parsedGroups
        .filter(g => g.members.some(m => m.id === learner.learner_id))
        .map(g => g.id);
      setJoinedGroupIds(userJoined);
    }

    // Posts
    let savedPosts = localStorage.getItem('migo_group_posts');
    if (!savedPosts) {
      localStorage.setItem('migo_group_posts', JSON.stringify(INITIAL_POSTS));
      savedPosts = JSON.stringify(INITIAL_POSTS);
    }
    setPosts(JSON.parse(savedPosts));

    // Sessions
    let savedSessions = localStorage.getItem('migo_study_sessions');
    if (!savedSessions) {
      localStorage.setItem('migo_study_sessions', JSON.stringify(INITIAL_SESSIONS));
      savedSessions = JSON.stringify(INITIAL_SESSIONS);
    }
    setSessions(JSON.parse(savedSessions));

    // Resources
    let savedResources = localStorage.getItem('migo_group_resources');
    if (!savedResources) {
      localStorage.setItem('migo_group_resources', JSON.stringify(INITIAL_RESOURCES));
      savedResources = JSON.stringify(INITIAL_RESOURCES);
    }
    setResources(JSON.parse(savedResources));
  }, [learner]);

  // Sync back to LocalStorage helper
  const updateGroupsInDB = (newGroupsList) => {
    setGroups(newGroupsList);
    localStorage.setItem('migo_study_groups', JSON.stringify(newGroupsList));
  };

  const updatePostsInDB = (newPostsList) => {
    setPosts(newPostsList);
    localStorage.setItem('migo_group_posts', JSON.stringify(newPostsList));
  };

  const updateSessionsInDB = (newSessionsList) => {
    setSessions(newSessionsList);
    localStorage.setItem('migo_study_sessions', JSON.stringify(newSessionsList));
  };

  const updateResourcesInDB = (newResList) => {
    setResources(newResList);
    localStorage.setItem('migo_group_resources', JSON.stringify(newResList));
  };

  // Toast helper
  const showToast = (message, type = 'success') => {
    setToast({ text: message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // 1. Join Group Logic
  const handleJoinGroup = (group) => {
    if (!learner) {
      showToast('Please log in to join study groups.', 'error');
      return;
    }

    const isMember = group.members.some(m => m.id === learner.learner_id);
    if (isMember) {
      showToast('You are already a member of this group!', 'info');
      return;
    }

    if (group.members.length >= group.maxMembers) {
      showToast('Group is full!', 'error');
      return;
    }

    if (group.privacy === 'Private') {
      // Mock Private request
      showToast(`Request to join "${group.name}" private group sent!`, 'success');
      return;
    }

    // Add user as member
    const newMember = {
      id: learner.learner_id,
      name: learner.name || 'Student',
      level: learner.level || 'Beginner',
      role: 'Member',
      joinDate: new Date().toISOString().split('T')[0]
    };

    const updatedGroups = groups.map(g => {
      if (g.id === group.id) {
        return {
          ...g,
          membersCount: g.membersCount + 1,
          members: [...g.members, newMember]
        };
      }
      return g;
    });

    updateGroupsInDB(updatedGroups);
    setJoinedGroupIds([...joinedGroupIds, group.id]);
    showToast(`You have successfully joined "${group.name}" study group! 🚀`);
  };

  // 2. Leave Group Logic
  const handleLeaveGroup = (groupId) => {
    if (!learner) return;
    
    const confirmLeave = window.confirm("Are you sure you want to leave this study group?");
    if (!confirmLeave) return;

    const targetGroup = groups.find(g => g.id === groupId);
    if (!targetGroup) return;

    const updatedGroups = groups.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          membersCount: Math.max(0, g.membersCount - 1),
          members: g.members.filter(m => m.id !== learner.learner_id)
        };
      }
      return g;
    });

    updateGroupsInDB(updatedGroups);
    setJoinedGroupIds(joinedGroupIds.filter(id => id !== groupId));
    if (viewingGroupId === groupId) {
      setViewingGroupId(null);
    }
    showToast(`You have left the group "${targetGroup.name}".`);
  };

  // 3. Create Group Logic
  const handleCreateGroup = (e) => {
    e.preventDefault();
    if (!newGroupName.trim() || !newGroupTopic.trim() || !newGroupDesc.trim()) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }

    const newGroup = {
      id: 'group_' + Date.now(),
      name: newGroupName.trim(),
      language: newGroupLang,
      level: newGroupLevel,
      topic: newGroupTopic.trim(),
      description: newGroupDesc.trim(),
      creatorName: learner?.name || 'Tutor',
      creatorId: learner?.learner_id || 'admin',
      schedule: newGroupSchedule.trim() || 'Flexible Schedule',
      frequency: newGroupFreq,
      privacy: newGroupPrivacy,
      rules: newGroupRules ? newGroupRules.split('\n').filter(r => r.trim()) : ['Be encouraging and respect teammates.'],
      membersCount: 1,
      maxMembers: parseInt(newGroupMax) || 10,
      dateCreated: new Date().toISOString(),
      members: [
        {
          id: learner?.learner_id || 'creator',
          name: learner?.name || 'Tutor',
          level: learner?.level || 'Beginner',
          role: 'Admin',
          joinDate: new Date().toISOString().split('T')[0]
        }
      ]
    };

    const updatedList = [newGroup, ...groups];
    updateGroupsInDB(updatedList);
    setJoinedGroupIds([...joinedGroupIds, newGroup.id]);

    // Reset Form
    setNewGroupName('');
    setNewGroupTopic('');
    setNewGroupDesc('');
    setNewGroupMax(10);
    setNewGroupSchedule('');
    setNewGroupRules('');
    setIsCreateOpen(false);
    showToast(`"${newGroup.name}" group created successfully! You are the administrator. 👑`);
  };

  // 4. Post Message Logic
  const handleAddPost = (e) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    const newPost = {
      id: 'post_' + Date.now(),
      groupId: viewingGroupId,
      author: learner?.name || 'Student',
      authorId: learner?.learner_id || 'anonymous',
      avatar: learner?.name?.toLowerCase().includes('sara') ? 'girl' : 'boy',
      content: newPostText.trim(),
      timestamp: new Date().toISOString(),
      likes: 0,
      likedBy: [],
      isPinned: false
    };

    updatePostsInDB([newPost, ...posts]);
    setNewPostText('');
    showToast('Message posted to board!');
  };

  // Like post toggle
  const handleLikePost = (postId) => {
    if (!learner) return;
    const updated = posts.map(post => {
      if (post.id === postId) {
        const isLiked = post.likedBy.includes(learner.learner_id);
        const likedBy = isLiked 
          ? post.likedBy.filter(id => id !== learner.learner_id)
          : [...post.likedBy, learner.learner_id];
        return {
          ...post,
          likes: likedBy.length,
          likedBy
        };
      }
      return post;
    });
    updatePostsInDB(updated);
  };

  // Pin Post toggle (Admin only)
  const handleTogglePinPost = (postId) => {
    const updated = posts.map(post => {
      if (post.id === postId) {
        const pinState = !post.isPinned;
        showToast(pinState ? 'Post pinned to top!' : 'Post unpinned.');
        return { ...post, isPinned: pinState };
      }
      return post;
    });
    updatePostsInDB(updated);
  };

  // Delete Post (Admin or author only)
  const handleDeletePost = (postId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this post?");
    if (!confirmDelete) return;

    updatePostsInDB(posts.filter(p => p.id !== postId));
    showToast('Post deleted.');
  };

  // 5. Schedule Study Session (Admin only)
  const handleScheduleSession = (e) => {
    e.preventDefault();
    if (!sessTitle.trim() || !sessDate || !sessStart || !sessEnd) {
      showToast('Please fill out title, date, and meeting hours.', 'error');
      return;
    }

    const newSession = {
      id: 'session_' + Date.now(),
      groupId: viewingGroupId,
      title: sessTitle.trim(),
      description: sessDesc.trim() || 'No description provided.',
      date: sessDate,
      startTime: sessStart,
      endTime: sessEnd,
      meetingLink: sessLink.trim() || 'https://meet.google.com/mock-link',
      rsvps: [learner?.learner_id].filter(Boolean)
    };

    updateSessionsInDB([...sessions, newSession]);
    setSessTitle('');
    setSessDesc('');
    setSessDate('');
    setSessStart('');
    setSessEnd('');
    setSessLink('');
    setIsSessionModalOpen(false);
    showToast('Upcoming study session scheduled successfully! 📅');
  };

  // RSVP Session
  const handleToggleRSVP = (sessionId) => {
    if (!learner) return;
    const updated = sessions.map(sess => {
      if (sess.id === sessionId) {
        const hasRSVP = sess.rsvps.includes(learner.learner_id);
        const rsvps = hasRSVP
          ? sess.rsvps.filter(id => id !== learner.learner_id)
          : [...sess.rsvps, learner.learner_id];
        showToast(hasRSVP ? 'RSVP cancelled.' : 'RSVP registered! See you there! 🎉');
        return { ...sess, rsvps };
      }
      return sess;
    });
    updateSessionsInDB(updated);
  };

  // 6. Resource Upload (Admins and members)
  const handleAddResource = (e) => {
    e.preventDefault();
    if (!resTitle.trim() || !resLink.trim()) {
      showToast('Please provide resource title and URL link.', 'error');
      return;
    }

    const newRes = {
      id: 'res_' + Date.now(),
      groupId: viewingGroupId,
      title: resTitle.trim(),
      description: resDesc.trim() || 'No description.',
      link: resLink.trim().startsWith('http') ? resLink.trim() : 'https://' + resLink.trim()
    };

    updateResourcesInDB([...resources, newRes]);
    setResTitle('');
    setResDesc('');
    setResLink('');
    setIsResourceModalOpen(false);
    showToast('Resource link uploaded!');
  };

  // 7. Members management (Admins only)
  const handleRemoveMember = (groupId, memberId) => {
    const confirmRemove = window.confirm("Are you sure you want to remove this learner from the group?");
    if (!confirmRemove) return;

    const updatedGroups = groups.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          membersCount: Math.max(0, g.membersCount - 1),
          members: g.members.filter(m => m.id !== memberId)
        };
      }
      return g;
    });

    updateGroupsInDB(updatedGroups);
    showToast('Learner removed from study circle.');
  };

  const handlePromoteAdmin = (groupId, memberId) => {
    const updatedGroups = groups.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          members: g.members.map(m => m.id === memberId ? { ...m, role: 'Admin' } : m)
        };
      }
      return g;
    });

    updateGroupsInDB(updatedGroups);
    showToast('Member promoted to Administrator! 👑');
  };

  // Filters & recommendations calculations
  const viewingGroup = groups.find(g => g.id === viewingGroupId);
  const userIsGroupMember = viewingGroup?.members.some(m => m.id === learner?.learner_id);
  const userIsGroupAdmin = viewingGroup?.members.some(m => m.id === learner?.learner_id && m.role === 'Admin') || viewingGroup?.creatorId === learner?.learner_id;

  const currentLanguageCode = learner?.learning_language || 'en';
  const currentSkillLevel = learner?.level || 'Beginner';

  // Sort groups list
  const getSortedGroups = (list) => {
    const clone = [...list];
    if (sortBy === 'Popular') {
      return clone.sort((a, b) => b.membersCount - a.membersCount);
    } else if (sortBy === 'Newest') {
      return clone.sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated));
    } else {
      // Most Active (mock based on posts counts)
      const countPosts = (gId) => posts.filter(p => p.groupId === gId).length;
      return clone.sort((a, b) => countPosts(b.id) - countPosts(a.id));
    }
  };

  // Recommended Groups algorithm
  const getRecommendedGroups = () => {
    // Recommend matching target language and level first
    const matchLangLevel = groups.filter(g => 
      g.language === currentLanguageCode && 
      g.level === currentSkillLevel &&
      !g.members.some(m => m.id === learner?.learner_id)
    );

    if (matchLangLevel.length > 0) return matchLangLevel.slice(0, 2);

    // Fallback: match target language
    const matchLang = groups.filter(g => 
      g.language === currentLanguageCode &&
      !g.members.some(m => m.id === learner?.learner_id)
    );
    if (matchLang.length > 0) return matchLang.slice(0, 2);

    // Fallback: popular
    return getSortedGroups(groups.filter(g => !g.members.some(m => m.id === learner?.learner_id))).slice(0, 2);
  };

  const recommendedGroups = getRecommendedGroups();

  // Dynamic filter application
  const getFilteredGroups = () => {
    return groups.filter(g => {
      // Search Box match
      const query = searchQuery.toLowerCase();
      const matchesSearch = !query || 
        g.name.toLowerCase().includes(query) || 
        g.topic.toLowerCase().includes(query) || 
        g.description.toLowerCase().includes(query);

      // Language filter
      const matchesLang = filterLang === 'All' || g.language === filterLang;

      // Level filter
      const matchesLevel = filterLevel === 'All' || g.level === filterLevel;

      // Availability filter
      const matchesAvail = filterAvailability === 'All' || 
        (filterAvailability === 'Available' && g.membersCount < g.maxMembers) ||
        (filterAvailability === 'Full' && g.membersCount >= g.maxMembers);

      return matchesSearch && matchesLang && matchesLevel && matchesAvail;
    });
  };

  const filteredGroupsList = getSortedGroups(getFilteredGroups());
  const myGroupsList = groups.filter(g => g.members.some(m => m.id === learner?.learner_id));

  // Language mapping labels
  const LANG_LABELS = {
    en: '🇬🇧 English',
    hi: '🇮🇳 Hindi',
    kn: '🇮🇳 Kannada',
    ta: '🇮🇳 Tamil'
  };

  return (
    <div style={{ marginTop: '20px' }}>
      {/* Toast Notification banner */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: toast.type === 'error' ? '#FFECEF' : '#EAFCEF',
          color: toast.type === 'error' ? '#FF4757' : '#27AE60',
          border: `2px solid ${toast.type === 'error' ? '#FFCCD3' : '#A9F5C5'}`,
          padding: '12px 24px',
          borderRadius: '12px',
          fontWeight: 800,
          boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
          zIndex: 1001,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
          <span>{toast.text}</span>
        </div>
      )}

      {/* ====================================================
          GROUP DETAILS VIEW
          ==================================================== */}
      {viewingGroupId && viewingGroup ? (
        <div className={styles.sectionBox} style={{ border: '3.5px solid var(--color-peach)', padding: '24px' }}>
          
          {/* Header Action Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', borderBottom: '2.5px dashed var(--color-peach)', paddingBottom: '16px', marginBottom: '20px' }}>
            <div>
              <button 
                onClick={() => setViewingGroupId(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-orange)',
                  fontWeight: 900,
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  padding: 0,
                  marginBottom: '10px'
                }}
                type="button"
              >
                <ArrowLeft size={16} />
                <span>Back to Study Groups List</span>
              </button>
              
              <h2 style={{ fontSize: '24px', fontWeight: 950, color: 'var(--color-orange-dark)', margin: 0 }}>
                {viewingGroup.name}
              </h2>
              
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '8px' }}>
                <span className={styles.categoryBadge} style={{ backgroundColor: 'var(--color-peach-light)', color: 'var(--color-orange-dark)' }}>
                  {LANG_LABELS[viewingGroup.language] || viewingGroup.language}
                </span>
                <span className={styles.categoryBadge}>
                  Level: {viewingGroup.level}
                </span>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '6px' }}>
                  <Users size={14} /> {viewingGroup.membersCount} / {viewingGroup.maxMembers} Members
                </span>
              </div>
            </div>

            {/* Leave / Membership Button */}
            {userIsGroupMember ? (
              <button
                onClick={() => handleLeaveGroup(viewingGroup.id)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: '2px solid #FFCCD3',
                  backgroundColor: '#FFF2F3',
                  color: '#FF4757',
                  fontSize: '12.5px',
                  fontWeight: 900,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease'
                }}
                type="button"
              >
                <LogOut size={14} />
                <span>Leave Group</span>
              </button>
            ) : (
              <button
                onClick={() => handleJoinGroup(viewingGroup)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '20px',
                  border: 'none',
                  backgroundColor: 'var(--color-orange)',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 900,
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-button-orange)'
                }}
                type="button"
              >
                Join Group ➔
              </button>
            )}
          </div>

          {/* Group details subsection Tabs */}
          <div className={styles.tabBar} style={{ margin: '0 0 20px 0', borderBottom: '2px solid var(--color-peach-light)', paddingBottom: '0px' }}>
            {[
              { id: 'overview', label: '📖 Overview' },
              { id: 'discussion', label: '💬 Discussions' },
              { id: 'resources', label: '📄 Resources' },
              { id: 'members', label: '👥 Members' },
              { id: 'schedule', label: '📅 Study Sessions' }
            ].map(tab => (
              <button
                key={tab.id}
                className={`${styles.tabPill} ${groupTab === tab.id ? styles.activeTabPill : ''}`}
                onClick={() => setGroupTab(tab.id)}
                style={{ padding: '8px 16px', fontSize: '13px' }}
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ==================== TAB 1: OVERVIEW ==================== */}
          {groupTab === 'overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 900, color: 'var(--text-dark)', marginBottom: '8px' }}>About this Group</h4>
                <p style={{ fontSize: '14.5px', color: 'var(--text-muted)', fontWeight: 650, lineHeight: 1.5, marginBottom: '16px' }}>
                  {viewingGroup.description}
                </p>

                <div style={{ backgroundColor: '#FFFDF9', border: '2px dashed var(--color-peach)', padding: '16px', borderRadius: '12px', marginBottom: '16px' }}>
                  <h5 style={{ fontWeight: 900, color: 'var(--color-orange-dark)', margin: '0 0 6px 0', fontSize: '14px' }}>⏰ Study Schedule</h5>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: 750, color: 'var(--text-dark)' }}>{viewingGroup.schedule} ({viewingGroup.frequency})</p>
                </div>

                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700 }}>
                  Created by: <strong>{viewingGroup.creatorName}</strong> on {new Date(viewingGroup.dateCreated).toLocaleDateString()}
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 900, color: 'var(--text-dark)', marginBottom: '8px' }}>Group Rules</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {viewingGroup.rules.map((rule, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', fontSize: '13px', color: 'var(--text-muted)', fontWeight: 700 }}>
                      <CheckCircle size={14} color="var(--color-orange)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{rule}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ==================== TAB 2: DISCUSSIONS ==================== */}
          {groupTab === 'discussion' && (
            <div style={{ maxWidth: '640px', margin: '0 auto' }}>
              {userIsGroupMember ? (
                <form onSubmit={handleAddPost} className={styles.communityComposer} style={{ marginBottom: '20px', border: '2.5px solid var(--color-peach)' }}>
                  <span className={styles.composerAvatar}>✍️</span>
                  <div className={styles.composerRight}>
                    <textarea
                      className={styles.composerInput}
                      placeholder="Ask a question or share vocabulary study tips..."
                      value={newPostText}
                      onChange={(e) => setNewPostText(e.target.value)}
                      rows={2}
                      required
                    />
                    <div className={styles.composerFooter}>
                      <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: 800 }}>Group Members Board</span>
                      <button className={styles.postBtn} type="submit">Post to Group</button>
                    </div>
                  </div>
                </form>
              ) : (
                <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#FAF8F5', borderRadius: '12px', border: '1.5px solid var(--color-peach-light)', color: 'var(--text-muted)', fontWeight: 700, fontSize: '13.5px', marginBottom: '20px' }}>
                  🔒 Join this group to participate in discussions and post messages.
                </div>
              )}

              {/* Group Posts Feed */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {posts.filter(p => p.groupId === viewingGroupId).length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontWeight: 700, fontSize: '14px' }}>
                    🫙 No discussions yet. Be the first to start a conversation!
                  </div>
                ) : (
                  // Sort pinned posts first
                  [...posts.filter(p => p.groupId === viewingGroupId)]
                    .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0))
                    .map(post => {
                      const userLiked = post.likedBy.includes(learner?.learner_id);
                      const isAuthor = post.authorId === learner?.learner_id;
                      
                      return (
                        <div key={post.id} className={styles.postCard} style={{ border: post.isPinned ? '2.5px solid var(--color-orange)' : '2.5px solid var(--color-peach-light)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div className={styles.postHeader} style={{ margin: 0 }}>
                              <span className={styles.composerAvatar} style={{ width: '38px', height: '38px', fontSize: '24px' }}>
                                {post.avatar === 'girl' ? '👧' : '👦'}
                              </span>
                              <div className={styles.postMeta}>
                                <h5 style={{ fontSize: '14px', fontWeight: 900 }}>
                                  {post.author} {post.authorId === viewingGroup.creatorId && <span style={{ fontSize: '10px', backgroundColor: 'var(--color-peach)', color: 'var(--color-orange-dark)', padding: '1px 5px', borderRadius: '8px', marginLeft: '4px' }}>Admin</span>}
                                </h5>
                                <span>{new Date(post.timestamp).toLocaleString()}</span>
                              </div>
                            </div>
                            
                            {/* Admin / Author actions */}
                            <div style={{ display: 'flex', gap: '4px' }}>
                              {post.isPinned && (
                                <span style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '2px', backgroundColor: '#FFF0DF', color: 'var(--color-orange-dark)', padding: '2px 8px', borderRadius: '12px', fontWeight: 800 }}>
                                  <Pin size={11} fill="var(--color-orange)" /> Pinned
                                </span>
                              )}
                              {userIsGroupAdmin && (
                                <button 
                                  onClick={() => handleTogglePinPost(post.id)}
                                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                                  title="Toggle Pin to Top"
                                  type="button"
                                >
                                  <Pin size={14} color="var(--color-orange)" />
                                </button>
                              )}
                              {(isAuthor || userIsGroupAdmin) && (
                                <button
                                  onClick={() => handleDeletePost(post.id)}
                                  style={{ background: 'none', border: 'none', color: '#FF4757', cursor: 'pointer', padding: '4px' }}
                                  title="Delete Post"
                                  type="button"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </div>

                          <p style={{ margin: '8px 0', fontSize: '14px', color: 'var(--text-dark)', fontWeight: 700, lineHeight: 1.4 }}>
                            {post.content}
                          </p>

                          <div className={styles.postActions} style={{ margin: 0, paddingTop: '8px', borderTop: '1px dashed var(--color-peach-light)' }}>
                            <button
                              className={styles.postActionBtn}
                              onClick={() => handleLikePost(post.id)}
                              style={{ color: userLiked ? 'var(--color-orange)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 800 }}
                              disabled={!userIsGroupMember}
                              type="button"
                            >
                              <ThumbsUp size={14} fill={userLiked ? 'var(--color-orange)' : 'none'} />
                              <span>{post.likes} Likes</span>
                            </button>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          )}

          {/* ==================== TAB 3: RESOURCES ==================== */}
          {groupTab === 'resources' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: 900, color: 'var(--text-dark)', margin: 0 }}>📚 Study Resources & PDFs</h4>
                {userIsGroupMember && (
                  <button
                    onClick={() => setIsResourceModalOpen(true)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '20px',
                      border: 'none',
                      backgroundColor: 'var(--color-orange)',
                      color: '#FFFFFF',
                      fontSize: '12px',
                      fontWeight: 900,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    type="button"
                  >
                    <Plus size={14} /> Upload Link
                  </button>
                )}
              </div>

              {/* Resource cards list */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {resources.filter(r => r.groupId === viewingGroupId).length === 0 ? (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontWeight: 700 }}>
                    🫙 No learning resources shared yet.
                  </div>
                ) : (
                  resources.filter(r => r.groupId === viewingGroupId).map(res => (
                    <div key={res.id} style={{ padding: '16px', border: '2px solid var(--color-peach-light)', borderRadius: '12px', backgroundColor: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--color-peach-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FolderOpen size={16} color="var(--color-orange)" />
                      </div>
                      <h5 style={{ fontSize: '14.5px', fontWeight: 900, margin: '6px 0 2px 0', color: 'var(--text-dark)' }}>{res.title}</h5>
                      <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', fontWeight: 650, margin: 0, flexGrow: 1 }}>{res.description}</p>
                      <a 
                        href={res.link} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        style={{
                          marginTop: '12px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: 'var(--color-orange)',
                          fontWeight: 900,
                          fontSize: '12px',
                          textDecoration: 'none'
                        }}
                      >
                        <span>Open Resource</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  ))
                )}
              </div>

              {/* RESOURCE MODAL */}
              {isResourceModalOpen && (
                <div className={styles.certModalOverlay} onClick={() => setIsResourceModalOpen(false)}>
                  <div className={styles.certModalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', border: '5px double var(--color-peach)', padding: '24px' }}>
                    <button className={styles.certModalClose} onClick={() => setIsResourceModalOpen(false)} type="button">&times;</button>
                    <h3 style={{ border: 'none', margin: '0 0 16px 0' }}>📂 Upload Resource Link</h3>
                    <form onSubmit={handleAddResource}>
                      <div className={styles.formRow}>
                        <label className={styles.formLabel}>Title *</label>
                        <input
                          type="text"
                          className={styles.formInput}
                          placeholder="e.g. English Spelling Worksheets"
                          value={resTitle}
                          onChange={(e) => setResTitle(e.target.value)}
                          required
                        />
                      </div>
                      <div className={styles.formRow}>
                        <label className={styles.formLabel}>Resource Link URL *</label>
                        <input
                          type="text"
                          className={styles.formInput}
                          placeholder="e.g. https://example.com/vocab.pdf"
                          value={resLink}
                          onChange={(e) => setResLink(e.target.value)}
                          required
                        />
                      </div>
                      <div className={styles.formRow}>
                        <label className={styles.formLabel}>Short Description</label>
                        <textarea
                          className={styles.formTextarea}
                          rows={2}
                          placeholder="Add details about what is inside..."
                          value={resDesc}
                          onChange={(e) => setResDesc(e.target.value)}
                        />
                      </div>
                      <button className={styles.submitBtn} style={{ width: '100%' }} type="submit">Submit Link</button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================== TAB 4: MEMBERS ==================== */}
          {groupTab === 'members' && (
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: 900, color: 'var(--text-dark)', marginBottom: '16px' }}>Group Members list</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {viewingGroup.members.map((member) => (
                  <div key={member.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', border: '1.5px solid var(--color-peach-light)', borderRadius: '12px', backgroundColor: '#FFFFFF' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--color-peach-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                        {member.name.toLowerCase().includes('sara') ? '👧' : '👦'}
                      </div>
                      <div>
                        <h5 style={{ margin: 0, fontSize: '14px', fontWeight: 900, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>{member.name}</span>
                          {member.role === 'Admin' && <span style={{ fontSize: '10px', backgroundColor: 'var(--color-peach)', color: 'var(--color-orange-dark)', padding: '1px 5px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '2px' }}><Shield size={8} /> Admin</span>}
                        </h5>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>Joined: {member.joinDate} • Level: {member.level}</span>
                      </div>
                    </div>

                    {/* Admin settings controls */}
                    {userIsGroupAdmin && member.id !== learner?.learner_id && (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {member.role !== 'Admin' && (
                          <button
                            onClick={() => handlePromoteAdmin(viewingGroup.id, member.id)}
                            style={{ padding: '4px 10px', borderRadius: '8px', border: '1.5px solid var(--color-orange)', backgroundColor: 'transparent', color: 'var(--color-orange-dark)', fontSize: '11px', fontWeight: 800, cursor: 'pointer' }}
                            type="button"
                          >
                            Make Admin
                          </button>
                        )}
                        <button
                          onClick={() => handleRemoveMember(viewingGroup.id, member.id)}
                          style={{ padding: '4px 10px', borderRadius: '8px', border: '1.5px solid #FFCCD3', backgroundColor: 'transparent', color: '#FF4757', fontSize: '11px', fontWeight: 800, cursor: 'pointer' }}
                          type="button"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== TAB 5: STUDY SESSIONS ==================== */}
          {groupTab === 'schedule' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: 900, color: 'var(--text-dark)', margin: 0 }}>📅 Upcoming Audio/Video Study Sessions</h4>
                {userIsGroupAdmin && (
                  <button
                    onClick={() => setIsSessionModalOpen(true)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '20px',
                      border: 'none',
                      backgroundColor: 'var(--color-orange)',
                      color: '#FFFFFF',
                      fontSize: '12px',
                      fontWeight: 900,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    type="button"
                  >
                    <Plus size={14} /> Schedule Session
                  </button>
                )}
              </div>

              {/* Sessions list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {sessions.filter(s => s.groupId === viewingGroupId).length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontWeight: 700 }}>
                    📅 No upcoming sessions scheduled for this group.
                  </div>
                ) : (
                  sessions.filter(s => s.groupId === viewingGroupId).map(sess => {
                    const userHasRSVP = sess.rsvps.includes(learner?.learner_id);
                    return (
                      <div key={sess.id} style={{ padding: '16px', border: '2px solid var(--color-peach-light)', borderRadius: '12px', backgroundColor: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                        <div>
                          <h5 style={{ fontSize: '15px', fontWeight: 900, margin: '0 0 4px 0', color: 'var(--text-dark)' }}>{sess.title}</h5>
                          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', fontWeight: 650, margin: '0 0 10px 0', maxWidth: '460px' }}>{sess.description}</p>
                          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={13} color="var(--color-orange)" /> {sess.date}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={13} color="var(--color-orange)" /> {sess.startTime} - {sess.endTime}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Users size={13} color="var(--color-orange)" /> {sess.rsvps.length} RSVPed</span>
                          </div>
                        </div>

                        {/* Session joins */}
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          {userIsGroupMember && (
                            <button
                              onClick={() => handleToggleRSVP(sess.id)}
                              style={{
                                padding: '6px 12px',
                                borderRadius: '12px',
                                border: '2px solid var(--color-peach)',
                                backgroundColor: userHasRSVP ? 'var(--color-peach-light)' : '#FFFFFF',
                                color: 'var(--color-orange-dark)',
                                fontSize: '11px',
                                fontWeight: 900,
                                cursor: 'pointer'
                              }}
                              type="button"
                            >
                              {userHasRSVP ? '✓ RSVPed' : 'RSVP'}
                            </button>
                          )}
                          <a
                            href={sess.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              padding: '8px 14px',
                              borderRadius: '12px',
                              backgroundColor: 'var(--color-orange)',
                              color: '#FFFFFF',
                              textDecoration: 'none',
                              fontSize: '11px',
                              fontWeight: 900,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <span>Join Meeting</span>
                            <ExternalLink size={11} />
                          </a>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* CREATE SESSION MODAL */}
              {isSessionModalOpen && (
                <div className={styles.certModalOverlay} onClick={() => setIsSessionModalOpen(false)}>
                  <div className={styles.certModalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', border: '5px double var(--color-peach)', padding: '24px' }}>
                    <button className={styles.certModalClose} onClick={() => setIsSessionModalOpen(false)} type="button">&times;</button>
                    <h3 style={{ border: 'none', margin: '0 0 16px 0' }}>📅 Schedule Study Session</h3>
                    <form onSubmit={handleScheduleSession}>
                      <div className={styles.formRow}>
                        <label className={styles.formLabel}>Session Title *</label>
                        <input
                          type="text"
                          className={styles.formInput}
                          placeholder="e.g. Grammar Workshop"
                          value={sessTitle}
                          onChange={(e) => setSessTitle(e.target.value)}
                          required
                        />
                      </div>
                      <div className={styles.formRow}>
                        <label className={styles.formLabel}>Date *</label>
                        <input
                          type="date"
                          className={styles.formInput}
                          value={sessDate}
                          onChange={(e) => setSessDate(e.target.value)}
                          required
                        />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div className={styles.formRow}>
                          <label className={styles.formLabel}>Start Time *</label>
                          <input
                            type="time"
                            className={styles.formInput}
                            value={sessStart}
                            onChange={(e) => setSessStart(e.target.value)}
                            required
                          />
                        </div>
                        <div className={styles.formRow}>
                          <label className={styles.formLabel}>End Time *</label>
                          <input
                            type="time"
                            className={styles.formInput}
                            value={sessEnd}
                            onChange={(e) => setSessEnd(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className={styles.formRow}>
                        <label className={styles.formLabel}>Meeting Link (Google Meet/Zoom)</label>
                        <input
                          type="text"
                          className={styles.formInput}
                          placeholder="https://meet.google.com/..."
                          value={sessLink}
                          onChange={(e) => setSessLink(e.target.value)}
                        />
                      </div>
                      <div className={styles.formRow}>
                        <label className={styles.formLabel}>Description</label>
                        <textarea
                          className={styles.formTextarea}
                          rows={2}
                          placeholder="What will we study in this session?"
                          value={sessDesc}
                          onChange={(e) => setSessDesc(e.target.value)}
                        />
                      </div>
                      <button className={styles.submitBtn} style={{ width: '100%' }} type="submit">Schedule Session</button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      ) : (
        /* ====================================================
            GROUPS DIRECTORY LIST VIEW
            ==================================================== */
        <div>
          {/* 1. Recommended groups section */}
          {recommendedGroups.length > 0 && (
            <div className={styles.sectionBox} style={{ backgroundColor: '#FFFDF9', border: '3.5px dashed var(--color-peach)', padding: '20px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Sparkles size={20} color="var(--color-orange)" />
                <h4 style={{ fontWeight: 950, color: 'var(--color-orange-dark)', margin: 0, fontSize: '17px' }}>Recommended for You</h4>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {recommendedGroups.map(group => (
                  <div key={group.id} style={{ backgroundColor: '#FFFFFF', padding: '16px', border: '2px solid var(--color-peach-light)', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span className={styles.categoryBadge} style={{ margin: 0, backgroundColor: 'var(--color-peach-light)', color: 'var(--color-orange-dark)' }}>
                        {LANG_LABELS[group.language] || group.language}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 800 }}>Level: {group.level}</span>
                    </div>
                    <h5 style={{ fontSize: '14.5px', fontWeight: 900, margin: '4px 0 0 0', color: 'var(--text-dark)' }}>{group.name}</h5>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, flexGrow: 1, margin: '4px 0 8px 0', lineHeight: 1.3 }}>{group.description}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                      <span style={{ fontSize: '11.5px', fontWeight: 800, color: 'var(--text-muted)' }}>{group.membersCount} / {group.maxMembers} Members</span>
                      <button 
                        onClick={() => {
                          setViewingGroupId(group.id);
                          setGroupTab('overview');
                        }}
                        style={{ background: 'none', border: 'none', color: 'var(--color-orange)', fontSize: '12px', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
                        type="button"
                      >
                        Explore ➔
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. My Joined Groups Section */}
          {myGroupsList.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 900, color: 'var(--color-orange-dark)', borderBottom: '2px dashed var(--color-peach)', paddingBottom: '6px', marginBottom: '14px' }}>
                👥 My Joined Circles ({myGroupsList.length})
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
                {myGroupsList.map(group => {
                  const upcoming = sessions.find(s => s.groupId === group.id);
                  const isCreator = group.creatorId === learner?.learner_id;
                  
                  return (
                    <div key={group.id} style={{ padding: '16px', border: '3px solid var(--color-peach-light)', borderRadius: '16px', backgroundColor: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ fontSize: '15px', fontWeight: 950, color: 'var(--text-dark)', margin: 0 }}>{group.name}</h4>
                        {isCreator && <span style={{ fontSize: '9px', backgroundColor: 'var(--color-peach)', color: 'var(--color-orange-dark)', padding: '1px 5px', borderRadius: '8px', fontWeight: 800 }}>Creator</span>}
                      </div>
                      
                      {upcoming ? (
                        <div style={{ fontSize: '11px', color: '#27AE60', fontWeight: 800, backgroundColor: '#EAFCEF', padding: '4px 8px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={10} />
                          <span>Session: {upcoming.date} at {upcoming.startTime}</span>
                        </div>
                      ) : (
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>
                          No upcoming sessions
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: '6px', marginTop: 'auto', paddingTop: '10px' }}>
                        <button
                          onClick={() => {
                            setViewingGroupId(group.id);
                            setGroupTab('overview');
                          }}
                          style={{ flex: 1, padding: '6px 12px', borderRadius: '12px', border: 'none', backgroundColor: 'var(--color-peach-light)', color: 'var(--color-orange-dark)', fontSize: '11.5px', fontWeight: 900, cursor: 'pointer' }}
                          type="button"
                        >
                          Open Group
                        </button>
                        <button
                          onClick={() => handleLeaveGroup(group.id)}
                          style={{ padding: '6px 10px', borderRadius: '12px', border: '1.5px solid #FFCCD3', backgroundColor: 'transparent', color: '#FF4757', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          title="Leave Group"
                          type="button"
                        >
                          <LogOut size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. Search and filtering Controls */}
          <div className={styles.sectionBox} style={{ padding: '16px', marginBottom: '20px', border: '3.5px solid var(--color-peach-light)' }}>
            
            {/* Top search & create bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderBottom: '2px dashed var(--color-peach-light)', paddingBottom: '14px', marginBottom: '14px' }}>
              <div style={{ position: 'relative', width: '100%', maxWidth: '340px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--color-orange)' }} />
                <input
                  type="text"
                  placeholder="Search groups by topic or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 36px',
                    borderRadius: '20px',
                    border: '2px solid var(--color-peach)',
                    fontSize: '13px',
                    fontWeight: 750,
                    outline: 'none'
                  }}
                />
              </div>

              <button
                onClick={() => setIsCreateOpen(true)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '20px',
                  border: 'none',
                  backgroundColor: 'var(--color-orange)',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 900,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: 'var(--shadow-button-orange)'
                }}
                type="button"
              >
                <Plus size={16} />
                <span>Create Study Group</span>
              </button>
            </div>

            {/* Filter Pills row */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
              
              {/* Language filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Language</span>
                <select
                  value={filterLang}
                  onChange={(e) => setFilterLang(e.target.value)}
                  style={{ padding: '6px 10px', borderRadius: '12px', border: '1.5px solid var(--color-peach)', fontSize: '12px', fontWeight: 750, outline: 'none' }}
                >
                  <option value="All">All Languages</option>
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="kn">Kannada</option>
                  <option value="ta">Tamil</option>
                </select>
              </div>

              {/* Level Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Level</span>
                <select
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value)}
                  style={{ padding: '6px 10px', borderRadius: '12px', border: '1.5px solid var(--color-peach)', fontSize: '12px', fontWeight: 750, outline: 'none' }}
                >
                  <option value="All">All Levels</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              {/* Availability Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Seats</span>
                <select
                  value={filterAvailability}
                  onChange={(e) => setFilterAvailability(e.target.value)}
                  style={{ padding: '6px 10px', borderRadius: '12px', border: '1.5px solid var(--color-peach)', fontSize: '12px', fontWeight: 750, outline: 'none' }}
                >
                  <option value="All">All Availability</option>
                  <option value="Available">Available Seats</option>
                  <option value="Full">Full Groups</option>
                </select>
              </div>

              {/* Sort selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
                <Filter size={12} color="var(--color-orange)" />
                <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Sort By</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{ padding: '6px 10px', borderRadius: '12px', border: '1.5px solid var(--color-peach)', fontSize: '12px', fontWeight: 750, outline: 'none' }}
                >
                  <option value="Popular">Popular (Most Members)</option>
                  <option value="Newest">Newest Groups</option>
                  <option value="Active">Most Active (Messages)</option>
                </select>
              </div>

            </div>
          </div>

          {/* 4. Groups Directory grid cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {filteredGroupsList.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', border: '3.5px dashed var(--color-peach)', borderRadius: '16px', backgroundColor: '#FFFFFF' }}>
                <AlertCircle size={48} color="var(--color-orange)" style={{ margin: '0 auto 12px' }} />
                <h4 style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-dark)' }}>No study groups found</h4>
                <p style={{ color: 'var(--text-muted)', fontWeight: 700, marginTop: '4px' }}>Search returned no results. Try adjusting language, levels, or query keywords.</p>
              </div>
            ) : (
              filteredGroupsList.map(group => {
                const isMember = joinedGroupIds.includes(group.id);
                const isFull = group.membersCount >= group.maxMembers;
                
                return (
                  <div key={group.id} className={styles.bookCard} style={{ display: 'flex', flexDirection: 'column', height: '100%', border: '3px solid var(--color-peach-light)', padding: '20px', borderRadius: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <span className={styles.categoryBadge} style={{ margin: 0, backgroundColor: 'var(--color-peach-light)', color: 'var(--color-orange-dark)' }}>
                        {LANG_LABELS[group.language] || group.language}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 800 }}>Level: {group.level}</span>
                    </div>

                    <h4 style={{ fontSize: '17px', fontWeight: 950, color: 'var(--text-dark)', margin: '4px 0 2px 0' }}>{group.name}</h4>
                    <span style={{ fontSize: '11px', color: 'var(--color-orange-dark)', fontWeight: 800, marginBottom: '8px', display: 'block' }}>Topic: {group.topic}</span>
                    
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 650, flexGrow: 1, margin: '0 0 16px 0', lineHeight: 1.4 }}>
                      {group.description}
                    </p>

                    <div style={{ backgroundColor: '#FAF8F5', border: '1.5px solid var(--color-peach-light)', borderRadius: '10px', padding: '8px 12px', marginBottom: '14px', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} color="var(--color-orange)" />
                      <span>{group.schedule} ({group.frequency})</span>
                    </div>

                    {/* Member Avatars mock visualization */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {group.members.slice(0, 3).map((m, idx) => (
                          <div 
                            key={m.id} 
                            style={{ 
                              width: '26px', 
                              height: '26px', 
                              borderRadius: '50%', 
                              backgroundColor: 'var(--color-peach)', 
                              border: '2px solid #FFFFFF', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              fontSize: '13px',
                              marginLeft: idx > 0 ? '-8px' : '0',
                              zIndex: 3 - idx
                            }}
                          >
                            {m.name.slice(0, 1).toUpperCase()}
                          </div>
                        ))}
                        {group.members.length > 3 && (
                          <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', marginLeft: '4px' }}>+{group.members.length - 3}</span>
                        )}
                      </div>
                      <span style={{ fontSize: '11.5px', fontWeight: 800, color: 'var(--text-muted)' }}>
                        {group.membersCount} / {group.maxMembers} seats occupied
                      </span>
                    </div>

                    {/* Join / View Actions */}
                    <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                      <button
                        onClick={() => {
                          setViewingGroupId(group.id);
                          setGroupTab('overview');
                        }}
                        style={{ flex: 1, padding: '10px 14px', borderRadius: '20px', border: '2px solid var(--color-peach)', backgroundColor: '#FFFFFF', color: 'var(--color-orange-dark)', fontSize: '12.5px', fontWeight: 900, cursor: 'pointer' }}
                        type="button"
                      >
                        View Group
                      </button>
                      
                      {isMember ? (
                        <button
                          disabled
                          style={{ flex: 1, padding: '10px 14px', borderRadius: '20px', border: 'none', backgroundColor: '#EAFCEF', color: '#27AE60', fontSize: '12.5px', fontWeight: 900, cursor: 'default' }}
                          type="button"
                        >
                          ✓ Joined
                        </button>
                      ) : isFull ? (
                        <button
                          disabled
                          style={{ flex: 1, padding: '10px 14px', borderRadius: '20px', border: 'none', backgroundColor: '#F0F0F0', color: '#999999', fontSize: '12.5px', fontWeight: 900, cursor: 'default' }}
                          type="button"
                        >
                          Group Full
                        </button>
                      ) : (
                        <button
                          onClick={() => handleJoinGroup(group)}
                          style={{ flex: 1, padding: '10px 14px', borderRadius: '20px', border: 'none', backgroundColor: 'var(--color-orange)', color: '#FFFFFF', fontSize: '12.5px', fontWeight: 900, cursor: 'pointer', boxShadow: 'var(--shadow-button-orange)' }}
                          type="button"
                        >
                          {group.privacy === 'Private' ? 'Request Join' : 'Join Group'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* CREATE STUDY GROUP MODAL */}
          {isCreateOpen && (
            <div className={styles.certModalOverlay} onClick={() => setIsCreateOpen(false)}>
              <div className={styles.certModalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px', border: '5px double var(--color-peach)', padding: '24px' }}>
                <button className={styles.certModalClose} onClick={() => setIsCreateOpen(false)} type="button">&times;</button>
                <h3 style={{ border: 'none', margin: '0 0 16px 0' }}>👥 Create a New Study Group</h3>
                <form onSubmit={handleCreateGroup} style={{ maxHeight: '75vh', overflowY: 'auto', paddingRight: '8px' }}>
                  <div className={styles.formRow}>
                    <label className={styles.formLabel}>Group Name *</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      placeholder="e.g. English Grammar Club"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div className={styles.formRow}>
                      <label className={styles.formLabel}>Target Language *</label>
                      <select
                        value={newGroupLang}
                        onChange={(e) => setNewGroupLang(e.target.value)}
                        className={styles.formInput}
                      >
                        <option value="en">English</option>
                        <option value="hi">Hindi</option>
                        <option value="kn">Kannada</option>
                        <option value="ta">Tamil</option>
                      </select>
                    </div>
                    <div className={styles.formRow}>
                      <label className={styles.formLabel}>Target Level *</label>
                      <select
                        value={newGroupLevel}
                        onChange={(e) => setNewGroupLevel(e.target.value)}
                        className={styles.formInput}
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <label className={styles.formLabel}>Focus Topic *</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      placeholder="e.g. Letter Phonics or Spelling"
                      value={newGroupTopic}
                      onChange={(e) => setNewGroupTopic(e.target.value)}
                      required
                    />
                  </div>

                  <div className={styles.formRow}>
                    <label className={styles.formLabel}>Description *</label>
                    <textarea
                      className={styles.formTextarea}
                      rows={3}
                      placeholder="Describe the study circle, targets, and what participants should expect..."
                      value={newGroupDesc}
                      onChange={(e) => setNewGroupDesc(e.target.value)}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div className={styles.formRow}>
                      <label className={styles.formLabel}>Max Members limit</label>
                      <input
                        type="number"
                        min={3}
                        max={50}
                        className={styles.formInput}
                        value={newGroupMax}
                        onChange={(e) => setNewGroupMax(e.target.value)}
                      />
                    </div>
                    <div className={styles.formRow}>
                      <label className={styles.formLabel}>Privacy Tier</label>
                      <select
                        value={newGroupPrivacy}
                        onChange={(e) => setNewGroupPrivacy(e.target.value)}
                        className={styles.formInput}
                      >
                        <option value="Public">Public (Anyone can join)</option>
                        <option value="Private">Private (Requires invite/approval)</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div className={styles.formRow}>
                      <label className={styles.formLabel}>Study Schedule</label>
                      <input
                        type="text"
                        className={styles.formInput}
                        placeholder="e.g. Sat at 11:00 AM"
                        value={newGroupSchedule}
                        onChange={(e) => setNewGroupSchedule(e.target.value)}
                      />
                    </div>
                    <div className={styles.formRow}>
                      <label className={styles.formLabel}>Frequency</label>
                      <select
                        value={newGroupFreq}
                        onChange={(e) => setNewGroupFreq(e.target.value)}
                        className={styles.formInput}
                      >
                        <option value="Weekly">Weekly Meetings</option>
                        <option value="Bi-weekly">Bi-weekly Meetings</option>
                        <option value="Monthly">Monthly Meetings</option>
                        <option value="Daily">Daily Practice</option>
                      </select>
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <label className={styles.formLabel}>Group Rules (one per line)</label>
                    <textarea
                      className={styles.formTextarea}
                      rows={2}
                      placeholder="e.g. Respect everyone&#10;Speak English during meetings"
                      value={newGroupRules}
                      onChange={(e) => setNewGroupRules(e.target.value)}
                    />
                  </div>

                  <button className={styles.submitBtn} style={{ width: '100%', marginTop: '10px' }} type="submit">Create Group</button>
                </form>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
