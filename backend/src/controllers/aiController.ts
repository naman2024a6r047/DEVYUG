import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { logger } from '../utils/logger';

// --- AI PRODUCT RECOMMENDATION ---

export const getAIRecommendations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { age, lifestyle, goal, healthInterest } = req.body;

    if (!goal) {
      return res.status(400).json({ success: false, message: 'Goal is a required quiz input' });
    }

    // Fetch all products
    const products = await prisma.product.findMany();

    // Map parser for JSON columns in MySQL
    const parsedProducts = products.map((p: any) => ({
      ...p,
      images: typeof p.images === 'string' ? JSON.parse(p.images) : p.images,
      ingredients: typeof p.ingredients === 'string' ? JSON.parse(p.ingredients) : p.ingredients,
      benefits: typeof p.benefits === 'string' ? JSON.parse(p.benefits) : p.benefits,
    }));

    // Score products based on matching keywords in name, category, description, and benefits
    const scoredProducts = parsedProducts.map((product: any) => {
      let score = 0;

      const targetText = `${product.name} ${product.category} ${product.description} ${product.ayurvedicProperties || ''} ${product.benefits.join(' ')}`.toLowerCase();

      // Check goals
      if (goal.toLowerCase() === 'immunity') {
        if (targetText.includes('immunity') || targetText.includes('ashwagandha') || targetText.includes('tulsi') || targetText.includes('giloy')) {
          score += 10;
        }
      } else if (goal.toLowerCase() === 'stress relief' || goal.toLowerCase() === 'sleep') {
        if (targetText.includes('stress') || targetText.includes('sleep') || targetText.includes('calm') || targetText.includes('ashwagandha') || targetText.includes('sandalwood')) {
          score += 10;
        }
      } else if (goal.toLowerCase() === 'digestion' || goal.toLowerCase() === 'gut health') {
        if (targetText.includes('digest') || targetText.includes('gut') || targetText.includes('ghee') || targetText.includes('bilona') || targetText.includes('agny')) {
          score += 10;
        }
      } else if (goal.toLowerCase() === 'skincare' || goal.toLowerCase() === 'glow') {
        if (targetText.includes('skin') || targetText.includes('glow') || targetText.includes('bright') || targetText.includes('face') || targetText.includes('kumkumadi') || targetText.includes('neem')) {
          score += 10;
        }
      } else if (goal.toLowerCase() === 'spiritual energy' || goal.toLowerCase() === 'meditation') {
        if (targetText.includes('spiritual') || targetText.includes('meditation') || targetText.includes('incense') || targetText.includes('puja') || targetText.includes('camphor') || targetText.includes('brass')) {
          score += 10;
        }
      }

      // Check health interest
      if (healthInterest) {
        const interests = Array.isArray(healthInterest) ? healthInterest : [healthInterest];
        interests.forEach((interest: string) => {
          if (targetText.includes(interest.toLowerCase())) {
            score += 5;
          }
        });
      }

      // Age weight adjustments
      if (age === 'senior' && product.name.toLowerCase().includes('ashwagandha')) {
        score += 3; // Ashwagandha is great for strength in elders
      }

      // Lifestyle weight adjustments
      if (lifestyle === 'stressful' && (product.name.toLowerCase().includes('ashwagandha') || product.name.toLowerCase().includes('sandalwood'))) {
        score += 4;
      }
      if (lifestyle === 'sedentary' && product.name.toLowerCase().includes('ghee')) {
        score -= 2; // Ghee requires good physical activity
      }

      return { product, score };
    });

    // Filter products with score > 0 and sort by highest score
    const recommendations = scoredProducts
      .filter((item: any) => item.score > 0)
      .sort((a: any, b: any) => b.score - a.score)
      .map((item: any) => item.product)
      .slice(0, 4); // return top 4 recommendations

    // Fallback: If no matches, return featured products
    if (recommendations.length === 0) {
      return res.status(200).json({
        success: true,
        recommendations: parsedProducts.slice(0, 3),
        explanation: 'We have curated our standard best wellness products matching Vedic lifestyle practices.'
      });
    }

    const explanationMap: any = {
      'immunity': 'These products contain active antioxidants (like Tulsi and Giloy) and adaptogens (Ashwagandha) which enhance your immune response and protect cells from stress.',
      'stress relief': 'Sandalwood aromatherapy calms the nervous system, while Ashwagandha reduces cortisol levels, promoting deeper sleep and mental balance.',
      'sleep': 'Unwinding with Mysore Sandalwood incense helps relax cognitive stress, paving the way for sound sleep.',
      'digestion': 'Pure A2 Gir cow Ghee activates your digestive fire (Jatharagni) and lubricates the GI tract, facilitating nutrient absorption.',
      'skincare': 'Kumkumadi oil extracts Saffron and Goat milk to renew epidermal cells, and Neem soaps cleanse antibacterial hazards naturally.',
      'spiritual energy': 'Bhimseni camphor and sandalwood release purifying high-frequency vibrations suitable for enhancing concentration and setting sacred meditation environments.'
    };

    return res.status(200).json({
      success: true,
      recommendations,
      explanation: explanationMap[goal.toLowerCase()] || 'Based on your age and health goals, these authentic products balance your active doshas and support healthy cellular rejuvenation.'
    });

  } catch (error) {
    next(error);
  }
};

// --- AI CHATBOT ASSISTANT ---

export const processAIChat = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { message, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const userMessage = message.toLowerCase();
    let responseText = '';

    // Quick Ayurvedic Knowledge base response lookup
    if (userMessage.includes('hello') || userMessage.includes('hi') || userMessage.includes('hey')) {
      responseText = "Namaste! I am your DVYUG Vedic Wellness Assistant. I can help guide you with Ayurvedic tips, recommend products matching your body type (Dosha), or answer store FAQs. How may I assist your well-being journey today?";
    } else if (userMessage.includes('dosha') || userMessage.includes('vata') || userMessage.includes('pitta') || userMessage.includes('kapha')) {
      responseText = "In Ayurveda, there are three primary Doshas (vital energies): Vata (Air/Ether), Pitta (Fire/Water), and Kapha (Earth/Water). \n\n" +
        "- **Vata** governs movement, breathing, and circulation. Balance it with warm, moist foods and oils (like our A2 Gir Cow Ghee).\n" +
        "- **Pitta** governs metabolism, heat, and digestion. Balance it with cooling herbs, oils (like our Kumkumadi Face Oil), and sandalwood.\n" +
        "- **Kapha** governs structure, water, and immunity. Balance it with warm adaptogens (like Organic Ashwagandha) and light, spicy teas.\n\n" +
        "Which of these do you feel dominates your system currently?";
    } else if (userMessage.includes('ashwagandha')) {
      responseText = "Our Organic Ashwagandha Capsules are crafted from high-quality Withania somnifera root extracts. It is a premium adaptogenic herb that helps lower cortisol (stress hormones), strengthens muscles, and builds stamina. It is best taken with warm milk or water after dinner.";
    } else if (userMessage.includes('ghee') || userMessage.includes('bilona')) {
      responseText = "Our Vedic A2 Gir Cow Ghee is made using the ancient Bilona method. We boil the milk of grass-fed Gir cows, culture it into curd, and hand-churn it with wooden logs to separate butter before cooking. This ensures it is rich in butyrate and A2 proteins, making it an excellent digestive tonic.";
    } else if (userMessage.includes('order') || userMessage.includes('track')) {
      // Regex check for order IDs
      const orderMatch = userMessage.match(/order-[a-z0-9-]+|ord_[a-z0-9]+/);
      if (orderMatch) {
        responseText = `Checking tracking status for Order ID: ${orderMatch[0]}. \n\nYour order is currently processing and is scheduled to be handed over to our sustainable delivery partner within 24 hours. You will receive a tracking link via WhatsApp!`;
      } else {
        responseText = "I can help track your package! Please type your order number (e.g., 'Track Order-1234') or log into your User Dashboard under 'Orders' to view real-time shipping updates.";
      }
    } else if (userMessage.includes('shipping') || userMessage.includes('delivery')) {
      responseText = "We deliver across India. For orders above ₹499, delivery is free. Standard deliveries take 3-5 business days depending on your location. We package everything using eco-friendly, plastic-free biodegradable wraps.";
    } else if (userMessage.includes('refund') || userMessage.includes('return')) {
      responseText = "We offer a 7-day hassle-free return policy on unused and sealed products if they arrive damaged or incorrect. Please visit our Contact Us page or WhatsApp our support team at +91-999-999-9999 to initiate a refund request.";
    } else if (userMessage.includes('recommend') || userMessage.includes('suggest') || userMessage.includes('buy')) {
      responseText = "To recommend the absolute best products, you can take our **AI Product Recommendation Quiz** on the Shop page, or tell me: Are you looking for Immunity, Better Sleep, Skincare, or Puja Rituals?";
    } else if (userMessage.includes('immunity')) {
      responseText = "For strengthening immunity, I highly recommend: \n1. **Organic Ashwagandha Capsules** - a powerful adaptogen.\n2. **Organic Tulsi Herbal Tea** - rich in antioxidants and respiratory support.\nWould you like me to guide you on how to add these to your cart?";
    } else {
      // General fallbacks search matching categories
      const categories = ['herbal products', 'organic food', 'spiritual essentials', 'personal care', 'puja essentials', 'gift sets'];
      const matchedCategory = categories.find(cat => userMessage.includes(cat));

      if (matchedCategory) {
        responseText = `We have a premium curated line of ${matchedCategory}. You can browse the full range directly in our **Shop** section, where you can sort by price, popularity, and filter by sub-categories.`;
      } else {
        responseText = "That is an intriguing question. From a Vedic perspective, balance is achieved when your lifestyle matches your natural constitution (Prakriti). For specific wellness goals, I recommend browsing our organic product range or consulting with a Vaidya (Ayurvedic doctor). Is there a specific product from our shop you would like to know the benefits of?";
      }
    }

    return res.status(200).json({
      success: true,
      message: responseText
    });

  } catch (error) {
    next(error);
  }
};
