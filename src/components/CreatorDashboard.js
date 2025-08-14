import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Tabs,
  Tab,
  LinearProgress,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Fab,
  Tooltip,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  TrendingUp,
  People,
  ThumbUp,
  Visibility,
  Assessment,
  ContentPaste,
  Star,
  MoreVert,
  CloudUpload,
  CheckCircle,
  Error,
  Schedule,
  Add,
  Refresh,
  Search,
  PlayArrow,
  Pause,
  Stop,
  VolumeUp,
  Mic,
  Edit,
  Analytics,
  Speed
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart as RechartsBarChart, Bar } from 'recharts';
import toast from 'react-hot-toast';

const API_BASE = `${process.env.REACT_APP_API_URL || 'https://ai-musical-store-backend-ndig.vercel.app'}/api/content`;

const CreatorDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bulkUploads, setBulkUploads] = useState([]);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    category: '',
    pdf_file: null
  });
  const [categories, setCategories] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showAudioOnly, setShowAudioOnly] = useState(false);
  const [processingAudio, setProcessingAudio] = useState({});
  const [audioPlayer, setAudioPlayer] = useState(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [audioLoading, setAudioLoading] = useState({});

  useEffect(() => {
    fetchDashboardData();
    fetchBulkUploads();
    fetchCategories();
  }, []);

  // Cleanup audio player on unmount
  useEffect(() => {
    return () => {
      if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
      }
    };
  }, [audioPlayer]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE}/creator/dashboard/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      } else {
        toast.error('Failed to load dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Error loading dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchBulkUploads = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE}/creator/bulk-uploads/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setBulkUploads(data);
      }
    } catch (error) {
      console.error('Error fetching bulk uploads:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE}/categories/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCategories(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to fetch categories:', response.status);
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const handleFileUpload = async () => {
    if (!uploadForm.title || !uploadForm.pdf_file) {
      toast.error('Please fill in all required fields');
      return;
    }

    setUploading(true);
    try {
      const token = localStorage.getItem('access_token');
      const formData = new FormData();
      formData.append('title', uploadForm.title);
      formData.append('description', uploadForm.description);
      formData.append('category', uploadForm.category);
      formData.append('pdf_file', uploadForm.pdf_file);

      const response = await fetch(`${API_BASE}/creator/bulk-upload/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      if (response.ok) {
        toast.success('Bulk upload started successfully!');
        setUploadDialogOpen(false);
        setUploadForm({ title: '', description: '', category: '', pdf_file: null });
        fetchBulkUploads();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to start bulk upload');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Error uploading file');
    } finally {
      setUploading(false);
    }
  };

    const generateAudioForContent = async (contentId, contentTitle) => {
    setProcessingAudio(prev => ({ ...prev, [contentId]: true }));
    
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE}/creator/generate-audio/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content_id: contentId,
          generate_audio: true
        })
      });

      if (response.ok) {
        toast.success(`Audio generation started for "${contentTitle}"`);
        // Refresh dashboard data after a delay
        setTimeout(() => {
          fetchDashboardData();
        }, 3000);
      } else {
        toast.error('Failed to start audio generation');
      }
    } catch (error) {
      console.error('Error generating audio:', error);
      toast.error('Error generating audio');
    } finally {
      setProcessingAudio(prev => ({ ...prev, [contentId]: false }));
    }
  };

  const playAudio = async (contentId, audioFile) => {
    try {
      console.log('Playing audio for content:', contentId);
      console.log('Audio file path:', audioFile);
      setAudioLoading(prev => ({ ...prev, [contentId]: true }));
      
      // Stop any currently playing audio
      if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
      }
      
             // Create new audio element - handle different audio file path formats
       const baseUrl = process.env.REACT_APP_API_URL || 'https://ai-musical-store-backend-ndig.vercel.app';
       
       let audioUrl;
       if (audioFile.startsWith('/media/')) {
         // If audioFile already includes /media/, use it directly
         audioUrl = `${baseUrl}${audioFile}`;
       } else if (audioFile.startsWith('media/')) {
         // If audioFile starts with media/, add the server URL
         audioUrl = `${baseUrl}/${audioFile}`;
       } else {
         // Default case: audioFile is just the relative path
         audioUrl = `${baseUrl}/media/${audioFile}`;
       }
       
       console.log('Audio URL:', audioUrl);
       const audio = new Audio(audioUrl);
      
      audio.addEventListener('loadstart', () => {
        console.log('Audio loading started');
      });
      
      audio.addEventListener('canplay', () => {
        console.log('Audio can play');
        setAudioLoading(prev => ({ ...prev, [contentId]: false }));
      });
      
      audio.addEventListener('play', () => {
        setCurrentlyPlaying(contentId);
      });
      
      audio.addEventListener('pause', () => {
        setCurrentlyPlaying(null);
      });
      
      audio.addEventListener('ended', () => {
        setCurrentlyPlaying(null);
      });
      
      audio.addEventListener('error', (e) => {
        console.error('Audio error:', e);
        toast.error('Error playing audio');
        setAudioLoading(prev => ({ ...prev, [contentId]: false }));
      });
      
      // Start playing
      await audio.play();
      setAudioPlayer(audio);
      
    } catch (error) {
      console.error('Error playing audio:', error);
      toast.error('Error playing audio');
      setAudioLoading(prev => ({ ...prev, [contentId]: false }));
    }
  };

  const pauseAudio = () => {
    if (audioPlayer) {
      audioPlayer.pause();
      setCurrentlyPlaying(null);
    }
  };

  const stopAudio = () => {
    if (audioPlayer) {
      audioPlayer.pause();
      audioPlayer.currentTime = 0;
      setCurrentlyPlaying(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'processing': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle />;
      case 'processing': return <Schedule />;
      case 'failed': return <Error />;
      default: return <Schedule />;
    }
  };

  const filteredContent = dashboardData?.recent_content?.filter(content => {
    const matchesSearch = content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         content.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || content.category === filterCategory;
    const matchesAudioFilter = !showAudioOnly || content.audio_file;
    return matchesSearch && matchesCategory && matchesAudioFilter;
  }) || [];

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="80vh"
        sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
      >
        <Box textAlign="center">
          <CircularProgress size={60} sx={{ color: 'white', mb: 2 }} />
          <Typography variant="h6" color="white">
            Loading Creator Dashboard...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (!dashboardData) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ fontSize: '1.1rem', py: 2 }}>
          Failed to load dashboard data. Please refresh the page.
        </Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      py: 3
    }}>
      <Container maxWidth="xl">
                 {/* Header Section */}
         <Box mb={4}>
           <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
             <Box>
               <Typography variant="h3" gutterBottom sx={{ 
                 fontWeight: 700, 
                 background: 'linear-gradient(45deg, #667eea, #764ba2)',
                 backgroundClip: 'text',
                 WebkitBackgroundClip: 'text',
                 WebkitTextFillColor: 'transparent'
               }}>
                 Creator Dashboard
               </Typography>
               <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
                 Welcome back, {dashboardData.username}! Here's your content performance overview.
               </Typography>
             </Box>
             <Box display="flex" gap={2}>
               <Button
                 variant="outlined"
                 startIcon={<Refresh />}
                 onClick={fetchDashboardData}
                 sx={{ borderRadius: 2 }}
               >
                 Refresh
               </Button>
               <Button
                 variant="contained"
                 startIcon={<Add />}
                 onClick={() => setUploadDialogOpen(true)}
                 sx={{ 
                   borderRadius: 2,
                   background: 'linear-gradient(45deg, #667eea, #764ba2)',
                   '&:hover': {
                     background: 'linear-gradient(45deg, #5a6fd8, #6a4190)'
                   }
                 }}
               >
                 Upload Content
               </Button>
             </Box>
           </Box>
         </Box>

         {/* Audio Player Controls */}
         {currentlyPlaying && (
           <Box mb={3}>
             <Card sx={{ 
               borderRadius: 3, 
               background: 'linear-gradient(45deg, #667eea, #764ba2)',
               color: 'white'
             }}>
               <CardContent>
                 <Box display="flex" alignItems="center" justifyContent="space-between">
                   <Box display="flex" alignItems="center" gap={2}>
                     <VolumeUp sx={{ fontSize: 32 }} />
                     <Box>
                       <Typography variant="h6" sx={{ fontWeight: 600 }}>
                         Now Playing
                       </Typography>
                       <Typography variant="body2" sx={{ opacity: 0.8 }}>
                         {dashboardData?.recent_content?.find(c => c.id === currentlyPlaying)?.title || 'Audio'}
                       </Typography>
                     </Box>
                   </Box>
                   <Box display="flex" gap={1}>
                     <IconButton 
                       onClick={pauseAudio}
                       sx={{ color: 'white' }}
                     >
                       <Pause />
                     </IconButton>
                     <IconButton 
                       onClick={stopAudio}
                       sx={{ color: 'white' }}
                     >
                       <Stop />
                     </IconButton>
                   </Box>
                 </Box>
               </CardContent>
             </Card>
           </Box>
         )}

        {/* Analytics Cards */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              borderRadius: 3, 
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white'
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="rgba(255,255,255,0.8)" gutterBottom sx={{ fontSize: '0.9rem' }}>
                      Total Followers
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700 }}>
                      {dashboardData.followers_count || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      +12% this month
                    </Typography>
                  </Box>
                  <People sx={{ fontSize: 50, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              borderRadius: 3, 
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white'
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="rgba(255,255,255,0.8)" gutterBottom sx={{ fontSize: '0.9rem' }}>
                      Total Views
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700 }}>
                      {dashboardData.content_performance?.total_views || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      +8% this week
                    </Typography>
                  </Box>
                  <Visibility sx={{ fontSize: 50, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              borderRadius: 3, 
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: 'white'
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="rgba(255,255,255,0.8)" gutterBottom sx={{ fontSize: '0.9rem' }}>
                      Total Likes
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700 }}>
                      {dashboardData.content_performance?.total_likes || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      +15% this month
                    </Typography>
                  </Box>
                  <ThumbUp sx={{ fontSize: 50, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              borderRadius: 3, 
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
              color: 'white'
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="rgba(255,255,255,0.8)" gutterBottom sx={{ fontSize: '0.9rem' }}>
                      Engagement Rate
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700 }}>
                      {dashboardData.content_performance?.average_engagement_rate || 0}%
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      +5% this week
                    </Typography>
                  </Box>
                  <TrendingUp sx={{ fontSize: 50, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Main Content Area */}
        <Card sx={{ borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={activeTab} 
              onChange={(e, newValue) => setActiveTab(newValue)}
              sx={{
                '& .MuiTab-root': {
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  minHeight: 64
                }
              }}
            >
              <Tab label="Overview" icon={<Assessment />} iconPosition="start" />
              <Tab label="Content" icon={<ContentPaste />} iconPosition="start" />
              <Tab label="Bulk Upload" icon={<CloudUpload />} iconPosition="start" />
              <Tab label="Analytics" icon={<Analytics />} iconPosition="start" />
            </Tabs>
          </Box>

          <Box p={4}>
            {/* Overview Tab */}
            {activeTab === 0 && (
              <Grid container spacing={4}>
                <Grid item xs={12} lg={8}>
                  <Card sx={{ borderRadius: 3, p: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                      Content Performance Trends
                    </Typography>
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={dashboardData.analytics?.content_performance || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="created_at__date" stroke="#666" />
                        <YAxis stroke="#666" />
                        <RechartsTooltip 
                          contentStyle={{ 
                            borderRadius: 8, 
                            border: 'none', 
                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)' 
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="total_views" 
                          stroke="#667eea" 
                          strokeWidth={3}
                          dot={{ fill: '#667eea', strokeWidth: 2, r: 4 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="total_likes" 
                          stroke="#f093fb" 
                          strokeWidth={3}
                          dot={{ fill: '#f093fb', strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Card>
                </Grid>

                <Grid item xs={12} lg={4}>
                  <Card sx={{ borderRadius: 3, p: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                      Top Performing Content
                    </Typography>
                    <List>
                      {dashboardData.top_performing_content?.slice(0, 5).map((content, index) => (
                        <ListItem key={content.id} sx={{ px: 0 }}>
                          <ListItemAvatar>
                            <Avatar sx={{ 
                              background: index === 0 ? '#ffd700' : 
                                        index === 1 ? '#c0c0c0' : 
                                        index === 2 ? '#cd7f32' : '#667eea',
                              fontWeight: 600
                            }}>
                              {index + 1}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={content.title}
                            secondary={`${content.views_count} views • ${content.likes_count} likes`}
                            primaryTypographyProps={{ fontWeight: 600 }}
                            secondaryTypographyProps={{ color: 'text.secondary' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Card>
                </Grid>
              </Grid>
            )}

            {/* Content Tab */}
            {activeTab === 1 && (
              <Box>
                {/* Search and Filter Bar */}
                <Box display="flex" gap={2} mb={3} flexWrap="wrap">
                  <TextField
                    placeholder="Search content..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                    sx={{ minWidth: 300, flexGrow: 1 }}
                  />
                  <FormControl sx={{ minWidth: 150 }}>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      label="Category"
                    >
                      <MenuItem value="all">All Categories</MenuItem>
                      {categories.map((category) => (
                        <MenuItem key={category.id} value={category.name}>
                          {category.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={showAudioOnly}
                        onChange={(e) => setShowAudioOnly(e.target.checked)}
                      />
                    }
                    label="Audio Only"
                  />
                </Box>

                {/* Content Grid */}
                <Grid container spacing={3}>
                  {filteredContent.map((content) => (
                    <Grid item xs={12} md={6} lg={4} key={content.id}>
                      <Card sx={{ 
                        borderRadius: 3, 
                        height: '100%',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
                        }
                      }}>
                        <CardContent>
                          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                            <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
                              {content.title}
                            </Typography>
                            <IconButton size="small">
                              <MoreVert />
                            </IconButton>
                          </Box>
                          
                          <Typography variant="body2" color="text.secondary" mb={2} sx={{ 
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>
                            {content.description}
                          </Typography>

                          <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                            <Chip 
                              icon={<Visibility />} 
                              label={`${content.views_count} views`} 
                              size="small" 
                              variant="outlined"
                            />
                            <Chip 
                              icon={<ThumbUp />} 
                              label={`${content.likes_count} likes`} 
                              size="small" 
                              variant="outlined"
                            />
                            <Chip 
                              icon={<Star />} 
                              label={`${content.average_rating || 0} stars`} 
                              size="small" 
                              variant="outlined"
                            />
                            {content.audio_file && (
                              <Chip 
                                icon={<VolumeUp />} 
                                label="Audio" 
                                size="small" 
                                color="success"
                              />
                            )}
                          </Box>

                          <Box display="flex" gap={1} justifyContent="space-between">
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<Edit />}
                              sx={{ borderRadius: 2 }}
                            >
                              Edit
                            </Button>
                            {!content.audio_file && (
                              <Button
                                size="small"
                                variant="contained"
                                startIcon={processingAudio[content.id] ? <CircularProgress size={16} /> : <Mic />}
                                onClick={() => generateAudioForContent(content.id, content.title)}
                                disabled={processingAudio[content.id]}
                                sx={{ 
                                  borderRadius: 2,
                                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                                  '&:hover': {
                                    background: 'linear-gradient(45deg, #5a6fd8, #6a4190)'
                                  }
                                }}
                              >
                                {processingAudio[content.id] ? 'Generating...' : 'Generate Audio'}
                              </Button>
                            )}
                                                         {content.audio_file && (
                               <Button
                                 size="small"
                                 variant="contained"
                                 startIcon={
                                   audioLoading[content.id] ? <CircularProgress size={16} /> :
                                   currentlyPlaying === content.id ? <Pause /> : <PlayArrow />
                                 }
                                 onClick={() => {
                                   if (currentlyPlaying === content.id) {
                                     pauseAudio();
                                   } else {
                                     playAudio(content.id, content.audio_file);
                                   }
                                 }}
                                 sx={{ 
                                   borderRadius: 2,
                                   background: currentlyPlaying === content.id 
                                     ? 'linear-gradient(45deg, #ff6b6b, #ee5a52)' 
                                     : 'linear-gradient(45deg, #43e97b, #38f9d7)',
                                   '&:hover': {
                                     background: currentlyPlaying === content.id 
                                       ? 'linear-gradient(45deg, #ff5252, #d32f2f)' 
                                       : 'linear-gradient(45deg, #3dd870, #2ee6c4)'
                                   }
                                 }}
                               >
                                 {audioLoading[content.id] ? 'Loading...' :
                                  currentlyPlaying === content.id ? 'Pause' : 'Play Audio'}
                               </Button>
                             )}
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>

                {filteredContent.length === 0 && (
                  <Box textAlign="center" py={8}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No content found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Try adjusting your search or filter criteria
                    </Typography>
                  </Box>
                )}
              </Box>
            )}

            {/* Bulk Upload Tab */}
            {activeTab === 2 && (
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Bulk PDF Uploads
                  </Typography>
                  <Button 
                    variant="contained" 
                    startIcon={<CloudUpload />}
                    onClick={() => setUploadDialogOpen(true)}
                    sx={{ 
                      borderRadius: 2,
                      background: 'linear-gradient(45deg, #667eea, #764ba2)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #5a6fd8, #6a4190)'
                      }
                    }}
                  >
                    Upload PDF
                  </Button>
                </Box>

                <Grid container spacing={3}>
                  {bulkUploads.map((upload) => (
                    <Grid item xs={12} key={upload.id}>
                      <Card sx={{ borderRadius: 3, p: 3 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                          <Box flex={1}>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                              {upload.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" mb={2}>
                              {upload.description}
                            </Typography>
                            <Box display="flex" gap={2} alignItems="center" mb={2} flexWrap="wrap">
                              <Chip 
                                icon={getStatusIcon(upload.status)}
                                label={upload.status}
                                color={getStatusColor(upload.status)}
                                size="small"
                              />
                              <Typography variant="body2">
                                {upload.file_size_mb} MB • {upload.page_count || 0} pages
                              </Typography>
                            </Box>
                            {upload.status === 'processing' && (
                              <Box>
                                <Typography variant="body2" mb={1}>
                                  Processing: {upload.progress}%
                                </Typography>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={upload.progress} 
                                  sx={{ borderRadius: 2, height: 8 }}
                                />
                              </Box>
                            )}
                            {upload.status === 'completed' && (
                              <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
                                ✓ Processed {upload.processed_content_count} content pieces
                              </Typography>
                            )}
                            {upload.status === 'failed' && (
                              <Typography variant="body2" color="error.main">
                                ❌ {upload.error_message}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </Card>
                    </Grid>
                  ))}
                </Grid>

                {bulkUploads.length === 0 && (
                  <Box textAlign="center" py={8}>
                    <CloudUpload sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No bulk uploads yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={3}>
                      Upload your first PDF to start bulk processing
                    </Typography>
                    <Button 
                      variant="contained" 
                      startIcon={<CloudUpload />}
                      onClick={() => setUploadDialogOpen(true)}
                      sx={{ 
                        borderRadius: 2,
                        background: 'linear-gradient(45deg, #667eea, #764ba2)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #5a6fd8, #6a4190)'
                        }
                      }}
                    >
                      Upload Your First PDF
                    </Button>
                  </Box>
                )}
              </Box>
            )}

            {/* Analytics Tab */}
            {activeTab === 3 && (
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Card sx={{ borderRadius: 3, p: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                      Follower Growth
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsBarChart data={[
                        { period: 'Today', growth: dashboardData.follower_growth?.today || 0 },
                        { period: 'This Week', growth: dashboardData.follower_growth?.this_week || 0 },
                        { period: 'This Month', growth: dashboardData.follower_growth?.this_month || 0 }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="period" stroke="#666" />
                        <YAxis stroke="#666" />
                        <RechartsTooltip 
                          contentStyle={{ 
                            borderRadius: 8, 
                            border: 'none', 
                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)' 
                          }}
                        />
                        <Bar 
                          dataKey="growth" 
                          fill="url(#colorGradient)"
                          radius={[4, 4, 0, 0]}
                        />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card sx={{ borderRadius: 3, p: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                      Content Analytics
                    </Typography>
                    <List>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ background: 'linear-gradient(45deg, #667eea, #764ba2)' }}>
                            <ContentPaste />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary="Total Content"
                          secondary={dashboardData.content_performance?.total_content || 0}
                          primaryTypographyProps={{ fontWeight: 600 }}
                        />
                      </ListItem>
                      <Divider />
                      <ListItem sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ background: 'linear-gradient(45deg, #f093fb, #f5576c)' }}>
                            <Speed />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary="Average Listen Time"
                          secondary={`${Math.round((dashboardData.content_performance?.average_listen_time || 0) / 60)} minutes`}
                          primaryTypographyProps={{ fontWeight: 600 }}
                        />
                      </ListItem>
                      <Divider />
                      <ListItem sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ background: 'linear-gradient(45deg, #4facfe, #00f2fe)' }}>
                            <Star />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary="Average Rating"
                          secondary={`${dashboardData.analytics?.average_rating || 0} stars`}
                          primaryTypographyProps={{ fontWeight: 600 }}
                        />
                      </ListItem>
                    </List>
                  </Card>
                </Grid>
              </Grid>
            )}
          </Box>
        </Card>

        {/* Floating Action Button */}
        <Tooltip title="Quick Upload" placement="left">
          <Fab
            color="primary"
            aria-label="upload"
            onClick={() => setUploadDialogOpen(true)}
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              '&:hover': {
                background: 'linear-gradient(45deg, #5a6fd8, #6a4190)'
              }
            }}
          >
            <Add />
          </Fab>
        </Tooltip>

        {/* Bulk Upload Dialog */}
        <Dialog 
          open={uploadDialogOpen} 
          onClose={() => setUploadDialogOpen(false)} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: { borderRadius: 3 }
          }}
        >
          <DialogTitle sx={{ fontWeight: 600 }}>
            Upload PDF for Bulk Processing
          </DialogTitle>
          <DialogContent>
            <Box mt={2}>
              <TextField
                fullWidth
                label="Title"
                value={uploadForm.title}
                onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                margin="normal"
                required
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <TextField
                fullWidth
                label="Description"
                value={uploadForm.description}
                onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                margin="normal"
                multiline
                rows={3}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Category</InputLabel>
                <Select
                  value={uploadForm.category}
                  onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                  label="Category"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                >
                  {Array.isArray(categories) && categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Box mt={3}>
                <input
                  accept=".pdf"
                  style={{ display: 'none' }}
                  id="pdf-file-input"
                  type="file"
                  onChange={(e) => setUploadForm({ ...uploadForm, pdf_file: e.target.files[0] })}
                />
                <label htmlFor="pdf-file-input">
                  <Button 
                    variant="outlined" 
                    component="span" 
                    startIcon={<CloudUpload />}
                    fullWidth
                    sx={{ 
                      borderRadius: 2, 
                      py: 2,
                      borderStyle: 'dashed',
                      borderWidth: 2
                    }}
                  >
                    Choose PDF File
                  </Button>
                </label>
                {uploadForm.pdf_file && (
                  <Typography variant="body2" mt={1} color="success.main" sx={{ fontWeight: 600 }}>
                    ✓ Selected: {uploadForm.pdf_file.name}
                  </Typography>
                )}
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button 
              onClick={() => setUploadDialogOpen(false)}
              sx={{ borderRadius: 2 }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleFileUpload} 
              variant="contained" 
              disabled={uploading || !uploadForm.title || !uploadForm.pdf_file}
              sx={{ 
                borderRadius: 2,
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #5a6fd8, #6a4190)'
                }
              }}
            >
              {uploading ? <CircularProgress size={20} /> : 'Upload & Process'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default CreatorDashboard;
