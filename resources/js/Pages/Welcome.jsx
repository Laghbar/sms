import { Head, Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

// ─── Utilities ────────────────────────────────────────────────────────────────

function scrollTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

function formatEventDate(str) {
    return new Date(str).toLocaleDateString('en-GB', {
        weekday: 'short', day: 'numeric', month: 'long', year: 'numeric',
    });
}

// Counts up from 0 to `target` when the element enters the viewport
function StatCard({ value, label, icon }) {
    const [count, setCount] = useState(0);
    const ref  = useRef(null);
    const done = useRef(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting || done.current) return;
                done.current = true;
                const duration = 1200;
                const start    = performance.now();
                function tick(ts) {
                    const p    = Math.min((ts - start) / duration, 1);
                    const ease = 1 - Math.pow(1 - p, 3);
                    setCount(Math.round(ease * value));
                    if (p < 1) requestAnimationFrame(tick);
                }
                requestAnimationFrame(tick);
            },
            { threshold: 0.4 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [value]);

    return (
        <div
            ref={ref}
            className="group flex flex-col items-center rounded-2xl bg-white px-8 py-10 shadow-sm ring-1 ring-gray-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
        >
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                {icon}
            </div>
            <span className="text-4xl font-extrabold text-gray-900">{count.toLocaleString()}+</span>
            <span className="mt-1 text-sm font-medium text-gray-500">{label}</span>
        </div>
    );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const I = {
    students: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ),
    teacher: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        </svg>
    ),
    modules: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
    ),
    events: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    ),
    grade: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
    ),
    excel: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
    ),
    schedule: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    ai: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
    ),
    mail: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
    ),
    check: (
        <svg className="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
    ),
    location: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ),
    phone: (
        <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
    ),
    email: (
        <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
    ),
    map: (
        <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
    ),
    menu: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
    ),
    close: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
};

// ─── Navbar ───────────────────────────────────────────────────────────────────

const NAV_LINKS = [
    { label: 'Home',     id: 'home' },
    { label: 'Features', id: 'features' },
    { label: 'About',    id: 'about' },
    { label: 'Contact',  id: 'contact' },
];

function Navbar({ user, scrolled }) {
    const [open, setOpen] = useState(false);

    return (
        <header
            className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
                scrolled
                    ? 'bg-white/95 shadow-md backdrop-blur-md'
                    : 'bg-transparent'
            }`}
        >
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Logo */}
                <button
                    onClick={() => scrollTo('home')}
                    className="flex items-center gap-2 focus:outline-none"
                >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600">
                        <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                        </svg>
                    </div>
                    <span className={`text-lg font-bold tracking-tight ${scrolled ? 'text-gray-900' : 'text-white'}`}>
                        SMS
                    </span>
                </button>

                {/* Desktop nav */}
                <nav className="hidden items-center gap-8 md:flex">
                    {NAV_LINKS.map(({ label, id }) => (
                        <button
                            key={id}
                            onClick={() => scrollTo(id)}
                            className={`text-sm font-medium transition-colors hover:text-indigo-400 ${
                                scrolled ? 'text-gray-600' : 'text-white/80'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </nav>

                {/* Login / Dashboard */}
                <div className="hidden items-center gap-3 md:flex">
                    {user ? (
                        <Link
                            href={route('dashboard')}
                            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-indigo-700"
                        >
                            Dashboard
                        </Link>
                    ) : (
                        <Link
                            href={route('login')}
                            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-indigo-700"
                        >
                            Login
                        </Link>
                    )}
                </div>

                {/* Mobile menu toggle */}
                <button
                    className={`md:hidden ${scrolled ? 'text-gray-700' : 'text-white'}`}
                    onClick={() => setOpen((p) => !p)}
                >
                    {open ? I.close : I.menu}
                </button>
            </div>

            {/* Mobile menu */}
            {open && (
                <div className="border-t border-gray-100 bg-white px-4 pb-4 pt-2 md:hidden">
                    {NAV_LINKS.map(({ label, id }) => (
                        <button
                            key={id}
                            onClick={() => { scrollTo(id); setOpen(false); }}
                            className="block w-full py-2 text-left text-sm font-medium text-gray-700 hover:text-indigo-600"
                        >
                            {label}
                        </button>
                    ))}
                    <div className="mt-2 border-t border-gray-100 pt-2">
                        <Link
                            href={route('login')}
                            className="block rounded-lg bg-indigo-600 px-4 py-2 text-center text-sm font-semibold text-white"
                        >
                            {user ? 'Dashboard' : 'Login'}
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
    return (
        <section
            id="home"
            className="relative flex min-h-screen items-center overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-800 to-blue-700"
        >
            {/* Decorative blobs */}
            <div className="pointer-events-none absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full bg-indigo-500/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-40 -left-20 h-[400px] w-[400px] rounded-full bg-blue-400/20 blur-3xl" />
            <div className="pointer-events-none absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/10 blur-3xl" />

            {/* Grid pattern overlay */}
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage:
                        'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
                    backgroundSize: '60px 60px',
                }}
            />

            <div className="relative mx-auto max-w-7xl px-4 py-32 sm:px-6 lg:px-8">
                <div className="max-w-3xl">
                    {/* Badge */}
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 backdrop-blur-sm">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_2px_rgba(52,211,153,0.6)]" />
                        <span className="text-xs font-medium text-white/80 tracking-wide">Academic Platform</span>
                    </div>

                    <h1 className="text-5xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl">
                        Student
                        <span className="block text-indigo-300">Management</span>
                        System
                    </h1>

                    <p className="mt-6 max-w-xl text-lg leading-relaxed text-indigo-100/80">
                        A modern platform for managing students, teachers, grades, schedules,
                        events, and academic administration — all in one place.
                    </p>

                    <div className="mt-10 flex flex-wrap items-center gap-4">
                        <Link
                            href={route('login')}
                            className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-indigo-700 shadow-lg transition duration-200 hover:bg-indigo-50 hover:shadow-xl"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                            </svg>
                            Login
                        </Link>
                        <button
                            onClick={() => scrollTo('features')}
                            className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition duration-200 hover:bg-white/20"
                        >
                            Learn More
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Floating card decorations */}
                <div className="absolute right-8 top-1/2 hidden -translate-y-1/2 space-y-4 lg:block">
                    {[
                        { label: 'Grade Published',  sub: 'Module Algorithms',  color: 'bg-emerald-500' },
                        { label: 'New Event',         sub: 'Career Fair 2026',   color: 'bg-amber-500'   },
                        { label: 'TP Submitted',      sub: '3 hours ago',        color: 'bg-indigo-400'  },
                    ].map(({ label, sub, color }) => (
                        <div
                            key={label}
                            className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm"
                        >
                            <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
                            <div>
                                <p className="text-xs font-semibold text-white">{label}</p>
                                <p className="text-xs text-white/60">{sub}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Scroll indicator */}
            <button
                onClick={() => scrollTo('stats')}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-white/50 hover:text-white"
            >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </button>
        </section>
    );
}

// ─── Stats ────────────────────────────────────────────────────────────────────

function Stats({ stats }) {
    const cards = [
        { value: stats.students, label: 'Registered Students', icon: I.students },
        { value: stats.teachers, label: 'Expert Teachers',     icon: I.teacher  },
        { value: stats.modules,  label: 'Academic Modules',    icon: I.modules  },
        { value: stats.events,   label: 'Events Organised',    icon: I.events   },
    ];

    return (
        <section id="stats" className="bg-gray-50 py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-12 text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900">Platform at a Glance</h2>
                    <p className="mt-3 text-base text-gray-500">Live numbers from the platform</p>
                </div>
                <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
                    {cards.map((c) => (
                        <StatCard key={c.label} {...c} />
                    ))}
                </div>
            </div>
        </section>
    );
}

// ─── Features ─────────────────────────────────────────────────────────────────

const FEATURES = [
    {
        icon: I.students,
        title: 'Student Management',
        desc:  'Manage student profiles, enrollments, and track academic progress across semesters.',
        color: 'bg-blue-50 text-blue-600',
    },
    {
        icon: I.teacher,
        title: 'Teacher Management',
        desc:  'Assign teachers to modules, manage timetables, and track teaching loads effortlessly.',
        color: 'bg-indigo-50 text-indigo-600',
    },
    {
        icon: I.grade,
        title: 'Grade Management',
        desc:  'Record, publish, and analyze grades with weighted coefficients and class rankings.',
        color: 'bg-purple-50 text-purple-600',
    },
    {
        icon: I.excel,
        title: 'Excel Import',
        desc:  'Bulk-import students and teachers from Excel files. Validated and processed instantly.',
        color: 'bg-emerald-50 text-emerald-600',
    },
    {
        icon: I.events,
        title: 'Event Management',
        desc:  'Create and publish academic events, workshops, and conferences with RSVP tracking.',
        color: 'bg-amber-50 text-amber-600',
    },
    {
        icon: I.schedule,
        title: 'Schedule & Timetable',
        desc:  'View and manage class schedules. Upload official timetables accessible to all students.',
        color: 'bg-rose-50 text-rose-600',
    },
    {
        icon: I.ai,
        title: 'AI Academic Assistant',
        desc:  'Get instant answers to academic queries, policy explanations, and study recommendations.',
        color: 'bg-cyan-50 text-cyan-600',
    },
    {
        icon: I.mail,
        title: 'AI Email Generator',
        desc:  'Draft professional academic emails in seconds with AI — for teachers, students, and admins.',
        color: 'bg-violet-50 text-violet-600',
    },
];

function Features() {
    return (
        <section id="features" className="bg-white py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-14 text-center">
                    <span className="mb-3 inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-indigo-600">
                        Features
                    </span>
                    <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                        Everything You Need
                    </h2>
                    <p className="mx-auto mt-4 max-w-2xl text-base text-gray-500">
                        A comprehensive suite of tools designed to modernize every aspect of academic administration.
                    </p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {FEATURES.map(({ icon, title, desc, color }) => (
                        <div
                            key={title}
                            className="group flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-100 hover:shadow-lg"
                        >
                            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color} transition-transform duration-300 group-hover:scale-110`}>
                                {icon}
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-gray-900">{title}</h3>
                                <p className="mt-1.5 text-sm leading-relaxed text-gray-500">{desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ─── About ────────────────────────────────────────────────────────────────────

const ABOUT_POINTS = [
    'Centralised student and teacher records',
    'Real-time grade publishing with notifications',
    'Role-based access for admins, teachers, and students',
    'Excel bulk import for fast onboarding',
    'Event and timetable management in one dashboard',
    'AI-powered assistant for academic queries',
];

function About() {
    return (
        <section id="about" className="bg-gradient-to-br from-indigo-50 to-blue-50 py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid items-center gap-16 lg:grid-cols-2">
                    {/* Text */}
                    <div>
                        <span className="mb-3 inline-block rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-indigo-600">
                            About the Platform
                        </span>
                        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                            Built for Modern Academic Institutions
                        </h2>
                        <p className="mt-5 text-base leading-relaxed text-gray-600">
                            The Student Management System (SMS) is a comprehensive digital platform
                            designed to streamline the entire academic workflow — from student enrollment
                            to grade publishing, event management, and beyond.
                        </p>
                        <p className="mt-4 text-base leading-relaxed text-gray-600">
                            Whether you're an administrator managing hundreds of students, a teacher
                            tracking module performance, or a student checking your schedule and results,
                            SMS provides the right tools for every role.
                        </p>

                        <ul className="mt-8 space-y-3">
                            {ABOUT_POINTS.map((point) => (
                                <li key={point} className="flex items-start gap-3">
                                    {I.check}
                                    <span className="text-sm text-gray-700">{point}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="mt-10">
                            <Link
                                href={route('login')}
                                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow transition hover:bg-indigo-700 hover:shadow-lg"
                            >
                                Get Started
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>
                    </div>

                    {/* Visual card panel */}
                    <div className="relative hidden lg:block">
                        <div className="relative rounded-2xl bg-white p-8 shadow-xl ring-1 ring-gray-100">
                            {/* Role pills */}
                            <div className="mb-6 flex flex-wrap gap-2">
                                {[
                                    { role: 'Admin',   color: 'bg-red-100 text-red-700'     },
                                    { role: 'Teacher', color: 'bg-blue-100 text-blue-700'   },
                                    { role: 'Student', color: 'bg-green-100 text-green-700' },
                                ].map(({ role, color }) => (
                                    <span key={role} className={`rounded-full px-3 py-1 text-xs font-semibold ${color}`}>
                                        {role}
                                    </span>
                                ))}
                            </div>

                            {/* Fake dashboard rows */}
                            <div className="space-y-4">
                                {[
                                    { label: 'Grades Published',   value: '97%',    bar: 'w-[97%]',  color: 'bg-emerald-400' },
                                    { label: 'Module Coverage',     value: '100%',   bar: 'w-full',   color: 'bg-indigo-500'  },
                                    { label: 'Student Engagement',  value: '84%',    bar: 'w-[84%]',  color: 'bg-amber-400'   },
                                    { label: 'Event Participation', value: '72%',    bar: 'w-[72%]',  color: 'bg-blue-400'    },
                                ].map(({ label, value, bar, color }) => (
                                    <div key={label}>
                                        <div className="mb-1 flex justify-between text-xs font-medium text-gray-500">
                                            <span>{label}</span>
                                            <span className="font-semibold text-gray-800">{value}</span>
                                        </div>
                                        <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                                            <div className={`h-full rounded-full ${color} ${bar}`} />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 rounded-xl bg-indigo-50 px-4 py-3 text-center">
                                <p className="text-sm font-semibold text-indigo-700">
                                    🎓 Academic Year 2025 – 2026
                                </p>
                                <p className="text-xs text-indigo-500">All systems operational</p>
                            </div>
                        </div>

                        {/* Floating decoration */}
                        <div className="absolute -top-6 -right-6 h-20 w-20 rounded-full bg-indigo-200/60 blur-xl" />
                        <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-blue-200/60 blur-xl" />
                    </div>
                </div>
            </div>
        </section>
    );
}

// ─── Events ───────────────────────────────────────────────────────────────────

const STATUS_STYLE = {
    upcoming: 'bg-blue-100 text-blue-700',
    ongoing:  'bg-emerald-100 text-emerald-700',
    past:     'bg-gray-100 text-gray-500',
};

function Events({ events }) {
    return (
        <section id="events" className="bg-white py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <span className="mb-2 inline-block rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-amber-600">
                            Events
                        </span>
                        <h2 className="text-3xl font-extrabold text-gray-900">Upcoming Events</h2>
                    </div>
                    <Link
                        href={route('login')}
                        className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                        View all events →
                    </Link>
                </div>

                {events.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-16 text-center">
                        <svg className="mx-auto mb-3 h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm text-gray-400">No upcoming events at this time.</p>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {events.map((ev) => (
                            <div
                                key={ev.id}
                                className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                            >
                                {/* Colored top bar */}
                                <div className="h-1.5 bg-gradient-to-r from-indigo-500 to-blue-500" />

                                <div className="flex flex-1 flex-col p-6">
                                    <div className="mb-3 flex items-start justify-between gap-2">
                                        <h3 className="font-bold text-gray-900 leading-tight line-clamp-2">{ev.title}</h3>
                                        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLE[ev.status] || STATUS_STYLE.upcoming}`}>
                                            {ev.status}
                                        </span>
                                    </div>

                                    {ev.description && (
                                        <p className="mt-1 flex-1 text-sm leading-relaxed text-gray-500 line-clamp-3">
                                            {ev.description}
                                        </p>
                                    )}

                                    <div className="mt-4 space-y-1.5 border-t border-gray-100 pt-4 text-xs text-gray-500">
                                        <div className="flex items-center gap-1.5">
                                            {I.events}
                                            <span>{formatEventDate(ev.starts_at)}</span>
                                        </div>
                                        {ev.location && (
                                            <div className="flex items-center gap-1.5">
                                                {I.location}
                                                <span>{ev.location}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

// ─── Contact / Footer ─────────────────────────────────────────────────────────

function Footer() {
    const QUICK = [
        { label: 'Home',     id: 'home'     },
        { label: 'Features', id: 'features' },
        { label: 'About',    id: 'about'    },
        { label: 'Events',   id: 'events'   },
    ];

    return (
        <footer id="contact" className="bg-gray-950 text-gray-300">
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Brand */}
                    <div>
                        <div className="mb-4 flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600">
                                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                </svg>
                            </div>
                            <span className="text-lg font-bold text-white">SMS</span>
                        </div>
                        <p className="text-sm leading-relaxed text-gray-400">
                            Student Management System — a modern platform for academic administration.
                            Empowering students, teachers, and institutions.
                        </p>
                    </div>

                    {/* Quick links */}
                    <div>
                        <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
                            Quick Links
                        </h4>
                        <ul className="space-y-2">
                            {QUICK.map(({ label, id }) => (
                                <li key={id}>
                                    <button
                                        onClick={() => scrollTo(id)}
                                        className="text-sm text-gray-400 transition-colors hover:text-indigo-400"
                                    >
                                        {label}
                                    </button>
                                </li>
                            ))}
                            <li>
                                <Link
                                    href={route('login')}
                                    className="text-sm text-gray-400 transition-colors hover:text-indigo-400"
                                >
                                    Login
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact info */}
                    <div>
                        <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
                            Contact
                        </h4>
                        <ul className="space-y-3 text-sm text-gray-400">
                            <li className="flex items-start gap-2">
                                {I.map}
                                <span>University Campus, Academic City</span>
                            </li>
                            <li className="flex items-center gap-2">
                                {I.phone}
                                <span>+213 XX XX XX XX</span>
                            </li>
                            <li className="flex items-center gap-2">
                                {I.email}
                                <span>contact@sms.edu.dz</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 border-t border-gray-800 pt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
                    <p className="text-xs text-gray-500">
                        © {new Date().getFullYear()} Student Management System. All rights reserved.
                    </p>
                    <p className="text-xs text-gray-600">
                        Built with Laravel · React · Tailwind CSS
                    </p>
                </div>
            </div>
        </footer>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Welcome({ auth, stats = {}, events = [] }) {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 30);
        window.addEventListener('scroll', handler, { passive: true });
        return () => window.removeEventListener('scroll', handler);
    }, []);

    const safeStats = {
        students: stats.students ?? 0,
        teachers: stats.teachers ?? 0,
        modules:  stats.modules  ?? 0,
        events:   stats.events   ?? 0,
    };

    return (
        <>
            <Head title="Welcome — Student Management System" />
            <div className="min-h-screen scroll-smooth">
                <Navbar user={auth?.user} scrolled={scrolled} />
                <Hero />
                <Stats stats={safeStats} />
                <Features />
                <About />
                <Events events={events} />
                <Footer />
            </div>
        </>
    );
}
