import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import StatsCard from '@/components/cards/StatsCard';
import { Users, UserCheck, Building2, TrendingUp, IndianRupee, Award, Sparkles, BriefcaseBusiness, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const PlacementStats = () => {
  const academicYear = '2023 - 2025';

  const pastBatchStats = {
    totalStudents: 120,
    placedStudents: 75,
    companiesVisited: 15,
    averagePackage: '10 LPA',
    topRecruiter: 'Simplify3x',
    topRecruiterLpa: 18,
    highestPackage: '21 LPA',
  };

  const unplacedStudents = pastBatchStats.totalStudents - pastBatchStats.placedStudents;
  const placementRate = Math.round((pastBatchStats.placedStudents / pastBatchStats.totalStudents) * 100);

  const monthlyPlacedCountData = [
    { month: 'Aug', placed: 8, color: '#0EA5E9' },
    { month: 'Sep', placed: 10, color: '#14B8A6' },
    { month: 'Oct', placed: 12, color: '#22C55E' },
    { month: 'Nov', placed: 16, color: '#F59E0B' },
    { month: 'Dec', placed: 14, color: '#F97316' },
    { month: 'Jan', placed: 15, color: '#EC4899' },
  ];

  const companyWiseData = [
    { company: 'Simplify3x', offers: 18, lpa: 18, color: '#4F46E5' },
    { company: 'TCS', offers: 14, lpa: 7, color: '#0284C7' },
    { company: 'Infosys', offers: 12, lpa: 8, color: '#059669' },
    { company: 'Accenture', offers: 11, lpa: 9, color: '#D97706' },
    { company: 'Wipro', offers: 10, lpa: 7, color: '#DB2777' },
    { company: 'Cognizant', offers: 10, lpa: 8, color: '#9333EA' },
  ];

  const placementRatio = [
    { name: 'Placed', value: pastBatchStats.placedStudents, color: '#10B981' },
    { name: 'Unplaced', value: unplacedStudents, color: '#F43F5E' },
  ];

  const roleBasedPlacementData = [
    { role: 'Software Engineer', placed: 30, color: '#2563EB' },
    { role: 'Analyst', placed: 15, color: '#0D9488' },
    { role: 'Associate Developer', placed: 12, color: '#65A30D' },
    { role: 'QA Engineer', placed: 10, color: '#EA580C' },
    { role: 'DevOps Engineer', placed: 8, color: '#7C3AED' },
  ];

  const monthlyPeak = monthlyPlacedCountData.reduce((max, row) => (row.placed > max.placed ? row : max), monthlyPlacedCountData[0]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
            Past Year Placement Dashboard (AY {academicYear})
          </h1>
          <p className="text-muted-foreground">
            A clear view of previous-batch outcomes to help current students benchmark preparation and expectations.
          </p>
        </div>

        <Card className="mb-8 border-primary/20 bg-gradient-to-r from-primary/10 via-background to-success/10 animate-slide-up" style={{ animationDelay: '40ms' }}>
          <CardContent className="py-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Dashboard Focus</p>
                <h2 className="mt-1 text-xl font-heading font-semibold text-foreground">What this dashboard helps you understand</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Placement performance, hiring momentum, role-wise opportunities, and recruiter-wise contributions from the last batch.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary"><Target className="h-3.5 w-3.5" /> {placementRate}% placed</Badge>
                <Badge variant="secondary" className="gap-1 bg-success/10 text-success"><BriefcaseBusiness className="h-3.5 w-3.5" /> {monthlyPeak.month} was peak month</Badge>
                <Badge variant="secondary" className="gap-1 bg-warning/10 text-warning"><Sparkles className="h-3.5 w-3.5" /> Highest package: {pastBatchStats.highestPackage}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <div className="animate-slide-up" style={{ animationDelay: '0ms' }}>
            <StatsCard
              title="Batch Strength"
              value={pastBatchStats.totalStudents}
              icon={Users}
            />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
            <StatsCard
              title="Students Placed"
              value={pastBatchStats.placedStudents}
              icon={UserCheck}
              variant="success"
            />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
            <StatsCard
              title="Recruiters Visited"
              value={pastBatchStats.companiesVisited}
              icon={Building2}
              variant="primary"
            />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
            <StatsCard
              title="Average Package"
              value={pastBatchStats.averagePackage}
              icon={IndianRupee}
              variant="warning"
            />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: '400ms' }}>
            <StatsCard
              title="Top Recruiter (CTC)"
              value={`${pastBatchStats.topRecruiter} (${pastBatchStats.topRecruiterLpa} LPA)`}
              icon={Award}
              variant="primary"
            />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: '500ms' }}>
            <StatsCard
              title="Placement Rate"
              value={`${placementRate}%`}
              icon={TrendingUp}
              variant="success"
            />
          </div>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Monthly Placements */}
          <Card className="animate-slide-up" style={{ animationDelay: '600ms' }}>
            <CardHeader>
              <CardTitle className="text-lg">Placement Momentum by Month (AY {academicYear})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyPlacedCountData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar
                      dataKey="placed"
                      radius={[6, 6, 0, 0]}
                    >
                      {monthlyPlacedCountData.map((entry) => (
                        <Cell key={`monthly-${entry.month}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Company-wise Stats */}
          <Card className="animate-slide-up" style={{ animationDelay: '700ms' }}>
            <CardHeader>
              <CardTitle className="text-lg">Top Recruiters by Offers (with LPA)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={companyWiseData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                    <YAxis dataKey="company" type="category" stroke="hsl(var(--muted-foreground))" width={80} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number, _name: string, item: any) => [`${value} offers | ${item?.payload?.lpa} LPA`, 'Company impact']}
                    />
                    <Bar dataKey="offers" radius={[0, 6, 6, 0]}>
                      {companyWiseData.map((entry) => (
                        <Cell key={`company-${entry.company}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Placement Ratio */}
          <Card className="animate-slide-up" style={{ animationDelay: '800ms' }}>
            <CardHeader>
              <CardTitle className="text-lg">Placed vs Unplaced (AY {academicYear})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                <div className="h-64 w-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={placementRatio}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {placementRatio.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-4">
                  {placementRatio.map((item) => (
                    <div key={item.name} className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-medium">{item.name}</span>
                      <span className="text-muted-foreground">({item.value} students)</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Role-based Placement Stats */}
          <Card className="animate-slide-up" style={{ animationDelay: '900ms' }}>
            <CardHeader>
              <CardTitle className="text-lg">Role-wise Placement Distribution (AY {academicYear})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={roleBasedPlacementData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                    <YAxis dataKey="role" type="category" stroke="hsl(var(--muted-foreground))" width={120} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="placed" radius={[0, 6, 6, 0]}>
                      {roleBasedPlacementData.map((entry) => (
                        <Cell key={`role-${entry.role}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PlacementStats;
