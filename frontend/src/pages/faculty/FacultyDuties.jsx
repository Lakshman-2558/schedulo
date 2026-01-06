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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
  Divider,
} from '@mui/material'
import {
  CalendarToday as CalendarIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  AccessTime as ClockIcon,
  LocationOn as LocationIcon,
  Event as EventIcon,
} from '@mui/icons-material'
import { styled } from '@mui/material/styles'

const DutyCard = styled(Card)(({ theme, gradient }) => ({
  borderRadius: 16,
  transition: 'all 0.3s ease',
  background: gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  position: 'relative',
  overflow: 'hidden',
  border: `1px solid ${alpha('#fff', 0.1)}`,
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    width: '150px',
    height: '150px',
    background: 'rgba(255, 255, 255, 0.08)',
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

const DetailBox = styled(Box)(({ theme, bgcolor }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  padding: theme.spacing(1, 1.5),
  borderRadius: 8,
  backgroundColor: bgcolor || alpha('#e0e7ff', 0.9),
  color: theme.palette.text.primary,
  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
}))

const gradients = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
]

const FacultyDuties = () => {
  const [duties, setDuties] = useState([])
  const [loading, setLoading] = useState(true)
  const [showUnavailableModal, setShowUnavailableModal] = useState(null)
  const [showOnTheWayModal, setShowOnTheWayModal] = useState(null)
  const [showEmergencyModal, setShowEmergencyModal] = useState(null)
  const [unavailableReason, setUnavailableReason] = useState('')
  const [eta, setEta] = useState('')
  const [emergencyReason, setEmergencyReason] = useState('')

  useEffect(() => {
    fetchDuties()
  }, [])

  const fetchDuties = async () => {
    try {
      setLoading(true)
      const response = await api.get('/faculty/duties')
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
      toast.success('Duty letter downloaded!')
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
      link.remove()
      window.URL.revokeObjectURL(url)
      toast.success('Calendar downloaded!')
    } catch (error) {
      toast.error('Download failed')
    }
  }

  const handleAcknowledge = async (allocationId, action) => {
    try {
      await api.post(`/faculty/acknowledge/${allocationId}`, { action })
      toast.success(action === 'acknowledge' ? 'Acknowledged successfully!' : 'Unavailability noted')
      fetchDuties()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to acknowledge')
    }
  }

  const handleSubmitUnavailable = async () => {
    if (!unavailableReason.trim()) {
      toast.error('Please provide a reason')
      return
    }
    try {
      await api.post(`/faculty/acknowledge/${showUnavailableModal._id}`, {
        action: 'unavailable',
        reason: unavailableReason,
      })
      toast.success('Unavailability noted')
      setShowUnavailableModal(null)
      setUnavailableReason('')
      fetchDuties()
    } catch (error) {
      toast.error('Failed to submit')
    }
  }

  const handleLiveStatus = async (allocationId, status) => {
    try {
      await api.post(`/faculty/live-status/${allocationId}`, { status })
      toast.success('Status updated')
      fetchDuties()
    } catch (error) {
      toast.error('Failed to update')
    }
  }

  const handleSubmitOnTheWay = async () => {
    if (!eta.trim()) {
      toast.error('Please provide ETA')
      return
    }
    try {
      await api.post(`/faculty/live-status/${showOnTheWayModal._id}`, {
        status: 'on_the_way',
        eta: eta,
      })
      toast.success('Status updated: On the way')
      setShowOnTheWayModal(null)
      setEta('')
      fetchDuties()
    } catch (error) {
      toast.error('Failed to update')
    }
  }

  const handleSubmitEmergency = async () => {
    if (!emergencyReason.trim()) {
      toast.error('Please provide reason')
      return
    }
    try {
      await api.post(`/faculty/live-status/${showEmergencyModal._id}`, {
        status: 'unable_to_reach',
        emergencyReason: emergencyReason,
      })
      toast.success('Emergency reported')
      setShowEmergencyModal(null)
      setEmergencyReason('')
      fetchDuties()
    } catch (error) {
      toast.error('Failed to report')
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
                My Duties
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage your exam invigilation assignments
              </Typography>
            </Box>
            <Tooltip title="Refresh">
              <IconButton
                onClick={fetchDuties}
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

          {/* Duties List */}
          {duties.length === 0 ? (
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Box textAlign="center" py={8}>
                  <EventIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.3 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No Duties Found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    You don't have any duties assigned
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {duties.map((duty, index) => (
                <Grow in timeout={600 + index * 50} key={duty._id}>
                  <DutyCard gradient={gradients[index % gradients.length]}>
                    <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                      <Box display="flex" justifyContent="space-between" mb={2}>
                        <Box flex={1}>
                          <Typography variant="h6" fontWeight={700} gutterBottom>
                            {duty.exam?.examName}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            {duty.exam?.courseCode}
                          </Typography>
                        </Box>
                        <StatusChip label={duty.status} statustype={duty.status} size="small" />
                      </Box>

                      <Box display="flex" flexWrap="wrap" gap={1.5} mb={2}>
                        <DetailBox bgcolor="#dbeafe">
                          <CalendarIcon sx={{ fontSize: 16, color: '#2563eb' }} />
                          <Typography variant="body2" fontWeight={600}>
                            {new Date(duty.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </Typography>
                        </DetailBox>
                        <DetailBox bgcolor="#e9d5ff">
                          <ClockIcon sx={{ fontSize: 16, color: '#7c3aed' }} />
                          <Typography variant="body2" fontWeight={600}>
                            {duty.startTime} - {duty.endTime}
                          </Typography>
                        </DetailBox>
                        <DetailBox bgcolor="#fce7f3">
                          <LocationIcon sx={{ fontSize: 16, color: '#db2777' }} />
                          <Typography variant="body2" fontWeight={600}>
                            {duty.campus}
                          </Typography>
                        </DetailBox>
                      </Box>

                      <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.2)' }} />

                      {duty.preExamAcknowledgment && (
                        <Box mb={2}>
                          {duty.preExamAcknowledgment.status === 'pending' && (
                            <Box display="flex" gap={1} flexWrap="wrap">
                              <StatusChip label="Acknowledgment Required" statustype="pending" size="small" />
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
                            <StatusChip icon={<CheckCircleIcon />} label="Acknowledged" statustype="acknowledged" size="small" />
                          )}
                          {duty.preExamAcknowledgment.status === 'unavailable' && (
                            <StatusChip icon={<CancelIcon />} label="Unavailable" statustype="unavailable" size="small" />
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
                                  Live Status:
                                </Typography>
                                <Button
                                  variant="contained"
                                  size="small"
                                  onClick={() => handleLiveStatus(duty._id, 'present')}
                                  sx={{ bgcolor: '#34d399', color: '#064e3b', fontWeight: 700 }}
                                >
                                  Present
                                </Button>
                                <Button
                                  variant="contained"
                                  size="small"
                                  onClick={() => setShowOnTheWayModal(duty)}
                                  sx={{ bgcolor: '#60a5fa', color: '#1e3a8a', fontWeight: 700 }}
                                >
                                  On the Way
                                </Button>
                                <Button
                                  variant="contained"
                                  size="small"
                                  onClick={() => setShowEmergencyModal(duty)}
                                  sx={{ bgcolor: '#f87171', color: '#7f1d1d', fontWeight: 700 }}
                                >
                                  Unable
                                </Button>
                              </Box>
                            )}
                            {duty.liveStatus?.status === 'present' && <StatusChip label="Present" statustype="present" size="small" />}
                            {duty.liveStatus?.status === 'on_the_way' && (
                              <StatusChip label={`On the Way ${duty.liveStatus.eta ? `(${duty.liveStatus.eta})` : ''}`} statustype="on_the_way" size="small" />
                            )}
                            {duty.liveStatus?.status === 'unable_to_reach' && <StatusChip label="Unable to Reach" statustype="unable_to_reach" size="small" />}
                          </Box>
                        )}

                      <Box display="flex" gap={1}>
                        <Tooltip title="Download Duty Letter">
                          <IconButton
                            onClick={() => handleDownloadDutyLetter(duty._id)}
                            sx={{
                              bgcolor: 'rgba(255,255,255,0.15)',
                              '&:hover': { bgcolor: 'rgba(255,255,255,0.25)', transform: 'scale(1.1)' },
                            }}
                          >
                            <DownloadIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Add to Calendar">
                          <IconButton
                            onClick={() => handleDownloadICal(duty._id)}
                            sx={{
                              bgcolor: 'rgba(255,255,255,0.15)',
                              '&:hover': { bgcolor: 'rgba(255,255,255,0.25)', transform: 'scale(1.1)' },
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

          {/* Modals */}
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
            <DialogTitle sx={{ color: 'error.main' }}>Unable to Reach</DialogTitle>
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
