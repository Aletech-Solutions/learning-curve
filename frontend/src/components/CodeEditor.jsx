import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Collapse,
  Paper,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  PlayArrow as RunIcon,
  CheckCircle as SuccessIcon,
  Cancel as FailIcon,
  Lightbulb as HintIcon,
  Code as CodeIcon,
} from '@mui/icons-material';
import Editor from '@monaco-editor/react';
import { codeService } from '../services/api';

const categoryColors = {
  arrays: '#06b6d4',
  strings: '#8b5cf6',
  sorting: '#f59e0b',
  searching: '#10b981',
  math: '#ec4899',
  logic: '#3b82f6',
  'data-structures': '#ef4444',
  'dynamic-programming': '#f97316',
};

function CodeEditor({ task, onBack, onComplete, isCompleted }) {
  const [code, setCode] = useState(task.starterCode);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [currentHint, setCurrentHint] = useState(0);

  useEffect(() => {
    setCode(task.starterCode);
    setResults(null);
    setShowHints(false);
    setCurrentHint(0);
  }, [task]);

  const runTests = async () => {
    setLoading(true);
    setResults(null);

    try {
      const response = await codeService.executeCode(code, task.testCases, task.id);
      setResults(response);

      if (response.allPassed && !isCompleted) {
        onComplete(task.id, task.xp);
      }
    } catch (error) {
      console.error('Execution error:', error);
      
      try {
        const testResults = runTestsLocally(code, task.testCases);
        setResults(testResults);
        
        if (testResults.allPassed && !isCompleted) {
          onComplete(task.id, task.xp);
        }
      } catch (localError) {
        setResults({
          allPassed: false,
          error: localError.message,
          results: [],
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const runTestsLocally = (userCode, testCases) => {
    const results = [];
    let allPassed = true;

    for (const testCase of testCases) {
      try {
        const wrappedCode = `
          ${userCode}
          return ${getFunctionName(userCode)}(...args);
        `;
        
        const fn = new Function('args', wrappedCode);
        const output = fn(testCase.input);
        
        const passed = JSON.stringify(output) === JSON.stringify(testCase.expected);
        
        results.push({
          input: testCase.input,
          expected: testCase.expected,
          output,
          passed,
        });

        if (!passed) allPassed = false;
      } catch (error) {
        results.push({
          input: testCase.input,
          expected: testCase.expected,
          error: error.message,
          passed: false,
        });
        allPassed = false;
      }
    }

    return { allPassed, results };
  };

  const getFunctionName = (code) => {
    const match = code.match(/function\s+(\w+)/);
    if (match) return match[1];
    
    const classMatch = code.match(/class\s+(\w+)/);
    if (classMatch) return classMatch[1];
    
    return 'solution';
  };

  const showNextHint = () => {
    if (currentHint < task.hints.length - 1) {
      setCurrentHint(currentHint + 1);
    }
  };

  return (
    <Box sx={{ animation: 'fadeIn 0.3s ease-out' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton 
          onClick={onBack}
          sx={{ 
            background: 'rgba(255,255,255,0.1)',
            '&:hover': { background: 'rgba(255,255,255,0.2)' },
          }}
        >
          <BackIcon />
        </IconButton>
        
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
            <Typography variant="h5" fontWeight={700}>
              {task.title}
            </Typography>
            {isCompleted && (
              <Chip 
                icon={<SuccessIcon />} 
                label="Completed" 
                color="success" 
                size="small"
              />
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip
              label={task.category}
              size="small"
              sx={{
                background: `${categoryColors[task.category]}20`,
                color: categoryColors[task.category],
                fontWeight: 600,
              }}
            />
            <Typography variant="body2" color="text.secondary">
              {task.xp} XP • {task.testCases.length} test cases
            </Typography>
          </Box>
        </Box>

        <Button
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <RunIcon />}
          onClick={runTests}
          disabled={loading}
          sx={{ minWidth: 140 }}
        >
          {loading ? 'Running...' : 'Run Tests'}
        </Button>
      </Box>

      <Paper
        sx={{
          p: 3,
          mb: 3,
          background: 'rgba(26, 26, 46, 0.6)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Typography variant="body1" sx={{ mb: 2 }}>
          {task.description}
        </Typography>

        <Button
          size="small"
          startIcon={<HintIcon />}
          onClick={() => setShowHints(!showHints)}
          sx={{ color: '#f59e0b' }}
        >
          {showHints ? 'Hide Hints' : 'Show Hints'}
        </Button>

        <Collapse in={showHints}>
          <Box sx={{ mt: 2, p: 2, background: 'rgba(245, 158, 11, 0.1)', borderRadius: 2 }}>
            <Typography variant="body2" color="#f59e0b" sx={{ mb: 1 }}>
              💡 Hint {currentHint + 1}/{task.hints.length}:
            </Typography>
            <Typography variant="body2">
              {task.hints[currentHint]}
            </Typography>
            {currentHint < task.hints.length - 1 && (
              <Button size="small" onClick={showNextHint} sx={{ mt: 1 }}>
                Next Hint
              </Button>
            )}
          </Box>
        </Collapse>
      </Paper>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 400px' },
          gap: 3,
        }}
      >
        <Paper
          sx={{
            overflow: 'hidden',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 3,
          }}
        >
          <Box
            sx={{
              px: 2,
              py: 1.5,
              background: 'rgba(0,0,0,0.3)',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <CodeIcon sx={{ fontSize: 18, color: 'primary.main' }} />
            <Typography variant="body2" fontWeight={600}>
              solution.js
            </Typography>
          </Box>
          <Editor
            height="500px"
            defaultLanguage="javascript"
            value={code}
            onChange={(value) => setCode(value || '')}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: "'JetBrains Mono', monospace",
              padding: { top: 16, bottom: 16 },
              scrollBeyondLastLine: false,
              lineNumbers: 'on',
              renderLineHighlight: 'all',
              cursorBlinking: 'smooth',
              smoothScrolling: true,
            }}
          />
        </Paper>

        <Paper
          sx={{
            p: 2,
            background: 'rgba(26, 26, 46, 0.6)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            maxHeight: 560,
            overflow: 'auto',
          }}
        >
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            Test Results
          </Typography>

          {!results && (
            <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
              <RunIcon sx={{ fontSize: 48, opacity: 0.5, mb: 1 }} />
              <Typography>Click "Run Tests" to see results</Typography>
            </Box>
          )}

          {results?.error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {results.error}
            </Alert>
          )}

          {results?.allPassed && (
            <Alert 
              severity="success" 
              icon={<SuccessIcon />}
              sx={{ 
                mb: 2,
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
              }}
            >
              🎉 All tests passed! +{task.xp} XP
            </Alert>
          )}

          {results?.results?.map((result, index) => (
            <Box
              key={index}
              sx={{
                p: 2,
                mb: 2,
                borderRadius: 2,
                background: result.passed 
                  ? 'rgba(16, 185, 129, 0.1)' 
                  : 'rgba(239, 68, 68, 0.1)',
                border: `1px solid ${result.passed ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                {result.passed ? (
                  <SuccessIcon sx={{ color: '#10b981', fontSize: 20 }} />
                ) : (
                  <FailIcon sx={{ color: '#ef4444', fontSize: 20 }} />
                )}
                <Typography variant="body2" fontWeight={600}>
                  Test Case {index + 1}
                </Typography>
              </Box>

              <Box sx={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="caption" color="text.secondary">Input:</Typography>
                  <Box sx={{ 
                    p: 1, 
                    mt: 0.5, 
                    background: 'rgba(0,0,0,0.3)', 
                    borderRadius: 1,
                    overflow: 'auto',
                  }}>
                    {JSON.stringify(result.input)}
                  </Box>
                </Box>
                
                <Box sx={{ mb: 1 }}>
                  <Typography variant="caption" color="text.secondary">Expected:</Typography>
                  <Box sx={{ 
                    p: 1, 
                    mt: 0.5, 
                    background: 'rgba(0,0,0,0.3)', 
                    borderRadius: 1,
                    color: '#10b981',
                  }}>
                    {JSON.stringify(result.expected)}
                  </Box>
                </Box>

                {result.error ? (
                  <Box>
                    <Typography variant="caption" color="error">Error:</Typography>
                    <Box sx={{ 
                      p: 1, 
                      mt: 0.5, 
                      background: 'rgba(0,0,0,0.3)', 
                      borderRadius: 1,
                      color: '#ef4444',
                    }}>
                      {result.error}
                    </Box>
                  </Box>
                ) : (
                  <Box>
                    <Typography variant="caption" color="text.secondary">Output:</Typography>
                    <Box sx={{ 
                      p: 1, 
                      mt: 0.5, 
                      background: 'rgba(0,0,0,0.3)', 
                      borderRadius: 1,
                      color: result.passed ? '#10b981' : '#ef4444',
                    }}>
                      {JSON.stringify(result.output)}
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          ))}
        </Paper>
      </Box>
    </Box>
  );
}

export default CodeEditor;

