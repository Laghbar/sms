<?php

namespace App\Exports;

use App\Models\Specialization;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class UsersTemplateExport implements FromArray, WithHeadings, WithStyles, ShouldAutoSize, WithTitle
{
    public function __construct(private readonly string $role) {}

    public function title(): string
    {
        return ucfirst($this->role) . 's';
    }

    public function headings(): array
    {
        if ($this->role === 'student') {
            return ['name', 'email', 'password', 'specialization', 'semester'];
        }

        return ['name', 'email', 'password'];
    }

    public function array(): array
    {
        if ($this->role === 'student') {
            // Build reference from DB
            $specs = Specialization::with(['semesters' => fn ($q) => $q->orderBy('name')])
                ->orderBy('name')->get();

            $specCodes = $specs->pluck('code')->toArray();
            $firstCode = $specCodes[0] ?? 'GI';

            // All semester names across all specializations
            $allSemesters = $specs->flatMap(fn ($s) => $s->semesters->pluck('name'))->unique()->sort()->values();
            $semNote = $allSemesters->isNotEmpty()
                ? 'e.g. ' . $allSemesters->implode(', ')
                : 'e.g. S1, S2, S3, S4';

            return [
                ['Ali Bensalem',   'ali@example.com',   'Pass123!', $firstCode, 'S2'],
                ['Sara Khaldi',    'sara@example.com',  '',         $firstCode, 'S2'],
                ['Yacine Amari',   'yacine@example.com','',         $firstCode, 'S4'],
                ['', '', '← auto-generated if blank',
                    '← ' . implode(', ', $specCodes),
                    '← ' . $semNote],
            ];
        }

        return [
            ['Dr. Ahmed Benali',   'ahmed@example.com',  'Pass123!'],
            ['Prof. Sara Meziani', 'sara@example.com',   ''],
            ['', '', '← auto-generated if blank'],
        ];
    }

    public function styles(Worksheet $sheet): void
    {
        $lastCol     = $this->role === 'student' ? 'E' : 'C';
        $lastDataRow = $this->role === 'student' ? 5 : 4;

        $sheet->getStyle("A1:{$lastCol}1")->applyFromArray([
            'font'      => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'size' => 11],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '4338CA']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        ]);

        for ($row = 2; $row <= $lastDataRow - 1; $row++) {
            $bg = $row % 2 === 0 ? 'F5F3FF' : 'FFFFFF';
            $sheet->getStyle("A{$row}:{$lastCol}{$row}")->applyFromArray([
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => $bg]],
            ]);
        }

        $sheet->getStyle("A{$lastDataRow}:{$lastCol}{$lastDataRow}")->applyFromArray([
            'font'      => ['italic' => true, 'color' => ['rgb' => '9CA3AF'], 'size' => 9],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'F9FAFB']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_LEFT],
        ]);

        $sheet->getStyle("A1:{$lastCol}{$lastDataRow}")->applyFromArray([
            'borders' => [
                'allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'E5E7EB']],
            ],
        ]);

        $sheet->freezePane('A2');
    }
}
