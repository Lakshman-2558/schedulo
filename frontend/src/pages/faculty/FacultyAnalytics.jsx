import React, { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  CircularProgress,
  Fade,
  Grow,
  alpha,
  Avatar,
} from '@mui/material'
import {
  TrendingUp as TrendingUpIcon,
  CalendarToday as CalendarIcon,
  AccessTime as ClockIcon,
  EmojiEvents as AwardIcon,
} from '@mui/icons-material'
import { styled } from '@mui/material/styles'

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

const GradientCard = styled(Card)(({ theme, gradient }) => ({
  background: gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  borderRadius: 20,
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[12],
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    width: '150px',
    height: '150px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '50%',
    transform: 'translate(30%, -30%)',
  },
}))

const FacultyAnalytics = () => {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
  })

  useEffect(() => {
    fetchAnalytics()
  }, [filters])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)

      const response = await api.get(`/faculty/analytics?${params}`)
      setAnalytics(response.data)
    } catch (error) {
      toast.error('Error fetching analytics')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress size={60} thickness={4} />
        </Box>
      </Layout>
    )
  }

  if (!analytics) return null

  const stats = [
    {
      title: 'Total Duties',
      value: analytics.overview?.totalDuties || 0,
      icon: CalendarIcon,
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    },
    {
      title: 'Total Hours',
      value: analytics.overview?.totalHours || 0,
      icon: ClockIcon,
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    },
    {
      title: 'Avg Hours/Duty',
      value: analytics.overview?.averageHoursPerDuty || 0,
      icon: TrendingUpIcon,
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    },
    {
      title: 'Upcoming',
      value: analytics.overview?.upcomingDuties || 0,
      icon: AwardIcon,
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    },
  ]

  return (
    <Layout>
      <Fade in timeout={600}>
        <Box>
          {/* Header */}
          <Box mb={4}>
            <Typography
              variant="h4"
              fontWeight={700}
              gutterBottom
              sx={{
                background: 'linear-gradient(135deg, #1a56db 0%, #6366f1 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              My Analytics 📊
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Insights into your exam invigilation performance
            </Typography>
          </Box>

          {/* Filters */}
          <Grow in timeout={600}>
            <Card sx={{ mb: 3, borderRadius: 3 }}>
              <CardContent>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                    gap: 2,
                  }}
                >
                  <TextField
                    type="date"
                    label="Start Date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                  <TextField
                    type="date"
                    label="End Date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                </Box>
              </CardContent>
            </Card>
          </Grow>

          {/* Stats Cards */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
              gap: 3,
              mb: 4,
            }}
          >
            {stats.map((stat, index) => (
              <Grow in timeout={700 + index * 100} key={index}>
                <GradientCard gradient={stat.gradient}>
                  <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box sx={{ zIndex: 1 }}>
                        <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                          {stat.title}
                        </Typography>
                        <Typography variant="h3" fontWeight={700}>
                          {stat.value}
                        </Typography>
                      </Box>
                      <Avatar
                        sx={{
                          bgcolor: 'rgba(255, 255, 255, 0.2)',
                          width: 56,
                          height: 56,
                          zIndex: 1,
                        }}
                      >
                        <stat.icon sx={{ fontSize: 32 }} />
                      </Avatar>
                    </Box>
                  </CardContent>
                </GradientCard>
              </Grow>
            ))}
          </Box>

          {/* Workload Comparison */}
          {analytics.comparison && (
            <Grow in timeout={900}>
              <Card sx={{ mb: 4, borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    Workload Comparison
                  </Typography>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                      gap: 2,
                      mt: 2,
                    }}
                  >
                    <Box sx={{ p: 3, bgcolor: alpha('#3b82f6', 0.1), borderRadius: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Your Duties
                      </Typography>
                      <Typography variant="h4" fontWeight={700}>
                        {analytics.comparison.personalDuties || 0}
                      </Typography>
                    </Box>
                    <Box sx={{ p: 3, bgcolor: alpha('#10b981', 0.1), borderRadius: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Department Average
                      </Typography>
                      <Typography variant="h4" fontWeight={700}>
                        {analytics.comparison.departmentAverage?.toFixed(1) || 0}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        p: 3,
                        bgcolor: alpha(
                          analytics.comparison.difference >= 0 ? '#f59e0b' : '#8b5cf6',
                          0.1
                        ),
                        borderRadius: 2,
                      }}
                    >
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Difference
                      </Typography>
                      <Typography variant="h4" fontWeight={700}>
                        {analytics.comparison.difference >= 0 ? '+' : ''}
                        {analytics.comparison.difference?.toFixed(1) || 0}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grow>
          )}

          {/* Monthly Breakdown */}
          {analytics.monthlyBreakdown && analytics.monthlyBreakdown.length > 0 && (
            <Grow in timeout={1000}>
              <Card sx={{ mb: 4, borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    Monthly Duties Distribution
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.monthlyBreakdown}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#3B82F6" name="Duties" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grow>
          )}

          {/* Department & Campus Breakdown */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' },
              gap: 3,
              mb: 4,
            }}
          >
            {analytics.departmentBreakdown && analytics.departmentBreakdown.length > 0 && (
              <Grow in timeout={1100}>
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      Department Breakdown
                    </Typography>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={analytics.departmentBreakdown}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ department, count }) => `${department}: ${count}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {analytics.departmentBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grow>
            )}

            {analytics.campusBreakdown && analytics.campusBreakdown.length > 0 && (
              <Grow in timeout={1200}>
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      Campus Breakdown
                    </Typography>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={analytics.campusBreakdown}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ campus, count }) => `${campus}: ${count}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {analytics.campusBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grow>
            )}
          </Box>

          {/* Exam Type & Time Slot */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' },
              gap: 3,
            }}
          >
            {analytics.examTypeBreakdown && analytics.examTypeBreakdown.length > 0 && (
              <Grow in timeout={1300}>
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      Exam Type Distribution
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 2 }}>
                      {analytics.examTypeBreakdown.map((item, index) => (
                        <Box
                          key={index}
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            p: 2,
                            bgcolor: alpha('#f3f4f6', 0.5),
                            borderRadius: 2,
                          }}
                        >
                          <Typography variant="body1" fontWeight={600} sx={{ textTransform: 'capitalize' }}>
                            {item.examType}
                          </Typography>
                          <Typography variant="h6" fontWeight={700}>
                            {item.count}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grow>
            )}

            {analytics.timeSlotBreakdown && analytics.timeSlotBreakdown.length > 0 && (
              <Grow in timeout={1400}>
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      Time Slot Distribution
                    </Typography>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={analytics.timeSlotBreakdown}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="timeSlot" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#10B981" name="Duties" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grow>
            )}
          </Box>
        </Box>
      </Fade>
    </Layout>
  )
}

export default FacultyAnalytics
