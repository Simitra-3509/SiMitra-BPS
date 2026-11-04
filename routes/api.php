<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Rute manajemen user yang sebelumnya ada di sini (Api\UserController)
| telah dihapus karena tidak pernah dilindungi middleware autentikasi
| maupun role, sehingga siapa pun tanpa login bisa membuat/menghapus/
| mengubah akun lewat endpoint ini (termasuk membuat akun role admin).
| Endpoint ini juga tidak dipakai oleh frontend manapun — manajemen user
| sudah ditangani oleh App\Http\Controllers\UserController (lihat
| routes/web.php) yang sudah dibatasi middleware 'role:admin,administrator'.
|
| Jika suatu saat API ini benar-benar dibutuhkan (mis. untuk aplikasi
| mobile/klien eksternal), tambahkan kembali dengan middleware
| ['auth:sanctum', 'role:admin,administrator'] pada group-nya.
|
*/
