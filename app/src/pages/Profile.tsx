import { useState } from 'react';
import { useApp, useProfile } from '@/context/AppContext';
import { getBirthdayReminder, isBirthdayToday } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { UserCircle, CalendarDays, Mail, Save, Gift, PartyPopper } from 'lucide-react';

export function Profile() {
  const { dispatch } = useApp();
  const profile = useProfile();
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [birthday, setBirthday] = useState(profile.birthday || '');

  const birthdayInfo = getBirthdayReminder(birthday);
  const birthdayToday = isBirthdayToday(birthday);

  const handleSave = () => {
    dispatch({
      type: 'UPDATE_PROFILE',
      payload: {
        ...profile,
        name: name.trim() || profile.name,
        email: email.trim() || profile.email,
        birthday: birthday || null,
      },
    });
    toast.success('Profile updated successfully!');
  };

  const handleAvatarChange = () => {
    // Generate a new random avatar style
    const styles = ['adventurer', 'avataaars', 'bottts', 'fun-emoji', 'lorelei', 'notionists'];
    const randomStyle = styles[Math.floor(Math.random() * styles.length)];
    const seed = Math.random().toString(36).substring(7);
    const newAvatar = `https://api.dicebear.com/7.x/${randomStyle}/svg?seed=${seed}`;

    dispatch({
      type: 'UPDATE_PROFILE',
      payload: { ...profile, avatar: newAvatar },
    });
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your personal information</p>
      </div>

      {/* Birthday Banner */}
      {birthdayToday && (
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl p-5 flex items-center gap-4 text-white">
          <PartyPopper className="w-10 h-10" />
          <div>
            <p className="font-bold text-lg">Happy Birthday, {profile.name}! 🎉</p>
            <p className="text-white/80 text-sm">Wishing you a fantastic day filled with joy!</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl p-6 shadow-card space-y-6">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#6C5CE7] to-[#A78BFA] flex items-center justify-center text-white font-bold text-3xl cursor-pointer hover:opacity-90 transition-opacity"
            onClick={handleAvatarChange}
          >
            {profile.avatar ? (
              <img src={profile.avatar} alt="avatar" className="w-full h-full rounded-full object-cover" />
            ) : (
              name.charAt(0).toUpperCase()
            )}
          </div>
          <button
            onClick={handleAvatarChange}
            className="text-sm text-[#6C5CE7] font-medium hover:underline"
          >
            Change Avatar
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <UserCircle className="w-4 h-4 text-gray-400" />
              Display Name
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="h-12 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400" />
              Email Address
            </Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="h-12 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Gift className="w-4 h-4 text-gray-400" />
              Birthday (Month-Day)
            </Label>
            <Input
              type="text"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              placeholder="MM-DD (e.g., 05-25)"
              className="h-12 rounded-xl"
              maxLength={5}
            />
            <p className="text-xs text-gray-400">Format: MM-DD. Used for birthday reminders.</p>
          </div>

          {/* Birthday Preview */}
          {birthdayInfo && (
            <div className="bg-pink-50 rounded-xl p-4 flex items-center gap-3">
              <CalendarDays className="w-5 h-5 text-pink-500" />
              <div>
                <p className="text-sm font-medium text-gray-700">Next Birthday</p>
                <p className="text-sm text-gray-600">
                  {birthdayInfo.nextBirthday} • <span className="font-semibold text-pink-600">{birthdayInfo.message}</span>
                </p>
              </div>
            </div>
          )}

          {/* Join Date */}
          <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
            <CalendarDays className="w-4 h-4" />
            Joined {new Date(profile.joinedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </div>
        </div>

        <Button
          onClick={handleSave}
          className="w-full h-12 bg-[#6C5CE7] hover:bg-[#5B4BD4] text-white rounded-xl font-medium"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}
