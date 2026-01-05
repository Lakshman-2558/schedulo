import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    Alert,
    CircularProgress,
    Container,
    Stepper,
    Step,
    StepLabel,
} from '@mui/material'
import {
    LockReset as LockResetIcon,
    ArrowBack as ArrowBackIcon,
    Send as SendIcon,
    VpnKey as VpnKeyIcon,
    Lock as LockIcon,
    CheckCircle as CheckCircleIcon,
} from '@mui/icons-material'
import api from '../utils/api'
import toast from 'react-hot-toast'

const ForgotPassword = () => {
    const navigate = useNavigate()
    const [activeStep, setActiveStep] = useState(0)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [maskedEmail, setMaskedEmail] = useState('')
    const [timeLeft, setTimeLeft] = useState(0)
    const [otpVerified, setOtpVerified] = useState(false)

    const [formData, setFormData] = useState({
        employeeId: '',
        otp: ['', '', '', '', '', ''],
        newPassword: '',
        confirmPassword: '',
    })

    // Refs for OTP inputs
    const otpRefs = useRef([])

    const steps = ['Enter Employee ID', 'Verify OTP', 'Create New Password']

    // Timer effect
    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => {
                setTimeLeft(timeLeft - 1)
            }, 1000)
            return () => clearTimeout(timer)
        }
    }, [timeLeft])

    // Format time as MM:SS
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
        setError('')
    }

    // Handle OTP input change
    const handleOtpChange = (index, value) => {
        // Only allow digits
        if (!/^\d*$/.test(value)) return

        const newOtp = [...formData.otp]
        newOtp[index] = value.slice(-1) // Only take last character

        setFormData({
            ...formData,
            otp: newOtp,
        })
        setError('')

        // Auto-focus next input
        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus()
        }
    }

    // Handle OTP backspace
    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !formData.otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus()
        }
    }

    // Handle OTP paste
    const handleOtpPaste = (e) => {
        e.preventDefault()
        const pastedData = e.clipboardData.getData('text').slice(0, 6)
        if (!/^\d+$/.test(pastedData)) return

        const newOtp = pastedData.split('').concat(Array(6).fill('')).slice(0, 6)
        setFormData({
            ...formData,
            otp: newOtp,
        })

        // Focus last filled input or next empty
        const nextIndex = Math.min(pastedData.length, 5)
        otpRefs.current[nextIndex]?.focus()
    }

    // Step 1: Request OTP
    const handleRequestOTP = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const response = await api.post('/auth/forgot-password', {
                employeeId: formData.employeeId,
            })

            if (response.data.success) {
                setMaskedEmail(response.data.email || '')
                setTimeLeft(300) // 5 minutes = 300 seconds
                setActiveStep(1)
                toast.success('OTP sent to your email!')
                // Auto-focus first OTP input
                setTimeout(() => otpRefs.current[0]?.focus(), 100)
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to send OTP. Please try again.'
            setError(errorMessage)
            toast.error(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    // Step 2: Verify OTP
    const handleVerifyOTP = async (e) => {
        e.preventDefault()
        setError('')

        const otpString = formData.otp.join('')
        if (otpString.length !== 6) {
            setError('Please enter complete 6-digit OTP')
            return
        }

        if (timeLeft === 0) {
            setError('OTP has expired. Please request a new one.')
            return
        }

        setLoading(true)

        try {
            // Use verify-otp-only endpoint to just validate OTP without resetting password
            const response = await api.post('/auth/verify-otp-only', {
                employeeId: formData.employeeId,
                otp: otpString,
            })

            if (response.data.success) {
                setOtpVerified(true)
                setActiveStep(2)
                toast.success('OTP verified successfully!')
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Invalid OTP. Please try again.'
            setError(errorMessage)
            toast.error(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    // Step 3: Reset Password
    const handleResetPassword = async (e) => {
        e.preventDefault()
        setError('')

        // Validate passwords match
        if (formData.newPassword !== formData.confirmPassword) {
            setError('Passwords do not match')
            return
        }

        // Validate password length
        if (formData.newPassword.length < 8) {
            setError('Password must be at least 8 characters long')
            return
        }

        setLoading(true)

        try {
            const otpString = formData.otp.join('')
            const response = await api.post('/auth/verify-otp', {
                employeeId: formData.employeeId,
                otp: otpString,
                newPassword: formData.newPassword,
            })

            if (response.data.success) {
                toast.success('Password reset successfully!')
                setTimeout(() => {
                    navigate('/login')
                }, 1500)
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to reset password. Please try again.'
            setError(errorMessage)
            toast.error(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: 2,
            }}
        >
            <Container maxWidth="sm">
                <Card
                    sx={{
                        borderRadius: 4,
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                        overflow: 'hidden',
                    }}
                >
                    {/* Header */}
                    <Box
                        sx={{
                            background: 'linear-gradient(135deg, #1a56db 0%, #6366f1 100%)',
                            padding: 4,
                            textAlign: 'center',
                            color: 'white',
                        }}
                    >
                        <LockResetIcon sx={{ fontSize: 60, mb: 2 }} />
                        <Typography variant="h4" fontWeight={700} gutterBottom>
                            Reset Password
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            Follow the steps to reset your password
                        </Typography>
                    </Box>

                    <CardContent sx={{ p: 4 }}>
                        {/* Stepper */}
                        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                            {steps.map((label) => (
                                <Step key={label}>
                                    <StepLabel>{label}</StepLabel>
                                </Step>
                            ))}
                        </Stepper>

                        {error && (
                            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                                {error}
                            </Alert>
                        )}

                        {/* Step 1: Enter Employee ID */}
                        {activeStep === 0 && (
                            <form onSubmit={handleRequestOTP}>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                    Enter your Employee ID to receive an OTP at your registered email address.
                                </Typography>

                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="body2" fontWeight={600} gutterBottom>
                                        Employee ID
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        name="employeeId"
                                        placeholder="Enter your employee ID"
                                        value={formData.employeeId}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                        autoFocus
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                            },
                                        }}
                                    />
                                </Box>

                                <Button
                                    type="submit"
                                    variant="contained"
                                    fullWidth
                                    disabled={loading}
                                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                                    sx={{
                                        py: 1.5,
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        fontSize: '1rem',
                                        borderRadius: 2,
                                        background: 'linear-gradient(135deg, #1a56db 0%, #6366f1 100%)',
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #1e40af 0%, #4f46e5 100%)',
                                        },
                                    }}
                                >
                                    {loading ? 'Sending OTP...' : 'Send OTP'}
                                </Button>

                                <Box sx={{ mt: 3, textAlign: 'center' }}>
                                    <Button
                                        component={Link}
                                        to="/login"
                                        startIcon={<ArrowBackIcon />}
                                        sx={{
                                            textTransform: 'none',
                                            fontWeight: 600,
                                            color: 'primary.main',
                                        }}
                                    >
                                        Back to Login
                                    </Button>
                                </Box>
                            </form>
                        )}

                        {/* Step 2: Enter OTP */}
                        {activeStep === 1 && (
                            <form onSubmit={handleVerifyOTP}>
                                {maskedEmail && (
                                    <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                                        <Typography variant="body2">
                                            OTP has been sent to <strong>{maskedEmail}</strong>
                                        </Typography>
                                    </Alert>
                                )}

                                {/* Timer */}
                                <Box
                                    sx={{
                                        textAlign: 'center',
                                        mb: 3,
                                        p: 2,
                                        borderRadius: 2,
                                        background: timeLeft < 60 ? 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)' : 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                                    }}
                                >
                                    <Typography variant="h4" fontWeight={700} color={timeLeft < 60 ? 'error.main' : 'primary.main'}>
                                        {formatTime(timeLeft)}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Time remaining
                                    </Typography>
                                </Box>

                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="body2" fontWeight={600} gutterBottom textAlign="center">
                                        Enter 6-Digit OTP
                                    </Typography>

                                    {/* OTP Input Boxes */}
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            gap: 1.5,
                                            justifyContent: 'center',
                                            mt: 2,
                                        }}
                                    >
                                        {formData.otp.map((digit, index) => (
                                            <TextField
                                                key={index}
                                                inputRef={(el) => (otpRefs.current[index] = el)}
                                                value={digit}
                                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                                onPaste={index === 0 ? handleOtpPaste : undefined}
                                                disabled={loading}
                                                inputProps={{
                                                    maxLength: 1,
                                                    style: {
                                                        textAlign: 'center',
                                                        fontSize: '24px',
                                                        fontWeight: 700,
                                                        padding: '16px 0',
                                                    },
                                                }}
                                                sx={{
                                                    width: '50px',
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: 2,
                                                        '&.Mui-focused': {
                                                            '& fieldset': {
                                                                borderWidth: 2,
                                                                borderColor: 'primary.main',
                                                            },
                                                        },
                                                    },
                                                }}
                                            />
                                        ))}
                                    </Box>
                                </Box>

                                <Button
                                    type="submit"
                                    variant="contained"
                                    fullWidth
                                    disabled={loading || timeLeft === 0}
                                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <VpnKeyIcon />}
                                    sx={{
                                        py: 1.5,
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        fontSize: '1rem',
                                        borderRadius: 2,
                                        background: 'linear-gradient(135deg, #1a56db 0%, #6366f1 100%)',
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #1e40af 0%, #4f46e5 100%)',
                                        },
                                    }}
                                >
                                    {loading ? 'Verifying...' : 'Verify OTP'}
                                </Button>

                                <Box sx={{ mt: 3, textAlign: 'center' }}>
                                    <Button
                                        onClick={() => {
                                            setActiveStep(0)
                                            setFormData({ ...formData, otp: ['', '', '', '', '', ''] })
                                            setTimeLeft(0)
                                        }}
                                        startIcon={<ArrowBackIcon />}
                                        disabled={loading}
                                        sx={{
                                            textTransform: 'none',
                                            fontWeight: 600,
                                            color: 'primary.main',
                                        }}
                                    >
                                        Request New OTP
                                    </Button>
                                </Box>
                            </form>
                        )}

                        {/* Step 3: Create New Password */}
                        {activeStep === 2 && (
                            <form onSubmit={handleResetPassword}>
                                <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 3, borderRadius: 2 }}>
                                    <Typography variant="body2" fontWeight={600}>
                                        OTP Verified Successfully!
                                    </Typography>
                                    <Typography variant="caption">
                                        Now create your new password
                                    </Typography>
                                </Alert>

                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="body2" fontWeight={600} gutterBottom>
                                        New Password
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        name="newPassword"
                                        type="password"
                                        placeholder="Enter new password (min 8 characters)"
                                        value={formData.newPassword}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                        autoFocus
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                            },
                                        }}
                                    />
                                </Box>

                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="body2" fontWeight={600} gutterBottom>
                                        Confirm New Password
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        name="confirmPassword"
                                        type="password"
                                        placeholder="Re-enter new password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                            },
                                        }}
                                    />
                                </Box>

                                <Button
                                    type="submit"
                                    variant="contained"
                                    fullWidth
                                    disabled={loading}
                                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LockIcon />}
                                    sx={{
                                        py: 1.5,
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        fontSize: '1rem',
                                        borderRadius: 2,
                                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                                        },
                                    }}
                                >
                                    {loading ? 'Resetting Password...' : 'Reset Password'}
                                </Button>
                            </form>
                        )}

                        {/* Info Alert */}
                        {activeStep === 0 && (
                            <Alert severity="info" sx={{ mt: 3, borderRadius: 2 }}>
                                <Typography variant="caption" display="block">
                                    <strong>Note:</strong> The OTP will be sent to the email address registered with your Employee ID.
                                </Typography>
                            </Alert>
                        )}
                    </CardContent>
                </Card>
            </Container>
        </Box>
    )
}

export default ForgotPassword
