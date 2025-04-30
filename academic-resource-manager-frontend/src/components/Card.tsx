import React from 'react';
import {
  Card as MuiCard,
  CardContent,
  CardActions,
  Typography,
  Box,
  Chip,
  Button,
  Avatar,
} from '@mui/material';

interface CardProps {
  title: string;
  subtitle?: string;
  description?: string;
  icon?: React.ReactNode;
  iconColor?: string;
  chips?: { label: string; color?: 'primary' | 'secondary' | 'default' }[];
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
    color?: 'primary' | 'secondary' | 'inherit';
  };
  children?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  description,
  icon,
  iconColor = 'primary',
  chips,
  action,
  children,
}) => {
  return (
    <MuiCard
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.05)',
        transition: 'all 0.3s ease-in-out',
        border: '1px solid rgba(0, 0, 0, 0.05)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.1)',
          borderColor: 'primary.main',
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {icon && (
            <Avatar
              sx={{
                bgcolor: `${iconColor}.main`,
                mr: 2,
                width: 48,
                height: 48,
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.1)',
                },
              }}
            >
              {icon}
            </Avatar>
          )}
          <Box>
            <Typography 
              variant="h6" 
              component="h2"
              sx={{
                fontWeight: 600,
                letterSpacing: '-0.025em',
                color: 'text.primary',
              }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{
                  mt: 0.5,
                  fontWeight: 500,
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
        {description && (
          <Typography 
            variant="body2" 
            color="text.secondary" 
            paragraph
            sx={{
              lineHeight: 1.6,
              mt: 2,
            }}
          >
            {description}
          </Typography>
        )}
        {chips && (
          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {chips.map((chip, index) => (
              <Chip
                key={index}
                label={chip.label}
                color={chip.color}
                variant="outlined"
                size="small"
                sx={{
                  borderRadius: 1,
                  borderWidth: '1px',
                  '&:hover': {
                    backgroundColor: `${chip.color}.main`,
                    color: 'white',
                  },
                }}
              />
            ))}
          </Box>
        )}
        {children}
      </CardContent>
      {action && (
        <CardActions sx={{ p: 3, pt: 0 }}>
          <Button
            fullWidth
            variant="contained"
            color={action.color}
            startIcon={action.icon}
            onClick={action.onClick}
            sx={{
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: 'none',
              '&:hover': {
                boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                transform: 'translateY(-1px)',
              },
            }}
          >
            {action.label}
          </Button>
        </CardActions>
      )}
    </MuiCard>
  );
};

export default Card; 