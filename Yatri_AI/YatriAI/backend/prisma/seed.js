"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting database seed...');
    // Clear existing data
    await prisma.itineraryDestination.deleteMany();
    await prisma.itinerary.deleteMany();
    await prisma.guideBooking.deleteMany();
    await prisma.tour.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.product.deleteMany();
    await prisma.feedback.deleteMany();
    await prisma.seller.deleteMany();
    await prisma.guide.deleteMany();
    await prisma.travelPreference.deleteMany();
    await prisma.user.deleteMany();
    await prisma.destination.deleteMany();
    await prisma.testimonial.deleteMany();
    await prisma.aITip.deleteMany();
    console.log('✅ Cleared existing data');
    // Create Admin User
    const hashedPassword = await bcryptjs_1.default.hash('admin123', 12);
    const adminUser = await prisma.user.create({
        data: {
            email: 'admin@yatri.ai',
            password: hashedPassword,
            name: 'Admin User',
            role: 'admin',
            isVerified: true,
            avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
        }
    });
    console.log('✅ Created admin user');
    // Create Tourist Users
    const touristPassword = await bcryptjs_1.default.hash('tourist123', 12);
    const tourists = await Promise.all([
        prisma.user.create({
            data: {
                email: 'john.doe@example.com',
                password: touristPassword,
                name: 'John Doe',
                role: 'tourist',
                isVerified: true,
                avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
                preferences: {
                    create: {
                        interests: ['nature', 'cultural'],
                        budget: 'mid_range',
                        travelStyle: 'solo',
                        duration: 3
                    }
                }
            }
        }),
        prisma.user.create({
            data: {
                email: 'sarah.wilson@example.com',
                password: touristPassword,
                name: 'Sarah Wilson',
                role: 'tourist',
                isVerified: true,
                avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
                preferences: {
                    create: {
                        interests: ['adventure', 'nature'],
                        budget: 'luxury',
                        travelStyle: 'couple',
                        duration: 5
                    }
                }
            }
        })
    ]);
    console.log('✅ Created tourist users');
    // Create Guide Users
    const guidePassword = await bcryptjs_1.default.hash('guide123', 12);
    const guideUsers = await Promise.all([
        prisma.user.create({
            data: {
                email: 'ravi.kumar@example.com',
                password: guidePassword,
                name: 'Ravi Kumar',
                role: 'guide',
                isVerified: true,
                avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
            }
        }),
        prisma.user.create({
            data: {
                email: 'priya.sharma@example.com',
                password: guidePassword,
                name: 'Priya Sharma',
                role: 'guide',
                isVerified: true,
                avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
            }
        }),
        prisma.user.create({
            data: {
                email: 'amit.singh@example.com',
                password: guidePassword,
                name: 'Amit Singh',
                role: 'guide',
                isVerified: true,
                avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
            }
        })
    ]);
    // Create Guide Profiles
    const guides = await Promise.all([
        prisma.guide.create({
            data: {
                userId: guideUsers[0].id,
                experience: 8,
                languages: ['English', 'Hindi', 'Santhali'],
                specialties: ['Wildlife Tours', 'Tribal Culture', 'Adventure Sports'],
                pricePerDay: 2500,
                location: 'Ranchi',
                rating: 4.8
            }
        }),
        prisma.guide.create({
            data: {
                userId: guideUsers[1].id,
                experience: 6,
                languages: ['English', 'Hindi', 'Mundari'],
                specialties: ['Cultural Tours', 'Photography', 'Local Cuisine'],
                pricePerDay: 2000,
                location: 'Jamshedpur',
                rating: 4.9
            }
        }),
        prisma.guide.create({
            data: {
                userId: guideUsers[2].id,
                experience: 10,
                languages: ['English', 'Hindi', 'Ho'],
                specialties: ['Trekking', 'Nature Walks', 'Bird Watching'],
                pricePerDay: 3000,
                location: 'Dhanbad',
                rating: 4.6
            }
        })
    ]);
    console.log('✅ Created guide users and profiles');
    // Create Guide Tours
    await Promise.all([
        prisma.tour.create({
            data: {
                guideId: guides[0].id,
                title: 'Wildlife Safari at Sundarbans',
                description: 'Explore the rich wildlife of Sundarbans with expert guidance',
                image: 'https://images.pexels.com/photos/1770809/pexels-photo-1770809.jpeg?auto=compress&cs=tinysrgb&w=400',
                status: 'Active',
                duration: '3 days',
                price: 2500,
                bookings: 12
            }
        }),
        prisma.tour.create({
            data: {
                guideId: guides[0].id,
                title: 'Cultural Heritage Tour',
                description: 'Discover the tribal culture and traditions of Jharkhand',
                image: 'https://images.pexels.com/photos/1770809/pexels-photo-1770809.jpeg?auto=compress&cs=tinysrgb&w=400',
                status: 'Active',
                duration: '2 days',
                price: 2000,
                bookings: 8
            }
        }),
        prisma.tour.create({
            data: {
                guideId: guides[1].id,
                title: 'Waterfall Trekking Adventure',
                description: 'Trek to the beautiful waterfalls of Jharkhand',
                image: 'https://images.pexels.com/photos/1770809/pexels-photo-1770809.jpeg?auto=compress&cs=tinysrgb&w=400',
                status: 'Draft',
                duration: '1 day',
                price: 1500,
                bookings: 0
            }
        })
    ]);
    console.log('✅ Created guide tours');
    // Create Seller Users
    const sellerPassword = await bcryptjs_1.default.hash('seller123', 12);
    const sellerUser = await prisma.user.create({
        data: {
            email: 'tribal.crafts@example.com',
            password: sellerPassword,
            name: 'Tribal Crafts Co-op',
            role: 'seller',
            isVerified: true,
            avatar: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
        }
    });
    const seller = await prisma.seller.create({
        data: {
            userId: sellerUser.id,
            shopName: 'Tribal Crafts Co-op',
            rating: 4.7
        }
    });
    // Create Products
    await Promise.all([
        prisma.product.create({
            data: {
                sellerId: seller.id,
                name: 'Handwoven Tribal Basket',
                description: 'Authentic bamboo basket crafted by local artisans',
                price: 850,
                image: 'https://images.pexels.com/photos/1770809/pexels-photo-1770809.jpeg?auto=compress&cs=tinysrgb&w=400',
                category: 'Handicrafts',
                stock: 25,
                status: 'Active',
                sales: 45
            }
        }),
        prisma.product.create({
            data: {
                sellerId: seller.id,
                name: 'Dokra Metal Art',
                description: 'Traditional brass figurine using ancient lost-wax technique',
                price: 1200,
                image: 'https://images.pexels.com/photos/1770809/pexels-photo-1770809.jpeg?auto=compress&cs=tinysrgb&w=400',
                category: 'Art',
                stock: 15,
                status: 'Active',
                sales: 28
            }
        }),
        prisma.product.create({
            data: {
                sellerId: seller.id,
                name: 'Santhali Handloom Saree',
                description: 'Beautiful handwoven saree with traditional tribal patterns',
                price: 2500,
                image: 'https://images.pexels.com/photos/1770809/pexels-photo-1770809.jpeg?auto=compress&cs=tinysrgb&w=400',
                category: 'Textiles',
                stock: 8,
                status: 'Active',
                sales: 12
            }
        }),
        prisma.product.create({
            data: {
                sellerId: seller.id,
                name: 'Tribal Jewelry Set',
                description: 'Authentic tribal jewelry made with traditional techniques',
                price: 1800,
                image: 'https://images.pexels.com/photos/1770809/pexels-photo-1770809.jpeg?auto=compress&cs=tinysrgb&w=400',
                category: 'Jewelry',
                stock: 0,
                status: 'Out_of_Stock',
                sales: 35
            }
        })
    ]);
    console.log('✅ Created seller and products');
    // Create Destinations
    const destinations = await Promise.all([
        prisma.destination.create({
            data: {
                name: 'Sundarbans',
                description: 'Home to Royal Bengal Tigers, crocodiles, and diverse wildlife in pristine mangrove forests',
                image: 'https://images.pexels.com/photos/1770809/pexels-photo-1770809.jpeg?auto=compress&cs=tinysrgb&w=800',
                category: 'nature',
                rating: 4.5,
                latitude: 21.9497,
                longitude: 88.9401
            }
        }),
        prisma.destination.create({
            data: {
                name: 'Hundru Falls',
                description: 'Spectacular 98-meter waterfall surrounded by lush greenery',
                image: 'https://images.pexels.com/photos/1770809/pexels-photo-1770809.jpeg?auto=compress&cs=tinysrgb&w=800',
                category: 'nature',
                rating: 4.7,
                latitude: 23.4,
                longitude: 85.3
            }
        }),
        prisma.destination.create({
            data: {
                name: 'Jagannath Temple Ranchi',
                description: 'Ancient temple with stunning architecture and spiritual significance',
                image: 'https://images.pexels.com/photos/1770809/pexels-photo-1770809.jpeg?auto=compress&cs=tinysrgb&w=800',
                category: 'spiritual',
                rating: 4.3,
                latitude: 23.3,
                longitude: 85.3
            }
        }),
        prisma.destination.create({
            data: {
                name: 'Tribal Cultural Museum',
                description: 'Rich collection of tribal art, crafts, and cultural heritage',
                image: 'https://images.pexels.com/photos/1770809/pexels-photo-1770809.jpeg?auto=compress&cs=tinysrgb&w=800',
                category: 'cultural',
                rating: 4.2,
                latitude: 23.4,
                longitude: 85.4
            }
        })
    ]);
    console.log('✅ Created destinations');
    // Create Bookings for tourists
    await Promise.all([
        prisma.booking.create({
            data: {
                userId: tourists[0].id,
                type: 'guide',
                title: 'Wildlife Tour with Ravi Kumar',
                date: new Date('2024-01-15'),
                status: 'confirmed',
                amount: 7500,
                blockchainHash: '0x1a2b3c4d5e6f7890abcdef'
            }
        }),
        prisma.booking.create({
            data: {
                userId: tourists[0].id,
                type: 'accommodation',
                title: 'Eco Resort Stay - Sundarbans',
                date: new Date('2024-01-20'),
                status: 'pending',
                amount: 4500
            }
        }),
        prisma.booking.create({
            data: {
                userId: tourists[1].id,
                type: 'package',
                title: 'Cultural Heritage Tour',
                date: new Date('2024-02-01'),
                status: 'confirmed',
                amount: 12000,
                blockchainHash: '0xabcdef1234567890fedcba'
            }
        })
    ]);
    console.log('✅ Created bookings');
    // Create Itineraries
    const itinerary1 = await prisma.itinerary.create({
        data: {
            userId: tourists[0].id,
            title: 'Jharkhand Wildlife & Nature Explorer',
            duration: 5,
            activities: ['Wildlife Safari', 'Waterfall Trekking', 'Bird Watching', 'Photography'],
            estimatedCost: 15000
        }
    });
    await Promise.all([
        prisma.itineraryDestination.create({
            data: {
                itineraryId: itinerary1.id,
                destinationId: destinations[0].id,
                order: 0
            }
        }),
        prisma.itineraryDestination.create({
            data: {
                itineraryId: itinerary1.id,
                destinationId: destinations[1].id,
                order: 1
            }
        })
    ]);
    const itinerary2 = await prisma.itinerary.create({
        data: {
            userId: tourists[0].id,
            title: 'Cultural Heritage Journey',
            duration: 3,
            activities: ['Temple Visits', 'Museum Tours', 'Local Craft Workshops', 'Traditional Dance Shows'],
            estimatedCost: 8500
        }
    });
    await Promise.all([
        prisma.itineraryDestination.create({
            data: {
                itineraryId: itinerary2.id,
                destinationId: destinations[2].id,
                order: 0
            }
        }),
        prisma.itineraryDestination.create({
            data: {
                itineraryId: itinerary2.id,
                destinationId: destinations[3].id,
                order: 1
            }
        })
    ]);
    console.log('✅ Created itineraries');
    // Create AI Tips
    await Promise.all([
        prisma.aITip.create({ data: { content: "🌟 Best time to visit Hundru Falls is during monsoon season (July-September)" } }),
        prisma.aITip.create({ data: { content: "🎭 Don't miss the Sarhul festival in March - experience authentic tribal culture" } }),
        prisma.aITip.create({ data: { content: "🌡️ Weather Alert: Pleasant weather expected this weekend, perfect for outdoor activities" } }),
        prisma.aITip.create({ data: { content: "🦎 Wildlife Tip: Early morning safaris at Sundarbans have 80% higher tiger spotting chances" } }),
        prisma.aITip.create({ data: { content: "🏺 Local markets in Ranchi offer authentic Dokra art at 30% lower prices than tourist areas" } }),
        prisma.aITip.create({ data: { content: "🚗 Pro Tip: Book local guides in advance during festival seasons for better rates" } })
    ]);
    console.log('✅ Created AI tips');
    // Create Testimonials
    await Promise.all([
        prisma.testimonial.create({
            data: {
                name: 'Sarah Johnson',
                avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
                rating: 5,
                comment: 'YatriAI made my Jharkhand trip absolutely magical! The AI recommendations were spot-on.',
                sentiment: 'Highly Positive',
                location: 'USA'
            }
        }),
        prisma.testimonial.create({
            data: {
                name: 'Rajesh Patel',
                avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
                rating: 5,
                comment: 'The blockchain verification gave me complete trust in the guides and services. Excellent platform!',
                sentiment: 'Trustworthy',
                location: 'Mumbai'
            }
        }),
        prisma.testimonial.create({
            data: {
                name: 'Emily Chen',
                avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
                rating: 4,
                comment: 'Loved the cultural immersion and authentic handicraft marketplace. Will definitely return!',
                sentiment: 'Authentic Experience',
                location: 'Singapore'
            }
        })
    ]);
    console.log('✅ Created testimonials');
    console.log('🎉 Database seeded successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('  Admin:   admin@yatri.ai / admin123');
    console.log('  Tourist: john.doe@example.com / tourist123');
    console.log('  Guide:   ravi.kumar@example.com / guide123');
    console.log('  Seller:  tribal.crafts@example.com / seller123');
}
main()
    .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map