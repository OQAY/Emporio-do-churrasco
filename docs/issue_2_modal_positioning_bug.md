# Issue #2: Modal Categories abre no final da página

## 🐛 **Problema Crítico**

O modal de categorias está abrindo no final da página ao invés de aparecer na viewport atual do usuário.

## 📍 **Localização do Bug**
- **Arquivo:** `src/js/components/CategoriesModal.js`
- **CSS:** `src/styles/main.css` (seções modal)
- **Sintoma:** Modal aparece lá embaixo da página, não onde o usuário está vendo

## 🚨 **Comportamento Problemático**

### Situação Atual:
1. Usuário rola a página até o meio/final
2. Clica no botão "Categorias"
3. Modal aparece no final da página (fora da viewport)
4. Usuário precisa rolar para ver o modal

### Comportamento Esperado:
1. Usuário rola a página até qualquer posição
2. Clica no botão "Categorias" 
3. Modal aparece na viewport atual (como YouTube/Instagram)
4. Bottom sheet desliza de baixo para cima na tela visível

## 🔍 **Análise Técnica**

### Tentativas de Correção (falharam):
1. ✗ Mudança de `flex items-end` para `flex items-center` 
2. ✗ Cálculos JavaScript de `window.pageYOffset`
3. ✗ Estrutura de elementos `fixed` aninhados
4. ✗ Separação overlay/modal em elementos independentes

### Causa Raiz Suspeita:
- Estrutura HTML complexa com múltiplas camadas
- Posicionamento CSS conflitante
- Possível interferência de outros estilos da página

## 💡 **Solução Proposta**

### Refatoração Completa Zero:
1. **Apagar completamente** o código atual do modal
2. **Manter apenas** os estilos visuais (cores, bordas, etc)
3. **Recriar do zero** com abordagem minimalista:
   - Um único elemento `fixed`
   - Posicionamento simples bottom-sheet
   - Zero JavaScript de posicionamento
   - Apenas CSS puro

### Visual a Manter:
- Mesmo design atual (cores, bordas, tamanhos)
- Bottom sheet com 60% da altura
- Animação slide-up
- Lista de categorias com contadores

### Simplificar Drasticamente:
```html
<!-- Só isso, nada mais -->
<div class="simple-categories-modal">
  <!-- conteúdo aqui -->
</div>
```

```css
.simple-categories-modal {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60vh;
  /* resto dos estilos visuais */
}
```

## 📊 **Evidência Visual**
Screenshot: `c:/Users/lucas/OneDrive/Pictures/Screenshots/Captura de tela 2025-09-04 152114.png`

## ✅ **Critérios de Aceite**
- [ ] Modal aparece na viewport atual (não no final da página)
- [ ] Funciona em qualquer posição de scroll
- [ ] Mantém exato visual atual
- [ ] Código drasticamente simplificado
- [ ] Zero JavaScript de posicionamento

## 🎯 **Abordagem**
**Princípio:** Menos é mais. Grandes empresas usam soluções simples.

---

**Criado:** 2025-09-04  
**Prioridade:** CRÍTICA  
**Status:** Precisa refatoração completa