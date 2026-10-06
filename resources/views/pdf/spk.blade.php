<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>SPK - {{ $spk->nomor_spk ?? 'DRAFT' }}</title>
    <style>
        @page {
            size: A4 portrait;
            margin: 2.36cm 1.5cm 0.49cm 2.5cm;
        }
        @page landscape-page {
            size: A4 landscape;
            margin: 1.5cm 2.36cm 1.5cm 2.36cm;
        }
        .landscape-page {
            page: landscape-page;
        }
        body {
            font-family: 'Arial', sans-serif;
            font-size: 11pt;
            color: #000;
            line-height: 1.5;
            margin: 0;
            padding: 0;
        }
        .page-break {
            page-break-after: always;
        }
        .header-title {
            text-align: center;
            font-weight: bold;
            font-size: 11pt;
            text-transform: uppercase;
            margin-bottom: 0px;
        }
        .header-subtitle {
            text-align: center;
            font-weight: bold;
            font-size: 11pt;
            text-transform: uppercase;
            margin-bottom: 0px;
        }
        .header-org {
            text-align: center;
            font-weight: bold;
            font-size: 11pt;
            text-transform: uppercase;
            margin-bottom: 0px;
        }
        .header-nomor {
            text-align: center;
            font-weight: bold;
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
        table.pasal-list {
            width: 100%;
            border-collapse: collapse;
        }
        table.pasal-list td {
            vertical-align: top;
            text-align: justify;
            padding-bottom: 5px;
        }
        table.pasal-list td.number {
            width: 5%;
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
    <div class="header-title">PERJANJIAN KERJA<br>PETUGAS LAPANGAN</div>
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
                <td style="width: 3%; vertical-align: top; border: none;">1.</td>
                <td style="width: 27%; vertical-align: top; border: none;">{{ $spk->nama_ppk_snapshot }}</td>
                <td style="width: 2%; vertical-align: top; border: none;">:</td>
                <td style="width: 68%; vertical-align: top; border: none; text-align: justify;">Pejabat Pembuat Komitmen Badan Pusat Statistik Kabupaten Jember, berkedudukan di Jl. Cendrawasih No. 20 Kel. Slawu, bertindak untuk dan atas nama BPS Kabupaten Jember, selanjutnya disebut sebagai <strong>PIHAK PERTAMA</strong>.</td>
            </tr>
            <tr>
                <td style="vertical-align: top; border: none; padding-top: 10px;">2.</td>
                <td style="vertical-align: top; border: none; padding-top: 10px;">{{ $mitra->nama_lengkap }}</td>
                <td style="vertical-align: top; border: none; padding-top: 10px;">:</td>
                <td style="vertical-align: top; border: none; text-align: justify; padding-top: 10px;">{{ $pekerjaan }}, berkedudukan di {{ $alamat }}, bertindak untuk dan atas nama diri sendiri, selanjutnya disebut <strong>PIHAK KEDUA</strong>.</td>
            </tr>
        </table>
    </div>

    <p>bahwa <strong>PIHAK PERTAMA</strong> dan <strong>PIHAK KEDUA</strong> yang secara bersama-sama disebut <strong>PARA PIHAK</strong>, sepakat untuk mengikatkan diri dalam Perjanjian Kerja Petugas Lapangan Kegiatan Sensus/Survei bulan {{ \App\Services\SpkDocxService::bulanStatic($spk->bulan) }} Tahun {{ $spk->tahun }} Badan Pusat Statistik Kabupaten Jember sesuai dengan rincian kegiatan sensus/survei pada lampiran perjanjian, yang selanjutnya disebut Perjanjian, dengan ketentuan-ketentuan sebagai berikut:</p>

    <div class="pasal-title">Pasal 1</div>
    <p><strong>PIHAK PERTAMA</strong> memberikan pekerjaan kepada <strong>PIHAK KEDUA</strong> dan <strong>PIHAK KEDUA</strong> menerima pekerjaan dari <strong>PIHAK PERTAMA</strong> sebagai Petugas Lapangan Kegiatan Sensus/Survei bulan {{ \App\Services\SpkDocxService::bulanStatic($spk->bulan) }} Tahun {{ $spk->tahun }} pada Badan Pusat Statistik Kabupaten Jember, dengan lingkup pekerjaan yang ditetapkan oleh <strong>PIHAK PERTAMA</strong>.</p>

    <div class="pasal-title">Pasal 2</div>
    <p>Ruang lingkup pekerjaan dalam Perjanjian ini mengacu pada wilayah kerja dan beban kerja sebagaimana tertuang dalam lampiran perjanjian Petugas Lapangan dari masing-masing kegiatan sesuai dengan pasal 1 yang merupakan bagian tidak terpisahkan dari Perjanjian ini, Pedoman Pendataan Survei BPS dan ketentuan lainnya yang ditetapkan oleh <strong>PIHAK PERTAMA</strong>.</p>

    <div class="pasal-title">Pasal 3</div>
    <p>Jangka Waktu Perjanjian terhitung sejak tanggal {{ \Carbon\Carbon::parse($spk->tanggal_mulai)->format('d F Y') }} sampai dengan tanggal {{ \Carbon\Carbon::parse($spk->tanggal_selesai)->format('d F Y') }}.</p>

    <div class="page-break"></div>
    <div class="pasal-title">Pasal 4</div>
    <p><strong>PIHAK KEDUA</strong> berkewajiban melaksanakan seluruh pekerjaan yang diberikan oleh <strong>PIHAK PERTAMA</strong> sampai selesai, sesuai ruang lingkup pekerjaan sebagaimana dimaksud dalam Pasal 2, dengan menerapkan protokol kesehatan yang berlaku di wilayah kerja masing-masing.</p>

    <div class="pasal-title">Pasal 5</div>
    <table class="pasal-list">
        <tr>
            <td class="number">(1)</td>
            <td><strong>PIHAK KEDUA</strong> untuk waktu yang tidak terbatas dan/atau tidak terikat masa berlakunya Perjanjian ini, menjamin kerahasiaan setiap data/informasi yang diterima atau diperolehnya dari <strong>PIHAK PERTAMA</strong>, serta menjamin bahwa keterangan informasi dipergunakan untuk melaksanakan tujuan menurut Perjanjian ini.</td>
        </tr>
        <tr>
            <td class="number">(2)</td>
            <td><strong>PIHAK KEDUA</strong> apabila melakukan peminjaman dokumen/data/aset milik <strong>PIHAK PERTAMA</strong>, wajib menjaga dan menggunakan sesuai dengan tujuan perjanjian dan mengembalikan dalam keadaan utuh sama dengan saat peminjaman, serta dilarang menggandakan, menyalin, menunjukkan, dan/atau mendokumentasikan dalam bentuk foto atau bentuk apapun untuk kepentingan pribadi atapun kepentingan lain yang tidak berkaitan dengan tujuan perjanjian ini.</td>
        </tr>
        <tr>
            <td class="number">(3)</td>
            <td><strong>PIHAK KEDUA</strong> dilarang memberikan dokumen/data/aset milik <strong>PIHAK PERTAMA</strong> yang berada dalam penguasaan <strong>PIHAK KEDUA</strong>, baik secara langsung maupun tidak langsung, termasuk memberikan akses kepada pihak lain untuk menggunakan, menyalin, memfotokopi, menunjukkan, dan/atau mendokumentasikan dalam bentuk foto atau bentuk apapun, sehingga informasi diketahui oleh pihak lain untuk tujuan apapun.</td>
        </tr>
    </table>

    <div class="pasal-title">Pasal 6</div>
    @php
        $honor = 'Rp. ' . number_format($spk->total_nilai, 0, ',', '.') . ',-';
        $honorTerbilang = strtolower(\App\Services\SpkDocxService::terbilangStatic($spk->total_nilai)) . ' rupiah';
        $gantiRugiAngka = ceil($spk->total_nilai / 2);
        $gantiRugi = 'Rp. ' . number_format($gantiRugiAngka, 0, ',', '.') . ',-';
        $gantiRugiTerbilang = strtolower(\App\Services\SpkDocxService::terbilangStatic($gantiRugiAngka)) . ' rupiah';
    @endphp
    <table class="pasal-list">
        <tr>
            <td class="number">(1)</td>
            <td><strong>PIHAK KEDUA</strong> berhak untuk mendapatkan honorarium dari <strong>PIHAK PERTAMA</strong> sebesar {{ $honor }} ({{ $honorTerbilang }}) untuk pekerjaan sebagaimana dimaksud dalam Pasal 1, termasuk biaya pajak, bea materai, pulsa dan kuota internet untuk komunikasi, dan jasa pelayanan keuangan (rincian honorarium terlampir)</td>
        </tr>
        <tr>
            <td class="number">(2)</td>
            <td><strong>PIHAK KEDUA</strong> tidak diberikan honorarium tambahan apabila melakukan kunjungan di luar jadwal atau terdapat tambahan waktu pelaksanaan pekerjaan lapangan.</td>
        </tr>
        <tr>
            <td class="number">(3)</td>
            <td>Pembayaran honorarium sebagaimana dimaksud dalam ayat (1) dilakukan setelah <strong>PIHAK KEDUA</strong> menyelesaikan dan menyerahkan seluruh hasil pekerjaan sebagaimana dimaksud dalam Pasal 1 kepada <strong>PIHAK PERTAMA</strong>.</td>
        </tr>
        <tr>
            <td class="number">(4)</td>
            <td>Pembayaran sebagaimana dimaksud pada ayat (1) dilakukan oleh <strong>PIHAK PERTAMA</strong> kepada <strong>PIHAK KEDUA</strong> sesuai dengan ketentuan peraturan perundang-undangan.</td>
        </tr>
    </table>

    <div class="pasal-title">Pasal 7</div>
    <table class="pasal-list">
        <tr>
            <td class="number">(1)</td>
            <td><strong>PIHAK PERTAMA</strong> secara berjenjang melakukan pemeriksaan dan evaluasi atas penyelesaian dan kualitas hasil pekerjaan yang dilaksanakan oleh <strong>PIHAK KEDUA</strong>.</td>
        </tr>
        <tr>
            <td class="number">(2)</td>
            <td>Penyerahan hasil pekerjaan lapangan sebagaimana dimaksud dalam Pasal 1 dilakukan secara bertahap dan selambat-lambatnya seluruh hasil pekerjaan lapangan diserahkan sesuai jadwal yang tercantum dalam Lampiran, yang dinyatakan dalam Berita Acara Serah Terima Hasil Pekerjaan yang ditandatangani oleh <strong>PARA PIHAK</strong>.</td>
        </tr>
    </table>

    <div class="page-break"></div>
    <div class="pasal-title">Pasal 8</div>
    <p><strong>PIHAK PERTAMA</strong> dapat memutuskan Perjanjian ini secara sepihak sewaktu-waktu dalam hal <strong>PIHAK KEDUA</strong> tidak dapat melaksanakan kewajibannya sebagaimana dimaksud dalam Pasal 4, dengan menerbitkan Surat Pemutusan Perjanjian Kerja.</p>

    <div class="pasal-title">Pasal 9</div>
    <table class="pasal-list">
        <tr>
            <td class="number">(1)</td>
            <td>Apabila <strong>PIHAK KEDUA</strong> mengundurkan diri pada saat/setelah pelaksanaan pekerjaan lapangan dengan tidak menyelesaikan pekerjaan yang menjadi tanggung jawabnya, maka wajib membayar ganti rugi kepada <strong>PIHAK PERTAMA</strong> sebesar {{ $gantiRugi }} ({{ $gantiRugiTerbilang }}).</td>
        </tr>
        <tr>
            <td class="number">(2)</td>
            <td>Dikecualikan tidak membayar ganti rugi sebagaimana dimaksud pada ayat (1) kepada <strong>PIHAK PERTAMA</strong>, apabila <strong>PIHAK KEDUA</strong> meninggal dunia, mengundurkan diri karena sakit dengan keterangan rawat inap, kecelakaan dengan keterangan kepolisian, dan/atau telah diberikan Surat Pemutusan Perjanjian Kerja dari <strong>PIHAK PERTAMA</strong>.</td>
        </tr>
        <tr>
            <td class="number">(3)</td>
            <td>Dalam hal terjadi peristiwa sebagaimana dimaksud pada ayat (2), <strong>PIHAK PERTAMA</strong> membayarkan honorarium kepada <strong>PIHAK KEDUA</strong> secara proporsional sesuai pekerjaan yang telah dilaksanakan.</td>
        </tr>
    </table>

    <div class="pasal-title">Pasal 10</div>
    <table class="pasal-list">
        <tr>
            <td class="number">(1)</td>
            <td>Apabila terjadi Keadaan Kahar, yang meliputi bencana alam, bencana non alam dan bencana sosial, <strong>PIHAK KEDUA</strong> memberitahukan kepada <strong>PIHAK PERTAMA</strong> dalam waktu paling lambat 7 (tujuh) hari sejak mengetahui atas kejadian Keadaan Kahar dengan menyertakan bukti.</td>
        </tr>
        <tr>
            <td class="number">(2)</td>
            <td>Pada saat terjadi Keadaan Kahar, pelaksanaan pekerjaan oleh <strong>PIHAK KEDUA</strong> dihentikan sementara dan dilanjutkan kembali setelah Keadaan Kahar berakhir, namun apabila akibat Keadaan Kahar tidak memungkinkan dilanjutkan/diselesaikannya pelaksanaan pekerjaan, <strong>PIHAK KEDUA</strong> berhak menerima honorarium secara proporsional sesuai pekerjaan yang telah dilaksanakan.</td>
        </tr>
    </table>

    <div class="pasal-title">Pasal 11</div>
    <p>Segala sesuatu yang belum atau tidak cukup diatur dalam Perjanjian ini diatur lebih lanjut oleh <strong>PARA PIHAK</strong> dalam perjanjian tambahan/<em>addendum</em> dan merupakan bagian tidak terpisahkan dari perjanjian ini.</p>

    <div class="pasal-title">Pasal 12</div>
    <table class="pasal-list">
        <tr>
            <td class="number">(1)</td>
            <td>Segala perselisihan atau perbedaan pendapat yang timbul sebagai akibat adanya Perjanjian ini akan diselesaikan secara musyawarah untuk mufakat oleh <strong>PARA PIHAK</strong>.</td>
        </tr>
        <tr>
            <td class="number">(2)</td>
            <td>Apabila perselisihan tidak dapat diselesaikan sebagaimana dimaksud pada ayat (1), <strong>PARA PIHAK</strong> sepakat menyelesaikan perselisihan dengan memilih kedudukan/domisili hukum di Panitera Pengadilan Negeri Jember.</td>
        </tr>
        <tr>
            <td class="number">(3)</td>
            <td>Selama perselisihan dalam proses penyelesaian pengadilan, <strong>PIHAK PERTAMA</strong> dan <strong>PIHAK KEDUA</strong> wajib tetap melaksanakan kewajiban masing-masing berdasarkan perjanjian ini.</td>
        </tr>
    </table>

    <p style="margin-top: 20px;">Demikian Perjanjian ini dibuat dan ditandatangani oleh <strong>PARA PIHAK</strong> dalam 2 (dua) rangkap asli bermeterai cukup, tanpa paksaan dari <strong>PIHAK</strong> manapun dan untuk dilaksanakan oleh <strong>PARA PIHAK</strong>.</p>

    <table class="signatures">
        <tr>
            <td>
                <strong>PIHAK KEDUA,</strong>
                <div class="sign-space"></div>
                {{ strtoupper($mitra->nama_lengkap) }}
            </td>
            <td>
                <strong>PIHAK PERTAMA,</strong>
                <div class="sign-space"></div>
                {{ strtoupper($spk->nama_ppk_snapshot) }}
            </td>
        </tr>
    </table>

    <!-- ================= HALAMAN 4: LAMPIRAN ================= -->
    <div class="landscape-page" style="page-break-before: always;">
        <div style="float: right; text-align: left; margin-bottom: 25px; font-size: 10pt; width: 50%;">
            Lampiran<br>
            PERJANJIAN KERJA PETUGAS PENDATAAN LAPANGAN<br>
            KEGIATAN SENSUS/SURVEI BULAN {{ strtoupper(\App\Services\SpkDocxService::bulanStatic($spk->bulan)) }} TAHUN {{ $spk->tahun }}<br>
            BADAN PUSAT STATISTIK KABUPATEN JEMBER<br>
            NOMOR: {{ $spk->nomor_spk ?? '[DRAFT]' }}
        </div>
        <div style="clear: both;"></div>

        <div style="text-align: center; font-weight: bold; font-size: 10pt; margin-bottom: 15px; text-transform: uppercase;">
            DAFTAR URAIAN TUGAS, JANGKA WAKTU, NILAI PERJANJIAN, DAN BEBAN ANGGARAN
        </div>

        <table class="lampiran-table">
            <thead>
                <tr>
                    <th rowspan="2" style="width: 4%;">No</th>
                    <th rowspan="2" style="width: 20%;">Uraian Tugas</th>
                    <th rowspan="2" style="width: 15%;">Jangka Waktu</th>
                    <th colspan="2" style="width: 14%;">Target Pekerjaan</th>
                    <th rowspan="2" style="width: 12%;">Harga Satuan</th>
                    <th rowspan="2" style="width: 12%;">Nilai Perjanjian</th>
                    <th rowspan="2" style="width: 23%;">Beban Anggaran</th>
                </tr>
                <tr>
                    <th style="width: 7%;">Volume</th>
                    <th style="width: 7%;">Satuan</th>
                </tr>
                <tr>
                    <th>(1)</th>
                    <th>(2)</th>
                    <th>(3)</th>
                    <th>(3)</th>
                    <th>(4)</th>
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
                    <td style="text-align: right;">Rp. {{ number_format($detail->harga_satuan, 0, ',', '.') }},-</td>
                    <td style="text-align: right;">Rp. {{ number_format($detail->nilai, 0, ',', '.') }},-</td>
                    <td style="text-align: center; font-size: 8pt;">{{ $detail->kode_anggaran ?? '-' }}</td>
                </tr>
                @endforeach
                <tr>
                    <td colspan="6" style="text-align: center; font-style: italic;">Terbilang: {{ ucwords(\App\Services\SpkDocxService::terbilangStatic($spk->total_nilai)) }} Rupiah</td>
                    <td style="text-align: right;">Rp. {{ number_format($spk->total_nilai, 0, ',', '.') }},-</td>
                    <td></td>
                </tr>
            </tbody>
        </table>
    </div>

</body>
</html>
