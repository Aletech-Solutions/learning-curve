import { Box, Card, CardContent, Typography, Chip, IconButton } from '@mui/material';
import {
  CheckCircle as CheckIcon,
  PlayArrow as PlayIcon,
  Star as StarIcon,
} from '@mui/icons-material';

const categoryColors = {
  arrays: '#06b6d4',
  strings: '#8b5cf6',
  sorting: '#f59e0b',
  searching: '#10b981',
  math: '#ec4899',
  logic: '#3b82f6',
  'data-structures': '#ef4444',
  'dynamic-programming': '#f97316',
};

const levelColors = {
  beginner: '#10b981',
  average: '#f59e0b',
  hardcore: '#ef4444',
};

function TaskCard({ task, index, level, isCompleted, onClick }) {
  return (
    <Card
      onClick={onClick}
      sx={{
        cursor: 'pointer',
        position: 'relative',
        overflow: 'visible',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        animation: 'fadeIn 0.5s ease-out',
        animationDelay: `${index * 0.1}s`,
        animationFillMode: 'both',
        '@keyframes fadeIn': {
          from: {
            opacity: 0,
            transform: 'translateY(20px)',
          },
          to: {
            opacity: 1,
            transform: 'translateY(0)',
          },
        },
        '&:hover': {
          transform: 'translateY(-8px) scale(1.02)',
          boxShadow: `0 20px 40px rgba(${isCompleted ? '16, 185, 129' : '124, 58, 237'}, 0.3)`,
          '& .play-button': {
            opacity: 1,
            transform: 'scale(1)',
          },
        },
        ...(isCompleted && {
          border: '2px solid #10b981',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(26, 26, 46, 0.6) 100%)',
        }),
      }}
    >
      {isCompleted && (
        <Box
          sx={{
            position: 'absolute',
            top: -12,
            right: -12,
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(16, 185, 129, 0.5)',
            zIndex: 1,
          }}
        >
          <CheckIcon sx={{ color: 'white', fontSize: 24 }} />
        </Box>
      )}

      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Chip
            label={task.category}
            size="small"
            sx={{
              background: `${categoryColors[task.category]}20`,
              color: categoryColors[task.category],
              fontWeight: 600,
              textTransform: 'capitalize',
            }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <StarIcon sx={{ fontSize: 16, color: '#f59e0b' }} />
            <Typography variant="body2" fontWeight={600} color="#f59e0b">
              {task.xp} XP
            </Typography>
          </Box>
        </Box>

        <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
          {task.title}
        </Typography>

        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            mb: 2,
            minHeight: 40,
          }}
        >
          {task.description}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            {task.testCases.length} test cases
          </Typography>
          
          <IconButton
            className="play-button"
            size="small"
            sx={{
              opacity: 0,
              transform: 'scale(0.8)',
              transition: 'all 0.3s ease',
              background: `linear-gradient(135deg, ${levelColors[level]}, #7c3aed)`,
              color: 'white',
              '&:hover': {
                background: `linear-gradient(135deg, ${levelColors[level]}, #8b5cf6)`,
              },
            }}
          >
            <PlayIcon />
          </IconButton>
        </Box>
      </CardContent>

      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, ${categoryColors[task.category]}, ${levelColors[level]})`,
          borderRadius: '0 0 20px 20px',
        }}
      />
    </Card>
  );
}

export default TaskCard;

