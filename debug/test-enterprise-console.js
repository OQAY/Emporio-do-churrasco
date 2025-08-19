// Teste automatizado do console enterprise system
// Para usar: abra o console no browser e cole este código

console.log('🚀 INICIANDO TESTES ENTERPRISE SYSTEM');
console.log('=====================================');

async function testEnterpriseSystem() {
    const results = [];
    
    function addResult(test, passed, message) {
        results.push({ test, passed, message });
        console.log(`${passed ? '✅' : '❌'} ${test}: ${message}`);
    }
    
    // Test 1: Check if window.enterpriseSystem exists
    const hasEnterpriseSystem = typeof window.enterpriseSystem !== 'undefined';
    addResult('Enterprise System Global', hasEnterpriseSystem, 
        hasEnterpriseSystem ? 'window.enterpriseSystem disponível' : 'window.enterpriseSystem não encontrado');
    
    if (!hasEnterpriseSystem) {
        console.log('❌ Testes interrompidos - Enterprise System não disponível');
        return results;
    }

    // Test 2: Check system health
    try {
        const health = await window.enterpriseSystem.getSystemHealth();
        const isHealthy = health && health.status;
        addResult('System Health', isHealthy, 
            isHealthy ? `Status: ${health.status}` : 'Health check falhou');
    } catch (error) {
        addResult('System Health', false, `Erro: ${error.message}`);
    }

    // Test 3: Check metrics
    try {
        const metrics = await window.enterpriseSystem.getMetrics();
        const hasMetrics = metrics && typeof metrics === 'object';
        addResult('Metrics Collection', hasMetrics, 
            hasMetrics ? `${Object.keys(metrics).length} métricas coletadas` : 'Nenhuma métrica encontrada');
    } catch (error) {
        addResult('Metrics Collection', false, `Erro: ${error.message}`);
    }

    // Test 4: Check components
    try {
        const components = window.enterpriseSystem.components;
        const hasComponents = components && components.size > 0;
        addResult('Enterprise Components', hasComponents, 
            hasComponents ? `${components.size} componentes carregados` : 'Nenhum componente encontrado');
        
        if (hasComponents) {
            console.log('📦 Componentes carregados:');
            for (const [name, component] of components) {
                console.log(`  - ${name}: ${component.constructor.name}`);
            }
        }
    } catch (error) {
        addResult('Enterprise Components', false, `Erro: ${error.message}`);
    }

    // Test 5: Check logger
    try {
        const logger = window.enterpriseSystem.components.get('logger');
        const hasLogger = logger && typeof logger.getLogs === 'function';
        addResult('Enterprise Logger', hasLogger, 
            hasLogger ? 'Logger funcional' : 'Logger não disponível');
        
        if (hasLogger) {
            const logs = logger.getLogs();
            console.log(`📝 ${logs.length} logs no sistema`);
        }
    } catch (error) {
        addResult('Enterprise Logger', false, `Erro: ${error.message}`);
    }

    // Test 6: Check performance monitoring
    try {
        const performanceMonitor = window.enterpriseSystem.components.get('performanceMonitor');
        const hasPerformanceMonitor = performanceMonitor !== undefined;
        addResult('Performance Monitor', hasPerformanceMonitor, 
            hasPerformanceMonitor ? 'Monitor de performance ativo' : 'Monitor não encontrado');
    } catch (error) {
        addResult('Performance Monitor', false, `Erro: ${error.message}`);
    }

    // Summary
    const passed = results.filter(r => r.passed).length;
    const total = results.length;
    const passRate = ((passed / total) * 100).toFixed(1);
    
    console.log('\n📊 RESUMO DOS TESTES:');
    console.log('====================');
    console.log(`✅ Testes passaram: ${passed}/${total} (${passRate}%)`);
    
    if (passRate >= 80) {
        console.log('🎉 Enterprise System está funcionando corretamente!');
    } else if (passRate >= 60) {
        console.log('⚠️ Enterprise System funcional com algumas limitações');
    } else {
        console.log('❌ Enterprise System tem problemas sérios');
    }

    // Test commands
    console.log('\n🔧 COMANDOS ÚTEIS PARA DEBUG:');
    console.log('============================');
    console.log('window.enterpriseSystem.getMetrics()        // Ver métricas');
    console.log('window.enterpriseSystem.getSystemHealth()   // Ver saúde do sistema');
    console.log('window.enterpriseSystem.components          // Ver componentes');
    console.log('window.enterpriseSystem.components.get("logger").getLogs() // Ver logs');

    return results;
}

// Auto-execute test
testEnterpriseSystem().then(results => {
    console.log('\n🏁 Testes enterprise concluídos!');
    console.log('Resultados disponíveis na variável: window.testResults');
    window.testResults = results;
});