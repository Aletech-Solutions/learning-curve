import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Tabs,
  Tab,
  LinearProgress,
  Chip,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Fade,
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Code as CodeIcon,
  Whatshot as FireIcon,
  Star as StarIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import TaskCard from './components/TaskCard';
import CodeEditor from './components/CodeEditor';
import UserProgress from './components/UserProgress';
import tasks from './data/tasks.json';
import { userService } from './services/api';

const levelConfig = {
  beginner: { color: '#10b981', icon: '🌱', label: 'Beginner' },
  average: { color: '#f59e0b', icon: '⚡', label: 'Average' },
  hardcore: { color: '#ef4444', icon: '🔥', label: 'Hardcore' },
};

function App() {
  const [currentLevel, setCurrentLevel] = useState('beginner');
  const [selectedTask, setSelectedTask] = useState(null);
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [completedTasks, setCompletedTasks] = useState(new Set());

  useEffect(() => {
    const savedUser = localStorage.getItem('xandlearning_user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setCompletedTasks(new Set(userData.completedTasks || []));
      setShowLogin(false);
    }
  }, []);

  const handleLogin = async () => {
    if (!username.trim()) return;
    
    try {
      const userData = await userService.getOrCreateUser(username);
      setUser(userData);
      setCompletedTasks(new Set(userData.completedTasks || []));
      localStorage.setItem('xandlearning_user', JSON.stringify(userData));
      setShowLogin(false);
    } catch (error) {
      console.error('Login error:', error);
      const offlineUser = {
        _id: 'offline',
        username,
        xp: 0,
        level: 1,
        completedTasks: [],
      };
      setUser(offlineUser);
      localStorage.setItem('xandlearning_user', JSON.stringify(offlineUser));
      setShowLogin(false);
    }
  };

  const handleTaskComplete = async (taskId, xpEarned) => {
    if (completedTasks.has(taskId)) return;

    const newCompletedTasks = new Set([...completedTasks, taskId]);
    setCompletedTasks(newCompletedTasks);

    const newXp = (user.xp || 0) + xpEarned;
    const newLevel = Math.floor(newXp / 500) + 1;
    
    const updatedUser = {
      ...user,
      xp: newXp,
      level: newLevel,
      completedTasks: [...newCompletedTasks],
    };
    
    setUser(updatedUser);
    localStorage.setItem('xandlearning_user', JSON.stringify(updatedUser));

    if (user._id !== 'offline') {
      try {
        await userService.updateUserProgress(user._id, taskId, xpEarned);
      } catch (error) {
        console.error('Failed to sync progress:', error);
      }
    }
  };

  const currentTasks = tasks[currentLevel] || [];
  const completedCount = currentTasks.filter(t => completedTasks.has(t.id)).length;
  const progressPercent = (completedCount / currentTasks.length) * 100;

  const handleNextTask = () => {
    if (!selectedTask) return;
    
    const currentIndex = currentTasks.findIndex(t => t.id === selectedTask.id);
    
    if (currentIndex < currentTasks.length - 1) {
      setSelectedTask(currentTasks[currentIndex + 1]);
    } else {
      const levels = Object.keys(levelConfig);
      const currentLevelIndex = levels.indexOf(currentLevel);
      
      if (currentLevelIndex < levels.length - 1) {
        const nextLevel = levels[currentLevelIndex + 1];
        setCurrentLevel(nextLevel);
        setSelectedTask(tasks[nextLevel][0]);
      } else {
        setSelectedTask(null);
      }
    }
  };

  const getHasNextTask = () => {
    if (!selectedTask) return false;
    
    const currentIndex = currentTasks.findIndex(t => t.id === selectedTask.id);
    if (currentIndex < currentTasks.length - 1) return true;
    
    const levels = Object.keys(levelConfig);
    const currentLevelIndex = levels.indexOf(currentLevel);
    return currentLevelIndex < levels.length - 1;
  };

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Dialog open={showLogin} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: 'center', pt: 4 }}>
          <Box sx={{ mb: 2 }}>
            <CodeIcon sx={{ fontSize: 60, color: 'primary.main' }} />
          </Box>
          <Typography variant="h4" fontWeight={800}>
            Welcome to XandLearning
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Master algorithms through practice
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pb: 4, px: 4 }}>
          <TextField
            fullWidth
            label="Enter your username"
            variant="outlined"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            sx={{ mt: 2, mb: 3 }}
          />
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleLogin}
            disabled={!username.trim()}
          >
            Start Learning
          </Button>
        </DialogContent>
      </Dialog>

      <Container maxWidth="xl">
        <Fade in={!showLogin} timeout={800}>
          <Box>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 4,
              flexWrap: 'wrap',
              gap: 2,
            }}>
              <Box>
                <Typography 
                  variant="h3" 
                  fontWeight={800}
                  sx={{
                    background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 0.5,
                  }}
                >
                  XandLearning
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Level up your algorithm skills 🚀
                </Typography>
              </Box>
              
              {user && <UserProgress user={user} />}
            </Box>

            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2, 
              mb: 4,
              flexWrap: 'wrap',
            }}>
              <Tabs 
                value={currentLevel} 
                onChange={(e, v) => setCurrentLevel(v)}
                sx={{
                  '& .MuiTabs-indicator': {
                    background: levelConfig[currentLevel].color,
                    height: 3,
                    borderRadius: 2,
                  },
                }}
              >
                {Object.entries(levelConfig).map(([key, config]) => (
                  <Tab
                    key={key}
                    value={key}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span>{config.icon}</span>
                        <span>{config.label}</span>
                      </Box>
                    }
                    sx={{
                      fontWeight: 600,
                      fontSize: '1rem',
                      color: currentLevel === key ? config.color : 'text.secondary',
                    }}
                  />
                ))}
              </Tabs>

              <Box sx={{ flex: 1, minWidth: 200 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" color="text.secondary">
                    Progress
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {completedCount}/{currentTasks.length}
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={progressPercent}
                  sx={{
                    '& .MuiLinearProgress-bar': {
                      background: `linear-gradient(90deg, ${levelConfig[currentLevel].color}, #7c3aed)`,
                    },
                  }}
                />
              </Box>
            </Box>

            {selectedTask ? (
              <CodeEditor 
                task={selectedTask}
                onBack={() => setSelectedTask(null)}
                onComplete={handleTaskComplete}
                onNextTask={handleNextTask}
                isCompleted={completedTasks.has(selectedTask.id)}
                hasNextTask={getHasNextTask()}
              />
            ) : (
              <Grid container spacing={3}>
                {currentTasks.map((task, index) => (
                  <Grid item xs={12} sm={6} md={4} key={task.id}>
                    <TaskCard
                      task={task}
                      index={index}
                      level={currentLevel}
                      isCompleted={completedTasks.has(task.id)}
                      onClick={() => setSelectedTask(task)}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </Fade>
      </Container>
    </Box>
  );
}

export default App;

