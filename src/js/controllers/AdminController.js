// Controller administrativo principal
export class AdminController {
    constructor(database, view) {
        this.database = database;
        this.view = view;
        this.currentSection = 'dashboard';
    }

    init() {
        this.setupNavigation();
        this.setupGlobalActions();
        this.showDashboard();
    }

    setupNavigation() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                this.switchSection(section);
            });
        });
    }

    setupGlobalActions() {
        // Export button
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.database.exportData();
            this.view.showNotification('Dados exportados com sucesso!');
        });

        // View site button
        document.getElementById('viewSiteBtn').addEventListener('click', () => {
            window.open('/index.html', '_blank');
        });
    }

    switchSection(section) {
        this.currentSection = section;
        
        // Update navigation active state
        document.querySelectorAll('.nav-item').forEach(item => {
            if (item.dataset.section === section) {
                item.classList.add('bg-orange-50', 'text-orange-600');
            } else {
                item.classList.remove('bg-orange-50', 'text-orange-600');
            }
        });

        // Update section title
        const titles = {
            dashboard: 'Dashboard',
            products: 'Produtos',
            categories: 'Categorias',
            gallery: 'Galeria de Imagens',
            settings: 'Configuracoes'
        };
        document.getElementById('sectionTitle').textContent = titles[section];

        // Load section content
        switch(section) {
            case 'dashboard':
                this.showDashboard();
                break;
            case 'products':
                this.showProducts();
                break;
            case 'categories':
                this.showCategories();
                break;
            case 'gallery':
                this.showGallery();
                break;
            case 'settings':
                this.showSettings();
                break;
        }
    }

    showDashboard() {
        const stats = this.database.getStatistics();
        this.view.showDashboard(stats);
        
        // Setup quick actions
        document.querySelectorAll('.quick-action-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                if (action === 'add-product') {
                    this.switchSection('products');
                    setTimeout(() => this.showProductForm(), 100);
                } else if (action === 'add-category') {
                    this.switchSection('categories');
                    setTimeout(() => this.showCategoryForm(), 100);
                } else if (action === 'backup') {
                    this.database.exportData();
                    this.view.showNotification('Backup realizado com sucesso!');
                }
            });
        });
    }

    showProducts() {
        const products = this.database.getProducts();
        const categories = this.database.getCategories();
        this.view.showProducts(products, categories);
        
        // Add product button
        document.getElementById('addProductBtn').addEventListener('click', () => {
            this.showProductForm();
        });
        
        // Edit buttons
        document.querySelectorAll('.edit-product-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const productId = btn.dataset.id;
                const product = this.database.getProductById(productId);
                this.showProductForm(product);
            });
        });
        
        // Delete buttons
        document.querySelectorAll('.delete-product-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (confirm('Tem certeza que deseja excluir este produto?')) {
                    this.database.deleteProduct(btn.dataset.id);
                    this.view.showNotification('Produto excluido com sucesso!');
                    this.showProducts();
                }
            });
        });
        
        // Search
        let searchTimeout;
        document.getElementById('productSearch').addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.filterProducts(e.target.value);
            }, 300);
        });
        
        // Category filter
        document.getElementById('categoryFilter').addEventListener('change', (e) => {
            this.filterProducts(null, e.target.value);
        });
    }

    filterProducts(search, categoryId) {
        const filters = {};
        if (search) filters.search = search;
        if (categoryId) filters.categoryId = categoryId;
        
        const products = this.database.getProducts(filters);
        const categories = this.database.getCategories();
        
        const tbody = document.getElementById('productsTableBody');
        tbody.innerHTML = products.map(product => this.view.createProductRow(product, categories)).join('');
        
        // Re-attach event listeners
        document.querySelectorAll('.edit-product-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const product = this.database.getProductById(btn.dataset.id);
                this.showProductForm(product);
            });
        });
        
        document.querySelectorAll('.delete-product-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (confirm('Tem certeza que deseja excluir este produto?')) {
                    this.database.deleteProduct(btn.dataset.id);
                    this.view.showNotification('Produto excluido com sucesso!');
                    this.showProducts();
                }
            });
        });
    }

    showProductForm(product = null) {
        const categories = this.database.getCategories();
        const isEdit = product !== null;
        
        const formHtml = `
            <form id="productForm" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Nome do Produto *</label>
                    <input 
                        type="text" 
                        id="productName" 
                        value="${product?.name || ''}"
                        required
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    >
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Categoria *</label>
                    <select 
                        id="productCategory" 
                        required
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
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
                    <label class="block text-sm font-medium text-gray-700 mb-1">Descricao</label>
                    <textarea 
                        id="productDescription" 
                        rows="3"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    >${product?.description || ''}</textarea>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Preco (R$)</label>
                    <input 
                        type="number" 
                        id="productPrice" 
                        value="${product?.price || ''}"
                        step="0.01"
                        min="0"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    >
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Imagem</label>
                    <div class="space-y-3">
                        <div class="flex gap-2">
                            <button 
                                type="button" 
                                id="selectFromGallery"
                                class="flex-1 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center justify-center"
                            >
                                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                </svg>
                                Galeria
                            </button>
                            <span class="flex items-center text-gray-500">ou</span>
                            <input 
                                type="file" 
                                id="productImage" 
                                accept="image/*"
                                class="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                            >
                        </div>
                        
                        <div id="selectedImagePreview" class="hidden mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                            <div class="flex items-center space-x-3">
                                <img id="previewImage" class="w-16 h-16 object-cover rounded border-2 border-green-300" alt="Preview">
                                <div class="flex-1">
                                    <p id="selectedImageName" class="text-sm font-medium text-green-800"></p>
                                    <p class="text-xs text-green-600">✅ Imagem selecionada da galeria</p>
                                </div>
                                <button type="button" id="removeSelectedImage" class="text-red-600 text-sm hover:underline px-2 py-1 rounded hover:bg-red-50">
                                    ✕ Remover
                                </button>
                            </div>
                        </div>
                        
                        ${product?.image ? `<p class="text-xs text-gray-500">Imagem atual: ${product.image.substring(0, 50)}...</p>` : ''}
                    </div>
                    <input type="hidden" id="selectedGalleryImageId" value="">
                </div>
                
                <div class="flex items-center space-x-4">
                    <label class="flex items-center">
                        <input 
                            type="checkbox" 
                            id="productActive" 
                            ${product?.active !== false ? 'checked' : ''}
                            class="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                        >
                        <span class="ml-2 text-sm text-gray-700">Produto ativo</span>
                    </label>
                    
                    <label class="flex items-center">
                        <input 
                            type="checkbox" 
                            id="productFeatured" 
                            ${product?.featured ? 'checked' : ''}
                            class="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                        >
                        <span class="ml-2 text-sm text-gray-700">Em destaque</span>
                    </label>
                </div>
                
                <div class="flex justify-end space-x-3 pt-4">
                    <button 
                        type="button" 
                        id="cancelBtn"
                        class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit" 
                        class="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                    >
                        ${isEdit ? 'Atualizar' : 'Adicionar'} Produto
                    </button>
                </div>
            </form>
        `;
        
        this.view.showModal(isEdit ? 'Editar Produto' : 'Adicionar Produto', formHtml);
        
        // Handle form submission
        document.getElementById('productForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.saveProduct(product?.id);
        });
        
        // Handle cancel
        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.view.closeModal();
        });
        
        // Handle gallery selection
        document.getElementById('selectFromGallery').addEventListener('click', () => {
            this.showGallerySelector();
        });
        
        // Handle remove selected image
        document.getElementById('removeSelectedImage').addEventListener('click', () => {
            document.getElementById('selectedGalleryImageId').value = '';
            document.getElementById('selectedImagePreview').classList.add('hidden');
            this.view.showNotification('Imagem removida', 'info');
        });
        
        // Handle image upload
        document.getElementById('productImage').addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file && file.size > 5000000) {
                alert('Imagem muito grande! Maximo 5MB.');
                e.target.value = '';
            } else if (file) {
                // Clear gallery selection when uploading new file
                document.getElementById('selectedGalleryImageId').value = '';
                document.getElementById('selectedImagePreview').classList.add('hidden');
            }
        });
        
        // Handle remove selected image
        const removeBtn = document.getElementById('removeSelectedImage');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                document.getElementById('selectedGalleryImageId').value = '';
                document.getElementById('selectedImagePreview').classList.add('hidden');
                document.getElementById('productImage').value = '';
            });
        }
    }

    showGallerySelector() {
        const images = this.database.getGalleryImages();
        
        if (images.length === 0) {
            alert('Nenhuma imagem na galeria. Adicione imagens primeiro na seção Galeria.');
            return;
        }
        
        const galleryHtml = `
            <div class="space-y-4">
                <div>
                    <input 
                        type="text" 
                        id="gallerySelectorSearch" 
                        placeholder="Buscar imagens..." 
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    >
                </div>
                
                <div id="gallerySelectorGrid" class="grid grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                    ${images.map(image => `
                        <div class="gallery-selector-item relative cursor-pointer hover:shadow-lg transition-shadow border-2 border-transparent hover:border-orange-300 rounded-lg overflow-hidden" data-image-id="${image.id}">
                            <img src="${image.url}" alt="${image.name}" class="w-full h-24 object-cover">
                            <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-1">
                                <p class="text-white text-xs truncate">${image.name}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="flex justify-end space-x-3 pt-4">
                    <button 
                        type="button" 
                        id="cancelGallerySelection"
                        class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        `;
        
        this.view.showModal('Selecionar da Galeria', galleryHtml);
        
        // Handle image selection
        document.querySelectorAll('.gallery-selector-item').forEach(item => {
            item.addEventListener('click', () => {
                console.log('Clique na imagem detectado!');
                
                // Add visual feedback immediately
                document.querySelectorAll('.gallery-selector-item').forEach(el => {
                    el.classList.remove('ring-2', 'ring-orange-500', 'bg-orange-100');
                });
                item.classList.add('ring-2', 'ring-orange-500', 'bg-orange-100');
                
                const imageId = item.dataset.imageId;
                console.log('Image ID:', imageId);
                const image = this.database.getGalleryImageById(imageId);
                console.log('Imagem encontrada:', image);
                
                if (image) {
                    // Small delay to show selection feedback
                    setTimeout(() => {
                        this.selectImageFromGallery(image);
                        this.view.closeModal();
                        // Show success notification
                        this.view.showNotification(`Imagem "${image.name}" selecionada!`, 'success');
                    }, 300);
                } else {
                    console.error('Imagem não encontrada no database!');
                    this.view.showNotification('Erro ao selecionar imagem!', 'error');
                }
            });
        });
        
        // Handle search
        document.getElementById('gallerySelectorSearch').addEventListener('input', (e) => {
            this.filterGallerySelectorImages(e.target.value);
        });
        
        // Handle cancel
        document.getElementById('cancelGallerySelection').addEventListener('click', () => {
            this.view.closeModal();
        });
    }

    selectImageFromGallery(image) {
        console.log('selectImageFromGallery chamado com:', image);
        
        const selectedGalleryImageId = document.getElementById('selectedGalleryImageId');
        const previewImage = document.getElementById('previewImage');
        const selectedImageName = document.getElementById('selectedImageName');
        const selectedImagePreview = document.getElementById('selectedImagePreview');
        const productImage = document.getElementById('productImage');
        
        console.log('Elementos encontrados:', {
            selectedGalleryImageId: !!selectedGalleryImageId,
            previewImage: !!previewImage,
            selectedImageName: !!selectedImageName,
            selectedImagePreview: !!selectedImagePreview,
            productImage: !!productImage
        });
        
        if (!selectedGalleryImageId || !previewImage || !selectedImageName || !selectedImagePreview) {
            console.error('Alguns elementos não foram encontrados!');
            return;
        }
        
        selectedGalleryImageId.value = image.id;
        previewImage.src = image.url;
        selectedImageName.textContent = image.name;
        selectedImagePreview.classList.remove('hidden');
        
        // Clear file input
        if (productImage) {
            productImage.value = '';
        }
        
        console.log('Imagem selecionada com sucesso!');
    }

    filterGallerySelectorImages(search) {
        const images = this.database.getGalleryImages(search);
        const grid = document.getElementById('gallerySelectorGrid');
        
        grid.innerHTML = images.map(image => `
            <div class="gallery-selector-item relative cursor-pointer hover:shadow-lg transition-shadow border-2 border-transparent hover:border-orange-300 rounded-lg overflow-hidden" data-image-id="${image.id}">
                <img src="${image.url}" alt="${image.name}" class="w-full h-24 object-cover">
                <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-1">
                    <p class="text-white text-xs truncate">${image.name}</p>
                </div>
            </div>
        `).join('');
        
        // Re-attach event listeners
        document.querySelectorAll('.gallery-selector-item').forEach(item => {
            item.addEventListener('click', () => {
                // Add visual feedback immediately
                document.querySelectorAll('.gallery-selector-item').forEach(el => {
                    el.classList.remove('ring-2', 'ring-orange-500', 'bg-orange-100');
                });
                item.classList.add('ring-2', 'ring-orange-500', 'bg-orange-100');
                
                const imageId = item.dataset.imageId;
                const image = this.database.getGalleryImageById(imageId);
                
                if (image) {
                    // Small delay to show selection feedback
                    setTimeout(() => {
                        this.selectImageFromGallery(image);
                        this.view.closeModal();
                        // Show success notification
                        this.view.showNotification(`Imagem "${image.name}" selecionada!`, 'success');
                    }, 300);
                } else {
                    this.view.showNotification('Erro ao selecionar imagem!', 'error');
                }
            });
        });
    }

    async saveProduct(productId = null) {
        const productData = {
            name: document.getElementById('productName').value,
            categoryId: document.getElementById('productCategory').value,
            description: document.getElementById('productDescription').value,
            price: parseFloat(document.getElementById('productPrice').value) || 0,
            active: document.getElementById('productActive').checked,
            featured: document.getElementById('productFeatured').checked
        };
        
        // Handle image - either from gallery or upload
        const selectedGalleryImageId = document.getElementById('selectedGalleryImageId').value;
        const imageFile = document.getElementById('productImage').files[0];
        
        if (selectedGalleryImageId) {
            // Use image from gallery
            const galleryImage = this.database.getGalleryImageById(selectedGalleryImageId);
            if (galleryImage) {
                productData.image = galleryImage.url;
            }
        } else if (imageFile) {
            // Upload new image
            try {
                const imageData = await this.database.saveImage(imageFile);
                productData.image = imageData;
                
                // Auto-save to gallery with smart naming and tags
                const categoryName = this.database.getCategoryById(productData.categoryId)?.name || 'Produto';
                const productName = productData.name || 'Imagem';
                
                const galleryImageData = {
                    name: `${productName} - ${categoryName}`,
                    url: imageData,
                    size: imageFile.size,
                    type: imageFile.type,
                    tags: this.generateAutoTags(productData.name, categoryName)
                };
                
                // Check if image already exists to avoid duplicates
                if (!this.database.imageExistsInGallery(imageData)) {
                    this.database.addGalleryImage(galleryImageData);
                    console.log('Imagem automaticamente salva na galeria:', galleryImageData.name);
                }
            } catch (error) {
                console.error('Erro ao processar imagem:', error);
                this.view.showNotification(`Erro: ${error.message}`, 'error');
                return; // Don't save product if image failed
            }
        }
        
        if (productId) {
            this.database.updateProduct(productId, productData);
            this.view.showNotification('Produto atualizado com sucesso!');
        } else {
            this.database.addProduct(productData);
            this.view.showNotification('Produto adicionado com sucesso!');
        }
        
        this.view.closeModal();
        this.showProducts();
    }

    generateAutoTags(productName, categoryName) {
        const tags = [];
        
        // Add category tag
        tags.push(categoryName.toLowerCase());
        
        // Generate tags based on product name
        const productLower = productName.toLowerCase();
        
        // Meat/protein tags
        if (productLower.includes('picanha')) tags.push('picanha', 'carne', 'churrasco');
        if (productLower.includes('filé') || productLower.includes('file')) tags.push('file', 'carne', 'premium');
        if (productLower.includes('frango')) tags.push('frango', 'ave', 'empanado');
        if (productLower.includes('camarão') || productLower.includes('camarao')) tags.push('camarao', 'frutos-do-mar', 'premium');
        if (productLower.includes('calabresa')) tags.push('calabresa', 'linguiça', 'defumado');
        
        // Food type tags
        if (productLower.includes('pão') || productLower.includes('sanduiche')) tags.push('sanduiche', 'lanche');
        if (productLower.includes('executivo')) tags.push('executivo', 'prato-individual', 'completo');
        if (productLower.includes('chapa')) tags.push('chapa', 'grelhado', 'quente');
        if (productLower.includes('empanado')) tags.push('empanado', 'crocante', 'frito');
        if (productLower.includes('queijo')) tags.push('queijo', 'laticinio');
        if (productLower.includes('bebida') || productLower.includes('refrigerante') || productLower.includes('cerveja')) {
            tags.push('bebida', 'gelado', 'refrescante');
        }
        
        // Preparation tags
        if (productLower.includes('grill') || productLower.includes('grelhado')) tags.push('grelhado');
        if (productLower.includes('frito')) tags.push('frito');
        if (productLower.includes('assado')) tags.push('assado');
        
        // Remove duplicates and return
        return [...new Set(tags)];
    }

    showCategories() {
        const categories = this.database.getCategories();
        this.view.showCategories(categories);
        
        // Add category button
        document.getElementById('addCategoryBtn').addEventListener('click', () => {
            this.showCategoryForm();
        });
        
        // Edit buttons
        document.querySelectorAll('.edit-category-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const category = this.database.getCategoryById(btn.dataset.id);
                this.showCategoryForm(category);
            });
        });
        
        // Delete buttons
        document.querySelectorAll('.delete-category-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (confirm('Tem certeza? Todos os produtos desta categoria serao removidos!')) {
                    this.database.deleteCategory(btn.dataset.id);
                    this.view.showNotification('Categoria excluida com sucesso!');
                    this.showCategories();
                }
            });
        });
    }

    showCategoryForm(category = null) {
        const isEdit = category !== null;
        
        const formHtml = `
            <form id="categoryForm" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Nome da Categoria *</label>
                    <input 
                        type="text" 
                        id="categoryName" 
                        value="${category?.name || ''}"
                        required
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    >
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Ordem de Exibicao</label>
                    <input 
                        type="number" 
                        id="categoryOrder" 
                        value="${category?.order || ''}"
                        min="1"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    >
                </div>
                
                <div class="flex items-center">
                    <input 
                        type="checkbox" 
                        id="categoryActive" 
                        ${category?.active !== false ? 'checked' : ''}
                        class="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    >
                    <label for="categoryActive" class="ml-2 text-sm text-gray-700">
                        Categoria ativa
                    </label>
                </div>
                
                <div class="flex justify-end space-x-3 pt-4">
                    <button 
                        type="button" 
                        id="cancelBtn"
                        class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit" 
                        class="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                    >
                        ${isEdit ? 'Atualizar' : 'Adicionar'} Categoria
                    </button>
                </div>
            </form>
        `;
        
        this.view.showModal(isEdit ? 'Editar Categoria' : 'Adicionar Categoria', formHtml);
        
        // Handle form submission
        document.getElementById('categoryForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveCategory(category?.id);
        });
        
        // Handle cancel
        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.view.closeModal();
        });
    }

    saveCategory(categoryId = null) {
        const categoryData = {
            name: document.getElementById('categoryName').value,
            order: parseInt(document.getElementById('categoryOrder').value) || 999,
            active: document.getElementById('categoryActive').checked
        };
        
        if (categoryId) {
            this.database.updateCategory(categoryId, categoryData);
            this.view.showNotification('Categoria atualizada com sucesso!');
        } else {
            this.database.addCategory(categoryData);
            this.view.showNotification('Categoria adicionada com sucesso!');
        }
        
        this.view.closeModal();
        this.showCategories();
    }

    showSettings() {
        const restaurant = this.database.getRestaurant();
        this.view.showSettings(restaurant);
        
        // Restaurant form
        document.getElementById('restaurantForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveRestaurantSettings();
        });
        
        // Export data
        document.getElementById('exportDataBtn').addEventListener('click', () => {
            this.database.exportData();
            this.view.showNotification('Dados exportados com sucesso!');
        });
        
        // Import data
        document.getElementById('importDataBtn').addEventListener('click', () => {
            const fileInput = document.getElementById('importFile');
            const file = fileInput.files[0];
            
            if (!file) {
                alert('Selecione um arquivo para importar');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    if (this.database.importData(e.target.result)) {
                        this.view.showNotification('Dados importados com sucesso!');
                        setTimeout(() => location.reload(), 1500);
                    } else {
                        this.view.showNotification('Erro ao importar dados', 'error');
                    }
                } catch (error) {
                    this.view.showNotification('Arquivo invalido', 'error');
                }
            };
            reader.readAsText(file);
        });
    }

    showGallery() {
        const images = this.database.getGalleryImages();
        this.view.showGallery(images);
        
        // Upload multiple images
        document.getElementById('uploadImagesBtn').addEventListener('click', () => {
            this.showImageUploadForm();
        });
        
        // Upload from URL
        document.getElementById('uploadFromUrlBtn').addEventListener('click', () => {
            this.showUrlUploadForm();
        });
        
        // Search functionality
        let searchTimeout;
        document.getElementById('gallerySearch').addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.filterGalleryImages(e.target.value);
            }, 300);
        });
        
        // Delete image buttons
        document.querySelectorAll('.delete-image-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (confirm('Tem certeza que deseja excluir esta imagem?')) {
                    this.database.deleteGalleryImage(btn.dataset.imageId);
                    this.view.showNotification('Imagem excluida com sucesso!');
                    this.showGallery();
                }
            });
        });
    }

    showImageUploadForm() {
        const formHtml = `
            <form id="imageUploadForm" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Selecionar Imagens</label>
                    <input 
                        type="file" 
                        id="imageFiles" 
                        multiple
                        accept="image/*"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                    <p class="text-xs text-gray-500 mt-1">Pode selecionar múltiplas imagens (máx 5MB cada)</p>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Tags (opcional)</label>
                    <input 
                        type="text" 
                        id="imageTags" 
                        placeholder="comida, bebida, sobremesa (separado por vírgula)"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    >
                </div>
                
                <div class="flex justify-end space-x-3 pt-4">
                    <button 
                        type="button" 
                        id="cancelBtn"
                        class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit" 
                        class="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                    >
                        Upload Imagens
                    </button>
                </div>
            </form>
        `;
        
        this.view.showModal('Upload de Imagens', formHtml);
        
        document.getElementById('imageUploadForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.uploadImages();
        });
        
        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.view.closeModal();
        });
    }

    showUrlUploadForm() {
        const formHtml = `
            <form id="urlUploadForm" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">URL da Imagem</label>
                    <input 
                        type="url" 
                        id="imageUrl" 
                        placeholder="https://exemplo.com/imagem.jpg"
                        required
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    >
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Nome da Imagem</label>
                    <input 
                        type="text" 
                        id="imageName" 
                        placeholder="Nome descritivo da imagem"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    >
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Tags (opcional)</label>
                    <input 
                        type="text" 
                        id="imageTags" 
                        placeholder="comida, bebida, sobremesa (separado por vírgula)"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    >
                </div>
                
                <div class="flex justify-end space-x-3 pt-4">
                    <button 
                        type="button" 
                        id="cancelBtn"
                        class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit" 
                        class="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                    >
                        Adicionar Imagem
                    </button>
                </div>
            </form>
        `;
        
        this.view.showModal('Adicionar Imagem por URL', formHtml);
        
        document.getElementById('urlUploadForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.uploadFromUrl();
        });
        
        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.view.closeModal();
        });
    }

    async uploadImages() {
        const files = document.getElementById('imageFiles').files;
        const tags = document.getElementById('imageTags').value.split(',').map(tag => tag.trim()).filter(tag => tag);
        
        if (!files.length) {
            alert('Selecione pelo menos uma imagem');
            return;
        }
        
        for (let file of files) {
            if (file.size > 5000000) {
                alert(`Imagem ${file.name} muito grande! Máximo 5MB.`);
                continue;
            }
            
            try {
                const imageData = await this.database.saveImage(file);
                this.database.addGalleryImage({
                    name: file.name,
                    url: imageData,
                    size: file.size,
                    type: file.type,
                    tags: tags
                });
            } catch (error) {
                console.error('Erro ao processar imagem:', error);
            }
        }
        
        this.view.showNotification('Imagens adicionadas com sucesso!');
        this.view.closeModal();
        this.showGallery();
    }

    uploadFromUrl() {
        const url = document.getElementById('imageUrl').value;
        const name = document.getElementById('imageName').value || 'Imagem da URL';
        const tags = document.getElementById('imageTags').value.split(',').map(tag => tag.trim()).filter(tag => tag);
        
        this.database.addGalleryImage({
            name: name,
            url: url,
            size: 0,
            type: 'image/jpeg',
            tags: tags
        });
        
        this.view.showNotification('Imagem adicionada com sucesso!');
        this.view.closeModal();
        this.showGallery();
    }

    filterGalleryImages(search) {
        const images = this.database.getGalleryImages(search);
        const grid = document.getElementById('galleryGrid');
        
        if (grid) {
            grid.innerHTML = images.map(image => this.view.createGalleryImageCard(image)).join('');
            
            // Re-attach event listeners
            document.querySelectorAll('.delete-image-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    if (confirm('Tem certeza que deseja excluir esta imagem?')) {
                        this.database.deleteGalleryImage(btn.dataset.imageId);
                        this.view.showNotification('Imagem excluida com sucesso!');
                        this.showGallery();
                    }
                });
            });
        }
    }

    saveRestaurantSettings() {
        const restaurantData = {
            name: document.getElementById('restaurantName').value,
            logo: document.getElementById('restaurantLogo').value,
            banner: document.getElementById('restaurantBanner').value
        };
        
        this.database.updateRestaurant(restaurantData);
        this.view.showNotification('Configuracoes salvas com sucesso!');
    }
}