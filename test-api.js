const { exec } = require('child_process');

// Test the GET endpoint
console.log('🔍 Testing GET /api/v1/cloud...');
exec('curl -X GET http://localhost:3000/api/v1/cloud -H "Content-Type: application/json" -s', (error, stdout, stderr) => {
  if (error) {
    console.log('❌ GET Test Failed:', error);
    return;
  }
  
  try {
    const response = JSON.parse(stdout);
    console.log('✅ GET Test Successful:', response);
    
    // Test POST endpoint
    console.log('\n🔍 Testing POST /api/v1/cloud...');
    const testData = {
      products: [
        { name: "منتج تجريبي", initialStock: 100, price: 50 }
      ],
      branches: {
        main: { name: "الفرع الرئيسي", location: "القاهرة" }
      }
    };
    
    const postCommand = `curl -X POST http://localhost:3000/api/v1/cloud -H "Content-Type: application/json" -d '${JSON.stringify(testData)}' -s`;
    exec(postCommand, (postError, postStdout, postStderr) => {
      if (postError) {
        console.log('❌ POST Test Failed:', postError);
        return;
      }
      
      try {
        const postResponse = JSON.parse(postStdout);
        console.log('✅ POST Test Successful:', postResponse);
        
        // Test GET again to verify data was stored
        console.log('\n🔍 Verifying data was stored with GET...');
        exec('curl -X GET http://localhost:3000/api/v1/cloud -H "Content-Type: application/json" -s', (verifyError, verifyStdout, verifyStderr) => {
          if (verifyError) {
            console.log('❌ Verification Failed:', verifyError);
            return;
          }
          
          try {
            const verifyResponse = JSON.parse(verifyStdout);
            console.log('✅ Data Verification Successful:', {
              hasProducts: !!verifyResponse.products,
              hasBranches: !!verifyResponse.branches,
              productsCount: verifyResponse.products ? verifyResponse.products.length : 0
            });
            
          } catch (parseError) {
            console.log('❌ JSON Parse Error:', parseError);
          }
        });
        
      } catch (parseError) {
        console.log('❌ JSON Parse Error:', parseError);
      }
    });
    
  } catch (parseError) {
    console.log('❌ JSON Parse Error:', parseError);
  }
});