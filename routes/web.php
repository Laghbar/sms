<?php

use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Admin\AnnouncementController;
use App\Http\Controllers\Admin\BulkImportController;
use App\Http\Controllers\Admin\ModuleController;
use App\Http\Controllers\Admin\ScheduleController;
use App\Http\Controllers\Teacher\TeacherController;
use App\Http\Controllers\Teacher\TpController;
use App\Http\Controllers\Student\StudentController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin'       => Route::has('login'),
        'canRegister'    => false,
        'laravelVersion' => Application::VERSION,
        'phpVersion'     => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware(['auth', 'verified', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [AdminController::class, 'dashboard'])->name('dashboard');
    Route::get('/users', [AdminController::class, 'users'])->name('users');
    Route::get('/bulk-import', [BulkImportController::class, 'index'])->name('bulk-import.index');
    Route::post('/bulk-import', [BulkImportController::class, 'store'])->name('bulk-import.store');

    Route::get('/modules', [ModuleController::class, 'index'])->name('modules.index');
    Route::post('/modules', [ModuleController::class, 'store'])->name('modules.store');
    Route::put('/modules/{module}', [ModuleController::class, 'update'])->name('modules.update');
    Route::delete('/modules/{module}', [ModuleController::class, 'destroy'])->name('modules.destroy');

    Route::get('/modules/{module}/students', [ModuleController::class, 'students'])->name('modules.students');
    Route::post('/modules/{module}/students', [ModuleController::class, 'enrollStudent'])->name('modules.students.enroll');
    Route::delete('/modules/{module}/students/{student}', [ModuleController::class, 'unenrollStudent'])->name('modules.students.unenroll');

    Route::get('/schedules', [ScheduleController::class, 'index'])->name('schedules.index');
    Route::post('/schedules', [ScheduleController::class, 'store'])->name('schedules.store');
    Route::put('/schedules/{schedule}', [ScheduleController::class, 'update'])->name('schedules.update');
    Route::delete('/schedules/{schedule}', [ScheduleController::class, 'destroy'])->name('schedules.destroy');

    Route::get('/announcements',                    [AnnouncementController::class, 'index'])->name('announcements.index');
    Route::post('/announcements/generate',          [AnnouncementController::class, 'generate'])->name('announcements.generate');
    Route::post('/announcements',                   [AnnouncementController::class, 'store'])->name('announcements.store');
    Route::delete('/announcements/{announcement}',  [AnnouncementController::class, 'destroy'])->name('announcements.destroy');
});

Route::middleware(['auth', 'verified', 'teacher'])->prefix('teacher')->name('teacher.')->group(function () {
    Route::get('/dashboard', [TeacherController::class, 'dashboard'])->name('dashboard');
    Route::get('/modules',   [TeacherController::class, 'modules'])->name('modules');
    Route::get('/schedule',  [TeacherController::class, 'schedule'])->name('schedule');

    Route::get('/tps',              [TpController::class, 'index'])->name('tps.index');
    Route::post('/tps',             [TpController::class, 'store'])->name('tps.store');
    Route::put('/tps/{tp}',         [TpController::class, 'update'])->name('tps.update');
    Route::delete('/tps/{tp}',      [TpController::class, 'destroy'])->name('tps.destroy');
});

Route::middleware(['auth', 'verified', 'student'])->prefix('student')->name('student.')->group(function () {
    Route::get('/dashboard', [StudentController::class, 'dashboard'])->name('dashboard');
    Route::get('/results',   [StudentController::class, 'results'])->name('results');
    Route::get('/schedule',  [StudentController::class, 'schedule'])->name('schedule');
    Route::get('/tps',       [StudentController::class, 'tps'])->name('tps');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
