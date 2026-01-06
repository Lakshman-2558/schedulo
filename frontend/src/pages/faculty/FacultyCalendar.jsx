import React, { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import api from '../../utils/api'
import Calendar from 'react-calendar'
import moment from 'moment'
import toast from 'react-hot-toast'
import 'react-calendar/dist/Calendar.css'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Chip,
  CircularProgress,
  Fade,
  Grow,
  alpha,
  Divider,
} from '@mui/material'
import {
  CalendarToday as CalendarIcon,
  Close as CloseIcon,
  LocationOn as LocationIcon,
  AccessTime as ClockIcon,
  School as SchoolIcon,
} from '@mui/icons-material'
import { styled } from '@mui/material/styles'

const StyledCalendar = styled('div')(({ theme }) => ({
  '& .react-calendar': {
    width: '100%',
    border: 'none',
    borderRadius: 16,
    padding: theme.spacing(2),
    fontFamily: theme.typography.fontFamily,
  },
  '& .react-calendar__tile': {
    padding: '1em 0.5em',
    borderRadius: 8,
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.1),
    },
  },
  '& .react-calendar__tile--active': {
    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%) !important`,
    color: 'white !important',
  },
  '& .react-calendar__tile--now': {
    backgroundColor: alpha(theme.palette.warning.main, 0.1),
    fontWeight: 700,
  },
  '& .bg-blue-100': {
    backgroundColor: alpha(theme.palette.info.main, 0.15),
    fontWeight: 600,
  },
}))

const EventCard = styled(Card)(({ theme, color }) => ({
  borderLeft: `4px solid ${color || theme.palette.primary.main}`,
  borderRadius: 12,
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateX(8px)',
    boxShadow: theme.shadows[4],
  },
}))

const FacultyCalendar = () => {
  const [events, setEvents] = useState([])
  const [filteredEvents, setFilteredEvents] = useState([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCalendarData()
  }, [])

  useEffect(() => {
    filterEvents()
  }, [events, selectedDate])

  const fetchCalendarData = async () => {
    try {
      setLoading(true)
      const response = await api.get('/faculty/calendar')
      setEvents(response.data.events || [])
    } catch (error) {
      toast.error('Error fetching calendar data')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterEvents = () => {
    const dateStr = moment(selectedDate).format('YYYY-MM-DD')
    const filtered = events.filter((event) => {
      const eventDate = moment(event.start).format('YYYY-MM-DD')
      return eventDate === dateStr
    })
    setFilteredEvents(filtered)
  }

  const tileClassName = ({ date }) => {
    const dateStr = moment(date).format('YYYY-MM-DD')
    const hasEvents = events.some((event) => moment(event.start).format('YYYY-MM-DD') === dateStr)
    return hasEvents ? 'bg-blue-100' : ''
  }

  const tileContent = ({ date }) => {
    const dateStr = moment(date).format('YYYY-MM-DD')
    const dayEvents = events.filter((event) => moment(event.start).format('YYYY-MM-DD') === dateStr)
    return dayEvents.length > 0 ? (
      <Box textAlign="center" mt={0.5}>
        <Chip
          label={dayEvents.length}
          size="small"
          sx={{
            height: 20,
            minWidth: 20,
            fontSize: '0.7rem',
            bgcolor: '#3b82f6',
            color: 'white',
            fontWeight: 700,
          }}
        />
      </Box>
    ) : null
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
          <Box mb={4}>
            <Box display="flex" alignItems="center" gap={1.5} mb={1}>
              <CalendarIcon sx={{ fontSize: 32, color: 'primary.main' }} />
              <Typography
                variant="h4"
                fontWeight={700}
                sx={{
                  background: 'linear-gradient(135deg, #1a56db 0%, #6366f1 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                My Calendar
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary">
              View your exam invigilation schedule
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' },
              gap: 3,
            }}
          >
            {/* Calendar */}
            <Grow in timeout={600}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent>
                  <StyledCalendar>
                    <Calendar
                      onChange={setSelectedDate}
                      value={selectedDate}
                      tileClassName={tileClassName}
                      tileContent={tileContent}
                    />
                  </StyledCalendar>
                </CardContent>
              </Card>
            </Grow>

            {/* Events List */}
            <Grow in timeout={700}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    {moment(selectedDate).format('MMMM DD, YYYY')}
                  </Typography>
                  <Divider sx={{ my: 2 }} />

                  {filteredEvents.length === 0 ? (
                    <Box textAlign="center" py={4}>
                      <CalendarIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1, opacity: 0.3 }} />
                      <Typography variant="body2" color="text.secondary">
                        No duties on this date
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: 600, overflowY: 'auto' }}>
                      {filteredEvents.map((event, index) => (
                        <EventCard
                          key={index}
                          color={event.resource?.color || '#3B82F6'}
                          onClick={() => setSelectedEvent(event)}
                        >
                          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                              {event.title}
                            </Typography>
                            <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
                              <ClockIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                              <Typography variant="caption" color="text.secondary">
                                {moment(event.start).format('HH:mm')} - {moment(event.end).format('HH:mm')}
                              </Typography>
                            </Box>
                            {event.resource?.department && (
                              <Box display="flex" alignItems="center" gap={0.5}>
                                <SchoolIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                <Typography variant="caption" color="text.secondary">
                                  {event.resource.department}
                                </Typography>
                              </Box>
                            )}
                          </CardContent>
                        </EventCard>
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grow>
          </Box>

          {/* Event Detail Dialog */}
          <Dialog
            open={!!selectedEvent}
            onClose={() => setSelectedEvent(null)}
            maxWidth="sm"
            fullWidth
            PaperProps={{ sx: { borderRadius: 3 } }}
          >
            <DialogTitle>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" fontWeight={700}>
                  Invigilation Duty Details
                </Typography>
                <IconButton onClick={() => setSelectedEvent(null)} size="small">
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              {selectedEvent && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {selectedEvent.resource?.examName && (
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        Exam
                      </Typography>
                      <Typography variant="body1">{selectedEvent.resource.examName}</Typography>
                    </Box>
                  )}
                  {selectedEvent.resource?.courseCode && (
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        Course Code
                      </Typography>
                      <Typography variant="body1">{selectedEvent.resource.courseCode}</Typography>
                    </Box>
                  )}
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      Date
                    </Typography>
                    <Typography variant="body1">{moment(selectedEvent.start).format('MMMM DD, YYYY')}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      Time
                    </Typography>
                    <Typography variant="body1">
                      {moment(selectedEvent.start).format('HH:mm')} - {moment(selectedEvent.end).format('HH:mm')}
                    </Typography>
                  </Box>
                  {selectedEvent.resource?.department && (
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        Department
                      </Typography>
                      <Typography variant="body1">{selectedEvent.resource.department}</Typography>
                    </Box>
                  )}
                  {selectedEvent.resource?.campus && (
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        Campus
                      </Typography>
                      <Typography variant="body1">{selectedEvent.resource.campus}</Typography>
                    </Box>
                  )}
                  {selectedEvent.resource?.classroom && (
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        Classroom
                      </Typography>
                      <Typography variant="body1">
                        {selectedEvent.resource.classroom.roomNumber} - {selectedEvent.resource.classroom.block} (Floor{' '}
                        {selectedEvent.resource.classroom.floor})
                      </Typography>
                    </Box>
                  )}
                  {selectedEvent.resource?.status && (
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={0.5}>
                        Status
                      </Typography>
                      <Chip
                        label={selectedEvent.resource.status}
                        size="small"
                        color={
                          selectedEvent.resource.status === 'confirmed'
                            ? 'success'
                            : selectedEvent.resource.status === 'requested_change'
                              ? 'warning'
                              : 'primary'
                        }
                      />
                    </Box>
                  )}
                </Box>
              )}
            </DialogContent>
          </Dialog>
        </Box>
      </Fade>
    </Layout>
  )
}

export default FacultyCalendar
