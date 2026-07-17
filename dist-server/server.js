// server/server.ts
import express from "express";
import cors from "cors";

// server/routes/auth.routes.ts
import { Router } from "express";

// server/controllers/auth.controller.ts
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// server/config/db.ts
import { PrismaClient } from "@prisma/client";
var prisma = new PrismaClient();
var db_default = prisma;

// server/controllers/auth.controller.ts
var JWT_SECRET = process.env.JWT_SECRET || "nestly-super-secret-key-for-dev";
var register = async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;
    if (!fullName || !email || !password) {
      res.status(400).json({ error: "Full name, email, and password are required" });
      return;
    }
    const existingCustomer = await db_default.customer.findUnique({ where: { email } });
    if (existingCustomer) {
      res.status(400).json({ error: "Email already exists" });
      return;
    }
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const customer = await db_default.customer.create({
      data: {
        fullName,
        email,
        phone: phone || "",
        passwordHash
      }
    });
    const token = jwt.sign({ id: customer.id }, JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({
      token,
      user: {
        id: customer.id,
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone,
        status: customer.status
      }
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
var login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }
    const customer = await db_default.customer.findUnique({ where: { email } });
    if (!customer) {
      res.status(400).json({ error: "Invalid credentials" });
      return;
    }
    const isMatch = await bcrypt.compare(password, customer.passwordHash);
    if (!isMatch) {
      res.status(400).json({ error: "Invalid credentials" });
      return;
    }
    if (customer.status === "Blocked") {
      res.status(403).json({ error: "Account is blocked. Please contact support." });
      return;
    }
    await db_default.customer.update({
      where: { id: customer.id },
      data: { lastLogin: /* @__PURE__ */ new Date() }
    });
    const token = jwt.sign({ id: customer.id }, JWT_SECRET, { expiresIn: "7d" });
    res.status(200).json({
      token,
      user: {
        id: customer.id,
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone,
        status: customer.status
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
var getMe = async (req, res) => {
  try {
    const customer = await db_default.customer.findUnique({
      where: { id: req.user?.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        address: true,
        zipCode: true,
        profileImage: true,
        status: true,
        createdAt: true
      }
    });
    if (!customer) {
      res.status(404).json({ error: "Customer not found" });
      return;
    }
    res.status(200).json(customer);
  } catch (error) {
    console.error("GetMe error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
var updateProfile = async (req, res) => {
  try {
    const { fullName, phone, address, zipCode } = req.body;
    const updated = await db_default.customer.update({
      where: { id: req.user?.id },
      data: {
        fullName: fullName !== void 0 ? fullName : void 0,
        phone: phone !== void 0 ? phone : void 0,
        address: address !== void 0 ? address : void 0,
        zipCode: zipCode !== void 0 ? zipCode : void 0
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        address: true,
        zipCode: true,
        profileImage: true,
        status: true
      }
    });
    res.status(200).json(updated);
  } catch (error) {
    console.error("UpdateProfile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// server/middleware/auth.middleware.ts
import jwt2 from "jsonwebtoken";
var JWT_SECRET2 = process.env.JWT_SECRET || "nestly-super-secret-key-for-dev";
var requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized: No token provided" });
    return;
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt2.verify(token, JWT_SECRET2);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Unauthorized: Invalid token" });
    return;
  }
};

// server/routes/auth.routes.ts
var router = Router();
router.post("/register", register);
router.post("/login", login);
router.get("/me", requireAuth, getMe);
router.put("/profile", requireAuth, updateProfile);
var auth_routes_default = router;

// server/routes/data.routes.ts
import { Router as Router2 } from "express";

// src/data.ts
var POPULAR_CATEGORIES = [
  {
    id: "cleaning",
    title: "Deep Cleaning",
    description: "From $120",
    icon: "Brush",
    bgColor: "bg-mint-cream/30"
  },
  {
    id: "plumbing",
    title: "Plumbing Repair",
    description: "Hourly rates apply",
    icon: "Wrench",
    bgColor: "bg-mint-cream/30"
  },
  {
    id: "electrical",
    title: "Electrical Fixes",
    description: "Certified Pros",
    icon: "Bolt",
    bgColor: "bg-mint-cream/30"
  },
  {
    id: "handyman",
    title: "General Handyman",
    description: "Book by the hour",
    icon: "Hammer",
    bgColor: "bg-mint-cream/30"
  }
];
var SERVICES_CATALOG = [
  {
    id: "kitchen-sink",
    title: "Kitchen Sink Repair",
    description: "Fix leaks, clogs, or replace standard fixtures. Parts not included.",
    category: "Plumbing",
    price: "$145",
    priceValue: 145,
    iconName: "Droplet",
    badge: "Standard"
  },
  {
    id: "emergency-electrical",
    title: "Emergency Electrical",
    description: "Immediate dispatch for power outages or dangerous faults. 1hr response.",
    category: "Electrical",
    price: "$250/hr",
    priceValue: 250,
    iconName: "Zap",
    badge: "Priority",
    isEmergency: true
  },
  {
    id: "yard-cleanup",
    title: "Yard Cleanup",
    description: "Mowing, edging, and debris removal for standard suburban lots.",
    category: "Yard Care",
    price: "$85",
    priceValue: 85,
    iconName: "Leaf",
    badge: "Standard"
  },
  {
    id: "full-house-cleaning",
    title: "Full House Deep Cleaning",
    description: "Thorough cleaning of all rooms, bathrooms, kitchen, dusting, and vacuuming.",
    category: "Cleaning",
    price: "$180",
    priceValue: 180,
    iconName: "Brush",
    badge: "Standard"
  },
  {
    id: "faucet-replacement",
    title: "Faucet Replacement",
    description: "Remove old faucet and install a new owner-provided unit. Includes supply line hookup.",
    category: "Plumbing",
    price: "$120",
    priceValue: 120,
    iconName: "Wrench",
    badge: "Standard"
  },
  {
    id: "light-fixture-install",
    title: "Light Fixture Installation",
    description: "Safely replace existing ceiling fans, chandeliers, or light fixtures.",
    category: "Electrical",
    price: "$95",
    priceValue: 95,
    iconName: "Bolt",
    badge: "Standard"
  },
  {
    id: "tv-mounting",
    title: "TV Mounting Service",
    description: 'Secure wall mount installation for TVs up to 85". Custom drywall or brick mounting.',
    category: "Handyman",
    price: "$110",
    priceValue: 110,
    iconName: "Hammer",
    badge: "Standard"
  }
];

// server/controllers/data.controller.ts
var getServices = async (req, res) => {
  try {
    const labourServices = await db_default.labourService.findMany({
      where: { isActive: true },
      include: { labour: { select: { fullName: true, id: true } } }
    });
    const live = labourServices.map((s) => ({
      id: s.id,
      title: s.title,
      description: s.description,
      category: s.category,
      price: s.price,
      priceValue: s.priceValue,
      iconName: s.iconName,
      badge: s.badge,
      isEmergency: s.isEmergency,
      labourId: s.labourId,
      labourName: s.labour.fullName
    }));
    res.json([...SERVICES_CATALOG, ...live]);
  } catch (e) {
    res.json(SERVICES_CATALOG);
  }
};
var getCategories = (req, res) => {
  res.json(POPULAR_CATEGORIES);
};
var getLabour = async (req, res) => {
  try {
    const labour = await db_default.labour.findMany({
      where: { status: "Active" },
      include: { services: { where: { isActive: true } } },
      orderBy: { rating: "desc" }
    });
    const shaped = labour.map((l) => ({
      id: l.id,
      name: l.fullName,
      avatarColor: l.avatarColor,
      avatarText: l.avatarText,
      rating: l.rating,
      phone: l.phone,
      reviewsCount: l.reviewsCount,
      badge: l.badge,
      specialties: l.specialties ? l.specialties.split(",").map((s) => s.trim()) : [],
      bio: l.bio,
      completedJobs: l.completedJobs,
      experienceYears: l.experienceYears,
      languages: l.languages ? l.languages.split(",").map((s) => s.trim()) : ["English"],
      services: l.services.map((s) => s.id)
    }));
    res.json(shaped);
  } catch (e) {
    res.json([]);
  }
};

// server/routes/data.routes.ts
var router2 = Router2();
router2.get("/services", getServices);
router2.get("/categories", getCategories);
router2.get("/labour", getLabour);
var data_routes_default = router2;

// server/routes/booking.routes.ts
import { Router as Router3 } from "express";

// server/controllers/booking.controller.ts
var getMyBookings = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const customer = await db_default.customer.findUnique({ where: { id: userId } });
    const bookings = await db_default.booking.findMany({
      where: { customerId: userId },
      orderBy: { createdAt: "desc" },
      include: { labour: true }
    });
    const formatted = bookings.map((b) => ({
      id: b.id,
      serviceId: b.serviceType,
      serviceTitle: b.serviceType,
      category: "Residential Specialist Service",
      userName: customer?.fullName || "Customer",
      userEmail: customer?.email || "",
      userPhone: customer?.phone || "",
      address: b.address,
      zipCode: "",
      date: b.date,
      time: b.time,
      status: b.status || "Assigned",
      notes: b.notes || "",
      price: b.price || "$120.00",
      priceValue: b.priceValue || 120,
      createdAt: b.createdAt.toISOString(),
      assignedPro: {
        name: b.assignedProName || b.labour?.fullName || "Assigned Specialist",
        avatarUrl: b.assignedProAvatar || b.labour?.avatarText || "PR",
        rating: b.assignedProRating || b.labour?.rating || 4.9,
        phone: b.assignedProPhone || b.labour?.phone || "(800) 555-NEST"
      }
    }));
    res.status(200).json(formatted);
  } catch (error) {
    console.error("Failed to fetch bookings:", error);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
};
var createBooking = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const {
      serviceType,
      serviceTitle,
      date,
      time,
      address,
      notes,
      price,
      priceValue,
      labourId,
      assignedProName,
      assignedProAvatar,
      assignedProRating,
      assignedProPhone
    } = req.body;
    const title = serviceTitle || serviceType || "Home Care Specialist Service";
    if (!date || !time || !address) {
      res.status(400).json({ error: "Missing required fields (date, time, address)" });
      return;
    }
    let targetLabourId = labourId || null;
    if (!targetLabourId && assignedProName) {
      const matchedLabour = await db_default.labour.findFirst({
        where: { fullName: assignedProName }
      });
      if (matchedLabour) {
        targetLabourId = matchedLabour.id;
      }
    }
    if (!targetLabourId) {
      const anyLabour = await db_default.labour.findFirst();
      if (anyLabour) {
        targetLabourId = anyLabour.id;
      }
    }
    const customer = await db_default.customer.findUnique({ where: { id: userId } });
    const newBooking = await db_default.booking.create({
      data: {
        customerId: userId,
        serviceType: title,
        date,
        time,
        address,
        notes: notes || null,
        price: price || "$120.00",
        priceValue: typeof priceValue === "number" ? priceValue : 120,
        status: "Assigned",
        labourId: targetLabourId,
        assignedProName: assignedProName || null,
        assignedProAvatar: assignedProAvatar || null,
        assignedProRating: typeof assignedProRating === "number" ? assignedProRating : null,
        assignedProPhone: assignedProPhone || null
      },
      include: { labour: true }
    });
    const formatted = {
      id: newBooking.id,
      serviceId: newBooking.serviceType,
      serviceTitle: newBooking.serviceType,
      category: "Residential Specialist Service",
      userName: customer?.fullName || "Customer",
      userEmail: customer?.email || "",
      userPhone: customer?.phone || "",
      address: newBooking.address,
      zipCode: "",
      date: newBooking.date,
      time: newBooking.time,
      status: newBooking.status || "Assigned",
      notes: newBooking.notes || "",
      price: newBooking.price || "$120.00",
      priceValue: newBooking.priceValue || 120,
      createdAt: newBooking.createdAt.toISOString(),
      assignedPro: {
        name: newBooking.assignedProName || newBooking.labour?.fullName || assignedProName || "Assigned Specialist",
        avatarUrl: newBooking.assignedProAvatar || newBooking.labour?.avatarText || assignedProAvatar || "PR",
        rating: newBooking.assignedProRating || newBooking.labour?.rating || assignedProRating || 4.9,
        phone: newBooking.assignedProPhone || newBooking.labour?.phone || assignedProPhone || "(800) 555-NEST"
      }
    };
    res.status(201).json(formatted);
  } catch (error) {
    console.error("Failed to create booking:", error);
    res.status(500).json({ error: "Failed to create booking" });
  }
};

// server/routes/booking.routes.ts
var router3 = Router3();
router3.use(requireAuth);
router3.get("/", getMyBookings);
router3.post("/", createBooking);
var booking_routes_default = router3;

// server/routes/labour.routes.ts
import { Router as Router4 } from "express";

// server/controllers/labour.controller.ts
import bcrypt2 from "bcryptjs";
import jwt3 from "jsonwebtoken";
var JWT_SECRET3 = process.env.JWT_SECRET || "nestly-super-secret-key-for-dev";
var apply = async (req, res) => {
  try {
    const { fullName, email, phone, specialties, experienceYears, languages, bio, password } = req.body;
    if (!fullName || !email || !phone || !password) {
      res.status(400).json({ error: "Full name, email, phone and password are required." });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: "Invalid email address." });
      return;
    }
    const existing = await db_default.labour.findUnique({ where: { email } });
    if (existing) {
      res.status(400).json({ error: "An account with this email already exists." });
      return;
    }
    const salt = await bcrypt2.genSalt(10);
    const passwordHash = await bcrypt2.hash(password, salt);
    const nameParts = fullName.trim().split(" ");
    const avatarText = nameParts.length >= 2 ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase() : fullName.substring(0, 2).toUpperCase();
    const labour = await db_default.labour.create({
      data: {
        fullName,
        email,
        phone,
        passwordHash,
        bio: bio || "",
        specialties: Array.isArray(specialties) ? specialties.join(",") : specialties || "",
        languages: Array.isArray(languages) ? languages.join(",") : languages || "English",
        experienceYears: parseInt(experienceYears) || 0,
        avatarText
      }
    });
    const token = jwt3.sign({ id: labour.id, role: "labour" }, JWT_SECRET3, { expiresIn: "7d" });
    res.status(201).json({
      token,
      labour: {
        id: labour.id,
        fullName: labour.fullName,
        email: labour.email,
        phone: labour.phone,
        avatarText: labour.avatarText,
        status: labour.status
      }
    });
  } catch (error) {
    console.error("Labour apply error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};
var loginLabour = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required." });
      return;
    }
    const labour = await db_default.labour.findUnique({ where: { email } });
    if (!labour) {
      res.status(401).json({ error: "Invalid credentials." });
      return;
    }
    const isMatch = await bcrypt2.compare(password, labour.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: "Invalid credentials." });
      return;
    }
    if (labour.status === "Blocked") {
      res.status(403).json({ error: "Account suspended. Contact support." });
      return;
    }
    await db_default.labour.update({ where: { id: labour.id }, data: { lastLogin: /* @__PURE__ */ new Date() } });
    const token = jwt3.sign({ id: labour.id, role: "labour" }, JWT_SECRET3, { expiresIn: "7d" });
    res.status(200).json({
      token,
      labour: {
        id: labour.id,
        fullName: labour.fullName,
        email: labour.email,
        phone: labour.phone,
        avatarText: labour.avatarText,
        avatarColor: labour.avatarColor,
        rating: labour.rating,
        reviewsCount: labour.reviewsCount,
        completedJobs: labour.completedJobs,
        status: labour.status
      }
    });
  } catch (error) {
    console.error("Labour login error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};
var getMe2 = async (req, res) => {
  try {
    const labour = await db_default.labour.findUnique({
      where: { id: req.labour?.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        bio: true,
        specialties: true,
        badge: true,
        languages: true,
        experienceYears: true,
        completedJobs: true,
        rating: true,
        reviewsCount: true,
        avatarColor: true,
        avatarText: true,
        status: true,
        createdAt: true
      }
    });
    if (!labour) {
      res.status(404).json({ error: "Not found." });
      return;
    }
    res.json(labour);
  } catch (e) {
    res.status(500).json({ error: "Internal server error." });
  }
};
var updateLabourProfile = async (req, res) => {
  try {
    const { fullName, phone, bio, specialties, languages, experienceYears } = req.body;
    const updated = await db_default.labour.update({
      where: { id: req.labour?.id },
      data: {
        fullName: fullName !== void 0 ? fullName : void 0,
        phone: phone !== void 0 ? phone : void 0,
        bio: bio !== void 0 ? bio : void 0,
        specialties: specialties !== void 0 ? specialties : void 0,
        languages: languages !== void 0 ? languages : void 0,
        experienceYears: typeof experienceYears === "number" ? experienceYears : void 0
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        bio: true,
        specialties: true,
        badge: true,
        languages: true,
        experienceYears: true,
        completedJobs: true,
        rating: true,
        reviewsCount: true,
        avatarColor: true,
        avatarText: true,
        status: true
      }
    });
    res.json(updated);
  } catch (e) {
    console.error("Update labour profile error:", e);
    res.status(500).json({ error: "Internal server error." });
  }
};
var getAnalytics = async (req, res) => {
  try {
    const labourId = req.labour?.id;
    const [total, pending, completed, cancelled, bookings] = await Promise.all([
      db_default.booking.count({ where: { labourId } }),
      db_default.booking.count({ where: { labourId, status: "Request" } }),
      db_default.booking.count({ where: { labourId, status: "Completed" } }),
      db_default.booking.count({ where: { labourId, status: "Cancelled" } }),
      db_default.booking.findMany({
        where: { labourId },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { customer: { select: { fullName: true, email: true } } }
      })
    ]);
    const revenue = await db_default.booking.aggregate({
      where: { labourId, status: "Completed" },
      _sum: { priceValue: true }
    });
    res.json({ total, pending, completed, cancelled, revenue: revenue._sum.priceValue || 0, recentBookings: bookings });
  } catch (e) {
    console.error("Analytics error:", e);
    res.status(500).json({ error: "Internal server error." });
  }
};
var getMyBookings2 = async (req, res) => {
  try {
    const labourUser = req.labour?.id ? await db_default.labour.findUnique({ where: { id: req.labour.id } }) : null;
    const bookings = await db_default.booking.findMany({
      where: {
        OR: [
          { labourId: req.labour?.id },
          { labourId: null },
          ...labourUser ? [{ assignedProName: labourUser.fullName }] : []
        ]
      },
      orderBy: { createdAt: "desc" },
      include: { customer: { select: { fullName: true, email: true, phone: true } } }
    });
    res.json(bookings);
  } catch (e) {
    res.status(500).json({ error: "Internal server error." });
  }
};
var updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowed = ["Request", "Assigned", "En Route", "Arrived", "In Progress", "Completed", "Paid", "Cancelled"];
    if (!allowed.includes(status)) {
      res.status(400).json({ error: "Invalid status." });
      return;
    }
    const booking = await db_default.booking.updateMany({
      where: { id, labourId: req.labour?.id },
      data: { status }
    });
    if (booking.count === 0) {
      res.status(404).json({ error: "Booking not found." });
      return;
    }
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "Internal server error." });
  }
};
var getMyServices = async (req, res) => {
  try {
    const services = await db_default.labourService.findMany({
      where: { labourId: req.labour?.id },
      orderBy: { createdAt: "desc" }
    });
    res.json(services);
  } catch (e) {
    res.status(500).json({ error: "Internal server error." });
  }
};
var createService = async (req, res) => {
  try {
    const { title, description, category, price, priceValue, iconName, badge, isEmergency } = req.body;
    if (!title || !description || !category || !price || priceValue === void 0) {
      res.status(400).json({ error: "title, description, category, price and priceValue are required." });
      return;
    }
    const service = await db_default.labourService.create({
      data: {
        labourId: req.labour.id,
        title,
        description,
        category,
        price,
        priceValue: parseFloat(priceValue),
        iconName: iconName || "Wrench",
        badge: badge || "Standard",
        isEmergency: !!isEmergency
      }
    });
    res.status(201).json(service);
  } catch (e) {
    res.status(500).json({ error: "Internal server error." });
  }
};
var toggleService = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    await db_default.labourService.updateMany({
      where: { id, labourId: req.labour?.id },
      data: { isActive: !!isActive }
    });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "Internal server error." });
  }
};
var deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    await db_default.labourService.deleteMany({ where: { id, labourId: req.labour?.id } });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "Internal server error." });
  }
};
var getAllLabour = async (req, res) => {
  try {
    const labour = await db_default.labour.findMany({
      where: { status: "Active" },
      include: { services: { where: { isActive: true } } },
      orderBy: { rating: "desc" }
    });
    const shaped = labour.map((l) => ({
      id: l.id,
      name: l.fullName,
      avatarColor: l.avatarColor,
      avatarText: l.avatarText,
      rating: l.rating,
      phone: l.phone,
      reviewsCount: l.reviewsCount,
      badge: l.badge,
      specialties: l.specialties ? l.specialties.split(",").map((s) => s.trim()) : [],
      bio: l.bio,
      completedJobs: l.completedJobs,
      experienceYears: l.experienceYears,
      languages: l.languages ? l.languages.split(",").map((s) => s.trim()) : ["English"],
      services: l.services.map((s) => ({
        id: s.id,
        title: s.title,
        description: s.description,
        category: s.category,
        price: s.price,
        priceValue: s.priceValue,
        iconName: s.iconName,
        badge: s.badge,
        isEmergency: s.isEmergency
      }))
    }));
    res.json(shaped);
  } catch (e) {
    res.status(500).json({ error: "Internal server error." });
  }
};

// server/middleware/labourAuth.middleware.ts
import jwt4 from "jsonwebtoken";
var JWT_SECRET4 = process.env.JWT_SECRET || "nestly-super-secret-key-for-dev";
var labourAuthMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized: No token provided." });
    return;
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt4.verify(token, JWT_SECRET4);
    if (decoded.role !== "labour") {
      res.status(403).json({ error: "Forbidden: Not a labour account." });
      return;
    }
    req.labour = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Unauthorized: Invalid token." });
  }
};

// server/routes/labour.routes.ts
var router4 = Router4();
router4.post("/apply", apply);
router4.post("/login", loginLabour);
router4.get("/all", getAllLabour);
router4.get("/me", labourAuthMiddleware, getMe2);
router4.put("/profile", labourAuthMiddleware, updateLabourProfile);
router4.get("/analytics", labourAuthMiddleware, getAnalytics);
router4.get("/bookings", labourAuthMiddleware, getMyBookings2);
router4.patch("/bookings/:id/status", labourAuthMiddleware, updateBookingStatus);
router4.get("/services", labourAuthMiddleware, getMyServices);
router4.post("/services", labourAuthMiddleware, createService);
router4.patch("/services/:id", labourAuthMiddleware, toggleService);
router4.delete("/services/:id", labourAuthMiddleware, deleteService);
var labour_routes_default = router4;

// server/server.ts
var app = express();
app.use(cors());
app.use(express.json());
app.use("/api/auth", auth_routes_default);
app.use("/api/data", data_routes_default);
app.use("/api/bookings", booking_routes_default);
app.use("/api/labour", labour_routes_default);
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5e3;
  app.listen(PORT, () => {
    console.log(`Nestly Server running on port ${PORT}`);
  });
}
var server_default = app;
export {
  server_default as default
};
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
