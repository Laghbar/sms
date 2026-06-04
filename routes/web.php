<?php

use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Admin\BulkImportController;
use App\Http\Controllers\Admin\EventController as AdminEventController;
use App\Http\Controllers\Admin\ExamController;
use App\Http\Controllers\Admin\ModuleController;
use App\Http\Controllers\Admin\ResultController as AdminResultController;
use App\Http\Controllers\Admin\ScheduleController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\Teacher\EventController as TeacherEventController;
use App\Http\Controllers\Teacher\ResultController as TeacherResultController;
use App\Http\Controllers\Teacher\TeacherController;
use App\Http\Controllers\Teacher\TpController;
use App\Http\Controllers\Student\EventController as StudentEventController;
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

// ── Admin ──────────────────────────────────────────────────────────────────
Route::middleware(['auth', 'verified', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [AdminController::class, 'dashboard'])->name('dashboard');
    Route::get('/users', [AdminController::class, 'users'])->name('users');
    Route::delete('/users/{user}', [AdminController::class, 'destroy'])->name('users.destroy');
    Route::get('/bulk-import', [BulkImportController::class, 'index'])->name('bulk-import.index');
    Route::post('/bulk-import', [BulkImportController::class, 'store'])->name('bulk-import.store');
    Route::get('/bulk-import/template/{role}', [BulkImportController::class, 'downloadTemplate'])->name('bulk-import.template');

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

    // Results management (admin can edit grades + publish/unpublish)
    Route::get('/results',                              [AdminResultController::class, 'index'])->name('results.index');
    Route::post('/results/{module}/grades',             [AdminResultController::class, 'updateGrades'])->name('results.update-grades');
    Route::post('/results/{module}/publish',            [AdminResultController::class, 'publish'])->name('results.publish');
    Route::post('/results/{module}/unpublish',          [AdminResultController::class, 'unpublish'])->name('results.unpublish');

    Route::get('/events',                    [AdminEventController::class, 'index'])->name('events.index');
    Route::post('/events',                   [AdminEventController::class, 'store'])->name('events.store');
    Route::put('/events/{event}',            [AdminEventController::class, 'update'])->name('events.update');
    Route::delete('/events/{event}',         [AdminEventController::class, 'destroy'])->name('events.destroy');
    Route::post('/events/{event}/notify',    [AdminEventController::class, 'notify'])->name('events.notify');

    Route::get('/exams',                     [ExamController::class, 'index'])->name('exams.index');
    Route::post('/exams',                    [ExamController::class, 'store'])->name('exams.store');
    Route::put('/exams/{exam}',              [ExamController::class, 'update'])->name('exams.update');
    Route::delete('/exams/{exam}',           [ExamController::class, 'destroy'])->name('exams.destroy');
});

// ── Teacher ────────────────────────────────────────────────────────────────
Route::middleware(['auth', 'verified', 'teacher'])->prefix('teacher')->name('teacher.')->group(function () {
    Route::get('/dashboard', [TeacherController::class, 'dashboard'])->name('dashboard');
    Route::get('/modules',   [TeacherController::class, 'modules'])->name('modules');
    Route::get('/schedule',  [TeacherController::class, 'schedule'])->name('schedule');

    Route::get('/tps',              [TpController::class, 'index'])->name('tps.index');
    Route::post('/tps',             [TpController::class, 'store'])->name('tps.store');
    Route::put('/tps/{tp}',         [TpController::class, 'update'])->name('tps.update');
    Route::delete('/tps/{tp}',      [TpController::class, 'destroy'])->name('tps.destroy');

    // Results — teacher manages grades for own module(s)
    Route::get('/results',                              [TeacherResultController::class, 'index'])->name('results.index');
    Route::post('/results/{module}/grades',             [TeacherResultController::class, 'saveGrades'])->name('results.save');
    Route::post('/results/{module}/publish',            [TeacherResultController::class, 'publish'])->name('results.publish');
    Route::post('/results/{module}/unpublish',          [TeacherResultController::class, 'unpublish'])->name('results.unpublish');
    Route::post('/results/{module}/notes',              [TeacherResultController::class, 'saveNotes'])->name('results.notes');

    Route::get('/events',                          [TeacherEventController::class, 'index'])->name('events.index');
    Route::post('/events',                         [TeacherEventController::class, 'store'])->name('events.store');
    Route::put('/events/{event}',                  [TeacherEventController::class, 'update'])->name('events.update');
    Route::delete('/events/{event}',               [TeacherEventController::class, 'destroy'])->name('events.destroy');
    Route::post('/events/{event}/register',        [TeacherEventController::class, 'register'])->name('events.register');
    Route::delete('/events/{event}/register',      [TeacherEventController::class, 'unregister'])->name('events.unregister');
});

// ── Student ────────────────────────────────────────────────────────────────
Route::middleware(['auth', 'verified', 'student'])->prefix('student')->name('student.')->group(function () {
    Route::get('/dashboard', [StudentController::class, 'dashboard'])->name('dashboard');
    Route::get('/results',   [StudentController::class, 'results'])->name('results');
    Route::get('/schedule',  [StudentController::class, 'schedule'])->name('schedule');
    Route::get('/tps',       [StudentController::class, 'tps'])->name('tps');

    Route::get('/events',                          [StudentEventController::class, 'index'])->name('events.index');
    Route::post('/events/{event}/register',        [StudentEventController::class, 'register'])->name('events.register');
    Route::delete('/events/{event}/register',      [StudentEventController::class, 'unregister'])->name('events.unregister');
});

// ── Profile & notifications ────────────────────────────────────────────────
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::post('/notifications/read-all',   [NotificationController::class, 'markAllRead'])->name('notifications.read-all');
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markRead'])->name('notifications.read');
});

require __DIR__.'/auth.php';
