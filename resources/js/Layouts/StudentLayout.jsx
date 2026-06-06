import NotificationBell from '@/Components/NotificationBell';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';

function ChevronDown({ className = '' }) {
    return (
        <svg className={`h-3.5 w-3.5 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
    );
}

function NavItem({ href, active, children }) {
    return (
        <Link href={href}
            className={`inline-flex h-16 items-center border-b-2 px-1 text-sm font-medium transition-colors ${
                active
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}>
            {children}
        </Link>
    );
}

function NavGroup({ label, active, items }) {
    return (
        <Dropdown>
            <Dropdown.Trigger>
                <button className={`inline-flex h-16 items-center gap-1 border-b-2 px-1 text-sm font-medium transition-colors ${
                    active
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}>
                    {label}
                    <ChevronDown className={active ? 'text-indigo-500' : 'text-gray-400'} />
                </button>
            </Dropdown.Trigger>
            <Dropdown.Content align="left" width="56" contentClasses="py-1 bg-white">
                {items.map(item => (
                    <Link key={item.href} href={item.href}
                        className={`flex items-start gap-3 px-4 py-2.5 transition hover:bg-gray-50 ${item.active ? 'bg-indigo-50' : ''}`}>
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

function MobileSection({ title, items }) {
    return (
        <div>
            <p className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">{title}</p>
            {items.map(item => (
                <Link key={item.href} href={item.href}
                    className={`flex items-center gap-3 border-l-4 py-2.5 pl-4 pr-6 text-sm font-medium ${
                        item.active
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                            : 'border-transparent text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800'
                    }`}>
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                    {item.badge ?? null}
                </Link>
            ))}
        </div>
    );
}

export default function StudentLayout({ header, children }) {
    const { auth: { user }, new_events_count } = usePage().props;
    const [mobileOpen, setMobileOpen] = useState(false);
    const { t, toggle, lang } = useLanguage();
    const r = (name) => route().current(name);

    const academicActive = r('student.results') || r('student.attendance.*') || r('student.transcript');
    const resourcesActive = r('student.course-files.*') || r('student.schedule');
    const servicesActive  = r('student.stage-folder.*') || r('student.events.*');

    const academicItems = [
        { href: route('student.results'),          icon: '📊', label: t('nav_results'),      desc: t('desc_results'),      active: r('student.results') },
        { href: route('student.attendance.index'), icon: '📋', label: t('nav_attendance'),   desc: t('desc_attendance'),   active: r('student.attendance.*') },
        { href: route('student.transcript'),       icon: '📄', label: t('nav_transcript'),   desc: t('desc_transcript'),   active: r('student.transcript') },
    ];

    const resourcesItems = [
        { href: route('student.course-files.index'), icon: '📁', label: t('nav_course_files'), desc: t('desc_course_files'), active: r('student.course-files.*') },
        { href: route('student.schedule'),           icon: '🗓️', label: t('nav_schedule'),      desc: t('desc_schedule'),     active: r('student.schedule') },
    ];

    const servicesItems = [
        { href: route('student.stage-folder.index'), icon: '🗂️', label: t('nav_stage_folder'), desc: t('desc_stage_folder'), active: r('student.stage-folder.*') },
        { href: route('student.events.index'),       icon: '🎉', label: t('nav_events'),         desc: t('desc_events'),       active: r('student.events.*') },
    ];

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="border-b border-gray-100 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">

                        {/* Left: logo + desktop nav */}
                        <div className="flex items-center gap-8">
                            <Link href={route('student.dashboard')} className="flex items-center gap-2 shrink-0">
                                <ApplicationLogo className="block h-8 w-auto fill-current text-indigo-600" />
                                <span className="text-lg font-bold tracking-tight text-gray-900">SMS</span>
                            </Link>

                            <div className="hidden items-center gap-6 sm:flex">
                                <NavItem href={route('student.dashboard')} active={r('student.dashboard')}>
                                    {t('nav_dashboard')}
                                </NavItem>
                                <NavGroup label={t('nav_academic')}  active={academicActive}  items={academicItems} />
                                <NavGroup label={t('nav_resources')} active={resourcesActive} items={resourcesItems} />
                                <NavGroup label={t('nav_services')}  active={servicesActive}  items={servicesItems} />
                            </div>
                        </div>

                        {/* Right */}
                        <div className="hidden sm:flex sm:items-center sm:gap-3">
                            <button onClick={toggle}
                                className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-semibold text-gray-500 hover:bg-gray-50 transition">
                                {t('lang_toggle')}
                            </button>
                            <NotificationBell />
                            <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">{t('student_badge')}</span>
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button type="button" className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 transition">
                                        {user.name}
                                        <ChevronDown className="text-gray-400" />
                                    </button>
                                </Dropdown.Trigger>
                                <Dropdown.Content align="right">
                                    <Dropdown.Link href={route('profile.edit')}>{t('nav_profile')}</Dropdown.Link>
                                    <Dropdown.Link href={route('logout')} method="post" as="button">{t('nav_logout')}</Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>

                        {/* Mobile hamburger */}
                        <button onClick={() => setMobileOpen(!mobileOpen)}
                            className="sm:hidden rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500">
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
                        <div className="pb-2">
                            <Link href={route('student.dashboard')}
                                className={`flex items-center gap-3 border-l-4 py-2.5 pl-4 pr-6 text-sm font-medium ${
                                    r('student.dashboard')
                                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                        : 'border-transparent text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                }`}>
                                🏠 {t('nav_dashboard')}
                            </Link>

                            <MobileSection title={t('nav_academic')} items={[
                                { href: route('student.results'),          icon: '📊', label: t('nav_results'),      active: r('student.results') },
                                { href: route('student.attendance.index'), icon: '📋', label: t('nav_attendance'),   active: r('student.attendance.*') },
                                { href: route('student.transcript'),       icon: '📄', label: t('nav_transcript'),   active: r('student.transcript') },
                            ]} />

                            <MobileSection title={t('nav_resources')} items={[
                                { href: route('student.course-files.index'), icon: '📁', label: t('nav_course_files'), active: r('student.course-files.*') },
                                { href: route('student.schedule'),           icon: '🗓️', label: t('nav_schedule'),      active: r('student.schedule') },
                            ]} />

                            <MobileSection title={t('nav_services')} items={[
                                { href: route('student.stage-folder.index'), icon: '🗂️', label: t('nav_stage_folder'), active: r('student.stage-folder.*') },
                                { href: route('student.events.index'),       icon: '🎉', label: t('nav_events'),
                                  badge: new_events_count > 0
                                    ? <span className="ml-auto rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">{new_events_count > 9 ? '9+' : new_events_count}</span>
                                    : null,
                                  active: r('student.events.*') },
                            ]} />
                        </div>

                        <div className="border-t border-gray-200 pb-1 pt-3">
                            <div className="px-4 pb-2 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-800">{user.name}</p>
                                    <p className="text-xs text-gray-500">{user.email}</p>
                                </div>
                                <button onClick={toggle}
                                    className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-semibold text-gray-500 hover:bg-gray-50">
                                    {t('lang_toggle')}
                                </button>
                            </div>
                            <Link href={route('profile.edit')}
                                className="flex items-center gap-3 border-l-4 border-transparent py-2.5 pl-4 pr-6 text-sm font-medium text-gray-600 hover:border-gray-300 hover:bg-gray-50">
                                👤 {t('nav_profile')}
                            </Link>
                            <Link href={route('logout')} method="post" as="button"
                                className="flex w-full items-center gap-3 border-l-4 border-transparent py-2.5 pl-4 pr-6 text-sm font-medium text-gray-600 hover:border-gray-300 hover:bg-gray-50">
                                🚪 {t('nav_logout')}
                            </Link>
                        </div>
                    </div>
                )}
            </nav>

            {header && (
                <header className="bg-white shadow">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{header}</div>
                </header>
            )}
            <main>{children}</main>
        </div>
    );
}
