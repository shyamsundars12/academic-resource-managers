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
        borderRadius: 2,
        boxShadow: 3,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {icon && (
            <Avatar
              sx={{
                bgcolor: `${iconColor}.main`,
                mr: 2,
                width: 40,
                height: 40,
              }}
            >
              {icon}
            </Avatar>
          )}
          <Box>
            <Typography variant="h6" component="h2">
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
        {description && (
          <Typography variant="body2" color="text.secondary" paragraph>
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
              />
            ))}
          </Box>
        )}
        {children}
      </CardContent>
      {action && (
        <CardActions sx={{ p: 2 }}>
          <Button
            fullWidth
            variant="contained"
            color={action.color}
            startIcon={action.icon}
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        </CardActions>
      )}
    </MuiCard>
  );
};

export default Card; 