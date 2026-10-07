<?php

namespace App\Services;

use App\Models\Spk;
use PhpOffice\PhpWord\PhpWord;
use PhpOffice\PhpWord\Style\Language;
use PhpOffice\PhpWord\SimpleType\Jc;
use PhpOffice\PhpWord\Shared\Converter;

class SpkDocxService
{
    public static function bulanStatic(int $bulan): string
    {
        return self::bulanIndo($bulan);
    }

    public static function tanggalTerbilangStatic(\Carbon\Carbon $date): string
    {
        return self::tanggalTerbilang($date);
    }

    public static function terbilangStatic(float $angka): string
    {
        return self::terbilang($angka);
    }

    public static function generate(Spk $spk): PhpWord
    {
        $phpWord = new PhpWord();
        $phpWord->getSettings()->setThemeFontLang(new Language('id-ID'));
        $phpWord->setDefaultFontName('Arial');
        $phpWord->setDefaultFontSize(10);

        // Styles mengikuti Format SPK.docx: Arial 10pt, spasi baris ~1.15 (line 273/240)
        $FONT = ['name' => 'Arial', 'size' => 10];
        $FONT_BOLD = ['name' => 'Arial', 'size' => 10, 'bold' => true];
        $LINE = 273; // line spacing auto, sama dengan template

        $phpWord->addTitleStyle(1, ['name' => 'Arial', 'size' => 10, 'bold' => true], ['alignment' => Jc::CENTER]);
        $phpWord->addTitleStyle(2, ['name' => 'Arial', 'size' => 10, 'bold' => true], ['alignment' => Jc::CENTER]);

        $phpWord->addParagraphStyle('centered', ['alignment' => Jc::CENTER, 'line' => $LINE, 'lineRule' => 'auto']);
        $phpWord->addParagraphStyle('justified', ['alignment' => Jc::BOTH, 'line' => $LINE, 'lineRule' => 'auto']);
        $phpWord->addParagraphStyle('pasal', ['alignment' => Jc::CENTER, 'bold' => true, 'spaceBefore' => 230]);
        $phpWord->addParagraphStyle('right', ['alignment' => Jc::RIGHT]);
        
        // ====== HALAMAN 1-3: PERJANJIAN KERJA ======
        $section = $phpWord->addSection([
            'paperSize' => 'A4',
            'marginTop' => Converter::cmToTwip(2.36),
            'marginBottom' => Converter::cmToTwip(0.49),
            'marginLeft' => Converter::cmToTwip(2.5),
            'marginRight' => Converter::cmToTwip(1.5),
        ]);

        // Header
        $section->addText('PERJANJIAN KERJA PETUGAS LAPANGAN', ['name' => 'Arial', 'size' => 10, 'bold' => true], 'centered');
        $section->addText('BULAN ' . self::bulanIndo($spk->bulan) . ' TAHUN ' . $spk->tahun, ['name' => 'Arial', 'size' => 10, 'bold' => true], 'centered');
        $section->addText('BADAN PUSAT STATISTIK KABUPATEN JEMBER', ['name' => 'Arial', 'size' => 10, 'bold' => true], 'centered');
        $section->addText('NOMOR: ' . $spk->nomor_spk, ['name' => 'Arial', 'size' => 10], 'centered');
        $section->addTextBreak();

        // Pembukaan
        $tanggalSpk = \Carbon\Carbon::parse($spk->tanggal_spk ?? now());
        $hari = \App\Services\SpkService::hariIndo($tanggalSpk);
        $tanggalTerbilang = self::tanggalTerbilang($tanggalSpk);
        
        $section->addText(
            "Pada hari ini {$hari}, tanggal {$tanggalTerbilang}, bertempat di Jember, yang bertanda tangan di bawah ini:",
            ['name' => 'Arial', 'size' => 10],
            'justified'
        );
        $section->addTextBreak();

        // PIHAK PERTAMA
        $section->addText('1.', ['name' => 'Arial', 'size' => 10]);
        $section->addText($spk->ppk->name ?? $spk->nama_ppk_snapshot, ['name' => 'Arial', 'size' => 10, 'bold' => true]);
        $section->addText(':', ['name' => 'Arial', 'size' => 10]);
        $section->addText(
            'Pejabat Pembuat Komitmen Badan Pusat Statistik Kabupaten Jember, berkedudukan di Jl. Cendrawasih No. 20 Kel. Slawu, bertindak untuk dan atas nama BPS Kabupaten Jember, selanjutnya disebut sebagai PIHAK PERTAMA.',
            ['name' => 'Arial', 'size' => 10],
            'justified'
        );
        $section->addTextBreak();

        // PIHAK KEDUA
        $mitra = $spk->mitra;
        $pekerjaan = $mitra->pekerjaan ?? '[PEKERJAAN KOSONG - ISI DATA MITRA]';
        // Format alamat Title Case
        $alamatRaw = trim(($mitra->alamat ?? '-') . ' ' . ($mitra->kecamatan ? 'Kec. ' . $mitra->kecamatan : ''));
        $alamat = ucwords(strtolower($alamatRaw));
        
        $section->addText('2.', ['name' => 'Arial', 'size' => 10]);
        $section->addText($mitra->nama_lengkap, ['name' => 'Arial', 'size' => 10, 'bold' => true]);
        $section->addText(':', ['name' => 'Arial', 'size' => 10]);
        $section->addText(
            "{$pekerjaan}, berkedudukan di {$alamat}, bertindak untuk dan atas nama diri sendiri, selanjutnya disebut PIHAK KEDUA.",
            ['name' => 'Arial', 'size' => 10],
            'justified'
        );
        $section->addTextBreak();

        $section->addText(
            'bahwa PIHAK PERTAMA dan PIHAK KEDUA yang secara bersama-sama disebut PARA PIHAK, sepakat untuk mengikatkan diri dalam Perjanjian Kerja Petugas Lapangan Kegiatan Sensus/Survei bulan ' . self::bulanIndo($spk->bulan) . ' Tahun ' . $spk->tahun . ' Badan Pusat Statistik Kabupaten Jember sesuai dengan rincian kegiatan sensus/survei pada lampiran perjanjian, yang selanjutnya disebut Perjanjian, dengan ketentuan-ketentuan sebagai berikut:',
            ['name' => 'Arial', 'size' => 10],
            'justified'
        );
        $section->addTextBreak();

        // PASAL-PASAL
        $pasals = self::getPasals($spk);
        foreach ($pasals as $pasal) {
            $section->addText($pasal['title'], ['name' => 'Arial', 'size' => 10, 'bold' => true], 'pasal');
            foreach ($pasal['content'] as $paragraph) {
                $section->addText($paragraph, ['name' => 'Arial', 'size' => 10], 'justified');
            }
            $section->addTextBreak();
        }

        // Penutup
        $section->addText(
            'Demikian Perjanjian ini dibuat dan ditandatangani oleh PARA PIHAK dalam 2 (dua) rangkap asli bermeterai cukup, tanpa paksaan dari PIHAK manapun dan untuk dilaksanakan oleh PARA PIHAK.',
            ['name' => 'Arial', 'size' => 10],
            'justified'
        );
        $section->addTextBreak(2);

        // Tanda Tangan
        $table = $section->addTable(['borderSize' => 0, 'width' => 5000]);
        $table->addRow();
        $cell1 = $table->addCell(2500);
        $cell2 = $table->addCell(2500);
        
        $cell1->addText('PIHAK KEDUA,', ['name' => 'Arial', 'size' => 10], 'centered');
        $cell2->addText('PIHAK PERTAMA,', ['name' => 'Arial', 'size' => 10], 'centered');
        
        $cell1->addTextBreak(4);
        $cell2->addTextBreak(4);
        
        $cell1->addText($mitra->nama_lengkap, ['name' => 'Arial', 'size' => 10, 'bold' => true, 'underline' => true], 'centered');
        $cell2->addText($spk->ppk->name ?? $spk->nama_ppk_snapshot, ['name' => 'Arial', 'size' => 10, 'bold' => true, 'underline' => true], 'centered');
        
        $cell1->addText('SOBAT ID: ' . ($mitra->sobat_id ?? '-'), ['name' => 'Arial', 'size' => 9], 'centered');
        $cell2->addText('NIP. ' . ($spk->nip_ppk_snapshot ?? '-'), ['name' => 'Arial', 'size' => 9], 'centered');

        // ====== HALAMAN 4: LAMPIRAN ======
        $sectionLampiran = $phpWord->addSection([
            'paperSize' => 'A4',
            'marginTop' => Converter::cmToTwip(2.36),
            'marginBottom' => Converter::cmToTwip(0.49),
            'marginLeft' => Converter::cmToTwip(2.5),
            'marginRight' => Converter::cmToTwip(1.5),
        ]);

        $sectionLampiran->addText('LAMPIRAN', ['name' => 'Arial', 'size' => 10, 'bold' => true], 'centered');
        $sectionLampiran->addText('PERJANJIAN KERJA PETUGAS LAPANGAN', ['name' => 'Arial', 'size' => 10, 'bold' => true], 'centered');
        $sectionLampiran->addText('KEGIATAN SENSUS/SURVEI BULAN ' . self::bulanIndo($spk->bulan) . ' TAHUN ' . $spk->tahun, ['name' => 'Arial', 'size' => 10, 'bold' => true], 'centered');
        $sectionLampiran->addText('BADAN PUSAT STATISTIK KABUPATEN JEMBER', ['name' => 'Arial', 'size' => 10, 'bold' => true], 'centered');
        $sectionLampiran->addText('NOMOR: ' . $spk->nomor_spk, ['name' => 'Arial', 'size' => 10], 'centered');
        $sectionLampiran->addTextBreak();

        $sectionLampiran->addText('DAFTAR URAIAN TUGAS, JANGKA WAKTU, NILAI PERJANJIAN, DAN BEBAN ANGGARAN', ['name' => 'Arial', 'size' => 10, 'bold' => true], 'centered');
        $sectionLampiran->addTextBreak();

        // Tabel Rincian
        $tableStyle = ['borderSize' => 6, 'borderColor' => '000000'];
        
        $table = $sectionLampiran->addTable($tableStyle);
        
        // Header row
        $headerRow = $table->addRow();
        $headers = [
            ['text' => 'No', 'width' => 500],
            ['text' => 'Uraian Tugas', 'width' => 2500],
            ['text' => 'Jangka Waktu', 'width' => 1500],
            ['text' => 'Volume', 'width' => 800],
            ['text' => 'Satuan', 'width' => 800],
            ['text' => 'Harga Satuan', 'width' => 1200],
            ['text' => 'Nilai Perjanjian', 'width' => 1400],
            ['text' => 'Beban Anggaran', 'width' => 1300],
        ];
        foreach ($headers as $h) {
            $table->addCell($h['width'])->addText($h['text'], ['name' => 'Arial', 'size' => 9, 'bold' => true], ['alignment' => Jc::CENTER]);
        }
        
        // Detail rows
        $no = 1;
        foreach ($spk->details as $detail) {
            $row = $table->addRow();
            $row->addCell(500)->addText($no++, ['name' => 'Arial', 'size' => 9], ['alignment' => Jc::CENTER]);
            $row->addCell(2500)->addText($detail->uraian_tugas, ['name' => 'Arial', 'size' => 9]);
            
            $startD = \Carbon\Carbon::parse($detail->tanggal_mulai_detail);
            $endD = \Carbon\Carbon::parse($detail->tanggal_selesai_detail);
            $jangkaWaktu = $startD->day . ' s.d. ' . $endD->day . ' ' . self::bulanIndo($endD->month) . ' ' . $endD->year;
            $row->addCell(1500)->addText($jangkaWaktu, ['name' => 'Arial', 'size' => 8]);
            $row->addCell(800)->addText($detail->volume, ['name' => 'Arial', 'size' => 9], ['alignment' => Jc::CENTER]);
            $row->addCell(800)->addText($detail->satuan, ['name' => 'Arial', 'size' => 9], ['alignment' => Jc::CENTER]);
            $row->addCell(1200)->addText('Rp' . "\u{00A0}" . number_format($detail->harga_satuan, 0, ',', '.') . ',-', ['name' => 'Arial', 'size' => 9], ['alignment' => Jc::RIGHT]);
            $row->addCell(1400)->addText('Rp' . "\u{00A0}" . number_format($detail->nilai, 0, ',', '.') . ',-', ['name' => 'Arial', 'size' => 9], ['alignment' => Jc::RIGHT]);
            // Kode anggaran lengkap: kode_kegiatan + akun_anggaran
            $kodeLengkap = $detail->kode_anggaran;
            if (!empty($detail->akun_anggaran)) {
                $kodeLengkap .= $detail->akun_anggaran;
            }
            $row->addCell(1300)->addText($kodeLengkap ?: '-', ['name' => 'Arial', 'size' => 8]);
        }
        
        // Total row
        $totalRow = $table->addRow();
        $totalRow->addCell(500)->addText('', ['name' => 'Arial', 'size' => 9]);
        $totalRow->addCell(6800, ['gridSpan' => 5])->addText('TOTAL', ['name' => 'Arial', 'size' => 9, 'bold' => true], ['alignment' => Jc::RIGHT]);
        $totalRow->addCell(1400)->addText('Rp' . "\u{00A0}" . number_format($spk->total_nilai, 0, ',', '.') . ',-', ['name' => 'Arial', 'size' => 9, 'bold' => true], ['alignment' => Jc::RIGHT]);
        $totalRow->addCell(1300)->addText('', ['name' => 'Arial', 'size' => 9]);
        
        $sectionLampiran->addTextBreak();
        $sectionLampiran->addText('Terbilang: ' . ucwords(self::terbilang($spk->total_nilai)) . ' Rupiah', ['name' => 'Arial', 'size' => 10, 'bold' => true]);
        $sectionLampiran->addText('Rp' . "\u{00A0}" . number_format($spk->total_nilai, 0, ',', '.') . ',-', ['name' => 'Arial', 'size' => 11, 'bold' => true]);

        return $phpWord;
    }

    private static function getPasals(Spk $spk): array
    {
        $mitra = $spk->mitra;
        $mulaiCarbon = \Carbon\Carbon::parse($spk->tanggal_mulai);
        $selesaiCarbon = \Carbon\Carbon::parse($spk->tanggal_selesai);
        $tanggalMulai = $mulaiCarbon->day . ' ' . self::bulanIndo($mulaiCarbon->month) . ' ' . $mulaiCarbon->year;
        $tanggalSelesai = $selesaiCarbon->day . ' ' . self::bulanIndo($selesaiCarbon->month) . ' ' . $selesaiCarbon->year;
        $honor = 'Rp' . "\u{00A0}" . number_format($spk->total_nilai, 0, ',', '.') . ',-';
        $honorTerbilang = ucwords(self::terbilang($spk->total_nilai)) . ' rupiah';
        $gantiRugi = 'Rp.' . "\u{00A0}" . number_format(ceil($spk->total_nilai / 2), 0, ',', '.') . ',-';

        return [
            [
                'title' => 'Pasal 1',
                'content' => [
                    'PIHAK PERTAMA memberikan pekerjaan kepada PIHAK KEDUA dan PIHAK KEDUA menerima pekerjaan dari PIHAK PERTAMA sebagai Petugas Lapangan Kegiatan Sensus/Survei bulan ' . self::bulanIndo($spk->bulan) . ' Tahun ' . $spk->tahun . ' pada Badan Pusat Statistik Kabupaten Jember, dengan lingkup pekerjaan yang ditetapkan oleh PIHAK PERTAMA.',
                ],
            ],
            [
                'title' => 'Pasal 2',
                'content' => [
                    'Ruang lingkup pekerjaan dalam Perjanjian ini mengacu pada wilayah kerja dan beban kerja sebagaimana tertuang dalam lampiran perjanjian Petugas Lapangan dari masing-masing kegiatan sesuai dengan pasal 1 yang merupakan bagian tidak terpisahkan dari Perjanjian ini, Pedoman Pendataan Survei BPS dan ketentuan lainnya yang ditetapkan oleh PIHAK PERTAMA.',
                ],
            ],
            [
                'title' => 'Pasal 3',
                'content' => [
                    'Jangka Waktu Perjanjian terhitung sejak tanggal ' . $tanggalMulai . ' sampai dengan tanggal ' . $tanggalSelesai . '.',
                ],
            ],
            [
                'title' => 'Pasal 4',
                'content' => [
                    'PIHAK KEDUA berkewajiban melaksanakan seluruh pekerjaan yang diberikan oleh PIHAK PERTAMA sampai selesai, sesuai ruang lingkup pekerjaan sebagaimana dimaksud dalam Pasal 2.',
                ],
            ],
            [
                'title' => 'Pasal 5',
                'content' => [
                    "\tPIHAK KEDUA untuk waktu yang tidak terbatas dan/atau tidak terikat masa berlakunya Perjanjian ini, menjamin kerahasiaan setiap data/informasi yang diterima atau diperolehnya dari PIHAK PERTAMA, serta menjamin bahwa keterangan informasi dipergunakan untuk melaksanakan tujuan menurut Perjanjian ini.",
                    "\tPIHAK KEDUA apabila melakukan peminjaman dokumen/data/aset milik PIHAK PERTAMA, wajib menjaga dan menggunakan sesuai dengan tujuan perjanjian dan mengembalikan dalam keadaan utuh sama dengan saat peminjaman, serta dilarang menggandakan, menyalin, menunjukkan, dan/atau mendokumentasikan dalam bentuk foto atau bentuk apapun untuk kepentingan pribadi atapun kepentingan lain yang tidak berkaitan dengan tujuan perjanjian ini.",
                    "\tPIHAK KEDUA dilarang memberikan dokumen/data/aset milik PIHAK PERTAMA yang berada dalam penguasaan PIHAK KEDUA, baik secara langsung maupun tidak langsung, termasuk memberikan akses kepada pihak lain untuk menggunakan, menyalin, memfotokopi, menunjukkan, dan/atau mendokumentasikan dalam bentuk foto atau bentuk apapun, sehingga informasi diketahui oleh pihak lain untuk tujuan apapun.",
                ],
            ],
            [
                'title' => 'Pasal 6',
                'content' => [
                    "\tPIHAK KEDUA berhak untuk mendapatkan honorarium dari PIHAK PERTAMA sebesar {$honor} ({$honorTerbilang}) untuk pekerjaan sebagaimana dimaksud dalam Pasal 1, termasuk biaya pajak, bea materai, pulsa dan kuota internet untuk komunikasi, dan jasa pelayanan keuangan (rincian honorarium terlampir)",
                    "\tPIHAK KEDUA tidak diberikan honorarium tambahan apabila melakukan kunjungan di luar jadwal atau terdapat tambahan waktu pelaksanaan pekerjaan lapangan.",
                    "\tPembayaran honorarium sebagaimana dimaksud dalam ayat (1) dilakukan setelah PIHAK KEDUA menyelesaikan dan menyerahkan seluruh hasil pekerjaan sebagaimana dimaksud dalam Pasal 1 kepada PIHAK PERTAMA.",
                    "\tPembayaran sebagaimana dimaksud pada ayat (1) dilakukan oleh PIHAK PERTAMA kepada PIHAK KEDUA sesuai dengan ketentuan peraturan perundang-undangan.",
                ],
            ],
            [
                'title' => 'Pasal 7',
                'content' => [
                    "\tPIHAK PERTAMA secara berjenjang melakukan pemeriksaan dan evaluasi atas penyelesaian dan kualitas hasil pekerjaan yang dilaksanakan oleh PIHAK KEDUA.",
                    "\tPenyerahan hasil pekerjaan lapangan sebagaimana dimaksud dalam Pasal 1 dilakukan secara bertahap dan selambat-lambatnya seluruh hasil pekerjaan lapangan diserahkan sesuai jadwal yang tercantum dalam Lampiran, yang dinyatakan dalam Berita Acara Serah Terima Hasil Pekerjaan yang ditandatangani oleh PARA PIHAK.",
                ],
            ],
            [
                'title' => 'Pasal 8',
                'content' => [
                    'PIHAK PERTAMA dapat memutuskan Perjanjian ini secara sepihak sewaktu-waktu dalam hal PIHAK KEDUA tidak dapat melaksanakan kewajibannya sebagaimana dimaksud dalam Pasal 4, dengan menerbitkan Surat Pemutusan Perjanjian Kerja.',
                ],
            ],
            [
                'title' => 'Pasal 9',
                'content' => [
                    "\tApabila PIHAK KEDUA mengundurkan diri pada saat/setelah pelaksanaan pekerjaan lapangan dengan tidak menyelesaikan pekerjaan yang menjadi tanggung jawabnya, maka wajib membayar ganti rugi kepada PIHAK PERTAMA sebesar {$gantiRugi}.",
                    "\tDikecualikan tidak membayar ganti rugi sebagaimana dimaksud pada ayat (1) kepada PIHAK PERTAMA, apabila PIHAK KEDUA meninggal dunia, mengundurkan diri karena sakit dengan keterangan rawat inap, kecelakaan dengan keterangan kepolisian, dan/atau telah diberikan Surat Pemutusan Perjanjian Kerja dari PIHAK PERTAMA.",
                    "\tDalam hal terjadi peristiwa sebagaimana dimaksud pada ayat (2), PIHAK PERTAMA membayarkan honorarium kepada PIHAK KEDUA secara proporsional sesuai pekerjaan yang telah dilaksanakan.",
                ],
            ],
            [
                'title' => 'Pasal 10',
                'content' => [
                    "\tApabila terjadi Keadaan Kahar, yang meliputi bencana alam, bencana non alam dan bencana sosial, PIHAK KEDUA memberitahukan kepada PIHAK PERTAMA dalam waktu paling lambat 7 (tujuh) hari sejak mengetahui atas kejadian Keadaan Kahar dengan menyertakan bukti.",
                    "\tPada saat terjadi Keadaan Kahar, pelaksanaan pekerjaan oleh PIHAK KEDUA dihentikan sementara dan dilanjutkan kembali setelah Keadaan Kahar berakhir, namun apabila akibat Keadaan Kahar tidak memungkinkan dilanjutkan/diselesaikannya pelaksanaan pekerjaan, PIHAK KEDUA berhak menerima honorarium secara proporsional sesuai pekerjaan yang telah dilaksanakan.",
                ],
            ],
            [
                'title' => 'Pasal 11',
                'content' => [
                    'Segala sesuatu yang belum atau tidak cukup diatur dalam Perjanjian ini diatur lebih lanjut oleh PARA PIHAK dalam perjanjian tambahan/addendum dan merupakan bagian tidak terpisahkan dari perjanjian ini.',
                ],
            ],
            [
                'title' => 'Pasal 12',
                'content' => [
                    "\tSegala perselisihan atau perbedaan pendapat yang timbul sebagai akibat adanya Perjanjian ini akan diselesaikan secara musyawarah untuk mufakat oleh PARA PIHAK.",
                    "\tApabila perselisihan tidak dapat diselesaikan sebagaimana dimaksud pada ayat (1), PARA PIHAK sepakat menyelesaikan perselisihan dengan memilih kedudukan/domisili hukum di Panitera Pengadilan Negeri Jember.",
                    "\tSelama perselisihan dalam proses penyelesaian pengadilan, PIHAK PERTAMA dan PIHAK KEDUA wajib tetap melaksanakan kewajiban masing-masing berdasarkan perjanjian ini.",
                ],
            ],
        ];
    }

    private static function bulanIndo(int $bulan): string
    {
        $bulanNama = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        return $bulanNama[$bulan - 1] ?? '';
    }

    private static function tanggalTerbilang(\Carbon\Carbon $date): string
    {
        $hari = ['Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas', 'Dua Belas', 'Tiga Belas', 'Empat Belas', 'Lima Belas', 'Enam Belas', 'Tujuh Belas', 'Delapan Belas', 'Sembilan Belas', 'Dua Puluh', 'Dua Puluh Satu', 'Dua Puluh Dua', 'Dua Puluh Tiga', 'Dua Puluh Empat', 'Dua Puluh Lima', 'Dua Puluh Enam', 'Dua Puluh Tujuh', 'Dua Puluh Delapan', 'Dua Puluh Sembilan', 'Tiga Puluh', 'Tiga Puluh Satu'];
        
        $tgl = $hari[$date->day - 1] ?? $date->day;
        $bln = self::bulanIndo($date->month);
        $thn = self::terbilang($date->year);
        
        return "{$tgl} Bulan {$bln} Tahun {$thn}";
    }

    private static function terbilang(float $angka): string
    {
        return SpkService::terbilang($angka);
    }
}
