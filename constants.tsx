
import { Product } from './types';

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'VaporMax Flyknit',
    category: 'Streetwear',
    colorway: 'Red/Black',
    price: 189,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHMZknoZRs2WowTcCOqzTvQDMzLZ8ItmAP-mYDHzeTTnHxwIDD_z6Z9Ry6l6ULBESKvNcc-OSyh3w4vEyHhLixbl69HQ3e9ELV_HO1mZibN8S-UjAp0xXLlpfy_eGomnJzBbJWUbm-M17T9ux7_Nl4txhhfVLMiG_cwZKfLYEQjlqdeDhFH50Yf0cYK3qPXiTnilXBv1P4w0a_YO4cw7z-HU0AHAa933R1ABVEDuSVDbV9w5lBq8a5HHNE0vVOzBBVdBMlv6OlYOo',
    isFeatured: false
  },
  {
    id: '2',
    name: 'Dunk Low Pro',
    category: 'Skateboarding',
    colorway: 'Sky Blue',
    price: 120,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB0TXJky0zH0L78vzkAJwLmJ6BeC5jCYQgD_TxYx5btV5gazLM9rDctwoMuzb8oCm1h0jHZ3ARtGPhrIJCR7wx95zcdLGMqa-EemBePFLT0ogd58c2hhSnwVZvelH6nQtsbpf0irpV4KeCfeXiv6Qm47iyPGr-x8f96o-y5OmshU0iZZb2FqdZitKfvN0cymYBeq7eeWS9OJSKSWgGrBYZDJp1kAUVLwlCTpLXMQsSt58ptMRnO-ALPhoOjfmG4reowEkpvkTXwA20',
    isFeatured: true
  },
  {
    id: '3',
    name: 'Air Max 270',
    category: 'Lifestyle',
    colorway: 'Neon',
    price: 144,
    oldPrice: 180,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9t3YIuCIONp__ieTj-01FjNI4qKViScLPpye53fZMZ8z2gAnpA3WL2ug7H1JeHuUvz1V-zz2oECkFjwU_ztXWpJuezR1wS-8PjdpnmSCqPUqdrrISBqv3WiWgHNNyQqMm_tr-OROEVU5xiQmsP7sJRwlXuVUuWlPbozk5w6JTi9kGZV4A-QrDOou1PwpmBd31giLRbn9DmJdjdnTxtmcwmoh7iKYQMqrZCWAAp87PA9b9tXEdWVntZ6aJdS5qGzxmh1xY_A1HK9w',
    isHot: true
  },
  {
    id: '4',
    name: 'Jordan Retro 1',
    category: 'Limited Edition',
    colorway: 'White',
    price: 299,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDzL-N7MSKs0QB-0Los94sXBHV0EJohFfa12fdalxqMrgLFY294cmrTOM47D0zXC0GSMq6tRG76LwwrcuJI19Q2AxaDJvb_a38TzvWdibM6ULrXVBl-8L0vOq5bbBVpdKqMh0HNa81tTEtHvj6a5q-SE7SzzfEQvYZvVGJdGmAmqsMJdQQEHWKltpj6J-_V7TX4x0sEsLmvAhqqrb8-KxPNjMRBVJDLE0BBcVJjsY2LZkc9i9pFJ6ZMAfibXTQiys5rOa_Q8bOtps0',
    isSoldOut: true
  }
];

export const SIZES = ['8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5'];
