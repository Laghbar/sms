import NotificationBell from '@/Components/NotificationBell';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function TeacherLayout({ header, children }) {
    const { auth: { user }, new_events_count } = usePage().props;
    const [open, setOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="border-b border-gray-100 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div className="flex shrink-0 items-center">
                                <Link href={route('teacher.dashboard')} className="flex items-center gap-2">
                                    <ApplicationLogo className="block h-8 w-auto fill-current text-indigo-600" />
                                    <span className="text-lg font-bold tracking-tight text-gray-900">SMS</span>
                                </Link>
                            </div>
                            <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                                <NavLink href={route('teacher.dashboard')} active={route().current('teacher.dashboard')}>Dashboard</NavLink>
                                <NavLink href={route('teacher.modules')}   active={route().current('teacher.modules')}>My Modules</NavLink>
                                <NavLink href={route('teacher.schedule')}  active={route().current('teacher.schedule')}>Schedule</NavLink>
                                <NavLink href={route('teacher.results.index')} active={route().current('teacher.results.index')}>Results</NavLink>
                                <NavLink href={route('teacher.tps.index')}    active={route().current('teacher.tps.index')}>TPs</NavLink>
                                <NavLink href={route('teacher.events.index')} active={route().current('teacher.events.index')}>
                                    <span className="relative">
                                        Events
                                        {new_events_count > 0 && (
                                            <span className="absolute -right-4 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                                                {new_events_count > 9 ? '9+' : new_events_count}
                                            </span>
                                        )}
                                    </span>
                                </NavLink>
                            </div>
                        </div>

                        <div className="hidden sm:ms-6 sm:flex sm:items-center gap-2">
                            <NotificationBell />
                            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">Teacher</span>
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button type="button" className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-500 hover:text-gray-700 focus:outline-none">
                                        {user.name}
                                        <svg className="-me-0.5 ms-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </Dropdown.Trigger>
                                <Dropdown.Content>
                                    <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
                                    <Dropdown.Link href={route('logout')} method="post" as="button">Log Out</Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>

                        <div className="-me-2 flex items-center sm:hidden">
                            <button onClick={() => setOpen(p => !p)} className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none">
                                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                    <path className={!open ? 'inline-flex' : 'hidden'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                    <path className={open ? 'inline-flex' : 'hidden'}  strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div className={(open ? 'block' : 'hidden') + ' sm:hidden'}>
                    <div className="space-y-1 pb-3 pt-2">
                        <ResponsiveNavLink href={route('teacher.dashboard')} active={route().current('teacher.dashboard')}>Dashboard</ResponsiveNavLink>
                        <ResponsiveNavLink href={route('teacher.modules')}   active={route().current('teacher.modules')}>My Modules</ResponsiveNavLink>
                        <ResponsiveNavLink href={route('teacher.schedule')}  active={route().current('teacher.schedule')}>Schedule</ResponsiveNavLink>
                        <ResponsiveNavLink href={route('teacher.results.index')} active={route().current('teacher.results.index')}>Results</ResponsiveNavLink>
                        <ResponsiveNavLink href={route('teacher.tps.index')}    active={route().current('teacher.tps.index')}>TPs</ResponsiveNavLink>
                        <ResponsiveNavLink href={route('teacher.events.index')} active={route().current('teacher.events.index')}>
                            Events {new_events_count > 0 && <span className="ms-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">{new_events_count > 9 ? '9+' : new_events_count}</span>}
                        </ResponsiveNavLink>
                    </div>
                    <div className="border-t border-gray-200 pb-1 pt-4">
                        <div className="px-4">
                            <div className="text-base font-medium text-gray-800">{user.name}</div>
                            <div className="text-sm font-medium text-gray-500">{user.email}</div>
                        </div>
                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>Profile</ResponsiveNavLink>
                            <ResponsiveNavLink method="post" href={route('logout')} as="button">Log Out</ResponsiveNavLink>
                        </div>
                    </div>
                </div>
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
