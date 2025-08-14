import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Alert,
  Snackbar,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Stop,
  Refresh,
  Publish,
  Delete,
  Visibility,
  VisibilityOff,
  AudioFile,
  TextFields,
  Psychology
} from '@mui/icons-material';
import toast from 'react-hot-toast';

const API_BASE = `${process.env.REACT_APP_API_URL || 'https://ai-musical-store-backend-ndig.vercel.app'}/api/content`;

const api = {
  getContent: async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE}/content/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      if (response.ok) {
        return await response.json();
      }
      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      console.error('Error fetching content:', error);
      return [];
    }
  },

  getUnprocessedContent: async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE}/ai/unprocessed/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      if (response.ok) {
        return await response.json();
      }
      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      console.error('Error fetching unprocessed content:', error);
      return [];
    }
  },

  processContent: async (contentId) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE}/ai/process/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content_id: contentId })
      });
      if (response.ok) {
        return await response.json();
      }
      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      console.error('Error processing content:', error);
      throw error;
    }
  },

  batchProcess: async (contentIds, limit = 5) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE}/ai/batch-process/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          content_ids: contentIds,
          limit: limit
        })
      });
      if (response.ok) {
        return await response.json();
      }
      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      console.error('Error batch processing:', error);
      throw error;
    }
  },

  publishContent: async (contentId) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE}/content/${contentId}/publish/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      if (response.ok) {
        return await response.json();
      }
      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      console.error('Error publishing content:', error);
      throw error;
    }
  },

  getStats: async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE}/stats/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      if (response.ok) {
        return await response.json();
      }
      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      console.error('Error fetching stats:', error);
      return null;
    }
  }
};

const AIContentManager = () => {
  const [content, setContent] = useState([]);
  const [unprocessedContent, setUnprocessedContent] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [contentData, unprocessedData, statsData] = await Promise.all([
        api.getContent(),
        api.getUnprocessedContent(),
        api.getStats()
      ]);
      
      setContent(contentData);
      setUnprocessedContent(unprocessedData);
      setStats(statsData);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessContent = async (contentId) => {
    setProcessing(true);
    try {
      const result = await api.processContent(contentId);
      if (result.success) {
        toast.success('Content processed successfully!');
        loadData(); // Refresh data
      } else {
        toast.error(result.error || 'Processing failed');
      }
    } catch (error) {
      toast.error('Failed to process content');
    } finally {
      setProcessing(false);
    }
  };

  const handleBatchProcess = async () => {
    if (unprocessedContent.length === 0) {
      toast.error('No unprocessed content available');
      return;
    }

    setProcessing(true);
    try {
      const contentIds = unprocessedContent.slice(0, 5).map(item => item.id);
      const result = await api.batchProcess(contentIds, 5);
      
      toast.success(`Processed ${result.successful.length} items successfully`);
      if (result.failed.length > 0) {
        toast.error(`${result.failed.length} items failed to process`);
      }
      
      loadData(); // Refresh data
    } catch (error) {
      toast.error('Batch processing failed');
    } finally {
      setProcessing(false);
    }
  };

  const handlePublishContent = async (contentId) => {
    try {
      const result = await api.publishContent(contentId);
      if (result.success) {
        toast.success('Content published successfully!');
        loadData(); // Refresh data
      } else {
        toast.error(result.error || 'Publishing failed');
      }
    } catch (error) {
      toast.error('Failed to publish content');
    }
  };

  const handleViewDetails = (item) => {
    setSelectedContent(item);
    setShowDetails(true);
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'Unknown';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const renderContentCard = (item, isUnprocessed = false) => (
    <Card key={item.id} sx={{ mb: 2, position: 'relative' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box flex={1}>
            <Typography variant="h6" gutterBottom>
              {item.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {item.description}
            </Typography>
            
            <Box display="flex" gap={1} flexWrap="wrap" sx={{ mb: 2 }}>
              <Chip 
                label={item.content_type} 
                size="small" 
                color="primary" 
                variant="outlined" 
              />
              <Chip 
                label={item.access_type} 
                size="small" 
                color="secondary" 
                variant="outlined" 
              />
              {item.is_ai_generated && (
                <Chip 
                  icon={<Psychology />}
                  label="AI Generated" 
                  size="small" 
                  color="success" 
                />
              )}
              {item.audio_file && (
                <Chip 
                  icon={<AudioFile />}
                  label="Has Audio" 
                  size="small" 
                  color="info" 
                />
              )}
            </Box>

            <Box display="flex" gap={1} alignItems="center">
              <Typography variant="caption" color="text.secondary">
                Views: {item.views_count} | Likes: {item.likes_count}
              </Typography>
              {item.duration && (
                <Typography variant="caption" color="text.secondary">
                  | Duration: {formatDuration(item.duration)}
                </Typography>
              )}
            </Box>
          </Box>

          <Box display="flex" flexDirection="column" gap={1}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => handleViewDetails(item)}
            >
              <Visibility /> Details
            </Button>
            
            {isUnprocessed && (
              <Button
                size="small"
                variant="contained"
                color="primary"
                disabled={processing}
                onClick={() => handleProcessContent(item.id)}
              >
                <Psychology /> Process
              </Button>
            )}
            
            {!item.is_published && item.audio_file && (
              <Button
                size="small"
                variant="contained"
                color="success"
                onClick={() => handlePublishContent(item.id)}
              >
                <Publish /> Publish
              </Button>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Loading content...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        AI Content Manager
      </Typography>

      {/* Statistics */}
      {stats && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Statistics</Typography>
          <Grid container spacing={2}>
            <Grid item xs={3}>
              <Typography variant="body2" color="text.secondary">Total Content</Typography>
              <Typography variant="h4">{stats.total_content}</Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography variant="body2" color="text.secondary">Published</Typography>
              <Typography variant="h4" color="success.main">{stats.published_content}</Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography variant="body2" color="text.secondary">AI Generated</Typography>
              <Typography variant="h4" color="primary.main">{stats.ai_generated}</Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography variant="body2" color="text.secondary">Unprocessed</Typography>
              <Typography variant="h4" color="warning.main">{stats.unprocessed}</Typography>
            </Grid>
          </Grid>
          <LinearProgress 
            variant="determinate" 
            value={parseFloat(stats.processing_rate)} 
            sx={{ mt: 2 }}
          />
          <Typography variant="caption" color="text.secondary">
            Processing Rate: {stats.processing_rate}
          </Typography>
        </Paper>
      )}

      {/* Batch Processing */}
      {unprocessedContent.length > 0 && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              Unprocessed Content ({unprocessedContent.length})
            </Typography>
            <Button
              variant="contained"
              color="primary"
              disabled={processing}
              onClick={handleBatchProcess}
              startIcon={<Refresh />}
            >
              {processing ? 'Processing...' : 'Batch Process (5 items)'}
            </Button>
          </Box>
        </Paper>
      )}

      {/* Unprocessed Content */}
      {unprocessedContent.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Unprocessed Content
          </Typography>
          {unprocessedContent.slice(0, 5).map(item => renderContentCard(item, true))}
        </Box>
      )}

      {/* Published Content */}
      <Box>
        <Typography variant="h5" gutterBottom>
          Published Content ({content.length})
        </Typography>
        {content.length > 0 ? (
          content.map(item => renderContentCard(item, false))
        ) : (
          <Typography color="text.secondary">No published content available</Typography>
        )}
      </Box>

      {/* Content Details Dialog */}
      <Dialog 
        open={showDetails} 
        onClose={() => setShowDetails(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Content Details
          <IconButton
            onClick={() => setShowDetails(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <VisibilityOff />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedContent && (
            <Box>
              <Typography variant="h6" gutterBottom>{selectedContent.title}</Typography>
              <Typography variant="body1" paragraph>{selectedContent.description}</Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle2" gutterBottom>Metadata:</Typography>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell>Content Type</TableCell>
                      <TableCell>{selectedContent.content_type}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Access Type</TableCell>
                      <TableCell>{selectedContent.access_type}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>AI Generated</TableCell>
                      <TableCell>{selectedContent.is_ai_generated ? 'Yes' : 'No'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Published</TableCell>
                      <TableCell>{selectedContent.is_published ? 'Yes' : 'No'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Views</TableCell>
                      <TableCell>{selectedContent.views_count}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Likes</TableCell>
                      <TableCell>{selectedContent.likes_count}</TableCell>
                    </TableRow>
                    {selectedContent.audio_file && (
                      <TableRow>
                        <TableCell>Audio File</TableCell>
                        <TableCell>
                          <audio controls style={{ width: '100%' }}>
                            <source src={selectedContent.audio_file_url} type="audio/mpeg" />
                            Your browser does not support the audio element.
                          </audio>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDetails(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AIContentManager;
