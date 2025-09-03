// Controller para gerenciamento da galeria de imagens no painel admin
export class GalleryAdminController {
    constructor(database, view, adminController) {
        this.database = database;
        this.view = view;
        this.adminController = adminController;
        this.selectedImages = new Set();
    }

    /**
     * Exibir galeria de imagens
     */
    async showGallery() {
        // Force reload to get fresh images
        await this.database.forceReload();
        
        const images = this.database.getGalleryImages();
        this.view.showGallery(images, false);
        
        // Setup event listeners
        this.setupGalleryEventListeners();
    }

    /**
     * Configurar event listeners da galeria
     */
    setupGalleryEventListeners() {
        // Upload button
        const uploadBtn = document.getElementById('uploadImagesBtn');
        uploadBtn?.addEventListener('click', () => {
            document.getElementById('imageUpload').click();
        });
        
        // File input change
        document.getElementById('imageUpload')?.addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files);
        });
        
        // Image selection checkboxes
        document.querySelectorAll('.image-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                this.toggleImageSelection(e.target.dataset.imageId, e.target.checked);
            });
        });
        
        // Delete selected button
        document.getElementById('deleteSelectedBtn')?.addEventListener('click', () => {
            this.deleteSelectedImages();
        });
        
        // Select all button
        document.getElementById('selectAllBtn')?.addEventListener('click', () => {
            this.selectAllImages();
        });
        
        // Clear selection button
        document.getElementById('clearSelectionBtn')?.addEventListener('click', () => {
            this.clearSelection();
        });
        
        // Long press for mobile selection
        this.setupMobileSelection();
    }

    /**
     * Setup mobile long press selection
     */
    setupMobileSelection() {
        let pressTimer;
        
        document.querySelectorAll('.gallery-image').forEach(imageEl => {
            // Touch events for mobile
            imageEl.addEventListener('touchstart', (e) => {
                const imageId = imageEl.dataset.imageId;
                pressTimer = setTimeout(() => {
                    if (window.innerWidth <= 768) {
                        this.toggleImageSelection(imageId, true);
                        const checkbox = document.querySelector(`input[data-image-id="${imageId}"]`);
                        if (checkbox) checkbox.checked = true;
                    }
                }, 500); // 500ms long press
            });
            
            imageEl.addEventListener('touchend', () => {
                clearTimeout(pressTimer);
            });
            
            imageEl.addEventListener('touchcancel', () => {
                clearTimeout(pressTimer);
            });
            
            // Mouse events for desktop
            imageEl.addEventListener('mousedown', (e) => {
                const imageId = imageEl.dataset.imageId;
                pressTimer = setTimeout(() => {
                    this.toggleImageSelection(imageId, true);
                    const checkbox = document.querySelector(`input[data-image-id="${imageId}"]`);
                    if (checkbox) checkbox.checked = true;
                }, 500);
            });
            
            imageEl.addEventListener('mouseup', () => {
                clearTimeout(pressTimer);
            });
            
            imageEl.addEventListener('mouseleave', () => {
                clearTimeout(pressTimer);
            });
        });
    }

    /**
     * Handle file upload
     */
    async handleFileUpload(files) {
        if (!files || files.length === 0) return;
        
        const uploadBtn = document.getElementById('uploadImagesBtn');
        const originalText = uploadBtn.textContent;
        
        try {
            uploadBtn.textContent = 'Enviando...';
            uploadBtn.disabled = true;
            
            let uploadedCount = 0;
            
            for (const file of files) {
                if (!this.isValidImageFile(file)) {
                    this.view.showNotification(`Arquivo inválido: ${file.name}`, 'error');
                    continue;
                }
                
                const imageData = await this.processImageFile(file);
                
                if (imageData) {
                    await this.database.addGalleryImage({
                        id: this.generateImageId(),
                        name: file.name,
                        url: imageData.url,
                        size: file.size,
                        type: file.type,
                        tags: this.generateAutoTags(file.name),
                        createdAt: new Date().toISOString()
                    });
                    
                    uploadedCount++;
                }
            }
            
            if (uploadedCount > 0) {
                this.view.showNotification(`${uploadedCount} imagem(ns) enviada(s) com sucesso!`);
                await this.showGallery(); // Refresh gallery
            }
            
        } catch (error) {
            console.error('Erro no upload:', error);
            this.view.showNotification('Erro no upload das imagens', 'error');
        } finally {
            uploadBtn.textContent = originalText;
            uploadBtn.disabled = false;
        }
    }

    /**
     * Validate image file
     */
    isValidImageFile(file) {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'];
        const maxSize = 10 * 1024 * 1024; // 10MB
        
        if (!validTypes.includes(file.type)) {
            return false;
        }
        
        if (file.size > maxSize) {
            this.view.showNotification('Imagem muito grande (máx 10MB)', 'error');
            return false;
        }
        
        return true;
    }

    /**
     * Process image file
     */
    async processImageFile(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    // Resize if too large
                    const maxWidth = 1200;
                    const maxHeight = 1200;
                    
                    let { width, height } = img;
                    
                    if (width > maxWidth || height > maxHeight) {
                        if (width > height) {
                            height = (height * maxWidth) / width;
                            width = maxWidth;
                        } else {
                            width = (width * maxHeight) / height;
                            height = maxHeight;
                        }
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Convert to WebP for better compression
                    const dataUrl = canvas.toDataURL('image/webp', 0.8);
                    
                    resolve({
                        url: dataUrl,
                        width,
                        height
                    });
                };
                
                img.src = e.target.result;
            };
            
            reader.readAsDataURL(file);
        });
    }

    /**
     * Toggle image selection
     */
    toggleImageSelection(imageId, isSelected) {
        if (isSelected) {
            this.selectedImages.add(imageId);
        } else {
            this.selectedImages.delete(imageId);
        }
        
        // Update UI
        const imageEl = document.querySelector(`[data-image-id="${imageId}"]`);
        if (imageEl) {
            if (isSelected) {
                imageEl.classList.add('selected');
            } else {
                imageEl.classList.remove('selected');
            }
        }
        
        // Update selection counter
        this.updateSelectionCounter();
        
        // Update action buttons visibility
        this.updateActionButtons();
    }

    /**
     * Select all images
     */
    selectAllImages() {
        const checkboxes = document.querySelectorAll('.image-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = true;
            this.toggleImageSelection(checkbox.dataset.imageId, true);
        });
    }

    /**
     * Clear selection
     */
    clearSelection() {
        const checkboxes = document.querySelectorAll('.image-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
            this.toggleImageSelection(checkbox.dataset.imageId, false);
        });
    }

    /**
     * Delete selected images
     */
    async deleteSelectedImages() {
        if (this.selectedImages.size === 0) {
            this.view.showNotification('Nenhuma imagem selecionada', 'warning');
            return;
        }
        
        const confirmDelete = confirm(
            `Tem certeza que deseja excluir ${this.selectedImages.size} imagem(ns)?`
        );
        
        if (!confirmDelete) return;
        
        try {
            for (const imageId of this.selectedImages) {
                await this.database.deleteGalleryImage(imageId);
            }
            
            this.view.showNotification(`${this.selectedImages.size} imagem(ns) excluída(s)`);
            this.selectedImages.clear();
            await this.showGallery(); // Refresh gallery
            
        } catch (error) {
            console.error('Erro ao excluir imagens:', error);
            this.view.showNotification('Erro ao excluir imagens', 'error');
        }
    }

    /**
     * Update selection counter
     */
    updateSelectionCounter() {
        const counter = document.getElementById('selectionCounter');
        if (counter) {
            if (this.selectedImages.size > 0) {
                counter.textContent = `${this.selectedImages.size} selecionada(s)`;
                counter.classList.remove('hidden');
            } else {
                counter.classList.add('hidden');
            }
        }
    }

    /**
     * Update action buttons
     */
    updateActionButtons() {
        const deleteBtn = document.getElementById('deleteSelectedBtn');
        const clearBtn = document.getElementById('clearSelectionBtn');
        
        if (this.selectedImages.size > 0) {
            deleteBtn?.classList.remove('hidden');
            clearBtn?.classList.remove('hidden');
        } else {
            deleteBtn?.classList.add('hidden');
            clearBtn?.classList.add('hidden');
        }
    }

    /**
     * Show gallery for image selection (used by products)
     */
    async showGalleryForSelection() {
        const images = this.database.getGalleryImages();
        this.view.showGallery(images, true); // true = selection mode
        
        // Setup selection event listeners
        document.querySelectorAll('.gallery-image').forEach(imageEl => {
            imageEl.addEventListener('click', () => {
                const imageId = imageEl.dataset.imageId;
                const image = images.find(img => img.id === imageId);
                this.selectImageForProduct(image);
            });
        });
    }

    /**
     * Select image for product
     */
    selectImageForProduct(image) {
        // Update hidden input
        const selectedImageInput = document.getElementById('selectedGalleryImageId');
        if (selectedImageInput) {
            selectedImageInput.value = image.id;
        }
        
        // Update preview
        const previewImg = document.getElementById('selectedImagePreview');
        if (previewImg) {
            previewImg.src = image.url;
            previewImg.classList.remove('hidden');
        }
        
        // Update name display
        const nameDisplay = document.getElementById('selectedImageName');
        if (nameDisplay) {
            nameDisplay.textContent = image.name;
        }
        
        // Close gallery modal
        const modal = document.getElementById('galleryModal');
        if (modal) {
            modal.classList.add('hidden');
        }
        
        this.view.showNotification(`Imagem "${image.name}" selecionada`);
    }

    /**
     * Generate auto tags from filename
     */
    generateAutoTags(filename) {
        const tags = [];
        const name = filename.toLowerCase().replace(/\.[^/.]+$/, ''); // Remove extension
        
        // Extract words from filename
        const words = name.split(/[_\-\s]+/);
        words.forEach(word => {
            if (word.length > 2) {
                tags.push(word);
            }
        });
        
        return tags;
    }

    /**
     * Generate unique image ID
     */
    generateImageId() {
        return 'img_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Get selected images
     */
    getSelectedImages() {
        return Array.from(this.selectedImages);
    }

    /**
     * Clear all selections
     */
    clearAllSelections() {
        this.selectedImages.clear();
        this.updateSelectionCounter();
        this.updateActionButtons();
    }
}