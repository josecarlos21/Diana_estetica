import { PrismaClient } from '@prisma/client'
import 'dotenv/config'

const prisma = new PrismaClient()

const SERVICES = [
    {
        name: 'Signature Cut',
        description: 'Diseño de corte personalizado basado en tu estructura ósea.',
        price: 850,
        durationMin: 60,
        category: 'Corte'
    },
    {
        name: 'Peinado Social',
        description: 'Estilizado de larga duración para eventos exclusivos.',
        price: 950,
        durationMin: 60,
        category: 'Peinado'
    },
    {
        name: 'Balayage Premium',
        description: 'Técnica exclusiva de iluminación orgánica sin marcas.',
        price: 2800,
        durationMin: 240,
        category: 'Colorimetría'
    },
    {
        name: 'Botox Capilar',
        description: 'Recuperación de brillo instantáneo y nutrición profunda.',
        price: 1400,
        durationMin: 90,
        category: 'Tratamiento'
    },
    {
        name: 'Full Color Mix',
        description: 'Color global de alta definición con protección de fibra.',
        price: 1650,
        durationMin: 120,
        category: 'Colorimetría'
    },
    {
        name: 'Hidratación Zen',
        description: 'Tratamiento spa de vapor para cuero cabelludo sensible.',
        price: 900,
        durationMin: 45,
        category: 'Tratamiento'
    }
];

const STYLISTS = [
    {
        id: 'diana',
        name: 'Diana',
        specialties: JSON.stringify(['Corte', 'Colorimetría']),
        bio: 'Directora Creativa. Especialista en arquitectura capilar y colorimetría avanzada.',
        rating: 5.0,
        avatarUrl: ''
    },
    {
        id: 'staff',
        name: 'Senior Staff',
        specialties: JSON.stringify(['Tratamiento', 'Peinado']),
        bio: 'Equipo técnico especializado bajo la metodología Diana Studio.',
        rating: 4.8,
        avatarUrl: ''
    }
];

async function main() {
    console.log('Seeding database...')

    // Clean up
    await prisma.bookingService.deleteMany()
    await prisma.booking.deleteMany()
    await prisma.service.deleteMany()
    await prisma.stylist.deleteMany()

    // Insert Services
    for (const service of SERVICES) {
        await prisma.service.create({
            data: service
        })
    }

    // Insert Stylists
    for (const stylist of STYLISTS) {
        await prisma.stylist.create({
            data: stylist
        })
    }

    console.log('Seeding finished.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
