import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import api from '../../utils/api'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Fade,
  Grow,
  alpha,
} from '@mui/material'
import {
  CalendarToday as CalendarIcon,
  People as PeopleIcon,
  Description as DescriptionIcon,
  Warning as WarningIcon,
  Business as BusinessIcon,
  AccessTime as ClockIcon,
} from '@mui/icons-material'
import { styled } from '@mui/material/styles'
import { Link } from 'react-router-dom'

const GradientCard = styled(Card)(({ theme, gradient }) => ({
  background: gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  borderRadius: 20,
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  textDecoration: 'none',
  display: 'block',
  [theme.breakpoints.down('sm')]: {
    borderRadius: 16,
  },
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
    [theme.breakpoints.down('sm')]: {
      width: '100px',
      height: '100px',
    },
  },
}))

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
  padding: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1.5),
    fontSize: '0.875rem',
  },
}))

const StyledHeaderCell = styled(TableCell)(({ theme }) => ({
  background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%) !important',
  color: 'white !important',
  fontWeight: '700 !important',
  fontSize: '0.875rem !important',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  padding: theme.spacing(2),
  borderBottom: 'none !important',
  [theme.breakpoints.down('sm')]: {
    padding: `${theme.spacing(1.5)} !important`,
    fontSize: '0.75rem !important',
  },
}))

const AdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/admin/dashboard')
      setStats(response.data.data)
    } catch (error) {
      console.error('Error fetching dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={48} />
        </Box>
      </Layout>
    )
  }

  const statCards = [
    {
      title: 'Total Exams',
      value: stats?.statistics?.totalExams || 0,
      icon: DescriptionIcon,
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', // Aqua blue
      link: '/admin/schedule',
    },
    {
      title: 'Scheduled',
      value: stats?.statistics?.scheduledExams || 0,
      icon: CalendarIcon,
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', // Green-cyan
      link: '/admin/schedule',
    },
    {
      title: 'Allocated',
      value: stats?.statistics?.allocatedExams || 0,
      icon: ClockIcon,
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Purple
      link: '/admin/schedule',
    },
    {
      title: 'Total Faculty',
      value: stats?.statistics?.totalFaculty || 0,
      icon: PeopleIcon,
      gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', // Pastel
      link: '/admin/manage',
    },
    {
      title: 'Active Conflicts',
      value: stats?.statistics?.activeConflicts || 0,
      icon: WarningIcon,
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', // Orange
      link: '/admin/schedule',
    },
    {
      title: 'Classrooms',
      value: stats?.statistics?.totalClassrooms || 0,
      icon: BusinessIcon,
      gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)', // Dark blue
      link: '/admin/schedule',
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
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Admin Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Overview of your campus scheduling system
            </Typography>
          </Box>

          {/* Statistics Grid */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
              gap: 3,
              mb: 4,
            }}
          >
            {statCards.map((stat, index) => (
              <Grow in timeout={700 + index * 100} key={index}>
                <GradientCard component={Link} to={stat.link} gradient={stat.gradient}>
                  <CardContent sx={{
                    position: 'relative',
                    zIndex: 1,
                    p: { xs: 2, sm: 3 },
                    '&:last-child': { pb: { xs: 2, sm: 3 } }
                  }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{
                            opacity: 0.9,
                            mb: 1,
                            fontSize: { xs: '0.75rem', sm: '0.875rem' }
                          }}
                        >
                          {stat.title}
                        </Typography>
                        <Typography
                          variant="h3"
                          fontWeight={700}
                          sx={{
                            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
                          }}
                        >
                          {stat.value}
                        </Typography>
                      </Box>
                      <stat.icon sx={{
                        fontSize: { xs: 36, sm: 42, md: 48 },
                        opacity: 0.3
                      }} />
                    </Box>
                  </CardContent>
                </GradientCard>
              </Grow>
            ))}
          </Box>

          {/* Recent Allocations */}
          <Grow in timeout={1000}>
            <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
              <CardContent>
                <Box mb={3}>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    Recent Allocations
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Latest invigilation assignments
                  </Typography>
                </Box>
                <TableContainer sx={{ overflowX: 'auto' }}>
                  <Table sx={{ minWidth: { xs: 600, md: 'auto' } }}>
                    <TableHead>
                      <TableRow>
                        <StyledHeaderCell>Date</StyledHeaderCell>
                        <StyledHeaderCell>Time</StyledHeaderCell>
                        <StyledHeaderCell>Faculty</StyledHeaderCell>
                        <StyledHeaderCell>Exam</StyledHeaderCell>
                        <StyledHeaderCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                          Campus
                        </StyledHeaderCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {stats?.recentAllocations?.length > 0 ? (
                        stats.recentAllocations.map((allocation) => (
                          <TableRow
                            key={allocation._id}
                            sx={{
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                backgroundColor: alpha('#667eea', 0.04),
                              },
                            }}
                          >
                            <StyledTableCell>
                              <Typography variant="body2" fontWeight={600}>
                                {new Date(allocation.date).toLocaleDateString()}
                              </Typography>
                            </StyledTableCell>
                            <StyledTableCell>
                              <Chip
                                label={`${allocation.startTime} - ${allocation.endTime}`}
                                size="small"
                                sx={{
                                  bgcolor: alpha('#667eea', 0.1),
                                  color: '#667eea',
                                  fontWeight: 600,
                                }}
                              />
                            </StyledTableCell>
                            <StyledTableCell>
                              <Typography variant="body2" fontWeight={600}>
                                {allocation.faculty?.name}
                              </Typography>
                            </StyledTableCell>
                            <StyledTableCell>
                              <Typography variant="body2">{allocation.exam?.examName}</Typography>
                            </StyledTableCell>
                            <StyledTableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                              <Typography variant="body2">{allocation.campus}</Typography>
                            </StyledTableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <StyledTableCell colSpan={5} align="center" sx={{ py: 4 }}>
                            <Typography variant="body2" color="text.secondary">
                              No recent allocations
                            </Typography>
                          </StyledTableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grow>
        </Box>
      </Fade>
    </Layout>
  )
}

export default AdminDashboard
