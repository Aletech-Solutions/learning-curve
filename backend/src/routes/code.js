const express = require('express');
const router = express.Router();
const { VM } = require('vm2');

// Execute code and run tests
router.post('/execute', async (req, res) => {
  try {
    const { code, testCases, taskId } = req.body;

    if (!code || !testCases) {
      return res.status(400).json({ error: 'Code and test cases are required' });
    }

    const results = [];
    let allPassed = true;

    // Extract function/class name from code
    const functionMatch = code.match(/function\s+(\w+)/);
    const classMatch = code.match(/class\s+(\w+)/);
    const funcName = functionMatch ? functionMatch[1] : (classMatch ? classMatch[1] : null);

    if (!funcName) {
      return res.status(400).json({ 
        error: 'Could not find function or class name in code',
        allPassed: false,
        results: [],
      });
    }

    for (const testCase of testCases) {
      try {
        const vm = new VM({
          timeout: 5000,
          sandbox: {},
        });

        // For class-based tests (like LRUCache)
        if (classMatch && Array.isArray(testCase.input) && testCase.input.length === 2) {
          const [capacity, operations] = testCase.input;
          
          const classTestCode = `
            ${code}
            
            const cache = new ${funcName}(${capacity});
            const results = [];
            
            for (const op of ${JSON.stringify(operations)}) {
              if (op[0] === 'put') {
                cache.put(op[1], op[2]);
                results.push(null);
              } else if (op[0] === 'get') {
                results.push(cache.get(op[1]));
              }
            }
            
            results;
          `;

          const output = vm.run(classTestCode);
          const passed = JSON.stringify(output) === JSON.stringify(testCase.expected);

          results.push({
            input: testCase.input,
            expected: testCase.expected,
            output,
            passed,
          });

          if (!passed) allPassed = false;
        } else {
          // For function-based tests
          const testCode = `
            ${code}
            
            const args = ${JSON.stringify(testCase.input)};
            ${funcName}(...args);
          `;

          const output = vm.run(testCode);
          const passed = JSON.stringify(output) === JSON.stringify(testCase.expected);

          results.push({
            input: testCase.input,
            expected: testCase.expected,
            output,
            passed,
          });

          if (!passed) allPassed = false;
        }
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

    res.json({
      allPassed,
      results,
      taskId,
    });
  } catch (error) {
    console.error('Execution error:', error);
    res.status(500).json({ 
      error: error.message,
      allPassed: false,
      results: [],
    });
  }
});

module.exports = router;

