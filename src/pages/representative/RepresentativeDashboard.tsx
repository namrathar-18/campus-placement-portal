// ...existing imports from OfficerDashboard.tsx...
import { useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCompanies } from '@/hooks/useCompanies';
import { useApplications } from '@/hooks/useApplications';
import { useNotifications } from '@/hooks/useNotifications';
import { usePlacementStats } from '@/hooks/usePlacementStats';
import { useUsers } from '@/hooks/useUsers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectGroup, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Building2, Users, Plus, ArrowRight, Clock, Loader2, TrendingUp, BarChart2, Search, CheckCircle2, XCircle, Target, BriefcaseBusiness, ShieldCheck } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Treemap } from 'recharts';
import { exportPlacedApprovedStudentsPdf } from '@/lib/exportPlacedApprovedStudentsPdf';
import { useToast } from '@/hooks/use-toast';
import { SECTION_OPTIONS, type SectionOption, isSectionOption, normalizeSection } from '@/constants/sections';

// ...existing OfficerDashboard.tsx logic and component code...

const PIE_COLORS = [
  '#2563eb', '#059669', '#d97706', '#dc2626', '#7c3aed',
  '#0891b2', '#be185d', '#4f46e5', '#15803d', '#ea580c',
  '#6d28d9', '#0284c7', '#b91c1c', '#0d9488', '#c026d3',
  '#ca8a04',
];

const getTreemapLabel = (name: string, width: number) => {
  if (!name) return '';
  const maxChars = Math.max(5, Math.floor((width - 14) / 7));
  return name.length > maxChars ? `${name.slice(0, maxChars - 1)}...` : name;
};

const TreemapContent = (props: any) => {
  const { x, y, width, height, name, value, index } = props;
  const color = PIE_COLORS[(index ?? 0) % PIE_COLORS.length];
  const showName = width > 58 && height > 28;
  const showValue = width > 54 && height > 42;
  const label = getTreemapLabel(name, width);
  const nameFontSize = Math.max(10, Math.min(14, Math.floor(width / 9)));
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={color} rx={6} ry={6} stroke="hsl(var(--card))" strokeWidth={3} />
      {showName && (
        <>
          <text x={x + width / 2} y={y + height / 2 - (showValue ? 6 : 0)} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize={nameFontSize} fontWeight={600} pointerEvents="none">{label}</text>
          {showValue && (
            <text x={x + width / 2} y={y + height / 2 + 12} textAnchor="middle" dominantBaseline="middle" fill="rgba(255,255,255,0.88)" fontSize={11} pointerEvents="none">{value}</text>
          )}
        </>
      )}
    </g>
  );
};

const RepresentativeDashboard = () => {
  // ...copy OfficerDashboard logic here...
  // ...existing code...
};

export default RepresentativeDashboard;
