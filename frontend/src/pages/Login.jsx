import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  InputAdornment,
  CircularProgress,
  Container,
  Fade,
  Slide,
  Grow,
} from '@mui/material'
import {
  Person as PersonIcon,
  Lock as LockIcon,
  Login as LoginIcon,
} from '@mui/icons-material'
import { styled, keyframes } from '@mui/material/styles'

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
`

const StyledBackground = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  overflow: 'hidden',
  background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 50%, #f0f9ff 100%)',
  '&::before': {
    content: '""',
    position: 'absolute',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, rgba(26, 86, 219, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)',
    top: '-250px',
    right: '-250px',
    animation: `${float} 6s ease-in-out infinite`,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
    bottom: '-200px',
    left: '-200px',
    animation: `${float} 8s ease-in-out infinite 2s`,
  },
}))

const LogoContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginBottom: theme.spacing(4),
}))

const LogoIcon = styled(Box)(({ theme }) => ({
  width: 80,
  height: 80,
  borderRadius: 20,
  background: 'linear-gradient(135deg, #1a56db 0%, #6366f1 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  fontWeight: 700,
  fontSize: '2.5rem',
  boxShadow: '0 8px 24px rgba(26, 86, 219, 0.4)',
  marginBottom: theme.spacing(2),
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'scale(1.1) rotate(5deg)',
  },
}))

const StyledCard = styled(Card)(({ theme }) => ({
  maxWidth: 450,
  width: '100%',
  borderRadius: 24,
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.5)',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 25px 70px rgba(0, 0, 0, 0.2)',
    transform: 'translateY(-4px)',
  },
}))

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 1)',
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.light,
        borderWidth: 2,
      },
    },
    '&.Mui-focused': {
      backgroundColor: 'rgba(255, 255, 255, 1)',
      '& .MuiOutlinedInput-notchedOutline': {
        borderWidth: 2,
      },
    },
  },
}))

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  padding: theme.spacing(1.5, 4),
  fontSize: '1rem',
  fontWeight: 600,
  textTransform: 'none',
  background: 'linear-gradient(135deg, #1a56db 0%, #1e40af 100%)',
  boxShadow: '0 4px 14px rgba(26, 86, 219, 0.4)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    background: 'linear-gradient(135deg, #2563eb 0%, #1a56db 100%)',
    boxShadow: '0 6px 20px rgba(26, 86, 219, 0.5)',
    transform: 'translateY(-2px)',
  },
  '&:active': {
    transform: 'translateY(0px)',
  },
  '&:disabled': {
    background: 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)',
    boxShadow: 'none',
  },
}))

const Login = () => {
  const [employeeId, setEmployeeId] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [loginType, setLoginType] = useState('admin') // 'admin' or 'faculty'
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const result = await login(employeeId, password)

    if (result.success) {
      if (result.user.role === 'admin') {
        navigate('/admin')
      } else if (result.user.role === 'hod') {
        navigate('/hod')
      } else {
        navigate('/faculty')
      }
    }

    setLoading(false)
  }

  return (
    <StyledBackground>
      <Container maxWidth="sm" sx={{
        position: 'relative',
        zIndex: 1,
        py: 4,
        display: 'flex',
        justifyContent: 'center',
      }}>
        <Fade in timeout={800}>
          <Box sx={{ width: '100%' }}>
            <Slide direction="down" in timeout={600}>
              <LogoContainer>
                <Grow in timeout={1000}>
                  <Box
                    component="img"
                    src="/schedulo-logo.png"
                    alt="Schedulo Logo"
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: 3,
                      objectFit: 'cover',
                      boxShadow: '0 8px 24px rgba(26, 86, 219, 0.4)',
                      marginBottom: 2,
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.1) rotate(5deg)',
                      },
                    }}
                  />
                </Grow>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #1a56db 0%, #6366f1 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    mb: 1,
                  }}
                >
                  Schedulo
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Smart Campus Automation & Scheduling
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 4,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #1a56db 0%, #6366f1 100%)',
                    }}
                  />
                  <Box
                    sx={{
                      width: 8,
                      height: 4,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #6366f1 0%, #1a56db 100%)',
                    }}
                  />
                  <Box
                    sx={{
                      width: 48,
                      height: 4,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #6366f1 0%, #1a56db 100%)',
                    }}
                  />
                </Box>
              </LogoContainer>
            </Slide>

            <Grow in timeout={1000} style={{ transitionDelay: '200ms' }}>
              <Box sx={{ maxWidth: 450, width: '100%', mx: 'auto' }}>
                {/* Visual Tab Header */}
                <Box sx={{
                  display: 'flex',
                  gap: 1.5,
                  mb: 2.5,
                  p: 0.75,
                  borderRadius: 4,
                  background: 'rgba(255, 255, 255, 0.6)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                }}>
                  <Box
                    onClick={() => setLoginType('admin')}
                    sx={{
                      flex: 1,
                      py: 1.25,
                      textAlign: 'center',
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: '0.925rem',
                      borderRadius: 3,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      color: loginType === 'admin' ? '#1a56db' : '#64748b',
                      background: loginType === 'admin' ? 'white' : 'transparent',
                      boxShadow: loginType === 'admin' ? '0 2px 8px rgba(26, 86, 219, 0.15)' : 'none',
                      '&:hover': {
                        color: loginType === 'admin' ? '#1a56db' : '#1e293b',
                        background: loginType === 'admin' ? 'white' : 'rgba(255, 255, 255, 0.5)',
                      },
                    }}
                  >
                    Admin / HOD
                  </Box>
                  <Box
                    onClick={() => setLoginType('faculty')}
                    sx={{
                      flex: 1,
                      py: 1.25,
                      textAlign: 'center',
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: '0.925rem',
                      borderRadius: 3,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      color: loginType === 'faculty' ? '#6366f1' : '#64748b',
                      background: loginType === 'faculty' ? 'white' : 'transparent',
                      boxShadow: loginType === 'faculty' ? '0 2px 8px rgba(99, 102, 241, 0.15)' : 'none',
                      '&:hover': {
                        color: loginType === 'faculty' ? '#6366f1' : '#1e293b',
                        background: loginType === 'faculty' ? 'white' : 'rgba(255, 255, 255, 0.5)',
                      },
                    }}
                  >
                    Faculty
                  </Box>
                </Box>

                <StyledCard>
                  <CardContent sx={{ p: 4, pt: 5 }}>
                    <Typography variant="h4" fontWeight={800} gutterBottom sx={{ color: '#1e293b', letterSpacing: '-0.02em' }}>
                      Welcome Back
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 4, color: '#64748b', fontWeight: 500 }}>
                      Sign in to continue to your dashboard
                    </Typography>

                    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                      <StyledTextField
                        fullWidth
                        label="Employee ID"
                        variant="outlined"
                        value={employeeId}
                        onChange={(e) => setEmployeeId(e.target.value)}
                        required
                        autoComplete="username"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonIcon sx={{ color: '#94a3b8' }} />
                            </InputAdornment>
                          ),
                        }}
                      />

                      <StyledTextField
                        fullWidth
                        label="Password"
                        type="password"
                        variant="outlined"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LockIcon sx={{ color: '#94a3b8' }} />
                            </InputAdornment>
                          ),
                        }}
                      />

                      <StyledButton
                        type="submit"
                        variant="contained"
                        fullWidth
                        size="large"
                        disabled={loading}
                        sx={{ mt: 1 }}
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
                      >
                        {loading ? 'Signing in...' : 'Sign In'}
                      </StyledButton>

                      {loginType === 'faculty' && (
                        <Box sx={{ textAlign: 'center', mt: 2 }}>
                          <Button
                            component="a"
                            href="/forgot-password"
                            sx={{
                              textTransform: 'none',
                              fontWeight: 600,
                              color: 'primary.main',
                              '&:hover': {
                                backgroundColor: 'rgba(26, 86, 219, 0.04)',
                              },
                            }}
                          >
                            Forgot Password?
                          </Button>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </StyledCard>
              </Box>
            </Grow>
          </Box>
        </Fade>
      </Container>
    </StyledBackground>
  )
}

export default Login
