import {
  Fuel,
  Dumbbell,
  Stethoscope,
  Flag,
  Brain,
  Gift,
  CalendarDays,
  Heart,
  Coffee,
  BookOpen,
  Music,
  Plane,
  Bell,
  type LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  Fuel,
  Dumbbell,
  Stethoscope,
  Flag,
  Brain,
  Gift,
  CalendarDays,
  Heart,
  Coffee,
  BookOpen,
  Music,
  Plane,
  Bell,
};

interface IconRendererProps {
  iconName: string;
  className?: string;
  style?: React.CSSProperties;
}

export function IconRenderer({ iconName, className, style }: IconRendererProps) {
  const Icon = iconMap[iconName] || CalendarDays;
  return <Icon className={className} style={style} />;
}

export function getActivityIcon(iconName: string): LucideIcon {
  return iconMap[iconName] || CalendarDays;
}
