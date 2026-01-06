import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  CircularProgress,
  IconButton,
  Chip,
  Fade,
  Grow,
  alpha,
  Tooltip,
} from '@mui/material'
import {
  CheckCircle as CheckCircleIcon,
  AccessTime as ClockIcon,
  Warning as AlertCircleIcon,
  Cancel as XCircleIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material'
import { styled } from '@mui/material/styles'

const GradientCard = styled(Card)(({ theme, gradient }) => ({
  background: gradient || 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  color: 'white',
  borderRadius: 20,
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-4px)',
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

const AcknowledgmentCard = styled(Card)(({ theme, status }) => {
  const colors = {
    overdue: {
      border: theme.palette.error.main,
      bg: alpha(theme.palette.error.main, 0.05),
    },
    acknowledged: {
      border: theme.palette.success.main,
      bg: alpha(theme.palette.success.main, 0.05),
    },
    pending: {
      border: theme.palette.warning.main,
      bg: alpha(theme.palette.warning.main, 0.05),
    },
  }
  const color = colors[status] || colors.pending
  return {
    borderRadius: 12,
    border: `2px solid ${color.border}`,
    backgroundColor: color.bg,
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateX(4px)',
      boxShadow: theme.shadows[4],
    },
  }
})

const AdminAcknowledgments = () => {
  const [data, setData] = useState({ pending: [], overdue: [], acknowledged: [], total: 0 })
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ campus: '', department: '' })

  useEffect(() => {
    fetchAcknowledgments()
  }, [filters])

  const fetchAcknowledgments = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.campus) params.append('campus', filters.campus)
      if (filters.department) params.append('department', filters.department)

      const response = await api.get(`/admin/acknowledgments?${params}`)
      setData(response.data.data || { pending: [], overdue: [], acknowledged: [], total: 0 })
    } catch (error) {
      toast.error('Error fetching acknowledgments')
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

  const stats = [
    {
      title: 'Acknowledged',
      value: data.acknowledged?.length || 0,
      icon: CheckCircleIcon,
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', // Green
    },
    {
      title: 'Pending',
      value: data.pending?.length || 0,
      icon: ClockIcon,
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', // Orange
    },
    {
      title: 'Overdue',
      value: data.overdue?.length || 0,
      icon: AlertCircleIcon,
      gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', // Red
    },
    {
      title: 'Total',
      value: data.total,
      icon: CheckCircleIcon,
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', // Aqua
    },
  ]

  return (
    <Layout>
      <Fade in timeout={600}>
        <Box>
          {/* Header */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Box>
              <Typography
                variant="h4"
                fontWeight={700}
                gutterBottom
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Pre-Exam Acknowledgments
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Monitor faculty acknowledgment status
              </Typography>
            </Box>
            <Tooltip title="Refresh">
              <IconButton
                onClick={fetchAcknowledgments}
                sx={{
                  bgcolor: alpha('#667eea', 0.1),
                  '&:hover': {
                    bgcolor: alpha('#667eea', 0.2),
                    transform: 'rotate(180deg)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <RefreshIcon sx={{ color: '#667eea' }} />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Filters */}
          <Card sx={{ mb: 3, borderRadius: 3 }}>
            <CardContent>
              <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2}>
                <TextField
                  fullWidth
                  label="Campus"
                  value={filters.campus}
                  onChange={(e) => setFilters({ ...filters, campus: e.target.value })}
                  placeholder="Filter by campus"
                  size="small"
                />
                <TextField
                  fullWidth
                  label="Department"
                  value={filters.department}
                  onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                  placeholder="Filter by department"
                  size="small"
                />
              </Box>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
              gap: 3,
              mb: 4,
            }}
          >
            {stats.map((stat, index) => (
              <Grow in timeout={700 + index * 100} key={index}>
                <GradientCard gradient={stat.gradient}>
                  <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                          {stat.title}
                        </Typography>
                        <Typography variant="h3" fontWeight={700}>
                          {stat.value}
                        </Typography>
                      </Box>
                      <stat.icon sx={{ fontSize: 48, opacity: 0.3 }} />
                    </Box>
                  </CardContent>
                </GradientCard>
              </Grow>
            ))}
          </Box>

          {/* Overdue Acknowledgments */}
          {data.overdue?.length > 0 && (
            <Grow in timeout={900}>
              <Card sx={{ mb: 3, borderRadius: 3 }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={3}>
                    <XCircleIcon sx={{ color: 'error.main' }} />
                    <Typography variant="h6" fontWeight={700}>
                      Overdue Acknowledgments
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {data.overdue?.map((allocation, index) => (
                      <Grow in timeout={1000 + index * 50} key={allocation._id}>
                        <AcknowledgmentCard status="overdue">
                          <CardContent>
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={2}>
                              <Box flex={1}>
                                <Typography variant="body1" fontWeight={600} gutterBottom>
                                  {allocation.exam?.examType
                                    ? allocation.exam.examType.charAt(0).toUpperCase() +
                                    allocation.exam.examType.slice(1).replace('-', ' ')
                                    : 'N/A'}{' '}
                                  - {allocation.faculty?.name || 'N/A'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  {allocation.exam?.courseCode}
                                </Typography>
                                <Box mt={1}>
                                  <Typography variant="caption" color="text.secondary" display="block">
                                    Faculty: {allocation.faculty?.name} ({allocation.faculty?.email})
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" display="block">
                                    Date: {new Date(allocation.date).toLocaleDateString()} | {allocation.startTime} -{' '}
                                    {allocation.endTime}
                                  </Typography>
                                  <Typography variant="caption" color="error.main" fontWeight={600} display="block">
                                    Deadline: {new Date(allocation.acknowledgmentDeadline).toLocaleString()}
                                  </Typography>
                                </Box>
                              </Box>
                              <Chip label="Overdue" color="error" size="small" />
                            </Box>
                          </CardContent>
                        </AcknowledgmentCard>
                      </Grow>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grow>
          )}

          {/* Acknowledged Acknowledgments */}
          {data.acknowledged && data.acknowledged.length > 0 && (
            <Grow in timeout={1000}>
              <Card sx={{ mb: 3, borderRadius: 3 }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={3}>
                    <CheckCircleIcon sx={{ color: 'success.main' }} />
                    <Typography variant="h6" fontWeight={700}>
                      Acknowledged
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {data.acknowledged?.map((allocation, index) => (
                      <Grow in timeout={1100 + index * 50} key={allocation._id}>
                        <AcknowledgmentCard status="acknowledged">
                          <CardContent>
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={2}>
                              <Box flex={1}>
                                <Typography variant="body1" fontWeight={600} gutterBottom>
                                  {allocation.exam?.examType
                                    ? allocation.exam.examType.charAt(0).toUpperCase() +
                                    allocation.exam.examType.slice(1).replace('-', ' ')
                                    : 'N/A'}{' '}
                                  - {allocation.faculty?.name || 'N/A'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  {allocation.exam?.courseCode}
                                </Typography>
                                <Box mt={1}>
                                  <Typography variant="caption" color="text.secondary" display="block">
                                    Faculty: {allocation.faculty?.name} ({allocation.faculty?.email})
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" display="block">
                                    Date: {new Date(allocation.date).toLocaleDateString()} | {allocation.startTime} -{' '}
                                    {allocation.endTime}
                                  </Typography>
                                  {allocation.preExamAcknowledgment?.acknowledgedAt && (
                                    <Typography variant="caption" color="success.main" fontWeight={600} display="block">
                                      Acknowledged: {new Date(allocation.preExamAcknowledgment.acknowledgedAt).toLocaleString()}
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                              <Chip label="✓ Acknowledged" color="success" size="small" />
                            </Box>
                          </CardContent>
                        </AcknowledgmentCard>
                      </Grow>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grow>
          )}

          {/* Pending Acknowledgments */}
          <Grow in timeout={1200}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={3}>
                  <ClockIcon sx={{ color: 'warning.main' }} />
                  <Typography variant="h6" fontWeight={700}>
                    Pending Acknowledgments
                  </Typography>
                </Box>
                {data.pending?.length === 0 ? (
                  <Box textAlign="center" py={8}>
                    <CheckCircleIcon sx={{ fontSize: 64, color: 'success.light', mb: 2 }} />
                    <Typography variant="body1" color="text.secondary">
                      All acknowledgments received!
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {data.pending?.map((allocation, index) => (
                      <Grow in timeout={1300 + index * 50} key={allocation._id}>
                        <AcknowledgmentCard status="pending">
                          <CardContent>
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={2}>
                              <Box flex={1}>
                                <Typography variant="body1" fontWeight={600} gutterBottom>
                                  {allocation.exam?.examType
                                    ? allocation.exam.examType.charAt(0).toUpperCase() +
                                    allocation.exam.examType.slice(1).replace('-', ' ')
                                    : 'N/A'}{' '}
                                  - {allocation.faculty?.name || 'N/A'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  {allocation.exam?.courseCode}
                                </Typography>
                                <Box mt={1}>
                                  <Typography variant="caption" color="text.secondary" display="block">
                                    Faculty: {allocation.faculty?.name} ({allocation.faculty?.email})
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" display="block">
                                    Date: {new Date(allocation.date).toLocaleDateString()} | {allocation.startTime} -{' '}
                                    {allocation.endTime}
                                  </Typography>
                                  <Typography variant="caption" color="warning.main" fontWeight={600} display="block">
                                    Deadline: {new Date(allocation.acknowledgmentDeadline).toLocaleString()}
                                  </Typography>
                                </Box>
                              </Box>
                              <Chip label="Pending" color="warning" size="small" />
                            </Box>
                          </CardContent>
                        </AcknowledgmentCard>
                      </Grow>
                    ))}
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

export default AdminAcknowledgments
