import NotificationBell from '@/Components/NotificationBell';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

/* ── Chevron icon ────────────────────────────────────────────────────── */
function ChevronDown({ className = '' }) {
    return (
        <svg className={`h-3.5 w-3.5 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
    );
}

/* ── Single nav link ─────────────────────────────────────────────────── */
function NavItem({ href, active, children }) {
    return (
        <Link
            href={href}
            className={`inline-flex h-16 items-center border-b-2 px-1 text-sm font-medium transition-colors ${
                active
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
        >
            {children}
        </Link>
    );
}

/* ── Dropdown nav group ──────────────────────────────────────────────── */
function NavGroup({ label, active, items }) {
    return (
        <Dropdown>
            <Dropdown.Trigger>
                <button
                    className={`inline-flex h-16 items-center gap-1 border-b-2 px-1 text-sm font-medium transition-colors ${
                        active
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                >
                    {label}
                    <ChevronDown className={`transition-transform ${active ? 'text-indigo-500' : 'text-gray-400'}`} />
                </button>
            </Dropdown.Trigger>

            <Dropdown.Content align="left" width="56" contentClasses="py-1 bg-white">
                {items.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-start gap-3 px-4 py-2.5 transition hover:bg-gray-50 ${
                            item.active ? 'bg-indigo-50' : ''
                        }`}
                    >
                        <span className="mt-0.5 text-base">{item.icon}</span>
                        <div>
                            <p className={`text-sm font-medium ${item.active ? 'text-indigo-700' : 'text-gray-700'}`}>
                                {item.label}
                            </p>
                            <p className="text-xs text-gray-400">{item.desc}</p>
                        </div>
                    </Link>
                ))}
            </Dropdown.Content>
        </Dropdown>
    );
}

/* ── Mobile nav link ─────────────────────────────────────────────────── */
function MobileNavItem({ href, active, icon, label }) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-3 border-l-4 py-2.5 pl-4 pr-6 text-sm font-medium ${
                active
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-transparent text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800'
            }`}
        >
            <span>{icon}</span>
            {label}
        </Link>
    );
}

/* ── Layout ──────────────────────────────────────────────────────────── */
export default function AdminLayout({ header, children }) {
    const { auth: { user }, new_events_count } = usePage().props;
    const [mobileOpen, setMobileOpen] = useState(false);

    const r = (name) => route().current(name);

    // Group active states
    const usersActive    = r('admin.users') || r('admin.bulk-import.*');
    const academicActive = r('admin.modules.*') || r('admin.results.*') || r('admin.advancement.*') || r('admin.stage-folders.*') || r('admin.academic-years.*');
    const planningActive = r('admin.schedules.*') || r('admin.exams.*') || r('admin.events.*');

    const userItems = [
        { href: route('admin.users'),             icon: '👥', label: 'Users',       desc: 'Manage students & teachers',  active: r('admin.users') },
        { href: route('admin.bulk-import.index'), icon: '📤', label: 'Bulk Import', desc: 'Upload Excel for batch adds', active: r('admin.bulk-import.*') },
    ];

    const academicItems = [
        { href: route('admin.modules.index'),      icon: '📚', label: 'Modules',       desc: 'Create, edit & assign modules',  active: r('admin.modules.*') },
        { href: route('admin.results.index'),      icon: '📊', label: 'Results',       desc: 'Grades & publication',            active: r('admin.results.*') },
        { href: route('admin.advancement.index'),  icon: '🎓', label: 'Advancement',   desc: 'Advance students by semester',    active: r('admin.advancement.*') },
        { href: route('admin.stage-folders.index'),   icon: '📁', label: 'Stage Folders',   desc: 'Internship folder requests',   active: r('admin.stage-folders.*') },
        { href: route('admin.academic-years.index'), icon: '🎓', label: 'Années Univ.',   desc: 'Gérer les années universitaires', active: r('admin.academic-years.*') },
    ];

    const planningItems = [
        { href: route('admin.schedules.index'), icon: '🗓️', label: 'Schedules', desc: 'Upload class timetables',  active: r('admin.schedules.*') },
        { href: route('admin.exams.index'),     icon: '📋', label: 'Exams',     desc: 'Exam announcements',       active: r('admin.exams.*') },
        { href: route('admin.events.index'),    icon: '🎉', label: 'Events',    desc: 'Campus events & notifs',   active: r('admin.events.*') },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">

                        {/* Left: logo + desktop nav */}
                        <div className="flex items-center gap-8">
                            {/* Logo */}
                            <Link href={route('admin.dashboard')} className="flex items-center gap-2 shrink-0">
                                <ApplicationLogo className="h-8 w-auto fill-current text-indigo-600" />
                                <span className="text-lg font-bold tracking-tight text-gray-900">SMS</span>
                            </Link>

                            {/* Desktop nav */}
                            <div className="hidden items-center gap-6 sm:flex">
                                <NavItem href={route('admin.dashboard')} active={r('admin.dashboard')}>
                                    Dashboard
                                </NavItem>

                                <NavGroup label="Users"    active={usersActive}    items={userItems} />
                                <NavGroup label="Academic" active={academicActive} items={academicItems} />
                                <NavGroup label="Planning" active={planningActive} items={planningItems} />
                            </div>
                        </div>

                        {/* Right: bell + badge + user dropdown */}
                        <div className="hidden sm:flex sm:items-center sm:gap-3">
                            <NotificationBell />

                            <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                                Admin
                            </span>

                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 transition">
                                        {user.name}
                                        <ChevronDown className="text-gray-400" />
                                    </button>
                                </Dropdown.Trigger>
                                <Dropdown.Content align="right">
                                    <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
                                    <Dropdown.Link href={route('logout')} method="post" as="button">
                                        Log Out
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>

                        {/* Mobile hamburger */}
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="sm:hidden rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                        >
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {mobileOpen
                                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                }
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                {mobileOpen && (
                    <div className="border-t border-gray-100 sm:hidden">
                        <div className="space-y-0.5 py-2">
                            <MobileNavItem href={route('admin.dashboard')}         active={r('admin.dashboard')}         icon="🏠" label="Dashboard" />
                            <MobileNavItem href={route('admin.users')}             active={r('admin.users')}             icon="👥" label="Users" />
                            <MobileNavItem href={route('admin.bulk-import.index')} active={r('admin.bulk-import.*')}     icon="📤" label="Bulk Import" />
                            <MobileNavItem href={route('admin.modules.index')}     active={r('admin.modules.*')}         icon="📚" label="Modules" />
                            <MobileNavItem href={route('admin.results.index')}     active={r('admin.results.*')}         icon="📊" label="Results" />
                            <MobileNavItem href={route('admin.advancement.index')}  active={r('admin.advancement.*')}     icon="🎓" label="Advancement" />
                            <MobileNavItem href={route('admin.stage-folders.index')}   active={r('admin.stage-folders.*')}   icon="📁" label="Stage Folders" />
                            <MobileNavItem href={route('admin.academic-years.index')} active={r('admin.academic-years.*')} icon="🎓" label="Années Univ." />
                            <MobileNavItem href={route('admin.schedules.index')}   active={r('admin.schedules.*')}       icon="🗓️" label="Schedules" />
                            <MobileNavItem href={route('admin.exams.index')}       active={r('admin.exams.*')}           icon="📋" label="Exams" />
                            <MobileNavItem href={route('admin.events.index')}      active={r('admin.events.*')}          icon="🎉" label={<>Events {new_events_count > 0 && <span className="ml-1 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">{new_events_count}</span>}</>} />
                        </div>
                        <div className="border-t border-gray-100 pb-2 pt-3">
                            <div className="px-4 pb-2">
                                <p className="text-sm font-medium text-gray-800">{user.name}</p>
                                <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                            <MobileNavItem href={route('profile.edit')} active={r('profile.*')} icon="👤" label="Profile" />
                            <Link href={route('logout')} method="post" as="button"
                                className="flex w-full items-center gap-3 border-l-4 border-transparent py-2.5 pl-4 pr-6 text-sm font-medium text-gray-600 hover:border-gray-300 hover:bg-gray-50">
                                <span>🚪</span> Log Out
                            </Link>
                        </div>
                    </div>
                )}
            </nav>

            {header && (
                <header className="bg-white shadow-sm">
                    <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">{header}</div>
                </header>
            )}

            <main>{children}</main>
        </div>
    );
}
