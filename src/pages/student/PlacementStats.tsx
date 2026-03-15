import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatsCard from '@/components/cards/StatsCard';
import { Users, UserCheck, Building2, TrendingUp, IndianRupee, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, ComposedChart } from 'recharts';

const PlacementStats = () => {
  const batchYear = '2025';

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
    { month: 'Aug', placed: 8 },
    { month: 'Sep', placed: 10 },
    { month: 'Oct', placed: 12 },
    { month: 'Nov', placed: 16 },
    { month: 'Dec', placed: 14 },
    { month: 'Jan', placed: 15 },
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

  const monthCount = monthlyPlacedCountData.length;
  const recruiterCount = companyWiseData.length;
  const roleCount = roleBasedPlacementData.length;
  const maxRolePlaced = Math.max(...roleBasedPlacementData.map((item) => item.placed));

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
            Batch {batchYear} Placement Dashboard
          </h1>
          <p className="text-muted-foreground">
            A clear view of Batch {batchYear} outcomes to help current students benchmark preparation and expectations.
          </p>
        </div>

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
          <Card className="animate-slide-up border-blue-200/70 bg-gradient-to-b from-blue-50/80 via-cyan-50/40 to-white" style={{ animationDelay: '600ms' }}>
            <CardHeader>
              <CardTitle className="text-lg">Placement Momentum by Month ({monthCount}-month trend, Batch {batchYear})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyPlacedCountData}>
                    <defs>
                      <linearGradient id="monthlyPlacementFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" stroke="#93C5FD" strokeOpacity={0.55} />
                    <XAxis dataKey="month" stroke="#1E3A8A" tickLine={false} axisLine={false} />
                    <YAxis stroke="#1E3A8A" tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#EFF6FF',
                        border: '1px solid #BFDBFE',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => [`${value} students`, 'Placed']}
                    />
                    <Area
                      type="monotone"
                      dataKey="placed"
                      stroke="none"
                      fill="url(#monthlyPlacementFill)"
                    />
                    <Line
                      dataKey="placed"
                      name="Students Placed"
                      type="monotone"
                      stroke="#2563EB"
                      strokeWidth={3}
                      dot={{ fill: '#2563EB', r: 4, stroke: '#DBEAFE', strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: '#1D4ED8' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Company-wise Stats */}
          <Card className="animate-slide-up border-emerald-200/80 bg-gradient-to-b from-emerald-50/70 via-teal-50/40 to-white" style={{ animationDelay: '700ms' }}>
            <CardHeader>
              <CardTitle className="text-lg">Top {recruiterCount} Recruiters by Offers (with LPA)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={companyWiseData}>
                    <CartesianGrid strokeDasharray="4 4" stroke="#6EE7B7" strokeOpacity={0.45} />
                    <XAxis dataKey="company" stroke="#065F46" tickLine={false} axisLine={false} />
                    <YAxis yAxisId="left" stroke="#065F46" tickLine={false} axisLine={false} allowDecimals={false} />
                    <YAxis yAxisId="right" orientation="right" stroke="#0F766E" tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ECFDF5',
                        border: '1px solid #A7F3D0',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number, name: string) => {
                        if (name === 'offers') return [`${value} offers`, 'Offers'];
                        return [`${value} LPA`, 'LPA'];
                      }}
                    />
                    <Bar yAxisId="left" dataKey="offers" name="offers" barSize={26} radius={[8, 8, 0, 0]}>
                      {companyWiseData.map((entry) => (
                        <Cell key={`company-${entry.company}`} fill={entry.color} />
                      ))}
                    </Bar>
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="lpa"
                      name="lpa"
                      stroke="#0F766E"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#0F766E' }}
                      activeDot={{ r: 6 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Placement Ratio */}
          <Card className="animate-slide-up" style={{ animationDelay: '800ms' }}>
            <CardHeader>
              <CardTitle className="text-lg">Placed vs Unplaced (Batch {batchYear})</CardTitle>
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
          <Card className="animate-slide-up border-violet-200/80 bg-gradient-to-b from-violet-50/70 via-fuchsia-50/40 to-white" style={{ animationDelay: '900ms' }}>
            <CardHeader>
              <CardTitle className="text-lg">Role-wise Placement Distribution (Top {roleCount} roles, Batch {batchYear})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-5 pt-1">
                {roleBasedPlacementData.map((entry) => {
                  const widthPercent = (entry.placed / maxRolePlaced) * 100;
                  return (
                    <div key={entry.role} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-foreground">{entry.role}</span>
                        <span className="font-semibold text-muted-foreground">{entry.placed}</span>
                      </div>
                      <div className="h-3 rounded-full bg-violet-100 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${widthPercent}%`,
                            background: `linear-gradient(90deg, ${entry.color}, ${entry.color}CC)`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PlacementStats;
