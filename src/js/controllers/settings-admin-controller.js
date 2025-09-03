// Controller para gerenciamento das configurações do restaurante no painel admin
export class SettingsAdminController {
    constructor(database, view, adminController) {
        this.database = database;
        this.view = view;
        this.adminController = adminController;
    }

    /**
     * Exibir seção de configurações
     */
    async showSettings() {
        const restaurant = this.database.getRestaurant();
        this.view.showSettings(restaurant);
        
        // Setup event listeners para as diferentes funcionalidades
        this.setupRestaurantForm();
        this.setupDataManagement();
        
        // Image optimization (delegated to imageOptController)
        await this.adminController.imageOptController.setupImageOptimization();
    }

    /**
     * Setup formulário do restaurante
     */
    setupRestaurantForm() {
        const restaurantForm = document.getElementById('restaurantForm');
        if (restaurantForm) {
            restaurantForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveRestaurantSettings();
            });
        }
    }

    /**
     * Setup funcionalidades de gerenciamento de dados (export/import)
     */
    setupDataManagement() {
        // Export data
        const exportBtn = document.getElementById('exportDataBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportData();
            });
        }
        
        // Import data
        const importBtn = document.getElementById('importDataBtn');
        if (importBtn) {
            importBtn.addEventListener('click', () => {
                this.importData();
            });
        }
    }

    /**
     * Salvar configurações do restaurante
     */
    saveRestaurantSettings() {
        const restaurantData = {
            name: document.getElementById('restaurantName')?.value || '',
            logo: document.getElementById('restaurantLogo')?.value || '',
            banner: document.getElementById('restaurantBanner')?.value || ''
        };
        
        // Validação básica
        if (!restaurantData.name.trim()) {
            this.view.showNotification('Nome do restaurante é obrigatório', 'error');
            document.getElementById('restaurantName')?.focus();
            return;
        }
        
        try {
            this.database.updateRestaurant(restaurantData);
            this.view.showNotification('Configurações salvas com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar configurações:', error);
            this.view.showNotification('Erro ao salvar configurações', 'error');
        }
    }

    /**
     * Exportar dados do sistema
     */
    exportData() {
        try {
            this.database.exportData();
            this.view.showNotification('Dados exportados com sucesso!');
        } catch (error) {
            console.error('Erro ao exportar dados:', error);
            this.view.showNotification('Erro ao exportar dados', 'error');
        }
    }

    /**
     * Importar dados do sistema
     */
    importData() {
        const fileInput = document.getElementById('importFile');
        const file = fileInput?.files[0];
        
        if (!file) {
            this.view.showNotification('Selecione um arquivo para importar', 'warning');
            return;
        }
        
        // Validação do tipo de arquivo
        if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
            this.view.showNotification('Por favor, selecione um arquivo JSON válido', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const result = this.database.importData(e.target.result);
                
                if (result) {
                    this.view.showNotification('Dados importados com sucesso!');
                    
                    // Recarregar página após importação bem-sucedida
                    setTimeout(() => {
                        location.reload();
                    }, 1500);
                } else {
                    this.view.showNotification('Erro ao importar dados - arquivo pode estar corrompido', 'error');
                }
            } catch (error) {
                console.error('Erro ao importar dados:', error);
                this.view.showNotification('Arquivo inválido ou corrompido', 'error');
            }
        };
        
        reader.onerror = () => {
            this.view.showNotification('Erro ao ler o arquivo', 'error');
        };
        
        reader.readAsText(file);
    }

    /**
     * Resetar configurações para padrão
     */
    resetToDefaults() {
        const confirmReset = confirm(
            'Tem certeza que deseja resetar as configurações para os valores padrão?\n\n' +
            'Esta ação não pode ser desfeita.'
        );
        
        if (!confirmReset) return;
        
        try {
            const defaultSettings = {
                name: 'Empório do Churrasco',
                logo: 'images/logo.png',
                banner: 'images/banner.jpg'
            };
            
            // Atualizar campos do formulário
            document.getElementById('restaurantName').value = defaultSettings.name;
            document.getElementById('restaurantLogo').value = defaultSettings.logo;
            document.getElementById('restaurantBanner').value = defaultSettings.banner;
            
            // Salvar no banco
            this.database.updateRestaurant(defaultSettings);
            
            this.view.showNotification('Configurações resetadas para o padrão!');
        } catch (error) {
            console.error('Erro ao resetar configurações:', error);
            this.view.showNotification('Erro ao resetar configurações', 'error');
        }
    }

    /**
     * Validar URLs de imagem
     */
    validateImageUrl(url, fieldName) {
        if (!url) return true; // URLs vazias são permitidas
        
        // Padrões básicos de validação de URL de imagem
        const imageUrlPattern = /\.(jpg|jpeg|png|gif|webp|svg|avif)$/i;
        const isValidUrl = /^(https?:\/\/|\/|images\/)/i.test(url);
        const isImageFile = imageUrlPattern.test(url);
        
        if (!isValidUrl) {
            this.view.showNotification(`URL inválida para ${fieldName}`, 'error');
            return false;
        }
        
        if (!isImageFile) {
            this.view.showNotification(`${fieldName} deve ser um arquivo de imagem válido`, 'error');
            return false;
        }
        
        return true;
    }

    /**
     * Preview de imagem
     */
    previewImage(inputId, previewId) {
        const input = document.getElementById(inputId);
        const preview = document.getElementById(previewId);
        
        if (!input || !preview) return;
        
        const url = input.value.trim();
        
        if (url) {
            if (this.validateImageUrl(url, input.getAttribute('data-field-name') || 'imagem')) {
                preview.src = url;
                preview.style.display = 'block';
                preview.onerror = () => {
                    preview.style.display = 'none';
                    this.view.showNotification('Não foi possível carregar a imagem', 'warning');
                };
            } else {
                preview.style.display = 'none';
            }
        } else {
            preview.style.display = 'none';
        }
    }

    /**
     * Setup preview de imagens nos campos de configuração
     */
    setupImagePreviews() {
        // Logo preview
        const logoInput = document.getElementById('restaurantLogo');
        const logoPreview = document.getElementById('logoPreview');
        
        if (logoInput && logoPreview) {
            logoInput.addEventListener('input', () => {
                this.previewImage('restaurantLogo', 'logoPreview');
            });
            
            // Initial preview
            if (logoInput.value) {
                this.previewImage('restaurantLogo', 'logoPreview');
            }
        }
        
        // Banner preview
        const bannerInput = document.getElementById('restaurantBanner');
        const bannerPreview = document.getElementById('bannerPreview');
        
        if (bannerInput && bannerPreview) {
            bannerInput.addEventListener('input', () => {
                this.previewImage('restaurantBanner', 'bannerPreview');
            });
            
            // Initial preview
            if (bannerInput.value) {
                this.previewImage('restaurantBanner', 'bannerPreview');
            }
        }
    }

    /**
     * Backup automático das configurações
     */
    createBackup() {
        try {
            const restaurant = this.database.getRestaurant();
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupData = {
                timestamp,
                restaurant,
                version: '1.0'
            };
            
            const dataStr = JSON.stringify(backupData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            // Create download link
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `restaurante-backup-${timestamp}.json`;
            link.click();
            
            this.view.showNotification('Backup das configurações criado!');
        } catch (error) {
            console.error('Erro ao criar backup:', error);
            this.view.showNotification('Erro ao criar backup', 'error');
        }
    }

    /**
     * Obter estatísticas do sistema
     */
    getSystemStats() {
        try {
            const stats = {
                products: this.database.getProducts().length,
                categories: this.database.getCategories().length,
                images: this.database.getGalleryImages().length,
                tags: this.database.getProductTags().length,
                lastModified: this.database.getLastModified(),
                storageUsed: this.calculateStorageUsage()
            };
            
            return stats;
        } catch (error) {
            console.error('Erro ao obter estatísticas:', error);
            return null;
        }
    }

    /**
     * Calcular uso de storage
     */
    calculateStorageUsage() {
        try {
            let totalSize = 0;
            
            // Calcular tamanho dos dados no localStorage
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key) && key.startsWith('menu_') || key.startsWith('restaurante_')) {
                    totalSize += localStorage[key].length;
                }
            }
            
            // Converter para formato legível
            const units = ['bytes', 'KB', 'MB'];
            let unitIndex = 0;
            let size = totalSize;
            
            while (size >= 1024 && unitIndex < units.length - 1) {
                size /= 1024;
                unitIndex++;
            }
            
            return `${Math.round(size * 100) / 100} ${units[unitIndex]}`;
        } catch (error) {
            console.error('Erro ao calcular uso de storage:', error);
            return 'N/A';
        }
    }

    /**
     * Limpar cache e dados temporários
     */
    clearCache() {
        const confirmClear = confirm(
            'Tem certeza que deseja limpar o cache?\n\n' +
            'Isso pode ajudar a resolver problemas de performance, mas os dados serão recarregados.'
        );
        
        if (!confirmClear) return;
        
        try {
            // Limpar cache do database
            if (this.database.cache && typeof this.database.cache.clear === 'function') {
                this.database.cache.clear();
            }
            
            // Limpar dados de performance metrics se existirem
            localStorage.removeItem('performance_metrics');
            localStorage.removeItem('supabase_cache');
            
            this.view.showNotification('Cache limpo com sucesso!');
            
            // Recarregar dados
            setTimeout(() => {
                this.database.loadData();
            }, 500);
            
        } catch (error) {
            console.error('Erro ao limpar cache:', error);
            this.view.showNotification('Erro ao limpar cache', 'error');
        }
    }
}