import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatsCard from '@/components/cards/StatsCard';
import { Users, UserCheck, Building2, TrendingUp, IndianRupee, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const PlacementStats = () => {
  const academicYear = '2023 - 2025';

  const pastBatchStats = {
    totalStudents: 120,
    placedStudents: 75,
    companiesVisited: 15,
    averagePackage: '10 LPA',
    topRecruiter: 'Simplify3x',
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
    { company: 'Simplify3x', offers: 18 },
    { company: 'TCS', offers: 14 },
    { company: 'Infosys', offers: 12 },
    { company: 'Wipro', offers: 10 },
    { company: 'Accenture', offers: 11 },
    { company: 'Cognizant', offers: 10 },
  ];

  const placementRatio = [
    { name: 'Placed', value: pastBatchStats.placedStudents, color: 'hsl(207, 31%, 32%)' }, /* #456882 */
    { name: 'Unplaced', value: unplacedStudents, color: 'hsl(207, 50%, 28%)' }, /* #234C6A */
  ];
  const roleBasedPlacementData = [
    { role: 'Software Engineer', placed: 30 },
    { role: 'Analyst', placed: 15 },
    { role: 'Associate Developer', placed: 12 },
    { role: 'QA Engineer', placed: 10 },
    { role: 'DevOps Engineer', placed: 8 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
            Past Batch Placement Statistics ({academicYear})
          </h1>
          <p className="text-muted-foreground">
            Placement outcomes for the academic year {academicYear}
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
              title="Top Recruiter"
              value={pastBatchStats.topRecruiter}
              icon={Award}
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
              <CardTitle className="text-lg">Students Placed Each Month (AY {academicYear})</CardTitle>
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
                      fill="hsl(207, 31%, 32%)"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Company-wise Stats */}
          <Card className="animate-slide-up" style={{ animationDelay: '700ms' }}>
            <CardHeader>
              <CardTitle className="text-lg">Top Recruiters by Offers (AY {academicYear})</CardTitle>
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
                    />
                    <Bar dataKey="offers" fill="hsl(207, 31%, 32%)" radius={[0, 4, 4, 0]} />
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
              <CardTitle className="text-lg">Role-based Placement Stats (AY {academicYear})</CardTitle>
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
                    <Bar dataKey="placed" fill="hsl(207, 50%, 28%)" radius={[0, 4, 4, 0]} />
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
