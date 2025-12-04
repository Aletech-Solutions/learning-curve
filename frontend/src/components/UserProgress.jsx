import { Box, Typography, LinearProgress, Chip, Avatar } from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Whatshot as FireIcon,
  Star as StarIcon,
} from '@mui/icons-material';

function UserProgress({ user }) {
  const xpForNextLevel = user.level * 500;
  const currentLevelXp = user.xp - ((user.level - 1) * 500);
  const progressToNext = (currentLevelXp / 500) * 100;

  const getRankTitle = (level) => {
    if (level >= 20) return { title: 'Algorithm Master', color: '#f59e0b', icon: '👑' };
    if (level >= 15) return { title: 'Code Wizard', color: '#a855f7', icon: '🧙' };
    if (level >= 10) return { title: 'Senior Dev', color: '#3b82f6', icon: '💎' };
    if (level >= 5) return { title: 'Rising Star', color: '#10b981', icon: '⭐' };
    return { title: 'Apprentice', color: '#6b7280', icon: '🌱' };
  };

  const rank = getRankTitle(user.level);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 3,
        background: 'rgba(26, 26, 46, 0.8)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 4,
        px: 3,
        py: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar
          sx={{
            width: 50,
            height: 50,
            background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
            fontSize: '1.5rem',
            fontWeight: 700,
          }}
        >
          {user.username?.charAt(0).toUpperCase()}
        </Avatar>
        <Box>
          <Typography variant="body1" fontWeight={600}>
            {user.username}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <span>{rank.icon}</span>
            <Typography variant="caption" sx={{ color: rank.color, fontWeight: 600 }}>
              {rank.title}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ width: 1, height: 40, background: 'rgba(255,255,255,0.1)' }} />

      <Box sx={{ minWidth: 150 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="caption" color="text.secondary">
            Level {user.level}
          </Typography>
          <Typography variant="caption" fontWeight={600}>
            {currentLevelXp}/500 XP
          </Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={progressToNext}
          sx={{ height: 8, borderRadius: 4 }}
        />
      </Box>

      <Chip
        icon={<StarIcon sx={{ fontSize: 18 }} />}
        label={`${user.xp} XP`}
        sx={{
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(249, 115, 22, 0.2))',
          color: '#f59e0b',
          fontWeight: 700,
          fontSize: '0.9rem',
          '& .MuiChip-icon': {
            color: '#f59e0b',
          },
        }}
      />
    </Box>
  );
}

export default UserProgress;

