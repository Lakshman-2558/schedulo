import React, { useEffect, useState, useMemo } from 'react'
import Layout from '../../components/Layout'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
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
  IconButton,
  Tooltip,
  Badge,
} from '@mui/material'
import {
  Search as SearchIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material'
import { styled } from '@mui/material/styles'

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
  padding: theme.spacing(2),
}))

const StyledHeaderCell = styled(TableCell)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important',
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

const StatsCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  borderRadius: 16,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
}))

const AdminFaculty = () => {
  const [faculty, setFaculty] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    campus: '',
    department: '',
    search: '',
  })

  useEffect(() => {
    fetchFaculty()
  }, [filters.campus, filters.department])

  const fetchFaculty = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.campus) params.append('campus', filters.campus)
      if (filters.department) params.append('department', filters.department)

      const response = await api.get(`/admin/faculty?${params}`)
      setFaculty(response.data.data || [])
    } catch (error) {
      console.error('Error fetching faculty:', error)
      toast.error('Failed to fetch faculty data')
    } finally {
      setLoading(false)
    }
  }

  const filteredFaculty = useMemo(() => {
    if (!filters.search) return faculty
    const searchLower = filters.search.toLowerCase()
    return faculty.filter(
      (f) =>
        f.name?.toLowerCase().includes(searchLower) ||
        f.email?.toLowerCase().includes(searchLower) ||
        f.employeeId?.toLowerCase().includes(searchLower) ||
        f.department?.toLowerCase().includes(searchLower)
    )
  }, [faculty, filters.search])

  const getWorkloadLevel = (duties) => {
    if (duties === 0) return 'low'
    if (duties <= 3) return 'low'
    if (duties <= 6) return 'medium'
    return 'high'
  }

  const stats = useMemo(() => {
    return {
      total: faculty.length,
      totalDuties: faculty.reduce((sum, f) => sum + (f.workload?.totalDuties || 0), 0),
      totalHours: faculty.reduce((sum, f) => sum + (f.workload?.totalHours || 0), 0),
      avgDuties: faculty.length > 0
        ? (faculty.reduce((sum, f) => sum + (f.workload?.totalDuties || 0), 0) / faculty.length).toFixed(1)
        : 0,
    }
  }, [faculty])

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
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box>
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
                  Faculty Management
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Manage and monitor faculty workload and assignments
                </Typography>
              </Box>
              <Tooltip title="Refresh Data">
                <IconButton
                  onClick={fetchFaculty}
                  sx={{
                    bgcolor: alpha('#667eea', 0.1),
                    '&:hover': { bgcolor: alpha('#667eea', 0.2) },
                  }}
                >
                  <RefreshIcon sx={{ color: '#667eea' }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Stats Cards */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
              gap: 3,
              mb: 4,
            }}
          >
            <Grow in timeout={600}>
              <StatsCard>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                        Total Faculty
                      </Typography>
                      <Typography variant="h3" fontWeight={700}>
                        {stats.total}
                      </Typography>
                    </Box>
                    <PersonIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                  </Box>
                </CardContent>
              </StatsCard>
            </Grow>

            <Grow in timeout={700}>
              <StatsCard sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                        Total Duties
                      </Typography>
                      <Typography variant="h3" fontWeight={700}>
                        {stats.totalDuties}
                      </Typography>
                    </Box>
                    <AssignmentIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                  </Box>
                </CardContent>
              </StatsCard>
            </Grow>

            <Grow in timeout={800}>
              <StatsCard sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                        Total Hours
                      </Typography>
                      <Typography variant="h3" fontWeight={700}>
                        {stats.totalHours.toFixed(1)}
                      </Typography>
                    </Box>
                    <TrendingUpIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                  </Box>
                </CardContent>
              </StatsCard>
            </Grow>

            <Grow in timeout={900}>
              <StatsCard sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                        Avg Duties/Faculty
                      </Typography>
                      <Typography variant="h3" fontWeight={700}>
                        {stats.avgDuties}
                      </Typography>
                    </Box>
                    <SchoolIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                  </Box>
                </CardContent>
              </StatsCard>
            </Grow>
          </Box>

          {/* Filters */}
          <Grow in timeout={600}>
            <Card sx={{ mb: 3, borderRadius: 3 }}>
              <CardContent>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr 1fr' },
                    gap: 2,
                  }}
                >
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
                    size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />
                  <FormControl size="small" fullWidth>
                    <InputLabel>Campus</InputLabel>
                    <Select
                      value={filters.campus}
                      label="Campus"
                      onChange={(e) => setFilters({ ...filters, campus: e.target.value })}
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="">All Campuses</MenuItem>
                      <MenuItem value="Main Campus">Main Campus</MenuItem>
                      <MenuItem value="North Campus">North Campus</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl size="small" fullWidth>
                    <InputLabel>Department</InputLabel>
                    <Select
                      value={filters.department}
                      label="Department"
                      onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="">All Departments</MenuItem>
                      <MenuItem value="CSE">CSE</MenuItem>
                      <MenuItem value="ECE">ECE</MenuItem>
                      <MenuItem value="EEE">EEE</MenuItem>
                      <MenuItem value="MECH">MECH</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
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
                        <StyledHeaderCell>Department</StyledHeaderCell>
                        <StyledHeaderCell>Campus</StyledHeaderCell>
                        <StyledHeaderCell align="center">Workload</StyledHeaderCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredFaculty.length === 0 ? (
                        <TableRow>
                          <StyledTableCell colSpan={6} align="center" sx={{ py: 8 }}>
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
                                    bgcolor: alpha('#667eea', 0.1),
                                    color: '#667eea',
                                    fontWeight: 700,
                                  }}
                                >
                                  {f.name?.charAt(0).toUpperCase()}
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" fontWeight={600}>
                                    {f.name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {f.source === 'credentials' ? (
                                      <Chip
                                        label="Login Enabled"
                                        size="small"
                                        sx={{
                                          height: 18,
                                          fontSize: '0.65rem',
                                          bgcolor: alpha('#10b981', 0.1),
                                          color: '#10b981',
                                        }}
                                      />
                                    ) : (
                                      <Chip
                                        label="Allocation Only"
                                        size="small"
                                        sx={{
                                          height: 18,
                                          fontSize: '0.65rem',
                                          bgcolor: alpha('#6b7280', 0.1),
                                          color: '#6b7280',
                                        }}
                                      />
                                    )}
                                  </Typography>
                                </Box>
                              </Box>
                            </StyledTableCell>
                            <StyledTableCell>
                              <Box>
                                <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
                                  <EmailIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                  <Typography variant="body2">{f.email}</Typography>
                                </Box>
                                {f.phone && (
                                  <Typography variant="caption" color="text.secondary">
                                    {f.phone}
                                  </Typography>
                                )}
                              </Box>
                            </StyledTableCell>
                            <StyledTableCell>
                              <Typography variant="body2" fontFamily="monospace" fontWeight={600}>
                                {f.employeeId || '-'}
                              </Typography>
                            </StyledTableCell>
                            <StyledTableCell>
                              <Box display="flex" alignItems="center" gap={0.5}>
                                <SchoolIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                <Typography variant="body2">{f.department || '-'}</Typography>
                              </Box>
                            </StyledTableCell>
                            <StyledTableCell>
                              <Box display="flex" alignItems="center" gap={0.5}>
                                <BusinessIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                <Typography variant="body2">{f.campus}</Typography>
                              </Box>
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

export default AdminFaculty
