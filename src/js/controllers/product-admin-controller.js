// Controller para gerenciamento de produtos no painel admin
export class ProductAdminController {
    constructor(database, view, adminController) {
        this.database = database;
        this.view = view;
        this.adminController = adminController; // Referência ao controller principal
    }

    /**
     * Exibir lista de produtos
     */
    async showProducts() {
        // Force reload to get fresh data from Supabase
        await this.database.forceReload();
        
        const products = this.database.getProducts();
        const categories = this.database.getCategories();
        
        this.view.showProducts(products, categories);
        
        // Add product button
        document.getElementById('addProductBtn')?.addEventListener('click', () => {
            this.showProductForm();
        });
        
        // Edit rows - entire row is clickable
        document.querySelectorAll('.edit-product-row').forEach(row => {
            row.addEventListener('click', () => {
                const productId = row.dataset.id;
                const product = this.database.getProductById(productId);
                this.showProductForm(product);
            });
        });
        
        // Search
        let searchTimeout;
        document.getElementById('productSearch')?.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.filterProducts(e.target.value);
            }, 300);
        });
        
        // Category filter
        document.getElementById('categoryFilter')?.addEventListener('change', (e) => {
            this.filterProducts(null, e.target.value);
        });
    }

    /**
     * Filtrar produtos
     */
    filterProducts(search, categoryId) {
        const filters = {};
        if (search) filters.search = search;
        if (categoryId) filters.categoryId = categoryId;
        
        const products = this.database.getProducts(filters);
        const categories = this.database.getCategories();
        
        // Update table
        const tbody = document.getElementById('productsTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = products.map(product => {
            const category = categories.find(c => c.id === product.categoryId);
            return this.view.createProductRow(product, category);
        }).join('');
        
        // Re-attach click handlers
        document.querySelectorAll('.edit-product-row').forEach(row => {
            row.addEventListener('click', () => {
                const productId = row.dataset.id;
                const product = this.database.getProductById(productId);
                this.showProductForm(product);
            });
        });
    }

    /**
     * Exibir formulário de produto
     */
    showProductForm(product = null) {
        const categories = this.database.getCategories();
        const galleryImages = this.database.getGalleryImages();
        
        // Render form in content area (like original)
        const formHtml = this.createProductFormHtml(product, categories, galleryImages);
        document.getElementById('contentArea').innerHTML = formHtml;
        
        // Setup form handlers
        this.setupProductFormHandlers(product);
    }

    /**
     * Configurar handlers do formulário de produto
     */
    setupProductFormHandlers(product) {
        const form = document.getElementById('productForm');
        if (!form) return;

        // Form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProduct(product?.id);
        });

        // Cancel button
        document.getElementById('cancelProductBtn')?.addEventListener('click', () => {
            this.showProducts();
        });

        // Setup image tabs
        this.setupImageTabs();

        // Setup gallery image selection
        this.setupGalleryImageSelection();

        // Setup new image upload
        this.setupImageUpload();

        // Setup tags system
        this.adminController.tagsController.setupTagsEvents();

        // Auto-select featured tag if available
        const tagCheckboxes = document.querySelectorAll('.tag-checkbox');
        if (!product && tagCheckboxes.length > 0) {
            // Auto-selecionar tag de destaque se existir
            tagCheckboxes.forEach(checkbox => {
                if (checkbox.dataset.tagName?.toLowerCase().includes('destaque')) {
                    checkbox.checked = true;
                    checkbox.dispatchEvent(new Event('change'));
                }
            });
        }
        
        // Image selection
        document.getElementById('selectImageBtn')?.addEventListener('click', () => {
            this.adminController.galleryController.showGalleryForSelection();
        });
        
        // Preview button
        document.getElementById('previewProductBtn')?.addEventListener('click', () => {
            this.showProductPreview();
        });
        
        // Featured toggle
        document.getElementById('isFeatured')?.addEventListener('change', (e) => {
            this.handleFeaturedToggle(e.target.checked);
        });
        
        // Sale toggle
        document.getElementById('isOnSale')?.addEventListener('change', (e) => {
            this.handleSaleToggle(e.target.checked);
        });
    }

    /**
     * Salvar produto
     */
    async saveProduct(productId = null) {
        try {
            // Get form data
            const formData = this.getProductFormData();
            
            // Validate
            if (!this.validateProductForm(formData)) {
                return;
            }
            
            // Prepare product data
            const productData = {
                ...formData,
                id: productId || this.generateProductId(),
                active: document.getElementById('productActive')?.checked ?? true,
                updatedAt: new Date().toISOString()
            };
            
            // Save
            if (productId) {
                await this.database.updateProduct(productId, productData);
                this.view.showNotification('Produto atualizado com sucesso!');
            } else {
                await this.database.addProduct(productData);
                this.view.showNotification('Produto adicionado com sucesso!');
            }
            
            // Return to products list
            await this.showProducts();
            
        } catch (error) {
            console.error('Erro ao salvar produto:', error);
            this.view.showNotification('Erro ao salvar produto: ' + error.message, 'error');
        }
    }

    /**
     * Obter dados do formulário
     */
    getProductFormData() {
        return {
            name: document.getElementById('productName')?.value?.trim(),
            description: document.getElementById('productDescription')?.value?.trim(),
            price: parseFloat(document.getElementById('productPrice')?.value) || 0,
            categoryId: document.getElementById('productCategory')?.value,
            image: document.getElementById('selectedGalleryImageId')?.value || '',
            isFeatured: document.getElementById('isFeatured')?.checked || false,
            isOnSale: document.getElementById('isOnSale')?.checked || false,
            salePrice: parseFloat(document.getElementById('salePrice')?.value) || 0,
            tagIds: this.getSelectedTags()
        };
    }

    /**
     * Validar formulário
     */
    validateProductForm(data) {
        if (!data.name) {
            this.view.showNotification('Por favor, insira o nome do produto', 'error');
            return false;
        }
        
        if (!data.categoryId) {
            this.view.showNotification('Por favor, selecione uma categoria', 'error');
            return false;
        }
        
        if (data.price <= 0) {
            this.view.showNotification('Por favor, insira um preço válido', 'error');
            return false;
        }
        
        if (data.isOnSale && data.salePrice >= data.price) {
            this.view.showNotification('O preço promocional deve ser menor que o preço original', 'error');
            return false;
        }
        
        return true;
    }

    /**
     * Mostrar confirmação de exclusão
     */
    showDeleteConfirmation(product) {
        const modal = document.getElementById('deleteModal');
        const productNameEl = document.getElementById('deleteProductName');
        
        if (modal && productNameEl) {
            productNameEl.textContent = product.name;
            modal.classList.remove('hidden');
            
            // Confirm delete
            document.getElementById('confirmDeleteBtn')?.addEventListener('click', async () => {
                await this.deleteProduct(product.id);
                modal.classList.add('hidden');
            });
            
            // Cancel delete
            document.getElementById('cancelDeleteBtn')?.addEventListener('click', () => {
                modal.classList.add('hidden');
            });
        }
    }

    /**
     * Excluir produto
     */
    async deleteProduct(productId) {
        try {
            await this.database.deleteProduct(productId);
            this.view.showNotification('Produto excluído com sucesso!');
            await this.showProducts();
        } catch (error) {
            console.error('Erro ao excluir produto:', error);
            this.view.showNotification('Erro ao excluir produto', 'error');
        }
    }

    /**
     * Mostrar preview do produto
     */
    showProductPreview() {
        const formData = this.getProductFormData();
        
        if (!formData.name || !formData.price) {
            this.view.showNotification('Preencha o nome e preço para visualizar', 'warning');
            return;
        }
        
        const previewProduct = {
            ...formData,
            id: 'preview'
        };
        
        const previewHtml = this.createProductCardPreview(previewProduct);
        
        // Show in modal
        const modal = document.getElementById('previewModal');
        const content = document.getElementById('previewContent');
        
        if (modal && content) {
            content.innerHTML = previewHtml;
            modal.classList.remove('hidden');
            
            // Close modal
            document.getElementById('closePreviewBtn')?.addEventListener('click', () => {
                modal.classList.add('hidden');
            });
        }
    }

    /**
     * Criar preview do card de produto
     */
    createProductCardPreview(product, size = 'small') {
        const imageUrl = product.image || '/images/placeholder.jpg';
        const displayPrice = product.isOnSale ? product.salePrice : product.price;
        
        return `
            <div class="product-card-preview ${size}">
                <div class="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div class="aspect-w-1 aspect-h-1">
                        <img src="${imageUrl}" alt="${product.name}" class="w-full h-48 object-cover">
                    </div>
                    <div class="p-4">
                        <h3 class="text-lg font-semibold mb-2">${product.name}</h3>
                        <p class="text-gray-600 text-sm mb-2">${product.description || ''}</p>
                        <div class="flex items-center justify-between">
                            ${product.isOnSale ? `
                                <div>
                                    <span class="text-lg font-bold text-green-600">R$ ${displayPrice.toFixed(2)}</span>
                                    <span class="text-sm text-gray-400 line-through ml-2">R$ ${product.price.toFixed(2)}</span>
                                </div>
                            ` : `
                                <span class="text-lg font-bold">R$ ${displayPrice.toFixed(2)}</span>
                            `}
                        </div>
                        ${product.isFeatured ? '<span class="badge badge-featured">Destaque</span>' : ''}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Lidar com toggle de destaque
     */
    handleFeaturedToggle(isChecked) {
        const tagCheckboxes = document.querySelectorAll('.tag-checkbox');
        if (isChecked) {
            // Auto-selecionar tag de destaque se existir
            tagCheckboxes.forEach(checkbox => {
                if (checkbox.dataset.tagName?.toLowerCase().includes('destaque')) {
                    checkbox.checked = true;
                }
            });
        }
    }

    /**
     * Lidar com toggle de promoção
     */
    handleSaleToggle(isChecked) {
        const salePriceGroup = document.getElementById('salePriceGroup');
        if (salePriceGroup) {
            salePriceGroup.style.display = isChecked ? 'block' : 'none';
        }
    }

    /**
     * Criar HTML do formulário de produto
     */
    createProductFormHtml(product = null, categories = [], galleryImages = []) {
        const isEdit = !!product;
        const selectedTags = product?.tags || [];

        return `
            <div class="bg-white rounded-lg shadow-sm">
                <div class="px-6 py-4 border-b border-gray-200">
                    <h2 class="text-lg font-semibold text-gray-900">${isEdit ? 'Editar Produto' : 'Adicionar Produto'}</h2>
                </div>
                
                <form id="productForm" class="p-6 space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Coluna Esquerda -->
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Nome do Produto *</label>
                            <input 
                                type="text" 
                                id="productName" 
                                value="${product?.name || ''}"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                                required
                            >
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Preço *</label>
                            <div class="relative">
                                <span class="absolute left-3 top-2 text-gray-500">R$</span>
                                <input 
                                    type="number" 
                                    id="productPrice" 
                                    value="${product?.price || ''}"
                                    step="0.01"
                                    min="0"
                                    class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                                    required
                                >
                            </div>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Categoria *</label>
                            <select 
                                id="productCategory" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                                required
                            >
                                <option value="">Selecione uma categoria</option>
                                ${categories.map(cat => `
                                    <option value="${cat.id}" ${product?.categoryId === cat.id ? 'selected' : ''}>
                                        ${cat.name}
                                    </option>
                                `).join('')}
                            </select>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                            <textarea 
                                id="productDescription" 
                                rows="4"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                                placeholder="Descreva os ingredientes e características do produto..."
                            >${product?.description || ''}</textarea>
                        </div>
                    </div>

                    <!-- Coluna Direita -->
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Imagem do Produto</label>
                            
                            <!-- Image Selection Tabs -->
                            <div class="border-b border-gray-200 mb-4">
                                <nav class="-mb-px flex space-x-8">
                                    <button type="button" 
                                        class="tab-button whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm border-orange-500 text-orange-600" 
                                        data-tab="gallery">
                                        Galeria de Imagens
                                    </button>
                                    <button type="button" 
                                        class="tab-button whitespace-nowrap py-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm" 
                                        data-tab="upload">
                                        Upload Novo
                                    </button>
                                </nav>
                            </div>

                            <!-- Gallery Tab -->
                            <div id="gallery-tab" class="tab-content">
                                ${galleryImages.length > 0 ? `
                                    <div class="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                                        ${galleryImages.slice(0, 12).filter(img => img.url).map(img => `
                                            <div class="relative group cursor-pointer border-2 rounded-lg overflow-hidden hover:border-orange-500 transition-colors ${product?.galleryImageId === img.id ? 'border-orange-500 ring-2 ring-orange-200' : 'border-gray-200'}">
                                                <input type="radio" name="imageSource" value="gallery-${img.id}" class="sr-only gallery-image-radio" ${product?.galleryImageId === img.id ? 'checked' : ''}>
                                                <img src="${img.url}" alt="${img.name || 'Imagem'}" class="w-full h-20 object-cover">
                                                <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center">
                                                    <div class="text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                ` : `
                                    <div class="text-center py-8 text-gray-500">
                                        <svg class="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                        </svg>
                                        <p>Nenhuma imagem disponível na galeria</p>
                                        <p class="text-sm">Adicione imagens primeiro na seção Galeria</p>
                                    </div>
                                `}
                            </div>

                            <!-- Upload Tab -->
                            <div id="upload-tab" class="tab-content hidden">
                                <div class="space-y-3">
                                    <input type="file" id="newImageFile" accept="image/*" class="hidden">
                                    <button type="button" id="selectImageBtn" class="w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-orange-500 hover:text-orange-600 transition-colors">
                                        <svg class="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                        </svg>
                                        Selecionar Imagem
                                    </button>
                                    <div id="imagePreview" class="hidden">
                                        <img id="previewImg" class="w-full h-40 object-cover rounded-lg border">
                                        <input type="radio" name="imageSource" value="upload" class="sr-only">
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Tags Section -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Tags do Produto</label>
                            <div id="productTagsContainer">
                                ${this.adminController.tagsController.renderCompactTagsSelector(selectedTags)}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex justify-end space-x-3 pt-6 border-t">
                    <button type="button" id="cancelProductBtn" class="px-4 py-2 text-gray-600 hover:text-gray-700 font-medium">
                        Cancelar
                    </button>
                    <button type="submit" class="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors">
                        ${isEdit ? 'Atualizar' : 'Adicionar'} Produto
                    </button>
                </div>
            </form>
            </div>
        `;
    }

    /**
     * Obter tags selecionadas
     */
    getSelectedTags() {
        const selectedTags = [];
        document.querySelectorAll('.tag-checkbox:checked').forEach(checkbox => {
            selectedTags.push(checkbox.value);
        });
        return selectedTags;
    }

    /**
     * Gerar ID único para produto
     */
    generateProductId() {
        return 'product_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Gerar tags automáticas
     */
    generateAutoTags(productName, categoryName) {
        const tags = [];
        
        // Tags baseadas no nome do produto
        if (productName) {
            const keywords = productName.toLowerCase().split(/\s+/);
            keywords.forEach(keyword => {
                if (keyword.length > 3) {
                    tags.push(keyword);
                }
            });
        }
        
        // Tag da categoria
        if (categoryName) {
            tags.push(categoryName.toLowerCase());
        }
        
        return [...new Set(tags)]; // Remove duplicatas
    }

    /**
     * Setup image tabs
     */
    setupImageTabs() {
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', () => {
                const tab = button.dataset.tab;
                
                // Update button states
                document.querySelectorAll('.tab-button').forEach(btn => {
                    btn.classList.remove('border-orange-500', 'text-orange-600');
                    btn.classList.add('border-transparent', 'text-gray-500');
                });
                button.classList.remove('border-transparent', 'text-gray-500');
                button.classList.add('border-orange-500', 'text-orange-600');
                
                // Update content visibility
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.add('hidden');
                });
                document.getElementById(`${tab}-tab`).classList.remove('hidden');
            });
        });
    }

    /**
     * Setup gallery image selection
     */
    setupGalleryImageSelection() {
        document.querySelectorAll('.gallery-image-radio').forEach(radio => {
            const container = radio.closest('.relative');
            
            container.addEventListener('click', () => {
                // Clear other selections
                document.querySelectorAll('.gallery-image-radio').forEach(r => {
                    r.checked = false;
                    r.closest('.relative').classList.remove('border-orange-500', 'ring-2', 'ring-orange-200');
                    r.closest('.relative').classList.add('border-gray-200');
                });
                
                // Select this one
                radio.checked = true;
                container.classList.remove('border-gray-200');
                container.classList.add('border-orange-500', 'ring-2', 'ring-orange-200');
            });
        });
    }

    /**
     * Setup image upload
     */
    setupImageUpload() {
        const selectBtn = document.getElementById('selectImageBtn');
        const fileInput = document.getElementById('newImageFile');
        const preview = document.getElementById('imagePreview');
        const previewImg = document.getElementById('previewImg');
        
        selectBtn?.addEventListener('click', () => {
            fileInput.click();
        });
        
        fileInput?.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    previewImg.src = e.target.result;
                    preview.classList.remove('hidden');
                    
                    // Auto-select upload option
                    const uploadRadio = preview.querySelector('input[type="radio"]');
                    if (uploadRadio) {
                        uploadRadio.checked = true;
                        
                        // Clear gallery selections
                        document.querySelectorAll('.gallery-image-radio').forEach(r => {
                            r.checked = false;
                            r.closest('.relative').classList.remove('border-orange-500', 'ring-2', 'ring-orange-200');
                            r.closest('.relative').classList.add('border-gray-200');
                        });
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }
}