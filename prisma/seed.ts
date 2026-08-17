import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { stockImages } from "../src/lib/stock-images";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// Store bare base URLs — pages apply sizing/query params via unsplash() at render time.
const img = (key: keyof typeof stockImages) => stockImages[key];

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  await prisma.user.upsert({
    where: { email: "admin@vogue-chic.com" },
    update: { name: "Vogue-Chic Admin", role: "ADMIN" },
    create: {
      email: "admin@vogue-chic.com",
      passwordHash,
      name: "Vogue-Chic Admin",
      role: "ADMIN",
    },
  });

  const maisonEliteUser = await prisma.user.upsert({
    where: { email: "vendor@maisonelite.com" },
    update: { name: "Maison Elite", role: "VENDOR" },
    create: { email: "vendor@maisonelite.com", passwordHash, name: "Maison Elite", role: "VENDOR" },
  });
  const maisonEliteVendorData = {
    brandName: "Maison Elite",
    tagline: "Editorial luxury, uncompromising craft.",
    bio: "Maison Elite crafts architectural silhouettes for the modern purist, blending heritage tailoring with avant-garde textures. Founded on the principle that restraint is the ultimate form of elegance.",
    logoImage: img("darkPortrait"),
    heroImage: img("editorialBlazer"),
    coverImage: img("boutiqueInterior"),
    contactEmail: "concierge@maisonelite.com",
    phone: "+1 (212) 555-0142",
    hqAddress: "24 Rue de la Mode, New York, NY 10012",
    shippingPolicy: "Complimentary white-glove shipping on all orders over $500. Standard delivery within 5-7 business days; expedited options available at checkout.",
    bespokePolicy: "Bespoke alterations available by appointment. Please allow 3-4 weeks for made-to-measure pieces.",
    currency: "USD",
  };
  const maisonEliteVendor = await prisma.vendorProfile.upsert({
    where: { slug: "maison-elite" },
    update: maisonEliteVendorData,
    create: { ...maisonEliteVendorData, slug: "maison-elite", userId: maisonEliteUser.id },
  });

  const shipluxeUser = await prisma.user.upsert({
    where: { email: "vendor@shipluxe.com" },
    update: { name: "ShipLuxe", role: "VENDOR" },
    create: { email: "vendor@shipluxe.com", passwordHash, name: "ShipLuxe", role: "VENDOR" },
  });
  const shipluxeVendorData = {
    brandName: "ShipLuxe",
    tagline: "Considered pieces, delivered with care.",
    bio: "ShipLuxe curates a refined edit of resort and everyday luxury essentials for the discerning traveler.",
    logoImage: img("portraitMale2"),
    heroImage: img("whiteDress"),
    coverImage: img("neutralBag"),
    contactEmail: "hello@shipluxe.com",
    phone: "+33 1 55 55 01 42",
    hqAddress: "12 Avenue Montaigne, Paris, 75008",
    shippingPolicy: "Free EU shipping over €300. International delivery in 7-10 business days.",
    bespokePolicy: "Personal styling consultations available online.",
    currency: "EUR",
  };
  const shipluxeVendor = await prisma.vendorProfile.upsert({
    where: { slug: "shipluxe" },
    update: shipluxeVendorData,
    create: { ...shipluxeVendorData, slug: "shipluxe", userId: shipluxeUser.id },
  });

  const elena = await prisma.user.upsert({
    where: { email: "elena.vance@example.com" },
    update: { name: "Elena Vance", role: "CUSTOMER" },
    create: { email: "elena.vance@example.com", passwordHash, name: "Elena Vance", role: "CUSTOMER" },
  });
  const elenaProfileData = {
    avatar: img("portraitFemale1"),
    vipTier: "VIP" as const,
    bio: "Longtime patron of avant-garde tailoring and considered resort wear. Prefers architectural silhouettes in neutral palettes.",
    phone: "+1 (917) 555-0110",
    location: "New York, NY",
    sizingProfile: { tops: "IT 40", bottoms: "IT 40", shoes: "EU 38" },
    aestheticTags: ["Minimalist", "Avant-Garde"],
    favoredMaterials: ["Silk", "Cashmere"],
  };
  await prisma.customerProfile.upsert({
    where: { userId: elena.id },
    update: elenaProfileData,
    create: { ...elenaProfileData, userId: elena.id },
  });

  const julian = await prisma.user.upsert({
    where: { email: "julian.cross@example.com" },
    update: { name: "Julian Cross", role: "CUSTOMER" },
    create: { email: "julian.cross@example.com", passwordHash, name: "Julian Cross", role: "CUSTOMER" },
  });
  const julianProfileData = {
    avatar: img("portraitMale1"),
    vipTier: "ELITE" as const,
    bio: "Collector of tailored outerwear and considered accessories.",
    phone: "+1 (646) 555-0198",
    location: "Los Angeles, CA",
    sizingProfile: { tops: "US 40R", bottoms: "US 32", shoes: "US 10" },
    aestheticTags: ["Classic", "Tailored"],
    favoredMaterials: ["Wool", "Leather"],
  };
  await prisma.customerProfile.upsert({
    where: { userId: julian.id },
    update: julianProfileData,
    create: { ...julianProfileData, userId: julian.id },
  });

  const writer = await prisma.user.upsert({
    where: { email: "writer@vogue-chic.com" },
    update: { name: "Camille Renard", role: "WRITER" },
    create: { email: "writer@vogue-chic.com", passwordHash, name: "Camille Renard", role: "WRITER" },
  });

  // ---- Collections ----
  const collectionDefs = [
    {
      slug: "noir-obscur-fw24",
      vendorId: maisonEliteVendor.id,
      name: "Noir Obscur",
      season: "Fall/Winter 2024",
      editorialDescription: "A study in architectural darkness — structural coats and sculptural silhouettes rendered in obsidian and charcoal.",
      heroImage: img("editorialBlazer"),
      campaignImages: [img("darkPortrait"), img("boutiqueInterior")],
      tags: ["Minimalist", "Avant-Garde", "Sustainable"],
      status: "ACTIVE" as const,
      publishedAt: new Date("2024-09-15"),
      revenue: 84500,
      itemCount: 5,
    },
    {
      slug: "resort-25",
      vendorId: maisonEliteVendor.id,
      name: "Resort 25",
      season: "Resort 2025",
      editorialDescription: "Fluid draping and considered whites for warm-weather escapes, cut for the modern purist.",
      heroImage: img("whiteDress"),
      campaignImages: [img("whiteDress")],
      tags: ["Minimalist", "Resort"],
      status: "ACTIVE" as const,
      publishedAt: new Date("2025-01-10"),
      revenue: 40000,
      itemCount: 3,
    },
    {
      slug: "spring-awakening-draft",
      vendorId: maisonEliteVendor.id,
      name: "Spring Awakening",
      season: "Spring/Summer 2025",
      editorialDescription: "An unreleased exploration of texture and translucency.",
      heroImage: img("boutiqueInterior"),
      campaignImages: [] as string[],
      tags: ["Draft"],
      status: "DRAFT" as const,
      revenue: 0,
      itemCount: 0,
    },
    {
      slug: "shipluxe-signature",
      vendorId: shipluxeVendor.id,
      name: "Signature Edit",
      season: "Resort 2025",
      editorialDescription: "The ShipLuxe travel-ready essentials, curated for effortless movement.",
      heroImage: img("neutralBag"),
      campaignImages: [img("tealShoe")],
      tags: ["Resort", "Everyday Luxury"],
      status: "ACTIVE" as const,
      publishedAt: new Date("2024-11-01"),
      revenue: 28900,
      itemCount: 2,
    },
  ];
  const collections: Record<string, Awaited<ReturnType<typeof prisma.collection.upsert>>> = {};
  for (const { slug, ...data } of collectionDefs) {
    collections[slug] = await prisma.collection.upsert({
      where: { slug },
      update: data,
      create: { slug, ...data },
    });
  }
  const noirObscur = collections["noir-obscur-fw24"];
  const resort25 = collections["resort-25"];
  const springDraft = collections["spring-awakening-draft"];
  const shipluxeSignature = collections["shipluxe-signature"];

  // ---- Products ----
  const productDefs = [
    {
      slug: "obsidian-silk-gown",
      name: "Obsidian Silk Gown",
      price: 2450,
      collectionId: noirObscur.id,
      vendorId: maisonEliteVendor.id,
      currency: "USD",
      image: img("darkPortrait"),
      category: "Eveningwear",
      materials: ["Silk"],
      unitsSold: 34,
    },
    {
      slug: "structural-wool-trench",
      name: "Structural Wool Trench",
      price: 1890,
      collectionId: noirObscur.id,
      vendorId: maisonEliteVendor.id,
      currency: "USD",
      image: img("editorialBlazer"),
      category: "Outerwear",
      materials: ["Wool", "Cashmere"],
      unitsSold: 21,
    },
    {
      slug: "charcoal-tailored-blazer",
      name: "Charcoal Tailored Blazer",
      price: 1320,
      collectionId: noirObscur.id,
      vendorId: maisonEliteVendor.id,
      currency: "USD",
      image: img("editorialBlazer"),
      category: "Outerwear",
      materials: ["Wool"],
      unitsSold: 18,
    },
    {
      slug: "sculpted-leather-tote",
      name: "Sculpted Leather Tote",
      price: 980,
      collectionId: noirObscur.id,
      vendorId: maisonEliteVendor.id,
      currency: "USD",
      image: img("neutralBag"),
      category: "Accessories",
      materials: ["Leather"],
      unitsSold: 42,
    },
    {
      slug: "obsidian-ankle-boot",
      name: "Obsidian Ankle Boot",
      price: 760,
      collectionId: noirObscur.id,
      vendorId: maisonEliteVendor.id,
      currency: "USD",
      image: img("tealShoe"),
      category: "Footwear",
      materials: ["Leather"],
      unitsSold: 27,
    },
    {
      slug: "linen-draped-dress",
      name: "Linen Draped Dress",
      price: 890,
      collectionId: resort25.id,
      vendorId: maisonEliteVendor.id,
      currency: "USD",
      image: img("whiteDress"),
      category: "Daywear",
      materials: ["Organic Cotton"],
      unitsSold: 15,
    },
    {
      slug: "resort-silk-blouse",
      name: "Resort Silk Blouse",
      price: 540,
      collectionId: resort25.id,
      vendorId: maisonEliteVendor.id,
      currency: "USD",
      image: img("whiteDress"),
      category: "Daywear",
      materials: ["Silk"],
      unitsSold: 9,
    },
    {
      slug: "travel-leather-weekender",
      name: "Travel Leather Weekender",
      price: 1150,
      collectionId: shipluxeSignature.id,
      vendorId: shipluxeVendor.id,
      currency: "EUR",
      image: img("neutralBag"),
      category: "Accessories",
      materials: ["Leather"],
      unitsSold: 31,
    },
    {
      slug: "suede-travel-loafer",
      name: "Suede Travel Loafer",
      price: 420,
      collectionId: shipluxeSignature.id,
      vendorId: shipluxeVendor.id,
      currency: "EUR",
      image: img("tealShoe"),
      category: "Footwear",
      materials: ["Suede"],
      unitsSold: 19,
    },
  ];

  const products: Record<string, Awaited<ReturnType<typeof prisma.product.upsert>>> = {};
  for (const p of productDefs) {
    const data = {
      vendorId: p.vendorId,
      collectionId: p.collectionId,
      name: p.name,
      description: `${p.name} — crafted with exceptional attention to detail, part of the ${p.collectionId === noirObscur.id ? "Noir Obscur" : p.collectionId === resort25.id ? "Resort 25" : "Signature Edit"} collection.`,
      price: p.price,
      currency: p.currency,
      images: [p.image],
      colors: [
        { name: "Black", hex: "#000000" },
        { name: "Charcoal", hex: "#2f3131" },
      ],
      materials: p.materials,
      dimensions: { height: "42cm", width: "30cm", depth: "18cm" },
      sizes: ["XS", "S", "M", "L"],
      category: p.category,
      occasion: ["Evening", "Everyday Luxury"],
      sustainabilityTags: p.materials.includes("Organic Cotton") ? ["Organic Materials"] : [],
      stock: 12,
      unitsSold: p.unitsSold,
      views: p.unitsSold * 14,
    };
    products[p.slug] = await prisma.product.upsert({
      where: { slug: p.slug },
      update: data,
      create: { slug: p.slug, ...data },
    });
  }

  // ---- Orders ----
  const orderDefs = [
    {
      orderNumber: "ORD-9921",
      customerId: elena.id,
      vendorId: maisonEliteVendor.id,
      status: "SHIPPED" as const,
      items: [
        { product: products["obsidian-silk-gown"], qty: 1, color: "Black", size: "S" },
        { product: products["sculpted-leather-tote"], qty: 1, color: "Black", size: "M" },
      ],
    },
    {
      orderNumber: "ORD-9922",
      customerId: julian.id,
      vendorId: maisonEliteVendor.id,
      status: "PENDING" as const,
      items: [{ product: products["structural-wool-trench"], qty: 1, color: "Charcoal", size: "L" }],
    },
    {
      orderNumber: "ORD-9918",
      customerId: elena.id,
      vendorId: maisonEliteVendor.id,
      status: "DELIVERED" as const,
      items: [{ product: products["linen-draped-dress"], qty: 1, color: "Black", size: "S" }],
    },
    {
      orderNumber: "ORD-9925",
      customerId: julian.id,
      vendorId: maisonEliteVendor.id,
      status: "PROCESSING" as const,
      items: [{ product: products["obsidian-ankle-boot"], qty: 1, color: "Black", size: "M" }],
    },
  ];

  const orders: Record<string, Awaited<ReturnType<typeof prisma.order.upsert>>> = {};
  for (const o of orderDefs) {
    const subtotal = o.items.reduce((sum, i) => sum + Number(i.product.price) * i.qty, 0);
    const shipping = 0;
    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    const total = subtotal + shipping + tax;

    const order = await prisma.order.upsert({
      where: { orderNumber: o.orderNumber },
      update: {},
      create: {
        orderNumber: o.orderNumber,
        customerId: o.customerId,
        vendorId: o.vendorId,
        status: o.status,
        subtotal,
        shipping,
        tax,
        total,
        currency: "USD",
        shippingAddress: {
          name: o.customerId === elena.id ? "Elena Vance" : "Julian Cross",
          line1: "432 Park Avenue, Apt 12B",
          city: "New York",
          state: "NY",
          zip: "10022",
          country: "USA",
        },
        paymentMethodLast4: "4242",
        items: {
          create: o.items.map((i) => ({
            productId: i.product.id,
            titleSnapshot: i.product.name,
            imageSnapshot: i.product.images[0],
            color: i.color,
            size: i.size,
            qty: i.qty,
            price: i.product.price,
          })),
        },
        historyEvents: {
          create: [
            { status: "PENDING", note: "Order placed", createdAt: new Date("2025-01-05") },
            ...(o.status !== "PENDING"
              ? [{ status: "PROCESSING" as const, note: "Payment confirmed", createdAt: new Date("2025-01-06") }]
              : []),
            ...(o.status === "SHIPPED" || o.status === "DELIVERED"
              ? [{ status: "SHIPPED" as const, note: "Dispatched via white-glove courier", createdAt: new Date("2025-01-08") }]
              : []),
            ...(o.status === "DELIVERED"
              ? [{ status: "DELIVERED" as const, note: "Delivered and signed for", createdAt: new Date("2025-01-11") }]
              : []),
          ],
        },
      },
    });
    orders[o.orderNumber] = order;
  }

  // ---- Conversation + Messages ----
  const existingConversation = await prisma.conversation.findFirst({
    where: { customerId: elena.id, vendorId: maisonEliteVendor.id },
  });
  if (!existingConversation) {
    await prisma.conversation.create({
      data: {
        customerId: elena.id,
        vendorId: maisonEliteVendor.id,
        orderId: orders["ORD-9921"].id,
        lastMessageAt: new Date("2025-01-09"),
        messages: {
          create: [
            {
              senderId: elena.id,
              body: "Hello! Could you let me know the expected delivery window for ORD-9921?",
              createdAt: new Date("2025-01-08T10:00:00Z"),
            },
            {
              senderId: maisonEliteUser.id,
              body: "Hello Elena, thank you for reaching out. Your order shipped this morning via white-glove courier and should arrive within 2-3 business days.",
              createdAt: new Date("2025-01-08T14:30:00Z"),
            },
            {
              senderId: elena.id,
              body: "Wonderful, thank you for the quick response!",
              createdAt: new Date("2025-01-09T09:15:00Z"),
            },
          ],
        },
      },
    });
  }

  // ---- Note ----
  const existingNote = await prisma.note.findFirst({
    where: { vendorId: maisonEliteVendor.id, customerId: elena.id },
  });
  if (!existingNote) {
    await prisma.note.create({
      data: {
        vendorId: maisonEliteVendor.id,
        customerId: elena.id,
        authorId: maisonEliteUser.id,
        body: "Prefers matte black hardware over silver. Runs true to IT sizing. Reach out ahead of Noir Obscur restocks.",
      },
    });
  }

  // ---- Promo codes ----
  const promoDefs = [
    {
      code: "ELEGANCE20",
      title: "Elegance Weekend",
      description: "20% off eveningwear",
      discountType: "PERCENT" as const,
      discountValue: 20,
      minOrderValue: 200,
      usageLimit: 500,
      usageCount: 128,
      status: "ACTIVE" as const,
      validFrom: new Date("2025-01-01"),
      validUntil: new Date("2025-03-01"),
    },
    {
      code: "NEWSEASON",
      title: "New Season Preview",
      description: "$150 off orders over $1000",
      discountType: "FIXED" as const,
      discountValue: 150,
      minOrderValue: 1000,
      usageLimit: null,
      usageCount: 42,
      status: "SCHEDULED" as const,
      validFrom: new Date("2025-03-01"),
      validUntil: new Date("2025-04-01"),
    },
    {
      code: "WELCOME10",
      title: "Welcome Offer",
      description: "10% off first order",
      discountType: "PERCENT" as const,
      discountValue: 10,
      minOrderValue: null,
      usageLimit: 1000,
      usageCount: 891,
      status: "EXPIRED" as const,
      validFrom: new Date("2024-06-01"),
      validUntil: new Date("2024-09-01"),
    },
  ];

  const promoCodes: Record<string, Awaited<ReturnType<typeof prisma.promoCode.upsert>>> = {};
  for (const p of promoDefs) {
    promoCodes[p.code] = await prisma.promoCode.upsert({
      where: { code: p.code },
      update: { ...p, vendorId: maisonEliteVendor.id },
      create: { ...p, vendorId: maisonEliteVendor.id },
    });
  }

  const shipluxePromo = await prisma.promoCode.upsert({
    where: { code: "SHIPLUXE" },
    update: {},
    create: {
      code: "SHIPLUXE",
      title: "Free Shipping",
      description: "Complimentary shipping, no minimum",
      discountType: "FREE_SHIPPING",
      discountValue: 0,
      usageLimit: null,
      usageCount: 340,
      status: "ACTIVE",
      validFrom: new Date("2024-10-01"),
      validUntil: new Date("2025-12-31"),
      vendorId: shipluxeVendor.id,
    },
  });

  const existingRedemption = await prisma.promoRedemption.findUnique({ where: { orderId: orders["ORD-9921"].id } });
  if (!existingRedemption) {
    await prisma.promoRedemption.create({
      data: {
        promoCodeId: promoCodes["ELEGANCE20"].id,
        orderId: orders["ORD-9921"].id,
        customerId: elena.id,
        discountAmount: 490,
      },
    });
  }
  void shipluxePromo;

  // ---- Campaigns ----
  const campaignDefs = [
    {
      title: "Noir Obscur Launch",
      coverImage: img("editorialBlazer"),
      status: "ACTIVE" as const,
      reach: 48200,
      conversionRate: 4.6,
    },
    {
      title: "Spring Awakening Preview",
      coverImage: img("boutiqueInterior"),
      status: "SCHEDULED" as const,
      scheduledDate: new Date("2025-03-15"),
      reach: 0,
      conversionRate: 0,
    },
  ];
  for (const c of campaignDefs) {
    const exists = await prisma.campaign.findFirst({ where: { title: c.title } });
    if (!exists) {
      await prisma.campaign.create({ data: { ...c, vendorId: maisonEliteVendor.id } });
    }
  }

  void springDraft;

  // ---- Stories ----
  const storyDefs = [
    {
      slug: "inside-the-atelier-noir-obscur",
      title: "Inside the Atelier: Noir Obscur",
      excerpt: "A first look at the darkened silhouettes and considered restraint behind Maison Elite's most talked-about collection.",
      body: "Every collection begins in silence — before the first sketch, before the first swatch of cloth is pinned to the mannequin. Noir Obscur started with a single question: what remains when everything unnecessary is stripped away?\n\nThe answer arrived slowly, over a season of fittings in a converted warehouse studio. Structural coats in obsidian wool, cut with an architect's precision. Silk gowns that catch light like water at night. Nothing decorative, nothing borrowed from trend — only form, weight, and the quiet confidence of a house that knows exactly what it is.\n\n\"We wanted the clothes to feel like a held breath,\" the creative director told us during a rare studio visit. That tension — between restraint and drama — is what makes Noir Obscur unmistakably Maison Elite.",
      coverImage: img("editorialBlazer"),
      status: "PUBLISHED" as const,
      publishedAt: new Date("2024-09-10"),
    },
    {
      slug: "the-case-for-considered-travel-wear",
      title: "The Case for Considered Travel Wear",
      excerpt: "ShipLuxe's Signature Edit makes an argument for fewer, better pieces on the road.",
      body: "Travel wardrobes have a reputation problem — either performance fabric with no soul, or delicate pieces that don't survive a single layover. ShipLuxe's Signature Edit sets out to prove there's a third way.\n\nThe leather weekender at the heart of the collection is built to age well rather than resist aging entirely; a patina, the brand argues, is a feature, not a flaw. Suede loafers are treated for light rain but still soft enough to pack flat. Every piece answers a real question a traveler actually asks, rather than a marketing brief.\n\nIt's a small collection — deliberately so. \"We'd rather someone own four pieces they reach for every trip than forty they never unpack,\" says the ShipLuxe team.",
      coverImage: img("neutralBag"),
      status: "PUBLISHED" as const,
      publishedAt: new Date("2024-11-05"),
    },
    {
      slug: "notes-from-spring-awakening",
      title: "Notes from Spring Awakening (Draft)",
      excerpt: "Early notes on an unreleased collection — texture, translucency, and what comes after Noir Obscur.",
      body: "Still gathering references for this one. Revisit before publishing.",
      coverImage: img("boutiqueInterior"),
      status: "DRAFT" as const,
      publishedAt: null,
    },
  ];
  for (const { slug, ...data } of storyDefs) {
    await prisma.story.upsert({
      where: { slug },
      update: { ...data, authorId: writer.id },
      create: { slug, ...data, authorId: writer.id },
    });
  }

  console.log("Seed complete:", {
    vendors: [maisonEliteUser.email, shipluxeUser.email],
    customers: [elena.email, julian.email],
    writer: writer.email,
    collections: 4,
    products: Object.keys(products).length,
    orders: Object.keys(orders).length,
    stories: storyDefs.length,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
