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
            return ['name', 'email', 'password', 'specialization'];
        }

        return ['name', 'email', 'password'];
    }

    public function array(): array
    {
        if ($this->role === 'student') {
            $codes = Specialization::orderBy('name')->pluck('code')->toArray();
            $note  = count($codes) > 0
                ? 'Available codes: ' . implode(', ', $codes)
                : 'e.g. GI';

            return [
                ['Ali Bensalem',   'ali@example.com',   'Pass123!', $codes[0] ?? 'GI'],
                ['Sara Khaldi',    'sara@example.com',  '',         $codes[0] ?? 'GI'],
                ['Yacine Amari',   'yacine@example.com','',         ''],
                // Informational row
                ['', '', '← leave blank to auto-generate', '← ' . $note],
            ];
        }

        return [
            ['Dr. Ahmed Benali',  'ahmed@example.com',  'Pass123!'],
            ['Prof. Sara Meziani','sara@example.com',    ''],
            ['', '', '← leave blank to auto-generate'],
        ];
    }

    public function styles(Worksheet $sheet): void
    {
        $lastCol     = $this->role === 'student' ? 'D' : 'C';
        $lastDataRow = $this->role === 'student' ? 5 : 4;

        // Header row — dark background, white bold text
        $sheet->getStyle("A1:{$lastCol}1")->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'size' => 11],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '4338CA']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        ]);

        // Data rows — light alternating background
        for ($row = 2; $row <= $lastDataRow - 1; $row++) {
            $bg = $row % 2 === 0 ? 'F5F3FF' : 'FFFFFF';
            $sheet->getStyle("A{$row}:{$lastCol}{$row}")->applyFromArray([
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => $bg]],
            ]);
        }

        // Note row — italic gray
        $sheet->getStyle("A{$lastDataRow}:{$lastCol}{$lastDataRow}")->applyFromArray([
            'font'      => ['italic' => true, 'color' => ['rgb' => '9CA3AF'], 'size' => 9],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'F9FAFB']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_LEFT],
        ]);

        // Border around all cells
        $sheet->getStyle("A1:{$lastCol}{$lastDataRow}")->applyFromArray([
            'borders' => [
                'allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'E5E7EB']],
            ],
        ]);

        // Freeze the header row
        $sheet->freezePane('A2');
    }
}
