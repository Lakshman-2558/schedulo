import React, { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Chip,
  IconButton,
  Fade,
  Grow,
  alpha,
  Avatar,
  Divider,
  Badge,
  Tooltip,
} from '@mui/material'
import {
  CalendarToday as CalendarIcon,
  AccessTime as ClockIcon,
  Notifications as BellIcon,
  Download as DownloadIcon,
  LocationOn as MapPinIcon,
  MenuBook as BookOpenIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
  Today as TodayIcon,
} from '@mui/icons-material'
import { styled } from '@mui/material/styles'

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

const DutyCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  transition: 'all 0.3s ease',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  '&:hover': {
    transform: 'translateX(8px)',
    boxShadow: theme.shadows[8],
    borderColor: theme.palette.primary.main,
  },
}))

const NotificationCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  border: `2px solid ${theme.palette.warning.main}`,
  background: alpha(theme.palette.warning.main, 0.05),
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}))

const FacultyDashboard = () => {
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('🎨 Professional Faculty Dashboard Loaded!')
    fetchDashboard()

    const handleNewAllocation = (event) => {
      fetchDashboard()
    }

    window.addEventListener('newAllocationReceived', handleNewAllocation)

    return () => {
      window.removeEventListener('newAllocationReceived', handleNewAllocation)
    }
  }, [])

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/faculty/dashboard')
      setDashboard(response.data.data)
    } catch (error) {
      toast.error('Error fetching dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadDutyLetter = async (allocationId) => {
    try {
      const response = await api.get(`/reports/duty-letter/${allocationId}`, {
        responseType: 'blob',
      })
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `duty-letter-${allocationId}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      toast.success('Duty letter downloaded')
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Download failed')
    }
  }

  const handleDownloadICal = async (allocationId) => {
    try {
      const response = await api.get(`/reports/ical/${allocationId}`, {
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `duty-${allocationId}.ics`)
      document.body.appendChild(link)
      link.click()
      toast.success('Calendar file downloaded')
    } catch (error) {
      toast.error('Download failed')
    }
  }

  const handleAcknowledge = async (dutyId) => {
    try {
      await api.post(`/faculty/acknowledge/${dutyId}`, { action: 'acknowledge' })
      toast.success('Duty acknowledged successfully')
      fetchDashboard()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to acknowledge')
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

  const stats = [
    {
      title: 'Total Duties',
      value: dashboard?.statistics?.totalDuties || 0,
      icon: AssignmentIcon,
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    },
    {
      title: 'Total Hours',
      value: dashboard?.statistics?.totalHours || 0,
      icon: ClockIcon,
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    },
    {
      title: 'Pending Notifications',
      value: dashboard?.statistics?.pendingNotifications || 0,
      icon: BellIcon,
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      highlight: (dashboard?.statistics?.pendingNotifications || 0) > 0,
    },
    {
      title: "Today's Duties",
      value: dashboard?.statistics?.todayDuties || 0,
      icon: TodayIcon,
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
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
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Welcome Back! 👋
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Here's an overview of your exam invigilation duties
            </Typography>
          </Box>

          {/* Statistics Cards */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
              gap: 3,
              mb: 4,
            }}
          >
            {stats.map((stat, index) => (
              <Grow in timeout={600 + index * 100} key={index}>
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
                      <Badge
                        badgeContent={stat.highlight ? '!' : 0}
                        color="error"
                        sx={{ zIndex: 1 }}
                      >
                        <Avatar
                          sx={{
                            bgcolor: 'rgba(255, 255, 255, 0.2)',
                            width: 56,
                            height: 56,
                          }}
                        >
                          <stat.icon sx={{ fontSize: 32 }} />
                        </Avatar>
                      </Badge>
                    </Box>
                  </CardContent>
                </GradientCard>
              </Grow>
            ))}
          </Box>

          {/* Pending Notifications */}
          {dashboard?.pendingNotifications && dashboard.pendingNotifications.length > 0 && (
            <Grow in timeout={800}>
              <NotificationCard sx={{ mb: 4 }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Avatar sx={{ bgcolor: 'warning.main', width: 40, height: 40 }}>
                        <BellIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight={700}>
                          Pending Notifications
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {dashboard.pendingNotifications.length} duties require acknowledgment
                        </Typography>
                      </Box>
                    </Box>
                    <Button
                      component={Link}
                      to="/faculty/duties?showNotifications=true"
                      variant="outlined"
                      size="small"
                      sx={{ textTransform: 'none', fontWeight: 600 }}
                    >
                      View All
                    </Button>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {dashboard.pendingNotifications.map((duty) => (
                      <Card key={duty._id} sx={{ borderRadius: 2 }}>
                        <CardContent>
                          <Box display="flex" justifyContent="space-between" alignItems="start">
                            <Box flex={1}>
                              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                                {duty.exam?.examName}
                              </Typography>
                              <Box display="flex" flexWrap="wrap" gap={1.5} mb={1}>
                                <Chip
                                  icon={<CalendarIcon sx={{ fontSize: 16 }} />}
                                  label={new Date(duty.date).toLocaleDateString()}
                                  size="small"
                                  variant="outlined"
                                />
                                <Chip
                                  icon={<ClockIcon sx={{ fontSize: 16 }} />}
                                  label={`${duty.startTime} - ${duty.endTime}`}
                                  size="small"
                                  variant="outlined"
                                />
                                <Chip
                                  icon={<MapPinIcon sx={{ fontSize: 16 }} />}
                                  label={duty.campus}
                                  size="small"
                                  variant="outlined"
                                />
                              </Box>
                            </Box>
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              startIcon={<CheckCircleIcon />}
                              onClick={() => handleAcknowledge(duty._id)}
                              sx={{ textTransform: 'none', fontWeight: 600, ml: 2 }}
                            >
                              Acknowledge
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                </CardContent>
              </NotificationCard>
            </Grow>
          )}

          {/* Today's Duties */}
          {dashboard?.todayDuties && dashboard.todayDuties.length > 0 && (
            <Grow in timeout={900}>
              <Card sx={{ mb: 4, borderRadius: 3, border: `2px solid ${alpha('#1a56db', 0.2)}` }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1.5} mb={3}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                      <TodayIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={700}>
                        Today's Duties
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {dashboard.todayDuties.length} duties scheduled for today
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {dashboard.todayDuties.map((duty) => (
                      <Card
                        key={duty._id}
                        sx={{
                          borderRadius: 2,
                          bgcolor: alpha('#1a56db', 0.05),
                          border: `1px solid ${alpha('#1a56db', 0.1)}`,
                        }}
                      >
                        <CardContent>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Box>
                              <Typography variant="subtitle1" fontWeight={600}>
                                {duty.exam?.examName}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {duty.startTime} - {duty.endTime} | {duty.campus}
                              </Typography>
                            </Box>
                            <Box display="flex" gap={1}>
                              <Tooltip title="Download Duty Letter">
                                <IconButton
                                  onClick={() => handleDownloadDutyLetter(duty._id)}
                                  sx={{
                                    bgcolor: alpha('#1a56db', 0.1),
                                    '&:hover': { bgcolor: alpha('#1a56db', 0.2) },
                                  }}
                                >
                                  <DownloadIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Add to Calendar">
                                <IconButton
                                  onClick={() => handleDownloadICal(duty._id)}
                                  sx={{
                                    bgcolor: alpha('#1a56db', 0.1),
                                    '&:hover': { bgcolor: alpha('#1a56db', 0.2) },
                                  }}
                                >
                                  <CalendarIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grow>
          )}

          {/* Upcoming Duties */}
          <Grow in timeout={1000}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <Avatar sx={{ bgcolor: 'secondary.main', width: 40, height: 40 }}>
                      <CalendarIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={700}>
                        Upcoming Duties
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Your scheduled exam invigilation duties
                      </Typography>
                    </Box>
                  </Box>
                  <Button
                    component={Link}
                    to="/faculty/duties"
                    variant="outlined"
                    size="small"
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                  >
                    View All
                  </Button>
                </Box>

                {dashboard?.upcomingDuties && dashboard.upcomingDuties.length > 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {dashboard.upcomingDuties.map((duty, index) => (
                      <Grow in timeout={1100 + index * 100} key={duty._id}>
                        <DutyCard>
                          <CardContent>
                            <Box display="flex" justifyContent="space-between" alignItems="start">
                              <Box flex={1}>
                                <Typography variant="h6" fontWeight={600} gutterBottom>
                                  {duty.exam?.examName}
                                </Typography>

                                {duty.exam?.courseName && (
                                  <Box display="flex" alignItems="center" gap={0.5} mb={1.5}>
                                    <BookOpenIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                    <Typography variant="body2" color="text.secondary">
                                      {duty.exam.courseCode} - {duty.exam.courseName}
                                    </Typography>
                                  </Box>
                                )}

                                <Box display="flex" flexWrap="wrap" gap={1.5} mb={2}>
                                  <Chip
                                    icon={<CalendarIcon sx={{ fontSize: 16 }} />}
                                    label={new Date(duty.date).toLocaleDateString('en-IN', {
                                      weekday: 'short',
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                    })}
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                  />
                                  <Chip
                                    icon={<ClockIcon sx={{ fontSize: 16 }} />}
                                    label={`${duty.startTime} - ${duty.endTime}`}
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                  />
                                </Box>

                                <Box display="flex" flexWrap="wrap" gap={1}>
                                  {duty.classroom && (
                                    <Chip
                                      icon={<MapPinIcon sx={{ fontSize: 14 }} />}
                                      label={`Room ${duty.classroom.roomNumber}${duty.classroom.block ? ` - ${duty.classroom.block}` : ''
                                        }${duty.classroom.floor ? ` (Floor ${duty.classroom.floor})` : ''}`}
                                      size="small"
                                      sx={{
                                        bgcolor: alpha('#3b82f6', 0.1),
                                        color: '#3b82f6',
                                        fontWeight: 600,
                                      }}
                                    />
                                  )}
                                  <Chip
                                    label={duty.campus}
                                    size="small"
                                    sx={{
                                      bgcolor: alpha('#6b7280', 0.1),
                                      color: '#6b7280',
                                      fontWeight: 600,
                                    }}
                                  />
                                  {duty.exam?.examType && (
                                    <Chip
                                      label={duty.exam.examType}
                                      size="small"
                                      sx={{
                                        bgcolor: alpha('#8b5cf6', 0.1),
                                        color: '#8b5cf6',
                                        fontWeight: 600,
                                      }}
                                    />
                                  )}
                                </Box>
                              </Box>

                              <Tooltip title="Download Duty Letter">
                                <IconButton
                                  onClick={() => handleDownloadDutyLetter(duty._id)}
                                  sx={{
                                    ml: 2,
                                    bgcolor: alpha('#1a56db', 0.1),
                                    '&:hover': { bgcolor: alpha('#1a56db', 0.2) },
                                  }}
                                >
                                  <DownloadIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </CardContent>
                        </DutyCard>
                      </Grow>
                    ))}
                  </Box>
                ) : (
                  <Box textAlign="center" py={8}>
                    <CalendarIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.3 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No Upcoming Duties
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      You don't have any scheduled duties at the moment
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grow>
        </Box>
      </Fade>
    </Layout>
  )
}

export default FacultyDashboard
