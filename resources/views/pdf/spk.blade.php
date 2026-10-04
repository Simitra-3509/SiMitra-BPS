<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>SPK - {{ $spk->nomor_spk ?? 'DRAFT' }}</title>
    <style>
        @page {
            size: A4;
            margin: 2.36cm 1.5cm 0.49cm 2.5cm;
        }
        body {
            font-family: 'Arial', sans-serif;
            font-size: 10pt;
            color: #000;
            line-height: 1.15;
            margin: 0;
            padding: 0;
        }
        .page-break {
            page-break-after: always;
        }
        .header-title {
            text-align: center;
            font-weight: bold;
            font-size: 14pt;
            text-transform: uppercase;
            margin-bottom: 5px;
        }
        .header-subtitle {
            text-align: center;
            font-weight: bold;
            font-size: 12pt;
            text-transform: uppercase;
            margin-bottom: 5px;
        }
        .header-org {
            text-align: center;
            font-weight: bold;
            font-size: 11pt;
            text-transform: uppercase;
            margin-bottom: 5px;
        }
        .header-nomor {
            text-align: center;
            font-size: 11pt;
            margin-bottom: 25px;
        }
        p {
            text-align: justify;
            margin: 0 0 10px 0;
        }
        .parties {
            margin-bottom: 15px;
        }
        .party-item {
            margin-bottom: 10px;
        }
        .pasal-title {
            text-align: center;
            font-weight: bold;
            margin-top: 15px;
            margin-bottom: 10px;
            text-transform: uppercase;
        }
        .indent {
            text-indent: 40px;
            margin-bottom: 8px;
        }
        .signatures {
            width: 100%;
            margin-top: 30px;
            page-break-inside: avoid;
        }
        .signatures td {
            width: 50%;
            text-align: center;
            vertical-align: top;
            font-size: 11pt;
        }
        .sign-space {
            height: 70px;
        }
        table.lampiran-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
            margin-bottom: 15px;
        }
        table.lampiran-table th, table.lampiran-table td {
            border: 1px solid #000;
            padding: 6px 8px;
            font-size: 9.5pt;
            vertical-align: middle;
        }
        table.lampiran-table th {
            text-align: center;
            background-color: #f2f2f2;
            font-weight: bold;
        }
    </style>
</head>
<body>

    <!-- ================= HALAMAN 1-3: PERJANJIAN KERJA ================= -->
    <div class="header-title">PERJANJIAN KERJA PETUGAS LAPANGAN</div>
    <div class="header-subtitle">BULAN {{ strtoupper(\App\Services\SpkDocxService::bulanStatic($spk->bulan)) }} TAHUN {{ $spk->tahun }}</div>
    <div class="header-org">BADAN PUSAT STATISTIK KABUPATEN JEMBER</div>
    <div class="header-nomor">NOMOR: {{ $spk->nomor_spk ?? '[DRAFT]' }}</div>

    @php
        $tanggalSpk = \Carbon\Carbon::parse($spk->tanggal_spk ?? now());
        $hari = $tanggalSpk->translatedFormat('l');
        $tanggalTerbilang = \App\Services\SpkDocxService::tanggalTerbilangStatic($tanggalSpk);
        $mitra = $spk->mitra;
        $pekerjaan = $mitra->pekerjaan ?? 'Petugas Lapangan';
        $alamat = ($mitra->alamat ?? '-') . ' ' . ($mitra->kecamatan ? 'Kec. ' . $mitra->kecamatan : '');
    @endphp

    <p>Pada hari ini {{ $hari }}, tanggal {{ $tanggalTerbilang }}, bertempat di Jember, yang bertanda tangan di bawah ini:</p>

    <div class="parties">
        <table style="width: 100%; border: none; margin-bottom: 10px;">
            <tr>
                <td style="width: 5%; vertical-align: top; border: none;">1.</td>
                <td style="width: 25%; vertical-align: top; border: none; font-weight: bold;">{{ $spk->nama_ppk_snapshot }}</td>
                <td style="width: 3%; vertical-align: top; border: none;">:</td>
                <td style="width: 67%; vertical-align: top; border: none; text-align: justify;">Pejabat Pembuat Komitmen Badan Pusat Statistik Kabupaten Jember, berkedudukan di Jl. Cendrawasih No. 20 Kel. Slawu, bertindak untuk dan atas nama BPS Kabupaten Jember, selanjutnya disebut sebagai <strong>PIHAK PERTAMA</strong>.</td>
            </tr>
            <tr>
                <td style="vertical-align: top; border: none; padding-top: 10px;">2.</td>
                <td style="vertical-align: top; border: none; font-weight: bold; padding-top: 10px;">{{ $mitra->nama_lengkap }}</td>
                <td style="vertical-align: top; border: none; padding-top: 10px;">:</td>
                <td style="vertical-align: top; border: none; text-align: justify; padding-top: 10px;">{{ $pekerjaan }}, berkedudukan di {{ $alamat }}, bertindak untuk dan atas nama diri sendiri, selanjutnya disebut <strong>PIHAK KEDUA</strong>.</td>
            </tr>
        </table>
    </div>

    <p>bahwa PIHAK PERTAMA dan PIHAK KEDUA yang secara bersama-sama disebut PARA PIHAK, sepakat untuk mengikatkan diri dalam Perjanjian Kerja Petugas Lapangan Kegiatan Sensus/Survei bulan {{ \App\Services\SpkDocxService::bulanStatic($spk->bulan) }} Tahun {{ $spk->tahun }} Badan Pusat Statistik Kabupaten Jember sesuai dengan rincian kegiatan sensus/survei pada lampiran perjanjian, yang selanjutnya disebut Perjanjian, dengan ketentuan-ketentuan sebagai berikut:</p>

    <div class="pasal-title">Pasal 1</div>
    <p>PIHAK PERTAMA memberikan pekerjaan kepada PIHAK KEDUA dan PIHAK KEDUA menerima pekerjaan dari PIHAK PERTAMA sebagai Petugas Lapangan Kegiatan Sensus/Survei bulan {{ \App\Services\SpkDocxService::bulanStatic($spk->bulan) }} Tahun {{ $spk->tahun }} pada Badan Pusat Statistik Kabupaten Jember, dengan lingkup pekerjaan yang ditetapkan oleh PIHAK PERTAMA.</p>

    <div class="pasal-title">Pasal 2</div>
    <p>Ruang lingkup pekerjaan dalam Perjanjian ini mengacu pada wilayah kerja dan beban kerja sebagaimana tertuang dalam lampiran perjanjian Petugas Lapangan dari masing-masing kegiatan sesuai dengan pasal 1 yang merupakan bagian tidak terpisahkan dari Perjanjian ini, Pedoman Pendataan Survei BPS dan ketentuan lainnya yang ditetapkan oleh PIHAK PERTAMA.</p>

    <div class="pasal-title">Pasal 3</div>
    <p>Jangka Waktu Perjanjian terhitung sejak tanggal {{ \Carbon\Carbon::parse($spk->tanggal_mulai)->format('d F Y') }} sampai dengan tanggal {{ \Carbon\Carbon::parse($spk->tanggal_selesai)->format('d F Y') }}.</p>

    <div class="pasal-title">Pasal 4</div>
    <p>PIHAK KEDUA berkewajiban melaksanakan seluruh pekerjaan yang diberikan oleh PIHAK PERTAMA sampai selesai, sesuai ruang lingkup pekerjaan sebagaimana dimaksud dalam Pasal 2, dengan menerapkan protokol kesehatan yang berlaku di wilayah kerja masing-masing.</p>

    <div class="pasal-title">Pasal 5</div>
    <p class="indent">PIHAK KEDUA untuk waktu yang tidak terbatas dan/atau tidak terikat masa berlakunya Perjanjian ini, menjamin kerahasiaan setiap data/informasi yang diterima atau diperolehnya dari PIHAK PERTAMA, serta menjamin bahwa keterangan informasi dipergunakan untuk melaksanakan tujuan menurut Perjanjian ini.</p>
    <p class="indent">PIHAK KEDUA apabila melakukan peminjaman dokumen/data/aset milik PIHAK PERTAMA, wajib menjaga dan menggunakan sesuai dengan tujuan perjanjian dan mengembalikan dalam keadaan utuh sama dengan saat peminjaman, serta dilarang menggandakan, menyalin, menunjukkan, dan/atau mendokumentasikan dalam bentuk foto atau bentuk apapun untuk kepentingan pribadi atapun kepentingan lain yang tidak berkaitan dengan tujuan perjanjian ini.</p>
    <p class="indent">PIHAK KEDUA dilarang memberikan dokumen/data/aset milik PIHAK PERTAMA yang berada dalam penguasaan PIHAK KEDUA, baik secara langsung maupun tidak langsung, termasuk memberikan akses kepada pihak lain untuk menggunakan, menyalin, memfotokopi, menunjukkan, dan/atau mendokumentasikan dalam bentuk foto atau bentuk apapun, sehingga informasi diketahui oleh pihak lain untuk tujuan apapun.</p>

    <div class="pasal-title">Pasal 6</div>
    @php
        $honor = 'Rp ' . number_format($spk->total_nilai, 0, ',', '.') . ',-';
        $honorTerbilang = ucwords(\App\Services\SpkDocxService::terbilangStatic($spk->total_nilai)) . ' rupiah';
        $gantiRugi = 'Rp ' . number_format(ceil($spk->total_nilai / 2), 0, ',', '.') . ',-';
    @endphp
    <p class="indent">PIHAK KEDUA berhak untuk mendapatkan honorarium dari PIHAK PERTAMA sebesar {{ $honor }} ({{ $honorTerbilang }}) untuk pekerjaan sebagaimana dimaksud dalam Pasal 1, termasuk biaya pajak, bea materai, pulsa dan kuota internet untuk komunikasi, dan jasa pelayanan keuangan (rincian honorarium terlampir)</p>
    <p class="indent">PIHAK KEDUA tidak diberikan honorarium tambahan apabila melakukan kunjungan di luar jadwal atau terdapat tambahan waktu pelaksanaan pekerjaan lapangan.</p>
    <p class="indent">Pembayaran honorarium sebagaimana dimaksud dalam ayat (1) dilakukan setelah PIHAK KEDUA menyelesaikan dan menyerahkan seluruh hasil pekerjaan sebagaimana dimaksud dalam Pasal 1 kepada PIHAK PERTAMA.</p>
    <p class="indent">Pembayaran sebagaimana dimaksud pada ayat (1) dilakukan oleh PIHAK PERTAMA kepada PIHAK KEDUA sesuai dengan ketentuan peraturan perundang-undangan.</p>

    <div class="pasal-title">Pasal 7</div>
    <p class="indent">PIHAK PERTAMA secara berjenjang melakukan pemeriksaan dan evaluasi atas penyelesaian dan kualitas hasil pekerjaan yang dilaksanakan oleh PIHAK KEDUA.</p>
    <p class="indent">Penyerahan hasil pekerjaan lapangan sebagaimana dimaksud dalam Pasal 1 dilakukan secara bertahap dan selambat-lambatnya seluruh hasil pekerjaan lapangan diserahkan sesuai jadwal yang tercantum dalam Lampiran, yang dinyatakan dalam Berita Acara Serah Terima Hasil Pekerjaan yang ditandatangani oleh PARA PIHAK.</p>

    <div class="pasal-title">Pasal 8</div>
    <p>PIHAK PERTAMA dapat memutuskan Perjanjian ini secara sepihak sewaktu-waktu dalam hal PIHAK KEDUA tidak dapat melaksanakan kewajibannya sebagaimana dimaksud dalam Pasal 4, dengan menerbitkan Surat Pemutusan Perjanjian Kerja.</p>

    <div class="pasal-title">Pasal 9</div>
    <p class="indent">Apabila PIHAK KEDUA mengundurkan diri pada saat/setelah pelaksanaan pekerjaan lapangan dengan tidak menyelesaikan pekerjaan yang menjadi tanggung jawabnya, maka wajib membayar ganti rugi kepada PIHAK PERTAMA sebesar {{ $gantiRugi }}.</p>
    <p class="indent">Dikecualikan tidak membayar ganti rugi sebagaimana dimaksud pada ayat (1) kepada PIHAK PERTAMA, apabila PIHAK KEDUA meninggal dunia, mengundurkan diri karena sakit dengan keterangan rawat inap, kecelakaan dengan keterangan kepolisian, dan/atau telah diberikan Surat Pemutusan Perjanjian Kerja dari PIHAK PERTAMA.</p>
    <p class="indent">Dalam hal terjadi peristiwa sebagaimana dimaksud pada ayat (2), PIHAK PERTAMA membayarkan honorarium kepada PIHAK KEDUA secara proporsional sesuai pekerjaan yang telah dilaksanakan.</p>

    <div class="pasal-title">Pasal 10</div>
    <p class="indent">Apabila terjadi Keadaan Kahar, yang meliputi bencana alam, bencana non alam dan bencana sosial, PIHAK KEDUA memberitahukan kepada PIHAK PERTAMA dalam waktu paling lambat 7 (tujuh) hari sejak mengetahui atas kejadian Keadaan Kahar dengan menyertakan bukti.</p>
    <p class="indent">Pada saat terjadi Keadaan Kahar, pelaksanaan pekerjaan oleh PIHAK KEDUA dihentikan sementara dan dilanjutkan kembali setelah Keadaan Kahar berakhir, namun apabila akibat Keadaan Kahar tidak memungkinkan dilanjutkan/diselesaikannya pelaksanaan pekerjaan, PIHAK KEDUA berhak menerima honorarium secara proporsional sesuai pekerjaan yang telah dilaksanakan.</p>

    <div class="pasal-title">Pasal 11</div>
    <p>Segala sesuatu yang belum atau tidak cukup diatur dalam Perjanjian ini diatur lebih lanjut oleh PARA PIHAK dalam perjanjian tambahan/addendum dan merupakan bagian tidak terpisahkan dari perjanjian ini.</p>

    <div class="pasal-title">Pasal 12</div>
    <p class="indent">Segala perselisihan atau perbedaan pendapat yang timbul sebagai akibat adanya Perjanjian ini akan diselesaikan secara musyawarah untuk mufakat oleh PARA PIHAK.</p>
    <p class="indent">Apabila perselisihan tidak dapat diselesaikan sebagaimana dimaksud pada ayat (1), PARA PIHAK sepakat menyelesaikan perselisihan dengan memilih kedudukan/domisili hukum di Panitera Pengadilan Negeri Jember.</p>
    <p class="indent">Selama perselisihan dalam proses penyelesaian pengadilan, PIHAK PERTAMA dan PIHAK KEDUA wajib tetap melaksanakan kewajiban masing-masing berdasarkan perjanjian ini.</p>

    <p style="margin-top: 20px;">Demikian Perjanjian ini dibuat dan ditandatangani oleh PARA PIHAK dalam 2 (dua) rangkap asli bermeterai cukup, tanpa paksaan dari PIHAK manapun dan untuk dilaksanakan oleh PARA PIHAK.</p>

    <table class="signatures">
        <tr>
            <td>
                PIHAK KEDUA,
                <div class="sign-space"></div>
                <strong><u>{{ strtoupper($mitra->nama_lengkap) }}</u></strong><br>
                <span>SOBAT ID: {{ $mitra->sobat_id ?? '-' }}</span>
            </td>
            <td>
                PIHAK PERTAMA,
                <div class="sign-space"></div>
                <strong><u>{{ strtoupper($spk->nama_ppk_snapshot) }}</u></strong><br>
                <span>NIP. {{ $spk->nip_ppk_snapshot }}</span>
            </td>
        </tr>
    </table>

    <!-- ================= HALAMAN 4: LAMPIRAN ================= -->
    <div style="page-break-before: always;"></div>

    <div class="header-subtitle">LAMPIRAN</div>
    <div class="header-org" style="font-size: 10pt;">PERJANJIAN KERJA PETUGAS PENDATAAN LAPANGAN</div>
    <div class="header-org" style="font-size: 10pt;">KEGIATAN SENSUS/SURVEI BULAN {{ strtoupper(\App\Services\SpkDocxService::bulanStatic($spk->bulan)) }} TAHUN {{ $spk->tahun }}</div>
    <div class="header-org" style="font-size: 10pt;">BADAN PUSAT STATISTIK KABUPATEN JEMBER</div>
    <div class="header-nomor" style="margin-bottom: 15px;">NOMOR: {{ $spk->nomor_spk ?? '[DRAFT]' }}</div>

    <div style="text-align: center; font-weight: bold; font-size: 10pt; margin-bottom: 15px; text-transform: uppercase;">
        DAFTAR URAIAN TUGAS, JANGKA WAKTU, NILAI PERJANJIAN, DAN BEBAN ANGGARAN
    </div>

    <table class="lampiran-table">
        <thead>
            <tr>
                <th style="width: 5%;">No</th>
                <th style="width: 32%;">Uraian Tugas</th>
                <th style="width: 15%;">Jangka Waktu</th>
                <th style="width: 8%;">Volume</th>
                <th style="width: 8%;">Satuan</th>
                <th style="width: 12%;">Harga Satuan</th>
                <th style="width: 12%;">Nilai Perjanjian</th>
                <th style="width: 8%;">Beban Anggaran</th>
            </tr>
            <tr>
                <th>(1)</th>
                <th>(2)</th>
                <th>(3)</th>
                <th colspan="2">(4)</th>
                <th>(5)</th>
                <th>(6)</th>
                <th>(7)</th>
            </tr>
        </thead>
        <tbody>
            @foreach($spk->details as $index => $detail)
            <tr>
                <td style="text-align: center;">{{ $index + 1 }}</td>
                <td>{{ $detail->uraian_tugas }}</td>
                <td style="text-align: center; font-size: 8.5pt;">
                    {{ \Carbon\Carbon::parse($detail->tanggal_mulai_detail)->format('d') }} s.d. {{ \Carbon\Carbon::parse($detail->tanggal_selesai_detail)->format('d F Y') }}
                </td>
                <td style="text-align: center;">{{ $detail->volume }}</td>
                <td style="text-align: center;">{{ $detail->satuan }}</td>
                <td style="text-align: right;">Rp {{ number_format($detail->harga_satuan, 0, ',', '.') }},-</td>
                <td style="text-align: right;">Rp {{ number_format($detail->nilai, 0, ',', '.') }},-</td>
                <td style="text-align: center; font-size: 8pt;">{{ $detail->kode_anggaran ?? '-' }}</td>
            </tr>
            @endforeach
            <tr>
                <td colspan="6" style="text-align: right; font-weight: bold;">TOTAL</td>
                <td style="text-align: right; font-weight: bold;">Rp {{ number_format($spk->total_nilai, 0, ',', '.') }},-</td>
                <td></td>
            </tr>
        </tbody>
    </table>

    <div style="margin-top: 15px; font-weight: bold; font-size: 10pt;">
        Terbilang: {{ ucwords(\App\Services\SpkDocxService::terbilangStatic($spk->total_nilai)) }} Rupiah
    </div>
    <div style="margin-top: 5px; font-weight: bold; font-size: 11pt;">
        Rp {{ number_format($spk->total_nilai, 0, ',', '.') }},-
    </div>

</body>
</html>
