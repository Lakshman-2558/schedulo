import React, { useState } from 'react'
import Layout from '../../components/Layout'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import {
    Box,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    CircularProgress,
    IconButton,
    Fade,
    Grow,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    alpha,
    Alert,
} from '@mui/material'
import {
    Upload as UploadIcon,
    Description as FileTextIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    CheckCircle as CheckIcon,
    Cancel as CancelIcon,
    CloudUpload as CloudUploadIcon,
    PersonAdd as PersonAddIcon,
} from '@mui/icons-material'
import { styled } from '@mui/material/styles'

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
    padding: theme.spacing(1.5),
    fontSize: '0.875rem',
}))

const StyledHeaderCell = styled(TableCell)(({ theme }) => ({
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important',
    color: 'white !important',
    fontWeight: '700 !important',
    fontSize: '0.875rem !important',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: 'none !important',
    padding: `${theme.spacing(1.5)} !important`,
}))

const StyledTableRow = styled(TableRow, {
    shouldForwardProp: (prop) => prop !== 'error',
})(({ theme, error }) => ({
    transition: 'background-color 0.2s ease',
    backgroundColor: error ? alpha(theme.palette.error.main, 0.05) : 'transparent',
    '&:hover': {
        backgroundColor: error ? alpha(theme.palette.error.main, 0.1) : alpha(theme.palette.primary.main, 0.04),
    },
    '&:last-child td': {
        borderBottom: 'none',
    },
}))

const AdminFacultyCredentials = () => {
    const [uploading, setUploading] = useState(false)
    const [previewData, setPreviewData] = useState(null)
    const [editingRow, setEditingRow] = useState(null)
    const [confirmDialog, setConfirmDialog] = useState({ open: false, message: '', onConfirm: null })
    const [duplicates, setDuplicates] = useState([])
    const [existingFaculty, setExistingFaculty] = useState([])
    const [loadingFaculty, setLoadingFaculty] = useState(false)
    const [resetting, setResetting] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    const handleFileSelect = async (file) => {
        if (!file) return

        try {
            toast.loading('Parsing file...', { id: 'preview-loading' })

            const formData = new FormData()
            formData.append('file', file)

            const response = await api.post('/upload/faculty-credentials/preview', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })

            toast.dismiss('preview-loading')

            if (response.data.success && response.data.data) {
                const editableData =
                    response.data.data.previewData?.map((item, index) => {
                        const row = item.parsedData || item.rawData || {}
                        const flatRow = {}
                        Object.keys(row).forEach((key) => {
                            if (typeof row[key] === 'object' && row[key] !== null && !Array.isArray(row[key])) {
                                Object.keys(row[key]).forEach((nestedKey) => {
                                    flatRow[nestedKey] = row[key][nestedKey]
                                })
                            } else {
                                flatRow[key] = row[key]
                            }
                        })
                        return {
                            ...flatRow,
                            _rowIndex: index,
                            _isValid: item.isValid !== false,
                            _errors: item.errors || [],
                            _warnings: item.warnings || [],
                        }
                    }) || []

                setPreviewData({
                    file,
                    data: editableData,
                    originalData: JSON.parse(JSON.stringify(editableData)),
                })
                toast.success(
                    `Preview: ${response.data.data.validRows || editableData.length} valid, ${response.data.data.invalidRows || 0} invalid rows`
                )
            } else {
                toast.error('Failed to parse file')
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error parsing file')
            console.error('Preview error:', error)
        }
    }

    const handleEdit = (index) => {
        setEditingRow(index)
    }

    const handleSaveEdit = (index, updatedRow) => {
        setPreviewData((prev) => {
            const updated = [...prev.data]
            updated[index] = { ...updated[index], ...updatedRow }
            return { ...prev, data: updated }
        })
        setEditingRow(null)
        toast.success('Row updated')
    }

    const handleDelete = (index) => {
        setConfirmDialog({
            open: true,
            message: 'Are you sure you want to delete this row?',
            onConfirm: () => {
                setPreviewData((prev) => {
                    const updated = prev.data.filter((_, i) => i !== index)
                    return { ...prev, data: updated }
                })
                setConfirmDialog({ open: false, message: '', onConfirm: null })
                toast.success('Row deleted')
            },
        })
    }

    const fetchExistingFaculty = async () => {
        setLoadingFaculty(true)
        try {
            const response = await api.get('/admin/faculty-credentials')
            if (response.data.success) {
                setExistingFaculty(response.data.data)
            }
        } catch (error) {
            console.error('Error fetching faculty:', error)
        } finally {
            setLoadingFaculty(false)
        }
    }

    const handleSave = async () => {
        if (!previewData || previewData.data.length === 0) {
            toast.error('No data to save')
            return
        }

        const validData = previewData.data.filter((row) => row._isValid !== false)
        if (validData.length === 0) {
            toast.error('No valid rows to save')
            return
        }

        setUploading(true)

        try {
            const formData = new FormData()
            formData.append('file', previewData.file)

            const response = await api.post('/upload/faculty-credentials', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })

            // Check for duplicates in response
            if (response.data.data?.duplicates && response.data.data.duplicates.length > 0) {
                setDuplicates(response.data.data.duplicates)
                toast.warning(`Upload completed with ${response.data.data.duplicates.length} duplicate(s)`)
            } else {
                toast.success(response.data.message)
                setDuplicates([])
            }

            setPreviewData(null)
            setEditingRow(null)
            fetchExistingFaculty() // Refresh the list
        } catch (error) {
            toast.error(error.response?.data?.message || 'Save failed')
            console.error('Save error:', error)
        } finally {
            setUploading(false)
        }
    }

    const handleResetPassword = async (facultyId = null, resetAll = false) => {
        setResetting(true)
        try {
            const response = await api.post('/admin/faculty-credentials/reset-password', {
                facultyId,
                resetAll
            })

            if (response.data.success) {
                toast.success(response.data.message)
                fetchExistingFaculty()
            } else {
                toast.error(response.data.message)
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Reset failed')
        } finally {
            setResetting(false)
        }
    }

    const handleCancelPreview = () => {
        setPreviewData(null)
        setEditingRow(null)
    }

    const headers = ['name', 'email', 'employeeId', 'campus', 'department', 'phone']

    // Load existing faculty on mount
    React.useEffect(() => {
        fetchExistingFaculty()
    }, [])

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
                            Faculty Credentials Management
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Create login accounts for faculty members with auto-generated passwords
                        </Typography>
                    </Box>

                    {/* Info Alert */}
                    <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                        <Typography variant="body2" fontWeight={600} gutterBottom>
                            📌 One-Time Setup
                        </Typography>
                        <Typography variant="body2">
                            Upload a CSV/Excel file containing faculty details to create login accounts. Each faculty member will receive an email with their login credentials and a randomly generated password.
                        </Typography>
                    </Alert>

                    {/* Upload Card */}
                    <Grow in timeout={600}>
                        <Card sx={{ mb: 3, borderRadius: 3, overflow: 'hidden' }}>
                            <CardContent sx={{ p: 3 }}>
                                <Box display="flex" alignItems="flex-start" gap={2} mb={3}>
                                    <Box
                                        sx={{
                                            p: 1.5,
                                            bgcolor: alpha('#1a56db', 0.1),
                                            borderRadius: 2,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            minWidth: 56,
                                            height: 56,
                                        }}
                                    >
                                        <PersonAddIcon sx={{ color: 'primary.main', fontSize: 28 }} />
                                    </Box>
                                    <Box flex={1}>
                                        <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
                                            Upload Faculty Credentials
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            Upload CSV or Excel file containing faculty information to create login accounts
                                        </Typography>

                                        {previewData && (
                                            <Box
                                                sx={{
                                                    bgcolor: alpha('#06b6d4', 0.1),
                                                    p: 1.5,
                                                    borderRadius: 2,
                                                    mb: 2,
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <Typography variant="body2" fontWeight={600}>
                                                    {previewData.data.length} row(s) loaded
                                                </Typography>
                                                <Box display="flex" gap={1}>
                                                    <Button
                                                        size="small"
                                                        onClick={handleCancelPreview}
                                                        sx={{ textTransform: 'none', fontWeight: 600 }}
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        variant="contained"
                                                        color="success"
                                                        onClick={handleSave}
                                                        disabled={uploading}
                                                        sx={{ textTransform: 'none', fontWeight: 600 }}
                                                    >
                                                        {uploading ? 'Saving...' : 'Save All'}
                                                    </Button>
                                                </Box>
                                            </Box>
                                        )}

                                        <input
                                            type="file"
                                            accept=".csv,.xlsx,.xls"
                                            onChange={(e) => {
                                                const file = e.target.files[0]
                                                if (file) handleFileSelect(file)
                                                e.target.value = ''
                                            }}
                                            style={{ display: 'none' }}
                                            id="upload-faculty-credentials"
                                            disabled={uploading}
                                        />
                                        <label htmlFor="upload-faculty-credentials">
                                            <Button
                                                variant="contained"
                                                component="span"
                                                startIcon={<CloudUploadIcon />}
                                                disabled={uploading}
                                                sx={{ textTransform: 'none', fontWeight: 600, py: 1 }}
                                            >
                                                Choose File
                                            </Button>
                                        </label>
                                    </Box>
                                </Box>

                                <Box
                                    sx={{
                                        bgcolor: alpha('#f59e0b', 0.05),
                                        border: `1px solid ${alpha('#f59e0b', 0.2)}`,
                                        borderRadius: 2,
                                        p: 2,
                                    }}
                                >
                                    <Typography variant="body2" fontWeight={600} color="text.primary" gutterBottom>
                                        Required Fields:
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" component="div">
                                        name, email, employeeId, campus, department
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                        Optional: phone
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grow>

                    {/* Preview Table */}
                    {previewData && (
                        <Grow in timeout={600}>
                            <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
                                <CardContent>
                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                        <Typography variant="h6" fontWeight={700}>
                                            Preview Faculty Credentials
                                        </Typography>
                                        <Box display="flex" gap={1}>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={handleCancelPreview}
                                                sx={{ textTransform: 'none', fontWeight: 600 }}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                variant="contained"
                                                size="small"
                                                onClick={handleSave}
                                                disabled={uploading}
                                                sx={{ textTransform: 'none', fontWeight: 600 }}
                                            >
                                                {uploading ? 'Saving...' : 'Save All'}
                                            </Button>
                                        </Box>
                                    </Box>
                                    <TableContainer>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <StyledHeaderCell>Actions</StyledHeaderCell>
                                                    {headers.map((header) => (
                                                        <StyledHeaderCell key={header}>{header}</StyledHeaderCell>
                                                    ))}
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {previewData.data.map((row, index) => {
                                                    const isRowEditing = editingRow === index

                                                    return (
                                                        <StyledTableRow key={index} error={row._isValid === false}>
                                                            <StyledTableCell>
                                                                {isRowEditing ? (
                                                                    <Box display="flex" gap={0.5}>
                                                                        <IconButton
                                                                            size="small"
                                                                            color="success"
                                                                            onClick={() => {
                                                                                const updated = {}
                                                                                headers.forEach((header) => {
                                                                                    const input = document.getElementById(`faculty-credentials-${index}-${header}`)
                                                                                    if (input) updated[header] = input.value
                                                                                })
                                                                                handleSaveEdit(index, updated)
                                                                            }}
                                                                        >
                                                                            <CheckIcon fontSize="small" />
                                                                        </IconButton>
                                                                        <IconButton
                                                                            size="small"
                                                                            color="error"
                                                                            onClick={() => setEditingRow(null)}
                                                                        >
                                                                            <CancelIcon fontSize="small" />
                                                                        </IconButton>
                                                                    </Box>
                                                                ) : (
                                                                    <Box display="flex" gap={0.5}>
                                                                        <IconButton
                                                                            size="small"
                                                                            color="primary"
                                                                            onClick={() => handleEdit(index)}
                                                                        >
                                                                            <EditIcon fontSize="small" />
                                                                        </IconButton>
                                                                        <IconButton
                                                                            size="small"
                                                                            color="error"
                                                                            onClick={() => handleDelete(index)}
                                                                        >
                                                                            <DeleteIcon fontSize="small" />
                                                                        </IconButton>
                                                                    </Box>
                                                                )}
                                                            </StyledTableCell>
                                                            {headers.map((header) => {
                                                                const value = row[header]
                                                                const displayValue = value !== null && value !== undefined ? String(value) : '-'
                                                                return (
                                                                    <StyledTableCell key={header}>
                                                                        {isRowEditing ? (
                                                                            <TextField
                                                                                id={`faculty-credentials-${index}-${header}`}
                                                                                defaultValue={displayValue}
                                                                                size="small"
                                                                                fullWidth
                                                                                sx={{ '& .MuiOutlinedInput-root': { fontSize: '0.875rem' } }}
                                                                            />
                                                                        ) : (
                                                                            <Typography
                                                                                variant="body2"
                                                                                color={row._isValid === false ? 'error' : 'text.primary'}
                                                                            >
                                                                                {displayValue}
                                                                                {row._errors && row._errors.length > 0 && (
                                                                                    <Typography component="span" color="error.main" title={row._errors.join(', ')}>
                                                                                        {' '}
                                                                                        ⚠
                                                                                    </Typography>
                                                                                )}
                                                                            </Typography>
                                                                        )}
                                                                    </StyledTableCell>
                                                                )
                                                            })}
                                                        </StyledTableRow>
                                                    )
                                                })}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </CardContent>
                            </Card>
                        </Grow>
                    )}

                    {/* Duplicates Display */}
                    {duplicates.length > 0 && (
                        <Grow in timeout={600}>
                            <Card sx={{ mb: 3, borderRadius: 3, overflow: 'hidden', border: '2px solid', borderColor: 'warning.main' }}>
                                <CardContent>
                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                        <Typography variant="h6" fontWeight={700} color="warning.main">
                                            ⚠️ Duplicate Entries Found ({duplicates.length})
                                        </Typography>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={() => setDuplicates([])}
                                            sx={{ textTransform: 'none', fontWeight: 600 }}
                                        >
                                            Dismiss
                                        </Button>
                                    </Box>
                                    <Alert severity="warning" sx={{ mb: 2 }}>
                                        The following entries already exist in the database. You can reset their passwords using the "Reset Password" button below.
                                    </Alert>
                                    <TableContainer>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <StyledHeaderCell>Row</StyledHeaderCell>
                                                    <StyledHeaderCell>Reason</StyledHeaderCell>
                                                    <StyledHeaderCell>Uploaded Data</StyledHeaderCell>
                                                    <StyledHeaderCell>Existing Data</StyledHeaderCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {duplicates.map((dup, index) => (
                                                    <StyledTableRow key={index}>
                                                        <StyledTableCell>{dup.rowIndex}</StyledTableCell>
                                                        <StyledTableCell>
                                                            <Typography variant="body2" color="warning.main" fontWeight={600}>
                                                                {dup.reason === 'email' ? 'Duplicate Email' : 'Duplicate Employee ID'}
                                                            </Typography>
                                                        </StyledTableCell>
                                                        <StyledTableCell>
                                                            <Box>
                                                                <Typography variant="body2" fontWeight={600}>{dup.uploadData.name}</Typography>
                                                                <Typography variant="caption" color="text.secondary">{dup.uploadData.email}</Typography>
                                                                <Typography variant="caption" display="block" color="text.secondary">
                                                                    ID: {dup.uploadData.employeeId} | {dup.uploadData.department} | {dup.uploadData.campus}
                                                                </Typography>
                                                            </Box>
                                                        </StyledTableCell>
                                                        <StyledTableCell>
                                                            <Box>
                                                                <Typography variant="body2" fontWeight={600}>{dup.existingData.name}</Typography>
                                                                <Typography variant="caption" color="text.secondary">{dup.existingData.email}</Typography>
                                                                <Typography variant="caption" display="block" color="text.secondary">
                                                                    ID: {dup.existingData.employeeId} | {dup.existingData.department} | {dup.existingData.campus}
                                                                </Typography>
                                                            </Box>
                                                        </StyledTableCell>
                                                    </StyledTableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </CardContent>
                            </Card>
                        </Grow>
                    )}

                    {/* Existing Faculty Management */}
                    <Grow in timeout={800}>
                        <Card sx={{ mb: 3, borderRadius: 3, overflow: 'hidden' }}>
                            <CardContent>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                    <Typography variant="h6" fontWeight={700}>
                                        Existing Faculty Credentials ({existingFaculty.filter(faculty => {
                                            const query = searchQuery.toLowerCase()
                                            return faculty.name.toLowerCase().includes(query) ||
                                                faculty.email.toLowerCase().includes(query) ||
                                                faculty.employeeId.toLowerCase().includes(query)
                                        }).length}{searchQuery ? ` of ${existingFaculty.length}` : ''})
                                    </Typography>
                                    <Box display="flex" gap={1}>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={fetchExistingFaculty}
                                            disabled={loadingFaculty}
                                            sx={{ textTransform: 'none', fontWeight: 600 }}
                                        >
                                            {loadingFaculty ? 'Loading...' : 'Refresh'}
                                        </Button>
                                        <Button
                                            variant="contained"
                                            size="small"
                                            color="warning"
                                            onClick={() => {
                                                setConfirmDialog({
                                                    open: true,
                                                    message: 'Are you sure you want to reset passwords for ALL faculty members? New credentials will be sent to their emails.',
                                                    onConfirm: () => {
                                                        handleResetPassword(null, true)
                                                        setConfirmDialog({ open: false, message: '', onConfirm: null })
                                                    }
                                                })
                                            }}
                                            disabled={resetting || existingFaculty.length === 0}
                                            sx={{ textTransform: 'none', fontWeight: 600 }}
                                        >
                                            {resetting ? 'Resetting...' : 'Reset All Passwords'}
                                        </Button>
                                    </Box>
                                </Box>

                                {/* Search Bar */}
                                <Box mb={2}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        placeholder="Search by name, email, or employee ID..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                                bgcolor: alpha('#f3f4f6', 0.5)
                                            }
                                        }}
                                        InputProps={{
                                            startAdornment: (
                                                <Box sx={{ mr: 1, display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                                                    🔍
                                                </Box>
                                            )
                                        }}
                                    />
                                </Box>

                                {loadingFaculty ? (
                                    <Box display="flex" justifyContent="center" py={4}>
                                        <CircularProgress />
                                    </Box>
                                ) : existingFaculty.length === 0 ? (
                                    <Box py={4} textAlign="center">
                                        <Typography variant="body1" color="text.secondary">
                                            No faculty credentials found. Upload a file to create login accounts.
                                        </Typography>
                                    </Box>
                                ) : (
                                    <TableContainer>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <StyledHeaderCell>Name</StyledHeaderCell>
                                                    <StyledHeaderCell>Email</StyledHeaderCell>
                                                    <StyledHeaderCell>Employee ID</StyledHeaderCell>
                                                    <StyledHeaderCell>Department</StyledHeaderCell>
                                                    <StyledHeaderCell>Campus</StyledHeaderCell>
                                                    <StyledHeaderCell>Status</StyledHeaderCell>
                                                    <StyledHeaderCell>Actions</StyledHeaderCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {existingFaculty
                                                    .filter(faculty => {
                                                        if (!searchQuery) return true
                                                        const query = searchQuery.toLowerCase()
                                                        return faculty.name.toLowerCase().includes(query) ||
                                                            faculty.email.toLowerCase().includes(query) ||
                                                            faculty.employeeId.toLowerCase().includes(query)
                                                    })
                                                    .map((faculty) => (
                                                        <StyledTableRow key={faculty._id}>
                                                            <StyledTableCell>
                                                                <Typography variant="body2" fontWeight={600}>{faculty.name}</Typography>
                                                            </StyledTableCell>
                                                            <StyledTableCell>
                                                                <Typography variant="body2">{faculty.email}</Typography>
                                                            </StyledTableCell>
                                                            <StyledTableCell>
                                                                <Typography variant="body2">{faculty.employeeId}</Typography>
                                                            </StyledTableCell>
                                                            <StyledTableCell>
                                                                <Typography variant="body2">{faculty.department || '-'}</Typography>
                                                            </StyledTableCell>
                                                            <StyledTableCell>
                                                                <Typography variant="body2">{faculty.campus || '-'}</Typography>
                                                            </StyledTableCell>
                                                            <StyledTableCell>
                                                                <Box
                                                                    sx={{
                                                                        px: 1,
                                                                        py: 0.5,
                                                                        borderRadius: 1,
                                                                        bgcolor: faculty.isActive ? alpha('#10b981', 0.1) : alpha('#ef4444', 0.1),
                                                                        display: 'inline-block'
                                                                    }}
                                                                >
                                                                    <Typography
                                                                        variant="caption"
                                                                        fontWeight={600}
                                                                        color={faculty.isActive ? 'success.main' : 'error.main'}
                                                                    >
                                                                        {faculty.isActive ? 'Active' : 'Inactive'}
                                                                    </Typography>
                                                                </Box>
                                                            </StyledTableCell>
                                                            <StyledTableCell>
                                                                <Button
                                                                    size="small"
                                                                    variant="outlined"
                                                                    color="warning"
                                                                    onClick={() => {
                                                                        setConfirmDialog({
                                                                            open: true,
                                                                            message: `Reset password for ${faculty.name}? New credentials will be sent to ${faculty.email}.`,
                                                                            onConfirm: () => {
                                                                                handleResetPassword(faculty._id, false)
                                                                                setConfirmDialog({ open: false, message: '', onConfirm: null })
                                                                            }
                                                                        })
                                                                    }}
                                                                    disabled={resetting}
                                                                    sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                                                                >
                                                                    Reset Password
                                                                </Button>
                                                            </StyledTableCell>
                                                        </StyledTableRow>
                                                    ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                )}
                            </CardContent>
                        </Card>
                    </Grow>

                    {/* Confirm Dialog */}
                    <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ open: false, message: '', onConfirm: null })}>
                        <DialogTitle>Confirm Action</DialogTitle>
                        <DialogContent>
                            <DialogContentText>{confirmDialog.message}</DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setConfirmDialog({ open: false, message: '', onConfirm: null })} sx={{ textTransform: 'none' }}>
                                Cancel
                            </Button>
                            <Button
                                onClick={() => {
                                    if (confirmDialog.onConfirm) confirmDialog.onConfirm()
                                }}
                                variant="contained"
                                sx={{ textTransform: 'none' }}
                            >
                                Confirm
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Box>
            </Fade>
        </Layout>
    )
}

export default AdminFacultyCredentials
