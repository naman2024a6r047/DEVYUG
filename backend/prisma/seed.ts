import { PrismaClient, Role, OrderStatus, SubscriptionStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database started...');

  // 1. Clean existing records
  await prisma.blogComment.deleteMany({});
  await prisma.blogPost.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.subscription.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.wishlistItem.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.profile.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Hash passwords
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const userPasswordHash = await bcrypt.hash('user123', 10);

  // 3. Create Admin User
  const admin = await prisma.user.create({
    data: {
      name: 'DVYUG Administrator',
      email: 'admin@dvyug.com',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      profile: {
        create: {
          phone: '+919999999999',
          addressLine1: 'Vedic Wellness Centre',
          addressLine2: 'Sector 5',
          city: 'Haridwar',
          state: 'Uttarakhand',
          postalCode: '249401',
          country: 'India',
          loyaltyPoints: 500,
          referralCode: 'DVYUGADMIN',
        },
      },
    },
  });
  console.log('Admin user created:', admin.email);

  // 4. Create Standard User
  const customer = await prisma.user.create({
    data: {
      name: 'Rohan Sharma',
      email: 'user@dvyug.com',
      passwordHash: userPasswordHash,
      role: Role.USER,
      profile: {
        create: {
          phone: '+919876543210',
          addressLine1: '102, Shanti Kunj',
          addressLine2: 'Ganga Path',
          city: 'Rishikesh',
          state: 'Uttarakhand',
          postalCode: '249201',
          country: 'India',
          loyaltyPoints: 120,
          referralCode: 'ROHAN100',
        },
      },
    },
  });
  console.log('Customer user created:', customer.email);

  // 5. Create Premium Products
  const productsData = [
    {
      name: 'Organic Ashwagandha Capsules',
      slug: 'organic-ashwagandha-capsules',
      description: 'Premium organic Ashwagandha (Withania somnifera) root extract capsules to reduce stress, improve vitality, and boost cognitive function. Known as the king of Ayurvedic herbs.',
      price: 499.0,
      salePrice: 449.0,
      stock: 50,
      category: 'Herbal Products',
      subCategory: 'Wellness',
      ratings: 4.8,
      images: JSON.stringify(['https://images.unsplash.com/photo-1611070973770-b1a672610041?q=80&w=600']),
      videoUrl: '',
      ingredients: JSON.stringify(['Organic Ashwagandha Root Extract (500mg)', 'Vegetarian Capsule Shell']),
      benefits: JSON.stringify(['Reduces cortisol and anxiety levels', 'Improves muscle strength and recovery', 'Enhances mental focus and memory booster']),
      usageInstructions: 'Take 1-2 capsules daily with warm milk or water, preferably after meals, or as directed by a healthcare practitioner.',
      ayurvedicProperties: 'Doshas: Balances Vata and Kapha, can slightly increase Pitta in excess. Guna: Laghu (Light), Snigdha (Unctuous). Rasa: Tikta (Bitter), Katu (Pungent), Madhura (Sweet).',
      isBestSeller: true,
      isFeatured: true,
    },
    {
      name: 'Vedic A2 Gir Cow Bilona Ghee',
      slug: 'vedic-a2-gir-cow-bilona-ghee',
      description: 'Authentic A2 Ghee made using the traditional Bilona method (churning curd made from Gir Cow A2 milk). Handcrafted in clay pots, rich in nutrients, granular, and aromatic.',
      price: 1499.0,
      salePrice: 1399.0,
      stock: 25,
      category: 'Organic Food',
      subCategory: 'Groceries',
      ratings: 4.9,
      images: JSON.stringify(['https://images.unsplash.com/photo-1589733901241-5e3a676a04a3?q=80&w=600']),
      videoUrl: '',
      ingredients: JSON.stringify(['100% Pure Gir Cow A2 Milk Fat']),
      benefits: JSON.stringify(['Improves digestion and gut health', 'Lubricates joints and improves skin glow', 'High smoke point, ideal for cooking and spiritual rituals']),
      usageInstructions: 'Consume 1-2 teaspoons daily on empty stomach, add to chapatis, or use in cooking.',
      ayurvedicProperties: 'Doshas: Pacifies Vata and Pitta. Promotes Ojas (vital energy). Agni (digestive fire) booster.',
      isBestSeller: true,
      isFeatured: true,
    },
    {
      name: 'Sandalwood (Chandan) Incense Sticks',
      slug: 'sandalwood-chandan-incense-sticks',
      description: 'Hand-rolled, chemical-free incense sticks crafted with natural sandalwood powder and essential oils. Perfect for meditation, puja, and creating a serene spiritual ambiance.',
      price: 250.0,
      salePrice: 220.0,
      stock: 100,
      category: 'Spiritual Essentials',
      subCategory: 'Fragrances',
      ratings: 4.7,
      images: JSON.stringify(['https://images.unsplash.com/photo-1602847213180-50e43a80cef6?q=80&w=600']),
      videoUrl: '',
      ingredients: JSON.stringify(['Pure Mysore Sandalwood Powder', 'Natural Charcoal-free Wood Powder', 'Essential Oils', 'Natural Gums']),
      benefits: JSON.stringify(['Purifies the atmosphere', 'Calms the mind for meditation and prayer', 'Long-lasting natural woody aroma']),
      usageInstructions: 'Light the tip of the incense stick, allow it to catch fire, then gently blow out the flame. Place in an incense holder.',
      ayurvedicProperties: 'Rasa: Cools Pitta energy, calms emotional turbulence, opens the heart and crown chakras.',
      isBestSeller: false,
      isFeatured: true,
    },
    {
      name: 'Kumkumadi Radiance Face Oil',
      slug: 'kumkumadi-radiance-face-oil',
      description: 'A miraculous Ayurvedic formulation of 26 precious herbs, saffron, and goat milk, designed to brighten skin, reduce dark circles, and prevent fine lines.',
      price: 1899.0,
      salePrice: 1699.0,
      stock: 30,
      category: 'Personal Care',
      subCategory: 'Skincare',
      ratings: 4.9,
      images: JSON.stringify(['https://images.unsplash.com/photo-1608248597481-496100c80836?q=80&w=600']),
      videoUrl: '',
      ingredients: JSON.stringify(['Kesar (Saffron)', 'Chandan (Sandalwood)', 'Manjistha', 'Yashtimadhu', 'Pure Sesame Oil', 'Goat Milk']),
      benefits: JSON.stringify(['Illuminates skin complexion', 'Fades pigmentation and dark spots', 'Hydrates and rejuvenates skin overnight']),
      usageInstructions: 'Cleanse face, apply 3-4 drops of oil onto face and neck, gently massage in upward strokes. Leave overnight.',
      ayurvedicProperties: 'Varnya (Skin tone improver). Balances Pitta and Vata on the skin surface.',
      isBestSeller: true,
      isFeatured: true,
    },
    {
      name: 'Premium Puja Thali Gift Set',
      slug: 'premium-puja-thali-gift-set',
      description: 'An elegant, solid brass puja plate ensemble containing an oil lamp (diya), incense holder, water pot (kalash), bell, and roli-chawal containers. A premium gift for festive occasions.',
      price: 2499.0,
      salePrice: 2299.0,
      stock: 15,
      category: 'Gift Sets',
      subCategory: 'Hampers',
      ratings: 4.8,
      images: JSON.stringify(['https://images.unsplash.com/photo-1543007630-9710e4a00a20?q=80&w=600']),
      videoUrl: '',
      ingredients: JSON.stringify(['1 Brass Thali (10 inches)', '1 Diya', '1 Kalash', '1 Bell', '1 Agarbatti Stand', '1 Roli-Chawal Bowl']),
      benefits: JSON.stringify(['Authentic brass metal with premium gold shine', 'Tarnish resistant coating', 'Perfect gift for weddings, housewarmings, and Diwali']),
      usageInstructions: 'Clean with dry cloth or specialized brass cleaning polish (Pitambril). Avoid washing with harsh detergents.',
      ayurvedicProperties: 'Brass metal has natural purifying vibrations that support sacred spaces.',
      isBestSeller: false,
      isFeatured: true,
    },
    {
      name: 'Organic Tulsi Herbal Tea',
      slug: 'organic-tulsi-herbal-tea',
      description: 'A soothing and refreshing blend of Rama, Krishna, and Vana Tulsi leaves. Packed with antioxidants, this herbal infusion supports immunity, respiration, and stress relief.',
      price: 299.0,
      salePrice: 269.0,
      stock: 80,
      category: 'Organic Food',
      subCategory: 'Beverages',
      ratings: 4.6,
      images: JSON.stringify(['https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=600']),
      videoUrl: '',
      ingredients: JSON.stringify(['Rama Tulsi Leaves', 'Krishna Tulsi Leaves', 'Vana Tulsi Leaves']),
      benefits: JSON.stringify(['Boosts immune system', 'Relieves cough, cold, and respiratory issues', 'Reduces daily oxidative stress']),
      usageInstructions: 'Infuse 1 tea bag or 1 tsp of leaves in a cup of boiling water for 3-5 minutes. Strain and serve hot. Honey can be added.',
      ayurvedicProperties: 'Doshas: Pacifies Kapha and Vata, can increase Pitta if taken excessively. Ushna (warm) potency.',
      isBestSeller: true,
      isFeatured: false,
    },
    {
      name: 'Giloy & Neem Purifying Soap',
      slug: 'giloy-neem-purifying-soap',
      description: 'Handcrafted ayurvedic soap blending Neem extracts, Giloy stem extracts, and natural essential oils. Purifies skin, fights acne-causing bacteria, and maintains natural moisture balance.',
      price: 180.0,
      salePrice: 150.0,
      stock: 120,
      category: 'Personal Care',
      subCategory: 'Skincare',
      ratings: 4.5,
      images: JSON.stringify(['https://images.unsplash.com/photo-1607006342465-b74d324b104e?q=80&w=600']),
      videoUrl: '',
      ingredients: JSON.stringify(['Neem Extract', 'Giloy Extract', 'Coconut Oil Base', 'Aloe Vera Juice', 'Glycerin']),
      benefits: JSON.stringify(['Antiseptic and antibacterial qualities', 'Soothes skin rashes and itching', 'Chemical-free and biodegradable']),
      usageInstructions: 'Lather onto wet skin during bath, massage gently, and rinse thoroughly with fresh water.',
      ayurvedicProperties: 'Sheetal (Cooling). Calms burning sensations and skin inflammation. Balances Pitta and Kapha.',
      isBestSeller: false,
      isFeatured: false,
    },
    {
      name: 'Pure Camphor (Bhimseni Kapur)',
      slug: 'pure-camphor-bhimseni-kapur',
      description: '100% pure Bhimseni Kapur (Camphor) crystals. Free from wax, chemicals, and additives. Produces smooth smoke-free burning, leaving a divine purifying aroma in your home.',
      price: 350.0,
      salePrice: 310.0,
      stock: 90,
      category: 'Puja Essentials',
      subCategory: 'Sacred Items',
      ratings: 4.7,
      images: JSON.stringify(['https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?q=80&w=600']),
      videoUrl: '',
      ingredients: JSON.stringify(['100% Bhimseni Camphor Crystals']),
      benefits: JSON.stringify(['Clears negative energies from space', 'Aroma helps clear nasal passages and respiratory tracts', 'Burns completely without leaving ash']),
      usageInstructions: 'Place a small crystal on a kapur burner or a diya, light with matchstick and allow the aroma to spread.',
      ayurvedicProperties: 'Sheetal (Cooling) in touch, but Agneyi (Fire-oriented) in action. Purifies the subtle atmosphere.',
      isBestSeller: true,
      isFeatured: false,
    }
  ];

  for (const prod of productsData) {
    const createdProduct = await prisma.product.create({
      data: {
        name: prod.name,
        slug: prod.slug,
        description: prod.description,
        price: prod.price,
        salePrice: prod.salePrice,
        stock: prod.stock,
        category: prod.category,
        subCategory: prod.subCategory,
        ratings: prod.ratings,
        images: prod.images,
        videoUrl: prod.videoUrl,
        ingredients: prod.ingredients,
        benefits: prod.benefits,
        usageInstructions: prod.usageInstructions,
        ayurvedicProperties: prod.ayurvedicProperties,
        isBestSeller: prod.isBestSeller,
        isFeatured: prod.isFeatured,
      },
    });
    console.log('Product created:', createdProduct.name);
  }

  // 6. Create Blog Posts
  const blogPosts = [
    {
      title: 'The Three Doshas: Understanding Your Ayurvedic Body Type',
      slug: 'the-three-doshas-understanding-your-ayurvedic-body-type',
      content: 'Ayurveda, the ancient Indian science of life, states that our bodies are governed by three vital energies or Doshas: Vata, Pitta, and Kapha. Vata is associated with air and space, representing movement and creativity. Pitta is linked to fire and water, governing digestion and intellect. Kapha is grounded in water and earth, bringing structure, stability, and immunity. In this article, we explain how to identify your dominant dosha and how to balance it with organic foods and traditional herbs like Ashwagandha and Triphala. Consuming wholesome A2 cow ghee helps maintain digestion fire (Agni) and pacifies excessive Pitta or Vata.',
      category: 'Ayurveda',
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=600',
    },
    {
      title: 'Integrating Yoga and Ayurveda for Daily Spiritual Vitality',
      slug: 'integrating-yoga-and-ayurveda-for-daily-spiritual-vitality',
      content: 'Yoga and Ayurveda are sister sciences that originated from the Vedic tradition thousands of years ago. While Yoga focuses on union with the divine, mental control, and spiritual liberation, Ayurveda focuses on physical health and body harmony. When practiced together, they create a complete blueprint for healthy living. Starting your morning with Sun Salutations (Surya Namaskar) followed by lighting pure Bhimseni Camphor or Sandalwood incense sets a pure, high-vibration atmosphere. Follow this with a warm cup of Tulsi herbal tea to ignite your metabolism and clear accumulated toxins.',
      category: 'Yoga',
      image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=600',
    },
    {
      title: 'Why A2 Bilona Ghee is Considered Elixir in Vedic Texts',
      slug: 'why-a2-bilona-ghee-is-considered-elixir-in-vedic-texts',
      content: 'In Charaka Samhita and other classical Vedic texts, Ghee (specifically from Indian breed cows) is described as "Amrit" or nectar. However, modern commercial processes extract ghee using heat and centrifugal machines directly from cream. Vedic Bilona Ghee, on the other hand, is made by boiling milk, turning it to curd, and then churning it slowly with a wooden churner (Bilona). This process retains crucial fat-soluble vitamins (A, D, E, K), CLA (Conjugated Linoleic Acid), and butyric acid. Regular consumption enhances memory, improves skin elasticity, supports joint lubrication, and acts as an excellent carrier (Anupana) for consuming herbal powders.',
      category: 'Organic Living',
      image: 'https://images.unsplash.com/photo-1589733901241-5e3a676a04a3?q=80&w=600',
    }
  ];

  for (const post of blogPosts) {
    const createdPost = await prisma.blogPost.create({
      data: {
        title: post.title,
        slug: post.slug,
        content: post.content,
        category: post.category,
        image: post.image,
      },
    });
    console.log('Blog post created:', createdPost.title);
  }

  console.log('Seeding database completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
