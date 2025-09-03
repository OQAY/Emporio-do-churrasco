// Controller para gerenciamento do sistema de tags no painel admin
export class TagsAdminController {
    constructor(database, view, adminController) {
        this.database = database;
        this.view = view;
        this.adminController = adminController;
    }

    /**
     * Setup tag system for image tags (gallery)
     */
    setupTagSystem() {
        const tagInput = document.getElementById('tagInput');
        const tagSuggestions = document.getElementById('tagSuggestions');
        const selectedTags = document.getElementById('selectedTags');
        const imageTagsInput = document.getElementById('imageTags');

        if (!tagInput) return;

        tagInput.addEventListener('focus', () => {
            tagSuggestions.classList.remove('hidden');
        });

        // Hide suggestions when clicking outside
        tagInput.addEventListener('blur', () => {
            setTimeout(() => {
                tagSuggestions.classList.add('hidden');
            }, 200);
        });

        tagInput.addEventListener('input', (e) => {
            const filter = e.target.value.toLowerCase();
            const suggestions = tagSuggestions.querySelectorAll('.tag-suggestion');
            
            let hasVisible = false;
            suggestions.forEach(suggestion => {
                const tag = suggestion.dataset.tag;
                if (tag.includes(filter)) {
                    suggestion.style.display = 'block';
                    hasVisible = true;
                } else {
                    suggestion.style.display = 'none';
                }
            });
            
            if (hasVisible) {
                tagSuggestions.classList.remove('hidden');
            }
        });

        // Add tag on Enter
        tagInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const tag = tagInput.value.trim().toLowerCase();
                if (tag) {
                    this.addTag(tag);
                    tagInput.value = '';
                }
            }
        });

        // Tag suggestion click
        document.querySelectorAll('.tag-suggestion').forEach(btn => {
            btn.addEventListener('click', () => {
                this.addTag(btn.dataset.tag);
                tagInput.value = '';
            });
        });

        // Make removeTag function global for onclick
        window.removeTag = (tag) => {
            this.removeTag(tag);
        };
    }

    /**
     * Add tag to image (gallery tags)
     */
    addTag(tag) {
        const selectedTags = document.getElementById('selectedTags');
        const imageTagsInput = document.getElementById('imageTags');

        // Get current tags
        let tags = imageTagsInput.value ? imageTagsInput.value.split(',') : [];

        // Add tag if not already present
        if (!tags.includes(tag)) {
            tags.push(tag);
            imageTagsInput.value = tags.join(',');

            // Add visual tag
            const tagElement = document.createElement('span');
            tagElement.className = 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800';
            tagElement.innerHTML = `
                ${tag}
                <button type="button" class="ml-1 text-orange-600 hover:text-orange-800" onclick="removeTag('${tag}')">
                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"></path>
                    </svg>
                </button>
            `;
            selectedTags.appendChild(tagElement);
        }
    }

    /**
     * Remove tag from image (gallery tags)
     */
    removeTag(tag) {
        const selectedTags = document.getElementById('selectedTags');
        const imageTagsInput = document.getElementById('imageTags');

        // Update hidden input
        let tags = imageTagsInput.value.split(',').filter(t => t !== tag);
        imageTagsInput.value = tags.join(',');

        // Remove visual tag
        const tagElements = selectedTags.querySelectorAll('span');
        tagElements.forEach(el => {
            if (el.textContent.trim().startsWith(tag)) {
                el.remove();
            }
        });
    }

    /**
     * Render compact tags selector for products
     */
    renderCompactTagsSelector(selectedTags = []) {
        const availableTags = this.database.getProductTags();

        // If no tags from database, use fallback tags
        const tagsToShow = availableTags.length > 0 ? availableTags : [
            { id: 'spicy', name: 'Apimentado', icon: '🌶️', color: '#ef4444' },
            { id: 'vegetarian', name: 'Vegetariano', icon: '🥗', color: '#22c55e' },
            { id: 'popular', name: 'Popular', icon: '⭐', color: '#f59e0b' },
            { id: 'new', name: 'Novidade', icon: '✨', color: '#8b5cf6' }
        ];

        return `
            <div id="productTagsContainer">
                <!-- Compact Header with Expandable Tags -->
                <div class="space-y-3">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <span class="text-sm font-medium text-gray-700">Tags do Produto</span>
                            <button type="button" 
                                id="toggleTagsBtn"
                                class="flex items-center gap-1 px-2 py-1 text-xs bg-orange-50 text-orange-600 rounded-full hover:bg-orange-100 transition-colors">
                                <span>${tagsToShow.length} Tags Disponíveis</span>
                                <svg class="w-4 h-4 transition-transform" id="toggleTagsIcon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                                </svg>
                            </button>
                        </div>
                        ${selectedTags.length > 0 ? `
                            <span class="text-xs text-orange-600 font-medium">
                                ${selectedTags.length} selecionada${selectedTags.length !== 1 ? 's' : ''}
                            </span>
                        ` : ''}
                    </div>

                <!-- Tags Grid - Initially Hidden -->
                <div id="tagsGrid" class="hidden">
                    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        ${tagsToShow.map(tag => {
                            const isSelected = selectedTags.includes(tag.id);
                            return `
                                <label class="group cursor-pointer transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
                                    <input type="checkbox" 
                                        name="productTags" 
                                        value="${tag.id}"
                                        ${isSelected ? 'checked' : ''}
                                        class="hidden tag-checkbox"
                                    >
                                    <div class="tag-card relative overflow-hidden rounded-xl border-2 transition-all duration-300 ${
                                        isSelected ? 'border-transparent shadow-lg' : 'border-gray-200'
                                    }"
                                    style="${isSelected ? `background: linear-gradient(135deg, ${tag.color}ee, ${tag.color});` : 'background: linear-gradient(135deg, #ffffff, #f8fafc);'}"
                                    data-color="${tag.color}">
                                        <!-- Selection indicator -->
                                        <div class="absolute top-1 right-1 w-5 h-5 rounded-full ${
                                            isSelected ? 'bg-white bg-opacity-30 border-2 border-white' : 'bg-gray-200 border-gray-300 border'
                                        } transition-all duration-300 flex items-center justify-center">
                                            ${isSelected ? `
                                                <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                                                </svg>
                                            ` : ''}
                                        </div>

                                        <!-- Delete button for each tag -->
                                        <button type="button"
                                            class="delete-tag-btn absolute top-1 left-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all duration-200 flex items-center justify-center shadow-md"
                                            data-tag-id="${tag.id}"
                                            title="Deletar tag"
                                            style="font-size: 10px; line-height: 1;">
                                            ×
                                        </button>

                                        <!-- Card content -->
                                        <div class="p-3 text-center">
                                            <div class="text-2xl mb-1 filter ${isSelected ? 'drop-shadow-sm' : ''}">${tag.icon}</div>
                                            <div class="text-xs font-semibold ${isSelected ? 'text-white' : 'text-gray-700'} truncate">${tag.name}</div>
                                        </div>
                                    </div>
                                </label>
                            `;
                        }).join('')}

                    <!-- Add Custom Tag Card -->
                    <div class="tag-add-card group cursor-pointer transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]" id="addCustomTagCard">
                        <div class="h-full rounded-xl border-2 border-dashed border-gray-300 group-hover:border-orange-400 transition-all duration-200 flex flex-col items-center justify-center p-3 text-center bg-gradient-to-br from-gray-50 to-gray-100 group-hover:from-orange-50 group-hover:to-orange-100">
                            <div class="text-2xl mb-1 opacity-60 group-hover:opacity-80 transition-opacity">➕</div>
                            <div class="space-y-1">
                                <span class="text-xs font-medium text-gray-500 group-hover:text-orange-600 transition-colors duration-200">Nova Tag</span>
                            </div>
                        </div>
                    </div>
                    </div>

                <!-- Custom Tag Creation Panel -->
                <div id="customTagSection" class="hidden">
                    <div class="mt-6 p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border-2 border-orange-200">
                        <!-- Header with close button -->
                        <div class="flex items-center justify-between mb-6">
                            <div>
                                <div class="flex items-center gap-2">
                                    <div class="w-2 h-2 bg-orange-500 rounded-full"></div>
                                    <h3 class="text-lg font-semibold text-gray-800">Criar Tag Personalizada</h3>
                                    <p class="text-sm text-gray-600">Defina um nome, emoji e cor para sua nova tag</p>
                                </div>
                            </div>
                            <button type="button" id="cancelCreateTag" class="text-gray-400 hover:text-gray-600 transition-colors">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>

                        <!-- Form fields -->
                        <div class="space-y-4 mb-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Nome da Tag *
                                </label>
                                <input 
                                    type="text" 
                                    id="customTagName" 
                                    class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all" 
                                    placeholder="Ex: Vegano, Sem Glúten, Premium..."
                                    maxlength="20"
                                >
                            </div>

                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        Emoji
                                    </label>
                                    <div class="relative">
                                        <input 
                                            type="text" 
                                            id="customTagIcon" 
                                            class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all" 
                                            placeholder="🏷️" 
                                            maxlength="4"
                                        >
                                        <button type="button" class="text-xs text-orange-600 hover:text-orange-700 font-medium" onclick="document.getElementById('customTagIcon').value = ['🔥','⭐','✨','👑','💎','🎯','🚀','❤️','🌟','🏆'][Math.floor(Math.random()*10)]">
                                            Aleatório
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        Cor
                                    </label>
                                    <div class="space-y-2">
                                        <input 
                                            type="color" 
                                            id="customTagColor" 
                                            class="w-full h-10 border border-gray-300 rounded-lg cursor-pointer" 
                                            value="#f59e0b"
                                        >
                                        <div class="grid grid-cols-6 gap-1">
                                            ${['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'].map(color => `
                                                <button type="button" 
                                                    class="w-6 h-6 rounded border-2 border-white shadow-sm hover:scale-110 transition-transform" 
                                                    style="background-color: ${color}"
                                                    onclick="document.getElementById('customTagColor').value = '${color}'"></button>
                                            `).join('')}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Preview -->
                            <div class="p-3 bg-white rounded-lg border border-gray-200">
                                <div class="flex items-center gap-2">
                                    <span class="text-sm text-gray-600">Sua tag ficará assim:</span>
                                    <div id="tagPreview" class="px-3 py-1.5 text-sm font-medium rounded-full border-2 border-gray-300 text-gray-700">
                                        🏷️ Nova Tag
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Actions -->
                        <div class="flex gap-3 justify-end">
                            <button 
                                type="button" 
                                id="cancelCreateTagAlt"
                                class="px-4 py-2 text-gray-600 hover:text-gray-700 font-medium transition-colors">
                                Cancelar
                            </button>
                            <button 
                                type="button" 
                                id="confirmCreateTag"
                                class="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors flex items-center gap-2">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                </svg>
                                Criar Tag
                            </button>
                        </div>
                    </div>
                </div>
                </div>
            </div>
        `;
    }

    /**
     * Render full tags selector for products
     */
    renderTagsSelector(selectedTags = []) {
        const availableTags = this.database.getProductTags();

        // If no tags from database, use fallback tags
        const tagsToShow = availableTags.length > 0 ? availableTags : [
            { id: 'spicy', name: 'Apimentado', icon: '🌶️', color: '#ef4444' },
            { id: 'vegetarian', name: 'Vegetariano', icon: '🥗', color: '#22c55e' },
            { id: 'popular', name: 'Popular', icon: '⭐', color: '#f59e0b' },
            { id: 'new', name: 'Novidade', icon: '✨', color: '#8b5cf6' },
            { id: 'premium', name: 'Premium', icon: '👑', color: '#8b5cf6' }
        ];

        return `
            <div id="productTagsContainer" class="space-y-4">
                <div class="flex items-center gap-2">
                    <span class="text-sm font-medium text-gray-700">Tags Disponíveis</span>
                    <span class="text-xs text-gray-400">(${selectedTags.length} selecionada${selectedTags.length !== 1 ? 's' : ''})</span>
                </div>

                <!-- Tags Grid - Modern Layout -->
                <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    ${tagsToShow.map(tag => {
                        const isSelected = selectedTags.includes(tag.id);
                        return `
                            <label class="group cursor-pointer transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
                                <input type="checkbox" 
                                    name="productTags" 
                                    value="${tag.id}"
                                    ${isSelected ? 'checked' : ''}
                                    class="hidden tag-checkbox"
                                >
                                <div class="tag-card relative overflow-hidden rounded-xl border-2 transition-all duration-300 ${
                                    isSelected ? 'border-transparent shadow-lg' : 'border-gray-200'
                                }"
                                style="${isSelected ? `background: linear-gradient(135deg, ${tag.color}ee, ${tag.color});` : 'background: linear-gradient(135deg, #ffffff, #f8fafc);'}"
                                data-color="${tag.color}">
                                    <!-- Selection indicator -->
                                    <div class="absolute top-1 right-1 w-5 h-5 rounded-full ${
                                        isSelected ? 'bg-white bg-opacity-30 border-2 border-white' : 'bg-gray-200 border-gray-300 border'
                                    } transition-all duration-300 flex items-center justify-center">
                                        ${isSelected ? `
                                            <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                                            </svg>
                                        ` : ''}
                                    </div>

                                    <!-- Delete button for each tag -->
                                    <button type="button"
                                        class="delete-tag-btn absolute top-1 left-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all duration-200 flex items-center justify-center shadow-md"
                                        data-tag-id="${tag.id}"
                                        title="Deletar tag"
                                        style="font-size: 10px; line-height: 1;">
                                        ×
                                    </button>

                                    <!-- Tag Content -->
                                    <div class="p-3 text-center">
                                        <div class="text-2xl mb-1 filter ${isSelected ? 'drop-shadow-sm' : ''}">${tag.icon}</div>
                                        <div class="text-xs font-semibold ${isSelected ? 'text-white' : 'text-gray-700'} truncate">${tag.name}</div>
                                    </div>
                                </div>
                            </label>
                        `;
                    }).join('')}

                    <!-- Add Custom Tag Card -->
                    <div class="tag-add-card group cursor-pointer transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]" id="addCustomTagCard">
                        <div class="h-full rounded-xl border-2 border-dashed border-gray-300 group-hover:border-orange-400 transition-all duration-200 flex flex-col items-center justify-center p-3 text-center bg-gradient-to-br from-gray-50 to-gray-100 group-hover:from-orange-50 group-hover:to-orange-100">
                            <div class="text-2xl mb-1 opacity-60 group-hover:opacity-80 transition-opacity">➕</div>
                            <div class="space-y-1">
                                <span class="text-xs font-medium text-gray-500 group-hover:text-orange-600 transition-colors duration-200">Nova Tag</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Custom Tag Creation Panel -->
                <div id="customTagSection" class="hidden">
                    <div class="mt-6 p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border-2 border-orange-200">
                        <!-- Header with close button -->
                        <div class="flex items-center justify-between mb-6">
                            <div>
                                <div class="flex items-center gap-2">
                                    <div class="w-2 h-2 bg-orange-500 rounded-full"></div>
                                    <h3 class="text-lg font-semibold text-gray-800">Criar Tag Personalizada</h3>
                                    <p class="text-sm text-gray-600">Defina um nome, emoji e cor para sua nova tag</p>
                                </div>
                            </div>
                            <button type="button" id="cancelCreateTag" class="text-gray-400 hover:text-gray-600 transition-colors">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>

                        <!-- Form fields -->
                        <div class="space-y-4 mb-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Nome da Tag *
                                </label>
                                <input 
                                    type="text" 
                                    id="customTagName" 
                                    class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all" 
                                    placeholder="Ex: Vegano, Sem Glúten, Premium..."
                                    maxlength="20"
                                >
                            </div>

                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        Emoji
                                    </label>
                                    <div class="relative">
                                        <input 
                                            type="text" 
                                            id="customTagIcon" 
                                            class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all" 
                                            placeholder="🏷️" 
                                            maxlength="4"
                                        >
                                        <button type="button" class="text-xs text-orange-600 hover:text-orange-700 font-medium" onclick="document.getElementById('customTagIcon').value = ['🔥','⭐','✨','👑','💎','🎯','🚀','❤️','🌟','🏆'][Math.floor(Math.random()*10)]">
                                            Aleatório
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        Cor
                                    </label>
                                    <div class="space-y-2">
                                        <input 
                                            type="color" 
                                            id="customTagColor" 
                                            class="w-full h-10 border border-gray-300 rounded-lg cursor-pointer" 
                                            value="#f59e0b"
                                        >
                                        <div class="grid grid-cols-6 gap-1">
                                            ${['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'].map(color => `
                                                <button type="button" 
                                                    class="w-6 h-6 rounded border-2 border-white shadow-sm hover:scale-110 transition-transform" 
                                                    style="background-color: ${color}"
                                                    onclick="document.getElementById('customTagColor').value = '${color}'"></button>
                                            `).join('')}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Preview -->
                            <div class="p-3 bg-white rounded-lg border border-gray-200">
                                <div class="flex items-center gap-2">
                                    <span class="text-sm text-gray-600">Sua tag ficará assim:</span>
                                    <div id="tagPreview" class="px-3 py-1.5 text-sm font-medium rounded-full border-2 border-gray-300 text-gray-700">
                                        🏷️ Nova Tag
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Actions -->
                        <div class="flex gap-3 justify-end">
                            <button 
                                type="button" 
                                id="cancelCreateTagAlt"
                                class="px-4 py-2 text-gray-600 hover:text-gray-700 font-medium transition-colors">
                                Cancelar
                            </button>
                            <button 
                                type="button" 
                                id="confirmCreateTag"
                                class="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors flex items-center gap-2">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                </svg>
                                Criar Tag
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Setup product tags events
     */
    setupTagsEvents() {
        // Toggle tags visibility
        const toggleBtn = document.getElementById('toggleTagsBtn');
        const tagsGrid = document.getElementById('tagsGrid');
        const toggleIcon = document.getElementById('toggleTagsIcon');

        if (toggleBtn && tagsGrid && toggleIcon) {
            toggleBtn.addEventListener('click', () => {
                const isHidden = tagsGrid.classList.contains('hidden');
                if (isHidden) {
                    tagsGrid.classList.remove('hidden');
                    toggleIcon.style.transform = 'rotate(180deg)';
                } else {
                    tagsGrid.classList.add('hidden');
                    toggleIcon.style.transform = 'rotate(0deg)';
                }
            });
        }

        // Toggle tag selection with improved visual feedback
        document.querySelectorAll('.tag-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const tagCard = e.target.nextElementSibling;
                const color = tagCard.dataset.color;
                
                if (e.target.checked) {
                    // Selected state
                    tagCard.style.background = `linear-gradient(135deg, ${color}ee, ${color})`;
                    tagCard.classList.add('border-transparent', 'shadow-lg');
                    tagCard.classList.remove('border-gray-200');
                } else {
                    tagCard.style.background = 'linear-gradient(135deg, #ffffff, #f8fafc)';
                    tagCard.classList.remove('border-transparent', 'shadow-lg');
                    tagCard.classList.add('border-gray-200');
                }

                // Update selection indicator
                const selectionIndicator = tagCard.querySelector('.absolute.top-1.right-1');
                if (selectionIndicator) {
                    if (e.target.checked) {
                        selectionIndicator.className = 'absolute top-1 right-1 w-5 h-5 rounded-full bg-white bg-opacity-30 border-2 border-white transition-all duration-300 flex items-center justify-center';
                        selectionIndicator.innerHTML = `
                            <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                            </svg>
                        `;
                    } else {
                        selectionIndicator.className = 'absolute top-1 right-1 w-5 h-5 rounded-full bg-gray-200 border-gray-300 border transition-all duration-300 flex items-center justify-center';
                        selectionIndicator.innerHTML = '';
                    }
                }

                this.updateTagCounter();
            });
        });

        // Delete tag buttons
        document.querySelectorAll('.delete-tag-btn').forEach(deleteBtn => {
            deleteBtn.addEventListener('click', (e) => {
                // Stop event propagation to prevent tag selection
                e.stopPropagation();
                e.preventDefault();
                const tagId = deleteBtn.dataset.tagId;
                this.confirmDeleteTag(tagId);
            });
        });

        // Add custom tag card click
        const addCustomTagCard = document.getElementById('addCustomTagCard');
        if (addCustomTagCard) {
            addCustomTagCard.addEventListener('click', () => {
                const customTagSection = document.getElementById('customTagSection');
                customTagSection.classList.remove('hidden');
                
                // Scroll to custom tag section and focus name input
                setTimeout(() => {
                    customTagSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    document.getElementById('customTagName').focus();
                }, 100);
            });
        }

        // Create custom tag
        const confirmCreateTag = document.getElementById('confirmCreateTag');
        if (confirmCreateTag) {
            confirmCreateTag.addEventListener('click', async () => {
                await this.createCustomTag();
            });
        }

        // Cancel custom tag (multiple buttons)
        ['cancelCreateTag', 'cancelCreateTagAlt'].forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', () => {
                    document.getElementById('customTagSection').classList.add('hidden');
                    this.clearCustomTagForm();
                });
            }
        });

        // Setup tag preview and Enter key
        this.setupSimpleTagPreview();

        const customTagName = document.getElementById('customTagName');
        const customTagIcon = document.getElementById('customTagIcon');

        if (customTagName && customTagIcon) {
            [customTagName, customTagIcon].forEach(input => {
                input.addEventListener('keypress', async (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        const confirmBtn = document.getElementById('confirmCreateTag');
                        if (confirmBtn && !confirmBtn.disabled) {
                            await this.createCustomTag();
                        }
                    }
                });
            });
        }
    }

    /**
     * Setup simple tag preview that ALWAYS works
     */
    setupSimpleTagPreview() {
        const nameField = document.getElementById('customTagName');
        const emojiField = document.getElementById('customTagIcon');
        const colorField = document.getElementById('customTagColor');
        const preview = document.getElementById('tagPreview');
        const confirmBtn = document.getElementById('confirmCreateTag');

        if (!nameField || !preview || !confirmBtn) return;

        const updatePreview = () => {
            const name = nameField.value.trim() || 'Nova Tag';
            const emoji = (emojiField ? emojiField.value.trim() : '') || '🏷️';
            const color = (colorField ? colorField.value : '') || '#f59e0b';

            preview.textContent = `${emoji} ${name}`;
            preview.style.backgroundColor = color + '20';
            preview.style.borderColor = color;
            preview.style.color = color;

            // Enable/disable create button
            confirmBtn.disabled = !nameField.value.trim();
            confirmBtn.style.opacity = confirmBtn.disabled ? '0.5' : '1';
        };

        // Add listeners
        [nameField, emojiField, colorField].forEach(field => {
            if (field) {
                field.addEventListener('input', updatePreview);
                field.addEventListener('change', updatePreview);
            }
        });

        // Initial call
        updatePreview();

        // Global click handler to hide custom tag section when clicking outside
        document.addEventListener('click', (e) => {
            const target = e.target;
            const tagSection = document.getElementById('customTagSection');

            // Verificar se clique foi dentro da seção de tags
            if (!tagSection || !tagSection.contains(target)) {
                return;
            }

            // Allow clicks within emoji/color containers
            const emojiContainer = target.closest('#customTagSection > div > div.space-y-4.mb-6 > div.grid.grid-cols-2.gap-4 > div:nth-child(1) > div > div');
            const colorContainer = target.closest('#customTagSection > div > div.space-y-4.mb-6 > div.grid.grid-cols-2.gap-4 > div:nth-child(2) > div > div');

            if (emojiContainer || colorContainer) {
                return;
            }
        });
    }

    /**
     * Clear custom tag form
     */
    clearCustomTagForm() {
        const nameField = document.getElementById('customTagName');
        const emojiField = document.getElementById('customTagIcon');
        const colorField = document.getElementById('customTagColor');

        if (nameField) nameField.value = '';
        if (emojiField) emojiField.value = '';
        if (colorField) colorField.value = '#f59e0b';

        // Reset preview
        this.setupSimpleTagPreview();
    }

    /**
     * Update tag counter
     */
    updateTagCounter() {
        const selectedCount = document.querySelectorAll('.tag-checkbox:checked').length;
        const counter = document.querySelector('.text-xs.text-gray-400');
        
        if (counter) {
            counter.textContent = `(${selectedCount} selecionada${selectedCount !== 1 ? 's' : ''})`;
        }
    }

    /**
     * Create custom tag
     */
    async createCustomTag() {
        const name = document.getElementById('customTagName').value.trim();
        const icon = document.getElementById('customTagIcon').value.trim() || '🏷️';
        const color = document.getElementById('customTagColor').value;

        if (!name) {
            this.view.showNotification('Nome da tag é obrigatório', 'error');
            document.getElementById('customTagName').focus();
            return;
        }

        try {
            // Disable button and show loading
            const confirmBtn = document.getElementById('confirmCreateTag');
            if (confirmBtn) {
                confirmBtn.textContent = 'Criando...';
                confirmBtn.disabled = true;
            }

            const newTag = await this.database.addProductTag({ name, icon, color });

            // Try to refresh tags container safely
            try {
                const container = document.getElementById('productTagsContainer');
                if (container) {
                    const currentTags = this.getSelectedTags();
                    container.innerHTML = this.renderCompactTagsSelector(currentTags);
                    this.setupTagsEvents();
                }
            } catch (refreshError) {
                // Don't throw - tag was created successfully in database
                console.warn('Could not refresh tags UI:', refreshError);
            }

            // Hide custom tag section and clear form
            document.getElementById('customTagSection').classList.add('hidden');
            this.clearCustomTagForm();

            this.view.showNotification(`Tag "${name}" criada com sucesso!`);

        } catch (error) {
            console.error('❌ Error creating tag:', error);
            this.view.showNotification(`Erro ao criar tag: ${error.message}`, 'error');
        } finally {
            // Always restore button state
            const confirmBtn = document.getElementById('confirmCreateTag');
            if (confirmBtn) {
                confirmBtn.textContent = 'Criar Tag';
                confirmBtn.disabled = false;
            }
        }
    }

    /**
     * Get selected tags
     */
    getSelectedTags() {
        const checkboxes = document.querySelectorAll('.tag-checkbox:checked');
        return Array.from(checkboxes).map(cb => cb.value);
    }

    /**
     * Confirm delete tag
     */
    confirmDeleteTag(tagId) {
        const tag = this.database.getProductTags().find(t => t.id === tagId);
        if (!tag) return;

        // Check how many products use this tag
        const products = this.database.getProducts();
        const productsWithTag = products.filter(p => p.tags && p.tags.includes(tagId));

        const warningMessage = productsWithTag.length > 0 
            ? `Esta tag será removida de ${productsWithTag.length} produto${productsWithTag.length > 1 ? 's' : ''}.` 
            : '';

        // Show confirmation modal
        const confirmModal = document.createElement('div');
        confirmModal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        confirmModal.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
                <div class="text-center">
                    <h3 class="text-lg font-semibold text-gray-900 mb-2">Deletar Tag</h3>
                    <p class="text-gray-600 mb-4">
                        Tem certeza que deseja deletar a tag 
                        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ml-1" 
                              style="background-color: ${tag.color};">
                            ${tag.icon} ${tag.name}
                        </span>?
                    </p>
                    ${warningMessage ? `<p class="text-sm text-orange-600 mb-4">${warningMessage}</p>` : ''}
                    <div class="flex gap-3 justify-center">
                        <button 
                            id="confirmDeleteTagBtn"
                            class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded transition-colors"
                            data-tag-id="${tagId}">
                            Deletar
                        </button>
                        <button 
                            id="cancelDeleteTag"
                            class="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded transition-colors">
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(confirmModal);

        document.getElementById('confirmDeleteTagBtn').addEventListener('click', () => {
            this.deleteTag(tagId);
            confirmModal.remove();
        });

        document.getElementById('cancelDeleteTag').addEventListener('click', () => {
            confirmModal.remove();
        });
    }

    /**
     * Delete tag
     */
    deleteTag(tagId) {
        try {
            this.database.deleteProductTag(tagId);

            // Refresh tags container
            const container = document.getElementById('productTagsContainer');
            const currentTags = this.getSelectedTags().filter(t => t !== tagId); // Remove deleted tag from selection
            container.innerHTML = this.renderCompactTagsSelector(currentTags);
            this.setupTagsEvents();

            this.view.showNotification('Tag deletada com sucesso!');
        } catch (error) {
            this.view.showNotification('Erro ao deletar tag: ' + error.message, 'error');
        }
    }
}