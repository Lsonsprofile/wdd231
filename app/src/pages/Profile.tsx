import { useState, useRef, useEffect, useCallback } from 'react';
import { useApp, useProfile } from '../context/AppContext';
import { getBirthdayReminder, isBirthdayToday } from '../lib/utils';
import { toast } from 'sonner';
import {
  CalendarDays,
  Mail,
  Save,
  Gift,
  PartyPopper,
  Upload,
  RotateCcw,
  Trash2,
  User,
  Camera,
} from 'lucide-react';

// MUI Components
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Avatar,
  TextField,
  Divider,
  IconButton,
  Tooltip,
  Badge,
  InputAdornment,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';

function generateRandomAvatar(): string {
  const styles = ['adventurer', 'avataaars', 'bottts', 'fun-emoji', 'lorelei', 'notionists'];
  const randomStyle = styles[Math.floor(Math.random() * styles.length)];
  const seed = Math.random().toString(36).substring(2, 10);
  return `https://api.dicebear.com/7.x/${randomStyle}/svg?seed=${seed}`;
}

export function Profile() {
  const { dispatch } = useApp();
  const profile = useProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  // Store full date (YYYY-MM-DD) instead of just MM-DD
  const [birthday, setBirthday] = useState<Dayjs | null>(
    profile.birthday ? dayjs(profile.birthday) : null
  );
  const [avatarUrl, setAvatarUrl] = useState(
    profile.avatar || generateRandomAvatar()
  );

  useEffect(() => {
    setName(profile.name);
    setEmail(profile.email);
    setBirthday(profile.birthday ? dayjs(profile.birthday) : null);
    setAvatarUrl(profile.avatar || generateRandomAvatar());
  }, [profile]);

  // Format as MM-DD for birthday reminder logic (ignores year)
  const birthdayStr = birthday ? birthday.format('MM-DD') : '';
  const birthdayInfo = getBirthdayReminder(birthdayStr);
  const birthdayToday = isBirthdayToday(birthdayStr);

  const handleSave = () => {
    dispatch({
      type: 'UPDATE_PROFILE',
      payload: {
        ...profile,
        name: name.trim() || profile.name,
        email: email.trim() || profile.email,
        // Save full date as ISO string: "1997-05-25"
        birthday: birthday ? birthday.format('YYYY-MM-DD') : null,
        avatar: avatarUrl,
      },
    });
    toast.success('Profile updated successfully!');
  };

  const handleRandomAvatar = useCallback(() => {
    const newAvatar = generateRandomAvatar();
    setAvatarUrl(newAvatar);
    toast.success('New avatar generated!');
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setAvatarUrl(result);
      toast.success('Image uploaded!');
    };
    reader.onerror = () => {
      toast.error('Failed to read image');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleResetAvatar = () => {
    const newAvatar = generateRandomAvatar();
    setAvatarUrl(newAvatar);
    toast.success('New random avatar generated');
  };

  // Calculate age
  const age = birthday ? dayjs().diff(birthday, 'year') : null;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ maxWidth: 600, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Header */}
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Profile</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Manage your personal information
          </Typography>
        </Box>

        {/* Birthday Banner */}
        {birthdayToday && (
          <Card sx={{ background: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)', color: 'white' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <PartyPopper className="w-10 h-10" />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Happy Birthday, {profile.name}! 🎉</Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Wishing you a fantastic day filled with joy!
                </Typography>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Main Profile Card */}
        <Card elevation={2}>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Avatar Section */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  <Tooltip title="Change avatar">
                    <IconButton
                      onClick={handleUploadClick}
                      sx={{
                        bgcolor: '#6C5CE7',
                        color: 'white',
                        width: 36,
                        height: 36,
                        border: '2px solid white',
                        '&:hover': { bgcolor: '#5B4BD4' },
                      }}
                    >
                      <Camera className="w-4 h-4" />
                    </IconButton>
                  </Tooltip>
                }
              >
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    cursor: 'pointer',
                    border: '3px solid #E5E7EB',
                    bgcolor: '#F3F4F6',
                    '&:hover': { opacity: 0.9 },
                  }}
                  onClick={handleUploadClick}
                >
                  <img
                    src={avatarUrl}
                    alt={name}
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                      const fallback = generateRandomAvatar();
                      (e.target as HTMLImageElement).src = fallback;
                      setAvatarUrl(fallback);
                    }}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '50%',
                    }}
                  />
                </Avatar>
              </Badge>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Upload className="w-4 h-4" />}
                  onClick={handleUploadClick}
                >
                  Upload
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<RotateCcw className="w-4 h-4" />}
                  onClick={handleRandomAvatar}
                >
                  Random
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  startIcon={<Trash2 className="w-4 h-4" />}
                  onClick={handleResetAvatar}
                >
                  Reset
                </Button>
              </Box>

              <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'center' }}>
                {avatarUrl.startsWith('data:') 
                  ? 'Your uploaded image' 
                  : 'Random avatar — click Random or Reset for a new one'}
              </Typography>
            </Box>

            <Divider />

            {/* Form Fields */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField
                fullWidth
                label="Display Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <User className="w-5 h-5 text-gray-400" />
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <TextField
                fullWidth
                type="email"
                label="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Mail className="w-5 h-5 text-gray-400" />
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <DatePicker
                label="Date of Birth"
                value={birthday}
                onChange={(val) => setBirthday(val)}
                // Allow any year, not just current year
                views={['year', 'month', 'day']}
                openTo="year"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    helperText: age ? `You are ${age} years old` : 'Select your birth date',
                    slotProps: {
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <Gift className="w-5 h-5 text-gray-400" />
                          </InputAdornment>
                        ),
                      },
                    },
                  },
                }}
              />

              {/* Birthday Info */}
              {birthday && birthdayInfo && (
                <Card
                  variant="outlined"
                  sx={{
                    bgcolor: birthdayToday ? 'rgba(236, 72, 153, 0.08)' : 'rgba(236, 72, 153, 0.04)',
                    borderColor: birthdayToday ? 'error.light' : 'pink.200',
                  }}
                >
                  <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <CalendarDays className="w-5 h-5" style={{ color: birthdayToday ? '#EC4899' : '#9CA3AF' }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {birthdayToday ? '🎉 Birthday Today!' : `Next Birthday: ${birthdayInfo.nextBirthday}`}
                        </Typography>
                        {!birthdayToday && (
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {birthdayInfo.message}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              )}

              {/* Join Date */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                <CalendarDays className="w-4 h-4" />
                <Typography variant="body2">
                  Joined {profile.joinedDate ? new Date(profile.joinedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'recently'}
                </Typography>
              </Box>
            </Box>

            {/* Save Button */}
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleSave}
              startIcon={<Save className="w-5 h-5" />}
              sx={{
                bgcolor: '#6C5CE7',
                '&:hover': { bgcolor: '#5B4BD4' },
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 'bold',
                fontSize: '1rem',
              }}
            >
              Save Changes
            </Button>
          </CardContent>
        </Card>
      </Box>
    </LocalizationProvider>
  );
}