<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $users = User::orderBy('id', 'desc')->get();

        return response()->json([
            'success' => true,
            'message' => 'Berhasil mengambil daftar pengguna',
            'data' => $users,
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'username' => 'required|string|max:255|unique:users,username',
            'nama_lengkap' => 'required|string|max:255',
            'sobat_id' => 'nullable|string|max:50',
            'password' => 'nullable|string|min:6',
            'role' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors(),
            ], 422);
        }

        $validated = $validator->validated();

        $roleLower = strtolower($validated['role'] ?? 'operator');
        $role = match ($roleLower) {
            'admin', 'administrator' => 'Admin',
            'viewer' => 'Viewer',
            'mitra' => 'Mitra',
            default => 'Operator',
        };

        $sobatId = !empty($validated['sobat_id']) ? trim($validated['sobat_id']) : null;
        $plainPassword = !empty($validated['password']) 
            ? $validated['password'] 
            : ($sobatId ?? $validated['username']);

        $user = User::create([
            'name' => $validated['nama_lengkap'],
            'username' => $validated['username'],
            'sobat_id' => $sobatId,
            'password' => Hash::make($plainPassword),
            'role' => $role,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'User berhasil ditambahkan',
            'data' => $user,
        ], 201);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Pengguna tidak ditemukan',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'username' => 'required|string|max:255|unique:users,username,' . $id,
            'nama_lengkap' => 'required|string|max:255',
            'sobat_id' => 'nullable|string|max:50',
            'role' => 'nullable|string',
            'status' => 'nullable|string',
            'password' => 'nullable|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors(),
            ], 422);
        }

        $validated = $validator->validated();

        $updateData = [
            'username' => $validated['username'],
            'name' => $validated['nama_lengkap'],
            'sobat_id' => $validated['sobat_id'] ?? null,
        ];

        if (!empty($validated['role'])) {
            $roleLower = strtolower($validated['role']);
            $updateData['role'] = match ($roleLower) {
                'admin', 'administrator' => 'Admin',
                'viewer' => 'Viewer',
                'mitra' => 'Mitra',
                default => 'Operator',
            };
        }

        if (isset($validated['status'])) {
            $updateData['is_locked'] = strtolower($validated['status']) === 'nonaktif';
        }

        if (!empty($validated['password'])) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        $user->update($updateData);

        return response()->json([
            'success' => true,
            'message' => 'Data user berhasil diperbarui',
            'data' => $user->fresh(),
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Pengguna tidak ditemukan',
            ], 404);
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User berhasil dihapus',
        ], 200);
    }

    /**
     * Native XLSX parser using ZipArchive & SimpleXML
     */
    private function parseXlsx($filePath)
    {
        $rows = [];
        $zip = new \ZipArchive();
        if ($zip->open($filePath) === true) {
            $sharedStrings = [];
            if (($sharedStringsIndex = $zip->locateName('xl/sharedStrings.xml')) !== false) {
                $xmlStr = $zip->getFromIndex($sharedStringsIndex);
                $xml = @simplexml_load_string($xmlStr);
                if ($xml && isset($xml->si)) {
                    foreach ($xml->si as $val) {
                        if (isset($val->t)) {
                            $sharedStrings[] = (string)$val->t;
                        } elseif (isset($val->r)) {
                            $textArr = [];
                            foreach ($val->r as $r) {
                                $textArr[] = (string)($r->t ?? '');
                            }
                            $sharedStrings[] = implode('', $textArr);
                        } else {
                            $sharedStrings[] = '';
                        }
                    }
                }
            }

            $sheetIndex = $zip->locateName('xl/worksheets/sheet1.xml');
            if ($sheetIndex !== false) {
                $xmlStr = $zip->getFromIndex($sheetIndex);
                $xml = @simplexml_load_string($xmlStr);
                if ($xml && isset($xml->sheetData->row)) {
                    foreach ($xml->sheetData->row as $r) {
                        $rowCells = [];
                        foreach ($r->c as $c) {
                            $cellValue = (string)($c->v ?? '');
                            $type = (string)($c['t'] ?? '');
                            if ($type === 's' && isset($sharedStrings[(int)$cellValue])) {
                                $cellValue = $sharedStrings[(int)$cellValue];
                            }
                            $rowCells[] = trim($cellValue);
                        }
                        if (!empty(array_filter($rowCells))) {
                            $rows[] = $rowCells;
                        }
                    }
                }
            }
            $zip->close();
        }
        return $rows;
    }

    /**
     * Import users from Excel / CSV file.
     */
    public function import(Request $request)
    {
        $request->validate([
            'file' => 'nullable|file|max:5120',
            'users' => 'nullable|array',
        ]);

        $importedCount = 0;
        $usersData = [];

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $extension = strtolower($file->getClientOriginalExtension());
            $path = $file->getRealPath();

            if ($extension === 'xlsx' || $extension === 'xls') {
                $rawRows = $this->parseXlsx($path);
                if (!empty($rawRows)) {
                    $header = array_shift($rawRows);
                    $cleanHeader = array_map(function($h) {
                        return strtolower(trim(preg_replace('/[^a-zA-Z0-9_]/', '', str_replace(' ', '_', $h))));
                    }, $header);

                    foreach ($rawRows as $row) {
                        if (count($row) >= count($cleanHeader)) {
                            $usersData[] = array_combine(
                                array_slice($cleanHeader, 0, count($row)),
                                array_slice($row, 0, count($cleanHeader))
                            );
                        }
                    }
                }
            }

            // Fallback for CSV / TXT or if XLSX parsing yielded empty
            if (empty($usersData) && ($handle = fopen($path, 'r')) !== false) {
                $header = fgetcsv($handle, 1000, ',');
                if ($header && count($header) == 1 && str_contains($header[0], ';')) {
                    rewind($handle);
                    $header = fgetcsv($handle, 1000, ';');
                }
                
                $cleanHeader = array_map(function($h) {
                    return strtolower(trim(preg_replace('/[^a-zA-Z0-9_]/', '', str_replace(' ', '_', $h))));
                }, $header ?? []);

                while (($row = fgetcsv($handle, 1000, ',')) !== false) {
                    if (count($row) === 1 && str_contains($row[0], ';')) {
                        $row = explode(';', $row[0]);
                    }
                    if (count($row) >= count($cleanHeader)) {
                        $rowData = array_combine(array_slice($cleanHeader, 0, count($row)), array_slice($row, 0, count($cleanHeader)));
                        $usersData[] = $rowData;
                    }
                }
                fclose($handle);
            }
        } elseif ($request->filled('users')) {
            $usersData = $request->input('users');
        }

        if (empty($usersData)) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak ada data user yang valid untuk diimport. Pastikan format file CSV/Excel memiliki header username, nama_lengkap, sobat_id, role.',
            ], 422);
        }

        $overrideRoleInput = $request->input('override_role') ?? $request->input('role');
        $selectedOverrideRole = null;
        if (!empty($overrideRoleInput) && !in_array(strtolower($overrideRoleInput), ['auto', 'otomatis', ''])) {
            $rLower = strtolower($overrideRoleInput);
            $selectedOverrideRole = match ($rLower) {
                'admin', 'administrator' => 'Admin',
                'viewer' => 'Viewer',
                'mitra' => 'Mitra',
                default => 'Operator',
            };
        }

        foreach ($usersData as $row) {
            $username = trim($row['username'] ?? $row['user_name'] ?? '');
            $namaLengkap = trim($row['nama_lengkap'] ?? $row['nama'] ?? $row['name'] ?? '');
            $sobatId = trim($row['sobat_id'] ?? $row['id_sobat'] ?? '');
            $roleRaw = trim($row['role'] ?? 'Operator');

            if (empty($username) || empty($namaLengkap)) {
                continue;
            }

            if ($selectedOverrideRole) {
                $role = $selectedOverrideRole;
            } else {
                $roleLower = strtolower($roleRaw);
                $role = match ($roleLower) {
                    'admin', 'administrator' => 'Admin',
                    'viewer' => 'Viewer',
                    'mitra' => 'Mitra',
                    default => 'Operator',
                };
            }

            // Password otomatis di-hash menggunakan sobat_id (atau username jika sobat_id kosong)
            $plainPassword = !empty($row['password']) ? trim($row['password']) : (!empty($sobatId) ? $sobatId : $username);
            $hashedPassword = Hash::make($plainPassword);

            User::updateOrCreate(
                ['username' => $username],
                [
                    'name' => $namaLengkap,
                    'sobat_id' => $sobatId,
                    'password' => $hashedPassword,
                    'role' => $role,
                    'is_locked' => false,
                ]
            );

            $importedCount++;
        }

        return response()->json([
            'success' => true,
            'message' => "Berhasil mengimport {$importedCount} data pengguna.",
            'imported_count' => $importedCount,
        ], 200);
    }
}
