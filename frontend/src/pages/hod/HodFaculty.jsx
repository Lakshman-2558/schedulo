import React, { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  InputAdornment,
  Fade,
  Grow,
  alpha,
  Avatar,
} from '@mui/material'
import {
  Search as SearchIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material'
import { styled } from '@mui/material/styles'

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
  padding: theme.spacing(2),
}))

const StyledHeaderCell = styled(TableCell)(({ theme }) => ({
  background: 'linear-gradient(135deg, #1a56db 0%, #1e40af 100%) !important',
  color: 'white !important',
  fontWeight: '700 !important',
  fontSize: '0.875rem !important',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  borderBottom: 'none !important',
  padding: `${theme.spacing(2)} !important`,
}))

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
    transform: 'translateX(4px)',
    boxShadow: `inset 4px 0 0 ${theme.palette.primary.main}`,
  },
  '&:last-child td': {
    borderBottom: 'none',
  },
}))

const WorkloadChip = styled(Chip)(({ theme, level }) => {
  const colors = {
    low: {
      bg: alpha(theme.palette.success.main, 0.1),
      color: theme.palette.success.dark,
      border: theme.palette.success.main,
    },
    medium: {
      bg: alpha(theme.palette.warning.main, 0.1),
      color: theme.palette.warning.dark,
      border: theme.palette.warning.main,
    },
    high: {
      bg: alpha(theme.palette.error.main, 0.1),
      color: theme.palette.error.dark,
      border: theme.palette.error.main,
    },
  }
  const color = colors[level] || colors.low
  return {
    backgroundColor: color.bg,
    color: color.color,
    border: `1px solid ${alpha(color.border, 0.3)}`,
    fontWeight: 600,
    fontSize: '0.75rem',
  }
})

const HodFaculty = () => {
  const [faculty, setFaculty] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: '',
  })

  useEffect(() => {
    fetchFaculty()
  }, [])

  const fetchFaculty = async () => {
    try {
      setLoading(true)
      const response = await api.get('/hod/faculty')
      setFaculty(response.data.data || [])
    } catch (error) {
      console.error('Error fetching faculty:', error)
      toast.error('Failed to fetch faculty data')
    } finally {
      setLoading(false)
    }
  }

  const filteredFaculty = faculty.filter((f) => {
    if (!filters.search) return true
    const searchLower = filters.search.toLowerCase()
    return (
      f.name?.toLowerCase().includes(searchLower) ||
      f.email?.toLowerCase().includes(searchLower) ||
      f.employeeId?.toLowerCase().includes(searchLower)
    )
  })

  const getWorkloadLevel = (duties) => {
    if (duties === 0) return 'low'
    if (duties <= 3) return 'low'
    if (duties <= 6) return 'medium'
    return 'high'
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
              Department Faculty
            </Typography>
            <Typography variant="body1" color="text.secondary">
              View and monitor your department's faculty workload
            </Typography>
          </Box>

          {/* Search */}
          <Grow in timeout={600}>
            <Card sx={{ mb: 3, borderRadius: 3 }}>
              <CardContent>
                <TextField
                  fullWidth
                  placeholder="Search by name, email, or employee ID..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </CardContent>
            </Card>
          </Grow>

          {/* Faculty Table */}
          <Grow in timeout={700}>
            <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
              <CardContent sx={{ p: 0 }}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <StyledHeaderCell>Faculty</StyledHeaderCell>
                        <StyledHeaderCell>Contact</StyledHeaderCell>
                        <StyledHeaderCell>Employee ID</StyledHeaderCell>
                        <StyledHeaderCell align="center">Workload</StyledHeaderCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredFaculty.length === 0 ? (
                        <TableRow>
                          <StyledTableCell colSpan={4} align="center" sx={{ py: 8 }}>
                            <Typography variant="body1" color="text.secondary">
                              No faculty found
                            </Typography>
                          </StyledTableCell>
                        </TableRow>
                      ) : (
                        filteredFaculty.map((f, index) => (
                          <StyledTableRow key={f._id}>
                            <StyledTableCell>
                              <Box display="flex" alignItems="center" gap={2}>
                                <Avatar
                                  sx={{
                                    bgcolor: alpha('#1a56db', 0.1),
                                    color: '#1a56db',
                                    fontWeight: 700,
                                  }}
                                >
                                  {f.name?.charAt(0).toUpperCase()}
                                </Avatar>
                                <Typography variant="body2" fontWeight={600}>
                                  {f.name}
                                </Typography>
                              </Box>
                            </StyledTableCell>
                            <StyledTableCell>
                              <Box display="flex" alignItems="center" gap={0.5}>
                                <EmailIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                <Typography variant="body2">{f.email}</Typography>
                              </Box>
                            </StyledTableCell>
                            <StyledTableCell>
                              <Typography variant="body2" fontFamily="monospace" fontWeight={600}>
                                {f.employeeId || '-'}
                              </Typography>
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              <Box>
                                <WorkloadChip
                                  label={`${f.workload?.totalDuties || 0} duties`}
                                  level={getWorkloadLevel(f.workload?.totalDuties || 0)}
                                  size="small"
                                />
                                <Typography variant="caption" display="block" color="text.secondary" mt={0.5}>
                                  {(f.workload?.totalHours || 0).toFixed(1)} hours
                                </Typography>
                              </Box>
                            </StyledTableCell>
                          </StyledTableRow>
                        ))
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

export default HodFaculty
