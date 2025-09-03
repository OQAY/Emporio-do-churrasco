// Controller para otimização de imagens em batch
import BatchImageOptimizer from '../utils/BatchImageOptimizer.js';

export class ImageOptimizationController {
    constructor(database, view) {
        this.database = database;
        this.view = view;
        this.imageOptimizer = null;
    }

    /**
     * Configurar funcionalidades de otimização de imagens
     */
    async setupImageOptimization() {
        try {
            // Inicializar otimizador
            this.imageOptimizer = new BatchImageOptimizer(this.database);
            
            // Atualizar contagem de imagens
            await this.updateImageCount();
            
            // Setup event listeners
            this.setupImageOptimizationEvents();
            
            // Setup backups
            this.updateBackupsList();
            
        } catch (error) {
            console.error('Erro ao configurar otimização de imagens:', error);
        }
    }

    /**
     * Configurar eventos da otimização
     */
    setupImageOptimizationEvents() {
        // Botão principal de otimização
        const optimizeBtn = document.getElementById('optimizeImagesBtn');
        if (optimizeBtn) {
            optimizeBtn.addEventListener('click', () => {
                this.startImageOptimization();
            });
        }

        // Botão para mostrar backups
        const showBackupsBtn = document.getElementById('showBackupsBtn');
        if (showBackupsBtn) {
            showBackupsBtn.addEventListener('click', () => {
                this.toggleBackupsList();
            });
        }
    }

    /**
     * Atualizar contagem de imagens
     */
    async updateImageCount() {
        try {
            const images = await this.imageOptimizer.getAllImages();
            const imageCountEl = document.getElementById('imageCount');
            
            if (imageCountEl) {
                if (images.length === 0) {
                    imageCountEl.textContent = 'Nenhuma imagem base64 encontrada';
                } else {
                    const totalSize = images.reduce((sum, img) => 
                        sum + this.imageOptimizer.getBase64Size(img.imageData), 0
                    );
                    imageCountEl.textContent = `${images.length} imagens encontradas (${this.formatFileSize(totalSize)})`;
                }
            }

            // Desabilitar botão se não há imagens
            const optimizeBtn = document.getElementById('optimizeImagesBtn');
            if (optimizeBtn) {
                optimizeBtn.disabled = images.length === 0;
            }

        } catch (error) {
            console.error('Erro ao contar imagens:', error);
            const imageCountEl = document.getElementById('imageCount');
            if (imageCountEl) {
                imageCountEl.textContent = 'Erro ao carregar imagens';
            }
        }
    }

    /**
     * Iniciar processo de otimização
     */
    async startImageOptimization() {
        try {
            const optimizeBtn = document.getElementById('optimizeImagesBtn');
            const progressDiv = document.getElementById('optimizationProgress');
            const resultsDiv = document.getElementById('optimizationResults');
            
            // Reset UI
            optimizeBtn.disabled = true;
            optimizeBtn.textContent = 'Otimizando...';
            progressDiv.classList.remove('hidden');
            resultsDiv.classList.add('hidden');
            
            // Configurar callback de progresso
            const onProgress = (progress) => {
                this.updateOptimizationProgress(progress);
            };

            // Executar otimização
            const result = await this.imageOptimizer.optimizeAllImages({
                createBackup: true,
                skipIfOptimized: true,
                maxConcurrent: 2,
                onProgress
            });

            // Mostrar resultados
            this.showOptimizationResults(result);
            
            // Atualizar lista de backups
            this.updateBackupsList();
            
            // Atualizar contagem
            await this.updateImageCount();

        } catch (error) {
            console.error('Erro na otimização:', error);
            this.view.showNotification('Erro na otimização: ' + error.message, 'error');
        } finally {
            // Reset botão
            const optimizeBtn = document.getElementById('optimizeImagesBtn');
            const progressDiv = document.getElementById('optimizationProgress');
            
            optimizeBtn.disabled = false;
            optimizeBtn.innerHTML = `
                <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
                Otimizar Todas as Imagens
            `;
            progressDiv.classList.add('hidden');
        }
    }

    /**
     * Atualizar progress bar
     */
    updateOptimizationProgress(progress) {
        const progressText = document.getElementById('progressText');
        const progressPercent = document.getElementById('progressPercent');
        const progressBar = document.getElementById('progressBar');

        if (progressText) {
            progressText.textContent = `Processando imagem ${progress.current}/${progress.total}`;
        }

        if (progressPercent && progressBar) {
            const percentage = progress.percentage || 0;
            progressPercent.textContent = `${percentage}%`;
            progressBar.style.width = `${percentage}%`;
        }
    }

    /**
     * Mostrar resultados da otimização
     */
    showOptimizationResults(result) {
        const resultsDiv = document.getElementById('optimizationResults');
        const optimizedEl = document.getElementById('resultOptimized');
        const skippedEl = document.getElementById('resultSkipped');
        const savingsEl = document.getElementById('resultSavings');

        if (optimizedEl) optimizedEl.textContent = result.optimized;
        if (skippedEl) skippedEl.textContent = result.skipped;
        if (savingsEl) savingsEl.textContent = this.formatFileSize(result.savings);

        if (resultsDiv) {
            resultsDiv.classList.remove('hidden');
        }

        // Notificação
        if (result.optimized > 0) {
            this.view.showNotification(
                `✅ ${result.optimized} imagens otimizadas! Economia: ${this.formatFileSize(result.savings)}`
            );
        } else {
            this.view.showNotification('ℹ️ Nenhuma imagem precisava de otimização');
        }
    }

    /**
     * Toggle lista de backups
     */
    toggleBackupsList() {
        const backupList = document.getElementById('backupList');
        if (backupList) {
            backupList.classList.toggle('hidden');
            this.updateBackupsList();
        }
    }

    /**
     * Atualizar lista de backups
     */
    updateBackupsList() {
        const backupItems = document.getElementById('backupItems');
        if (!backupItems) return;

        try {
            const backups = this.imageOptimizer.getAvailableBackups();
            
            if (backups.length === 0) {
                backupItems.innerHTML = '<p class="text-gray-500 text-sm">Nenhum backup disponível</p>';
                return;
            }

            backupItems.innerHTML = backups.map(backup => `
                <div class="flex items-center justify-between p-3 bg-white rounded border">
                    <div>
                        <div class="font-medium text-sm">${new Date(backup.timestamp).toLocaleString('pt-BR')}</div>
                        <div class="text-gray-500 text-xs">
                            ${backup.imageCount} imagens • ${this.formatFileSize(backup.totalSize)}
                        </div>
                    </div>
                    <button 
                        class="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        onclick="window.imageOptController?.restoreBackup('${backup.key}')"
                    >
                        Restaurar
                    </button>
                </div>
            `).join('');

        } catch (error) {
            console.error('Erro ao listar backups:', error);
            backupItems.innerHTML = '<p class="text-red-500 text-sm">Erro ao carregar backups</p>';
        }
    }

    /**
     * Restaurar backup
     */
    async restoreBackup(backupKey) {
        try {
            const confirmRestore = confirm(
                'Tem certeza que deseja restaurar este backup? ' +
                'Isso irá substituir as imagens atuais pelas versões do backup.'
            );
            
            if (!confirmRestore) return;

            await this.imageOptimizer.restoreFromBackup(backupKey);
            
            this.view.showNotification('Backup restaurado com sucesso!');
            await this.updateImageCount();

        } catch (error) {
            console.error('Erro ao restaurar backup:', error);
            this.view.showNotification('Erro ao restaurar backup: ' + error.message, 'error');
        }
    }

    /**
     * Formatar tamanho de arquivo
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }
}