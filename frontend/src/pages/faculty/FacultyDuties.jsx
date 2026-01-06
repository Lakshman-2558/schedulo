import React, { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import api from '../../utils/api'
import toast from 'react-hot-toast'
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
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Checkbox,
  FormControlLabel,
  Tooltip,
  Divider,
  Paper,
} from '@mui/material'
import {
  CalendarToday as CalendarIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  AccessTime as ClockIcon,
  LocationOn as LocationIcon,
  Event as EventIcon,
} from '@mui/icons-material'
import { styled } from '@mui/material/styles'

const StyledTabs = styled(Tabs)(({ theme }) => ({
  minHeight: 48,
  '& .MuiTabs-indicator': {
    height: 4,
    borderRadius: '4px 4px 0 0',
    background: 'linear-gradient(90deg, #f093fb 0%, #f5576c 100%)',
  },
}))

const StyledTab = styled(Tab)(({ theme }) => ({
  minHeight: 48,
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.9375rem',
  color: theme.palette.text.secondary,
  '&.Mui-selected': {
    color: '#f5576c',
    fontWeight: 700,
  },
}))

const DutyCard = styled(Card)(({ theme, gradient }) => ({
  borderRadius: 20,
  transition: 'all 0.3s ease',
  background: gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-8px) scale(1.02)',
    boxShadow: theme.shadows[12],
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    width: '200px',
    height: '200px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '50%',
    transform: 'translate(30%, -30%)',
  },
}))

const StatusChip = styled(Chip)(({ theme, statustype }) => {
  const colors = {
    pending: { bg: '#fbbf24', color: '#78350f' },
    acknowledged: { bg: '#34d399', color: '#064e3b' },
    unavailable: { bg: '#f87171', color: '#7f1d1d' },
    present: { bg: '#34d399', color: '#064e3b' },
    on_the_way: { bg: '#60a5fa', color: '#1e3a8a' },
    unable_to_reach: { bg: '#f87171', color: '#7f1d1d' },
    confirmed: { bg: '#34d399', color: '#064e3b' },
    assigned: { bg: '#a78bfa', color: '#4c1d95' },
  }
  const color = colors[statustype] || colors.assigned
  return {
    backgroundColor: color.bg,
    color: color.color,
    fontWeight: 700,
    fontSize: '0.75rem',
    borderRadius: 12,
    padding: '4px 12px',
  }
})

const gradients = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
]

const FacultyDuties = () => {
  const [duties, setDuties] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUnavailableModal, setShowUnavailableModal] = useState(null)
  const [showOnTheWayModal, setShowOnTheWayModal] = useState(null)
  const [showEmergencyModal, setShowEmergencyModal] = useState(null)
  const [unavailableReason, setUnavailableReason] = useState('')
  const [eta, setEta] = useState('')
  const [emergencyReason, setEmergencyReason] = useState('')

  const viewOptions = ['today', 'week', 'month', 'all']

  useEffect(() => {
    fetchDuties()
  }, [view, showNotifications])

  const fetchDuties = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (viewOptions[view] !== 'all') params.append('view', viewOptions[view])
      if (showNotifications) params.append('showNotifications', 'true')

      const response = await api.get(`/faculty/duties?${params}`)
      setDuties(response.data.data || [])
    } catch (error) {
      toast.error('Error fetching duties')
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
      toast.success('✅ Duty letter downloaded!')
    } catch (error) {
      console.error('Download error:', error)
      toast.error('❌ Download failed')
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
      link.remove()
      window.URL.revokeObjectURL(url)
      toast.success('📅 Calendar downloaded!')
    } catch (error) {
      toast.error('❌ Download failed')
    }
  }

  const handleAcknowledge = async (allocationId, action) => {
    try {
      await api.post(`/faculty/acknowledge/${allocationId}`, { action })
      toast.success(action === 'acknowledge' ? '✅ Acknowledged!' : '📝 Unavailability noted')
      fetchDuties()
    } catch (error) {
      toast.error(error.response?.data?.message || '❌ Failed')
    }
  }

  const handleSubmitUnavailable = async () => {
    if (!unavailableReason.trim()) {
      toast.error('⚠️ Please provide a reason')
      return
    }
    try {
      await api.post(`/faculty/acknowledge/${showUnavailableModal._id}`, {
        action: 'unavailable',
        reason: unavailableReason,
      })
      toast.success('📝 Unavailability noted')
      setShowUnavailableModal(null)
      setUnavailableReason('')
      fetchDuties()
    } catch (error) {
      toast.error('❌ Failed to submit')
    }
  }

  const handleLiveStatus = async (allocationId, status) => {
    try {
      await api.post(`/faculty/live-status/${allocationId}`, { status })
      toast.success('✅ Status updated')
      fetchDuties()
    } catch (error) {
      toast.error('❌ Failed to update')
    }
  }

  const handleSubmitOnTheWay = async () => {
    if (!eta.trim()) {
      toast.error('⚠️ Please provide ETA')
      return
    }
    try {
      await api.post(`/faculty/live-status/${showOnTheWayModal._id}`, {
        status: 'on_the_way',
        eta: eta,
      })
      toast.success('🚶 On the way')
      setShowOnTheWayModal(null)
      setEta('')
      fetchDuties()
    } catch (error) {
      toast.error('❌ Failed')
    }
  }

  const handleSubmitEmergency = async () => {
    if (!emergencyReason.trim()) {
      toast.error('⚠️ Please provide reason')
      return
    }
    try {
      await api.post(`/faculty/live-status/${showEmergencyModal._id}`, {
        status: 'unable_to_reach',
        emergencyReason: emergencyReason,
      })
      toast.success('🚨 Emergency reported')
      setShowEmergencyModal(null)
      setEmergencyReason('')
      fetchDuties()
    } catch (error) {
      toast.error('❌ Failed')
    }
  }

  if (loading) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress size={60} thickness={4} sx={{ color: '#f5576c' }} />
        </Box>
      </Layout>
    )
  }

  return (
    <Layout>
      <Fade in timeout={600}>
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Box>
              <Typography
                variant="h4"
                fontWeight={700}
                gutterBottom
                sx={{
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                My Duties 📋
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage your exam invigilation assignments
              </Typography>
            </Box>
            <Tooltip title="Refresh">
              <IconButton
                onClick={fetchDuties}
                sx={{
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  color: 'white',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)',
                    transform: 'rotate(180deg)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>

          <Card sx={{ mb: 3, borderRadius: 3, background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' }}>
            <CardContent sx={{ p: '16px !important' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                <StyledTabs value={view} onChange={(e, newValue) => setView(newValue)}>
                  <StyledTab label="📅 Today" />
                  <StyledTab label="📆 This Week" />
                  <StyledTab label="🗓️ This Month" />
                  <StyledTab label="📊 All" />
                </StyledTabs>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={showNotifications}
                      onChange={(e) => setShowNotifications(e.target.checked)}
                      sx={{ color: '#f5576c', '&.Mui-checked': { color: '#f5576c' } }}
                    />
                  }
                  label={
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <WarningIcon sx={{ fontSize: 18, color: '#f59e0b' }} />
                      <Typography variant="body2" fontWeight={600}>
                        Pending Only
                      </Typography>
                    </Box>
                  }
                />
              </Box>
            </CardContent>
          </Card>

          {duties.length === 0 ? (
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Box textAlign="center" py={8}>
                  <EventIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.3 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    {showNotifications ? 'No Pending Acknowledgments' : 'No Duties Found'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {showNotifications ? 'All acknowledged!' : 'No duties for selected period'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {duties.map((duty, index) => (
                <Grow in timeout={600 + index * 50} key={duty._id}>
                  <DutyCard gradient={gradients[index % gradients.length]}>
                    <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                      <Box display="flex" justifyContent="space-between" mb={2}>
                        <Box flex={1}>
                          <Typography variant="h5" fontWeight={700} gutterBottom sx={{ textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                            {duty.exam?.examName}
                          </Typography>
                          <Typography variant="body1" sx={{ opacity: 0.9 }}>
                            {duty.exam?.courseCode}
                          </Typography>
                        </Box>
                        <StatusChip label={duty.status} statustype={duty.status} size="small" />
                      </Box>

                      <Box display="flex" flexWrap="wrap" gap={1.5} mb={2}>
                        <Paper sx={{ px: 2, py: 1, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}>
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <CalendarIcon sx={{ fontSize: 16 }} />
                            <Typography variant="body2" fontWeight={600}>
                              {new Date(duty.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                            </Typography>
                          </Box>
                        </Paper>
                        <Paper sx={{ px: 2, py: 1, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}>
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <ClockIcon sx={{ fontSize: 16 }} />
                            <Typography variant="body2" fontWeight={600}>
                              {duty.startTime} - {duty.endTime}
                            </Typography>
                          </Box>
                        </Paper>
                        <Paper sx={{ px: 2, py: 1, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}>
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <LocationIcon sx={{ fontSize: 16 }} />
                            <Typography variant="body2" fontWeight={600}>
                              {duty.campus}
                            </Typography>
                          </Box>
                        </Paper>
                      </Box>

                      <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.3)' }} />

                      {duty.preExamAcknowledgment && (
                        <Box mb={2}>
                          {duty.preExamAcknowledgment.status === 'pending' && (
                            <Box display="flex" gap={1} flexWrap="wrap">
                              <StatusChip label="⚠️ Acknowledgment Required" statustype="pending" size="small" />
                              <Button
                                variant="contained"
                                size="small"
                                startIcon={<CheckCircleIcon />}
                                onClick={() => handleAcknowledge(duty._id, 'acknowledge')}
                                sx={{ bgcolor: '#34d399', color: '#064e3b', fontWeight: 700, '&:hover': { bgcolor: '#10b981' } }}
                              >
                                Acknowledge
                              </Button>
                              <Button
                                variant="contained"
                                size="small"
                                startIcon={<CancelIcon />}
                                onClick={() => setShowUnavailableModal(duty)}
                                sx={{ bgcolor: '#f87171', color: '#7f1d1d', fontWeight: 700, '&:hover': { bgcolor: '#ef4444' } }}
                              >
                                Unavailable
                              </Button>
                            </Box>
                          )}
                          {duty.preExamAcknowledgment.status === 'acknowledged' && (
                            <StatusChip icon={<CheckCircleIcon />} label="✅ Acknowledged" statustype="acknowledged" size="small" />
                          )}
                          {duty.preExamAcknowledgment.status === 'unavailable' && (
                            <StatusChip icon={<CancelIcon />} label="❌ Unavailable" statustype="unavailable" size="small" />
                          )}
                        </Box>
                      )}

                      {duty.liveStatusWindow &&
                        new Date() >= new Date(duty.liveStatusWindow.opensAt) &&
                        new Date() <= new Date(duty.liveStatusWindow.closesAt) && (
                          <Box mb={2}>
                            {!duty.liveStatus?.status && (
                              <Box display="flex" gap={1} flexWrap="wrap">
                                <Typography variant="body2" fontWeight={700} mr={1}>
                                  🔴 Live:
                                </Typography>
                                <Button
                                  variant="contained"
                                  size="small"
                                  onClick={() => handleLiveStatus(duty._id, 'present')}
                                  sx={{ bgcolor: '#34d399', color: '#064e3b', fontWeight: 700 }}
                                >
                                  ✅ Present
                                </Button>
                                <Button
                                  variant="contained"
                                  size="small"
                                  onClick={() => setShowOnTheWayModal(duty)}
                                  sx={{ bgcolor: '#60a5fa', color: '#1e3a8a', fontWeight: 700 }}
                                >
                                  🚶 On Way
                                </Button>
                                <Button
                                  variant="contained"
                                  size="small"
                                  onClick={() => setShowEmergencyModal(duty)}
                                  sx={{ bgcolor: '#f87171', color: '#7f1d1d', fontWeight: 700 }}
                                >
                                  ❌ Unable
                                </Button>
                              </Box>
                            )}
                            {duty.liveStatus?.status === 'present' && <StatusChip label="✅ Present" statustype="present" size="small" />}
                            {duty.liveStatus?.status === 'on_the_way' && (
                              <StatusChip label={`🚶 On Way ${duty.liveStatus.eta ? `(${duty.liveStatus.eta})` : ''}`} statustype="on_the_way" size="small" />
                            )}
                            {duty.liveStatus?.status === 'unable_to_reach' && <StatusChip label="❌ Unable" statustype="unable_to_reach" size="small" />}
                          </Box>
                        )}

                      <Box display="flex" gap={1}>
                        <Tooltip title="Download Duty Letter">
                          <IconButton
                            onClick={() => handleDownloadDutyLetter(duty._id)}
                            sx={{
                              bgcolor: 'rgba(255,255,255,0.2)',
                              backdropFilter: 'blur(10px)',
                              '&:hover': { bgcolor: 'rgba(255,255,255,0.3)', transform: 'scale(1.1)' },
                            }}
                          >
                            <DownloadIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Add to Calendar">
                          <IconButton
                            onClick={() => handleDownloadICal(duty._id)}
                            sx={{
                              bgcolor: 'rgba(255,255,255,0.2)',
                              backdropFilter: 'blur(10px)',
                              '&:hover': { bgcolor: 'rgba(255,255,255,0.3)', transform: 'scale(1.1)' },
                            }}
                          >
                            <CalendarIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </CardContent>
                  </DutyCard>
                </Grow>
              ))}
            </Box>
          )}

          <Dialog open={!!showUnavailableModal} onClose={() => setShowUnavailableModal(null)} maxWidth="sm" fullWidth>
            <DialogTitle>Mark as Unavailable</DialogTitle>
            <DialogContent>
              {showUnavailableModal && (
                <Box>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    {showUnavailableModal.exam?.examName} on {new Date(showUnavailableModal.date).toLocaleDateString()}
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Reason"
                    value={unavailableReason}
                    onChange={(e) => setUnavailableReason(e.target.value)}
                    placeholder="Reason for unavailability..."
                  />
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => { setShowUnavailableModal(null); setUnavailableReason('') }}>Cancel</Button>
              <Button onClick={handleSubmitUnavailable} variant="contained" color="error">Submit</Button>
            </DialogActions>
          </Dialog>

          <Dialog open={!!showOnTheWayModal} onClose={() => setShowOnTheWayModal(null)} maxWidth="sm" fullWidth>
            <DialogTitle>On the Way</DialogTitle>
            <DialogContent>
              {showOnTheWayModal && (
                <Box>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    {showOnTheWayModal.exam?.examName} at {showOnTheWayModal.startTime}
                  </Typography>
                  <TextField
                    fullWidth
                    label="ETA"
                    value={eta}
                    onChange={(e) => setEta(e.target.value)}
                    placeholder="e.g., 09:15 AM or 15 minutes"
                  />
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => { setShowOnTheWayModal(null); setEta('') }}>Cancel</Button>
              <Button onClick={handleSubmitOnTheWay} variant="contained">Update</Button>
            </DialogActions>
          </Dialog>

          <Dialog open={!!showEmergencyModal} onClose={() => setShowEmergencyModal(null)} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ color: 'error.main' }}>⚠️ Unable to Reach</DialogTitle>
            <DialogContent>
              {showEmergencyModal && (
                <Box>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    {showEmergencyModal.exam?.examName} at {showEmergencyModal.startTime}
                  </Typography>
                  <Box sx={{ bgcolor: alpha('#ef4444', 0.1), border: '1px solid', borderColor: alpha('#ef4444', 0.3), borderRadius: 2, p: 2, mb: 2 }}>
                    <Typography variant="body2" color="error.main">
                      This will alert the Exam Cell immediately.
                    </Typography>
                  </Box>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Emergency Reason"
                    value={emergencyReason}
                    onChange={(e) => setEmergencyReason(e.target.value)}
                    placeholder="Describe the emergency..."
                  />
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => { setShowEmergencyModal(null); setEmergencyReason('') }}>Cancel</Button>
              <Button onClick={handleSubmitEmergency} variant="contained" color="error">Report</Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Fade>
    </Layout>
  )
}

export default FacultyDuties
