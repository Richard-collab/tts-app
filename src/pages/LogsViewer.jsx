// src/pages/LogsViewer.jsx
import { useState, useEffect, useMemo } from 'react';
import {
  Container, Paper, Typography, Box, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, FormControl, InputLabel,
  Select, MenuItem, Chip, CircularProgress, Alert, Button, IconButton
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

function LogsViewer() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filters
  const [filterAction, setFilterAction] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const navigate = useNavigate();

  // Dynamically determine URL
  const logServerUrl = useMemo(() => {
    return `http://${window.location.hostname}:3001/api/logs`;
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filterAction !== 'all') params.append('action_type', filterAction);
      if (filterStatus !== 'all') params.append('status', filterStatus);

      const res = await fetch(`${logServerUrl}?${params.toString()}`);
      if (!res.ok) {
        throw new Error('Failed to fetch logs');
      }
      const data = await res.json();
      setLogs(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterAction, filterStatus, logServerUrl]);

  const formatDetails = (detailsStr) => {
    try {
      const obj = JSON.parse(detailsStr);
      return (
        <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: '0.8rem', fontFamily: 'monospace' }}>
          {JSON.stringify(obj, null, 2)}
        </pre>
      );
    } catch {
      return detailsStr;
    }
  };

  const getStatusColor = (status) => {
      switch(status) {
          case 'success': return 'success';
          case 'error': return 'error';
          case 'warning': return 'warning';
          default: return 'default';
      }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <IconButton onClick={() => navigate('/')} sx={{ mr: 2 }}>
                <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" component="h1">
                操作日志
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Button
                startIcon={<RefreshIcon />}
                variant="outlined"
                onClick={fetchLogs}
            >
                刷新
            </Button>
        </Box>

        <Paper sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel>操作类型</InputLabel>
                    <Select
                        value={filterAction}
                        label="操作类型"
                        onChange={(e) => setFilterAction(e.target.value)}
                    >
                        <MenuItem value="all">全部</MenuItem>
                        <MenuItem value="AUTH_LOGIN">登录</MenuItem>
                        <MenuItem value="AUTH_LOGOUT">登出</MenuItem>
                        <MenuItem value="IMPORT_BAIZE">导入话术</MenuItem>
                        <MenuItem value="SYNTHESIS_COMPLETE">合成完成</MenuItem>
                        <MenuItem value="UPLOAD_SINGLE">单个上传</MenuItem>
                        <MenuItem value="UPLOAD_BATCH">批量上传</MenuItem>
                        <MenuItem value="EXPORT_AUDIO">导出音频</MenuItem>
                        <MenuItem value="EXPORT_EXCEL">导出Excel</MenuItem>
                    </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel>状态</InputLabel>
                    <Select
                        value={filterStatus}
                        label="状态"
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <MenuItem value="all">全部</MenuItem>
                        <MenuItem value="success">成功</MenuItem>
                        <MenuItem value="error">失败</MenuItem>
                        <MenuItem value="warning">警告</MenuItem>
                        <MenuItem value="info">信息</MenuItem>
                    </Select>
                </FormControl>
            </Box>
        </Paper>

        {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
                连接日志服务器失败 ({logServerUrl})。请确保服务器正在运行。
                <br />
                Error: {error}
            </Alert>
        )}

        <TableContainer component={Paper} sx={{ maxHeight: '70vh' }}>
            <Table stickyHeader size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>时间</TableCell>
                        <TableCell>用户</TableCell>
                        <TableCell>操作类型</TableCell>
                        <TableCell>状态</TableCell>
                        <TableCell width="40%">详情</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                <CircularProgress />
                            </TableCell>
                        </TableRow>
                    ) : logs.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                暂无日志数据
                            </TableCell>
                        </TableRow>
                    ) : (
                        logs.map((log) => (
                            <TableRow key={log.id} hover>
                                <TableCell>{log.id}</TableCell>
                                <TableCell>
                                    {new Date(log.timestamp).toLocaleString()}
                                </TableCell>
                                <TableCell>{log.username}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={log.action_type}
                                        size="small"
                                        variant="outlined"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={log.status}
                                        color={getStatusColor(log.status)}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell sx={{ wordBreak: 'break-all' }}>
                                    {formatDetails(log.details)}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    </Container>
  );
}

export default LogsViewer;
