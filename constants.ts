
import { Chapter, Course, User, UserRole } from './types';

export const FULL_COURSE_PRICE = 999;
export const CHAPTER_PRICE = 99;

export const TEACHER_PROFILE = {
  name: "Mr. R.K. Sharma",
  bio: "Ex-IIT Delhi Alumni with 15+ years of teaching experience. Helped over 5000+ students crack JEE & NEET.",
  image: "https://picsum.photos/id/1/200/200"
};

export const COURSES: Record<number, Course> = {
  11: {
    id: "phys-11-complete",
    title: "Complete Class 11 Physics Mastery",
    description: "Master Mechanics, Thermodynamics, and Oscillations. Build a rock-solid foundation for competitive exams.",
    price: FULL_COURSE_PRICE,
    thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800",
    teacherName: TEACHER_PROFILE.name
  },
  12: {
    id: "phys-12-complete",
    title: "Complete Class 12 Physics Mastery",
    description: "From Electrostatics to Modern Physics. Master every concept with in-depth visualization and problem solving.",
    price: FULL_COURSE_PRICE,
    // Updated to a working Physics-themed image (Blue/Science theme)
    thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=800",
    teacherName: TEACHER_PROFILE.name
  }
};

// Video IDs for random assignment
const VIDEO_IDS = [
    "x_tNzeouHC4", // Electric Charge
    "7Mv1CfbQf5s", // Electric Fields
    "1xSQlwWGT8Y", // Voltage
    "HIjX4k1f8-A", // Capacitors
    "Hxoaf1j266E", // Current
    "3Bm3Q_O9Q2A", // Magnetic Force
    "T7k52a3Z7G0"  // Induction
];
const getRandomVideo = (index: number) => VIDEO_IDS[index % VIDEO_IDS.length];

export const CHAPTERS: Chapter[] = [
  // Class 12
  {
    id: "c12-1",
    title: "Electric Charges and Fields",
    description: "Electric charges, conservation of charge, Coulomb's law, superposition principle, continuous charge distribution.",
    price: CHAPTER_PRICE,
    duration: "1h 15m",
    classLevel: 12,
    topics: [
      { id: "c12-1-t1", title: "Electric Charge & Properties", videoUrl: getRandomVideo(0), duration: "15m" },
      { id: "c12-1-t2", title: "Conductors and Insulators", videoUrl: getRandomVideo(1), duration: "10m" },
      { id: "c12-1-t3", title: "Coulomb's Law", videoUrl: getRandomVideo(2), duration: "20m" },
      { id: "c12-1-t4", title: "Electric Field Lines", videoUrl: getRandomVideo(3), duration: "10m" },
      { id: "c12-1-t5", title: "Gauss's Law", videoUrl: getRandomVideo(4), duration: "20m" }
    ]
  },
  {
    id: "c12-2",
    title: "Electrostatic Potential and Capacitance",
    description: "Electric potential, potential difference, equipotential surfaces, electrical potential energy, capacitors and capacitance.",
    price: CHAPTER_PRICE,
    duration: "1h 30m",
    classLevel: 12,
    topics: [
      { id: "c12-2-t1", title: "Electrostatic Potential", videoUrl: getRandomVideo(5), duration: "15m" },
      { id: "c12-2-t2", title: "Potential due to Point Charge", videoUrl: getRandomVideo(6), duration: "15m" },
      { id: "c12-2-t3", title: "Equipotential Surfaces", videoUrl: getRandomVideo(0), duration: "10m" },
      { id: "c12-2-t4", title: "Capacitors and Capacitance", videoUrl: getRandomVideo(1), duration: "25m" },
      { id: "c12-2-t5", title: "Dielectrics", videoUrl: getRandomVideo(2), duration: "25m" }
    ]
  },
  {
    id: "c12-3",
    title: "Current Electricity",
    description: "Electric current, Ohm's law, V-I characteristics, resistance, resistivity, conductivity, drift velocity.",
    price: CHAPTER_PRICE,
    duration: "1h 45m",
    classLevel: 12,
    topics: [
      { id: "c12-3-t1", title: "Electric Current Basics", videoUrl: getRandomVideo(3), duration: "10m" },
      { id: "c12-3-t2", title: "Ohm's Law & Resistance", videoUrl: getRandomVideo(4), duration: "20m" },
      { id: "c12-3-t3", title: "Drift of Electrons", videoUrl: getRandomVideo(5), duration: "15m" },
      { id: "c12-3-t4", title: "Kirchhoff's Rules", videoUrl: getRandomVideo(6), duration: "30m" },
      { id: "c12-3-t5", title: "Wheatstone Bridge", videoUrl: getRandomVideo(0), duration: "30m" }
    ]
  },
  {
    id: "c12-4",
    title: "Moving Charges and Magnetism",
    description: "Concept of magnetic field, Oersted's experiment, Biot-Savart law, Ampere's law, Force on a moving charge.",
    price: CHAPTER_PRICE,
    duration: "1h 20m",
    classLevel: 12,
    topics: [
      { id: "c12-4-t1", title: "Magnetic Force", videoUrl: getRandomVideo(1), duration: "15m" },
      { id: "c12-4-t2", title: "Biot-Savart Law", videoUrl: getRandomVideo(2), duration: "20m" },
      { id: "c12-4-t3", title: "Ampere's Circuital Law", videoUrl: getRandomVideo(3), duration: "25m" },
      { id: "c12-4-t4", title: "Solenoid and Toroid", videoUrl: getRandomVideo(4), duration: "20m" }
    ]
  },
  {
    id: "c12-5",
    title: "Magnetism and Matter",
    description: "Current loop as a magnetic dipole, magnetic dipole moment, bar magnet, magnetic field lines, earth's magnetic field.",
    price: CHAPTER_PRICE,
    duration: "55m",
    classLevel: 12,
    topics: [
      { id: "c12-5-t1", title: "The Bar Magnet", videoUrl: getRandomVideo(5), duration: "15m" },
      { id: "c12-5-t2", title: "Earth's Magnetism", videoUrl: getRandomVideo(6), duration: "20m" },
      { id: "c12-5-t3", title: "Magnetic Properties", videoUrl: getRandomVideo(0), duration: "20m" }
    ]
  },
  {
    id: "c12-6",
    title: "Electromagnetic Induction",
    description: "Electromagnetic induction, Faraday's laws, induced EMF and current, Lenz's Law, Eddy currents.",
    price: CHAPTER_PRICE,
    duration: "1h 10m",
    classLevel: 12,
    topics: [
      { id: "c12-6-t1", title: "Magnetic Flux", videoUrl: getRandomVideo(1), duration: "15m" },
      { id: "c12-6-t2", title: "Faraday's Law", videoUrl: getRandomVideo(2), duration: "20m" },
      { id: "c12-6-t3", title: "Lenz's Law", videoUrl: getRandomVideo(3), duration: "15m" },
      { id: "c12-6-t4", title: "Inductance", videoUrl: getRandomVideo(4), duration: "20m" }
    ]
  },
  {
    id: "c12-7",
    title: "Alternating Current",
    description: "Alternating currents, peak and RMS value, reactance and impedance, LC oscillations, LCR series circuit.",
    price: CHAPTER_PRICE,
    duration: "1h 40m",
    classLevel: 12,
    topics: [
      { id: "c12-7-t1", title: "AC Voltage & Resistor", videoUrl: getRandomVideo(5), duration: "20m" },
      { id: "c12-7-t2", title: "AC Voltage & Inductor", videoUrl: getRandomVideo(6), duration: "20m" },
      { id: "c12-7-t3", title: "LCR Series Circuit", videoUrl: getRandomVideo(0), duration: "40m" },
      { id: "c12-7-t4", title: "Transformers", videoUrl: getRandomVideo(1), duration: "20m" }
    ]
  },
  {
    id: "c12-8",
    title: "Electromagnetic Waves",
    description: "Displacement current, electromagnetic waves and their characteristics, electromagnetic spectrum.",
    price: CHAPTER_PRICE,
    duration: "45m",
    classLevel: 12,
    topics: [
      { id: "c12-8-t1", title: "Displacement Current", videoUrl: getRandomVideo(2), duration: "15m" },
      { id: "c12-8-t2", title: "EM Waves Properties", videoUrl: getRandomVideo(3), duration: "15m" },
      { id: "c12-8-t3", title: "EM Spectrum", videoUrl: getRandomVideo(4), duration: "15m" }
    ]
  },
  {
    id: "c12-9",
    title: "Ray Optics and Optical Instruments",
    description: "Reflection of light, spherical mirrors, refraction, total internal reflection, lenses, prism, optical instruments.",
    price: CHAPTER_PRICE,
    duration: "2h 10m",
    classLevel: 12,
    topics: [
      { id: "c12-9-t1", title: "Spherical Mirrors", videoUrl: getRandomVideo(5), duration: "20m" },
      { id: "c12-9-t2", title: "Refraction", videoUrl: getRandomVideo(6), duration: "20m" },
      { id: "c12-9-t3", title: "Total Internal Reflection", videoUrl: getRandomVideo(0), duration: "20m" },
      { id: "c12-9-t4", title: "Lenses", videoUrl: getRandomVideo(1), duration: "30m" },
      { id: "c12-9-t5", title: "Prism", videoUrl: getRandomVideo(2), duration: "20m" },
      { id: "c12-9-t6", title: "Optical Instruments", videoUrl: getRandomVideo(3), duration: "20m" }
    ]
  },
  {
    id: "c12-10",
    title: "Wave Optics",
    description: "Wave front and Huygens' principle, reflection and refraction using wave theory, interference, diffraction.",
    price: CHAPTER_PRICE,
    duration: "1h 25m",
    classLevel: 12,
    topics: [
      { id: "c12-10-t1", title: "Huygens Principle", videoUrl: getRandomVideo(4), duration: "20m" },
      { id: "c12-10-t2", title: "Interference", videoUrl: getRandomVideo(5), duration: "25m" },
      { id: "c12-10-t3", title: "Diffraction", videoUrl: getRandomVideo(6), duration: "20m" },
      { id: "c12-10-t4", title: "Polarisation", videoUrl: getRandomVideo(0), duration: "20m" }
    ]
  },
  {
    id: "c12-11",
    title: "Dual Nature of Radiation and Matter",
    description: "Dual nature of radiation, Photoelectric effect, Hertz and Lenard's observations.",
    price: CHAPTER_PRICE,
    duration: "1h 05m",
    classLevel: 12,
    topics: [
      { id: "c12-11-t1", title: "Photoelectric Effect", videoUrl: getRandomVideo(1), duration: "25m" },
      { id: "c12-11-t2", title: "Einstein's Equation", videoUrl: getRandomVideo(2), duration: "20m" },
      { id: "c12-11-t3", title: "Wave Nature of Matter", videoUrl: getRandomVideo(3), duration: "20m" }
    ]
  },
  {
    id: "c12-12",
    title: "Atoms",
    description: "Alpha-particle scattering experiment, Rutherford's model of atom, Bohr model, energy levels.",
    price: CHAPTER_PRICE,
    duration: "50m",
    classLevel: 12,
    topics: [
      { id: "c12-12-t1", title: "Rutherford's Model", videoUrl: getRandomVideo(4), duration: "15m" },
      { id: "c12-12-t2", title: "Bohr Model", videoUrl: getRandomVideo(5), duration: "20m" },
      { id: "c12-12-t3", title: "Atomic Spectra", videoUrl: getRandomVideo(6), duration: "15m" }
    ]
  },
  {
    id: "c12-13",
    title: "Nuclei",
    description: "Composition and size of nucleus, atomic masses, isotopes, isobars, isotones, radioactivity.",
    price: CHAPTER_PRICE,
    duration: "1h 00m",
    classLevel: 12,
    topics: [
      { id: "c12-13-t1", title: "Atomic Masses", videoUrl: getRandomVideo(0), duration: "15m" },
      { id: "c12-13-t2", title: "Radioactivity", videoUrl: getRandomVideo(1), duration: "25m" },
      { id: "c12-13-t3", title: "Nuclear Energy", videoUrl: getRandomVideo(2), duration: "20m" }
    ]
  },
  {
    id: "c12-14",
    title: "Semiconductor Electronics",
    description: "Energy bands in solids, conductors, insulators and semiconductors, semiconductor diode, logic gates.",
    price: CHAPTER_PRICE,
    duration: "1h 50m",
    classLevel: 12,
    topics: [
      { id: "c12-14-t1", title: "Semiconductor Basics", videoUrl: getRandomVideo(3), duration: "20m" },
      { id: "c12-14-t2", title: "PN Junction", videoUrl: getRandomVideo(4), duration: "25m" },
      { id: "c12-14-t3", title: "Diodes", videoUrl: getRandomVideo(5), duration: "25m" },
      { id: "c12-14-t4", title: "Logic Gates", videoUrl: getRandomVideo(6), duration: "40m" }
    ]
  },

  // Class 11 - Simplified with fewer topics per chapter for brevity but preserving structure
  {
    id: "c11-1",
    title: "Units and Measurements",
    description: "Need for measurement, units of measurement, systems of units, SI units, fundamental and derived units.",
    price: CHAPTER_PRICE,
    duration: "55m",
    classLevel: 11,
    topics: [
      { id: "c11-1-t1", title: "SI Units", videoUrl: getRandomVideo(0), duration: "20m" },
      { id: "c11-1-t2", title: "Errors in Measurement", videoUrl: getRandomVideo(1), duration: "20m" },
      { id: "c11-1-t3", title: "Significant Figures", videoUrl: getRandomVideo(2), duration: "15m" }
    ]
  },
  {
    id: "c11-2",
    title: "Motion in a Straight Line",
    description: "Frame of reference, Motion in a straight line, Position-time graph, speed and velocity.",
    price: CHAPTER_PRICE,
    duration: "1h 10m",
    classLevel: 11,
    topics: [
        { id: "c11-2-t1", title: "Position & Displacement", videoUrl: getRandomVideo(3), duration: "20m" },
        { id: "c11-2-t2", title: "Average Velocity", videoUrl: getRandomVideo(4), duration: "20m" },
        { id: "c11-2-t3", title: "Acceleration", videoUrl: getRandomVideo(5), duration: "15m" },
        { id: "c11-2-t4", title: "Kinematic Equations", videoUrl: getRandomVideo(6), duration: "15m" }
    ]
  },
  {
    id: "c11-3",
    title: "Motion in a Plane",
    description: "Scalar and vector quantities, position and displacement vectors, general vectors, projectile motion.",
    price: CHAPTER_PRICE,
    duration: "1h 25m",
    classLevel: 11,
    topics: [
        { id: "c11-3-t1", title: "Vectors Basics", videoUrl: getRandomVideo(0), duration: "25m" },
        { id: "c11-3-t2", title: "Vector Addition", videoUrl: getRandomVideo(1), duration: "20m" },
        { id: "c11-3-t3", title: "Projectile Motion", videoUrl: getRandomVideo(2), duration: "40m" }
    ]
  },
  {
    id: "c11-4",
    title: "Laws of Motion",
    description: "Intuitive concept of force, Inertia, Newton's first law of motion, momentum and Newton's second law.",
    price: CHAPTER_PRICE,
    duration: "1h 30m",
    classLevel: 11,
    topics: [
        { id: "c11-4-t1", title: "Newton's First Law", videoUrl: getRandomVideo(3), duration: "20m" },
        { id: "c11-4-t2", title: "Newton's Second Law", videoUrl: getRandomVideo(4), duration: "30m" },
        { id: "c11-4-t3", title: "Conservation of Momentum", videoUrl: getRandomVideo(5), duration: "20m" },
        { id: "c11-4-t4", title: "Friction", videoUrl: getRandomVideo(6), duration: "20m" }
    ]
  },
  {
    id: "c11-5",
    title: "Work, Energy and Power",
    description: "Work done by a constant force and a variable force, kinetic energy, work-energy theorem, power.",
    price: CHAPTER_PRICE,
    duration: "1h 20m",
    classLevel: 11,
    topics: [
        { id: "c11-5-t1", title: "Work Energy Theorem", videoUrl: getRandomVideo(0), duration: "30m" },
        { id: "c11-5-t2", title: "Kinetic & Potential Energy", videoUrl: getRandomVideo(1), duration: "30m" },
        { id: "c11-5-t3", title: "Power", videoUrl: getRandomVideo(2), duration: "20m" }
    ]
  },
  {
    id: "c11-6",
    title: "System of Particles and Rotational Motion",
    description: "Centre of mass of a two-particle system, momentum conservation, rigid body rotation.",
    price: CHAPTER_PRICE,
    duration: "1h 45m",
    classLevel: 11,
    topics: [
        { id: "c11-6-t1", title: "Centre of Mass", videoUrl: getRandomVideo(3), duration: "30m" },
        { id: "c11-6-t2", title: "Torque", videoUrl: getRandomVideo(4), duration: "30m" },
        { id: "c11-6-t3", title: "Angular Momentum", videoUrl: getRandomVideo(5), duration: "25m" },
        { id: "c11-6-t4", title: "Moment of Inertia", videoUrl: getRandomVideo(6), duration: "20m" }
    ]
  },
  {
    id: "c11-7",
    title: "Gravitation",
    description: "Kepler's laws of planetary motion, universal law of gravitation, acceleration due to gravity.",
    price: CHAPTER_PRICE,
    duration: "1h 15m",
    classLevel: 11,
    topics: [
        { id: "c11-7-t1", title: "Universal Law of Gravitation", videoUrl: getRandomVideo(0), duration: "25m" },
        { id: "c11-7-t2", title: "Kepler's Laws", videoUrl: getRandomVideo(1), duration: "20m" },
        { id: "c11-7-t3", title: "Escape Velocity", videoUrl: getRandomVideo(2), duration: "30m" }
    ]
  },
  {
    id: "c11-8",
    title: "Mechanical Properties of Solids",
    description: "Elastic behavior, Stress-strain relationship, Hooke's law, Young's modulus.",
    price: CHAPTER_PRICE,
    duration: "50m",
    classLevel: 11,
    topics: [
        { id: "c11-8-t1", title: "Stress and Strain", videoUrl: getRandomVideo(3), duration: "20m" },
        { id: "c11-8-t2", title: "Hooke's Law", videoUrl: getRandomVideo(4), duration: "15m" },
        { id: "c11-8-t3", title: "Elastic Moduli", videoUrl: getRandomVideo(5), duration: "15m" }
    ]
  },
  {
    id: "c11-9",
    title: "Mechanical Properties of Fluids",
    description: "Pressure due to a fluid column, Pascal's law, viscosity, Stokes' law, Bernoulli's theorem.",
    price: CHAPTER_PRICE,
    duration: "1h 10m",
    classLevel: 11,
    topics: [
        { id: "c11-9-t1", title: "Bernoulli's Principle", videoUrl: getRandomVideo(6), duration: "30m" },
        { id: "c11-9-t2", title: "Viscosity", videoUrl: getRandomVideo(0), duration: "20m" },
        { id: "c11-9-t3", title: "Surface Tension", videoUrl: getRandomVideo(1), duration: "20m" }
    ]
  },
  {
    id: "c11-10",
    title: "Thermal Properties of Matter",
    description: "Heat, temperature, thermal expansion, specific heat capacity, calorimetry.",
    price: CHAPTER_PRICE,
    duration: "1h 05m",
    classLevel: 11,
    topics: [
        { id: "c11-10-t1", title: "Thermal Expansion", videoUrl: getRandomVideo(2), duration: "20m" },
        { id: "c11-10-t2", title: "Calorimetry", videoUrl: getRandomVideo(3), duration: "25m" },
        { id: "c11-10-t3", title: "Heat Transfer", videoUrl: getRandomVideo(4), duration: "20m" }
    ]
  },
  {
    id: "c11-11",
    title: "Thermodynamics",
    description: "Thermal equilibrium, zeroth law of thermodynamics, heat, work and internal energy.",
    price: CHAPTER_PRICE,
    duration: "1h 20m",
    classLevel: 11,
    topics: [
        { id: "c11-11-t1", title: "First Law of Thermodynamics", videoUrl: getRandomVideo(5), duration: "30m" },
        { id: "c11-11-t2", title: "Thermodynamic Processes", videoUrl: getRandomVideo(6), duration: "30m" },
        { id: "c11-11-t3", title: "Second Law of Thermodynamics", videoUrl: getRandomVideo(0), duration: "20m" }
    ]
  },
  {
    id: "c11-12",
    title: "Kinetic Theory",
    description: "Equation of state of a perfect gas, work done on compressing a gas, Kinetic theory of gases.",
    price: CHAPTER_PRICE,
    duration: "55m",
    classLevel: 11,
    topics: [
        { id: "c11-12-t1", title: "Kinetic Theory Assumptions", videoUrl: getRandomVideo(1), duration: "20m" },
        { id: "c11-12-t2", title: "Equipartition of Energy", videoUrl: getRandomVideo(2), duration: "20m" },
        { id: "c11-12-t3", title: "Mean Free Path", videoUrl: getRandomVideo(3), duration: "15m" }
    ]
  },
  {
    id: "c11-13",
    title: "Oscillations",
    description: "Periodic motion, time period, frequency, displacement as a function of time, simple harmonic motion.",
    price: CHAPTER_PRICE,
    duration: "1h 35m",
    classLevel: 11,
    topics: [
        { id: "c11-13-t1", title: "Simple Harmonic Motion", videoUrl: getRandomVideo(4), duration: "35m" },
        { id: "c11-13-t2", title: "Energy in SHM", videoUrl: getRandomVideo(5), duration: "30m" },
        { id: "c11-13-t3", title: "Simple Pendulum", videoUrl: getRandomVideo(6), duration: "30m" }
    ]
  },
  {
    id: "c11-14",
    title: "Waves",
    description: "Wave motion, transverse and longitudinal waves, speed of wave motion.",
    price: CHAPTER_PRICE,
    duration: "1h 25m",
    classLevel: 11,
    topics: [
        { id: "c11-14-t1", title: "Types of Waves", videoUrl: getRandomVideo(0), duration: "25m" },
        { id: "c11-14-t2", title: "Superposition Principle", videoUrl: getRandomVideo(1), duration: "30m" },
        { id: "c11-14-t3", title: "Doppler Effect", videoUrl: getRandomVideo(2), duration: "30m" }
    ]
  }
];

// Mock Initial Data
export const MOCK_TEACHER: User = {
  id: "t1",
  name: "Mr. Sharma",
  email: "teacher@physics.com",
  role: UserRole.TEACHER,
  purchasedChapterIds: [],
  purchasedCourseIds: ["phys-11-complete", "phys-12-complete"],
  progress: {},
  quizAttempts: {},
  lastLogin: new Date().toISOString()
};

export const MOCK_STUDENTS: User[] = [
  {
    id: "s1",
    name: "Aravind Kumar",
    email: "aravind@student.com",
    role: UserRole.STUDENT,
    purchasedChapterIds: ["c12-1", "c12-2"],
    purchasedCourseIds: [],
    progress: { "c12-1-t1": true, "c12-1-t2": true }, // Progress is now topic IDs
    quizAttempts: {},
    lastLogin: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: "s2",
    name: "Neha Gupta",
    email: "neha@student.com",
    role: UserRole.STUDENT,
    purchasedChapterIds: [],
    purchasedCourseIds: ["phys-12-complete"],
    progress: { "c12-1-t1": true, "c12-1-t2": true, "c12-1-t3": true },
    quizAttempts: {},
    lastLogin: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: "s3",
    name: "Rohan Singh",
    email: "rohan@student.com",
    role: UserRole.STUDENT,
    purchasedChapterIds: ["c11-1"],
    purchasedCourseIds: [],
    progress: {},
    quizAttempts: {},
    lastLogin: new Date().toISOString()
  }
];
