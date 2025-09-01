// Mock data para desenvolvimento - COPIA DOS DADOS ORIGINAIS
export const mockCategories = [
  {
    id: "1",
    name: "Todos",
    slug: "todos",
    active: true,
    icon: "🍽️"
  },
  {
    id: "2", 
    name: "Carnes",
    slug: "carnes",
    active: true,
    icon: "🥩"
  },
  {
    id: "3",
    name: "Acompanhamentos", 
    slug: "acompanhamentos",
    active: true,
    icon: "🥗"
  },
  {
    id: "4",
    name: "Bebidas",
    slug: "bebidas", 
    active: true,
    icon: "🥤"
  }
]

export const mockProducts = [
  {
    id: "1",
    name: "Picanha Grelhada",
    description: "Suculenta picanha grelhada no ponto ideal, acompanha farofa e vinagrete",
    price: 45.90,
    image: "/images/produtos/picanha-grill.jpg",
    category_id: "2",
    active: true,
    featured: true,
    tags: ["premium", "grelhado"]
  },
  {
    id: "2", 
    name: "Contra-Filé",
    description: "Contra-filé macio e suculento, grelhado na brasa com temperos especiais",
    price: 38.90,
    image: "/images/produtos/steak-knife.jpg", 
    category_id: "2",
    active: true,
    featured: true,
    tags: ["tradicional", "brasa"]
  },
  {
    id: "3",
    name: "Sanduíche de Picanha",
    description: "Delicioso sanduíche com picanha desfiada, queijo, alface e molho especial",
    price: 28.90,
    image: "/images/produtos/steak-sandwich-1.jpg",
    category_id: "2", 
    active: true,
    featured: false,
    tags: ["sanduiche", "rapido"]
  },
  {
    id: "4",
    name: "X-Picanha Especial", 
    description: "Hambúrguer artesanal com picanha, queijo, bacon, alface, tomate e molho da casa",
    price: 32.90,
    image: "/images/produtos/steak-sandwich-2.jpg",
    category_id: "2",
    active: true, 
    featured: false,
    tags: ["hamburguer", "especial"]
  },
  {
    id: "5",
    name: "Farofa da Casa",
    description: "Farofa especial com bacon, linguiça e temperos secretos",
    price: 12.90,
    image: null,
    category_id: "3",
    active: true,
    featured: false, 
    tags: ["acompanhamento", "tradicional"]
  },
  {
    id: "6",
    name: "Coca-Cola 350ml",
    description: "Refrigerante gelado",
    price: 6.90,
    image: null,
    category_id: "4", 
    active: true,
    featured: false,
    tags: ["refrigerante", "gelado"]
  }
]

export const mockRestaurantInfo = {
  name: "Império do Churrasco", 
  logo: "🥩",
  description: "Cardapio digital",
  banner: "/images/banners/imperio-banner.png"
}